import axios from "axios";

export const API_BASE_URL =
  process.env.REACT_APP_ENVIRONMENT === "local"
    ? process.env.REACT_APP_DEV_API_BASE_URL
    : process.env.REACT_APP_API_BASE_URL;

export const LOGIN_URL = "/auth/login";

export const LOGOUT_URL = "/auth/logout";

export const REGISTER_URL = "/auth/registration";

export const ACTIVATION_URL = "/auth/userActivation";

export const FORGOT_PASSWORD_URL = "/auth/forgotPassword";

export const CHANGE_PASSWORD_URL = "/auth/changePassword";

export const RESEND_VERIFICATION_URL = "/auth/resendVerification";

export const FEATURED_RENTALS_URL = "/featuredRentals";

export const TESTIMONIALS_URL = "/testimonials";

export const GET_ALL_PRODUCTS = "/allProducts";

export const GET_PRODUCT_DETAILS = "/productDetails";

export const GET_PRODUCT_LIST = "/searchProducts";

export const GET_GENERAL_ATTRIBUTES = "/generalAttributes";

export const UPCOMING_RENTALS = "/user/upcomingRentals";
export const CURRENTLY_ReactD = "/user/currentlyReactd";

export const ACTIVATE_DEACTIVATE_ITEMS = "/user/activateDeactivateAllItems";

export const GET_MY_RENTALS = "/user/myRentals";

export const GET_MY_CLOTHES = "/user/myClothes";

export const ADD_PRODUCT = "/user/addProduct";

export const ADD_PRODUCT_IMAGE = "/user/addProductImage";

export const REMOVE_FROM_S3 = "/user/removeFromS3";

export const EDIT_PRODUCT = "/user/updateProduct";

export const DELETE_PRODUCT = "/user/deleteProduct";

export const USER_PROFILE_URL = "/user/userProfile";

export const UPDATE_PROFILE_URL = "/user/updateProfile";

export const UPDATE_ADDRESS_URL = "/user/updateAddress";

export const ADD_ADDRESS_URL = "/user/addAddress";

export const ADD_TO_CART_URL = "/user/addToCart";

export const GET_CART_LIST = "/user/cartDetails";

export const REMOVE_FROM_CART = "/user/removeFromCart";

export const CHECKOUT = "/checkout";

export const ORDER = "/user/order";

export const ORDER_DETAILS = "/user/orderDetails";

export const MARK_SHIPPED = "/user/markShipped";

export const MARK_PICKED_UP = "/user/markPickedUp";

export const MARK_DELIVERED = "/user/markDelivered";

export const MARK_SHIPPED_BACK = "/user/markShippedBack";

export const MARK_DROPPED_OFF = "/user/droppedOff";

export const MARK_RETURNED = "/user/markReturned";

export const LOCALPICKUP_AVAILABILITY = "/localPickUpAvailability";

export const ADD_CARD = "/user/addCard";

export const GET_CARDS = "/user/getCards";

export const DELETE_CARD = "/user/deleteCard";

export const ORDER_HISTROY = "/user/orderHistory";

export const SEND_SIZE_REQUEST = "/user/sendSizeRequest";

export const UPDATE_PRODUCT_STATUS = "/user/updateProductStatus";

export const ADD_BLACKOUT_DATES= "/user/addBlackOutDates";

export const GET_BLACKOUT_DATES= "/user/getBlackoutDates";

export const ADD_TO_FAVORITES= "/user/addToFavorites";

export const GET_FAVORITES= "/user/getFavorites";

export const GET_WALLET_DETAILS= "/user/getWalletDetails";

export const CASHOUT= "/user/cashOut";

export const GET_BANK_ACCOUNT = "/user/getBankAccounts";

export const DELETE_BANK_ACCOUNT = "/user/deleteBankAccount";

export const ADD_BANK_ACCOUNT= "/user/addBankAccount";

export const API = axios.create({
  baseURL: API_BASE_URL,
});

export function login(email, password, captcha_token, isRememberMe) {
  let data = JSON.stringify({
    email: email,
    password: password,
    captcha_token: captcha_token,
    isRememberMe: isRememberMe ? 1 : 0
  });
  return API.post(LOGIN_URL, data, {
    headers: { "Content-Type": "application/json" },
  });
}

export function logout(authToken) {
  return API.get(LOGOUT_URL, {
    headers: { Authorization: authToken },
  });
}

export function register(data) {
  return API.post(REGISTER_URL, data);
}

