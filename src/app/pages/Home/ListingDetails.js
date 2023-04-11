import React, { useState, useEffect, useRef } from "react";
import { withRouter, useHistory, useLocation } from "react-router-dom";
import { ExpandMore } from "@material-ui/icons";
import { Link } from "react-router-dom";
import TitleComponent from "../../../components/Common/TitleComponent";
import { AddProduct } from "../../../components/Common/AddProduct";
import { Accordion, AccordionSummary, AccordionDetails, Typography, FormControlLabel, FormGroup, Radio } from "@material-ui/core";
import { Modal, Button, Form } from "react-bootstrap";
import clsx from "clsx";
import { getGeneralAttributes, sendSizeRequest, updateProductStatus, getProductDetails, deleteProduct } from "../../crud/auth.crud";
import { useSelector, shallowEqual } from "react-redux";
import { Formik } from "formik";
import * as Yup from "yup";
import { showToast } from "../../../utils/utils";
import CmtInputBox from "../../../components/Common/CmtInputBox";

function ListingDetails(props) {
  const locationHistory = useLocation();
  const history = useHistory();

  const { authToken, user } = useSelector(
    ({ auth }) => ({
      authToken: auth.user.token,
      user: auth.user,
    }),
    shallowEqual
  );

  const [showModal, setShowModal] = useState(false);
  const [filterTypes, setFilterTypes] = useState([]);
  const [filterSize, setFilterSize] = useState([]);
  const [filterBottoms, setFilterBottoms] = useState([]);
  const [filterColor, setFilterColor] = useState([]);
  const [filterBrand, setFilterBrand] = useState([]);
  const [filterOccasion, setFilterOccasion] = useState([]);
  const [isWeekPriceEdit, setIsWeekPriceEdit] = useState(false);
  const [productData, setProductData] = useState(null);
  const [stateValues, setStateValues] = useState({
    user_id: user?.id,
    title: productData ? productData.title : "",
    description: productData ? productData.description : "",
    category: productData ? productData.category : { mainCategory: "", type: "" },
    size: productData ? productData.size : "",
    brand: productData ? productData.brand : "",
    color: productData ? productData?.color : [],
    occasion: productData ? productData.occasion : [],
    retail_price: productData ? productData.retail_price : "",
    shipping_type: 2,
    location_id: user?.ShippingAddress[0].zip_code,
    week: 6,
  });
  const [isUpdate, setIsUpdate] = useState(false);

  const [expanded, setExpanded] = useState(false);

  const handleAccordion = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const [weeklyPrice, setWeeklyPrice] = useState({
    "2weeks": "",
    "3weeks": "",
    "4weeks": "",
    "5weeks": "",
    "6weeks": ""
  });
  const [weeklyPriceErr, setWeeklyPriceErr] = useState({
    "2weeks": "",
    "3weeks": "",
    "4weeks": "",
    "5weeks": "",
    "6weeks": ""
  });
  const [priceErr, setPriceErr] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [newAddedImages, setNewAddedImages] = useState([]);
  const [modalType, setModalType] = useState("");
  const [isEdit, setIsEdit] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const formRefA = useRef();
  const priceTableRef = useRef();

  const fetchProductDetails = async (productid) => {
    await getProductDetails(productid)
      .then((result) => {
        if (result.status === 200) {
          if (result.data.payload.data && result.data.payload.data != "") {
            var item = result.data.payload.data;
            let obj = {};
            item?.ProductAttributes?.map(
              (items) => {
                if (!obj[items.meta_type]) {
                  obj[items.meta_type] = [];
                }
                obj[items.meta_type].push(items.meta_value)
              }
            );

            item.category = { mainCategory: item.category, type: obj.Type[0] };
            item.size = obj.Size[0];
            item.brand = obj.Brand[0];
            item.color = obj.Color;
            item.occasion = [item.occasion];
            item.product_id = item.id;
            item.isUpdate = isUpdate;

            let imagesArr = item.ProductImages;
            let isDifferent = false;
            imagesArr.map(val => {
              if (val.index !== 0) {
                isDifferent = true;
              }
            });
            if (imagesArr.length > 1 && !isDifferent) {
              let newImagesIndexes = [];
              imagesArr.map((curVal, i) => {
                let tempObj = {
                  image_url: curVal.image_url,
                  index: i
                };
                newImagesIndexes.push(tempObj);
              });
              setImageFiles([...newImagesIndexes]);
            } else {
              setImageFiles(item.ProductImages);
            }

            // setImageFiles(item.ProductImages);
            setProductData({ ...item });
            setStateValues({ ...item });
            // priceHandler(item.retail_price);
            setWeeklyPrice({ ...item.rental_fee })
          }
        }
      })
      .catch((err) => {
        // showToast("error", err);
      });
  }

  useEffect(() => {
    if (!isEdit) {
      window.onpopstate = e => {
        let tempValues = { ...stateValues };
        tempValues.ProductImages = [...imageFiles];
        tempValues.rental_fee = { ...weeklyPrice };
        tempValues.weeklyPriceErr = { ...weeklyPriceErr };
        tempValues.isUpdate = isUpdate;
        tempValues.newAddedImages = [...newAddedImages];
        tempValues.deletedImages = [...deletedImages];
        history.push({ pathname: "/listing-details", state: { productDetails: tempValues, isEditMode: false, onPage: true } });
      }
    } else {
      window.onpopstate = () => { }
    };
  }, [stateValues, imageFiles, weeklyPrice, isEdit]);

  useEffect(() => {
    if (locationHistory && locationHistory.state) {
      const { productDetails, isEditMode, onPage } = locationHistory.state;
      if (isEditMode) {
        setIsEdit(isEditMode);
        fetchProductDetails(productDetails);
      } else {
        setIsEdit(isEditMode);
        setProductData({ ...productDetails });
        setStateValues({ ...productDetails });
        setImageFiles(productDetails.ProductImages);
        // priceHandler(productDetails.retail_price);
        setWeeklyPrice({ ...productDetails.rental_fee });
        setWeeklyPriceErr({ ...productDetails.weeklyPriceErr });
        setIsUpdate(productDetails.isUpdate);
        setNewAddedImages([...productDetails.newAddedImages]);
        setDeletedImages([...productDetails.deletedImages]);
        if (onPage) {
          setModalType("Discard");
          setShowModal(true);
        }
      }
    } else {
      setIsEdit(false);
    }
    getGeneralAttributes()
      .then((result) => {
        if (result.data.payload) {
          let data = result.data.payload;
          let filterSize = data.size.map(item => {
            let obj = {};
            obj.size = item;
            obj.active = false;
            return obj;
          });
          let filterBottom = data.bottom.map(item => {
            let obj = {};
            obj.size = item;
            obj.active = false;
            return obj;
          });
          setFilterSize([...filterSize, ...filterBottom]);
          // setFilterBottoms(filterBottom);
          let filterColor = data.color.map(item => {
            let obj = {};
            obj.color = item;
            obj.active = false;
            return obj;
          });
          setFilterColor(filterColor);
          let filterType = data.type.map(item => {
            let obj = {};
            let curArr = [];
            obj.type = item.type;
            item.subtype.map(val => {
              let curObj = {};
              curObj.name = val.name;
              curObj.active = false;
              curArr.push(curObj);
            })
            obj.subtype = curArr;
            obj.active = false;
            return obj;
          });
          setFilterTypes(filterType);
          let brand = data.brand.map(item => {
            let obj = {
              name: item,
              active: false,
            };

            return obj;
          });
          setFilterBrand(brand);
          let filterOccasions = data.occasion.map(item => {
            let obj = {};
            obj.name = item;
            obj.active = false;
            return obj;
          });
          filterOccasions = filterOccasions.splice(0, 10);
          setFilterOccasion(filterOccasions);
        }
      })
      .catch((errors) => {
      });
  }, []);

  const changeHandler = (key, value, index, setFieldValue, formikValues) => {
    if (key === "color") {
      let d = [...filterColor];
      let activeFilters = [];
      if (value) {
        d.map(val => {
          if (val.active) {
            activeFilters.push(val.color);
          }
        })
        if (activeFilters.length < 3) {
          d[index].active = value;
        }
      } else {
        d[index].active = value;
      }
      let tempArr = [];
      d.map(val => {
        if (val.active) {
          tempArr.push(val.color);
        }
      });
      setFieldValue("color", [...tempArr]);
      let tempObj = { ...formikValues };
      tempObj["color"] = [...tempArr];
      setStateValues({ ...tempObj });
      // setSelectedColor([...tempArr]);
      setFilterColor(d);
    } else if (key === "size") {
      let d = [...filterSize];
      let tempObj = { ...formikValues };
      if (value) {
        // setSelectedSize("");
        tempObj["size"] = "";
        setFieldValue("size", "");
      } else {
        // setSelectedSize(d[index].size);
        tempObj["size"] = d[index].size;
        setFieldValue("size", d[index].size);
      }
      setStateValues({ ...tempObj });
    } else if (key === "bottom") {
      let d = [...filterBottoms];
      d[index].active = value;
      setFilterBottoms(d);
    } else if (key === "type") {
      let val = value.target.checked;
      let filtered = [...filterTypes];
      filtered[index].active = val;
      setFilterTypes(filtered);
    } else if (key === "brand") {
      let val = value.target.checked;
      let filtered = [...filterBrand];
      let tempObj = { ...formikValues };
      if (val) {
        // setSelectedBrand(filtered[index].name);
        tempObj["brand"] = filtered[index].name;
        setFieldValue("brand", filtered[index].name);
      } else {
        // setSelectedBrand("");
        tempObj["brand"] = ""
        setFieldValue("brand", "");
      }
      setStateValues({ ...tempObj });
    } else if (key === "occasion") {
      let d = [...filterOccasion];
      let activeFilters = [];
      if (value) {
        d.map(val => {
          if (val.active) {
            activeFilters.push(val.name);
          }
        })
        if (activeFilters.length < 3) {
          d[index].active = value;
        }
      } else {
        d[index].active = value;
      }
      let tempArr = [];
      d.map(val => {
        if (val.active) {
          tempArr.push(val.name);
        }
      });
      setFieldValue("occasion", [...tempArr]);
      let tempObj = { ...formikValues };
      tempObj["occasion"] = [...tempArr];
      setStateValues({ ...tempObj });
      // setSelectedOccasion([...tempArr]);
      setFilterOccasion(d);
    }
  }

  const retail_price_RegExp =
    /^((\\+[1-9][ \\-]*)|(\\([0-9]\\)[ \\-]*)|([0-9])[ \\-]*)*?[0-9]?[ \\-]*[0-9]$/;

  const validationSchema = Yup.object().shape({
    title: Yup.string().trim().required("Title is required"),
    description: Yup.string().trim().required("Description is required"),
    category: Yup.object().shape({
      mainCategory: Yup.string().trim().required("Category is required"),
      type: Yup.string().trim().required("Category is required")
    }),
    size: Yup.string().trim().required("Size is required"),
    brand: Yup.string().trim().required("Brand is required"),
    color: Yup.array().min(1, "You need to select at least one color").max(3, "You can select upto 3 color's max.").required("Select at least one color"),
    occasion: Yup.array().min(1, "You need to select a least one occasion").max(3, "You can select upto 3 occasion's max.").required("Select at least one occasion"),
    retail_price: Yup.string()
      .trim(" ")
      .matches(retail_price_RegExp, "Only numbers are valid")
      .required("Price is required")
      .test("len", "Maximum retail price can be $5000", val => val <= 5000)
      .test("len", "Retail price can't be zero", val => val > 0),
  });

  const sizeValidationSchema = Yup.object().shape({
    size: Yup.string().trim().required("Size is required")
  });

  const brandValidationSchema = Yup.object().shape({
    brand: Yup.string().trim().required("Brand is required")
  });

  const priceHandler = (price, setFieldValue, values) => {
    let obj = {
      "2weeks": "",
      "3weeks": "",
      "4weeks": "",
      "5weeks": "",
      "6weeks": ""
    };
    if (price > 0) {
      // price calculations can change here
      var week2Price = (Math.round(price * .15) + 3)
      var week3Price = (Math.round(price * .25) + 3)
      var week4Price = (Math.round(price * .35) + 3)
      var week5Price = (Math.round(price * .45) + 3)
      var week6Price = (Math.round(price * .55) + 3)
      obj = {
        "2weeks": week2Price >= 15 ? week2Price : 15,
        "3weeks": week3Price >= 23 ? week3Price : 23,
        "4weeks": week4Price >= 31 ? week4Price : 31,
        "5weeks": week5Price >= 39 ? week5Price : 39,
        "6weeks": week6Price >= 47 ? week6Price : 47
      };
    }
    setFieldValue("retail_price", price);
    let tempObj = { ...values };
    tempObj["retail_price"] = price;
    setStateValues({ ...tempObj });
    setWeeklyPrice({ ...obj });
  }

  const setImages = (url) => {
    let d = imageFiles;
    d.push(url);
    setImageFiles([...d]);
    if (isUpdate) {
      let tempArr = [...newAddedImages];
      tempArr.push(url);
      setNewAddedImages([...tempArr]);
    }
  }

  const removeImages = (url) => {
    let d = imageFiles;
    let filtered = d.filter(val => val.image_url !== url);
    setImageFiles([...filtered]);
    if (isUpdate) {
      let arr = [...newAddedImages];
      if (arr.includes(url)) {
        let filteredArr = arr.filter(val => val.image_url !== url);
        setNewAddedImages([...filteredArr]);
      } else {
        let tempArr = [...deletedImages];
        tempArr.push(url);
        setDeletedImages([...tempArr]);
      }
    }
  }

  const onPreviewHandler = (values) => {
    values.ProductImages = [...imageFiles];
    values.rental_fee = { ...weeklyPrice };
    values.weeklyPriceErr = { ...weeklyPriceErr };
    values.newAddedImages = [...newAddedImages];
    values.deletedImages = [...deletedImages];
    history.push({ pathname: "/preview-product", state: { productDetails: values } });
  }

  const sizeRequestHandler = async (value) => {
    await sendSizeRequest(authToken, { sender_id: user.id, size: value.size }).then((result) => {
      if (result.data.success) {
        showToast("success", result.data.message);
      }
    }).catch((errors) => {
      showToast("error", errors);
    });
  }

  const productStatusHandler = async (value) => {
    await updateProductStatus(authToken, { user_id: user.id, status: value, product_id: productData?.id }).then((result) => {
      if (result.data.success) {
        // showToast("success", result.data.message);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    }).catch((errors) => {
      // showToast("error", errors);
      // setErrorMsg(errors.response.data.message);
    });
  }

  const handleDelete = async (productId) => {
    await deleteProduct(authToken, productId)
      .then((result) => {
        // showToast("success", result.data.message);
        setTimeout(() => {
          window.location.replace("/profile");
        }, 2000);
      })
      .catch((errors) => {
        // showToast("error", errors);
        // setErrorMsg(errors.response.data.message);
      });
  };

  const changeWeeklyPrice = (key, val) => {
    let priceRegex = /^((\\+[1-9][ \\-]*)|(\\([0-9]\\)[ \\-]*)|([0-9])[ \\-]*)*?[0-9]?[ \\-]*[0-9]$/;
    let regex = priceRegex.test(val);
    if (regex && val > 0 && val <= 5000) {
      let tempObj = { ...weeklyPrice };
      tempObj[key] = val;
      setWeeklyPrice({ ...tempObj });
      let tempErrObj = { ...weeklyPriceErr };
      tempErrObj[key] = "";
      setWeeklyPriceErr({ ...tempErrObj });
    } else {
      let priceObj = { ...weeklyPrice };
      let tempObj = { ...weeklyPriceErr };
      if (!regex) {
        priceObj[key] = "";
        tempObj[key] = "Only numbers are valid";
      } else if (val <= 0) {
        priceObj[key] = "";
        tempObj[key] = "Rental price can't be zero";
      } else if (val > 5000) {
        priceObj[key] = val;
        tempObj[key] = "Maximum rental price can be $5000";
      }
      setWeeklyPrice({ ...priceObj });
      setWeeklyPriceErr({ ...tempObj });
    }
  }

  const renderModalBody = () => {
    if (modalType === "AddSize") {
      return (<div>
        <Modal.Header className="bg-light-gray border-0">
          <Button className="border-0 ms-auto bg-transparent btn btn-primary" onClick={() => setShowModal(false)}>
            <img src="/media/images/X.svg" className="w-20px" />
          </Button>
        </Modal.Header>
        <Modal.Body className="bg-light-gray pt-0">
          <div className="row align-items-center justify-content-center">
            <div className="col-12 mt-4 text-center cus-calendar-input">
              <Formik
                initialValues={{
                  size: "",
                }}

                validationSchema={sizeValidationSchema}
                onSubmit={(values) => {
                  setShowModal(false);
                  setModalType("");
                  formRefA.current.setFieldValue("size", values.size);
                  // sizeRequestHandler(values);
                }}
              >
                {({
                  values,
                  errors,
                  touched,
                  handleSubmit,
                  handleChange,
                  handleBlur,
                  setFieldValue
                }) => {
                  return (
                    <form onSubmit={handleSubmit}>
                      <div className="text-center mb-3">
                        <h1 className="text-brown font-CambonRegular font-35 text-uppercase">
                          Set a custom size
                        </h1>
                      </div>
                      <div className="mb-2">
                        <CmtInputBox
                          name={"size"}
                          value={values.size}
                          handleChange={handleChange}
                          handleBlur={handleBlur}
                          type={"text"}
                          placeholder="Enter a size"
                        />
                        <div className="text-danger">
                          {touched.size && errors.size}
                        </div>
                      </div>
                      <div className="mt-4 mb-3 text-center">
                        <button type="submit" className="btn cus-modal-btn">ADD</button>
                      </div>
                    </form>
                  );
                }}
              </Formik>
            </div>
          </div>
        </Modal.Body>
      </div>
      );
    } else if (modalType === "AddBrand") {
      return (<div>
        <Modal.Header className="bg-light-gray border-0">
          <Button className="border-0 ms-auto bg-transparent btn btn-primary" onClick={() => setShowModal(false)}>
            <img src="/media/images/X.svg" className="w-20px" />
          </Button>
        </Modal.Header>
        <Modal.Body className="bg-light-gray pt-0">
          <div className="row align-items-center justify-content-center">
            <div className="col-12 mt-4 text-center cus-calendar-input">
              <Formik
                initialValues={{
                  brand: "",
                }}
                validationSchema={brandValidationSchema}
                onSubmit={(values) => {
                  setShowModal(false);
                  setModalType("");
                  formRefA.current.setFieldValue("brand", values.brand);
                }}
              >
                {({
                  values,
                  errors,
                  touched,
                  handleSubmit,
                  handleChange,
                  handleBlur,
                  setFieldValue
                }) => {
                  return (
                    <form onSubmit={handleSubmit}>
                      <div className="text-center mb-3">
                        <h1 className="text-brown font-CambonRegular font-35 text-uppercase">
                          Set a custom brand
                        </h1>
                      </div>
                      <div className="mb-2">
                        <CmtInputBox
                          name={"brand"}
                          value={values.brand}
                          handleChange={handleChange}
                          handleBlur={handleBlur}
                          type={"text"}
                          placeholder="Enter a brand name"
                        />
                        <div className="text-danger">
                          {touched.brand && errors.brand}
                        </div>
                      </div>
                      <div className="mt-4 mb-3 text-center">
                        <button type="submit" className="btn cus-modal-btn">ADD</button>
                      </div>
                    </form>
                  );
                }}
              </Formik>
            </div>
          </div>
        </Modal.Body>
      </div>
      );
    } else if (modalType === "Discard") {
      return (
        <>
          <Modal.Header className="border-0">
            <Button className="border-0 ms-auto bg-transparent btn btn-primary" onClick={() => setShowModal(false)}>
              <img src="/media/images/X.svg" className="w-20px" />
            </Button>
          </Modal.Header>
          <Modal.Body className="border-0 pt-0 pb-5">
            <div className="row">
              <div className="col-12 text-center">
                <h1 className="text-brown font-CambonRegular font-35 text-uppercase mb-0">
                  Are you sure you want to abandon this item?
                </h1>

                <p className="text-black-3 font-InterExtraLight font-18 mt-3"> Your changes will not be saved</p>
              </div>
              <div className="col-12 text-center">
                <Link to={'/profile'}
                  className="btn py-2 cus-React-btn mt-2 me-3"
                >
                  Discard Changes
                </Link>
                <button
                  className="btn text-brown py-2 cus-React-btn-outline mt-2"
                  onClick={() => {
                    setShowModal(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Modal.Body>
        </>
      )
    } else if (modalType === "DeleteProduct") {
      return (
        <>
          <Modal.Header className="border-top-0 mt-0">
            <Modal.Title className="font-InterRegular">
              Delete Product
            </Modal.Title>
            <Button className="border-0 ms-auto bg-transparent btn btn-primary" onClick={() => setShowModal(false)}>
              <img src="/media/images/X.svg" className="w-20px" />
            </Button>
          </Modal.Header>
          <Form noValidate>
            <Modal.Body className="py-5">
              <Form.Group md="12" className={"text-center"}>
                <Form.Label className="font-InterRegular">
                  Are you sure you want to delete this product with{" "}
                  <b>{productData && productData?.title}</b> ?
                </Form.Label>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button
                className="btn bg-transparent shadow-none border-0 font-InterMedium font-18 text-brown px-3"
                onClick={() => {
                  setShowModal(false);
                }}
              >
                Cancel
              </Button>
              <Button
                className="btn cus-React-btn px-3 py-2"
                onClick={() => handleDelete(productData?.id)}
              >
                Delete
              </Button>
            </Modal.Footer>
          </Form>
        </>
      );
    }

  };

  return (
    <>
      <TitleComponent title={props.title} icon={props.icon} />
      <section className="bg-light-gray pb-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-10">
              <h1 className="text-brown font-CambonRegular font-35 text-uppercase py-3 line-before mb-0">
                Listing details
              </h1>
            </div>
            {!isEdit && <div className="col-2 text-end">
              <div className="position-relative">
                <img src="/media/images/info_tooltip_icon.svg" className="w-20px ms-2 cus-tooltop-btn" />
                <span className="cus-tooltop-left">All fields with an <span className="text-cream">*</span> are required </span>
              </div>
            </div>}
          </div>

          <div className="row mt-4">
            {!isEdit && <div className="col-12">
              <p className="text-black-3 font-InterRegular font-20 text-uppercase">Photos<span className="text-cream">*</span></p>
              <p className="text-black-3 font-InterRegular font-20">Upload only real photos of your product in good quality in JPEG or PNG format. Use more photos from different angles</p>
            </div>}
          </div>

          <div className="row">
            {isEdit ? imageFiles.length > 0 && imageFiles.map(val => (
              <div className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-auto mt-3">
                <img className="img-fluid h-320 max-w-300 mx-auto" src={val.image_url}></img>
              </div>)) : <>
              <div className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl">
                <AddProduct setImageFile={setImages} removeImage={removeImages} activeFile={[...imageFiles]} fileIndex={0} setErrorMsg={setErrorMsg} isUpdate={isUpdate} newAddedImages={newAddedImages} />
              </div>
              <div className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl">
                <AddProduct setImageFile={setImages} removeImage={removeImages} activeFile={[...imageFiles]} fileIndex={1} setErrorMsg={setErrorMsg} isUpdate={isUpdate} newAddedImages={newAddedImages} />
              </div>
              <div className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl">
                <AddProduct setImageFile={setImages} removeImage={removeImages} activeFile={[...imageFiles]} fileIndex={2} setErrorMsg={setErrorMsg} isUpdate={isUpdate} newAddedImages={newAddedImages} />
              </div>
              <div className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl">
                <AddProduct setImageFile={setImages} removeImage={removeImages} activeFile={[...imageFiles]} fileIndex={3} setErrorMsg={setErrorMsg} isUpdate={isUpdate} newAddedImages={newAddedImages} />
              </div>
              <div className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl">
                <AddProduct setImageFile={setImages} removeImage={removeImages} activeFile={[...imageFiles]} fileIndex={4} setErrorMsg={setErrorMsg} isUpdate={isUpdate} newAddedImages={newAddedImages} />
              </div></>}

            <div className="col-12">
              <div className="text-danger mt-2">
                {errorMsg}
              </div>
            </div>
          </div>
          <Formik innerRef={formRefA}
            initialValues={{
              user_id: user?.id,
              title: productData ? productData.title : "",
              description: productData ? productData.description : "",
              category: productData ? productData.category : { mainCategory: "", type: "" },
              size: productData ? productData.size : "",
              brand: productData ? productData.brand : "",
              color: productData ? productData?.color : [],
              occasion: productData ? productData.occasion : [],
              retail_price: productData ? productData.retail_price : "",
              shipping_type: 2,
              location_id: user?.ShippingAddress[0].zip_code,
              week: 6,
              product_id: productData ? productData.product_id ? productData.product_id : "" : "",
              isUpdate: isUpdate
            }}
            enableReinitialize
            validationSchema={validationSchema}
            onSubmit={(values) => {
              if (!isEdit) {
                if (imageFiles.length > 0) {
                  let weeklyPriceErrObj = { ...weeklyPriceErr };
                  let err = false;
                  for (const key in weeklyPriceErrObj) {
                    if (weeklyPriceErrObj[key] !== "") {
                      err = true;
                    }
                  }
                  if (!err) {
                    onPreviewHandler(values);
                  } else {
                    priceTableRef.current.scrollIntoView({ block: 'end', behavior: 'smooth' });
                  }
                } else {
                  // showToast("error_msg", "Please upload at least one Image");
                  setErrorMsg("Please upload at least one Image");
                  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                }
              }
            }}
          >
            {({
              values,
              errors,
              touched,
              handleSubmit,
              handleChange,
              handleBlur,
              setFieldValue,
              isSubmitting,
            }) => {
              return (
                <form encType="multipart/form-data" onSubmit={handleSubmit}>
                  <div className="row mt-5 pt-5">
                    <div className="col-12">
                      <p className="text-black-3 font-InterRegular font-20 text-uppercase">Description<span className="text-brown">*</span></p>
                    </div>
                    <div className="col-12">
                      <input className="form-control font-18 font-InterRegular rounded-0 bg-transparent shadow-none border-slate-gray" type="text" placeholder="Title" name="title" value={values.title} onBlur={handleBlur}
                        onChange={(e) => {
                          handleChange(e);
                          let tempObj = { ...values };
                          tempObj["title"] = e.target.value;
                          setStateValues({ ...tempObj });
                        }} disabled={isEdit} />
                      <div className="text-danger">
                        {touched.title && errors.title}
                      </div>
                    </div>
                    <div className="col-12 mt-4">
                      <textarea rows="5" value={values.description} name="description" className="form-control font-18 font-InterRegular rounded-0 bg-transparent shadow-none border-slate-gray" placeholder="Description" onBlur={handleBlur}
                        onChange={(e) => {
                          handleChange(e);
                          let tempObj = { ...values };
                          tempObj["description"] = e.target.value;
                          setStateValues({ ...tempObj });
                        }} disabled={isEdit}></textarea>
                      <div className="text-danger">
                        {touched.description && errors.description}
                      </div>
                    </div>
                  </div>

                  <div className="row mt-5 pt-5 account-accordion listing-details">
                    <div className="col-12">
                      <p className="text-black-3 font-InterRegular font-20 text-uppercase">Details</p>
                    </div>

                    <div className="col-12">
                      <Accordion
                        className="border-slate-gray-bottom"
                        disabled={isEdit}
                        expanded={expanded === 'panel1'}
                        onChange={handleAccordion('panel1')}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMore className="text-black" />}
                        >
                          <Typography>
                            <p className="text-light-gray4 font-InterLight font-18 mb-0">Category<span className="text-brown">*</span> <span className="text-black-3 font-InterMedium ms-2" name="category" value={values.category} onBlur={handleBlur}
                              onChange={(e) => {
                                // setStateValues({...values});
                                handleChange(e);
                              }}>{values.category.type}</span></p>
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography>
                            <div className="row border-slate-gray rounded mh-300 overflow-auto cus-scroll">
                              <div className="col-12 px-0">
                                {filterTypes.map((item, index) => (
                                  <div className="border-slate-gray-bottom py-3">
                                    <h3 className={`font-16 text-black-3 mb-0 cursor-pointer px-3 ${item.active ? "fw-bold" : "font-InterMedium"}`} key={index}>{item.type}</h3>
                                    {item.subtype.map((i, index) => (
                                      <a className={`font-16 text-black-3 font-InterLight d-block cursor-pointer text-decoration-none py-2 ps-5 mt-2 category-hover-style ${i.name === values.category.type ? "fw-bold bg-white" : ""}`} onClick={() => {
                                        i.name === values.category.type ? setFieldValue("category", { mainCategory: "", type: "" }) : setFieldValue("category", { mainCategory: item.type, type: i.name });
                                        setExpanded(false);
                                        let tempObj = { ...values };
                                        tempObj["category"] = { mainCategory: item.type, type: i.name };
                                        setStateValues({ ...tempObj });
                                      }} key={index}>{i.name}</a>
                                    ))
                                    }
                                  </div>
                                ))}
                              </div>
                            </div>
                          </Typography>
                        </AccordionDetails>
                      </Accordion>
                      <div className="text-danger">
                        {touched?.category?.type && errors?.category?.type}
                      </div>
                    </div>
                    <div className="col-12 mt-3">
                      <Accordion
                        className="border-slate-gray-bottom"
                        disabled={isEdit}
                        expanded={expanded === 'panel2'}
                        onChange={handleAccordion('panel2')}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMore className="text-black" />}
                        >
                          <Typography>
                            <p className="text-light-gray4 font-InterLight font-18 mb-0">Size<span className="text-brown">*</span> <span className="text-black-3 font-InterMedium ms-2" onBlur={handleBlur}
                              onChange={handleChange} name="size" value={values.size}>{values.size}</span></p>
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography>
                            <div className="row border-slate-gray rounded pb-3">
                              <div className="col-12">
                                <div className="row">
                                  {filterSize?.map((item, index) => (
                                    <div className="col-auto pe-0 mt-3" key={index}>
                                      <div className={clsx(`size-box size-box-small px-2 cursor-pointer text-center py-1 ${values.size === item.size ? "active" : ""}`)} onClick={() => {
                                        changeHandler("size", values.size === item.size, index, setFieldValue, values);
                                        setExpanded(false);
                                      }}>
                                        <span className="font-16 text-black-3 font-InterExtraLight">{item.size}</span>
                                      </div>
                                    </div>
                                  ))}

                                  <div className="col-12 mt-3">
                                    <a onClick={() => {
                                      setModalType("AddSize");
                                      setShowModal(true);
                                    }} className="text-brown font-18 font-InterRegular text-decoration-none cursor-pointer">+ Add size</a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Typography>
                        </AccordionDetails>
                      </Accordion>
                      <div className="text-danger">
                        {touched.size && errors.size}
                      </div>
                    </div>
                    <div className="col-12 mt-3">
                      <Accordion
                        className="border-slate-gray-bottom"
                        disabled={isEdit}
                        expanded={expanded === 'panel3'}
                        onChange={handleAccordion('panel3')}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMore className="text-black" />}
                        >
                          <Typography>
                            <p className="text-light-gray4 font-InterLight font-18 mb-0">Brand<span className="text-brown">*</span> <span className="text-black-3 font-InterMedium ms-2" name="brand" value={values.brand} onBlur={handleBlur}
                              onChange={handleChange}>{values.brand}</span></p>
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography>
                            <div className="row border-slate-gray rounded py-3 mh-300 overflow-auto cus-scroll">
                              {filterBrand?.map((item, index) => (
                                <div className="col-12 col-md-6 col-lg-4" key={index}>
                                  <FormGroup className="cus-checkbox">
                                    <FormControlLabel control={<Radio />} label={item.name} checked={item.name === values.brand} onChange={(e) => {
                                      changeHandler("brand", e, index, setFieldValue, values);
                                      setExpanded(false);
                                    }} />
                                  </FormGroup>
                                </div>

                                // div holding formgroup in map
                              ))}

                              <div className="col-12 mt-3">
                                <a onClick={() => {
                                  setModalType("AddBrand");
                                  setShowModal(true);
                                }} className="text-brown font-18 font-InterRegular text-decoration-none cursor-pointer">+ Add brand</a>
                              </div>
                            </div>
                          </Typography>
                        </AccordionDetails>
                      </Accordion>
                      <div className="text-danger">
                        {touched.brand && errors.brand}
                      </div>
                    </div>
                    <div className="col-12 mt-3">
                      <Accordion
                        className="border-slate-gray-bottom"
                        disabled={isEdit}
                        expanded={expanded === 'panel4'}
                        onChange={handleAccordion('panel4')}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMore className="text-black" />}
                        >
                          <Typography>
                            <p className="text-light-gray4 font-InterLight font-18 mb-0">Color<span className="text-brown">*</span> <span className="text-black-3 font-InterMedium ms-2" name="color" value={values.color} onBlur={handleBlur}
                              onChange={handleChange}>{values.color.join(", ")}</span></p>
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography>
                            <div className="row border-slate-gray rounded py-3">
                              <div className="col-12">
                                <p className="text-brown font-InterLight font-14 mb-0">*you can select up to three options</p>
                              </div>
                              {filterColor?.map((item, index) => (
                                <div className="col-auto mt-3 pe-0" key={index}>
                                  <div className={clsx(`size-box size-box-small px-2 cursor-pointer text-center py-1 ${item.active ? "active" : ""}`)} onClick={() => {
                                    changeHandler("color", !item.active, index, setFieldValue, values);
                                  }}>
                                    <span className="font-16 text-black-3 font-InterExtraLight">{item.color}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </Typography>
                        </AccordionDetails>
                      </Accordion>
                      <div className="text-danger">
                        {touched.color && errors.color}
                      </div>
                    </div>
                    <div className="col-12 mt-3">
                      <Accordion
                        className="border-slate-gray-bottom"
                        disabled={isEdit}
                        expanded={expanded === 'panel5'}
                        onChange={handleAccordion('panel5')}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMore className="text-black" />}
                        >
                          <Typography>
                            <p className="text-light-gray4 font-InterLight font-18 mb-0">Occasion <span className="text-black-3 font-InterMedium ms-2" name="occasion" value={values.occasion} onBlur={handleBlur}
                              onChange={handleChange}>{values.occasion.join(", ")}</span></p>
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography>
                            <div className="row border-slate-gray rounded py-3">
                              <div className="col-12">
                                <p className="text-brown font-InterLight font-14 mb-0">*you can select up to three options</p>
                              </div>
                              {filterOccasion?.map((item, index) => (
                                <div className="col-auto mt-3 pe-0" key={index}>
                                  <div className={clsx(`size-box size-box-small px-2 cursor-pointer text-center py-1 ${item.active ? "active" : ""}`)} onClick={() => {
                                    changeHandler("occasion", !item.active, index, setFieldValue, values);
                                  }}>
                                    <span className="font-16 text-black-3 font-InterExtraLight">{item.name}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </Typography>
                        </AccordionDetails>
                      </Accordion>
                      <div className="text-danger">
                        {touched.occasion && errors.occasion}
                      </div>
                    </div>
                  </div>

                  <div className="row mt-5 pt-3">
                    <div className="col-12">
                      <p className="text-black-3 font-InterRegular font-20 text-uppercase">Rental Price<span className="text-brown">*</span></p>
                    </div>

                    <div className="col-12">
                      <p className="text-light-gray4 font-InterLight font-18">Retail Price {!isEdit && <span className="text-brown font-16 ms-3">*please make sure to add any dry cleaning costs here </span>}</p>
                    </div>

                    <div className="col-12 pt-0 mb-4 pb-2">
                      <div className="text-black-3 font-InterMedium font-20 mb-0">
                        <input className="form-control font-18 font-InterExtraLight rounded-0 bg-transparent shadow-none border-0" type="number" placeholder="" name="retail_price" value={values.retail_price} onBlur={(e) => {
                          handleBlur(e);
                          priceHandler(e.target.value, setFieldValue, values)
                        }}
                          onChange={(e) => {
                            handleChange(e);
                            priceHandler(e.target.value, setFieldValue, values);
                          }} disabled={isEdit} /></div>
                      <span className="border-slate-gray-bottom d-block"></span>
                      <div className="text-danger">
                        {touched.retail_price && errors.retail_price}
                      </div>
                      {!isEdit && <p className="text-black-3 font-InterLight font-18">Suggested 2 week rental price: <span className="text-brown ms-3">{weeklyPrice["2weeks"] !== "" ? `$${weeklyPrice["2weeks"]}` : ``}</span></p>}
                    </div>

                    {/* <div className="col-12 ">{weeklyPrice["2weeks"] === "" && <p className="text-light-gray4 font-InterLight font-18">Length of Rental<span className="text-brown font-16 ms-3">*these are suggested rental prices</span></p>}
                    </div> */}

                    <div className="col-12 col-sm-7 col-md-6 col-lg-4 col-xl-3" ref={priceTableRef}>
                      <p className="text-light-gray4 font-InterLight font-18 d-flex justify-content-between align-items-center">
                        <span>Length of Rental</span>
                        {weeklyPrice["2weeks"] !== "" && !isEdit && <img
                          src="/media/images/Vector.png"
                          className="edit-icon-size cursor-pointer"
                          onClick={() => setIsWeekPriceEdit(!isWeekPriceEdit)}
                        />}</p>
                      {!isWeekPriceEdit && !isEdit && <span className="text-brown font-16">*these are suggested rental prices</span>}
                      <table className="table table-bordered listing-table">
                        <tbody>
                          <tr className="align-middle">
                            <td width="40%" className="text-black-3 font-18 font-InterRegular">2 weeks</td>
                            <td contenteditable width="60%" className="text-brown font-18 font-InterRegular"><div className="d-flex align-items-center">
                              <span>$</span>
                              <input className="form-control font-18 font-InterExtraLight rounded-0 bg-transparent shadow-none border-0" value={weeklyPrice["2weeks"] !== "" ? `${weeklyPrice["2weeks"]}` : ``} onChange={(e) => changeWeeklyPrice("2weeks", e.target.value)} disabled={!isWeekPriceEdit} />
                            </div>
                              <p className="text-danger font-InterLight font-12 mb-0">{weeklyPriceErr["2weeks"]}</p></td>
                          </tr>
                          <tr className="align-middle">
                            <td width="40%" className="text-black-3 font-18 font-InterRegular">3 weeks</td>
                            <td contenteditable width="60%" className="text-brown font-18 font-InterRegular">
                              <div className="d-flex align-items-center">
                                <span>$</span>
                                <input className="form-control font-18 font-InterExtraLight rounded-0 bg-transparent shadow-none border-0" value={weeklyPrice["3weeks"] !== "" ? `${weeklyPrice["3weeks"]}` : ``} onChange={(e) => changeWeeklyPrice("3weeks", e.target.value)} disabled={!isWeekPriceEdit} />
                              </div>
                              <p className="text-danger font-InterLight font-12 mb-0">{weeklyPriceErr["3weeks"]}</p>
                            </td>
                          </tr>
                          <tr className="align-middle">
                            <td width="40%" className="text-black-3 font-18 font-InterRegular">4 weeks</td>
                            <td contenteditable width="60%" className="text-brown font-18 font-InterRegular">
                              <div className="d-flex align-items-center">
                                <span>$</span>
                                <input className="form-control font-18 font-InterExtraLight rounded-0 bg-transparent shadow-none border-0" value={weeklyPrice["4weeks"] !== "" ? `${weeklyPrice["4weeks"]}` : ``} onChange={(e) => changeWeeklyPrice("4weeks", e.target.value)} disabled={!isWeekPriceEdit} />
                              </div>
                              <p className="text-danger font-InterLight font-12 mb-0">{weeklyPriceErr["4weeks"]}</p>
                            </td>
                          </tr>
                          <tr className="align-middle">
                            <td width="40%" className="text-black-3 font-18 font-InterRegular">5 weeks</td>
                            <td contenteditable width="60%" className="text-brown font-18 font-InterRegular">
                              <div className="d-flex align-items-center">
                                <span>$</span>
                                <input className="form-control font-18 font-InterExtraLight rounded-0 bg-transparent shadow-none border-0" value={weeklyPrice["5weeks"] !== "" ? `${weeklyPrice["5weeks"]}` : ``} onChange={(e) => changeWeeklyPrice("5weeks", e.target.value)} disabled={!isWeekPriceEdit} />
                              </div>
                              <p className="text-danger font-InterLight font-12 mb-0">{weeklyPriceErr["5weeks"]}</p>
                            </td>
                          </tr>
                          <tr className="align-middle">
                            <td width="40%" className="text-black-3 font-18 font-InterRegular">6 weeks</td>
                            <td contenteditable width="60%" className="text-brown font-18 font-InterRegular">
                              <div className="d-flex align-items-center">
                                <span>$</span>
                                <input className="form-control font-18 font-InterExtraLight rounded-0 bg-transparent shadow-none border-0" value={weeklyPrice["6weeks"] !== "" ? `${weeklyPrice["6weeks"]}` : ``} onChange={(e) => changeWeeklyPrice("6weeks", e.target.value)} disabled={!isWeekPriceEdit} />
                              </div>
                              <p className="text-danger font-InterLight font-12 mb-0">{weeklyPriceErr["6weeks"]}</p>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="row px-2 mt-5">
                    <div className="col-12">
                      <div className="row align-items-center">
                        <div className="col-12 col-sm-6 mt-4">
                          <Link
                            className="text-brown font-18 font-InterRegular text-uppercase"
                            onClick={() => {
                              if (isEdit) {
                                window.location.replace("/profile")
                              } else {
                                setModalType("Discard");
                                setShowModal(true);
                              }
                            }}
                          >
                            Return to my product
                          </Link>
                        </div>
                        {!isEdit && <div className="col-12 col-sm-6 text-sm-end mt-4">
                          {isUpdate && <button
                            type="button"
                            onClick={() => {
                              setModalType("Discard");
                              setShowModal(true);
                            }}
                            className="btn px-4 cus-React-btn-outline text-black text-uppercase shadow-none me-3">
                            Cancel
                          </button>}
                          <button
                            type="submit"
                            className="btn cus-React-btn shadow-none text-uppercase">
                            Preview
                          </button>
                        </div>}
                        {isEdit && (
                          <div className="col-12 col-sm-6 text-sm-end mt-4">
                            <button
                              onClick={() => {
                                productStatusHandler(!productData?.availability_status);
                              }}
                              className="btn px-4 cus-React-btn-outline text-black text-uppercase shadow-none me-3"
                              disabled={productData?.availability_status === 2}>
                              {productData?.availability_status === 0 ? "Make Item Available" : "Make Item Unavailable"}
                            </button>
                            <button
                              onClick={() => {
                                setIsEdit(false);
                                setIsUpdate(true);
                              }}
                              className="btn px-4 cus-React-btn-outline text-black text-uppercase shadow-none me-3">
                              Edit
                            </button>
                            <button
                              onClick={async () => {
                                setModalType("DeleteProduct");
                                setShowModal(true);
                              }
                              }
                              className="btn px-3 cus-React-btn text-uppercase shadow-none mt-3 mt-md-0"
                              disabled={productData?.availability_status === 2}>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </form>
              );
            }}
          </Formik>
        </div>
      </section >

      <Modal
        size="md"
        centered="true"
        show={showModal}
        onHide={() => {
          setShowModal(false);
        }}
        style={{ opacity: 1 }}
        className="listing-modal"
      >
        {showModal && renderModalBody()}
      </Modal>
    </>
  );
}

export default withRouter(ListingDetails);
