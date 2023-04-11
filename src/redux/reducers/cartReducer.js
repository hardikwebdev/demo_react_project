import ACTIONS from "../actions";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const initialState = {
  cart: []
};

const cartReducer = persistReducer(
  {
    storage,
    key: "cart",
  },
  (state = initialState, action) => {
    switch (action.type) {
      case ACTIONS.ADD_TO_CART:
        const { product } = action.payload;
        let arr = [...state.cart];
        let existingProductArr = arr.filter(val => val.product_id !== product.product_id);
        existingProductArr.push(product)
        // if (existingProduct.length === 0){
        //   arr.push(product)
        // }

        return {
          ...state,
          cart: [...existingProductArr],
        };
      case ACTIONS.REMOVE_FROM_CART:
        const { productId } = action.payload;
        if(productId == "") {
          return {
            ...state,
            cart: []
          }
        } else {
          let exArr = [...state.cart];
          let productArr = exArr.filter(val => val.product_id !== productId)
          return {
            ...state,
            cart: productArr
          };
        }
      default: {
        return state;
      }
    }
  }
);

export default cartReducer;
