import React, { useState, useEffect, useRef } from "react";
import { withRouter, useHistory, useLocation } from "react-router-dom";
import FilterProduct from "../../../components/Common/FilterProduct";
import TitleComponent from "../../../components/Common/TitleComponent";
import SingleProduct from "../../../components/Common/SingleProduct";
import { getProductList, addToFavorites, getFavorites } from "../../crud/auth.crud";
import Pagination from "../../../components/Common/Pagination";
import { CircularProgress } from '@material-ui/core';
import { showToast } from "../../../utils/utils";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { addFavorite, removeFavorite } from "../../../redux/actions/favoriteAction";


function ProductPage(props) {
  const history = useHistory();
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availability_status, setAvailabilityStatus] = useState(0);
  const [priceArr, setPriceArr] = useState([]);
  const [meta_type, setMetaTypeArr] = useState([]);
  const [meta_value, setMetaValueArr] = useState([]);
  const [product, setproduct] = useState([]);
  const [date_range, setDateRange] = useState([]);
  const [location, setLocation] = useState({ zip_code: "", selected_mile: "" });
  const [sortBy, setSortBy] = useState(0);
  const [filters, setFilters] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [activePage, setActivePage] = useState(1);
  const [limit, setlimit] = useState(9);
  const [productCount, setProductCount] = useState(0);
  const [filterTypes, setFilterTypes] = useState([]);
  const [mainCategoryFilter, setMainCategoryFilter] = useState([]);
  const [category, setCategory] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [occasion, setOccasion] = useState([]);
  const [addedFilters, setAddedFilters] = useState({});
  const locationHistory = useLocation();
  const abortController = useRef();

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
  const dispatch = useDispatch();

  const getProductsList = async () => {
    setLoading(true);
    let date = {};  
    if (date_range[0] && date_range[1]) {
      date = {
        startDate: new Date(date_range[0]),
        endDate: new Date(date_range[1])
      }
    } else {
      date = null;
    }
    
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();
    const { signal } = abortController.current;
    await getProductList(sortBy, availability_status, priceArr, meta_value, meta_type, product, location, limit, activePage, date, mainCategoryFilter, occasion, signal)
      .then((result) => {
        setProductCount(result.data.payload ? result.data.payload.data.count : 0);
        setProductData(result?.data?.payload?.data?.rows);
        setLoading(false);
      })
      .catch((errors) => {
        // showToast("error", errors);
      });
  };

  const handleStateFilters = async () => {
    if (locationHistory && locationHistory.state) {
      let tempObj = { ...locationHistory.state.filtersObjOnPage };
      let tempObjFilter = { ...locationHistory.state.filtersObj };     
      setOccasion([...tempObj?.occasion]);
      setPriceArr([...tempObj?.priceArr]);
      setMetaTypeArr([...tempObj?.meta_type]);
      setMetaValueArr([...tempObj?.meta_value]);
      setproduct([...tempObj?.product]);
      setLocation({ ...tempObj?.location });
      setDateRange([...tempObj?.date_range]);
      setAvailabilityStatus(tempObj?.availability_status);
      setMainCategoryFilter([...tempObj?.mainCategoryFilter]);
      setCategory({ ...tempObj?.category });
      setFilterTypes([...tempObj?.filterTypes]);
      setActivePage(tempObj?.activePage);
      setAddedFilters({ ...tempObjFilter });

      window.history.replaceState(null, '', '/products');
    }
  };

  useEffect(() => {
    handleStateFilters();
  }, []);

  useEffect(() => {
    getFavoritesHandler();
  }, [favoritesId]);

  const handleClearAllState = async () => {
    await getProductsList();
    if (availability_status !== 0 ||
      date_range.length !== 0 ||
      priceArr.length !== 0 ||
      meta_type.length !== 0 ||
      meta_value.length !== 0 || product.length !== 0 || location.zip_code !== "" ||
      location.selected_mile !== "" || sortBy !== 0 || mainCategoryFilter.length !== 0 ||
      occasion.length !== 0) {
      setFilters(true);
    }
  }

  useEffect(() => {
    handleClearAllState();
  }, [availability_status, date_range, priceArr, meta_value, meta_type, product, location, sortBy, limit, activePage, mainCategoryFilter, occasion]);

  const handleChange = (number) => {
    setActivePage(number);
  }

  const onProductClick = (item, filtersObj, filtersObjOnPage) => {
    history.push({ pathname: `/product-details/abc_jhf_${item.id}`, state: { productId: item.id, fromPage: "product", isLocalPickup: location, filtersObj: filtersObj, filtersObjOnPage: filtersObjOnPage } });
  }
  const getFilterTypes = (item) => {
    setFilterTypes(item)
  }

  const categoryFilter = async (val, type) => {
    let filtered = [...filterTypes];
    let innerIn = "";
    let outerIn = "";
    let typeArr = [];
    let alreadyFiltered = false;
    let mainIndex = "";
    let mainAlreadyFiltered = false;

    await filterTypes.map(async (values, index) => {
      await values.subtype.map((data, ind) => {
        typeArr.push(data.name);
        if (data.name === val) {
          if (filtered[index].subtype[ind].active === true) {
            // filtered[index].subtype[ind].active = false;
            alreadyFiltered = true;
          } else {
            innerIn = ind;
            outerIn = index;
          }
        }
        filtered[index].subtype[ind].active = false;
      })

      if (values.type === val) {
        if (filtered[index].active === true) {
          // filtered[index].active = false;
          mainAlreadyFiltered = true;
        } else {
          mainIndex = index;
        }
      }
      filtered[index].active = false;
    })
    setCategory({});
    if (innerIn !== "" && outerIn !== "") {
      filtered[outerIn].subtype[innerIn].active = true;
      setCategory({
        name: filtered[outerIn].subtype[innerIn].name,
        type: "innerFilter"
      });
    }

    if (mainIndex !== "") {
      filtered[mainIndex].active = true;
      setCategory({
        name: filtered[mainIndex].type,
        type: "mainCategory"
      });
    }
    setFilterTypes(filtered);

    if (val) {

      let d = [...meta_type];
      d = d.filter(it => it !== "type");

      let dval = [...meta_value];
      dval = dval.filter(it => !typeArr.includes(it));

      let cVal = [];

      if (!alreadyFiltered && type === "innerFilter") {
        dval.push(val);
        d.push("type");
      }

      if (!mainAlreadyFiltered && type === "mainCategory") {
        cVal.push(val);
      }

      setMetaTypeArr(d);
      setMetaValueArr(dval);
      setMainCategoryFilter(cVal);
      setActivePage(1);
    }
  }

  const getFavoritesHandler = async () => {
    if (authToken) {
      await getFavorites(authToken, authUser.id, 1)
        .then((result) => {
          setFavorites(result.data.postdata.idArr);
        })
        .catch((errors) => {
          setFavorites([]);
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
          getProductsList();
        }
      }).catch((errors) => {
        let error_status = errors.response.status;
        if (error_status !== 401) {
          // showToast("error", errors);
        }
      });
    } else {
      let data = productData.filter(val => val.id === productId);
      if (data.length > 0 && isFavorite) {
        dispatch(addFavorite({ Product: { ...data[0] } }));
      } else if (!isFavorite) {
        dispatch(removeFavorite(productId));
      }
    }
  }

  return (
    <>
      <TitleComponent title={props.title} icon={props.icon} />
      <section className="bg-light-gray">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h1 className="text-brown font-CambonRegular font-35 text-uppercase py-3">
                All Products
              </h1>
            </div>
            <div className="col-12 col-lg-3 d-none d-lg-block">
              <div className="row mx-0">
                <div className="col-12 col-lg-10 ps-0 mt-2 pt-2 border-light-black">
                  <h3 className="font-16 text-black-3 font-InterRegular text-uppercase">CATEGORY</h3>
                </div>

                <div className="col-12 mt-3 ps-0">
                  <ul className="mb-0 list-unstyled">
                    {filterTypes.map((item, index) => (
                      <li key={index}>
                        <a className={`font-16 text-black-3 mt-2 mb-0 text-decoration-none cursor-pointer ${item.active ? "fw-bold" : "font-InterRegular"}`} onClick={() => categoryFilter(item.type, "mainCategory")}>{item.type}</a>
                        <ul className="mb-0 list-unstyled">
                          {item.subtype.map((i, index) => (
                            <li key={index}>
                              <a className={`font-16 text-black-3 font-InterLight cursor-pointer text-decoration-none ms-3 ${i.active ? "fw-bold" : ""}`} onClick={() => categoryFilter(i.name, "innerFilter")}>{i.name}</a>
                            </li>
                          ))
                          }
                        </ul>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
            <div className="col-12 col-lg-9">
              <FilterProduct
                setAvailabilityStatus={setAvailabilityStatus}
                priceArr={priceArr}
                setPriceArr={setPriceArr}
                meta_type={meta_type}
                meta_value={meta_value}
                setMetaTypeArr={setMetaTypeArr}
                setMetaValueArr={setMetaValueArr}
                product={product}
                setproduct={setproduct}
                location={location}
                setLocation={setLocation}
                setSortBy={setSortBy}
                date_range={date_range}
                setDateRange={setDateRange}
                setSelectedDates={setSelectedDates}
                activePage={activePage}
                setActivePage={setActivePage}
                getFilterTypes={getFilterTypes}
                setMainCategoryFilter={setMainCategoryFilter}
                mainCategoryFilter={mainCategoryFilter}
                category={category}
                categoryFilter={categoryFilter}
                setAddedFilters={setAddedFilters}
                addedFilters={addedFilters}
                filterTypes={filterTypes}
                occasion={occasion}
                setOccasion={setOccasion}

              />

              <div className="row">
                {loading ? <div className="text-center py-5"> <CircularProgress color="inherit" /> </div> :
                  productData.length > 0 ?
                    productData.map((item, index) => (
                      <div className="col-12 col-md-6 col-xl-4 mt-4" key={index}>
                        <SingleProduct
                          productData={item}
                          showActiveIcon={true}
                          img={item.ProductImages[0]?.image_url}
                          title={item.title}
                          price={item?.rental_fee["2weeks"]}
                          showStatus={false}
                          onClick={() => {
                            let tempObjOnPage = {
                              priceArr,
                              meta_type,
                              meta_value,
                              product,
                              location,
                              date_range,
                              mainCategoryFilter,
                              category,
                              filterTypes,
                              occasion,
                              activePage,
                              availability_status
                            };
                            let tempObj = { ...addedFilters, location: location,availability_status:availability_status,date_range : date_range };
                            onProductClick(item, tempObj, tempObjOnPage);
                          }}
                          isFavorite={favorites ? favorites.includes(item.id) : false}
                          addToFavoritesHandler={addToFavoritesHandler}
                        />
                      </div>
                    )) :
                    <div className="text-black d-flex text-decoration-none bg-testimonial-box br-20 align-items-center py-5 justify-content-center mx-auto w-75 font-30 font-InterExtraLight mt-5 mb-5 shadow">
                      <div>
                        <h5 className="text-center">{filters ? "No results found for selected filters." : "No results found for products."}</h5>
                        {filters && <h5 className="text-center">Check with different filters.</h5>}
                      </div>
                    </div>
                }
              </div>

              {productCount > 0 && !loading && <div className="d-flex justify-content-center align-items-center py-5 cus-pagination">
                <Pagination
                  className="pagination-bar"
                  currentPage={activePage}
                  totalCount={productCount}
                  pageSize={limit}
                  onPageChange={page => setActivePage(page)}
                />
              </div>}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default withRouter(ProductPage);