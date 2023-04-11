import React, { Fragment, useState, useRef, useEffect } from "react";
import { ExpandMore, Close } from "@material-ui/icons";
import clsx from "clsx";
import { FormGroup, FormControlLabel, Checkbox, RadioGroup, Radio, FormControl, MenuItem, Select, InputLabel, } from "@material-ui/core";
import { Modal, Button } from "react-bootstrap";
import FilterProductMobile from "./FilterProductMobile";
import DatePicker, { getAllDatesInRange, DateObject } from "react-multi-date-picker";
import { getGeneralAttributes } from "../../app/crud/auth.crud";
import useWindowDimensions from './GetWindowDimensions';
import CmtInputBox from "../../components/Common/CmtInputBox";
import { Formik } from "formik";
import * as Yup from "yup";
import moment from 'moment';

const filterItems = [
  { name: "Size", filterType: "size" },
  { name: "Availability", filterType: "availability" },
  { name: "Color", filterType: "color" },
  { name: "Brand", filterType: "brand" },
  { name: "product", filterType: "product" },
  { name: "Price", filterType: "price" },
  { name: "Occasion", filterType: "occasion" },
  // { name: "Type", filterType: "type" },
  // { name: "Location", filterType: "location" },
];

const filterItemsMobile = [
  { name: "Size", filterType: "size" },
  { name: "Availability", filterType: "availability" },
  { name: "Color", filterType: "color" },
  { name: "Brand", filterType: "brand" },
  { name: "product", filterType: "product" },
  { name: "Price", filterType: "price" },
  { name: "Category", filterType: "type" },
  { name: "Occasion", filterType: "occasion" },
  // { name: "Location", filterType: "location" },
];

const priceArr = [
  { fromPrice: "0", toPrice: "20", active: false },
  { fromPrice: "20", toPrice: "40", active: false },
  { fromPrice: "40", toPrice: "60", active: false },
  { fromPrice: "60", toPrice: "80", active: false },
  { fromPrice: "80", toPrice: "100", active: false },
  { fromPrice: "100", toPrice: "5000", active: false }
];

