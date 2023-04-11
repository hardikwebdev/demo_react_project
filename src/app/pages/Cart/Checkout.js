import React, { useState, useEffect, useRef } from "react";
import { withRouter, useHistory, useLocation } from "react-router-dom";
import TitleComponent from "../../../components/Common/TitleComponent";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import { ChevronRight, ExpandMore } from "@material-ui/icons";
import { Stack, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Formik } from "formik";
import { FormGroup, FormControlLabel, Checkbox, TextField, RadioGroup, Radio, FormControl, InputLabel, Select, MenuItem, CircularProgress } from "@material-ui/core";
import { checkout, getCartList, getUserProfile, addCard, getCards, order, orderDetails } from "../../crud/auth.crud";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { showToast } from "../../../utils/utils";
import * as Yup from "yup";
import { dispatchLogout } from "../../../redux/actions/authAction";
import { saveCheckoutData, removeCheckoutData } from "../../../redux/actions/checkOutAction";
import moment from "moment";
import { Modal } from "react-bootstrap";
import CryptoJS from "crypto-js";
import { trackWindowScroll } from "react-lazy-load-image-component";
import { useBeforeunload } from 'react-beforeunload';

function Checkout(props) {
  const locationHistory = useLocation();
  const history = useHistory();
  const [shippingAddress, setShippingAddress] = useState({
    address: "",
    appartment: "",
    country: "",
    state: "",
    zip_code: "",
    phone_number: "",
  });
  const [showPickup, setShowPickup] = useState(false);
  const [shippingType, setShippingType] = useState("ship");
  const [isChecked, setIsChecked] = useState(false);
  const [isBillingAddressSame, setBillingAddressSame] = useState(false);
  const [card, setCard] = useState("");
  const [subtotal, setSubtotal] = useState(0);
  const [rentalFee, setRentalFee] = useState(5);
  const [shippingCharge, setShippingCharge] = useState(0);
  const [salesTax, setSalesTax] = useState(8.43);
  const [sortedCart, setSortedCart] = useState({});
  const [sortedWithDate, setSortedWithDate] = useState({});
  const [cards, setCards] = useState([]);
  const [activeCard, setActiveCard] = useState({
    name: "",
    cardNumber: "",
    expirationDate: "",
    cardCvc: "",
    zipCode: ""
  });
  const [updateCard, setUpdateCard] = useState(false);
  const [isLocalPickUp, setIsLocalPickUp] = useState(false);
  const [zipCode, setZipcode] = useState({ zip_code: "", selected_mile: "" });
  const [isPreview, setIsPreview] = useState(false);
  const [billingAddress, setBillingAddress] = useState({
    address: "",
    appartment: "",
    country: "",
    state: "",
    zip_code: "",
    phone_number: "",
  });
  const [selectedCard, setSelectedCard] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [cardErrorMsg, setCardErrorMsg] = useState("");
  const [cardLoading, setCardLoading] = useState(false);
  const [order_id, setOrderId] = useState("");
  const [placeLoading, setPlaceLoading] = useState(false);
  const [sippingServiceErr, setShippingServiceErr] = useState("");
  const [formACleared, setFormACleared] = useState(false);
  const [formBCleared, setFormBCleared] = useState(false);
  const [productNotAvailable, setProductNotAvailable] = useState(false);
  const [sellerCount, setSellerCount] = useState(0);

  const formRefA = useRef();
  const formRefB = useRef();
  const dispatch = useDispatch();

  const { authToken, authUser } = useSelector(
    ({ auth }) => ({
      authToken: auth?.user?.token,
      authUser: auth?.user,
    }),
    shallowEqual
  );

  const { checkOutReducer } = useSelector(
    ({ checkOutReducer }) => ({ checkOutReducer: checkOutReducer }),
    shallowEqual
  );

  const states = [];

  const getCard = async () => {
    await getCards(authToken, authUser.id).then(result => {
      let cardsData = result.data.cards;
      setCards(cardsData);
      if (cardsData.length > 0) {
        let id = cardsData[0].id;
        setCard(id);
        setSelectedCard(cardsData[0]);
      }
    })
  }

  const sortDetails = async (data) => {
    let obj = {};
    await data.map(val => {
      if (!obj[`"${val.seller_id}"`]) {
        obj[`"${val.seller_id}"`] = [];
      }
      obj[`"${val.seller_id}"`].push(val);
    })
    setSortedCart({ ...obj });

    let tempCount = 0;
    let tepSortObj = {};

    for (let key in obj) {
      let itemsArr = obj[key];
      let temp2Count = 0;
      await itemsArr.map(val => {
        let str = `${moment(val.start_date).format("MM/DD/YYYY")} - ${moment(val.end_date).format("MM/DD/YYYY")}`;
        if (!tepSortObj[str]) {
          tepSortObj[str] = [];
          temp2Count = temp2Count + 1;
        }
      });
      tempCount = temp2Count > 1 ? (temp2Count + tempCount) : (tempCount + 1);
    }

    let dateSortObj = {};
    await data.map(val => {
      let str = `${moment(val.start_date).format("MM/DD/YYYY")} - ${moment(val.end_date).format("MM/DD/YYYY")}`;
      if (!dateSortObj[str]) {
        dateSortObj[str] = [];
      }
      dateSortObj[str].push(val);
    })
    setSortedWithDate({ ...dateSortObj });
    setSellerCount(tempCount);
  }

  const sortOrderDetails = async (data) => {
    let obj = {};
    let cost = 0;
    await data.map(val => {
      cost += val.OrderDetails.amount;
      if (!obj[`"${val.OrderDetails.seller_id}"`]) {
        obj[`"${val.OrderDetails.seller_id}"`] = [];
      }
      val.seller_name = val.sellerAddress.name;
      obj[`"${val.OrderDetails.seller_id}"`].push(val.OrderDetails);
    })
    let tempA = {
      ...sortedCart,
      ...obj
    }
    setSortedCart({ ...tempA });
    setSubtotal(cost);

    let dateSortObj = sortedWithDate;
    await data.map(val => {
      let str = `${moment(val.OrderDetails.start_date).format("MM/DD/YYYY")} - ${moment(val.OrderDetails.end_date).format("MM/DD/YYYY")}`;
      if (!dateSortObj[str]) {
        dateSortObj[str] = [];
      }

      dateSortObj[str].push(val.OrderDetails);
    })

    setSortedWithDate({ ...dateSortObj });
  }

  const getOrderDetails = async (id) => {
    await orderDetails(authToken, id).then((async data => {
      await sortOrderDetails(data.data.postdata.data)
    })).catch(err => {
      console.log("ERROR : ", err)
    })
  }

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

  const cartDetails = async () => {
    await getCartList(authUser.token, authUser.id)
      .then(async (result) => {
        var data = result.data.postdata.data;
        if (data.length > 0) {
          let cost = 0;
          await data.map(async (val) => {
            cost += parseInt(val.rental_fee[`${val.rental_period}weeks`]);
            let rentalDates = val.rentalDates;
            if(rentalDates.length > 0) {
              let exsitingDates = [];
              await rentalDates.map(curVal => {
                let start_date = curVal.start_date;
                let end_date = curVal.end_date;
                if(curVal.shipping_type.zip_code === "") {
                  start_date = moment(new Date(curVal.start_date)).subtract(7, "days");
                  end_date = moment(new Date(curVal.end_date)).add(7, "days");
                } else {
                  start_date = moment(new Date(curVal.start_date)).subtract(7, "days");
                  end_date = moment(new Date(curVal.end_date)).add(5, "days");
                };
                let dates = getDatesInRange(start_date, end_date);
                exsitingDates = [...exsitingDates, ...dates];
                let startDate = moment(new Date(val.start_date)).format("DD/MM/YYYY");
                let endDate = moment(new Date(val.end_date)).format("DD/MM/YYYY");
                if (exsitingDates.includes(startDate) || exsitingDates.includes(endDate)) {
                  setProductNotAvailable(true);
                }
              });
            }
          });
          setSubtotal(cost);
          sortDetails(data);
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
  }

  const getUserProfileDetails = async () => {
    await getUserProfile(authToken, authUser.id)
      .then((result) => {
        let address = result.data.payload ? result.data.payload.data && result.data.payload.data.ShippingAddress : [];
        if (address.length > 0) {
          setShippingAddress({
            address: address[0].address ? address[0].address : "",
            appartment: address[0].appartment ? address[0].appartment : "",
            country: address[0].country ? address[0].country : "",
            state: address[0].state ? address[0].state : "",
            zip_code: address[0].zip_code ? address[0].zip_code : "",
            phone_number: address[0].phone_number ? address[0].phone_number : "",
          });
        };
      })
      .catch((errors) => {
        let error_status = errors.response.status;
        if (error_status !== 401) {
          // showToast("error", errors);
        }
      });
  };

  const placeOrder = async (session_id) => {
    await getCartList(authToken, authUser.id)
      .then(async (result) => {
        var data = result.data.postdata.data;
        let orderArr = [];

        if (data.length > 0) {
          await data.map(val => {
            let curObj = {
              buyer_id: authUser.id,
              seller_id: val.seller_id,
              product_id: val.product_id,
              amount: parseInt(val.rental_fee[`${val.rental_period}weeks`]),
              start_date: val.start_date,
              end_date: val.end_date,
              total_amount: parseInt(val.rental_fee[`${val.rental_period}weeks`]),
              quantity: val.quantity,
              rental_period: val.rental_period,
              shipping_address: "",
              shipping_type: JSON.stringify(checkOutReducer?.zipCode),
              service_type: checkOutReducer?.shippingCharges?.shippingCharge === 10 ? 0 : checkOutReducer?.shippingCharges?.shippingCharge === 15 ? 1 : 0
            }
            orderArr.push(curObj);
          })
        }
        let orderData = {};
        orderData.items = orderArr;
        orderData.shippingCharges = {
          shippingCharge: checkOutReducer?.shippingCharges?.shippingCharge, salesTax: checkOutReducer?.shippingCharges?.salesTax, rentalFee: checkOutReducer?.shippingCharges?.rentalFee, service_type: checkOutReducer?.shippingCharges?.shippingCharge === 10 ? 0 : checkOutReducer?.shippingCharges?.shippingCharge === 15 ? 1 : 0, sellerCount: checkOutReducer?.shippingCharges?.sellerCount
        };
        orderData.paymentData = { ...checkOutReducer?.selectedCard };
        orderData.shippingAddress = { ...checkOutReducer?.shippingAddress };
        orderData = JSON.stringify(orderData);
        await order(authToken, {
          orderArr: orderArr,
          session_id,
          orderData
        }).then(async (result) => {
          window.history.replaceState(null, null, "/");
          // setOrderId(result.data.postdata.orderIdArr[0]);
          let idArray = [...result.data.postdata.orderIdArr];
          let promiseArray = [];
          for(let i = 0; i < idArray.length; i++) {
            await Promise.all(promiseArray).then(async() => {
              promiseArray.push(await getOrderDetails(idArray[i]))
            })
          }
          // await result.data.postdata.orderIdArr.map(async val => {
          //   await getOrderDetails(val);
          // })

          setLoading(false);
          dispatch(
            removeCheckoutData()
          );
        })
      })
      .catch((errors) => {
        console.log("ERROR : ", errors);
        // showToast("error", errors);
        // setErrorMsg(errors.response.data.message);
      });
  }

  useEffect(() => {
    const params = new URLSearchParams(locationHistory.search);
    let session_id = params.get("session_id");
    if (session_id && session_id != "") {
      setShippingAddress({ ...checkOutReducer?.shippingAddress });
      setBillingAddress({ ...checkOutReducer?.billingAddress });
      setSelectedCard({ ...checkOutReducer?.selectedCard });
      setIsLocalPickUp(checkOutReducer?.isLocalPickUp);
      setZipcode(checkOutReducer?.zipCode);
      setShippingCharge(checkOutReducer?.shippingCharges?.shippingCharge);
      setRentalFee(checkOutReducer?.shippingCharges?.rentalFee);
      setSalesTax(checkOutReducer?.shippingCharges?.salesTax);
      setSellerCount(checkOutReducer?.shippingCharges?.sellerCount)
      setIsPreview(true);
      setShowModal(true);
      placeOrder(session_id);
    } else if (props.location?.state?.isCheckout !== true && locationHistory.state?.isCheckout != true) {
      window.location.replace("/");
    } else if (!authToken) {
      setErrorMsg("Please login first.");
      // showToast("error_msg", "Please login first.");
      history.push({ pathname: "/account/login", state: { isCheckout: true, isLocalPickUp: isLocalPickUp, zipCode: zipCode } });
    }
    if (locationHistory.state?.isLocalPickUp) {
      let isPickup = locationHistory.state?.isLocalPickUp ? locationHistory.state?.isLocalPickUp : false;
      setIsLocalPickUp(isPickup);
      if (isPickup) {
        setZipcode(locationHistory.state?.zipCode);
      }
    }
    if (authToken) {
      cartDetails();
      getCard();
      if (!session_id) {
        getUserProfileDetails();
      }

    }
  }, []);

  const checkoutFunc = async (values) => {
    dispatch(
      saveCheckoutData(
        { ...shippingAddress },
        { ...billingAddress },
        { ...selectedCard },
        isLocalPickUp,
        { ...zipCode },
        { shippingCharge: shippingCharge, salesTax: salesTax, rentalFee: rentalFee, serviceType: shippingCharge === 10 ? 0 : shippingCharge === 15 ? 1 : 0, sellerCount: sellerCount > 0 ? sellerCount : 1 },
      )
    );

    let checkoutData = {
      email: authUser.email,
      firstName: authUser.first_name,
      user_id: authUser.id,
      products: [],
      address: { ...shippingAddress }
    }
    await getCartList(authToken, authUser.id)
      .then(async (result) => {
        var data = result.data.postdata.data;
        let orderArr = [];

        if (data.length > 0) {
          await data.map(async val => {
            let curObj = {
              price: parseInt(val.rental_fee[`${val.rental_period}weeks`]),
              count: val.quantity,
              productname: val.title
            };
            checkoutData.products.push(curObj);
          })
          checkoutData.products.push({
            price: rentalFee,
            count: 1,
            productname: "Rental Fee"
          })
          checkoutData.products.push({
            price: shippingCharge,
            count: 1,
            productname: "Shipping"
          })
          checkoutData.products.push({
            price: salesTax,
            count: 1,
            productname: "Sales Tax"
          })

          await data.map(val => {
            let curObj = {
              buyer_id: authUser.id,
              seller_id: val.seller_id,
              product_id: val.product_id,
              amount: parseInt(val.rental_fee[`${val.rental_period}weeks`]),
              start_date: val.start_date,
              end_date: val.end_date,
              total_amount: parseInt(val.rental_fee[`${val.rental_period}weeks`]),
              quantity: val.quantity,
              rental_period: val.rental_period,
              shipping_address: "",
              shipping_type: JSON.stringify(zipCode)
            }
            orderArr.push(curObj);
          })
        }
        let shippingChargesObj = { shippingCharge: shippingCharge, salesTax: salesTax, rentalFee: rentalFee, serviceType: shippingCharge === 10 ? 0 : shippingCharge === 15 ? 1 : 0 };
        let paymentData = { ...selectedCard };
        let shippingAddressB = { ...shippingAddress };

        checkoutData.orderArr = JSON.stringify(orderArr);
        checkoutData.shippingCharges = JSON.stringify(shippingChargesObj);
        checkoutData.paymentData = JSON.stringify(paymentData);
        checkoutData.shippingAddress = JSON.stringify(shippingAddressB);

        await checkout(authToken, checkoutData).then(async (result) => {
          setPlaceLoading(false);
          window.location.href = result.data.url;
        }).catch(err => {
          let error = err.response.data.message;
          console.log("ERROR : ", err)
          setErrorMsg(error);
          setPlaceLoading(false);
          // showToast("error_msg", error);
        })
      })
      .catch((errors) => {
        setPlaceLoading(false);
        let error_status = errors.response.status;
        if (error_status !== 401) {
          // showToast("error", errors);
          setErrorMsg(errors.response.data.message);
        }
      });

  }

  const onSubmitHandler = (values) => {
    if (authToken) {
      checkoutFunc();
    } else {
      // showToast("error_msg", "Please login first.");
      setPlaceLoading(false);
      setErrorMsg("Please login first");
      setTimeout(() => {
        history.push("/account/login");
      }, 3000);
    }
  }

  const shippingTypeHandler = (event) => {
    if (event.target.value === "pickup") {
      setShowPickup(true);
      setShippingType("pickup");
    } else if (event.target.value === "ship") {
      setShowPickup(false);
      setShippingType("ship");
    }
  };

  const addCardHandler = async (values) => {
    values.user_id = authUser.id;
    values.email = authUser.email;
    values.firstName = authUser.first_name;
    values.updateCardNumber = card;
    let stringifyData = JSON.stringify(values);

    let cardData = CryptoJS.AES.encrypt(stringifyData, process.env.REACT_APP_JWT_ENCRYPTION_ADMIN).toString();

    await addCard(authToken, { cardData }).then((data) => {
      getCard();
      setUpdateCard(false);
      // showToast("success", data.data.message);
    }).catch((err) => {
      let error = err.response.data.message;
      setCardErrorMsg(error);
      // showToast("error_msg", error);
    });
    setCardLoading(false);
  }

  const validationSchema = Yup.object().shape({
    address: Yup.string().required("Required"),
    // country: Yup.string().required("Required"),
    state: Yup.string().required("Required"),
    zip_code: Yup.string().required("Required")
      .matches(/^[0-9]{5}(?:-[0-9]{4})?$/, "Must be a valid ZIP code"),
    phone_number: Yup.string()
      .matches(/^\d+$/, "Provide Valid Phone Number")
      .max(10, "A cell phone number must have 10 digits.")
      .min(10, "A cell phone number must have 10 digits.")
      .required("Phone Number is required"),
  });

  const initialValues = {
    address: shippingAddress ? shippingAddress.address : "",
    appartment: shippingAddress ? shippingAddress.appartment : "",
    country: shippingAddress ? shippingAddress.country : "",
    state: shippingAddress ? shippingAddress.state : "",
    zip_code: shippingAddress ? shippingAddress.zip_code : "",
    phone_number: shippingAddress ? shippingAddress.phone_number : ""
  };

  const initialValuesEmpty = {
    address: billingAddress ? billingAddress.address : "",
    appartment: billingAddress ? billingAddress.appartment : "",
    country: billingAddress ? billingAddress.country : "",
    state: billingAddress ? billingAddress.state : "",
    zip_code: billingAddress ? billingAddress.zip_code : "",
    phone_number: billingAddress ? billingAddress.phone_number : "",
  };

  const updateCardHandler = (data) => {
    if (data != "") {
      setActiveCard({
        name: data.name,
        cardNumber: "",
        expirationDate: `${data.exp_month}/${data.exp_year}`,
        cardCvc: "",
        zipCode: data.address_zip
      });
    } else {
      setActiveCard({
        name: "",
        cardNumber: "",
        expirationDate: "",
        cardCvc: "",
        zipCode: ""
      });
    }
  }

  useEffect(() => {
    if ((!isLocalPickUp ? formACleared : true)) {
      setIsPreview(true);
    } else {
      setIsPreview(false);
    }
  }, [formACleared]);

  function clearNumber(value = "") {
    return value.replace(/\D+/g, "");
  }

  function formatCreditCardNumber(val) {
    let value = val.target.value;
    if (!value) {
      return value;
    }

    const clearValue = clearNumber(value);
    let nextValue;

    nextValue = `${clearValue.slice(0, 4)} ${clearValue.slice(
      4,
      8
    )} ${clearValue.slice(8, 12)} ${clearValue.slice(12, 16)}`;

    return nextValue.trim();
  }

  function formatExpirationDate(val) {
    let value = val.target.value;
    const clearValue = clearNumber(value);

    if (clearValue.length >= 3) {
      return `${clearValue.slice(0, 2)}/${clearValue.slice(2, 6)}`;
    }

    return clearValue;
  }

  const renderModalBody = () => {
    return (
      <>
        <Modal.Header className="bg-light-gray border-0">
          <Button className="border-0 ms-auto bg-transparent btn btn-primary" onClick={() => {
            window.location.replace('/');
          }}>
            <img src="/media/images/X.svg" className="w-20px" />
          </Button>
        </Modal.Header>
        <Modal.Body className="bg-light-gray pt-0">
          <div className="row">
            <div className="col-12 text-center">
              <h1 className="text-brown font-CambonRegular font-30 text-uppercase">
                Thank you for your order!
              </h1>
              <p className="text-black font-InterLight font-16">An email with all the details is waiting in your inbox!</p>
            </div>

            {!loading ? <div className="col-12 text-center">
              <p className="text-brown font-CambonRegular font-20 text-uppercase">Order details</p>
              {isLocalPickUp ? <p className="text-light-gray4 font-InterLight font-16 mb-2"><span className="font-InterBold">Rental Pick up: </span>{zipCode.zip_code}</p> : <p className="text-light-gray4 font-InterLight font-16 mb-2"><span className="font-InterBold">Shipped to: </span> {shippingAddress.appartment} {shippingAddress.address}, {shippingAddress.state}, {shippingAddress.country}, {shippingAddress.zip_code}</p>}

              {Object.entries(sortedWithDate).map(([key, value], i) => (<><p className="text-light-gray4 font-InterLight font-16 mb-2"><span className="font-InterBold">Rental dates: </span> {moment(sortedWithDate[key][0].start_date).format("MM/DD/YYYY")} - {moment(sortedWithDate[key][0].end_date).format("MM/DD/YYYY")}</p>

                <div className="d-flex flex-wrap align-items-center justify-content-center pb-3">
                  {sortedWithDate[key].map(val => (<div className="mx-1 mt-2">
                    <img
                      src={val.image_url}
                      className="max-w-80 rounded cursor-pointer"
                      onClick={() => history.push({ pathname: "/order-details", state: { orderId: val.order_id, type: "Order_History", subType: "RentedIntoMyproduct" } })}
                    />
                  </div>))}
                </div></>))}

              <div className="mt-2 border-slate-gray-bottom pb-2">
                <Link
                  className="text-brown font-18 font-InterRegular text-uppercase"
                  to={"/products"}
                >
                  Back to shop
                </Link>
              </div>
            </div> : <>
              <h5 class="d-flex justify-content-center text-brown">Your order is been processing please wait..</h5>
              <div class="d-flex justify-content-center">
                <div class="spinner-border text-brown" role="status">
                </div>
              </div></>}
            <div className="col-12 text-center mt-3">
              <p className="text-black font-InterLight font-16">Follow us in:</p>

              <ul className="list-unstyled d-flex align-items-center justify-content-center">
                <li className="nav-item me-3">
                  <Link
                    to={{ pathname: process.env.REACT_APP_TWITTER_URL }}
                    target="_blank"
                    className="nav-link"
                  >
                    <img src="/media/images/twitter-brown.png" className="img-fluid common-icon" />
                  </Link>
                </li>
                <li className="nav-item me-3">
                  <Link
                    to={{ pathname: process.env.REACT_APP_INSTAGRAM_URL }}
                    target="_blank"
                    className="nav-link"
                  >
                    <img src="/media/images/instagram-brown.png" className="img-fluid common-icon" />
                  </Link>
                </li>
                <li className="nav-item me-3">
                  <Link
                    to={{ pathname: process.env.REACT_APP_FACEBOOK_URL }}
                    target="_blank"
                    className="nav-link"
                  >
                    <img src="/media/images/facebook-brown.png" className="img-fluid common-icon" />
                  </Link>
                </li>
                <li className="nav-item me-3">
                  <Link
                    to={{ pathname: process.env.REACT_APP_TIKTOK_URL }}
                    target="_blank"
                    className="nav-link"
                  >
                    <img src="/media/images/tiktok-brown.png" className="img-fluid common-icon" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </Modal.Body>
      </>
    );
  };

  return (
    <>
      <TitleComponent title={props.title} icon={props.icon} />
      <section className="bg-light-gray pb-5">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h1 className="text-brown font-CambonRegular font-35 text-uppercase py-3 line-before">
                {isPreview ? "Review and confirm" : "Checkout"}
              </h1>
            </div>
          </div>

          <div className="row">
            {!isPreview && <div className="col-12 col-lg-7">
              {<Formik innerRef={formRefA}
                initialValues={initialValues}
                enableReinitialize
                validationSchema={validationSchema}
                onSubmit={(values) => {
                  setShippingAddress(values);
                  setFormACleared(true);
                  // previewHandler("shippingAddress", values);
                }}
              >
                {({
                  errors,
                  touched,
                  handleSubmit,
                  values,
                  handleChange,
                  handleBlur,
                  setFieldValue
                }) => {
                  return (
                    <form onSubmit={handleSubmit}>
                      <div className="row">
                        <div className="col-12">
                          <p className="text-black-3 font-InterRegular font-18 text-uppercase">Shipping details</p>
                        </div>
                        <div className="col-12 col-lg-11">
                          <div className="mb-3">
                            <FormControl fullWidth className="add-product-input cus-select-label">
                              <InputLabel id="demo-simple-select-label">Country</InputLabel>
                              <Select
                                IconComponent={ExpandMore}
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                label="Country"
                                variant="outlined"
                                name="country"
                                value={values.country}
                                onBlur={handleBlur}
                                onChange={handleChange}
                                className="w-100"
                              >
                                <MenuItem value={"United States"}>United States</MenuItem>
                              </Select>
                            </FormControl>
                            <div className="text-danger">
                              {touched.country && errors.country}
                            </div>
                          </div>
                          <div className="mb-3">
                            <TextField
                              value={values.address}
                              onBlur={handleBlur}
                              onChange={handleChange}
                              label="Address"
                              variant="outlined"
                              name="address"
                              className="w-100 add-product-input"
                            />
                            <div className="text-danger">
                              {touched.address && errors.address}
                            </div>
                          </div>
                          <div className="mb-3">
                            <TextField
                              value={values.zip_code}
                              onBlur={handleBlur}
                              onChange={handleChange}
                              label="Zip Code"
                              variant="outlined"
                              name="zip_code"
                              className="w-100 add-product-input"
                            />
                            <div className="text-danger">
                              {touched.zip_code && errors.zip_code}
                            </div>
                          </div>
                          <div className="mb-3">
                            <TextField
                              value={values.phone_number}
                              onBlur={handleBlur}
                              onChange={handleChange}
                              label="Phone Number"
                              variant="outlined"
                              name="phone_number"
                              className="w-100 add-product-input"
                            />
                            <div className="text-danger">
                              {touched.phone_number && errors.phone_number}
                            </div>
                          </div>

                          <div className="mb-3">
                            <FormControl fullWidth className="add-product-input cus-select-label">
                              <InputLabel id="demo-simple-select-label">State</InputLabel>
                              <Select
                                IconComponent={ExpandMore}
                                labelId="demo-simple-select-label"
                                id="demo-simple-select2"
                                label="State"
                                variant="outlined"
                                name="state"
                                value={values.state}
                                onBlur={handleBlur}
                                onChange={handleChange}
                                className="w-100"
                              >
                                {states.map(val => (<MenuItem value={val}>{val}</MenuItem>))}
                              </Select>
                            </FormControl>
                            <div className="text-danger">
                              {touched.state && errors.state}
                            </div>
                          </div>
                          {!isLocalPickUp && <div className="col-12 mt-4">
                            <p className="mb-1 font-18">Shipping Service:</p>
                            <FormControl>
                              <RadioGroup
                                aria-labelledby="demo-radio-buttons-group-label"
                                value={(shippingCharge/sellerCount)}
                                name="radio-buttons-group"
                                className="cus-radio d-flex flex-row"
                              >
                                <FormControlLabel value={10} control={<Radio />} label="Standard" onChange={(e) => {
                                  let charge = parseInt(e.target.value) * sellerCount;
                                  console.log("Charge : ", charge)
                                  setShippingCharge(charge);
                                  setShippingServiceErr("");
                                }} />
                                <FormControlLabel value={15} control={<Radio />} label="Expedited" onChange={(e) => {
                                  let charge = parseInt(e.target.value) * sellerCount;
                                  console.log("Charge : ", charge)
                                  setShippingCharge(charge);
                                  setShippingServiceErr("");
                                }} />
                              </RadioGroup>
                            </FormControl>
                            <div className="text-danger">
                              {sippingServiceErr}
                            </div>
                          </div>}
                          <div className="mb-3">
                          </div>
                        </div>
                      </div>
                    </form>
                  );
                }}
              </Formik>}
            </div>}

            {isPreview && (
              <div className="col-12 col-lg-7">
                <div className="row">
                  <div className="col-12">
                    <h3 className="text-black-3 font-InterBold font-18 text-uppercase">Delivery</h3>
                    {isLocalPickUp ? <p className="text-light-gray4 font-InterLight font-18">Local pickup from {zipCode.zip_code}</p> : <p className="text-light-gray4 font-InterExtraLight font-18">Method: {shippingCharge === 10 ? "Standard" : shippingCharge === 15 ? "Expedited" : "Standard"}</p>}
                  </div>
                  {!isLocalPickUp && <div className="col-12 mt-4">
                    <h3 className="text-black-3 font-InterBold font-18 text-uppercase">Shipping Address</h3>
                    <p className="text-light-gray4 font-InterRegular font-18 mb-0">{`${authUser.first_name} ${authUser.last_name}`}</p>
                    <p className="text-light-gray4 font-InterRegular font-18 mb-0">{shippingAddress.appartment} {shippingAddress.address},</p>
                    <p className="text-light-gray4 font-InterRegular font-18">{shippingAddress.state}, {shippingAddress.country}, {shippingAddress.zip_code}</p>

                    <a className="text-light-gray4 font-InterRegular font-14 cursor-pointer" onClick={() => {
                      setFormACleared(false);
                      setFormBCleared(false);
                      setIsPreview(false)
                    }}>edit shipping</a>
                  </div>}
                </div>
              </div>
            )}
            <div className="col-12 col-lg-5 px-lg-0 mt-4 mt-lg-0">
              <div className="row mx-0 border-cream px-2 py-4">
                <div className="col-12">
                  <div className="row mx-lg-0">
                    <div className="col-7">
                      <p className="text-black-3 font-InterRegular font-18 mb-0 text-uppercase">Your order</p>
                    </div>
                    <div className="col-5 text-end">
                      {!isPreview && <Link className="text-cream font-InterLight font-16" to={"/cart"}>Edit order</Link>}
                    </div>
                  </div>
                  {Object.entries(sortedCart).map(([key, value], i) => (
                    <>
                      <div className="row mx-lg-0">
                        <div className={`col-12 ${i === 0 ? "mt-3" : "mt-4 pt-2"}`}>
                          <p className="text-light-gray3 font-InterRegular font-14 mb-0 text-uppercase border-slate-gray-bottom pb-2">
                            {sortedCart[key].length} {sortedCart[key].length > 1 ? 'Items' : 'Item'} from {sortedCart[key][0].seller_name}’S product
                          </p>
                        </div>
                      </div>
                      {sortedCart[key].map((val, ind) => (
                        <div className="row mx-lg-0 pt-3">
                          <div className="col-12">
                            <div className="row">
                              <div className="col-12 col-sm-4">
                                <img
                                  src={val.image_url}
                                  className="img-fluid d-block mx-auto rounded"
                                />
                              </div>
                              <div className="col-12 col-sm-8 mt-4 mt-sm-0">
                                <h4 className="text-black-3 font-InterRegular text-uppercase font-18">
                                  {val?.title}
                                </h4>
                                <p className="text-light-gray4 font-InterLight font-16 mb-1 pt-2">
                                  Rental period: {val.rental_period} weeks
                                </p>
                                <p className="text-light-gray4 font-InterLight font-16 mb-1">
                                  Rental dates: {moment(val.start_date).format("MM/DD/YYYY")} - {moment(val.end_date).format("MM/DD/YYYY")}
                                </p>
                                <p className="text-light-gray4 font-InterLight font-16">
                                  Method: {isLocalPickUp ? `Local Pick Up` : "Shipping"}
                                </p>
                                <h1 className="text-black-3 font-InterRegular font-20 mb-0">
                                  ${val.amount}
                                </h1>
                              </div>
                            </div>
                          </div>
                          {sortedCart[key].length - 1 > ind && <div className="col-12">
                            <span className="border-slate-gray-bottom pt-3 d-block"></span>
                          </div>}
                        </div>
                      ))}
                    </>
                  ))}

                  <div className="row mx-lg-0 pt-3">
                    <div className="col-6">
                      <p className="text-black-3 font-InterLight font-18">Subtotal</p>
                    </div>
                    <div className="col-6 text-end">
                      <p className="text-black-3 font-InterLight font-18">${subtotal}</p>
                    </div>
                    <div className="col-6">
                      <p className="text-black-3 font-InterLight font-18">Rental Fee</p>
                    </div>
                    <div className="col-6 text-end">
                      <p className="text-black-3 font-InterLight font-18">${rentalFee}</p>
                    </div>
                    {!isLocalPickUp && <><div className="col-6">
                      <p className="text-black-3 font-InterLight font-18 position-relative">Shipping
                        <img src="/media/images/info_tooltip_icon.svg" className="w-20px ms-2 cus-tooltop-btn" />
                        <span className="cus-tooltop">If you have items shipping from the same product over different rental periods, shipping costs will increase.</span>
                      </p>
                    </div>
                      <div className="col-6 text-end">
                        <p className="text-black-3 font-InterLight font-18">${shippingCharge}</p>
                      </div></>}
                    <div className="col-6">
                      <p className="text-black-3 font-InterLight font-18 mb-0">Sales Tax</p>
                    </div>
                    <div className="col-6 text-end">
                      <p className="text-black-3 font-InterLight font-18 mb-0">${salesTax}</p>
                    </div>

                    <div className="col-12">
                      <span className="border-slate-gray-bottom pt-3 d-block"></span>
                    </div>
                  </div>
                  <div className="row mx-lg-0 mt-3">
                    <div className="col-6">
                      <p className="text-black-3 text-uppercase font-InterMedium font-22 mb-0">Total to pay:</p>
                    </div>
                    <div className="col-6 text-end">
                      <p className="text-black-3 font-InterMedium font-22 mb-0">${isLocalPickUp ? (subtotal + rentalFee + salesTax) : (subtotal + rentalFee + shippingCharge + salesTax)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>


          <div className="row">
            <div className="col-12 col-lg-7">
              <div className="row align-items-center mt-5 pt-5">
                <div className="col-12 col-sm-6 mt-4">
                  <Link
                    className="text-brown font-18 font-InterRegular text-uppercase"
                    to={"/cart"}
                  >
                    Return to Cart
                  </Link>
                </div>
                {!isPreview ? <div className="col-12 col-sm-6 text-sm-end mt-4">
                  <button
                    type="submit"
                    className="btn cus-React-btn text-uppercase shadow-none"
                    onClick={() => {
                      if (authToken) {
                        if (!isLocalPickUp && shippingCharge <= 0) {
                          setShippingServiceErr("Please select the shipping service type.");
                        } else if (!isLocalPickUp && formRefA.current) {
                          formRefA.current.handleSubmit();
                        } else if (isLocalPickUp) {
                          formRefA.current.handleSubmit();
                        }
                      } else {
                        setErrorMsg("Please login first.");
                        history.push({ pathname: "/account/login", state: { isCheckout: true, isLocalPickUp: isLocalPickUp, zipCode: zipCode } });
                      }
                    }}
                    disabled={productNotAvailable}
                  >
                    Check out
                  </button>
                  {productNotAvailable &&
                    <div className="text-danger text-wrap text-break mt-2">
                      Some of the products are currently not available in the date range you have selected.
                    </div>}
                </div> : <div className="col-12 col-sm-6 text-sm-end mt-4">
                  <button
                    type="submit"
                    className="btn cus-React-btn text-uppercase shadow-none"
                    disabled={placeLoading}
                    onClick={() => {
                      setPlaceLoading(true);
                      onSubmitHandler();
                    }}
                  >
                    {!placeLoading ? "Begin Payment" : <CircularProgress />}
                  </button>
                </div>}
              </div>
            </div>
          </div>
          <div className="row justify-content-center">
            <div className="col-12 col-lg-5 text-sm-center">
              <div className="text-danger text-wrap text-break mt-2">
                {errorMsg}
              </div>
            </div>
          </div>
        </div>
      </section >

      <Modal
        size="lg"
        centered="true"
        show={showModal}
        onHide={() => {
          window.location.replace('/');
        }}
        style={{ opacity: 1 }}
        backdrop={"static"}
      >
        {showModal && renderModalBody()}
      </Modal>
    </>
  );
}

export default withRouter(Checkout);
