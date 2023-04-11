import React, { useState, useEffect, useRef, useContext } from "react";
import { withRouter, useLocation, useHistory, Link } from "react-router-dom";
import FilterProduct from "../../../components/Common/FilterProduct";
import TitleComponent from "../../../components/Common/TitleComponent";
import {
  getProductList,
  getProductDetails,
  addToCartAPI,
  getCartList,
  getUserProfile,
  featuredRentals, addToFavorites, getFavorites, removeFromCartAPI, searchProducts
} from "../../crud/auth.crud";
import { CircularProgress } from "@material-ui/core";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ExpandMore } from "@material-ui/icons";
import DatePicker, { getAllDatesInRange, DateObject, Calendar } from "react-multi-date-picker";
import { Modal, Button } from "react-bootstrap";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormControl,
} from "@material-ui/core";
import { showToast } from "../../../utils/utils";
import moment from "moment";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { addToCart, removeFromCart } from "../../../redux/actions/cartAction";
import Pagination from "../../../components/Common/Pagination";
import { dispatchLogout } from "../../../redux/actions/authAction";
import {
  addSearchProduct,
  removeSearchProduct,
} from "../../../redux/actions/searchProductAction";
import {
  addSearchText,
  deleteSearchText,
} from "../../../redux/actions/searchTextAction";

import SingleProduct from "../../../components/Common/SingleProduct";
import { addFavorite, removeFavorite } from "../../../redux/actions/favoriteAction";

