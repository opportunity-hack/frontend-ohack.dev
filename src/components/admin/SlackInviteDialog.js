import React, { useState, useEffect } from 'react';
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
}) => {
  const [channelName, setChannelName] = useState('');
  const [channelError, setChannelError] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [progress, setProgress] = useState(null);
  const [results, setResults] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Filter eligible users when volunteers change
  const eligibleUsers = SlackInviteService.filterEligibleUsers(volunteers);

  useEffect(() => {
    // Reset state when dialog opens/closes
    if (!open) {
      setChannelName('');
      setChannelError('');
      setIsInviting(false);
      setProgress(null);
      setResults(null);
      setShowDetails(false);
    }
  }, [open]);

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
        {/* Eligible Users Summary */}
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Found <strong>{eligibleUsers.length}</strong> selected {volunteerType.toLowerCase()} 
            with Slack user IDs out of <strong>{volunteers.length}</strong> total {volunteerType.toLowerCase()}.
          </Typography>
        </Alert>

        {eligibleUsers.length === 0 ? (
          <Alert severity="warning">
            No eligible users found. Users must be selected and have a Slack user ID to be invited.
          </Alert>
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
            disabled={isInviting || !!channelError || !channelName.trim()}
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