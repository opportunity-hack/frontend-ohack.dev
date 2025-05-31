import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Card,
  CardContent,
  Divider,
  Avatar,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';

const ValueCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[10]
  }
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 56,
  height: 56,
  margin: '0 auto',
  backgroundColor: theme.palette.primary.main,
  marginBottom: theme.spacing(2)
}));

const HighlightText = styled('span')(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: '2px 6px',
  borderRadius: 4
}));

/**
 * Mission Overview component
 * Provides information about Opportunity Hack's mission, values, and goals
 */
const MissionOverview = () => {
  const coreValues = [
    {
      title: 'Sustainable Solutions',
      description: 'We create long-term, maintainable solutions that continue to serve nonprofits well beyond the hackathon.'
    },
    {
      title: 'Community-Centric',
      description: 'We build a supportive community where developers of all skill levels can learn, contribute, and grow together.'
    },
    {
      title: 'Nonprofit Partnership',
      description: 'We work directly with nonprofits to understand their needs and build technology that truly serves their mission.'
    },
    {
      title: 'Knowledge Sharing',
      description: 'We openly share skills, code, and best practices to elevate each other and maximize our collective impact.'
    }
  ];

  const impactNumbers = [
    { value: '170+', label: 'Projects Completed' },
    { value: '2000+', label: 'Volunteers' },
    { value: '100+', label: 'Nonprofits Served' },
    { value: '10+', label: 'Years of Impact' }
  ];

  return (
    <Box>
      {/* Mission statement */}
      <Box mb={4} textAlign="center">
        <Typography variant="h3" component="h1" gutterBottom>
          Our Mission
        </Typography>
        <Divider sx={{ mt: 2, mb: 3, mx: 'auto', width: '70%' }} />
        <Typography variant="h5" paragraph sx={{ fontWeight: 400, maxWidth: '800px', mx: 'auto', fontStyle: 'italic' }}>
            To <b>empower</b> nonprofits through <b>sustainable technology </b>
            solutions by connecting them with passionate <b>volunteer developers</b>.
        </Typography>
      </Box>

      {/* How we work */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          How We Work
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.25rem' }}>
          Opportunity Hack creates a collaborative ecosystem where technology professionals and nonprofits come together 
          to solve real-world challenges. We organize hackathons, ongoing project development, and educational resources 
          to help nonprofits leverage technology effectively.
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '1.25rem' }}>
          Unlike traditional hackathons, our focus goes beyond the initial event. We build lasting solutions and maintain 
          ongoing relationships with nonprofits to ensure that projects continue to evolve and serve their needs over time.
        </Typography>
      </Paper>

      {/* Impact numbers */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {impactNumbers.map((item, index) => (
          <Grid item xs={6} sm={3} key={index}>
            <Paper elevation={0} sx={{ 
              p: 3, 
              textAlign: 'center',
              bgcolor: 'background.paper', 
              borderRadius: 2, 
              border: '1px solid', 
              borderColor: 'divider' 
            }}>
              <Typography variant="h3" color="primary" gutterBottom>
                {item.value}
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '1.3rem' }}>
                {item.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Core values */}
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center' }}>
        Our Core Values
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {coreValues.map((value, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <ValueCard>
              <CardContent>
                <StyledAvatar>{value.title.charAt(0)}</StyledAvatar>
                <Typography
                  variant="h6"
                  component="h3"
                  gutterBottom
                  align="center"
                  sx={{ fontSize: '1.5rem' }}
                >
                  {value.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  align="center"
                  sx={{ fontSize: '1.15rem' }}
                >
                  {value.description}
                </Typography>
              </CardContent>
            </ValueCard>
          </Grid>
        ))}
      </Grid>

      {/* Who we serve */}
      <Typography variant="h4" gutterBottom>
        Who We Serve
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
        {[
          'Homeless Services', 'Education', 'Food Security', 'Animal Welfare', 
          'Environmental Conservation', 'Mental Health', 'Youth Services', 
          'Elderly Care', 'Disaster Relief', 'Arts & Culture', 'Human Rights'
        ].map((cause, index) => (
          <Chip 
            key={index} 
            label={cause} 
            color={index % 3 === 0 ? 'primary' : index % 3 === 1 ? 'secondary' : 'default'}
            variant={index % 2 === 0 ? 'filled' : 'outlined'}
            sx={{
              fontSize: '1.2rem',
              height: 37,
              px: 2.5,
              py: 1,
              borderRadius: 5,
            }}
          />
        ))}
      </Box>
      <Typography variant="body1" sx={{ fontSize: '1.3rem' }}>
        We work with nonprofits of all sizes and focus areas who could benefit from technology solutions 
        but may lack the resources or expertise to implement them on their own.
      </Typography>
    </Box>
  );
};

export default MissionOverview;