import ACTIONS from "../actions";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const initialState = {
  favorites: []
};

const favoriteReducer = persistReducer(
  {
    storage,
    key: "favorites",
  },
  (state = initialState, action) => {
    switch (action.type) {
      case ACTIONS.ADD_FAVORITE:
        const { product } = action.payload;
        let arr = [...state.favorites];
        let existingProductArr = arr.filter(val => val.Product.id !== product.Product.id);
        existingProductArr.push(product)

        return {
          ...state,
          favorites: [...existingProductArr],
        };
      case ACTIONS.REMOVE_FAVORITE:
        const { productId } = action.payload;
        let exArr = [...state.favorites];
        let productArr = exArr.filter(val => val.Product.id !== productId)
        return {
          ...state,
          favorites: [...productArr]
        };
      default: {
        return state;
      }
    }
  }
);

export default favoriteReducer;
