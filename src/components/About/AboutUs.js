import React from 'react';
import { TitleContainer, LayoutContainer, ProjectsContainer} from '../../styles/nonprofit/styles';
import Head from 'next/head';
import { Typography, Grid, Card, CardContent} from '@mui/material';
import LoginOrRegister from '../LoginOrRegister/LoginOrRegister';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

const style = { fontSize: '15px' };


const AboutUs = () => (
    <LayoutContainer key="mentorship" container>
      
  <Head>
      <title>Opportunity Hack - About Us</title>
      <meta property="og:title" content="Opportunity Hack - About Us" />
      <meta
          name="description"
          content="Learn about Opportunity Hack, our founders, board members, and community pledge. Join us as we harness the power of code for social good."
        />
        <meta
          name="keywords"
          content="Opportunity Hack, social good, non-profit technology, tech volunteering, coding for good, social impact, inclusive society, sustainable change, effective altruism"
        />      
      <meta
          name="og:description"
          content="Learn about Opportunity Hack, our founders, board members, and community pledge. Join us as we harness the power of code for social good."
        />      
      <meta property="og:image" content="https://i.imgur.com/pzcF1aj.jpg" />
      <meta property="og:url" content="https://ohack.dev/about" />
    </Head>
  
    <TitleContainer container>  
        <Typography variant="h3" component="h1">
        About Us
        </Typography>
        
        <Typography variant="body1" style={style} paragraph>
        Founded in 2013 as a part of eBay/PayPal Inc., Opportunity Hack was created to meet the technological needs of nonprofits. Our vision has since grown to harness the power of code for social good, fostering an inclusive society, and championing impactful, sustainable change.
        </Typography>

        <Box mt={2}>
        <Button variant="contained" color="primary" href="https://www.ohack.org/about" target="_blank" rel="noopener noreferrer">
          More at ohack.org
        </Button>
        </Box>    
    </TitleContainer>

    <ProjectsContainer style={{marginTop: 10}} >
        <Typography variant="h3" gutterBottom>
        Co-Founders
        </Typography>

        <Grid container spacing={2}>
        {['Prashanthi Ravanavarapu, Head of Product, Customer Experiences @ PayPal', 'Jot Powers, Senior Director, Site Reliability Engineering @ PayPal', 'Bryant Chan, Engineering Director @ Google', 'Smitha Satish, Principal MTS, Architect @ PayPal'].map((member, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2">
                  {member.split(',')[0]}
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                  {member.split(',')[1]}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    
    <Typography variant="h3" style={{marginTop: 15}} gutterBottom>
        Board Members
      </Typography>

      <Grid container spacing={2}>
        {['Prashanthi Ravanavarapu, Opportunity Hack Co-Founder, Head of Product, Customer Experiences @ PayPal', 'Jot Powers, Opportunity Hack Co-Founder & Treasurer, Senior Director, Site Reliability Engineering @ PayPal', 'Bhavya Shankar, Opportunity Hack Secretary, Product Manager @ PayPal', 'Gina Vannoni, Hero / Nurse', 'Greg Vannoni, Opportunity Hack President, Engineering Manager @ Meta'].map((member, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2">
                  {member.split(',')[0]}
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                  {member.split(',').slice(1).join(',')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    
    
    <Typography variant="h3" style={{marginTop: 15}} gutterBottom>
        Our Community Pledge
      </Typography>

      {['Harness the Power of Code: We promise to use our coding skills to create solutions that address pressing social issues and foster an inclusive society.', 'Pursue Impact: We pledge to focus our efforts on projects with the highest potential for positive, sustainable change.', 'Uphold Effective Altruism: We promise to strategically use our resources, continually learn and adapt, and strive for maximum social impact.', 'Champion Collaboration: We commit to working together, valuing diverse perspectives, and building on each other\'s strengths for greater impact.', 'Advocate for Inclusivity: We commit to promoting access to technology for all, regardless of socio-economic background, location, age, race, or gender.', 'Nurture a Supportive Community: We pledge to create a safe and supportive environment where everyone is encouraged to learn, grow, and contribute.'].map((pledge, i) => (
        <Box key={i} my={2}>
          <Typography variant="h4">
            {pledge.split(':')[0]}
          </Typography>
          <Typography variant="body1" paragraph style={style}>
            {pledge.split(':')[1]}
          </Typography>
        </Box>
      ))}

      <Typography variant="body1" paragraph style={style}>
        Together, we are Opportunity Hack. Together, we code for social good, for change.
      </Typography>

      <Grid container spacing={1}>
        <Grid item xs={2} sm={2} md={2}>
        <Button variant="contained" color="primary" href="https://www.ohack.org/about" target="_blank" rel="noopener noreferrer">
          More at ohack.org
        </Button>
        </Grid>
        <Grid item xs={3} sm={3} md={3}>
        <Button variant="contained" color="primary" href="/about/mentors">
          Learn about Mentorship
        </Button>
        </Grid>
    </Grid>

        
    <LoginOrRegister introText="Ready to join us as a mentor?" previousPage={"/about/mentors"} />

    </ProjectsContainer>
  </LayoutContainer>
);

export default AboutUs;
