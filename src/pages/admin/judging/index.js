import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Tabs, Tab, CircularProgress, Alert } from '@mui/material';
import { useAuthInfo, withRequiredAuthInfo } from '@propelauth/react';
import axios from 'axios';
import Head from 'next/head';
import { useSnackbar } from 'notistack';
import { useRouter } from 'next/router';

import JudgingRound1 from '../../../components/admin/JudgingRound1';
import JudgingRound2 from '../../../components/admin/JudgingRound2';
import JudgingResults from '../../../components/admin/JudgingResults';
import AdminNavigation from '../../../components/admin/AdminNavigation';

const JudgingAdminPage = withRequiredAuthInfo(({ userClass }) => {
  const { accessToken } = useAuthInfo();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hackathons, setHackathons] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedHackathon, setSelectedHackathon] = useState("");
  
  const org = userClass.getOrgByName("Opportunity Hack Org");
  const orgId = org.orgId;
  const isAdmin = org.hasPermission("volunteer.admin");

  // Set active tab from URL query params
  useEffect(() => {
    if (router.query.tab) {
      const tabIndex = parseInt(router.query.tab);
      if (!isNaN(tabIndex) && tabIndex >= 0 && tabIndex <= 2) {
        setActiveTab(tabIndex);
      }
    }
  }, [router.query]);

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
          // Select the most recent hackathon by default
          const sortedHackathons = [...response.data.hackathons].sort((a, b) => {
            const dateA = new Date(a.start_date);
            const dateB = new Date(b.start_date);
            return dateB - dateA;
          });
          
          if (sortedHackathons.length > 0 && !selectedHackathon) {
            setSelectedHackathon(sortedHackathons[0].event_id);
          }
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
    } else {
      setLoading(false);
    }
  }, [accessToken, isAdmin, enqueueSnackbar, selectedHackathon]);

  // Handle tab change and update URL
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    router.push({
      pathname: router.pathname,
      query: { ...router.query, tab: newValue },
    }, undefined, { shallow: true });
  };

  // Handle successful save operations
  const handleSaveSuccess = (message) => {
    enqueueSnackbar(message, { variant: 'success' });
    // Optionally refresh data or update state
  };

  const handleSaveError = (error) => {
    console.error('Save operation failed:', error);
    enqueueSnackbar('Save operation failed. Please try again.', { variant: 'error' });
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
            aria-label="Judging management tabs"
          >
            <Tab label="Round 1 - Initial Judging" />
            <Tab label="Round 2 - Final Judging" />
            <Tab label="Final Results" />
          </Tabs>
        </Box>

        {activeTab === 0 && (
          <JudgingRound1 
            orgId={orgId} 
            hackathons={hackathons} 
            selectedHackathon={selectedHackathon}
            setSelectedHackathon={setSelectedHackathon}
            onSaveSuccess={handleSaveSuccess}
            onSaveError={handleSaveError}
          />
        )}
        {activeTab === 1 && (
          <JudgingRound2 
            orgId={orgId} 
            hackathons={hackathons}
            selectedHackathon={selectedHackathon}
            setSelectedHackathon={setSelectedHackathon}
            onSaveSuccess={handleSaveSuccess}
            onSaveError={handleSaveError}
          />
        )}
        {activeTab === 2 && (
          <JudgingResults 
            orgId={orgId} 
            hackathons={hackathons}
            selectedHackathon={selectedHackathon}
            setSelectedHackathon={setSelectedHackathon}
            onSaveSuccess={handleSaveSuccess}
            onSaveError={handleSaveError}
          />
        )}
      </>
    );
  };

  return (
    <>
      <Head>
        <title>Judging Management - Opportunity Hack Admin</title>
        <meta
          name="description"
          content="Admin dashboard for managing hackathon judging assignments, organizing judges for rounds, and setting up evaluation sessions."
        />
      </Head>

      <Container maxWidth="xl">
        <Box sx={{ mt: 12, mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Judging Administration
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            Manage judging assignments for hackathon events. Organize judges into panels for Round 1 and Round 2.
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

export default JudgingAdminPage;