import { combineReducers } from "redux";
import auth from "./authReducer";
import searchText from "./searchTextReducer";
import searchProduct from "./searchProductReducer";
import cartReducer from "./cartReducer";
import checkOutReducer from "./checkOutReducer";
import favoriteReducer from "./favoriteReducer";

export default combineReducers({
  auth,
  searchText,
  searchProduct,
  cartReducer,
  checkOutReducer,
  favoriteReducer
});
