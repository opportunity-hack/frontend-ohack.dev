import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  Chip,
  LinearProgress,
  CircularProgress,
  IconButton,
  Collapse,
  Card,
  CardContent,
  Grid,
  Step,
  Stepper,
  StepLabel,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  ContentCopy as ContentCopyIcon,
  Error as ErrorIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  Replay as ReplayIcon,
} from "@mui/icons-material";
import { FaPaperPlane, FaEdit } from "react-icons/fa";
import { styled } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import BatchEmailService from "../../lib/batchEmailService";
import {
  filterTemplatesByType,
  getTemplateById,
  prepareTemplateMessage,
  detectPlaceholders,
  PLACEHOLDER_LABELS,
} from "../../lib/messageTemplates";
import useSavedPlaceholders from "../../hooks/use-saved-placeholders";
import useEmailTemplates from "../../hooks/use-email-templates";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    minWidth: "700px",
    maxWidth: "900px",
    maxHeight: "90vh",
  },
}));

const ProgressContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const ResultsList = styled(List)(({ theme }) => ({
  maxHeight: "300px",
  overflow: "auto",
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(1, 0),
}));

const buildResultsState = (emailResults = []) => {
  const summary = emailResults.reduce(
    (acc, result) => {
      acc.total += 1;

      if (result.success) {
        acc.successful += 1;
      } else {
        acc.failed += 1;
        acc.errors.push({
          user:
            result.user?.name ||
            result.user?.email ||
            result.user?.id ||
            "Unknown",
          error: result.error || "Unknown error",
        });
      }

      return acc;
    },
    {
      total: 0,
      successful: 0,
      failed: 0,
      errors: [],
    },
  );

  return {
    results: emailResults,
    summary,
  };
};

const buildFailedRecipientsText = (failedResults = []) =>
  failedResults
    .map((result) => {
      const identifier = result.user?.email || result.user?.id || "No email";
      const name = result.user?.name || identifier;
      const details = result.error || "Unknown error";

      if (result.user?.email) {
        return `${name} <${result.user.email}> - ${details}`;
      }

      return `${name} - ${details}`;
    })
    .join("\n");

