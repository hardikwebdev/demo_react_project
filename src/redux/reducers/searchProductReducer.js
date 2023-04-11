import ACTIONS from "../actions";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const initialState = {
  products: [],
  searchtext: undefined,
  type: undefined
};

const searchProductReducer = persistReducer(
  {
    storage,
    key: "root",
  },
  (state = initialState, action) => {
    switch (action.type) {
      case ACTIONS.ADD_SEARCH_PRODUCT:
        const { products, searchtext, type } = action.payload;
        return {
          ...state,
          products,
          searchtext,
          type
        };
      case ACTIONS.REMOVE_SEARCH_PRODUCT:
        return {
          products: [],
          searchtext: "",
          type: ""
        };
      default: {
        return state;
      }
    }
  }
);

export default searchProductReducer;
