import React, {
  Fragment,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";
import { Close, ArrowRightAlt } from "@material-ui/icons";
import Sidebar from "../SideBar/Sidebar";
import clsx from "clsx";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import {
  addSearchText,
  deleteSearchText,
} from "../../redux/actions/searchTextAction";
import { useLocation, Link, useHistory } from "react-router-dom";
import { TextField, InputAdornment } from "@material-ui/core";
import { Formik } from "formik";
import { Modal, Form } from "react-bootstrap";
import { getCartList, searchProducts, getGeneralAttributes, removeFromCartAPI } from "../../app/crud/auth.crud";
import {
  addSearchProduct,
  removeSearchProduct,
} from "../../redux/actions/searchProductAction";
import { addToCart, removeFromCart } from "../../redux/actions/cartAction";
import AppContext from "../../contextProvider/AppContextProvider/AppContext";
import { showToast } from "../../utils/utils";
import moment from "moment";
import { dispatchLogout } from "../../redux/actions/authAction";

const Header = (props) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const history = useHistory();
  const cartContext = useContext(AppContext);
  const cartRef = useRef();

  const { showCart, setShowCart } = cartContext;

  const showRef = useRef();
  const [filterType, setFilterType] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const { authToken } = useSelector(
    ({ auth }) => ({
      authToken: auth?.authToken,
      authUser: auth?.user,
    }),
    shallowEqual
  );

  useEffect(() => {
    const checkIfClickedOutside = e => {
      if (showMenu && showRef && showRef.current && !showRef.current.contains(e.target)) {
        setShowMenu(false)
      }
    }

    document.addEventListener("mousedown", checkIfClickedOutside)

    return () => {
      document.removeEventListener("mousedown", checkIfClickedOutside)
    }
  }, [showMenu])

  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      if (
        showCart &&
        cartRef &&
        cartRef.current &&
        !cartRef.current.contains(e.target)
      ) {
        setShowCart(false);
      }
    };

    document.addEventListener("mousedown", checkIfClickedOutside);

    return () => {
      document.removeEventListener("mousedown", checkIfClickedOutside);
    };
  }, [showCart]);

  useEffect(() => {
    setShowCart(false);
  }, [location.pathname])

  const dispatch = useDispatch();

  const [show, setShow] = useState(false);

  const [data, setData] = useState({});

  const [cartDetails, setCartDetails] = useState([]);
  const [filterTypes, setFilterTypes] = useState([]);
  const [occasion, setOccasion] = useState([]);
  const [subTotal, setSubtotal] = useState(0);

  const { isAuthorized } = useSelector(
    ({ auth }) => ({
      isAuthorized: auth.user != null,
    }),
    shallowEqual
  );

  const { authUser } = useSelector(
    ({ auth }) => ({
      authUser: auth.user,
    }),
    shallowEqual
  );

  const { searchText } = useSelector(
    ({ searchProduct }) => ({ searchText: searchProduct.searchtext }),
    shallowEqual
  );
  const { cartData } = useSelector(
    ({ cartReducer }) => ({ cartData: cartReducer.cart }),
    shallowEqual
  );

  useEffect(() => {
    getCartDetails();
    getGeneralAttributes()
      .then((result) => {
        if (result.data.payload) {
          let data = result.data.payload;

          // Types
          let filterTyped = data.type.map(item => {
            let obj = {};
            obj.name = item.type;
            obj.active = false;
            return obj;
          });
          filterTyped = filterTyped.splice(0, 10);
          setFilterTypes(filterTyped);

          // Occasion
          let occasions = data.occasion.map(item => {
            let obj = {};
            obj.name = item;
            obj.active = false;
            return obj;
          });
          occasions = occasions.splice(0, 10);
          setOccasion(occasions);
        }
      })
      .catch((errors) => {
      });
  }, []);

  const items = [
    { name: "home", label: "Home", url: "/" },
    { name: "profile", label: "Profile", url: "/profile" },
    {
      name: "rent", label: "Rent",
      url: [
        {
          title: 'Clothing',
          list: filterTypes
        },
        {
          title: 'Occasion',
          list: occasion
        },
        {
          title: 'City for Local Pickup',
          list: [
            {
              name: 'New York', url: '/products',
            },
            {
              name: 'Los Angeles', url: '/products',
            },
            {
              name: 'Boston', url: '/products',
            },
          ]
        }
      ]
    },
    { name: "search", label: "List", url: "/products" },
    {
      name: "about", label: "About",
      url: [
        {
          title: 'About',
          list: [
            {
              name: 'Our Story', url: '/our-story',
            },
            {
              name: 'How it Works', url: '/how-it-works',
            },
            {
              name: 'FAQ', url: '/faq',
            },
          ]
        },
      ]
    },
    { name: "contact", label: "Contact" },
    { name: "logout", label: "Logout", url: "/logout" },
  ];

  const filterItems = [
    { name: "Rent", filterType: "rent" },
    { name: "List", filterType: "list", url: "/profile" },
    { name: "About", filterType: "about" },
    { name: "Contact", filterType: "contact" },
  ];

  const rent = [
    {
      title: 'Clothing',
      list: filterTypes
    },
    {
      title: 'Occasion',
      list: occasion
    },
    {
      title: 'City for Local Pickup',
      list: [
        {
          name: 'New York',
        },
        {
          name: 'Los Angeles',
        },
        {
          name: 'Boston',
        },
      ]
    }
  ];

  const about = [
    {
      title: 'About',
      list: [
        {
          name: 'Our Story', url: '/our-story',
        },
        {
          name: 'How it Works', url: '/how-it-works',
        },
        {
          name: 'FAQ', url: '/faq',
        },
      ]
    },
  ];

  const onProductClick = (item) => {
    setShowCart(false);
    history.push({ pathname: `/product-details/abc_jhf_${item.id}`, state: { productId: item.id } });
  }

  const onRemove = async (product_id) => {
    const data = {
      user_id: authUser.id,
      product_id: product_id
    };
    await removeFromCartAPI(authToken, data)
      .then(async (result) => {
        if (result.data.success) {
          getCartDetails();
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

  const handleRemoveItem = async (id) => {
    if (authToken) {
      await onRemove(id);
    } else {
      dispatch(removeFromCart(id));
    }
  };

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
        setShowMenu(false);
        setShow(false);
        history.push({ pathname: "/search" });
      })
      .catch((err) => {
        setData([]);
      });
  };

  const getCartDetails = async () => {
    if (authUser) {
      await getCartList(authUser.token, authUser.id)
        .then(async(result) => {
          var data = result.data.postdata.data;
          setCartDetails(data);
          let cost = 0;
          await data.map(async (val) => {
            cost += parseInt(val.amount);
          });
          setSubtotal(cost);
        })
        .catch(async(errors) => {
          let error_status = errors.response.status;
          if (error_status == 401) {
            setCartDetails(cartData);
            let cost = 0;
            await cartData.map(async (val) => {
              cost += parseInt(val.amount);
            });
            setSubtotal(cost);
            dispatch(dispatchLogout());
          }

          if (error_status !== 401) {
            // showToast("error", errors);
          }
        });
    } else {
      setCartDetails(cartData);
      let cost = 0;
      await cartData.map(async (val) => {
        cost += parseInt(val.amount);
      });
      setSubtotal(cost);
    }
  };

  useEffect(() => {
    getCartDetails();
  }, [cartData])

  const renderModalBody = () => {
    return (
      <div>
        <Formik
          enableReinitialize
          validateOnChange={false}
          validateOnBlur={false}
          validate={(values) => {
            const errors = {};

            if (values.searchText.trim().length <= 0) {
              errors.searchText = "Provide valid search value";
            }

            return errors;
          }}
          onSubmit={(values, { setStatus, setSubmitting }) => {
            getSearchProducts(values);
          }}
          initialValues={{
            searchText: searchText ? searchText : "",
          }}
        >
          {({
            handleSubmit,
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
          }) => (
            <Form noValidate={true} onSubmit={handleSubmit}>
              <Modal.Body className="bg-light-gray">
                <div className="row align-items-center justify-content-center">
                  <div className="col-10 col-md-6 col-lg-4">
                    <TextField
                      id="outlined-basic"
                      label="Search"
                      variant="outlined"
                      name="searchText"
                      className="w-100 search"
                      onChange={handleChange("searchText")}
                      onBlur={handleBlur}
                      value={values.searchText}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {values.searchText.length <= 0 ? (
                              <img
                                src="/media/images/search.png"
                                className="mb-1"
                              />
                            ) : (
                              <button type="submit" className="btn shadow-none">
                                <ArrowRightAlt />
                              </button>
                            )}
                          </InputAdornment>
                        ),
                      }}
                    />
                    {touched.searchText && errors.searchText && (
                      <div>
                        <span className="text-danger" role="alert">
                          {errors.searchText}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="col-2 col-md-1 ps-0">
                    <button
                      type="button"
                      className="btn shadow-none"
                      onClick={() => {
                        setShow(false);
                        history.push({ data: data });
                        dispatch(removeSearchProduct());
                      }}
                    >
                      <Close />
                    </button>
                  </div>
                </div>
              </Modal.Body>
            </Form>
          )}
        </Formik>
      </div>
    );
  };

  const renderFilterBody = () => {

    if (filterType == "rent") {
      return (
        <div className="row">
          {rent?.map((item, index) => (
            <div className="col-12 col-md-6 col-lg-4 mt-3" key={item.title}>
              <div className="row">
                <div className="col-12">
                  <h3 className="font-20 text-black-3 font-InterRegular mt-2 text-uppercase">{item.title}</h3>
                </div>

                {item.list?.map((items, index) => (
                  <div className="col-12 col-md-6 mt-2" key={items.name}>
                    <a
                      className="text-black-3 text-decoration-none font-18 font-InterLight cursor-pointer"
                      // to={item.url}
                      onClick={() => {
                        getSearchProducts({ searchText: items.name, type: item.title })
                      }}
                    >
                      {items.name}
                    </a>
                  </div>
                ))}
                <div className="col-12 col-md-6 mt-2">
                  <Link
                    className="text-brown font-18 font-InterRegular"
                    to="/products"
                    onClick={() => {
                      setShowMenu(false)
                    }}
                  >
                    View All
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    } else if (filterType == "about") {
      return (
        <div className="row">
          {about?.map((item, index) => (
            <div className="col-12 col-lg-4 mt-3" >
              <div className="row">
                <div className="col-12">
                  <h3 className="font-20  text-black-3 font-InterRegular mt-2 text-uppercase">{item.title}</h3>
                </div>

                {item.list?.map((item, index) => (
                  <div className="col-12 mt-2">
                    <Link
                      className="text-black-3 text-decoration-none font-18 font-InterLight"
                      to={item.url}
                      onClick={() => {
                        setShowMenu(false)
                      }}
                    >
                      {item.name}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }
  }

  return (
    <Fragment>
      <div
        className={clsx(
          "sticky-header bg-light-gray",
          currentPath.startsWith("/account") && "auth-header"
        )}
        id="outer-container"
      >
        {currentPath.startsWith("/account") && <div className="pt-3"></div>}
        {/* Side Menu code starts */}
        <Sidebar
          pageWrapId={"page-wrap"}
          outerContainerId={"outer-container"}
          items={items}
          getSearchProducts={getSearchProducts}
        />
        {/* Side Menu code end */}

        {(!currentPath.startsWith("/account") || currentPath === "/account/account-verification") && (
          <section className="bg-cream">
            <div className="container">
              <div className="row align-items-center min-h-46">
                <div className="col-12">
                  {(
                    <h2 className="text-white font-16 font-InterRegular text-center mb-0">
                      Use FIRSTRENTAL15 to get 15% off your first rental!*
                    </h2>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className={`img-header-border ${currentPath.startsWith("/account") && 'border-slate-gray-bottom border-slate-gray-top'}`}>
          <div className="container position-relative">
            <div className="row mx-0">
              <div className="col-12">
                <nav className="row navbar navbar-light bg-transparent">
                  <ul className="col-lg-4 navbar-nav logo-position">
                    <li className="nav-item">
                      <Link
                        className="text-black text-decoration-none font-30 font-InterRegular mb-0"
                        to="/"
                      >
                        <svg height="60" width="200">
                          <text x="0" y="42" className="font-35 font-BrandonRegular header-logo-width">React</text>
                        </svg>
                      </Link>
                    </li>
                  </ul>
                  <ul className="col-lg-4 navbar-nav d-lg-flex flex-row align-items-center justify-content-center d-none ms-lg-auto">
                    {filterItems?.map((item, index) => (
                      <li className="nav-item me-4" key={index}>
                        {item.filterType == 'list' || item.filterType == 'contact' ?
                          item.filterType === 'contact' ? <a className="nav-link font-16 font-InterExtraLight font-16 text-black-3 cursor-pointer" href="mailto:info@Reactyourproduct.co" onMouseEnter={() => {
                            setShowMenu(false)
                          }}>{item.name}</a> :
                            <Link
                              className={`nav-link font-16 font-InterExtraLight font-16 cursor-pointer ${currentPath == '/profile' ? 'text-brown' : 'text-black-3'}`}
                              to={!isAuthorized ? "/account/login" : item.url}
                              onMouseEnter={() => {
                                setShowMenu(false)
                              }}
                            >
                              {item.name}
                            </Link>
                          :
                          item.filterType == 'rent' ?
                            <Link className={`nav-link font-16 font-InterExtraLight font-16 cursor-pointer ${(currentPath == '/products' || currentPath == '/search') ? 'text-brown' : 'text-black-3'}`}
                              to={'/products'}

                              onMouseEnter={() => {
                                setShowMenu(true)
                                setFilterType(item.filterType)
                              }}
                            >{item.name}</Link> :
                            <a className={`nav-link font-16 font-InterExtraLight font-16 cursor-pointer ${(currentPath == '/our-story' || currentPath == '/how-it-works' || currentPath == '/faq') ? 'text-brown' : 'text-black-3'}`}
                              onClick={() => {
                                setShowMenu(true)
                                setFilterType(item.filterType)
                              }}
                              onMouseEnter={() => {
                                setShowMenu(true)
                                setFilterType(item.filterType)
                              }}
                            >{item.name}</a>
                        }
                      </li>
                    ))}
                  </ul>
                  <ul className="col-lg-4 navbar-nav d-flex flex-row align-items-center justify-content-end z-1 ms-auto">
                    <li className="nav-item me-4">
                      <a className="nav-link cursor-pointer" onClick={() => setShow(true)}>
                        <img
                          src="/media/images/search.svg"
                          className="header-icon-size"
                        />
                      </a>
                    </li>
                    <li className="nav-item me-4 d-none d-lg-block">
                      <Link
                        className="nav-link"
                        to={!isAuthorized ? "/account/login" : "/profile"}
                      >
                        <img
                          src="/media/images/user.svg"
                          className="header-icon-size"
                        />
                      </Link>
                    </li>
                    {!currentPath.startsWith("/cart") && !currentPath.startsWith("/checkout") && <li className="nav-item me-lg-4">
                      <a
                        className="nav-link cursor-pointer position-relative"
                        onClick={(e) => {
                          history.push({ pathname: "/cart" });
                          setShowCart(false);
                          // setShowCart(true);
                          // getCartDetails();
                        }}
                      >
                        <img
                          src="/media/images/cart.svg"
                          className="header-icon-size"
                        />

                        <span className="cus-cart-notification">{cartDetails?.length}</span>
                      </a>
                    </li>}
                    {!currentPath.startsWith("/account") && (
                      <li className="nav-item d-none d-lg-block">
                        <Link
                          className="nav-link"
                          to={"/favorite"}
                        >
                          <img
                            src="/media/images/heart.svg"
                            className="header-icon-size"
                          />
                        </Link>
                      </li>
                    )}
                  </ul>
                </nav>
              </div>
            </div>

            {showCart && (
              <div
                className={`bg-light-gray px-3 px-md-5 py-4 shadow ${!currentPath.startsWith("/account") ? "cus-cart-popup" : "cus-cart-popup-auth"}`}
                ref={cartRef}
              >
                <div className="row mx-0 align-items-center">
                  <div className="col-10 ps-0">
                    <h1 className="text-brown font-CambonRegular font-30 text-uppercase text-nowrap">
                      Shopping Cart
                    </h1>
                  </div>
                  <div className="col-2 pe-0 text-end">
                    <Close className="text-brown font-30 cursor-pointer" onClick={() => {
                      setShowCart(false)
                    }} />
                  </div>
                </div>
                <div className="row mx-0 border-slate-gray-bottom py-2">
                  <div className="col-6 ps-0">
                    <p className="text-black-3 font-InterLight font-14 text-uppercase mb-0">
                      {`${cartDetails.length} ${(cartDetails.length > 1) ? "Items" : "Item"}`}
                    </p>
                  </div>
                  <div className="col-6 pe-0 text-end">
                    <Link
                      to="/cart"
                      className="font-InterLight font-14 text-black-3 text-uppercase"
                    >
                      My Cart
                    </Link>
                  </div>
                </div>
                {cartDetails.length > 0 ? <div className="cart-items-height d-flex flex-column justify-content-between">
                  <div>
                  {cartDetails.map(val => (<div className="row mx-0 justify-content-center border-slate-gray-bottom py-3">
                    <div className="col-12 col-sm-10 ps-sm-0">
                      <div className="row">
                        <div className="col-12 col-sm-4">
                          <img
                            src={val?.image_url}
                            className="img-fluid d-block mx-auto cursor-pointer"
                            onClick={() => onProductClick({ id: val?.product_id })}
                          />
                        </div>
                        <div className="col-12 col-sm-8 mt-4 mt-sm-0 d-flex flex-column justify-content-between">
                          <div>
                            <h4 className="text-black-3 font-InterRegular text-uppercase font-18 cursor-pointer" onClick={() => onProductClick({ id: val?.product_id })}>
                              {val?.title}
                            </h4>
                            <p className="text-black-3 font-InterLight font-16 mb-1 pt-2">
                              Rental Period: {val?.rental_period} weeks
                            </p>
                            <p className="text-black-3 font-InterLight font-16">
                              Rental dates: {moment(val?.start_date).format("MM/DD/YYYY")} - {moment(val?.end_date).format("MM/DD/YYYY")}
                            </p>
                          </div>
                          <div>
                            <h1 className="text-black-3 font-InterRegular font-20 mb-0">
                              ${val?.amount}
                            </h1>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-sm-2 text-end">
                      <img
                        src="/media/images/delete.png"
                        className="cursor-pointer img-fluid"
                        onClick={() => {
                          // setShowModal(true);
                          // setCurrentProduct(product);
                          handleRemoveItem(val?.product_id);
                        }}
                      />
                    </div>
                  </div>))}
                  </div>
                  <div className="row mx-0 align-items-center">
                    <div className="col-12 pe-0 text-end mt-3">
                      <h1 className="text-black-3 font-InterRegular font-20">
                        Subtotal: ${subTotal}
                      </h1>
                    </div>
                    <div className="col-6 px-0">
                      <Link
                        className="text-brown font-18 font-InterRegular text-uppercase"
                        to={"/products"}
                      >
                        Back to shop
                      </Link>
                    </div>
                    <div className="col-6 px-0 text-sm-end">
                      <button
                        className="btn cus-React-btn text-uppercase shadow-none"
                        onClick={() => {
                          history.push({ pathname: "/cart" });
                          setShowCart(false);
                        }}
                      >
                        Go to Cart
                      </button>
                    </div>
                  </div>
                </div> : <div className="row justify-content-center mt-5 mx-0">
                  <div className="col-12 text-center">
                    <h3 className="text-black font-CambonRegular">
                      Your cart is empty
                    </h3>
                    <Link
                      className="btn cus-React-btn py-2 px-4 shadow-none mt-3"
                      to={{ pathname: "/products" }}
                    >
                      Continue Renting{" "}
                    </Link>
                  </div>
                </div>}
              </div>
            )}
          </div>
        </section>

        <div className="container-fluid p-0">
          <div className="row mx-0">
            <div className="col-12 position-relative m-0" ref={showRef}>
              {showMenu &&
                <div className="menu-style d-none d-md-flex img-drop-shadow"
                  onMouseLeave={() => {
                    setShowMenu(false)
                  }}>
                  <div className="container">
                    {renderFilterBody()}
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <Modal
        className="search-modal"
        size="lg"
        show={show}
        onHide={() => {
          setShow(false);
        }}
        style={{ opacity: 1 }}
      >
        {show && renderModalBody()}
      </Modal>
    </Fragment>
  );
};

export default Header;
