import React from "react";
import { Typography, Box, Grid, Snackbar, Alert } from "@mui/material";
import Head from "next/head";
import {
  LayoutContainer,
  TitleContainer,
  ProjectsContainer,
} from "../../styles/nonprofit/styles";

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
      <ProjectsContainer>
        <Box sx={{ width: "100%" }}>{children}</Box>
      </ProjectsContainer>
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
