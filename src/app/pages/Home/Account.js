import { React, useState, useEffect, Fragment } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  CircularProgress,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormControl, InputLabel, Select, MenuItem
} from "@material-ui/core";
import { ExpandMore } from "@material-ui/icons";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import {
  addAddress,
  getUserProfile,
  updateAddress,
  updateProfile,
  addCard, getCards, deleteCard, addBlackoutDates, getBlackoutDates, cashOut, getBankAccounts, deleteBankAccount, addBankAccountApi
} from "../../crud/auth.crud";
import { showToast } from "../../../utils/utils";
import clsx from "clsx";
import { Profile } from "./Profile";
import { Link } from "react-router-dom";
import CryptoJS from "crypto-js";
import DatePicker from "react-multi-date-picker";
import moment from "moment";
import { Modal, Button } from "react-bootstrap";
import { dispatchLogin } from "../../../redux/actions/authAction";
import { routingNumber, accountNumber } from "us-bank-account-validator";

export const Account = (props) => {
  const { isRedirect } = props;

  const [userProfile, setUserProfile] = useState({});
  const [isShipping, setIsShipping] = useState(false);
  const [isProfile, setIsProfile] = useState(false);
  const [shippingAddress, setShippingAddress] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [accountTouched, setAccountTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [shippingTouched, setShippingTouched] = useState(false);
  const [cards, setCards] = useState([]);
  const [card, setCard] = useState("addNew");
  const [addNewCard, setAddCard] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [blackoutDates, setBlackoutDates] = useState([]);
  const [addNewBlackoutDate, setAddNewBlackoutDate] = useState(false);
  const [activeBlackoutDate, setActiveBlackoutDate] = useState({
    start_date: "",
    end_date: ""
  });
  const [updateBlackoutDate, setUpdateBlackoutDate] = useState(false);
  const [curBlackoutId, setCurrentBlackoutId] = useState("");
  const [modalType, setModalType] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [shipErrorMsg, setShipErrorMsg] = useState("");
  const [cardErrorMsg, setCardErrorMsg] = useState("");
  const [bankAccount, setBankAccount] = useState([]);
  const [addBankAccount, setAddBankAccount] = useState(false);
  const [bankAccErrorMsg, setBankAccErrorMsg] = useState("");
  const [insufficientAmount, setInsufficientAmount] = useState("");
  const [inProcessErr, setInProcessErr] = useState("");
  const [addBankAccErr, setAddBankAccErr] = useState("");

  const dispatch = useDispatch();

  const handleDateModal = (key) => {
    if (key === "add") {
      setShowModal(true);
    } else if (key === "edit") {
      setShowModal(true);
    }
  }

  const validationSchema = Yup.object().shape({
    first_name: Yup.string().matches(/^[A-Za-z ]*$/, 'Please enter valid name').required("First Name is required")
    .min(2, "A first name minimum have 2 character.")
    .max(40, "First Name must be of  less than 40 characters"),
    last_name: Yup.string().matches(/^[A-Za-z ]*$/, 'Please enter valid name').required("Last Name is required")
    .min(2, "A last name must have 2 character.")
    .max(40, "Last Name must be of less than 40 characters"),
    email: Yup.string()
      .trim()
      .required("Email is required")
      .email("Invalid Email"),
    phone_number: Yup.string()
      .matches(/^\d+$/, "Provide Valid Phone Number")
      .max(10, "A cell phone number must have 10 digits.")
      .min(10, "A cell phone number must have 10 digits.")
      .required("Phone Number is required")
      .nullable(false),
    showPassword: Yup.boolean(),
    password: Yup.string().when("showPassword", {
      is: true,
      then: Yup.string()
        .trim(" ")
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
          "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character"
        )
        .required("Password is required"),
    }),
    confirm_password: Yup.string().when("showPassword", {
      is: true,
      then: Yup.string()
        .trim(" ")
        .oneOf(
          [Yup.ref("password"), null],
          "Password and Confirm Password must match"
        )
        .required("Confirm Password is required"),
    }),
  });

  const validationShippingSchema = Yup.object().shape({
    name: Yup.string().trim().matches(/^[A-Za-z ]*$/, 'Please enter valid name').required("Name is required"),
    address: Yup.string().trim().required("Address is required"),
    zip_code: Yup.string().matches(/^[0-9]{5}(?:-[0-9]{4})?$/, "Must be a valid ZIP code")
      .required("ZIP code is required"),
    phone_number_2: Yup.string()
      .matches(/^\d+$/, "Provide Valid Phone Number")
      .max(10, "A cell phone number must have 10 digits.")
      .min(10, "A cell phone number must have 10 digits.")
      .required("Phone Number is required")
      .nullable(false),
  });

  const dateValidationSchema = Yup.object().shape({
    start_date: Yup.string().trim().required("Date is required"),
    end_date: Yup.string().trim().required("Date is required")
  });

  const cardValidationSchema = Yup.object().shape({
    name: Yup.string().required("Name required"),
    cardNumber: Yup.string()
      .matches(/^[0-9\s]*$/, "Only numbers allowed")
      .max(19, "Enter valid card number.")
      .min(19, "Enter valid card number.")
      .required("Card number is required"),
    expirationDate: Yup.string().required("Required")
      .max(7, "Enter valid date.")
      .min(7, "Enter valid date."),
    cardCvc: Yup.string()
      .min(3, "Enter valid CVC")
      .max(3, "Enter valid CVC")
      .required("CVC required."),
    zipCode: Yup.string().required("Required")
      .matches(/^[0-9]{5}(?:-[0-9]{4})?$/, "Must be a valid ZIP code"),
    billingAddress: Yup.string().required("Billing Address required")
  });

  const bankAccoutValidationSchema = Yup.object().shape({
    country: Yup.string().required("Required"),
    account_holder_name: Yup.string().required("Required"),
    account_holder_type: Yup.string().required("Required"),
    routing_number: Yup.string()
      .required("Required")
      .matches(/^[0-9\s]*$/, "Only numbers allowed")
      .test("is_valid", "Enter valid routing number", async (val) => {
        let validation = await routingNumber(val);
        return validation.isValid;
      }),
    account_number: Yup.string()
      .required("Required")
      .matches(/^[0-9\s]*$/, "Only numbers allowed")
      .test("is_valid", "Enter valid account number", async (val) => {
        let validation = await accountNumber(val);
        return validation.isValid;
      }),
    confirm_account_number: Yup.string()
      .oneOf(
        [Yup.ref("account_number"), null],
        "Account Number and Confirm Account Number must match"
      )
      .required("Required")
  });

  const initialProfileValues = {
    first_name: userProfile ? userProfile.first_name ? userProfile.first_name : "" : "",
    last_name: userProfile ? userProfile && userProfile.last_name : "",
    email: userProfile ? userProfile.email ? userProfile.email : "" : "",
    phone_number: userProfile ? userProfile?.phone_number ? userProfile.phone_number : "" : "",
    showPassword: false,
    password: "",
    confirm_password: "",
    existing_email: userProfile ? userProfile.email ? userProfile.email : "" : "",
    user_id: userProfile ? userProfile.id ? userProfile.id : "" : ""
  };

  const initialShippingValues = {
    address_id: userProfile
      ? userProfile.ShippingAddress && userProfile.ShippingAddress[0]?.id
      : "",
    name: userProfile
      ? userProfile.ShippingAddress && userProfile.ShippingAddress[0]?.name
      : "",
    address: userProfile
      ? userProfile.ShippingAddress && userProfile.ShippingAddress[0]?.address
      : "",
    zip_code: userProfile
      ? userProfile.ShippingAddress && userProfile.ShippingAddress[0]?.zip_code
      : "",
    phone_number_2: userProfile
      ? userProfile.ShippingAddress &&
      userProfile.ShippingAddress[0]?.phone_number
      : "",
  };

  const { authToken, userid, authUser } = useSelector(
    ({ auth }) => ({
      authToken: auth.user.token,
      userid: auth.user.id,
      authUser: auth?.user,
    }),
    shallowEqual
  );

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
  };

  const sendPayoutRequest = async (setSubmitting) => {
    setSubmitting(true);
    await props.getWalletDetailsHandler();
    let obj = {
      user_id: userid,
      walletDetails: props.walletDetails,
      bankAccountId: bankAccount[0].id
    }
    await cashOut(authToken, obj).then(async (result) => {
      if (result.data.success) {
        if (result.data.accountLink === true) {
          window.location.href = result.data.data.url;
        } else {
          await props.getWalletDetailsHandler();
        }
      }
    })
      .catch((errors) => {
        let error_status = errors.response.status;
        if (error_status !== 401) {
          console.log("ERROR : ", errors)
          setAddBankAccErr(errors.response.data.message);
          // showToast("error", errors);
        }
      });
    setSubmitting(false);
  }

  useEffect(() => {
    window.scrollTo(0, 0);
    let handleListener = () => {
      setAddBankAccErr("");
      setInProcessErr("");
      setInsufficientAmount("");
    }
    window.addEventListener('scroll', handleListener);
    return () => {
      window.removeEventListener('scroll', handleListener);
    };
  }, []);

  useEffect(() => {
    getUserProfileDetails();
    // getCard();
    getBankAccount();
    getBlackoutDateHandler();
  }, []);

  const handleUpdateAccountProfile = (values) => {
    if (passwordTouched && values?.password.length && values?.confirm_password.length > 0) {
      setLoading(true);
      updateProfile(authToken, values)
        .then((result) => {
          // if (result.data.success) {
          //   showToast("success", result.data.message);
          // }
          setTimeout(() => {
            setLoading(false);
          }, 2500);
        })
        .catch((errors) => {
          let error_status = errors.response.status;
          if (error_status !== 401) {
            // showToast("error", errors);
            console.log("ERROR : ", errors.response.data.message)
            setErrorMsg(errors.response.data.message);
          }
        });
      setPasswordTouched(false);
    } else if (accountTouched) {
      setLoading(true);
      ["password", "confirm_password"].forEach(function (key) {
        delete values[key];
      });
      updateProfile(authToken, values)
        .then(async (result) => {
          if (result.data.success) {
            // showToast("success", result.data.message);
            getUserProfileDetails();
            await getUserProfile(authToken, userid)
              .then((result) => {
                let userD = { ...result.data.payload.data };
                userD.token = authToken;
                dispatch(dispatchLogin(userD));
              })
              .catch((errors) => {
                let error_status = errors.response.status;
                if (error_status !== 401) {
                  // showToast("error", errors);
                  setErrorMsg(errors.response.data.message);
                }
              });
          }
          setTimeout(() => {
            setLoading(false);
          }, 2500);
        })
        .catch((errors) => {
          let error_status = errors.response.status;
          if (error_status !== 401) {
            // showToast("error", errors);
            setErrorMsg(errors.response.data.message);
          }
        });
      setAccountTouched(false);
    }
    setLoading(false);
  };

  const handleAddShippingSubmit = (values) => {
    setLoading(true);
    values.type = 0;
    values.user_id = userid;
    values.phone_number = values.phone_number_2;
    // delete values.phone_number_2;
    addAddress(authToken, values)
      .then(async (result) => {
        await getUserProfile(authToken, userid)
          .then((result) => {
            let userD = { ...result.data.payload.data };
            userD.token = authToken;
            dispatch(dispatchLogin(userD));
          })
          .catch((errors) => {
            let error_status = errors.response.status;
            if (error_status !== 401) {
              // showToast("error", errors);
              setShipErrorMsg(errors.response.data.message);
            }
          });

        if (result.data.success) {
          // showToast("success", result.data.message);
          getUserProfileDetails();
        }
        setTimeout(() => {
          setLoading(false);
        }, 2500);
      })
      .catch((errors) => {
        console.log("ERRROR : ", errors)
        let error_status = errors.response.status;
        if (error_status !== 401) {
          // showToast("error", errors);
          setShipErrorMsg(errors.response.data.message);
        }
      });
    setShippingTouched(false);
  };

  const handleUpdateShippingSubmit = (values) => {
    setLoading(true);
    values.phone_number = values.phone_number_2;
    // delete values.phone_number_2;
    updateAddress(authToken, values)
      .then(async (result) => {
        if (result.data.success) {
          // showToast("success", result.data.message);
          await getUserProfile(authToken, userid)
          .then((result) => {
            let userD = { ...result.data.payload.data };
            userD.token = authToken;
            dispatch(dispatchLogin(userD));
          })
          .catch((errors) => {
            let error_status = errors.response.status;
            if (error_status !== 401) {
              // showToast("error", errors);
              setShipErrorMsg(errors.response.data.message);
            }
          });
          getUserProfileDetails();
        }
        setTimeout(() => {
          setLoading(false);
        }, 2500);
      })
      .catch((errors) => {
        let error_status = errors.response.status;
        if (error_status !== 401) {
          // showToast("error", errors);
          setShipErrorMsg(errors.response.data.message);
        }
      });
    setShippingTouched(false);
  };

  const getBankAccount = async () => {
    await getBankAccounts(authToken, authUser.id).then(result => {
      let bankAccountData = result.data.bankAccounts;
      setBankAccount(bankAccountData);
    })
  }

  const getBlackoutDateHandler = async () => {
    await getBlackoutDates(authToken, authUser.id).then(result => {
      let dates = result.data.blackoutDates;
      setBlackoutDates([...dates]);
    })
  }

  const addBlackOutDatesHandler = async (value) => {
    let obj = {
      start_date: moment(new Date(value.start_date)).format("MM/DD/YYYY"),
      end_date: moment(new Date(value.end_date)).format("MM/DD/YYYY"),
      user_id: userid,
      isUpdate: updateBlackoutDate,
      id: curBlackoutId
    }
    await addBlackoutDates(authToken, obj).then((data) => {
      setActiveBlackoutDate({
        start_date: "",
        end_date: ""
      });
      setAddNewBlackoutDate(false);
      setUpdateBlackoutDate(false);
      getBlackoutDateHandler();
      // showToast("success", data.data.message);
      setShowModal(false);
    }).catch((err) => {
      let error = err.response.data.message;
      // showToast("error_msg", error);
    });
  }

  const addBankAccountHandler = async (values, resetForm, setSubmitting) => {
    
    await addBankAccountApi(authToken, { user_id: authUser.id, email: authUser.email }).then((data) => {
      getUserProfileDetails();
      getBankAccount();
      setAddBankAccount(false);
      if (data.data.accountLink === true) {
        window.location.href = data.data.data.url;
      }
      // showToast("success", data.data.message);
      // resetForm();
    }).catch((err) => {
      let error = err.response.data.message;
      // showToast("error_msg", error);
      setBankAccErrorMsg(error);
    });
    // setSubmitting(false);
  }

  const deleteBankAccountHandler = async (accountId) => {
    await deleteBankAccount(authToken, { user_id: userid }).then((data) => {
      getBankAccount();
      setAddBankAccount(false);
    }).catch((err) => {
      let error = err.response.data.message;
      console.log("ERROR IN DELETE ACCOUNT : ", error)
    })
  }

  const renderModalBody = () => {
    return (
      <>
        <Modal.Header className="mt-0 font-18 font-InterRegular text-black-3">
          Blackout Dates
          <Button className="border-0 ms-auto bg-transparent btn btn-primary" onClick={() => {
            setShowModal(false);
            setActiveBlackoutDate({
              start_date: "",
              end_date: ""
            });
          }}>
            <img src="/media/images/X.svg" className="w-20px" />
          </Button>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={activeBlackoutDate}
            enableReinitialize
            validationSchema={dateValidationSchema}
            onSubmit={(values) => {
              addBlackOutDatesHandler(values);
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
              resetForm,
              isSubmitting,
            }) => {
              return (
                <form encType="multipart/form-data" onSubmit={handleSubmit}>
                  <div className="row min-h-58vh">
                    {<>
                      <div className="col-12 min-h-46vh mt-3 d-flex justify-content-center cus-calendar-input product-detail-calendar account-calendar">
                        <div className="mb-3 me-4">
                          <p>Start Date</p>
                          <DatePicker
                            placeholder="MM/DD/YYYY"
                            format="MM/DD/YYYY"
                            name="start_date"
                            value={(values.start_date !== "" ? new Date(values.start_date) : null)} onChange={(date) => {
                              setFieldValue("start_date", date)
                              setFieldValue("end_date", "")
                            }}
                            className="cus-calendar"
                            selectsStart
                            startDate={new Date(values.start_date)}
                            endDate={new Date(values.end_date)}
                            minDate={new Date()} />
                          <div className="text-danger">
                            {touched.start_date && errors.start_date}
                          </div>
                        </div>
                        <div className="mb-3">
                          <p>End Date</p>
                          <DatePicker
                            placeholder="MM/DD/YYYY"
                            format="MM/DD/YYYY"
                            name="end_date"
                            value={(values.end_date !== "" ? new Date(values.end_date) : null)} onChange={(date) => {
                              setFieldValue("end_date", date)
                            }}
                            className="cus-calendar"
                            selectsEnd
                            startDate={new Date(values.start_date)}
                            endDate={new Date(values.end_date)}
                            minDate={new Date(values.start_date)} />
                          <div className="text-danger">
                            {touched.end_date && errors.end_date}
                          </div>
                        </div>
                      </div>
                      <div className="col-12 mt-4 text-end">
                        <button
                          type="button"
                          className="btn cus-React-btn shadow-none me-3"
                          onClick={() => {
                            setAddNewBlackoutDate(false);
                            setUpdateBlackoutDate(false);
                            setActiveBlackoutDate({
                              start_date: "",
                              end_date: ""
                            });
                            resetForm();
                            setShowModal(false);
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn cus-React-btn shadow-none"
                        >
                          Save
                        </button>
                      </div>
                    </>}
                  </div>
                </form>
              );
            }}
          </Formik>
        </Modal.Body>
      </>
    );
  };

  return (
    <Fragment>
      {/* Account Information Formik */}
      <Formik
        initialValues={initialProfileValues}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={(values, { setFieldValue }) => {
          handleUpdateAccountProfile(values);
          if (passwordTouched) {
            setFieldValue("showPassword", !values.showPassword)
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
          resetForm,
          isSubmitting,
        }) => {
          return (
            <form encType="multipart/form-data" onSubmit={handleSubmit}>
              <div className="row align-items-center">
                <div className="col-12 col-lg-6">
                  <h1 className="text-black-3 font-CambonRegular font-26 text-uppercase">
                    Account
                  </h1>
                </div>
                <div className="col-12 col-lg-6 text-end">
                  <Link
                    className="btn cus-React-btn shadow-none px-3 py-2"
                    to={"/logout"}
                  >
                    SIGN OUT
                  </Link>
                </div>
                <div className="col-12 mt-4">
                  <div className="mb-3">
                    <TextField
                      value={values.first_name}
                      onBlur={handleBlur}
                      onChange={(e) => {
                        handleChange(e);
                        setAccountTouched(true);
                        setErrorMsg("");
                      }}
                      id="accountName"
                      label="First Name"
                      InputLabelProps={
                        userProfile
                          ? { shrink: true }
                          : { shrink: false }
                      }
                      variant="outlined"
                      name="first_name"
                      className="w-100 add-product-input"
                    />
                    <div className="text-danger">
                      {touched.first_name && errors.first_name}
                    </div>
                  </div>
                  <div className="mb-3">
                    <TextField
                      value={values.last_name}
                      onBlur={handleBlur}
                      onChange={(e) => {
                        handleChange(e);
                        setAccountTouched(true);
                        setErrorMsg("");
                      }}
                      id="accountLastName"
                      label="Last Name"
                      InputLabelProps={
                        userProfile
                          ? { shrink: true }
                          : { shrink: false }
                      }
                      variant="outlined"
                      name="last_name"
                      className="w-100 add-product-input"
                    />
                    <div className="text-danger">
                      {touched.last_name && errors.last_name}
                    </div>
                  </div>
                  <div className="mb-3">
                    <TextField
                      value={values.email}
                      onBlur={handleBlur}
                      onChange={(e) => {
                        handleChange(e);
                        setAccountTouched(true);
                        setErrorMsg("");
                      }}
                      id="accountEmail"
                      label="Email"
                      InputLabelProps={
                        userProfile
                          ? { shrink: true }
                          : { shrink: false }
                      }
                      variant="outlined"
                      name="email"
                      className="w-100 add-product-input"
                    />
                    <div className="text-danger">
                      {touched.email && errors.email}
                    </div>
                  </div>
                  {values.showPassword ? (
                    <>
                      <>
                        <div className="mb-3">
                          <TextField
                            id="Password"
                            value={values.password}
                            onBlur={handleBlur}
                            onChange={(e) => {
                              handleChange(e);
                              setPasswordTouched(true);
                              setErrorMsg("");
                            }}
                            label="Password"
                            type="password"
                            variant="outlined"
                            name="password"
                            className="w-100 add-product-input"
                          />
                          <div className="text-danger">
                            {touched.password && errors.password}
                          </div>
                        </div>

                        <div className="mb-3">
                          <TextField
                            value={values.confirm_password}
                            onBlur={handleBlur}
                            onChange={(e) => {
                              handleChange(e);
                              setPasswordTouched(true);
                              setErrorMsg("");
                            }}
                            id="accountCP"
                            label="Confirm Password"
                            type="password"
                            variant="outlined"
                            name="confirm_password"
                            className="w-100 add-product-input"
                          />
                          <div className="text-danger">
                            {touched.confirm_password &&
                              errors.confirm_password}
                          </div>
                        </div>
                      </>
                    </>
                  ) : (
                    <></>
                  )}

                  <div className="">
                    <TextField
                      value={values.phone_number}
                      onBlur={handleBlur}
                      onChange={(e) => {
                        handleChange(e);
                        setAccountTouched(true);
                        setErrorMsg("");
                      }}
                      id="accountPhoneNumber"
                      label="Phone Number"
                      InputLabelProps={
                        userProfile
                          ? { shrink: true }
                          : { shrink: false }
                      }
                      variant="outlined"
                      name="phone_number"
                      className="w-100 add-product-input"
                    />
                    <div className="text-danger">
                      {touched.phone_number && errors.phone_number}
                    </div>
                  </div>
                </div>
                <div className="col-12 text-sm-end">
                  {!values.showPassword && !accountTouched && <button
                    type="button"
                    onClick={() =>
                      setFieldValue("showPassword", true)
                    }
                    className="btn cus-React-btn-outline py-2 text-uppercase mt-4"
                  >
                    Reset Password
                  </button>}
                  {(passwordTouched || accountTouched) && <>
                    <button
                      type="button"
                      className="btn text-brown bg-transparent border-0 font-18 shadow-none px-3 py-2 me-3 mt-4"
                      onClick={() => {
                        resetForm();
                        setFieldValue("showPassword", false);
                        setAccountTouched(false);
                        setPasswordTouched(false);
                      }}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={!(passwordTouched || accountTouched)}
                      className={clsx(
                        "btn cus-React-btn py-2 text-uppercase mt-4",
                        !(passwordTouched || accountTouched) ? "op-6" : ""
                      )}
                    >
                      {!loading ? "save changes" : <CircularProgress />}
                    </button>
                  </>}
                  <div className="text-danger mt-2">
                    {errorMsg}
                  </div>
                </div>
              </div>
            </form>
          );
        }}
      </Formik>

      {/* Shipping Information Formik */}
      <Formik
        initialValues={initialShippingValues}
        enableReinitialize
        validationSchema={validationShippingSchema}
        onSubmit={(values) => {
          if (shippingAddress.length !== 0) {
            handleUpdateShippingSubmit(values);
          } else {
            handleAddShippingSubmit(values);
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
          resetForm,
          isSubmitting,
        }) => {
          return (
            <form encType="multipart/form-data" onSubmit={handleSubmit}>

              <div className="row mt-5">
                <div className="col-12">
                  <h1 className="text-black-3 font-CambonRegular font-26 text-uppercase">
                    Shipping Information
                  </h1>
                </div>
                <div className="col-12 mt-4">
                  <div className="mb-3">
                    <TextField
                      value={values.name}
                      onBlur={handleBlur}
                      onChange={(e) => {
                        handleChange(e);
                        setShippingTouched(true);
                      }}
                      id="shippingName"
                      label="Name"
                      InputLabelProps={
                        userProfile
                          ? { shrink: true }
                          : { shrink: false }
                      }
                      variant="outlined"
                      name="name"
                      className="w-100 add-product-input"
                    />
                    <div className="text-danger">
                      {touched.name && errors.name}
                    </div>
                  </div>
                  <div className="mb-3">
                    <TextField
                      value={values.address}
                      onBlur={handleBlur}
                      onChange={(e) => {
                        handleChange(e);
                        setShippingTouched(true);
                      }}
                      id="shippingStreet"
                      label="Street Address"
                      InputLabelProps={
                        userProfile
                          ? { shrink: true }
                          : { shrink: false }
                      }
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
                      onChange={(e) => {
                        handleChange(e);
                        setShippingTouched(true);
                      }}
                      id="shippingZipcode"
                      label="Zip Code"
                      InputLabelProps={
                        userProfile
                          ? { shrink: true }
                          : { shrink: false }
                      }
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
                      value={values.phone_number_2}
                      onBlur={handleBlur}
                      onChange={(e) => {
                        handleChange(e);
                        setShippingTouched(true);
                      }}
                      id="shippingPhoneNumber"
                      label="Phone Number"
                      InputLabelProps={
                        userProfile
                          ? { shrink: true }
                          : { shrink: false }
                      }
                      variant="outlined"
                      name="phone_number_2"
                      className="w-100 add-product-input"
                    />
                    <div className="text-danger">
                      {touched.phone_number_2 &&
                        errors.phone_number_2}
                    </div>
                  </div>
                  {shippingTouched && <div className="col-12 text-end mt-4">
                    <button
                      type="button"
                      className="btn text-brown bg-transparent border-0 font-18 shadow-none px-3 py-2 me-3"
                      onClick={() => {
                        resetForm();
                        setShippingTouched(false);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!shippingTouched}
                      className={clsx(
                        "btn cus-React-btn py-2",
                        !shippingTouched ? "op-6" : ""
                      )}
                    >
                      {!loading ? "Save" : <CircularProgress />}
                    </button>
                    <div className="text-danger mt-2">
                      {shipErrorMsg}
                    </div>
                  </div>}
                </div>
              </div>
            </form>
          );
        }}
      </Formik>

      {/* product Blackout Dates Formik */}

      <div className="col-12">
        <h1 className="text-black-3 font-CambonRegular font-26 text-uppercase">
          product BlackOut Dates
        </h1>
        <p className="text-light-gray4 font-InterRegular font-18 mt-4 mb-0">
          *please add in any dates you will be away and unable to ship your rentals
        </p>
      </div>
      <div className="col-12 mt-3">
        <span className="text-brown font-InterRegular font-20 cursor-pointer"
          onClick={() => {
            handleDateModal("add");
          }}
        >
          +Add New Blackout Dates
        </span>


        {blackoutDates.length > 0 && blackoutDates.map(val => (<div className="row mx-0 mt-3"><div className="col-12 col-lg-6 border-slate-gray br-10 px-4 py-2">
          <div className="d-flex align-items-center justify-content-between" key={val.start_date}>
            <p className="text-black-3 font-InterMedium font-18 mb-0">product Blackout</p>
            <span>
              <img src="/media/images/edit.png" className="img-fluid cursor-pointer" onClick={() => {
                setActiveBlackoutDate({
                  start_date: val.start_date,
                  end_date: val.end_date
                });
                setCurrentBlackoutId(val.id);
                setUpdateBlackoutDate(true);
                handleDateModal("add");
              }} />
            </span>
          </div>
          <div className="mt-2">
            <p className="text-black-3 font-InterLight font-18 mb-0">Dates</p>
            <p className="text-black-3 font-InterLight font-18 mb-0">{moment(val.start_date).format("MM/DD/YYYY")} - {moment(val.end_date).format("MM/DD/YYYY")}</p>
          </div>
        </div></div>))}
      </div>

      {/* Wallet Formik */}
      <Formik
        initialValues={{
          country: "",
          account_holder_name: "",
          account_holder_type: "",
          routing_number: "",
          account_number: "",
          confirm_account_number: ""
        }}
        enableReinitialize
        validationSchema={
          bankAccoutValidationSchema
        }

        onSubmit={(values, { resetForm, setSubmitting }) => {
          setSubmitting(true);
          addBankAccountHandler(values, resetForm, setSubmitting);
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
          resetForm,
          isSubmitting,
          setSubmitting
        }) => {
          return (
            <form encType="multipart/form-data" onSubmit={handleSubmit}>
              <div className="row mt-5">
                <div className="col-12">
                  <h1 className="text-black-3 font-CambonRegular font-26 text-uppercase">Wallet</h1>
                  <h1 className="text-black-3 font-30 font-InterRegular mt-3 pt-3"><img src="/media/images/pad.png" className="max-w-40 me-2" /> ${props.payoutAmount}</h1>
                  {!addBankAccount && <p className="text-light-gray4 font-InterRegular font-26 text-uppercase mb-0 mt-1">Bank</p>}
                </div>

                {bankAccount.length > 0 && <div className="col-12 mt-3">
                  {/* <p className="text-light-gray4 font-InterRegular font-26 text-uppercase mb-0">Bank</p> */}
                  <p className="font-18 text-light-gray4 font-InterRegular mb-1">{bankAccount[0].bank_name} ending in {bankAccount[0].last4},<img src="/media/images/delete.png" className="img-fluid ms-4 cursor-pointer" onClick={() => {
                    deleteBankAccountHandler(bankAccount[0].id)
                  }} /></p>
                  <p className="font-18 text-light-gray4 font-InterRegular mb-0">{bankAccount[0].account_holder_name}</p>
                  <p className="font-18 text-light-gray4 font-InterRegular">{bankAccount[0].country}</p>
                </div>}
                {bankAccount.length < 1 && !addBankAccount && <div className="mb-5 mt-3">
                  <span className="text-brown font-InterRegular font-20 cursor-pointer" onClick={() => {
                    setAddBankAccount(true);
                    setAddBankAccErr("");
                    setInProcessErr("");
                    setInsufficientAmount("");
                    addBankAccountHandler();
                  }}>
                    + Add Bank Account
                  </span>
                </div>}

                {!isSubmitting ? <a className="text-brown font-18 font-InterRegular text-uppercase cursor-pointer" onClick={() => {
                  if (bankAccount.length < 1) {
                    setAddBankAccErr("Please add a bank account to proceed further.");
                    setInProcessErr("");
                    setInsufficientAmount("");
                  } else if (props.inProcessCount > 0) {
                    setInsufficientAmount("");
                    setAddBankAccErr("");
                    setInProcessErr("Your last payout request is in process.");
                  } else if (props.payoutAmount <= 0) {
                    setAddBankAccErr("");
                    setInProcessErr("");
                    setInsufficientAmount("Insufficient balance in wallet.");
                  } else if (props.payoutAmount > 0 && props.inProcessCount <= 0) {
                    setAddBankAccErr("");
                    setInProcessErr("");
                    setInsufficientAmount("");
                    sendPayoutRequest(setSubmitting);
                  }

                }}>Cash out</a> : <span
                  className="shadow-none"
                >
                  <CircularProgress />
                </span>}
                <div className="col-12">
                  <div className="text-danger mt-2">
                    {addBankAccErr || inProcessErr || insufficientAmount}
                  </div>
                </div>
              </div>
            </form>
          );
        }}
      </Formik>

      <Modal
        size="lg"
        centered="true"
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setActiveBlackoutDate({
            start_date: "",
            end_date: ""
          });
        }}
        style={{ opacity: 1 }}
      >
        {showModal && renderModalBody()}
      </Modal>
    </Fragment>
  );
};
