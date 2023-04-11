import ACTIONS from "./index";

export const addSearchProduct = (products, searchtext, type) => {
  return {
    type: ACTIONS.ADD_SEARCH_PRODUCT,
    payload: { products, searchtext, type },
  };
};

export const removeSearchProduct = () => {
  return {
    type: ACTIONS.REMOVE_SEARCH_PRODUCT,
  };
};
