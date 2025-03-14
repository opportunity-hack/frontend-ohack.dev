import React, { useMemo } from 'react';
import { Paper, Box, Typography, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PeopleIcon from '@mui/icons-material/People';
import ForumIcon from '@mui/icons-material/Forum';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  height: '100%',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
  },
}));

const StatIcon = styled(Box)(({ theme, color }) => ({
  backgroundColor: color,
  color: 'white',
  width: 64,
  height: 64,
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const StatValue = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 'bold',
  marginBottom: theme.spacing(1),
}));

const StatLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textAlign: 'center',
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

    return {
      totalPraises: praises.length,
      uniqueSenders: senders.size,
      uniqueReceivers: receivers.size,
      topReceiver,
    };
  }, [praises]);

  return (
    <Grid container spacing={3} sx={{ mb: 6, mt: 1 }}>
      <Grid item xs={12} sm={6} md={3}>
        <StyledPaper>
          <StatIcon color="#4caf50">
            <ForumIcon fontSize="large" />
          </StatIcon>
          <StatValue>{stats.totalPraises}</StatValue>
          <StatLabel>Total Praises</StatLabel>
        </StyledPaper>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <StyledPaper>
          <StatIcon color="#2196f3">
            <PeopleIcon fontSize="large" />
          </StatIcon>
          <StatValue>{stats.uniqueSenders}</StatValue>
          <StatLabel>Unique Praise Givers</StatLabel>
        </StyledPaper>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <StyledPaper>
          <StatIcon color="#f44336">
            <FavoriteIcon fontSize="large" />
          </StatIcon>
          <StatValue>{stats.uniqueReceivers}</StatValue>
          <StatLabel>People Recognized</StatLabel>
        </StyledPaper>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <StyledPaper>
          <StatIcon color="#ff9800">
            <EmojiEventsIcon fontSize="large" />
          </StatIcon>
          <Box sx={{ textAlign: 'center' }}>
            <StatValue>{stats.topReceiver.count}</StatValue>
            <StatLabel>
              Most Praised: 
              <Box component="span" sx={{ display: 'block', fontWeight: 'medium', mt: 0.5 }}>
                {stats.topReceiver.name !== 'None' 
                  ? stats.topReceiver.name.split(' ')[0] 
                  : 'None'}
              </Box>
            </StatLabel>
          </Box>
        </StyledPaper>
      </Grid>
    </Grid>
  );
};

export default PraiseStats;