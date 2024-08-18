import React from 'react';
import Head from 'next/head';
import { Typography, Box, Button } from '@mui/material';
import { LayoutContainer, TitleContainer, ProjectsContainer } from '../../../styles/nonprofit/styles';
import Link from 'next/link';

const LiabilityWaiver = () => {
  return (
    <LayoutContainer container>
      <Head>
        <title>Liability Waiver - Opportunity Hack</title>
        <meta name="description" content="Liability waiver for Opportunity Hack hackathon participants." />
        <meta name="keywords" content="Opportunity Hack, hackathon, liability waiver, legal agreement" />
      </Head>
      <TitleContainer>
        <Typography variant="h2" gutterBottom sx={{ fontSize: '3rem' }}>
          Liability Waiver
        </Typography>
      </TitleContainer>
      <ProjectsContainer>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.2rem' }}>
          By participating in the Opportunity Hack hackathon, you agree to the following terms and conditions:
        </Typography>
        <Typography variant="body1" component="ol" sx={{ pl: 3, fontSize: '1.1rem' }}>
          {[
            "You acknowledge that participation in the hackathon may involve risks and you voluntarily assume all risks associated with your participation.",
            "You release Opportunity Hack, its organizers, sponsors, and affiliates from any and all liability for any loss, damage, injury, or expense that you may suffer as a result of your participation in the hackathon.",
            "You agree to indemnify and hold harmless Opportunity Hack, its organizers, sponsors, and affiliates from any and all claims, actions, suits, procedures, costs, expenses, damages, and liabilities arising out of your participation in the hackathon.",
            "You grant Opportunity Hack the right to use your name, likeness, and any content you create during the hackathon for promotional purposes without compensation.",
            "You agree to comply with all applicable laws, regulations, and hackathon rules during your participation."
          ].map((text, index) => (
            <li key={index} style={{ marginBottom: '10px' }}>{text}</li>
          ))}
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontWeight: 'bold', mt: 2, fontSize: '1.2rem' }}>
          Opportunity Hack reserves the right to modify this waiver at any time without prior notice. Continued participation in the hackathon following any such changes shall constitute your acceptance of the revised waiver.
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="contained" color="primary" component={Link} href="/sponsor" sx={{ fontSize: '1rem' }}>
            Become a Sponsor
          </Button>
          <Button variant="outlined" color="primary" component={Link} href="/about/mentors" sx={{ fontSize: '1rem' }}>
            Learn about Mentoring
          </Button>
          <Button variant="outlined" color="primary" component={Link} href="/about/judges" sx={{ fontSize: '1rem' }}>
            Become a Judge
          </Button>
        </Box>
      </ProjectsContainer>
    </LayoutContainer>
  );
};

export default LiabilityWaiver;