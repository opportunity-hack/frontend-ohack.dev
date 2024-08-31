import React from "react";
import { Typography, Box, Snackbar, Alert } from "@mui/material";
import Head from "next/head";
import {
  LayoutContainer,
  TitleContainer,
} from "../../styles/nonprofit/styles";
import { styled } from "@mui/system";

const WideProjectsContainer = styled(Box)(({ theme }) => ({
  width: "95%",
  maxWidth: "1400px",
  margin: "0 auto",
  padding: theme.spacing(2),
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(3),
  },
}));

const AdminPage = ({ title, children, snackbar, onSnackbarClose }) => {
  return (
    <LayoutContainer>
      <Head>
        <title>Admin - {title}</title>
      </Head>
      <TitleContainer>
        <Typography variant="h4" gutterBottom>
          {title}
        </Typography>
      </TitleContainer>
      <WideProjectsContainer>
        <Box sx={{ width: "100%" }}>{children}</Box>
      </WideProjectsContainer>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={onSnackbarClose}
      >
        <Alert onClose={onSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </LayoutContainer>
  );
};

export default AdminPage;
