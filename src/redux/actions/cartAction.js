import ACTIONS from "./index";

export const addToCart = (product) => {
  return {
    type: ACTIONS.ADD_TO_CART,
    payload: { product },
  };
};

export const removeFromCart = (productId) => {
  return {
    type: ACTIONS.REMOVE_FROM_CART,
    payload: {productId}
  };
};
