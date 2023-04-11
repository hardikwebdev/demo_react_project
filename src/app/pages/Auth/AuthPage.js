import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import Signup from "./Signup";
import Login from "./Login";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import AccountVerification from "./AccountVerification";
import NotFound from "../../../components/PageNotFound/NotFound";
import { useSelector, shallowEqual } from "react-redux";

function AuthPage() {
  const { authToken } = useSelector(
    ({ auth }) => ({
      authToken: auth?.user?.token,
    }),
    shallowEqual
  );
  return (
    <Switch>
      {<Route
        exact
        path="/account/login"
        component={(props) => !authToken ? (<Login title={"Login"} {...props} />) : (<Redirect  to={props.location?.isCheckout === true ? { pathname: "/checkout", state : {isCheckout: true} } : { pathname: "/" } } />)}
      />}
      <Route
        path="/account/register"
        component={(props) => !authToken ? (<Signup title={"Create Account"} {...props} />) : (<Redirect to={{ pathname: "/" }} />)}
      />
      <Route
        path="/account/forgot-password"
        component={(props) => (
          <ForgotPassword title={"Forgot Password"} {...props} />
        )}
      />
      <Route
        path="/account/reset-password"
        component={(props) => (
          <ResetPassword title={"Reset Password"} {...props} />
        )}
      />
      <Route
        path="/account/account-verification"
        component={(props) => (
          <AccountVerification title={"Account Verification"} {...props} />
        )}
      />
      <Route path="/*/" component={NotFound} />
    </Switch>
  );
}

export default AuthPage;
