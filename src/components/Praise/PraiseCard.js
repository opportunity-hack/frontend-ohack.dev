import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, Box, Typography, Avatar, Tooltip, IconButton, Chip, Snackbar } from '@mui/material';
import { LinkRounded } from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { format, differenceInHours, formatDistanceToNow, parseISO } from 'date-fns';

// Helper function to get a user avatar URL from Slack
const getSlackAvatarUrl = (userId) => {
  if (!userId) return null;
  return `https://ca.slack-edge.com/T1Q7936BH-${userId}-128`;
};

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  transition: 'all 0.3s ease-in-out',
  overflow: 'hidden',
  border: '1px solid rgba(0,0,0,0.08)',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
  },
}));

const MediaContainer = styled(Box)({
  width: '100%',
  height: '180px',
  overflow: 'hidden',
  backgroundColor: '#fafafa',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const StyledCardMedia = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
});

const StyledCardContent = styled(CardContent)({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: '16px',
});

const UserInfo = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '16px',
  padding: '4px',
  borderRadius: '12px',
  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
});

const MessageContent = styled(Typography)({
  flexGrow: 1,
  marginBottom: '16px',
  lineHeight: 1.6,
  overflow: 'hidden',
  position: 'relative',
  padding: '12px',
  borderRadius: '8px',
  backgroundColor: 'rgba(0,0,0,0.02)',
  border: '1px dashed rgba(0,0,0,0.1)',
});

const PraiseTypeChip = styled(Chip)(({ theme }) => ({
  background: 'linear-gradient(45deg, #FF9A9E 30%, #FECFEF 90%)',
  color: 'white',
  fontWeight: 'bold',
  fontSize: '0.7rem',
  height: '20px',
  position: 'absolute',
  top: '8px',
  right: '8px',
  '& .MuiChip-label': {
    padding: '0 6px',
  },
}));

const TimeStamp = styled(Typography)({
  opacity: 0.7,
  fontSize: '0.8rem',
  fontStyle: 'italic',
});

const ClickableName = styled(Typography)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    color: theme.palette.primary.main,
    textDecoration: 'underline',
    transform: 'scale(1.05)',
  },
}));

const PraiseCard = ({ praise }) => {
  const router = useRouter();
  const {
    id,
    praise_message,
    praise_gif,
    praise_sender_details,
    praise_receiver_details,
    praise_sender_ohack_id,
    praise_receiver_ohack_id,
    timestamp
  } = praise;

  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Format timestamp using date-fns
  const formattedTime = format(parseISO(timestamp), 'MMM d, yyyy \'at\' h:mm a');
  const isRecent = differenceInHours(new Date(), parseISO(timestamp)) < 24;

  const getPraiseType = (message) => {
    const lowerMessage = message?.toLowerCase() || '';
    if (lowerMessage.includes('great job') || lowerMessage.includes('excellent') || lowerMessage.includes('amazing')) return 'Excellence';
    if (lowerMessage.includes('help') || lowerMessage.includes('support')) return 'Helpful';
    if (lowerMessage.includes('thank') || lowerMessage.includes('appreciate')) return 'Gratitude';
    if (lowerMessage.includes('creative') || lowerMessage.includes('innovative')) return 'Creative';
    return 'Awesome';
  };

  //Function to handle clicking on a user's profile on a Praise Card
  const handleUserClick = (ohackId) => {
    try {
      const profileId = ohackId || 'unknown';
      router.push(`/profile/${profileId}`);
    } catch (error) {
      console.error('Error navigating to user profile:', error);
    }
  };

  const handleShareClick = async () => {
    const url = `https://ohack.dev/praise/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setSnackbarOpen(true);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <StyledCard>
      {isRecent && (
        <PraiseTypeChip
          label={`✨ ${getPraiseType(praise_message)}`}
          size="small"
        />
      )}

      {praise_gif && (
        <MediaContainer>
          <StyledCardMedia
            src={praise_gif}
            alt="Praise GIF"
            loading="lazy"
          />
        </MediaContainer>
      )}

      <StyledCardContent>
        <UserInfo>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', p: 1 }}>
            <Tooltip title={praise_sender_details?.real_name || 'Unknown'}>
              <Avatar
                src={getSlackAvatarUrl(praise_sender_details?.id)}
                alt={praise_sender_details?.real_name || 'Unknown'}
                sx={{
                  marginRight: 1,
                  border: '2px solid white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
            </Tooltip>
            <Box sx={{ flexGrow: 1 }}>
              <Tooltip title={`View ${praise_sender_details?.real_name || 'Unknown'}'s profile`} arrow>
                <ClickableName
                  variant="body1"
                  component="span"
                  fontWeight="bold"
                  color={praise_sender_details?.real_name ? "primary" : "text.secondary"}
                  onClick={() => handleUserClick(praise_sender_ohack_id)}
                >
                  {praise_sender_details?.real_name || 'Unknown'}
                </ClickableName>
              </Tooltip>
              <Typography variant="body2" component="span" sx={{ mx: 1, fontStyle: 'italic' }}>
                🙏 praised
              </Typography>
              {praise_receiver_details?.real_name ? (
                <Tooltip title={`View ${praise_receiver_details.real_name}'s profile`} arrow>
                  <ClickableName
                    variant="body1"
                    component="span"
                    fontWeight="bold"
                    color="secondary"
                    onClick={() => handleUserClick(praise_receiver_ohack_id)}
                  >
                    {praise_receiver_details.real_name}
                  </ClickableName>
                </Tooltip>
              ) : (
                <Typography
                  variant="body1"
                  component="span"
                  fontWeight="bold"
                  color="text.secondary"
                >
                  Unknown
                </Typography>
              )}
            </Box>
            <Tooltip title={praise_receiver_details?.real_name || 'Unknown'}>
              <Avatar
                src={getSlackAvatarUrl(praise_receiver_details?.id)}
                alt={praise_receiver_details?.real_name || 'Unknown'}
                sx={{
                  border: '2px solid white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
            </Tooltip>
          </Box>
        </UserInfo>

        <MessageContent variant="body1">
          "{praise_message}"
        </MessageContent>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <TimeStamp sx={{ fontSize: '0.7rem' }}>
            {isRecent && '🆕 '}{formatDistanceToNow(parseISO(timestamp), { addSuffix: true })}
          </TimeStamp>
          <Tooltip title="Copy link to this praise">
            <IconButton size="small" onClick={handleShareClick} sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}>
              <LinkRounded fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </StyledCardContent>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        message="Link copied to clipboard"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </StyledCard>
  );
};

export default PraiseCard;
