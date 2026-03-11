import React, { useState, useEffect } from "react";
import { useAuthInfo, withRequiredAuthInfo } from "@propelauth/react";
import {
  Box,
  Grid,
  CircularProgress,
  TextField,
  Button,
  Typography,
  Chip,
} from "@mui/material";
import AdminPage from "../../../components/admin/AdminPage";
import ContactSubmissionTable from "../../../components/admin/ContactSubmissionTable";
import ContactSubmissionDetailDialog from "../../../components/admin/ContactSubmissionDetailDialog";

const AdminContactPage = withRequiredAuthInfo(({ userClass }) => {
  const { accessToken } = useAuthInfo();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [orderBy, setOrderBy] = useState("timestamp");
  const [order, setOrder] = useState("desc");
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const org = userClass.getOrgByName("Opportunity Hack Org");
  const isAdmin = org.hasPermission("volunteer.admin");
  const orgId = org.orgId;

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/contact/submissions`,
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
        setSubmissions(data.submissions || []);
      } else {
        throw new Error("Failed to fetch contact submissions");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to fetch contact submissions. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchSubmissions();
    }
  }, [isAdmin, accessToken]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleViewSubmission = (submission) => {
    setSelectedSubmission(submission);
    setDetailDialogOpen(true);
  };

  const handleSaveSubmission = async (updatedData) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/contact/submissions/${updatedData.id}`,
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
          message: "Contact submission updated successfully",
          severity: "success",
        });
        fetchSubmissions();
      } else {
        throw new Error("Failed to update contact submission");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to update contact submission. Please try again.",
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

  const getSortValue = (sub, key) => {
    if (key === "name") {
      return `${sub.firstName || ""} ${sub.lastName || ""}`.trim();
    }
    if (key === "emails") {
      return (sub.sent_emails || []).length;
    }
    return sub[key] || "";
  };

  const sortedAndFilteredSubmissions = submissions
    .filter((sub) => {
      if (statusFilter !== "all" && (sub.status || "new") !== statusFilter) return false;
      if (!filter) return true;
      const searchValue = filter.toLowerCase();
      const fullName = `${sub.firstName || ""} ${sub.lastName || ""}`.toLowerCase();
      return (
        fullName.includes(searchValue) ||
        (sub.email || "").toLowerCase().includes(searchValue) ||
        (sub.organization || "").toLowerCase().includes(searchValue) ||
        (sub.inquiryType || "").toLowerCase().includes(searchValue)
      );
    })
    .sort((a, b) => {
      const valueA = getSortValue(a, orderBy);
      const valueB = getSortValue(b, orderBy);
      if (valueA < valueB) return order === "asc" ? -1 : 1;
      if (valueA > valueB) return order === "asc" ? 1 : -1;
      return 0;
    });

  const statusCounts = submissions.reduce((acc, sub) => {
    const s = sub.status || "new";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const statusColorMap = {
    new: "warning",
    responded: "success",
  };

  if (!isAdmin) {
    return (
      <AdminPage title="Contact Submissions" isAdmin={false}>
        <Typography>You do not have permission to view this page.</Typography>
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title="Contact Submissions"
      snackbar={snackbar}
      onSnackbarClose={handleSnackbarClose}
      isAdmin={isAdmin}
    >
      {/* Summary chips */}
      <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Chip
          label={`Total: ${submissions.length}`}
          variant={statusFilter === "all" ? "filled" : "outlined"}
          onClick={() => setStatusFilter("all")}
        />
        {Object.entries(statusCounts).map(([status, count]) => (
          <Chip
            key={status}
            label={`${status}: ${count}`}
            color={statusColorMap[status] || "default"}
            variant={statusFilter === status ? "filled" : "outlined"}
            onClick={() => setStatusFilter(statusFilter === status ? "all" : status)}
            sx={{ textTransform: "capitalize" }}
          />
        ))}
      </Box>

      <Box sx={{ mb: 3, width: "100%" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid>
            <Button onClick={fetchSubmissions} variant="outlined">
              Refresh Data
            </Button>
          </Grid>
          <Grid size={{ xs: true }}>
            <TextField
              fullWidth
              label="Filter by Name, Email, Organization, or Inquiry Type"
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
          <ContactSubmissionTable
            submissions={sortedAndFilteredSubmissions}
            orderBy={orderBy}
            order={order}
            onRequestSort={handleRequestSort}
            onViewSubmission={handleViewSubmission}
          />
        </Box>
      )}

      <ContactSubmissionDetailDialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        submission={selectedSubmission}
        onSave={handleSaveSubmission}
        accessToken={accessToken}
        orgId={orgId}
        onRefresh={fetchSubmissions}
      />
    </AdminPage>
  );
});

export default AdminContactPage;
