import React from 'react';
import { TitleContainer, LayoutContainer, ProjectsContainer, LinkStyled } from '../../styles/sponsors/styles';
import { Button, Typography, Grid, Card, CardContent, CardActions, CardMedia, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, useTheme, useMediaQuery } from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import SponsorshipSlider from '../../components/Hackathon/SponsorshipSlider';

const getContactLink = () => 'https://forms.gle/giowXMQ4h8h6XwVF8';

const sponsors = [
  { name: "Meta", logo: "https://i.imgur.com/v1qjSIO.png", hours: 150, donations: 1000, website: "https://meta.com" },
  { name: "Spotify", logo: "https://i.imgur.com/r9qB2L4.png", hours: 150, donations: 0, website: "https://spotify.com" }
];

const calculateSupport = (hours, donations) => hours * 100 + donations;

const benefitsData = [
  { benefit: 'Logo on website', innovator: '3 months', changemaker: '6 months', transformer: '1 year', visionary: '2 years' },
  { benefit: 'Social media promotion', innovator: '1 post', changemaker: '2 posts', transformer: '4 posts', visionary: '6 posts' },
  { benefit: 'Booth at Sponsor Fair', innovator: '-', changemaker: 'Yes', transformer: 'Yes', visionary: 'Yes' },
  { benefit: 'Opening/Closing Ceremony', innovator: '-', changemaker: '1 min', transformer: '2 min', visionary: '5 min' },
  { benefit: 'Judging panel seats', innovator: '1', changemaker: '1', transformer: '2', visionary: '3', 
    button: <Button variant="outlined" size="small" href="/about/judges">Learn More</Button> },
  { benefit: 'Mentorship opportunities', innovator: 'Unlimited', changemaker: 'Unlimited', transformer: 'Unlimited', visionary: 'Unlimited', 
    button: <Button variant="outlined" size="small" href="/about/mentors">Learn More</Button> },
  { benefit: 'Branded prize category', innovator: '-', changemaker: '-', transformer: '1', visionary: '2' },
  { benefit: 'Logo on event t-shirts', innovator: 'Small', changemaker: 'Medium', transformer: 'Large', visionary: 'Premium' },
  { benefit: 'Access to participant resumes', innovator: '-', changemaker: '-', transformer: 'Yes', visionary: 'Yes' },
  { benefit: 'Sponsored workshop/tech talk', innovator: '-', changemaker: '-', transformer: '30 min', visionary: '1 hour' },
  { benefit: 'Recruiting/interviews', innovator: '-', changemaker: 'Post-event', transformer: 'During & post', visionary: 'Pre, during & post' },    
];

const sponsorLevels = [
  { name: 'Innovator', color: '#C8E6C9', minSupport: 1000, minHours: 20 },
  { name: 'Changemaker', color: '#BBDEFB', minSupport: 2500, minHours: 50 },
  { name: 'Transformer', color: '#FFECB3', minSupport: 5000, minHours: 100 },
  { name: 'Visionary', color: '#E1BEE7', minSupport: 10000, minHours: 200 },
];

