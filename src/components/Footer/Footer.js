import React, { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";
import { useSelector, shallowEqual } from 'react-redux';

const Footer = (props) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const { isAuthorized } = useSelector(
    ({ auth }) => ({
      isAuthorized: auth.user != null,
    }),
    shallowEqual
  );

  const items = [
    {
      title: "Quick links",
      data: [
        { name: "Rent", url: "/products" }, ,
        { name: "Search", url: "/search" }, ,
        { name: "How ReactWorks", url: "/how-it-works" }, ,
        { name: "About", url: "/our-story" }, ,
      ],
    },
    {
      title: "Info",
      data: [
        { name: "My Account", url: isAuthorized ? "/profile" : "/account/login" },
        { name: "Leave Us a Review", url: "/leaveReview" },
        { name: "Contact Us", url: "/contact" },
        { name: "Terms and Conditions", url: "/terms" },
        { name: "Privacy Policy", url: "/privacy-policy" },
      ],
    },
  ];

  return (
    <Fragment>
      <div className={clsx("container-fluid bg-cream py-3")}>
        <div className="container">
          <div className="row">
            {items?.map((item, index) => (
              <div className="col-12 col-sm-6 col-lg-4" key={index}>
                <ul className="list-unstyled mt-3">
                  {item.data?.map((item, index) => (
                    <li className="nav-item" key={index}>
                      {item.url === "/contact" ?
                        <a className="nav-link text-white font-16 font-InterLight" href="mailto:info@Reactyourproduct.co">{item.name}</a> : item.url === "/leaveReview" ? <a className="nav-link text-white font-16 font-InterLight" href="mailto:info@Reactyourproduct.co?subject=Review">{item.name}</a>  :
                        <Link
                          className="nav-link text-white font-16 font-InterLight"
                          to={item.url}
                        >
                          {item.name}
                        </Link>
                      }
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="col-12 col-lg-4">
              <ul className="list-unstyled mt-3">
                <li className="nav-item">
                  <span className="nav-link text-white font-16 font-InterLight">
                    FIRSTRENTAL15
                  </span>
                </li>
                <li className="nav-item mt-3">
                  <span className="nav-link text-white font-16 font-InterLight">
                    Code is valid for orders up to $75
                  </span>
                </li>

                <li className="nav-item mt-5">
                  <ul className="list-unstyled d-flex align-items-center mb-0">
                    <li className="nav-item me-3">
                      <Link
                        to={{ pathname: process.env.REACT_APP_TWITTER_URL }}
                        target="_blank"
                        className="nav-link"
                      >
                        <img src="/media/images/Pinterest.svg" className="footer-icon-size" />
                      </Link>
                    </li>
                    <li className="nav-item me-3">
                      <Link
                        to={{ pathname: process.env.REACT_APP_INSTAGRAM_URL }}
                        target="_blank"
                        className="nav-link"
                      >
                        <img src="/media/images/Instagram.svg" className="footer-icon-size" />
                      </Link>
                    </li>
                    <li className="nav-item me-3">
                      <Link
                        to={{ pathname: process.env.REACT_APP_FACEBOOK_URL }}
                        target="_blank"
                        className="nav-link"
                      >
                        <img src="/media/images/Facebook.svg" className="footer-icon-size" />
                      </Link>
                    </li>
                    <li className="nav-item me-3">
                      <Link
                        to={{ pathname: process.env.REACT_APP_TIKTOK_URL }}
                        target="_blank"
                        className="nav-link"
                      >
                        <img src="/media/images/Tiktok.svg" className="footer-icon-size" />
                      </Link>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Footer;
