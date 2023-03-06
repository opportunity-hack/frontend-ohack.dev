import React from "react";
import Link from 'next/link'

import AuthenticationButton from "./buttons/authentication-button";
import NavBarAdmin from "./nav-bar-admin";
import Image from 'next/image'


/*
TODO: In the future we may want to show notifications using something like this
import NotificationsActive from '@mui/icons-material/NotificationsActive';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
*/

// TODO: This appears to be unused. Can we safely delete this file?

export default function NavBar(){
  return (
    <div className="nav-bar__container">
     
    <nav className="nav-bar">
        <div className="nav-bar__brand">
          <Link href="/" passHref>
              <Image
                className="nav-bar__logo"
                src="https://i.imgur.com/Ff801O6.png"              
                alt="Opportunity Hack logo"              
                width={100}
                height={48}
              />
          </Link>
        </div>
        
        <div className="nav-bar__tabs">
        
          <Link
            href="/profile"
            exact
            className="nav-bar__tab"
            activeClassName="nav-bar__tab--active"
          >
            Profile
          </Link>
          &nbsp; &nbsp; &nbsp;
                    
          <NavBarAdmin />           

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

          <Link
            href="/nonprofits"
            exact
            className="nav-bar__tab"
            activeClassName="nav-bar__tab--active"
          >
            Projects
          </Link>

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

        {
          /* 
          TODO: In the future we may want to show notifications using something like this
        <Tooltip title="You have 1 notification" >
          <Badge badgeContent={4} color="secondary" >
            <NotificationsActive className="alert-notification" />
          </Badge>
        </Tooltip>  
          */
        }
      </nav>
    </div>
  );
};
