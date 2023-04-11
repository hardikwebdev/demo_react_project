import React, { useEffect, useState } from "react";
import { useHistory, useLocation, Link } from "react-router-dom";
import { getCartList, order } from "../../crud/auth.crud";
import { useSelector, shallowEqual } from "react-redux";
import { showToast } from "../../../utils/utils";

function Success() {
    const locationHistory = useLocation();
    const params = new URLSearchParams(locationHistory.search)
    const [order_id, setOrderId] = useState("");
    const { authToken, authUser } = useSelector(
        ({ auth }) => ({
            authToken: auth.user.token,
            authUser: auth?.user,
        }),
        shallowEqual
    );

    const placeOrder = async () => {
        await getCartList(authToken, authUser.id)
            .then(async (result) => {
                var data = result.data.postdata.data;
                let orderArr = [];
                let session_id = params.get("session_id");
                if (data.length > 0) {
                    await data.map(val => {
                        let curObj = {
                            buyer_id: authUser.id,
                            seller_id: val.seller_id,
                            product_id: val.product_id,
                            amount: val.amount,
                            start_date: val.start_date,
                            end_date: val.end_date,
                            total_amount: val.amount,
                            quantity: val.quantity,
                            rental_period: val.rental_period,
                            shipping_address: "",
                            shipping_type: val.shipping_type
                        }
                        orderArr.push(curObj);
                    })
                }
                await order(authToken, {
                    orderArr: orderArr,
                    session_id
                }).then((result) => {
                    setOrderId(result.data.postdata.orderIdArr[0])
                })
            })
            .catch((errors) => {
                showToast("error", errors);
            });
    }

    useEffect(() => {
        let isSuccess = params.get("session_id");
        if (!isSuccess) {
            window.location.replace("/");
        } else {
            placeOrder();
        }
    }, []);
    const history = useHistory();
    return (
        <div className="container">
            <div className="text-black d-flex text-decoration-none bg-light-gray br-20 align-items-center py-5 justify-content-center mx-auto w-75 font-30 font-InterExtraLight mt-5 mb-5 shadow">
                <div className="text-center">
                    <h5>Your order has been placed.</h5>
                    <h1>Thank You!</h1>
                    <button
                        className="btn cus-React-btn mt-4 font-18 px-5 shadow-none"
                        onClick={() => {
                            history.push("/products")
                        }}
                    >
                        Continue Rotating
                    </button>
                    <br></br>
                    <Link
                        to={{ pathname: "/order-details", state: { orderId: order_id } }}
                        className="font-18 text-black-2 font-InterExtraLight"
                    >View order details.</Link>
                </div>
            </div>
        </div>
    );
}

export default Success;