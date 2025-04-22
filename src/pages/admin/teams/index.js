import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Tabs, Tab, CircularProgress, Alert } from '@mui/material';
import { useAuthInfo, withRequiredAuthInfo } from '@propelauth/react';
import axios from 'axios';
import Head from 'next/head';
import { useSnackbar } from 'notistack';

import TeamManagement from '../../../components/admin/TeamManagement';
import AdminNavigation from '../../../components/admin/AdminNavigation';

const TeamAdminPage = withRequiredAuthInfo(({ userClass }) => {
  const { accessToken } = useAuthInfo();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [hackathons, setHackathons] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  
  const org = userClass.getOrgByName("Opportunity Hack Org");
  const orgId = org.orgId;
  const isAdmin = org.hasPermission("volunteer.admin");

  // Fetch hackathons for the dropdown selector
  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathons`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        
        if (response.data && response.data.hackathons) {
          setHackathons(response.data.hackathons);
        }
      } catch (error) {
        console.error('Error fetching hackathons:', error);
        enqueueSnackbar('Failed to fetch hackathons', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchHackathons();
    } else if (isAdmin) {
      setLoading(false);
    }
  }, [accessToken, isAdmin, enqueueSnackbar]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Render appropriate content based on admin status and loading state
  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (!isAdmin) {
      return (
        <Alert severity="error" sx={{ mt: 4 }}>
          You do not have permission to access this page. Please contact an administrator if you believe this is an error.
        </Alert>
      );
    }

    return (
      <>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="Team management tabs"
          >
            <Tab label="Team Management" />
            <Tab label="Team Statistics" />
            <Tab label="Team Assignments" disabled />
          </Tabs>
        </Box>

        {activeTab === 0 && (
          <TeamManagement orgId={orgId} hackathons={hackathons} />
        )}
        {activeTab === 1 && (
          <Box sx={{ my: 4 }}>
            <Alert severity="info">
              Team statistics dashboard is coming soon. This will include
              insights on team performance, engagement metrics, and project
              progress tracking.
            </Alert>
          </Box>
        )}
      </>
    );
  };

  return (
    <>
      <Head>
        <title>Team Management - Opportunity Hack Admin</title>
        <meta
          name="description"
          content="Admin dashboard for managing teams, assigning nonprofits, and monitoring hackathon teams."
        />
      </Head>

      <Container maxWidth="xl">
        <Box sx={{ mt: 12, mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Team Administration
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            Manage teams across all hackathons, assign nonprofits, track status, and communicate with team members.
          </Typography>

          <AdminNavigation />

          <Paper elevation={2} sx={{ p: 3, mt: 4 }}>
            {renderContent()}
          </Paper>
        </Box>
      </Container>
    </>
  );
});

export default TeamAdminPage;