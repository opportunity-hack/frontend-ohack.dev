import React from "react";
import Link from "next/link";
import { useAuth0 } from "@auth0/auth0-react";

import NavBarAdmin from "../nav-bar-admin";
import Image from "next/image";

import {
  NavbarContainer,
  Navbar,
  LoginButton,
  LogoutButton,
  NavbarList,
  NavbarLink,
} from "./styles";

/*
TODO: In the future we may want to show notifications using something like this
import NotificationsActive from '@mui/icons-material/NotificationsActive';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
*/

export default function NavBar() {
  const { isAuthenticated, logout, loginWithRedirect } = useAuth0();

  return (
    <NavbarContainer container>
      <Navbar container>
        <Link href="/" passHref>
          <a>
            <Image
              className="nav-bar__logo"
              src="https://i.imgur.com/Ih0mbYx.png"
              alt="Opportunity Hack logo"
              width={100}
              height={48}
            />
          </a>
        </Link>
        <NavbarList container>
          <NavbarLink href="https://www.ohack.org" exact>
            About
          </NavbarLink>
          <NavbarLink href="/profile" exact>
            Projects
          </NavbarLink>
        </NavbarList>
        {isAuthenticated ? (
          <LogoutButton
            variant="contained"
            disableElevation
            onClick={() =>
              logout({
                returnTo: window.location.origin,
              })
            }
          >
            Log Out
          </LogoutButton>
        ) : (
          <LoginButton
            variant="contained"
            disableElevation
            onClick={() => loginWithRedirect()}
            className="login-button"
          >
            Log In
            <svg
              xmlns="http://www.w3.org/2000/svg"
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
      </Navbar>
    </NavbarContainer>
  );
}
