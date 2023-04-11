import React from "react";
import { useHistory } from "react-router-dom";

function NotFound() {
  const history = useHistory();
  return (
    <div className="container">
      <div className="text-black d-flex text-decoration-none bg-light-gray br-20 align-items-center py-5 justify-content-center mx-auto w-75 font-30 font-InterExtraLight mt-5 mb-5 shadow">
        <div className="text-center">
          <h5>404</h5>
          <h1>Page not found</h1>
          <button
            className="btn cus-React-btn mt-4 font-18 px-5 shadow-none"
            onClick={() => {
              history.push("/products")
            }}
          >
            Continue Rotating
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
