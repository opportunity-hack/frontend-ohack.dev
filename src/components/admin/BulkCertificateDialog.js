import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Chip,
  LinearProgress,
  IconButton,
  Collapse,
  Card,
  CardContent,
  Step,
  Stepper,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  VolunteerActivism as VolunteerActivismIcon,
} from '@mui/icons-material';
import { styled } from '@mui/system';

const StyledDialog = styled(Dialog)(({ theme}) => ({
  '& .MuiDialog-paper': {
    minWidth: '700px',
    maxWidth: '900px',
    maxHeight: '90vh',
  },
}));

const ProgressContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const ResultsList = styled(List)(({ theme }) => ({
  maxHeight: '300px',
  overflow: 'auto',
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(1, 0),
}));

const BulkCertificateDialog = ({
  open,
  onClose,
  volunteers,
  volunteerType, // 'mentors' or 'judges'
  accessToken,
  orgId,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(null);
  const [results, setResults] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Determine heart type based on volunteer type
  const getHeartType = () => {
    if (volunteerType === 'mentors') return 'mentor';
    if (volunteerType === 'judges') return 'judge';
    return volunteerType; // fallback
  };

  // Filter eligible users - must be selected (isSelected = true) and have Slack user ID
  const eligibleUsers = volunteers.filter(
    volunteer => volunteer.isSelected && volunteer.slack_user_id && volunteer.slack_user_id.trim() !== ''
  );

  useEffect(() => {
    // Reset state when dialog opens/closes
    if (!open) {
      setCurrentStep(0);
      setIsProcessing(false);
      setProgress(null);
      setResults(null);
      setShowDetails(false);
    }
  }, [open]);

  const handleConfirmAndSend = async () => {
    setIsProcessing(true);
    setCurrentStep(1);
    setProgress({ current: 0, total: eligibleUsers.length, percentage: 0 });

    const certificateResults = [];
    const emailResults = [];
    let successfulCount = 0;
    let failedCount = 0;
    const errors = [];

    try {
      for (let i = 0; i < eligibleUsers.length; i++) {
        const user = eligibleUsers[i];
        const userName = user.name || user.email || 'Unknown';

        setProgress({
          current: i + 1,
          total: eligibleUsers.length,
          percentage: Math.round(((i + 1) / eligibleUsers.length) * 100),
          currentUser: userName,
        });

        try {
          // Step 1: Create and send certificate using the same endpoint as /admin/certificates
          const heartType = getHeartType();
          const certificateResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/hearts`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'X-Org-Id': orgId,
              },
              body: JSON.stringify({
                slack_user_ids: [user.slack_user_id],
                reasons: [heartType],
                amount: 1,
              }),
            }
          );

          if (!certificateResponse.ok) {
            throw new Error(`Failed to create certificate: ${certificateResponse.statusText}`);
          }

          // Step 2: Send email notification
          const emailBody = `Hi ${userName},

Congratulations! 🎉

You've been awarded a certificate for your contribution as a ${heartType === 'mentor' ? 'Mentor' : 'Judge'} at Opportunity Hack!

Your certificate has been posted to the #heart-certificates Slack channel where you can view and download it:
https://opportunity-hack.slack.com/archives/C09L60BQU85

Thank you for your dedication and support in making a difference!

Best regards,
The Opportunity Hack Team`;

          const emailResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/admin/email/send`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'X-Org-Id': orgId,
              },
              body: JSON.stringify({
                email: user.email,
                message: emailBody,
                subject: `Your ${heartType === 'mentor' ? 'Mentor' : 'Judge'} Certificate is Ready!`,
                recipient_type: volunteerType,
                name: userName,
              }),
            }
          );

          const emailSuccess = emailResponse.ok;

          certificateResults.push({
            user,
            success: true,
            emailSent: emailSuccess,
            error: null,
          });

          successfulCount++;
        } catch (error) {
          console.error(`Error processing ${userName}:`, error);

          certificateResults.push({
            user,
            success: false,
            emailSent: false,
            error: error.message,
          });

          errors.push({
            user: userName,
            error: error.message,
          });

          failedCount++;
        }
      }

      setResults({
        results: certificateResults,
        summary: {
          total: eligibleUsers.length,
          successful: successfulCount,
          failed: failedCount,
          errors,
        },
      });

      if (onComplete) {
        onComplete({
          total: eligibleUsers.length,
          successful: successfulCount,
          failed: failedCount,
        });
      }
    } catch (error) {
      console.error('Error during bulk certificate sending:', error);
      setResults({
        results: [],
        summary: {
          total: eligibleUsers.length,
          successful: 0,
          failed: eligibleUsers.length,
          errors: [{ user: 'System', error: error.message }],
        },
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
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

  const steps = ['Review Recipients', 'Send Certificates & Notifications'];
  const heartType = getHeartType();
  const heartTypeLabel = heartType === 'mentor' ? 'Mentor' : 'Judge';

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <VolunteerActivismIcon color="primary" />
          <Typography variant="h6">
            Send Certificates to Selected {volunteerType}
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
            Found <strong>{eligibleUsers.length}</strong> selected {volunteerType.toLowerCase()}
            with Slack IDs out of <strong>{volunteers.length}</strong> total {volunteerType.toLowerCase()}.
          </Typography>
        </Alert>

        {eligibleUsers.length === 0 ? (
          <Alert severity="warning">
            No eligible users found. Users must be selected (isSelected = true) and have Slack user IDs to receive certificates.
          </Alert>
        ) : (
          <>
            {/* Step 0: Review Recipients */}
            {currentStep === 0 && (
              <Box>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    Certificate Details:
                  </Typography>
                  <Typography variant="body2" component="div">
                    • <strong>Heart Type:</strong> {heartTypeLabel}
                  </Typography>
                  <Typography variant="body2" component="div">
                    • <strong>Heart Count:</strong> 1 heart per recipient
                  </Typography>
                  <Typography variant="body2" component="div">
                    • <strong>Certificate Location:</strong> Posted to #heart-certificates Slack channel
                  </Typography>
                  <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                    • <strong>Email Notification:</strong> Each recipient will receive an email notification with a link to view their certificate
                  </Typography>
                </Alert>

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 600 }}>
                  Recipients ({eligibleUsers.length} total):
                </Typography>

                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Slack ID</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {eligibleUsers.map((user, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{user.name || 'Unknown'}</TableCell>
                          <TableCell>{user.email || 'No email'}</TableCell>
                          <TableCell>
                            <Chip
                              label={user.slack_user_id}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    ⚠️ Please review the list above carefully before proceeding.
                    Certificates will be created and posted to Slack, and email notifications will be sent to all {eligibleUsers.length} recipients.
                  </Typography>
                </Alert>
              </Box>
            )}

            {/* Step 1: Progress & Results */}
            {currentStep === 1 && (
              <Box>
                {/* Progress */}
                {progress && !results && (
                  <ProgressContainer>
                    <Typography variant="body2" gutterBottom>
                      Processing {progress.currentUser}... ({progress.current}/{progress.total})
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={progress.percentage}
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="caption" color="textSecondary">
                      {progress.percentage}% complete
                    </Typography>
                  </ProgressContainer>
                )}

                {/* Results */}
                {results && (
                  <Card sx={{ mt: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Certificate Results
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

                      {results.summary.successful > 0 && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                          <Typography variant="body2">
                            ✅ Successfully created {results.summary.successful} certificate(s) and sent email notifications.
                            Recipients can view their certificates in the #heart-certificates Slack channel:
                            <a
                              href="https://opportunity-hack.slack.com/archives/C09L60BQU85"
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ marginLeft: 4 }}
                            >
                              View Channel
                            </a>
                          </Typography>
                        </Alert>
                      )}

                      {results.summary.errors.length > 0 && (
                        <>
                          <Box display="flex" alignItems="center" mb={1}>
                            <IconButton
                              size="small"
                              onClick={() => setShowDetails(!showDetails)}
                            >
                              {showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                            <Typography variant="body2">
                              View Details ({results.summary.errors.length} errors)
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
                                    primary={result.user.name || result.user.email}
                                    secondary={
                                      result.success
                                        ? `Certificate created ✓ ${result.emailSent ? '• Email sent ✓' : '• Email failed ✗'}`
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
        <Button onClick={handleClose} disabled={isProcessing}>
          {results ? 'Close' : 'Cancel'}
        </Button>

        {currentStep === 0 && !results && eligibleUsers.length > 0 && (
          <Button
            onClick={handleConfirmAndSend}
            variant="contained"
            color="primary"
            disabled={isProcessing}
            startIcon={<VolunteerActivismIcon />}
          >
            {isProcessing ? 'Processing...' : `Send Certificates to ${eligibleUsers.length} ${volunteerType}`}
          </Button>
        )}
      </DialogActions>
    </StyledDialog>
  );
};

export default BulkCertificateDialog;
