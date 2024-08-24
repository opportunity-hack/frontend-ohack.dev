import React from 'react';
import Head from 'next/head';
import { Typography, Box, Button, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { LayoutContainer, TitleContainer, ProjectsContainer } from '../../../styles/nonprofit/styles';
import Link from 'next/link';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import HearingIcon from '@mui/icons-material/Hearing';
import PublicIcon from '@mui/icons-material/Public';
import SecurityIcon from '@mui/icons-material/Security';
import BlockIcon from '@mui/icons-material/Block';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';


const CodeOfConduct = () => {
  return (
    <LayoutContainer container>
      <Head>
        <title>Code of Conduct - Opportunity Hack</title>
        <meta name="description" content="Code of Conduct for Opportunity Hack hackathon participants, focusing on being a good person, listening to others, and helping humanity move forward." />
        <meta name="keywords" content="Opportunity Hack, hackathon, code of conduct, ethics, inclusivity, respect" />
      </Head>
      <TitleContainer>
        <Typography variant="h2" gutterBottom sx={{ fontSize: '3rem' }}>
          Code of Conduct
        </Typography>
      </TitleContainer>
      <ProjectsContainer>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.2rem' }}>
          At Opportunity Hack, we believe in the power of technology to create positive change. Our Code of Conduct reflects our commitment to fostering an inclusive, respectful, and collaborative environment where all participants can contribute to moving humanity forward.
        </Typography>
        
        <Typography variant="h4" gutterBottom sx={{ mt: 4, fontSize: '2.2rem' }}>
          Our Core Values
        </Typography>
        
        <List>
          <ListItem>
            <ListItemIcon><EmojiPeopleIcon color="primary" sx={{ fontSize: '2rem' }} /></ListItemIcon>
            <ListItemText 
              primary={<Typography variant="h6" sx={{ fontSize: '1.5rem' }}>Be a Good Person</Typography>}
              secondary={<Typography sx={{ fontSize: '1.1rem' }}>Treat others with kindness, respect, and empathy. Your actions should contribute positively to the hackathon community and beyond.</Typography>}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><HearingIcon color="primary" sx={{ fontSize: '2rem' }} /></ListItemIcon>
            <ListItemText 
              primary={<Typography variant="h6" sx={{ fontSize: '1.5rem' }}>Listen to Others</Typography>}
              secondary={<Typography sx={{ fontSize: '1.1rem' }}>Value diverse perspectives. Practice active listening and be open to ideas and feedback from all participants, regardless of their background or experience level.</Typography>}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><PublicIcon color="primary" sx={{ fontSize: '2rem' }} /></ListItemIcon>
            <ListItemText 
              primary={<Typography variant="h6" sx={{ fontSize: '1.5rem' }}>Help Humanity Move Forward</Typography>}
              secondary={<Typography sx={{ fontSize: '1.1rem' }}>Focus on creating solutions that have a positive impact on society. Consider the ethical implications of your work and strive to contribute to the greater good.</Typography>}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><AccessibilityNewIcon color="primary" sx={{ fontSize: '2rem' }} /></ListItemIcon>
            <ListItemText 
              primary={<Typography variant="h6" sx={{ fontSize: '1.5rem' }}>Embrace Diversity and Inclusion</Typography>}
              secondary={<Typography sx={{ fontSize: '1.1rem' }}>Recognize and celebrate the diversity of our participants. Ensure that everyone, regardless of their abilities or background, has an equal opportunity to participate and contribute.</Typography>}
            />
          </ListItem>
        </List>

        <Typography variant="h4" gutterBottom sx={{ mt: 4, fontSize: '2.2rem' }}>
          Accommodations and Accessibility
        </Typography>

        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem' }}>
          Opportunity Hack is committed to providing an accessible and inclusive environment for all participants. We strive to accommodate various needs to ensure everyone can fully participate in our event.
        </Typography>

        <List>
          <ListItem>
            <ListItemText primary={<Typography sx={{ fontSize: '1.1rem' }}>If you require any specific accommodations (e.g., assistive technologies, sign language interpreters, mobility assistance, dietary requirements), please inform us during the registration process or contact our accessibility team at accessibility@ohack.org. We will try our best to accomodate you.</Typography>} />
          </ListItem>
          <ListItem>
            <ListItemText primary={<Typography sx={{ fontSize: '1.1rem' }}>All venues that we select are wheelchair accessible, and we provide quiet spaces for participants who may need a break from the main event area.</Typography>} />
          </ListItem>
          <ListItem>
            <ListItemText primary={<Typography sx={{ fontSize: '1.1rem' }}>We offer live captioning through YouTube streaming or video uploads to Slack for most presentations and can provide materials in alternative formats upon request.</Typography>} />
          </ListItem>
          <ListItem>
            <ListItemText primary={<Typography sx={{ fontSize: '1.1rem' }}>Our mentors and staff can assist participants with various needs. Don't hesitate to ask for help or clarification at any time during the event.</Typography>} />
          </ListItem>
        </List>

        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem' }}>
          We are continuously working to improve our accessibility. If you have suggestions or feedback, please let us know.
        </Typography>

        <Typography variant="h4" gutterBottom sx={{ mt: 4, fontSize: '2.2rem' }}>
          Expected Behavior
        </Typography>
        
        <List>
          {["Be inclusive and respectful of all participants, regardless of their age, gender, sexual orientation, disability, physical appearance, race, ethnicity, or religion.",
            "Collaborate openly and share knowledge generously. Remember that everyone is here to learn and grow.",
            "Communicate thoughtfully and constructively. Critique ideas, not people.",
            "Be mindful of your surroundings and fellow participants. Alert hackathon organizers if you notice a dangerous situation or someone in distress.",
            "Respect the venues, tools, and equipment provided for the hackathon."
          ].map((text, index) => (
            <ListItem key={index}>
              <ListItemText primary={<Typography sx={{ fontSize: '1.1rem' }}>{text}</Typography>} />
            </ListItem>
          ))}
        </List>

        <Typography variant="h4" gutterBottom sx={{ mt: 4, fontSize: '2.2rem' }}>
          Unacceptable Behavior
        </Typography>

        <List>
          {["Harassment, discrimination, or intimidation in any form",
            "Offensive verbal comments",
            "Deliberate intimidation, stalking, or following",
            "Photography or recording without consent",
            "Sustained disruption of talks or other events",
            "Inappropriate physical contact or unwelcome sexual attention"
          ].map((text, index) => (
            <ListItem key={index}>
              <ListItemIcon><BlockIcon color="error" sx={{ fontSize: '1.5rem' }} /></ListItemIcon>
              <ListItemText primary={<Typography sx={{ fontSize: '1.1rem' }}>{text}</Typography>} />
            </ListItem>
          ))}
        </List>

        <Typography variant="h4" gutterBottom sx={{ mt: 4, fontSize: '2.2rem' }}>
          Maintaining a safe and welcoming environment for all
        </Typography>

        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem' }}>
          If you experience or witness unacceptable behavior, or have any other concerns, please report it by contacting the hackathon organizers immediately. All reports will be handled with discretion.
        </Typography>

        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem' }}>
          Hackathon organizers may take any action they deem appropriate, including warning the offender or expulsion from the hackathon.
        </Typography>

        <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: '1.3rem' }}>
            <SecurityIcon color="primary" sx={{ mr: 1, verticalAlign: 'middle', fontSize: '1.5rem' }} />
            Remember:
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
            By participating in Opportunity Hack, you are not just coding – you're contributing to a better future. Let's create an environment where everyone feels empowered to make a positive impact!
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Typography variant="body1" paragraph sx={{ fontSize: '1rem' }}>
          This Code of Conduct is adapted from the best practices of various tech communities and hackathons. We are committed to revisiting and refining these guidelines to ensure they best serve our community.
        </Typography>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="contained" color="primary" component={Link} href="/sponsor" sx={{ fontSize: '1rem' }}>
            Become a Sponsor
          </Button>
          <Button variant="outlined" color="primary" component={Link} href="/about/mentors" sx={{ fontSize: '1rem' }}>
            Learn about Mentoring
          </Button>
          <Button variant="outlined" color="primary" component={Link} href="/about/judges" sx={{ fontSize: '1rem' }}>
            Become a Judge
          </Button>
        </Box>
      </ProjectsContainer>
    </LayoutContainer>
  );
};

export default CodeOfConduct;