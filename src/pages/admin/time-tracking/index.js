import React, { useState, useEffect, useCallback } from "react";
import { useAuthInfo, RequiredAuthProvider, RedirectToLogin } from "@propelauth/react";
import {
  Box,
  Grid,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import moment from "moment";

import AdminPage from "../../../components/admin/AdminPage";
import TimeTrackingTable from "../../../components/admin/TimeTrackingTable";
import TimeTrackingDetailDialog from "../../../components/admin/TimeTrackingDetailDialog";
import TimeTrackingSummary from "../../../components/admin/TimeTrackingSummary";

const AdminTimeTrackingPage = () => {
  const { accessToken, userClass } = useAuthInfo();
  const [timeTrackingData, setTimeTrackingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [orderBy, setOrderBy] = useState("userName");
  const [order, setOrder] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterReason, setFilterReason] = useState("all");
  const [startDate, setStartDate] = useState(() => {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    return lastMonth;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const org = userClass?.getOrgByName("Opportunity Hack Org");
  const isAdmin = org?.hasPermission("volunteer.admin");

  // Get all unique reasons
  const allReasons = [...new Set(timeTrackingData.map(record => record.reason))].filter(Boolean);

  const fetchTimeTrackingData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/users/admin/volunteering?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-Org-Id": org?.orgId || "",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch time tracking data: ${response.status}`);
      }

      const data = await response.json();
      
      // Process the data to ensure all records have consistent structure
      const processedData = (data.volunteerSessions || []).map(session => ({
        ...session,
        // Add timestamps if missing
        timestamp: session.timestamp || new Date().toISOString(),
        // Make sure numeric values are numbers
        commitmentHours: Number(session.commitmentHours || 0),
        finalHours: Number(session.finalHours || 0),
        // Make sure we have user info
        userName: session.userName || "Unknown User",
        userId: session.userId || `unknown-${Math.random().toString(36).substring(2, 10)}`,
        email: session.email || "N/A",
      }));
      
      setTimeTrackingData(processedData);
    } catch (err) {
      console.error("Error fetching volunteer time tracking data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [accessToken, org?.orgId, startDate, endDate]);

  useEffect(() => {
    if (isAdmin && accessToken) {
      fetchTimeTrackingData();
    }
  }, [isAdmin, accessToken, fetchTimeTrackingData]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleViewUserDetails = (userData) => {
    setSelectedUser(userData);
    setDetailDialogOpen(true);
  };

  // Filter data based on search query and reason filter
  const filteredData = timeTrackingData.filter(record => {
    const matchesSearch = 
      record.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.reason?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesReason = filterReason === "all" || record.reason === filterReason;
    
    return matchesSearch && matchesReason;
  });

  // Group by user for the user-level view
  const userSummary = filteredData.reduce((acc, record) => {
    const userId = record.userId || 'unknown';
    
    if (!acc[userId]) {
      acc[userId] = {
        userId,
        userName: record.userName || 'Unknown User',
        email: record.email || 'N/A',
        totalCommitted: 0,
        totalTracked: 0,
        sessions: [],
        lastActive: null,
      };
    }
    
    acc[userId].totalCommitted += record.commitmentHours || 0;
    acc[userId].totalTracked += record.finalHours || 0;
    acc[userId].sessions.push(record);
    
    // Track latest session
    const timestamp = moment(record.timestamp);
    if (!acc[userId].lastActive || timestamp.isAfter(acc[userId].lastActive)) {
      acc[userId].lastActive = timestamp;
    }
    
    return acc;
  }, {});

  if (!isAdmin) {
    return (
      <RequiredAuthProvider
        authUrl={process.env.NEXT_PUBLIC_REACT_APP_AUTH_URL}
        displayIfLoggedOut={<RedirectToLogin postLoginRedirectUrl={window.location.href} />}
      >
        <AdminPage title="Volunteer Time Tracking" isAdmin={false}>
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
      <AdminPage title="Volunteer Time Tracking" isAdmin={isAdmin}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={setStartDate}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={setEndDate}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Filter by Reason</InputLabel>
                  <Select
                    value={filterReason}
                    label="Filter by Reason"
                    onChange={(e) => setFilterReason(e.target.value)}
                  >
                    <MenuItem value="all">All Reasons</MenuItem>
                    {allReasons.map(reason => (
                      <MenuItem key={reason} value={reason}>
                        {reason.charAt(0).toUpperCase() + reason.slice(1).replace('_', ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  onClick={fetchTimeTrackingData}
                  fullWidth
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : "Fetch Data"}
                </Button>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Search by Name or Email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type to search..."
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </Paper>

        {error && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: "error.light" }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        )}

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{ mb: 3 }}
        >
          <Tab label="Summary Dashboard" />
          <Tab label="Volunteer Report" />
        </Tabs>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {tabValue === 0 && (
              <TimeTrackingSummary timeTrackingData={filteredData} />
            )}
            
            {tabValue === 1 && (
              <Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Volunteer Time Tracking Report
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Click on a row to view detailed session information for each volunteer
                  </Typography>
                </Box>
                
                <TimeTrackingTable
                  timeTrackingData={filteredData}
                  orderBy={orderBy}
                  order={order}
                  onRequestSort={handleRequestSort}
                  onRowClick={handleViewUserDetails}
                />
              </Box>
            )}
          </>
        )}
        
        <TimeTrackingDetailDialog
          open={detailDialogOpen}
          onClose={() => setDetailDialogOpen(false)}
          userData={selectedUser}
        />
      </AdminPage>
    </RequiredAuthProvider>
  );
};

export default AdminTimeTrackingPage;