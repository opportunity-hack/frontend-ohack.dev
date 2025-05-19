import React, { useState } from "react";
import { useRouter } from "next/router";
import NextLink from "next/link";
import { 
  Breadcrumbs,
  Link as MuiLink,
  Tabs, 
  Tab, 
  Box, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Button, 
  Divider, 
  useMediaQuery, 
  useTheme,
  AppBar,
  Toolbar,
  Typography
} from "@mui/material";
import { styled } from "@mui/system";
import { 
  Menu as MenuIcon, 
  Home as HomeIcon,
  People as PeopleIcon,
  Event as EventIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  CardGiftcard as GiftIcon,
  Favorite as HeartIcon,
  Person as ProfileIcon,
  AccessTime as TimeIcon,
  Group as TeamsIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon
} from "@mui/icons-material";
import HandshakeIcon from '@mui/icons-material/Handshake';

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  background: "#f5f5f5",
  borderRadius: theme.shape.borderRadius,
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    display: "none",
  },
}));

const MobileButton = styled(Button)(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    display: "none",
  },
  marginBottom: theme.spacing(2),
}));

const DrawerHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "space-between",
}));

const adminPages = [
  { 
    path: "/admin", 
    label: "Dashboard", 
    icon: <DashboardIcon color="primary" />
  },
  { 
    path: "/admin/hearts", 
    label: "Hearts", 
    icon: <HeartIcon color="secondary" />
  },
  { 
    path: "/admin/nonprofit", 
    label: "Nonprofit", 
    icon: <BusinessIcon color="primary" />
  },
  { 
    path: "/admin/problems", 
    label: "Problems", 
    icon: <AssignmentIcon color="success" />
  },
  { 
    path: "/admin/nonprofit/application", 
    label: "Nonprofit Applications", 
    icon: <BusinessIcon style={{ color: "#f57c00" }} />
  },
  { 
    path: "/admin/profile", 
    label: "Profile", 
    icon: <ProfileIcon color="primary" />
  },
  { 
    path: "/admin/volunteer", 
    label: "Volunteer", 
    icon: <HandshakeIcon color="secondary" />
  },
  { 
    path: "/admin/teams", 
    label: "Teams", 
    icon: <TeamsIcon color="info" />
  },
  { 
    path: "/admin/time-tracking", 
    label: "Time Tracking", 
    icon: <TimeIcon style={{ color: "#9c27b0" }} />
  },
  { 
    path: "/admin/hackathons", 
    label: "Hackathons", 
    icon: <EventIcon color="error" />
  },
  { 
    path: "/admin/giveaways", 
    label: "Giveaways", 
    icon: <GiftIcon style={{ color: "#ff9800" }} />
  },
];

const AdminNavigation = () => {
  // MUI v5+ ListItem no longer accepts the button prop directly
  // Instead, we need to use ListItemButton component or enhance with sx
  const router = useRouter();
  const currentPath = router.pathname;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const currentPage = adminPages.find((page) => 
    // Handle special case for the dashboard which should match exactly
    (page.path === "/admin" && currentPath === "/admin") ||
    // For other admin pages, use startsWith to match nested routes
    (page.path !== "/admin" && currentPath.startsWith(page.path))
  ) || { label: "Admin" };

  const handleTabChange = (event, newValue) => {
    router.push(adminPages[newValue].path);
  };

  const toggleDrawer = (open) => (event) => {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* Mobile Top Bar - Only visible on mobile */}
      {isMobile && (
        <AppBar 
          position="static" 
          color="default" 
          elevation={1}
          sx={{ 
            mb: 2, 
            borderRadius: 1,
            bgcolor: 'background.paper'
          }}
        >
          <Toolbar variant="dense">
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="subtitle1" component="div" sx={{ flexGrow: 1 }}>
              {currentPage.label}
            </Typography>
            <NextLink href="/" passHref legacyBehavior>
              <IconButton color="inherit" component="a">
                <HomeIcon />
              </IconButton>
            </NextLink>
          </Toolbar>
        </AppBar>
      )}

      {/* Desktop Breadcrumbs - Hidden on mobile */}
      {!isMobile && (
        <StyledBreadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <NextLink href="/" passHref legacyBehavior>
            <MuiLink color="inherit" underline="hover">
              Home
            </MuiLink>
          </NextLink>
          <NextLink href="/admin" passHref legacyBehavior>
            <MuiLink color="inherit" underline="hover">
              Admin
            </MuiLink>
          </NextLink>
          <Typography color="textPrimary">
            {currentPage.label}
          </Typography>
        </StyledBreadcrumbs>
      )}

      {/* Desktop Tabs - Hidden on mobile */}
      <StyledTabs
        value={Math.max(0, adminPages.findIndex((page) => 
          (page.path === "/admin" && currentPath === "/admin") ||
          (page.path !== "/admin" && currentPath.startsWith(page.path))
        ))}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        aria-label="admin navigation tabs"
      >
        {adminPages.map((page) => (
          <Tab key={page.path} label={page.label} />
        ))}
      </StyledTabs>

      {/* Mobile Nav Button - Only visible on mobile */}
      <MobileButton
        variant="outlined"
        startIcon={<MenuIcon />}
        onClick={toggleDrawer(true)}
        fullWidth
      >
        Admin Navigation
      </MobileButton>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        <Box
          sx={{ width: 280 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <DrawerHeader>
            <Typography variant="h6" sx={{ ml: 2 }}>
              Admin Menu
            </Typography>
            <IconButton onClick={toggleDrawer(false)}>
              <ChevronLeftIcon />
            </IconButton>
          </DrawerHeader>
          
          <Divider />
          
          <List>
            {adminPages.map((page) => (
              <NextLink href={page.path} passHref legacyBehavior key={page.path}>
                <ListItem 
                  component="a"
                  selected={
                    (page.path === "/admin" && currentPath === "/admin") ||
                    (page.path !== "/admin" && currentPath.startsWith(page.path))
                  }
                  sx={{
                    bgcolor: (
                      (page.path === "/admin" && currentPath === "/admin") ||
                      (page.path !== "/admin" && currentPath.startsWith(page.path))
                    ) ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.08)',
                    },
                    cursor: 'pointer',
                    userSelect: 'none',
                    padding: '8px 16px'
                  }}
                >
                  <ListItemIcon>
                    {page.icon}
                  </ListItemIcon>
                  <ListItemText primary={page.label} />
                </ListItem>
              </NextLink>
            ))}
          </List>
          
          <Divider />
          
          <List>
            <NextLink href="/" passHref legacyBehavior>
              <ListItem 
                component="a" 
                sx={{ 
                  cursor: 'pointer', 
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                }}
              >
                <ListItemIcon>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary="Back to Site" />
              </ListItem>
            </NextLink>
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

export default AdminNavigation;