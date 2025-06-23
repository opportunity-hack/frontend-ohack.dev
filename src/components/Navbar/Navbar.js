import React, { useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import MenuIcon from "@mui/icons-material/Menu";
import { trackEvent, initFacebookPixel, set } from "../../lib/ga";
import Button from "@mui/material/Button";
import {
  useLogoutFunction,
  useAuthInfo,
  useRedirectFunctions,
} from "@propelauth/react";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Container,
  Avatar,
  Tooltip,
  MenuItem,
  Menu,
  Divider,
  ListSubheader,
} from "@mui/material";

import { LoginButton, NavbarLink, NavbarButton } from "./styles";

const pages = [
  ["Hackathons", "/hack"],
  ["Projects", "/projects"],
  ["Nonprofits", "/nonprofits"],
  ["Sponsors", "/sponsor"],
];

// Hackathon-related dropdown menu
const hackathonMenuItems = [
  ["Upcoming Events", "/hack"],
  ["What is a Hackathon?", "/about/process"],
  ["Request a Hackathon", "/hack/request"],
  ["Code of Conduct", "/hack/code-of-conduct"],
];

// Get Involved dropdown menu
const getInvolvedMenuItems = [
  ["Volunteer", "/volunteer"],
  ["Become a Mentor", "/about/mentors"],
  ["Become a Judge", "/about/judges"],
  ["Track Your Time", "/volunteer/track"],
  ["Join Our Slack", "/signup"],
  ["Office Hours", "/office-hours"],
];

// Unified about menu structure for both mobile and desktop
const aboutMenuItems = [
  ["Our Mission", "/about"],
  ["Success Stories", "/about/success-stories"],
  ["Find Your Why", "/about/why"],
  ["Project Completion", "/about/completion"],
  ["Reward System", "/about/hearts"],
  ["Blog", "/blog"],
  ["Praise Board", "/praise"],
  ["Give Feedback", "/feedback"],
  ["Nonprofit Grants", "/nonprofit-grants"],
  ["Contact Us", "/contact"],
];

const auth_settings = [
  ["My Profile", "/profile"],
  ["My Feedback", "/myfeedback"],
  ["Track Time", "/volunteer/track"],
];

