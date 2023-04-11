import { React, useState, useEffect } from "react";
import TitleComponent from "../../../components/Common/TitleComponent";
import clsx from "clsx";
import { ExpandMore } from "@material-ui/icons";
import SingleProduct from "../../../components/Common/SingleProduct";
import {
  upcomingRentals,
  currentlyReactd,
  myClothes,
  myRentals,
  activateDeactivateAllItems,
  getUserProfile,
  orderHistroy,
  getCards,
  getWalletDetails
} from "../../crud/auth.crud";
import { AddProduct } from "../../../components/Common/AddProduct";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { dispatchLogout } from "../../../redux/actions/authAction";
import { useHistory, Link, useLocation } from "react-router-dom";
import "react-image-crop/dist/ReactCrop.css";
import { Modal, Form, Col, Button } from "react-bootstrap";
import { showToast } from "../../../utils/utils";
import { Account } from "./Account";
import Pagination from "../../../components/Common/Pagination";
import { Accordion, AccordionSummary, AccordionDetails, Typography } from "@material-ui/core";
import moment from "moment";

const tabList = [
  { name: "My product", tabType: "product", active: true },
  { name: "Active Orders", tabType: "Active_Orders", active: false },
  { name: "Order History", tabType: "Order_History", active: false },
  { name: "Account Details", tabType: "account", active: false },
];

