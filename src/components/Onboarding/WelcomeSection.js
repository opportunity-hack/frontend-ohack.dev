import React from 'react';
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

const BenefitCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)'
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
      <Box mb={4} textAlign="center">
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to Opportunity Hack
          {!isLoading && user && user.firstName ? `, ${user.firstName}!` : '!'}
        </Typography>
        <Typography variant="h5" color="textSecondary" gutterBottom>
          Where technology meets social impact
        </Typography>
        <Divider sx={{ mt: 2, mb: 3, mx: 'auto', width: '70%' }} />
        <Typography variant="body1" paragraph sx={{ maxWidth: '700px', mx: 'auto' }}>
          Thank you for joining our community of technologists dedicated to creating sustainable solutions for nonprofits.
          This onboarding will help you understand our mission, get connected with the community, and start making an impact.
        </Typography>
      </Box>

      {/* Key benefits */}
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
        What You'll Gain
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {benefitItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <BenefitCard>
              <CardIconContainer>
                {item.icon}
              </CardIconContainer>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h3" gutterBottom align="center">
                  {item.title}
                </Typography>
                <Typography variant="body2" color="textSecondary" align="center">
                  {item.description}
                </Typography>
              </CardContent>
            </BenefitCard>
          </Grid>
        ))}
      </Grid>

      {/* What to expect in this onboarding */}
      <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h5" gutterBottom>
          In This Onboarding, You'll:
        </Typography>
        <List>
          {[
            'Learn about our mission and core values',
            'Discover key Slack channels and community resources',
            'Introduce yourself to the community',
            'Find a buddy to help guide your first steps',
            'Get answers to frequently asked questions',
            'Provide feedback to help us improve'
          ].map((item, index) => (
            <ListItem key={index} sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <CheckCircleOutlineIcon color="success" />
              </ListItemIcon>
              <ListItemText primary={item} />
            </ListItem>
          ))}
        </List>
        <Box mt={2}>
          <Typography variant="body1">
            Let's get started! Click the <strong>Next</strong> button below to begin your journey with Opportunity Hack.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default WelcomeSection;