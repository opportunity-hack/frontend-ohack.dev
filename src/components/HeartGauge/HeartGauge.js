import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Typography, Box, Link, useTheme, useMediaQuery } from '@mui/material';
import { FaHeart, FaInfoCircle } from 'react-icons/fa';

const COLORS = ['#0088FE', '#f3f3f3'];
const MAX_HEARTS = 48;

const rewards = [
  { hearts: 2, reward: "Certificate" },
  { hearts: 4, reward: "IG/FB Shoutout" },
  { hearts: 5, reward: "LinkedIn Recommendation" },
  { hearts: 6, reward: "Interview prep & resume review" },
  { hearts: 10, reward: "Reference for job application" },
  { hearts: 24, reward: "Opportunity Hack swag" },
  { hearts: 48, reward: "Sponsor-provided tech award" },
];

const countHearts = (h) => {
    var total = 0;
    if (!h || !h.how || !h.what) {
        console.log("countHearts", "null history");
        return total;
    }

    for (const [key, value] of Object.entries(h.how)) {
        console.log("countHearts", key, value);
        total += value;
    }
    for (const [key, value] of Object.entries(h.what)) {
        total += value;
    }
    return total;
}

const HeartGauge = ({ history }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const hearts = useMemo(() => countHearts(history), [history]);

  const data = [
    { name: 'Progress', value: hearts },
    { name: 'Remaining', value: MAX_HEARTS - hearts },
  ];

  const nextReward = rewards.find(r => r.hearts > hearts) || rewards[rewards.length - 1];

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'center' : 'flex-start',
      justifyContent: 'flex-start',      
      p: isMobile ? 1 : 2, 
      width: '100%',
      maxWidth: '50%',
      boxSizing: 'border-box',
    }}>
      <Box sx={{ 
        width: isMobile ? '100%' : '50%', 
        maxWidth: isMobile ? '100%' : '300px',
        aspectRatio: '2/1',
        position: 'relative',
        mb: isMobile ? 2 : 0
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              startAngle={180}
              endAngle={0}
              innerRadius="60%"
              outerRadius="100%"
              paddingAngle={0}
              dataKey="value"
              blendStroke
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <Box 
          sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -20%)',
            textAlign: 'center'
          }}
        >
          <Typography variant="h4" component="div">
            <FaHeart color="red" />
          </Typography>
          <Typography variant="h5" component="div">
            {hearts} / {MAX_HEARTS}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ 
        width: isMobile ? '100%' : '50%', 
        pl: isMobile ? 0 : 2,
        textAlign: isMobile ? 'center' : 'left',
        boxSizing: 'border-box',
      }}>
        <Typography variant="h4" gutterBottom>Heart Progress</Typography>
        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
          Next reward at {nextReward.hearts} hearts:
        </Typography>
        <Typography variant="body1">
          {nextReward.reward}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
          Keep contributing to earn more hearts and unlock rewards!
        </Typography>
        <Link 
          href="https://www.ohack.dev/about/hearts" 
          target="_blank" 
          rel="noopener noreferrer"
          sx={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            mt: 2, 
            color: 'primary.main',
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          <FaInfoCircle style={{ marginRight: '5px' }} />
          Learn more about hearts and rewards
        </Link>
      </Box>
    </Box>
  );
};

export default HeartGauge;