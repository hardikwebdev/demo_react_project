import React, { useState, useEffect, useRef, useContext } from "react";
import { withRouter, useLocation, useHistory, Link } from "react-router-dom";
import TitleComponent from "../../../components/Common/TitleComponent";
import {
  addProduct,
  editProduct
} from "../../crud/auth.crud";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ExpandMore } from "@material-ui/icons";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  CircularProgress
} from "@material-ui/core";
import { showToast } from "../../../utils/utils";
import { useSelector, shallowEqual, useDispatch } from "react-redux";

function PreviewProduct(props) {
  const locationHistory = useLocation();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { authToken, userid, authUser } = useSelector(
    ({ auth }) => ({
      authToken: auth?.user?.token,
      userid: auth?.user?.id,
      authUser: auth?.user,
    }),
    shallowEqual
  );

  const handleAddSubmit = async (values) => {
    // values.files = JSON.stringify(selectedFiles);
    await addProduct(authToken, values)
      .then((result) => {
        if (result.data.success) {
          // showToast("success", result.data.message);
          window.location.replace("/profile");
          setErrorMsg("");
        }
      })
      .catch((errors) => {
        // showToast("error", errors);
        setErrorMsg(errors.response.data.message);
      });
      setLoading(false);
  };

  const handleUpdateSubmit = async (values) => {
    // values.files = JSON.stringify(selectedFiles);
    await editProduct(authToken, values)
      .then((result) => {
        if (result.data.success) {
          // showToast("success", result.data.message);
          window.location.replace("/profile");
          setErrorMsg("");
        }
      })
      .catch((errors) => {
        // showToast("error", errors);
        setErrorMsg(errors.response.data.message);
      });
      setLoading(false);
  };

  useEffect(() => {
    if (locationHistory && locationHistory.state) {
      const { productDetails } = locationHistory.state;
      setProductData(productDetails);
      setActiveImage(productDetails.ProductImages[0].image_url);
    } else {
      window.location.replace("/profile");
    }
  }, [locationHistory]);

  return (
    <>
      <TitleComponent title={props.title} icon={props.icon} />
      <section className="bg-light-gray pb-5">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h1 className="text-brown font-CambonRegular font-35 text-uppercase line-before py-3">
                Listing details
              </h1>
            </div>
            <div className="col-12 col-lg-6 ps-lg-0">
              <div className="row">
                <div className="col-12 col-lg-3 order-2 order-lg-1 mt-3 mt-lg-0">
                  <div className="row flex-nowrap flex-lg-wrap overflow-auto mh-500 cus-scroll">
                    {productData?.ProductImages?.map((item, index) => (
                      <div className="col-4 col-lg-12  product-image-slider-style" key={index}>
                        <img
                          src={item.image_url}
                          className={`img-fluid d-block mx-auto w-100 px-2 px-lg-0 ${index != 0 && "mt-lg-3"} ${activeImage == item.image_url && 'border-black'}`}
                          onClick={() => setActiveImage(item.image_url)}
                        />
                      </div>
                    ))}

                  </div>
                </div>
                <div className="col-12 col-lg-9 order-1 order-lg-2">
                  <div>
                    {activeImage != "" && (
                      <div>
                        <div className="text-left">
                          <img
                            src={activeImage}
                            className="img-fluid mh-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-6 mt-4 mt-lg-0">
              <div className="row mx-0">
                <div className="col-12">
                  <h1 className="font-CambonRegular font-26 text-black-3 mb-0">
                    {productData?.title}
                  </h1>
                </div>
                <div className="col-12 col-sm-6 mt-3">
                  <p className="font-InterRegular font-14 text-black-3">
                    {authUser?.first_name}’s product
                  </p>
                  <p className="font-InterLight font-16 text-black-3">
                    From ${productData?.rental_fee["2weeks"]} USD
                  </p>
                </div>
                <div className="col-12 col-sm-6 mt-3">
                  {productData?.shipping_type === 0 || productData?.shipping_type === 2 && <div className="d-flex align-items-center">
                    <img src="/media/images/location-logo.svg" className="w-20px ms-2 cus-tooltop-btn" />
                    <p className="font-InterExtraLight font-18 mb-0 ms-2 text-black-3">
                      {productData?.location_id}
                    </p>
                  </div>}
                </div>
                <div className="col-12 pt-3">
                  <ul className="navbar-nav cus-product-detail-accordion font-InterExtraLight">
                    <Accordion defaultExpanded={true}>
                      <AccordionSummary
                        expandIcon={<ExpandMore />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                      >
                        <Typography className="font-InterRegular font-18 text-color-3 text-uppercase">Description</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography>
                          <p className="font-InterLight text-black-3 font-16">
                            {productData?.description}
                          </p>
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                    <Accordion defaultExpanded={true}>
                      <AccordionSummary
                        expandIcon={<ExpandMore />}
                        aria-controls="panel2a-content"
                        id="panel3a-header"
                      >
                        <Typography className="font-InterRegular font-18 text-color-3">DETAILS</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography>
                          <div className="row">
                            <div className="col-12">
                              <span className="text-black-3 font-16 font-InterRegular text-nowrap">SIZE: </span>
                              <span className="text-black-3 font-16 font-InterExtraLight text-nowrap">
                                {productData?.size}
                              </span>
                            </div>
                          </div>
                          <div className="row mt-2">
                            <div className="col-12">
                              <span className="text-black-3 font-16 font-InterRegular text-nowrap">COLOR: </span>
                              <span className="text-black-3 font-16 font-InterExtraLight text-nowrap">
                                {productData?.color.join(", ")}
                              </span>
                            </div>
                          </div>
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  </ul>
                </div>

                <div className="col-12 mt-3">
                  <h2 className="font-InterRegular font-26 text-black-3 mb-0">
                    ${productData?.retail_price}
                  </h2>
                </div>
              </div>
            </div>
          </div>

          <div className="row px-2 mt-5">
            <div className="col-12">
              <div className="row align-items-center">
                <div className="col-12 col-sm-6 mt-4">
                  <Link
                    className="text-brown font-18 font-InterRegular text-uppercase"
                    onClick={() => { history.push({ pathname: "/listing-details", state: { productDetails: productData, isEditMode: false, onPage: false } }); }}
                  >
                    Return to listing details
                  </Link>
                </div>
                <div className="col-12 col-sm-6 text-sm-end mt-4">
                  <button
                    className="btn cus-React-btn text-uppercase shadow-none" onClick={() => {
                      setLoading(true);
                      if(productData?.isUpdate) {
                        handleUpdateSubmit(productData);
                      } else {
                        handleAddSubmit(productData);
                      }
                    }}
                    disabled={loading}>
                    {!loading ? productData?.isUpdate ? "Update" : "Upload" : <CircularProgress/>}
                  </button>
                  <div className="text-danger mt-2">
                    {errorMsg}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default withRouter(PreviewProduct);
