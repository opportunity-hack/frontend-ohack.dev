import React from 'react';
import { Card, CardContent, CardMedia, Box, Typography, Avatar, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import moment from 'moment';

// Helper function to get a user avatar URL from Slack
const getSlackAvatarUrl = (userId) => {
  if (!userId) return null;
  return `https://ca.slack-edge.com/T1Q7936BH-${userId}-128`;
};

const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  borderRadius: '12px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
  },
}));

const StyledCardMedia = styled(CardMedia)({
  height: 0,
  paddingTop: '56.25%', // 16:9 aspect ratio
  backgroundSize: 'contain',
  backgroundColor: '#f5f5f5',
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
});

const MessageContent = styled(Typography)({
  flexGrow: 1,
  marginBottom: '16px',
  lineHeight: 1.6,
  overflow: 'hidden',
});

const TimeStamp = styled(Typography)({
  opacity: 0.7,
  fontSize: '0.8rem',
  alignSelf: 'flex-end',
});

const PraiseCard = ({ praise }) => {
  const {
    praise_message,
    praise_gif,
    praise_sender_details,
    praise_receiver_details,
    timestamp
  } = praise;

  // Format timestamp using moment
  const formattedTime = moment(timestamp).format('MMM D, YYYY [at] h:mm A');

  return (
    <StyledCard>
      {praise_gif && (
        <StyledCardMedia
          image={praise_gif}
          title="Praise GIF"
        />
      )}
      <StyledCardContent>
        <UserInfo>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Tooltip title={praise_sender_details?.real_name || 'Unknown'}>
              <Avatar 
                src={getSlackAvatarUrl(praise_sender_details?.id)}
                alt={praise_sender_details?.real_name || 'Unknown'}
                sx={{ marginRight: 1 }}
              />
            </Tooltip>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body1" component="span" fontWeight="bold">
                {praise_sender_details?.real_name || 'Unknown'}
              </Typography>
              <Typography variant="body2" component="span" sx={{ mx: 1 }}>
                praised
              </Typography>
              <Typography variant="body1" component="span" fontWeight="bold">
                {praise_receiver_details?.real_name || 'Unknown'}
              </Typography>
            </Box>
            <Tooltip title={praise_receiver_details?.real_name || 'Unknown'}>
              <Avatar 
                src={getSlackAvatarUrl(praise_receiver_details?.id)}
                alt={praise_receiver_details?.real_name || 'Unknown'}
              />
            </Tooltip>
          </Box>
        </UserInfo>
        <MessageContent variant="body1">
          {praise_message}
        </MessageContent>
        <TimeStamp>
          {formattedTime}
        </TimeStamp>
      </StyledCardContent>
    </StyledCard>
  );
};

export default PraiseCard;