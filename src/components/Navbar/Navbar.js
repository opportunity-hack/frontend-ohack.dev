import { FONT_BODY } from "../../styles/fonts";
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
  Badge,
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
import FavoriteIcon from "@mui/icons-material/Favorite";

import { LoginButton, NavbarLink, NavbarButton } from "./styles";
import HeartsStatusMenuItem from "./HeartsStatusMenuItem";
import useHeartsSummary from "../../hooks/use-hearts-summary";

const pages = [
  ["Hackathons", "/hack"],
  ["Projects", "/projects"],
  ["Nonprofits", "/nonprofits"],
  // ["Store", "/store"],
  ["Sponsors", "/sponsor"],
];

// Hackathon-related dropdown menu
const hackathonMenuItems = [
  ["Events", "/hack"],
  ["What is a Hackathon?", "/about/process"],
  ["Request a Hackathon", "/hack/request"],
  ["Code of Conduct", "/hack/code-of-conduct"],
];

// Get Involved dropdown menu
const getInvolvedMenuItems = [
  ["Onboarding", "/onboarding"],
  ["Volunteer", "/volunteer"],
  ["Volunteer Jobs", "/jobs"],
  ["Become a Hacker", "/about/hackers"],
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
  // Hearts tier for the avatar ring/badge + dropdown status. Module-cached
  // fetch shared with ProfileCompletionPrompt — one request per page load,
  // none when logged out. Client-effect only, so SSR renders no ring (the
  // ring/badge overlay the avatar without changing its box — no CLS).
  const heartsSummary = useHeartsSummary();

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
        params: {},
      });
    }

    // Initialize Facebook Pixel
    initFacebookPixel();
  }, [isLoggedIn, user]);

  const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleOpenAboutMenu = (event) => setAnchorElAbout(event.currentTarget);
  const handleOpenGetInvolvedMenu = (event) =>
    setAnchorElGetInvolved(event.currentTarget);
  const handleOpenHackathonsMenu = (event) =>
    setAnchorElHackathons(event.currentTarget);
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
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: "rgba(251,250,246,0.82)",
        backdropFilter: "saturate(160%) blur(10px)",
        WebkitBackdropFilter: "saturate(160%) blur(10px)",
        color: "#16181D",
        borderBottom: "1px solid #E7E1D4",
        boxShadow: "none",
      }}
    >
      <Head>
        <link
          rel="preload"
          href="https://cdn.ohack.dev/ohack.dev/logos/OpportunityHack_Logo_Dark_Blue_Banner.png"
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
              src="https://cdn.ohack.dev/ohack.dev/logos/OpportunityHack_Logo_Dark_Blue_Banner.png"
              alt="Opportunity Hack logo"
              width={111}
              height={37}
              priority
            />
          </Typography>

          <Box
            sx={{
              flexGrow: 0,
              flexShrink: 0,
              display: { xs: "flex", md: "none" },
              alignItems: "center",
            }}
          >
            <IconButton
              size="large"
              aria-label="open navigation menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
              sx={{
                ml: -1,
                minWidth: "48px",
                minHeight: "48px",
                color: "#16181D",
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
              sx={{ display: { xs: "block", md: "none" } }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1,
                    width: "min(86vw, 340px)",
                    maxHeight: "78vh",
                    borderRadius: "14px",
                    border: "1px solid #E7E1D4",
                    boxShadow: "0 24px 60px -28px rgba(22,24,29,0.5)",
                    backgroundColor: "#FBFAF6",
                    overflowY: "auto",
                    "& .MuiList-root": { py: 1 },
                    "& .MuiListSubheader-root": {
                      fontFamily: FONT_BODY,
                      textTransform: "uppercase",
                      letterSpacing: "0.18em",
                      fontSize: "0.66rem",
                      fontWeight: 600,
                      color: "#8A8F9A",
                      lineHeight: 2.4,
                      background: "transparent",
                    },
                    "& .MuiMenuItem-root": {
                      borderRadius: "8px",
                      mx: 1,
                      "& .MuiTypography-root": {
                        textAlign: "left",
                        fontFamily: FONT_BODY,
                        fontSize: "1rem",
                        fontWeight: 500,
                        color: "#16181D",
                      },
                      "&:hover": { backgroundColor: "rgba(27,58,107,0.06)" },
                    },
                    "& .MuiDivider-root": { my: 0.75, borderColor: "#E7E1D4" },
                  },
                },
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

          {/* Centered logo on mobile (desktop has its own wordmark on the left) */}
          <Box
            component="a"
            href="/"
            aria-label="Opportunity Hack home"
            sx={{
              flexGrow: 1,
              display: { xs: "flex", md: "none" },
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              src="https://cdn.ohack.dev/ohack.dev/logos/OpportunityHack_Logo_Dark_Blue_Banner.png"
              alt="Opportunity Hack logo"
              width={102}
              height={34}
              priority
              style={{ height: 30, width: "auto" }}
            />
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {/* Hackathons dropdown for desktop */}
            <Tooltip title="Hackathon Information">
              <NavbarButton
                onClick={handleOpenHackathonsMenu}
                sx={{ my: 1, color: "#16181D", display: "block" }}
              >
                Hackathons
              </NavbarButton>
            </Tooltip>
            <Menu
              sx={{
                mt: "45px",
                maxHeight: "75vh",
                overflowY: "auto",
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
                    color: "#16181D",
                    display: "block",
                    px: 1.75,
                    minWidth: "48px",
                    minHeight: "48px",
                    textTransform: "none",
                    fontWeight: 500,
                    fontSize: "0.95rem",
                    fontFamily: FONT_BODY,
                    borderRadius: 1.5,
                    "&:hover": {
                      color: "#1B3A6B",
                      backgroundColor: "rgba(27,58,107,0.06)",
                    },
                  }}
                >
                  {page[0]}
                </Button>
              </NavbarLink>
            ))}

            <Tooltip title="Get Involved">
              <NavbarButton
                onClick={handleOpenGetInvolvedMenu}
                sx={{ my: 1, color: "#16181D", display: "block" }}
              >
                Get Involved
              </NavbarButton>
            </Tooltip>
            <Menu
              sx={{
                mt: "45px",
                maxHeight: "75vh",
                overflowY: "auto",
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
                sx={{ my: 1, color: "#16181D", display: "block" }}
              >
                About
              </NavbarButton>
            </Tooltip>
            <Menu
              sx={{
                mt: "45px",
                maxHeight: "75vh",
                overflowY: "auto",
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

          {/*
            Fixed-width auth slot keeps the navbar's right edge stable whether we
            render the Log In button (SSR/logged-out) or the Avatar (post-hydration
            logged-in). Prevents CLS from the auth state flipping on hydration.
          */}
          <Box
            sx={{
              flexGrow: 0,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              minWidth: { xs: 56, md: 140 },
              minHeight: "56px",
            }}
          >
            {isLoggedIn ? (
              <>
                <Tooltip title="Open settings">
                  <IconButton
                    onClick={handleOpenUserMenu}
                    sx={{
                      p: 0,
                      minWidth: "48px",
                      minHeight: "48px",
                      margin: "4px",
                    }}
                  >
                    {/* Tier ring + heart badge overlay the avatar without
                        changing its box — the fixed-width auth slot and 64px
                        bar height stay untouched (CWV invariant). */}
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                      invisible={!heartsSummary.tier}
                      badgeContent={
                        <Box
                          sx={{
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            backgroundColor:
                              heartsSummary.tier?.color || "transparent",
                            border: "1.5px solid #FBFAF6",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <FavoriteIcon
                            sx={{
                              fontSize: 9,
                              color: ["Gold", "Platinum", "Diamond"].includes(
                                heartsSummary.tier?.name,
                              )
                                ? "#333"
                                : "#fff",
                            }}
                          />
                        </Box>
                      }
                    >
                      <Avatar
                        alt={user?.firstName}
                        src={user?.pictureUrl}
                        sx={{
                          border: "2px solid transparent",
                          boxSizing: "border-box",
                          ...(heartsSummary.tier && {
                            borderColor: heartsSummary.tier.color,
                          }),
                        }}
                      />
                    </Badge>
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
                  <HeartsStatusMenuItem
                    profile={heartsSummary.profile}
                    hearts={heartsSummary.hearts}
                    tier={heartsSummary.tier}
                    nextTier={heartsSummary.nextTier}
                    heartsToNext={heartsSummary.heartsToNext}
                    progressPct={heartsSummary.progressPct}
                    onNavigate={handleCloseUserMenu}
                  />
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
              </>
            ) : (
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
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
