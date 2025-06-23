import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthInfo, withRequiredAuthInfo } from "@propelauth/react";
import {
  Box,
  Grid,
  CircularProgress,
  TextField,
  Button,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import AdminPage from "../../../components/admin/AdminPage";
import VolunteerTable from "../../../components/admin/VolunteerTable";
import VolunteerEditDialog from "../../../components/admin/VolunteerEditDialog";  
import ApplicationReviewList from "../../../components/admin/ApplicationReviewList";
import ApplicationEditDialog from "../../../components/admin/ApplicationEditDialog";
import useHackathonEvents from "../../../hooks/use-hackathon-events";

import { Typography } from "@mui/material";

const AdminVolunteerPage = withRequiredAuthInfo(({ userClass }) => {
  const { accessToken } = useAuthInfo();
  const { hackathons } = useHackathonEvents(false); // Get all hackathon events, not just current

  const [volunteers, setVolunteers] = useState({
    mentors: [],
    judges: [],
    volunteers: [],
    hackers: [],
    sponsors: []
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [orderBy, setOrderBy] = useState("name");
  const [order, setOrder] = useState("asc");
  const [filter, setFilter] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [viewMode, setViewMode] = useState("table"); // "table" or "review"
  const [applicationEditDialogOpen, setApplicationEditDialogOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);

  const org = userClass.getOrgByName("Opportunity Hack Org");
  const isAdmin = org.hasPermission("volunteer.admin");
  const orgId = org.orgId;
  
  // Find the most recent hackathon event to use as default
  useEffect(() => {
    if (hackathons && hackathons.length > 0 && !selectedEventId) {
      // Sort hackathons by date (descending) and use the most recent one
      const sortedHackathons = [...hackathons].sort((a, b) => {
        const dateA = new Date(a.start_date);
        const dateB = new Date(b.start_date);
        return dateB - dateA; // Most recent first
      });
      
      setSelectedEventId(sortedHackathons[0].event_id);
    }
  }, [hackathons, selectedEventId]);

  const fetchVolunteers = useCallback(async () => {
    if (!selectedEventId) return;
    
    setLoading(true);
    try {
      const [mentorsResponse, judgesResponse, volunteersResponse, hackersResponse, sponsorsResponse] =
        await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${selectedEventId}/mentor`,
            {
              headers: {
                authorization: `Bearer ${accessToken}`,
                "content-type": "application/json",
                "X-Org-Id": orgId,
              },
            }
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${selectedEventId}/judge`,
            {
              headers: {
                authorization: `Bearer ${accessToken}`,
                "content-type": "application/json",
                "X-Org-Id": orgId,
              },
            }
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${selectedEventId}/volunteer`,
            {
              headers: {
                authorization: `Bearer ${accessToken}`,
                "content-type": "application/json",
                "X-Org-Id": orgId,
              },
            }
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${selectedEventId}/hacker`,
            {
              headers: {
                authorization: `Bearer ${accessToken}`,
                "content-type": "application/json",
                "X-Org-Id": orgId,
              },
            }
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${selectedEventId}/sponsor`,
            {
              headers: {
                authorization: `Bearer ${accessToken}`,
                "content-type": "application/json",
                "X-Org-Id": orgId,
              },
            }
          ),
          
        ]);

      // Process responses even if some fail
      const responseData = {
        mentors: [],
        judges: [],
        volunteers: [],
        hackers: [],
        sponsors: []
      };
      

      if (mentorsResponse.ok) {
        const mentorsData = await mentorsResponse.json();
        responseData.mentors = mentorsData.data || [];
      }

      if (judgesResponse.ok) {
        const judgesData = await judgesResponse.json();
        responseData.judges = judgesData.data || [];
      }

      console.log("Volunteers data:", volunteersResponse);
      if (volunteersResponse.ok) {
        const volunteersData = await volunteersResponse.json();
        responseData.volunteers = volunteersData.data || [];
      }

      if (hackersResponse && hackersResponse.ok) {
        const hackersData = await hackersResponse.json();
        responseData.hackers = hackersData.data || [];
      }

      if (sponsorsResponse && sponsorsResponse.ok) {
        const sponsorsData = await sponsorsResponse.json();
        responseData.sponsors = sponsorsData.data || [];
      }
      
      setVolunteers(responseData);
      
    } catch (error) {
      console.error("Error fetching volunteers:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch volunteers. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [accessToken, orgId, selectedEventId]);

  useEffect(() => {
    if (isAdmin && selectedEventId) {
      fetchVolunteers();
    }
  }, [isAdmin, fetchVolunteers, selectedEventId]);

  const handleRequestSort = useCallback(
    (property) => {
      const isAsc = orderBy === property && order === "asc";
      setOrder(isAsc ? "desc" : "asc");
      setOrderBy(property);
    },
    [order, orderBy]
  );

  const handleTabChange = useCallback((event, newValue) => {
    setTabValue(newValue);
  }, []);

  const handleEditChange = useCallback((field, value) => {
    setEditingVolunteer((prev) => ({ ...prev, [field]: value }));
  }, []);

  const getCurrentVolunteerType = useCallback((currentTabValue) => {
    switch (currentTabValue) {
      case 0:
        return "mentors";
      case 1:
        return "judges";
      case 2:
        return "volunteers";
      case 3:
        return "hackers";
      case 4:
        return "sponsors";
      default:
        return "";
    }
  }, []);

  const getCurrentVolunteerTypeSingular = useCallback((currentTabValue) => {
    switch (currentTabValue) {
      case 0:
        return "mentor";
      case 1:
        return "judge";
      case 2:
        return "volunteer";
      case 3:
        return "hacker";
      case 4:
        return "sponsor";
      default:
        return "";
    }
  }, []);

  const handleEditVolunteer = useCallback(
    (volunteer) => {
      setEditingVolunteer({
        ...volunteer,
        type: getCurrentVolunteerType(tabValue),
      });
      setIsAdding(false);
      setEditDialogOpen(true);
    },
    [tabValue, getCurrentVolunteerType]
  );

  const handleAddSingleVolunteer = useCallback(() => {
    setEditingVolunteer({
      type: getCurrentVolunteerType(tabValue),
      name: "",
      photoUrl: "",
      linkedinProfile: "",
      isInPerson: false,
      isSelected: false,
      pronouns: "",
      slack_user_id: "",
    });
    setIsAdding(true);
    setEditDialogOpen(true);
  }, [tabValue, getCurrentVolunteerType]);

  const handleSaveEdit = useCallback(async () => {
    if (!selectedEventId) return;
    
    setLoading(true);
    try {
      const url = `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${selectedEventId}/${getCurrentVolunteerTypeSingular(tabValue)}`;
      const method = isAdding ? "POST" : "PATCH";

      const volunteerData = {
        ...editingVolunteer,
        timestamp: isAdding
          ? new Date().toISOString()
          : editingVolunteer.timestamp,
      };

      const response = await fetch(url, {
        method: method,
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
          "X-Org-Id": orgId,
        },
        body: JSON.stringify(volunteerData),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: isAdding
            ? "Volunteer added successfully"
            : "Volunteer updated successfully",
          severity: "success",
        });
        fetchVolunteers();
      } else {
        throw new Error(
          isAdding ? "Failed to add volunteer" : "Failed to update volunteer"
        );
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Failed to ${isAdding ? "add" : "update"} volunteer. Please try again.`,
        severity: "error",
      });
    } finally {
      setLoading(false);
      setEditDialogOpen(false);
    }
  }, [
    editingVolunteer,
    isAdding,
    accessToken,
    orgId,
    fetchVolunteers,
    getCurrentVolunteerTypeSingular,
    tabValue,
    selectedEventId,
  ]);

  // Application review functions
  const handleApproveApplication = useCallback(async (application) => {
    if (!selectedEventId) return;
    
    setLoading(true);
    try {
      const currentType = getCurrentVolunteerTypeSingular(tabValue);
      const url = `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${selectedEventId}/${currentType}`;
      
      const updatedApplication = {
        ...application,
        isSelected: true
      };

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
          "X-Org-Id": orgId,
        },
        body: JSON.stringify(updatedApplication),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Application approved successfully",
          severity: "success",
        });
        fetchVolunteers();
      } else {
        throw new Error("Failed to approve application");
      }
    } catch (error) {
      console.error('Error approving application:', error);
      setSnackbar({
        open: true,
        message: "Failed to approve application. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [accessToken, orgId, fetchVolunteers, getCurrentVolunteerTypeSingular, tabValue, selectedEventId]);

  const handleRejectApplication = useCallback(async (application) => {
    if (!selectedEventId) return;
    
    setLoading(true);
    try {
      const currentType = getCurrentVolunteerTypeSingular(tabValue);
      const url = `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${selectedEventId}/${currentType}`;
      
      const updatedApplication = {
        ...application,
        isSelected: false
      };

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
          "X-Org-Id": orgId,
        },
        body: JSON.stringify(updatedApplication),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Application rejected successfully",
          severity: "success",
        });
        fetchVolunteers();
      } else {
        throw new Error("Failed to reject application");
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      setSnackbar({
        open: true,
        message: "Failed to reject application. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [accessToken, orgId, fetchVolunteers, getCurrentVolunteerTypeSingular, tabValue, selectedEventId]);

  const handleBatchApproveApplications = useCallback(async (applications) => {
    if (!selectedEventId || applications.length === 0) return;
    
    setLoading(true);
    try {
      const currentType = getCurrentVolunteerTypeSingular(tabValue);
      const url = `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${selectedEventId}/${currentType}`;
      
      // Process applications in batches
      await Promise.all(applications.map(async (application) => {
        const updatedApplication = {
          ...application,
          isSelected: true
        };

        const response = await fetch(url, {
          method: "PATCH",
          headers: {
            authorization: `Bearer ${accessToken}`,
            "content-type": "application/json",
            "X-Org-Id": orgId,
          },
          body: JSON.stringify(updatedApplication),
        });

        if (!response.ok) {
          throw new Error(`Failed to approve application for ${application.name || 'Unknown'}`);
        }
      }));

      setSnackbar({
        open: true,
        message: `Successfully approved ${applications.length} applications`,
        severity: "success",
      });
      fetchVolunteers();
    } catch (error) {
      console.error('Error batch approving applications:', error);
      setSnackbar({
        open: true,
        message: "Failed to approve some applications. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [accessToken, orgId, fetchVolunteers, getCurrentVolunteerTypeSingular, tabValue, selectedEventId]);

  const handleBatchRejectApplications = useCallback(async (applications) => {
    if (!selectedEventId || applications.length === 0) return;
    
    setLoading(true);
    try {
      const currentType = getCurrentVolunteerTypeSingular(tabValue);
      const url = `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${selectedEventId}/${currentType}`;
      
      // Process applications in batches
      await Promise.all(applications.map(async (application) => {
        const updatedApplication = {
          ...application,
          isSelected: false
        };

        const response = await fetch(url, {
          method: "PATCH",
          headers: {
            authorization: `Bearer ${accessToken}`,
            "content-type": "application/json",
            "X-Org-Id": orgId,
          },
          body: JSON.stringify(updatedApplication),
        });

        if (!response.ok) {
          throw new Error(`Failed to reject application for ${application.name || 'Unknown'}`);
        }
      }));

      setSnackbar({
        open: true,
        message: `Successfully rejected ${applications.length} applications`,
        severity: "success",
      });
      fetchVolunteers();
    } catch (error) {
      console.error('Error batch rejecting applications:', error);
      setSnackbar({
        open: true,
        message: "Failed to reject some applications. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [accessToken, orgId, fetchVolunteers, getCurrentVolunteerTypeSingular, tabValue, selectedEventId]);

  // Application edit functions
  const handleEditApplication = useCallback((application) => {
    setEditingApplication(application);
    setApplicationEditDialogOpen(true);
  }, []);

  const handleSaveApplicationEdit = useCallback(async (updatedApplication) => {
    if (!selectedEventId) return;
    
    setLoading(true);
    try {
      const currentType = getCurrentVolunteerTypeSingular(tabValue);
      const url = `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${selectedEventId}/${currentType}`;
      
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
          "X-Org-Id": orgId,
        },
        body: JSON.stringify(updatedApplication),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Application updated successfully",
          severity: "success",
        });
        fetchVolunteers();
        setApplicationEditDialogOpen(false);
        setEditingApplication(null);
      } else {
        throw new Error("Failed to update application");
      }
    } catch (error) {
      console.error('Error updating application:', error);
      setSnackbar({
        open: true,
        message: "Failed to update application. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [accessToken, orgId, fetchVolunteers, getCurrentVolunteerTypeSingular, tabValue, selectedEventId]);

  const sortedVolunteers = useMemo(() => {
    const currentVolunteers =
      volunteers[getCurrentVolunteerType(tabValue)] || [];

    return currentVolunteers
      .sort((a, b) => {
        const valueA = (a[orderBy] || "").toString().toLowerCase();
        const valueB = (b[orderBy] || "").toString().toLowerCase();
        if (valueA < valueB) {
          return order === "asc" ? -1 : 1;
        }
        if (valueA > valueB) {
          return order === "asc" ? 1 : -1;
        }
        return 0;
      })
      .filter((volunteer) => {
        if (!volunteer) return false;
        const searchValue = filter.toLowerCase();
        return (
          volunteer.name?.toLowerCase().includes(searchValue) ||
          volunteer.expertise?.toLowerCase().includes(searchValue) ||
          volunteer.company?.toLowerCase().includes(searchValue) ||
          volunteer.email?.toLowerCase().includes(searchValue) ||
          volunteer.title?.toLowerCase().includes(searchValue) ||
          volunteer.companyName?.toLowerCase().includes(searchValue)
        );
      });
  }, [volunteers, getCurrentVolunteerType, orderBy, order, filter, tabValue]);

  if (!isAdmin) {
    return (
      <AdminPage title="Volunteer Management" isAdmin={false}>
        <Typography>You do not have permission to view this page.</Typography>
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title="Volunteer Management"
      snackbar={snackbar}
      onSnackbarClose={() => setSnackbar({ ...snackbar, open: false })}
      isAdmin={isAdmin}
    >
      <Box sx={{ mb: 3, width: "100%" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Button onClick={fetchVolunteers} variant="outlined">
              Refresh Data
            </Button>
          </Grid>
          <Grid item>
            <Button
              onClick={handleAddSingleVolunteer}
              variant="outlined"
              color="primary"
            >
              Add Single Volunteer
            </Button>
          </Grid>
          <Grid item>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(event, newViewMode) => {
                if (newViewMode !== null) {
                  setViewMode(newViewMode);
                }
              }}
              aria-label="view mode"
              size="small"
            >
              <ToggleButton value="table" aria-label="table view">
                Table View
              </ToggleButton>
              <ToggleButton value="review" aria-label="review view">
                Review Mode
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid item xs={3}>
            <FormControl fullWidth>
              <InputLabel id="hackathon-select-label">
                Hackathon Event
              </InputLabel>
              <Select
                labelId="hackathon-select-label"
                id="hackathon-select"
                value={selectedEventId}
                label="Hackathon Event"
                onChange={(e) => setSelectedEventId(e.target.value)}
              >
                {hackathons &&
                  hackathons.map((hackathon) => (
                    <MenuItem
                      key={hackathon.event_id}
                      value={hackathon.event_id}
                    >
                      {hackathon.event_id} - {hackathon.start_date}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>
          {viewMode === "table" && (
            <Grid item xs>
              <TextField
                fullWidth
                label="Filter by Name, Email, Expertise, or Company"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </Grid>
          )}
        </Grid>
      </Box>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        aria-label="volunteer tabs"
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab 
          label={
            <Badge color="primary" badgeContent={volunteers.mentors.length} max={999}>
              Mentors
            </Badge>
          } 
        />
        <Tab 
          label={
            <Badge color="primary" badgeContent={volunteers.judges.length} max={999}>
              Judges
            </Badge>
          } 
        />
        <Tab 
          label={
            <Badge color="primary" badgeContent={volunteers.volunteers.length} max={999}>
              Volunteers
            </Badge>
          } 
        />
        <Tab 
          label={
            <Badge color="primary" badgeContent={volunteers.hackers.length} max={999}>
              Hackers
            </Badge>
          } 
        />
        <Tab 
          label={
            <Badge color="primary" badgeContent={volunteers.sponsors.length} max={999}>
              Sponsors
            </Badge>
          } 
        />
      </Tabs>

      {!selectedEventId ? (
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="h6">Please select a hackathon event</Typography>
        </Box>
      ) : loading ? (
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ mt: 2 }}>
          {viewMode === "table" ? (
            <>
              <VolunteerTable
                volunteers={sortedVolunteers}
                type={getCurrentVolunteerType(tabValue)}
                orderBy={orderBy}
                order={order}
                onRequestSort={handleRequestSort}
                onEditVolunteer={handleEditVolunteer}
              />
              {sortedVolunteers.length === 0 && (
                <Box sx={{ mt: 2, textAlign: "center" }}>
                  <Typography>
                    No {getCurrentVolunteerType(tabValue)} found for this hackathon
                    event.
                  </Typography>
                </Box>
              )}
            </>
          ) : (
            <ApplicationReviewList
              applications={sortedVolunteers}
              applicationType={getCurrentVolunteerTypeSingular(tabValue)}
              onApprove={handleApproveApplication}
              onReject={handleRejectApplication}
              onEdit={handleEditApplication}
              onBatchApprove={handleBatchApproveApplications}
              onBatchReject={handleBatchRejectApplications}
              isLoading={loading}
              eventId={selectedEventId}
            />
          )}
        </Box>
      )}

      <VolunteerEditDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        volunteer={editingVolunteer}
        onSave={handleSaveEdit}
        onChange={handleEditChange}
        isAdding={isAdding}
      />

      <ApplicationEditDialog
        open={applicationEditDialogOpen}
        onClose={() => {
          setApplicationEditDialogOpen(false);
          setEditingApplication(null);
        }}
        application={editingApplication}
        applicationType={getCurrentVolunteerTypeSingular(tabValue)}
        onSave={handleSaveApplicationEdit}
        isLoading={loading}
      />
    </AdminPage>
  );
});

export default AdminVolunteerPage;
