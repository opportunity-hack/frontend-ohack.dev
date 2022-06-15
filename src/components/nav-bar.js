import React from "react";
import { NavLink } from "react-router-dom";
import { AuthenticationButton } from "./buttons/authentication-button";

export const NavBar = () => {
  return (
    <div className="nav-bar__container">
      <nav className="nav-bar">
        <div className="nav-bar__brand">
          <NavLink to="/">
            <img
              className="nav-bar__logo"
              src="https://i.imgur.com/Ff801O6.png"
              alt="Opportunity Hack logo"              
              width="100"
            />
          </NavLink>
        </div>
        <div className="nav-bar__tabs">
          <NavLink
            to="/profile"
            exact
            className="nav-bar__tab"
            activeClassName="nav-bar__tab--active"
          >
            Profile
          </NavLink>
          <NavLink
            to="/external-api"
            exact
            className="nav-bar__tab"
            activeClassName="nav-bar__tab--active"
          >
            Docs
          </NavLink>
        </div>
        <div className="nav-bar__actions">
          <AuthenticationButton />
        </div>
      </nav>
    </div>
  );
};
