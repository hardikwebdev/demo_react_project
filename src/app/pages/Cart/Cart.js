import React, { useState, useEffect } from "react";
// import { shallowEqual, useSelector } from "react-redux";
import { withRouter, useHistory } from "react-router-dom";
import TitleComponent from "../../../components/Common/TitleComponent";
import { showToast } from "../../../utils/utils";
import { getCartList, removeFromCartAPI, featuredRentals, localPickUpAvailability, addToFavorites, getFavorites } from "../../crud/auth.crud";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { addToCart, removeFromCart } from "../../../redux/actions/cartAction";
import { Link, useLocation } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import moment from "moment";
import SingleProduct from "../../../components/Common/SingleProduct";
import { FormControlLabel, RadioGroup, Radio, FormControl } from "@material-ui/core";
import { Formik } from "formik";
import * as Yup from "yup";
import CmtInputBox from "../../../components/Common/CmtInputBox";
import { dispatchLogout } from "../../../redux/actions/authAction";
import { addFavorite, removeFavorite } from "../../../redux/actions/favoriteAction";

function Cart(props) {
  // const [cartDetails, setCartDetails] = useState([]);
  const [details, setDetails] = useState([]);
  const [isEmpty, setIsEmpty] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [zipCode, setZipcode] = useState({ zip_code: "", selected_mile: "" });
  const [featuredata, setFeatureData] = useState([]);
  const [shipToAddress, setShipToAddress] = useState(true);
  const [modalType, setModalType] = useState("");
  const [notAvailableZipcodes, setNotAvailableZipcodes] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const { cartDetails } = useSelector(
    ({ cartReducer }) => ({ cartDetails: cartReducer.cart }),
    shallowEqual
  );

  const handleChange = (key) => {
    if (key === "shipToAddress") {
      setShipToAddress(true);
      setZipcode({ zip_code: "", selected_mile: "" });
    } else if (key === "localPickUp") {
      setShipToAddress(false);
      setModalType("localPickUp");
      setShowModal(true);
    }
  }

  const validationSchema = Yup.object().shape({
    zip_code: Yup.string().matches(/^[0-9]{5}(?:-[0-9]{4})?$/, "Must be a valid ZIP code")
      .required("Zip code is required"),
    selected_mile: Yup.string().required("Please select the radius.")
  });

  const getFeaturedRental = () => {
    featuredRentals()
      .then((result) => {
        setFeatureData(result.data.payload);
      })
      .catch((errors) => {
        setFeatureData([]);
      });
  }
  useEffect(() => {
    getFeaturedRental();
  }, []);

  const onProductClick = (item) => {
    history.push({ pathname: `/product-details/jhf_${item.id}`, state: { productId: item.id } });
  }

  const history = useHistory();

  const { authUser, authToken } = useSelector(
    ({ auth }) => ({
      authToken: auth?.authToken,
      authUser: auth?.user,
    }),
    shallowEqual
  );

  const { favoritesId } = useSelector(
    ({ favoriteReducer }) => ({
      favoritesId: favoriteReducer.favorites
    }),
    shallowEqual
  );

  useEffect(() => {
    getFavoritesHandler();
  }, [favoritesId]);

  const isJSON = async function (text) {
    if (typeof text !== "string") {
      return false;
    }
    try {
      JSON.parse(text);
      return true;
    } catch (error) {
      return false;
    }
  }

  const fetchCartDetails = async () => {
    if (authToken) {
      await getCartList(authUser.token, authUser.id)
        .then(async (result) => {
          var data = result.data.postdata.data;
          if (data.length > 0) {
            let localPickup;
            setIsEmpty(false);
            let cost = 5;
            await data.map(async (val) => {
              cost += parseInt(val.amount);
              let parsed = await isJSON(val.shipping_type) ? JSON.parse(val.shipping_type) : val.shipping_type;
              if (zipCode.zip_code == "" && parsed?.zip_code && parsed?.zip_code != "") {
                localPickup = parsed;
              }
            });

            if (zipCode.zip_code == "" && localPickup && localPickup.zip_code && localPickup.zip_code !== "") {
              setShipToAddress(false);
              setZipcode(localPickup);
              checkLocalPickUpAvailability(localPickup, data);
            }
            setSubtotal(cost);
          } else {
            setIsEmpty(true);
            setSubtotal(0);
          }
          setDetails(data);
          if (!shipToAddress && zipCode.zip_code != "") {
            checkLocalPickUpAvailability(zipCode, data);
          }
        })
        .catch((errors) => {
          let error_status = errors.response.status;
          if (error_status == 401) {
            dispatch(dispatchLogout());
            // showToast("error", errors);
            history.push("/account/login");
          }
          if (error_status !== 401) {
            // showToast("error", errors);
          }
        });
    } else {
      if (cartDetails.length > 0) {
        setIsEmpty(false);
        let cost = 5;
        let localPickup;

        await cartDetails.map(async (val) => {
          cost += parseInt(val.amount);
          let parsed = await isJSON(val.shipping_type) ? JSON.parse(val.shipping_type) : val.shipping_type;
          if (zipCode?.zip_code == "" && parsed?.zip_code != "") {
            localPickup = parsed;
          }
        });

        if (zipCode.zip_code == "" && localPickup && localPickup.zip_code && localPickup.zip_code !== "") {
          setShipToAddress(false);
          setZipcode(localPickup);
          checkLocalPickUpAvailability(localPickup, cartDetails);
        }
        setSubtotal(cost);
      } else {
        setIsEmpty(true);
        setSubtotal(0);
      }
      setDetails(cartDetails);
      if (!shipToAddress && zipCode.zip_code != "") {
        checkLocalPickUpAvailability(zipCode, cartDetails);
      }
    }
  }

  const getFavoritesHandler = async () => {
    if (authToken) {
      await getFavorites(authToken, authUser.id, 1)
        .then((result) => {
          setFavorites(result.data.postdata.idArr);
        })
        .catch((errors) => {
          setFavorites([]);
          console.log("ERROR : ", errors)
        });
    } else {
      let arr = [];
      await favoritesId.map(val => arr.push(val.Product.id));
      setFavorites([...arr]);
    }
  }

  const addToFavoritesHandler = async (productId, isFavorite, isDiff) => {
    if (authToken) {
      let obj = {
        user_id: authUser.id,
        product_id: productId,
        isFavorite
      }
      await addToFavorites(authToken, obj).then(async (result) => {
        if (result.data.success) {
          // showToast("success", result.data.message);
          getFavoritesHandler();
          getFeaturedRental();
        }
      }).catch((errors) => {
        let error_status = errors.response.status;
        if (error_status !== 401) {
          // showToast("error", errors);
        }
      });
    } else {
      let data;
      if (isDiff) {
        data = details.filter(val => val.product_id === productId);
      } else {
        data = featuredata.filter(val => val.id === productId);
      }
      if (data.length > 0 && isFavorite) {
        dispatch(addFavorite({ Product: { ...data[0] } }));
      } else if (!isFavorite) {
        dispatch(removeFavorite(productId));
      }
    }
  }

  useEffect(() => {
    fetchCartDetails();
  }, [cartDetails]);

  const onRemove = async (product_id) => {
    const data = {
      user_id: authUser.id,
      product_id: product_id
    };
    await removeFromCartAPI(authToken, data)
      .then(async (result) => {
        if (result.data.success) {
          await fetchCartDetails();
          // showToast("success", result.data.message);
        }
      })
      .catch((errors) => {
        let error_status = errors.response.status;
        if (error_status !== 401) {
          // showToast("error", errors);
        }
      });
  };

  // useEffect(() => {
  //   if (!authToken) {
  //     if (cartDetails.length > 0) {
  //       setIsEmpty(false);
  //       let cost = 5;
  //       cartDetails.map((val) => {
  //         cost += val.retail_price;
  //       });
  //       setSubtotal(cost);
  //     } else {
  //       setIsEmpty(true);
  //       setSubtotal(0);
  //     }
  //     setDetails(cartDetails);
  //   }
  // }, [cartDetails]);

  const dispatch = useDispatch();

  const handleRemoveItem = async (id) => {
    setShowModal(false);
    if (authToken) {
      await onRemove(id);
    } else {
      dispatch(removeFromCart(id));
    }
  };

  const checkLocalPickUpAvailability = async (val, data) => {
    let zipArr = [];
    await data.map(curVal => {
      zipArr.push(curVal.location_id);
    })
    zipArr = JSON.stringify(zipArr);
    let zipcode = JSON.stringify(val);
    await localPickUpAvailability(zipArr, zipcode).then(result => {
      setNotAvailableZipcodes(result.data);
      setShowModal(false);
    });
  }

  const renderModalBody = () => {
    return (
      <>
        {modalType == "reomoveProduct" ? <>
          <Modal.Header className="mt-0 font-18 font-InterRegular text-black-3">
            Remove Product From Cart
            <Button className="border-0 ms-auto bg-transparent btn btn-primary" onClick={() => setShowModal(false)}>
              <img src="/media/images/X.svg" className="w-20px" />
            </Button>
          </Modal.Header>
          <Modal.Body className="py-5">
            <h5 className="text-center font-InterLight font-18 text-black-3">
              Are you sure you want to remove this product from cart ?
            </h5>
          </Modal.Body>
          <Modal.Footer>
            <Button
              className="btn bg-transparent shadow-none border-0 font-InterRegular font-18 text-brown px-3"
              onClick={() => {
                setShowModal(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleRemoveItem(currentProduct.product_id);
              }}
              className="btn cus-React-btn px-3 py-2"
            >
              Remove
            </Button>
          </Modal.Footer></> : (<div>
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
                      zip_code: zipCode.zip_code,
                      selected_mile: zipCode.selected_mile
                    }}

                    validationSchema={validationSchema}
                    onSubmit={(values) => {
                      setModalType("");
                      setZipcode(values);
                      checkLocalPickUpAvailability(values, details);
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
                              Local Pick Up
                            </h1>
                          </div>
                          <div className="mb-2">
                            <CmtInputBox
                              name={"zip_code"}
                              values={values.zip_code}
                              handleChange={handleChange}
                              handleBlur={handleBlur}
                              type={"string"}
                              placeholder="Enter Zip code"
                            />
                            <div className="text-danger">
                              {touched.zip_code && errors.zip_code}
                            </div>
                          </div>
                          <div className="mb-2">
                            <select className="form-select shadow-none border-select-modal rounded-0 bg-light-gray py-2 font-18 text-black-3 font-InterLight" aria-label="Default select example" name="selected_mile" value={values.selected_mile} onChange={(e) => {
                              setFieldValue("selected_mile", e.target.value);
                            }}>
                              <option value="">Select radius</option>
                              <option value="5">5 miles</option>
                              <option value="10">10 miles</option>
                              <option value="15">15 miles</option>
                            </select>
                            <div className="text-danger">
                              {touched.selected_mile && errors.selected_mile}
                            </div>
                          </div>
                          <div className="mt-4 mb-3 text-center">
                            <button type="submit" className="btn cus-modal-btn">APPLY</button>
                          </div>
                        </form>
                      );
                    }}
                  </Formik>
                </div>
              </div>
            </Modal.Body>
          </div>)}
      </>
    );
  };

  return (
    <>
      <TitleComponent title={props.title} icon={props.icon} />
      <section className="bg-light-gray py-5">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h1 className="text-brown font-CambonRegular font-30 text-uppercase line-before">
                shopping Cart
              </h1>
            </div>

            {!isEmpty && <div className="col-12 mt-4">
              <FormControl>
                <RadioGroup
                  aria-labelledby="demo-radio-buttons-group-label"
                  value={shipToAddress}
                  name="radio-buttons-group"
                  className="cus-radio"
                >
                  <FormControlLabel value={true} control={<Radio />} label="Ship to Address" onChange={() => {
                    handleChange("shipToAddress");
                  }} />
                  <FormControlLabel value={false} control={<Radio />} label={<div>Free Local Pick Up from <a className='text-brown' onClick={() => {
                    setModalType("localPickUp");
                    setShowModal(true);
                  }}> {zipCode.zip_code != "" ? zipCode.zip_code : "zip code"} </a></div>} onChange={() => {
                    handleChange("localPickUp");
                  }} />
                  <p className="font-12 text-black-3 font-InterLight ms-4 ps-2 mb-0">Add your zip code to see if your items are available for free local pick up</p>
                </RadioGroup>
              </FormControl>
            </div>
            }
          </div>
          {!isEmpty && (
            <div className="row mx-0 mt-5 border-slate-gray-bottom pb-2">
              <div className="col-12 px-0">
                <p className="text-black-3 font-InterLight font-14 text-uppercase mb-0">
                  {details?.length} Items
                </p>
              </div>
            </div>
          )}

          {details.map((product) => {
            // let sizeD = product?.ProductAttributes?.filter(
            //   (it) => it.meta_type === "Size"
            // );
            // let colorD = product?.ProductAttributes?.filter(
            //   (it) => it.meta_type === "Color"
            // );
            return (
              <div
                className="row border-slate-gray-bottom py-3"
                key={product.id}
              >
                <div className="col-12 col-sm-10">
                  <div className="row">
                    <div className="col-12 col-sm-4">
                      <div className="position-relative">
                        <div className="heart-pos">
                          <img src="/media/images/heart.svg" className={`heart-product-details heart-empty ${(favorites && favorites.includes(product.product_id)) ? "d-none" : "d-block"}`} onClick={() => {
                            if (favorites && favorites.includes(product.product_id)) {
                              addToFavoritesHandler(product.product_id, 0, true);
                            } else {
                              addToFavoritesHandler(product.product_id, true);
                            }
                          }} />
                          <img src="/media/images/heartfilled.svg" className={`heart-product-details heart-filled ${(!favorites || !favorites.includes(product.product_id)) ? "d-none" : "d-block"}`} onClick={() => {
                            if (favorites && favorites.includes(product.product_id)) {
                              addToFavoritesHandler(product.product_id, 0, true);
                            } else {
                              addToFavoritesHandler(product.product_id, 1, true);
                            }
                          }} />
                        </div>
                        <img
                          src={product?.image_url}
                          className="img-fluid d-block mx-auto cursor-pointer"
                          onClick={() => onProductClick({ id: product?.product_id })}
                        />
                      </div>
                    </div>
                    <div className="col-12 col-sm-8 mt-4 mt-sm-0 d-flex flex-column justify-content-between">
                      <div>
                        <h4 className="text-black-3 font-InterRegular text-uppercase font-18 cursor-pointer" onClick={() => onProductClick({ id: product?.product_id })}>
                          {product.title}
                        </h4>
                        <p className="text-black-3 font-InterLight font-16 mb-1 pt-2">
                          Rental Period: {product.rental_period} weeks
                        </p>
                        <p className="text-black-3 font-InterLight font-16">
                          Rental dates: {moment(product.start_date).format("MM/DD/YYYY")} - {moment(product.end_date).format("MM/DD/YYYY")}
                        </p>
                      </div>
                      <div>
                        <span className="text-black-3 font-InterLight font-16"> {
                          !shipToAddress &&
                            zipCode.zip_code != "" &&
                            notAvailableZipcodes.includes(product.location_id)
                            ? (<><img src="/media/images/noPickUp.png" /> <span>This item is not available for local pickup at</span></>) :
                            "This item is available for local pickup at"} <a className='text-brown text-decoration-none'>
                            {!shipToAddress &&
                              zipCode.zip_code != "" &&
                              notAvailableZipcodes.includes(product.location_id) ?
                              zipCode.zip_code + ` (${zipCode.selected_mile} miles)` :
                              product.location_id}. </a></span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-sm-2 mt-3 mt-sm-0 text-end d-flex flex-sm-column justify-content-between">
                  <h1 className="text-black-3 font-InterRegular font-20">
                    ${product.amount}
                  </h1>

                  <span>
                    <img
                      src="/media/images/delete.png"
                      className="cursor-pointer img-fluid"
                      onClick={() => {
                        setModalType("reomoveProduct");
                        setShowModal(true);
                        setCurrentProduct(product);
                      }}
                    />
                  </span>
                </div>
              </div>
            );
          })}

          {isEmpty && (
            <div className="row justify-content-center my-5">
              <div className="col-12 text-center">
                <h1 className="text-black font-25 text-uppercase font-InterRegular">
                  Shopping cart is empty
                </h1>
                <p className="text-black font-20 font-InterLight mt-3">But it's never too late to fix that</p>
                <Link className="text-brown font-18 font-InterRegular text-uppercase" to={{ pathname: "/products" }}>Back to shop</Link>
              </div>
            </div>
          )}

          {!isEmpty && (
            <div className="row justify-content-center mt-4">
              <div className="col-12 text-end">
                <h1 className="text-black-3 font-26 font-InterRegular">
                  Subtotal:{" "}&nbsp;
                  <span className="text-black-3 font-26 font-InterRegular">
                    ${subtotal}
                  </span>
                </h1>
                <p className="text-black-3 font-InterRegular font-18 mb-0 mt-3">This cart includes products which</p>
                <p className="text-black-3 font-InterRegular font-18">require fees of <span className="text-brown font-InterLight">$5.00 USD</span> </p>
              </div>

              {!shipToAddress && zipCode.zip_code != "" && notAvailableZipcodes.length > 0 && <div className="col-12 col-lg-11 text-center mb-5">
                <p className="text-black font-20 font-InterRegular mt-3">
                  <i>You have selected Local Pick Up as your delivery method. One or more items in your cart are not avaliable for local pickup at the given zipcode and radius. To continue checking out, please save this item and remove it from your cart, and place a new order with just this item and select shipping as your delivery method.</i>
                </p>
              </div>
              }

              <div className="col-12 col-sm-6 mt-4">
                <Link
                  className="btn cus-React-btn px-3 text-uppercase rounded shadow-none"
                  to={"/products"}
                >
                  Back to shop
                </Link>
              </div>
              <div className="col-12 col-sm-6 text-sm-end mt-4">
                <button
                  className="btn text-black cus-React-btn text-uppercase rounded shadow-none"
                  onClick={() => {
                    history.push({ pathname: "/checkout", state: { isCheckout: true, isLocalPickUp: !shipToAddress, zipCode: zipCode } });
                  }}
                  disabled={shipToAddress ? false : zipCode.zip_code != "" && !notAvailableZipcodes.length > 0 ? false : true}
                >
                  Check out
                </button>
              </div>
            </div>
          )}

          {(!isEmpty && shipToAddress) && <div className="row justify-content-center my-5 pt-5">
            <div className="col-12 col-lg-10 text-center">
              <h1 className="text-brown font-CambonRegular font-30 text-uppercase">
                Shipping Policy
              </h1>
              <p className="text-black font-18 font-InterLight mt-3">
                Shipping options include both shipping and local pick up. We
                provide free returns on all orders that are shipped. Please do
                not select local pickup if you are not based in the same area
                as the product your are renting from. Local pick up is for{" "}
                <span className="text-brown">same city only.</span>{" "}
                Please chat Reactif you have any questions!
              </p>
            </div>
          </div>
          }
        </div>

        {shipToAddress && <div className="container py-5">
          <div className="row">
            <div className="col-12">
              <h1 className="text-brown font-CambonRegular font-35 text-uppercase line-before">
                YOU MAY ALSO LIKE
              </h1>
            </div>
            <div className="col-12">
              <div className="row">
                {featuredata?.map((item, index) => (
                  <div className="col-12 col-md-6 col-lg-4 col-xl-3 mt-4" key={index}>
                    <SingleProduct
                      showActiveIcon={false}
                      productData={item}
                      img={item.ProductImages[0]?.image_url}
                      title={item.title}
                      price={item?.rental_fee["2weeks"]}
                      onClick={() => onProductClick(item)}
                      showStatus={false}
                      isFavorite={favorites ? favorites.includes(item.id) : false}
                      addToFavoritesHandler={addToFavoritesHandler}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        }
      </section>

      <Modal
        size="lg"
        centered="true"
        show={showModal}
        onHide={() => {
          setShowModal(false);
        }}
        style={{ opacity: 1 }}
      >
        {showModal && renderModalBody()}
      </Modal>
    </>
  );
}

export default withRouter(Cart);
