import React from "react";
import { configureStore, applyMiddleware } from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import rootReducer from "./reducers/index";
import { composeWithDevTools } from "redux-devtools-extension";

const middleware = [thunk];

const store = configureStore(
  {
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  },
  composeWithDevTools(applyMiddleware(...middleware))
);

function DataProvider({ children }) {
  return <Provider store={store}>{children}</Provider>;
}

export const persistor = persistStore(store);

export default DataProvider;
