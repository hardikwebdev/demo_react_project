import ACTIONS from "./index";

export const addFavorite = (product) => {
  return {
    type: ACTIONS.ADD_FAVORITE,
    payload: { product },
  };
};

export const removeFavorite = (productId) => {
  return {
    type: ACTIONS.REMOVE_FAVORITE,
    payload: {productId}
  };
};