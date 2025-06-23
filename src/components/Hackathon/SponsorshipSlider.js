import React, { useState, useEffect } from 'react';
import { Slider, Typography, Paper, Grid, Box, Stack} from '@mui/material';
import { styled } from '@mui/material/styles';


const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(2, 0),
}));

const SponsorshipSlider = ({ sponsorLevels, setSelectedAmount }) => {
  const [hours, setHours] = useState(0);
  const [donation, setDonation] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(null);

  const calculateSupport = (hours, donation) => hours * 100 + donation;

  useEffect(() => {
    const totalSupport = calculateSupport(hours, donation);
    const level = sponsorLevels
      .slice()
      .reverse()
      .find(level => totalSupport >= level.minSupport);
    setCurrentLevel(level || null);

    setSelectedAmount(donation);
  }, [hours, donation, sponsorLevels]);

  return (
    <StyledPaper>
      <Typography variant="h6" gutterBottom>
        Become a Sponsor
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography gutterBottom>Volunteer Hours: {hours}</Typography>
          <Slider
            value={hours}
            onChange={(_, newValue) => setHours(newValue)}
            valueLabelDisplay="auto"
            step={10}
            marks
            min={0}
            max={200}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography gutterBottom>Donation Amount: ${donation}</Typography>
          <Slider
            value={donation}
            onChange={(_, newValue) => setDonation(newValue)}
            valueLabelDisplay="auto"
            step={500}
            marks
            min={0}
            max={10000}
          />
        </Grid>
      </Grid>
      
      <Box mt={2}>
  <Typography variant="body1">
    Total Support: ${calculateSupport(hours, donation)}
  </Typography>
  {currentLevel ? (
    <Box display="flex" alignItems="center">
      <Typography variant="body1">Current Sponsorship Level:</Typography>
          <Box 
            ml={1} 
            px={2} 
            py={0.5} 
            bgcolor={currentLevel.color} 
            borderRadius={1}
          >
            <Typography 
              variant="body1" 
              style={{ 
                fontWeight: 'bold',
                color: 'black' // or any other color that contrasts well with the background
              }}
            >
              {currentLevel.name}
            </Typography>
          </Box>
        </Box>
      ) : (
        <Typography variant="body1">
          Increase your support to reach a sponsorship level
        </Typography>
      )}
    </Box>

    </StyledPaper>
  );
};

export default SponsorshipSlider;