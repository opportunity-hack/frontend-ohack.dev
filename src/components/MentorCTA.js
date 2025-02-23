import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import Link from 'next/link';

const MentorCTA = () => (
  <Box sx={{
    mt: 4,
    p: 3,
    bgcolor: "background.paper",
    borderRadius: 2,
    boxShadow: 1,
  }}>
    <Typography variant="h5" gutterBottom>
      Not interested in judging? Consider becoming a mentor!
    </Typography>
    <Typography variant="body1" paragraph>
      As a mentor, you can share your expertise, guide teams through
      challenges, and make a lasting impact on innovative nonprofit
      solutions.
    </Typography>
    <Link href="/about/mentors" passHref>
      <Button component="a" variant="contained" color="primary">
        Learn About Mentoring
      </Button>
    </Link>
  </Box>
);

export default MentorCTA;
