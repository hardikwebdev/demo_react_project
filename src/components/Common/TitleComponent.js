import React from "react";
import Helmet from "react-helmet";

const TitleComponent = ({ title, icon }) => {
  var defaultTitle = "ReactReact";
  return (
    <Helmet>
      <link rel="apple-touch-icon" href={icon} />
      <title>{title ? "ReactReact | " + title : defaultTitle}</title>
    </Helmet>
  );
};

export default TitleComponent;
