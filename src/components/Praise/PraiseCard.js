import React, { useState } from 'react';
import { Card, CardContent, CardMedia, Box, Typography, Avatar, Tooltip, IconButton, Stack, Chip } from '@mui/material';
import { FavoriteRounded, StarRounded, ThumbUpRounded, EmojiEmotionsRounded } from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import moment from 'moment';

// Helper function to get a user avatar URL from Slack
const getSlackAvatarUrl = (userId) => {
  if (!userId) return null;
  return `https://ca.slack-edge.com/T1Q7936BH-${userId}-128`;
};

const heartBeat = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const StyledCard = styled(Card)(({ theme, isLiked }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  transition: 'all 0.3s ease-in-out',
  overflow: 'hidden',
  border: isLiked ? '2px solid #FF6B6B' : '1px solid rgba(0,0,0,0.08)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-200px',
    width: '200px',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
    animation: isLiked ? `${shimmer} 2s ease-in-out` : 'none',
  },
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
    '& .praise-reactions': {
      opacity: 1,
      transform: 'translateY(0)',
    },
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

const ReactionButton = styled(IconButton)(({ theme, active }) => ({
  color: active ? '#FF6B6B' : theme.palette.text.secondary,
  transition: 'all 0.2s ease',
  animation: active ? `${heartBeat} 0.6s ease` : 'none',
  '&:hover': {
    color: '#FF6B6B',
    transform: 'scale(1.1)',
  },
}));

const ReactionsContainer = styled(Box)({
  opacity: 0,
  transform: 'translateY(10px)',
  transition: 'all 0.3s ease',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '4px 0',
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
  alignSelf: 'flex-end',
  fontStyle: 'italic',
});

const PraiseCard = ({ praise }) => {
  const {
    praise_message,
    praise_gif,
    praise_sender_details,
    praise_receiver_details,
    timestamp
  } = praise;

  const [reactions, setReactions] = useState({
    heart: Math.floor(Math.random() * 5) + 1,
    star: Math.floor(Math.random() * 3) + 1,
    thumbsUp: Math.floor(Math.random() * 4) + 1,
    smile: Math.floor(Math.random() * 2) + 1,
  });
  const [userReactions, setUserReactions] = useState({});

  // Format timestamp using moment
  const formattedTime = moment(timestamp).format('MMM D, YYYY [at] h:mm A');
  const isRecent = moment().diff(moment(timestamp), 'hours') < 24;

  const handleReaction = (type) => {
    setUserReactions(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
    setReactions(prev => ({
      ...prev,
      [type]: prev[type] + (userReactions[type] ? -1 : 1)
    }));
  };

  const getPraiseType = (message) => {
    const lowerMessage = message?.toLowerCase() || '';
    if (lowerMessage.includes('great job') || lowerMessage.includes('excellent') || lowerMessage.includes('amazing')) return 'Excellence';
    if (lowerMessage.includes('help') || lowerMessage.includes('support')) return 'Helpful';
    if (lowerMessage.includes('thank') || lowerMessage.includes('appreciate')) return 'Gratitude';
    if (lowerMessage.includes('creative') || lowerMessage.includes('innovative')) return 'Creative';
    return 'Awesome';
  };

  return (
    <StyledCard isLiked={Object.values(userReactions).some(Boolean)}>
      {isRecent && (
        <PraiseTypeChip 
          label={`✨ ${getPraiseType(praise_message)}`} 
          size="small" 
        />
      )}
      
      {praise_gif && (
        <StyledCardMedia
          image={praise_gif}
          title="Praise GIF"
        />
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
              <Typography variant="body1" component="span" fontWeight="bold" color="primary">
                {praise_sender_details?.real_name || 'Unknown'}
              </Typography>
              <Typography variant="body2" component="span" sx={{ mx: 1, fontStyle: 'italic' }}>
                🙏 praised
              </Typography>
              <Typography variant="body1" component="span" fontWeight="bold" color="secondary">
                {praise_receiver_details?.real_name || 'Unknown'}
              </Typography>
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
          “{praise_message}”
        </MessageContent>
        
        <ReactionsContainer className="praise-reactions">
          <Stack direction="row" spacing={0.5}>
            <ReactionButton 
              size="small" 
              active={userReactions.heart}
              onClick={() => handleReaction('heart')}
            >
              <FavoriteRounded fontSize="small" />
              <Typography variant="caption" sx={{ ml: 0.5 }}>{reactions.heart}</Typography>
            </ReactionButton>
            <ReactionButton 
              size="small" 
              active={userReactions.star}
              onClick={() => handleReaction('star')}
            >
              <StarRounded fontSize="small" />
              <Typography variant="caption" sx={{ ml: 0.5 }}>{reactions.star}</Typography>
            </ReactionButton>
            <ReactionButton 
              size="small" 
              active={userReactions.thumbsUp}
              onClick={() => handleReaction('thumbsUp')}
            >
              <ThumbUpRounded fontSize="small" />
              <Typography variant="caption" sx={{ ml: 0.5 }}>{reactions.thumbsUp}</Typography>
            </ReactionButton>
            <ReactionButton 
              size="small" 
              active={userReactions.smile}
              onClick={() => handleReaction('smile')}
            >
              <EmojiEmotionsRounded fontSize="small" />
              <Typography variant="caption" sx={{ ml: 0.5 }}>{reactions.smile}</Typography>
            </ReactionButton>
          </Stack>
          
          <TimeStamp sx={{ fontSize: '0.7rem' }}>
            {isRecent && '🆕 '}{moment(timestamp).fromNow()}
          </TimeStamp>
        </ReactionsContainer>
      </StyledCardContent>
    </StyledCard>
  );
};

export default PraiseCard;