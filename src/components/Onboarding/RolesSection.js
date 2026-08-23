import React from 'react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Chip,
  Button,
  Alert
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StepHeader from './StepHeader';

const NAVY = '#1B3A6B';

const roles = [
  {
    icon: '💻',
    title: 'Hackers',
    tagline: 'Build the software',
    what:
      'Join a team at a hackathon and build a working prototype for a nonprofit over the weekend. Developers, designers, product folks, and data people are all hackers here — every skill level is welcome, and teams balance experience so beginners can learn from seasoned engineers.',
    time: 'The hackathon weekend, plus an optional ~3 months if your team wins and continues to production.',
    apply: 'Apply on any upcoming event page — no experience screening, everyone can participate.',
    link: { href: '/about/hackers', label: 'More about being a hacker' }
  },
  {
    icon: '🧭',
    title: 'Mentors',
    tagline: 'Guide the teams',
    what:
      'Experienced engineers, designers, and domain experts who circulate during the event helping teams scope realistically, make architecture decisions, get unstuck, and prepare for judging. Mentors guide — they don\'t write the team\'s code.',
    time: 'Flexible blocks of a few hours during the event, in person or remote via Slack.',
    apply: 'Apply on the event page. Mentor applications are reviewed by our team — expect a decision within about a week.',
    link: { href: '/about/mentors', label: 'More about mentoring' }
  },
  {
    icon: '⚖️',
    title: 'Judges',
    tagline: 'Evaluate the projects',
    what:
      'Industry professionals who review team demos and decide the winners in two stages: first reviewing every submitted project, then deliberating to rank the top ones. Judges score scope, documentation, polish, and security.',
    time: 'Mostly the final day of the event — demos plus deliberation.',
    apply: 'Apply on the event page. Judge applications are reviewed by our team — expect a decision within about a week.',
    link: { href: '/about/judges', label: 'More about judging' }
  },
  {
    icon: '🙌',
    title: 'Volunteers',
    tagline: 'Make the event run',
    what:
      'Everything that keeps a hackathon running smoothly: check-in and registration, room logistics, meals, photography, social media, and cheering teams on. No coding required.',
    time: 'Shifts during the event — as much or as little as you can give.',
    apply: 'Apply on the event page as a volunteer.',
    link: { href: '/volunteer', label: 'More ways to volunteer' }
  },
  {
    icon: '🤝',
    title: 'Nonprofits',
    tagline: 'Bring the problem',
    what:
      'Organizations with a real challenge technology could solve. Nonprofits pitch their problem at kickoff, stay reachable during the weekend to answer team questions, and sign off when the finished software meets their needs. The software is free.',
    time: 'An application beforehand, a short pitch at kickoff, and availability for questions.',
    apply: 'Submit your challenge through our nonprofit application any time of year.',
    link: { href: '/nonprofits', label: 'More for nonprofits' }
  }
];

const judgingCriteria = ['Scope', 'Documentation', 'Polish', 'Security'];

/**
 * RolesSection
 * The five groups that make every Opportunity Hack happen, what each one
 * does, the time commitment, and how to sign up.
 */
const RolesSection = () => {
  return (
    <Box>
      <StepHeader
        title="Ways to Get Involved"
        subtitle="Five groups make every hackathon happen — here's where you fit"
      />

      <Typography variant="body1" paragraph sx={{ fontSize: '1.25rem' }}>
        You don&apos;t have to be a developer to contribute. Every event depends on hackers,
        mentors, judges, event volunteers, and nonprofit partners — and many community members
        take on different roles at different events.
      </Typography>

      {/* Role cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {roles.map((role) => (
          <Grid size={{ xs: 12, md: 6 }} key={role.title}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Typography component="span" sx={{ fontSize: '2.2rem', lineHeight: 1 }}>
                  {role.icon}
                </Typography>
                <Box>
                  <Typography variant="h6" sx={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1.2 }}>
                    {role.title}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '1.05rem', color: NAVY, fontWeight: 600 }}>
                    {role.tagline}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem' }}>
                {role.what}
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '1.05rem', mb: 1 }}>
                <strong>Time commitment:</strong> {role.time}
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '1.05rem', mb: 1.5 }}>
                <strong>How to join:</strong> {role.apply}
              </Typography>
              {role.title === 'Judges' && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                  {judgingCriteria.map((criterion) => (
                    <Chip
                      key={criterion}
                      label={criterion}
                      size="small"
                      sx={{ fontSize: '0.95rem', border: `1px solid ${NAVY}`, color: NAVY, backgroundColor: 'transparent' }}
                    />
                  ))}
                </Box>
              )}
              <Link href={role.link.href} style={{ color: NAVY, fontSize: '1.05rem', fontWeight: 600 }}>
                {role.link.label} →
              </Link>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Alert severity="info" sx={{ mb: 4, '& .MuiAlert-message': { fontSize: '1.1rem' } }}>
        All applications live on the event pages — pick an upcoming hackathon at{' '}
        <Link href="/hack" style={{ fontWeight: 600 }}>ohack.dev/hack</Link> and you&apos;ll find
        the hacker, mentor, judge, and volunteer application forms right on the event&apos;s page.
        Want a bigger, ongoing role? We also recruit volunteer organizers (social media, event
        operations, mentor program) at{' '}
        <Link href="/jobs" style={{ fontWeight: 600 }}>ohack.dev/jobs</Link>.
      </Alert>

      {/* Videos */}
      <Typography variant="h5" gutterBottom sx={{ fontSize: '1.7rem', fontWeight: 'bold', textAlign: 'center' }}>
        Hear it firsthand
      </Typography>
      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontSize: '1.2rem', textAlign: 'center' }}>
            What mentoring looks like
          </Typography>
          <Box sx={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 2 }}>
            <iframe
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
              src="https://www.youtube.com/embed/CllTEbzdQJY"
              title="Hackathon Mentoring at Opportunity Hack"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontSize: '1.2rem', textAlign: 'center' }}>
            What judging looks like
          </Typography>
          <Box sx={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 2 }}>
            <iframe
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
              src="https://www.youtube.com/embed/L702RpJpjGM"
              title="Hackathon Judge: Opportunity Hack Intro"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </Box>
        </Grid>
      </Grid>

      <Box textAlign="center" sx={{ mt: 3 }}>
        <Button
          component={Link}
          href="/hack"
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          sx={{ fontSize: '1.1rem', textTransform: 'none', backgroundColor: NAVY, '&:hover': { backgroundColor: '#16315a' } }}
        >
          Find an upcoming hackathon
        </Button>
      </Box>
    </Box>
  );
};

export default RolesSection;
