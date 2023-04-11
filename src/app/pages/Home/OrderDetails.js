import React, { useState, useEffect } from "react";
import { withRouter, useHistory, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import TitleComponent from "../../../components/Common/TitleComponent";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import {
  orderDetails,
  markShipped,
  markReturned,
  markPickedUp,
  markDelivered,
  markShippedBack,
  droppedOff
} from "../../crud/auth.crud";
import moment from "moment";
import { Modal, Button, Form } from "react-bootstrap";
import { showToast } from "../../../utils/utils";
import { CircularProgress } from "@material-ui/core";


function OrderDetails(props) {
  const locationHistory = useLocation();
  const history = useHistory();

  const [pageType, setPageType] = useState("");
  const [pageSubType, setPageSubType] = useState("");
  const [orderDetail, setOrderDetail] = useState([]);
  const [subTotal, setSubTotal] = useState(0);
  const [orderObj, setOrderObj] = useState({});
  const [order_id, setOrderId] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [orderDetailID, setOrderDetailID] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);

  const { authToken, userid, authUser } = useSelector(
    ({ auth }) => ({
      authToken: auth?.user?.token,
      userid: auth?.user?.id,
      authUser: auth?.user,
    }),
    shallowEqual
  );

  const onBackFunc = (type) => {
    history.push({ pathname: "/profile", state: { tabType: type } });
  }

  useEffect(() => {
    if (locationHistory && locationHistory.state) {
      const { orderId, type, subType } = locationHistory.state;
      setPageType(type);
      setPageSubType(subType);
      setOrderId(orderId);
      window.onpopstate = e => {
        onBackFunc(type);
      }
      orderDetails(authToken, orderId).then((data) => {
        if (data.status === 200) {
          let curData = data?.data?.postdata?.data;

          if (type === "Active_Orders") {
            let dateSortObj = {};
            curData.map(val => {
              let str = `${moment(val.OrderDetails.start_date).format("MM/DD/YYYY")} - ${moment(val.OrderDetails.end_date).format("MM/DD/YYYY")}`;
              if (!dateSortObj[str]) {
                dateSortObj[str] = [];
              }
              dateSortObj[str].push(val);
            });
            setOrderObj({ ...dateSortObj });
          }
          setOrderDetail([...data.data.postdata.data]);

          let total = 0;
          if (curData.length > 0) {
            curData.map(val => {
              if (subType === "RentedOutOfMyproduct") {
                total += val.OrderDetails.total_earnings;
              } else {
                total += val.OrderDetails.amount;
              }
            });
            if (subType !== "RentedOutOfMyproduct") {
              let sellerCount = curData[0].order_data?.shippingCharges?.sellerCount ? curData[0].order_data?.shippingCharges?.sellerCount : 1;
              setCount(sellerCount); 
              if (curData[0].shipping_type.zip_code == "") {
                total += (curData[0].order_data?.shippingCharges?.rentalFee/sellerCount) + (curData[0].order_data?.shippingCharges?.shippingCharge/sellerCount) + (curData[0].order_data?.shippingCharges?.salesTax/sellerCount);
              } else {
                total += (curData[0].order_data?.shippingCharges?.rentalFee/sellerCount) + (curData[0].order_data?.shippingCharges?.salesTax/sellerCount);
              }
            }
            setSubTotal(total);
          }
        }
      })
    } else {
      window.location.replace("/profile");
    }
  }, [locationHistory]);

  const markShippedHandler = async (order_id, orderDetail) => {
    await markShipped(authToken, { order_id, orderDetail }).then((result) => {
      // showToast("success", result.data.message);
      setErrorMsg("");
      setTimeout(() => {
        window.location.reload();
      }, 500);

    }).catch(err => {
      // showToast("error", err);
      setErrorMsg(err.response.data.message);
    })
    setLoading(false);
  }

  const markPickedUpHandler = async (order_id, orderDetail) => {
    await markPickedUp(authToken, { order_id, orderDetail, pageSubType }).then((result) => {
      // showToast("success", result.data.message);
      setErrorMsg("");
      setTimeout(() => {
        window.location.reload();
      }, 500);

    }).catch(err => {
      // showToast("error", err);
      setErrorMsg(err.response.data.message);
    })
    setLoading(false);
  }

  const markAsDelivered = async (order_id, orderDetail) => {
    await markDelivered(authToken, { order_id, orderDetail }).then((result) => {
      // showToast("success", result.data.message);
      setErrorMsg("");
      setTimeout(() => {
        window.location.reload();
      }, 500);

    }).catch(err => {
      // showToast("error", err);
      setErrorMsg(err.response.data.message);
    })
    setLoading(false);
  }

  const markAsReturnedShipped = async (order_id, orderDetail) => {
    await markShippedBack(authToken, { order_id, orderDetail }).then((result) => {
      // showToast("success", result.data.message);
      setErrorMsg("");
      setTimeout(() => {
        window.location.reload();
      }, 500);

    }).catch(err => {
      // showToast("error", err);
      setErrorMsg(err.response.data.message);
    })
    setLoading(false);
  }

  const markAsDroppedOff = async (order_id, orderDetail) => {
    await droppedOff(authToken, { order_id, orderDetail }).then((result) => {
      // showToast("success", result.data.message);
      setErrorMsg("");
      setTimeout(() => {
        window.location.reload();
      }, 500);

    }).catch(err => {
      // showToast("error", err);
      setErrorMsg(err.response.data.message);
    })
    setLoading(false);
  }

  const markReturnedHandler = async (order_id, orderDetail) => {
    await markReturned(authToken, { order_id, orderDetail }).then((result) => {
      // showToast("success", result.data.message);
      setErrorMsg("");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }).catch(err => {
      // showToast("error", err);
      setErrorMsg(err.response.data.message);
    })
    setLoading(false);
  }

  const renderModalBody = () => {
    return (
      <>
        <Modal.Header className="border-top-0 mt-0">
          <Modal.Title className="font-InterRegular">
            {(modalType === "markAsShipped" || modalType === "markAsReturnedShipped") ? `Mark order ${order_id} as shipped` : modalType === "markAsReturned" ? `Mark order ${order_id} as returned` : modalType === "markPickedUp" ? `Mark order ${order_id} as picked up` : modalType === "markAsDelivered" ? `Mark order ${order_id} as delivered` : modalType === "markAsDroppedOff" && `Mark order ${order_id} as dropped off`}
          </Modal.Title>
          <Button className="border-0 ms-auto bg-transparent btn btn-primary" onClick={() => setShowModal(false)}>
            <img src="/media/images/X.svg" className="w-20px" />
          </Button>
        </Modal.Header>
        <Form noValidate>
          <Modal.Body className="py-5">
            <Form.Group md="12" className={"text-center"}>
              <Form.Label className="font-InterRegular">
                Confirm that {(modalType === "markAsShipped" || modalType === "markAsReturnedShipped") ? "you shipped the order" : modalType === "markAsReturned" ? "you received the product back" : modalType === "markPickedUp" ? "user picked up order" : modalType === "markAsDelivered" ? "you received the product" : modalType === "markAsDroppedOff" && "you dropped the product back"} {""}?
              </Form.Label>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              className="btn bg-transparent shadow-none border-0 font-InterMedium font-18 text-brown px-3"
              onClick={() => {
                setShowModal(false);
                setLoading(false);
              }}
            >
              Cancel
            </Button>
            <Button
              className="btn cus-React-btn px-3 py-2"
              disabled={loading}
              onClick={(e) => {
                setLoading(true);
                if (modalType === "markAsShipped") {
                  markShippedHandler(order_id, orderDetailID);
                } else if (modalType === "markAsReturned") {
                  markReturnedHandler(order_id, orderDetailID);
                } else if (modalType === "markPickedUp") {
                  markPickedUpHandler(order_id, orderDetailID);
                } else if (modalType === "markAsDelivered") {
                  markAsDelivered(order_id, orderDetailID);
                } else if (modalType === "markAsReturnedShipped") {
                  markAsReturnedShipped(order_id, orderDetailID);
                } else if (modalType === "markAsDroppedOff") {
                  markAsDroppedOff(order_id, orderDetailID);
                }
              }}
            >
              {!loading ? "Confirm" : <CircularProgress />}
            </Button>
          </Modal.Footer>
        </Form>
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
                Order #{order_id} Details
              </h1>
            </div>
          </div>

          {pageType === "Order_History" && <div className="row mx-0 border-cream px-2 py-4">
            <div className="col-12">
              {orderDetail.length > 0 && orderDetail.map(val => (<div className="row mx-lg-0">
                <div className="col-12 col-md-6 col-lg-3">
                  <img
                    src={val.OrderDetails.image_url}
                    className="img-fluid rounded"
                  />
                  <p className="text-black-3 font-InterRegular font-16 mt-2 mb-0">{val.OrderDetails.title}</p>
                  <p className="text-light-gray4 font-InterExtraLight font-12">{val.sellerDetails.first_name}’s product  </p>
                </div>

                <div className="col-12 col-md-6 col-lg-9">
                  <div className="row">
                    <div className="col-12 col-lg-4 mt-2">
                      <p className="text-light-gray4 font-InterMedium font-20 mb-0">Rental Period</p>
                      <p className="text-black-3 font-InterLight font-18">{val.OrderDetails.rental_period} weeks</p>
                    </div>
                    <div className="col-12 col-lg-4 mt-2 mt-lg-0">
                      <p className="text-light-gray4 font-InterMedium font-20 mb-0">Delivery Method</p>
                      <p className="text-black-3 font-InterLight font-18">{val.shipping_type.zip_code == "" ? `${val?.shipping_label?.serviceCode ? val.shipping_label?.serviceCode : "-"}` : "Local Pickup"}</p>
                    </div>
                    {pageSubType == "RentedOutOfMyproduct" ? <div className="col-12 col-lg-4 mt-2">
                      <p className="text-light-gray4 font-InterMedium font-20 mb-0">Total Earnings</p>
                      <p className="text-black-3 font-InterLight font-18">${val.OrderDetails.total_earnings}</p>
                    </div> : <div className="col-12 col-lg-4 mt-2 mt-lg-0">
                      <p className="text-light-gray4 font-InterMedium font-20 mb-0">Item Price</p>
                      <p className="text-black-3 font-InterLight font-18">${val.OrderDetails.amount}</p>
                    </div>}
                  </div>
                  <div className="row">
                    <div className="col-12 col-lg-4 mt-2 mt-lg-0">
                      <p className="text-light-gray4 font-InterMedium font-20 mb-0">Rental Dates</p>
                      <p className="text-black-3 font-InterLight font-18">{moment(val.OrderDetails.start_date).format("MM/DD/YYYY")}-{moment(val.OrderDetails.end_date).format("MM/DD/YYYY")}</p>
                    </div>
                    {val.shipping_type.zip_code != "" ? pageSubType == "RentedIntoMyproduct" ? <div className="col-12 col-lg-4 mt-2">
                      <p className="text-light-gray4 font-InterMedium font-20 mb-0">Contact Information</p>
                      <p className="text-black-3 font-InterLight font-18">{val.sellerDetails.first_name} {val.sellerDetails.last_name}</p>
                      <p className="text-black-3 font-InterLight font-18">{val.sellerDetails.phone_number}</p>
                      <p className="text-black-3 font-InterLight font-18">{val.sellerDetails.email}</p>
                    </div> : <div className="col-12 col-lg-4 mt-2">
                            <p className="text-light-gray4 font-InterMedium font-20 mb-0">Contact Information</p>
                            <p className="text-black-3 font-InterLight font-18">{val.order_data.shippingAddress?.first_name} {val.order_data.shippingAddress?.last_name}</p>
                            <p className="text-black-3 font-InterLight font-18">{val.order_data.shippingAddress?.phone_number}</p>
                            <p className="text-black-3 font-InterLight font-18">{val.order_data.shippingAddress?.email}</p>
                          </div> : <div className="col-12 col-lg-4 mt-2">
                      <p className="text-light-gray4 font-InterMedium font-20 mb-0">Shipping To</p>
                      {val.shipping_label ? <><p className="text-black-3 font-InterLight font-18">{val.shipping_label?.shipTo?.name}</p>
                        <p className="text-black-3 font-InterLight font-18">
                          {val.shipping_label?.shipTo?.street1}
                          {val.shipping_label?.shipTo?.street2}, {val.shipping_label?.shipTo?.street3}, {val.shipping_label?.shipTo?.city}, {val.shipping_label?.shipTo?.state}, {val.shipping_label?.shipTo?.country}, {val.shipping_label?.shipTo?.postalCode}</p></> : "-"}
                    </div>}
                    {pageSubType == "RentedOutOfMyproduct" && <div className="col-12 col-lg-4 mt-2 mt-lg-0">
                      <p className="text-light-gray4 font-InterMedium font-20 mb-0">Item Price</p>
                      <p className="text-black-3 font-InterLight font-18">${val.OrderDetails.amount}</p>
                    </div>}
                  </div>
                </div>
              </div>))}
              <div className="row mx-lg-0">
                <div className="col-12">
                  <div className="row align-items-center">
                    <div className="col-12 col-lg-4 mt-4">
                      <p className="text-brown font-18 font-InterLight text-uppercase cursor-pointer"
                        onClick={() => onBackFunc(pageType)}>
                        BACK TO ORDER HISTORY
                      </p>
                    </div>
                    <div className="col-12 col-lg-8 text-lg-end mt-4">
                      <a
                        className="btn px-3 cus-React-btn text-uppercase shadow-none mt-3 mt-md-0" href="mailto:help@Reactyourproduct.co">
                        REPORT ISSUE
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>}

          {pageType === "Active_Orders" && pageSubType == "RentedOutOfMyproduct" &&
            Object.entries(orderObj).map(([key, value], i) => (
              <div>
                <div className="row">
                  {(orderObj[key][0]?.shipping_label?.labelData && (orderObj[key][0]?.status === 0 || orderObj[key][0]?.status === 2)) && <div className="col-12 text-end">
                    <a href={`data:application/pdf;base64,${orderObj[key][0]?.shipping_label?.labelData}`} className="text-black-3 font-InterRegular font-20 text-decoration-none cursor-pointer" download={`shipping_label_${orderObj[key][0]?.id}`}>
                      Download Shipping Label
                      <img
                        src="/media/images/download.png"
                        className="img-fluid ms-2"
                      />
                    </a>
                  </div>}
                </div>
                <div className="row mx-0 border-cream px-2 py-4 mt-2">
                  <div className="col-12">
                    {orderObj[key].map(val => (<div className="row mx-lg-0">
                      <div className="col-12 col-md-6 col-lg-3">
                        <img
                          src={val.OrderDetails.image_url}
                          className="img-fluid rounded"
                        />
                        <p className="text-black-3 font-InterRegular font-16 mt-2 mb-0">{val.OrderDetails.title}</p>
                        <p className="text-light-gray4 font-InterExtraLight font-12">{val.sellerDetails.first_name}’s product  </p>
                      </div>

                      <div className="col-12 col-md-6 col-lg-9">
                        <div className="row">
                          <div className="col-12 col-lg-4 mt-2 mt-lg-0">
                            <p className="text-light-gray4 font-InterMedium font-20 mb-0">Rental Dates</p>
                            <p className="text-black-3 font-InterLight font-18">{moment(val.OrderDetails.start_date).format("MM/DD/YYYY")}-{moment(val.OrderDetails.end_date).format("MM/DD/YYYY")}</p>
                          </div>
                          <div className="col-12 col-lg-4 mt-2 mt-lg-0">
                            <p className="text-light-gray4 font-InterMedium font-20 mb-0">Delivery Method</p>
                            <p className="text-black-3 font-InterLight font-18">{val.shipping_type.zip_code == "" ? `${val?.shipping_label?.serviceCode ? val.shipping_label?.serviceCode : "-"}` : "Local Pickup"}</p>
                          </div>
                          <div className="col-12 col-lg-4 mt-2">
                            <p className="text-light-gray4 font-InterMedium font-20 mb-0">Total Earnings</p>
                            <p className="text-black-3 font-InterLight font-18">${val.OrderDetails.total_earnings}</p>
                          </div>
                        </div>
                        <div className="row">
                          {val.shipping_type.zip_code != "" ? <>
                            <div className="col-12 col-lg-4 mt-2">
                              <p className="text-light-gray4 font-InterMedium font-20 mb-0">Rental Return By</p>
                              <p className="text-black-3 font-InterLight font-18">{moment(val.OrderDetails.end_date).format("MM/DD/YYYY")}</p>
                            </div>
                            {pageSubType == "RentedIntoMyproduct" ? <div className="col-12 col-lg-4 mt-2">
                              <p className="text-light-gray4 font-InterMedium font-20 mb-0">Contact Information</p>
                              <p className="text-black-3 font-InterLight font-18">{val.sellerDetails.first_name} {val.sellerDetails.last_name}</p>
                              <p className="text-black-3 font-InterLight font-18">{val.sellerDetails.phone_number}</p>
                              <p className="text-black-3 font-InterLight font-18">{val.sellerDetails.email}</p>
                            </div> : <div className="col-12 col-lg-4 mt-2">
                            <p className="text-light-gray4 font-InterMedium font-20 mb-0">Contact Information</p>
                            <p className="text-black-3 font-InterLight font-18">{val.order_data.shippingAddress?.first_name} {val.order_data.shippingAddress?.last_name}</p>
                            <p className="text-black-3 font-InterLight font-18">{val.order_data.shippingAddress?.phone_number}</p>
                            <p className="text-black-3 font-InterLight font-18">{val.order_data.shippingAddress?.email}</p>
                          </div>} </> : <>
                            <div className="col-12 col-lg-4 mt-2">
                              <p className="text-light-gray4 font-InterMedium font-20 mb-0">Ship By</p>
                              <p className="text-black-3 font-InterLight font-18">{moment(val.OrderDetails.start_date).subtract(4, 'days').format("MM/DD/YYYY")}</p>
                            </div>
                            <div className="col-12 col-lg-4 mt-2">
                              <p className="text-light-gray4 font-InterMedium font-20 mb-0">Shipping To</p>
                              {val.shipping_label ? <><p className="text-black-3 font-InterLight font-18">{val.shipping_label?.shipTo?.name}</p>
                                <p className="text-black-3 font-InterLight font-18">
                                  {val.shipping_label?.shipTo?.street1}
                                  {val.shipping_label?.shipTo?.street2}, {val.shipping_label?.shipTo?.street3}, {val.shipping_label?.shipTo?.city}, {val.shipping_label?.shipTo?.state}, {val.shipping_label?.shipTo?.country}, {val.shipping_label?.shipTo?.postalCode}</p></> : "-"}
                            </div></>}
                          <div className="col-12 col-lg-4 mt-2 mt-lg-0">
                            <p className="text-light-gray4 font-InterMedium font-20 mb-0">Item Price</p>
                            <p className="text-black-3 font-InterLight font-18">${val.OrderDetails.amount}</p>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-12 col-lg-4 mt-2">
                            <p className="text-light-gray4 font-InterMedium font-20 mb-0">Rental Period</p>
                            <p className="text-black-3 font-InterLight font-18">{val.OrderDetails.rental_period} weeks</p>
                          </div>
                          {val.shipping_type.zip_code == "" ? <><div className="col-12 col-lg-4 mt-2">
                            <p className="text-light-gray4 font-InterMedium font-20 mb-0">Delivery Tracking Number</p>
                            <p className="text-black-3 font-InterLight font-18">{val?.shipping_label?.trackingNumber ? val?.shipping_label?.trackingNumber : "Label Not Yet Created"}</p>
                          </div>
                            <div className="col-12 col-lg-4 mt-2">
                              <p className="text-light-gray4 font-InterMedium font-20 mb-0">Return Tracking Number</p>
                              <p className="text-black-3 font-InterLight font-18">{val?.return_label?.trackingNumber ? val?.return_label?.trackingNumber : "Label Not Yet Created"}</p>
                            </div></> : <div className="col-12 col-lg-4 mt-2">
                            <p className="text-light-gray4 font-InterMedium font-20 mb-0">Status</p>
                            <p className="text-black-3 font-InterLight font-18">{orderObj[key][0].status === 0 ? "Order Placed" : orderObj[key][0].status === 3 && "Picked Up"}</p>
                          </div>}
                        </div>
                      </div>
                    </div>))}

                    <div className="row mx-lg-0">
                      <div className="col-12">
                        <div className="row align-items-center">
                          <div className="col-12 col-lg-4 mt-4">
                            <a
                              className="text-brown font-18 font-InterRegular text-uppercase"
                              href="mailto:help@Reactyourproduct.co"
                            >
                              Report Issue
                            </a>
                          </div>
                          <div className="col-12 col-lg-8 text-lg-end mt-4">
                            {orderObj[key][0].shipping_type.zip_code == "" ? <button
                              onClick={async () => {
                                let orderDetailIdArr = [];
                                await orderObj[key].map(val => orderDetailIdArr.push(val.OrderDetails.id));
                                setOrderDetailID([...orderDetailIdArr]);
                                setShowModal(true);
                                setModalType("markAsShipped");
                              }}
                              className="btn px-4 cus-React-btn-outline text-black text-uppercase shadow-none me-3"
                              disabled={orderObj[key][0].OrderDetails.shipping_status === 0 && orderObj[key][0].OrderDetails.shipping_status !== 1 ? false : true}>
                              Shipped to renter
                            </button> : <button
                              onClick={async () => {
                                let orderDetailIdArr = [];
                                await orderObj[key].map(val => orderDetailIdArr.push(val.OrderDetails.id));
                                setOrderDetailID([...orderDetailIdArr]);
                                setShowModal(true);
                                setModalType("markPickedUp");
                              }}
                              className="btn px-4 cus-React-btn-outline text-black text-uppercase shadow-none me-3"
                              disabled={orderObj[key][0].OrderDetails.shipping_status === 0 && orderObj[key][0].OrderDetails.shipping_status !== 1 ? false : true}>
                              Picked Up By Renter
                            </button>}
                            <button
                              onClick={async () => {
                                let orderDetailIdArr = [];
                                await orderObj[key].map(val => orderDetailIdArr.push(val.OrderDetails.id));
                                setOrderDetailID([...orderDetailIdArr]);
                                setShowModal(true);
                                setModalType("markAsReturned");
                              }
                              }
                              className="btn px-3 cus-React-btn text-uppercase shadow-none mt-3 mt-md-0"
                              disabled={![0, 1, 5, 2].includes(orderObj[key][0].OrderDetails.shipping_status) && [4, 6].includes(orderObj[key][0].OrderDetails.shipping_status) ? false : true}>
                              Returned by renter
                            </button>
                            <div className="text-danger mt-2">
                              {errorMsg}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div> </div>))}

          {pageType === "Active_Orders" && pageSubType == "RentedIntoMyproduct" &&
            Object.entries(orderObj).map(([key, value], i) => (
              <div>
                <div className="row">
                  {(orderObj[key][0]?.return_label?.labelData) && <div className="col-12 text-end">
                    <a href={`data:application/pdf;base64,${orderObj[key][0]?.return_label?.labelData}`} className="text-black-3 font-InterRegular font-20 text-decoration-none cursor-pointer" download={`return_label_${orderObj[key][0]?.id}`}>
                      Download Return Label
                      <img
                        src="/media/images/download.png"
                        className="img-fluid ms-2"
                      />
                    </a>
                  </div>}
                </div>
                <div className="row mx-0 border-cream px-2 py-4 mt-2">
                  <div className="col-12">
                    {orderObj[key].map(val => (<div className="row mx-lg-0">
                      <div className="col-12 col-md-6 col-lg-3">
                        <img
                          src={val.OrderDetails.image_url}
                          className="img-fluid rounded"
                        />
                        <p className="text-black-3 font-InterRegular font-16 mt-2 mb-0">{val.OrderDetails.title}</p>
                        <p className="text-light-gray4 font-InterExtraLight font-12">{val.sellerDetails.first_name}’s product  </p>
                      </div>

                      <div className="col-12 col-md-6 col-lg-9">
                        <div className="row">
                          <div className="col-12 col-lg-4 mt-2">
                            <p className="text-light-gray4 font-InterMedium font-20 mb-0">Rental Period</p>
                            <p className="text-black-3 font-InterLight font-18">{val.OrderDetails.rental_period} weeks</p>
                          </div>
                          <div className="col-12 col-lg-4 mt-2 mt-lg-0">
                            <p className="text-light-gray4 font-InterMedium font-20 mb-0">Delivery Method</p>
                            <p className="text-black-3 font-InterLight font-18">{val.shipping_type.zip_code == "" ? `${val?.shipping_label?.serviceCode ? val.shipping_label?.serviceCode : "-"}` : "Local Pickup"}</p>
                          </div>
                          {val.order_data?.paymentData?.brand && <div className="col-12 col-lg-4 mt-2">
                            <p className="text-light-gray4 font-InterMedium font-20 mb-0">Payment Method</p>
                            <p className="text-black-3 font-InterLight font-18">{val.order_data.paymentData?.brand} ending in {val.order_data.paymentData?.last4}</p>
                          </div>}
                        </div>
                        <div className="row">
                          <div className="col-12 col-lg-4 mt-2 mt-lg-0">
                            <p className="text-light-gray4 font-InterMedium font-20 mb-0">Rental Dates</p>
                            <p className="text-black-3 font-InterLight font-18">{moment(val.OrderDetails.start_date).format("MM/DD/YYYY")}-{moment(val.OrderDetails.end_date).format("MM/DD/YYYY")}</p>
                          </div>
                          {val.shipping_type.zip_code != "" ?
                            pageSubType == "RentedIntoMyproduct" ? <div className="col-12 col-lg-4 mt-2">
                            <p className="text-light-gray4 font-InterMedium font-20 mb-0">Contact Information</p>
                            <p className="text-black-3 font-InterLight font-18">{val.sellerDetails.first_name} {val.sellerDetails.last_name}</p>
                            <p className="text-black-3 font-InterLight font-18">{val.sellerDetails.phone_number}</p>
                            <p className="text-black-3 font-InterLight font-18">{val.sellerDetails.email}</p>
                          </div> : <div className="col-12 col-lg-4 mt-2">
                            <p className="text-light-gray4 font-InterMedium font-20 mb-0">Contact Information</p>
                            <p className="text-black-3 font-InterLight font-18">{val.order_data.shippingAddress?.first_name} {val.order_data.shippingAddress?.last_name}</p>
                            <p className="text-black-3 font-InterLight font-18">{val.order_data.shippingAddress?.phone_number}</p>
                            <p className="text-black-3 font-InterLight font-18">{val.order_data.shippingAddress?.email}</p>
                          </div> : ((val.OrderDetails.shipping_status === 0 || val.OrderDetails.shipping_status === 2) && val.shipping_label) &&
                            <div className="col-12 col-lg-4 mt-2">
                              <p className="text-light-gray4 font-InterMedium font-20 mb-0">Shipping To</p>
                              {val.shipping_label ? <><p className="text-black-3 font-InterLight font-18">{val.shipping_label?.shipTo?.name}</p>
                                <p className="text-black-3 font-InterLight font-18">
                                  {val.shipping_label?.shipTo?.street1}
                                  {val.shipping_label?.shipTo?.street2}, {val.shipping_label?.shipTo?.street3}, {val.shipping_label?.shipTo?.city}, {val.shipping_label?.shipTo?.state}, {val.shipping_label?.shipTo?.country}, {val.shipping_label?.shipTo?.postalCode}</p></> : "-"}
                            </div>}
                          {([3, 4, 5, 6, 1].includes(val.OrderDetails.shipping_status) && val.return_label) && <div className="col-12 col-lg-4 mt-2">
                            <p className="text-light-gray4 font-InterMedium font-20 mb-0">Returning To</p>
                            {val.return_label ? <><p className="text-black-3 font-InterLight font-18">{val.return_label?.shipTo?.name}</p>
                              <p className="text-black-3 font-InterLight font-18">
                                {val.return_label?.shipTo?.street1}
                                {val.return_label?.shipTo?.street2}, {val.return_label?.shipTo?.street3}, {val.return_label?.shipTo?.city}, {val.return_label?.shipTo?.state}, {val.return_label?.shipTo?.country}, {val.return_label?.shipTo?.postalCode}</p></> : "-"}
                          </div>}
                          <div className="col-12 col-lg-4 mt-2 mt-lg-0">
                            <p className="text-light-gray4 font-InterMedium font-20 mb-0">Item Price</p>
                            <p className="text-black-3 font-InterLight font-18">${val.OrderDetails.amount}</p>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-12 col-lg-4 mt-2">
                            <p className="text-light-gray4 font-InterMedium font-20 mb-0">Rental End Date</p>
                            <p className="text-black-3 font-InterLight font-18">{moment(val.OrderDetails.end_date).format("MM/DD/YYYY")}</p>
                          </div>
                          {val.shipping_type.zip_code == "" && val.OrderDetails.shipping_status === 0 && <div className="col-12 col-lg-4 mt-2">
                            <p className="text-light-gray4 font-InterMedium font-20 mb-0">Must Ship By</p>
                            <p className="text-black-3 font-InterLight font-18">{moment(val.OrderDetails.start_date).subtract(4, 'days').format("MM/DD/YYYY")}</p>
                          </div>}
                          {val.shipping_type.zip_code == "" && [2, 5].includes(val.OrderDetails.shipping_status) && <div className="col-12 col-lg-4 mt-2">
                            <p className="text-light-gray4 font-InterMedium font-20 mb-0">Must Return By</p>
                            <p className="text-black-3 font-InterLight font-18">{moment(val.OrderDetails.end_date).format("MM/DD/YYYY")}</p>
                          </div>}
                          {val.shipping_type.zip_code == "" && [2, 5, 6, 1].includes(val.OrderDetails.shipping_status) && <div className="col-12 col-lg-4 mt-2">
                            <p className="text-light-gray4 font-InterMedium font-20 mb-0">Delivery Tracking Number</p>
                            <p className="text-black-3 font-InterLight font-18">{val?.shipping_label?.trackingNumber ? val?.shipping_label?.trackingNumber : "Label Not Yet Created"}</p>
                          </div>}
                          {val.shipping_type.zip_code == "" && (val.OrderDetails.shipping_status === 6 || val.OrderDetails.shipping_status === 1) && <div className="col-12 col-lg-4 mt-2">
                            <p className="text-light-gray4 font-InterMedium font-20 mb-0">Return Tracking Number</p>
                            <p className="text-black-3 font-InterLight font-18">{val?.return_label?.trackingNumber ? val?.return_label?.trackingNumber : "Label Not Yet Created"}</p>
                          </div>}
                          <div className="col-12 col-lg-4 mt-2">
                            <p className="text-light-gray4 font-InterMedium font-20 mb-0">Order Total</p>
                            <p className="text-black-3 font-InterLight font-18">${subTotal.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    </div>))}

                    <div className="row mx-lg-0">
                      <div className="col-12">
                        <div className="row align-items-center">
                          <div className="col-12 col-lg-4 mt-4">
                            <a
                              className="text-brown font-18 font-InterRegular text-uppercase"
                              href="mailto:help@Reactyourproduct.co"
                            >
                              Report Issue
                            </a>
                          </div>
                          <div className="col-12 col-lg-8 text-lg-end mt-4">
                            {orderObj[key][0].shipping_type.zip_code == "" ? <button
                              onClick={async () => {
                                let orderDetailIdArr = [];
                                await orderObj[key].map(val => orderDetailIdArr.push(val.OrderDetails.id));
                                setOrderDetailID([...orderDetailIdArr]);
                                setShowModal(true);
                                setModalType("markAsDelivered");
                              }}
                              className="btn px-4 cus-React-btn-outline text-black text-uppercase shadow-none me-3"
                              disabled={![0, 1, 3, 4, 5, 6].includes(orderObj[key][0].OrderDetails.shipping_status) ? false : true}>
                              Mark as delivered
                            </button> : <button
                              onClick={async () => {
                                let orderDetailIdArr = [];
                                await orderObj[key].map(val => orderDetailIdArr.push(val.OrderDetails.id));
                                setOrderDetailID([...orderDetailIdArr]);
                                setShowModal(true);
                                setModalType("markPickedUp");
                              }}
                              className="btn px-4 cus-React-btn-outline text-black text-uppercase shadow-none me-3"
                              disabled={orderObj[key][0].OrderDetails.shipping_status === 7 && orderObj[key][0].OrderDetails.shipping_status !== 1 ? false : true}>
                              Mark as Picked up
                            </button>}
                            {orderObj[key][0].shipping_type.zip_code == "" ? <button
                              onClick={async () => {
                                let orderDetailIdArr = [];
                                await orderObj[key].map(val => orderDetailIdArr.push(val.OrderDetails.id));
                                setOrderDetailID([...orderDetailIdArr]);
                                setShowModal(true);
                                setModalType("markAsReturnedShipped");
                              }
                              }
                              className="btn px-3 cus-React-btn text-uppercase shadow-none mt-3 mt-md-0"
                              disabled={![0, 1, 2, 3, 4, 6].includes(orderObj[key][0].OrderDetails.shipping_status) && [5].includes(orderObj[key][0].OrderDetails.shipping_status) ? false : true}>
                              Mark as shipped
                            </button> : <button
                              onClick={async () => {
                                let orderDetailIdArr = [];
                                await orderObj[key].map(val => orderDetailIdArr.push(val.OrderDetails.id));
                                setOrderDetailID([...orderDetailIdArr]);
                                setShowModal(true);
                                setModalType("markAsDroppedOff");
                              }
                              }
                              className="btn px-3 cus-React-btn text-uppercase shadow-none mt-3 mt-md-0"
                              disabled={![0, 1, 5, 6, 2, 4].includes(orderObj[key][0].OrderDetails.shipping_status) && [3].includes(orderObj[key][0].OrderDetails.shipping_status) ? false : true}>
                              Mark as dropped off
                            </button>}
                            <div className="text-danger mt-2">
                              {errorMsg}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div></div>))}

          <div className="row">
            <div className="col-12 my-4 py-3">
              <span className="border-slate-gray-bottom d-block"></span>
            </div>
            <div className="col-12 col-lg-6 col-xl-5">
              <div className="row mx-lg-0">
                <div className="col-12 mb-2">
                  <p className="text-light-gray4 font-InterRegular font-18">{pageSubType == "RentedOutOfMyproduct" ? "Earning Details" : "Payment Details"}</p>
                </div>
                <div className="col-6">
                  <p className="text-light-gray4 font-InterLight font-18 mb-0">Item</p>
                </div>
                <div className="col-6 text-end">
                  <p className="text-light-gray4 font-InterLight font-18 mb-0 me-0">Price</p>
                </div>
                {orderDetail.length > 0 && orderDetail.map(curVal => (<><div className="col-6">
                  <p className="text-black-3 font-InterRegular font-20">{curVal.OrderDetails.title}</p>
                </div>
                  <div className="col-6 text-end">
                    <p className="text-black-3 font-InterRegular font-20">${pageSubType === "RentedOutOfMyproduct" ? curVal.OrderDetails.total_earnings : curVal.OrderDetails.amount}</p>
                  </div></>))}

                {pageSubType == "RentedIntoMyproduct" && <>
                  <div className="col-12 py-2">
                    <span className="border-slate-gray-bottom d-block"></span>
                  </div>
                  <div className="col-6">
                    <p className="text-black-3 font-InterRegular font-20">Rental Fee</p>
                  </div>
                  <div className="col-6 text-end">
                    <p className="text-black-3 font-InterRegular font-20">${(orderDetail[0]?.order_data?.shippingCharges?.rentalFee/count).toFixed(2)}</p>
                  </div>
                  {orderDetail[0]?.shipping_type?.zip_code == "" && <>
                    <div className="col-6">
                      <p className="text-black-3 font-InterRegular font-20 mb-0">Shipping Charges</p>
                    </div>
                    <div className="col-6 text-end">
                      <p className="text-black-3 font-InterRegular font-20 mb-0">${(orderDetail[0]?.order_data?.shippingCharges?.shippingCharge/count).toFixed(2)}</p>
                    </div></>}
                  <div className="col-6">
                    <p className="text-black-3 font-InterRegular font-20 mb-0">Sales Tax</p>
                  </div>
                  <div className="col-6 text-end">
                    <p className="text-black-3 font-InterRegular font-20 mb-0">${(orderDetail[0]?.order_data?.shippingCharges?.salesTax/count).toFixed(2)}</p>
                  </div></>}

                <div className="col-12 py-2 mt-2">
                  <span className="border-slate-gray-bottom d-block"></span>
                </div>

              </div>
              <div className="row mx-lg-0">
                <div className="col-6">
                  <p className="text-black-3 font-InterBold font-20 mb-0">{pageSubType == "RentedOutOfMyproduct" ? "Total Earnings" : "Total"}</p>
                </div>
                <div className="col-6 text-end">
                  {pageSubType == "RentedIntoMyproduct" ? <p className="text-black-3 font-InterBold font-20 mb-0">${subTotal.toFixed(2)}</p> : <p className="text-black-3 font-InterBold font-20 mb-0">${subTotal.toFixed(2)}</p>}
                </div>
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
          setShowModal(false);
        }}
        style={{ opacity: 1 }}
      >
        {showModal && renderModalBody()}
      </Modal>
    </>
  );
}

export default withRouter(OrderDetails);
