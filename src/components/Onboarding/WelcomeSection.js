import React from 'react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import GroupsIcon from '@mui/icons-material/Groups';
import CodeIcon from '@mui/icons-material/Code';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import HandshakeIcon from '@mui/icons-material/Handshake';
import { useAuthInfo } from '@propelauth/react';
import StepHeader from './StepHeader';

const BenefitCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'border-color 0.2s',
  '&:hover': {
    borderColor: '#1B3A6B'
  }
}));

const CardIconContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  padding: theme.spacing(2, 0),
}));

/**
 * Welcome section component for onboarding
 * Greets the user by name if authenticated and provides an overview of Opportunity Hack
 */
const WelcomeSection = () => {
  const { user, isLoading } = useAuthInfo();
  
  const benefitItems = [
    {
      title: 'Build Real-World Solutions',
      icon: <CodeIcon fontSize="large" color="primary" />,
      description: 'Develop meaningful tech solutions that address actual needs of nonprofit organizations.'
    },
    {
      title: 'Connect with Community',
      icon: <GroupsIcon fontSize="large" color="primary" />,
      description: 'Join a vibrant community of like-minded developers passionate about using tech for good.'
    },
    {
      title: 'Make a Difference',
      icon: <VolunteerActivismIcon fontSize="large" color="primary" />,
      description: "Directly impact nonprofits' ability to serve their communities more effectively."
    },
    {
      title: 'Grow Your Skills',
      icon: <HandshakeIcon fontSize="large" color="primary" />,
      description: 'Enhance your technical, collaborative, and leadership skills while working on real projects.'
    }
  ];

  return (
    <Box>
      {/* Welcome header with personalized greeting */}
      <StepHeader
        title={`Welcome to Opportunity Hack${!isLoading && user && user.firstName ? `, ${user.firstName}!` : '!'}`}
        subtitle="Where technology meets social impact"
      />
      <Typography variant="body1" paragraph sx={{ maxWidth: '700px', mx: 'auto', mb: 4, fontSize: '1.2rem', textAlign: 'center' }}>
        Thank you for joining our community of technologists dedicated to creating sustainable solutions for nonprofits.
        This onboarding will help you understand our mission, get connected with the community, and start making an impact.
      </Typography>

      {/* Key benefits */}
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
        What You'll Gain
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {benefitItems.map((item, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <BenefitCard>
              <CardIconContainer>
                {item.icon}
              </CardIconContainer>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography 
                  variant="h6" 
                  component="h3" 
                  gutterBottom 
                  align="center"
                  sx={{ fontSize: '1.5rem' }}
                >
                  {item.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="textSecondary" 
                  align="center" 
                  sx={{ fontSize: '1.15rem' }}
                >
                  {item.description}
                </Typography>
              </CardContent>
            </BenefitCard>
          </Grid>
        ))}
      </Grid>

      {/* Social proof — the praise board */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          border: '1px solid #1B3A6B',
          backgroundColor: 'rgba(27, 58, 107, 0.04)',
          textAlign: 'center'
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
          Don't just take our word for it 💙
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '1.2rem', maxWidth: '700px', mx: 'auto' }}>
          Our{' '}
          <Link href="/praise" style={{ color: '#1B3A6B', fontWeight: 600 }}>
            praise board
          </Link>{' '}
          is a live feed of community members publicly recognizing each other's work — mentors
          thanking hackers, teammates celebrating teammates. That's the community you're joining,
          and once you're in, your work gets recognized the same way.
        </Typography>
      </Paper>

      {/* What to expect in this onboarding */}
      <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h5" gutterBottom sx={{ fontSize: '2rem' }}>
          In This Onboarding, You'll:
        </Typography>
        <List>
          {[
            'Learn about our mission and core values',
            "See how a project goes from a nonprofit's problem to production software",
            'Find the role that fits you — hacker, mentor, judge, or volunteer',
            'Get a tour of ohack.dev and what to do first on the site',
            'Get set up on Slack and introduce yourself to the community',
            'Get answers to frequently asked questions',
            'Provide feedback to help us improve'
          ].map((item, index) => (
            <ListItem key={index} sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <CheckCircleOutlineIcon color="success" />
              </ListItemIcon>
              <ListItemText 
                primary={item} 
                primaryTypographyProps={{ fontSize: '1.25rem' }}
              />
            </ListItem>
          ))}
        </List>
        <Box mt={2}>
          <Typography variant="body1" sx={{ fontSize: '1.3rem' }}>
            Let's get started! Click the <strong>Next</strong> button below to begin your journey with Opportunity Hack.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default WelcomeSection;