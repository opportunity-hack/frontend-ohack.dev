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
}));

const StepNumber = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  marginRight: theme.spacing(1.5),
  fontWeight: 'bold',
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
        <Typography variant="h3" component="h1" gutterBottom>
          Using Slack Effectively
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Master the essential features of our primary communication tool
        </Typography>
        <Divider sx={{ mt: 2, mb: 3 }} />
      </Box>

      {/* Introduction */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Why We Use Slack
        </Typography>
        <Typography variant="body1" paragraph>
          Slack is our central hub for communication at Opportunity Hack. It's where you'll connect with team members, 
          get updates about events, find projects to work on, ask for help, and much more. Understanding how to use Slack 
          effectively will help you get the most out of your experience with our community.
        </Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Not on our Slack workspace yet?{' '}
            <Link href={slackSignupUrl} target="_blank" rel="noopener noreferrer">
              Join now
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
            <Tab label="Getting Started" icon={<TagIcon />} iconPosition="start" />
            <Tab label="Channels & DMs" icon={<ForumIcon />} iconPosition="start" />
            <Tab label="Mentions & Notifications" icon={<NotificationsIcon />} iconPosition="start" />
            <Tab label="Search & Navigation" icon={<SearchIcon />} iconPosition="start" />
            <Tab label="Etiquette & Best Practices" icon={<EmojiEmotionsIcon />} iconPosition="start" />
            <Tab label="Keyboard Shortcuts" icon={<KeyboardIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Getting Started */}
        <TabPanel value={activeTab} index={0}>
          <Typography variant="h5" gutterBottom>
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
                  />
                </ListItem>
                <ListItem alignItems="flex-start">
                  <StepNumber>2</StepNumber>
                  <ListItemText 
                    primary="Download the Slack app" 
                    secondary="For the best experience, download Slack on both your desktop and mobile device. This ensures you stay connected even when you're away from your computer."
                  />
                </ListItem>
                <ListItem alignItems="flex-start">
                  <StepNumber>3</StepNumber>
                  <ListItemText 
                    primary="Join key channels" 
                    secondary="Start with #general, #introductions, and #help. Then explore more specialized channels based on your interests and skills."
                  />
                </ListItem>
                <ListItem alignItems="flex-start">
                  <StepNumber>4</StepNumber>
                  <ListItemText 
                    primary="Introduce yourself" 
                    secondary="Post a brief introduction in the #introductions channel. Share your background, skills, and what brought you to Opportunity Hack."
                  />
                </ListItem>
                <ListItem alignItems="flex-start">
                  <StepNumber>5</StepNumber>
                  <ListItemText 
                    primary="Configure your notifications" 
                    secondary="Adjust your notification settings to ensure you don't miss important messages while avoiding notification fatigue."
                  />
                </ListItem>
              </List>
              
              <Box textAlign="center" mt={3}>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  href="https://slack.com/help/categories/360000049043" 
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<SearchIcon />}
                >
                  Slack's Official Getting Started Guide
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Profile Checklist
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Add a clear, recognizable photo" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Use your full name" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Add your role/title" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="List your key skills" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Include your timezone" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Link to GitHub/LinkedIn profiles" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
              
              <Box sx={{ mt: 3 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Pro Tip
                    </Typography>
                    <Typography variant="body2">
                      Set your status to let others know when you're available, in a meeting, on vacation, etc. 
                      This helps manage expectations around response times.
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Channels & DMs */}
        <TabPanel value={activeTab} index={1}>
          <Typography variant="h5" gutterBottom>
            Channels & Direct Messages
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Understanding Channels
              </Typography>
              <Typography variant="body2" paragraph>
                Channels are organized spaces for communication around specific topics or projects. They help keep conversations focused and make it easier to find relevant information.
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Types of Channels:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><TagIcon color="primary" /></ListItemIcon>
                    <ListItemText 
                      primary="Public Channels" 
                      secondary="Open to all workspace members. Good for general discussions and community-wide topics." 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><TagIcon color="secondary" /></ListItemIcon>
                    <ListItemText 
                      primary="Private Channels" 
                      secondary="Limited to invited members. Used for specific team discussions or sensitive topics." 
                    />
                  </ListItem>
                </List>
              </Box>
              
              <Typography variant="subtitle1" gutterBottom>
                Key Opportunity Hack Channels:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><TagIcon /></ListItemIcon>
                  <ListItemText 
                    primary="#general" 
                    secondary="Announcements and community-wide conversations" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><TagIcon /></ListItemIcon>
                  <ListItemText 
                    primary="#introductions" 
                    secondary="Introduce yourself to the community" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><TagIcon /></ListItemIcon>
                  <ListItemText 
                    primary="#help" 
                    secondary="Ask questions and get support" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><TagIcon /></ListItemIcon>
                  <ListItemText 
                    primary="#project-matching" 
                    secondary="Find projects to work on or team members" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><TagIcon /></ListItemIcon>
                  <ListItemText 
                    primary="#technical-questions" 
                    secondary="Get help with code and technical challenges" 
                  />
                </ListItem>
              </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Direct Messages & Group DMs
              </Typography>
              <Typography variant="body2" paragraph>
                Direct messages (DMs) allow for private conversations between you and another member or a small group of people. They're perfect for one-on-one conversations or small team discussions.
              </Typography>
              
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    When to use DMs vs. Channels:
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" fontWeight="bold" gutterBottom>
                        Use DMs for:
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon><ArrowForwardIcon fontSize="small" /></ListItemIcon>
                          <ListItemText primary="Private one-on-one conversations" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><ArrowForwardIcon fontSize="small" /></ListItemIcon>
                          <ListItemText primary="Quick questions to specific people" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><ArrowForwardIcon fontSize="small" /></ListItemIcon>
                          <ListItemText primary="Sensitive discussions" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><ArrowForwardIcon fontSize="small" /></ListItemIcon>
                          <ListItemText primary="Personal introductions and networking" />
                        </ListItem>
                      </List>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" fontWeight="bold" gutterBottom>
                        Use Channels for:
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon><ArrowForwardIcon fontSize="small" /></ListItemIcon>
                          <ListItemText primary="Team discussions" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><ArrowForwardIcon fontSize="small" /></ListItemIcon>
                          <ListItemText primary="Questions that others might benefit from seeing" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><ArrowForwardIcon fontSize="small" /></ListItemIcon>
                          <ListItemText primary="Sharing resources and announcements" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><ArrowForwardIcon fontSize="small" /></ListItemIcon>
                          <ListItemText primary="Project coordination" />
                        </ListItem>
                      </List>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              
              <Typography variant="subtitle1" gutterBottom>
                Starting a Direct Message:
              </Typography>
              <List dense>
                <ListItem>
                  <StepNumber>1</StepNumber>
                  <ListItemText 
                    primary="Click the + icon next to 'Direct Messages' in the sidebar" 
                  />
                </ListItem>
                <ListItem>
                  <StepNumber>2</StepNumber>
                  <ListItemText 
                    primary="Search for and select the person(s) you want to message" 
                  />
                </ListItem>
                <ListItem>
                  <StepNumber>3</StepNumber>
                  <ListItemText 
                    primary="For group DMs, you can add up to 8 people" 
                  />
                </ListItem>
              </List>
              
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  When reaching out to someone for the first time, it's good etiquette to introduce yourself briefly and explain why you're contacting them.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Mentions & Notifications */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h5" gutterBottom>
            Mentions & Notifications
          </Typography>
          
          <Typography variant="body1" paragraph>
            Understanding how mentions and notifications work will help you stay on top of important conversations without being overwhelmed by notifications.
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Types of Mentions
              </Typography>
              <List>
                <ListItem alignItems="flex-start">
                  <ListItemIcon><PersonIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="@username" 
                    secondary="Notifies a specific person. Use when you need a response from someone in particular."
                  />
                </ListItem>
                <ListItem alignItems="flex-start">
                  <ListItemIcon><TagIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="@channel" 
                    secondary="Notifies everyone in the channel. Use sparingly for truly channel-wide important announcements."
                  />
                </ListItem>
                <ListItem alignItems="flex-start">
                  <ListItemIcon><TagIcon color="secondary" /></ListItemIcon>
                  <ListItemText 
                    primary="@here" 
                    secondary="Notifies only active members in the channel. Less disruptive than @channel but still reaches people who are online."
                  />
                </ListItem>
              </List>
              
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Use @channel and @here sparingly to avoid notification fatigue. Before using these, ask yourself if everyone in the channel truly needs to be notified.
                </Typography>
              </Alert>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Configuring Notifications
              </Typography>
              <Typography variant="body2" paragraph>
                Slack lets you fine-tune your notification settings to balance staying informed with avoiding distraction.
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Configuring Workspace Notifications:
                </Typography>
                <List dense>
                  <ListItem>
                    <StepNumber>1</StepNumber>
                    <ListItemText 
                      primary="Click your profile picture in the top right corner" 
                    />
                  </ListItem>
                  <ListItem>
                    <StepNumber>2</StepNumber>
                    <ListItemText 
                      primary="Select 'Preferences'" 
                    />
                  </ListItem>
                  <ListItem>
                    <StepNumber>3</StepNumber>
                    <ListItemText 
                      primary="Click 'Notifications'" 
                    />
                  </ListItem>
                  <ListItem>
                    <StepNumber>4</StepNumber>
                    <ListItemText 
                      primary="Adjust settings for different types of notifications" 
                    />
                  </ListItem>
                </List>
              </Box>
              
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Channel-Specific Notifications:
                </Typography>
                <List dense>
                  <ListItem>
                    <StepNumber>1</StepNumber>
                    <ListItemText 
                      primary="Click the channel name at the top of the channel" 
                    />
                  </ListItem>
                  <ListItem>
                    <StepNumber>2</StepNumber>
                    <ListItemText 
                      primary="Select 'Notification preferences'" 
                    />
                  </ListItem>
                  <ListItem>
                    <StepNumber>3</StepNumber>
                    <ListItemText 
                      primary="Choose the notification level for that specific channel" 
                    />
                  </ListItem>
                </List>
              </Box>
              
              <Card sx={{ mt: 3, bgcolor: 'background.default' }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom color="primary">
                    Recommended Settings for Opportunity Hack
                  </Typography>
                  <Typography variant="body2" component="div">
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

        {/* Search & Navigation */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="h5" gutterBottom>
            Search & Navigation
          </Typography>
          
          <Typography variant="body1" paragraph>
            As conversations grow over time, knowing how to find information becomes essential. Slack has powerful search and navigation features to help you find what you need quickly.
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Basic Search
              </Typography>
              <List>
                <ListItem alignItems="flex-start">
                  <StepNumber>1</StepNumber>
                  <ListItemText 
                    primary="Click the search box at the top of Slack" 
                    secondary="Or use the keyboard shortcut Ctrl/Cmd + G"
                  />
                </ListItem>
                <ListItem alignItems="flex-start">
                  <StepNumber>2</StepNumber>
                  <ListItemText 
                    primary="Enter your search terms" 
                    secondary="Slack will search through messages, files, and channels"
                  />
                </ListItem>
                <ListItem alignItems="flex-start">
                  <StepNumber>3</StepNumber>
                  <ListItemText 
                    primary="Use filters to refine results" 
                    secondary="Narrow by channel, person, date, and more"
                  />
                </ListItem>
              </List>
              
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Advanced Search Operators:
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <KeyboardShortcut>from:@username</KeyboardShortcut>
                  <Typography variant="body2">
                    Messages from a specific user
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <KeyboardShortcut>in:#channel</KeyboardShortcut>
                  <Typography variant="body2">
                    Messages in a specific channel
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <KeyboardShortcut>has:link</KeyboardShortcut>
                  <Typography variant="body2">
                    Messages with links
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <KeyboardShortcut>has:reaction</KeyboardShortcut>
                  <Typography variant="body2">
                    Messages with reactions
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <KeyboardShortcut>before:2023/01/01</KeyboardShortcut>
                  <Typography variant="body2">
                    Messages before a date
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <KeyboardShortcut>after:2023/01/01</KeyboardShortcut>
                  <Typography variant="body2">
                    Messages after a date
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Quick Navigation
              </Typography>
              
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Keyboard Shortcuts:
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={12} sm={6}>
                      <KeyboardShortcut>Ctrl/Cmd + K</KeyboardShortcut>
                      <Typography variant="body2">
                        Quick channel/DM switcher
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <KeyboardShortcut>Alt + Up/Down</KeyboardShortcut>
                      <Typography variant="body2">
                        Move between channels
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <KeyboardShortcut>Ctrl/Cmd + G</KeyboardShortcut>
                      <Typography variant="body2">
                        Search in Slack
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <KeyboardShortcut>Ctrl/Cmd + F</KeyboardShortcut>
                      <Typography variant="body2">
                        Search in current channel
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              
              <Typography variant="h6" gutterBottom>
                Saved Items & Reminders
              </Typography>
              <Typography variant="body2" paragraph>
                Slack allows you to save important messages and set reminders to follow up later.
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Saving Items:
                </Typography>
                <List dense>
                  <ListItem>
                    <StepNumber>1</StepNumber>
                    <ListItemText 
                      primary="Hover over a message and click the bookmark icon" 
                    />
                  </ListItem>
                  <ListItem>
                    <StepNumber>2</StepNumber>
                    <ListItemText 
                      primary="View saved items by clicking the bookmark icon in the top right" 
                    />
                  </ListItem>
                </List>
              </Box>
              
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Setting Reminders:
                </Typography>
                <List dense>
                  <ListItem>
                    <StepNumber>1</StepNumber>
                    <ListItemText 
                      primary="Hover over a message and click the 'More actions' menu (three dots)" 
                    />
                  </ListItem>
                  <ListItem>
                    <StepNumber>2</StepNumber>
                    <ListItemText 
                      primary="Select 'Remind me about this'" 
                    />
                  </ListItem>
                  <ListItem>
                    <StepNumber>3</StepNumber>
                    <ListItemText 
                      primary="Choose when you want to be reminded" 
                    />
                  </ListItem>
                </List>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Etiquette & Best Practices */}
        <TabPanel value={activeTab} index={4}>
          <Typography variant="h5" gutterBottom>
            Slack Etiquette & Best Practices
          </Typography>
          
          <Typography variant="body1" paragraph>
            Following these guidelines will help you communicate effectively and be a valued member of our Slack community.
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Communication Guidelines
              </Typography>
              
              <List>
                <ListItem alignItems="flex-start">
                  <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                  <ListItemText 
                    primary="Use threads for detailed discussions" 
                    secondary="Keep channel feeds clean by using threads for extended conversations. This makes it easier for everyone to follow different topics."
                  />
                </ListItem>
                <ListItem alignItems="flex-start">
                  <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                  <ListItemText 
                    primary="Post in the right channel" 
                    secondary="Make sure your message is relevant to the channel topic. If you're not sure where to post, ask in #help."
                  />
                </ListItem>
                <ListItem alignItems="flex-start">
                  <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                  <ListItemText 
                    primary="Be clear and concise" 
                    secondary="Start with your main point or question. Use formatting to make longer messages more readable."
                  />
                </ListItem>
                <ListItem alignItems="flex-start">
                  <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                  <ListItemText 
                    primary="Use emoji reactions" 
                    secondary="Instead of sending a message that just says 'thanks' or 'agreed', use emoji reactions to acknowledge messages."
                  />
                </ListItem>
                <ListItem alignItems="flex-start">
                  <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                  <ListItemText 
                    primary="Format code properly" 
                    secondary="Use code blocks (```code here```) when sharing code snippets for better readability."
                  />
                </ListItem>
              </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Community Values
              </Typography>
              
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom color="primary">
                    Our Slack Community Values:
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText 
                        primary="Respect everyone's time and attention" 
                        secondary="Be mindful of how many people you're notifying and why"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText 
                        primary="Be inclusive and welcoming" 
                        secondary="We're a diverse community with members of all backgrounds and skill levels"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText 
                        primary="Share knowledge generously" 
                        secondary="Help others learn by explaining concepts clearly, not just providing solutions"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText 
                        primary="Ask questions thoughtfully" 
                        secondary="Show what you've tried and be specific about what you need help with"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText 
                        primary="Assume good intentions" 
                        secondary="Text can be easily misinterpreted; give people the benefit of the doubt"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
              
              <Typography variant="h6" gutterBottom>
                Response Expectations
              </Typography>
              <Typography variant="body2" paragraph>
                Our community spans different time zones and people have varying availability. Here's what to expect:
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon><ArrowForwardIcon /></ListItemIcon>
                  <ListItemText 
                    primary="General channels: 1-24 hours for a response" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><ArrowForwardIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Direct messages: 1-48 hours is reasonable" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><ArrowForwardIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Urgent needs: Use @mentions carefully" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><ArrowForwardIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Weekend/off-hours: Expect slower responses" 
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Remember: our Code of Conduct applies to all communication on Slack. Be respectful, inclusive, and constructive in all your interactions.
            </Typography>
          </Alert>
        </TabPanel>

        {/* Keyboard Shortcuts */}
        <TabPanel value={activeTab} index={5}>
          <Typography variant="h5" gutterBottom>
            Useful Keyboard Shortcuts
          </Typography>
          
          <Typography variant="body1" paragraph>
            Mastering these keyboard shortcuts will make you significantly more efficient in Slack.
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Navigation Shortcuts
              </Typography>
              
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <KeyboardShortcut>Ctrl/Cmd + K</KeyboardShortcut>
                      <Typography variant="body2">
                        Quick switcher (jump to conversations)
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <KeyboardShortcut>Alt + Up/Down</KeyboardShortcut>
                      <Typography variant="body2">
                        Move between channels/DMs
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <KeyboardShortcut>Alt + Left/Right</KeyboardShortcut>
                      <Typography variant="body2">
                        Navigate channel history (back/forward)
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <KeyboardShortcut>Ctrl/Cmd + G</KeyboardShortcut>
                      <Typography variant="body2">
                        Open search
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <KeyboardShortcut>Ctrl/Cmd + Shift + K</KeyboardShortcut>
                      <Typography variant="body2">
                        Open direct messages menu
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <KeyboardShortcut>Ctrl/Cmd + Shift + A</KeyboardShortcut>
                      <Typography variant="body2">
                        Open all unread threads
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              
              <Typography variant="h6" gutterBottom>
                Message Formatting
              </Typography>
              <Card>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <KeyboardShortcut>Ctrl/Cmd + B</KeyboardShortcut>
                      <Typography variant="body2">
                        Bold text
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <KeyboardShortcut>Ctrl/Cmd + I</KeyboardShortcut>
                      <Typography variant="body2">
                        Italic text
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <KeyboardShortcut>Ctrl/Cmd + Shift + X</KeyboardShortcut>
                      <Typography variant="body2">
                        Strikethrough
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <KeyboardShortcut>Shift + Enter</KeyboardShortcut>
                      <Typography variant="body2">
                        New line without sending
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <KeyboardShortcut>```code```</KeyboardShortcut>
                      <Typography variant="body2">
                        Code block (multiline)
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <KeyboardShortcut>`code`</KeyboardShortcut>
                      <Typography variant="body2">
                        Inline code
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Common Actions
              </Typography>
              
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <KeyboardShortcut>Up Arrow</KeyboardShortcut>
                      <Typography variant="body2">
                        Edit your last message
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <KeyboardShortcut>Esc</KeyboardShortcut>
                      <Typography variant="body2">
                        Mark all messages as read
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <KeyboardShortcut>Ctrl/Cmd + Shift + \</KeyboardShortcut>
                      <Typography variant="body2">
                        Toggle sidebar
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <KeyboardShortcut>Ctrl/Cmd + /</KeyboardShortcut>
                      <Typography variant="body2">
                        Show all keyboard shortcuts
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <KeyboardShortcut>R</KeyboardShortcut>
                      <Typography variant="body2">
                        Reply to thread (when hovering)
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <KeyboardShortcut>:</KeyboardShortcut>
                      <Typography variant="body2">
                        Start emoji autocomplete
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Platform-Specific Notes:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="body2" fontWeight="bold" gutterBottom>
                          Desktop App Benefits:
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemIcon><ArrowForwardIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary="Supports all keyboard shortcuts" />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><ArrowForwardIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary="Desktop notifications" />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><ArrowForwardIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary="Better performance" />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="body2" fontWeight="bold" gutterBottom>
                          Mobile App Features:
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemIcon><ArrowForwardIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary="Swipe gestures for actions" />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><ArrowForwardIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary="Notification controls" />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><ArrowForwardIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary="Push notifications" />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
          
          <Box textAlign="center">
            <Button 
              variant="contained" 
              color="primary" 
              href="https://slack.com/help/articles/201374536-Slack-keyboard-shortcuts" 
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<KeyboardIcon />}
            >
              View Complete Slack Shortcuts Guide
            </Button>
          </Box>
        </TabPanel>
      </Box>

      {/* Join Slack CTA */}
      <Box mt={4} textAlign="center">
        <Typography variant="h6" gutterBottom>
          Ready to dive in?
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          href={slackSignupUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ mt: 1 }}
        >
          Join Our Slack Community
        </Button>
      </Box>
    </Box>
  );
};

export default SlackTutorial;