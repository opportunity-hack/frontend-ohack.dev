import React from 'react';
import Head from 'next/head';
import { Typography, Card, CardContent, CardMedia, Grid, Button, Container, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { styled } from '@mui/system';
import Link from 'next/link';
import PetsIcon from '@mui/icons-material/Pets';
import GroupIcon from '@mui/icons-material/Group';
import BusinessIcon from '@mui/icons-material/Business';
import CodeIcon from '@mui/icons-material/Code';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import BuildIcon from '@mui/icons-material/Build';
import FutureIcon from '@mui/icons-material/Update';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FavoriteIcon from '@mui/icons-material/Favorite';



const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const StyledCardMedia = styled(CardMedia)({
  paddingTop: '56.25%', // 16:9 aspect ratio
});

const StyledCardContent = styled(CardContent)({
  flexGrow: 1,
});

const LargerTypography = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  [theme.breakpoints.up('md')]: {
    fontSize: '1.1rem',
  },
}));

const successStories = [
  {
  "title": "Automated Data Management and Reporting System",
  "nonprofit": "Matthews Crossing Food Bank",
  "hacker": "James Rowley and Mark Omo (2016, 2018)",
  "sponsor": "PayPal, TechShop Chandler, Avnet, GoDaddy, Repay, MDI Group, Splunk, Galvanize, InfusionSoft",
  "image": "https://cdn.ohack.dev/nonprofit_images/matthews_crossing.webp",
  "summary": "Developed a comprehensive data management system to automate donation tracking, report generation, and data visualization, significantly reducing manual effort and improving operational efficiency.",
  "impact": "The solution drastically reduced the time spent on manual data entry and report generation, saving an estimated 5 hours per month for key staff. With over 35,000 volunteer users across 1,600 food banks using similar systems, the potential time savings could equate to over $150,000 in value. The system also improved data accuracy and enabled more timely and insightful reporting for decision-making.",
  "testimonial": "Matthews Crossing Data Manager has transformed our operations. It's allowed us to redirect valuable volunteer time from paperwork to serving our community. The automated reports and visualizations have given us new insights into our donations and operations, helping us make more informed decisions to better serve the 623,300 people in Maricopa County facing food insecurity.",
  "caseStudyLink": "/about/success-stories/matthews-crossing-data-automation",
  "learnings": [
  "Demonstrated the importance of sustainable, user-friendly solutions for nonprofits with limited technical resources",
  "Highlighted the value of iterative development and returning to improve solutions over multiple years",
  "Showed the potential for tech solutions to significantly impact operational efficiency in nonprofits",
  "Emphasized the need for robust security measures in handling sensitive donation and personal data",
  "Illustrated the importance of open standards and interoperability in nonprofit tech solutions",
  "Revealed the power of data visualization in communicating impact and informing strategy",
  "Underscored the value of close collaboration between tech volunteers and nonprofits to understand and address real needs"
  ],
  "technologiesUsed": [
  "PHP",
  "Python",
  "JavaScript",
  "HTML/CSS",
  "CSV data processing",
  "Excel report generation",
  "Data visualization tools",
  "Two-factor authentication"
  ],
  "futureProspects": "The Matthews Crossing Data Manager has potential for wider adoption among food banks using similar systems. Future enhancements could include more advanced predictive analytics to forecast donation trends and needs, integration with other nonprofit management tools, and mobile applications for real-time data entry and reporting. The success of this project also opens doors for exploring other areas of Matthews Crossing's operations that could benefit from technological solutions, such as volunteer management or distribution logistics optimization."
  },
{
  "title": "AI-Enhanced Adoption Process for Animal Rescue",
  "nonprofit": "Saving One Life Animal Rescue and Sanctuary",
  "hacker": "Emilee Spence and Justin Canode (2019), Karishma Joseph and Animesh Mohan (2020)",
  "sponsor": "PayPal, Galvanize, Motion Recruitment, Tech Talent South, GoDaddy, Dick's Sporting Goods, Keap",
  "image": "https://cdn.ohack.dev/nonprofit_images/saving_one_life.webp",
  "summary": "Developed a multi-phase solution to streamline the adoption process, including an AI-powered compatibility scoring system and a risk assessment tool using social media analysis.",
  "impact": "While not fully implemented, the project provided invaluable insights into the potential of AI in animal adoption processes. It allowed Saving One Life to explore various technological approaches without the financial and time costs of internal prototyping. The project revealed the complexity of using social media for adopter risk assessment, a crucial insight that wouldn't have been uncovered without this collaborative effort.",
  "testimonial": "Opportunity Hack brought together passionate volunteers who understood our mission. Their innovative approach to our adoption process challenges opened our eyes to the potential of technology in animal rescue operations. The exploration of multiple solutions helped us understand what paths could work for us, without the usual risks associated with technology adoption.",
  "caseStudyLink": "/about/success-stories/saving-one-life-adoption-innovation",
  "learnings": [
    "Demonstrated the potential of AI in matching pets with suitable adopters",
    "Highlighted the importance of data security and privacy in handling adopter information",
    "Showed the value of iterative development in complex nonprofit projects",
    "Emphasized the need for sustainable, long-term solutions in volunteer-driven organizations",
    "Revealed the benefits of exploring multiple technological approaches before committing resources to implementation",
    "Uncovered the unexpected complexity in using social media data for adopter risk assessment",
    "Illustrated the value of hackathons in providing low-risk environments for nonprofits to experiment with new technologies"
  ],
  "technologiesUsed": [
    "Python",
    "Flask",
    "MongoDB",
    "Machine Learning algorithms",
    "Social Media APIs",
    "Data Analysis tools"
  ],
  "futureProspects": "The project's foundation can be built upon to create a comprehensive, AI-driven adoption management system, potentially revolutionizing how animal rescues operate and increasing successful adoptions. The insights gained about social media analysis complexity can inform future attempts to assess adopter suitability, possibly leading to more nuanced and ethical approaches. This experience has equipped Saving One Life with the knowledge to make more informed decisions about technology adoption in the future, potentially saving time and resources in their digital transformation journey."
}
  // ... other success stories
];

