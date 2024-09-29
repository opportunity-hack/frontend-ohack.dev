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
import VolunteerBulkAdd from "../../../components/admin/VolunteerBulkAdd";
import { Typography } from "@mui/material";

const AdminVolunteerPage = withRequiredAuthInfo(({ userClass }) => {
  const { accessToken } = useAuthInfo();
  const [showBulkAdd, setShowBulkAdd] = useState(false);
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
          mentors: mentorsData.data,
          judges: judgesData.data,
          volunteers: volunteersData.data,
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
    setTabValue(newValue);
  }, []);

  const handleEditChange = useCallback((field, value) => {
    setEditingVolunteer((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleEditVolunteer = useCallback((volunteer) => {
    setEditingVolunteer({
      ...volunteer,
      type: getCurrentVolunteerType(),
    });
    setEditDialogOpen(true);
  }, []);

  const handleAddSingleVolunteer = useCallback(() => {
    setEditingVolunteer({
      type: getCurrentVolunteerType(),
      name: "",
      photoUrl: "",
      linkedinProfile: "",
      isInPerson: false,
      isSelected: false,
      pronouns: "",
      slack_user_id: "",
    });
    setEditDialogOpen(true);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    setLoading(true);
    try {
      const url = `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/2024_fall/${getCurrentVolunteerTypeSingular()}`;
      const method = editingVolunteer.id ? "PATCH" : "POST";

      console.log("editingVolunteer", editingVolunteer);

      const volunteerData = editingVolunteer.id
        ? editingVolunteer
        : { ...editingVolunteer, timestamp: new Date().toISOString() };

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
          message: editingVolunteer.id
            ? "Volunteer updated successfully"
            : "Volunteer added successfully",
          severity: "success",
        });
        fetchVolunteers();
      } else {
        throw new Error(
          editingVolunteer.id
            ? "Failed to update volunteer"
            : "Failed to add volunteer"
        );
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Failed to ${editingVolunteer.id ? "update" : "add"} volunteer. Please try again.`,
        severity: "error",
      });
    } finally {
      setLoading(false);
      setEditDialogOpen(false);
    }
  }, [editingVolunteer, accessToken, orgId, fetchVolunteers]);

  const getCurrentVolunteerType = useCallback(() => {
    switch (tabValue) {
      case 0:
        return "mentors";
      case 1:
        return "judges";
      case 2:
        return "volunteers";
      default:
        return "";
    }
  }, [tabValue]);

  const getCurrentVolunteerTypeSingular = useCallback(() => {
    switch (tabValue) {
      case 0:
        return "mentor";
      case 1:
        return "judge";
      case 2:
        return "volunteer";
      default:
        return "";
    }
  }, [tabValue]);

  const sortedVolunteers = useMemo(() => {
    const currentVolunteers = volunteers[getCurrentVolunteerType()] || [];    

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
  }, [volunteers, getCurrentVolunteerType, orderBy, order, filter]);

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
              onClick={() => setShowBulkAdd(!showBulkAdd)}
              variant="outlined"
            >
              {showBulkAdd ? "Hide Bulk Add" : "Bulk Add Volunteers"}
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

      {showBulkAdd && (
        <Box sx={{ mb: 3 }}>
          <VolunteerBulkAdd onAddVolunteers={fetchVolunteers} />
        </Box>
      )}

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
            type={getCurrentVolunteerType()}
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
        isAdding={!editingVolunteer?.id}
      />
    </AdminPage>
  );
});

export default AdminVolunteerPage;
