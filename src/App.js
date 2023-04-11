import React, { useEffect } from "react";
import { Provider, shallowEqual, useSelector } from "react-redux";
import { BrowserRouter, HashRouter, useLocation } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { LastLocationProvider } from "react-router-last-location";
import { Routes } from "./app/Router/Routes";
import Footer from "./components/Footer/Footer";
import ScrollToTop from "./components/Common/ScrollToTop";

function App({ store, persistor, basename }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const { isAuthorized } = useSelector(
    ({ auth }) => ({
      isAuthorized: auth.user != null,
    }),
    shallowEqual
  );


  return (
    <React.Suspense>
      <LastLocationProvider>
        <ScrollToTop />
        <Routes />
        {!currentPath.startsWith("/account") && (<Footer />)}
      </LastLocationProvider>
    </React.Suspense>
  );
}

export default App;
