import React, { Fragment, useState, createRef, useEffect } from "react";
import TitleComponent from "../../../components/Common/TitleComponent";
import CmtInputBox from "../../../components/Common/CmtInputBox";
import { Link, withRouter } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { Formik } from "formik";
import * as Yup from "yup";
import { login, resendVerification, addToCartAPI, addToFavorites } from "../../crud/auth.crud";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useHistory } from "react-router-dom";
import { dispatchLogin } from "../../../redux/actions/authAction";
import { CircularProgress, FormGroup, FormControlLabel, Checkbox } from "@material-ui/core";
import { showToast } from "../../../utils/utils";
import { removeFromCart } from "../../../redux/actions/cartAction";
import { addFavorite, removeFavorite } from "../../../redux/actions/favoriteAction";

const grecaptchaObject = window.grecaptcha;

const ValidationSchema = Yup.object().shape({
  email: Yup.string()
    .trim(" ")
    .required("Email is required")
    .email("Invalid Email"),
  password: Yup.string()
    .trim(" ")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
      "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character"
    )
    .required("Password is required"),
  captcha_token: Yup.string().required("You must verify the captcha"),
});

function Login(props) {
  const [loading, setLoading] = useState(false);

  const [notVerified, setNotVerified] = useState(false);

  const [isChecked, setIsChecked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const reCaptchaRef = createRef();

  const history = useHistory();

  const dispatch = useDispatch();

  const { cartDetails } = useSelector(
    ({ cartReducer }) => ({ cartDetails: cartReducer.cart }),
    shallowEqual
  );

  const { favoritesId } = useSelector(
    ({ favoriteReducer }) => ({
      favoritesId: favoriteReducer.favorites
    }),
    shallowEqual
  );

  const syncCartDetails = async (userData) => {
    if (cartDetails.length > 0) {
      await cartDetails.map(async val => {
        if (userData.id !== val.seller_id) {
          const data = {
            product_id: val.product_id,
            user_id: userData.id,
            seller_id: val.seller_id,
            amount: val.amount,
            color: val.color,
            size: val.size,
            quantity: val.quantity,
            rental_period: val.rental_period,
            shipping_type: val.shipping_type,
            start_date: val.start_date,
            end_date: val.end_date,
          };
          await addToCartAPI(userData.token, data)
            .then(() => {
              dispatch(removeFromCart(val.product_id));
            })
            .catch((errors) => {
              let error_status = errors.response.status;
              // if (error_status !== 401) {
              //   showToast("error", errors);
              // }
            });
        } else {
          dispatch(removeFromCart(val.product_id));
        }
      })
    }
  }

  const syncFavorites = async (userData) => {
    if (favoritesId.length > 0) {
      await favoritesId.map(async val => {
        if (userData.id !== val.Product.user_id) {
          let obj = {
            user_id: userData.id,
            product_id: val.Product.id,
            isFavorite: 1
          }
          await addToFavorites(userData.token, obj).then(async (result) => {
            if (result.data.success) {
              dispatch(removeFavorite(val.Product.id));
            }
          }).catch((errors) => {
            let error_status = errors.response.status;
            // if (error_status !== 401) {
            //   showToast("error", errors);
            // }
          });
        } else {
          dispatch(removeFavorite(val.Product.id));
        }
      })
    }
  }

  const handleVerification = () => {
    setLoading(true);
    resendVerification(email)
      .then((result) => {
        // if (result.data.success) {
        //   showToast("success", result.data.message);
        // }
        setLoading(false);
        setNotVerified(false);
      })
      .catch((errors) => {
        // showToast("error", errors);
        setLoading(false);
        let message = "";
        if(Array.isArray(errors.response.data.message)) {
          message = errors.response.data?.message[0]?.msg;
        } else {
          message = errors.response.data.message;
        }
        setErrorMsg(message);
        // setErrorMsg(errors.response.data.message);
      });
  };

  const handleLogin = (values) => {
    let isRememberMe = isChecked ? 1 : 0;
    login(values.email, values.password, values.captcha_token, isRememberMe)
      .then((result) => {
        var data = result.data && result.data.payload;
        dispatch(dispatchLogin(data));
        syncCartDetails(data);
        syncFavorites(data);
        // showToast("success", result.data.message);
        setLoading(true);
        if (props.location.state.isCheckout && props.location.state.isCheckout === true) {
          history.push({ pathname: "/checkout", state: { isCheckout: true, isLocalPickUp: props.location?.state?.isLocalPickUp, zipCode: props.location?.state?.zipCode } });
        } else {
          history.push("/");
        }
      })
      .catch((errors) => {
        reCaptchaRef.current.reset();
        // showToast("error", errors);
        let message = "";
        if(Array.isArray(errors.response.data.message)) {
          message = errors.response.data?.message[0]?.msg;
        } else {
          message = errors.response.data.message;
        }
        setErrorMsg(message);
        var data = errors.response.data && errors.response.data.payload;
        if (data?.email) {
          const notVerified = data.isVerified;
          const email = data.email;
          if (!notVerified) {
            setNotVerified(true);
            setEmail(email);
          } else {
            setNotVerified(false);
          }
        }
      });
  };

  const onScroll = (e) => {
    const scrollTotal =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    if (
      document.documentElement.scrollTop / scrollTotal > 1.5 ||
      document.documentElement.scrollTop === 0
    ) {
      document.getElementById("outer-container").classList.remove("bg-white");
    } else {
      document.getElementById("outer-container").classList.add("bg-white");
    }
  };

  useEffect(() => {
    document.addEventListener("scroll", onScroll);
    return () => {
      document.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <Fragment>
      <TitleComponent title={props.title} icon={props.icon} />
      <section className="bg-light-gray auth-min-height">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-6">
              <Formik
                initialValues={{
                  email: "",
                  password: "",
                  captcha_token: "",
                }}
                validationSchema={ValidationSchema}
                onSubmit={(values) => {
                  handleLogin(values);
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
                }) => {
                  return (
                    <form onSubmit={handleSubmit}>
                      <div className="mb-5 pb-3 text-center">
                        <h1 className="text-brown font-CambonRegular font-35 text-uppercase">
                          Welcome to React
                        </h1>
                      </div>
                      <div className="mb-2">
                        <CmtInputBox
                          name={"email"}
                          value={values.email}
                          handleChange={(e) =>{
                            handleChange(e);
                            setErrorMsg("");
                          }}
                          handleBlur={handleBlur}
                          type={"email"}
                          placeholder="Email"
                        />
                        <div className="text-danger">
                          {touched.email && errors.email}
                        </div>
                      </div>
                      <div className="mb-2 position-relative">
                        <span className="password-eye" onClick={(e) => {
                          setIsVisible(!isVisible)
                        }}>
                          {isVisible ?
                            <img src={"/media/images/password-eye-open.png"} className="img-fluid" />
                            :
                            <img src={"/media/images/password-eye.png"} className="img-fluid" />
                          }
                        </span>
                        <CmtInputBox
                          name={"password"}
                          value={values.password}
                          handleChange={(e) => {
                            handleChange(e);
                            setErrorMsg("");
                          }}
                          handleBlur={handleBlur}
                          type={isVisible ? "text" : "password"}
                          placeholder="Password"
                        />
                        <div className="text-danger">
                          {touched.password && errors.password}
                        </div>
                      </div>
                      <div className="mb-3">
                        <FormGroup className="cus-checkbox auth-checkbox">
                          <FormControlLabel control={<Checkbox />} label={"Remember me"} checked={isChecked} onChange={(e) => {
                            setIsChecked(!isChecked)
                          }} />
                        </FormGroup>
                      </div>
                      <div className="mb-4">
                        <ReCAPTCHA
                          onChange={(captcha_token) => {
                            setFieldValue("captcha_token", captcha_token);
                          }}
                          ref={reCaptchaRef}
                          onReset={() => setFieldValue("captcha_token", "")}
                          onExpired={() => setFieldValue("captcha_token", "")}
                          grecaptcha={grecaptchaObject}
                          className="captcha-shadow"
                          sitekey={process.env.REACT_APP_SITE_KEY}
                        />
                        <div className="text-danger">
                          {touched.captcha_token && errors.captcha_token}
                        </div>
                      </div>
                      <div className="mb-3 text-center">
                        {!notVerified ? (
                          <button type="submit" className="btn cus-auth-btn">
                            {!loading ? "LOG IN" : <CircularProgress />}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(email) => handleVerification(email)}
                            className="btn cus-auth-btn"
                          >
                            {!loading ? "Resend Email" : <CircularProgress />}
                          </button>
                        )}
                        <div className="text-danger mt-2">
                          {errorMsg}
                        </div>
                      </div>
                      <div className="mb-4 pb-3 text-center">
                        <Link
                          to="/account/forgot-password"
                          className="font-16 text-brown font-20 font-InterRegular text-decoration-none"
                        >
                          {" "}
                          Forgot Password?{" "}
                        </Link>
                      </div>

                      <hr />

                      <div className="mb-3 text-center">
                        <p className="font-16 text-black-3 font-InterLight mb-2">Dont have an account?</p>
                        <Link
                          to="/account/register"
                          className="text-brown font-InterRegular font-20 text-decoration-none"
                        >
                          SIGN UP
                        </Link>
                      </div>
                    </form>
                  );
                }}
              </Formik>
            </div>
          </div>
        </div>
      </section>
    </Fragment>
  );
}

export default withRouter(Login);
