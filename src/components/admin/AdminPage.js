import React from "react";
import { Typography, Box, Snackbar, Alert, useTheme, useMediaQuery, Container } from "@mui/material";
import Head from "next/head";
import { styled } from "@mui/system";
import AdminNavigation from "./AdminNavigation";

const AdminPageContainer = styled(Container)(({ theme }) => ({
  width: "100%",
  padding: theme.spacing(2),
  [theme.breakpoints.up("md")]: {
    width: "95%",
    maxWidth: "1400px",
    padding: theme.spacing(3),
  },
}));

const AdminPageTitle = styled(Box)(({ theme, isMobile }) => ({
  marginBottom: theme.spacing(3),
  padding: isMobile ? theme.spacing(2) : theme.spacing(3),
  background: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: isMobile ? "none" : theme.shadows[1],
  borderBottom: isMobile ? `1px solid ${theme.palette.divider}` : "none",
}));

const AdminPageContent = styled(Box)(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(3),
  },
  boxShadow: theme.shadows[1],
}));

const AdminPage = ({ title, children, snackbar, onSnackbarClose, isAdmin }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box 
      sx={{ 
        minHeight: "100vh",
        backgroundColor: "#f5f5f5", 
        pb: 4,
        pt: isMobile ? 0 : 2
      }}
    >
      <Head>
        <title>Admin - {title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
      </Head>

      <AdminPageContainer maxWidth={false}>
        {isAdmin && <AdminNavigation />}
        
        <AdminPageTitle isMobile={isMobile}>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            component="h1"
            sx={{ 
              fontWeight: "bold",
              color: theme.palette.text.primary
            }}
          >
            {title}
          </Typography>
        </AdminPageTitle>
        
        <AdminPageContent>
          {children}
        </AdminPageContent>
      </AdminPageContainer>

      {snackbar && (
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={onSnackbarClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
        >
          <Alert 
            onClose={onSnackbarClose} 
            severity={snackbar.severity}
            variant="filled"
            elevation={6}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default AdminPage;