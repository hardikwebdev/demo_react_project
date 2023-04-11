import React from "react";
import { Switch, Route, Redirect, useLocation } from "react-router-dom";
import NotFound from "../../../components/PageNotFound/NotFound";
import { Profile } from "./Profile";
import OrderDetails from "./OrderDetails";
import Productpage from "../Product/ProductPage";
import Productdetails from "../Product/ProductDetails";
import ListingDetails from "./ListingDetails";
import Search from "../Search/Search";
import Cart from "../Cart/Cart";
import Checkout from "../Cart/Checkout";
import Success from "../Cart/OrderSuccessPage";
import { useSelector, shallowEqual } from "react-redux";
import OurStory from "../About/OurStory";
import HowItWorks from "../About/HowItWorks";
import Faq from "../About/Faq";
import Favorite from "../About/Favorite";
import PreviewProduct from "./PreviewProduct";
import Terms from "../About/Terms";
import PrivacyPolicy from "../About/PrivacyPolicy";

function FrontHomePage() {
  const location = useLocation();
  const { isAuthorized, user } = useSelector(
    ({ auth }) => ({
      user: auth.user,
      isAuthorized: auth.user != null,
    }),
    shallowEqual
  );

  return (
    <Switch>
      <Route
        exact
        path="/search"
        component={(props) => <Search title={"Search"} {...props} />}
      />
      <Route
        path="/profile"
        component={(props) => {
          return isAuthorized ? (
            <Profile title={"My Account"} {...props} />
          ) : (
            <Redirect to={{ pathname: "/account/login" }} />
          );
        }}
      />
      <Route
        path="/order-details"
        component={(props) => <OrderDetails title={"Order Details"} {...props} />}
      />
      <Route
        path="/listing-details"
        component={(props) => {
          return user?.ShippingAddress?.length > 0 ? (
            <ListingDetails title={"Listing Details"} {...props} />
          ) : (
            <Redirect to={{ pathname: "/" }} />
          );
        }}
      // component={(props) => <ListingDetails title={"Listing Details"} {...props} />}
      />
      <Route
        path="/preview-product"
        component={(props) => <PreviewProduct title={"Preview Product"} {...props} />}
      />
      <Route
        path="/products"
        component={(props) => <Productpage title={"Product"} {...props} />}
      />
      <Route
        path="/cart"
        component={(props) => <Cart title={"Cart"} {...props} />}
      />
      <Route
        path="/checkout"
        component={(props) => <Checkout title={"Checkout"} {...props} />}
      />
      <Route
        path="/product-details/"
        component={(props) => {
          return <Productdetails title={"Product Details"} {...props} />
        }}
      />

      <Route
        path="/our-story"
        component={(props) => <OurStory title={"Our Story"} {...props} />}
      />
      <Route
        path="/how-it-works"
        component={(props) => <HowItWorks title={"How It Works"} {...props} />}
      />
      <Route
        path="/faq"
        component={(props) => <Faq title={"FAQ"} {...props} />}
      />
      <Route
        path="/favorite"
        component={(props) => <Favorite title={"Favorite"} {...props} />}
      />
      <Route
        path="/terms"
        component={(props) => <Terms title={"Terms & Conditions"} {...props} />}
      />

      <Route
        path="/privacy-policy"
        component={(props) => <PrivacyPolicy title={"Privacy Policy"} {...props} />}
      />

      <Route path="/success" component={Success} />
      <Route path="/*/" component={NotFound} />
    </Switch>
  );
}

export default FrontHomePage;