export default function SuccessStories() {
  return (
    <>
      <Head>
        <title>Opportunity Hack Success Stories: Tech Innovation for Social Good</title>
        <meta name="description" content="Discover how Opportunity Hack connects nonprofits with skilled tech volunteers to create innovative solutions. Read success stories of AI, blockchain, and IoT applications in various social causes." />
        <meta name="keywords" content="Opportunity Hack, nonprofit technology, hackathon success stories, tech for good, AI for animal rescue, social impact tech" />
        <meta property="og:title" content="Opportunity Hack: Transforming Nonprofits through Technology" />
        <meta property="og:description" content="See how developers, designers, and tech companies are making a real-world impact through Opportunity Hack. Join us in using technology for social good." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ohack.dev/about/success-stories" />
        <meta property="og:image" content="https://ohack.dev/images/opportunity-hack-success-banner.jpg" />
      </Head>
      
      <Container maxWidth="lg">
        <Typography mt={10} variant="h1" align="center" gutterBottom>
          Opportunity Hack Success Stories
        </Typography>
        <Typography variant="h2" align="center" paragraph>
          Transforming Nonprofits Through Technology
        </Typography>
        <Typography variant="h3" align="center" paragraph>
          Real-world impact, powered by innovation and compassion
        </Typography>
        
        <Grid container spacing={4} marginTop={4}>
          {successStories.map((story, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <StyledCard>
                <StyledCardMedia
                  image={story.image}
                  title={story.title}
                />
                <StyledCardContent>
                  <Typography gutterBottom variant="h5" component="h2">
                    {story.title}
                  </Typography>
                  <LargerTypography>
                    <FavoriteIcon /> <strong>Nonprofit:</strong> {story.nonprofit}
                  </LargerTypography>
                  <LargerTypography>
                    <GroupIcon /> <strong>Tech Volunteers:</strong> {story.hacker}
                  </LargerTypography>
                  <LargerTypography>
                    <BusinessIcon /> <strong>Sponsor:</strong> {story.sponsor}
                  </LargerTypography>
                  <LargerTypography paragraph>
                    <EmojiObjectsIcon /> <strong>Summary:</strong> {story.summary}
                  </LargerTypography>
                  <LargerTypography paragraph>
                    <CheckCircleOutlineIcon /> <strong>Impact:</strong> {story.impact}
                  </LargerTypography>
                  <Button size="small" color="primary" href={story.caseStudyLink}>
                    Read Full Case Study
                  </Button>
                </StyledCardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
        
        <Typography variant="h2" align="center" marginTop={8} gutterBottom>
          Join the Opportunity Hack Movement
        </Typography>
        <Grid container spacing={4} justifyContent="center" marginTop={2}>
          <Grid item>
            <Link href="/nonprofits/apply" passHref>
              <Button variant="contained" color="primary" size="large">
                Nonprofits: Submit Your Challenge
              </Button>
            </Link>
          </Grid>
          <Grid item>
            <Link href="/hackers/join" passHref>
              <Button variant="contained" color="secondary" size="large">
                Tech Volunteers: Apply Your Skills
              </Button>
            </Link>
          </Grid>
          <Grid item>
            <Link href="/sponsor" passHref>
              <Button variant="contained" color="info" size="large">
                Sponsors: Empower Innovation
              </Button>
            </Link>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}