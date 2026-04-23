import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SendIcon from "@mui/icons-material/Send";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import HistoryIcon from "@mui/icons-material/History";

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

const AdminEmailCompose = ({
  recipientEmail,
  recipientName,
  collectionName,
  documentId,
  sentEmails = [],
  accessToken,
  orgId,
  onEmailSent,
  fixedSubject,
}) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [alert, setAlert] = useState(null);
  const [composeOpen, setComposeOpen] = useState(false);

  const isSubjectLocked = Boolean(fixedSubject);
  const effectiveSubject = isSubjectLocked ? fixedSubject : subject;

  const handleSend = async () => {
    if (!effectiveSubject.trim() || !message.trim()) {
      setAlert({ severity: "warning", text: "Subject and message are required." });
      return;
    }

    setSending(true);
    setAlert(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/admin/email/send`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${accessToken}`,
            "content-type": "application/json",
            "X-Org-Id": orgId,
          },
          body: JSON.stringify({
            email: recipientEmail,
            name: recipientName,
            subject: effectiveSubject,
            message,
            recipient_type: "contact",
            collection_name: collectionName,
            document_id: documentId,
          }),
        }
      );

      if (response.ok) {
        setAlert({ severity: "success", text: "Email sent successfully!" });
        if (!isSubjectLocked) setSubject("");
        setMessage("");
        setComposeOpen(false);
        if (onEmailSent) onEmailSent();
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to send email");
      }
    } catch (err) {
      setAlert({ severity: "error", text: err.message || "Failed to send email." });
    } finally {
      setSending(false);
    }
  };

  const sortedEmails = [...sentEmails].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <Paper
      variant="outlined"
      sx={{ mt: 2, p: 2, borderColor: "info.light", borderRadius: 2 }}
    >
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 600, mb: 1, color: "info.main", display: "flex", alignItems: "center", gap: 1 }}
      >
        <MailOutlineIcon fontSize="small" />
        Email Correspondence
      </Typography>

      {alert && (
        <Alert severity={alert.severity} sx={{ mb: 2 }} onClose={() => setAlert(null)}>
          {alert.text}
        </Alert>
      )}

      {/* Compose */}
      <Accordion expanded={composeOpen} onChange={() => setComposeOpen(!composeOpen)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Compose New Email to {recipientName || recipientEmail}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              size="small"
              label="Subject"
              value={effectiveSubject}
              onChange={(e) => setSubject(e.target.value)}
              fullWidth
              InputProps={{ readOnly: isSubjectLocked }}
              helperText={
                isSubjectLocked
                  ? "Subject matches the original email thread and can't be changed."
                  : undefined
              }
            />
            <TextField
              size="small"
              label="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              multiline
              rows={4}
              fullWidth
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                startIcon={sending ? <CircularProgress size={16} /> : <SendIcon />}
                onClick={handleSend}
                disabled={sending}
                size="small"
              >
                {sending ? "Sending..." : "Send Email"}
              </Button>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Email History */}
      {sortedEmails.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, mb: 1, display: "flex", alignItems: "center", gap: 0.5 }}
          >
            <HistoryIcon fontSize="small" />
            Email History ({sortedEmails.length})
          </Typography>
          <List dense disablePadding>
            {sortedEmails.map((email, idx) => (
              <ListItem
                key={email.resend_id || idx}
                sx={{
                  borderLeft: "3px solid",
                  borderColor: "info.light",
                  mb: 0.5,
                  bgcolor: "grey.50",
                  borderRadius: 1,
                }}
              >
                <ListItemText
                  primary={email.subject || "No subject"}
                  secondary={
                    <Box component="span" sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                      <span>{formatDate(email.timestamp)}</span>
                      <span>by {email.sent_by || "Admin"}</span>
                      {email.resend_id && (
                        <Chip label="Sent" size="small" color="success" variant="outlined" />
                      )}
                    </Box>
                  }
                  primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
                  secondaryTypographyProps={{ variant: "caption", component: "div" }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {sortedEmails.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: "italic" }}>
          No emails sent yet.
        </Typography>
      )}
    </Paper>
  );
};

export default AdminEmailCompose;
