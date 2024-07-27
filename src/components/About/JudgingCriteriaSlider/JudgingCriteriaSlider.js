import React from 'react';
import { Box, Slider, Typography, Tooltip, Paper } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

const JudgingCriteriaSlider = ({ criterion, value, onChange, maxPoints }) => {
  const getDescription = (score) => {
    const descriptions = {
      1: "Poor - Significantly below expectations",
      2: "Fair - Below expectations",
      3: "Good - Meets expectations",
      4: "Very Good - Exceeds expectations",
      5: "Excellent - Significantly exceeds expectations"
    };

    return descriptions[score] || "";
  };

  const marks = [1, 2, 3, 4, 5].map(score => ({
    value: score,
    label: (
      <Tooltip title={getDescription(score)} arrow placement="top">
        <span>{score}</span>
      </Tooltip>
    )
  }));

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {criterion.name} ({maxPoints} points)
        </Typography>
        <Tooltip title={criterion.tip} arrow>
          <InfoIcon color="primary" />
        </Tooltip>
      </Box>
      <Slider
        value={value}
        onChange={(_, newValue) => onChange(criterion.category, newValue)}
        aria-labelledby={`${criterion.category}-slider`}
        valueLabelDisplay="auto"
        step={1}
        marks={marks}
        min={1}
        max={5}
        sx={{ mt: 3 }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        <Typography variant="caption">Poor</Typography>
        <Typography variant="caption">Excellent</Typography>
      </Box>
      <Typography variant="body2" sx={{ mt: 2 }}>
        Current Score: {value} / 5 ({(value / 5 * maxPoints).toFixed(1)} points)
      </Typography>
    </Paper>
  );
};

export default JudgingCriteriaSlider;