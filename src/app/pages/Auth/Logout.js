import { React, useEffect } from "react";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { Redirect } from "react-router-dom";
import { CircularProgress } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { dispatchLogout } from "../../../redux/actions/authAction";
import { logout } from "../../crud/auth.crud";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showToast } from "../../../utils/utils";

export const Logout = () => {
  const dispatch = useDispatch();

  const history = useHistory();

  const { authToken, user, userName } = useSelector(
    ({ auth }) => ({
      authToken: auth?.user?.token,
      user: auth?.user,
      userName: auth?.user?.first_name,
    }),
    shallowEqual
  );

  useEffect(() => {
    if (authToken) {
      logout(authToken)
        .then((result) => {
          var data = result.data;
          // showToast("success", data.message);
          dispatch(dispatchLogout());
          history.push("/account/login");
        })
        .catch((errors) => {
          dispatch(dispatchLogout());
          history.push("/account/login");
          // showToast("error", errors.message);
        });
    }
  });

  return <CircularProgress />;
};
