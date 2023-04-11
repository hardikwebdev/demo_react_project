import React, { Fragment, useState, useEffect } from "react";
import { FilterList } from "@material-ui/icons";
import { Close, ExpandMore } from "@material-ui/icons";
import { Fade } from "react-reveal";
import clsx from "clsx";
import useWindowDimensions from "./GetWindowDimensions";
import { Accordion, AccordionSummary, AccordionDetails, Typography, FormControl, RadioGroup, FormControlLabel, Radio, FormGroup, Checkbox } from "@material-ui/core";

function FilterProductMobile(props) {

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { height, width } = useWindowDimensions();

  useEffect(() => {
    if (width > 768) {
      setIsMenuOpen(false);
    }
  }, [width]);

  function toggleNav() {
    setIsMenuOpen(!isMenuOpen);
  }

  useEffect(() => {
    const checkIfClickedOutside = e => {
      if (isMenuOpen && props.sidebarRef && props.sidebarRef.current && !props.sidebarRef.current.contains(e.target)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", checkIfClickedOutside)

    return () => {
      document.removeEventListener("mousedown", checkIfClickedOutside)
    }
  }, [isMenuOpen])

  const handleDoneClick = (key) => {
    props.handleDoneClick(key);
    setIsMenuOpen(false);
  }

  const handleClearClick = (key) => {
    props.handleClearClick(key);
    setIsMenuOpen(false);
  }

  const handleChange = (e) => {
    var val = e.target.value;
    props.handleChange("sortBy", val);
    setIsMenuOpen(false);
  }



  const renderFilterBody = (item) => {

    if (item.filterType == "availability") {
      return (
        <>
          <FormControl>
            <RadioGroup
              aria-labelledby="demo-radio-buttons-group-label"
              value={props.availability_status}
              name="radio-buttons-group"
              className="cus-radio"
            >
              <FormControlLabel value={0} control={<Radio />} label="All items" onChange={(e) => {
                props.handleChange("availability_status", e);
              }} />
              <p className="font-14 text-light-gray -mt-10 ms-4 ps-2 font-InterExtraLight mb-0">Browse everything - including unavailable items</p>
              <FormControlLabel value={1} control={<Radio />} label="Items Available Now" onChange={(e) => {
                props.handleChange("availability_status", e);
              }} />
              <p className="font-14 text-light-gray -mt-10 ms-4 ps-2 font-InterExtraLight mb-0">Rent any item that’s available</p>
              <FormControlLabel value={2} control={<Radio />} label="Items For Specific Dates"
                onClick={(e) => {
                  props.handleChange("availability_status", e);
                  props.setShowModal(true);
                  props.setModalType("calendar");
                  props.calendarRef && props.calendarRef.current && props.calendarRef.current.openCalendar();
                }} />
              <p className="font-14 text-light-gray -mt-10 ms-4 ps-2 font-InterExtraLight mb-0">Reserve rentals in advance</p>
            </RadioGroup>
          </FormControl>


          <div className="row align-items-center mt-4 mx-0">
            <button className="btn cus-auth-btn py-1 col" onClick={() => handleDoneClick("availability_status")
            }>DONE</button>
            <a className="font-18 text-black-3 cursor-pointer text-uppercase font-InterMedium col ms-2" onClick={() => handleClearClick("availability_status")}>Clear</a>
          </div>
        </>
      );
    } else if (item.filterType == "price") {
      return (
        <>
          <div className="row">
            {props.filterPrice?.map((item, index) => (
              <div className="col-12" key={index}>
                <FormGroup className="cus-checkbox">
                  <FormControlLabel control={<Checkbox />} label={item.fromPrice === "100" ? "$100+" : "$" + item.fromPrice + (item.toPrice ? " - $" + item.toPrice : "")} checked={props.filterPrice[index].active} onChange={(e) => {
                    props.handleChange("price", !item.active, index);
                  }} />
                </FormGroup>
              </div>
            ))}
          </div>

          <div className="row align-items-center mt-4 mx-0">
            <button className="btn cus-auth-btn py-1 col" onClick={() => handleDoneClick("price")}>DONE</button>
            <a className="font-18 text-black-3 cursor-pointer text-uppercase font-InterMedium col ms-2" onClick={() => handleClearClick("price")}>Clear</a>
          </div>
        </>
      );
    } else if (item.filterType == "size") {
      return (
        <>
          <div className="row mh-300 overflow-auto">
            <div className="col-12">
              <div className="row">
                {props.filterSize?.map((item, index) => (
                  <div className="col-6 mt-3" key={index}>
                    <div className={clsx(`size-box cursor-pointer text-center py-1 ${item.active ? "active" : ""}`)} onClick={() => {
                      props.handleChange("size", !item.active, index)
                    }}>
                      <span className="font-14 text-black-3 font-InterExtraLight">{item.size}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-12 mt-4">
              <h3 className="font-18 text-black-3 text-uppercase font-InterMedium">Bottoms</h3>
            </div>

            <div className="col-12">
              <div className="row">
                {props.filterBottoms?.map((item, index) => (
                  <div className="col-6 mt-3" key={index}>
                    <div className={clsx(`size-box cursor-pointer text-center py-1 ${item.active ? "active" : ""}`)} onClick={() => {
                      props.handleChange("bottom", !item.active, index)
                    }}>
                      <span className="font-14 text-black-3 font-InterExtraLight">{item.bottom}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="row align-items-center mt-4 mx-0">
            <button className="btn cus-auth-btn py-1 col" onClick={() => handleDoneClick("size")}>DONE</button>
            <a className="font-18 text-black-3 cursor-pointer text-uppercase font-InterMedium col ms-2" onClick={() => handleClearClick("size")}>Clear</a>
          </div>
        </>
      );
    } else if (item.filterType == "color") {
      return (
        <>
          <div className="row mh-300 overflow-auto">
            {props.filterColor?.map((item, index) => (
              <div className="col-6 mt-3" key={index}>
                <div className={clsx(`size-box cursor-pointer text-center py-3 ${item.color.toLowerCase()} 
                    ${item.active ? (item.color.toLowerCase() === "black") ? "border-cream border-3" : "border-black border-3" : ""}`
                )} onClick={() => {
                  props.handleChange("color", !item.active, index)
                }}>
                  <span className="font-16 text-black-3 font-InterMedium"></span>
                </div>
                <span className="font-16 text-black-3 font-InterMedium">{item.color}</span>
              </div>
            ))}
          </div>

          <div className="row align-items-center mt-4 mx-0">
            <button className="btn cus-auth-btn py-1 col" onClick={() => handleDoneClick("color")}>DONE</button>
            <a className="font-18 text-black-3 cursor-pointer text-uppercase font-InterMedium col ms-2" onClick={() => handleClearClick("color")}>Clear</a>
          </div>
        </>
      );
    } else if (item.filterType == "type") {
      return (
        <>
          <div className="row mh-300 overflow-auto">
            <div className="col-12">
              <ul className="mb-0 list-unstyled mt-3">
                {props.filterTypes?.map((item, index) => (
                  <li key={index}>
                    <a className={`font-16 text-black-3 mt-2 mb-0 text-decoration-none ${item.active ? "fw-bold" : "font-InterMedium"}`} onClick={() => props.categoryFilter(item.type, "mainCategory")}>{item.type}</a>
                    <ul className="mb-0 list-unstyled">
                      {item.subtype.map((i, index) => (
                        <li key={index}>
                          <a className={`font-16 text-black-3 font-InterExtraLight cursor-pointer text-decoration-none ms-3 ${i.active ? "fw-bold" : ""}`} onClick={() => props.categoryFilter(i.name, "innerFilter")}>{i.name}</a>
                        </li>
                      ))
                      }
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      );
    } else if (item.filterType == "product") {
      return (
        <>
          <div className="row mh-300 overflow-auto">
            {props.filterproduct?.map((item, index) => (
              <div className="col-12" key={index}>
                <FormGroup className="cus-checkbox">
                  <FormControlLabel control={<Checkbox />} label={item.name} checked={props.filterproduct[index].active} onChange={(e) => {
                    props.handleChange("product", e, index);
                  }} />
                </FormGroup>
              </div>
            ))}
          </div>

          <div className="row align-items-center mt-4 mx-0">
            <button className="btn cus-auth-btn py-1 col" onClick={() => handleDoneClick("product")}>DONE</button>
            <a className="font-18 text-black-3 cursor-pointer text-uppercase font-InterMedium col ms-2" onClick={() => handleClearClick("product")}>Clear</a>
          </div>
        </>
      );
    } else if (item.filterType == "brand") {
      return (
        <>
          <div className="row mh-300 overflow-auto">
            {props.filterBrand?.map((item, index) => (
              <div className="col-12" key={index}>
                <FormGroup className="cus-checkbox">
                  <FormControlLabel control={<Checkbox />} label={item.name} checked={props.filterBrand[index].active} onChange={(e) => {
                    props.handleChange("brand", e, index);
                  }} />
                </FormGroup>
              </div>
            ))}
          </div>

          <div className="row align-items-center mt-4 mx-0">
            <button className="btn cus-auth-btn py-1 col" onClick={() => handleDoneClick("brand")}>DONE</button>
            <a className="font-18 text-black-3 cursor-pointer text-uppercase font-InterMedium col ms-2" onClick={() => handleClearClick("brand")}>Clear</a>
          </div>
        </>
      );
    } else if (item.filterType == "location") {
      return (
        <>
          <div className="row">
            <div className="col-12">
              <form onClick={(e) => e.preventDefault()} className="mt-3">
                <div className="row">
                  <div className="col-12">
                    <input type="number" className="form-control border-dark bg-transparent rounded-0"
                      value={props.location}
                      onChange={(e) => props.handleChange("location", e)}
                      placeholder="Your zipcode" />
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="row align-items-center mt-4 mx-0">
            <button className="btn btn-dark rounded-0 py-2 col" onClick={() => handleDoneClick("location")}>DONE</button>
            <a className="font-18 fw-bold text-black-2 cursor-pointer font-InterExtraLight col ms-2" onClick={() => handleClearClick("location")}>Clear</a>
          </div>
        </>
      );
    }
  }

  return (
    <Fragment>
      <div className="row justify-content-center">
        <div className="col-12 mt-2" ref={props.sidebarRef}>
          <div className="me-3">
            <h3 className="font-24 text-black font-InterLight d-inline-block" onClick={() => toggleNav()}><FilterList /> Filter and sort</h3>
          </div>

          <Fade right={isMenuOpen} left={!isMenuOpen}>
            <div className="navbar-collapse filter-sidenav" id="mySidenav" style={{ width: isMenuOpen ? 320 : 0 }}>
              <div className="col-12 text-center border-bottom border-secondary position-relative">
                <div className="py-3">
                  <h3 className="font-InterMedium text-black-3 mb-0 font-20">Filter and sort</h3>
                </div>
                <button type="button" className="btn shadow-none position-absolute end-0 top-0 mt-2" onClick={() => { setIsMenuOpen(false) }}><Close /></button>
              </div>
              <ul className="navbar-nav mt-4 cus-mobile-filter">
                {props.filterItems?.map((item, index) => (
                  <Accordion key={index}>
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                      aria-controls="panel1a-content"
                      id="panel1a-header"
                    >
                      <Typography>{item.name}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography className="w-100">
                        {renderFilterBody(item)}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}

                <div className="row mx-0 pt-3 border-top border-secondary">
                  <div className="col-auto pe-0 d-flex align-items-center cursor-pointer"
                    onClick={() => {
                      props.setShowModal(true);
                      props.setModalType("");
                    }
                    }>
                    <img src="/media/images/location-logo.svg" className="w-20px ms-2 cus-tooltop-btn" />
                    <a className="font-16 text-black-3 text-decoration-none cursor-pointer font-InterMedium mx-2">Local Pick Up</a>
                  </div>
                  <div className="col-auto ps-0">
                    <p className="text-black-3 font-InterExtraLight font-16 mb-0 position-relative cursor-pointer">
                    <img src="/media/images/info_tooltip_icon.svg" className="w-20px ms-2 cus-tooltop-btn" />
                      <span className="cus-tooltop-left">If you have items shipping from the same product over different rental periods, shipping costs will increase.</span>
                    </p>
                  </div>
                </div>

                <div className="row justify-content-center pt-2">
                  <div className="col-4">
                    <AccordionSummary>
                      <Typography className="font-InterExtraLight">Sort by</Typography>
                    </AccordionSummary>
                  </div>
                  <div className="col-8 pe-4 mt-2">
                    <select className="form-select rounded-0 border-0 shadow-none font-InterExtraLight" selected={props.sortBy} onChange={(e) => handleChange(e)} >
                      <option value={0}>Best Sellers</option>
                      <option value={1}>Price: Low to High</option>
                      <option value={2}>Price: High to Low</option>
                      <option value={3}>Recently added</option>
                    </select>
                  </div>
                </div>

              </ul>
              {props.showClear && <div className="border-top border-secondary pt-2 clear-all">
                <a className="font-18 text-brown font-InterExtraLight text-decoration-none d-block mt-1" onClick={() => props.handleClearAll()}>Clear All</a>
              </div>}
            </div>
          </Fade>
        </div>
      </div>
    </Fragment>
  );
}

export default FilterProductMobile;
