import React from 'react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Alert
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import CodeIcon from '@mui/icons-material/Code';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import PersonIcon from '@mui/icons-material/Person';
import TimerIcon from '@mui/icons-material/Timer';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ArticleIcon from '@mui/icons-material/Article';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import GitHubIcon from '@mui/icons-material/GitHub';
import ForumIcon from '@mui/icons-material/Forum';
import VideocamIcon from '@mui/icons-material/Videocam';
import BadgeIcon from '@mui/icons-material/Badge';
import StepHeader from './StepHeader';

const NAVY = '#1B3A6B';

const firstSteps = [
  {
    title: 'Create your ohack.dev account',
    description:
      'Use the Log In button at the top right — most people sign in with their Google account. This gives you a profile, event applications, and volunteer-hour tracking.'
  },
  {
    title: 'Also join our Slack workspace',
    description:
      'This is a separate (free) account that most new members miss: ohack.dev is where you apply and track your work; Slack is where the collaboration actually happens. The signup guide at ohack.dev/signup walks you through joining.'
  },
  {
    title: 'Pick an upcoming hackathon',
    description:
      'Browse events at ohack.dev/hack and open the one you want to join. Submit the application for your role (hacker, mentor, judge, or volunteer) right on the event page.'
  },
  {
    title: 'Form or join a team',
    description:
      'Once your hacker application is in, use the event page\'s team tools to create a team or join one with a team code shared by a teammate. Then build!'
  }
];

const destinations = [
  {
    icon: <EventIcon />,
    path: '/hack',
    title: 'Hackathons',
    description:
      'Upcoming and past events. Each event page is a hub: schedule, nonprofits and their problems, the team list, application forms for every role, and results after judging.'
  },
  {
    icon: <CodeIcon />,
    path: '/projects',
    title: 'Projects',
    description:
      'Every project we\'ve scoped for a nonprofit, searchable and filterable by status. Each project page shows the description, GitHub repo, and the project\'s Slack channel. To get involved with a project that needs help, sign in and slide its "Want to help?" toggle, then join its Slack channel.'
  },
  {
    icon: <VolunteerActivismIcon />,
    path: '/nonprofits',
    title: 'Nonprofits',
    description:
      'The organizations we build for, with their projects. Nonprofits can also apply here to bring us a new challenge.'
  },
  {
    icon: <PersonIcon />,
    path: '/profile',
    title: 'Your profile',
    description:
      'Your applications, volunteer history, and skills. You also get a public profile page you can share or link from a résumé.'
  },
  {
    icon: <TimerIcon />,
    path: '/volunteer/track',
    title: 'Track volunteer hours',
    description:
      'Log your volunteering time — start a live session while you work, or record hours after the fact. Great for service-hour requirements and seeing your own impact add up.'
  },
  {
    icon: <FavoriteIcon />,
    path: '/praise',
    title: 'Praise board',
    description:
      'Public shout-outs from the community. Send one any time from Slack with the /praise command.'
  },
  {
    icon: <ArticleIcon />,
    path: '/blog',
    title: 'Blog',
    description: 'News, event recaps, and community stories.'
  },
  {
    icon: <SupportAgentIcon />,
    path: '/office-hours',
    title: 'Office hours',
    description: 'Weekly open sessions where you can ask the organizers anything, live.'
  }
];

const portfolioSurfaces = [
  {
    icon: <GitHubIcon />,
    title: 'GitHub',
    description:
      'The code you shipped and the issue tickets you wrote and closed. Every project page has a "Code & Tasks" section linking each repo and its Issues.'
  },
  {
    icon: <ForumIcon />,
    title: 'Slack',
    description:
      'Public channels show how you communicate: how you ask questions, unblock teammates, and coordinate work — the collaboration skills a résumé can only claim.'
  },
  {
    icon: <VideocamIcon />,
    title: 'Demo videos',
    description:
      'Each team uploads a demo of what they built. Yours lives on the event and team pages — a working walkthrough you can send to anyone.'
  },
  {
    icon: <BadgeIcon />,
    title: 'Your public profile',
    description:
      'Your ohack.dev profile has a public page you can link from a résumé or LinkedIn, tying your history here together.'
  },
  {
    icon: <FavoriteIcon />,
    title: 'Praise from teammates',
    description:
      'Public recognition from the people you actually worked with, on the praise board — third-party proof of your contributions that no résumé bullet can match.'
  }
];