const BatchEmailDialog = ({
  open,
  onClose,
  volunteers,
  volunteerType,
  accessToken,
  orgId,
  eventId,
  onComplete,
  isSelectedUsers = true, // true for selected/approved users, false for not-selected/rejected users
  onSnack, // optional page-level snackbar; there is no SnackbarProvider in the app, so notistack calls are silently swallowed without this
}) => {
  const { enqueueSnackbar: notistackEnqueue } = useSnackbar();
  const enqueueSnackbar = React.useCallback(
    (message, options = {}) => {
      if (onSnack) {
        onSnack(message, options.variant || "info");
      } else {
        notistackEnqueue(message, options);
      }
    },
    [onSnack, notistackEnqueue],
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customMessage, setCustomMessage] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [subject, setSubject] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [progress, setProgress] = useState(null);
  const [results, setResults] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [placeholderValues, setPlaceholderValues] = useState({});
  const [detectedPlaceholders, setDetectedPlaceholders] = useState([]);
  const [restoredFromSaved, setRestoredFromSaved] = useState(false);
  const [removedEmails, setRemovedEmails] = useState(new Set());
  const [progressAction, setProgressAction] = useState("Sending");

  const { savedValues, saveValues, clearValues, hasSavedValues } =
    useSavedPlaceholders(eventId, selectedTemplate?.id);

  // Admin-managed templates from the backend (falls back to the hardcoded
  // set while loading / on error). Only fetched once the dialog is open.
  const { templates } = useEmailTemplates({
    accessToken,
    orgId,
    enabled: open,
  });

  // Tracks the last auto-applied denial message so that the async template
  // load doesn't clobber text the admin already started editing.
  const autoAppliedMessageRef = React.useRef(null);

  // Filter eligible users when volunteers change based on context
  const allEligibleUsers = isSelectedUsers
    ? BatchEmailService.filterEligibleUsers(volunteers)
    : BatchEmailService.filterNotSelectedUsers(volunteers);
  const eligibleUsers = allEligibleUsers.filter(
    (u) => !removedEmails.has(u.email),
  );

  // Get the singular form of volunteer type for consistent usage
  const recipientType = BatchEmailService.getRecipientType(volunteerType);

  // Get filtered templates based on volunteer type using shared utility
  const filteredTemplates = filterTemplatesByType(volunteerType, templates);

  useEffect(() => {
    // Reset state when dialog opens/closes
    if (!open) {
      setCurrentStep(0);
      setSelectedTemplate(null);
      setCustomMessage(false);
      setMessageText("");
      setSubject("");
      setIsScheduling(false);
      setProgress(null);
      setResults(null);
      setShowDetails(false);
      setPlaceholderValues({});
      setDetectedPlaceholders([]);
      setRestoredFromSaved(false);
      setRemovedEmails(new Set());
      setProgressAction("Sending");
      autoAppliedMessageRef.current = null;
    } else if (!isSelectedUsers) {
      // Auto-suggest the appropriate denial template for not-selected users
      const templateId =
        volunteerType === "judge" || volunteerType === "judges"
          ? "judge_application_denied"
          : "application_denied";
      // Prefer the admin-managed version; fall back to the hardcoded one
      const denialTemplate =
        getTemplateById(templateId, templates) || getTemplateById(templateId);
      // When the server templates finish loading this effect re-runs — only
      // re-apply if the admin hasn't already modified the message text.
      const untouched =
        autoAppliedMessageRef.current === null ||
        messageText === autoAppliedMessageRef.current;
      if (denialTemplate && untouched) {
        setSelectedTemplate(denialTemplate);
        // Use shared utility to prepare template message with placeholder replacements
        // Note: [VOLUNTEER_ID] and [VOLUNTEER_TYPE] will be replaced per-user when emails are sent
        let message = prepareTemplateMessage(denialTemplate, {
          eventId: eventId,
          volunteerType: recipientType,
        });
        setSubject(denialTemplate.title);
        setDetectedPlaceholders(detectPlaceholders(message));

        // Check for saved placeholder values
        const key =
          eventId && denialTemplate.id
            ? `ohack_placeholders_${eventId}_${denialTemplate.id}`
            : null;
        let restored = null;
        if (key) {
          try {
            const raw = localStorage.getItem(key);
            if (raw) restored = JSON.parse(raw);
          } catch {
            /* ignore */
          }
        }

        if (
          restored &&
          typeof restored === "object" &&
          Object.keys(restored).length > 0
        ) {
          setPlaceholderValues(restored);
          setRestoredFromSaved(true);
          for (const [name, val] of Object.entries(restored)) {
            if (val) {
              message = message.replaceAll(`[${name}]`, val);
            }
          }
        } else {
          setPlaceholderValues({});
          setRestoredFromSaved(false);
        }

        setMessageText(message);
        autoAppliedMessageRef.current = message;
        setCurrentStep(1); // Skip template selection and go to review step
      }
    }
    // messageText intentionally omitted: the untouched-guard reads it via
    // closure and re-running this effect per keystroke would be wasteful.
  }, [open, isSelectedUsers, eventId, volunteerType, recipientType, templates]);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);

    // Use shared utility to prepare template message with placeholder replacements
    // Note: [VOLUNTEER_ID] and [VOLUNTEER_TYPE] will be replaced per-user when emails are sent
    let message = prepareTemplateMessage(template, {
      eventId: eventId,
      volunteerType: recipientType,
    });

    setSubject(template.title);
    setCustomMessage(false);
    const remaining = detectPlaceholders(message);
    setDetectedPlaceholders(remaining);

    // Check for saved placeholder values
    const key =
      eventId && template?.id
        ? `ohack_placeholders_${eventId}_${template.id}`
        : null;
    let restored = null;
    if (key) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) restored = JSON.parse(raw);
      } catch {
        /* ignore */
      }
    }

    if (
      restored &&
      typeof restored === "object" &&
      Object.keys(restored).length > 0
    ) {
      setPlaceholderValues(restored);
      setRestoredFromSaved(true);
      for (const [name, val] of Object.entries(restored)) {
        if (val) {
          message = message.replaceAll(`[${name}]`, val);
        }
      }
    } else {
      setPlaceholderValues({});
      setRestoredFromSaved(false);
    }

    setMessageText(message);
    setCurrentStep(1);
  };

  const handleCustomMessageToggle = () => {
    setCustomMessage(true);
    setSelectedTemplate(null);
    setMessageText("");
    setSubject("Message from Opportunity Hack");
    setDetectedPlaceholders([]);
    setPlaceholderValues({});
    setCurrentStep(1);
  };

  const handleBackToTemplates = () => {
    setCurrentStep(0);
    setSelectedTemplate(null);
    setCustomMessage(false);
    setMessageText("");
    setSubject("");
    setDetectedPlaceholders([]);
    setPlaceholderValues({});
    setRestoredFromSaved(false);
  };

  const handlePlaceholderChange = (placeholderName, value) => {
    const newValues = { ...placeholderValues, [placeholderName]: value };
    setPlaceholderValues(newValues);
    saveValues(newValues);
    setRestoredFromSaved(false);

    // Rebuild message from template with all current placeholder values
    let message = prepareTemplateMessage(selectedTemplate, {
      eventId: eventId,
      volunteerType: recipientType,
    });
    for (const [name, val] of Object.entries(newValues)) {
      if (val) {
        message = message.replaceAll(`[${name}]`, val);
      }
    }
    setMessageText(message);
  };

  const handleSendTestEmail = async () => {
    if (!messageText.trim()) return;

    setTestLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/admin/email/send`,
        {
          email: "questions@ohack.org",
          message: messageText,
          subject: `[TEST] ${subject || "Message from Opportunity Hack"}`,
          recipient_type: recipientType,
          name: "Test Recipient",
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-Org-Id": orgId,
          },
        },
      );

      if (response.data && response.data.success) {
        enqueueSnackbar("Test email sent to questions@ohack.org", {
          variant: "success",
        });
      }
    } catch (error) {
      console.error("Error sending test email:", error);
      enqueueSnackbar(
        error.response?.data?.message || "Failed to send test email",
        { variant: "error" },
      );
    } finally {
      setTestLoading(false);
    }
  };

  const handleSendEmails = async () => {
    const messageError = BatchEmailService.validateMessage(messageText);
    const subjectError = BatchEmailService.validateSubject(subject);

    if (messageError || subjectError) {
      return;
    }

    setIsScheduling(true);
    setCurrentStep(2);
    setResults(null);
    setShowDetails(false);
    setProgressAction("Sending");
    setProgress({ current: 0, total: eligibleUsers.length, percentage: 0 });

    const batchEmailService = new BatchEmailService(
      process.env.NEXT_PUBLIC_API_SERVER_URL,
      accessToken,
      orgId,
    );

    try {
      const { results: emailResults } = await batchEmailService.sendBatchEmails(
        eligibleUsers,
        messageText,
        subject,
        recipientType,
        eventId,
        (progressUpdate) => {
          setProgress(progressUpdate);
        },
      );

      const nextResults = buildResultsState(emailResults);

      setResults(nextResults);

      if (onComplete) {
        onComplete(nextResults.summary);
      }
    } catch (error) {
      console.error("Error during batch email sending:", error);
      const fallbackResults = eligibleUsers.map((user) => ({
        user,
        success: false,
        error: error.message || "Unexpected error while sending batch emails",
      }));

      setResults(buildResultsState(fallbackResults));
    } finally {
      setIsScheduling(false);
    }
  };

  const handleRetryFailed = async () => {
    const previousResults = results?.results || [];
    const previousFailedResults = previousResults.filter(
      (result) => !result.success,
    );

    if (previousFailedResults.length === 0) {
      return;
    }

    const retryUsers = previousFailedResults
      .map((result) => result.user)
      .filter(Boolean);

    if (retryUsers.length === 0) {
      enqueueSnackbar("No failed recipients available to retry", {
        variant: "warning",
      });
      return;
    }

    setIsScheduling(true);
    setResults(null);
    setShowDetails(true);
    setProgressAction("Retrying");
    setProgress({ current: 0, total: retryUsers.length, percentage: 0 });

    const batchEmailService = new BatchEmailService(
      process.env.NEXT_PUBLIC_API_SERVER_URL,
      accessToken,
      orgId,
    );

    try {
      const { results: retryResults } = await batchEmailService.sendBatchEmails(
        retryUsers,
        messageText,
        subject,
        recipientType,
        eventId,
        (progressUpdate) => {
          setProgress(progressUpdate);
        },
      );

      let retryIndex = 0;
      const mergedResults = previousResults.map((result) => {
        if (result.success) {
          return result;
        }

        const replacement = retryResults[retryIndex];
        retryIndex += 1;
        return replacement || result;
      });

      const nextResults = buildResultsState(mergedResults);
      setResults(nextResults);

      if (onComplete) {
        onComplete(nextResults.summary);
      }

      enqueueSnackbar(
        `Retried ${retryUsers.length} failed recipient${retryUsers.length === 1 ? "" : "s"}`,
        { variant: nextResults.summary.failed > 0 ? "warning" : "success" },
      );
    } catch (error) {
      console.error("Error retrying failed batch emails:", error);

      const fallbackRetryResults = retryUsers.map((user) => ({
        user,
        success: false,
        error: error.message || "Unexpected error while retrying failed emails",
      }));

      let retryIndex = 0;
      const mergedResults = previousResults.map((result) => {
        if (result.success) {
          return result;
        }

        const replacement = fallbackRetryResults[retryIndex];
        retryIndex += 1;
        return replacement || result;
      });

      setResults(buildResultsState(mergedResults));
      enqueueSnackbar("Retry failed. See details for the latest error.", {
        variant: "error",
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const handleCopyFailedRecipients = async () => {
    const failedResults = (results?.results || []).filter(
      (result) => !result.success,
    );

    if (failedResults.length === 0) {
      enqueueSnackbar("No failed recipients to copy", { variant: "info" });
      return;
    }

    try {
      await navigator.clipboard.writeText(
        buildFailedRecipientsText(failedResults),
      );
      enqueueSnackbar(
        `Copied ${failedResults.length} failed recipient${failedResults.length === 1 ? "" : "s"} to clipboard`,
        { variant: "success" },
      );
    } catch (error) {
      console.error("Failed to copy failed recipients:", error);
      enqueueSnackbar("Failed to copy failed recipients", { variant: "error" });
    }
  };

  const handleClose = () => {
    if (!isScheduling) {
      onClose();
    }
  };

  const getResultIcon = (success) => {
    return success ? (
      <CheckCircleIcon color="success" />
    ) : (
      <ErrorIcon color="error" />
    );
  };

  const failedResults = (results?.results || []).filter(
    (result) => !result.success,
  );

  const steps = ["Select Template", "Review & Customize", "Send Emails"];

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <EmailIcon color="primary" />
          <Typography variant="h6">
            {isSelectedUsers
              ? `Send Batch Email to Selected ${volunteerType}`
              : `Send Rejection Email to Not Selected ${volunteerType}`}
          </Typography>
        </Box>
        <Stepper activeStep={currentStep} sx={{ mt: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </DialogTitle>

      <DialogContent>
        {/* Eligible Users Summary */}
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Found <strong>{eligibleUsers.length}</strong>{" "}
            {isSelectedUsers ? "selected" : "not selected"}{" "}
            {volunteerType.toLowerCase()}
            with email addresses out of <strong>
              {volunteers.length}
            </strong>{" "}
            total {volunteerType.toLowerCase()}.
          </Typography>
        </Alert>

        {eligibleUsers.length === 0 ? (
          <Alert severity="warning">
            No eligible users found. Users must be{" "}
            {isSelectedUsers ? "selected" : "not selected"} and have email
            addresses to receive emails.
          </Alert>
        ) : (
          <>
            {/* Step 0: Template Selection */}
            {currentStep === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Choose a Message Template for {volunteerType}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Templates filtered for {volunteerType} role only
                </Typography>

                {Object.entries(filteredTemplates).map(
                  ([categoryKey, category]) => (
                    <Box key={categoryKey} sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        gutterBottom
                      >
                        {category.category}
                      </Typography>
                      <Grid container spacing={2}>
                        {category.templates.map((template) => (
                          <Grid size={{ xs: 12, sm: 6 }} key={template.id}>
                            <Card
                              variant="outlined"
                              sx={{
                                cursor: "pointer",
                                transition: "all 0.2s",
                                "&:hover": {
                                  borderColor: "primary.main",
                                  boxShadow: 1,
                                },
                              }}
                              onClick={() => handleTemplateSelect(template)}
                            >
                              <CardContent sx={{ pb: 2 }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mb: 1,
                                  }}
                                >
                                  <Typography variant="h6" component="span">
                                    {template.icon}
                                  </Typography>
                                  <Typography
                                    variant="subtitle2"
                                    fontWeight="bold"
                                  >
                                    {template.title}
                                  </Typography>
                                </Box>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    display: "-webkit-box",
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {template.message}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  ),
                )}

                {Object.keys(filteredTemplates).length === 0 && (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No specific templates available for {volunteerType}.
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      You can still write a custom message.
                    </Typography>
                  </Box>
                )}

                <Box
                  sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: "divider" }}
                >
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleCustomMessageToggle}
                    startIcon={<FaEdit />}
                  >
                    Write Custom Message
                  </Button>
                </Box>
              </Box>
            )}

            {/* Step 1: Review & Customize */}
            {currentStep === 1 && (
              <Box>
                {!isSelectedUsers &&
                  selectedTemplate?.id === "application_denied" && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        💡 We've automatically selected the "Application Not
                        Approved" template for not-selected{" "}
                        {volunteerType.toLowerCase()}. You can customize the
                        message below or choose a different template.
                      </Typography>
                    </Alert>
                  )}

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">
                    {selectedTemplate ? (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <span>{selectedTemplate.icon}</span>
                        {selectedTemplate.title}
                      </Box>
                    ) : (
                      "Custom Message"
                    )}
                  </Typography>
                  <Button
                    size="small"
                    onClick={handleBackToTemplates}
                    startIcon={<ArrowBackIcon />}
                  >
                    Back to Templates
                  </Button>
                </Box>

                <TextField
                  fullWidth
                  label="Email Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  error={!!BatchEmailService.validateSubject(subject)}
                  helperText={
                    BatchEmailService.validateSubject(subject) ||
                    "Email subject line"
                  }
                  sx={{ mb: 2 }}
                />

                {selectedTemplate && detectedPlaceholders.length > 0 && (
                  <Box
                    sx={{
                      mb: 2,
                      p: 2,
                      bgcolor: "action.hover",
                      borderRadius: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography variant="subtitle2">
                          This template requires event-specific details:
                        </Typography>
                        {restoredFromSaved && (
                          <Chip
                            label="Restored from previous session"
                            size="small"
                            color="info"
                            variant="outlined"
                          />
                        )}
                      </Box>
                      {hasSavedValues && (
                        <Button
                          size="small"
                          variant="text"
                          color="secondary"
                          onClick={() => {
                            clearValues();
                            setPlaceholderValues({});
                            setRestoredFromSaved(false);
                            const message = prepareTemplateMessage(
                              selectedTemplate,
                              {
                                eventId: eventId,
                                volunteerType: recipientType,
                              },
                            );
                            setMessageText(message);
                          }}
                        >
                          Clear saved values
                        </Button>
                      )}
                    </Box>
                    <Grid container spacing={2}>
                      {detectedPlaceholders.map((name) => {
                        const info = PLACEHOLDER_LABELS[name] || {
                          label: name
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase()),
                          example: "",
                        };
                        return (
                          <Grid size={{ xs: 12, sm: 6 }} key={name}>
                            <TextField
                              fullWidth
                              size="small"
                              label={info.label}
                              value={placeholderValues[name] || ""}
                              onChange={(e) =>
                                handlePlaceholderChange(name, e.target.value)
                              }
                              helperText={info.example}
                              variant="outlined"
                            />
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                )}

                <TextField
                  fullWidth
                  multiline
                  rows={12}
                  label="Message Content"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  error={!!BatchEmailService.validateMessage(messageText)}
                  helperText={
                    BatchEmailService.validateMessage(messageText) ||
                    `Message will be sent to ${eligibleUsers.length} ${volunteerType.toLowerCase()}`
                  }
                  placeholder="Type your message..."
                  variant="outlined"
                />

                {selectedTemplate && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      💡 Feel free to customize this template before sending.
                      The message above can be edited to fit your specific
                      needs.
                    </Typography>
                  </Alert>
                )}

                {/* Users to be emailed */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mt: 2,
                    mb: 1,
                  }}
                >
                  <Typography variant="subtitle2">
                    Users to be emailed ({eligibleUsers.length} total):
                  </Typography>
                  {removedEmails.size > 0 && (
                    <Button
                      size="small"
                      onClick={() => setRemovedEmails(new Set())}
                    >
                      Restore {removedEmails.size} removed
                    </Button>
                  )}
                </Box>
                <Box sx={{ mb: 2 }}>
                  {eligibleUsers.length <= 20 ? (
                    // Show all users if 20 or fewer
                    <Box sx={{ maxHeight: "150px", overflow: "auto" }}>
                      {eligibleUsers.map((user, index) => (
                        <Chip
                          key={index}
                          label={`${user.name || "Unknown"} (${user.email})`}
                          size="small"
                          sx={{ m: 0.5 }}
                          icon={<PersonIcon />}
                          onDelete={() =>
                            setRemovedEmails(
                              (prev) => new Set([...prev, user.email]),
                            )
                          }
                        />
                      ))}
                    </Box>
                  ) : (
                    // Show preview for large lists
                    <>
                      <Box sx={{ mb: 2 }}>
                        <Alert severity="info">
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            📧 Batch email will be sent to{" "}
                            <strong>{eligibleUsers.length}</strong> users:
                          </Typography>
                          <Typography variant="caption" component="div">
                            •{" "}
                            {
                              eligibleUsers.filter((u) => u.source !== "custom")
                                .length
                            }{" "}
                            from Slack community
                            {eligibleUsers.filter((u) => u.source === "custom")
                              .length > 0 &&
                              ` • ${eligibleUsers.filter((u) => u.source === "custom").length} custom recipients`}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ mt: 0.5, display: "block" }}
                          >
                            Preview of first 10 users shown below (🟢 = custom,
                            ⚪ = Slack):
                          </Typography>
                        </Alert>
                      </Box>
                      <Box sx={{ maxHeight: "120px", overflow: "auto", mb: 2 }}>
                        {eligibleUsers.slice(0, 10).map((user, index) => (
                          <Chip
                            key={index}
                            label={`${user.name || "Unknown"} (${user.email})`}
                            size="small"
                            sx={{ m: 0.5 }}
                            icon={<PersonIcon />}
                            color={
                              user.source === "custom" ? "success" : "default"
                            }
                            variant={
                              user.source === "custom" ? "outlined" : "filled"
                            }
                            onDelete={() =>
                              setRemovedEmails(
                                (prev) => new Set([...prev, user.email]),
                              )
                            }
                          />
                        ))}
                        <Chip
                          label={`+${eligibleUsers.length - 10} more users`}
                          size="small"
                          sx={{ m: 0.5 }}
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        💡 All {eligibleUsers.length} users will receive the
                        email when you click "Send to {eligibleUsers.length}{" "}
                        Users"
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
            )}

            {/* Step 2: Progress & Results */}
            {currentStep === 2 && (
              <Box>
                {/* Progress */}
                {progress && !results && (
                  <ProgressContainer>
                    <Typography variant="body2" gutterBottom>
                      {progressAction} {progress.total} emails with up to{" "}
                      {progress.concurrency || 1} requests in parallel... (
                      {progress.current}/{progress.total})
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={progress.percentage}
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="caption" color="textSecondary">
                      {progress.percentage}% complete
                      {progress.currentUser
                        ? ` • Latest: ${progress.currentUser}`
                        : ""}
                    </Typography>
                  </ProgressContainer>
                )}

                {/* Results */}
                {results && (
                  <Card sx={{ mt: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Email Results
                      </Typography>

                      <Box display="flex" gap={2} mb={2}>
                        <Chip
                          label={`${results.summary.successful} Successful`}
                          color="success"
                          size="small"
                        />
                        <Chip
                          label={`${results.summary.failed} Failed`}
                          color="error"
                          size="small"
                        />
                      </Box>

                      {failedResults.length > 0 && (
                        <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ReplayIcon />}
                            onClick={handleRetryFailed}
                            disabled={isScheduling}
                          >
                            {isScheduling
                              ? "Retrying..."
                              : `Retry Failed (${failedResults.length})`}
                          </Button>
                          <Button
                            size="small"
                            variant="text"
                            startIcon={<ContentCopyIcon />}
                            onClick={handleCopyFailedRecipients}
                            disabled={isScheduling}
                          >
                            Copy Failed Recipients
                          </Button>
                        </Box>
                      )}

                      {results.summary.errors.length > 0 && (
                        <>
                          <Box display="flex" alignItems="center" mb={1}>
                            <IconButton
                              size="small"
                              onClick={() => setShowDetails(!showDetails)}
                            >
                              {showDetails ? (
                                <ExpandLessIcon />
                              ) : (
                                <ExpandMoreIcon />
                              )}
                            </IconButton>
                            <Typography variant="body2">
                              View Details ({results.summary.errors.length}{" "}
                              errors)
                            </Typography>
                          </Box>

                          <Collapse in={showDetails}>
                            <ResultsList>
                              {results.results.map((result, index) => (
                                <ListItem key={index}>
                                  <ListItemIcon>
                                    {getResultIcon(result.success)}
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={
                                      result.user.name || result.user.email
                                    }
                                    secondary={
                                      result.success
                                        ? "Email sent successfully"
                                        : result.error
                                    }
                                  />
                                </ListItem>
                              ))}
                            </ResultsList>
                          </Collapse>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isScheduling}>
          {results ? "Close" : "Cancel"}
        </Button>

        {currentStep === 2 && results && (
          <Button
            onClick={() => {
              setCurrentStep(1);
              setResults(null);
              setProgress(null);
            }}
            startIcon={<ArrowBackIcon />}
          >
            Back to Message
          </Button>
        )}

        {currentStep === 1 && !results && eligibleUsers.length > 0 && (
          <>
            <Button
              onClick={handleSendTestEmail}
              variant="outlined"
              color="secondary"
              disabled={
                testLoading ||
                isScheduling ||
                !!BatchEmailService.validateMessage(messageText) ||
                !!BatchEmailService.validateSubject(subject)
              }
              startIcon={
                testLoading ? <CircularProgress size={16} /> : <EmailIcon />
              }
            >
              Send Test to questions@ohack.org
            </Button>
            <Button
              onClick={handleSendEmails}
              variant="contained"
              disabled={
                isScheduling ||
                testLoading ||
                !!BatchEmailService.validateMessage(messageText) ||
                !!BatchEmailService.validateSubject(subject)
              }
              startIcon={<FaPaperPlane />}
            >
              {isScheduling
                ? "Sending..."
                : `Send to ${eligibleUsers.length} Users`}
            </Button>
          </>
        )}
      </DialogActions>
    </StyledDialog>
  );
};

export default BatchEmailDialog;
