import React, { Fragment, useState } from "react";
import { Link, withRouter } from "react-router-dom";

const AppMenu = () => {
  const [displaySubMenus, toggleSubMenus] = useState(false);

  return (
    <Fragment>
      <div class="sidebar">
        <Link to="/dashboard">Home</Link>
        <a href="#news" onClick={() => toggleSubMenus(!displaySubMenus)}>
          Operations
        </a>
        {displaySubMenus && (
          <Fragment>
            <Link to="#news" id="operationsSub">
              > Terminal
            </Link>

            <Link to="#news" id="operationsSub">
              > Warning Track
            </Link>

            <Link to="#news" id="operationsSub">
              > Rejections
            </Link>
          </Fragment>
        )}
        <a href="#contact">Customer Service</a>
        <a href="#about">etc.</a>
      </div>
    </Fragment>
  );
};
export default AppMenu;
