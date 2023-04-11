import React, { useState, useEffect } from "react";
import SingleProduct from "../../../components/Common/SingleProduct";
import SimpleSlider from "../../../components/Common/Testimonial";
import TitleComponent from "../../../components/Common/TitleComponent";
import { featuredRentals, testimonials } from "../../crud/auth.crud";
import { Fade } from "react-reveal";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { addSearchText } from "../../../redux/actions/searchTextAction";
import { addSearchProduct } from "../../../redux/actions/searchProductAction";
import { withRouter, useHistory, Link } from "react-router-dom";
import { searchProducts, addToFavorites, getFavorites } from "../../crud/auth.crud";
import { Star } from "@material-ui/icons";
import { addFavorite, removeFavorite } from "../../../redux/actions/favoriteAction";
import { showToast } from "../../../utils/utils";

function HomePage(props) {
  const history = useHistory();
  const dispatch = useDispatch();

  const [featuredata, setFeatureData] = useState([]);
  const [searchText, setSearchText] = useState("dress");
  const [carouselData, setCarouselData] = useState([]);
  const [data, setData] = useState({});
  const [isClicked, setClicked] = useState(false);
  const [favorites, setFavorites] = useState([]);

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

  useEffect(() => {
    getFavoritesHandler();
  }, [favoritesId]);

  const getFeaturedRental = () => {
    featuredRentals()
    .then((result) => {
      setFeatureData(result.data.payload);
    })
    .catch((errors) => {
      setFeatureData([]);
    });
  }

  useEffect(() => {
getFeaturedRental();
  }, []);

  useEffect(() => {
    if (carouselData.length <= 0) {
      testimonials()
        .then((result) => {
          setCarouselData(result.data.payload);
        })
        .catch(() => {
          setCarouselData([]);
        });
    }
  }, []);

  const getSearchProducts = (values, type) => {
    let occasionType = "";
    let clothingType = ""
    if (type === "Occasion") {
      occasionType = [values]
    } else if (type === "Clothing") {
      clothingType = [values]
    }

    searchProducts(values, "", "", "", "", "", "", "", "", clothingType, occasionType, "")
      .then((result) => {
        setData(result.data);
        dispatch(addSearchText(values));
        dispatch(
          addSearchProduct(
            result.data.payload ? result.data.payload.data.rows : [],
            values,
            type
          )
        );
        history.push({ pathname: "/search" });
      })
      .catch((err) => {
        setData([]);
      });
  };

  const getFavoritesHandler = async () => {
    if (authToken) {
      await getFavorites(authToken, authUser.id, 1)
        .then((result) => {
          setFavorites(result.data.postdata.idArr);
        })
        .catch((errors) => {
          setFavorites([]);
          console.log("ERROR : ", errors)
        });
    } else {
      let arr = [];
      await favoritesId.map(val => arr.push(val.Product.id));
      setFavorites([...arr]);
    }
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
          getFavoritesHandler();
          getFeaturedRental();
        }
      }).catch((errors) => {
        let error_status = errors.response.status;
        if (error_status !== 401) {
          // showToast("error", errors);
        }
      });
    } else {
      let data = featuredata.filter(val => val.id === productId);
      if (data.length > 0 && isFavorite) {
        dispatch(addFavorite({ Product: { ...data[0] } }));
      } else if (!isFavorite) {
        dispatch(removeFavorite(productId));
      }
    }
  }

  const getStars = (rating) => {
    let html = [];
    for(let i = 0; i < rating; i++){
    html.push(<Star className="text-brown" />)
    }
    return html;
    }

  const onProductClick = (item) => {
    history.push({ pathname: `/product-details/abc_jhf_${item.id}`, state: { productId: item.id } });
  }

  return (
    <>
      <TitleComponent title={props.title} icon={props.icon} />
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 col-lg-4 p-0 text-center">
            <img
              src="/media/images/home1.png"
              className="img-fluid w-100 h-100"
              onClick={() => getSearchProducts("Bottom", "Clothing")}
            />
          </div>
          <div className="col-12 col-lg-4 p-0 text-center position-relative">
            <img
              src="/media/images/home2.png"
              className="img-fluid w-100 h-100"
              onClick={() => getSearchProducts("Top", "Clothing")}
            />
            <div className="start-renting-btn">
              <Fade down>
                <button
                  className="btn cus-React-btn shadow-none"
                  onClick={() => getSearchProducts(searchText, "")}
                >
                  START RENTING
                </button>
              </Fade>
            </div>
          </div>
          <div className="col-12 col-lg-4 p-0 text-center">
            <img
              src="/media/images/home3.png"
              className="img-fluid w-100 h-100"
              onClick={() => getSearchProducts("Dress", "Clothing")}
            />
          </div>
        </div>
      </div>

      <section className="py-5 bg-light-gray ">
        <div className="container">
          <div className="row justify-content-center pt-3">
            <div className="col-12 col-lg-10 text-center">
              <Fade left>
                <h1 className="text-brown font-CambonRegular font-35 text-uppercase">
                  ABOUT React
                </h1>
              </Fade>
              <p className="font-18 text-black-3 font-InterLight mt-4">
              </p>
              <p className="font-18 text-black-3 font-InterLight">
              </p>
            </div>
          </div>
        </div>
      </section>

      {featuredata.length > 0 && (
        <section className="py-5 bg-light-gray ">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-12 col-sm-9">
                <h1 className="text-brown font-CambonRegular font-35 text-uppercase mb-0">
                  Featured Rentals
                </h1>
              </div>
              <div className="col-12 col-sm-3 text-end">
                <Link
                  to="/products"
                  className="text-brown font-InterRegular font-18 text-uppercase"
                >
                  View More
                </Link>
              </div>
            </div>
            <div className="row">
              {featuredata?.map((item, index) => (
                <div className="col-12 col-md-6 col-lg-4 col-xl-3 mt-4" key={index}>
                  <SingleProduct
                    showActiveIcon={false}
                    productData={item}
                    img={item.ProductImages[0]?.image_url}
                    title={item.title}
                    price={item?.rental_fee["2weeks"]}
                    onClick={() => onProductClick(item)}
                    showStatus={false}
                    isFavorite={favorites ? favorites.includes(item.id) : false}
                    addToFavoritesHandler={addToFavoritesHandler}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-5 bg-cream-light">
        <div className="container">
          <div className="row cursor">
            <div className="col-12 text-center">
              <Fade left>
                <h1 className="text-brown font-CambonRegular font-35 text-uppercase">
                  List React
                </h1>
              </Fade>
              <p className="font-18 text-black-3 font-InterLight mt-4">
              </p>
            </div>
          </div>

          <div className="row py-5">
            <div className="col-12 col-md-6 col-lg-4">
              <div className="row">
                <div className="col-3 text-center">
                  <h1 className="font-Calypso font-95 text-brown">1</h1>
                </div>
                <div className="col-9">
                  <p className="font-18 text-black-3 font-InterLight mt-2"></p>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-4">
              <div className="row">
                <div className="col-3 text-center">
                  <h1 className="font-Calypso font-95 text-brown">2</h1>
                </div>
                <div className="col-9">
                  <p className="font-18 text-black-3 font-InterLight mt-2"></p>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-4">
              <div className="row">
                <div className="col-3 text-center">
                  <h1 className="font-Calypso font-95 text-brown">3</h1>
                </div>
                <div className="col-9">
                  <p className="font-18 text-black-3 font-InterLight mt-2"></p>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12 text-center">
              <Fade down>
                <button
                  className="btn cus-React-btn shadow-none"
                  onClick={() => {
                    history.push({ pathname: "/profile" });
                  }}>
                  LIST NOW
                </button>
              </Fade>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-light-gray ">
        <div className="container">
          <div className="row">
            <div className="col-12 col-md-6 text-center" style={{ cursor: "pointer" }} onClick={() => getSearchProducts("Wedding", "Occasion")}>
              <img src="/media/images/weddings.png" className="img-fluid" />

              <h1 className="text-black-3 font-CambonRegular font-35 text-uppercase mt-4">
                Weddings
              </h1>
              <a
                className="text-black-3 font-InterRegular font-18 text-uppercase"
              >
                Shop the Edit
              </a>
            </div>
            <div className="col-12 col-md-6 text-center mt-4 mt-md-0" style={{ cursor: "pointer" }} onClick={() => getSearchProducts("The Vacation Edit ", "Occasion")}>
              <img src="/media/images/vacation.png" className="img-fluid" />

              <h1 className="text-black-3 font-CambonRegular font-35 text-uppercase mt-4">
                Vacation
              </h1>
              <a
                className="text-black-3 font-InterRegular font-18 text-uppercase"
              >
                Shop the Edit
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-light-gray">
        <div className="container pb-5">
          <div className="row">
            <div className="col-12 text-center">
              <h1 className="text-brown font-CambonRegular font-35 text-uppercase">
                Testimonials
              </h1>
            </div>

            {carouselData && carouselData.length > 0 && carouselData.map((val, i) => (<div className="col-12 col-md-6 col-lg-3 mt-4">
              {val.user_profile_image ? (<img src={val.user_profile_image} className={`img-fluid h-75 w-100 br-5 ${ i === 0 && "object-fit-cover"}`} />) :  <div className="bg-cream-light py-5 px-3 br-5 h-75">
                <p className="font-16 text-black-3 font-InterLight">{val.review}</p>
              </div>}
              
              <div className="mt-3 h-25">
                <p className="font-16 text-black-3 font-InterRegular text-uppercase mb-2">{val.user_name}, {val.user_location}</p>

                <div className="d-flex align-items-center">
                  {getStars(val.rating)}
                </div>
              </div>
            </div>))}
          </div>
        </div>

        <div className="row mx-0">
            <div className="col-12 text-center">
              <Fade down>
                <button
                  className="btn cus-React-btn shadow-none"
                  onClick={() => {
                    window.open("mailto:info@Reactyourproduct.co")
                  }}>
                    Leave Us A Review
                </button>
              </Fade>
            </div>
          </div>
      </section>
    </>
  );
}

export default withRouter(HomePage);
