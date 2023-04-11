import React from 'react'
import { slide as Menu } from 'react-burger-menu';
import { useSelector, shallowEqual } from "react-redux";
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { ExpandMore } from "@material-ui/icons";
import { Accordion, AccordionSummary, AccordionDetails, Typography } from "@material-ui/core";

function Sidebar({ items, ...props }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const { authToken, user, userName } = useSelector(
    ({ auth }) => ({
      authToken: auth?.user?.token,
      user: auth?.user,
      userName: auth?.user?.first_name,
    }),
    shallowEqual
  );

  return (
    <Menu className="sidenav cus-mobile-filter">
      <h2 className="font-weight-normal font-InterRegular mb-0 text-center py-5">React</h2>
      {items.map(({ label, name, url, ...rest }, index) => {
        if (name != 'logout') {
          return (
            <>
              {name == "rent" || name == 'about' ?
                <Accordion key={label}>
                  <AccordionSummary
                    expandIcon={<ExpandMore />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <Typography>{label}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography component={'div'}>
                      <div className="row">
                        {url?.map((item, index) => (
                          <div className="col-12 mt-3" key={index}>
                            <div className="row">
                              <div className="col-12">
                                <h3 className="font-20 text-black-3 font-InterRegular mt-2 text-uppercase">{item.title}</h3>
                              </div>

                              {item.list?.map((items, index) => (
                                <div className="col-12 mt-2" key={index}>
                                   {name == "about" ? <Link
                                    className="text-black-3 text-decoration-none font-18 font-InterLight cursor-pointer"
                                    to={items.url}
                                    onClick={() => {
                                      document.getElementById("react-burger-cross-btn").click()
                                    }}
                                  >
                                    {items.name}
                                  </Link>
                                  :
                                  <a
                                    className="text-black-3 text-decoration-none font-18 font-InterLight cursor-pointer"
                                    onClick={() => {
                                      props.getSearchProducts({ searchText: items.name, type: item.title })
                                      document.getElementById("react-burger-cross-btn").click()
                                    }}
                                  >
                                    {items.name}
                                  </a>}
                                </div>
                              ))}
                              <div className="col-12 col-md-6 mt-2">
                                <Link
                                  className="text-brown font-18 font-InterRegular"
                                  to="/products"
                                  onClick={() => {
                                    document.getElementById("react-burger-cross-btn").click()
                                  }}
                                >
                                  View All
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Typography>
                  </AccordionDetails>
                </Accordion>
                : name === 'contact' ? <a key={label} className={clsx("nav-link text-black-3 font-18 font-InterRegular px-3 mt-2")} href="mailto:info@Reactyourproduct.co"
                >{label}</a> :
                <Link key={label} className={clsx("nav-link text-black-3 font-18 font-InterRegular px-3", currentPath === url ? "active" : "", label == 'Profile' ? "mt-2" : "")}
                  to={url} onClick={() => {
                    document.getElementById("react-burger-cross-btn").click()
                  }}>{label}</Link>
              }
            </>
          )
        } else if (name === 'logout' && authToken) {
          return (
            <Link key={label} className={clsx("nav-link text-black-3 font-18 font-InterRegular px-3 mt-2", currentPath === url ? "active" : "")}
              to={url} onClick={() => {
                document.getElementById("react-burger-cross-btn").click()
              }}>{label}</Link>
          )
        }
      })}
    </Menu>
  )
}

export default Sidebar;