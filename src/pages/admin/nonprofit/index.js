import React, { useState, useEffect } from "react";
import { useAuthInfo, withRequiredAuthInfo } from "@propelauth/react";
import { Box, Grid, CircularProgress, TextField, Button } from "@mui/material";
import AdminPage from "../../../components/admin/AdminPage";
import NonprofitApplicationTable from "../../../components/admin/NonprofitApplicationTable";
import NonprofitApplicationEditDialog from "../../../components/admin/NonprofitApplicationEditDialog";
import { Typography } from "@mui/material";

const AdminNonprofitPage = withRequiredAuthInfo(({ userClass }) => {
  const { accessToken } = useAuthInfo();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [orderBy, setOrderBy] = useState("timestamp");
  const [order, setOrder] = useState("desc");
  const [filter, setFilter] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);

  const org = userClass.getOrgByName("Opportunity Hack Org");
  const isAdmin = org.hasPermission("volunteer.admin");
  const orgId = org.orgId;

  const fetchApplications = async () => {
    setLoading(true);    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npo/applications`,
        {
          method: "GET",
          headers: {
            authorization: `Bearer ${accessToken}`,
            "content-type": "application/json",
            "X-Org-Id": orgId,
            "Cache-Control": "no-cache",            
          },
        }
      );      

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setApplications(data.applications || []);
      } else {
        throw new Error("Failed to fetch nonprofit applications");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to fetch nonprofit applications. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchApplications();
    }
  }, [isAdmin, accessToken]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleEditApplication = (application) => {
    setEditingApplication(application);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async (updatedApplication) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npo/applications/${updatedApplication.id}`,
        {
          method: "PATCH",
          headers: {
            authorization: `Bearer ${accessToken}`,
            "content-type": "application/json",
            "X-Org-Id": orgId,
          },
          body: JSON.stringify(updatedApplication),
        }
      );

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Nonprofit application updated successfully",
          severity: "success",
        });
        fetchApplications();
      } else {
        throw new Error("Failed to update nonprofit application");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to update nonprofit application. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
      setEditDialogOpen(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const sortedApplications = applications
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
    .filter((application) => {
      const searchValue = filter.toLowerCase();
      return (
        (application.name || "").toLowerCase().includes(searchValue) ||
        (application.organization || "").toLowerCase().includes(searchValue) ||
        (application.email || "").toLowerCase().includes(searchValue)
      );
    });

  if (!isAdmin) {
    return (
      <AdminPage title="Nonprofit Application Management">
        <Typography>You do not have permission to view this page.</Typography>
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title="Nonprofit Application Management"
      snackbar={snackbar}
      onSnackbarClose={handleSnackbarClose}
    >
      <Box sx={{ mb: 3, width: "100%" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Button onClick={fetchApplications} variant="outlined">
              Refresh Data
            </Button>
          </Grid>
          <Grid item xs>
            <TextField
              fullWidth
              label="Filter by Name, Organization, or Email"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </Grid>
        </Grid>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <Box sx={{ mt: 2 }}>
          <NonprofitApplicationTable
            applications={sortedApplications}
            orderBy={orderBy}
            order={order}
            onRequestSort={handleRequestSort}
            onEditApplication={handleEditApplication}
          />
        </Box>
      )}

      <NonprofitApplicationEditDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        application={editingApplication}
        onSave={handleSaveEdit}
      />
    </AdminPage>
  );
});

export default AdminNonprofitPage;
