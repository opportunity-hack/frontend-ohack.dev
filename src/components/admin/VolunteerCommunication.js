import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  TextField,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  FaPaperPlane,
  FaEdit,
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import {
  MESSAGE_TEMPLATES,
  filterTemplatesByType,
  prepareTemplateMessage,
  detectPlaceholders,
  PLACEHOLDER_LABELS
} from '../../lib/messageTemplates';


const VolunteerCommunication = ({ 
  volunteer, 
  volunteerType, // Add this prop
  onMessageSent, 
  eventId, 
  orgId, 
  accessToken,
  open,
  onClose 
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [messageDialogOpen, setMessageDialogOpen] = useState(open || false);
  const [messageText, setMessageText] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customMessage, setCustomMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [placeholderValues, setPlaceholderValues] = useState({});
  const [detectedPlaceholders, setDetectedPlaceholders] = useState([]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !volunteer) return;

    setLoading(true);
    try {
      // Determine if this is a user with an ID (registered user) or email-only recipient
      const isEmailOnlyRecipient = !volunteer.id || volunteer.source === 'custom' || volunteer.source === 'csv';

      let endpoint, requestBody;

      if (isEmailOnlyRecipient) {
        // Use email-only endpoint for recipients without user accounts
        endpoint = `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/admin/email/send`;
        requestBody = {
          email: volunteer.email,
          message: messageText,
          subject: selectedTemplate ? selectedTemplate.title : "Message from Opportunity Hack",
          recipient_type: volunteer.type || 'volunteer',
          name: volunteer.name || volunteer.email || 'Recipient'
        };
      } else {
        // Use user ID endpoint for registered users
        endpoint = `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/admin/${volunteer.id}/message`;
        requestBody = {
          message: messageText,
          subject: selectedTemplate ? selectedTemplate.title : "Message from Opportunity Hack",
          recipient_type: volunteer.type || 'volunteer',
          recipient_id: volunteer.id
        };
      }

      const response = await axios.post(
        endpoint,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-Org-Id": orgId,
          },
        }
      );

      if (response.data && response.data.success) {
        enqueueSnackbar("Message sent successfully", { variant: "success" });
        setMessageDialogOpen(false);
        setMessageText("");
        setSelectedTemplate(null);
        setCustomMessage(false);
        if (onMessageSent) {
          onMessageSent();
        }
        if (onClose) {
          onClose();
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      enqueueSnackbar(error.response?.data?.message || "Failed to send message", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseMessageDialog = () => {
    setMessageDialogOpen(false);
    setMessageText("");
    setSelectedTemplate(null);
    setCustomMessage(false);
    if (onClose) {
      onClose();
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);

    // Use shared utility to prepare template message with placeholder replacements
    const message = prepareTemplateMessage(template, {
      eventId: eventId,
      volunteerId: volunteer?.id,
      volunteerType: volunteerType || volunteer?.type
    });

    setMessageText(message);
    setCustomMessage(false);

    // Detect remaining placeholders that need manual input
    const remaining = detectPlaceholders(message);
    setDetectedPlaceholders(remaining);
    setPlaceholderValues({});
  };

  const handleCustomMessageToggle = () => {
    setCustomMessage(true);
    setSelectedTemplate(null);
    setMessageText("");
    setDetectedPlaceholders([]);
    setPlaceholderValues({});
  };

  const handlePlaceholderChange = (placeholderName, value) => {
    const newValues = { ...placeholderValues, [placeholderName]: value };
    setPlaceholderValues(newValues);

    // Rebuild message from template with all current placeholder values
    let message = prepareTemplateMessage(selectedTemplate, {
      eventId: eventId,
      volunteerId: volunteer?.id,
      volunteerType: volunteerType || volunteer?.type
    });
    for (const [name, val] of Object.entries(newValues)) {
      if (val) {
        message = message.replaceAll(`[${name}]`, val);
      }
    }
    setMessageText(message);
  };

  // Use useEffect to sync external open state with internal state
  React.useEffect(() => {
    if (open !== undefined) {
      setMessageDialogOpen(open);
    }
  }, [open]);

  if (!volunteer) {
    return null;
  }

  // Get filtered templates based on volunteer type using shared utility
  const volType = volunteerType || volunteer?.type;
  const filteredTemplates = filterTemplatesByType(volType);

  // If used with external dialog control, skip the card and just show dialog
  if (open !== undefined) {
    return (
      /* Send Message Dialog */
      <Dialog
        open={messageDialogOpen}
        onClose={handleCloseMessageDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FaPaperPlane />
            Send Message to {volunteer.name || 'Volunteer'} ({volunteerType || volunteer.type})
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            {!customMessage && !selectedTemplate && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Choose a Message Template for {volunteerType || volunteer.type}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Templates filtered for {volunteerType || volunteer.type} role only
                </Typography>
                
                {Object.entries(filteredTemplates).map(([categoryKey, category]) => (
                  <Box key={categoryKey} sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      {category.category}
                    </Typography>
                    <Grid container spacing={2}>
                      {category.templates.map((template) => (
                        <Grid item xs={12} sm={6} key={template.id}>
                          <Card 
                            variant="outlined" 
                            sx={{ 
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              '&:hover': {
                                borderColor: 'primary.main',
                                boxShadow: 1
                              }
                            }}
                            onClick={() => handleTemplateSelect(template)}
                          >
                            <CardContent sx={{ pb: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="h6" component="span">
                                  {template.icon}
                                </Typography>
                                <Typography variant="subtitle2" fontWeight="bold">
                                  {template.title}
                                </Typography>
                              </Box>
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
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
                ))}
                
                {Object.keys(filteredTemplates).length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No specific templates available for {volunteerType || volunteer.type}.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      You can still write a custom message.
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
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

            {(selectedTemplate || customMessage) && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">
                    {selectedTemplate ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{selectedTemplate.icon}</span>
                        {selectedTemplate.title}
                      </Box>
                    ) : (
                      'Custom Message'
                    )}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => {
                      setSelectedTemplate(null);
                      setCustomMessage(false);
                      setMessageText("");
                      setDetectedPlaceholders([]);
                      setPlaceholderValues({});
                    }}
                  >
                    Back to Templates
                  </Button>
                </Box>
                
                {selectedTemplate && detectedPlaceholders.length > 0 && (
                  <Box sx={{ mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      This template requires event-specific details:
                    </Typography>
                    <Grid container spacing={2}>
                      {detectedPlaceholders.map((name) => {
                        const info = PLACEHOLDER_LABELS[name] || { label: name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), example: '' };
                        return (
                          <Grid item xs={12} sm={6} key={name}>
                            <TextField
                              fullWidth
                              size="small"
                              label={info.label}
                              value={placeholderValues[name] || ''}
                              onChange={(e) => handlePlaceholderChange(name, e.target.value)}
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
                  placeholder="Type your message to the volunteer..."
                  variant="outlined"
                  helperText={`Message will be sent to ${volunteer.name || 'volunteer'} at ${volunteer.email || 'their registered email'}`}
                />
                
                {selectedTemplate && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      💡 Feel free to customize this template before sending. The message above can be edited to fit your specific needs.
                    </Typography>
                  </Alert>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMessageDialog}>Cancel</Button>
          {(selectedTemplate || customMessage) && (
            <Button
              onClick={handleSendMessage}
              variant="contained"
              color="primary"
              disabled={loading || !messageText.trim()}
              startIcon={loading ? <CircularProgress size={16} /> : <FaPaperPlane />}
            >
              Send Message
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <>
      <Card elevation={1} sx={{ mb: 3 }}>
        <CardHeader
          title="Volunteer Communication"
          subheader={`Send messages to ${volunteer.name || 'volunteer'} (${volunteer.email || 'No email'}) - Role: ${volunteerType || volunteer.type}`}
        />
        <Divider />
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Role: {volunteerType || volunteer.type}
            </Typography>
            <Button
              startIcon={<FaPaperPlane />}
              variant="contained"
              color="primary"
              onClick={() => {
                setSelectedTemplate(null);
                setCustomMessage(false);
                setMessageText("");
                setMessageDialogOpen(true);
              }}
            >
              Send Message
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Send Message Dialog */}
      <Dialog
        open={messageDialogOpen}
        onClose={handleCloseMessageDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FaPaperPlane />
            Send Message to {volunteer.name || 'Volunteer'} ({volunteerType || volunteer.type})
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            {!customMessage && !selectedTemplate && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Choose a Message Template for {volunteerType || volunteer.type}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Templates filtered for {volunteerType || volunteer.type} role only
                </Typography>
                
                {Object.entries(filteredTemplates).map(([categoryKey, category]) => (
                  <Box key={categoryKey} sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      {category.category}
                    </Typography>
                    <Grid container spacing={2}>
                      {category.templates.map((template) => (
                        <Grid item xs={12} sm={6} key={template.id}>
                          <Card 
                            variant="outlined" 
                            sx={{ 
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              '&:hover': {
                                borderColor: 'primary.main',
                                boxShadow: 1
                              }
                            }}
                            onClick={() => handleTemplateSelect(template)}
                          >
                            <CardContent sx={{ pb: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="h6" component="span">
                                  {template.icon}
                                </Typography>
                                <Typography variant="subtitle2" fontWeight="bold">
                                  {template.title}
                                </Typography>
                              </Box>
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
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
                ))}
                
                {Object.keys(filteredTemplates).length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No specific templates available for {volunteerType || volunteer.type}.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      You can still write a custom message.
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
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

            {(selectedTemplate || customMessage) && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">
                    {selectedTemplate ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{selectedTemplate.icon}</span>
                        {selectedTemplate.title}
                      </Box>
                    ) : (
                      'Custom Message'
                    )}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => {
                      setSelectedTemplate(null);
                      setCustomMessage(false);
                      setMessageText("");
                      setDetectedPlaceholders([]);
                      setPlaceholderValues({});
                    }}
                  >
                    Back to Templates
                  </Button>
                </Box>
                
                {selectedTemplate && detectedPlaceholders.length > 0 && (
                  <Box sx={{ mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      This template requires event-specific details:
                    </Typography>
                    <Grid container spacing={2}>
                      {detectedPlaceholders.map((name) => {
                        const info = PLACEHOLDER_LABELS[name] || { label: name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), example: '' };
                        return (
                          <Grid item xs={12} sm={6} key={name}>
                            <TextField
                              fullWidth
                              size="small"
                              label={info.label}
                              value={placeholderValues[name] || ''}
                              onChange={(e) => handlePlaceholderChange(name, e.target.value)}
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
                  placeholder="Type your message to the volunteer..."
                  variant="outlined"
                  helperText={`Message will be sent to ${volunteer.name || 'volunteer'} at ${volunteer.email || 'their registered email'}`}
                />
                
                {selectedTemplate && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      💡 Feel free to customize this template before sending. The message above can be edited to fit your specific needs.
                    </Typography>
                  </Alert>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMessageDialog}>Cancel</Button>
          {(selectedTemplate || customMessage) && (
            <Button
              onClick={handleSendMessage}
              variant="contained"
              color="primary"
              disabled={loading || !messageText.trim()}
              startIcon={loading ? <CircularProgress size={16} /> : <FaPaperPlane />}
            >
              Send Message
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default VolunteerCommunication;