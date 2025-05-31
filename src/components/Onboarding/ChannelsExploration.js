import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Tabs,
  Tab,
  Divider,
  Link,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import TagIcon from '@mui/icons-material/Tag';
import FavoriteIcon from '@mui/icons-material/Favorite';
import InfoIcon from '@mui/icons-material/Info';
import GroupIcon from '@mui/icons-material/Group';
import CodeIcon from '@mui/icons-material/Code';
import HelpIcon from '@mui/icons-material/Help';
import EventIcon from '@mui/icons-material/Event';
import ChatIcon from '@mui/icons-material/Chat';
import { useEnv } from '../../context/env.context';

const SlackChannelCard = styled(Card)(({ theme, active }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  border: active ? `2px solid ${theme.palette.primary.main}` : '1px solid transparent',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: theme.shadows[3]
  }
}));

const ChannelIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  color: theme.palette.text.secondary,
  marginRight: theme.spacing(1)
}));

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`channel-tabpanel-${index}`}
      aria-labelledby={`channel-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

/**
 * ChannelsExploration component
 * Guides new members through the different Slack channels and community resources
 */
const ChannelsExploration = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const { slackSignupUrl } = useEnv();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSelectedChannel(null);
  };

  const handleChannelClick = (channel) => {
    setSelectedChannel(channel);
  };

  // Core Slack channels
  const coreChannels = [
    {
      id: 'general',
      name: 'general',
      description: 'Welcome and general community-wide announcements',
      icon: <InfoIcon />,
      tags: ['Required', 'Community']
    },
    {
      id: 'introductions',
      name: 'introductions',
      description: 'Introduce yourself to the community',
      icon: <GroupIcon />,
      tags: ['Required', 'Networking']
    },
    {
      id: 'help',
      name: 'help',
      description: 'Ask for help with any questions or issues',
      icon: <HelpIcon />,
      tags: ['Support', 'Community']
    },
    {
      id: 'events',
      name: 'events',
      description: 'Upcoming hackathons, workshops, and other events',
      icon: <EventIcon />,
      tags: ['Events', 'Announcements']
    }
  ];

  // Project-focused channels
  const projectChannels = [
    {
      id: 'project-ideas',
      name: 'project-ideas',
      description: 'Share and discuss potential project ideas',
      icon: <ChatIcon />,
      tags: ['Projects', 'Ideation']
    },
    {
      id: 'project-matching',
      name: '#project-matching',
      description: 'Find projects to work on or team members for your project',
      icon: <GroupIcon />,
      tags: ['Projects', 'Teams']
    },
    {
      id: 'technical-questions',
      name: 'technical-questions',
      description: 'Technical discussions and problem-solving',
      icon: <CodeIcon />,
      tags: ['Technical', 'Support']
    }
  ];

  // Special interest channels
  const interestChannels = [
    {
      id: 'frontend',
      name: 'frontend',
      description: 'Frontend development discussions and resources',
      icon: <CodeIcon />,
      tags: ['Technical', 'Frontend']
    },
    {
      id: 'backend',
      name: 'backend',
      description: 'Backend development discussions and resources',
      icon: <CodeIcon />,
      tags: ['Technical', 'Backend']
    },
    {
      id: 'data-science',
      name: 'data-science',
      description: 'Data science and machine learning discussions',
      icon: <CodeIcon />,
      tags: ['Technical', 'Data']
    },
    {
      id: 'design',
      name: 'design',
      description: 'UX/UI design discussions and resources',
      icon: <CodeIcon />,
      tags: ['Technical', 'Design']
    },
    {
      id: 'random',
      name: 'random',
      description: 'Off-topic conversations and community building',
      icon: <ChatIcon />,
      tags: ['Social', 'Community']
    }
  ];

  // Current channel groups based on active tab
  const currentChannels = activeTab === 0 
    ? coreChannels 
    : activeTab === 1 
      ? projectChannels 
      : interestChannels;

  const renderChannelDetail = () => {
    if (!selectedChannel) return null;
    
    const channel = [...coreChannels, ...projectChannels, ...interestChannels]
      .find(c => c.id === selectedChannel);
      
    if (!channel) return null;
    
    return (
      <Paper elevation={1} sx={{ p: 3, mt: 2, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ChannelIcon>{channel.icon}</ChannelIcon>
          <Typography variant="h5" sx={{ fontSize: '1.6rem' }}>{channel.name}</Typography>
        </Box>
        <Typography variant="body1" paragraph>
          {channel.description}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {channel.tags.map((tag, index) => (
            <Chip 
              key={index} 
              label={tag} 
              size="small"
              color={tag === 'Required' ? 'primary' : 'default'}
              icon={tag === 'Required' ? <FavoriteIcon /> : undefined}
            />
          ))}
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            <strong>How to use this channel:</strong>
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
            <li>Read through recent messages to understand the channel culture and topics</li>
            <li>Introduce yourself when joining for the first time</li>
            <li>Use threads to keep conversations organized</li>
            <li>Be respectful and follow our community guidelines</li>
          </Typography>
        </Box>
      </Paper>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box mb={3} textAlign="center">
        <Typography variant="h3" component="h1" gutterBottom>
          Community Channels
        </Typography>
        <Typography variant="subtitle1" color="text.primary" sx={{ fontSize: '1.2rem' }}>
          Explore our Slack channels and community resources
        </Typography>
        <Divider sx={{ mt: 2, mb: 3 }} />
      </Box>

      {/* Join Slack CTA if not already a member */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body1" color="text.primary" sx={{ fontSize: '1.2rem'}}>
          Not yet a member of our Slack workspace? 
          <Link href={slackSignupUrl} target="_blank" rel="noopener noreferrer" sx={{ ml: 1 }}>
            <b>Join us on Slack</b>
          </Link> to access these channels and connect with the community.
        </Typography>
      </Alert>

      {/* Channel categories tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          aria-label="channel categories"
          centered
        >
          <Tab label="Getting Started" id="channel-tab-0" sx={{ fontSize: '1.3rem' }} />
          <Tab label="Project Collaboration" id="channel-tab-1" sx={{ fontSize: '1.3rem' }} />
          <Tab label="Special Interests" id="channel-tab-2" sx={{ fontSize: '1.3rem' }} />
        </Tabs>
      </Box>

      {/* Introduction to channel group */}
      <TabPanel value={activeTab} index={0}>
        <Typography variant="body1" paragraph color="text.primary" sx={{ fontSize: '1.25rem' }}>
          These are the essential channels every member should join. They'll help you get oriented and stay connected with important community updates.
        </Typography>
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        <Typography variant="body1" paragraph color="text.primary" sx={{ fontSize: '1.25rem' }}>
          These channels focus on project work - finding teams, sharing ideas, and getting technical help. Join based on your interests and participation.
        </Typography>
      </TabPanel>
      <TabPanel value={activeTab} index={2}>
        <Typography variant="body1" paragraph color="text.primary" sx={{ fontSize: '1.25rem' }}>
          Special interest channels for specific technologies, skills, or social connections. Join any that align with your interests or expertise.
        </Typography>
      </TabPanel>

      {/* Channel grid */}
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {currentChannels.map((channel) => (
          <Grid item xs={12} sm={6} md={4} key={channel.id}>
            <SlackChannelCard 
              onClick={() => handleChannelClick(channel.id)} 
              active={selectedChannel === channel.id}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TagIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="h6" sx={{ fontSize: '1.35rem' }}>
                    {channel.name}
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                  {channel.description}
                </Typography>
              </CardContent>
              <Box sx={{ flexGrow: 1 }} />
              <CardActions>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {channel.tags.map((tag, index) => (
                    <Chip 
                      key={index} 
                      label={tag} 
                      size="small" 
                      variant="outlined"
                      color={tag === 'Required' ? 'primary' : 'default'}
                      sx={{ fontSize: '1.0rem', height: 30 }}
                    />
                  ))}
                </Box>
              </CardActions>
            </SlackChannelCard>
          </Grid>
        ))}
      </Grid>

      {/* Selected channel details */}
      {renderChannelDetail()}

      {/* Additional resources */}
      <Box mt={4}>
        <Typography variant="h5" gutterBottom sx={{ fontSize: '2rem' }}>
          Additional Resources
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: '1.5rem' }}>
                Slack Etiquette
              </Typography>
              <Typography variant="body1" component="ul" sx={{ pl: 2, fontSize: '1.3rem' }}>
                <li>Use threads for detailed discussions</li>
                <li>Keep messages in appropriate channels</li>
                <li>Be respectful and inclusive in all communications</li>
                <li>Use @mentions sparingly to avoid notification fatigue</li>
                <li>Share knowledge generously and ask questions freely</li>
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: '1.5rem' }}>
                Other Community Platforms
              </Typography>
              <Typography variant="body1" component="ul" sx={{ pl: 2, fontSize: '1.3rem' }}>
                <li>GitHub: Collaborate on projects and review code</li>
                <li>Discord: Voice chat during hackathons and events</li>
                <li>Monthly Webinars: Join our educational sessions</li>
                <li>Office Hours: Get 1:1 help from community leaders</li>
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ChannelsExploration;