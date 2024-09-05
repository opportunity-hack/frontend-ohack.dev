import React, { useState, useEffect } from "react";
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
  const [isAdding, setIsAdding] = useState(false);

  const org = userClass.getOrgByName("Opportunity Hack Org");
  const isAdmin = org.hasPermission("volunteer.admin");
  const orgId = org.orgId;

  const handleAddVolunteers = async (type, newVolunteers) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/2024_fall/volunteers/bulk`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${accessToken}`,
            "content-type": "application/json",
            "X-Org-Id": orgId,
          },
          body: JSON.stringify({ type: type, volunteers: newVolunteers }),
        }
      );

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Volunteers added successfully",
          severity: "success",
        });
        fetchVolunteers();
      } else {
        throw new Error("Failed to add volunteers");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to add volunteers. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
      setShowBulkAdd(false);
    }
  };

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/2024_fall`,
        {
          method: "GET",
          headers: {
            authorization: `Bearer ${accessToken}`,
            "content-type": "application/json",
            "X-Org-Id": orgId,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const { mentors, judges, volunteers } = data;
        setVolunteers({ mentors, judges, volunteers });
      } else {
        throw new Error("Failed to fetch volunteers");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to fetch volunteers. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchVolunteers();
    }
  }, [isAdmin, accessToken]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditChange = (field, value) => {
    setEditingVolunteer((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditVolunteer = (volunteer) => {
    setEditingVolunteer({
      ...volunteer,
      type:
        tabValue === 0 ? "mentors" : tabValue === 1 ? "judges" : "volunteers",
    });
    setIsAdding(false);
    setEditDialogOpen(true);
  };

  const handleAddSingleVolunteer = () => {
    setEditingVolunteer({
      type:
        tabValue === 0 ? "mentors" : tabValue === 1 ? "judges" : "volunteers",
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
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      const url = `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/2024_fall/volunteers`;
      const method = isAdding ? "POST" : "PATCH";
      let volunteerData = editingVolunteer;

      if( isAdding ) { // If we're adding something we need to add the timestamp we are addiing, but since the timestamp is a PK for edits, we don't want to touch it
        volunteerData = {
          ...editingVolunteer,
          timestamp: new Date().toISOString(), // Add timestamp
        };
      }

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
  };

  const sortedVolunteers = (type) => {
    return volunteers[type]
      .sort((a, b) => {
        const valueA = a[orderBy] || "";
        const valueB = b[orderBy] || "";
        if (valueA < valueB) {
          return order === "asc" ? -1 : 1;
        }
        if (valueA > valueB) {
          return order === "asc" ? 1 : -1;
        }
        return 0;
      })
      .filter(
        (volunteer) =>
          volunteer.name?.toLowerCase().includes(filter.toLowerCase()) ||
          volunteer.expertise?.toLowerCase().includes(filter.toLowerCase()) ||
          volunteer.company?.toLowerCase().includes(filter.toLowerCase())
      );
  };

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
          <VolunteerBulkAdd onAddVolunteers={handleAddVolunteers} />
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
            volunteers={sortedVolunteers(
              tabValue === 0
                ? "mentors"
                : tabValue === 1
                  ? "judges"
                  : "volunteers"
            )}
            type={
              tabValue === 0
                ? "mentors"
                : tabValue === 1
                  ? "judges"
                  : "volunteers"
            }
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
