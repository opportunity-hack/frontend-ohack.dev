import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { Typography, Box, Button, Grid, Container, Divider } from '@mui/material';
import { TitleContainer, LayoutContainer, ProjectsContainer } from '../../styles/nonprofit/styles';
import HackathonList from '../../components/HackathonList/HackathonList';
import PreviousHackathonList from '../../components/HackathonList/PreviousHackathonList';
import Link from 'next/link';

const HackathonIndex = () => {
  const style = { fontSize: '15px' };

  return (
    <LayoutContainer key="hackathons" container>
      <Head>
        <title>
          Opportunity Hack - Global Hackathons Including Phoenix & ASU Events
        </title>
        <meta
          name="description"
          content="Join Opportunity Hack's innovative global hackathons, including events in Phoenix and at ASU. Unite with tech enthusiasts worldwide to create sustainable solutions for nonprofits."
        />
        <meta
          name="keywords"
          content="Opportunity Hack, global hackathons, Phoenix hackathon, Arizona hackathon, ASU hackathon, nonprofit solutions, tech for good, social impact, coding for nonprofits, volunteer coding, tech volunteering"
        />
        <meta
          property="og:title"
          content="Opportunity Hack - Global Hackathons Including Phoenix & ASU Events"
        />
        <meta
          property="og:description"
          content="Join Opportunity Hack's innovative global hackathons, including events in Phoenix and at ASU. Create sustainable tech solutions for nonprofits worldwide."
        />
        <meta
          property="og:image"
          content="https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp"
        />
        <meta property="og:url" content="https://ohack.dev/hack" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Opportunity Hack - Global Hackathons for Social Impact"
        />
        <meta
          name="twitter:description"
          content="Join tech volunteers to create solutions for nonprofits at our global hackathons."
        />
        <link rel="canonical" href="https://ohack.dev/hack" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Event",
            "name": "Opportunity Hack Global Hackathons",
            "description": "Opportunity Hack hosts impactful hackathons globally where tech volunteers create solutions for nonprofits.",
            "image": "https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp",
            "url": "https://ohack.dev/hack",
            "organizer": {
              "@type": "Organization",
              "name": "Opportunity Hack",
              "url": "https://ohack.dev"
            }
          }
        `}</script>
      </Head>

      <TitleContainer container>
        <Typography
          variant="h1"
          component="h1"
          sx={{ fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" }, mb: 2 }}
        >
          Global Hackathons with a Local Touch
        </Typography>

        <Typography variant="body1" style={style} paragraph>
          Opportunity Hack hosts impactful hackathons globally, with a special
          focus on events in locations like Phoenix, Arizona, including Arizona
          State University (ASU). We unite diverse tech communities worldwide to
          devise innovative solutions for nonprofits.
        </Typography>
        <Typography variant="body1" style={style} paragraph>
          With over 20 events since 2013, spanning various locations but
          maintaining a strong presence in areas like Phoenix, we continuously
          innovate to enhance the hackathon experience. Join us in making a
          difference locally and globally!
        </Typography>

        <Container maxWidth="md" sx={{ mt: 2, mb: 4 }}>
          <Image
            src="https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp"
            alt="Opportunity Hack Hackathon Participants"
            width={800}
            height={600}
            style={{
              maxWidth: "100%",
              height: "auto",
              borderRadius: "8px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
            priority
          />
        </Container>
      </TitleContainer>

      <ProjectsContainer style={{ marginTop: 20, width: "100%" }}>
        <Box>
          <PreviousHackathonList />
        </Box>
        <Divider sx={{ my: 4 }} />
        <Box mb={4}>
          <HackathonList />
        </Box>
      </ProjectsContainer>

      <Box mt={4} p={2} bgcolor="background.paper">
        <Typography variant="h3" component="h2" gutterBottom>
          Why Attend an Opportunity Hack Event?
        </Typography>
        <Typography variant="body1" style={style} paragraph>
          1. Global and Local Impact: Work on projects that benefit nonprofits
          both internationally and in specific communities, such as Phoenix.
        </Typography>
        <Typography variant="body1" style={style} paragraph>
          2. Diverse Locations: Experience hackathons in various settings, from
          university campuses like ASU to global virtual events.
        </Typography>
        <Typography variant="body1" style={style} paragraph>
          3. Tech Community: Connect with a vibrant, global tech scene and
          like-minded individuals passionate about using technology for social
          good.
        </Typography>
        <Typography variant="body1" style={style} paragraph>
          4. Skill Development: Enhance your coding, problem-solving, and
          teamwork skills in a fast-paced, real-world environment.
        </Typography>
        <Typography variant="body1" style={style}>
          5. Career Opportunities: Network with tech companies and nonprofits
          from around the world, opening doors for future career possibilities.
        </Typography>
      </Box>

      <Box mt={4} p={2} bgcolor="background.paper">
        <Typography variant="h3" component="h2" gutterBottom>
          Important Information for Participants
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              href="/hack/code-of-conduct"
              fullWidth
            >
              Code of Conduct
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              href="/hack/liability-waiver"
              fullWidth
            >
              Liability Waiver
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              href="/hack/photo-release"
              fullWidth
            >
              Photo Release
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              href="/sponsor"
              fullWidth
            >
              Become a Sponsor
            </Button>
          </Grid>
        </Grid>
      </Box>
    </LayoutContainer>
  );
};

export default HackathonIndex;