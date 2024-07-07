import React from 'react';
import { TitleContainer, LayoutContainer, ProjectsContainer } from '../../styles/nonprofit/styles';
import Head from 'next/head';
import { Typography, Grid, Card, CardContent } from '@mui/material';
import LoginOrRegister from '../LoginOrRegister/LoginOrRegister';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { FaLinkedin } from 'react-icons/fa';
import * as ga from '../../lib/ga';
import ReactPixel from 'react-facebook-pixel';
import Image from 'next/image';

const style = { fontSize: '15px' };

// Data
const cofounders = [
  [ 'Prashanthi Ravanavarapu', 'https://www.linkedin.com/in/pravanavarapu/' ],
  [ 'Jot Powers', 'https://www.linkedin.com/in/jotpowers/'],
  [ 'Bryant Chan', 'https://www.linkedin.com/in/bryantchan/'],
  [ 'Smitha Satish', 'https://www.linkedin.com/in/smitha-satish-7978091/']
]

const board_members = [
  'Prashanthi Ravanavarapu, Opportunity Hack Co-Founder, Head of Product, Customer Experiences @ PayPal',
  'Jot Powers, Opportunity Hack Co-Founder & Treasurer, Senior Director, Site Reliability Engineering @ PayPal',
  'Bhavya Shankar, Opportunity Hack Secretary, Product Manager @ PayPal',
  'Gina Vannoni, Hero / Nurse',
  'Greg Vannoni, Opportunity Hack President, Engineering Manager @ Meta']

const pledge = [
  'Harness the Power of Code: We promise to use our coding skills to create solutions that address pressing social issues and foster an inclusive society.',
  'Pursue Impact: We pledge to focus our efforts on projects with the highest potential for positive, sustainable change.',
  'Uphold Effective Altruism: We promise to strategically use our resources, continually learn and adapt, and strive for maximum social impact.',
  'Champion Collaboration: We commit to working together, valuing diverse perspectives, and building on each other\'s strengths for greater impact.',
  'Advocate for Inclusivity: We commit to promoting access to technology for all, regardless of socio-economic background, location, age, race, or gender.',
  'Nurture a Supportive Community: We pledge to create a safe and supportive environment where everyone is encouraged to learn, grow, and contribute.'
]

