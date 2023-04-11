import ACTIONS from "../actions";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const initialState = {
  user: undefined,
  token: undefined,
};

const authReducer = persistReducer(
  {
    storage,
    key: "demo2-auth",
    whitelist: ["user", "authToken"],
  },
  (state = initialState, action) => {
    switch (action.type) {
      case ACTIONS.LOGIN:
        const { user } = action.payload;
        const authToken = user.token;
        return {
          ...state,
          user,
          authToken,
        };
      case ACTIONS.LOGOUT:
        Object.keys(state).forEach((key) => {
          storage.removeItem(`persist:${key}`);
        });
        break;
      default: {
        return state;
      }
    }
  }
);

export default authReducer;
