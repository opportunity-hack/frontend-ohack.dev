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
import StoreOrderTable from "../../../components/admin/StoreOrderTable";
import StoreOrderDetailDialog from "../../../components/admin/StoreOrderDetailDialog";

const AdminStorePage = withRequiredAuthInfo(({ userClass }) => {
  const { accessToken } = useAuthInfo();
  const [orders, setOrders] = useState([]);
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
  const [selectedOrder, setSelectedOrder] = useState(null);

  const org = userClass.getOrgByName("Opportunity Hack Org");
  const isAdmin = org.hasPermission("volunteer.admin");
  const orgId = org.orgId;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/store/orders`,
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
        setOrders(data.orders || []);
      } else {
        throw new Error("Failed to fetch orders");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to fetch orders. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchOrders();
    }
  }, [isAdmin, accessToken]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleViewOrder = (ord) => {
    setSelectedOrder(ord);
    setDetailDialogOpen(true);
  };

  const handleSaveOrder = async (updatedData) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/store/orders/${updatedData.id}`,
        {
          method: "PATCH",
          headers: {
            authorization: `Bearer ${accessToken}`,
            "content-type": "application/json",
            "X-Org-Id": orgId,
          },
          body: JSON.stringify({
            status: updatedData.status,
            trackingNumber: updatedData.trackingNumber,
            trackingCarrier: updatedData.trackingCarrier,
            adminNotes: updatedData.adminNotes,
          }),
        }
      );

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Order updated successfully",
          severity: "success",
        });
        fetchOrders();
      } else {
        throw new Error("Failed to update order");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to update order. Please try again.",
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

  const getSortValue = (ord, key) => {
    if (key === "itemCount") return (ord.items || []).length;
    if (key === "total") return ord.total || 0;
    return ord[key] || "";
  };

  const sortedAndFilteredOrders = orders
    .filter((ord) => {
      if (statusFilter !== "all" && (ord.status || "new") !== statusFilter) return false;
      if (!filter) return true;
      const searchValue = filter.toLowerCase();
      return (
        (ord.customerName || "").toLowerCase().includes(searchValue) ||
        (ord.customerEmail || "").toLowerCase().includes(searchValue) ||
        (ord.id || "").toLowerCase().includes(searchValue)
      );
    })
    .sort((a, b) => {
      const valueA = getSortValue(a, orderBy);
      const valueB = getSortValue(b, orderBy);
      if (valueA < valueB) return order === "asc" ? -1 : 1;
      if (valueA > valueB) return order === "asc" ? 1 : -1;
      return 0;
    });

  const statusCounts = orders.reduce((acc, ord) => {
    const s = ord.status || "new";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const statusColorMap = {
    new: "warning",
    processing: "info",
    shipped: "primary",
    delivered: "success",
    cancelled: "error",
  };

  if (!isAdmin) {
    return (
      <AdminPage title="Store Orders" isAdmin={false}>
        <Typography>You do not have permission to view this page.</Typography>
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title="Store Orders"
      snackbar={snackbar}
      onSnackbarClose={handleSnackbarClose}
      isAdmin={isAdmin}
    >
      {/* Summary chips */}
      <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Chip
          label={`Total: ${orders.length}`}
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
            <Button onClick={fetchOrders} variant="outlined">
              Refresh Data
            </Button>
          </Grid>
          <Grid size={{ xs: true }}>
            <TextField
              fullWidth
              label="Filter by Customer Name, Email, or Order ID"
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
          <StoreOrderTable
            orders={sortedAndFilteredOrders}
            orderBy={orderBy}
            order={order}
            onRequestSort={handleRequestSort}
            onViewOrder={handleViewOrder}
          />
        </Box>
      )}

      <StoreOrderDetailDialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        order={selectedOrder}
        onSave={handleSaveOrder}
        accessToken={accessToken}
        orgId={orgId}
        onRefresh={fetchOrders}
      />
    </AdminPage>
  );
});

export default AdminStorePage;
