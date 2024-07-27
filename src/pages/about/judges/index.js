import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  Typography, 
  Box, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Button, 
  Container, 
  ThemeProvider, 
  createTheme, 
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { 
  Gavel, 
  School, 
  Security, 
  Build, 
  Movie, 
  LiveTv, 
  Business, 
  EmojiEvents, 
  Work, 
  LocationOn 
} from '@mui/icons-material';
import JudgingCriteriaSlider from '../../../components/About/JudgingCriteriaSlider/JudgingCriteriaSlider';

const theme = createTheme({
  typography: {
    fontSize: 16,
  },
});

const AboutJudges = () => {
  const [scores, setScores] = useState({
    scope: { impact: 3, complexity: 3 },
    documentation: { codeAndUX: 3, easeOfUnderstanding: 3 },
    polish: 3,
    security: { dataProtection: 3, roleBased: 3 }
  });

  const [totalScore, setTotalScore] = useState(0);

  useEffect(() => {
    const newTotalScore = 
      (scores.scope.impact + scores.scope.complexity) * 2 +
      (scores.documentation.codeAndUX + scores.documentation.easeOfUnderstanding) +
      scores.polish * 4 +
      (scores.security.dataProtection + scores.security.roleBased);
    setTotalScore(newTotalScore);
  }, [scores]);

  const handleScoreChange = (category, subcategory, newValue) => {
    setScores(prevScores => ({
      ...prevScores,
      [category]: subcategory 
        ? { ...prevScores[category], [subcategory]: newValue }
        : newValue
    }));
  };

  const criteriaInfo = [
    {
      category: 'scope',
      name: 'Scope of Solution',
      subcriteria: [
        { name: 'Impact on Community', subcategory: 'impact', maxPoints: 10 },
        { name: 'Complexity of Problem Solved', subcategory: 'complexity', maxPoints: 10 }
      ],
      tip: "Consider both breadth (how many people it affects) and depth (how significantly it affects them). Avoid the 'halo effect' by judging each sub-criterion independently."
    },
    {
      category: 'documentation',
      name: 'Documentation',
      subcriteria: [
        { name: 'Code and UX Documentation', subcategory: 'codeAndUX', maxPoints: 5 },
        { name: 'Ease of Understanding', subcategory: 'easeOfUnderstanding', maxPoints: 5 }
      ],
      tip: "Good documentation is crucial for project sustainability. When scoring, imagine trying to implement or maintain the project based solely on the provided documentation."
    },
    {
      category: 'polish',
      name: 'Polish',
      maxPoints: 20,
      tip: "Consider the 'recency effect' - don't let a strong finish overshadow earlier shortcomings. Evaluate the overall level of polish throughout the entire project."
    },
    {
      category: 'security',
      name: 'Security',
      subcriteria: [
        { name: 'Data Protection', subcategory: 'dataProtection', maxPoints: 5 },
        { name: 'Role-based Security', subcategory: 'roleBased', maxPoints: 5 }
      ],
      tip: "Security is critical for nonprofit projects. When evaluating, consider both the implemented measures and the team's awareness of potential security issues."
    }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Opportunity Hack Judging",
    "description": "Judge innovative tech solutions for nonprofits at Opportunity Hack. Gain valuable experience, network with industry leaders, and contribute to social good in person.",
    "organizer": {
      "@type": "Organization",
      "name": "Opportunity Hack",
      "url": "https://ohack.dev"
    },
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "eventStatus": "https://schema.org/EventScheduled",
    "location": {
      "@type": "Place",
      "name": "Opportunity Hack Venue",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Phoenix",
        "addressRegion": "AZ",
        "addressCountry": "US"
      }
    },
    "image": "https://ohack.dev/images/opportunity-hack-judges.jpg",
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>Become an In-Person Judge at Opportunity Hack | Tech for Social Good</title>
        <meta name="description" content="Join Opportunity Hack as an in-person judge. Evaluate innovative tech solutions for nonprofits, gain valuable experience, and boost your company's ESG profile. Perfect for visa applications and corporate social responsibility initiatives." />
        <meta name="keywords" content="Opportunity Hack, in-person hackathon judge, tech for good, ESG, corporate social responsibility, visa application, nonprofit technology, social impact" />
        <meta property="og:title" content="Become an In-Person Judge at Opportunity Hack | Tech for Social Good" />
        <meta property="og:description" content="Evaluate innovative tech solutions for nonprofits in person, gain valuable experience, and boost your company's ESG profile. Join Opportunity Hack as a judge today!" />
        <meta property="og:image" content="https://ohack.dev/images/opportunity-hack-judges.jpg" />
        <meta property="og:url" content="https://ohack.dev/about/judges" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Head>
      <Container maxWidth="md">
        <Box sx={{ padding: 4 }}>
          <Typography variant="h1" gutterBottom>
            Become an In-Person Judge at Opportunity Hack
          </Typography>

          <Typography variant="h2" gutterBottom sx={{ mt: 4 }}>
            Why Judge at Opportunity Hack?
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><Business /></ListItemIcon>
              <ListItemText 
                primary="Enhance Your Company's ESG Profile" 
                secondary="Demonstrate your commitment to social responsibility and sustainable development through active, in-person participation." 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><EmojiEvents /></ListItemIcon>
              <ListItemText 
                primary="Gain Valuable In-Person Experience" 
                secondary="Perfect for visa applications, showing your expertise and community involvement through hands-on engagement." 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Work /></ListItemIcon>
              <ListItemText 
                primary="Network with Industry Leaders Face-to-Face" 
                secondary="Connect in person with professionals from top tech companies and nonprofits." 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><LocationOn /></ListItemIcon>
              <ListItemText 
                primary="On-Site Judging Experience" 
                secondary="All judging activities take place in person, providing a more immersive and impactful experience." 
              />
            </ListItem>
          </List>

          <Typography variant="h2" gutterBottom sx={{ mt: 4 }}>
            How to Become a Judge
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><Business /></ListItemIcon>
              <ListItemText 
                primary="Corporate Sponsorship" 
                secondary="Boost your company's visibility and CSR efforts by becoming a sponsor and sending an in-person judge." 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><School /></ListItemIcon>
              <ListItemText 
                primary="Individual Application" 
                secondary="Apply your industry expertise to evaluate innovative solutions for nonprofits on-site." 
              />
            </ListItem>
          </List>

          <Button 
            variant="contained" 
            color="primary" 
            href="https://forms.gle/2oVBDxCX2Axci3nJA"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ mt: 2 }}
          >
            Apply to be an In-Person Judge
          </Button>

          <Typography variant="h2" gutterBottom sx={{ mt: 4 }}>
            In-Person Judging Process
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><Movie /></ListItemIcon>
              <ListItemText 
                primary="Stage 1: On-Site Video Reviews" 
                secondary="Evaluate 3-minute pitch videos showcasing innovative nonprofit solutions together with other judges." 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><LiveTv /></ListItemIcon>
              <ListItemText 
                primary="Stage 2: Live In-Person Demos" 
                secondary="Interact face-to-face with top teams, asking questions and providing valuable feedback in real-time." 
              />
            </ListItem>
          </List>

          <Typography variant="h2" gutterBottom sx={{ mt: 4 }}>
            Judging Criteria and Practice Scoring
          </Typography>
          <Typography variant="body1" paragraph>
            Use the sliders below to practice scoring a hypothetical project. This will help you familiarize yourself with the judging criteria and scoring system. Hover over the score labels to see detailed descriptions.
          </Typography>
          
          {criteriaInfo.map((criterion) => (
            <Accordion key={criterion.category}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">{criterion.name}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {criterion.subcriteria ? (
                  criterion.subcriteria.map((subcriterion) => (
                    <JudgingCriteriaSlider
                      key={`${criterion.category}-${subcriterion.subcategory}`}
                      criterion={{...criterion, ...subcriterion}}
                      value={scores[criterion.category][subcriterion.subcategory]}
                      onChange={handleScoreChange}
                      maxPoints={subcriterion.maxPoints}
                    />
                  ))
                ) : (
                  <JudgingCriteriaSlider
                    criterion={criterion}
                    value={scores[criterion.category]}
                    onChange={handleScoreChange}
                    maxPoints={criterion.maxPoints}
                  />
                )}
              </AccordionDetails>
            </Accordion>
          ))}

          <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" align="right">
              Total Score: {totalScore}/60
            </Typography>
          </Paper>

          <Typography variant="h2" gutterBottom sx={{ mt: 4 }}>
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
            Judging at Opportunity Hack offers a unique chance to engage with cutting-edge technology solutions for social good in person. Your on-site expertise will help identify and nurture projects that can make a real difference in the nonprofit sector. This hands-on experience not only contributes to your professional growth but also aligns with corporate social responsibility goals and can strengthen visa applications by demonstrating active community involvement and technical expertise.
          </Typography>

          <Button 
            variant="contained" 
            color="primary" 
            href="https://forms.gle/2oVBDxCX2Axci3nJA"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ mt: 2 }}
          >
            Become an In-Person Judge Today
          </Button>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default AboutJudges;