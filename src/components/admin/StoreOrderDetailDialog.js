import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AdminEmailCompose from "./AdminEmailCompose";

const statusOptions = [
  { value: "new", label: "New", color: "warning" },
  { value: "processing", label: "Processing", color: "info" },
  { value: "shipped", label: "Shipped", color: "primary" },
  { value: "delivered", label: "Delivered", color: "success" },
  { value: "cancelled", label: "Cancelled", color: "error" },
];

const carrierOptions = ["USPS", "UPS", "FedEx", "Other"];

const formatDate = (dateStr) => {
  if (!dateStr) return "Not set";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

const Section = ({ title, children }) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: "primary.main" }}>
      {title}
    </Typography>
    <Paper variant="outlined" sx={{ p: 2 }}>
      {children}
    </Paper>
  </Box>
);

const Field = ({ label, value }) => (
  <Box sx={{ mb: 1.5, minWidth: 0 }}>
    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
      {label}
    </Typography>
    <Typography variant="body1" sx={{ wordBreak: "break-all", overflowWrap: "anywhere" }}>
      {value || "-"}
    </Typography>
  </Box>
);

const StoreOrderDetailDialog = ({
  open,
  onClose,
  order,
  onSave,
  accessToken,
  orgId,
  onRefresh,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [status, setStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingCarrier, setTrackingCarrier] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    if (order) {
      setStatus(order.status || "new");
      setTrackingNumber(order.trackingNumber || "");
      setTrackingCarrier(order.trackingCarrier || "");
      setAdminNotes(order.adminNotes || "");
    }
  }, [order]);

  if (!order) return null;

  const handleSave = () => {
    onSave({
      id: order.id,
      status,
      trackingNumber,
      trackingCarrier,
      adminNotes,
    });
  };

  const shipping = order.shippingAddress || {};
  const shippingStr = [
    shipping.line1,
    shipping.line2,
    [shipping.city, shipping.state, shipping.postal_code].filter(Boolean).join(", "),
    shipping.country,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h6" component="span">
            Order #{(order.id || "").substring(0, 8)}
          </Typography>
          <Chip
            label={order.status || "new"}
            color={statusOptions.find((s) => s.value === (order.status || "new"))?.color || "default"}
            size="small"
            sx={{ textTransform: "capitalize" }}
          />
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Admin Controls */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            bgcolor: "grey.50",
            border: "2px solid",
            borderColor: "primary.light",
            borderRadius: 2,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "primary.main" }}>
            Admin Controls
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={status} onChange={(e) => setStatus(e.target.value)} label="Status">
                  {statusOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Carrier</InputLabel>
                <Select
                  value={trackingCarrier}
                  onChange={(e) => setTrackingCarrier(e.target.value)}
                  label="Carrier"
                >
                  <MenuItem value="">None</MenuItem>
                  {carrierOptions.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Tracking Number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                size="small"
                label="Admin Notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Order Info */}
        <Section title="Order Information">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Field label="Order ID" value={order.id} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Field label="Stripe Session" value={order.stripeSessionId} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Field label="Payment Intent" value={order.stripePaymentIntentId} />
            </Grid>
          </Grid>
        </Section>

        {/* Customer & Shipping */}
        <Section title="Customer & Shipping">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Field label="Name" value={order.customerName} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Field label="Email" value={order.customerEmail} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Field
                label="Shipping Address"
                value={
                  shippingStr ? (
                    <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                      {shippingStr}
                    </Typography>
                  ) : (
                    "-"
                  )
                }
              />
            </Grid>
          </Grid>
        </Section>

        {/* Items */}
        <Section title="Items">
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell align="center">Qty</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(order.items || []).map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>{item.name || "-"}</TableCell>
                    <TableCell>{item.description || "-"}</TableCell>
                    <TableCell align="center">{item.quantity || 1}</TableCell>
                    <TableCell align="right">
                      ${(item.unitPrice || 0).toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      ${(item.totalPrice || 0).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={4} align="right" sx={{ fontWeight: "bold" }}>
                    Total
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    ${(order.total || 0).toFixed(2)} {(order.currency || "usd").toUpperCase()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Section>

        {/* Status History */}
        <Section title="Status History">
          {(order.statusHistory || []).length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No status history available.
            </Typography>
          ) : (
            <Box>
              {[...(order.statusHistory || [])].reverse().map((entry, i) => (
                <Box
                  key={i}
                  sx={{
                    display: "flex",
                    gap: 2,
                    alignItems: "center",
                    mb: 1,
                    pb: 1,
                    borderBottom: i < (order.statusHistory || []).length - 1 ? "1px solid #eee" : "none",
                  }}
                >
                  <Chip
                    label={entry.status}
                    size="small"
                    sx={{ textTransform: "capitalize", minWidth: 80 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(entry.timestamp)}
                  </Typography>
                  {entry.note && (
                    <Typography variant="body2">{entry.note}</Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Section>

        {/* Email Correspondence */}
        <AdminEmailCompose
          recipientEmail={order.customerEmail}
          recipientName={order.customerName}
          collectionName="store_orders"
          documentId={order.id}
          sentEmails={order.sent_emails || []}
          accessToken={accessToken}
          orgId={orgId}
          onEmailSent={onRefresh}
        />

        {/* Metadata */}
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          <Typography variant="body2" color="text.secondary">
            Created: {formatDate(order.timestamp)}
          </Typography>
          {order.updatedAt && (
            <Typography variant="body2" color="text.secondary">
              Last Updated: {formatDate(order.updatedAt)}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StoreOrderDetailDialog;
