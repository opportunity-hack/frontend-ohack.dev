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
  ["📩 Submit Project", "/nonprofits/apply"],
  ["📖 Projects", "/nonprofits"],
  ["#️⃣ Join Slack", "/signup"],
  ["📍 Request a Hack", "/hack/request"],
  ["🏆 Judges", "/about/judges"],
  ["🎉 Sponsors", "/sponsor"],
];

// Reorganized about_settings with logical groupings
const aboutMenuGroups = [
  {
    title: "About Us",
    items: [
      ["ℹ️ About Us", "/about"],
      ["❓ What's your why?", "/about/why"],
      ["🙌 Success Stories", "/about/success-stories"],
    ]
  },
  {
    title: "Get Involved",
    items: [
      ["🤚 Volunteering", "/volunteer"],
      ["⌛️ Track Volunteer Time", "/volunteer/track"],
      ["🙏 Mentors", "/about/mentors"],
      ["🚪 Office Hours", "/office-hours"],
    ]
  },
  {
    title: "Hackathons & Projects",
    items: [
      ["🎉 What is a Hackathon?", "/hack"],
      ["📝 Process", "/about/process"],
      ["✅ Project Completion", "/about/completion"],
      ["❤️ Rewards", "/about/hearts"],
    ]
  },
  {
    title: "Other Resources",
    items: [
      ["🛜 Get Feedback", "/feedback"],
      ["🎨 Style Guide", "/about/style-guide"],
    ]
  }
];

const auth_settings = [["Profile", "/profile"]];

export default function NavBar() {
  const { isLoggedIn, user } = useAuthInfo();
  const { redirectToLoginPage } = useRedirectFunctions();
  const logout = useLogoutFunction();

  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [anchorElAbout, setAnchorElAbout] = React.useState(null);

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
  const handleCloseNavMenu = () => setAnchorElNav(null);
  const handleCloseUserMenu = () => setAnchorElUser(null);
  const handleCloseAboutMenu = () => setAnchorElAbout(null);

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
              <ListSubheader>About Opportunity Hack</ListSubheader>
              {aboutMenuGroups.map((group, index) => (
                <div key={group.title}>
                  {index > 0 && <Divider />}
                  <ListSubheader>{group.title}</ListSubheader>
                  {group.items.map((setting) => (
                    <Link href={setting[1]} key={setting[0]} passHref>
                      <MenuItem 
                        onClick={handleCloseNavMenu} 
                        sx={{ pl: 3, py: 1.5, minHeight: "48px" }}
                      >
                        <Typography textAlign="center">{setting[0]}</Typography>
                      </MenuItem>
                    </Link>
                  ))}
                </div>
              ))}
            </Menu>
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <Link href="/" passHref>
              <Image
                src="https://cdn.ohack.dev/ohack.dev/ohack_white.webp"
                alt="Opportunity Hack logo"
                width={100}
                height={46}
                priority
              />
            </Link>
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page) => (
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

            <Tooltip title="About Us">
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
              id="menu-appbar"
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
              {aboutMenuGroups.map((group, index) => (
                <div key={group.title}>
                  {index > 0 && <Divider />}
                  <ListSubheader>{group.title}</ListSubheader>
                  {group.items.map((setting) => (
                    <Link href={setting[1]} key={setting[0]} passHref>
                      <MenuItem 
                        onClick={handleCloseAboutMenu}
                        sx={{ py: 1.5, minHeight: "48px" }}
                      >
                        <Typography textAlign="center">{setting[0]}</Typography>
                      </MenuItem>
                    </Link>
                  ))}
                </div>
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
