import React, { useState, useEffect } from "react";
import { useAuthInfo, withRequiredAuthInfo } from "@propelauth/react";
import {
  Box,
  Grid,
  CircularProgress,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import AdminPage from "../../../components/admin/AdminPage";
import HackathonRequestTable from "../../../components/admin/HackathonRequestTable";
import HackathonRequestDetailDialog from "../../../components/admin/HackathonRequestDetailDialog";

const AdminHackathonRequestsPage = withRequiredAuthInfo(({ userClass }) => {
  const { accessToken } = useAuthInfo();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [orderBy, setOrderBy] = useState("created");
  const [order, setOrder] = useState("desc");
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const org = userClass.getOrgByName("Opportunity Hack Org");
  const isAdmin = org.hasPermission("volunteer.admin");
  const orgId = org.orgId;

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/admin/hackathon-requests`,
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
        setRequests(data.requests || []);
      } else {
        throw new Error("Failed to fetch hackathon requests");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to fetch hackathon requests. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchRequests();
    }
  }, [isAdmin, accessToken]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setDetailDialogOpen(true);
  };

  const handleSaveRequest = async (updatedData) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/admin/hackathon-requests/${updatedData.id}`,
        {
          method: "PATCH",
          headers: {
            authorization: `Bearer ${accessToken}`,
            "content-type": "application/json",
            "X-Org-Id": orgId,
          },
          body: JSON.stringify({
            status: updatedData.status,
            adminNotes: updatedData.adminNotes,
          }),
        }
      );

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Hackathon request updated successfully",
          severity: "success",
        });
        fetchRequests();
      } else {
        throw new Error("Failed to update hackathon request");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to update hackathon request. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
      setDetailDialogOpen(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const sortedAndFilteredRequests = requests
    .filter((req) => {
      if (statusFilter !== "all" && req.status !== statusFilter) return false;
      if (!filter) return true;
      const searchValue = filter.toLowerCase();
      return (
        (req.companyName || "").toLowerCase().includes(searchValue) ||
        (req.contactName || "").toLowerCase().includes(searchValue) ||
        (req.contactEmail || "").toLowerCase().includes(searchValue) ||
        (req.location || "").toLowerCase().includes(searchValue)
      );
    })
    .sort((a, b) => {
      const valueA = a[orderBy] || "";
      const valueB = b[orderBy] || "";
      if (valueA < valueB) return order === "asc" ? -1 : 1;
      if (valueA > valueB) return order === "asc" ? 1 : -1;
      return 0;
    });

  // Count by status for summary chips
  const statusCounts = requests.reduce((acc, req) => {
    const s = req.status || "pending";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  if (!isAdmin) {
    return (
      <AdminPage title="Hackathon Request Management" isAdmin={false}>
        <Typography>You do not have permission to view this page.</Typography>
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title="Hackathon Request Management"
      snackbar={snackbar}
      onSnackbarClose={handleSnackbarClose}
      isAdmin={isAdmin}
    >
      {/* Summary chips */}
      <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Chip
          label={`Total: ${requests.length}`}
          variant={statusFilter === "all" ? "filled" : "outlined"}
          onClick={() => setStatusFilter("all")}
        />
        {Object.entries(statusCounts).map(([status, count]) => (
          <Chip
            key={status}
            label={`${status.replace("-", " ")}: ${count}`}
            color={
              status === "pending"
                ? "warning"
                : status === "approved"
                ? "success"
                : status === "rejected"
                ? "error"
                : status === "in-progress"
                ? "info"
                : "default"
            }
            variant={statusFilter === status ? "filled" : "outlined"}
            onClick={() => setStatusFilter(statusFilter === status ? "all" : status)}
            sx={{ textTransform: "capitalize" }}
          />
        ))}
      </Box>

      <Box sx={{ mb: 3, width: "100%" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Button onClick={fetchRequests} variant="outlined">
              Refresh Data
            </Button>
          </Grid>
          <Grid item xs>
            <TextField
              fullWidth
              label="Filter by Organization, Contact, Email, or Location"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </Grid>
        </Grid>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ mt: 2 }}>
          <HackathonRequestTable
            requests={sortedAndFilteredRequests}
            orderBy={orderBy}
            order={order}
            onRequestSort={handleRequestSort}
            onViewRequest={handleViewRequest}
          />
        </Box>
      )}

      <HackathonRequestDetailDialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        request={selectedRequest}
        onSave={handleSaveRequest}
      />
    </AdminPage>
  );
});

export default AdminHackathonRequestsPage;
