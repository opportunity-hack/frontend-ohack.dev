import React from 'react';
import Head from 'next/head';
import { Typography, Box, Button, Paper } from '@mui/material';
import { LayoutContainer, TitleContainer, ProjectsContainer } from '../../../styles/nonprofit/styles';
import Link from 'next/link';
import CodeIcon from '@mui/icons-material/Code';

const PhotoRelease = () => {
  return (
    <LayoutContainer container>
      <Head>
        <title>Photo Release - Opportunity Hack</title>
        <meta name="description" content="Photo release agreement for Opportunity Hack hackathon participants. We are a nonprofit organization committed to coding for social good." />
        <meta name="keywords" content="Opportunity Hack, nonprofit, hackathon, photo release, media consent, image rights, coding for social good" />
      </Head>
      <TitleContainer>
        <Typography variant="h2" gutterBottom sx={{ fontSize: '3rem' }}>
          Photo Release Agreement
        </Typography>
      </TitleContainer>
      <ProjectsContainer>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.2rem' }}>
          Opportunity Hack is a nonprofit organization dedicated to leveraging technology for social good. By participating in the Opportunity Hack hackathon, you agree to the following photo release terms:
        </Typography>
        <Typography variant="body1" component="ol" sx={{ pl: 3, fontSize: '1.1rem' }}>
          {[
            "You grant Opportunity Hack and its affiliates the right and permission to use photographs, videos, and other media containing your image or likeness.",
            "This media will be used responsibly and ethically to promote our mission of coding for social good. This includes publicity, illustration, advertising, and web content related to Opportunity Hack and its events.",
            "We commit to selecting and using only the best and most appropriate images that reflect positively on our participants and our mission.",
            "You waive any right to inspect or approve the finished product, including written copy, wherein your likeness appears.",
            "You release Opportunity Hack and its affiliates from any claims arising from the use of your image or likeness, including claims of invasion of privacy, right of publicity, and copyright infringement.",
            "As a nonprofit, we do not use these images for commercial purposes, and you are not entitled to compensation for the use of your image or likeness.",
            "If you are under 18 years of age, you confirm that you have obtained the consent of a parent or legal guardian to agree to this release."
          ].map((text, index) => (
            <li key={index} style={{ marginBottom: '10px' }}>{text}</li>
          ))}
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontWeight: 'bold', mt: 2, fontSize: '1.2rem' }}>
          Opportunity Hack reserves the right to modify this photo release agreement at any time without prior notice. Continued participation in the hackathon following any such changes shall constitute your acceptance of the revised agreement.
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.2rem' }}>
          If you have any concerns about the use of your image, please contact the Opportunity Hack organizers immediately.
        </Typography>
        
        <Paper elevation={3} sx={{ p: 2, mt: 3, mb: 3, backgroundColor: '#f0f8ff' }}>
          <Box display="flex" alignItems="center">
            <CodeIcon sx={{ fontSize: 48, mr: 2, color: '#1976d2' }} />
            <Typography variant="h6" color="primary" sx={{ fontSize: '1.5rem' }}>Our Commitment:</Typography>
          </Box>
          <Typography variant="body1" sx={{ mt: 1, fontSize: '1.1rem' }}>
            As a nonprofit dedicated to coding for social good, we pledge to use your images responsibly. Our goal is to inspire others, showcase the positive impact of technology on society, and encourage more people to join our mission of using coding skills to make the world a better place.
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, fontStyle: 'italic', fontSize: '1rem' }}>
            Remember: Your participation helps us demonstrate the power of technology in creating positive change!
          </Typography>
        </Paper>

        <Paper elevation={3} sx={{ p: 2, mt: 3, mb: 3, backgroundColor: '#f0fff0' }}>
          <Box display="flex" alignItems="center">
            <CodeIcon sx={{ fontSize: 48, mr: 2, color: '#4caf50' }} />
            <Typography variant="h6" color="primary" sx={{ fontSize: '1.5rem' }}>Coder's Note:</Typography>
          </Box>
          <Typography variant="body1" sx={{ mt: 1, fontSize: '1.1rem' }}>
            By signing this agreement, you also consent to having your "eureka moment" captured when you finally solve that complex algorithm for a nonprofit's project. Don't worry, we promise to showcase your brilliance, not your caffeine-induced coding frenzy!
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, fontStyle: 'italic', fontSize: '1rem' }}>
            Remember: In the world of coding for good, every snapshot tells a story of positive change!
          </Typography>
        </Paper>

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

export default PhotoRelease;