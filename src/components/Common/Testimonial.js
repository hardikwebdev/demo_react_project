import { React, useState, useRef, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  PlayArrow,
} from "@material-ui/icons";

function SimpleSlider(props) {
  const [playing, setPlaying] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCounter, setPageCounter] = useState(props.carouselData.length);
  const [sliderRef, setSlideRef] = useState(null);

  const toggle = () => {
    setPlaying(!playing);
    if (!playing) {
      sliderRef.slickPlay();
    } else {
      sliderRef.slickPause();
    }
  };

  const handlePrevSlide = () => {
    sliderRef.slickPrev();
  };
  const handleNextSlide = () => {
    sliderRef.slickNext();
  };

  const settings = {
    dots: false,
    infinite: true,
    autoplay: true,
    speed: 1000,
    arrows: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    beforeChange: (current, next) => setCurrentPage(next + 1),
    afterChange: (current) => setCurrentPage(current + 1),
  };
  return (
    <>
      <Slider ref={(slider) => setSlideRef(slider)} {...settings}>
        {props.carouselData.length > 0 ? (
          props.carouselData?.map((item, index) => (
            <div key={index}>
              <div className="row align-items-center">
                <div className="col-12 col-lg-6">
                  <img
                    src={item.user_profile_image}
                    className="img-fluid d-block mx-auto"
                  />
                </div>
                <div className="col-12 col-lg-6 mt-4 mt-lg-0">
                  <div className="px-lg-4 px-xl-5">
                    <img
                      src="/media/images/review.png"
                      className="img-fluid d-block mx-auto -mb-30"
                    />
                    <div className="bg-testimonial-box br-20 px-4 py-5 text-center">
                      <p className="text-black font-InterBold font-20 op-6">
                        {item.review}
                      </p>
                      <h1 className="text-black font-CambonBold font-30 pb-4">
                        - {item.user_name}, {item.user_location}
                      </h1>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div>Ooops,We are facing an issue !!</div>
        )}
      </Slider>

      <div className="border text-center mt-3">
        <span>
          <ChevronLeft
            className="text-black-2 cursor-pointer"
            onClick={() => {
              handlePrevSlide();
            }}
          />
        </span>
        <span className="px-4">
          {currentPage}/{pageCounter}
        </span>
        <span>
          <ChevronRight
            className="text-black-2 cursor-pointer"
            onClick={() => {
              handleNextSlide();
            }}
          />
        </span>
        <span className="border-start ms-3 ps-3">
          <button className="btn shadow-none" onClick={toggle}>
            {!playing ? (
              <PlayArrow className="text-black-2" />
            ) : (
              <Pause className="text-black-2" />
            )}
          </button>
        </span>
      </div>
    </>
  );
}

export default SimpleSlider;
