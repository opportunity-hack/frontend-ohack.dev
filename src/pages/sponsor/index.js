import React, { useState, useEffect } from "react";
import { TitleContainer, LayoutContainer, ProjectsContainer, LinkStyled, ButtonBasicStyle } from '../../styles/sponsors/styles';
import {
  Grid,
  Typography,
  Paper,
  Avatar,
  Chip,
  Box,
  Tooltip,
  IconButton,
  CardActions,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { initFacebookPixel, trackEvent } from "../../lib/ga";

import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinkIcon from "@mui/icons-material/Link";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import SponsorshipSlider from '../../components/Hackathon/SponsorshipSlider';
// Import sponsorLevels and sponsors from data/sponsorData.js
const { sponsorLevels, sponsors, calculateSupport } = require('../../data/sponsorData');

const getContactLink = () => 'https://forms.gle/giowXMQ4h8h6XwVF8';



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
                label={`${sponsor.hours} hours`}
                size="small"
                color="primary"
              />
              {sponsor.donations > 0 && (
                <Chip
                  icon={<AttachMoneyIcon />}
                  label={`$${sponsor.donations} donated`}
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
                  label="Contact Us to Sponsor"
                  component="a"
                  href={getContactLink()}
                  clickable
                  color="primary"
                />
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
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
        <Button
          variant="contained"
          color="secondary"
          size={isMobile ? "medium" : "large"}
          href={getContactLink()}
        >
          Become a Sponsor Today
        </Button>
        <Typography variant="body1" style={{ marginTop: "1rem" }}>
          Limited sponsorship spots available!
        </Typography>
      </TitleContainer>

      <Box mt={3} mb={3} display="flex" justifyContent="center">
        <Button
          variant="contained"
          color="primary"
          size={isMobile ? "medium" : "large"}
          href="/hack/2024_fall"
          startIcon={<CalendarTodayIcon />}
        >
          View Current Hackathon Details
        </Button>
      </Box>

      <ProjectsContainer>
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
          {selectedAmount > 0 && (
            <Box mt={2}>
              <Typography variant="h6" gutterBottom>
                Donate ${selectedAmount} via PayPal:
              </Typography>
              <ButtonBasicStyle
                onClick={() => gaButton("button_donate", "donate")}
                style={{ color: "white", backgroundColor: "blue" }}
                target="_blank"
                href="https://www.paypal.com/donate/?campaign_id=WWL4VPVBUS4SA"
              >
                Donate with PayPal
              </ButtonBasicStyle>
            </Box>
          )}
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
          <Button
            variant="contained"
            color="primary"
            size={isMobile ? "medium" : "large"}
            target="_blank"
            href={getContactLink()}
          >
            Contact Us About Sponsorship
          </Button>
        </Box>
      </ProjectsContainer>
    </LayoutContainer>
  );
}