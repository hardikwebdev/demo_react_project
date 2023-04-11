import ACTIONS from "./index";

export const saveCheckoutData = (shippingAddress, billingAddress, selectedCard, isLocalPickUp, zipCode, shippingCharges) => {
  return {
    type: ACTIONS.SAVE_CHECKOUT_DATA,
    payload: { shippingAddress, billingAddress, selectedCard, isLocalPickUp, zipCode, shippingCharges },
  };
};

export const removeCheckoutData = (data) => {
  return {
    type: ACTIONS.REMOVE_CHECKOUT_DATA
  };
};
