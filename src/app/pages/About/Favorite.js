import React, { useState, useEffect } from "react";
import SingleProduct from "../../../components/Common/SingleProduct";
import TitleComponent from "../../../components/Common/TitleComponent";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { withRouter, useHistory, Link } from "react-router-dom";
import { getFavorites, addToFavorites } from "../../crud/auth.crud";
import { showToast } from "../../../utils/utils";
import { removeFavorite } from "../../../redux/actions/favoriteAction";
import { CircularProgress } from '@material-ui/core';

function Favorite(props) {
  const history = useHistory();
  const dispatch = useDispatch();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const { authToken, authUser } = useSelector(
    ({ auth }) => ({
      authToken: auth?.user?.token,
      authUser: auth?.user,
    }),
    shallowEqual
  );

  const { favoritesId } = useSelector(
    ({ favoriteReducer }) => ({
      favoritesId: favoriteReducer.favorites
    }),
    shallowEqual
  );

  const getFavoritesHandler = async () => {
    if (authToken) {
      setLoading(true)
      await getFavorites(authToken, authUser.id, 0)
        .then((result) => {
          setFavorites(result.data.postdata.data);
        })
        .catch((errors) => {
          setLoading(false)
          setFavorites([]);
        });
    } else {
      setFavorites([...favoritesId])
    }
    setLoading(false)
  }

  const addToFavoritesHandler = async (productId, isFavorite) => {
    if (authToken) {
      let obj = {
        user_id: authUser.id,
        product_id: productId,
        isFavorite
      }
      await addToFavorites(authToken, obj).then(async (result) => {
        if (result.data.success) {
          // showToast("success", result.data.message);
          setLoading(true)
          getFavoritesHandler();
        }
      }).catch((errors) => {
        let error_status = errors.response.status;
        if (error_status !== 401) {
          // showToast("error", errors);
        }
      });
    } else {
      if (!isFavorite) {
        dispatch(removeFavorite(productId));
      }
    }
  }

  useEffect(() => {
    setLoading(true)
    getFavoritesHandler();
  }, [favoritesId]);

  const onProductClick = (item) => {
    history.push({ pathname: `/product-details/abc_jhf_${item.id}`, state: { productId: item } });
  }

  return (
    <>
      <TitleComponent title={props.title} icon={props.icon} />
      <section className="py-5 bg-light-gray favorite-default-height">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-12 col-sm-6">
              <h1 className="text-brown font-CambonRegular font-35 text-uppercase mb-0 line-before">
                favorites
              </h1>
            </div>
            <div className="col-12 col-sm-6 text-end">
              <Link
                to="/products"
                className="text-brown font-InterRegular font-18 text-uppercase"
              >
                Back to shop
              </Link>
            </div>
          </div>
          {/* {loading && favorites?.length > 0 ? ( */}
          <div className="row">
          {loading ? <div className="text-center py-5"> <CircularProgress color="inherit" /> </div> :
            favorites?.length > 0 ? favorites?.map((item, index) => (
              <div className="col-12 col-md-6 col-lg-4 col-xl-3 mt-4" key={index}>
                <SingleProduct
                  showActiveIcon={false}
                  productData={item.Product}
                  img={item?.Product?.ProductImages[0]?.image_url}
                  title={item?.Product?.title}
                  price={item?.Product?.rental_fee["2weeks"]}
                  onClick={() => onProductClick(item?.Product?.id)}
                  showStatus={false}
                  isFavorite={true}
                  addToFavoritesHandler={addToFavoritesHandler}
                />
              </div>
              
          )) : <div className="text-black d-flex text-decoration-none bg-testimonial-box br-20 align-items-center py-5 justify-content-center mx-auto w-75 font-30 font-InterLight mt-5 mb-5 shadow">
            <div>
              <h5 className="text-center">No products added.</h5>
            </div>
          </div>}
        </div>
        </div>
      </section>
    </>
  );
}

export default withRouter(Favorite);
