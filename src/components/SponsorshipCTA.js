import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import Link from 'next/link';

const SponsorshipCTA = () => (
  <Box sx={{ mt: 4, p: 3, bgcolor: "#f0f8ff", borderRadius: 2, boxShadow: 1 }}>
    <Typography variant="h5" gutterBottom>
      Want to secure a judge position? Consider becoming a sponsor!
    </Typography>
    <Typography variant="body1" paragraph>
      Most of our judges come from our corporate sponsors. Sponsorship not
      only guarantees a judging slot but also provides additional benefits
      and visibility for your company.
    </Typography>
    <Link href="/sponsor" passHref>
      <Button component="a" variant="contained" color="primary">
        Learn About Sponsorship
      </Button>
    </Link>
  </Box>
);

export default SponsorshipCTA;
