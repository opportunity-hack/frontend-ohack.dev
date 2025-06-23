import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Alert,
  Link
} from '@mui/material';
import { styled } from '@mui/material/styles';
import TagIcon from '@mui/icons-material/Tag';
import ForumIcon from '@mui/icons-material/Forum';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useEnv } from '../../context/env.context';

// Styled components
const TabContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const KeyboardShortcut = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  backgroundColor: theme.palette.grey[100],
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5, 1),
  margin: theme.spacing(0.5),
  fontFamily: 'monospace',
  border: `1px solid ${theme.palette.divider}`,
  fontSize: '1.1rem',
}));

const StepNumber = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  marginRight: theme.spacing(1.5),
  fontWeight: 'bold',
  fontSize: '1.5rem',
  lineHeight: 1,
  boxSizing: 'border-box',
  padding: 0,
  flex: '0 0 auto',
  fontFamily: 'system-ui, Arial, sans-serif',
}));

/**
 * TabPanel component for the tutorial tabs
 */
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`slack-tutorial-tabpanel-${index}`}
      aria-labelledby={`slack-tutorial-tab-${index}`}
      {...other}
    >
      {value === index && <TabContent>{children}</TabContent>}
    </div>
  );
}

/**
 * SlackTutorial component
 * Provides a comprehensive guide to using Slack for Opportunity Hack
 */
