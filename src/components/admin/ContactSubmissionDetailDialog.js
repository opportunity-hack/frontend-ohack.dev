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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AdminEmailCompose from "./AdminEmailCompose";

const statusOptions = [
  { value: "new", label: "New", color: "warning" },
  { value: "responded", label: "Responded", color: "success" },
];

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
  <Box sx={{ mb: 1.5 }}>
    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
      {label}
    </Typography>
    <Typography variant="body1">{value || "-"}</Typography>
  </Box>
);

const ContactSubmissionDetailDialog = ({
  open,
  onClose,
  submission,
  onSave,
  accessToken,
  orgId,
  onRefresh,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [status, setStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    if (submission) {
      setStatus(submission.status || "new");
      setAdminNotes(submission.adminNotes || "");
    }
  }, [submission]);

  if (!submission) return null;

  const handleSave = () => {
    onSave({
      id: submission.id,
      status,
      adminNotes,
    });
  };

  const fullName = `${submission.firstName || ""} ${submission.lastName || ""}`.trim();

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
            {fullName || "Contact Submission"}
          </Typography>
          <Chip
            label={submission.status || "new"}
            color={statusOptions.find((s) => s.value === (submission.status || "new"))?.color || "default"}
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
            <Grid item xs={12} sm={4}>
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
            <Grid item xs={12} sm={8}>
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

        {/* Contact Information */}
        <Section title="Contact Information">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Field label="Name" value={fullName} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Field label="Email" value={submission.email} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Field label="Organization" value={submission.organization} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Field
                label="Inquiry Type"
                value={
                  <Chip
                    label={submission.inquiryType || "-"}
                    size="small"
                    variant="outlined"
                    sx={{ textTransform: "capitalize" }}
                  />
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Field
                label="Wants Updates"
                value={submission.receiveUpdates ? "Yes" : "No"}
              />
            </Grid>
          </Grid>
        </Section>

        {/* Message */}
        <Section title="Message">
          <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
            {submission.message || "-"}
          </Typography>
        </Section>

        {/* Email Correspondence */}
        <AdminEmailCompose
          recipientEmail={submission.email}
          recipientName={fullName}
          collectionName="contact_submissions"
          documentId={submission.id}
          sentEmails={submission.sent_emails || []}
          accessToken={accessToken}
          orgId={orgId}
          onEmailSent={onRefresh}
        />

        {/* Metadata */}
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          <Typography variant="body2" color="text.secondary">
            Submitted: {formatDate(submission.timestamp)}
          </Typography>
          {submission.updatedAt && (
            <Typography variant="body2" color="text.secondary">
              Last Updated: {formatDate(submission.updatedAt)}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            ID: {submission.id}
          </Typography>
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

export default ContactSubmissionDetailDialog;