export default function SponsorIndexList() {  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const mobileStyle = { fontSize: '12px' };
  const desktopStyle = { fontSize: '14px' };
  const style = isMobile ? mobileStyle : desktopStyle;

  const tableHeaderStyle = { 
    fontSize: isMobile ? '12px' : '14px', 
    fontWeight: 'bold', 
    backgroundColor: '#f0f0f0' 
  };

  const getSponsorCard = (level, nextLevelMinSupport) => {
    const levelSponsors = sponsors.filter(s => {
      const totalSupport = calculateSupport(s.hours, s.donations);
      return totalSupport >= level.minSupport && (nextLevelMinSupport ? totalSupport < nextLevelMinSupport : true);
    });

    return (
      <Grid container spacing={isMobile ? 1 : 2}>
        {levelSponsors.length > 0 ? (
          levelSponsors.map((sponsor) => (
            <Grid item key={sponsor.name} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  sx={{ height: isMobile ? 80 : 100 }}
                  image={sponsor.logo}
                  title={sponsor.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div" style={style}>
                    {sponsor.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" style={style}>
                    {sponsor.hours} hours volunteered
                  </Typography>
                  {sponsor.donations > 0 && (
                    <Typography variant="body2" color="text.secondary" style={style}>
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
                <Typography gutterBottom variant="h6" component="div" style={style}>
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
        <title>Sponsor Opportunity Hack | Transform Tech Talent and Communities</title>
        <meta name="description" content="Power innovation and social impact by sponsoring Opportunity Hack. Connect with top tech talent, showcase your brand, and drive meaningful change through technology." />
        <meta name="keywords" content="Opportunity Hack, hackathon sponsorship, tech for good, corporate social responsibility, nonprofit tech solutions" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.ohack.dev/sponsor" />
        <meta property="og:title" content="Sponsor Opportunity Hack | Transform Tech Talent and Communities" />
        <meta property="og:description" content="Power innovation and social impact by sponsoring Opportunity Hack. Connect with top tech talent, showcase your brand, and drive meaningful change through technology." />
        <meta property="og:image" content="https://cdn.ohack.dev/ohack.dev/2023_hackathon_4.webp" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://www.ohack.dev/sponsor" />
        <meta property="twitter:title" content="Sponsor Opportunity Hack | Transform Tech Talent and Communities" />
        <meta property="twitter:description" content="Power innovation and social impact by sponsoring Opportunity Hack. Connect with top tech talent, showcase your brand, and drive meaningful change through technology." />
        <meta property="twitter:image" content="https://cdn.ohack.dev/ohack.dev/2023_hackathon_4.webp" />
        <link rel="canonical" href="https://www.ohack.dev/sponsor" />
        <meta name="robots" content="index, follow" />
      </Head>
      <TitleContainer>
        <Typography variant="h1" component="h1" gutterBottom style={isMobile ? { fontSize: '2rem' } : {}}>
          Sponsor Opportunity Hack
        </Typography>
        <Typography variant="h5" component="h2" paragraph style={style}>
          Empower Nonprofits Through Technology
        </Typography>
        <Typography variant="body1" paragraph style={style}>
          Join us in fostering innovation for social good. Your sponsorship fuels creativity, supports nonprofits, and connects you with passionate tech talent dedicated to making a difference.
        </Typography>
      </TitleContainer>

      <ProjectsContainer>
        <Box mb={isMobile ? 3 : 6}>
          <Typography variant="h2" component="h2" gutterBottom style={isMobile ? { fontSize: '1.75rem' } : {}}>
            About Opportunity Hack
          </Typography>
          <Grid container spacing={isMobile ? 2 : 3}>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" paragraph style={style}>
                Opportunity Hack is a premier hackathon that brings together talented students and professionals to create innovative solutions for nonprofits. Our most recent event was held on October 7-8, 2023, both in-person at ASU Tempe and online globally. 
                <br/>
                <Link href="/hack/2023_fall" style={{ color: 'blue', textDecoration: 'underline' }}>
                  Learn more about our 2023 Fall Hackathon
                </Link>
              </Typography>
              <Typography variant="body1" paragraph style={style}>
                <strong>Key Statistics:</strong>
                <ul>
                  <li>Over 300 participants</li>
                  <li>25 projects submitted</li>
                  <li>Local Arizona judges and online judges</li>
                  <li>Top 3 teams won cash prizes and follow-up project opportunities</li>
                </ul>
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative', width: '100%', height: isMobile ? '200px' : '300px' }}>
                <Image
                  src="https://cdn.ohack.dev/ohack.dev/2023_hackathon_4.webp"
                  alt="Opportunity Hack 2023 Participants"
                  layout="fill"
                  objectFit="cover"
                />
              </Box>
              <Typography variant="caption" align="center" style={style}>
                Opportunity Hack 2023 participants actively engage with Diana Lee Guzman from{' '}
                <Link href="https://codingincolor.net/" style={{ color: 'blue', textDecoration: 'underline' }} target='_blank' rel="noopener noreferrer" passHref>    
                    Coding In Color    
                </Link>
                , fostering diversity and inclusion in tech
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Box mb={isMobile ? 3 : 6}>
          <Typography variant="h2" component="h2" gutterBottom style={isMobile ? { fontSize: '1.75rem' } : {}}>
            Our Mentors
          </Typography>
          <Typography variant="body1" paragraph style={style}>
            Opportunity Hack attracts high-caliber mentors from leading tech companies and universities. In our 2023 event, we had over 30 mentors, including professionals from:
          </Typography>
          <Grid container spacing={isMobile ? 1 : 2}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" style={style}>Tech Giants</Typography>
                  <Typography variant="body2" style={style}>Meta, Spotify, PayPal, eBay</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" style={style}>Innovative Companies</Typography>
                  <Typography variant="body2" style={style}>Honeywell, World Wide Technology, Pixee</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" style={style}>Academic Institutions</Typography>
                  <Typography variant="body2" style={style}>Arizona State University, Rutgers, University of Toronto</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Typography variant="body1" paragraph style={style} mt={2}>
            Our mentors bring expertise in various areas, including:
          </Typography>
          <ul style={style}>
            <li>Front-end and Back-end Development</li>
            <li>Mobile Development (iOS and Android)</li>
            <li>Data Science and Machine Learning</li>
            <li>Cloud Technologies (AWS, Google Cloud, Azure)</li>
            <li>UX/UI Design</li>
            <li>Product and Program Management</li>
            <li>DevOps and GitHub expertise</li>
          </ul>
          <Typography variant="body1" paragraph style={style}>
            As a sponsor, you'll have the opportunity to provide your own or interact with these mentors and the talented participants they guide, providing unique networking and recruitment opportunities.
          </Typography>
        </Box>

        <Typography variant="h2" component="h2" gutterBottom style={isMobile ? { fontSize: '1.75rem' } : {}}>
          Sponsorship Levels & Benefits
        </Typography>
        <Grid container spacing={isMobile ? 2 : 3}>
          {sponsorLevels.map((level, index) => (
            <Grid item xs={12} sm={6} md={3} key={level.name}>
              <Card sx={{ height: '100%', backgroundColor: level.color }}>
                <CardContent>
                  <Typography variant="h4" component="h3" gutterBottom style={isMobile ? { fontSize: '1.5rem' } : {}}>
                    {level.name}
                  </Typography>
                  <Typography variant="body1" paragraph style={style}>
                    ${level.minSupport}+ in support or equivalent volunteer hours
                  </Typography>
                  <Typography variant="h6" component="h4" style={style}>Current Sponsors</Typography>
                  {getSponsorCard(level, sponsorLevels[index + 1]?.minSupport)}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box mt={isMobile ? 2 : 3} mb={isMobile ? 3 : 6}>
          <Typography variant="h2" component="h2" gutterBottom style={isMobile ? { fontSize: '1.75rem' } : {}}>
            Calculate Your Sponsorship
          </Typography>
          <SponsorshipSlider sponsorLevels={sponsorLevels} isMobile={isMobile} />
        </Box>

        <Box mt={isMobile ? 3 : 6}>
          <Typography variant="h3" component="h3" gutterBottom style={isMobile ? { fontSize: '1.5rem' } : {}}>
            Sponsorship Benefits
          </Typography>
          <TableContainer component={Paper}>
            <Table aria-label="sponsorship benefits table" size={isMobile ? "small" : "medium"}>
              <TableHead>
                <TableRow>
                  <TableCell style={tableHeaderStyle}>Benefit</TableCell>
                  {sponsorLevels.map((level) => (
                    <TableCell key={level.name} align="center" style={{...tableHeaderStyle, backgroundColor: level.color, color: 'black'}}>
                      {level.name}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {benefitsData.map((row) => (
                  <TableRow key={row.benefit}>
                    <TableCell component="th" scope="row" style={style}>
                      {row.benefit}
                      {row.button && <Box mt={1}>{row.button}</Box>}
                    </TableCell>
                    <TableCell align="center" style={style}>{row.innovator}</TableCell>
                    <TableCell align="center" style={style}>{row.changemaker}</TableCell>
                    <TableCell align="center" style={style}>{row.transformer}</TableCell>
                    <TableCell align="center" style={style}>{row.visionary}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box mt={isMobile ? 3 : 6}>
          <Typography variant="h3" component="h3" gutterBottom style={isMobile ? { fontSize: '1.5rem' } : {}}>
            Why Sponsor Opportunity Hack?
          </Typography>
          <Grid container spacing={isMobile ? 2 : 3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h5" component="h4" gutterBottom style={style}>Drive Social Innovation</Typography>
              <Typography variant="body1" paragraph style={style}>
                Your support enables tech solutions that address real challenges faced by nonprofits, amplifying their impact in communities.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h5" component="h4" gutterBottom style={style}>Engage with Passionate Talent</Typography>
              <Typography variant="body1" paragraph style={style}>
                Connect with skilled developers and innovators who are committed to using technology for social good.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h5" component="h4" gutterBottom style={style}>Showcase Corporate Social Responsibility</Typography>
              <Typography variant="body1" paragraph style={style}>
                Demonstrate your company's commitment to social causes and technology-driven solutions for nonprofits.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h5" component="h4" gutterBottom style={style}>Foster Community Partnerships</Typography>
              <Typography variant="body1" paragraph style={style}>
                Build relationships with nonprofits, tech communities, and socially-conscious individuals passionate about creating change.
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Box mt={isMobile ? 3 : 6}>
          <Typography variant="h3" component="h3" gutterBottom style={isMobile ? { fontSize: '1.5rem' } : {}}>
            Engagement Opportunities
          </Typography>
          <Grid container spacing={isMobile ? 2 : 3}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="h4" gutterBottom style={style}>Sponsor Fair</Typography>
                  <Typography variant="body1" paragraph style={style}>
                    Showcase your brand and interact directly with participants at our dedicated Sponsor Fair.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="h4" gutterBottom style={style}>Tech Talks & Workshops</Typography>
                  <Typography variant="body1" paragraph style={style}>
                    Present your latest technologies and share your expertise through engaging tech talks and hands-on workshops.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="h4" gutterBottom style={style}>Branded Challenges</Typography>
                  <Typography variant="body1" paragraph style={style}>
                    Create a custom challenge for participants using your technologies, with dedicated prizes for the best solutions.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>


        <Box mt={isMobile ? 3 : 6} textAlign="center">
          <Typography variant="h3" component="h3" gutterBottom style={isMobile ? { fontSize: '1.5rem' } : {}}>
            Ready to Make a Difference?
          </Typography>
          <Typography variant="body1" paragraph style={style}>
            Your sponsorship can change lives and empower nonprofits through innovative tech solutions. Join us in creating lasting impact!
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size={isMobile ? "medium" : "large"}
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