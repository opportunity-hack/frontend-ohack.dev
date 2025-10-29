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
  Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import GavelIcon from '@mui/icons-material/Gavel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const CriteriaCard = styled(Card)(({ theme }) => ({
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
 * JudgingOverview component
 * Provides information about how projects are judged during Opportunity Hack hackathons
 */
const JudgingOverview = () => {
  const judgingCriteria = [
    {
      title: 'Scope',
      description: 'Does the solution address the nonprofit\'s problem? Is it complete and functional?',
      icon: '🎯'
    },
    {
      title: 'Documentation',
      description: 'Is the project well-documented? Can others understand and maintain the code?',
      icon: '📚'
    },
    {
      title: 'Polish',
      description: 'Is the user experience intuitive? Does the solution feel finished and professional?',
      icon: '✨'
    },
    {
      title: 'Security',
      description: 'Are best practices followed? Is user data protected and the application secure?',
      icon: '🔒'
    }
  ];

  const judgingStages = [
    {
      stage: 'Stage 1',
      description: 'Judges review all submitted projects with documentation, demos, and deployment links. Ask questions and record feedback.',
      timing: 'Review all projects'
    },
    {
      stage: 'Stage 2',
      description: 'Judges evaluate each project to determine its ranking based on the established criteria. This helps to identify winners and honorable mentions.',
      timing: 'Rank top projects'
    }
  ];

  return (
    <Box>
      {/* Header */}
      <Box mb={3} textAlign="center">
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontSize: '2.5rem' }}>
          Judging Overview
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" sx={{ fontSize: '1.25rem' }}>
          Learn how we evaluate hackathon projects and recognize outstanding work
        </Typography>
        <Divider sx={{ mt: 2, mb: 3 }} />
      </Box>

      {/* Video section */}
      <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 2, bgcolor: 'background.default' }}>
        <Typography variant="h4" gutterBottom align="center">
          Hackathon Judge Introduction
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.15rem', textAlign: 'center', mb: 3, color: 'text.secondary' }}>
          Discover the judging process, criteria, and what makes a winning project at Opportunity Hack.
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
            src="https://www.youtube.com/embed/L702RpJpjGM"
            title="Hackathon Judge: Opportunity Hack Intro 2025"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </Box>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="outlined"
            href="https://www.ohack.dev/about/judges"
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<GavelIcon />}
            sx={{ fontSize: '1.1rem', px: 3, py: 1 }}
          >
            View Complete Judging Guide
          </Button>
        </Box>
      </Paper>

      {/* Why become a judge */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          Why Become a Judge?
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.25rem' }}>
          Judging at Opportunity Hack is a rewarding way to give back to the community while gaining valuable experience:
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <CheckCircleIcon color="primary" sx={{ mt: 0.5 }} />
              <Typography variant="body1" sx={{ fontSize: '1.2rem' }}>
                Evaluate innovative solutions to real nonprofit challenges
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <CheckCircleIcon color="primary" sx={{ mt: 0.5 }} />
              <Typography variant="body1" sx={{ fontSize: '1.2rem' }}>
                Provide valuable feedback to help teams improve
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <CheckCircleIcon color="primary" sx={{ mt: 0.5 }} />
              <Typography variant="body1" sx={{ fontSize: '1.2rem' }}>
                Network with talented developers and social impact leaders
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <CheckCircleIcon color="primary" sx={{ mt: 0.5 }} />
              <Typography variant="body1" sx={{ fontSize: '1.2rem' }}>
                Contribute to sustainable technology solutions for nonprofits
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Judging stages */}
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
        Two-Stage Judging Process
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {judgingStages.map((item, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: '100%',
                borderLeft: 4,
                borderColor: 'primary.main'
              }}
            >
              <Chip
                label={item.timing}
                color="primary"
                size="small"
                sx={{ mb: 2, fontSize: '1rem' }}
              />
              <Typography variant="h5" gutterBottom sx={{ fontSize: '1.6rem', fontWeight: 'bold' }}>
                {item.stage}
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '1.2rem' }}>
                {item.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Judging criteria */}
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center' }}>
        Judging Criteria
      </Typography>
      <Typography variant="body1" paragraph sx={{ fontSize: '1.15rem', textAlign: 'center', mb: 3, color: 'text.secondary' }}>
        Projects are evaluated across four key dimensions
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {judgingCriteria.map((criteria, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <CriteriaCard>
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant="h2" component="div" sx={{ fontSize: '3rem' }}>
                    {criteria.icon}
                  </Typography>
                </Box>
                <Typography
                  variant="h6"
                  component="h3"
                  gutterBottom
                  align="center"
                  sx={{ fontSize: '1.5rem', fontWeight: 'bold' }}
                >
                  {criteria.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  align="center"
                  sx={{ fontSize: '1.15rem' }}
                >
                  {criteria.description}
                </Typography>
              </CardContent>
            </CriteriaCard>
          </Grid>
        ))}
      </Grid>
      
    </Box>
  );
};

export default JudgingOverview;
