import { React, useState, useEffect, useCallback } from "react";
import { Close, ExpandMore, Add } from "@material-ui/icons";
import {
  TextField,
  MenuItem,
  Select,
  InputLabel,
  Box,
  Chip,
  FormControl,
  CircularProgress
} from "@material-ui/core";
import { Button, Form, Modal } from "react-bootstrap";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  addProduct,
  addProductImage,
  deleteProduct,
  editProduct,
  removeFromS3,
  getGeneralAttributes,
} from "../../app/crud/auth.crud";
import { useSelector, shallowEqual } from "react-redux";
import clsx from "clsx";
import { useDropzone } from "react-dropzone";
import { showToast } from "../../utils/utils";
import { useHistory } from "react-router-dom";
import imageCompression from "browser-image-compression";

export const AddProduct = (props) => {
  const { currentProduct, isEdit } = props;
  const [srcImg, setSrcImg] = useState(null);
  const [image, setImage] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [crop, setCrop] = useState({
    unit: "px",
    width: 260,
    height: 360,
    x: 25,
    y: 25,
  });
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [show, setShow] = useState(false);
  const [filterTypes, setFilterTypes] = useState([]);
  const [filterColor, setFilterColor] = useState([]);
  const [filterSize, setFilterSize] = useState([]);
  const [filterBrand, setFilterBrand] = useState([]);
  const [showSubUpload, setShowSubUpload] = useState(false);
  const history = useHistory();
  const [editProducts, setEditProduct] = useState({});
  const [deletedImages, setDeltedImages] = useState([]);
  const [showDeleteModal, setDelteShowModal] = useState(false);
  const [convertedFile, setCovertedFile] = useState("");
  const [result, setResult] = useState([]);
  const [isFirst, setIsFirst] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [isRendered, setIsRendered] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { authToken, userid } = useSelector(
    ({ auth }) => ({
      authToken: auth.user.token,
      userid: auth.user.id,
    }),
    shallowEqual
  );

  useEffect(() => {
    if (!isRendered && props.activeFile.length > 0) {
      props.activeFile.map((val, ind) => {
        if (parseInt(val.index) === parseInt(props.fileIndex)) {
          setIsRendered(true);
          setSelectedFiles([props?.activeFile[ind].image_url]);
          setSrcImg(props?.activeFile[ind].image_url);
          setImageUrl(props?.activeFile[ind].image_url);
        }
      })
    }
  }, [props.activeFile]);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setShowSubUpload(true);
      setLoading(true);
      let photosArray = [];

      await acceptedFiles.map(async (file) => {
        // if (file.size > 5000000) {
          const options = {
            maxSizeMB: 5,
            minSizeMB: 1,
            maxWidthOrHeight: 1350,
            minWidthOrHeight: 1080,
            useWebWorker: true
          };
          const compressedFile = await imageCompression(file, options);
          file = compressedFile;
        // }
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          setSrcImg(reader.result);
          photosArray.push(reader.result);
          var data = {
            files: JSON.stringify(photosArray),
            userId: userid
          }
          addProductImage(authToken, data).then(result => {
            if (result && result.data.code === 200) {
              var url = result.data.payload.url;
              var d1 = [...selectedFiles];
              d1.push(url);
              setSelectedFiles(d1);
              setImageUrl(url);
            }
            setLoading(false);
          }).catch(err => {
            // showToast("error", err);
            setLoading(false);
          });
        };
      });
    }
  }, []);

  const onRemoveImage = async (source, ind, item) => {
    setLoading(false);
    var d = [...source];

    d = d.filter((it, index) => index != ind);
    if (item === srcImg) {
      setSrcImg(null);
      if (d.length > 0) {
        setSrcImg(d[d.length - 1]);
      }
    }

    if (d.length === 0) {
      setIsFirst(true);
    }
    setSelectedFiles(d);
    setIsRendered(false);
    if (!props.isUpdate) {
      await removeFromS3(authToken, { image_url: imageUrl }).then(() => {
        props.removeImage(imageUrl);
      }).catch(err => {
        console.log("ERROR : ", err)
      });
    } else {
      if (props.newAddedImages.some((val) => val.image_url === imageUrl)) {
        await removeFromS3(authToken, { image_url: imageUrl }).then(() => {
          props.removeImage(imageUrl);
        }).catch(err => {
          console.log("ERROR : ", err)
        });
      } else {
        props.removeImage(imageUrl);
      }
    }
  };

  const onImgLoad = async ({ target: img }) => {
    setHeight(img.naturalHeight);
    setWidth(img.naturalWidth);
    props.setErrorMsg("");
    if (img.naturalWidth > 1080 && img.naturalHeight > 1350) {
      var d = [...selectedFiles];
      if (isFirst) {
        d.pop();
        setIsFirst(false);
      }
      setSelectedFiles(d);
      setShow(true);
      await removeFromS3(authToken, { image_url: imageUrl }).then(() => {
        props.removeImage(imageUrl);
      }).catch(err => {
        console.log("ERROR : ", err)
      })
    } else {
      if (isFirst) {
        setIsFirst(false);
      }
      if (!isRendered) {
        props.setImageFile({ image_url: imageUrl, index: props.fileIndex });
      }
    }
  };

  const getCroppedImg = () => {
    setShow(false);
    try {
      const canvas = document.createElement("canvas");
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext("2d");

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      const base64Image = canvas.toDataURL("image/jpeg", 1);
      const base64Incoding = atob(base64Image.split(",")[1]);

      setSrcImg(base64Image);

      var d = [];
      d.push(base64Image);
      var data = {
        files: JSON.stringify(d)
      }
      setLoading(true);
      addProductImage(authToken, data).then(result => {
        if (result.data.code === 200) {
          var url = result.data.payload.url;
          var d1 = [...selectedFiles];
          d1.push(url);

          setSelectedFiles(d1);
          setImageUrl(url);
          setLoading(false);
        }
      }).catch(err => {
        // showToast("error", err);
        setLoading(false);
      });

    } catch (e) { }
  };

  const renderModalBody = () => {
    if (showDeleteModal) {
      return (
        <>
          <Modal.Header closeButton className="border-top-0 mt-0">
            <Modal.Title style={{ fontWeight: 700 }}>
              Delete Product
            </Modal.Title>
          </Modal.Header>
          <Form noValidate>
            <Modal.Body className="py-5">
              <Form.Group md="12" className={"text-center"}>
                <Form.Label style={{ fontWeight: 400 }}>
                  Are you sure you want to delete this product with{" "}
                  <b>{currentProduct && currentProduct.title}</b> ?
                </Form.Label>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button
                className="btn text-black font-20 add-product-btn shadow-none px-3 py-2"
                onClick={() => {
                  setShow(false);
                }}
              >
                Cancel
              </Button>
              <Button
                className="btn bg-cream text-black font-20 add-product-btn shadow-none px-3 py-2"
                onClick={(e) => handleDelete(e)}
              >
                Delete
              </Button>
            </Modal.Footer>
          </Form>
        </>
      );
    } else {
      return (
        <>
          <Modal.Header className="border-0 mt-0">
            <div className="col-12 mt-0 text-end">
              <button
                type="button"
                className="btn shadow-none"
                onClick={() => {
                  setShow(false);
                  setSrcImg(null);
                }}
              >
                <Close />
              </button>
            </div>
          </Modal.Header>
          <Modal.Body className="pt-0">
            <ReactCrop
              locked={true}
              ruleOfThirds={true}
              aspect={16 / 9}
              src={srcImg}
              onImageLoaded={setImage}
              crop={crop}
              onChange={setCrop}
            />

            <div className="row align-items-center mt-3">
              <div className="col-12 text-end">
                <button
                  type="button"
                  className="btn text-black font-20 add-product-btn shadow-none px-3 py-2 me-3"
                  onClick={() => setShow(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn text-black font-20 add-product-btn shadow-none px-3 py-2"
                  onClick={() => getCroppedImg()}
                >
                  Crop
                </button>
              </div>
            </div>
          </Modal.Body>
        </>
      );
    }
  };

  const handleDelete = async (e) => {
    setDelteShowModal(true);
    if (showDeleteModal) {
      e.preventDefault();
      let productId = currentProduct.id;
      await deleteProduct(authToken, productId)
        .then((result) => {
          var data = result.data;
          // showToast("success", result.data.message);
          history.push("/profile");
        })
        .catch((errors) => {
          // showToast("error", errors);
        });
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop, accept: {
      'image/jpeg': [],
      'image/png': []
    },
    maxFiles: 1,
    multiple: false
  });

  return (
    <>
      <div className="row">
        <div className="col-12 mt-3">
          <div className="text-center position-relative">
            {srcImg && selectedFiles.length !== 0 ? (
              <>
                <img
                  onLoad={onImgLoad}
                  src={srcImg}
                  hidden={show ? true : false}
                  alt="images"
                  id="source"
                  className="img-fluid h-320 mx-auto"
                />
                <Close className="product-close-icon text-white" onClick={() => onRemoveImage(selectedFiles, 0, srcImg)} />
              </>
            ) : (
              <div
                {...getRootProps({
                  className:
                    "dropzone border-black-dashed py-5 px-4 h-320 max-w-300 mx-auto d-flex flex-column align-items-center justify-content-center cursor-pointer"
                })}
              >
                <div>
                  {!loading ? <Add className="text-slate-gray font-95" /> : <CircularProgress className="text-slate-gray font-95" />}
                </div>
                <div>
                  <input {...getInputProps()} />
                  <p className="text-black-3 font-InterLight font-18">Add photos or drag <br /> and drop</p>
                </div>
              </div>
            )}
          </div>

          {/* <div className="max-w-300 mx-auto">{renderPhotos()}</div> */}
        </div>
      </div>
      <Modal
        size="md"
        className="w-500 h-300"
        show={show}
        onHide={() => {
          setShow(false);
        }}
        centered
        style={{ opacity: 1 }}
      >
        {show && renderModalBody()}
      </Modal>
    </>
  );
};
