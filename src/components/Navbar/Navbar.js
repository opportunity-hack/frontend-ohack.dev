import React, { useState } from "react";
import Link from "next/link";
import { useAuth0 } from "@auth0/auth0-react";

import useProfileApi from "../../hooks/use-profile-api";

import NavBarAdmin from "../nav-bar-admin";
import Image from "next/image";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import {
  NavbarContainer,
  Navbar,
  LoginButton,
  LogoutButton,
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
} from "./styles";

/*
TODO: In the future we may want to show notifications using something like this
import NotificationsActive from '@mui/icons-material/NotificationsActive';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
*/

export default function NavBar() {
  const { isAuthenticated, logout, loginWithRedirect, user } = useAuth0();
  const { badges, hackathons, profile, feedback_url } = useProfileApi();
  const [isOpen, setIsOpen] = useState(false);

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
          <NavbarListItem>
            <NavbarLink href="https://www.ohack.org" exact>
              About Us
            </NavbarLink>
          </NavbarListItem>
          <NavbarListItem>
            <NavbarLink href="https://www.ohack.org/about/history" exact>
              Our History
            </NavbarLink>
          </NavbarListItem>
          <NavbarListItem>
            <NavbarLink href="/profile" exact>
              Projects
            </NavbarLink>
          </NavbarListItem>
          <NavbarListItem>
            <NavbarLink href="https://github.com/opportunity-hack/" exact>
              Github
            </NavbarLink>
          </NavbarListItem>
          <NavbarListItem>
            {/* {isAuthenticated && (
              <DropdownContainer>
                <DropdownList>
                  <DropdownListItem>
                    <AccountCircleIcon />
                    Profile
                  </DropdownListItem>
                  <DropdownListItem>
                    <LogoutIcon />
                    Log Out
                  </DropdownListItem>
                </DropdownList>
              </DropdownContainer>
            )} */}
            {isAuthenticated ? (
              <ProfileContainer>
                <Profile container onClick={setIsOpen.bind(null, !isOpen)}>
                  <ProfileAvatar
                    src={user.picture}
                    alt="Profile"
                    width={35}
                    height={35}
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
              // <LogoutButton
              //   variant="contained"
              //   disableElevation
              //   onClick={() =>
              //     logout({
              //       returnTo: window.location.origin,
              //     })
              //   }
              // >
              //   Log Out
              //   <LogoutIcon style={{ marginLeft: "1rem" }} />
              // </LogoutButton>
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
        </NavbarList>
      </Navbar>
    </NavbarContainer>
  );
}
