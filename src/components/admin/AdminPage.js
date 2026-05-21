import React from "react";
import { Typography, Box, Snackbar, Alert, useTheme, useMediaQuery } from "@mui/material";
import Head from "next/head";
import { styled } from "@mui/system";
import dynamic from "next/dynamic";

const AdminNavigation = dynamic(() => import("./AdminNavigation"), {
  ssr: false,
});

const AdminPageContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  marginLeft: 0,
  marginRight: 0,
  padding: theme.spacing(2),
  // Backstop: clip any horizontal overflow from descendants so deep child
  // content (e.g. a wide grid in a section) can't push the document body
  // wider than the viewport. Without this, sections that render wider
  // intrinsic min-content shift the whole AdminPage card horizontally
  // (sidebar appears at a different x between sections).
  overflowX: "hidden",
  [theme.breakpoints.up("md")]: {
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
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  // Same backstop as the container — a deep grandchild can't widen this
  // card past its containing block.
  overflowX: "hidden",
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
        pt: isMobile ? 0 : 2,
        // Highest-level horizontal-overflow clip. Prevents any deep child
        // from widening the document body past the viewport (which was
        // shifting the entire AdminPage card sideways between sections —
        // e.g. Meals vs Overview).
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
      }}
    >
      <Head>
        <title>Admin - {title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
      </Head>

      <AdminPageContainer>
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