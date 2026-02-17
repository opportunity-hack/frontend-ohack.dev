import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SchoolIcon from '@mui/icons-material/School';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import GroupsIcon from '@mui/icons-material/Groups';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const MentorTypeCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[10]
  }
}));

/**
 * MentoringOverview component
 * Provides information about mentoring opportunities at Opportunity Hack
 */
const MentoringOverview = () => {
  const mentorTypes = [
    {
      title: 'Technical Mentors',
      description: 'Guide teams on technical implementation, architecture decisions, and best practices',
      icon: '💻',
      color: 'primary'
    },
    {
      title: 'Domain Experts',
      description: 'Provide expertise in specific areas like security, accessibility, or nonprofit operations',
      icon: '🎯',
      color: 'secondary'
    },
    {
      title: 'General Mentors',
      description: 'Help with project planning, team dynamics, and general hackathon guidance',
      icon: '🤝',
      color: 'success'
    }
  ];

  const bestPractices = [
    'You\'re a guide, not a team member',
    'Ask questions to understand the team\'s vision first',
    'Provide guidance without taking over the project',
    'Help teams scope their work realistically',
    'Point teams to resources rather than doing the work',
    'Encourage teams to document their decisions',
    'Check in regularly but respect team autonomy',
    'Celebrate progress and keep energy positive'
  ];

  const whyMentor = [
    {
      title: 'Make an Impact',
      description: 'Help teams create meaningful solutions for nonprofits',
      icon: <EmojiObjectsIcon fontSize="large" color="primary" />
    },
    {
      title: 'Share Your Expertise',
      description: 'Use your skills to guide the next generation of developers',
      icon: <SchoolIcon fontSize="large" color="primary" />
    },
    {
      title: 'Build Community',
      description: 'Connect with passionate technologists and nonprofits',
      icon: <GroupsIcon fontSize="large" color="primary" />
    },
    {
      title: 'Flexible Time Commitment',
      description: 'Choose your availability and engagement level',
      icon: <AccessTimeIcon fontSize="large" color="primary" />
    }
  ];

  return (
    <Box>
      {/* Header */}
      <Box mb={3} textAlign="center">
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontSize: '2.5rem' }}>
          Mentoring at Opportunity Hack
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" sx={{ fontSize: '1.25rem' }}>
          Guide teams to create impactful solutions for nonprofits
        </Typography>
        <Divider sx={{ mt: 2, mb: 3 }} />
      </Box>

      {/* Video section */}
      <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 2, bgcolor: 'background.default' }}>
        <Typography variant="h4" gutterBottom align="center">
          Becoming a Hackathon Mentor
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.15rem', textAlign: 'center', mb: 3, color: 'text.secondary' }}>
          Learn what it takes to be an effective mentor and make a lasting impact on hackathon teams.
        </Typography>

        <Box sx={{
          position: 'relative',
          paddingBottom: '56.25%',
          height: 0,
          overflow: 'hidden',
          maxWidth: '100%',
          borderRadius: 2,
          boxShadow: 3
        }}>
          <iframe
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 0
            }}
            src="https://www.youtube.com/embed/CllTEbzdQJY"
            title="Hackathon Mentoring at Opportunity Hack"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </Box>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="outlined"
            href="https://mentor.ohack.dev/"
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<SchoolIcon />}
            sx={{ fontSize: '1.1rem', px: 3, py: 1 }}
          >
            Apply to Be a Mentor
          </Button>
        </Box>
      </Paper>

      {/* Why be a mentor */}
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
        Why Become a Mentor?
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {whyMentor.map((reason, index) => (
          <Grid size={{ xs: 12, sm: 6 }} key={index}>
            <Paper
              elevation={1}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              <Box sx={{ mb: 2 }}>
                {reason.icon}
              </Box>
              <Typography variant="h6" gutterBottom sx={{ fontSize: '1.4rem', fontWeight: 'bold' }}>
                {reason.title}
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '1.15rem' }}>
                {reason.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Types of mentors */}
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
        Types of Mentors
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {mentorTypes.map((type, index) => (
          <Grid size={{ xs: 12, md: 4 }} key={index}>
            <MentorTypeCard>
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant="h2" component="div" sx={{ fontSize: '3rem' }}>
                    {type.icon}
                  </Typography>
                </Box>
                <Typography
                  variant="h6"
                  component="h3"
                  gutterBottom
                  align="center"
                  sx={{ fontSize: '1.5rem', fontWeight: 'bold' }}
                >
                  {type.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  align="center"
                  sx={{ fontSize: '1.15rem' }}
                >
                  {type.description}
                </Typography>
              </CardContent>
            </MentorTypeCard>
          </Grid>
        ))}
      </Grid>

      {/* Best practices */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          Mentor Best Practices
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.25rem', mb: 3 }}>
          Follow these guidelines to be an effective mentor and help teams succeed:
        </Typography>
        <Grid container spacing={2}>
          {bestPractices.map((practice, index) => (
            <Grid size={{ xs: 12, sm: 6 }} key={index}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <CheckCircleIcon color="primary" sx={{ mt: 0.5, flexShrink: 0 }} />
                <Typography variant="body1" sx={{ fontSize: '1.2rem' }}>
                  {practice}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* How it works */}
      <Typography variant="h4" gutterBottom>
        How Mentoring Works
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ p: 3, height: '100%', borderLeft: 4, borderColor: 'primary.main' }}>
            <Typography variant="h5" gutterBottom sx={{ fontSize: '1.6rem', fontWeight: 'bold' }}>
              Before the Hackathon
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Review nonprofit problems and project briefs"
                  primaryTypographyProps={{ fontSize: '1.15rem' }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Familiarize yourself with judging criteria"
                  primaryTypographyProps={{ fontSize: '1.15rem' }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Indicate your availability and preferred format"
                  primaryTypographyProps={{ fontSize: '1.15rem' }}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ p: 3, height: '100%', borderLeft: 4, borderColor: 'secondary.main' }}>
            <Typography variant="h5" gutterBottom sx={{ fontSize: '1.6rem', fontWeight: 'bold' }}>
              During the Hackathon
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="secondary" />
                </ListItemIcon>
                <ListItemText
                  primary="Check in with teams regularly via Slack or in-person"
                  primaryTypographyProps={{ fontSize: '1.15rem' }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="secondary" />
                </ListItemIcon>
                <ListItemText
                  primary="Help teams scope their work and stay on track"
                  primaryTypographyProps={{ fontSize: '1.15rem' }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="secondary" />
                </ListItemIcon>
                <ListItemText
                  primary="Track your mentoring hours for recognition"
                  primaryTypographyProps={{ fontSize: '1.15rem' }}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Mentoring options */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h5" gutterBottom>
          In-Person or Remote Mentoring
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.2rem' }}>
          You can mentor teams in person at our hackathon locations or remotely via Slack. Both options are equally valuable:
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box>
              <Chip label="In-Person" color="primary" sx={{ mb: 2, fontSize: '1.1rem' }} />
              <Typography variant="body1" sx={{ fontSize: '1.15rem' }}>
                Walk around the venue, meet teams face-to-face, and experience the energy of the event.
                Great for providing hands-on guidance and building connections.
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box>
              <Chip label="Remote" color="secondary" sx={{ mb: 2, fontSize: '1.1rem' }} />
              <Typography variant="body1" sx={{ fontSize: '1.15rem' }}>
                Mentor from anywhere via Slack channels. Perfect for domain experts or mentors who
                can't attend in person but want to contribute their expertise.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
    </Box>
  );
};

export default MentoringOverview;
