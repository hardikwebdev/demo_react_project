import React, { Fragment, useState, createRef, useRef, useEffect } from "react";
import TitleComponent from "../../../components/Common/TitleComponent";
import CmtInputBox from "../../../components/Common/CmtInputBox";
import { Link } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";
import ReCAPTCHA from "react-google-recaptcha";
import { register, resendVerification } from "../../crud/auth.crud";
import { useHistory } from "react-router-dom";
import { CircularProgress, FormGroup, FormControlLabel, Checkbox } from "@material-ui/core";
import { showToast } from "../../../utils/utils";


const grecaptchaObject = window.grecaptcha;

const ValidationSchema = Yup.object().shape({
  first_name: Yup.string()
    .required("First Name is required")
    .matches(/^'?\p{L}+(?:[' ]\p{L}+)*'?$/u, "Only alphabets are allowed")
    .min(2, "Name is too short")
    .max(40, "Name is too long"),
  last_name: Yup.string()
    .required("Last Name is required")
    .matches(/^'?\p{L}+(?:[' ]\p{L}+)*'?$/u, "Only alphabets are allowed")
    .min(2, "Last Name is too short")
    .max(40, "Last Name is too long"),
  email: Yup.string()
    .trim(" ")
    .required("Email is required")
    .email("Invalid Email"),
  password: Yup.string()
    .trim(" ")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
      "Must Contain 8 characters.  One uppercase, one lowercase, one number and one special case character."
    )
    .required("Password is required"),
  confirm_password: Yup.string()
    .required("Confirm Password is required")
    .oneOf(
      [Yup.ref("password"), null],
      "Password and Confirm Password must match"
    ),
  captcha_token: Yup.string().required("You must verify the captcha"),
});

function Signup(props) {
  const [loading, setLoading] = useState(false);
  const [notVerified, setNotVerified] = useState(false);
  const [email, setEmail] = useState("");

  const [isChecked, setIsChecked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isVisible2, setIsVisible2] = useState(false);
  const [curRef, setCurRef] = useState({});
  const [errorMsg, setErrorMsg] = useState("");

  const history = useHistory();

  const reCaptchaRef = createRef();

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
        let message = "";
        if(Array.isArray(errors.response.data.message)) {
          message = errors.response.data?.message[0]?.msg;
        } else {
          message = errors.response.data.message;
        }
        setErrorMsg(message);
        // setErrorMsg(errors.response.data.message)
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
    setCurRef({ ...reCaptchaRef });
    document.addEventListener("scroll", onScroll);
    return () => {
      document.removeEventListener("scroll", onScroll);
    };
  }, []);

  const handleSignup = (values) => {
    setLoading(true);
    register(values)
      .then((result) => {
        // showToast("success", result.data.message);
        setTimeout(() => {
          history.push("/");
        }, 1000);
      })
      .catch((errors) => {
        curRef.current.reset();
        setLoading(false);
        // showToast("error", errors);
        let message = "";
        if(Array.isArray(errors.response.data.message)) {
          message = errors.response.data?.message[0]?.msg;
        } else {
          message = errors.response.data.message;
        }
        setErrorMsg(message);
        // setErrorMsg(errors.response.data.message);
        var data = errors.response.data && errors.response.data.payload;
        if (data.email) {
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

  return (
    <Fragment>
      <TitleComponent title={props.title} icon={props.icon} />
      <section className="bg-light-gray auth-min-height">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-6">
              <Formik
                initialValues={{
                  first_name: "",
                  last_name: "",
                  email: "",
                  password: "",
                  confirm_password: "",
                  captcha_token: "",
                }}
                validationSchema={ValidationSchema}
                onSubmit={(values) => {
                  handleSignup(values);
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
                          Create an account
                        </h1>
                      </div>
                      <div className="mb-2">
                        <CmtInputBox
                          name={"first_name"}
                          value={values.first_name}
                          handleChange={(e) =>{
                            handleChange(e);
                            setErrorMsg("");
                          }}
                          handleBlur={handleBlur}
                          type={"text"}
                          placeholder="First Name"
                        />
                        <div className="text-danger">
                          {touched.first_name && errors.first_name}
                        </div>
                      </div>
                      <div className="mb-2">
                        <CmtInputBox
                          value={values.last_name}
                          handleChange={(e) =>{
                            handleChange(e);
                            setErrorMsg("");
                          }}
                          handleBlur={handleBlur}
                          name={"last_name"}
                          type={"text"}
                          placeholder="Last Name"
                        />
                        <div className="text-danger">
                          {touched.last_name && errors.last_name}
                        </div>
                      </div>
                      <div className="mb-2">
                        <CmtInputBox
                          value={values.email}
                          handleChange={(e) =>{
                            handleChange(e);
                            setErrorMsg("");
                          }}
                          handleBlur={handleBlur}
                          name={"email"}
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
                          value={values.password}
                          handleChange={(e) =>{
                            handleChange(e);
                            setErrorMsg("");
                          }}
                          handleBlur={handleBlur}
                          name={"password"}
                          type={isVisible ? "text" : "password"}
                          placeholder="Password"
                        />
                        <div className="text-danger">
                          {touched.password && errors.password}
                        </div>
                      </div>
                      <div className="mb-2 position-relative">
                        <span className="password-eye" onClick={(e) => {
                          setIsVisible2(!isVisible2)
                        }}>
                          {isVisible2 ?
                            <img src={"/media/images/password-eye-open.png"} className="img-fluid" />
                            :
                            <img src={"/media/images/password-eye.png"} className="img-fluid" />
                          }
                        </span>
                        <CmtInputBox
                          value={values.confirm_password}
                          handleChange={(e) =>{
                            handleChange(e);
                            setErrorMsg("");
                          }}
                          handleBlur={handleBlur}
                          name={"confirm_password"}
                          type={isVisible2 ? "text" : "password"}
                          placeholder="Confirm Password"
                        />
                        <div className="text-danger">
                          {touched.confirm_password && errors.confirm_password}
                        </div>
                      </div>
                      <div className="mb-3">
                        <FormGroup className="cus-checkbox auth-checkbox">
                          <FormControlLabel control={<Checkbox />} label={<span className="font-InterLight">I agree with <a href='/terms' className="text-brown text-decoration-none" target='__blank'>Terms</a> and <a href='/terms' className="text-brown text-decoration-none" target='__blank'>Privacy</a></span>} checked={isChecked} onChange={(e) => {
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
                      <div className="mb-4 pb-3 text-center">
                        {!notVerified ? (
                          <button type="submit" className="btn cus-auth-btn" disabled={!isChecked}>
                            {!loading ? "Sign Up" : <CircularProgress />}
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

                      <hr />

                      <div className="mb-3 text-center">
                        <p className="font-16 text-black-3 font-InterLight mb-2">Already have an account?</p>
                        <Link
                          to="/account/login"
                          className="text-brown font-InterRegular font-20 text-decoration-none"
                        >
                          Log in
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

export default Signup;
