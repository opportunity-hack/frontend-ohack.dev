import React, { useState, useEffect, lazy, Suspense } from "react";
import Head from "next/head";
import dynamic from 'next/dynamic';
import Link from "next/link";
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Static imports for frequently used icons
import BusinessIcon from '@mui/icons-material/Business';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MovieIcon from '@mui/icons-material/Movie';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import { initFacebookPixel, trackEvent } from "../../../lib/ga";

// Core MUI components
import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Container,
} from "@mui/material";

// Dynamic imports for heavy components
const Paper = dynamic(() => import('@mui/material/Paper'));
const Accordion = dynamic(() => import('@mui/material/Accordion'));
const AccordionSummary = dynamic(() => import('@mui/material/AccordionSummary'));
const AccordionDetails = dynamic(() => import('@mui/material/AccordionDetails'));
const Slider = dynamic(() => import('@mui/material/Slider'));
const Tooltip = dynamic(() => import('@mui/material/Tooltip'));



// Lazy loaded components
const SponsorshipCTA = lazy(() => import('../../../components/SponsorshipCTA'));
const MentorCTA = lazy(() => import('../../../components/MentorCTA'));



const theme = createTheme({
  typography: { 
    fontSize: 16,
    h3: {
      fontSize: '2rem',
      '@media (min-width:600px)': {
        fontSize: '2.5rem',
      }
    },
    h4: {
      fontSize: '1.5rem',
      '@media (min-width:600px)': {
        fontSize: '2rem',
      }
    }
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            padding: '0 16px',
          }
        }
      }
    }
  }
});

const handleSponsorClick = () => {
  trackEvent({ action: "click_sponsor_judge", params: { action_name: "Sponsorship CTA" } });
};

const handleApplyClick = () => {
  trackEvent({ action: "click_apply_judge", params: { action_name: "Apply for Judge" } });
};


