import React from 'react';
import { TitleContainer, LayoutContainer, ProjectsContainer, LinkStyled } from '../../styles/sponsors/styles';
import { Button, Typography, Grid, Card, CardContent, CardActions, CardMedia, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, useTheme, useMediaQuery } from '@mui/material';
import { useRouter } from 'next/router';
import Head from 'next/head';

const style = { fontSize: '14px' };
const tableHeaderStyle = { fontSize: '14px', fontWeight: 'bold', backgroundColor: '#f0f0f0' };

const sponsorLevels = [
  { name: 'Bronze', color: '#e7cfae', minSupport: 500, minHours: 10 },
  { name: 'Silver', color: '#f0f0f0', minSupport: 1000, minHours: 20 },
  { name: 'Gold', color: '#ffd700', minSupport: 2500, minHours: 40 },
  { name: 'Platinum', color: '#b3b3b3', minSupport: 5000, minHours: 80 },
];

const getContactLink = (level) => {    
    return `https://forms.gle/giowXMQ4h8h6XwVF8`;
  };

const sponsors = [
  { name: "Meta", logo: "https://i.imgur.com/v1qjSIO.png", hours: 150, donations: 1000, website: "https://meta.com" },
  { name: "Spotify", logo: "https://i.imgur.com/r9qB2L4.png", hours: 150, donations: 0, website: "https://spotify.com" }
];
// Function to calculate total support
const calculateSupport = (hours, donations) => {
  const hourlyRate = 100; // Assume $100 per hour of volunteering
  return hours * hourlyRate + donations;
};

const benefitsData = [
  { benefit: 'Logo on website', bronze: '3 months', silver: '6 months', gold: '1 year', platinum: '2 years' },
  { benefit: 'Social media mentions', bronze: '1', silver: '2', gold: '4', platinum: '6' },
  { benefit: 'Booth space', bronze: '-', silver: 'Small', gold: 'Medium', platinum: 'Large' },
  { benefit: 'Presentation opportunity', bronze: '-', silver: '-', gold: '5 min', platinum: '10 min' },
  { benefit: 'Judging panel seat', bronze: '-', silver: '1', gold: '2', platinum: '3' },
  { benefit: 'Mentorship opportunities', bronze: '1', silver: '2', gold: '4', platinum: 'Unlimited' },
  { benefit: 'Branded prize category', bronze: '-', silver: '-', gold: '1', platinum: '2' },
  { benefit: 'Logo on event t-shirts', bronze: 'Small', silver: 'Medium', gold: 'Large', platinum: 'Premium' },
  { benefit: 'Access to participant resumes', bronze: '-', silver: '-', gold: 'All', platinum: 'All' },
  { benefit: 'Sponsored workshop', bronze: '-', silver: '-', gold: '30 min', platinum: '1 hour' },
];

