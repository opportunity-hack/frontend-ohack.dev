import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth0 } from "@auth0/auth0-react";
import GitHubIcon from '@mui/icons-material/GitHub';

// TODO: import useProfileApi from "../../hooks/use-profile-api";

// TODO: import NavBarAdmin from "../nav-bar-admin";
import Image from "next/image";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import * as ga from "../../lib/ga";

import {
  NavbarContainer,
  Navbar,
  LoginButton,
  // LogoutButton,
  NavbarList,
  NavbarLink,
  NavbarListItem,
  ProfileAvatar,
  Profile,
  ProfileContainer,
  ArrowPath,
  DropdownContainer,
  DropdownList,
  DropdownListItem,
  DropdownDivider,
  DetailTypography,
  DetailListItem,
  DrawerContainer,
  LogoText,
  LogoContainer,
} from "./styles";
import {
  Grid,
  // Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  // ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";

/*
TODO: In the future we may want to show notifications using something like this
import NotificationsActive from '@mui/icons-material/NotificationsActive';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
*/

export default function NavBar() {
  const { isAuthenticated, logout, loginWithRedirect, user } = useAuth0();
  // TODO: const { badges, hackathons, profile, feedback_url } = useProfileApi();
  const [isOpen, setIsOpen] = useState(false);

  // add close dropdown mouselistener to close on outside click
  const dropdownRef = useRef(null);
  const profileRef = useRef(null);

  if (isAuthenticated )
  {
    ga.set(user.email);    
  }


  useEffect(() => {
    // click outside handler
    function clickOutsideHandler(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    // bind event listener to entire document
    document.addEventListener("mouseup", clickOutsideHandler);
    return () => {
      // remove event listener on cleanup
      document.removeEventListener("mouseup", clickOutsideHandler);
    };
  }, [dropdownRef, profileRef]);

  // get width of window on resize
  const [width, setWidth] = useState();
  const functionName = () => {
    setInterval(() => {
      setWidth(window.screen.width);
    }, 500);
  };

  window.addEventListener("resize", functionName);

  useEffect(() => {
    setWidth(window.screen.width);
  }, []);

  // drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setIsDrawerOpen(open);
  };

  return (
    <NavbarContainer container>
      <Drawer anchor="left" open={isDrawerOpen} onClose={toggleDrawer(false)}>
        <DrawerContainer
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            <Grid
              container
              style={{ justifyContent: "center", margin: "2rem 0 3rem 0" }}
              key="logo"
            >
              <Link href="/" passHref>
                <LogoContainer>
                <Image
                  className="nav-bar__logo"
                  src="https://i.imgur.com/Ih0mbYx.png"
                  alt="Opportunity Hack logo"
                  width={150}
                  height={72}                  
                />
                </LogoContainer>
              </Link>
            </Grid>
            {[
              ["Projects", "/nonprofits", ""],
              ["About Us", "https://www.ohack.org/about", <OpenInNewIcon />],
              ["Our History", "https://www.ohack.org/about/history", <OpenInNewIcon />],              
              [<GitHubIcon/>, "https://github.com/opportunity-hack/", <OpenInNewIcon />],
            ].map((link) => (
              <>
                <Divider />
                <ListItem key={link[0]} disablePadding>
                  <ListItemButton href={link[1]}>
                    <ListItemText primary={link[0]} /> {link[2]}
                  </ListItemButton>
                </ListItem>
              </>
            ))}
            <Divider />
          </List>
          <LogoText>Opportunity Hack Inc. EIN: 84-5113049</LogoText>
        </DrawerContainer>
      </Drawer>
      <Navbar container>
        {width <= 900 ? (
          <MenuIcon
            onClick={toggleDrawer(true)}
            fontSize="large"
            style={{ transform: "scale(1.5)" }}
          />
        ) : (
          <Link href="/" passHref>
            <Image
              className="nav-bar__logo"
              src="https://i.imgur.com/Ih0mbYx.png"
              alt="Opportunity Hack logo"
              width={100}
              height={48}
              style={{cursor: "pointer"}}
            />
          </Link>
        )}
        <NavbarList container>
          {width >= 900 && (
            <>
              <NavbarListItem>
                <NavbarLink href="/nonprofits" exact>
                  Projects
                </NavbarLink>
              </NavbarListItem>
              <NavbarListItem>
                <NavbarLink href="https://www.ohack.org/about" exact>
                  About Us <OpenInNewIcon/>
                </NavbarLink>
              </NavbarListItem>              
              <NavbarListItem>
                <NavbarLink target={"_blank"} href="https://github.com/opportunity-hack/" exact>
                  <GitHubIcon fontSize="large"/>
                </NavbarLink>
              </NavbarListItem>
            </>
          )}
          <NavbarListItem>
            {isAuthenticated ? (
              <ProfileContainer ref={profileRef}>
                <Profile container onClick={setIsOpen.bind(null, !isOpen)}>
                  <ProfileAvatar
                    src={user.picture}
                    alt="Profile"
                    width={30}
                    height={30}
                  />
                  <svg
                    fill="none"
                    viewBox="0 0 10 10"
                    stroke="currentColor"
                    height="1em"
                    width="1em"
                  >
                    {!isOpen ? (
                      <ArrowPath d="M2,3.5 L5,6.5 L8,3.5" />
                    ) : (
                      <ArrowPath d="M2,6.5 L5,3.5 L8,6.5" />
                    )}
                  </svg>
                </Profile>
              </ProfileContainer>
            ) : (
              <LoginButton
                variant="contained"
                disableElevation
                onClick={() => loginWithRedirect()}
                className="login-button"
              >
                Log In
                <svg
                  fill="none"
                  viewBox="0 0 10 10"
                  stroke="currentColor"
                  height="1em"
                  width="1em"
                >
                  <path className="arrow" d="M3,2 L6,5 L3,8" />
                  <path className="line" d="M3,5 L8,5" />
                </svg>
              </LoginButton>
            )}
          </NavbarListItem>

          {isOpen && (
            <DropdownContainer ref={dropdownRef}>
              <DropdownList>
                <DetailListItem>
                  Logged in as:
                  <DetailTypography variant="body">
                    {user.nickname}
                  </DetailTypography>
                </DetailListItem>
                <DropdownDivider />
                <Link href="/profile" exact>
                  <DropdownListItem onClick={setIsOpen.bind(null, false)}>
                    <AccountCircleIcon
                      style={{ marginRight: "1rem", marginTop: "-2px" }}
                    />
                    Profile
                  </DropdownListItem>
                </Link>
                <DropdownDivider />
                <DropdownListItem
                  onClick={() =>
                    logout({
                      returnTo: window.location.origin,
                    })
                  }
                >
                  <LogoutIcon
                    style={{ marginRight: "1rem", marginTop: "-2px" }}
                  />
                  Log Out
                </DropdownListItem>
              </DropdownList>
            </DropdownContainer>
          )}
        </NavbarList>
      </Navbar>
    </NavbarContainer>
  );
}
