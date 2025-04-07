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
} from "@mui/material";
import AdminPage from "../../../components/admin/AdminPage";
import VolunteerTable from "../../../components/admin/VolunteerTable";
import VolunteerEditDialog from "../../../components/admin/VolunteerEditDialog";  
import useHackathonEvents from "../../../hooks/use-hackathon-events";

import { Typography } from "@mui/material";

const AdminVolunteerPage = withRequiredAuthInfo(({ userClass }) => {
  const { accessToken } = useAuthInfo();
  const { hackathons } = useHackathonEvents(false); // Get all hackathon events, not just current

  console.log("Hackathons: ", hackathons);

  const [volunteers, setVolunteers] = useState({
    mentors: [],
    judges: [],
    volunteers: [],
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
      const [mentorsResponse, judgesResponse, volunteersResponse] =
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
        ]);

      if (mentorsResponse.ok && judgesResponse.ok && volunteersResponse.ok) {
        const mentorsData = await mentorsResponse.json();
        const judgesData = await judgesResponse.json();
        const volunteersData = await volunteersResponse.json();

        setVolunteers({
          mentors: mentorsData.data || [],
          judges: judgesData.data || [],
          volunteers: volunteersData.data || [],
        });
      } else {
        throw new Error("Failed to fetch volunteers");
      }
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
    console.log("tab value", newValue);
    setTabValue(newValue);
  }, []);

  const handleEditChange = useCallback((field, value) => {
    setEditingVolunteer((prev) => ({ ...prev, [field]: value }));
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
    console.log("Adding/Editing Type: ", getCurrentVolunteerType(tabValue));
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

  const getCurrentVolunteerType = useCallback((currentTabValue) => {
    switch (currentTabValue) {
      case 0:
        return "mentors";
      case 1:
        return "judges";
      case 2:
        return "volunteers";
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
      default:
        return "";
    }
  }, []);

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
          volunteer.company?.toLowerCase().includes(searchValue)
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
          <Grid item xs>
            <TextField
              fullWidth
              label="Filter by Name, Expertise, or Company"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </Grid>
        </Grid>
      </Box>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        aria-label="volunteer tabs"
      >
        <Tab label="Mentors" />
        <Tab label="Judges" />
        <Tab label="Volunteers" />
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
    </AdminPage>
  );
});

export default AdminVolunteerPage;
