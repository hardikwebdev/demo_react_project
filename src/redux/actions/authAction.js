import ACTIONS from "./index";

export const dispatchLogin = (user) => {
  return {
    type: ACTIONS.LOGIN,
    payload: { user },
  };
};

export const dispatchLogout = (user) => {
  return {
    type: ACTIONS.LOGOUT,
  };
};
