import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Email as EmailIcon,
  Group as GroupIcon,
  Campaign as CampaignIcon,
} from "@mui/icons-material";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import axios from "axios";
import { useEnv } from "../../context/env.context";
import BatchEmailDialog from "./BatchEmailDialog";
import BroadcastComposer from "./broadcast/BroadcastComposer";
import BroadcastStatusPanel from "./broadcast/BroadcastStatusPanel";
import ContactManagerPanel from "./broadcast/ContactManagerPanel";
import * as ga from "../../lib/ga";
import {
  parseEmailsFromText,
  normalizeSlackLookupToken,
  parseSlackLookupInput,
  parseCsvFile,
} from "../../lib/emailParsing";

// active_days sent to /api/slack/admin/users/active. "Inactive" = no Slack
// profile-record update in this window; deleted/disabled/bot accounts are
// always excluded server-side regardless.
const ACTIVE_DAYS_DEFAULT = 365;
const ACTIVE_DAYS_ALL = 10000;

const EmailCommunication = ({ accessToken, orgId, onSnack }) => {
  const { apiServerUrl } = useEnv();

  // "personalized" = per-recipient sends with [PLACEHOLDER] support;
  // "broadcast" = one Resend campaign to a synced segment.
  const [mode, setMode] = useState("personalized");
  const [broadcastRefreshToken, setBroadcastRefreshToken] = useState(0);

  const [slackUsers, setSlackUsers] = useState([]);
  const [loadingSlackUsers, setLoadingSlackUsers] = useState(true);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [batchEmailDialog, setBatchEmailDialog] = useState(false);
  const [emailResults, setEmailResults] = useState(null);

  // Additional recipients state
  const [additionalEmails, setAdditionalEmails] = useState([]);
  const [emailInput, setEmailInput] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [processingEmails, setProcessingEmails] = useState(false);

  // Selection state
  const [selectedSlackUsers, setSelectedSlackUsers] = useState(new Set());
  const [slackSearchFilter, setSlackSearchFilter] = useState("");
  const [showSlackBrowser, setShowSlackBrowser] = useState(false);
  const [slackPasteInput, setSlackPasteInput] = useState("");
  const [slackPasteFeedback, setSlackPasteFeedback] = useState(null);

  const fetchActiveSlackUsers = useCallback(async () => {
    if (!apiServerUrl || !accessToken) return;

    const activeDays = includeInactive ? ACTIVE_DAYS_ALL : ACTIVE_DAYS_DEFAULT;

    try {
      setLoadingSlackUsers(true);
      const response = await axios.get(
        `${apiServerUrl}/api/slack/admin/users/active?active_days=${activeDays}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-Org-Id": orgId,
          },
        },
      );

      if (response.data && response.data.users) {
        const activeUsers = response.data.users.map((user) => ({
          id: user.id,
          name: user.name,
          real_name: user.real_name,
          email: user.email,
          tz: user.tz,
          isSelected: false, // Start with no one selected
        }));
        setSlackUsers(activeUsers);
        // Keep selections only for users still visible under the new filter.
        setSelectedSlackUsers((prev) => {
          if (prev.size === 0) return prev;
          const visible = new Set(activeUsers.map((u) => u.id));
          const kept = new Set([...prev].filter((id) => visible.has(id)));
          if (kept.size < prev.size) {
            onSnack?.(
              `${prev.size - kept.size} selected user(s) are hidden by the activity filter and were removed from the selection`,
              "info",
            );
          }
          return kept.size === prev.size ? prev : kept;
        });
        onSnack?.(`Loaded ${activeUsers.length} Slack users`, "success");
      } else {
        onSnack?.("Failed to fetch Slack users", "error");
      }
    } catch (error) {
      console.error("Error fetching active Slack users:", error);
      onSnack?.("Failed to fetch active Slack users", "error");
    } finally {
      setLoadingSlackUsers(false);
    }
  }, [apiServerUrl, accessToken, orgId, includeInactive, onSnack]);

  // Fetch on mount and whenever the inactive toggle flips. Broadcast mode
  // builds its lists server-side, so skip the Slack crawl there.
  useEffect(() => {
    if (mode !== "personalized") return;
    fetchActiveSlackUsers();
  }, [fetchActiveSlackUsers, mode]);

  const handleToggleIncludeInactive = (event) => {
    setIncludeInactive(event.target.checked);
    ga.trackStructuredEvent(
      ga.EventCategory.ADMIN,
      "admin_email_inactive_toggle",
      event.target.checked ? "include" : "exclude",
    );
  };

  const handleEmailComplete = (summary) => {
    setEmailResults(summary);
    ga.trackStructuredEvent(
      ga.EventCategory.ADMIN,
      "admin_email_batch_sent",
      "community",
      summary.successful,
    );
    onSnack?.(
      `Email batch complete: ${summary.successful}/${summary.total} successful`,
      summary.successful === summary.total ? "success" : "warning",
    );
  };

  // Handle email input processing
  const handleAddEmails = async () => {
    if (!emailInput.trim() && !csvFile) return;

    setProcessingEmails(true);

    try {
      let newEmails = [];

      if (emailInput.trim()) {
        newEmails = parseEmailsFromText(emailInput);
      }

      if (csvFile) {
        const csvEmails = await parseCsvFile(csvFile);
        newEmails = [...new Set([...newEmails, ...csvEmails])];
      }

      if (newEmails.length === 0) {
        onSnack?.("No valid emails found", "warning");
        return;
      }

      // Convert to user objects
      const emailUsers = newEmails.map((email, index) => ({
        id: `custom_${Date.now()}_${index}`,
        name: email.split("@")[0], // Use email prefix as name
        real_name: email.split("@")[0],
        email: email,
        isSelected: true,
        source: "custom",
      }));

      const existingEmails = new Set([
        ...slackUsers.map((u) => u.email),
        ...additionalEmails.map((u) => u.email),
      ]);
      const uniqueNewEmails = emailUsers.filter(
        (user) => !existingEmails.has(user.email),
      );

      setAdditionalEmails((prev) => [...prev, ...uniqueNewEmails]);
      setEmailInput("");
      setCsvFile(null);

      onSnack?.(
        `Added ${uniqueNewEmails.length} new emails (${newEmails.length - uniqueNewEmails.length} duplicates skipped)`,
        "success",
      );
    } catch (error) {
      console.error("Error processing emails:", error);
      onSnack?.("Error processing emails: " + error.message, "error");
    } finally {
      setProcessingEmails(false);
    }
  };

  // Remove custom email
  const handleRemoveCustomEmail = (emailToRemove) => {
    setAdditionalEmails((prev) =>
      prev.filter((user) => user.email !== emailToRemove),
    );
  };

  // Clear all custom emails
  const handleClearCustomEmails = () => {
    setAdditionalEmails([]);
    setEmailInput("");
    setCsvFile(null);
  };

  // Selection management functions
  const toggleSlackUserSelection = (userId) => {
    setSelectedSlackUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const selectAllSlackUsers = () => {
    const filteredUsers = getFilteredSlackUsers();
    setSelectedSlackUsers(new Set(filteredUsers.map((u) => u.id)));
  };

  const deselectAllSlackUsers = () => {
    setSelectedSlackUsers(new Set());
  };

  const getFilteredSlackUsers = () => {
    if (!slackSearchFilter.trim()) return slackUsers.filter((u) => u.email);

    const searchTerm = slackSearchFilter.toLowerCase();
    return slackUsers.filter(
      (user) =>
        user.email &&
        (user.name?.toLowerCase().includes(searchTerm) ||
          user.real_name?.toLowerCase().includes(searchTerm) ||
          user.email?.toLowerCase().includes(searchTerm)),
    );
  };

  const handlePasteSelectSlackUsers = () => {
    const rawTokens = parseSlackLookupInput(slackPasteInput);

    if (rawTokens.length === 0) {
      onSnack?.(
        "Paste at least one Slack email, @handle, real name, or Slack ID",
        "warning",
      );
      return;
    }

    const lookup = new Map();

    slackUsers
      .filter((user) => user.email)
      .forEach((user) => {
        const keys = [user.id, user.name, user.real_name, user.email]
          .map(normalizeSlackLookupToken)
          .filter(Boolean);

        [...new Set(keys)].forEach((key) => {
          if (!lookup.has(key)) {
            lookup.set(key, []);
          }

          const matches = lookup.get(key);
          if (!matches.find((match) => match.id === user.id)) {
            matches.push(user);
          }
        });
      });

    const matchedIds = new Set();
    const unmatchedTokens = [];
    const ambiguousTokens = [];
    let alreadySelectedCount = 0;

    rawTokens.forEach((token) => {
      const normalizedToken = normalizeSlackLookupToken(token);
      if (!normalizedToken) {
        return;
      }

      const matches = lookup.get(normalizedToken) || [];

      if (matches.length === 0) {
        unmatchedTokens.push(token);
        return;
      }

      if (matches.length > 1) {
        ambiguousTokens.push(token);
        return;
      }

      const matchedUser = matches[0];
      if (
        selectedSlackUsers.has(matchedUser.id) ||
        matchedIds.has(matchedUser.id)
      ) {
        alreadySelectedCount += 1;
      }

      matchedIds.add(matchedUser.id);
    });

    if (matchedIds.size > 0) {
      setSelectedSlackUsers((prev) => new Set([...prev, ...matchedIds]));
    }

    const remainingTokens = [...ambiguousTokens, ...unmatchedTokens];
    setSlackPasteInput(remainingTokens.join("\n"));
    setSlackPasteFeedback({
      requestedCount: rawTokens.length,
      matchedCount: matchedIds.size,
      alreadySelectedCount,
      unmatchedTokens,
      ambiguousTokens,
    });

    if (matchedIds.size === 0) {
      onSnack?.("No Slack users matched the pasted list", "warning");
      return;
    }

    const messageParts = [
      `Matched ${matchedIds.size} Slack user${matchedIds.size === 1 ? "" : "s"}`,
    ];

    if (alreadySelectedCount > 0) {
      messageParts.push(`${alreadySelectedCount} already selected`);
    }
    if (ambiguousTokens.length > 0) {
      messageParts.push(`${ambiguousTokens.length} ambiguous`);
    }
    if (unmatchedTokens.length > 0) {
      messageParts.push(`${unmatchedTokens.length} not found`);
    }

    onSnack?.(
      messageParts.join(" · "),
      unmatchedTokens.length > 0 || ambiguousTokens.length > 0
        ? "warning"
        : "success",
    );
  };

  const getSelectedUsers = () => {
    const selectedSlack = slackUsers
      .filter((user) => selectedSlackUsers.has(user.id) && user.email)
      .map((user) => ({
        ...user,
        isSelected: true, // Mark as selected for BatchEmailDialog
        // Slack IDs are not volunteer doc ids — this routes sends down the
        // email-only path in batchEmailService instead of /api/admin/{id}/message.
        source: "slack",
      }));
    return [...selectedSlack, ...additionalEmails];
  };

  const getSelectedUsersCount = () => {
    return selectedSlackUsers.size + additionalEmails.length;
  };

  const inactiveToggle = (
    <Tooltip title="Inactive = no Slack profile update in the last year. Disabled and deleted accounts are always excluded.">
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={includeInactive}
            onChange={handleToggleIncludeInactive}
            disabled={loadingSlackUsers}
          />
        }
        label="Include inactive accounts"
      />
    </Tooltip>
  );

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(e, next) => {
            if (next) setMode(next);
          }}
          size="small"
          color="primary"
        >
          <ToggleButton value="personalized">
            <EmailIcon sx={{ mr: 1 }} fontSize="small" />
            Personalized / small batch
          </ToggleButton>
          <ToggleButton value="broadcast">
            <CampaignIcon sx={{ mr: 1 }} fontSize="small" />
            Broadcast via Resend
          </ToggleButton>
        </ToggleButtonGroup>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 1 }}
        >
          {mode === "personalized"
            ? "One email per recipient — supports [PLACEHOLDER] templates, QR codes, and per-volunteer send tracking. Best for targeted sends."
            : "One campaign to a stored Resend contact list — automatic unsubscribe handling, unlimited sends within your contact tier. Best for newsletters and mass announcements."}
        </Typography>
      </Paper>

      {mode === "broadcast" && (
        <>
          <BroadcastComposer
            apiServerUrl={apiServerUrl}
            accessToken={accessToken}
            orgId={orgId}
            onSnack={onSnack}
            onBroadcastSent={() => setBroadcastRefreshToken((t) => t + 1)}
          />
          <BroadcastStatusPanel
            apiServerUrl={apiServerUrl}
            accessToken={accessToken}
            orgId={orgId}
            onSnack={onSnack}
            refreshToken={broadcastRefreshToken}
          />
          <ContactManagerPanel
            apiServerUrl={apiServerUrl}
            accessToken={accessToken}
            orgId={orgId}
            onSnack={onSnack}
          />
        </>
      )}

      {mode === "personalized" && (
        <>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Typography variant="h6">
                <GroupIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                Email Communication to Slack Community
              </Typography>
              <Box
                sx={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}
              >
                {inactiveToggle}
                <Button
                  startIcon={<RefreshIcon />}
                  onClick={fetchActiveSlackUsers}
                  disabled={loadingSlackUsers}
                  sx={{ mr: 2 }}
                >
                  Refresh Users
                </Button>
                <Button
                  variant="contained"
                  startIcon={<EmailIcon />}
                  onClick={() => setBatchEmailDialog(true)}
                  disabled={loadingSlackUsers || slackUsers.length === 0}
                >
                  Send Batch Email
                </Button>
              </Box>
            </Box>

            {loadingSlackUsers ? (
              <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 2 }}
                >
                  {includeInactive
                    ? `Showing all accounts (${slackUsers.length})`
                    : `Showing users active in the last year (${slackUsers.length})`}
                </Typography>

                {/* Selection Summary */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    📧 Selected Recipients ({getSelectedUsersCount()})
                  </Typography>

                  {getSelectedUsersCount() === 0 ? (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>No recipients selected.</strong> Choose from
                        Slack community members or add custom email addresses to
                        get started.
                      </Typography>
                    </Alert>
                  ) : (
                    <Box
                      sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}
                    >
                      {selectedSlackUsers.size > 0 && (
                        <Chip
                          label={`${selectedSlackUsers.size} from Slack`}
                          color="primary"
                          icon={<GroupIcon />}
                        />
                      )}
                      {additionalEmails.length > 0 && (
                        <Chip
                          label={`${additionalEmails.length} custom emails`}
                          color="success"
                          icon={<EmailIcon />}
                        />
                      )}
                      <Chip
                        label={`${getSelectedUsersCount()} total recipients`}
                        color="info"
                        variant="outlined"
                        icon={<EmailIcon />}
                      />
                    </Box>
                  )}
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
                  <Button
                    variant="outlined"
                    startIcon={<GroupIcon />}
                    onClick={() => setShowSlackBrowser(true)}
                    disabled={loadingSlackUsers || slackUsers.length === 0}
                  >
                    Browse Slack Users (
                    {slackUsers.filter((u) => u.email).length} available)
                  </Button>

                  {getSelectedUsersCount() > 0 && (
                    <Button
                      variant="contained"
                      startIcon={<EmailIcon />}
                      onClick={() => setBatchEmailDialog(true)}
                      color="primary"
                    >
                      Send Email to {getSelectedUsersCount()} Recipients
                    </Button>
                  )}

                  {(selectedSlackUsers.size > 0 ||
                    additionalEmails.length > 0) && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => {
                        setSelectedSlackUsers(new Set());
                        setAdditionalEmails([]);
                      }}
                    >
                      Clear All Selections
                    </Button>
                  )}
                </Box>

                {slackUsers.length === 0 && (
                  <Alert severity="warning">
                    No active Slack users found. Try refreshing, including
                    inactive accounts, or check your Slack integration.
                  </Alert>
                )}

                {emailResults && (
                  <Alert
                    severity={
                      emailResults.successful === emailResults.total
                        ? "success"
                        : "warning"
                    }
                    sx={{ mt: 2 }}
                  >
                    <Typography variant="body2">
                      Last email batch: {emailResults.successful}/
                      {emailResults.total} successful
                      {emailResults.failed > 0 &&
                        ` (${emailResults.failed} failed)`}
                    </Typography>
                  </Alert>
                )}
              </>
            )}
          </Paper>

          {/* Additional Recipients Section */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              <EmailIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Additional Recipients
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Add custom email addresses beyond the Slack community. You can
              copy/paste emails or upload a CSV file.
            </Typography>

            <Grid container spacing={2}>
              {/* Email Input Section */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Copy/Paste Emails
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Paste emails here... (comma, semicolon, space, or newline separated)
Example:
john@example.com, jane@test.com
user@domain.org; admin@site.net"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  variant="outlined"
                  disabled={processingEmails}
                  sx={{ mb: 2 }}
                />
              </Grid>

              {/* CSV Upload Section */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Upload CSV File
                </Typography>
                <Box
                  sx={{
                    border: "2px dashed",
                    borderColor: csvFile ? "success.main" : "grey.300",
                    borderRadius: 1,
                    p: 2,
                    textAlign: "center",
                    bgcolor: csvFile ? "success.50" : "grey.50",
                    mb: 2,
                    height: 120,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <input
                    accept=".csv,.txt"
                    style={{ display: "none" }}
                    id="csv-upload"
                    type="file"
                    onChange={(e) => setCsvFile(e.target.files[0])}
                    disabled={processingEmails}
                  />
                  <label htmlFor="csv-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      disabled={processingEmails}
                      sx={{ mb: 1 }}
                    >
                      Choose CSV File
                    </Button>
                  </label>
                  {csvFile ? (
                    <Typography variant="body2" color="success.main">
                      ✓ {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)
                    </Typography>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      CSV with emails in any column
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>

            {/* Action Buttons */}
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <Button
                variant="contained"
                onClick={handleAddEmails}
                disabled={processingEmails || (!emailInput.trim() && !csvFile)}
                startIcon={
                  processingEmails ? (
                    <CircularProgress size={16} />
                  ) : (
                    <EmailIcon />
                  )
                }
              >
                {processingEmails ? "Processing..." : "Add Emails"}
              </Button>
              {additionalEmails.length > 0 && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleClearCustomEmails}
                  disabled={processingEmails}
                >
                  Clear All ({additionalEmails.length})
                </Button>
              )}
            </Box>

            {/* Custom Emails Display */}
            {additionalEmails.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Custom Recipients ({additionalEmails.length}):
                </Typography>
                <Box sx={{ maxHeight: "200px", overflow: "auto" }}>
                  <Grid container spacing={1}>
                    {additionalEmails.map((user) => (
                      <Grid key={user.id}>
                        <Chip
                          label={user.email}
                          size="small"
                          onDelete={() => handleRemoveCustomEmail(user.email)}
                          color="secondary"
                          variant="outlined"
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </>
            )}
          </Paper>

          {/* Slack User Browser Dialog */}
          <Dialog
            open={showSlackBrowser}
            onClose={() => setShowSlackBrowser(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { height: "80vh" } }}
          >
            <DialogTitle>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                <Typography variant="h6">
                  <GroupIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                  Browse Slack Users
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {inactiveToggle}
                  <Typography variant="subtitle2" color="text.secondary">
                    {selectedSlackUsers.size} of{" "}
                    {getFilteredSlackUsers().length} selected
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>

            <DialogContent>
              {/* Search and Bulk Actions */}
              <Box
                sx={{
                  mb: 2,
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <TextField
                  placeholder="Search by name or email..."
                  value={slackSearchFilter}
                  onChange={(e) => setSlackSearchFilter(e.target.value)}
                  size="small"
                  sx={{ flexGrow: 1, minWidth: 250 }}
                  InputProps={{
                    startAdornment: <Box sx={{ mr: 1 }}>🔍</Box>,
                  }}
                />
                <Button
                  size="small"
                  onClick={selectAllSlackUsers}
                  disabled={getFilteredSlackUsers().length === 0}
                >
                  Select All ({getFilteredSlackUsers().length})
                </Button>
                <Button
                  size="small"
                  onClick={deselectAllSlackUsers}
                  disabled={selectedSlackUsers.size === 0}
                  color="error"
                >
                  Clear All
                </Button>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Paste Slack users
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Paste one item per line or comma-separated. Match by email,
                  Slack @handle, real name, or Slack user ID.
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                  }}
                >
                  <TextField
                    multiline
                    minRows={3}
                    maxRows={6}
                    placeholder={
                      "jane@example.com\n@johnsmith\nU123ABC45\nJane Doe"
                    }
                    value={slackPasteInput}
                    onChange={(e) => setSlackPasteInput(e.target.value)}
                    sx={{ flexGrow: 1, minWidth: 280 }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      flexDirection: { xs: "row", sm: "column" },
                    }}
                  >
                    <Button
                      variant="contained"
                      onClick={handlePasteSelectSlackUsers}
                      disabled={!slackPasteInput.trim()}
                    >
                      Select Matches
                    </Button>
                    <Button
                      variant="text"
                      color="inherit"
                      onClick={() => {
                        setSlackPasteInput("");
                        setSlackPasteFeedback(null);
                      }}
                      disabled={!slackPasteInput && !slackPasteFeedback}
                    >
                      Clear Paste
                    </Button>
                  </Box>
                </Box>

                {slackPasteFeedback && (
                  <Alert
                    severity={
                      slackPasteFeedback.unmatchedTokens.length > 0 ||
                      slackPasteFeedback.ambiguousTokens.length > 0
                        ? "warning"
                        : "success"
                    }
                    sx={{ mt: 1.5 }}
                  >
                    <Typography variant="body2">
                      Matched <strong>{slackPasteFeedback.matchedCount}</strong>{" "}
                      of <strong>{slackPasteFeedback.requestedCount}</strong>{" "}
                      pasted entries.
                      {slackPasteFeedback.alreadySelectedCount > 0 && (
                        <>
                          {" "}
                          {slackPasteFeedback.alreadySelectedCount} were already
                          selected.
                        </>
                      )}
                    </Typography>
                    {slackPasteFeedback.ambiguousTokens.length > 0 && (
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ mt: 0.5 }}
                      >
                        Ambiguous:{" "}
                        {slackPasteFeedback.ambiguousTokens
                          .slice(0, 5)
                          .join(", ")}
                        {slackPasteFeedback.ambiguousTokens.length > 5
                          ? "…"
                          : ""}
                      </Typography>
                    )}
                    {slackPasteFeedback.unmatchedTokens.length > 0 && (
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ mt: 0.5 }}
                      >
                        Not found:{" "}
                        {slackPasteFeedback.unmatchedTokens
                          .slice(0, 5)
                          .join(", ")}
                        {slackPasteFeedback.unmatchedTokens.length > 5
                          ? "…"
                          : ""}
                      </Typography>
                    )}
                  </Alert>
                )}
              </Box>

              {/* Users List */}
              <Box
                sx={{
                  maxHeight: "400px",
                  overflow: "auto",
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                {getFilteredSlackUsers().length === 0 ? (
                  <Box sx={{ p: 3, textAlign: "center" }}>
                    <Typography color="text.secondary">
                      {slackSearchFilter.trim()
                        ? "No users match your search."
                        : "No users with email addresses found."}
                    </Typography>
                  </Box>
                ) : (
                  <List dense>
                    {getFilteredSlackUsers().map((user) => (
                      <ListItem key={user.id} divider>
                        <ListItemIcon>
                          <FormControlLabel
                            control={
                              <Switch
                                size="small"
                                checked={selectedSlackUsers.has(user.id)}
                                onChange={() =>
                                  toggleSlackUserSelection(user.id)
                                }
                              />
                            }
                            label=""
                            sx={{ m: 0 }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={user.real_name || user.name}
                          secondary={user.email}
                          primaryTypographyProps={{
                            fontWeight: selectedSlackUsers.has(user.id)
                              ? "bold"
                              : "normal",
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>

              {/* Selection Summary */}
              {selectedSlackUsers.size > 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    ✓ <strong>{selectedSlackUsers.size}</strong> Slack users
                    selected for email delivery
                  </Typography>
                </Alert>
              )}
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setShowSlackBrowser(false)}>Cancel</Button>
              <Button
                onClick={() => setShowSlackBrowser(false)}
                variant="contained"
                disabled={selectedSlackUsers.size === 0}
              >
                Apply Selection ({selectedSlackUsers.size} users)
              </Button>
            </DialogActions>
          </Dialog>

          {/* Batch Email Dialog */}
          <BatchEmailDialog
            open={batchEmailDialog}
            onClose={() => setBatchEmailDialog(false)}
            volunteers={getSelectedUsers()}
            volunteerType="community members"
            accessToken={accessToken}
            orgId={orgId}
            eventId={null}
            onComplete={handleEmailComplete}
            isSelectedUsers={true}
            onSnack={onSnack}
          />
        </>
      )}
    </Box>
  );
};

export default EmailCommunication;
