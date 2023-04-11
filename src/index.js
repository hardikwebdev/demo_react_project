import React from "react";
import { createRoot } from "react-dom/client";
// import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import DataProvider from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { persistor } from "./redux/store";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import Header from "./components/Header/Header";
import AppContextProvider from "./contextProvider/AppContextProvider";
const { PUBLIC_URL } = process.env;

const root = createRoot(document.getElementById("root"));
root.render(
  <AppContextProvider>
    <DataProvider>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <Header />
          <App />
        </BrowserRouter>
      </PersistGate>
    </DataProvider>
  </AppContextProvider>
);
