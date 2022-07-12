import React from "react";
import { NavLink } from "react-router-dom";
import { AuthenticationButton } from "./buttons/authentication-button";
import { NavBarAdmin } from "./nav-bar-admin";

import NotificationsActive from '@mui/icons-material/NotificationsActive';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';

import { useAdmin } from '../hooks/use-admin-check'

export const NavBar = () => {
  
  const { isAdmin } = useAdmin();
 
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
                    
          <NavBarAdmin admin={isAdmin}/>           

          {/*
          TODO: Probably can just embed this within the profile with FeedbackLite fragment instead of a page
          Trying to cut down on space usage in the nav bar
          
          <NavLink
            to="/feedback"
            exact
            className="nav-bar__tab"
            activeClassName="nav-bar__tab--active"
          >
            Feedback
          </NavLink>
        */}

          <NavLink
            to="/nonprofits"
            exact
            className="nav-bar__tab"
            activeClassName="nav-bar__tab--active"
          >
            Nonprofits
          </NavLink>

          {/*
          This isn't needed and is left over from Auth0 code, but it does force login upon navigation which can be helpful
          <NavLink
            to="/external-api"
            exact
            className="nav-bar__tab"
            activeClassName="nav-bar__tab--active"
          >
            Docs
          </NavLink>
        */}
          
        </div>

        <div className="nav-bar__actions">
          <AuthenticationButton />
        </div>

        <Tooltip title="You have 1 notification" >
          <Badge badgeContent={4} color="secondary" >
            <NotificationsActive className="alert-notification" />
          </Badge>
        </Tooltip>  
      </nav>
    </div>
  );
};
