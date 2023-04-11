import ACTIONS from "../actions/index";

const initialState = {
  searchText: "",
  response: undefined,
};

const searchTextReducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTIONS.GET_SEARCH_TEXT:
      const searchText = action.payload;
      return {
        ...state,
        searchText,
      };
    case ACTIONS.ADD_SEARCH_TEXT:
      const response = action.payload;
      return {
        ...state,
        response,
      };
    case ACTIONS.REMOVE_SEARCH_TEXT:
      return {
        ...state,
        response: "",
      };
    default:
      return state;
  }
};

export default searchTextReducer;