const AboutJudges = () => {
  const [scores, setScores] = useState({
    scopeImpact: 3,
    scopeComplexity: 3,
    documentationCode: 3,
    documentationEase: 3,
    polishWorkRemaining: 3,
    polishCanUseToday: 3,    
    securityData: 3,
    securityRole: 3,
  });

  const [totalScore, setTotalScore] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initFacebookPixel();
  }, []);

  useEffect(() => {
    if (mounted) {
      const newTotalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
      setTotalScore(newTotalScore);
    }
  }, [scores, mounted]);

  const handleScoreChange = (criterion) => (_, newValue) => {
    setScores((prevScores) => ({ ...prevScores, [criterion]: newValue }));
  };

  const getDescription = (score) => {
    const descriptions = {
      1: "Poor - Significantly below expectations",
      2: "Fair - Below expectations",
      3: "Good - Meets expectations",
      4: "Very Good - Exceeds expectations",
      5: "Excellent - Significantly exceeds expectations",
    };
    return descriptions[score] || "";
  };

  const criteriaInfo = [
    {
      category: "scope",
      name: "Scope of Solution",
      maxPoints: 10,
      subCriteria: [
        {
          name: "Impact on Community - how many people and nonprofits are impacted by this solution?",
          key: "scopeImpact",
        },
        {
          name: "Complexity of Problem Solved - how hard was this to do versus what is already out there?",
          key: "scopeComplexity",
        },
      ],
      tip: "Consider both breadth and depth of impact. Evaluate community impact and problem complexity.",
    },
    {
      category: "documentation",
      name: "Documentation",
      maxPoints: 10,
      subCriteria: [
        {
          name: "Code and UX Documentation - clear how to use the solution",
          key: "documentationCode",
        },
        {
          name: "Ease of Understanding - straightforward design",
          key: "documentationEase",
        },
      ],
      tip: "Assess documentation quality and clarity. Consider project sustainability.",
    },
    {
      category: "polish",
      name: "Polish",
      maxPoints: 10,
      subCriteria: [
        {
          name: "Work remaining - minimal work remaining for MVP",
          key: "polishWorkRemaining",
        },
        {
          name: "Can use today - deployed in the cloud, able to be shipped now",
          key: "polishCanUseToday",
        },
      ],
      tip: "Evaluate overall refinement and readiness for real-world use.",
    },
    {
      category: "security",
      name: "Security",
      maxPoints: 10,
      subCriteria: [
        {
          name: "Data Protection - hard to gain access to data because of security controls",
          key: "securityData",
        },
        {
          name: "Role-based Security - admin versus public access (where applicable)",
          key: "securityRole",
        },
      ],
      tip: "Assess data protection and role-based security implementation.",
    },
  ];

  const renderSlider = (criterion, maxPoints) => (
    <Box sx={{ width: "100%", mt: 2 }}>
      <Typography variant="subtitle1">{criterion.name}</Typography>
      <Slider
        value={scores[criterion.key]}
        valueLabelFormat={getDescription}
        onChange={handleScoreChange(criterion.key)}
        valueLabelDisplay="auto"
        step={1}
        marks
        min={1}
        max={5}
        sx={{ mt: 1 }}
      />
      <Typography variant="body1" sx={{ mt: 1 }}>
        Score: {scores[criterion.key]} / 5 ({scores[criterion.key]} points)
      </Typography>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>
          Opportunity Hack Phoenix: Hackathon Judge Opportunities | Arizona
          Hackathon
        </title>
        <meta
          name="description"
          content="Become an Opportunity Hack judge to enhance your company's ESG profile, gain valuable experience, network with industry leaders, and evaluate innovative nonprofit solutions in person."
        />
        <meta
          name="keywords"
          content="Opportunity Hack, hackathon judges, tech evaluation, ESG, corporate social responsibility, nonprofit solutions, in-person judging"
        />
        <meta
          property="og:title"
          content="Opportunity Hack Judges: In-Person Tech Evaluation for Social Impact"
        />
        <meta
          property="og:description"
          content="Judge at Opportunity Hack to enhance your ESG profile, gain experience, and network while evaluating innovative nonprofit tech solutions in person."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ohack.dev/judges" />
        <meta
          property="og:image"
          content="https://cdn.ohack.dev/ohack.dev/2023_hackathon_1.webp"
        />
        <link rel="canonical" href="https://ohack.dev/judges" />
      </Head>
      <Container maxWidth="md">
        <Box sx={{ padding: 4, mt: 5 }}>
          <Typography variant="h3" gutterBottom>
            Opportunity Hack Phoenix: Hackathon Judge Opportunities
          </Typography>

          <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
            Why Judge at Opportunity Hack?
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <BusinessIcon />
              </ListItemIcon>
              <ListItemText
                primary="Enhance Your Company's ESG Profile"
                secondary="Demonstrate your commitment to social responsibility and sustainable development through active, in-person participation."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <EmojiEventsIcon />
              </ListItemIcon>
              <ListItemText
                primary="Gain Valuable In-Person Experience"
                secondary="Perfect for visa applications, showing your expertise and community involvement through hands-on engagement."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <WorkIcon />
              </ListItemIcon>
              <ListItemText
                primary="Network with Industry Leaders Face-to-Face"
                secondary="Connect in person with professionals from top tech companies and nonprofits."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <LocationOnIcon />
              </ListItemIcon>
              <ListItemText
                primary="On-Site Judging Experience"
                secondary="All judging activities take place in person, providing a more immersive and impactful experience."
              />
            </ListItem>
          </List>

          <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
            How to Become a Judge
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <BusinessIcon />
              </ListItemIcon>
              <ListItemText
                primary="Corporate Sponsorship"
                secondary="Boost your company's visibility and CSR efforts by becoming a sponsor and sending an in-person judge."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SchoolIcon />
              </ListItemIcon>
              <ListItemText
                primary="Individual Application"
                secondary="Apply your industry expertise to evaluate innovative solutions for nonprofits on-site."
              />
            </ListItem>
          </List>

          <Suspense fallback={<Box sx={{ height: 100 }} />}>
            {mounted && (
              <>
                <SponsorshipCTA />
                <MentorCTA />
              </>
            )}
          </Suspense>

          <Button
            variant="outlined"
            color="primary"
            href="https://forms.gle/2oVBDxCX2Axci3nJA"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ mt: 4 }}
          >
            Apply for Limited Individual Judge Positions
          </Button>

          <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
            In-Person (Tempe, Arizona) Judging Process
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <MovieIcon />
              </ListItemIcon>
              <ListItemText
                primary="Stage 1: On-Site Video Reviews"
                secondary="Evaluate 4-minute pitch videos showcasing innovative nonprofit solutions together with other judges."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <LiveTvIcon />
              </ListItemIcon>
              <ListItemText
                primary="Stage 2: Live In-Person Demos"
                secondary="Interact face-to-face with top teams, asking questions and providing valuable feedback in real-time."
              />
            </ListItem>
          </List>

          <Typography variant="h3" gutterBottom sx={{ mt: 4 }}>
            Judging Criteria and Practice Scoring
          </Typography>
          <Typography variant="body1" paragraph>
            Use the sliders to practice scoring a hypothetical project. This
            will help you familiarize yourself with the judging criteria and
            scoring system.
          </Typography>

          {mounted && criteriaInfo.map((criterion) => (
            <Accordion key={criterion.category}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">
                  {criterion.name} ({criterion.maxPoints} points)
                </Typography>
                <Tooltip
                  title={<span style={{ fontSize: 14 }}>{criterion.tip}</span>}
                  enterDelay={0}
                  enterTouchDelay={0}
                  arrow
                >
                  <InfoIcon color="primary" sx={{ ml: 1 }} />
                </Tooltip>
              </AccordionSummary>
              <AccordionDetails>
                {criterion.subCriteria
                  ? criterion.subCriteria.map((subCriterion) =>
                      renderSlider(subCriterion, 5)
                    )
                  : renderSlider(
                      { name: criterion.name, key: criterion.category },
                      criterion.maxPoints
                    )}
              </AccordionDetails>
            </Accordion>
          ))}

          <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" align="right">
              Total Score: {totalScore}/40
            </Typography>
          </Paper>

          <Typography variant="h3" gutterBottom sx={{ mt: 4 }}>
            Tips for Consistent Judging
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Use anchoring: Before judging, review examples of 1, 3, and 5-point projects to calibrate your scale." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Avoid order effects: Take breaks between projects to reset your mental state and avoid comparing projects directly to each other." />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Be aware of cognitive biases:"
                secondary="Confirmation bias: Don't let your initial impression color your entire evaluation. Bandwagon effect: Make your evaluations independently before discussing with other judges."
              />
            </ListItem>
            <ListItem>
              <ListItemText primary="Provide specific feedback: For each score, note why you gave that score. This helps maintain consistency and provides valuable feedback to teams." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Consider the context: Remember that these are hackathon projects created under time pressure. Adjust your expectations accordingly, but maintain high standards for excellence." />
            </ListItem>
          </List>

          <Typography variant="body1" paragraph sx={{ mt: 4 }}>
            Judging at Opportunity Hack offers a unique chance to engage with
            cutting-edge technology solutions for social good in person. Your
            on-site expertise will help identify and nurture projects that can
            make a real difference in the nonprofit sector.
          </Typography>

          <Typography variant="body1" paragraph>
            This hands-on experience not only contributes to your professional
            growth but also aligns with corporate social responsibility goals
            and can strengthen visa applications by demonstrating active
            community involvement and technical expertise.
          </Typography>

          <Button
            variant="contained"
            color="primary"
            component={Link}
            href="/sponsor"
            sx={{ mt: 2, mr: 2 }}
            onClick={handleSponsorClick}
          >
            Become a Sponsor to Secure Judge Position
          </Button>

          <Button
            variant="outlined"
            color="primary"
            href="https://forms.gle/2oVBDxCX2Axci3nJA"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ mt: 2 }}
            onClick={handleApplyClick}
          >
            Apply for Limited Individual Judge Positions 
          </Button>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default AboutJudges;
