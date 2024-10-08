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
} from "@mui/material";
import AdminPage from "../../../components/admin/AdminPage";
import VolunteerTable from "../../../components/admin/VolunteerTable";
import VolunteerEditDialog from "../../../components/admin/VolunteerEditDialog";  

import { Typography } from "@mui/material";

const AdminVolunteerPage = withRequiredAuthInfo(({ userClass }) => {
  const { accessToken } = useAuthInfo();

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

  const org = userClass.getOrgByName("Opportunity Hack Org");
  const isAdmin = org.hasPermission("volunteer.admin");
  const orgId = org.orgId;

  const fetchVolunteers = useCallback(async () => {
    setLoading(true);
    try {
      const eventId = "2024_fall"; // You might want to make this dynamic
      const [mentorsResponse, judgesResponse, volunteersResponse] =
        await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${eventId}/mentor`,
            {
              headers: {
                authorization: `Bearer ${accessToken}`,
                "content-type": "application/json",
                "X-Org-Id": orgId,
              },
            }
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${eventId}/judge`,
            {
              headers: {
                authorization: `Bearer ${accessToken}`,
                "content-type": "application/json",
                "X-Org-Id": orgId,
              },
            }
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${eventId}/volunteer`,
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
  }, [accessToken, orgId]);

  useEffect(() => {
    if (isAdmin) {
      fetchVolunteers();
    }
  }, [isAdmin, fetchVolunteers]);

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
    [tabValue]
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
  }, [tabValue]);

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
    setLoading(true);
    try {
      const eventId = "2024_fall"; // You might want to make this dynamic
      const url = `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${eventId}/${getCurrentVolunteerTypeSingular(tabValue)}`;
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

      {loading ? (
        <CircularProgress />
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