export const Profile = (props) => {
  const [productData, setProductData] = useState([]);
  const [currentlyReact, setCurrentlyReactd] = useState([]);
  const [rentalData, setRentalData] = useState([]);
  const [myclothes, setMyClothes] = useState([]);
  const [TabType, setTabType] = useState("product");
  const [sortBy, setSortBy] = useState(null);
  const [productManageView, setProductManageView] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [userProfile, setUserProfile] = useState({});
  const [warningModal, setWarningModal] = useState(false);
  const [shippingAddress, setShippingAddress] = useState([]);
  const [rentalActivePage, setRentalActivePage] = useState(1);
  const [rentalLimit, setRentalLimit] = useState(4);
  const [paginatedRental, setPaginatedRental] = useState([]);
  const [myClothesActivePage, setMyClothesActivePage] = useState(1);
  const [myClothesLimit, setMyClothesLimit] = useState(11);
  const [paginatedMyClothes, setPaginatedMyClothes] = useState([]);
  const [upcomingRentalActivePage, setUpcomingRentalActivePage] = useState(1);
  const [upcomingRentalLimit, setUpcomingRentalLimit] = useState(4);
  const [paginatedUpcomingRental, setPaginatedUpcomingRental] = useState([]);
  const [currentlyReactdActivePage, setCurrentlyReactdActivePage] = useState(1);
  const [currentlyReactdLimit, setCurrentlyReactdLimit] = useState(4);
  const [paginatedCurrentlyReactd, setPaginatedCurrentlyReactd] = useState([]);
  const [orderHistoryData, setOrderHistroyData] = useState([]);
  const [orderIntoproductLimit, setOrderIntoproductLimit] = useState(2);
  const [orderIntoproductActivePage, setOrderIntoproductActivePage] = useState(1);
  const [orderIntoproductCount, setOrderIntoproductCount] = useState(0);
  const [orderHistoryOutofproductData, setOrderHistroyOutofproductData] = useState([]);
  const [orderOutofproductLimit, setOrderOutofproductLimit] = useState(2);
  const [orderOutofproductActivePage, setOrderOutofproductActivePage] = useState(1);
  const [orderOutofproductCount, setOrderOutofproductCount] = useState(0);
  const [activeOrderData, setActiveOrderData] = useState([]);
  const [activeOrderIntoproductLimit, setActiveOrderIntoproductLimit] = useState(2);
  const [activeOrderIntoproductActivePage, setActiveOrderIntoproductActivePage] = useState(1);
  const [activeOrderIntoproductCount, setActiveOrderIntoproductCount] = useState(0);
  const [activeOrderyOutofproductData, setActiveOrderOutofproductData] = useState([]);
  const [activeOrderOutofproductLimit, setActiveOrderOutofproductLimit] = useState(2);
  const [activeOrderOutofproductActivePage, setActiveOrderOutofproductActivePage] = useState(1);
  const [activeOrderOutofproductCount, setActiveOrderOutofproductCount] = useState(0);
  const [isRedirect, setIsRedirect] = useState(false);
  const [cards, setCards] = useState([]);
  const [payoutAmount, setPayoutAmount] = useState(0);
  const [inProcessCount, setInProcessCount] = useState(0);
  const [walletDetails, setWalletDetails] = useState([]);
  const locationHistory = useLocation();

  const { authToken, user, userName, userid } = useSelector(
    ({ auth }) => ({
      authToken: auth.user.token,
      user: auth.user,
      userName: auth.user.first_name,
      userid: auth.user.id,
    }),
    shallowEqual
  );

  const dispatch = useDispatch();

  const history = useHistory();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    getUserProfileDetails();
    if (TabType === "Order_History") {
      fetchOrderHistroyIntoproduct();
      fetchOrderHistroyOutofproduct();
    }
    if (TabType === "Active_Orders") {
      fetchActiveOrderIntoproduct();
      fetchActiveOrderyOutofproduct();
    }
    if (TabType === "product") {
      getMyRentals();
      getMyClothes();
    }
    if (TabType === "account") {
      getUserProfileDetails();
    }
  }, [TabType, orderIntoproductActivePage, orderOutofproductActivePage, activeOrderIntoproductActivePage, activeOrderOutofproductActivePage]);

  useEffect(() => {
    onTabClick(tabList.length - 4, "product");
    getWalletDetailsHandler();
  }, []);

  useEffect(() => {
    if (locationHistory && locationHistory.state) {
      const { tabType } = locationHistory.state;
      if (tabType && tabType !== "") {
        if (tabType === "Order_History") {
          onTabClick(2, tabType);
        } else if (tabType === "Active_Orders") {
          onTabClick(1, tabType);
        }
      }
    }
  }, [locationHistory]);

  const onTabClick = (i, tabType) => {
    setTabType(tabType);
    setCurrentProduct({});
    setIsEdit(false);

    setProductManageView(false);
    tabList.map((item, index) => {
      if (index == i) {
        item.active = true;
      } else {
        item.active = false;
      }
      return item;
    });
  };

  const getWalletDetailsHandler = async () => {
    await getWalletDetails(authToken, userid).then(result => {
      let amount = result?.data?.walletAmount.toFixed(2)
      setPayoutAmount(amount);
      setInProcessCount(result?.data?.inProcessCount);
      setWalletDetails(result?.data?.walletDetails);
    })
  }


  useEffect(() => {
    const offsetStart = (rentalActivePage - 1) * rentalLimit;
    const offsetEnd = rentalLimit;
    const orgD = [...rentalData];
    let data = orgD.splice(offsetStart, offsetEnd);
    setPaginatedRental(data);
  }, [rentalLimit, rentalActivePage]);

  useEffect(() => {
    const offsetStart = (myClothesActivePage - 1) * myClothesLimit;
    const offsetEnd = myClothesLimit;
    const orgD = [...myclothes];
    let data = orgD.splice(offsetStart, offsetEnd);
    setPaginatedMyClothes(data);
  }, [myClothesLimit, myClothesActivePage]);

  useEffect(() => {
    const offsetStart = (upcomingRentalActivePage - 1) * upcomingRentalLimit;
    const offsetEnd = upcomingRentalLimit;
    const orgD = [...productData];
    let data = orgD.splice(offsetStart, offsetEnd);
    setPaginatedUpcomingRental(data);
  }, [upcomingRentalLimit, upcomingRentalActivePage]);

  useEffect(() => {
    const offsetStart = (currentlyReactdActivePage - 1) * currentlyReactdLimit;
    const offsetEnd = currentlyReactdLimit;
    const orgD = [...currentlyReact];
    let data = orgD.splice(offsetStart, offsetEnd);
    setPaginatedCurrentlyReactd(data);
  }, [currentlyReactdLimit, currentlyReactdActivePage]);

  const upcomingRental = async () => {
    let user_id = user.id;
    await upcomingRentals(authToken, user_id)
      .then((result) => {
        setProductData(result.data.payload ? result.data.payload.data : []);
        let tempData = result.data.payload ? result.data.payload.data : [];
        if (tempData.length > 0) {
          let d = [...result.data.payload?.data];
          const offsetStart = (upcomingRentalActivePage - 1) * upcomingRentalLimit;
          d = d.splice(offsetStart, upcomingRentalLimit);
          setPaginatedUpcomingRental(d);
        }
      })
      .catch((errors) => {
        // showToast("error", errors);
        setPaginatedUpcomingRental([]);
      });
  };

  const fetchOrderHistroyIntoproduct = async () => {
    let intoMyproduct = 1;
    let isActiveOrders = 0;
    await orderHistroy(authToken, user.id, orderIntoproductLimit, orderIntoproductActivePage, intoMyproduct, isActiveOrders).then(result => {

     let resultsdata= [...result?.data?.postdata?.data];
     let tempArr =[];
      if (resultsdata?.length > 0) {
       
        resultsdata?.map(val => {
            let OrderHistroyIn= {...val};

            let total=OrderHistroyIn.OrderDetails[0].amount;

            let sellerCount = OrderHistroyIn?.order_data?.shippingCharges?.sellerCount ? OrderHistroyIn.order_data?.shippingCharges?.sellerCount : 1;

            if (OrderHistroyIn?.shippingType === "shipping") {
              total += (OrderHistroyIn?.order_data?.shippingCharges?.rentalFee/sellerCount) + (OrderHistroyIn?.order_data?.shippingCharges?.shippingCharge/sellerCount) + (OrderHistroyIn?.order_data?.shippingCharges?.salesTax/sellerCount);
            } else {
              total += (OrderHistroyIn?.order_data?.shippingCharges?.rentalFee/sellerCount) + (OrderHistroyIn?.order_data?.shippingCharges?.salesTax/sellerCount);
            }
            OrderHistroyIn.total = total;
            tempArr.push(OrderHistroyIn);
        });
      }
      setOrderHistroyData([...tempArr]);
      setOrderIntoproductCount(tempArr.length);
    })
  }

  const fetchOrderHistroyOutofproduct = async () => {
    let intoMyproduct = 0;
    let isActiveOrders = 0;
    await orderHistroy(authToken, user.id, orderOutofproductLimit, orderOutofproductActivePage, intoMyproduct, isActiveOrders).then(result => {
     let resultsdata= [...result?.data?.postdata?.data];
     let tempArr =[];
      if (resultsdata?.length > 0) {
        resultsdata?.map(val => {
            let OrderHistroyOut= {...val};
            let total=OrderHistroyOut.OrderDetails[0].total_earnings;
            OrderHistroyOut.total = total;
            tempArr.push(OrderHistroyOut)
          
        });
      }
      setOrderHistroyOutofproductData([...tempArr]);
      setOrderOutofproductCount(tempArr.length);
    })
  }

  const fetchActiveOrderIntoproduct = async () => {
    let intoMyproduct = 1;
    let isActiveOrders = 1;
    await orderHistroy(authToken, user.id, activeOrderIntoproductLimit, activeOrderIntoproductActivePage, intoMyproduct, isActiveOrders).then(result => {
      setActiveOrderData([...result?.data?.postdata?.data]);
      setActiveOrderIntoproductCount(result.data?.postdata?.count);
    })
  }

  const fetchActiveOrderyOutofproduct = async () => {
    let intoMyproduct = 0;
    let isActiveOrders = 1;
    await orderHistroy(authToken, user.id, activeOrderOutofproductLimit, activeOrderOutofproductActivePage, intoMyproduct, isActiveOrders).then(result => {
      setActiveOrderOutofproductData([...result?.data?.postdata?.data]);
      setActiveOrderOutofproductCount(result.data?.postdata?.count);
    })
  }

  const currentlyReactds = async () => {
    let user_id = user.id;
    await currentlyReactd(authToken, user_id)
      .then((result) => {
        setCurrentlyReactd(
          result.data.payload ? result.data.payload.data : []
        );
        let tempData = result.data.payload ? result.data.payload.data : [];
        if (tempData.length > 0) {
          let d = [...result.data.payload?.data];
          const offsetStart = (currentlyReactdActivePage - 1) * currentlyReactdLimit;
          d = d.splice(offsetStart, currentlyReactdLimit);
          setPaginatedCurrentlyReactd(d);
        }
      })
      .catch((errors) => {
        // showToast("error", errors);
        setPaginatedCurrentlyReactd([]);
      });
  };

  const getMyRentals = async () => {
    await myRentals(authToken)
      .then((result) => {
        setRentalData(result.data.payload ? result.data.payload.data : []);
        let tempData = result.data.payload ? result.data.payload.data : [];
        if (tempData.length > 0) {
          let d = [...result.data.payload?.data];
          const offsetStart = (rentalActivePage - 1) * rentalLimit;
          d = d.splice(offsetStart, rentalLimit);
          setPaginatedRental(d);
        }
      })
      .catch((errors) => {
        let error_status = errors.response.status;
        if (error_status === 401) {
          dispatch(dispatchLogout());
          history.push("/account/login");
        }
        setPaginatedRental([]);
        // showToast("error", errors);
      });
  };

  const getMyClothes = async () => {
    await myClothes(authToken)
      .then((result) => {
        setMyClothes(result.data.payload ? result.data.payload.data : []);
        let tempData = result.data.payload ? result.data.payload.data : [];
        if (tempData.length > 0) {
          let d = [...result.data.payload?.data];
          const offsetStart = (myClothesActivePage - 1) * myClothesLimit;
          d = d.splice(offsetStart, myClothesLimit);
          setPaginatedMyClothes(d);
        }
      })
      .catch((errors) => {
        let error_status = errors.response.status;
        if (error_status !== 401) {
          // showToast("error", errors);
          setPaginatedMyClothes([]);
        }
      });
  };

  const getUserProfileDetails = async () => {
    await getUserProfile(authToken, userid)
      .then((result) => {
        setUserProfile(result.data.payload ? result.data.payload.data : {});
        setShippingAddress(
          result.data.payload
            ? result.data.payload.data &&
            result.data.payload.data.ShippingAddress
            : []
        );
      })
      .catch((errors) => {
        let error_status = errors.response.status;
        if (error_status !== 401) {
          // showToast("error", errors);
        }
      });

    // await getCards(authToken, userid).then(result => {
    //   let cardsData = result.data.cards;
    //   setCards(cardsData);
    // })
  };

  const handleChange = (key, value, index) => {
    if (key === "sortBy") {
      setSortBy(value);
      setShowModal(true);
    }
  };

  const onProductClick = (item) => {
    history.push({ pathname: "/listing-details", state: { productDetails: item.id, isEditMode: true, onPage: false } });
  };

  const handleWarningModal = () => {
    setWarningModal(true);
    setShowModal(true);
  };

  const handleRedirect = () => {
    setShowModal(false);
    onTabClick(tabList.length - 1, "account");
    if (shippingAddress.length === 0) {
      setIsRedirect(true);
    }
  };

  const orderDetails = (id, subType) => {
    history.push({ pathname: "/order-details", state: { orderId: id, type: TabType, subType } });
  }

  const rentalPaginationHandler = (number) => {
    setRentalActivePage(number);
  };

  const myClothesPaginationHandler = (number) => {
    setMyClothesActivePage(number);
  };

  const upcomingRentalPaginationHandler = (number) => {
    setUpcomingRentalActivePage(number);
  };

  const currentlyReactdPaginationHandler = (number) => {
    setCurrentlyReactdActivePage(number);
  };

  const renderTabBody = () => {
    if (TabType == "product") {
      return (
        <>
          {!productManageView ? (
            <>
              <div className="row">
                <div className="col-12 col-lg-8">
                  <h1 className="text-black-3 font-CambonRegular font-26 text-uppercase">
                    My Clothes
                  </h1>
                </div>
                {!productManageView && (
                  <div className="col-12 col-lg-4 text-end">
                    <div className="dropdown sortby">
                      <a
                        className="font-16 font-14-mobile text-black text-decoration-none text-black font-InterLight dropdown-toggle cursor-pointer"
                        id="sotyBy"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        Quick Action <ExpandMore />{" "}
                      </a>
                      <ul className="dropdown-menu py-0" aria-labelledby="sotyBy">
                        <li>
                          <a
                            className="dropdown-item text-black-3 font-InterLight cursor-pointer"
                            onClick={() => {
                              handleChange("sortBy", 0);
                            }}
                          >
                            Deactivate all items{" "}
                            {sortBy === 0 && (
                              <img
                                src="/media/images/check.png"
                                className={clsx(
                                  "img-fluid sortby-check",
                                  sortBy != 0 && "d-none"
                                )}
                              />
                            )}
                          </a>
                        </li>
                        <li>
                          <a
                            className="dropdown-item text-black-3 font-InterLight cursor-pointer"
                            onClick={() => {
                              handleChange("sortBy", 1);
                            }}
                          >
                            Activate all items{" "}
                            {sortBy === 0 && (
                              <img
                                src="/media/images/check.png"
                                className={clsx(
                                  "img-fluid sortby-check",
                                  sortBy != 1 && "d-none"
                                )}
                              />
                            )}
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>)}

                <div className="col-12 col-md-6 col-lg-4 col-xl-3 mt-4">
                  <img
                    src="/media/images/list2.png"
                    className="d-block mx-auto cursor-pointer add-product-img-style"
                    onClick={() => {
                      if (shippingAddress.length === 0) {
                        handleWarningModal();
                      } else {
                        history.push({ pathname: "/listing-details" });
                        setProductManageView(true);
                        setCurrentProduct({});
                        setIsEdit(false);
                      }
                    }}
                  />
                </div>

                {myclothes.length > 0 &&
                  <>
                    {paginatedMyClothes.map((item, index) => (
                      <div className="col-12 col-md-6 col-lg-4 col-xl-3 mt-4" key={index}>
                        <SingleProduct
                          productData={item}
                          showActiveIcon={true}
                          img={item.ProductImages[0]?.image_url}
                          title={item.title}
                          price={item?.rental_fee["2weeks"]}
                          onClick={() => onProductClick(item)}
                          isOwner={true}
                        />
                      </div>
                    ))
                    }

                    {myclothes.length > 0 && <div className="d-flex justify-content-center align-items-center py-5 cus-pagination">
                      <Pagination
                        className="pagination-bar"
                        currentPage={myClothesActivePage}
                        totalCount={myclothes.length}
                        pageSize={myClothesLimit}
                        onPageChange={page => setMyClothesActivePage(page)}
                      />
                    </div>}
                  </>
                }
              </div>
            </>
          ) : (
            <AddProduct isEdit={isEdit} currentProduct={currentProduct} />
          )
          }
        </>
      );
    } else if (TabType == "Active_Orders") {
      return (
        <>
          <div className="row account-accordion">
            <div className="col-12">
              <Accordion
                defaultExpanded
              >
                <AccordionSummary
                  expandIcon={<ExpandMore className="text-black" />}
                >
                  <Typography>
                    <h1 className="text-black-3 font-CambonRegular font-26 text-uppercase">
                      Rented out of my product
                    </h1>
                    <p className="text-black-3 font-InterRegular font-18 text-uppercase mt-4 mb-0">{activeOrderOutofproductCount} orders</p>
                  </Typography>
                </AccordionSummary>
                {activeOrderyOutofproductData && activeOrderyOutofproductData.length > 0 ? activeOrderyOutofproductData.map(val => (<AccordionDetails>
                  <Typography>
                    <div className="row border-slate-gray br-10 px-2 py-3 mb-3">
                      <div className="col-12">
                        {val.shippingType === "shipping" ? [0, 2].includes(val.OrderDetails[0].shipping_status) ? <p className="text-black-3 font-InterMedium font-18 mb-2">Ship by {moment(val.OrderDetails[0].start_date).subtract(4, 'days').format("dddd")}, {moment(val.OrderDetails[0].start_date).subtract(4, 'days').format("MMMM").substring(0, 3)} {moment(val.OrderDetails[0].start_date).subtract(4, 'days').format("DD")} {moment(val.OrderDetails[0].start_date).subtract(4, 'days').format("yyyy")}</p>
                          :
                          <p className="text-black-3 font-InterMedium font-18 mb-2">Expected return by {moment(val.OrderDetails[0].end_date).add(7, 'days').format("dddd")}, {moment(val.OrderDetails[0].end_date).add(7, 'days').format("MMMM").substring(0, 3)} {moment(val.OrderDetails[0].end_date).add(7, 'days').format("DD")} {moment(val.OrderDetails[0].end_date).add(7, 'days').format("yyyy")}</p>
                          : [0, 7].includes(val.OrderDetails[0].shipping_status) ?
                            <p className="text-black-3 font-InterMedium font-18 mb-2">Estimated pickup date {moment(val.OrderDetails[0].start_date).subtract(1, 'days').format("dddd")}, {moment(val.OrderDetails[0].start_date).subtract(1, 'days').format("MMMM").substring(0, 3)} {moment(val.OrderDetails[0].start_date).subtract(1, 'days').format("DD")} {moment(val.OrderDetails[0].start_date).subtract(1, 'days').format("yyyy")}</p>
                            :
                            <p className="text-black-3 font-InterMedium font-18 mb-2">Return due by {moment(val.OrderDetails[0].end_date).format("dddd")}, {moment(val.OrderDetails[0].end_date).format("MMMM").substring(0, 3)} {moment(val.OrderDetails[0].end_date).format("DD")} {moment(val.OrderDetails[0].end_date).format("yyyy")}</p>}
                      </div>
                      <div className="col-12 col-md-5 col-lg-4 col-xl-3">
                        <p className="text-black-3 font-InterLight font-18 mb-0">Dates</p>
                        <p className="text-black-3 font-InterLight font-18">{moment(val.OrderDetails[0].start_date).format("MM/DD/YYYY")} &nbsp;-&nbsp;  {moment(val.OrderDetails[0].end_date).format("MM/DD/YYYY")}</p>
                        <p className="text-black-3 font-InterLight font-18 mb-0">Order number</p>
                        <p className="text-black-3 font-InterLight font-18 mb-0">{val.id}</p>
                      </div>
                      <div className="col-12 col-md-7 col-lg-8 col-xl-7 mt-3 mt-md-0">
                        <div className="d-flex flex-wrap align-items-center">
                          {val.OrderDetails.length > 0 && val.OrderDetails.map(inVal => (<div className="mx-1 mt-2">
                            <img
                              src={inVal.image_url}
                              className="max-w-150 rounded"
                            />
                          </div>))}
                        </div>
                      </div>
                      <div className="col-12 col-xl-2 d-flex align-items-end justify-content-end mt-3 mt-xl-0">
                        <a
                          className="text-brown font-18 font-InterRegular text-uppercase cursor-pointer"
                          onClick={() => orderDetails(val.id, "RentedOutOfMyproduct")}
                        >
                          Order details
                        </a>
                      </div>
                    </div>
                  </Typography>
                </AccordionDetails>)) : "No Order History Found."}
                {TabType == "Active_Orders" && activeOrderOutofproductCount > 0 && <div className="d-flex justify-content-center align-items-center py-5 cus-pagination">
                  <Pagination
                    className="pagination-bar"
                    currentPage={activeOrderOutofproductActivePage}
                    totalCount={activeOrderOutofproductCount}
                    pageSize={activeOrderOutofproductLimit}
                    onPageChange={page => setActiveOrderOutofproductActivePage(page)}
                    productDetailed={true}
                  />
                </div>}
              </Accordion>
            </div>

            <div className="col-12 mt-5">
              <Accordion
                defaultExpanded
              >
                <AccordionSummary
                  expandIcon={<ExpandMore className="text-black" />}
                >
                  <Typography>
                    <h1 className="text-black-3 font-CambonRegular font-26 text-uppercase">
                      Rented into my product
                    </h1>
                    <p className="text-black-3 font-InterRegular font-18 text-uppercase mt-4 mb-0">{activeOrderIntoproductCount} orders</p>
                  </Typography>
                </AccordionSummary>
                {activeOrderData && activeOrderData.length > 0 ? activeOrderData.map(val => (<AccordionDetails>
                  <Typography>
                    <div className="row border-slate-gray br-10 px-2 py-3 mb-3">
                      <div className="col-12">
                        {val.shippingType === "shipping" ? [0, 2].includes(val.OrderDetails[0].shipping_status) ? <p className="text-black-3 font-InterMedium font-18 mb-2">Estimated delivery {moment(val.OrderDetails[0].start_date).format("dddd")}, {moment(val.OrderDetails[0].start_date).format("DD")} {moment(val.OrderDetails[0].start_date).format("MMMM").substring(0, 3)} {moment(val.OrderDetails[0].start_date).format("yyyy")}</p>
                          :
                          <p className="text-black-3 font-InterMedium font-18 mb-2">Ship by {moment(val.OrderDetails[0].end_date).format("dddd")}, {moment(val.OrderDetails[0].end_date).format("DD")} {moment(val.OrderDetails[0].end_date).format("MMMM").substring(0, 3)} {moment(val.OrderDetails[0].end_date).format("yyyy")}</p>
                          : [0, 7].includes(val.OrderDetails[0].shipping_status) ?
                            <p className="text-black-3 font-InterMedium font-18 mb-2">Pick up on {moment(val.OrderDetails[0].start_date).subtract(1, 'days').format("dddd")}, {moment(val.OrderDetails[0].start_date).subtract(1, 'days').format("DD")} {moment(val.OrderDetails[0].start_date).subtract(1, 'days').format("MMMM").substring(0, 3)} {moment(val.OrderDetails[0].start_date).subtract(1, 'days').format("yyyy")}</p>
                            :
                            <p className="text-black-3 font-InterMedium font-18 mb-2">Drop off by {moment(val.OrderDetails[0].end_date).format("dddd")}, {moment(val.OrderDetails[0].end_date).format("DD")} {moment(val.OrderDetails[0].end_date).format("MMMM").substring(0, 3)} {moment(val.OrderDetails[0].end_date).format("yyyy")}</p>}
                      </div>
                      <div className="col-12 col-md-5 col-lg-4 col-xl-3">
                        <p className="text-black-3 font-InterLight font-18 mb-0">Dates</p>
                        <p className="text-black-3 font-InterLight font-18">{moment(val.OrderDetails[0].start_date).format("MM/DD/YYYY")} &nbsp;-&nbsp;  {moment(val.OrderDetails[0].end_date).format("MM/DD/YYYY")}</p>
                        <p className="text-black-3 font-InterLight font-18 mb-0">Order number</p>
                        <p className="text-black-3 font-InterLight font-18 mb-0">{val.id}</p>
                      </div>
                      <div className="col-12 col-md-7 col-lg-8 col-xl-7 mt-3 mt-md-0">
                        <div className="d-flex flex-wrap align-items-center">
                          {val.OrderDetails.length > 0 && val.OrderDetails.map(inVal => (<div className="mx-1 mt-2">
                            <img
                              src={inVal.image_url}
                              className="max-w-150 rounded"
                            />
                          </div>))}
                        </div>
                      </div>
                      <div className="col-12 col-xl-2 d-flex align-items-end justify-content-end mt-3 mt-xl-0">
                        <a
                          className="text-brown font-18 font-InterRegular text-uppercase cursor-pointer"
                          onClick={() => orderDetails(val.id, "RentedIntoMyproduct")}
                        >
                          Order details
                        </a>
                      </div>
                    </div>
                  </Typography>
                </AccordionDetails>)) : "No Order History Found."}
                {TabType == "Active_Orders" && activeOrderIntoproductCount > 0 && <div className="d-flex justify-content-center align-items-center py-5 cus-pagination">
                  <Pagination
                    className="pagination-bar"
                    currentPage={activeOrderIntoproductActivePage}
                    totalCount={activeOrderIntoproductCount}
                    pageSize={activeOrderIntoproductLimit}
                    onPageChange={page => setActiveOrderIntoproductActivePage(page)}
                    productDetailed={true}
                  />
                </div>}
              </Accordion>
            </div>
          </div>
        </>
      );
    } else if (TabType == "Order_History") {
      return (
        <>
          <div className="row account-accordion">
            <div className="col-12 mb-2">
              <h1 className="text-black-3 font-CambonRegular font-26 text-uppercase">
                Order history
              </h1>
            </div>
            <div className="col-12">
              <Accordion
                defaultExpanded
              >
                <AccordionSummary
                  expandIcon={<ExpandMore className="text-black" />}
                >
                  <Typography>
                    <h1 className="text-black-3 font-CambonRegular font-26 text-uppercase">
                      Rented out of my product
                    </h1>
                    <p className="text-black-3 font-InterRegular font-18 text-uppercase mt-4 mb-0">{orderOutofproductCount} orders</p>
                  </Typography>
                </AccordionSummary>
                {orderHistoryOutofproductData && orderHistoryOutofproductData.length > 0 ? orderHistoryOutofproductData.map(val => (<AccordionDetails>
                  <Typography>
                    <div className="row border-slate-gray br-10 px-2 py-3 mb-3">
                      <div className="col-12">
                        {val.shippingType === "shipping" ? [0, 2].includes(val.OrderDetails[0].shipping_status) ? <p className="text-black-3 font-InterMedium font-18 mb-2">Ship by {moment(val.OrderDetails[0].start_date).subtract(4, 'days').format("dddd")}, {moment(val.OrderDetails[0].start_date).subtract(4, 'days').format("DD")} {moment(val.OrderDetails[0].start_date).subtract(4, 'days').format("MMMM").substring(0, 3)} {moment(val.OrderDetails[0].start_date).subtract(4, 'days').format("yyyy")}</p>
                          :
                          <p className="text-black-3 font-InterMedium font-18 mb-2">Expected return by {moment(val.OrderDetails[0].end_date).add(7, 'days').format("dddd")}, {moment(val.OrderDetails[0].end_date).add(7, 'days').format("DD")} {moment(val.OrderDetails[0].end_date).add(7, 'days').format("MMMM").substring(0, 3)} {moment(val.OrderDetails[0].end_date).add(7, 'days').format("yyyy")}</p>
                          : [0, 7].includes(val.OrderDetails[0].shipping_status) ?
                            <p className="text-black-3 font-InterMedium font-18 mb-2">Estimated pickup date {moment(val.OrderDetails[0].start_date).subtract(1, 'days').format("dddd")}, {moment(val.OrderDetails[0].start_date).subtract(1, 'days').format("DD")} {moment(val.OrderDetails[0].start_date).subtract(1, 'days').format("MMMM").substring(0, 3)} {moment(val.OrderDetails[0].start_date).subtract(1, 'days').format("yyyy")}</p>
                            :
                            <p className="text-black-3 font-InterMedium font-18 mb-2">Return due by {moment(val.OrderDetails[0].end_date).format("dddd")}, {moment(val.OrderDetails[0].end_date).format("DD")} {moment(val.OrderDetails[0].end_date).format("MMMM").substring(0, 3)} {moment(val.OrderDetails[0].end_date).format("yyyy")}</p>}
                      </div>
                      <div className="col-12 col-md-5 col-lg-4 col-xl-3">
                        <p className="text-black-3 font-InterLight font-18 mb-0">Dates</p>
                        <p className="text-black-3 font-InterLight font-18">{moment(val.OrderDetails[0].start_date).format("MM/DD/YYYY")} &nbsp;-&nbsp;  {moment(val.OrderDetails[0].end_date).format("MM/DD/YYYY")}</p>
                        <p className="text-black-3 font-InterLight font-18 mb-0">Order number</p>
                        <p className="text-black-3 font-InterLight font-18">{val.id}</p>
                        <p className="text-black-3 font-InterLight font-18 mb-0">Total Earning</p>
                        <p className="text-black-3 font-InterLight font-18 mb-0">${val.total}</p>
                      </div>
                      <div className="col-12 col-md-7 col-lg-8 col-xl-7 mt-3 mt-md-0">
                        <div className="d-flex flex-wrap align-items-center">
                          {val.OrderDetails.length > 0 && val.OrderDetails.map(inVal => (<div className="mx-1 mt-2">
                            <img
                              src={inVal.image_url}
                              className="max-w-150 rounded"
                            />
                          </div>))}
                        </div>
                      </div>
                      <div className="col-12 col-xl-2 d-flex align-items-end justify-content-end mt-3 mt-xl-0">
                        <a
                          className="text-brown font-18 font-InterRegular text-uppercase cursor-pointer"
                          onClick={() => orderDetails(val.id, "RentedOutOfMyproduct")}
                        >
                          Order details
                        </a>
                      </div>
                    </div>
                  </Typography>
                </AccordionDetails>)) : "No Order History Found."}
                {TabType == "Order_History" && orderOutofproductCount > 0 && <div className="d-flex justify-content-center align-items-center py-5 cus-pagination">
                  <Pagination
                    className="pagination-bar"
                    currentPage={orderOutofproductActivePage}
                    totalCount={orderOutofproductCount}
                    pageSize={orderOutofproductLimit}
                    onPageChange={page => setOrderOutofproductActivePage(page)}
                    productDetailed={true}
                  />
                </div>}
              </Accordion>
            </div>

            <div className="col-12 mt-5">
              <Accordion
                defaultExpanded
              >
                <AccordionSummary
                  expandIcon={<ExpandMore className="text-black" />}
                >
                  <Typography>
                    <h1 className="text-black-3 font-CambonRegular font-26 text-uppercase">
                      Rented into my product
                    </h1>
                    <p className="text-black-3 font-InterRegular font-18 text-uppercase mt-4 mb-0">{orderIntoproductCount} orders</p>
                  </Typography>
                </AccordionSummary>
                {orderHistoryData && orderHistoryData.length > 0 ? orderHistoryData.map(val => (<AccordionDetails>
                  <Typography>
                    <div className="row border-slate-gray br-10 px-2 py-3 mb-3">
                      <div className="col-12">
                        {val.shippingType === "shipping" ? [0, 2].includes(val.OrderDetails[0].shipping_status) ? <p className="text-black-3 font-InterMedium font-18 mb-2">Estimated delivery {moment(val.OrderDetails[0].start_date).format("dddd")}, {moment(val.OrderDetails[0].start_date).format("DD")} {moment(val.OrderDetails[0].start_date).format("MMMM").substring(0, 3)} {moment(val.OrderDetails[0].start_date).format("yyyy")}</p>
                          :
                          <p className="text-black-3 font-InterMedium font-18 mb-2">Ship by {moment(val.OrderDetails[0].end_date).format("dddd")}, {moment(val.OrderDetails[0].end_date).format("DD")} {moment(val.OrderDetails[0].end_date).format("MMMM").substring(0, 3)} {moment(val.OrderDetails[0].end_date).format("yyyy")}</p>
                          : [0, 7].includes(val.OrderDetails[0].shipping_status) ?
                            <p className="text-black-3 font-InterMedium font-18 mb-2">Pick up on {moment(val.OrderDetails[0].start_date).subtract(1, 'days').format("dddd")}, {moment(val.OrderDetails[0].start_date).subtract(1, 'days').format("DD")} {moment(val.OrderDetails[0].start_date).subtract(1, 'days').format("MMMM").substring(0, 3)} {moment(val.OrderDetails[0].start_date).subtract(1, 'days').format("yyyy")}</p>
                            :
                            <p className="text-black-3 font-InterMedium font-18 mb-2">Drop off by {moment(val.OrderDetails[0].end_date).format("dddd")}, {moment(val.OrderDetails[0].end_date).format("DD")} {moment(val.OrderDetails[0].end_date).format("MMMM").substring(0, 3)} {moment(val.OrderDetails[0].end_date).format("yyyy")}</p>}
                      </div>
                      <div className="col-12 col-md-5 col-lg-4 col-xl-3">
                        <p className="text-black-3 font-InterLight font-18 mb-0">Dates</p>
                        <p className="text-black-3 font-InterLight font-18">{moment(val.OrderDetails[0].start_date).format("MM/DD/YYYY")} &nbsp;-&nbsp;  {moment(val.OrderDetails[0].end_date).format("MM/DD/YYYY")}</p>
                        <p className="text-black-3 font-InterLight font-18 mb-0">Order number</p>
                        <p className="text-black-3 font-InterLight font-18">{val.id}</p>
                        <p className="text-black-3 font-InterLight font-18 mb-0">Order Total</p>
                        <p className="text-black-3 font-InterLight font-18 mb-0">${val.total}</p>
                      </div>
                      <div className="col-12 col-md-7 col-lg-8 col-xl-7 mt-3 mt-md-0">
                        <div className="d-flex flex-wrap align-items-center">
                          {val.OrderDetails.length > 0 && val.OrderDetails.map(inVal => (<div className="mx-1 mt-2">
                            <img
                              src={inVal.image_url}
                              className="max-w-150 rounded"
                            />
                          </div>))}
                        </div>
                      </div>
                      <div className="col-12 col-xl-2 d-flex align-items-end justify-content-end mt-3 mt-xl-0">
                        <a
                          className="text-brown font-18 font-InterRegular text-uppercase cursor-pointer"
                          onClick={() => orderDetails(val.id, "RentedIntoMyproduct")}
                        >
                          Order details
                        </a>
                      </div>
                    </div>
                  </Typography>
                </AccordionDetails>)) : "No Order History Found."}
                {TabType == "Order_History" && orderIntoproductCount > 0 && <div className="d-flex justify-content-center align-items-center py-5 cus-pagination">
                  <Pagination
                    className="pagination-bar"
                    currentPage={orderIntoproductActivePage}
                    totalCount={orderIntoproductCount}
                    pageSize={orderIntoproductLimit}
                    onPageChange={page => setOrderIntoproductActivePage(page)}
                    productDetailed={true}
                  />
                </div>}
              </Accordion>
            </div>
          </div>
        </>
      );
    } else if (TabType == "account") {
      return <Account isRedirect={isRedirect} payoutAmount={payoutAmount} inProcessCount={inProcessCount} walletDetails={walletDetails} getWalletDetailsHandler={getWalletDetailsHandler} />;
    }
  };

  const handleQuickActions = async (key) => {
    if (key === "quick_actions") {
      await activateDeactivateAllItems(authToken, {
        status: sortBy,
      })
        .then((result) => {
          if (result.data.success) {
            // showToast("success", result.data.message);
            setShowModal(false);
            getMyClothes();
            setSortBy(null);
          }
        })
        .catch((errors) => {
          // showToast("error", errors);
          setShowModal(false);
        });
    }
  };

  const renderModalBody = () => {
    if (warningModal) {
      return (
        <>
          <Modal.Header className="mt-0">
            <Button className="border-0 ms-auto bg-transparent btn btn-primary"
              onClick={() => {
                setShowModal(false)
                setWarningModal(false)
              }}>
              <img src="/media/images/X.svg" className="w-20px" />
            </Button>
          </Modal.Header>
          <Modal.Body className="py-5">
            {shippingAddress?.length === 0 ? (<h5 className="text-center font-InterRegular">
              You don't have your shipping address set up yet. Please setup
              before proceeding.
            </h5>) : <></>}
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
              onClick={handleRedirect}
              className="btn cus-React-btn px-3 py-2"
            >
              Okay
            </Button>
          </Modal.Footer>
        </>
      );
    } else {
      return (
        <div>
          <Modal.Header>
            <Modal.Title className="mt-0 font-18 font-InterMedium text-black-3">
              {sortBy === 0 ? "Deactivate" : "Activate"} all items
            </Modal.Title>
            <Button className="border-0 ms-auto bg-transparent btn btn-primary" onClick={() => setShowModal(false)}>
              <img src="/media/images/X.svg" className="w-20px" />
            </Button>
          </Modal.Header>
          <Form noValidate>
            <Modal.Body>
              <Form.Group as={Col} md="12" className={"text-center"}>
                <Form.Label className="text-center font-InterRegular font-18 text-black-3">
                  Are you sure you want to{" "}
                  {sortBy === 0 ? "Deactivate" : "Activate"} all items in My
                  Clothes ?
                </Form.Label>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button
                className="btn bg-transparent shadow-none border-0 font-InterMedium font-18 text-brown px-3"
                onClick={(e) => {
                  setShowModal(false);
                  setSortBy(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="btn cus-React-btn px-3 py-2"
                onClick={() => handleQuickActions("quick_actions")}
              >
                Confirm
              </Button>
            </Modal.Footer>
          </Form>
        </div>
      );
    }
  };

  return (
    <section className="bg-light-gray">
      <TitleComponent title={props.title} icon={props.icon} />
      <div className="container">
        <div className="row align-items-center py-4 px-2 px-md-0">
          <div className="col-12 col-lg-8">
            <h1 className="text-brown font-CambonRegular font-35 text-uppercase mb-0 line-before">
              Welcome to React, {userName}{" "}
            </h1>
          </div>
          <div className="col-12 col-lg-4 mt-3 mt-lg-0 text-lg-end">
            <h1 className="text-black-3 font-InterRegular font-30 text-uppercase mb-0">
              <img src="/media/images/wallet.png" className="img-fluid" /> ${payoutAmount}
            </h1>
          </div>
        </div>
        <div className="row justify-content-center mt-3 px-2 px-md-0">
          <div className="col-12">
            <div className="d-flex flex-column flex-md-row align-items-md-center border-slate-gray-bottom">
              {tabList?.map((item, index) => (
                <div
                  className={clsx(index == 0 ? "pe-md-4 pe-lg-5" : "px-md-4 px-lg-5")}
                  key={index}
                >
                  <h1
                    className={clsx(
                      "font-16 font-InterRegular cursor-pointer mb-md-0 pb-md-2",
                      item.active == true ? "text-brown border-cream-bottom" : "text-black"
                    )}
                    onClick={() => onTabClick(index, item.tabType)}
                  >
                    {" "}
                    {item.name}{" "}
                  </h1>
                </div>
              ))}
            </div>
          </div>

          <div className="col-12">
            <div className="pt-4 pb-5 mb-5">{renderTabBody()}</div>
          </div>
        </div>
      </div>

      <Modal
        centered="true"
        size="lg"
        show={showModal}
        onHide={() => {
          setShowModal(false);
        }}
        style={{ opacity: 1 }}
      >
        {showModal && renderModalBody()}
      </Modal>
    </section>
  );
};
