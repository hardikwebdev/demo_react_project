import React, { Fragment } from "react";
import clsx from 'clsx';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import moment from 'moment';

function SingleProduct(props) {
  const { productData } = props;
  return (
    <Fragment>
      <div className={`position-relative product-img-style-parent ${productData?.availability_status === 0 && "op-5"}`} style={{ cursor: "pointer" }}>
      {!props.isOwner &&<div className="heart-pos">
          {!props.isOwner && <img src="/media/images/heart.svg" className={`heart-product-details heart-empty ${props.isFavorite ? "d-none" : "d-block"}`} onClick={() => {
            if (props.isFavorite) {
              props.addToFavoritesHandler(productData?.id, 0);
            } else {
              props.addToFavoritesHandler(productData?.id, 1);
            }
          }} />}
          {!props.isOwner && <img src="/media/images/heartfilled.svg" className={`heart-product-details heart-filled ${!props.isFavorite ? "d-none" : "d-block"}`} onClick={() => {
            if (props.isFavorite) {
              props.addToFavoritesHandler(productData?.id, 0);
            } else {
              props.addToFavoritesHandler(productData?.id, 1);
            }
          }} />}
        </div>}
        <LazyLoadImage src={props.img} className="d-block mx-auto img-drop-shadow br-5 product-img-style" onClick={props.onClick} />
        <h4 className={clsx("font-18 text-black-3 font-InterRegular mt-4")} onClick={props.onClick}>
          {props.title}
        </h4>
        {props.order_id &&
          <h4 className={clsx("font-18 text-black-3 font-InterExtraLight")}>
            Order {props.order_id}
          </h4>
        }
        {props.user_name &&
          <h4 className={clsx("font-16 text-light-gray3 font-InterExtraLight")}>
            {props.user_name}'s product
          </h4>
        }
        {props.start_date &&
          <h4 className={clsx("font-18 text-black-3 font-InterExtraLight")}>
            Ship by : {moment(props.start_date).format('MM/DD/YYYY')}
          </h4>
        }
        {props.end_date &&
          <h4 className={clsx("font-18 text-black-3 font-InterExtraLight")}>
            Due back : {moment(props.end_date).format('MM/DD/YYYY')}
          </h4>
        }
        {props.return_by &&
          <h4 className={clsx("font-18 text-black-3 font-InterExtraLight")}>
            Return By : {moment(props.return_by).format('MM/DD/YYYY')}
          </h4>
        }
        {(props.showStatus) &&
          <h4 className="font-18 text-black-3 font-InterExtraLight">
            {productData.availability_status === 1 ? "Active" : productData.availability_status === 2 ? "On React" : "Deactive"}
          </h4>
        }
        <h4 className={clsx("font-16 text-light-gray4 font-InterExtraLight")} onClick={props.onClick}>
          {productData?.ProductAttributes?.map(val => val.meta_type === "Brand" && val.meta_value)}
        </h4>
        <h4 className={clsx("font-20 text-black-3 font-InterRegular")} onClick={props.onClick}>
          From  {props.isSearch ? `$${props.price}` : `$${props.price}`}
        </h4>
      </div>
    </Fragment>
  );
}

export default SingleProduct;