/**
 * WebsiteTourSection
 * A practical map of ohack.dev: where things live and the first actions a
 * new member should take on the site.
 */
const WebsiteTourSection = () => {
  return (
    <Box>
      <StepHeader
        title="Using ohack.dev"
        subtitle="Where everything lives on the website, and what to do first"
      />

      {/* First steps */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h5" gutterBottom sx={{ fontSize: '1.7rem', fontWeight: 'bold' }}>
          Your first steps
        </Typography>
        {firstSteps.map((step, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'flex-start' }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: NAVY,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                flexShrink: 0,
                mt: 0.3
              }}
            >
              {index + 1}
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                {step.title}
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '1.1rem', color: 'text.secondary' }}>
                {step.description}
              </Typography>
            </Box>
          </Box>
        ))}
      </Paper>

      {/* Site map */}
      <Typography variant="h5" gutterBottom sx={{ fontSize: '1.7rem', fontWeight: 'bold' }}>
        Where everything lives
      </Typography>
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {destinations.map((destination) => (
          <Grid size={{ xs: 12, sm: 6 }} key={destination.path}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                height: '100%',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Box sx={{ color: NAVY, display: 'flex', '& svg': { fontSize: '1.8rem' } }}>
                  {destination.icon}
                </Box>
                <Box>
                  <Link href={destination.path} style={{ textDecoration: 'none' }}>
                    <Typography variant="h6" sx={{ fontSize: '1.3rem', fontWeight: 'bold', color: NAVY }}>
                      {destination.title}
                    </Typography>
                  </Link>
                  <Typography variant="body2" sx={{ fontSize: '0.95rem', color: 'text.secondary', fontFamily: 'monospace' }}>
                    ohack.dev{destination.path}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body1" sx={{ fontSize: '1.08rem' }}>
                {destination.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Alert severity="info" sx={{ mb: 4, '& .MuiAlert-message': { fontSize: '1.1rem' } }}>
        <strong>The event page is your home base during a hackathon.</strong> From it you can
        apply, see the nonprofits and their problems, form or manage your team, check the
        schedule and countdowns, reach mentors, and — after judging — see the results.
      </Alert>

      {/* Work in public / portfolio */}
      <Paper
        elevation={0}
        sx={{ p: 3, borderRadius: 2, border: `1px solid ${NAVY}`, backgroundColor: 'rgba(27, 58, 107, 0.04)' }}
      >
        <Typography variant="h5" gutterBottom sx={{ fontSize: '1.7rem', fontWeight: 'bold' }}>
          Everything you do here builds a public portfolio
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.15rem' }}>
          All our work happens in the open. That means when a recruiter or hiring manager wants
          more than a résumé bullet, you can show them the real thing:
        </Typography>
        <Grid container spacing={2.5} sx={{ mb: 2 }}>
          {portfolioSurfaces.map((surface) => (
            <Grid size={{ xs: 12, sm: 6 }} key={surface.title}>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <Box sx={{ color: NAVY, display: 'flex', mt: 0.4, '& svg': { fontSize: '1.7rem' } }}>
                  {surface.icon}
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                    {surface.title}
                  </Typography>
                  <Typography variant="body1" sx={{ fontSize: '1.08rem', color: 'text.secondary' }}>
                    {surface.description}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', backgroundColor: '#fff' }}>
          <Typography variant="h6" sx={{ fontSize: '1.25rem', fontWeight: 'bold', mb: 0.5 }}>
            No GitHub Issues in a repo yet? That&apos;s your opening.
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
            We document all work as GitHub Issues — closed tickets are public credit for what you
            (and everyone after you) contributed. If a project&apos;s repo has no issues yet, pull
            the code down, run it, and think like a product manager: write the issue tickets that
            capture the work to be done. Writing good tickets is a real, visible contribution.
          </Typography>
        </Paper>
      </Paper>
    </Box>
  );
};

export default WebsiteTourSection;
