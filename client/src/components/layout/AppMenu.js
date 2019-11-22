import React, { Fragment } from "react";

const AppMenu = () => {
  return (
    <Fragment>
      <div class="sidebar">
        <a class="active" href="#home">
          Home
        </a>
        <a href="#news">News</a>
        <a href="#contact">Contact</a>
        <a href="#about">About</a>
      </div>
    </Fragment>
  );
};
export default AppMenu;
