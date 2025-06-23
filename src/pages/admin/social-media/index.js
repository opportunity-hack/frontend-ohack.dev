import React, { useState, useCallback } from 'react';
import { Typography, Alert } from '@mui/material';
import { useAuthInfo, withRequiredAuthInfo } from '@propelauth/react';

import SocialMediaManagement from '../../../components/admin/SocialMediaManagement';
import AdminPage from '../../../components/admin/AdminPage';

const SocialMediaAdminPage = withRequiredAuthInfo(({ userClass }) => {
  const { accessToken } = useAuthInfo();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  
  const org = userClass.getOrgByName("Opportunity Hack Org");
  const orgId = org.orgId;
  const isAdmin = org.hasPermission("volunteer.admin");

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!isAdmin) {
    return (
      <AdminPage title="Social Media Management" isAdmin={false}>
        <Typography>You do not have permission to view this page.</Typography>
      </AdminPage>
    );
  }

  const handleSnackbar = useCallback((message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  }, []);

  return (
    <AdminPage
      title="Social Media Management"
      isAdmin={isAdmin}
      snackbar={snackbar}
      onSnackbarClose={handleSnackbarClose}
    >
      <SocialMediaManagement onSnackbar={handleSnackbar} />
    </AdminPage>
  );
});

export default SocialMediaAdminPage;