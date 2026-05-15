import dynamic from 'next/dynamic';
import Head from 'next/head';
import NextLink from 'next/link';
import {
  Box,
  Button,
  Chip,
  Container,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import GroupsIcon from '@mui/icons-material/Groups';

const HackathonFunnel = dynamic(
  () => import('../../components/Hackathon/HackathonFunnel'),
  { ssr: false }
);

const AggregateResultsPage = ({ funnel }) => {
  const pageUrl = 'https://ohack.dev/hack/results';
  const eventsTotal = funnel?.events_total || 0;
  const eventsWithWinners = funnel?.events_with_winners || 0;
  const totalRegistered = funnel?.summary?.registered || 0;
  const totalSubmittedTeams = funnel?.summary?.submitted_project_teams || 0;
  const hasResults = Boolean(funnel?.winners?.won_prize);

  const description = `Aggregate hacker funnel across every Opportunity Hack hackathon — ${eventsTotal} events, ${totalRegistered.toLocaleString()} people registered, ${totalSubmittedTeams.toLocaleString()} projects submitted.`;
  const ogImage = 'https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp';

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Opportunity Hack — All-Time Hacker Funnel',
      url: pageUrl,
      description,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ohack.dev/' },
        { '@type': 'ListItem', position: 2, name: 'Hackathons', item: 'https://ohack.dev/hack' },
        { '@type': 'ListItem', position: 3, name: 'Results', item: pageUrl },
      ],
    },
  ];

  const statTiles = [
    { label: 'Hackathons', value: eventsTotal, icon: <EventAvailableIcon /> },
    { label: 'People registered', value: totalRegistered, icon: <GroupsIcon /> },
    { label: 'Projects submitted', value: totalSubmittedTeams, icon: <EmojiEventsIcon /> },
    { label: 'Events with winners', value: eventsWithWinners, icon: <EmojiEventsIcon /> },
  ];

  return (
    <>
      <Head>
        <title>Opportunity Hack – All-Time Hacker Funnel | Results</title>
        <meta name="description" content={description} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content="Opportunity Hack – All-Time Hacker Funnel" />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Opportunity Hack – All-Time Hacker Funnel" />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
        {structuredData.map((sd, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(sd) }}
          />
        ))}
      </Head>

      <Container maxWidth="lg" sx={{ pt: { xs: 10, md: 12 }, pb: 6 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          sx={{ mb: 3 }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            component={NextLink}
            href="/hack"
            sx={{ textTransform: 'none' }}
          >
            All hackathons
          </Button>
          <Chip
            label="Aggregate across all events"
            color="primary"
            variant="outlined"
          />
        </Stack>

        <Box sx={{ mb: 4 }}>
          <Typography variant="overline" color="text.secondary">
            All-time outcomes
          </Typography>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
            The Opportunity Hack Funnel
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800 }}>
            Every event narrows from broad interest down to a small group of people who push all the way through.
            Counts below are summed across every hackathon — a person who participated in three events is counted three times.
          </Typography>
        </Box>

        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            {statTiles.map((t) => (
              <Box
                key={t.label}
                sx={{
                  flex: '1 1 180px',
                  minWidth: 160,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  py: 1.5,
                  px: 1,
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 0.5 }}>{t.icon}</Box>
                <Typography variant="h5" fontWeight="bold" color="primary.main">
                  {(t.value || 0).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary" textAlign="center">
                  {t.label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Paper>

        <HackathonFunnel funnel={funnel} hasResults={hasResults} />

        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Link component={NextLink} href="/hack" underline="hover">
            ← Back to all hackathons
          </Link>
        </Box>
      </Container>
    </>
  );
};

export async function getStaticProps() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathons/funnel/aggregate`
    );
    const funnel = res.ok ? await res.json() : null;
    return {
      props: { funnel },
      revalidate: 600,
    };
  } catch (error) {
    console.error('Error fetching aggregate funnel:', error);
    return {
      props: { funnel: null },
      revalidate: 60,
    };
  }
}

export default AggregateResultsPage;
