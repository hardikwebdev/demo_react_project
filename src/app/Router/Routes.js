import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  withRouter,
  Redirect
} from "react-router-dom";
import NotFound from "../../components/PageNotFound/NotFound";
import AuthPage from "../pages/Auth/AuthPage";
import HomePage from "../pages/Home/Homepage";
import { useSelector, shallowEqual } from "react-redux";
import { useLastLocation } from "react-router-last-location";
import FrontHomePage from "../pages/Home/FrontHomePage";
import { Logout } from "../pages/Auth/Logout";
import * as routerHelpers from "./RouterHelpers";

export const Routes = withRouter(({ history, dispatch }) => {
  const lastLocation = useLastLocation();
  routerHelpers.saveLastLocation(lastLocation);
  const { isAuthorized } = useSelector(
    ({ auth }) => ({
      user: auth.user,
      isAuthorized: auth.user != null,
      userLastLocation: routerHelpers.getLastLocation(),
    }),
    shallowEqual
  );

  return (
    <Switch>
      <Route
        exact
        path="/"
        component={(props) => <HomePage title={"Home"} {...props} />}
      />
      <Route path="/account" component={AuthPage} />
      <Route path="/logout" component={() => isAuthorized ? <Logout /> : (<Redirect to={{ pathname: "/account/login" }} />)} />
      <FrontHomePage userLastLocation />
      <Route path="/*/" component={NotFound} />
    </Switch>
  );
});