export default function NavBar() {
  const { isLoggedIn, user } = useAuthInfo();
  const { redirectToLoginPage } = useRedirectFunctions();
  const logout = useLogoutFunction();

  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [anchorElAbout, setAnchorElAbout] = React.useState(null);
  const [anchorElGetInvolved, setAnchorElGetInvolved] = React.useState(null);
  const [anchorElHackathons, setAnchorElHackathons] = React.useState(null);

  useEffect(() => {
    if (isLoggedIn && user?.email) {
      // Set user data for analytics
      set(user.email);
      
      // Track login event
      trackEvent({
        action: "Login Email Set",
        params: {}
      });
    }

    // Initialize Facebook Pixel
    initFacebookPixel();
  }, [isLoggedIn, user]);

  const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleOpenAboutMenu = (event) => setAnchorElAbout(event.currentTarget);
  const handleOpenGetInvolvedMenu = (event) => setAnchorElGetInvolved(event.currentTarget);
  const handleOpenHackathonsMenu = (event) => setAnchorElHackathons(event.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);
  const handleCloseUserMenu = () => setAnchorElUser(null);
  const handleCloseAboutMenu = () => setAnchorElAbout(null);
  const handleCloseGetInvolvedMenu = () => setAnchorElGetInvolved(null);
  const handleCloseHackathonsMenu = () => setAnchorElHackathons(null);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Opportunity Hack",
    url: "https://www.ohack.dev/",
    logo: "https://cdn.ohack.dev/ohack.dev/ohack_white.webp",
    description:
      "Opportunity Hack connects technology with nonprofits to create innovative solutions through hackathons and ongoing projects. Based in Phoenix, Arizona.",
    sameAs: [
      "https://www.facebook.com/opportunityhack",
      "https://twitter.com/opportunityhack",
      "https://threads.net/opportunityhack",
      "https://www.linkedin.com/company/opportunity-hack",
      "https://www.instagram.com/opportunityhack",
    ],
    knowsAbout: [
      "Hackathons",
      "Nonprofit Technology",
      "Social Impact",
      "Volunteer Coding",
      "Tech for Good",
      "Arizona Tech",
    ],
    event: {
      "@type": "Event",
      name: "Opportunity Hack Arizona Hackathon",
      startDate: "2024-10-12T08:00:00-07:00",
      endDate: "2024-10-13T18:00:00-07:00",
      location: {
        "@type": "Place",
        name: "ASU Tempe Engineering Center - Generator Labs",
        address: {
          "@type": "PostalAddress",
          streetAddress: "501 E Tyler Mall",
          addressLocality: "Tempe",
          addressRegion: "AZ",
          postalCode: "85281",
          addressCountry: "US",
        },
      },
      description:
        "Annual hackathon bringing together developers, designers, and nonprofits to create tech solutions for social good.",
      url: "https://www.ohack.dev/hack",
    },
  };

  return (
    <AppBar position="fixed">
      <Head>
        <link
          rel="preload"
          href="https://cdn.ohack.dev/ohack.dev/ohack_white.webp"
          as="image"
        />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Head>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            <Image
              className="nav-bar__logo"
              src="https://cdn.ohack.dev/ohack.dev/ohack_white.webp"
              alt="Opportunity Hack logo"
              width={256 / 2.5}
              height={122 / 2.5}
              priority
            />
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
              sx={{ 
                padding: "12px",
                minWidth: "48px", 
                minHeight: "48px"
              }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
                maxHeight: "75vh",
                overflowY: "auto"
              }}
            >
              {/* Main Navigation Pages */}
              {pages.map((page) => (
                <Link href={page[1]} key={page[0]} passHref>
                  <MenuItem 
                    onClick={handleCloseNavMenu}
                    sx={{ py: 1.5, minHeight: "48px" }}
                  >
                    <Typography textAlign="center">{page[0]}</Typography>
                  </MenuItem>
                </Link>
              ))}
              
              <Divider />
              <ListSubheader>Hackathon Resources</ListSubheader>
              {hackathonMenuItems.slice(1).map((item) => (
                <Link href={item[1]} key={item[0]} passHref>
                  <MenuItem 
                    onClick={handleCloseNavMenu} 
                    sx={{ pl: 3, py: 1.5, minHeight: "48px" }}
                  >
                    <Typography textAlign="center">{item[0]}</Typography>
                  </MenuItem>
                </Link>
              ))}
              
              <Divider />
              <ListSubheader>Get Involved</ListSubheader>
              {getInvolvedMenuItems.map((item) => (
                <Link href={item[1]} key={item[0]} passHref>
                  <MenuItem 
                    onClick={handleCloseNavMenu} 
                    sx={{ pl: 3, py: 1.5, minHeight: "48px" }}
                  >
                    <Typography textAlign="center">{item[0]}</Typography>
                  </MenuItem>
                </Link>
              ))}
              
              <Divider />
              <ListSubheader>About & Resources</ListSubheader>
              {aboutMenuItems.map((item) => (
                <Link href={item[1]} key={item[0]} passHref>
                  <MenuItem 
                    onClick={handleCloseNavMenu} 
                    sx={{ pl: 3, py: 1.5, minHeight: "48px" }}
                  >
                    <Typography textAlign="center">{item[0]}</Typography>
                  </MenuItem>
                </Link>
              ))}
            </Menu>
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {/* Hackathons dropdown for desktop */}
            <Tooltip title="Hackathon Information">
              <NavbarButton
                onClick={handleOpenHackathonsMenu}
                sx={{ my: 1, color: "white", display: "block" }}
              >
                Hackathons
              </NavbarButton>
            </Tooltip>
            <Menu
              sx={{ 
                mt: "45px",
                maxHeight: "75vh",
                overflowY: "auto"
              }}
              id="hackathons-menu"
              anchorEl={anchorElHackathons}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElHackathons)}
              onClose={handleCloseHackathonsMenu}
            >
              {hackathonMenuItems.map((item) => (
                <Link href={item[1]} key={item[0]} passHref>
                  <MenuItem 
                    onClick={handleCloseHackathonsMenu}
                    sx={{ py: 1.5, minHeight: "48px" }}
                  >
                    <Typography textAlign="center">{item[0]}</Typography>
                  </MenuItem>
                </Link>
              ))}
            </Menu>

            {/* Other main pages */}
            {pages.slice(1).map((page) => (
              <NavbarLink href={page[1]} key={page[0]}>
                <Button
                  onClick={handleCloseNavMenu}
                  sx={{ 
                    my: 2, 
                    color: "white", 
                    display: "block",
                    px: 2,
                    minWidth: "48px",
                    minHeight: "48px"
                  }}
                >
                  {page[0]}
                </Button>
              </NavbarLink>
            ))}

            <Tooltip title="Get Involved">
              <NavbarButton
                onClick={handleOpenGetInvolvedMenu}
                sx={{ my: 1, color: "white", display: "block" }}
              >
                Get Involved
              </NavbarButton>
            </Tooltip>
            <Menu
              sx={{ 
                mt: "45px",
                maxHeight: "75vh",
                overflowY: "auto"
              }}
              id="get-involved-menu"
              anchorEl={anchorElGetInvolved}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElGetInvolved)}
              onClose={handleCloseGetInvolvedMenu}
            >
              {getInvolvedMenuItems.map((item) => (
                <Link href={item[1]} key={item[0]} passHref>
                  <MenuItem 
                    onClick={handleCloseGetInvolvedMenu}
                    sx={{ py: 1.5, minHeight: "48px" }}
                  >
                    <Typography textAlign="center">{item[0]}</Typography>
                  </MenuItem>
                </Link>
              ))}
            </Menu>

            <Tooltip title="About & Resources">
              <NavbarButton
                onClick={handleOpenAboutMenu}
                sx={{ my: 1, color: "white", display: "block" }}
              >
                About
              </NavbarButton>
            </Tooltip>
            <Menu
              sx={{ 
                mt: "45px",
                maxHeight: "75vh",
                overflowY: "auto"
              }}
              id="about-menu"
              anchorEl={anchorElAbout}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElAbout)}
              onClose={handleCloseAboutMenu}
            >
              {aboutMenuItems.map((item) => (
                <Link href={item[1]} key={item[0]} passHref>
                  <MenuItem 
                    onClick={handleCloseAboutMenu}
                    sx={{ py: 1.5, minHeight: "48px" }}
                  >
                    <Typography textAlign="center">{item[0]}</Typography>
                  </MenuItem>
                </Link>
              ))}
            </Menu>
          </Box>

          {isLoggedIn && (
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton 
                  onClick={handleOpenUserMenu} 
                  sx={{ 
                    p: 0,
                    minWidth: "48px", 
                    minHeight: "48px",
                    margin: "4px" 
                  }}
                >
                  <Avatar alt={user?.firstName} src={user?.pictureUrl} />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {auth_settings.map((setting) => (
                  <Link href={setting[1]} key={setting[0]} passHref>
                    <MenuItem 
                      onClick={handleCloseUserMenu}
                      sx={{ py: 1.5, minHeight: "48px" }}
                    >
                      <Typography textAlign="center">{setting[0]}</Typography>
                    </MenuItem>
                  </Link>
                ))}
                <MenuItem 
                  onClick={() => logout(true)}
                  sx={{ py: 1.5, minHeight: "48px" }}
                >
                  <Typography textAlign="center">Log Out</Typography>
                </MenuItem>
              </Menu>
            </Box>
          )}

          {!isLoggedIn && (
            <LoginButton
              variant="contained"
              disableElevation
              onClick={() =>
                redirectToLoginPage({
                  postLoginRedirectUrl: window.location.href,
                })
              }
              className="login-button"
            >
              Log In
            </LoginButton>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
