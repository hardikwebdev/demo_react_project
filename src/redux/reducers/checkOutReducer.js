import ACTIONS from "../actions";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const initialState = {
    shippingAddress: {
        address: "",
        appartment: "",
        country: "",
        state: "",
        zip_code: "",
        phone_number: "",
    },
    billingAddress: {
        address: "",
        appartment: "",
        country: "",
        state: "",
        zip_code: "",
        phone_number: "",
    },
    selectedCard: {
        name: "",
        cardNumber: "",
        expirationDate: "",
        cardCvc: "",
        zipCode: ""
    },
    isLocalPickUp: false,
    zipCode: { zip_code: "", selected_mile: "" },
    shippingCharegs: {shippingCharge: "", salesTax: "", rentalFee: "", serviceType: ""}
};

const cartReducer = persistReducer(
    {
        storage,
        key: "checkout",
    },
    (state = initialState, action) => {
        switch (action.type) {
            case ACTIONS.SAVE_CHECKOUT_DATA:
                const { shippingAddress, billingAddress, selectedCard, isLocalPickUp, zipCode, shippingCharges } = action.payload;

                return {
                    ...state,
                    shippingAddress: { ...shippingAddress },
                    billingAddress: { ...billingAddress },
                    selectedCard: { ...selectedCard },
                    isLocalPickUp: isLocalPickUp,
                    zipCode: {...zipCode},
                    shippingCharges: {...shippingCharges}
                };
            case ACTIONS.REMOVE_CHECKOUT_DATA:

                return {
                    shippingAddress: {
                        address: "",
                        appartment: "",
                        country: "",
                        state: "",
                        zip_code: "",
                        phone_number: "",
                    },
                    billingAddress: {
                        address: "",
                        appartment: "",
                        country: "",
                        state: "",
                        zip_code: "",
                        phone_number: "",
                    },
                    selectedCard: {
                        name: "",
                        cardNumber: "",
                        expirationDate: "",
                        cardCvc: "",
                        zipCode: ""
                    },
                    isLocalPickUp: false,
                    zipCode: { zip_code: "", selected_mile: "" },
                    shippingCharegs: {shippingCharge: "", salesTax: "", rentalFee: "", serviceType: ""}
                };
            default: {
                return state;
            }
        }
    }
);

export default cartReducer;
