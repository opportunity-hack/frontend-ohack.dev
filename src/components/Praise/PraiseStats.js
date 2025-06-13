import React, { useMemo } from 'react';
import { Paper, Box, Typography, Grid, Chip } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { EmojiEvents, Favorite, People, Forum, TrendingUp } from '@mui/icons-material';

const countUp = keyframes`
  from { opacity: 0; transform: scale(0.5); }
  to { opacity: 1; transform: scale(1); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
`;

const StyledPaper = styled(Paper)(({ theme, gradient }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  height: '100%',
  borderRadius: '16px',
  background: gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    right: '-50%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
    animation: `${float} 6s ease-in-out infinite`,
  },
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
  },
}));

const StatIcon = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  color: 'white',
  width: 70,
  height: 70,
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  backdropFilter: 'blur(10px)',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
  position: 'relative',
  zIndex: 1,
}));

const StatValue = styled(Typography)(({ theme }) => ({
  fontSize: '2.8rem',
  fontWeight: 'bold',
  marginBottom: theme.spacing(1),
  textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
  animation: `${countUp} 0.8s ease-out`,
  position: 'relative',
  zIndex: 1,
}));

const StatLabel = styled(Typography)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.9)',
  textAlign: 'center',
  fontWeight: 'medium',
  textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
  position: 'relative',
  zIndex: 1,
}));

const TrendingChip = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: 12,
  right: 12,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  color: 'white',
  fontWeight: 'bold',
  fontSize: '0.7rem',
  height: '24px',
  '& .MuiChip-icon': {
    color: 'white',
  },
}));

const PraiseStats = ({ praises }) => {
  // Calculate stats
  const stats = useMemo(() => {
    if (!praises || praises.length === 0) {
      return {
        totalPraises: 0,
        uniqueSenders: 0,
        uniqueReceivers: 0,
        topReceiver: { name: 'None', count: 0 },
      };
    }

    // Count unique senders and receivers
    const senders = new Set();
    const receivers = new Set();
    const receiverCounts = {};

    praises.forEach(praise => {
      const senderName = praise.praise_sender_details?.real_name;
      const receiverName = praise.praise_receiver_details?.real_name;
      
      if (senderName) senders.add(senderName);
      if (receiverName) {
        receivers.add(receiverName);
        receiverCounts[receiverName] = (receiverCounts[receiverName] || 0) + 1;
      }
    });

    // Find top receiver
    let topReceiver = { name: 'None', count: 0 };
    Object.entries(receiverCounts).forEach(([name, count]) => {
      if (count > topReceiver.count) {
        topReceiver = { name, count };
      }
    });

    // Calculate growth trend (mock data for demonstration)
    const recentPraises = praises.filter(praise => {
      const praiseDate = new Date(praise.timestamp);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return praiseDate > weekAgo;
    });

    return {
      totalPraises: praises.length,
      uniqueSenders: senders.size,
      uniqueReceivers: receivers.size,
      topReceiver,
      recentGrowth: recentPraises.length,
      isGrowing: recentPraises.length > 0,
    };
  }, [praises]);

  return (
    <Grid container spacing={3} sx={{ mb: 6, mt: 1 }}>
      <Grid item xs={12} sm={6} md={3}>
        <StyledPaper gradient="linear-gradient(135deg, #4ecdc4 0%, #20bf6b 100%)">
          {stats.isGrowing && (
            <TrendingChip 
              icon={<TrendingUp fontSize="small" />} 
              label="Hot!" 
              size="small" 
            />
          )}
          <StatIcon>
            <Forum fontSize="large" />
          </StatIcon>
          <StatValue>{stats.totalPraises}</StatValue>
          <StatLabel>💬 Total Praises</StatLabel>
        </StyledPaper>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <StyledPaper gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
          <StatIcon>
            <People fontSize="large" />
          </StatIcon>
          <StatValue>{stats.uniqueSenders}</StatValue>
          <StatLabel>🙏 Praise Givers</StatLabel>
        </StyledPaper>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <StyledPaper gradient="linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)">
          <StatIcon>
            <Favorite fontSize="large" />
          </StatIcon>
          <StatValue>{stats.uniqueReceivers}</StatValue>
          <StatLabel>❤️ People Recognized</StatLabel>
        </StyledPaper>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <StyledPaper gradient="linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)">
          <StatIcon>
            <EmojiEvents fontSize="large" />
          </StatIcon>
          <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <StatValue>{stats.topReceiver.count}</StatValue>
            <StatLabel>
              🏆 Most Praised
              <Box component="span" sx={{ display: 'block', fontWeight: 'bold', mt: 0.5, fontSize: '0.9rem' }}>
                {stats.topReceiver.name !== 'None' 
                  ? stats.topReceiver.name.split(' ')[0] 
                  : 'None yet!'}
              </Box>
            </StatLabel>
          </Box>
        </StyledPaper>
      </Grid>
    </Grid>
  );
};

export default PraiseStats;