function ProductDetails(props) {
  const locationHistory = useLocation();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState(null);
  const [productId, setProductId] = useState(null);
  const [availability_status, setAvailabilityStatus] = useState("ship");
  const [size, setSize] = useState(null);
  const [color, setColor] = useState(null);
  const [values, setValues] = useState([
    new DateObject().add(3, "days"),
    new DateObject().add(3, "days")
  ]);
  const [allDates, setAllDates] = useState([])
  const [rentalDateError, setRentalDateError] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [pickupAddress, setPickupAddress] = useState("");
  const [showPickup, setShowPickup] = useState(false);
  const [fromPages, setFromPage] = useState("");
  const [activeImage, setActiveImage] = useState("");
  const [productCount, setProductCount] = useState(0);
  const [activePage, setActivePage] = useState(1);
  const [limit, setlimit] = useState(4);
  const [isLocalPickup, setIsLocalPickup] = useState({ zip_code: "", selected_mile: "" });
  const [minDate, setMinDate] = useState(new Date());
  const [maxDate, setMaxDate] = useState(new Date());
  const [rentalFee, setRentalFee] = useState("");
  const [weeklyPrice, setWeeklyPrice] = useState({
    "2weeks": "",
    "3weeks": "",
    "4weeks": "",
    "5weeks": "",
    "6weeks": ""
  });
  const [rentalPeriod, setRentalPeriod] = useState(2);
  // const [searchedText, setSearchedText] = useState("");
  const [featuredata, setFeatureData] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [blackoutDatesRange, setBlackoutDatesRange] = useState([]);
  const [rentalDatesRange, setRentalDatesRange] = useState([]);
  const [dateIncludeError, setDateIncludeError] = useState(false);
  const [dateBuffer, setDateBufferError] = useState(false);
  const [rentalDateIncludeError, setRentalDateIncludeError] = useState(false);
  const [modalType, setModalType] = useState("");
  const [replaceData, setReplaceData] = useState([]);
  const calendarRef = useRef();
  const [expanded, setExpanded] = useState(true);
  const [isCart, setIsCart] = useState(false);
  const [data, setData] = useState({});
 

  const { authToken, userid, authUser } = useSelector(
    ({ auth }) => ({
      authToken: auth?.user?.token,
      userid: auth?.user?.id,
      authUser: auth?.user,
    }),
    shallowEqual
  );


  const handleChange = (event, isExpanded) => {
    setExpanded(!expanded);
  };

  const { favoritesId } = useSelector(
    ({ favoriteReducer }) => ({
      favoritesId: favoriteReducer.favorites
    }),
    shallowEqual
  );

  const getDatesInRange = (startDate, endDate) => {
    startDate = new Date(startDate);
    endDate = new Date(endDate);
    const date = new Date(startDate.getTime());

    const dates = [];

    while (date <= endDate) {
      dates.push(moment(new Date(date)).format("DD/MM/YYYY"));
      date.setDate(date.getDate() + 1);
    }

    return dates;
  }

  useEffect(() => {
    getFavoritesHandler();
  }, [favoritesId]);

  const getProductsList = async () => {
    await getProductList("", "", "", "", "", "", "", limit, activePage, [])
      .then((result) => {
        setFeatureData(
          result.data.payload ? result.data.payload.data.rows : []
        );
        setProductCount(result.data.payload ? result.data.payload.data.count : 0);
      })
      .catch((errors) => {
        setFeatureData([]);
        // showToast("error", errors);
      });
  };

  useEffect(() => {
    getProductsList();
  }, [limit, activePage]);

  const onProductClick = (item) => {
    history.push({ pathname: `/product-details/abc_jhf_${item.id}`, state: { productId: item.id } });
  }

  const getPickupLocation = async (user_id) => {
    await getUserProfile(authToken, user_id).then((data) => {
      let address = data.data.payload.data.ShippingAddress[0]?.address;
      setPickupAddress(address);
    })
  }

  useEffect(() => {
    let productid;
    if (locationHistory && locationHistory.state) {
      const { productId, fromPage, isLocalPickup } = locationHistory.state;
      productid = productId
      fetchCartDetails(productId);
      setFromPage(fromPage ? fromPage : "");
      setIsLocalPickup(isLocalPickup);
      if(fromPage === "search"){
        const { searchText, filtersObj, filtersObjOnPage } = locationHistory.state;
        if(searchText !== "") {
          console.log("filtersObj : ", filtersObj);
          console.log("filtersObjOnPage : ", filtersObjOnPage)
          window.onpopstate = e => {
            history.push({ pathname: "/search", state: { searchedText: searchText, filtersObj: filtersObj, filtersObjOnPage: filtersObjOnPage } });
          }
        }
      } else if (fromPage === "product") {
        const { filtersObj, filtersObjOnPage } = locationHistory.state;
        window.onpopstate = e => {
          history.push({ pathname: "/products", state: { filtersObj: filtersObj, filtersObjOnPage: filtersObjOnPage } });
        }
      } else {
        window.onpopstate = e => {}
      }
    } else {
      let url = history.location.pathname;
      const index = url.lastIndexOf("_");
      productid = url.slice(index + 1);
    }

    setProductId(productid);
    setLoading(true);

    getProductDetails(productid)
      .then(async (result) => {
        if (result.status === 200) {
          if (result.data.payload.data && result.data.payload.data != "") {
            var data = result.data.payload.data;
            setProductData(result.data.payload.data);
            setActiveImage(result.data.payload.data?.ProductImages[0]?.image_url)
            var sizeD = data?.ProductAttributes?.filter(
              (it) => it.meta_type === "Size"
            );
            setSize(sizeD);
            var colorD = data?.ProductAttributes?.filter(
              (it) => it.meta_type === "Color"
            );
            let colors = [];
            colorD.map(val => colors.push(val.meta_value));
            setColor(colors);
            // let rentalObj = JSON.parse(data.rental_fee);
            setWeeklyPrice({ ...data.rental_fee });
            if (authToken) {
              getPickupLocation(data.user_id);
            }
            if (data.User.BlackoutDates) {
              let exsitingDates = [];
              await data.User.BlackoutDates.map(val => {
                let dates = getDatesInRange(val.start_date, val.end_date);
                exsitingDates = [...exsitingDates, ...dates];
              })
              setBlackoutDatesRange([...exsitingDates]);
            }

            let rentalDatesArr = [...result.data.payload.rentalDates];
            if(rentalDatesArr.length > 0) {
              let exsitingDates = [];
              await rentalDatesArr.map(val => {
                let start_date = val.start_date;
                let end_date = val.end_date;
                if(val.shipping_type.zip_code === "") {
                  start_date = moment(new Date(val.start_date)).subtract(7, "days");
                  end_date = moment(new Date(val.end_date)).add(7, "days");
                } else {
                  start_date = moment(new Date(val.start_date)).subtract(7, "days");
                  end_date = moment(new Date(val.end_date)).add(5, "days");
                };
                let dates = getDatesInRange(start_date, end_date);
                exsitingDates = [...exsitingDates, ...dates];
              });
              setRentalDatesRange([...exsitingDates]);
            }
          } else {
            history.push("/*/")
          }
        }
      })
      .catch((err) => {
        // showToast("error", err);
      });

  }, [locationHistory]);

  const dispatch = useDispatch();

  const { cartDetails } = useSelector(
    ({ cartReducer }) => ({ cartDetails: cartReducer.cart }),
    shallowEqual
  );

  const getSearchProducts = (values) => {
    let categoryType = "";
    let occasionType = "";
    let localPickUp = "";

    if (values.type === "Clothing") {
      categoryType = [values.searchText]
    } else if (values.type === "Occasion") {
      occasionType = [values.searchText]
    } else if (values.type === "City for Local Pickup") {
      localPickUp = values.searchText
    }

    searchProducts(values.searchText, "", "", "", "", "", "", "", "", categoryType, occasionType, localPickUp)
      .then((result) => {
        setData(result.data);
        dispatch(addSearchText(values.searchText));
        dispatch(
          addSearchProduct(
            result.data.payload ? result.data.payload.data.rows : [],
            values.searchText,
            values.type
          )
        );
        
        history.push({ pathname: "/search" });
      })
      .catch((err) => {
        setData([]);
      });
  };

  const fetchCartDetails = async (productid) => {
    let cart = [];
    if (authToken) {
      await getCartList(authUser.token, authUser.id)
        .then(async (result) => {
          let data = result.data.postdata.data;
          cart = [...data];

        }).catch((errors) => {
          let error_status = errors.response.status;
          if (error_status == 401) {
            dispatch(dispatchLogout());
            history.push("/account/login");
          }
          if (error_status !== 401) {
          }
        });
    } else {
      if (cartDetails.length > 0) {
        cart = [...cartDetails];
      }
    }
    if (cart.length > 0) {
      await cart.map((val) => {
        if (val.product_id === productid) {
          let dateVal = [new DateObject(new Date(val.start_date)), new DateObject(new Date(val.end_date))];
          setValues(dateVal)
          setAllDates(getAllDatesInRange(dateVal));
          setIsCart(true)
        }
      });
    }
  }

  useEffect(() => {
    if(!authToken && productId) {
      fetchCartDetails(productId)
    }
  },[cartDetails, weeklyPrice,productId])
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
          getProductsList();
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
        data = [productData];
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

  const handleSubmit = async () => {
    if (rentalFee === "") {
      calendarRef.current.scrollIntoView({ block: 'end', behavior: 'smooth' });
      if (!dateIncludeError && !rentalDateIncludeError) {
        setRentalDateError(true); 
        setExpanded(true);        
      }
      if ((dateIncludeError || rentalDateIncludeError || dateBuffer)) {
        setExpanded(true);        
      }
    } else {
      setRentalDateError(false);
      let productObj = {
        // ...productData,
        seller_id: productData.user_id,
        amount: rentalFee,
        color: color?.join(", "),
        quantity: 1,
        size: size && size[0]?.meta_value,
        title: productData.title,
        image_url: productData?.ProductImages[0]?.image_url,
        product_id: productData.id,
        rental_period: rentalPeriod,
        shipping_type: JSON.stringify(isLocalPickup),
        location_id: productData.location_id,
        start_date: moment(new Date(allDates[0])).format("MM/DD/YYYY"),
        end_date: moment(new Date(allDates[allDates.length - 1])).format("MM/DD/YYYY"),
      };

        setModalType("AddedToCartPopup");
        setShowModal(true);
        dispatch(addToCart(productObj));
      // }
    }
  };

  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    speed: 1000,
    arrows: false,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  const [showModal, setShowModal] = useState(false);

  const setRentalFeeHandler = () => {
    let len = allDates.length;
    if (len >= 1 && len <= 14) {
      setRentalFee(weeklyPrice["2weeks"]);
      setRentalPeriod(2);
    } else if (len >= 15 && len <= 21) {
      setRentalFee(weeklyPrice["3weeks"]);
      setRentalPeriod(3);
    } else if (len >= 22 && len <= 28) {
      setRentalFee(weeklyPrice["4weeks"]);
      setRentalPeriod(4);
    } else if (len >= 29 && len <= 35) {
      setRentalFee(weeklyPrice["5weeks"]);
      setRentalPeriod(5);
    } else if (len >= 36 && len <= 42) {
      setRentalFee(weeklyPrice["6weeks"]);
      setRentalPeriod(6);
    } else {
      setRentalFee("");
      setRentalPeriod(2);
    }
  }

  useEffect(() => {
    let startDate = new Date(values[0]);
    let endDate = new Date(values[1]);
    if (startDate.getDate() && endDate.getDate()) {
      setRentalDateError(false);
      if (allDates.length > 0) {
        setRentalFeeHandler();
      }
    } else {
      setRentalDateError(true);
      setRentalFee("");
      setRentalPeriod(2);
    }
    // if (!dateIncludeError) {
    //   setRentalDateError(true);
    // }
    let exist = false;
    let existDate = false
    allDates.map(val => {
      let dt = moment(new Date(val)).format("DD/MM/YYYY");
      if (blackoutDatesRange.includes(dt)) {
        exist = true;
      }
    });
    allDates.map(val => {
      let dt = moment(new Date(val)).format("DD/MM/YYYY");
      if (rentalDatesRange.includes(dt)) {
        existDate = true;
      }
    });

    let date = new Date();
    date.setDate(date.getDate() + 3);
    let stDate = new Date(allDates[0]);
    let buffer = false;
    if (stDate < date) {
      buffer = true;
    }

    if (exist || buffer || existDate) {
      setRentalFee("");
    }
    setDateBufferError(buffer);
    setDateIncludeError(exist);
    setRentalDateIncludeError(existDate);

  }, [values]);

  useEffect(() => {
    let date = new Date();
    date.setDate(date.getDate() + 4);
    setMinDate(date);
    let max = new Date();
    max.setDate(max.getDate() + 186);
    setMaxDate(max);
  }, []);

  const handleAddToCart = async () => {
    if (rentalFee === "") {
      calendarRef.current.scrollIntoView({ block: 'end', behavior: 'smooth' });
      if (!dateIncludeError && !rentalDateIncludeError) {
        setRentalDateError(true);
        setExpanded(true);
      }
      if ((dateIncludeError || rentalDateIncludeError || dateBuffer)) {
        setExpanded(true);        
      }
    } else {
      setRentalDateError(false);
      const data = {
        product_id: productId,
        user_id: userid,
        seller_id: productData.user_id,
        amount: rentalFee,
        color: color?.join(", "),
        size: size[0]?.meta_value,
        quantity: 1,
        rental_period: rentalPeriod,
        shipping_type: JSON.stringify(isLocalPickup),
        start_date: moment(new Date(allDates[0])).format("MM/DD/YYYY"),
        end_date: moment(new Date(allDates[allDates.length - 1])).format("MM/DD/YYYY"),
      };

          await addToCartAPI(authToken, data)
            .then(() => {
              getCartList(authUser.token, authUser.id)
                .then((result) => {
                  let count = result?.data?.postdata?.data?.length
                  setCartCount(count);
                  setModalType("AddedToCartPopup");
                  setShowModal(true);
                })
            })
            .catch((errors) => {
              let error_status = errors.response.status;
              if (error_status == 401) {
                handleSubmit();
                dispatch(dispatchLogout());
              }
              if (error_status !== 401) {
                // showToast("error", errors);
              }
            });
    
    }
  };

  const onRemove = async (product_id) => {
    const data = {
      user_id: authUser.id,
      product_id: product_id
    };
    await removeFromCartAPI(authToken, data)
      .catch((errors) => {
        let error_status = errors.response.status;
        if (error_status !== 401) {
          // showToast("error", errors);
        }
      });
  };

  const replaceProductHandler = async () => {
    let data = [...replaceData];
    let promiseArray = [];

    if (authToken) {
      for (let i = 0; i < data.length; i++) {
        promiseArray.push(await onRemove(data[i].product_id));
      }
    } else {
      promiseArray.push(await dispatch(removeFromCart("")));
    }
    Promise.all(promiseArray).then(async () => {
      if (authToken) {
        await handleAddToCart();
        setShowModal(false);
        setModalType("");
      } else {
        let productObj = {
          // ...productData,
          seller_id: productData.user_id,
          amount: rentalFee,
          color: color?.join(", "),
          quantity: 1,
          size: size && size[0]?.meta_value,
          title: productData.title,
          image_url: productData?.ProductImages[0]?.image_url,
          product_id: productData.id,
          rental_period: rentalPeriod,
          shipping_type: JSON.stringify(isLocalPickup),
          location_id: productData.location_id,
          start_date: moment(new Date(allDates[0])).format("MM/DD/YYYY"),
          end_date: moment(new Date(allDates[allDates.length - 1])).format("MM/DD/YYYY"),
        };
        dispatch(addToCart(productObj));
        setModalType("AddedToCartPopup");
        setShowModal(true);
      }
    }).catch(() => {
      setShowModal(false);
      setModalType("");
    })
  }

  const renderModalBody = () => {
    if (modalType === "AddedToCartPopup") {
      return (
        <div>
          <Modal.Header className="bg-light-gray border-0">
            <Button className="border-0 ms-auto bg-transparent btn btn-primary" onClick={() => {
              setShowModal(false);
              setModalType("");
            }}>
              <img src="/media/images/X.svg" className="w-20px" />
            </Button>
          </Modal.Header>

          <Modal.Body className="bg-light-gray pt-0 pm-3">
            <div className="row">
              <div className="col-12 col-md-4 col-lg-3">
                <div>
                  {/* {productData?.ProductImages.map((item, index) => ( */}
                  <img
                    src={productData?.ProductImages[0]?.image_url}
                    className="img-fluid d-block mx-auto w-100 br-20"
                  />
                  {/* // ))} */}
                </div>
              </div>
              <div className="col-12 col-md-8 col-lg-9">
                <div>
                  <h1 className="font-CambonBold font-22 text-black">
                    {productData?.title}
                  </h1>
                  <p className="font-InterLight font-18 text-black">
                    Shipping from {productData?.User.first_name}’s product
                  </p>
                  <p className="font-InterLight font-18 text-black">
                    Rental period: {rentalPeriod} weeks
                  </p>
                  <p className="font-InterLight font-18 text-black">
                    Rental dates: {moment(new Date(allDates[0])).format("MM/DD/YYYY")} - {" "}
                    {moment(new Date(allDates[allDates.length - 1])).format("MM/DD/YYYY")}
                  </p>
                  <p className="font-InterLight font-18 text-black">
                    Size: {size && size[0]?.meta_value}
                  </p>
                  <h1 className="font-InterBold font-20 text-black">
                    ${rentalFee}
                  </h1>
                </div>
              </div>
            </div>
            <div className="row align-items-center pb-5">

              <div className="col-12 mt-3">
                <button
                  className="btn cus-React-btn px-5 d-block mx-auto shadow-none min-w-275"
                  onClick={() => {
                    setShowModal(false);
                    history.push({ pathname: "/cart" });
                  }}
                >
                  Go to Cart
                </button>
                <button
                  className="btn cus-React-btn bg-black mt-2 px-5 d-block mx-auto shadow-none min-w-275"
                  onClick={() => {
                    history.push("/products");
                  }}
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          </Modal.Body>
        </div>
      );
    } else if (modalType === "NotSameSeller") {
      return (
        <div>
          <Modal.Header className="mt-0 font-18 font-InterRegular text-black-3">
            Product from different seller
            <Button className="border-0 ms-auto bg-transparent btn btn-primary" onClick={() => {
              setShowModal(false);
              setModalType("");
            }}>
              <img src="/media/images/X.svg" className="w-20px" />
            </Button>
          </Modal.Header>
          <Modal.Body className="py-5">
            <h4 className="text-center font-InterLight font-18 text-black-3">
              You can't get a product from more than one rotator at a time yet.
            </h4>
            <h5 className="text-center font-InterLight font-18 text-black-3">
              Would you like to replace existing product with this product?
            </h5>
          </Modal.Body>
          <Modal.Footer>
            <Button
              className="btn bg-transparent shadow-none border-0 font-InterRegular font-18 text-brown px-3"
              onClick={() => {
                setShowModal(false);
                setModalType("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                replaceProductHandler();
              }}
              className="btn cus-React-btn px-3 py-2"
            >
              Replace
            </Button>
          </Modal.Footer>
        </div>
      );
    }
  };

  return (
    <>
      <TitleComponent title={props.title} icon={props.icon} />
      <section className="bg-light-gray py-5">
        <div className="container">
          <div className="row">
            <div className="col-12 col-lg-6 ps-lg-0">
              <div className="row">
                <div className="col-12 col-lg-3 order-2 order-lg-1 mt-3 mt-lg-0">
                  <div className="row flex-nowrap flex-lg-wrap overflow-auto mh-500 cus-scroll">
                    {productData?.ProductImages?.map((item, index) => (
                      <div className="col-4 col-lg-12  product-image-slider-style" key={index}>
                        <img
                          src={item.image_url}
                          className={`img-fluid d-block mx-auto w-100 px-2 px-lg-0 ${index != 0 && "mt-lg-3"} ${activeImage == item.image_url && 'border-black'}`}
                          onClick={() => setActiveImage(item.image_url)}
                        />
                      </div>
                    ))}

                  </div>
                </div>
                <div className="col-12 col-lg-9 order-1 order-lg-2">
                  <div>
                    {activeImage != "" && (
                      <div>
                        <div className="text-left">
                          <img
                            src={activeImage}
                            className="img-fluid mh-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {(authUser?.id !== productData?.user_id) && <div className="d-flex align-items-center mt-2">
                    {(!favorites || !favorites.includes(productData?.id)) && <img src="/media/images/heart.svg" className={`heart-empty text-black-3 heart-product-details cursor-pointer`} onClick={() => {
                      if (favorites && favorites.includes(productData?.id)) {
                        addToFavoritesHandler(productData?.id, 0, true);
                      } else {
                        addToFavoritesHandler(productData?.id, 1, true);
                      }
                    }} />}
                    {authUser?.id !== productData?.user_id && <img src="/media/images/heartfilled.svg" className={`heart-filled text-black-3 heart-product-details cursor-pointer ${(!favorites || !favorites.includes(productData?.id)) ? "d-none" : "d-block"}`} onClick={() => {
                      if (favorites && favorites.includes(productData?.id)) {
                        addToFavoritesHandler(productData?.id, 0, true);
                      } else {
                        addToFavoritesHandler(productData?.id, 1, true);
                      }
                    }} />}
                    <p className="font-16 text-black-3 font-InterLight ms-2 mb-0">Add to favorites</p>
                  </div>}

                </div>
              </div>
            </div>
            <div className="col-12 col-lg-6 mt-4 mt-lg-0">
              <div className="row mx-0">
                <div className="col-12">
                  <h1 className="font-CambonRegular font-25 text-black-3 mb-0">
                    {productData?.title}
                  </h1>
                </div>
                <div className="col-12 col-sm-6 mt-3">
                  <p className="font-InterLight font-14 text-black-3">
                    From ${productData?.rental_fee["2weeks"]} USD
                  </p>
                  <p className="font-InterLight font-16 text-black-3 cursor-pointer"
                   onClick={() => {
                    getSearchProducts({ searchText: productData?.User?.first_name, type: productData?.User?.title })
                  }}>
                    {productData?.User?.first_name}’s product
                    
                  </p>
                </div>
                <div className="col-12 col-sm-6 mt-3">
                  <div className="d-flex align-items-center">
                    <img src="/media/images/location-logo.svg" className="w-20px ms-2 cus-tooltop-btn" />
                    <p className="font-InterExtraLight font-18 mb-0 ms-2 text-black-3">
                      {productData?.location_id}
                    </p>
                  </div>
                </div>
                <div className="col-12 pt-3">
                  <ul className="navbar-nav cus-product-detail-accordion font-InterExtraLight">
                    <Accordion defaultExpanded={true}>
                      <AccordionSummary
                        expandIcon={<ExpandMore />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                      >
                        <Typography className="font-InterRegular font-18 text-color-3 text-uppercase">Description</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography>
                          <p className="font-InterLight text-black-3 font-18">
                            {productData?.description}
                          </p>
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                    <Accordion defaultExpanded={true}>
                      <AccordionSummary
                        expandIcon={<ExpandMore />}
                        aria-controls="panel2a-content"
                        id="panel3a-header"
                      >
                        <Typography className="font-InterRegular font-18 text-color-3">DETAILS</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography>
                          <div className="row">
                            {size?.map((item) => (
                              <div className="col-12" key={item.meta_value}>
                                <span className="text-black-3 font-16 font-InterRegular text-nowrap">SIZE: </span>
                                <span className="text-black-3 font-16 font-InterExtraLight text-nowrap">
                                  {item.meta_value}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="row mt-2">
                            <div className="col-12" key={"colorData"}>
                              <span className="text-black-3 font-16 font-InterRegular text-nowrap">COLOR: </span>
                              <span className="text-black-3 font-16 font-InterExtraLight text-nowrap">
                                {color ? color?.join(", ") : ""}
                              </span>
                            </div>
                          </div>
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                    {((userid && userid !== productData?.user_id) || (!userid)) && <Accordion expanded={expanded} onChange={() => handleChange()}>
                      <AccordionSummary
                        expandIcon={<ExpandMore />}
                        aria-controls="panel2a-content"
                        id="panel5a-header"
                      >
                        <Typography className="font-InterRegular font-18 text-color-3">RENTAL DATES</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography>
                          <div className="row">
                            <div className="col-12 py-3" ref={calendarRef}>
                              {rentalDateError && (
                                <div className="text-danger">
                                  Please select the rental dates
                                </div>
                              )}
                              {!rentalDateError && !dateBuffer && !rentalDateIncludeError && dateIncludeError && (
                                <div className="text-danger">
                                  The range you selected includes the product blackout dates
                                </div>
                              )}
                              {!rentalDateError && !dateBuffer && !dateIncludeError && rentalDateIncludeError && (
                                <div className="text-danger">
                                  Product is not available on the selected range
                                </div>
                              )}
                              {!rentalDateError && dateBuffer && (
                                <div className="text-danger">
                                  Please select a rental start date 4 days from today
                                </div>
                              )}
                              <div className="col-12 text-center cus-calendar-input product-detail-calendar">
                                <Calendar
                                  mapDays={(({ date, today, selectedDate, currentMonth, isSameDate }) => {
                                    let props = {};
                                    if (blackoutDatesRange.includes(date.format("DD/MM/YYYY"))) {
                                      props.disabled = true
                                    }
                                    if (rentalDatesRange.includes(date.format("DD/MM/YYYY"))) {
                                      props.disabled = true
                                    }
                                    return props;
                                  })}
                                  value={values}
                                  onChange={dateObjects => {
                                    setValues(dateObjects)
                                    setAllDates(getAllDatesInRange(dateObjects))
                                  }}
                                  range
                                  className="cus-calendar"
                                  minDate={minDate}
                                />
                              </div>
                            </div>
                          </div>
                        </Typography>
                      </AccordionDetails>
                    </Accordion>}
                  </ul>
                </div>

                {((userid && userid !== productData?.user_id) || (!userid)) && <div className="col-12 mt-3">
                  <Typography className="font-InterRegular font-18 text-color-3">RETAIL PRICE</Typography>
                  <h2 className="font-InterRegular font-26 text-black-3 mb-0">
                    ${productData?.retail_price}
                  </h2>
                </div>}
                {((userid && userid !== productData?.user_id) || (!userid)) && <div className="col-12 mt-3">
                  <Typography className="font-InterRegular font-18 text-color-3">RENTAL PRICE</Typography>
                  {rentalFee !== "" ? <span className="font-InterRegular font-26 text-black-3 mb-0">
                    {rentalFee !== "" && `$${rentalFee}`}
                  </span> : <span className="text-black-3 font-16 font-InterLight">
                    Please select valid rental dates to get the cost and add this to your cart.
                  </span>}

                </div>}
              </div>

              <div className="row mx-0 mt-4">
                <div className="col-12 text-end">
                  {userid && userid === productData?.user_id ? <></> : <button
                    className="btn cus-modal-btn py-2 px-5 w-100 shadow-none"
                    onClick={(e) => {
                      if (authToken) {
                        handleAddToCart();
                      } else {
                        handleSubmit();
                      }
                    }}
                    disabled={productData?.availability_status === 0 ? true : false}
                  >
                    {(productData?.availability_status !== 0 ? isCart ? 'Update Cart ' : `Add to Cart ` : `Not Available `)}
                  </button>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container my-5">
          <div className="row">
            <div className="col-12">
              <h1 className="text-brown font-CambonRegular font-35 text-uppercase line-before">
                Featured Rentals
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
            {productCount > 0 && <div className="d-flex justify-content-center align-items-center py-5 cus-pagination">
              <Pagination
                className="pagination-bar"
                currentPage={activePage}
                totalCount={productCount}
                pageSize={limit}
                onPageChange={page => setActivePage(page)}
                productDetailed={true}
              />
            </div>}
          </div>
        </div>
      </section>

      <Modal
        size="lg"
        centered="true"
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setModalType("");
        }}
        style={{ opacity: 1 }}
      >
        {showModal && renderModalBody()}
      </Modal>
    </>
  );
}

export default withRouter(ProductDetails);
