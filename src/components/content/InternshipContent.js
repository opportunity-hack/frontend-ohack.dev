// src/components/content/InternshipContent.js
import { Grid, Typography, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import CodeIcon from '@mui/icons-material/Code';
import GroupsIcon from '@mui/icons-material/Groups';
import { LinkStyled } from '../../styles/nonprofit/styles';

const style = { fontSize: 14 };

const BenefitCard = ({ icon: Icon, title, description }) => (
  <Box 
    sx={{ 
      p: 3, 
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 1,
      height: '100%'
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Icon sx={{ mr: 1, color: 'primary.main' }} />
      <Typography variant="h6">{title}</Typography>
    </Box>
    <Typography variant="body1" style={style}>
      {description}
    </Typography>
  </Box>
);

const benefitCards = [
  {
    icon: SchoolIcon,
    title: 'Real-World Experience',
    description: 'Work on actual problems faced by organizations, not just classroom assignments'
  },
  {
    icon: WorkIcon,
    title: 'Professional Development',
    description: 'Learn to communicate with stakeholders and work in team environments'
  },
  {
    icon: CodeIcon,
    title: 'Technical Growth',
    description: 'Build full-stack applications using modern tools and best practices'
  },
  {
    icon: GroupsIcon,
    title: 'Networking',
    description: 'Connect with experienced developers, mentors and nonprofit leaders'
  }
];

const InternshipContent = () => (
  <Box>
    <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
      The Challenge: Standing Out in Internship Applications
    </Typography>
    
    <Typography variant="body1" style={style} paragraph>
      As a college student pursuing a tech internship, you're competing against thousands of applicants 
      with similar coursework and basic projects. The key to landing your dream internship is demonstrating 
      real-world experience and initiative - exactly what you gain by working on nonprofit projects.
    </Typography>

    <Grid container spacing={4} sx={{ my: 4 }}>
      {benefitCards.map((benefit, index) => (
        <Grid item xs={12} sm={6} key={index}>
          <BenefitCard {...benefit} />
        </Grid>
      ))}
    </Grid>

    <Typography variant="h4" gutterBottom sx={{ mt: 6, color: 'primary.main' }}>
      Why Nonprofit Projects Make Your Application Stand Out
    </Typography>

    <Box sx={{ my: 4 }}>
      {[
        'Experience with real codebases and development workflows',
        'Initiative and self-direction in solving complex problems',
        'Ability to work with cross-functional teams',
        'Understanding of deployment and production environments',
        'Portfolio of work that demonstrates real impact'
      ].map((point, index) => (
        <Box 
          key={index} 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            mb: 2 
          }}
        >
          <CheckCircleIcon sx={{ mr: 2, color: 'success.main' }} />
          <Typography variant="body1" style={style}>
            {point}
          </Typography>
        </Box>
      ))}
    </Box>

    <Typography variant="h4" gutterBottom sx={{ mt: 6, color: 'primary.main' }}>
      Getting Started with Opportunity Hack
    </Typography>

    <Typography variant="body1" style={style} paragraph>
      Ready to build your portfolio while making a difference? Here's how to get started:
    </Typography>

    <ol style={{ paddingLeft: '20px' }}>
      <li>
        <Typography variant="body1" style={style} paragraph>
          <LinkStyled href="/nonprofits">Browse our nonprofit projects</LinkStyled> and find one that matches your interests and skills
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Join our <LinkStyled href="https://slack.ohack.dev">Slack community</LinkStyled> to connect with mentors and other volunteers
        </Typography>
      </li>
      <li>
        <Typography variant="body1" style={style} paragraph>
          Start contributing and documenting your work for your portfolio
        </Typography>
      </li>
    </ol>
  </Box>
);

export default InternshipContent;