const SlackTutorial = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { slackSignupUrl } = useEnv();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      {/* Header */}
      <Box mb={3} textAlign="center">
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontSize: '2.5rem' }}>
          Using Slack Effectively
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" sx={{ fontSize: '1.55rem' }}>
          Master the essential features of our primary communication tool
        </Typography>
        <Divider sx={{ mt: 2, mb: 3 }} />
      </Box>

      {/* Introduction */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ fontSize: '2.0rem' }}>
          Why We Use Slack
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.25rem' }}>
          Slack is our central hub for communication at Opportunity Hack. It's where you'll connect with team members, 
          get updates about events, find projects to work on, ask for help, and much more. Understanding how to use Slack 
          effectively will help you get the most out of your experience with our community.
        </Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body1" sx={{ fontSize: '1.2rem' }}>
            Not on our Slack workspace yet?{' '}
            <Link href={slackSignupUrl} target="_blank" rel="noopener noreferrer">
              <b>Join now</b>
            </Link>
            {' '}to start connecting with the community.
          </Typography>
        </Alert>
      </Paper>

      {/* Tutorial tabs */}
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="slack tutorial tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Getting Started" icon={<TagIcon />} iconPosition="start" sx={{ fontSize: '1.3rem' }} />
            <Tab label="Channels & DMs" icon={<ForumIcon />} iconPosition="start" sx={{ fontSize: '1.3rem' }} />
            <Tab label="Mentions & Notifications" icon={<NotificationsIcon />} iconPosition="start" sx={{ fontSize: '1.3rem' }} />
            <Tab label="Etiquette & Best Practices" icon={<EmojiEmotionsIcon />} iconPosition="start" sx={{ fontSize: '1.3rem' }} />
          </Tabs>
        </Box>

        {/* Getting Started */}
        <TabPanel value={activeTab} index={0}>
          <Typography variant="h5" gutterBottom sx={{ fontSize: '1.8rem' }}>
            Getting Started with Slack
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={7}>
              <List>
                <ListItem alignItems="flex-start">
                  <StepNumber>1</StepNumber>
                  <ListItemText 
                    primary="Set up your profile" 
                    secondary="Add a clear photo, your full name, and a brief bio including your role and skills. This helps others identify you and understand how you can contribute."
                    primaryTypographyProps={{ fontSize: '1.3rem' }}
                    secondaryTypographyProps={{ fontSize: '1.15rem' }}
                  />
                </ListItem>
                <ListItem alignItems="flex-start">
                  <StepNumber>2</StepNumber>
                  <ListItemText 
                    primary="Download the Slack app" 
                    secondary={
                      <Typography variant="body2" sx={{ fontSize: '1.15rem', color: 'text.secondary' }}>
                        For the best experience,{' '}
                        <Link href="https://slack.com/downloads" target="_blank" rel="noopener noreferrer">
                          <b>download Slack {' '}</b>
                        </Link>
                        on both your desktop and mobile device. This ensures you stay connected even when you're away from your computer.
                      </Typography>
                    }
                    primaryTypographyProps={{ fontSize: '1.3rem' }}
                    secondaryTypographyProps={{ fontSize: '1.15rem' }}
                  />
                </ListItem>
                <ListItem alignItems="flex-start">
                  <StepNumber>3</StepNumber>
                  <ListItemText 
                    primary="Join key channels" 
                    secondary="Start with #general, #introductions, and #help. Then explore more specialized channels based on your interests and skills."
                    primaryTypographyProps={{ fontSize: '1.3rem' }}
                    secondaryTypographyProps={{ fontSize: '1.15rem' }}
                  />
                </ListItem>
                <ListItem alignItems="flex-start">
                  <StepNumber>4</StepNumber>
                  <ListItemText 
                    primary="Introduce yourself" 
                    secondary="Post a brief introduction in the #introductions channel. Share your background, skills, and what brought you to Opportunity Hack."
                    primaryTypographyProps={{ fontSize: '1.3rem' }}
                    secondaryTypographyProps={{ fontSize: '1.15rem' }}
                  />
                </ListItem>
                <ListItem alignItems="flex-start">
                  <StepNumber>5</StepNumber>
                  <ListItemText 
                    primary="Configure your notifications" 
                    secondary="Adjust your notification settings to ensure you don't miss important messages while avoiding notification fatigue."
                    primaryTypographyProps={{ fontSize: '1.3rem' }}
                    secondaryTypographyProps={{ fontSize: '1.15rem' }}
                  />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={5}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontSize: '1.4rem' }}>
                    Profile Checklist
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Add a clear, recognizable photo" primaryTypographyProps={{ fontSize: '1.2rem' }} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Use your full name" primaryTypographyProps={{ fontSize: '1.2rem' }} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Add your role/title" primaryTypographyProps={{ fontSize: '1.2rem' }} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="List your key skills" primaryTypographyProps={{ fontSize: '1.2rem' }} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Include your timezone" primaryTypographyProps={{ fontSize: '1.2rem' }} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Link to GitHub/LinkedIn profiles" primaryTypographyProps={{ fontSize: '1.2rem' }} />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
              
              <Box sx={{ mt: 3 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary" sx={{ fontSize: '1.3rem' }}>
                      Pro Tip
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '1.1rem' }}>
                      Set your status to let others know when you're available, in a meeting, on vacation, etc. 
                      This helps manage expectations around response times.
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
          <Box textAlign="center" mt={3}>
            <Button 
              variant="outlined" 
              color="primary" 
              href="https://slack.com/help/categories/360000049043" 
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<SearchIcon />}
              sx={{ fontSize: '1.3rem' }}
            >
              Slack's Official Getting Started Guide
            </Button>
          </Box>
        </TabPanel>

        {/* Channels & DMs */}
        <TabPanel value={activeTab} index={1}>
          <Typography variant="h5" gutterBottom sx={{ fontSize: '2rem' }}>
            Channels and Direct Messages
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: '1.5rem' }}>
                Understanding Channels
              </Typography>
              <Typography variant="body2" paragraph sx={{ fontSize: '1.25rem' }}>
                Channels are organized spaces for communication around specific topics or projects. They help keep conversations focused and make it easier to find relevant information.
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontSize: '1.5rem' }}>
                  Types of Channels:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><TagIcon color="primary" /></ListItemIcon>
                    <ListItemText 
                      primary="Public Channels" 
                      secondary="Open to all workspace members. Good for general discussions and community-wide topics." 
                      primaryTypographyProps={{ fontSize: '1.25rem' }}
                      secondaryTypographyProps={{ fontSize: '1.15rem' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><TagIcon color="secondary" /></ListItemIcon>
                    <ListItemText 
                      primary="Private Channels" 
                      secondary="Limited to invited members. Used for specific team discussions or sensitive topics." 
                      primaryTypographyProps={{ fontSize: '1.25rem'}}
                      secondaryTypographyProps={{ fontSize: '1.15rem' }}
                    />
                  </ListItem>
                </List>
              </Box>
              
              <Typography variant="h6" gutterBottom sx={{ fontSize: '2rem' }}>
                Key Opportunity Hack Channels:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><TagIcon /></ListItemIcon>
                  <ListItemText 
                    primary="general" 
                    secondary="Announcements and community-wide conversations" 
                    primaryTypographyProps={{ fontSize: '1.5rem' }}
                    secondaryTypographyProps={{ fontSize: '1.25rem' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><TagIcon /></ListItemIcon>
                  <ListItemText 
                    primary="introductions" 
                    secondary="Introduce yourself to the community" 
                    primaryTypographyProps={{ fontSize: '1.5rem' }}
                    secondaryTypographyProps={{ fontSize: '1.25rem' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><TagIcon /></ListItemIcon>
                  <ListItemText 
                    primary="help" 
                    secondary="Ask questions and get support" 
                    primaryTypographyProps={{ fontSize: '1.5rem' }}
                    secondaryTypographyProps={{ fontSize: '1.25rem' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><TagIcon /></ListItemIcon>
                  <ListItemText 
                    primary="team-formation" 
                    secondary="Find projects to work on or team members" 
                    primaryTypographyProps={{ fontSize: '1.5rem' }}
                    secondaryTypographyProps={{ fontSize: '1.25rem' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><TagIcon /></ListItemIcon>
                  <ListItemText 
                    primary="ask-a-mentor" 
                    secondary="Get help with code and technical challenges" 
                    primaryTypographyProps={{ fontSize: '1.5rem' }}
                    secondaryTypographyProps={{ fontSize: '1.25rem' }}
                  />
                </ListItem>
              </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: '1.5rem' }}>
                Direct Messages & Group DMs
              </Typography>
              <Typography variant="body2" paragraph sx={{ fontSize: '1.25rem' }}>
                Direct messages (DMs) allow for private conversations between you and another member or a small group of people. They're perfect for one-on-one conversations or small team discussions.
              </Typography>
              
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontSize: '1.5rem' }}>
                    When to use DMs vs. Channels:
                  </Typography>
                  <Grid container>
                    <Grid item xs={6}>
                      <Typography sx={{ fontWeight: 'bold', fontSize: '1.3rem', mb: 1 }}>
                        Use DMs for:
                      </Typography>
                      <Box sx={{ fontSize: '1.15rem', mb: 1 }}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <ArrowForwardIcon sx={{ mr: 1 }} />
                          Private one-on-one conversations
                        </Box>
                        <Box display="flex" alignItems="center" mb={1}>
                          <ArrowForwardIcon sx={{ mr: 1 }} />
                          Quick questions to specific people
                        </Box>
                        <Box display="flex" alignItems="center" mb={1}>
                          <ArrowForwardIcon sx={{ mr: 1 }} />
                          Sensitive discussions
                        </Box>
                        <Box display="flex" alignItems="center" mb={1}>
                          <ArrowForwardIcon sx={{ mr: 1 }} />
                          Personal introductions and networking
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography sx={{ fontWeight: 'bold', fontSize: '1.3rem', mb: 1 }}>
                        Use Channels for:
                      </Typography>
                      <Box sx={{ fontSize: '1.15rem', mb: 1 }}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <ArrowForwardIcon sx={{ mr: 1 }} />
                          Team discussions
                        </Box>
                        <Box display="flex" alignItems="center" mb={1}>
                          <ArrowForwardIcon sx={{ mr: 1 }} />
                          Questions that others might benefit from seeing
                        </Box>
                        <Box display="flex" alignItems="center" mb={1}>
                          <ArrowForwardIcon sx={{ mr: 1 }} />
                          Sharing resources and announcements
                        </Box>
                        <Box display="flex" alignItems="center" mb={1}>
                          <ArrowForwardIcon sx={{ mr: 1 }} />
                          Project coordination
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              
              <Typography variant="subtitle1" gutterBottom sx={{ fontSize: '1.5rem' }}>
                Starting a Direct Message:
              </Typography>
              <List dense>
                <ListItem>
                  <StepNumber>1</StepNumber>
                  <ListItemText 
                    primary="Click the + icon next to 'Direct Messages' in the sidebar" 
                    primaryTypographyProps={{ fontSize: '1.3rem' }}
                  />
                </ListItem>
                <ListItem>
                  <StepNumber>2</StepNumber>
                  <ListItemText 
                    primary="Search for and select the person(s) you want to message" 
                    primaryTypographyProps={{ fontSize: '1.3rem' }}
                  />
                </ListItem>
                <ListItem>
                  <StepNumber>3</StepNumber>
                  <ListItemText 
                    primary="For group DMs, you can add up to 8 people" 
                    primaryTypographyProps={{ fontSize: '1.3rem' }}
                  />
                </ListItem>
              </List>
              
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body1" sx={{ fontSize: '1.15rem' }}>
                  When reaching out to someone for the first time, it's good etiquette to introduce yourself briefly and explain why you're contacting them.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Mentions & Notifications */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h5" gutterBottom sx={{ fontSize: '2rem' }}>
            Mentions and Notifications
          </Typography>
          
          <Typography variant="body1" paragraph sx={{ fontSize: '1.25rem' }}>
            Understanding mentions and configuring your notifications are key to staying informed without being overwhelmed. 
            Mentions ensure specific people see your messages, while notification settings control how and when you're alerted to activity in Slack.
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: '1.5rem' }}>
                Types of Mentions
              </Typography>
              <List>
                <ListItem alignItems="flex-start">
                  <ListItemIcon><PersonIcon /></ListItemIcon>
                  <ListItemText 
                    primary="@username" 
                    secondary="Notifies a specific person. Use when your message requires their direct attention or response."
                    primaryTypographyProps={{ fontSize: '1.25rem' }}
                    secondaryTypographyProps={{ fontSize: '1.1rem' }}
                  />
                </ListItem>
                <ListItem alignItems="flex-start">
                  <ListItemIcon><TagIcon /></ListItemIcon>
                  <ListItemText 
                    primary="@channel" 
                    secondary="Notifies everyone in the channel. Use sparingly for truly channel-wide important announcements."
                    primaryTypographyProps={{ fontSize: '1.25rem' }}
                    secondaryTypographyProps={{ fontSize: '1.1rem' }}
                  />
                </ListItem>
                <ListItem alignItems="flex-start">
                  <ListItemIcon><TagIcon /></ListItemIcon>
                  <ListItemText 
                    primary="@here" 
                    secondary="Notifies only active members in the channel. Less disruptive than @channel but still reaches people who are online."
                    primaryTypographyProps={{ fontSize: '1.25rem' }}
                    secondaryTypographyProps={{ fontSize: '1.1rem' }}
                  />
                </ListItem>
              </List>
              
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontSize: '1.15rem' }}>
                  Use @channel and @here sparingly to avoid notification fatigue. Before using these, ask yourself if everyone in the channel truly needs to be notified.
                </Typography>
              </Alert>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: '1.5rem' }}>
                Configuring Notifications
              </Typography>
              <Typography variant="body2" paragraph sx={{ fontSize: '1.2rem' }}>
                Slack lets you fine-tune your notification settings to balance staying informed with avoiding distraction.
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontSize: '1.25rem' }}>
                  Configuring Workspace Notifications:
                </Typography>
                <List dense>
                  <ListItem>
                    <StepNumber>1</StepNumber>
                    <ListItemText 
                      primary="Click your profile picture in the top right corner" 
                      primaryTypographyProps={{ fontSize: '1.15rem' }}
                    />
                  </ListItem>
                  <ListItem>
                    <StepNumber>2</StepNumber>
                    <ListItemText 
                      primary="Select 'Preferences'" 
                      primaryTypographyProps={{ fontSize: '1.15rem' }}
                    />
                  </ListItem>
                  <ListItem>
                    <StepNumber>3</StepNumber>
                    <ListItemText 
                      primary="Click 'Notifications'" 
                      primaryTypographyProps={{ fontSize: '1.15rem' }}
                    />
                  </ListItem>
                  <ListItem>
                    <StepNumber>4</StepNumber>
                    <ListItemText 
                      primary="Adjust settings for different types of notifications" 
                      primaryTypographyProps={{ fontSize: '1.15rem' }}
                    />
                  </ListItem>
                </List>
              </Box>
              
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontSize: '1.25rem' }}>
                  Channel-Specific Notifications:
                </Typography>
                <List dense>
                  <ListItem>
                    <StepNumber>1</StepNumber>
                    <ListItemText 
                      primary="Click the channel name at the top of the channel" 
                      primaryTypographyProps={{ fontSize: '1.15rem' }}
                    />
                  </ListItem>
                  <ListItem>
                    <StepNumber>2</StepNumber>
                    <ListItemText 
                      primary="Select 'Notification preferences'" 
                      primaryTypographyProps={{ fontSize: '1.15rem' }}
                    />
                  </ListItem>
                  <ListItem>
                    <StepNumber>3</StepNumber>
                    <ListItemText 
                      primary="Choose the notification level for that specific channel" 
                      primaryTypographyProps={{ fontSize: '1.15rem' }}
                    />
                  </ListItem>
                </List>
              </Box>
              
              <Card sx={{ mt: 3, bgcolor: 'background.default' }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom color="primary" sx={{ fontSize: '1.4rem' }}>
                    Recommended Settings for Opportunity Hack
                  </Typography>
                  <Typography variant="body2" component="div" sx={{ fontSize: '1.2rem' }}>
                    <ul>
                      <li><strong>General channels (#general, #announcements):</strong> All messages</li>
                      <li><strong>Team-specific channels:</strong> All messages or mentions</li>
                      <li><strong>Interest channels:</strong> Mentions only</li>
                      <li><strong>High-volume channels:</strong> Mentions only or mute</li>
                    </ul>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Etiquette & Best Practices */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="h5" gutterBottom sx={{ fontSize: '2rem' }}>
            Etiquette and Best Practices
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontSize: '1.3rem' }}>
            Following some simple guidelines helps keep our Slack workspace organized and ensures a positive experience for everyone.
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: '1.5rem' }}>
                Communication Guidelines
              </Typography>
              <List>
                <ListItem alignItems="flex-start">
                  <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                  <ListItemText 
                    primary="Use threads for detailed discussions" 
                    secondary="Keep channel feeds clean by using threads for extended conversations. This makes it easier for everyone to follow different topics."
                    primaryTypographyProps={{ fontSize: '1.3rem', fontWeight: 'bold' }}
                    secondaryTypographyProps={{ fontSize: '1.2rem' }}
                  />
                </ListItem>
                <ListItem alignItems="flex-start">
                  <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                  <ListItemText 
                    primary="Post in the right channel" 
                    secondary="Make sure your message is relevant to the channel topic. If you're not sure where to post, ask in #help."
                    primaryTypographyProps={{ fontSize: '1.3rem', fontWeight: 'bold' }}
                    secondaryTypographyProps={{ fontSize: '1.2rem' }}
                  />
                </ListItem>
                <ListItem alignItems="flex-start">
                  <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                  <ListItemText 
                    primary="Be clear and concise" 
                    secondary="Start with your main point or question. Use formatting to make longer messages more readable."
                    primaryTypographyProps={{ fontSize: '1.3rem', fontWeight: 'bold' }}
                    secondaryTypographyProps={{ fontSize: '1.2rem' }}
                  />
                </ListItem>
                <ListItem alignItems="flex-start">
                  <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                  <ListItemText 
                    primary="Use emoji reactions" 
                    secondary="Instead of sending a message that just says 'thanks' or 'agreed', use emoji reactions to acknowledge messages."
                    primaryTypographyProps={{ fontSize: '1.3rem', fontWeight: 'bold' }}
                    secondaryTypographyProps={{ fontSize: '1.2rem' }}
                  />
                </ListItem>
                <ListItem alignItems="flex-start">
                  <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                  <ListItemText 
                    primary="Format code properly" 
                    secondary="Use code blocks (```code here```) when sharing code snippets for better readability."
                    primaryTypographyProps={{ fontSize: '1.3rem', fontWeight: 'bold' }}
                    secondaryTypographyProps={{ fontSize: '1.2rem' }}
                  />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom color="primary" sx={{ fontSize: '1.4rem' }}>
                    Our Slack Community Values:
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText 
                        primary="Respect everyone's time and attention" 
                        secondary="Be mindful of how many people you're notifying and why"
                        primaryTypographyProps={{ fontSize: '1.3rem', fontWeight: 'bold' }}
                        secondaryTypographyProps={{ fontSize: '1.2rem' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText 
                        primary="Be inclusive and welcoming" 
                        secondary="We're a diverse community with members of all backgrounds and skill levels"
                        primaryTypographyProps={{ fontSize: '1.3rem', fontWeight: 'bold' }}
                        secondaryTypographyProps={{ fontSize: '1.2rem' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText 
                        primary="Share knowledge generously" 
                        secondary="Help others learn by explaining concepts clearly, not just providing solutions"
                        primaryTypographyProps={{ fontSize: '1.3rem', fontWeight: 'bold' }}
                        secondaryTypographyProps={{ fontSize: '1.2rem' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText 
                        primary="Ask questions thoughtfully" 
                        secondary="Show what you've tried and be specific about what you need help with"
                        primaryTypographyProps={{ fontSize: '1.3rem', fontWeight: 'bold' }}
                        secondaryTypographyProps={{ fontSize: '1.2rem' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText 
                        primary="Assume good intentions" 
                        secondary="Text can be easily misinterpreted; give people the benefit of the doubt"
                        primaryTypographyProps={{ fontSize: '1.3rem', fontWeight: 'bold' }}
                        secondaryTypographyProps={{ fontSize: '1.2rem' }}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
              <Typography variant="h6" gutterBottom sx={{ fontSize: '1.4rem' }}>
                Response Expectations
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '1.3rem' }}>
                Our community spans different time zones and people have varying availability. Here's what to expect:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><ArrowForwardIcon /></ListItemIcon>
                  <ListItemText 
                    primary="General channels: 1-24 hours for a response" 
                    primaryTypographyProps={{ fontSize: '1.25rem' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><ArrowForwardIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Direct messages: 1-48 hours is reasonable" 
                    primaryTypographyProps={{ fontSize: '1.25rem' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><ArrowForwardIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Urgent needs: Use @mentions carefully" 
                    primaryTypographyProps={{ fontSize: '1.25rem' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><ArrowForwardIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Weekend/off-hours: Expect slower responses" 
                    primaryTypographyProps={{ fontSize: '1.25rem' }}
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ fontSize: '1.2rem' }}>
              Remember: our Code of Conduct applies to all communication on Slack. Be respectful, inclusive, and constructive in all your interactions.
            </Typography>
          </Alert>
        </TabPanel>
      </Box>

      {/* Button moved from Keyboard Shortcuts */}
      <Box textAlign="center" mt={3}>
        <Button
          variant="contained"
          color="primary"
          href="https://slack.com/help/articles/201374536-Slack-keyboard-shortcuts"
          target="_blank"
          rel="noopener noreferrer"
          startIcon={<KeyboardIcon />}
          sx={{ fontSize: '1.1rem', py: 1.2, px: 3 }}
        >
          View Full List of Shortcuts
        </Button>
      </Box>

      {/* Join Slack CTA */}
      <Box mt={4} textAlign="center">
        <Typography variant="h6" gutterBottom sx={{ fontSize: '1.35rem' }}>
          Ready to dive in?
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          href={slackSignupUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ mt: 1, fontSize: '1.15rem' }}
        >
          Join Our Slack Community
        </Button>
      </Box>
    </Box>
  );
};

export default SlackTutorial;