const AboutUs = () => {  

  const gaButton = async (action, actionName) => {
    ReactPixel.track(action, { action_name: actionName });

    ga.event({ 
        action: "conversion",
        params: {
          send_to: "AW-11474351176/JCk6COG-q4kZEMjost8q"  
        }      
      });

    ga.event({
      action: action,
      params: {
        action_name: actionName,
      },
    });    
  };

  return(
  <LayoutContainer key="mentorship" container>
    <Head>
      <title>Opportunity Hack - About Us</title>
      <meta property="og:title" content="Opportunity Hack - About Us" />
      <meta
        name="description"
        content={`Learn about Opportunity Hack, our founders, board members (${board_members.join(', ')}), and community pledge. Join us as we harness the power of code for social good.`}
      />
      <meta
        name="keywords"
        content="Opportunity Hack, social good, non-profit technology, tech volunteering, coding for good, social impact, inclusive society, sustainable change, effective altruism"
      />
      <meta
        name="og:description"
        content={`Learn about Opportunity Hack, our founders, board members (${board_members.join(', ')}), and community pledge. Join us as we harness the power of code for social good.`}
      />
      <meta   property="og:image" content="https://i.imgur.com/pzcF1aj.jpg" />
      <meta property="og:url" content="https://ohack.dev/about" />
      {board_members.map((member, i) => (
        <meta key={i} name="board_member" content={member} />
      ))}
    </Head>

    <TitleContainer container>
      <Typography variant="h2">
        About Us
      </Typography>

      <Typography variant="body1" style={style} paragraph>
        Founded in 2013 as a part of eBay/PayPal Inc., Opportunity Hack was created to meet the technological needs of nonprofits. Our vision has since grown to harness the power of code for social good, fostering an inclusive society, and championing impactful, sustainable change.        
      </Typography>

      <iframe
                  width={560/2}
                  height={315/2}
                  src="https://www.youtube.com/embed/Ia_xsX-318E"
                  title="YouTube video player"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                ></iframe>

      <Typography variant="h2">
        Why Opportunity Hack?
      </Typography>
      <Typography variant="body1" style={style} paragraph>        
        🧑🏿‍💻 As computer science students or software engineers, we have a moral and ethical obligation to use our skills to make a positive impact on the world. One way to do this is by contributing to Opportunity Hack, a hackathon focused on creating technology solutions for social good.
        <br /><br />
        💡 By participating in Opportunity Hack, you have the opportunity to use your technical skills to make a real difference in the lives of others. In addition to the personal satisfaction of using your skills for good, participating in Opportunity Hack can also help you build your resume and portfolio. Demonstrating your ability to create technology solutions that have a positive impact on society can be a powerful way to stand out to potential employers and make a name for yourself in the industry.
        <br /><br />
        ❤️ But perhaps most importantly, contributing to Opportunity Hack can evoke a sense of purpose and fulfillment that is often missing from traditional software engineering jobs. By using your skills to help others, you can find meaning and satisfaction in your work that goes beyond just writing code.
        <br /><br />
        💻 So if you're looking for a way to make a difference with your skills, consider participating in Opportunity Hack. Not only will you be able to contribute to social good, but you'll also be able to build your skills, your resume, and your sense of purpose and fulfillment.                
      </Typography>

      <Box mt={2}>
        <Button variant="contained" onClick={() => gaButton('button_see_nonprofits', 'see projects')} style={style} color="secondary" href="/nonprofits">
          👀 Nonprofit projects
        </Button>        
      </Box>      
    </TitleContainer>

    <ProjectsContainer mt={"50px"}>
      <Typography variant="h3" gutterBottom>
        Co-Founders
      </Typography>

      <Grid container spacing={2}>
        {cofounders.map((member, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2">
                  {member[0]}
                  <a href={`${member[1]}`} target="_blank" rel="noopener noreferrer">
                    <FaLinkedin size={32} style={{ marginLeft: '10px', marginTop: '15px' }} />
                  </a>
                </Typography>                              
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h3" mt={"50px"} gutterBottom>
        Board Members
      </Typography>

      <Grid container spacing={2}>
        {board_members.map((member, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2">
                  {member.split(',')[0]}
                </Typography>
                <Typography variant="h6" style={{ marginTop: 5 }} color="textSecondary" component="p">
                  {member.split(',').slice(1).join(',')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

       <Typography variant="h3" style={{ marginTop: 50 }} gutterBottom>
        Thinking about a coding bootcamp?
      </Typography>
      <Typography variant="h4">
        We have coding bootcamp and senior capstone projects for you!
      </Typography>
      <Image src="https://cdn.ohack.dev/ohack.dev/2023_hackathon_1.webp"  layout="responsive" alt="Coding Bootcamp Projects" width={4032/9} height={3024/9}  />
        <Box key="bootcamp" my={2}>
          <Typography variant="body1" paragraph style={style}>
          If you are part of a coding bootcamp and want to build your portfolio, you should consider writing code for charity with Opportunity Hack. Opportunity Hack is a social good hackathon that connects you with nonprofit organizations that need your tech skills and solutions. 
          By participating in Opportunity Hack, you will not only make a positive impact on the world, but also demonstrate your creativity, problem-solving, and collaboration abilities to prospective employers.
          Take a look at our nonprofit projects and join us in our mission to harness the power of code for social good.
          </Typography>
          
        </Box>


      <Typography variant="h3" style={{ marginTop: 50 }} gutterBottom>
        Our Community Pledge
      </Typography>

      {pledge.map((pledge, i) => (
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

      <Grid container spacing={2} mt={3} xs={12} md={12}>
        <Grid item>
          <Button variant="contained" onClick={() => gaButton('button_see_nonprofit_projects', 'see projects')} style={style} color="primary" href="/nonprofits">
            See Nonprofit Projects
          </Button>
        </Grid>
        <Grid item>
          <Button variant="contained" style={style} onClick={() => gaButton('button_mentorship', 'Learn about mentorship')} color="primary" href="/about/mentors">
            Learn about Mentorship
          </Button>
        </Grid>
        <Grid item>
          <Button variant="contained" style={style} color="primary" href="https://www.ohack.org/about" target="_blank" rel="noopener noreferrer">
            More at ohack.org
          </Button>        
        </Grid>
      </Grid>

      
      <LoginOrRegister introText="Ready to join us as a mentor?" previousPage={"/about/mentors"} />

    </ProjectsContainer>
  </LayoutContainer>
  );
}

export default AboutUs;
