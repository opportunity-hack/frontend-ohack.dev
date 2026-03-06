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
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import AdminEmailCompose from "./AdminEmailCompose";

const statusOptions = [
  { value: "pending", label: "Pending", color: "warning" },
  { value: "approved", label: "Approved", color: "success" },
  { value: "in-progress", label: "In Progress", color: "info" },
  { value: "completed", label: "Completed", color: "success" },
  { value: "rejected", label: "Rejected", color: "error" },
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
    });
  } catch {
    return dateStr;
  }
};

const getResponsibilityLabel = (value) => {
  switch (value) {
    case "requestor":
      return "Their Organization";
    case "ohack":
      return "Opportunity Hack";
    case "shared":
      return "Shared";
    default:
      return value || "-";
  }
};

const responsibilityLabels = {
  venue: "Venue & Equipment",
  food: "Food & Refreshments",
  prizes: "Prizes & Swag",
  judges: "Judges",
  mentors: "Technical Mentors",
  marketing: "Marketing & Communications",
  nonprofitRecruitment: "Nonprofit Recruitment",
  participantRecruitment: "Participant Recruitment",
  postEventSupport: "Post-Event Support",
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

const HackathonRequestDetailDialog = ({ open, onClose, request, onSave, accessToken, orgId, onRefresh }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [status, setStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    if (request) {
      setStatus(request.status || "pending");
      setAdminNotes(request.adminNotes || "");
    }
  }, [request]);

  if (!request) return null;

  const handleSave = () => {
    onSave({
      id: request.id,
      status,
      adminNotes,
    });
  };

  const participantTypes = Array.isArray(request.participantType)
    ? request.participantType.join(", ").replace(/-/g, " ")
    : request.participantType || "-";

  const nonprofitSources = Array.isArray(request.nonprofitSource)
    ? request.nonprofitSource.join(", ").replace(/-/g, " ")
    : request.nonprofitSource || "-";

  const editUrl = request.id ? `/hack/request/${request.id}` : null;

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
            {request.companyName || "Hackathon Request"}
          </Typography>
          <Chip
            label={(request.status || "pending").replace("-", " ")}
            color={statusOptions.find((s) => s.value === (request.status || "pending"))?.color || "default"}
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
          {editUrl && (
            <Box sx={{ mt: 2 }}>
              <Button
                size="small"
                variant="text"
                endIcon={<OpenInNewIcon />}
                href={editUrl}
                target="_blank"
              >
                Open Edit Form
              </Button>
            </Box>
          )}
        </Paper>

        {/* Contact Information */}
        <Section title="Contact Information">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Field label="Organization" value={request.companyName} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Field
                label="Organization Type"
                value={
                  <Chip
                    label={request.organizationType || "-"}
                    size="small"
                    variant="outlined"
                    sx={{ textTransform: "capitalize" }}
                  />
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Field label="Contact Name" value={request.contactName} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Field label="Contact Email" value={request.contactEmail} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Field label="Contact Phone" value={request.contactPhone} />
            </Grid>
          </Grid>
        </Section>

        {/* Event Details */}
        <Section title="Event Details">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Field label="Expected Participants" value={request.employeeCount ? `~${request.employeeCount}` : "-"} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Field
                label="Event Format"
                value={
                  <Chip
                    label={request.eventFormat || "-"}
                    size="small"
                    variant="outlined"
                    sx={{ textTransform: "capitalize" }}
                  />
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Field label="Location" value={request.location} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Field label="Participant Types" value={participantTypes} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Field
                label="Theme"
                value={(request.hackathonTheme || "").replace(/-/g, " ") + (request.customTheme ? ` - ${request.customTheme}` : "")}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Field label="Hackathon Date" value={formatDate(request.expectedHackathonDate)} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Field label="Preferred Call Date" value={formatDate(request.preferredDate)} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Field label="Alternate Call Date" value={formatDate(request.alternateDate)} />
            </Grid>
          </Grid>
        </Section>

        {/* Nonprofit Engagement */}
        <Section title="Nonprofit Engagement">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Field
                label="Has Nonprofit List"
                value={request.hasNonprofitList === "yes" ? "Yes" : request.hasNonprofitList === "partial" ? "Partial" : request.hasNonprofitList === "no" ? "No" : "-"}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Field
                label="Worked with Nonprofits Before"
                value={request.hasWorkedWithNonprofitsBefore === "yes" ? "Yes" : request.hasWorkedWithNonprofitsBefore === "no" ? "No" : "-"}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Field
                label="Preferred Location"
                value={(request.preferredNonprofitLocation || "").replace(/-/g, " ") + (request.specificRegion ? ` - ${request.specificRegion}` : "")}
              />
            </Grid>
            {request.nonprofitDetails && (
              <Grid item xs={12}>
                <Field label="Nonprofit Details" value={request.nonprofitDetails} />
              </Grid>
            )}
            <Grid item xs={12}>
              <Field label="Nonprofit Sources" value={nonprofitSources} />
            </Grid>
          </Grid>
        </Section>

        {/* Responsibilities */}
        {request.responsibilities && (
          <Section title="Division of Responsibilities">
            <Grid container spacing={1}>
              {Object.entries(request.responsibilities).map(([key, value]) => (
                <Grid item xs={12} sm={6} key={key}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      {responsibilityLabels[key] || key}
                    </Typography>
                    <Chip label={getResponsibilityLabel(value)} size="small" variant="outlined" />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Section>
        )}

        {/* Budget */}
        <Section title="Budget & Support">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Field label="Budget" value={request.budget ? `$${Number(request.budget).toLocaleString()}` : "-"} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Field label="Donation Percentage" value={request.donationPercentage != null ? `${request.donationPercentage}%` : "-"} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Field
                label="Estimated Donation"
                value={
                  request.budget && request.donationPercentage != null
                    ? `$${Math.round(request.budget * (request.donationPercentage / 100)).toLocaleString()}`
                    : "-"
                }
              />
            </Grid>
          </Grid>
        </Section>

        {/* Additional Info */}
        {request.additionalInfo && (
          <Section title="Additional Information">
            <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
              {request.additionalInfo}
            </Typography>
          </Section>
        )}

        {/* Email Correspondence */}
        <AdminEmailCompose
          recipientEmail={request.contactEmail}
          recipientName={request.contactName}
          collectionName="hackathon_requests"
          documentId={request.id}
          sentEmails={request.sent_emails || []}
          accessToken={accessToken}
          orgId={orgId}
          onEmailSent={onRefresh}
        />

        {/* Metadata */}
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          <Typography variant="body2" color="text.secondary">
            Submitted: {formatDate(request.created)}
          </Typography>
          {request.updated && (
            <Typography variant="body2" color="text.secondary">
              Last Updated: {formatDate(request.updated)}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            ID: {request.id}
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

export default HackathonRequestDetailDialog;
