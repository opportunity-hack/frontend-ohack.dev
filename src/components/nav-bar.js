import React from "react";
import { NavLink } from "react-router-dom";
import { AuthenticationButton } from "./buttons/authentication-button";
import { NavBarAdmin } from "./nav-bar-admin";

import NotificationsActive from '@mui/icons-material/NotificationsActive';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import { useState, useEffect } from "react";
import { useAdmin } from '../hooks/use-admin-check'

export const NavBar = () => {
  
  // The right way to do this is probably using React Redux to store the state more globally, but for now we'll do it this way
  const { getIsAdmin } = useAdmin();
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {    
    getIsAdmin()      
      .then((response) => {        
        if (response.status) {        
          if (response.status === 403) {
            setIsAdmin(false);
          }          
        }
        else {
          setIsAdmin(true);
        }
        });    
  },
    []  // Never trigger this again, don't give it any variables to watch
  );



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

          <Tooltip title="You have 1 notification">
            <IconButton>
              <NotificationsActive className="alert-notification" />
            </IconButton>
          </Tooltip>   

          <NavLink
            to="/feedback"
            exact
            className="nav-bar__tab"
            activeClassName="nav-bar__tab--active"
          >
            Feedback            
          </NavLink>
          
          <NavLink
            to="/nonprofits"
            exact
            className="nav-bar__tab"
            activeClassName="nav-bar__tab--active"
          >
            Nonprofits
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
