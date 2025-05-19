import React, { useState } from "react";
import { useAuthInfo, RequiredAuthProvider, RedirectToLogin } from "@propelauth/react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Divider,
  useMediaQuery,
  useTheme,
  Avatar,
  Paper,
} from "@mui/material";
import AdminPage from "../../components/admin/AdminPage";
import { styled } from "@mui/system";
import NextLink from "next/link";
import {
  People as PeopleIcon,
  Event as EventIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  CardGiftcard as GiftIcon,
  Favorite as HeartIcon,
  Person as ProfileIcon,
  AccessTime as TimeIcon,
  Group as TeamsIcon,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";
import HandshakeIcon from '@mui/icons-material/Handshake';

const adminPages = [
  { 
    path: "/admin/hearts", 
    label: "Hearts", 
    description: "Manage heart allocation and reports",
    icon: <HeartIcon fontSize="large" color="secondary" />
  },
  { 
    path: "/admin/nonprofit", 
    label: "Nonprofit", 
    description: "Manage nonprofit organizations",
    icon: <BusinessIcon fontSize="large" color="primary" />
  },
  { 
    path: "/admin/problems", 
    label: "Problems", 
    description: "Manage problem statements",
    icon: <AssignmentIcon fontSize="large" color="success" />
  },
  { 
    path: "/admin/nonprofit/application", 
    label: "Nonprofit Applications", 
    description: "Review nonprofit applications",
    icon: <BusinessIcon fontSize="large" style={{ color: "#f57c00" }} />
  },
  { 
    path: "/admin/profile", 
    label: "Profile", 
    description: "Manage user profiles",
    icon: <ProfileIcon fontSize="large" color="primary" />
  },
  { 
    path: "/admin/volunteer", 
    label: "Volunteer", 
    description: "Manage volunteers",
    icon: <HandshakeIcon fontSize="large" color="secondary" />
  },
  { 
    path: "/admin/teams", 
    label: "Teams", 
    description: "Manage teams and assignments",
    icon: <TeamsIcon fontSize="large" color="info" />
  },
  { 
    path: "/admin/time-tracking", 
    label: "Time Tracking", 
    description: "View and manage volunteer hours",
    icon: <TimeIcon fontSize="large" style={{ color: "#9c27b0" }} />
  },
  { 
    path: "/admin/hackathons", 
    label: "Hackathons", 
    description: "Manage hackathon events",
    icon: <EventIcon fontSize="large" color="error" />
  },
  { 
    path: "/admin/giveaways", 
    label: "Giveaways", 
    description: "Manage prizes and giveaways",
    icon: <GiftIcon fontSize="large" style={{ color: "#ff9800" }} />
  },
];

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[8],
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  padding: theme.spacing(2, 0),
}));

const AdminDashboard = () => {
  const { isLoggedIn, userClass } = useAuthInfo();
  const org = userClass?.getOrgByName("Opportunity Hack Org");
  const isAdmin = org?.hasPermission("volunteer.admin");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!isAdmin) {
    return (
      <RequiredAuthProvider
        authUrl={process.env.NEXT_PUBLIC_REACT_APP_AUTH_URL}
        displayIfLoggedOut={<RedirectToLogin postLoginRedirectUrl={window.location.href} />}
      >
        <AdminPage title="Admin Dashboard" isAdmin={false}>
          <Typography>You do not have permission to view this page.</Typography>
        </AdminPage>
      </RequiredAuthProvider>
    );
  }

  return (
    <RequiredAuthProvider
      authUrl={process.env.NEXT_PUBLIC_REACT_APP_AUTH_URL}
      displayIfLoggedOut={<RedirectToLogin postLoginRedirectUrl={window.location.href} />}
    >
      <AdminPage title="Admin Dashboard" isAdmin={isAdmin}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 2,
            bgcolor: "#f9f9f9",
            border: "1px solid #e0e0e0"
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <DashboardIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
            <Typography variant="h5" component="h2">
              Opportunity Hack Admin Dashboard
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" paragraph>
            Welcome to the admin dashboard. Manage the Opportunity Hack platform from this central location.
            Select one of the management sections below to get started.
          </Typography>
        </Paper>

        <Grid container spacing={isMobile ? 2 : 3}>
          {adminPages.map((page) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={page.path}>
              <NextLink href={page.path} passHref legacyBehavior>
                <Box component="a" sx={{ textDecoration: "none", display: "block" }}>
                  <StyledCard>
                  <CardActionArea sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "stretch" }}>
                    <IconWrapper>
                      <Avatar 
                        sx={{ 
                          bgcolor: "white", 
                          width: 60, 
                          height: 60,
                          boxShadow: 1
                        }}
                      >
                        {page.icon}
                      </Avatar>
                    </IconWrapper>
                    <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                      <Typography gutterBottom variant="h6" component="h2" align="center">
                        {page.label}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" color="text.secondary" align="center">
                        {page.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                  </StyledCard>
                </Box>
              </NextLink>
            </Grid>
          ))}
        </Grid>
      </AdminPage>
    </RequiredAuthProvider>
  );
};

export default AdminDashboard;