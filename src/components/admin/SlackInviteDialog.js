import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
  IconButton,
  Collapse,
  Card,
  CardContent,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { styled } from '@mui/system';
import { FaSlack } from 'react-icons/fa';
import SlackInviteService from '../../lib/slackInviteService';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    minWidth: '600px',
    maxWidth: '800px',
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

const SlackInviteDialog = ({
  open,
  onClose,
  volunteers,
  volunteerType,
  accessToken,
  orgId,
  onComplete,
  // Optional: () => Promise<{ ok: true, updated: [{id, name, slack_user_id}], unmatched } | { ok: false, error }>.
  // Re-checks who has joined Slack since they applied; run when the dialog opens.
  onRefresh,
}) => {
  const [channelName, setChannelName] = useState('');
  const [channelError, setChannelError] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [progress, setProgress] = useState(null);
  const [results, setResults] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Slack re-check: { status: 'idle' | 'checking' | 'done' | 'error', updated, error }
  const [slackCheck, setSlackCheck] = useState({ status: 'idle', updated: [], error: '' });
  const [showMissing, setShowMissing] = useState(false);
  const [emailsCopied, setEmailsCopied] = useState(false);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;
  const checkRunRef = useRef(0);

  // `volunteers` is the list as it was when the dialog opened; overlay the
  // Slack ids the re-check just found so newly joined people are invitable.
  const liveVolunteers = useMemo(() => {
    if (slackCheck.updated.length === 0) return volunteers;
    const found = new Map(slackCheck.updated.map((u) => [u.id, u.slack_user_id]));
    return volunteers.map((v) =>
      found.has(v.id) ? { ...v, slack_user_id: found.get(v.id) } : v
    );
  }, [volunteers, slackCheck.updated]);

  const eligibleUsers = SlackInviteService.filterEligibleUsers(liveVolunteers);
  const rosterWithoutSlack = SlackInviteService.filterRosterWithoutSlack(liveVolunteers);
  const isChecking = slackCheck.status === 'checking';

  const runSlackCheck = useCallback(async () => {
    if (typeof onRefreshRef.current !== 'function') return;
    const run = ++checkRunRef.current;
    setSlackCheck((prev) => ({ ...prev, status: 'checking', error: '' }));
    let result;
    try {
      result = await onRefreshRef.current();
    } catch (error) {
      result = { ok: false, error: error?.message };
    }
    if (run !== checkRunRef.current) return; // dialog closed or re-run meanwhile
    if (result && result.ok) {
      setSlackCheck((prev) => ({
        status: 'done',
        // keep earlier finds: a second check only returns what is new since
        updated: [...prev.updated, ...(result.updated || [])],
        error: '',
      }));
    } else {
      setSlackCheck((prev) => ({
        ...prev,
        status: 'error',
        error: (result && result.error) || "Couldn't check Slack for new members.",
      }));
    }
  }, []);

  useEffect(() => {
    if (open) {
      runSlackCheck();
      return;
    }
    // Reset state when the dialog closes
    checkRunRef.current += 1;
    setChannelName('');
    setChannelError('');
    setIsInviting(false);
    setProgress(null);
    setResults(null);
    setShowDetails(false);
    setSlackCheck({ status: 'idle', updated: [], error: '' });
    setShowMissing(false);
    setEmailsCopied(false);
  }, [open, runSlackCheck]);

  const handleCopyMissingEmails = async () => {
    const emails = rosterWithoutSlack.map((u) => u.email).filter(Boolean).join(', ');
    try {
      await navigator.clipboard.writeText(emails);
      setEmailsCopied(true);
    } catch (error) {
      setEmailsCopied(false);
    }
  };

  const validateChannelName = (channel) => {
    if (!channel.trim()) {
      return 'Channel name is required';
    }
    
    if (!SlackInviteService.isValidChannelName(channel)) {
      return 'Channel name must be lowercase, contain only letters, numbers, hyphens, and underscores (max 50 chars)';
    }
    
    return '';
  };

  const handleChannelNameChange = (e) => {
    const value = e.target.value;
    setChannelName(value);
    setChannelError(validateChannelName(value));
  };

  const handleInvite = async () => {
    const error = validateChannelName(channelName);
    if (error) {
      setChannelError(error);
      return;
    }

    setIsInviting(true);
    setProgress({ current: 0, total: eligibleUsers.length, percentage: 0 });

    const slackService = new SlackInviteService(
      process.env.NEXT_PUBLIC_API_SERVER_URL,
      accessToken,
      orgId
    );

    const cleanChannel = SlackInviteService.cleanChannelName(channelName);

    try {
      const { results: inviteResults, summary } = await slackService.inviteMultipleUsers(
        eligibleUsers,
        cleanChannel,
        (progressUpdate) => {
          setProgress(progressUpdate);
        }
      );

      setResults({ results: inviteResults, summary });
      
      if (onComplete) {
        onComplete(summary);
      }
    } catch (error) {
      console.error('Error during Slack invitations:', error);
      setResults({
        results: [],
        summary: {
          total: eligibleUsers.length,
          successful: 0,
          failed: eligibleUsers.length,
          errors: [{ user: 'System', error: error.message }]
        }
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleClose = () => {
    if (!isInviting) {
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

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <FaSlack color="#4A154B" />
          <Typography variant="h6">
            Invite {volunteerType} to Slack Channel
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {/* Slack re-check (people who joined Slack after applying) */}
        {isChecking && (
          <Box sx={{ mb: 2 }} role="status">
            <Typography variant="body2" gutterBottom>
              Checking for people who joined Slack since they applied…
            </Typography>
            <LinearProgress />
          </Box>
        )}
        {slackCheck.status === 'error' && (
          <Alert
            severity="warning"
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={runSlackCheck}>
                Retry
              </Button>
            }
          >
            {slackCheck.error} The list below uses the last saved Slack status.
          </Alert>
        )}
        {slackCheck.updated.length > 0 && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Found {slackCheck.updated.length}{' '}
            {slackCheck.updated.length === 1 ? 'person' : 'people'} who joined Slack since
            applying: {slackCheck.updated.map((u) => u.name || u.email || u.id).join(', ')}.
          </Alert>
        )}

        {/* Eligible Users Summary */}
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>{eligibleUsers.length}</strong> {volunteerType.toLowerCase()} on the roster
            {' '}can be invited (on Slack), out of{' '}
            <strong>{volunteers.length}</strong> total {volunteerType.toLowerCase()}.
          </Typography>
        </Alert>

        {/* On the roster, not on Slack yet */}
        {rosterWithoutSlack.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Box display="flex" alignItems="center" flexWrap="wrap" gap={1}>
              <Button
                size="small"
                onClick={() => setShowMissing(!showMissing)}
                aria-expanded={showMissing}
                endIcon={showMissing ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              >
                {rosterWithoutSlack.length} on the roster{' '}
                {rosterWithoutSlack.length === 1 ? "isn't" : "aren't"} on Slack yet
              </Button>
              <Button size="small" variant="outlined" onClick={handleCopyMissingEmails}>
                {emailsCopied ? 'Emails copied' : 'Copy their emails'}
              </Button>
            </Box>
            <Collapse in={showMissing}>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                They can't be added to a channel until they join Slack (ohack.dev/signup)
                with the email on their application. Open this dialog again afterwards.
              </Typography>
              <ResultsList dense>
                {rosterWithoutSlack.map((user) => (
                  <ListItem key={user.id || user.email}>
                    <ListItemText primary={user.name || 'Unknown'} secondary={user.email} />
                  </ListItem>
                ))}
              </ResultsList>
            </Collapse>
          </Box>
        )}

        {eligibleUsers.length === 0 ? (
          !isChecking && (
            <Alert severity="warning">
              Nobody can be invited yet. People must be on the roster and on Slack.
            </Alert>
          )
        ) : (
          <>
            {/* Channel Name Input */}
            <TextField
              fullWidth
              label="Slack Channel Name"
              placeholder="e.g., hackathon-2024, general, mentors"
              value={channelName}
              onChange={handleChannelNameChange}
              error={!!channelError}
              helperText={channelError || 'Enter the Slack channel name (without #)'}
              disabled={isInviting}
              sx={{ mb: 2 }}
            />

            {/* Users to be invited */}
            <Typography variant="subtitle2" gutterBottom>
              Users to be invited:
            </Typography>
            <Box sx={{ mb: 2, maxHeight: '150px', overflow: 'auto' }}>
              {eligibleUsers.map((user, index) => (
                <Chip
                  key={index}
                  label={`${user.name || 'Unknown'} (${user.slack_user_id})`}
                  size="small"
                  sx={{ m: 0.5 }}
                  icon={<PersonIcon />}
                />
              ))}
            </Box>

            {/* Progress */}
            {progress && (
              <ProgressContainer>
                <Typography variant="body2" gutterBottom>
                  Inviting {progress.currentUser}... ({progress.current}/{progress.total})
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
                    Invitation Results
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
                                primary={result.user.name || result.user.slack_user_id}
                                secondary={
                                  result.success 
                                    ? 'Successfully invited'
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
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isInviting}>
          {results ? 'Close' : 'Cancel'}
        </Button>
        {!results && eligibleUsers.length > 0 && (
          <Button
            onClick={handleInvite}
            variant="contained"
            disabled={isInviting || isChecking || !!channelError || !channelName.trim()}
            startIcon={<FaSlack />}
          >
            {isInviting ? 'Inviting...' : `Invite ${eligibleUsers.length} Users`}
          </Button>
        )}
      </DialogActions>
    </StyledDialog>
  );
};

export default SlackInviteDialog;