function FilterProduct(props) {

  const ref = useRef();
  const showRef = useRef();
  const calendarRef = useRef();
  const [sortBy, setSortBy] = useState(0);
  const [filterSize, setFilterSize] = useState([]);
  const [filterBottoms, setFilterBottoms] = useState([]);
  const [filterColor, setFilterColor] = useState([]);
  const [filterTypes, setFilterTypes] = useState([]);
  const [filterproduct, setFilterproduct] = useState([]);
  const [filterBrand, setFilterBrand] = useState([]);
  const [filterPrice, setFilterPrice] = useState(priceArr);
  const [filterOccasion, setFilterOccasion] = useState([]);
  const [show, setShow] = useState(false);
  const [showClear, setShowClear] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hasAutoShowedModal, setHasAutoShowedModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [date_range, setDateRange] = useState([]);
  const [dateRangeErr, setDateRangeErr] = useState(false);

  const [availability_status, setAvailabilityStatus] = useState(0);
  const [filterType, setFilterType] = useState('');
  const [location, setLocation] = useState({ zip_code: "", selected_mile: "" });
  const [activeFilters, setActvieFilter] = useState({
    size: [],
    availability_status: "",
    color: [],
    brand: [],
    product: [],
    price: [],
    category: {},
    occasion:[],
    date_range:[]
  });
  const [values, setValues] = useState([
    new DateObject(),
    new DateObject()
  ]);
  const [allDates, setAllDates] = useState([])

  // const [mile, setMile] = useState("");

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [date_arr, setDateArr] = useState([]);
  const { height, width } = useWindowDimensions();

  const validationSchema = Yup.object().shape({
    zip_code: Yup.string().matches(/^[0-9]{5}(?:-[0-9]{4})?$/, "Must be a valid ZIP code")
      .required("ZIP code is required"),
    selected_mile: Yup.string().required("Please select a radius.")
  });

  useEffect(() => {
    const checkIfClickedOutside = e => {
      if (show && showRef && showRef.current && !showRef.current.contains(e.target)) {
        setShow(false)
      }
    }

    document.addEventListener("mousedown", checkIfClickedOutside)

    return () => {
      document.removeEventListener("mousedown", checkIfClickedOutside)
    }
  }, [show]);

  const categoabchangeHandler = () => {
    let activeFilter = { ...props.addedFilters.activeFilters };
    activeFilter.category = props.category;
    setActvieFilter({ ...activeFilter });
    let addedFilters = {...props.addedFilters};
    let tempObj = {
      availability_status: availability_status,
      date_range:[...props.date_range],
      filterTypes: [...props.filterTypes],
      activeFilters: { ...activeFilter }
    };
    if(addedFilters?.filterPrice && addedFilters?.filterPrice.length > 0) {
      tempObj.filterPrice = [...addedFilters.filterPrice]
    }
    if(addedFilters?.filterSize && addedFilters?.filterSize.length > 0) {
      tempObj.filterSize = [...addedFilters.filterSize]
    }
    if(addedFilters?.filterBottoms && addedFilters?.filterBottoms.length > 0) {
      tempObj.filterBottoms = [...addedFilters.filterBottoms]
    }
    if(addedFilters?.filterColor && addedFilters?.filterColor.length > 0) {
      tempObj.filterColor = [...addedFilters.filterColor]
    }
    if(addedFilters?.filterBrand && addedFilters?.filterBrand.length > 0) {
      tempObj.filterBrand = [...addedFilters.filterBrand]
    }
    if(addedFilters?.filterproduct && addedFilters?.filterproduct.length > 0) {
      tempObj.filterproduct = [...addedFilters.filterproduct]
    }
    if(addedFilters?.filterOccasion && addedFilters?.filterOccasion.length > 0) {
      tempObj.filterOccasion = [...addedFilters.filterOccasion]
    }
    if (addedFilters?.location) {
      tempObj.location = { ...addedFilters.location };
    }
    if (addedFilters?.availability_status) {
      tempObj.availability_status = addedFilters.availability_status;
    }
    if (addedFilters?.date_range) {
      if (addedFilters?.date_range.length > 0) {
        setStartDate(moment(new Date(addedFilters.date_range[0])).format("D MMM"));
        setEndDate(moment(new Date(addedFilters.date_range[1])).format("D MMM"));
        props.setDateRange([...addedFilters.date_range])
        tempObj.date_range = [...addedFilters.date_range];
      }
    }
    props.setAddedFilters({ ...tempObj });
  }

  useEffect(() => {
    categoabchangeHandler();
  }, [props.category])

  useEffect(() => {
    if (width < 768) {
      setShow(false);
    }
  }, [width]);

  const handleClearShow = () => {
    if (sortBy || availability_status !== 0 || props.date_range.length > 0 || props.meta_value?.length > 0 || props.location.zip_code != "" ||
      props.product?.length > 0 || props.priceArr?.length > 0 || props.location.selected_mile != "" || props.mainCategoryFilter.length > 0 || props.occasion?.length > 0) {
      setShowClear(true);
    } else {
      setShowClear(false);
    }
  }

  useEffect(() => {
    handleClearShow();
  }, [sortBy, props.meta_value, props.location, props.date_range, props.product, props.priceArr,props.occasion]);

  const fetchGeneralAttributes = async () => {
   await getGeneralAttributes()
    .then((result) => {
      let tempObj = { ...props.addedFilters };
      tempObj?.filterPrice ? tempObj?.filterPrice.length > 0 ? setFilterPrice([...tempObj.filterPrice]) : setFilterPrice(priceArr) : setFilterPrice(priceArr);
      if (result.data.payload) {
        let data = result.data.payload;
        let filterSize = data.size.map(item => {
          let obj = {};
          obj.size = item;
          obj.active = false;
          return obj;
        });
        tempObj?.filterSize ? tempObj.filterSize.length > 0 ? setFilterSize([...tempObj.filterSize]) : setFilterSize(filterSize) : setFilterSize(filterSize);
        let filterBottom = data.bottom.map(item => {
          let obj = {};
          obj.bottom = item;
          obj.active = false;
          return obj;
        });
        tempObj?.filterBottoms ? tempObj.filterBottoms.length > 0 ? setFilterBottoms([...tempObj.filterBottoms]) : setFilterBottoms(filterBottom) : setFilterBottoms(filterBottom);
        let filterColor = data.color.map(item => {
          let obj = {};
          obj.color = item;
          obj.active = false;
          return obj;
        });
        tempObj?.filterColor ? tempObj.filterColor.length > 0 ? setFilterColor([...tempObj.filterColor]) : setFilterColor(filterColor) : setFilterColor(filterColor);
        let filterType = data.type.map(item => {
          let obj = {};
          let curArr = [];
          obj.type = item.type;
          item.subtype.map(val => {
            let curObj = {};
            curObj.name = val.name;
            curObj.active = false;
            curArr.push(curObj);
          })
          obj.subtype = curArr;
          obj.active = false;
          return obj;
        });
        tempObj?.filterTypes ? tempObj.filterTypes.length > 0 ? setFilterTypes([...tempObj.filterTypes]) : setFilterTypes(filterType) : setFilterTypes(filterType);
        !tempObj?.filterTypes.length > 0 && props.getFilterTypes(filterType);
        let product = data.product.map(item => {
          let obj = {
            name: item.first_name + "'s product",
            active: false,
            ...item
          };

          return obj;
        });
        tempObj?.filterproduct ? tempObj.filterproduct.length > 0 ? setFilterproduct([...tempObj.filterproduct]) : setFilterproduct(product) : setFilterproduct(product);
        let brand = data.brand.map(item => {
          let obj = {
            name: item,
            active: false,
          };

          return obj;
        });
        tempObj?.filterBrand ? tempObj.filterBrand.length > 0 ? setFilterBrand([...tempObj.filterBrand]) : setFilterBrand(brand) : setFilterBrand(brand);
        if (tempObj.activeFilters) {
          setActvieFilter({ ...tempObj.activeFilters });
        }
        let occasion = data.occasion.map(item => {
          let obj = {
            name: item,
            active: false,
          };

          return obj;
        });
        tempObj?.filterOccasion ? tempObj.filterOccasion.length > 0 ? setFilterOccasion([...tempObj.filterOccasion]) : setFilterOccasion(occasion) : setFilterOccasion(occasion);
        if (tempObj.activeFilters) {
          setActvieFilter({ ...tempObj.activeFilters });
        }
        tempObj?.location ? tempObj.location.zip_code !== "" ? setLocation({ ...tempObj.location }) :
        setLocation(location) : setLocation(location);

        tempObj?.availability_status ? tempObj.availability_status !== 0 ? setAvailabilityStatus(tempObj.availability_status) :
          setAvailabilityStatus(availability_status) : setAvailabilityStatus(availability_status);

        tempObj?.date_range ? tempObj.date_range.length > 0 ? setDateRange([...tempObj.date_range]) :
          setDateRange(date_range) : setDateRange(date_range);
      }
    })
    .catch((errors) => {
    });
  }

  useEffect(() => {
    fetchGeneralAttributes();
  }, [props.addedFilters]);

  const updateAddedFilters = (addedFilters) => {
    let tempObj = { ...addedFilters };
    if (tempObj?.availability_status) {
      setAvailabilityStatus(tempObj.availability_status);
    }
    if (tempObj?.filterPrice) {
      tempObj.filterPrice.length > 0 && setFilterPrice([...tempObj.filterPrice]);
    }
    if (tempObj?.filterSize) {
      tempObj.filterSize.length > 0 && setFilterSize([...tempObj.filterSize]);
    }
    if (tempObj?.filterBottoms) {
      tempObj.filterBottoms.length > 0 && setFilterBottoms([...tempObj.filterBottoms]);
    }
    if (tempObj?.filterColor) {
      if (tempObj.filterColor.length > 0) {
        tempObj.filterColor.length > 0 && setFilterColor([...tempObj.filterColor]);
      }
    }
    if (tempObj?.filterTypes) {
      tempObj.filterTypes.length > 0 && setFilterTypes([...tempObj.filterTypes]);
    }
    if (tempObj?.filterBrand) {
      tempObj.filterBrand.length > 0 && setFilterBrand([...tempObj.filterBrand]);
    }
    if (tempObj?.filterproduct) {
      tempObj.filterproduct.length > 0 && setFilterproduct([...tempObj.filterproduct]);
    }
  }

  const handleChange = (key, value, index) => {
    if (key === "sortBy") {
      setSortBy(value);
      props.setSortBy(value);
    } else if (key === "price") {
      let d = [...filterPrice];
      d[index].active = value;
      setFilterPrice(d);
    } else if (key === "color") {
      let d = [...filterColor];
      d[index].active = value;
      setFilterColor(d);
    } else if (key === "size") {
      let d = [...filterSize];
      d[index].active = value;
      setFilterSize(d);
    } else if (key === "bottom") {
      let d = [...filterBottoms];
      d[index].active = value;
      setFilterBottoms(d);
    } else if (key === "availability_status") {
      let val = value === 2 ? 2 : value.target.value;
      setAvailabilityStatus(parseInt(val));
      if (val !== 2 && date_range.length === 0) {
        setStartDate("");
        setEndDate("");
        setValues([]);
      }
    } else if (key === "type") {
      let val = value.target.checked;
      let filtered = [...filterTypes];
      filtered[index].active = val;
      setFilterTypes(filtered);
    } else if (key === "brand") {
      let val = value.target.checked;
      let filtered = [...filterBrand];
      filtered[index].active = val;
      setFilterBrand(filtered);
    } else if (key === "product") {
      let val = value.target.checked;
      let filtered = [...filterproduct];
      filtered[index].active = val;
      setFilterproduct(filtered);
    } else if (key === "location") {
      let val = value.target.value;
      setLocation(val);
    } else if (key === "date_range") {
      let d = value.join(",").split(",");
      setDateArr(d);
    } else if (key === "occasion") {
      let val = value.target.checked;
      let filtered = [...filterOccasion];
      filtered[index].active = val;
      setFilterOccasion(filtered);
    }
  }

  const handleDoneClick = async (key, value) => {
    let activatedFilters = {...activeFilters};
    if (key === "availability_status") {
      props.setAvailabilityStatus(availability_status);
      if (availability_status === 2) {
        props.setDateRange(values);
        setDateRange(values)
        if (values[0] && values[1]) {
          setStartDate(moment(new Date(values[0])).format("D MMM"))
          setEndDate(moment(new Date(values[1])).format("D MMM"))
        }
      } else {
        setStartDate("");
        setEndDate("");
        setValues([]);
      }
      props.setActivePage(1);
    } else if (key === "price") {
      let filtered = filterPrice.filter((item) => item.active === true);
      props.setPriceArr(filtered);
      let activeFilter = { ...activeFilters };
      activeFilter.price = filtered;
      setActvieFilter({ ...activeFilter });
      activatedFilters = { ...activeFilter };
      props.setActivePage(1);
    } else if (key === "size") {
      let filtered = filterSize.map((item) => item.active && item.size).filter((item) => (item !== false && item !== true));
      let filteredBottom = filterBottoms.map((item) => item.active && item.bottom).filter((item) => item != false);
      if (filtered.length >= 0 || filteredBottom.length >= 0) {
        let filteredArr = [];
        await filterSize.map((item) => {
          filteredArr.push(item.size);
        });

        let filteredB = [];
        await filterBottoms.map((item) => {
          filteredB.push(item.bottom);
        });

        let d = [...props.meta_type];
        d = d.filter(it => it !== "size" && it !== "bottom");
        filtered.length > 0 && d.push("size");
        filteredBottom.length > 0 && d.push("size");

        props.setMetaTypeArr(d);

        let val = [...props.meta_value];
        val = val.filter(it => !filteredArr.includes(it));
        val = val.filter(it => !filteredB.includes(it));

        filtered.length > 0 && await filtered.map((item) => val.push(item));
        filteredBottom.length > 0 && await filteredBottom.map((item) => val.push(item));
        props.setMetaValueArr(val);
        props.setActivePage(1);
        if (filtered.length === 0 && filteredBottom.length === 0) {
          handleClearClick("size")
        }
        let activeFilter = { ...activeFilters };
        activeFilter.size = [...filtered, ...filteredBottom];
        setActvieFilter({ ...activeFilter });
        activatedFilters = { ...activeFilter };
      }
    } else if (key === "color") {
      let filtered = filterColor.map((item) => item.active && item.color).filter((item) => (item !== false && item !== true));
      if (filtered.length >= 0) {

        let d = [...props.meta_type];
        d = d.filter(it => it !== "color");
        filtered.length > 0 && d.push("color");

        props.setMetaTypeArr(d);
        let colorArr = [];
        await filterColor.map((item) => {
          colorArr.push(item.color);
        });
        let val = [...props.meta_value];
        val = val.filter(it => !colorArr.includes(it));
        filtered.length > 0 && await filtered.map((item) => val.push(item));
        // val = val.filter(it => filtered.includes(it));
        props.setMetaValueArr(val);
        props.setActivePage(1);

        let activeFilter = { ...activeFilters };
        activeFilter.color = [...filtered];
        setActvieFilter({ ...activeFilter });
        activatedFilters = { ...activeFilter };

        if (filtered.length === 0) {
          handleClearClick("color")
        }
      }
    } else if (key === "type") {
      let filtered = filterTypes.map((item) => item.active && item.type).filter((item) => (item !== false && item !== true));
      if (filtered.length >= 0) {
        let typeArr = [];
        await filterTypes.map((item) => {
          typeArr.push(item.type);
        });

        let d = [...props.meta_type];
        d = d.filter(it => it !== "type");
        filtered.length > 0 && d.push("type");

        props.setMetaTypeArr(d);

        let val = [...props.meta_value];
        val = val.filter(it => !typeArr.includes(it));
        filtered.length > 0 && await filtered.map((item) => val.push(item));
        props.setMetaValueArr(val);
        props.setActivePage(1);

        if (filtered.length === 0) {
          handleClearClick("type")
        }
      }
    } else if (key === "brand") {
      let filtered = filterBrand.map((item) => item.active && item.name).filter((item) => (item !== false && item !== true));
      if (filtered.length >= 0) {
        let brandArr = [];
        await filterBrand.map((item) => {
          brandArr.push(item.name);
        });

        let d = [...props.meta_type];
        d = d.filter(it => it !== "brand");
        filtered.length > 0 && d.push("brand");

        props.setMetaTypeArr(d);

        let val = [...props.meta_value];
        val = val.filter(it => !brandArr.includes(it));
        filtered.length > 0 && await filtered.map((item) => val.push(item));
        props.setMetaValueArr(val);
        props.setActivePage(1);

        let activeFilter = { ...activeFilters };
        activeFilter.brand = [...filtered];
        setActvieFilter({ ...activeFilter });
        activatedFilters = { ...activeFilter };

        if (filtered.length === 0) {
          handleClearClick("brand")
        }
      }
    } else if (key === "product") {
      let filtered = filterproduct.map((item) => item.active && item.id).filter((item) => (item !== false && item !== true));
      let filteredName = filterproduct.map((item) => item.active && item).filter((item) => (item !== false && item !== true));
      if (filtered.length >= 0) {
        let productArr = [];
        await filterproduct.map((item) => {
          productArr.push(item.name);
        });

        let d = [];
        filtered.length > 0 && await filtered.map((item) => d.push(item));
        props.setproduct(d);
        props.setActivePage(1);

        let activeFilter = { ...activeFilters };
        activeFilter.product = [...filteredName];
        setActvieFilter({ ...activeFilter });
        activatedFilters = { ...activeFilter };

        if (filtered.length === 0) {
          handleClearClick("product");
        }
      }
    } else if (key === "location") {
      props.setLocation(value);
      props.setActivePage(1);
    } else if (key === "occasion") {
      let filtered = filterOccasion.map((item) => item.active && item.name).filter((item) => (item !== false && item !== true));
      let filteredName = filterOccasion.map((item) => item.active && item).filter((item) => (item !== false && item !== true));
      if (filtered.length >= 0) {
        let occasionArr = [];
        await filterOccasion.map((item) => {
          occasionArr.push(item.name);
        });
  
        let d = [];
        filtered.length > 0 && await filtered.map((item) => d.push(item));
        props.setOccasion([...d]);
        props.setActivePage(1);
  
        let activeFilter = { ...activeFilters };
        activeFilter.occasion = [...filteredName];
        setActvieFilter({ ...activeFilter });
        activatedFilters = { ...activeFilter };
  
        if (filtered.length === 0) {
          handleClearClick("occasion");
        }
      }
    } 
   

    let tempObj = {
      availability_status: availability_status,
      filterPrice: [...filterPrice],
      filterSize: [...filterSize],
      filterBottoms: [...filterBottoms],
      filterColor: [...filterColor],
      filterTypes: [...filterTypes],
      filterBrand: [...filterBrand],
      filterproduct: [...filterproduct],
      filterOccasion: [...filterOccasion],
      date_range: [...date_range],
      activeFilters: { ...activatedFilters }
    };
    props.setAddedFilters({ ...tempObj });
    setShow(false);
  }

  const handleClearClick = (key) => {
    if (key === "availability_status") {
      setAvailabilityStatus(0);
      props.setAvailabilityStatus(0);
      props.setDateRange([]);
      setDateArr([]);
      setValues([]);
      setStartDate("");
      setEndDate("");
      setDateRangeErr(false);
    } else if (key === "price") {
      let priceArr = [];
      let filtered = filterPrice.map(item => {
        item.active = false;
        priceArr.push(item);
      })
      setFilterPrice(priceArr);
      props.setPriceArr([]);
      let activeFilter = { ...activeFilters };
      activeFilter.price = [];
      setActvieFilter({ ...activeFilter });
    } else if (key === "size") {
      let sizeA = [];
      let bottomA = [];
      let filtered = filterSize.map((item) => {
        if (item.active) {
          item.active = false
        } else {
          item.active = false
        }
        sizeA.push(item.size);
        return item;
      });
      setFilterSize(filtered);
      let filteredB = filterBottoms.map((item) => {
        if (item.active) {
          item.active = false
        } else {
          item.active = false
        }
        bottomA.push(item.bottom);
        return item;
      });

      setFilterBottoms(filteredB);
      let val = [...props.meta_value];
      let type = [...props.meta_type];
      type = type.filter(it => (it != "size" && it != "bottom"));

      val = val.filter(it => !sizeA.includes(it));
      val = val.filter(it => !bottomA.includes(it));

      props.setMetaValueArr(val);
      props.setMetaTypeArr(type);

      let activeFilter = { ...activeFilters };
      activeFilter.size = [];
      setActvieFilter({ ...activeFilter });

    } else if (key === "color") {
      let colorA = [];

      let filtered = filterColor.map((item) => {
        if (item.active) {
          item.active = false
        } else {
          item.active = false
        }
        colorA.push(item.color);
        return item;
      });
      setFilterColor(filtered);

      let val = [...props.meta_value];
      let type = [...props.meta_type];
      type = type.filter(it => (it != "color"));

      val = val.filter(it => !colorA.includes(it));

      props.setMetaValueArr(val);
      props.setMetaTypeArr(type);

      let activeFilter = { ...activeFilters };
      activeFilter.color = [];
      setActvieFilter({ ...activeFilter });

    } else if (key === "type") {
      let colorA = [];

      let filtered = filterTypes.map((item) => {
        if (item.active) {
          item.active = false
        } else {
          item.active = false
        }
        colorA.push(item.color);
        return item;
      });
      setFilterTypes(filtered);

      let val = [...props.meta_value];
      let type = [...props.meta_type];
      type = type.filter(it => (it != "type"));

      val = val.filter(it => !colorA.includes(it));

      props.setMetaValueArr(val);
      props.setMetaTypeArr(type);

    } else if (key === "brand") {
      let colorA = [];

      let filtered = filterBrand.map((item) => {
        if (item.active) {
          item.active = false
        } else {
          item.active = false
        }
        colorA.push(item.name);
        return item;
      });
      setFilterBrand(filtered);

      let val = [...props.meta_value];
      let type = [...props.meta_type];
      type = type.filter(it => (it !== "brand"));

      val = val.filter(it => !colorA.includes(it));

      props.setMetaValueArr(val);
      props.setMetaTypeArr(type);

      let activeFilter = { ...activeFilters };
      activeFilter.brand = [];
      setActvieFilter({ ...activeFilter });

    } else if (key === "product") {
      let colorA = [];

      let filtered = filterproduct.map((item) => {
        if (item.active) {
          item.active = false
        } else {
          item.active = false
        }
        colorA.push(item.id);
        return item;
      });
      setFilterproduct(filtered);
      let val = [...props.product];
      val = val.filter(it => !colorA.includes(it));
      props.setproduct(val);

      let activeFilter = { ...activeFilters };
      activeFilter.product = [];
      setActvieFilter({ ...activeFilter });

    } else if (key === "location") {
      setLocation("");
      props.setLocation("");
    } else if (key === "occasion") {
      let colorA = [];
      let filtered = filterOccasion.map((item) => {
        if (item.active) {
          item.active = false
        } else {
          item.active = false
        }
        colorA.push(item.name);
        return item;
      });
      setFilterOccasion(filtered);
      let val = [...props.occasion];
      val = val.filter(it => !colorA.includes(it));
      props.setOccasion([...val]);

      let activeFilter = { ...activeFilters };
      activeFilter.occasion = [];
      setActvieFilter({ ...activeFilter });

    }  
    setShow(false);
  }

  const handleClearActiveFilters = async (key, val) => {
    let activatedFilters = {...activeFilters};
    if (key === "size") {
      let filtered = filterSize.map((item) => item.active && item.size).filter((item) => (item !== false && item !== true));
      let filteredBottom = filterBottoms.map((item) => item.active && item.bottom).filter((item) => item != false);
      filtered = filtered.filter(value => value != val);
      filteredBottom = filteredBottom.filter(value => value != val);

      let filterSizes = [...filterSize];
      await filterSizes.map((value, i) => {
        if (filtered.includes(value.size)) {
          filterSizes[i].active = true;
        } else {
          filterSizes[i].active = false;
        }
      })

      let filterBottomA = [...filterBottoms];
      await filterBottomA.map((value, i) => {
        if (filteredBottom.includes(value.bottom)) {
          filterBottomA[i].active = true;
        } else {
          filterBottomA[i].active = false;
        }
      })
      setFilterBottoms([...filterBottomA]);
      setFilterSize([...filterSizes]);

      if (filtered.length >= 0 || filteredBottom.length >= 0) {
        let filteredArr = [];
        await filterSize.map((item) => {
          filteredArr.push(item.size);
        });

        let filteredB = [];
        await filterBottoms.map((item) => {
          filteredB.push(item.bottom);
        });

        let d = [...props.meta_type];
        d = d.filter(it => it !== "size" && it !== "bottom");
        filtered.length > 0 && d.push("size");
        filteredBottom.length > 0 && d.push("bottom");

        props.setMetaTypeArr(d);

        let val = [...props.meta_value];
        val = val.filter(it => !filteredArr.includes(it));
        val = val.filter(it => !filteredB.includes(it));

        filtered.length > 0 && await filtered.map((item) => val.push(item));
        filteredBottom.length > 0 && await filteredBottom.map((item) => val.push(item));
        props.setMetaValueArr(val);
        props.setActivePage(1);

        let activeFilter = { ...activeFilters };

        if (filtered.length === 0 && filteredBottom.length === 0) {
          handleClearClick("size");
          activeFilter.size = [];
        } else {
          activeFilter.size = [...filtered, ...filteredBottom];
        }
        setActvieFilter({ ...activeFilter });
        activatedFilters = { ...activeFilter };
      }
    } else if (key === "color") {
      let filtered = filterColor.map((item) => item.active && item.color).filter((item) => (item !== false && item !== true));
      filtered = filtered.filter(value => value != val);

      let filterColors = [...filterColor];
      await filterColors.map((value, i) => {
        if (filtered.includes(value.color)) {
          filterColors[i].active = true;
        } else {
          filterColors[i].active = false;
        }
      })
      setFilterColor([...filterColors]);

      if (filtered.length >= 0) {

        let d = [...props.meta_type];
        d = d.filter(it => it !== "color");
        filtered.length > 0 && d.push("color");

        props.setMetaTypeArr(d);
        let colorArr = [];
        await filterColor.map((item) => {
          colorArr.push(item.color);
        });
        let val = [...props.meta_value];
        val = val.filter(it => !colorArr.includes(it));
        filtered.length > 0 && await filtered.map((item) => val.push(item));
        // val = val.filter(it => filtered.includes(it));
        props.setMetaValueArr(val);
        props.setActivePage(1);

        let activeFilter = { ...activeFilters };

        if (filtered.length === 0) {
          handleClearClick("color");
          activeFilter.color = [];
        } else {
          activeFilter.color = [...filtered];
        }
        setActvieFilter({ ...activeFilter });
        activatedFilters = { ...activeFilter };
      }
    } else if (key === "brand") {
      let filtered = filterBrand.map((item) => item.active && item.name).filter((item) => (item !== false && item !== true));
      filtered = filtered.filter(value => value != val);

      let filterBrands = [...filterBrand];
      await filterBrands.map((value, i) => {
        if (filtered.includes(value.name)) {
          filterBrands[i].active = true;
        } else {
          filterBrands[i].active = false;
        }
      })
      setFilterBrand([...filterBrands]);

      if (filtered.length >= 0) {
        let brandArr = [];
        await filterBrand.map((item) => {
          brandArr.push(item.name);
        });

        let d = [...props.meta_type];
        d = d.filter(it => it !== "brand");
        filtered.length > 0 && d.push("brand");

        props.setMetaTypeArr(d);

        let val = [...props.meta_value];
        val = val.filter(it => !brandArr.includes(it));
        filtered.length > 0 && await filtered.map((item) => val.push(item));
        props.setMetaValueArr(val);
        props.setActivePage(1);

        let activeFilter = { ...activeFilters };

        if (filtered.length === 0) {
          handleClearClick("brand");
          activeFilter.brand = [];
        } else {
          activeFilter.brand = [...filtered];
        }
        setActvieFilter({ ...activeFilter });
        activatedFilters = { ...activeFilter };
      }
    } else if (key === "product") {
      let filtered = filterproduct.map((item) => item.active && item.id).filter((item) => (item !== false && item !== true));
      let filteredName = filterproduct.map((item) => item.active && item).filter((item) => (item !== false && item !== true));

      filteredName = filteredName.filter(value => value.id != val);
      filtered = filtered.filter(valId => valId != val);

      let filterproducts = [...filterproduct];
      let idArray = [];
      await filteredName.map(vals => {
        idArray.push(vals.id)
      })
      await filterproducts.map((value, i) => {
        if (idArray.includes(value.id)) {
          filterproducts[i].active = true;
        } else {
          filterproducts[i].active = false;
        }
      })
      setFilterproduct([...filterproducts]);

      if (filtered.length >= 0) {
        let productArr = [];
        await filterproduct.map((item) => {
          productArr.push(item.name);
        });

        // let d = [...props.product];
        let d = [];
        filtered.length > 0 && await filtered.map((item) => d.push(item));
        props.setproduct(d);
        props.setActivePage(1);

        let activeFilter = { ...activeFilters };

        if (filtered.length === 0) {
          handleClearClick("product");
          activeFilter.product = [];
        } else {
          activeFilter.product = [...filteredName];
        }
        setActvieFilter({ ...activeFilter });
        activatedFilters = { ...activeFilter };
      }
    } else if (key === "price") {
      let filtered = filterPrice.filter((item) => item.active === true);
      filtered = filtered.filter(value => value.fromPrice != val.fromPrice);

      let filterPrices = [...filterPrice];
      filterPrices.map(value => {
        if (value.fromPrice == val.fromPrice) {
          value.active = false;
        }
      });

      setFilterPrice([...filterPrices]);

      props.setPriceArr(filtered);
      let activeFilter = { ...activeFilters };
      activeFilter.price = filtered;

      setActvieFilter({ ...activeFilter });
      activatedFilters = { ...activeFilter };
      props.setActivePage(1);
    } else if (key === "category") {
      props.categoryFilter(val.name, val.type)
    } else if (key === "occasion") {
      let filtered = filterOccasion.map((item) => item.active && item.name).filter((item) => (item !== false && item !== true));
      let filteredName = filterOccasion.map((item) => item.active && item).filter((item) => (item !== false && item !== true));
      filteredName = filteredName.filter(value => value.name != val);
      filtered = filtered.filter(valId => valId != val);

      let filterOccasions = [...filterOccasion];
      let idArray = [];
      await filteredName.map(vals => {
        idArray.push(vals.name)
      })
      await filterOccasions.map((value, i) => {
        if (idArray.includes(value.name)) {
          filterOccasions[i].active = true;
        } else {
          filterOccasions[i].active = false;
        }
      })
      setFilterOccasion([...filterOccasions]);

      if (filtered.length >= 0) {
        let occasionArr = [];
        await filterOccasion.map((item) => {
          occasionArr.push(item.name);
        });

        // let d = [...props.product];
        let d = [];
        filtered.length > 0 && await filtered.map((item) => d.push(item));
        props.setOccasion([...d]);
        props.setActivePage(1);

        let activeFilter = { ...activeFilters };

        if (filtered.length === 0) {
          handleClearClick("occasion");
          activeFilter.occasion = [];
        } else {
          activeFilter.occasion = [...filteredName];
        }
        setActvieFilter({ ...activeFilter });
        activatedFilters = { ...activeFilter };
      }
    }


    let tempObj = {
      availability_status: availability_status,
      filterPrice: [...filterPrice],
      filterSize: [...filterSize],
      filterBottoms: [...filterBottoms],
      filterColor: [...filterColor],
      filterTypes: [...filterTypes],
      filterBrand: [...filterBrand],
      filterproduct: [...filterproduct],
      filterOccasion: [...filterOccasion],
      date_range:[...date_range],
      activeFilters: { ...activatedFilters }
    };
    props.setAddedFilters({ ...tempObj });
  }

  const handleClearAll = () => {
    window.location.reload();
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

    if (innerIn !== "" && outerIn !== "") {
      filtered[outerIn].subtype[innerIn].active = true;
    }

    if (mainIndex !== "") {
      filtered[mainIndex].active = true;
    }

    setFilterTypes(filtered);

    if (val) {

      let d = [...props.meta_type];
      d = d.filter(it => it !== "type");

      let dval = [...props.meta_value];
      dval = dval.filter(it => !typeArr.includes(it));

      let cVal = [];

      if (!alreadyFiltered && type === "innerFilter") {
        dval.push(val);
        d.push("type");
      }

      if (!mainAlreadyFiltered && type === "mainCategory") {
        cVal.push(val);
      }

      props.setMetaTypeArr(d);
      props.setMetaValueArr(dval);
      props.setMainCategoryFilter(cVal);
      props.setActivePage(1);
      let tempObj = {
        availability_status: availability_status,
        filterPrice: [...filterPrice],
        filterSize: [...filterSize],
        filterBottoms: [...filterBottoms],
        filterColor: [...filterColor],
        filterTypes: [...filterTypes],
        filterBrand: [...filterBrand],
        filterproduct: [...filterproduct],
        filterOccasion: [...filterOccasion],
        date_range:[...date_range],
        activeFilters: { ...activeFilters }
      };

      props.setAddedFilters({ ...tempObj });
    }
  }

  const renderFilterBody = () => {

    if (filterType == "availability") {
      return (
        <div className="row pb-3">
          <div className="col-12">
            <h3 className="font-20 text-black-3 font-InterRegular text-uppercase mt-2">Availability</h3>

            <FormControl>
              <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                value={availability_status}
                name="radio-buttons-group"
                className="cus-radio"
              >
                <FormControlLabel value={0} control={<Radio />} label="All items" onChange={(e) => {
                  handleChange("availability_status", e);
                }} />
                <p className="font-16 text-light-gray font-InterExtraLight -mt-10 ms-4 ps-2 mb-0">Browse everything - including unavailable items</p>
                <FormControlLabel value={1} control={<Radio />} label="Items Available Now" onChange={(e) => {
                  handleChange("availability_status", e);
                }} />
                <p className="font-16 text-light-gray font-InterExtraLight -mt-10 ms-4 ps-2 mb-0">Rent any item that’s available</p>
                <FormControlLabel value={2} control={<Radio />} label="Items For Specific Dates"
                  onClick={(e) => {
                    handleChange("availability_status", e);
                    setShowModal(true);
                    setModalType("calendar");
                    setTimeout(() => {
                      calendarRef && calendarRef.current && calendarRef.current.openCalendar();
                    }, 100);
                  }} />
                <p className="font-16 text-light-gray font-InterExtraLight -mt-10 ms-4 ps-2 mb-0">Reserve rentals in advance</p>                
              </RadioGroup>
            </FormControl>
          </div>

          {(startDate && endDate) ? <>
            <div className="col-2 date-display-left text-center py-1 mt-3 ">
              <div className="" onClick={() => {
                handleChange("availability_status", 2);
                setShowModal(true);
                setModalType("calendar");
                setTimeout(() => {
                  calendarRef && calendarRef.current && calendarRef.current.openCalendar();
                }, 100);
              }}><span className="font-16 text-black-3 font-InterExtraLight">{startDate}</span>
              </div>
            </div>
            <div className="col-auto mt-3">-</div>
            <div className="col-2 date-display-right text-center py-1 mt-3 ml-2">
              <div class="" onClick={() => {
                handleChange("availability_status", 2);
                setShowModal(true);
                setModalType("calendar");
                setTimeout(() => {
                  calendarRef && calendarRef.current && calendarRef.current.openCalendar();
                }, 100);
              }}><span className="font-16 text-black-3 font-InterExtraLight">{endDate}</span>
              </div>
            </div>
          </> : ""
          }
          <div className="col-12 mt-4 pt-2">
            <div className="row align-items-center m-0">
              <button className="btn cus-auth-btn py-2 col-md-4 col-xl-3" onClick={() => handleDoneClick("availability_status")}>DONE</button>
              <a className="font-20 text-black-3 cursor-pointer text-uppercase font-InterRegular col ms-2 col-md-1" onClick={() => handleClearClick("availability_status")}>Clear</a>
            </div>
          </div>
        </div>
      );
    } else if (filterType == "price") {
      return (
        <>
          <div className="row">
            <div className="col-12">
              <h3 className="font-20 text-black-3 font-InterRegular text-uppercase mt-2">Price</h3>
            </div>

            <div className="col-12 mt-3">
              <div className="row">
                {filterPrice?.map((item, index) => (
                  <div className="col-auto mt-3" key={index}>
                    <div className={clsx(`size-box cursor-pointer text-center py-1 ${item.active ? "active" : ""}`)} onClick={() => {
                      handleChange("price", !item.active, index)
                    }}>
                      <span className="font-16 text-black-3 font-InterExtraLight">{item.fromPrice === "100" ? "$100+" : "$" + item.fromPrice + (item.toPrice ? " - $" + item.toPrice : "")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12 mt-4 pb-3">
              <div className="row align-items-center m-0">
                <button className="btn cus-auth-btn py-2 col-md-4 col-xl-3" onClick={() => handleDoneClick("price")}>DONE</button>
                <a className="font-20 text-black-3 cursor-pointer text-uppercase font-InterRegular col ms-2 col-md-1" onClick={() => handleClearClick("price")}>Clear</a>
              </div>
            </div>
          </div>
        </>
      );
    } else if (filterType == "size") {
      return (
        <div className="row pb-3">
          <div className="col-12">
            <h3 className="font-20 text-black-3 font-InterRegular text-uppercase mt-2">Size</h3>
          </div>

          <div className="col-12">
            <div className="row">
              {filterSize?.map((item, index) => (
                <div className="col-auto mt-3" key={index}>
                  <div className={clsx(`size-box cursor-pointer text-center py-1 ${item.active ? "active" : ""}`)} onClick={() => {
                    handleChange("size", !item.active, index)
                  }}>
                    <span className="font-16 text-black-3 font-InterExtraLight">{item.size}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-12 mt-4">
            <h3 className="font-20 text-black-3 font-InterRegular text-uppercase">Bottoms</h3>
          </div>

          <div className="col-12">
            <div className="row">
              {filterBottoms?.map((item, index) => (
                <div className="col-auto mt-3" key={index}>
                  <div className={clsx(`size-box cursor-pointer text-center py-1 ${item.active ? "active" : ""}`)} onClick={() => {
                    handleChange("bottom", !item.active, index)
                  }}>
                    <span className="font-16 text-black-3 font-InterExtraLight">{item.bottom}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-12 mt-5">
            <div className="row align-items-center m-0">
              <button className="btn cus-auth-btn py-2 col-md-4 col-xl-3" onClick={() => handleDoneClick("size")}>DONE</button>
              <a className="font-20 text-black-3 cursor-pointer text-uppercase font-InterRegular col ms-2 col-md-1" onClick={() => handleClearClick("size")}>Clear</a>
            </div>
          </div>
        </div>
      );
    } else if (filterType == "color") {
      return (
        <>
          <div className="row pb-3">
            <div className="col-12">
              <h3 className="font-20 text-black-3 font-InterRegular text-uppercase mt-2">Color</h3>
            </div>

            <div className="col-12">
              <div className="row">
                {filterColor?.map((item, index) => (
                  <div className="col-auto mt-3" key={index}>
                    <div className={clsx(`size-box cursor-pointer text-center py-3 rounded-0 ${item.color.toLowerCase()} 
                    ${item.active ? (item.color.toLowerCase() === "black") ? "border-cream border-3" : "border-black border-3" : ""}`
                    )} onClick={() => {
                      handleChange("color", !item.active, index)
                    }}>
                      <span className="font-16 text-black-3 font-InterRegular"></span>
                    </div>
                    <span className="font-16 text-black-3 font-InterRegular">{item.color}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-12 mt-5">
              <div className="row align-items-center m-0">
                <button className="btn cus-auth-btn py-2 col-md-4 col-xl-3" onClick={() => handleDoneClick("color")}>DONE</button>
                <a className="font-20 text-black-3 cursor-pointer text-uppercase font-InterRegular col ms-2 col-md-1" onClick={() => handleClearClick("color")}>Clear</a>
              </div>
            </div>
          </div>
        </>
      );
    } else if (filterType == "type") {
      return (
        <>
          <div className="row">
            <div className="col-12">
              <h3 className="font-20 text-black-3 font-InterRegular text-uppercase mt-2">Type</h3>

              <form onClick={(e) => e.preventDefault()} className="mt-3">
                <div className="row px-md-3">
                  {filterTypes?.map((item, index) => (
                    <div className="col-12 col-md-6 col-lg-3" key={index}>
                      <FormGroup className="cus-checkbox">
                        <FormControlLabel control={<Checkbox />} label={item.type} checked={filterTypes[index].active} onChange={(e) => {
                          handleChange("type", e, index);
                        }} />
                      </FormGroup>
                    </div>
                  ))}
                </div>
              </form>
            </div>
          </div>

          <div className="row">
            <div className="col-12 mt-4">
              <div className="row align-items-center m-0">
                <button className="btn btn-dark rounded-0 py-2 col-md-4 col-xl-3" onClick={() => handleDoneClick("type")}>DONE</button>
                <a className="font-18 fw-bold text-black-2 cursor-pointer font-InterExtraLight col ms-2 col-md-1" onClick={() => handleClearClick("type")}>Clear</a>
              </div>
            </div>
          </div>
        </>
      );
    } else if (filterType == "product") {
      return (
        <>
          <div className="row">
            <div className="col-12">
              <h3 className="font-20 text-black-3 font-InterRegular text-uppercase mt-2">product</h3>
              {/* onClick={(e) => e.preventDefault()} */}
              <form className="mt-3">
                <div className="row px-md-3 max-h-300px overflow-auto cus-scroll">
                  {filterproduct?.map((item, index) => (
                    <div className="col-12 col-md-6 col-lg-4" key={index}>
                      <FormGroup className="cus-checkbox">
                        <FormControlLabel control={<Checkbox />} label={item.name} checked={filterproduct[index].active} onChange={(e) => {
                          handleChange("product", e, index);
                        }} />
                      </FormGroup>
                    </div>
                  ))}
                </div>
              </form>
            </div>
          </div>

          <div className="row">
            <div className="col-12 mt-4 pb-3">
              <div className="row align-items-center m-0">
                <button className="btn cus-auth-btn py-2 col-md-4 col-xl-3" onClick={() => handleDoneClick("product")}>DONE</button>
                <a className="font-20 text-black-3 cursor-pointer text-uppercase font-InterRegular col ms-2 col-md-1" onClick={() => handleClearClick("product")}>Clear</a>
              </div>
            </div>
          </div>
        </>
      );
    } else if (filterType == "brand") {
      return (
        <>
          <div className="row pb-3">
            <div className="col-12">
              <h3 className="font-20 text-black-3 font-InterRegular text-uppercase mt-2">Brand</h3>
              {/* onClick={(e) => e.preventDefault()} */}
              <form className="mt-3">
                <div className="row px-md-3 max-h-300px overflow-auto cus-scroll">
                  {filterBrand?.map((item, index) => (
                    <div className="col-12 col-md-6 col-lg-4" key={index}>
                      <FormGroup className="cus-checkbox">
                        <FormControlLabel control={<Checkbox />} label={item.name} checked={filterBrand[index].active} onChange={(e) => {
                          handleChange("brand", e, index);
                        }} />
                      </FormGroup>
                    </div>
                  ))}
                </div>
              </form>
            </div>
          </div>

          <div className="row">
            <div className="col-12 mt-4 pb-3">
              <div className="row align-items-center m-0">
                <button className="btn cus-auth-btn py-2 col-md-4 col-xl-3" onClick={() => handleDoneClick("brand")}>DONE</button>
                <a className="font-20 text-black-3 cursor-pointer text-uppercase font-InterRegular col ms-2 col-md-1" onClick={() => handleClearClick("brand")}>Clear</a>
              </div>
            </div>
          </div>
        </>
      );
    } else if (filterType == "occasion") {
      return (
        <>
          <div className="row">
            <div className="col-12">
              <h3 className="font-20 text-black-3 font-InterRegular text-uppercase mt-2">Occasion</h3>
              {/* onClick={(e) => e.preventDefault()} */}
              <form className="mt-3">
                <div className="row px-md-3 max-h-300px overflow-auto cus-scroll">
                  {filterOccasion?.map((item, index) => (
                    <div className="col-12 col-md-6 col-lg-4" key={index}>
                      <FormGroup className="cus-checkbox">
                        <FormControlLabel control={<Checkbox />} label={item.name} checked={filterOccasion[index].active} onChange={(e) => {
                          handleChange("occasion", e, index);
                        }} />
                      </FormGroup>
                    </div>
                  ))}
                </div>
              </form>
            </div>
          </div>

          <div className="row">
            <div className="col-12 mt-4 pb-3">
              <div className="row align-items-center m-0">
                <button className="btn cus-auth-btn py-2 col-md-4 col-xl-3" onClick={() => handleDoneClick("occasion")}>DONE</button>
                <a className="font-20 text-black-3 cursor-pointer text-uppercase font-InterRegular col ms-2 col-md-1" onClick={() => handleClearClick("occasion")}>Clear</a>
              </div>
            </div>
          </div>
        </>
      );
    }
  }

  const renderModalBody = () => {
    return (
      <>
        {modalType == 'calendar' ?
          <div>
            <Modal.Header className="bg-light-gray border-0">
              <Button className="border-0 ms-auto bg-transparent btn btn-primary" onClick={() => setShowModal(false)}>
                <img src="/media/images/X.svg" className="w-20px" />
              </Button>
            </Modal.Header>
            <Modal.Body className="bg-light-gray pt-0">
              <div className="row align-items-center justify-content-center">
                <div className="col-12 col-md-8 text-center">
                  <h1 className="text-black font-CambonRegular font-22">When do you need your rental?</h1>
                  <h4 className="text-black font-InterExtraLight fw-500 font-16 mb-0">
                    Choose a delivery day 4 - 5 days before your event. This helps account for shipping!
                  </h4>
                </div>
                <div className="col-12 mt-4 text-center cus-calendar-input product-detail-calendar">
                  <DatePicker
                    ref={calendarRef}
                    className="cus-calendar"
                    range
                    value={values}
                    onChange={dateObjects => {
                      if(dateObjects.length < 2) {
                        setDateRangeErr(true);
                      } else {
                        setDateRangeErr(false);
                      }
                      setValues(dateObjects)
                      setAllDates(getAllDatesInRange(dateObjects))
                    }}
                    onClose={false}
                    minDate={new Date()}
                  />
                </div>
                <div className="col-12 col-md-8 mt-4 mb-3 text-center">
                  <button className="btn cus-auth-btn rounded-0 py-2 w-100" disabled={dateRangeErr} 
                  onClick={() => {
                    setShowModal(false);
                    setValues(date_arr);
                    handleDoneClick("availability_status")
                  }}>APPLY</button>
                </div>
                {dateRangeErr && <div className="text-danger text-center">
                                  Please select a date range.
                                </div>}
              </div>
            </Modal.Body>
          </div>
          :
          <div>
            <Modal.Header className="bg-light-gray border-0">
              <Button className="border-0 ms-auto bg-transparent btn btn-primary" onClick={() => setShowModal(false)}>
                <img src="/media/images/X.svg" className="w-20px" />
              </Button>
            </Modal.Header>
            <Modal.Body className="bg-light-gray pt-0">
              <div className="row align-items-center justify-content-center">
                <div className="col-12 mt-4 text-center cus-calendar-input">
                  <Formik
                    initialValues={{
                      zip_code: location.zip_code,
                      selected_mile: location.selected_mile
                    }}

                    validationSchema={validationSchema}
                    onSubmit={(values) => {
                      setLocation(values);
                      handleDoneClick("location", values);
                      setShowModal(false);
                    }}
                  >
                    {({
                      values,
                      errors,
                      touched,
                      handleSubmit,
                      handleChange,
                      handleBlur,
                      setFieldValue
                    }) => {
                      return (
                        <form onSubmit={handleSubmit}>
                          <div className="text-center mb-3">
                            <h1 className="text-brown font-CambonRegular font-35 text-uppercase">
                              Local Pick Up
                            </h1>
                          </div>
                          <div className="mb-2">
                            <CmtInputBox
                              name={"zip_code"}
                              values={values.zip_code}
                              handleChange={handleChange}
                              handleBlur={handleBlur}
                              type={"string"}
                              placeholder="Enter Zip code"
                            />
                            <div className="text-danger">
                              {touched.zip_code && errors.zip_code}
                            </div>
                          </div>
                          <div className="mb-2">
                            <select className="form-select shadow-none border-select-modal rounded-0 bg-light-gray py-2 font-18 text-black-3 font-InterLight" aria-label="Default select example" name="selected_mile" value={values.selected_mile} onChange={(e) => {
                              setFieldValue("selected_mile", e.target.value);
                            }}>
                              <option value="">Select radius</option>
                              <option value="5">5 miles</option>
                              <option value="10">10 miles</option>
                              <option value="15">15 miles</option>
                            </select>
                            <div className="text-danger">
                              {touched.selected_mile && errors.selected_mile}
                            </div>
                          </div>
                          <div className="mt-4 mb-3 text-center">
                            <button type="submit" className="btn cus-modal-btn">APPLY</button>
                          </div>
                        </form>
                      );
                    }}
                  </Formik>
                </div>
              </div>
            </Modal.Body>
          </div>
        }
      </>
    );
  };

  return (
    <Fragment>
      <div className="row justify-content-center">
        <div className="col-12">
          <h1 className="text-brown font-CambonRegular font-35 text-uppercase mb-0">
            {props.title}
          </h1>
        </div>

        <div className="col-12 mt-2 d-lg-none">
          <FilterProductMobile
            filterItems={filterItemsMobile}
            filterSize={filterSize}
            filterBottoms={filterBottoms}
            filterPrice={filterPrice}
            filterColor={filterColor}
            filterTypes={filterTypes}
            filterproduct={filterproduct}
            filterBrand={filterBrand}
            filterOccasion={filterOccasion}
            setShowModal={setShowModal}
            setModalType={setModalType}
            calendarRef={calendarRef}
            sidebarRef={ref}
            availability_status={availability_status}
            date_range={date_range}
            handleChange={handleChange}
            handleClearAll={handleClearAll}
            handleClearClick={handleClearClick}
            handleDoneClick={handleDoneClick}
            location={location}
            sortBy={sortBy}
            showClear={showClear}
            categoryFilter={categoryFilter}
          />
        </div>

        <div className="col-12 mt-2 d-none d-lg-block">
          <div className={clsx("d-flex flex-wrap pb-2", !show && "border-light-black")}>
            {filterItems?.map((item, index) => (
              <div className="me-2 me-xl-4" key={index}>
                <a className="font-16 text-black-3 text-decoration-none text-uppercase cursor-pointer font-InterRegular" onClick={() => {
                  setShow(true)
                  setFilterType(item.filterType)
                }}>{item.name} <ExpandMore className="mb-1" /> </a>
              </div>
            ))}

            {showClear && <div className="me-2 me-xl-4">
              <a className="font-16 text-brown text-decoration-none cursor-pointer font-InterRegular" onClick={() => handleClearAll()}>Clear All</a>
            </div>}
          </div>
        </div>

        <div className="col-12 mt-4 d-none d-lg-flex flex-wrap">
          <div className="d-flex align-items-center cursor-pointer"
            onClick={() => {
              setShowModal(true);
              setModalType("");
            }
            }>
            <img src="/media/images/location-logo.svg" className="w-20px ms-2 cus-tooltop-btn" />
            <a className="font-16 text-black-3 text-decoration-none cursor-pointer font-InterLight mx-2">Local Pick Up</a>
          </div>

          {!location.zip_code ?
            <p className="text-black-3 font-InterExtraLight font-16 mb-0 position-relative cursor-pointer">
              <img src="/media/images/info_tooltip_icon.svg" className="w-20px ms-2 cus-tooltop-btn" />
              <span className="cus-tooltop product">Want to pick up your rental? It's free and more sustainable. Enter your zip code to see the products product to you!</span>
            </p>
            :
            <p className="text-brown font-InterExtraLight font-16 mb-0 mt-1">
              {location.zip_code} ({location.selected_mile} miles)
              <Close
                className="font-16 cursor-pointer ms-2"
                onClick={() => {
                  setLocation({ zip_code: "", selected_mile: "" })
                  props.setLocation({ zip_code: "", selected_mile: "" });
                }}
              />
            </p>
          }
          <div className="ms-lg-auto">
            <div className="dropdown sortby">
              <a className="font-16 text-black-3 text-decoration-none cursor-pointer font-InterLight dropdown-toggle"
                id="sotyBy" data-bs-toggle="dropdown" aria-expanded="false">Sort By:  <span>{sortBy == 0 ? " Best Sellers" : sortBy == 1 ? " Price: Low to High" : sortBy == 2 ? " Price: High to Low" : sortBy == 3 && " Recently added"}</span><ExpandMore className="mb-1" /> </a>
              <ul className="dropdown-menu py-0" aria-labelledby="sotyBy">
                <li><a className="dropdown-item text-black font-InterLight" onClick={() => {
                  handleChange('sortBy', 0);
                }}>Best Sellers <img src="/media/images/check.png" className={clsx("img-fluid sortby-check", sortBy != 0 && "d-none")} /></a></li>
                <li><a className="dropdown-item text-black font-InterLight" onClick={() => {
                  handleChange('sortBy', 1);
                }}>Price: Low to High <img src="/media/images/check.png" className={clsx("img-fluid sortby-check", sortBy != 1 && "d-none")} /></a></li>
                <li><a className="dropdown-item text-black font-InterLight" onClick={() => {
                  handleChange('sortBy', 2);
                }}>Price: High to Low <img src="/media/images/check.png" className={clsx("img-fluid sortby-check", sortBy != 2 && "d-none")} /></a></li>
                <li><a className="dropdown-item text-black font-InterLight border-0" onClick={() => {
                  handleChange('sortBy', 3);
                }}>Recently added <img src="/media/images/check.png" className={clsx("img-fluid sortby-check", sortBy != 3 && "d-none")} /></a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-12 position-relative m-0" ref={showRef}>
          {show &&
            <div className="filter-style d-none d-md-flex" >
              {renderFilterBody()}
            </div>
          }
        </div>

        <div className="d-flex align-items-center flex-wrap">
          {
            Object.entries(activeFilters).map(([key, value], i) => (
              key == "brand" || key == "color" || key == "size" ? activeFilters[key].length > 0 && activeFilters[key].map(val => (
                <p onClick={() => {
                  handleClearActiveFilters(key, val)
                }} className="px-3 mt-2 border border-secondary mx-1 rounded-pill mb-1 cursor-pointer activeFilter-style">
                  {val} <Close className="font-12 ms-2 mb-1" />
                </p>
              )) : key == "product" ? activeFilters[key].length > 0 && activeFilters[key].map(val => (
                <p onClick={() => {
                  handleClearActiveFilters(key, val.id)
                }} className="px-3 mt-2 border border-secondary mx-1 rounded-pill mb-1 cursor-pointer activeFilter-style">
                  {val.name} <Close className="font-12 ms-2 mb-1" />
                </p>
              )) : key == "price" ? activeFilters[key].length > 0 && activeFilters[key].map(val => (
                <p onClick={() => {
                  handleClearActiveFilters(key, val)
                }} className="px-3 mt-2 border border-secondary mx-1 rounded-pill mb-1 cursor-pointer activeFilter-style">
                  {val.fromPrice == "100" ? `$${val.fromPrice}+` : `$${val.fromPrice} - $${val.toPrice}`} <Close className="font-12 ms-2 mb-1" />
                </p>
              )) : key == "category" ? (activeFilters[key]?.name && <p onClick={() => {
                handleClearActiveFilters(key, activeFilters[key])
              }} className="px-3 mt-2 border border-secondary mx-1 rounded-pill mb-1 cursor-pointer activeFilter-style">
                {activeFilters[key].name} <Close className="font-12 ms-2 mb-1" />
              </p>) : key == "occasion" ? activeFilters[key].length > 0 && activeFilters[key].map(val => (
                <p onClick={() => {
                  handleClearActiveFilters(key, val.name)
                }} className="px-3 mt-2 border border-secondary mx-1 rounded-pill mb-1 cursor-pointer activeFilter-style">
                  {val.name} <Close className="font-12 ms-2 mb-1" />
                </p>
              )) : ""
            ))
          }
        </div>
      </div>

      <Modal
        size="md"
        centered="true"
        show={showModal}
        onHide={() => {
          setShowModal(false);
        }}
        style={{ opacity: 1 }}
      >
        {showModal && renderModalBody()}
      </Modal>
    </Fragment>
  );
}

export default FilterProduct;
