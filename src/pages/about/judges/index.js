import React, { useState, useEffect } from 'react';
import Head from 'next/head';

import { 
  Typography, Box, List, ListItem, ListItemIcon, ListItemText, Button, Container, 
  ThemeProvider, createTheme, Paper, Slider, Tooltip, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { Gavel, School, Security, Build, Movie, LiveTv, Business, EmojiEvents, Work, LocationOn } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import Link from 'next/link';


const theme = createTheme({ typography: { fontSize: 16 } });

const AboutJudges = () => {
  const [scores, setScores] = useState({
    scopeImpact: 3, scopeComplexity: 3,
    documentationCode: 3, documentationEase: 3,
    polish: 3,
    securityData: 3, securityRole: 3
  });

  const SponsorshipCTA = () => {
    return (
      <Box sx={{ mt: 4, p: 3, bgcolor: '#f0f8ff', borderRadius: 2, boxShadow: 1 }}>
        <Typography variant="h5" gutterBottom>
          Want to secure a judge position? Consider becoming a sponsor!
        </Typography>
        <Typography variant="body1" paragraph>
          Most of our judges come from our corporate sponsors. Sponsorship not only guarantees a judging slot but also provides additional benefits and visibility for your company.
        </Typography>
        <Link href="/sponsor" passHref>
          <Button
            component="a"
            variant="contained"
            color="primary"
          >
            Learn About Sponsorship
          </Button>
        </Link>
      </Box>
    );
  };

  const [totalScore, setTotalScore] = useState(0);

  useEffect(() => {
    const newTotalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    setTotalScore(newTotalScore);
  }, [scores]);

  const handleScoreChange = (criterion) => (_, newValue) => {
    setScores(prevScores => ({ ...prevScores, [criterion]: newValue }));
  };

  const MentorCTA = () => {
  return (
    <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
      <Typography variant="h5" gutterBottom>
        Not interested in judging? Consider becoming a mentor!
      </Typography>
      <Typography variant="body1" paragraph>
        As a mentor, you can share your expertise, guide teams through challenges, and make a lasting impact on innovative nonprofit solutions.
      </Typography>
      <Link href="/about/mentors" passHref>
        <Button
          component="a"
          variant="contained"
          color="primary"
        >
          Learn About Mentoring
        </Button>
      </Link>
    </Box>
  );
};
    
  const getDescription = (score) => {
    const descriptions = {
      1: "Poor - Significantly below expectations",
      2: "Fair - Below expectations",
      3: "Good - Meets expectations",
      4: "Very Good - Exceeds expectations",
      5: "Excellent - Significantly exceeds expectations"
    };
    return descriptions[score] || "";
  };

  const criteriaInfo = [
    {
      category: 'scope', name: 'Scope of Solution', maxPoints: 10,
      subCriteria: [
        { name: 'Impact on Community', key: 'scopeImpact' },
        { name: 'Complexity of Problem Solved', key: 'scopeComplexity' }
      ],
      tip: "Consider both breadth and depth of impact. Evaluate community impact and problem complexity."
    },
    {
      category: 'documentation', name: 'Documentation', maxPoints: 10,
      subCriteria: [
        { name: 'Code and UX Documentation', key: 'documentationCode' },
        { name: 'Ease of Understanding', key: 'documentationEase' }
      ],
      tip: "Assess documentation quality and clarity. Consider project sustainability."
    },
    {
      category: 'polish', name: 'Polish', maxPoints: 5,
      tip: "Evaluate overall refinement and readiness for real-world use."
    },
    {
      category: 'security', name: 'Security', maxPoints: 10,
      subCriteria: [
        { name: 'Data Protection', key: 'securityData' },
        { name: 'Role-based Security', key: 'securityRole' }
      ],
      tip: "Assess data protection and role-based security implementation."
    }
  ];

  const renderSlider = (criterion, maxPoints) => (
    <Box sx={{ width: '100%', mt: 2 }}>
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
      <Typography variant="body2" sx={{ mt: 1 }}>
        Score: {scores[criterion.key]} / 5 ({scores[criterion.key]} points)
      </Typography>
    </Box>
  );

return (
    <ThemeProvider theme={theme}>
    <Head>
        <title>Opportunity Hack Judges: Elevate Your Impact Through In-Person Tech Evaluation</title>
        <meta name="description" content="Become an Opportunity Hack judge to enhance your company's ESG profile, gain valuable experience, network with industry leaders, and evaluate innovative nonprofit solutions in person." />
        <meta name="keywords" content="Opportunity Hack, hackathon judges, tech evaluation, ESG, corporate social responsibility, nonprofit solutions, in-person judging" />
        <meta property="og:title" content="Opportunity Hack Judges: In-Person Tech Evaluation for Social Impact" />
        <meta property="og:description" content="Judge at Opportunity Hack to enhance your ESG profile, gain experience, and network while evaluating innovative nonprofit tech solutions in person." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ohack.dev/judges" />
        <meta property="og:image" content="https://cdn.ohack.dev/ohack.dev/2023_hackathon_1.webp" />
        <link rel="canonical" href="https://ohack.dev/judges" />
      </Head>
        <Container maxWidth="md">
            <Box sx={{ padding: 4, mt: 5 }}>
                <Typography variant="h1" gutterBottom>OHack Judges</Typography>
                
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

                <SponsorshipCTA />


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

                <Typography variant="h2" gutterBottom sx={{ mt: 4 }}>Judging Criteria and Practice Scoring</Typography>
                <Typography variant="body1" paragraph>
                    Use the sliders to practice scoring a hypothetical project. This will help you familiarize yourself with the judging criteria and scoring system.
                </Typography>
                
                {criteriaInfo.map((criterion) => (
                    <Accordion key={criterion.category}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">{criterion.name} ({criterion.maxPoints} points)</Typography>
                            <Tooltip title={criterion.tip} enterDelay={0} enterTouchDelay={0} arrow>
                                <InfoIcon color="primary" sx={{ ml: 1 }} />
                            </Tooltip>
                        </AccordionSummary>
                        <AccordionDetails>
                            {criterion.subCriteria
                                ? criterion.subCriteria.map((subCriterion) => renderSlider(subCriterion, 5))
                                : renderSlider({ name: criterion.name, key: criterion.category }, criterion.maxPoints)
                            }
                        </AccordionDetails>
                    </Accordion>
                ))}

                <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
                    <Typography variant="h6" align="right">Total Score: {totalScore}/35</Typography>
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
                    Judging at Opportunity Hack offers a unique chance to engage with cutting-edge technology solutions for social good in person. Your on-site expertise will help identify and nurture projects that can make a real difference in the nonprofit sector.
                </Typography>

                <Typography variant="body1" paragraph>
                    This hands-on experience not only contributes to your professional growth but also aligns with corporate social responsibility goals and can strengthen visa applications by demonstrating active community involvement and technical expertise.
                </Typography>

                <Button 
                  variant="contained" 
                  color="primary" 
                  component={Link}
                  href="/sponsor"
                  sx={{ mt: 2, mr: 2 }}
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
                >
                  Apply for Limited Individual Judge Positions
                </Button>

                <MentorCTA/>

            </Box>
        </Container>
    </ThemeProvider>
);
};

export default AboutJudges;