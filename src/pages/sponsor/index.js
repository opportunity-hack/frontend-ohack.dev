import React, { useState, useEffect } from "react";
import { TitleContainer, LayoutContainer, ProjectsContainer, ButtonBasicStyle } from '../../styles/sponsors/styles';
import {
  Grid,
  Typography,
  Paper,
  Avatar,
  Chip,
  Box,
  CardActions,
  useTheme,
  useMediaQuery,
  Alert,
  Skeleton,
} from "@mui/material";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EventIcon from "@mui/icons-material/Event";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { initFacebookPixel, trackEvent } from "../../lib/ga";

import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import SponsorshipSlider from '../../components/Hackathon/SponsorshipSlider';
import useHackathonEvents from '../../hooks/use-hackathon-events';
// Import sponsorLevels and sponsors from data/sponsorData.js
const { sponsorLevels, sponsors, calculateSupport } = require('../../data/sponsorData');

const getContactLink = () => '/contact';



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



export default function SponsorIndexList() {  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedAmount, setSelectedAmount] = useState(0);
  
  // Fetch current hackathons
  const { hackathons, loading: hackathonsLoading } = useHackathonEvents("current");

  useEffect(() => {
    initFacebookPixel();
  }, []);



  const mobileStyle = { fontSize: '12px' };
  const desktopStyle = { fontSize: '14px' };
  const style = isMobile ? mobileStyle : desktopStyle;

  const tableHeaderStyle = { 
    fontSize: isMobile ? '12px' : '14px', 
    fontWeight: 'bold', 
    backgroundColor: '#f0f0f0' 
  };

  const gaButton = (category, action) => {
    trackEvent( category, action );
  };


  const SponsorCard = ({ sponsor, level }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    return (
      <Link href={sponsor.website} passHref>
        <Paper
          elevation={3}
          component="a"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            p: 2,
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: "center",
            gap: 2,
            backgroundColor: level.color,
            transition:
              "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
            "&:hover": {
              transform: "translateY(-5px)",
              boxShadow: 6,
              cursor: "pointer",
            },
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <Avatar
            src={sponsor.logo}
            alt={sponsor.name}
            sx={{ width: 80, height: 80, bgcolor: "white" }}
            variant="rounded"
          />
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Typography variant="h6" noWrap>
              {sponsor.name}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              <Chip
                icon={<AccessTimeIcon />}
                label={
                  <span style={{ fontSize: "13px" }}>
                    {sponsor.hours} hours
                  </span>
                }
                size="small"
                color="primary"
              />
              {sponsor.donations > 0 && (
                <Chip
                  icon={<AttachMoneyIcon />}                  
                  label={
                    <span style={{ fontSize: "13px" }}>
                      ${sponsor.donations} donated
                    </span>
                  }
                  size="small"
                  color="secondary"
                />
              )}
            </Box>
          </Box>
        </Paper>
      </Link>
    );
  };

  const getSponsorCard = (level, nextLevelMinSupport) => {
    const levelSponsors = sponsors.filter((s) => {
      const totalSupport = calculateSupport(s.hours, s.donations);
      return (
        totalSupport >= level.minSupport &&
        (nextLevelMinSupport ? totalSupport < nextLevelMinSupport : true)
      );
    });

    return (
      <Grid container spacing={isMobile ? 2 : 3}>
        {levelSponsors.length > 0 ? (
          levelSponsors.map((sponsor) => (
            <Grid item key={sponsor.name} xs={12}>
              <SponsorCard sponsor={sponsor} level={level} />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 3,
                textAlign: "center",
                bgcolor: "#EEEEEE",
                borderStyle: "dashed",
                borderColor: "grey.400",
              }}
            >
              <Typography variant="h6" gutterBottom>
                Be the first {level.name} sponsor!
              </Typography>
              <Typography variant="body1" paragraph>
                Support our mission by volunteering your time or making a
                donation.
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Chip
                  label="Become a Mentor"
                  component="a"
                  href="/about/mentors"
                  clickable
                />
                <Chip
                  label="Become a Judge"
                  component="a"
                  href="/about/judges"
                  clickable
                />
                <Chip
                  label={hackathons && hackathons.length > 0 ? "View Sponsorship Opportunities" : "Contact Us to Sponsor"}
                  component="a"
                  href={hackathons && hackathons.length > 0 ? "#current-opportunities" : getContactLink()}
                  clickable
                  color="primary"
                  onClick={hackathons && hackathons.length > 0 ? (e) => {
                    e.preventDefault();
                    document.getElementById('current-opportunities')?.scrollIntoView({ 
                      behavior: 'smooth' 
                    });
                  } : undefined}
                />
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    );
  };

  // Render current hackathons for sponsorship opportunities
  const renderCurrentHackathons = () => {
    if (hackathonsLoading) {
      return (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h2" component="h2" gutterBottom style={isMobile ? { fontSize: "1.75rem" } : {}}>
            Current Sponsorship Opportunities
          </Typography>
          <Grid container spacing={3}>
            {[1, 2].map((index) => (
              <Grid item xs={12} md={6} key={index}>
                <Skeleton variant="rectangular" height={200} />
              </Grid>
            ))}
          </Grid>
        </Box>
      );
    }

    if (!hackathons || hackathons.length === 0) {
      return (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h2" component="h2" gutterBottom style={isMobile ? { fontSize: "1.75rem" } : {}}>
            Sponsorship Opportunities
          </Typography>
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f5f5f5' }}>
            <Typography variant="h6" gutterBottom>
              No active hackathons at the moment
            </Typography>
            <Typography variant="body1" paragraph>
              We're planning our next hackathon! Join our mailing list to be notified about upcoming events and sponsorship opportunities.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                component={Link}
                href="/hack"
              >
                View Past Events
              </Button>
              <Button
                variant="outlined"
                color="primary"
                href={getContactLink()}
                target="_blank"
              >
                Contact Us About Future Sponsorship
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" component="h2" gutterBottom style={isMobile ? { fontSize: "1.75rem" } : {}}>
          Current Sponsorship Opportunities
        </Typography>
        <Typography variant="body1" paragraph style={style}>
          Sponsor one of our upcoming hackathons and make a direct impact on nonprofits and the tech community.
        </Typography>
        
        <Grid container spacing={3}>
          {hackathons.map((event) => {
            const eventStartDate = new Date(event.start_date);
            const eventEndDate = new Date(event.end_date);
            const formattedStartDate = eventStartDate.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            });
            const formattedEndDate = eventEndDate.toLocaleDateString('en-US', {
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            });
            
            return (
              <Grid item xs={12} md={6} key={event.event_id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 6
                    }
                  }}
                >
                  {event.image_url && (
                    <Box sx={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                      <Image
                        src={event.image_url}
                        alt={event.title}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </Box>
                  )}
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" component="h3" gutterBottom>
                      {event.title}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EventIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {formattedStartDate}
                        {formattedStartDate !== formattedEndDate && ` - ${formattedEndDate}`}
                      </Typography>
                    </Box>
                    
                    {event.location && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <LocationOnIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {event.location}
                        </Typography>
                      </Box>
                    )}
                    
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {event.description || "Join us for this impactful hackathon where technology meets social good."}
                    </Typography>
                    
                    {event.nonprofits && event.nonprofits.length > 0 && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        <strong>Benefiting:</strong> {event.nonprofits.length} nonprofit{event.nonprofits.length !== 1 ? 's' : ''}
                      </Typography>
                    )}
                  </CardContent>
                  
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      component={Link}
                      href={`/hack/${event.event_id}/sponsor-application`}
                      onClick={() => gaButton("button_sponsor_application", `sponsor_${event.event_id}`)}
                    >
                      Apply to Sponsor This Event
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Have questions about sponsorship opportunities?
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            href={getContactLink()}
            target="_blank"
            onClick={() => gaButton("button_general_contact", "general_sponsor_contact")}
          >
            Contact Us for More Information
          </Button>
        </Box>
      </Box>
    );
  };

  return (
    <LayoutContainer maxWidth="lg">
      <Head>
        <title>
          Sponsor Opportunity Hack | Transform Tech Talent and Communities
        </title>
        <meta
          name="description"
          content="Power innovation and social impact by sponsoring Opportunity Hack. Connect with top tech talent, showcase your brand, and drive meaningful change through technology."
        />
        <meta
          name="keywords"
          content="Opportunity Hack, hackathon sponsorship, tech for good, corporate social responsibility, nonprofit tech solutions"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.ohack.dev/sponsor" />
        <meta
          property="og:title"
          content="Sponsor Opportunity Hack | Transform Tech Talent and Communities"
        />
        <meta
          property="og:description"
          content="Power innovation and social impact by sponsoring Opportunity Hack. Connect with top tech talent, showcase your brand, and drive meaningful change through technology."
        />
        <meta
          property="og:image"
          content="https://cdn.ohack.dev/ohack.dev/2023_hackathon_4.webp"
        />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://www.ohack.dev/sponsor" />
        <meta
          property="twitter:title"
          content="Sponsor Opportunity Hack | Transform Tech Talent and Communities"
        />
        <meta
          property="twitter:description"
          content="Power innovation and social impact by sponsoring Opportunity Hack. Connect with top tech talent, showcase your brand, and drive meaningful change through technology."
        />
        <meta
          property="twitter:image"
          content="https://cdn.ohack.dev/ohack.dev/2023_hackathon_4.webp"
        />
        <link rel="canonical" href="https://www.ohack.dev/sponsor" />
        <meta name="robots" content="index, follow" />
      </Head>
      <TitleContainer>
        <Typography
          variant="h2"
          component="h2"
          gutterBottom
          style={isMobile ? { fontSize: "2rem" } : {}}
        >
          Sponsor Opportunity Hack
        </Typography>
        <Typography variant="h5" component="h2" paragraph style={style}>
          Empower Nonprofits Through Technology
        </Typography>
        <Typography variant="body1" paragraph style={style}>
          Join us in fostering innovation for social good. Your sponsorship
          fuels creativity, supports nonprofits, and connects you with
          passionate tech talent dedicated to making a difference.
        </Typography>

        <Typography variant="h5" gutterBottom>
          Join us in empowering nonprofits through technology
        </Typography>
        {hackathons && hackathons.length > 0 ? (
          <Button
            variant="contained"
            color="secondary"
            size={isMobile ? "medium" : "large"}
            href="#current-opportunities"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('current-opportunities')?.scrollIntoView({ 
                behavior: 'smooth' 
              });
            }}
          >
            View Sponsorship Opportunities
          </Button>
        ) : (
          <Button
            variant="contained"
            color="secondary"
            size={isMobile ? "medium" : "large"}
            href={getContactLink()}
            target="_blank"
          >
            Contact Us About Sponsorship
          </Button>
        )}
        <Typography variant="body1" style={{ marginTop: "1rem" }}>
          {hackathons && hackathons.length > 0 
            ? "Multiple sponsorship levels available!" 
            : "Stay updated on upcoming opportunities!"
          }
        </Typography>
      </TitleContainer>

      {hackathons && hackathons.length > 0 && (
        <Box mt={3} mb={3} display="flex" justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            size={isMobile ? "medium" : "large"}
            component={Link}
            href={`/hack/${hackathons[0].event_id}`}
            startIcon={<CalendarTodayIcon />}
          >
            View {hackathons[0].title} Details
          </Button>
        </Box>
      )}

      <ProjectsContainer>
        {/* Current Hackathons Section */}
        <Box id="current-opportunities" mb={isMobile ? 4 : 6}>
          {renderCurrentHackathons()}
        </Box>

        <Box mb={isMobile ? 3 : 6}>
          <Typography
            variant="h2"
            component="h2"
            gutterBottom
            style={isMobile ? { fontSize: "1.75rem" } : {}}
          >
            About Opportunity Hack
          </Typography>
          <Grid container spacing={isMobile ? 2 : 3}>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" paragraph style={style}>
                Opportunity Hack is a premier hackathon that brings together
                talented students and professionals to create innovative
                solutions for nonprofits. Our upcoming event is scheduled for
                October 12th & 13th 2024 and will be in-person at ASU in Tempe,
                Arizona.
                <br />
                <Link
                  href="/hack/2024_fall"
                  style={{ color: "blue", textDecoration: "underline" }}
                >
                  Learn more about our upcoming 2024 Fall Hackathon
                </Link>
              </Typography>
              <Typography variant="body1" paragraph style={style}>
                <strong>Key Statistics from 2023:</strong>
                <ul>
                  <li>Over 300 participants</li>
                  <li>25 projects submitted</li>
                  <li>Local Arizona judges and online judges</li>
                  <li>
                    Top 3 teams won cash prizes and follow-up project
                    opportunities
                  </li>
                </ul>
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  height: isMobile ? "200px" : "300px",
                }}
              >
                <Image
                  src="https://cdn.ohack.dev/ohack.dev/2023_hackathon_4.webp"
                  alt="Opportunity Hack 2023 Participants"
                  layout="fill"
                  objectFit="cover"
                />
              </Box>
              <Typography variant="caption" align="center" style={style}>
                Opportunity Hack 2023 participants actively engage with Diana
                Lee Guzman from{" "}
                <Link
                  href="https://codingincolor.net/"
                  style={{ color: "blue", textDecoration: "underline" }}
                  target="_blank"
                  rel="noopener noreferrer"
                  passHref
                >
                  Coding In Color
                </Link>
                , fostering diversity and inclusion in tech
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Box mb={isMobile ? 3 : 6}>
          <Typography
            variant="h2"
            component="h2"
            gutterBottom
            style={isMobile ? { fontSize: "1.75rem" } : {}}
          >
            Our Mentors
          </Typography>
          <Typography variant="body1" paragraph style={style}>
            Opportunity Hack attracts high-caliber mentors from leading tech
            companies and universities. In our 2023 event, we had over 30
            mentors, including professionals from:
          </Typography>
          <Grid container spacing={isMobile ? 1 : 2}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" style={style}>
                    Tech Giants
                  </Typography>
                  <Typography variant="body1" style={style}>
                    Meta, Spotify, PayPal, eBay
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" style={style}>
                    Innovative Companies
                  </Typography>
                  <Typography variant="body1" style={style}>
                    Honeywell, World Wide Technology, Pixee
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" style={style}>
                    Academic Institutions
                  </Typography>
                  <Typography variant="body1" style={style}>
                    Arizona State University, Rutgers, University of Toronto
                  </Typography>
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
            As a sponsor, you'll have the opportunity to provide your own or
            interact with these mentors and the talented participants they
            guide, providing unique networking and recruitment opportunities.
          </Typography>
        </Box>

        <Typography
          variant="h2"
          component="h2"
          gutterBottom
          style={isMobile ? { fontSize: "1.75rem" } : {}}
        >
          Sponsorship Levels & Benefits
        </Typography>
        <Grid container spacing={isMobile ? 2 : 3}>
          {sponsorLevels.map((level, index) => (
            <Grid item xs={12} sm={6} md={3} key={level.name}>
              <Card sx={{ height: "100%", backgroundColor: level.color }}>
                <CardContent>
                  <Typography
                    variant="h4"
                    component="h3"
                    gutterBottom
                    style={isMobile ? { fontSize: "1.5rem" } : {}}
                  >
                    {level.name}
                  </Typography>
                  <Typography variant="body1" paragraph style={style}>
                    ${level.minSupport}+ in support or equivalent volunteer
                    hours
                  </Typography>
                  <Typography variant="h6" component="h4" style={style}>
                    Current Sponsors
                  </Typography>
                  {getSponsorCard(level, sponsorLevels[index + 1]?.minSupport)}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box mt={isMobile ? 2 : 3} mb={isMobile ? 3 : 6}>
          <Typography
            variant="h2"
            component="h2"
            gutterBottom
            style={isMobile ? { fontSize: "1.75rem" } : {}}
          >
            Calculate Your Sponsorship
          </Typography>
          <SponsorshipSlider
            sponsorLevels={sponsorLevels}
            isMobile={isMobile}
            setSelectedAmount={setSelectedAmount}
          />

          <Box mt={2}>
            {selectedAmount > 0 && (
              <Typography variant="h6" gutterBottom>
                Donate ${selectedAmount} via PayPal:
              </Typography>
            )}
            <ButtonBasicStyle
              onClick={() => gaButton("button_donate", "donate")}
              style={{ color: "white", backgroundColor: "blue" }}
              target="_blank"
              href="https://www.paypal.com/donate/?campaign_id=WWL4VPVBUS4SA"
            >
              Donate with PayPal
            </ButtonBasicStyle>
          </Box>
        </Box>

        <Box mt={isMobile ? 3 : 6}>
          <Typography
            variant="h3"
            component="h3"
            gutterBottom
            style={isMobile ? { fontSize: "1.5rem" } : {}}
          >
            Sponsorship Benefits
          </Typography>
          <TableContainer component={Paper}>
            <Table
              aria-label="sponsorship benefits table"
              size={isMobile ? "small" : "medium"}
            >
              <TableHead>
                <TableRow>
                  <TableCell style={tableHeaderStyle}>Benefit</TableCell>
                  {sponsorLevels.map((level) => (
                    <TableCell
                      key={level.name}
                      align="center"
                      style={{
                        ...tableHeaderStyle,
                        backgroundColor: level.color,
                        color: "black",
                      }}
                    >
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
                    <TableCell align="center" style={style}>
                      {row.innovator}
                    </TableCell>
                    <TableCell align="center" style={style}>
                      {row.changemaker}
                    </TableCell>
                    <TableCell align="center" style={style}>
                      {row.transformer}
                    </TableCell>
                    <TableCell align="center" style={style}>
                      {row.visionary}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box mt={isMobile ? 3 : 6}>
          <Typography
            variant="h3"
            component="h3"
            gutterBottom
            style={isMobile ? { fontSize: "1.5rem" } : {}}
          >
            Why Sponsor Opportunity Hack?
          </Typography>
          <Grid container spacing={isMobile ? 2 : 3}>
            <Grid item xs={12} sm={6}>
              <Typography
                variant="h5"
                component="h4"
                gutterBottom
                style={style}
              >
                Drive Social Innovation
              </Typography>
              <Typography variant="body1" paragraph style={style}>
                Your support enables tech solutions that address real challenges
                faced by nonprofits, amplifying their impact in communities.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography
                variant="h5"
                component="h4"
                gutterBottom
                style={style}
              >
                Engage with Passionate Talent
              </Typography>
              <Typography variant="body1" paragraph style={style}>
                Connect with skilled developers and innovators who are committed
                to using technology for social good.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography
                variant="h5"
                component="h4"
                gutterBottom
                style={style}
              >
                Showcase Corporate Social Responsibility
              </Typography>
              <Typography variant="body1" paragraph style={style}>
                Demonstrate your company's commitment to social causes and
                technology-driven solutions for nonprofits.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography
                variant="h5"
                component="h4"
                gutterBottom
                style={style}
              >
                Foster Community Partnerships
              </Typography>
              <Typography variant="body1" paragraph style={style}>
                Build relationships with nonprofits, tech communities, and
                socially-conscious individuals passionate about creating change.
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Box mt={isMobile ? 3 : 6}>
          <Typography
            variant="h3"
            component="h3"
            gutterBottom
            style={isMobile ? { fontSize: "1.5rem" } : {}}
          >
            Success Stories
          </Typography>
          <Typography variant="body1" paragraph style={style}>
            Our hackathons have led to impactful solutions for nonprofits. See
            how your sponsorship can make a real difference:
          </Typography>
          <Grid container spacing={isMobile ? 2 : 3}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography
                    variant="h5"
                    component="h4"
                    gutterBottom
                    style={style}
                  >
                    Matthews Crossing Food Bank
                  </Typography>
                  <Typography variant="body1" paragraph style={style}>
                    Streamlined donation tracking system, saving hundreds of
                    volunteer hours annually.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    component={Link}
                    href="/about/success-stories#matthews-crossing"
                  >
                    Read More
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography
                    variant="h5"
                    component="h4"
                    gutterBottom
                    style={style}
                  >
                    Zuri's Circle
                  </Typography>
                  <Typography variant="body1" paragraph style={style}>
                    Developed an event management system, increasing volunteer
                    engagement by 40%.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    component={Link}
                    href="/about/success-stories#zuris-circle"
                  >
                    Read More
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography
                    variant="h5"
                    component="h4"
                    gutterBottom
                    style={style}
                  >
                    Vidyodaya
                  </Typography>
                  <Typography variant="body1" paragraph style={style}>
                    Created a modern, user-friendly website, boosting online
                    visibility and donations.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    component={Link}
                    href="/about/success-stories#vidyodaya"
                  >
                    Read More
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
          <Box mt={2} textAlign="center">
            <Button
              variant="contained"
              color="secondary"
              size={isMobile ? "medium" : "large"}
              component={Link}
              href="/about/success-stories"
            >
              Explore All Success Stories
            </Button>
          </Box>
        </Box>

        <Box mt={isMobile ? 3 : 6}>
          <Typography
            variant="h3"
            component="h3"
            gutterBottom
            style={isMobile ? { fontSize: "1.5rem" } : {}}
          >
            Engagement Opportunities
          </Typography>
          <Grid container spacing={isMobile ? 2 : 3}>
            {[
              {
                title: "Sponsor Fair",
                description:
                  "Showcase your brand and interact directly with participants at our dedicated Sponsor Fair.",
              },
              {
                title: "Tech Talks & Workshops",
                description:
                  "Present your latest technologies and share your expertise through engaging tech talks and hands-on workshops.",
              },
              {
                title: "Branded Challenges",
                description:
                  "Create a custom challenge for participants using your technologies, with dedicated prizes for the best solutions.",
              },
            ].map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="h5"
                      component="h4"
                      gutterBottom
                      style={style}
                    >
                      {item.title}
                    </Typography>
                    <Typography variant="body1" style={style}>
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box mt={isMobile ? 3 : 6} textAlign="center">
          <Typography
            variant="h3"
            component="h3"
            gutterBottom
            style={isMobile ? { fontSize: "1.5rem" } : {}}
          >
            Ready to Make a Difference?
          </Typography>
          <Typography variant="body1" paragraph style={style}>
            Your sponsorship can change lives and empower nonprofits through
            innovative tech solutions. Join us in creating lasting impact!
          </Typography>
          {hackathons && hackathons.length > 0 ? (
            <Button
              variant="contained"
              color="primary"
              size={isMobile ? "medium" : "large"}
              onClick={() => {
                document.getElementById('current-opportunities')?.scrollIntoView({ 
                  behavior: 'smooth' 
                });
              }}
            >
              View Current Sponsorship Opportunities
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              size={isMobile ? "medium" : "large"}
              target="_blank"
              href={getContactLink()}
            >
              Contact Us About Future Sponsorship
            </Button>
          )}
        </Box>
      </ProjectsContainer>
    </LayoutContainer>
  );
}