export default function SponsorIndex({showBackButton}) {
  const router = useRouter();
  const { event_id } = router.query;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getSponsorCard = (level, nextLevelMinSupport) => {
    const levelSponsors = sponsors.filter(s => {
      const totalSupport = calculateSupport(s.hours, s.donations);
      return totalSupport >= level.minSupport && (nextLevelMinSupport ? totalSupport < nextLevelMinSupport : true);
    });

    return (
      <Grid container spacing={1}>
        {levelSponsors.length > 0 ? (
          levelSponsors.map((sponsor) => (
            <Grid item key={sponsor.name} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  sx={{ height: 100 }}
                  image={sponsor.logo}
                  title={sponsor.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div">
                    {sponsor.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {sponsor.hours} hours volunteered
                  </Typography>
                  {sponsor.donations > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      ${sponsor.donations} donated
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button size="small" href={sponsor.website}>Learn More</Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Card sx={{ bgcolor: '#EEEEEE', borderStyle: 'outset' }}>
              <CardContent>
                <Typography gutterBottom variant="h6" component="div">
                  Be the first {level.name} sponsor!
                </Typography>
                <CardActions>
                  <Button size="small" variant="outlined" href="/about/mentors">Mentor</Button>
                  <Button size="small" variant="outlined" href="/about/judges">Judge</Button>
                  <Button 
                    size="small" 
                    target='_blank'
                    variant="contained" 
                    color="primary" 
                    href={getContactLink()}
                  >
                    Become a Sponsor
                  </Button>
                </CardActions>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    );
  };

  return (
    <LayoutContainer maxWidth="lg">
      <Head>
        <title>Sponsor Opportunity Hack - Empower Nonprofits Through Technology</title>
        <meta name="description" content="Support Opportunity Hack, a nonprofit hackathon fostering innovation for social good. Sponsorship opportunities to empower tech solutions for nonprofits." />
        <meta name="keywords" content="Opportunity Hack, nonprofit hackathon, tech for good, sponsorship, social innovation" />
      </Head>
      <TitleContainer>
      { showBackButton &&
        <Box mb={3}>
          <Button variant="outlined" href={`/hack/${event_id}`}>Back to the hack</Button>
        </Box>
      }
        <Typography variant="h1" component="h1" gutterBottom>Sponsor Opportunity Hack</Typography>
        <Typography variant="h5" component="h2" paragraph>
          Empower Nonprofits Through Technology
        </Typography>
        <Typography variant="body1" paragraph style={style}>
          Join us in fostering innovation for social good. Your sponsorship fuels creativity, supports nonprofits, and connects you with passionate tech talent dedicated to making a difference.
        </Typography>
      </TitleContainer>

      <ProjectsContainer>
        <Typography variant="h2" component="h2" gutterBottom>Sponsorship Levels & Benefits</Typography>
          <Grid container spacing={3}>
          {sponsorLevels.map((level, index) => (
            <Grid item xs={12} sm={6} md={3} key={level.name}>
              <Card sx={{ height: '100%', backgroundColor: level.color }}>
                <CardContent>
                  <Typography variant="h4" component="h3" gutterBottom>
                    {level.name}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    ${level.minSupport}+ in support or equivalent volunteer hours
                  </Typography>
                  <Typography variant="h6" component="h4">Current Sponsors</Typography>
                  {getSponsorCard(level, sponsorLevels[index + 1]?.minSupport)}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box mt={6}>
          <Typography variant="h3" component="h3" gutterBottom>Sponsorship Benefits</Typography>
          <TableContainer component={Paper}>
            <Table aria-label="sponsorship benefits table" size={isMobile ? "small" : "medium"}>
              <TableHead>
                <TableRow>
                  <TableCell style={tableHeaderStyle}>Benefit</TableCell>
                  {sponsorLevels.map((level) => (
                    <TableCell key={level.name} align="center" style={tableHeaderStyle}>{level.name}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {benefitsData.map((row) => (
                  <TableRow key={row.benefit}>
                    <TableCell component="th" scope="row" style={style}>{row.benefit}</TableCell>
                    <TableCell align="center" style={style}>{row.bronze}</TableCell>
                    <TableCell align="center" style={style}>{row.silver}</TableCell>
                    <TableCell align="center" style={style}>{row.gold}</TableCell>
                    <TableCell align="center" style={style}>{row.platinum}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box mt={6}>
          <Typography variant="h3" component="h3" gutterBottom>Why Sponsor Opportunity Hack?</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h5" component="h4" gutterBottom>Drive Social Innovation</Typography>
              <Typography variant="body1" paragraph style={style}>
                Your support enables tech solutions that address real challenges faced by nonprofits, amplifying their impact in communities.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h5" component="h4" gutterBottom>Engage with Passionate Talent</Typography>
              <Typography variant="body1" paragraph style={style}>
                Connect with skilled developers and innovators who are committed to using technology for social good.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h5" component="h4" gutterBottom>Showcase Corporate Social Responsibility</Typography>
              <Typography variant="body1" paragraph style={style}>
                Demonstrate your company's commitment to social causes and technology-driven solutions for nonprofits.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h5" component="h4" gutterBottom>Foster Community Partnerships</Typography>
              <Typography variant="body1" paragraph style={style}>
                Build relationships with nonprofits, tech communities, and socially-conscious individuals passionate about creating change.
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Box mt={6} textAlign="center">
          <Typography variant="h3" component="h3" gutterBottom>Ready to Make a Difference?</Typography>
          <Typography variant="body1" paragraph style={style}>
            Your sponsorship can change lives and empower nonprofits through innovative tech solutions.
          </Typography>
           <Button 
            variant="contained" 
            color="primary" 
            size="large" 
            target='_blank'
            href={getContactLink()}
          >
            Contact Us About Sponsorship
          </Button>
        </Box>
      </ProjectsContainer>
    </LayoutContainer>
  );
}