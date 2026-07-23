import React from 'react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Chip,
  Button
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TimelineIcon from '@mui/icons-material/Timeline';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StepHeader from './StepHeader';

const NAVY = '#1B3A6B';

// Mirrors the six stages on /about/process — keep the two in sync.
const stages = [
  {
    title: 'Nonprofits share their challenges',
    description:
      'Nonprofits apply with real problems technology could solve — no tech expertise required. Our team reviews each application and works with the nonprofit to clarify scope, goals, and success criteria.'
  },
  {
    title: 'Problems become projects',
    description:
      'Each selected challenge is published as a project on ohack.dev/projects with a description, the skills needed, a GitHub repository — where the work to be done is documented as public GitHub Issues — and its own Slack channel where the work is coordinated.'
  },
  {
    title: 'The hackathon weekend',
    description:
      'Kickoff starts with nonprofit pitches. Hackers form teams around the projects that interest them, then spend the weekend building a working prototype. Mentors circulate in person and on Slack to help teams scope, architect, and get unstuck.'
  },
  {
    title: 'Demos and judging',
    description:
      'Teams demo what they built. Judges review every project, then deliberate to rank the top ones — evaluating scope, documentation, polish, and security. Winners are announced at the closing ceremony.'
  },
  {
    title: 'Winning teams keep building',
    description:
      'This is what makes us different from most hackathons: winning teams are invited to continue for roughly three months after the event, turning their prototype into production software with regular check-ins along the way.'
  },
  {
    title: 'Completion and handoff',
    description:
      'A project is finished when it meets our Definition of Done and the nonprofit signs off. The software goes live, the nonprofit gets documentation and training, and we check in quarterly to keep it healthy.'
  }
];

// Condensed from the Definition of Done on /about/completion.
const definitionOfDone = [
  'Deployed to a production environment real users can reach',
  'Nonprofit has signed off that it meets their needs',
  'All code, README, and docs live in the project GitHub repo',
  'Test login details shared securely (never in the repo)',
  'No secrets or sensitive data committed to GitHub',
  'Documentation covers how to use, deploy, and update it',
  'Open-sourced under the MIT license'
];

// Matches the status ladder shown on every project page (ProjectProgress).
const projectStatuses = [
  { label: 'Concept', description: 'An idea no one has built yet — needs a team' },
  { label: 'Hackathon', description: 'Worked on at one or more hackathons' },
  { label: 'Post-Hackathon', description: 'Development continuing after the event' },
  { label: 'Production', description: 'Live and being used by the nonprofit' },
  { label: 'Maintenance', description: 'Live, receiving patches and enhancements' }
];

/**
 * HowItWorksSection
 * The end-to-end Opportunity Hack lifecycle: from a nonprofit's problem,
 * through the hackathon, to completed software running in production.
 */
const HowItWorksSection = () => {
  return (
    <Box>
      <StepHeader
        title="How Opportunity Hack Works"
        subtitle="From a nonprofit's problem to software running in production"
      />

      <Typography variant="body1" paragraph sx={{ fontSize: '1.25rem' }}>
        Opportunity Hack is more than a weekend event. Our hackathons kick off projects, but the
        goal is always working software a nonprofit actually uses — which means the work continues
        after the closing ceremony until the project is deployed, documented, and handed off.
        Here&apos;s the full arc:
      </Typography>

      {/* Six stages */}
      <Box sx={{ my: 3 }}>
        {stages.map((stage, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2.5, alignItems: 'flex-start' }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: NAVY,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                flexShrink: 0,
                mt: 0.5
              }}
            >
              {index + 1}
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontSize: '1.4rem', fontWeight: 'bold' }}>
                {stage.title}
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '1.15rem', color: 'text.secondary' }}>
                {stage.description}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Definition of Done */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <FactCheckIcon sx={{ color: NAVY, fontSize: '2rem' }} />
          <Typography variant="h5" sx={{ fontSize: '1.7rem', fontWeight: 'bold' }}>
            What &ldquo;done&rdquo; means here
          </Typography>
        </Box>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.15rem' }}>
          Every project works toward the same completion checklist, so teams and nonprofits stay
          aligned on expectations:
        </Typography>
        <Grid container spacing={1}>
          {definitionOfDone.map((item, index) => (
            <Grid size={{ xs: 12, sm: 6 }} key={index}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <CheckCircleIcon sx={{ color: NAVY, mt: 0.4, fontSize: '1.3rem', flexShrink: 0 }} />
                <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                  {item}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 2 }}>
          <Button
            component={Link}
            href="/about/completion"
            variant="outlined"
            endIcon={<ArrowForwardIcon />}
            sx={{ fontSize: '1.05rem', textTransform: 'none', color: NAVY, borderColor: NAVY }}
          >
            Read the full Definition of Done
          </Button>
        </Box>
      </Paper>

      {/* Project status ladder */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <TimelineIcon sx={{ color: NAVY, fontSize: '2rem' }} />
          <Typography variant="h5" sx={{ fontSize: '1.7rem', fontWeight: 'bold' }}>
            Project statuses you&apos;ll see on the site
          </Typography>
        </Box>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.15rem' }}>
          Every project page shows where it is in this journey — it&apos;s the quickest way to tell
          which projects need help and which are already live:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
          {projectStatuses.map((status, index) => (
            <React.Fragment key={status.label}>
              <Box sx={{ textAlign: 'center', maxWidth: 190 }}>
                <Chip
                  label={status.label}
                  sx={{
                    fontSize: '1.05rem',
                    fontWeight: 'bold',
                    backgroundColor: index >= 3 ? NAVY : 'transparent',
                    color: index >= 3 ? '#fff' : 'text.primary',
                    border: `1px solid ${NAVY}`
                  }}
                />
                <Typography variant="body2" sx={{ fontSize: '0.95rem', mt: 0.5, color: 'text.secondary' }}>
                  {status.description}
                </Typography>
              </Box>
              {index < projectStatuses.length - 1 && (
                <ArrowForwardIcon sx={{ color: 'text.disabled', display: { xs: 'none', md: 'block' } }} />
              )}
            </React.Fragment>
          ))}
        </Box>
      </Paper>

      <Box textAlign="center">
        <Button
          component={Link}
          href="/about/process"
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          sx={{ fontSize: '1.1rem', textTransform: 'none', backgroundColor: NAVY, '&:hover': { backgroundColor: '#16315a' } }}
        >
          See the full process, start to finish
        </Button>
      </Box>
    </Box>
  );
};

export default HowItWorksSection;
