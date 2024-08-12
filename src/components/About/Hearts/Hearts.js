import React from 'react';
import { useEffect } from 'react';
import { 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  useMediaQuery,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from '@mui/system';
import Head from 'next/head';
import Image from 'next/image';
import { InstagramEmbed } from 'react-social-media-embed';
import LoginOrRegister from '../../LoginOrRegister/LoginOrRegister';
import { LayoutContainer, TitleContainer, ProjectsContainer } from '../../../styles/nonprofit/styles';
import RewardStructure from './RewardStructure';
import Link from 'next/link';
import { FaGavel, FaChalkboardTeacher, FaHeart } from 'react-icons/fa';
import { initFacebookPixel, trackEvent } from '../../../lib/ga';


 const trackOnClickButtonClickWithGoogleAndFacebook = (buttonName) => {
    trackEvent({
      action: "click_hearts",
      category:  "hearts",
      label: buttonName,
    });

  }

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontSize: '15px',
  [theme.breakpoints.down('sm')]: {
    fontSize: '13px',
  },
}));

const JudgeMentorHeartsCTA = () => {
  return (
    <Box sx={{ mb:4, mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
      <Typography variant="h5" gutterBottom>
        Earn Hearts as a Judge or Mentor!
      </Typography>
      <Typography variant="body1" paragraph>
        Did you know you can earn hearts by contributing as a judge or mentor? It's a great way to give back and boost your profile!
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Box display="flex" alignItems="center" mb={2}>
            <FaGavel size={24} style={{ marginRight: '8px' }} />
            <Typography variant="body1">
              Judges earn 1 heart per 3-hour block
            </Typography>
          </Box>
          <Link href="/about/judges" passHref>
            <Button
              component="a"
              variant="contained"
              color="primary"
              startIcon={<FaHeart />}
              onClick={
                () => trackOnClickButtonClickWithGoogleAndFacebook("judges")
              }
            >
              Learn About Judging
            </Button>
          </Link>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box display="flex" alignItems="center" mb={2}>
            <FaChalkboardTeacher size={24} style={{ marginRight: '8px' }} />
            <Typography variant="body1">
              Mentors earn 1 heart per 3-hour block
            </Typography>
          </Box>
          <Link href="/about/mentors" passHref>
            <Button
              onClick={ 
                () => trackOnClickButtonClickWithGoogleAndFacebook("mentors")
              }
              component="a"
              variant="contained"
              color="secondary"
              startIcon={<FaHeart />}
            >
              Learn About Mentoring
            </Button>
          </Link>
        </Grid>
      </Grid>
    </Box>
  );
};

const StyledProjectsContainer = styled(ProjectsContainer)(({ theme }) => ({
  width: '100%',
  maxWidth: 'none',
  padding: theme.spacing(2),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(3),
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  width: '100%',
  overflowX: 'auto',
  marginBottom: theme.spacing(3),
  '& .MuiTable-root': {
    minWidth: '100%',
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: '15px',
  [theme.breakpoints.down('sm')]: {
    fontSize: '13px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    borderBottom: 'none',
    padding: '8px 16px',
    '&:before': {
      content: 'attr(data-label)',
      fontWeight: 'bold',
      marginBottom: '4px',
    },
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    display: 'flex',
    flexDirection: 'column',
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const rewardStructure = [
  { hearts: 2, reward: "Certificate" },
  { hearts: 4, reward: "IG/FB Shoutout" },
  { hearts: 5, reward: "LinkedIn Recommendation" },
  { hearts: 6, reward: "Interview prep & resume review" },
  { hearts: 10, reward: "Reference for job application" },
  { hearts: 24, reward: "Opportunity Hack swag" },
  { hearts: 48, reward: "Sponsor-provided tech award" },
];

const heartCategories = [
  { category: "What", items: [
    "Productionalized projects", "Requirements Gathering", "Documentation",
    "Design architecture", "Code quality", "Unit tests", "Observability"
  ]},
  { category: "How", items: [
    "Standups completed", "Code reliability", 
    "Customer Driven Innovation (CDI) and Design Thinking",
    "Iterations of code pushed to production"
  ]}
];

const Hearts = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));


  useEffect(() => {
    initFacebookPixel();
  }, []);


 

  return (
    <LayoutContainer>
      <Head>
        <title>Earn Hearts, Make Impact: The Opportunity Hack Rewards System</title>
        <meta name="description" content="Join Opportunity Hack and earn hearts by contributing to open source projects for nonprofits around the world." />
        <meta property="og:title" content="Earn Hearts, Make Impact: The Opportunity Hack Rewards System" />
        <meta property="og:description" content="Join Opportunity Hack and earn hearts by contributing to open source projects for nonprofits around the world. The Hearts System recognizes and rewards your contributions, allowing you to make a positive impact on the lives of others." />
        <meta property="og:image" content="https://i.imgur.com/pzcF1aj.jpg" />
        <meta property="og:url" content="https://hearts.ohack.dev" />
      </Head>
      
      <TitleContainer>  
        <Typography variant="h3" component="h1" gutterBottom>
          Opportunity Hack Hearts System
        </Typography>
        
        <Grid container spacing={3}>            
          <Grid item xs={12} sm={6} md={8}>
            <StyledTypography paragraph>
              Welcome to the Opportunity Hack Hearts System! By contributing to open source projects for nonprofits, you can earn hearts and make a positive impact on the world. Whether you are a Software Engineer, Product Manager, UX Designer, or Project Manager, your skills are valuable in creating solutions that help nonprofits achieve their goals.
            </StyledTypography>
            <Grid container spacing={2}>
              <Grid item>
                <Button onClick={
                  () => trackOnClickButtonClickWithGoogleAndFacebook("original_rfc")
                } variant="contained" color="primary" href="https://docs.google.com/document/d/1J-1o5YOpdt4slyd_PxitNN0gZe7UcI1GjyTbhTem2qU/edit?usp=sharing" target="_blank">
                  See the Original RFC
                </Button>
              </Grid>
              <Grid item>
                <Button
                  onClick={
                    () => trackOnClickButtonClickWithGoogleAndFacebook("project_completion")
                  }
                variant="outlined" color="primary" href="/about/completion">
                  Project Completion
                </Button>
              </Grid>
              <Grid item>
                <Button onClick={
                  () => trackOnClickButtonClickWithGoogleAndFacebook("github_issue_8")
                } 
                variant="outlined" color="primary" href="https://github.com/opportunity-hack/frontend-ohack.dev/issues/8" target="_blank">
                  GitHub Issue #8
                </Button>
              </Grid>
              <Grid item>
                <Button onClick={
                  () => trackOnClickButtonClickWithGoogleAndFacebook("github_issue_7")
                } variant="outlined" color="primary" href="https://github.com/opportunity-hack/frontend-ohack.dev/issues/7" target="_blank">
                  GitHub Issue #7
                </Button>
              </Grid>
            </Grid>
            <Box mt={2}>
              <Image 
                src="https://cdn.ohack.dev/8d2a68667a6911ee9e03e2f442f28a46.png"
                width={971/3}
                height={971/3}
                alt="Opportunity Hack Hearts Certificate Example"                
              />
              <StyledTypography variant="caption" display="block">
                Example Hearts Certificate
              </StyledTypography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>                
            <InstagramEmbed url="https://www.instagram.com/p/CoupvGxuiLX/" maxWidth={328} height={500} />
          </Grid>                                
        </Grid>
      </TitleContainer>
        
      <StyledProjectsContainer>
        <Typography variant="h4" gutterBottom>
          Earn Hearts and Make a Difference
        </Typography>
        <StyledTypography paragraph>
          Are you passionate about making a tangible, meaningful difference in the world through open source projects? The Opportunity Hack Hearts System offers you the chance to earn hearts by contributing to projects for nonprofits. Your skills and expertise can transform ideas into impactful solutions that benefit communities worldwide.
        </StyledTypography>
        <StyledTypography paragraph>
          As a contributor, you play a vital role in the hearts system. Your contributions help nonprofits address real-world challenges and create sustainable solutions. By earning hearts, you not only showcase your skills but also make a lasting impact on the lives of others. Join us and be part of a community that uses technology to drive positive change.
        </StyledTypography>

        <JudgeMentorHeartsCTA />

        <Typography variant="h4" gutterBottom>
          How the Hearts System Works
        </Typography>
        <StyledTypography paragraph>
          The hearts system is designed to recognize and reward your contributions. Here's how it works:
        </StyledTypography>
        <ol>
          <li><StyledTypography>Choose a project: Browse through the available open source projects for nonprofits and select one that aligns with your interests and skills.</StyledTypography></li>
          <li><StyledTypography>Contribute: Dive into the project and start contributing. Whether it's writing code, designing user interfaces, or managing project tasks, your contributions are valuable.</StyledTypography></li>
          <li><StyledTypography>Earn hearts: As you make contributions, you'll earn hearts. The more impactful your contributions, the more hearts you'll earn.</StyledTypography></li>
          <li><StyledTypography>Level up: As you accumulate hearts, you'll level up in the hearts system. Higher levels unlock additional benefits and recognition within the Opportunity Hack community.</StyledTypography></li>
        </ol>

        <Typography variant="h4" gutterBottom>
          Types of Contributions
        </Typography>
        <StyledTypography paragraph>
          The hearts system recognizes various types of contributions. Here are the main categories:
        </StyledTypography>
        
        <StyledTableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell>Category</StyledTableCell>
                <StyledTableCell>Contribution Areas</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {heartCategories.map((category) => (
                <StyledTableRow key={category.category}>
                  <StyledTableCell data-label="Category">{category.category}</StyledTableCell>
                  <StyledTableCell data-label="Contribution Areas">
                    <ul>
                      {category.items.map((item, index) => (
                        <li key={index}><StyledTypography>{item}</StyledTypography></li>
                      ))}
                    </ul>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>

        <Typography variant="h4" gutterBottom>
          Reward Structure
        </Typography>
        <StyledTypography paragraph>
          As you accumulate hearts, you unlock various rewards. Here's what you can earn:
        </StyledTypography>
        
        <StyledTableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell>Hearts Required</StyledTableCell>
                <StyledTableCell>Reward</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rewardStructure.map((reward) => (
                <StyledTableRow key={reward.hearts}>
                  <StyledTableCell data-label="Hearts Required">{reward.hearts}</StyledTableCell>
                  <StyledTableCell data-label="Reward">{reward.reward}</StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>

        <Typography variant="h4" gutterBottom>
          Rewards
        </Typography>
        <StyledTypography paragraph>
            The hearts system offers a range of rewards to recognize your contributions. Here are the rewards you can earn:
        </StyledTypography>
        
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <StyledTypography>Reward: 0.5 heart</StyledTypography>
          </AccordionSummary>
          <AccordionDetails>
            <StyledTypography variant="h6">Partially met goal</StyledTypography>
            <StyledTypography paragraph>
              <strong>What:</strong> Partial completion of tasks such as productionalized projects, requirements gathering, documentation, design architecture, code quality, unit tests, and observability.
            </StyledTypography>
            <StyledTypography paragraph>
              <strong>How:</strong> Partial completion of standups, code reliability, customer-driven innovation, and iterations of code pushed to production.
            </StyledTypography>
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <StyledTypography>Reward: 1 heart</StyledTypography>
          </AccordionSummary>
          <AccordionDetails>
            <StyledTypography variant="h6">Met goal</StyledTypography>
            <StyledTypography paragraph>
              <strong>What:</strong> More than 90% completion of tasks.
            </StyledTypography>
            <StyledTypography paragraph>
              <strong>How:</strong> Completion of at least 3 standups, reliable code, significant customer interaction, and multiple code iterations pushed to production.
            </StyledTypography>
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <StyledTypography>Reward: 1.5 hearts</StyledTypography>
          </AccordionSummary>
          <AccordionDetails>
            <StyledTypography variant="h6">Exceeded goal</StyledTypography>
            <StyledTypography paragraph>
              More than 100% completion and work done 25% faster than expected. This includes 8 standups, high code reliability, extensive customer interaction, and multiple code iterations.
            </StyledTypography>
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <StyledTypography>Reward: 2 hearts</StyledTypography>
          </AccordionSummary>
          <AccordionDetails>
            <StyledTypography variant="h6">Greatly exceeded goal</StyledTypography>
            <StyledTypography paragraph>
              More than 100% completion and work done 50% faster than expected. This includes more than 15 standups, outstanding code reliability, extensive customer interaction, and numerous code iterations.
            </StyledTypography>
          </AccordionDetails>
        </Accordion>

        <Box mt={4}>              
            <RewardStructure />
        </Box>

        <Box mt={4}>
          <Typography variant="h4" gutterBottom>
            Join Us and Make an Impact
          </Typography>
          <StyledTypography paragraph>
            Ready to start earning hearts and making a difference? Join Opportunity Hack today and contribute your skills to meaningful projects that help nonprofits around the world.
          </StyledTypography>
          <LoginOrRegister introText="Ready to join us?" previousPage={"/about/hearts"} />
        </Box>
      </StyledProjectsContainer>
    </LayoutContainer>
  );
};

export default Hearts;