export function userActivation(email, verification_token) {
  return API.get(
    ACTIVATION_URL +
      "?email=" +
      email +
      "&verification_token=" +
      verification_token,
    { headers: { "Content-Type": "application/json" } }
  );
}

export function forgotPassword(email) {
  let data = JSON.stringify({
    email: email,
  });
  return API.post(FORGOT_PASSWORD_URL, data, {
    headers: { "Content-Type": "application/json" },
  });
}

export function changePassword(values, password, captcha_token) {
  let data = JSON.stringify({
    email: values.email,
    token: values.resetToken,
    password: password,
    captcha_token: captcha_token,
  });
  return API.post(CHANGE_PASSWORD_URL, data, {
    headers: { "Content-Type": "application/json" },
  });
}

export function resendVerification(email) {
  let data = JSON.stringify({
    email: email,
  });
  return API.post(RESEND_VERIFICATION_URL, data, {
    headers: { "Content-Type": "application/json" },
  });
}

export function featuredRentals() {
  return API.get(FEATURED_RENTALS_URL);
}

export function testimonials() {
  return API.get(TESTIMONIALS_URL);
}

export function getProductList(
  sortBy,
  availability_status,
  priceArr,
  meta_value,
  meta_type,
  product,
  location,
  limit,
  page,
  date_range,
  categoryType,
  occasion,
  signal
) {
  var availability = availability_status != 0 ? availability_status : "";
  var price = priceArr.length > 0 ? JSON.stringify(priceArr) : "";
  var mVal = meta_value.length > 0 ? JSON.stringify(meta_value) : "";
  var mtype = meta_type.length > 0 ? JSON.stringify(meta_type) : "";
  var uproduct = product.length > 0 ? JSON.stringify(product) : "";
  let locationStr = JSON.stringify(location);
  var category = categoryType ? JSON.stringify(categoryType) : "";
  let date_arr = date_range ? JSON.stringify(date_range) : null;
   console.log(" OCCasion : ", occasion)
  let uoccasion = occasion &&  occasion.length > 0 ? JSON.stringify(occasion) : "";
  if(signal) {
    return API.get(
      GET_ALL_PRODUCTS +
        "?limit= " +
        limit +
        "&page=" +
        page +
        "&sortBy= " +
        sortBy +
        "&availability_status=" +
        availability +
        "&price=" +
        price +
        `&meta_value=${encodeURIComponent(mVal)}` +
        "&meta_type=" +
        mtype +
        "&product=" +
        uproduct +
        "&zipcode=" +
        locationStr+ 
        "&category=" + 
        category +
        "&date_range="+
        date_arr +
        "&occasion="+
        uoccasion,
      {
        headers: { "Content-Type": "application/json" },
        signal
      }
    );
  } else {
    return API.get(
      GET_ALL_PRODUCTS +
        "?limit= " +
        limit +
        "&page=" +
        page +
        "&sortBy= " +
        sortBy +
        "&availability_status=" +
        availability +
        "&price=" +
        price +
        `&meta_value=${encodeURIComponent(mVal)}` +
        "&meta_type=" +
        mtype +
        "&product=" +
        uproduct +
        "&zipcode=" +
        locationStr+ 
        "&category=" + 
        category +
        "&date_range="+
        date_arr +
        "&occasion="+
        uoccasion,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export function searchProducts(
  searchData,
  sortBy,
  availability_status,
  priceArr,
  meta_value,
  meta_type,
  product,
  location,
  date_range,
  categoryType,
  occasionType,
  localPickUp,
  occasionArr
) {
  var searchValue =
    searchData !== undefined && searchData !== null ? encodeURIComponent(searchData) : "";
  var availability =
    availability_status && availability_status != 0 ? availability_status : "";
  var price = priceArr && priceArr.length > 0 ? JSON.stringify(priceArr) : "";
  var mVal =
    meta_value && meta_value.length > 0 ? JSON.stringify(meta_value) : "";
  var mtype =
    meta_type && meta_type.length > 0 ? JSON.stringify(meta_type) : "";
  var uproduct = product && product.length > 0 ? JSON.stringify(product) : "";
  var sort = sortBy ? sortBy : "";
  var locations = location ? location : "";
  var category = categoryType ? JSON.stringify(categoryType) : "";
  var occasion = occasionType ? JSON.stringify(occasionType) : "";
  let locationStr = JSON.stringify(location);
  console.log("SearchOccasion===",occasionArr)
  var occasionsFilter = occasionArr ? JSON.stringify(occasionArr) : "";
  let date_arr = date_range ? JSON.stringify(date_range) : null;
  
  return API.get(
    GET_PRODUCT_LIST +
      "?search=" +
      searchValue +
      "&sortBy= " +
      sort +
      "&availability_status=" +
      availability +
      "&price=" +
      price +
      `&meta_value=${encodeURIComponent(mVal)}` +
      "&meta_type=" +
      mtype +
      "&product=" +
      uproduct +
      "&zipcode=" +
      locationStr + 
      "&category=" + 
      category + 
      "&occasion=" +
      occasion + 
      "&localPickUp="+
      localPickUp +
      "&occasionsFilter="+
      occasionsFilter+
      "&date_range="+
      date_arr,
    {
      headers: { "Content-Type": "application/json" },
    }
  );
}

export function getGeneralAttributes() {
  return API.get(GET_GENERAL_ATTRIBUTES);
}

export function upcomingRentals(authToken, user_id) {
  return API.get(UPCOMING_RENTALS + "?user_id=" + user_id, {
    headers: { Authorization: authToken, "Content-Type": "application/json" },
  });
}

export function myRentals(authToken) {
  return API.get(GET_MY_RENTALS, {
    headers: { Authorization: authToken, "Content-Type": "application/json" },
  });
}

export function currentlyReactd(authToken, user_id) {
  return API.get(CURRENTLY_ReactD + "?user_id=" + user_id, {
    headers: { Authorization: authToken, "Content-Type": "application/json" },
  });
}

export function myClothes(authToken) {
  return API.get(GET_MY_CLOTHES, {
    headers: { Authorization: authToken, "Content-Type": "application/json" },
  });
}

export function addProduct(authToken, data) {
  return API.post(ADD_PRODUCT, data, { headers: { Authorization: authToken } });
}

export function addProductImage(authToken, data) {
  return API.post(ADD_PRODUCT_IMAGE, data, {
    headers: { Authorization: authToken },
  });
}

export function removeFromS3(authToken, data) {
  return API.post(REMOVE_FROM_S3, data, {
    headers: { Authorization: authToken },
  });
}

export function getProductDetails(productId) {
  return API.get(GET_PRODUCT_DETAILS + "?product_id=" + productId, {
    headers: { "Content-Type": "application/json" },
  });
}

export function activateDeactivateAllItems(authToken, postdata) {
  return API.post(ACTIVATE_DEACTIVATE_ITEMS, postdata, {
    headers: { Authorization: authToken, "Content-Type": "application/json" },
  });
}

export function deleteProduct(authToken, productId) {
  let data = { product_id: productId };
  return API.post(DELETE_PRODUCT, data, {
    headers: { Authorization: authToken, "Content-Type": "application/json" },
  });
}

export function editProduct(authToken, data) {
  return API.post(EDIT_PRODUCT, data, {
    headers: { Authorization: authToken, "Content-Type": "application/json" },
  });
}

export function getUserProfile(authToken, userId) {
  return API.get(USER_PROFILE_URL + "?user_id=" + userId, {
    headers: { Authorization: authToken, "Content-Type": "application/json" },
  });
}

export function updateProfile(authToken, data) {
  return API.post(UPDATE_PROFILE_URL, data, {
    headers: { Authorization: authToken, "Content-Type": "application/json" },
  });
}

export function updateAddress(authToken, data) {
  return API.post(UPDATE_ADDRESS_URL, data, {
    headers: { Authorization: authToken, "Content-Type": "application/json" },
  });
}

export function addAddress(authToken, data) {
  return API.post(ADD_ADDRESS_URL, data, {
    headers: { Authorization: authToken, "Content-Type": "application/json" },
  });
}

export function addToCartAPI(authToken, data) {
  return API.post(ADD_TO_CART_URL, data, {
    headers: { Authorization: authToken, "Content-Type": "application/json" },
  });
}

export function getCartList(authToken, userId) {
  return API.get(GET_CART_LIST + "?user_id=" + userId, {
    headers: { Authorization: authToken, "Content-Type": "application/json" },
  });
}

export function removeFromCartAPI(authToken, data) {
  return API.post(REMOVE_FROM_CART, data, {
    headers: { Authorization: authToken, "Content-Type": "application/json" },
  });
}

export function checkout(authToken, data) {
  return API.post(CHECKOUT, data, {
    headers: { Authorization: authToken },
  });
}

export function order(authToken, data) {
  return API.post(ORDER, data, {
    headers: { Authorization: authToken },
  });
}

export function orderDetails(authToken, order_id) {
  return API.get(ORDER_DETAILS + "?order_id=" + order_id, {
    headers: { Authorization: authToken, "Content-Type": "application/json" },
  });
}

export function markShipped(authToken, order_id) {
  return API.post(MARK_SHIPPED, order_id, {
    headers: { Authorization: authToken },
  });
}

export function markPickedUp(authToken, order_id) {
  return API.post(MARK_PICKED_UP, order_id, {
    headers: { Authorization: authToken },
  });
}

export function markDelivered(authToken, order_id) {
  return API.post(MARK_DELIVERED, order_id, {
    headers: { Authorization: authToken },
  });
}

export function markShippedBack(authToken, order_id) {
  return API.post(MARK_SHIPPED_BACK, order_id, {
    headers: { Authorization: authToken },
  });
}

export function droppedOff(authToken, order_id) {
  return API.post(MARK_DROPPED_OFF, order_id, {
    headers: { Authorization: authToken },
  });
}

export function markReturned(authToken, order_id) {
  return API.post(MARK_RETURNED, order_id, {
    headers: { Authorization: authToken },
  });
}

export function localPickUpAvailability(zipArr, zipcode) {
  return API.get(LOCALPICKUP_AVAILABILITY+ "?zipArr=" + zipArr + "&zipcode=" + zipcode);
}

export function addCard(authToken, data) {
  return API.post(ADD_CARD, data, {
    headers: { Authorization: authToken },
  });
}

export function getCards(authToken, userId) {
  return API.get(GET_CARDS + "?user_id=" + userId, {
    headers: { Authorization: authToken, "Content-Type": "application/json" },
  });
}

export function deleteCard(authToken, data) {
  return API.post(DELETE_CARD, data, {
    headers: { Authorization: authToken },
  });
}


export function orderHistroy(authToken, userId, orderLimit, orderActivePage, intoMyproduct, isActiveOrders) {
  let intoMyproduct = intoMyproduct ? 1 : 0;
  let isActiveorder = isActiveOrders ? 1 : 0;
  return API.get(ORDER_HISTROY + "?user_id=" + userId + "&limit=" + orderLimit + "&page=" + orderActivePage + "&intoMyproduct="+ intoMyproduct + "&isActiveOrders=" + isActiveOrders, {
    headers: { Authorization: authToken, "Content-Type": "application/json" },
  });
}

export function sendSizeRequest(authToken, data) {
  return API.post(SEND_SIZE_REQUEST, data, {
    headers: { Authorization: authToken },
  });
}

export function updateProductStatus(authToken, data) {
  return API.post(UPDATE_PRODUCT_STATUS, data, {
    headers: { Authorization: authToken },
  });
}

export function addBlackoutDates(authToken, data) {
  return API.post(ADD_BLACKOUT_DATES, data, {
    headers: { Authorization: authToken },
  });
}

export function getBlackoutDates(authToken, userId) {
  return API.get(GET_BLACKOUT_DATES + "?user_id=" + userId, {
    headers: { Authorization: authToken, "Content-Type": "application/json" },
  });
}

export function addToFavorites(authToken, data) {
  return API.post(ADD_TO_FAVORITES, data, {
    headers: { Authorization: authToken },
  });
}

export function getFavorites(authToken, userId, fromLisiting) {
  return API.get(GET_FAVORITES + "?user_id=" + userId +"&isFromLisiting=" + fromLisiting, {
    headers: { Authorization: authToken, "Content-Type": "application/json" },
  });
}

export function getWalletDetails(authToken, userId) {
  return API.get(GET_WALLET_DETAILS + "?user_id=" + userId, {
    headers: { Authorization: authToken, "Content-Type": "application/json" },
  });
}

export function cashOut(authToken, data) {
  return API.post(CASHOUT, data, {
    headers: { Authorization: authToken },
  });
}

export function getBankAccounts(authToken, userId) {
  return API.get(GET_BANK_ACCOUNT + "?user_id=" + userId, {
    headers: { Authorization: authToken, "Content-Type": "application/json" },
  });
}

export function deleteBankAccount(authToken, data) {
  return API.post(DELETE_BANK_ACCOUNT, data, {
    headers: { Authorization: authToken },
  });
}

export function addBankAccountApi(authToken, data) {
  return API.post(ADD_BANK_ACCOUNT, data, {
    headers: { Authorization: authToken },
  });
}