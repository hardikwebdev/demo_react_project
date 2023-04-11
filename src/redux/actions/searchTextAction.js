import ACTIONS from "./index";

export const getSearchText = (result) => {
  return {
    type: ACTIONS.GET_SEARCH_TEXT,
    payload: { result },
  };
};

export const addSearchText = (result) => {
  return {
    type: ACTIONS.ADD_SEARCH_TEXT,
    payload: result,
  };
};

export const deleteSearchText = (result) => {
  return {
    type: ACTIONS.REMOVE_SEARCH_TEXT,
    payload: result,
  };
};
