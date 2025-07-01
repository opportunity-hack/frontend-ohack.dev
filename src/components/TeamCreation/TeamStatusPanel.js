import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  AlertTitle,
  Button,
  Card,
  CardContent,
  Stack,
  Grid,
  Link as MuiLink,
  Avatar,
  Skeleton,
  TextField,
  InputAdornment,
  Snackbar
} from '@mui/material';
import { Puff } from 'react-loading-icons';
import { styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ErrorIcon from '@mui/icons-material/Error';
import LaptopIcon from '@mui/icons-material/Laptop';
import GitHubIcon from '@mui/icons-material/GitHub';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupIcon from '@mui/icons-material/Group';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HelpIcon from '@mui/icons-material/Help';
import ChatIcon from '@mui/icons-material/Chat';
import LinkIcon from '@mui/icons-material/Link';
import EventIcon from '@mui/icons-material/Event';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import CodeIcon from '@mui/icons-material/Code';
import SendIcon from '@mui/icons-material/Send';
import CheckIcon from '@mui/icons-material/Check';
import Link from 'next/link';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  borderRadius: theme.spacing(1),
  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)',
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'IN_REVIEW':
        return {
          bg: theme.palette.grey[200],
          color: theme.palette.secondary.dark,
        };
      case 'APPROVED':
        return { bg: theme.palette.success.light, color: theme.palette.success.dark };
      case 'PROJECT_COMPLETE':
        return { bg: theme.palette.info.light, color: theme.palette.info.dark };
      case 'REJECTED':
        return { bg: theme.palette.error.light, color: theme.palette.error.dark };
      default:
        return { bg: theme.palette.grey[200], color: theme.palette.grey[700] };
    }
  };

  const colors = getStatusColor();
  
  return {
    backgroundColor: colors.bg,
    color: colors.color,
    fontWeight: 'bold',
    '& .MuiChip-icon': {
      color: colors.color
    },
    ...(status === 'IN_REVIEW' && {
      animation: 'pulse 2s infinite ease-in-out',
      boxShadow: '0 0 5px rgba(255, 167, 38, 0.5)'
    })
  };
});

const InfoChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  '& .MuiChip-icon': {
    color: theme.palette.text.secondary
  }
}));

const ResourceCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)'
  }
}));

const ActionButton = styled(Button)(({ theme }) => ({
  fontWeight: 600,
  borderRadius: theme.shape.borderRadius,
  textTransform: 'none',
  margin: theme.spacing(0.5),
  whiteSpace: 'nowrap',
}));

const getStatusIcon = (status) => {
  switch (status) {
    case 'IN_REVIEW':
      return <PendingIcon sx={{ animation: 'spin 3s infinite linear' }} />;
    case 'NONPROFIT_SELECTED':
      return <BusinessIcon />;
    case 'ONBOARDED':
      return <CheckCircleIcon />;
    case 'SWAG_RECEIVED':
      return <VolunteerActivismIcon />;
    case 'PROJECT_COMPLETE':
      return <LaptopIcon />;
    case 'INACTIVE':
      return <ErrorIcon />;
    default:
      return <PendingIcon />;
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'IN_REVIEW':
      return 'In Review';
    case 'NONPROFIT_SELECTED':
      return 'Nonprofit Selected';
    case 'ONBOARDED':
      return 'Onboarded';
    case 'SWAG_RECEIVED':
      return 'Swag Received';
    case 'PROJECT_COMPLETE':
      return 'Project Complete';
    case 'INACTIVE':
      return 'Inactive';
    default:
      return 'Pending';
  }
};

// Function to get the color for header background based on team status
const getHeaderColor = (status, theme) => {
  switch (status) {
    case 'APPROVED':
      return theme.palette.success.light;
    case 'IN_REVIEW':
      return theme.palette.warning.light;
    case 'PROJECT_COMPLETE':
      return theme.palette.info.light;
    case 'REJECTED':
      return theme.palette.error.light;
    default:
      return theme.palette.grey[100];
  }
};

// Define keyframes for animations
const keyframes = `
  @keyframes pulse {
    0% { background-position: 0% 50% }
    50% { background-position: 100% 50% }
    100% { background-position: 0% 50% }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg) }
    100% { transform: rotate(360deg) }
  }

  @keyframes fadeInOut {
    0% { opacity: 0.7 }
    50% { opacity: 1 }
    100% { opacity: 0.7 }
  }
`;

// Define video files array for waiting animations
const waitingVideos = [
  'a_cat_that_is_waiting_to_pounce.mp4',
  'a_cat_that_is_waiting_to_pounce_1.mp4',
  'a_cat_that_is_waiting_to_pounce_2.mp4',
  'a_cat_that_is_waiting_to_pounce_3.mp4',
  'a_dog_that_is_waiting_by_the.mp4',
  'a_dog_that_is_waiting_by_the_1.mp4',
  'a_dog_that_is_waiting_by_the_2.mp4',
  'a_dog_that_is_waiting_by_the_3.mp4'
];

const TeamStatusPanel = ({ teams, loading, error, nonprofits, event, eventId, accessToken }) => {
  // State for selected waiting video
  const [selectedVideo, setSelectedVideo] = useState('');
  const [devpostSubmissions, setDevpostSubmissions] = useState({});
  const [devpostLoading, setDevpostLoading] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Select a random waiting video on component mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * waitingVideos.length);
    setSelectedVideo(waitingVideos[randomIndex]);
  }, []);
  
  // Inject the keyframes animation styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = keyframes;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // DevPost URL validation function
  const isValidDevPostUrl = (url) => {
    if (!url) return false;
    const devpostPattern = /^https?:\/\/(www\.)?devpost\.com\/software\/[a-zA-Z0-9-_]+\/?$/;
    return devpostPattern.test(url.trim());
  };

  // Handle DevPost link submission
  const handleDevPostSubmit = async (teamId) => {
    const url = devpostSubmissions[teamId]?.trim();
    
    if (!url) {
      setSnackbar({
        open: true,
        message: 'Please enter a DevPost URL',
        severity: 'error'
      });
      return;
    }

    if (!isValidDevPostUrl(url)) {
      setSnackbar({
        open: true,
        message: 'Please enter a valid DevPost project URL (e.g., https://devpost.com/software/your-project)',
        severity: 'error'
      });
      return;
    }

    setDevpostLoading(prev => ({ ...prev, [teamId]: true }));

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/team/${teamId}/devpost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },        
        body: JSON.stringify({ devpost_link: url })
      });

      if (!response.ok) {
        throw new Error('Failed to update DevPost link');
      }

      // Update the team data locally
      const updatedTeams = teams.map(team => 
        team.id === teamId ? { ...team, devpost_link: url } : team
      );
      
      setSnackbar({
        open: true,
        message: 'DevPost link updated successfully!',
        severity: 'success'
      });

      // Clear the input field so it shows the saved URL from team.devpost_link
      // setDevpostSubmissions(prev => ({ ...prev, [teamId]: '' }));

    } catch (error) {
      console.error('Error updating DevPost link:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update DevPost link. Please try again.',
        severity: 'error'
      });
    } finally {
      setDevpostLoading(prev => ({ ...prev, [teamId]: false }));
    }
  };

  // Handle input change for DevPost URL
  const handleDevPostInputChange = (teamId, value) => {
    setDevpostSubmissions(prev => ({ ...prev, [teamId]: value }));
  };

  // Handle loading state with better UX
  if (loading) {
    return (
      <StyledPaper>
        <Typography variant="h5" gutterBottom>
          Your Hackathon Team
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', my: 4 }}>
          <Puff stroke="#1976d2" width={80} height={80} />
          <Typography variant="body1" sx={{ mt: 2, fontWeight: 'medium' }}>
            Loading your team information...
          </Typography>
        </Box>
        <Box sx={{ mt: 3, mb: 2 }}>
          <Skeleton variant="rectangular" width="100%" height={100} sx={{ borderRadius: 1, mb: 2 }} />
          <Skeleton variant="text" width="60%" height={30} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="80%" height={25} />
          <Skeleton variant="text" width="40%" height={30} sx={{ mt: 2 }} />
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={150} height={36} sx={{ borderRadius: 1 }} />
          </Box>
        </Box>
      </StyledPaper>
    );
  }

  // Handle error state
  if (error) {
    return (
      <StyledPaper>
        <Alert severity="error">
          <AlertTitle>Error Loading Team Information</AlertTitle>
          {error}
        </Alert>
      </StyledPaper>
    );
  }

  // Helper function to get nonprofit details
  const getNonprofitName = (id) => {
    if(nonprofits && nonprofits.length > 0) {
      const nonprofit = nonprofits.find((n) => n.id === id);
      return nonprofit ? nonprofit.name : "Assigned Nonprofit";
    }
    return "Assigned Nonprofit";
  };

  const getNonprofit = (id) => {
    if(nonprofits && nonprofits.length > 0) {
      return nonprofits.find((n) => n.id === id);
    }
    return null;
  };

  // If no teams yet, show loading animation if teams array is null (still loading)
  // Otherwise show the "no teams yet" message if teams array is empty
  if (!teams) {
    return (
      <StyledPaper>
        <Typography variant="h5" gutterBottom>
          Your Hackathon Team
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', my: 4 }}>
          <Puff stroke="#1976d2" width={80} height={80} />
          <Typography variant="body1" sx={{ mt: 2, fontWeight: 'medium' }}>
            Loading your team information...
          </Typography>
        </Box>
      </StyledPaper>
    );
  } else if (teams.length === 0) {
    return (
      <StyledPaper>
        <Alert severity="info" sx={{ mb: 2 }}>
          <AlertTitle>No Teams Yet</AlertTitle>
          <Typography variant="body1" sx={{ fontSize: '1.05rem' }}>
            You don't have any teams for this hackathon yet. Complete the form below to create your team.
          </Typography>
        </Alert>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>Hackathon Resources</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <ResourceCard>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    <HelpIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Need Help?
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Join the #ask-a-mentor Slack channel for support from our mentors during the hackathon.
                  </Typography>
                  <ActionButton 
                    variant="outlined" 
                    size="small"
                    component="a"
                    href="https://opportunity-hack.slack.com/app_redirect?channel=ask-a-mentor"
                    target="_blank"
                    startIcon={<ChatIcon />}
                  >
                    Join #ask-a-mentor
                  </ActionButton>
                </CardContent>
              </ResourceCard>
            </Grid>
            <Grid item xs={12} sm={6}>
              <ResourceCard>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    <VolunteerActivismIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Track Your Hours
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Don't forget to track your volunteer hours to earn recognition and rewards.
                  </Typography>
                  <ActionButton 
                    variant="outlined" 
                    size="small"
                    component={Link}
                    href="/volunteer/track"
                    startIcon={<AccessTimeIcon />}
                  >
                    Track Hours
                  </ActionButton>
                </CardContent>
              </ResourceCard>
            </Grid>
          </Grid>
        </Box>
      </StyledPaper>
    );
  }

  // Sort teams so approved teams show first
  const sortedTeams = [...teams].sort((a, b) => {
    // Priority order: APPROVED, IN_REVIEW, PROJECT_COMPLETE, others
    const statusOrder = { 
      'APPROVED': 0, 
      'IN_REVIEW': 1, 
      'PROJECT_COMPLETE': 2,
      'REJECTED': 3
    };
    
    return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
  });

  // Show team hub view
  return (
    <StyledPaper>
      <Typography variant="h5" gutterBottom>
        Your Hackathon Team Hub
      </Typography>

      {sortedTeams.length > 1 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>Multiple Teams</AlertTitle>
          <Typography variant="body1" sx={{ fontSize: "1.05rem" }}>
            You are part of multiple teams for this hackathon. Your active team
            will be listed first.
          </Typography>
        </Alert>
      )}

      {sortedTeams.map((team, index) => (
        <Box key={team.id} sx={{ mb: index < sortedTeams.length - 1 ? 4 : 0 }}>
          {/* Team Header */}
          <Card
            elevation={3}
            sx={{
              mb: 3,
              borderRadius: "8px 8px 0 0",
              backgroundColor: (theme) => getHeaderColor(team.status, theme),
              position: "relative",
              overflow: "visible",
            }}
          >
            <CardContent sx={{ pb: 2 }}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: "primary.main",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    }}
                  >
                    <GroupIcon fontSize="large" />
                  </Avatar>
                </Grid>
                <Grid item xs>
                  <Box display="flex" alignItems="center" flexWrap="wrap">
                    <Typography
                      variant="h5"
                      component="h2"
                      sx={{ fontWeight: 600, mr: 2 }}
                    >
                      {team.name}
                    </Typography>
                    <StatusChip
                      icon={getStatusIcon(team.status)}
                      label={getStatusLabel(team.status)}
                      status={team.status}
                      size="medium"
                    />
                  </Box>
                  {team.location && (
                    <Typography
                      variant="body2"
                      sx={{ mt: 0.5, display: "flex", alignItems: "center" }}
                    >
                      <LocationOnIcon fontSize="small" sx={{ mr: 0.5 }} />{" "}
                      {team.location}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Main content card */}
          <Card elevation={1} sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent>
              {/* Enhanced waiting state for teams under review */}
              {team.status === "IN_REVIEW" && (
                <Box
                  sx={{
                    mb: 3,
                    p: 3,
                    borderRadius: 2,
                    background:
                      "linear-gradient(145deg, #fff8e1 0%, #fffde7 100%)",
                    border: "1px solid #ffe082",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "4px",
                      background:
                        "linear-gradient(90deg, #ffe082, #ffb74d, #ffe082)",
                      backgroundSize: "200% 100%",
                      animation: "pulse 2s infinite linear",
                    }}
                  />

                  {/* Fun waiting video */}
                  {selectedVideo && (
                    <Box
                      sx={{
                        width: "50%",
                        mb: 3,
                        borderRadius: 2,
                        overflow: "hidden",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        border: "1px solid #ffe082",
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: "#f57c00",
                          p: 2,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          borderBottom: "1px solid #ffe082",
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: "bold", color: "white" }}
                        >
                          <PendingIcon
                            sx={{
                              verticalAlign: "middle",
                              mr: 1,
                              animation: "spin 3s infinite linear",
                            }}
                          />
                          While You Wait...
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          position: "relative",
                          paddingTop: "100%" /* 1:1 Square Aspect Ratio */,
                        }}
                      >
                        <video
                          autoPlay
                          loop
                          muted
                          playsInline
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            backgroundColor: "#fefaf5",
                          }}
                        >
                          <source
                            src={`https://cdn.ohack.dev/ohack.dev/videos/fun/${selectedVideo}`}
                            type="video/mp4"
                          />
                          Your browser does not support the video tag.
                        </video>
                      </Box>
                      <Box
                        sx={{
                          p: 2,
                          textAlign: "center",
                          bgcolor: "#fff8e9",
                          borderTop: "1px solid #ffe082",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontStyle: "italic", color: "text.secondary" }}
                        >
                          Refresh the page to see a different waiting animation!
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}
                  >
                    <PendingIcon
                      sx={{
                        color: "warning.main",
                        mr: 2,
                        fontSize: "2rem",
                        animation: "spin 3s infinite linear",
                      }}
                    />
                    <Box>
                      <Typography
                        variant="h5"
                        sx={{ color: "#5d4037", fontWeight: "bold", mb: 1 }}
                      >
                        Team Application Under Review
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ fontSize: "1.1rem", mb: 1.5 }}
                      >
                        The Opportunity Hack team is currently reviewing your
                        application and will match you with one of your
                        preferred nonprofits.
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ color: "text.secondary", fontSize: "1rem" }}
                      >
                        You'll be notified in Slack when your team is approved.
                        The review process typically takes 10-20 minutes while
                        we evaluate nonprofit fit and team assignments.
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      bgcolor: "rgba(255, 224, 130, 0.3)",
                      p: 2,
                      borderRadius: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          mr: 2,
                          minWidth: 40,
                          height: 40,
                          borderRadius: "50%",
                          bgcolor: "white",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                      >
                        <AccessTimeIcon sx={{ color: "warning.main" }} />
                      </Box>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: "bold", mb: 0.5 }}
                        >
                          While You Wait
                        </Typography>
                        <Typography variant="body1" sx={{ fontSize: "1rem" }}>
                          Here are some steps to prepare your team for a smooth
                          start once approved:
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ ml: 7, mb: 1 }}>
                      <Typography
                        variant="body1"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 1.5,
                          fontSize: "1rem",
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            display: "inline-block",
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: "warning.main",
                            mr: 1.5,
                          }}
                        />
                        Make sure everyone on your team has joined the
                        Opportunity Hack Slack workspace
                      </Typography>

                      <Typography
                        variant="body1"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 1.5,
                          fontSize: "1rem",
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            display: "inline-block",
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: "warning.main",
                            mr: 1.5,
                          }}
                        />
                        Have team members complete their profile information
                        including GitHub username
                      </Typography>

                      <Typography
                        variant="body1"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          fontSize: "1rem",
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            display: "inline-block",
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: "warning.main",
                            mr: 1.5,
                          }}
                        />
                        Research the nonprofits you selected to better
                        understand their missions and needs & setup your
                        development environment so you're ready to start coding
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Team is approved - primary info */}
              {team.status === "APPROVED" && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  <AlertTitle>Team Approved</AlertTitle>
                  <Typography variant="body1" sx={{ fontSize: "1.05rem" }}>
                    Your team has been approved! Be sure to join your team's
                    Slack channel and check frequently for updates.
                  </Typography>
                </Alert>
              )}

              {/* Slack Communication - Critical information */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <ChatIcon fontSize="small" sx={{ mr: 1 }} /> Team
                  Communication
                </Typography>
                <Card
                  variant="outlined"
                  sx={{ borderLeft: "4px solid #4A154B", borderRadius: 1 }}
                >
                  <CardContent>
                    <Typography variant="body1" paragraph>
                      <strong>Team Slack Channel:</strong>{" "}
                      <MuiLink
                        href={`https://opportunity-hack.slack.com/app_redirect?channel=${team.slack_channel}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ fontWeight: "bold" }}
                      >
                        #{team.slack_channel}
                      </MuiLink>
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: "text.secondary", fontSize: "1.05rem" }}
                    >
                      💬 <strong>Important:</strong> All team members must join
                      this Slack channel for the entire event. This is where
                      organizers will share important announcements and you'll
                      coordinate with your team.
                    </Typography>
                    <Box mt={1.5}>
                      <ActionButton
                        variant="contained"
                        color="primary"
                        size="small"
                        href={`https://opportunity-hack.slack.com/app_redirect?channel=${team.slack_channel}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Join #{team.slack_channel}
                      </ActionButton>
                      <ActionButton
                        variant="outlined"
                        size="small"
                        href="https://opportunity-hack.slack.com/app_redirect?channel=ask-a-mentor"
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ ml: 1 }}
                      >
                        Join #ask-a-mentor for help
                      </ActionButton>
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              {/* Selected Nonprofit */}
              {team.selected_nonprofit_id && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <BusinessIcon fontSize="small" sx={{ mr: 1 }} /> Assigned
                    Nonprofit
                  </Typography>
                  <Card
                    variant="outlined"
                    sx={{ borderLeft: "4px solid #2E7D32", borderRadius: 1 }}
                  >
                    <CardContent>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: "bold", mb: 1 }}
                      >
                        <Link
                          href={`/nonprofit/${team.selected_nonprofit_id}`}
                          passHref
                        >
                          <MuiLink underline="hover" color="inherit">
                            {getNonprofitName(team.selected_nonprofit_id)}
                          </MuiLink>
                        </Link>
                      </Typography>
                      {(() => {
                        const nonprofit = getNonprofit(
                          team.selected_nonprofit_id
                        );
                        return nonprofit && nonprofit.mission ? (
                          <Typography variant="body2" color="text.secondary">
                            {nonprofit.mission?.substring(0, 150)}
                            {nonprofit.mission?.length > 150 ? "..." : ""}
                          </Typography>
                        ) : null;
                      })()}
                      <Box mt={1.5}>
                        <Button
                          variant="outlined"
                          size="small"
                          component={Link}
                          href={`/nonprofit/${team.selected_nonprofit_id}`}
                        >
                          View Nonprofit Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              )}

              {/* GitHub Information - Critical for team lead */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <GitHubIcon fontSize="small" sx={{ mr: 1 }} /> GitHub
                  Repository
                </Typography>
                <Card
                  variant="outlined"
                  sx={{ borderLeft: "4px solid #171515", borderRadius: 1 }}
                >
                  <CardContent>
                    <Typography variant="body1" paragraph>
                      <strong>Team Lead GitHub:</strong>{" "}
                      <MuiLink
                        href={`https://github.com/${team.github_username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        @{team.github_username}
                      </MuiLink>
                    </Typography>

                    {event && event.github_org && (
                      <>
                        <Typography
                          variant="body1"
                          paragraph
                          sx={{ color: "text.secondary", fontSize: "1.05rem" }}
                        >
                          ⚠️ <strong>Important:</strong> Your team should only
                          use the official hackathon GitHub organization for the
                          entire event. Do not create separate repositories
                          outside this organization.
                        </Typography>

                        {team.github_username && (
                          <Typography
                            variant="body1"
                            paragraph
                            sx={{
                              color: "text.primary",
                              fontSize: "1.05rem",
                              bgcolor: "action.hover",
                              p: 1,
                              borderRadius: 1,
                            }}
                          >
                            👉 <strong>Team Lead Action Required:</strong>{" "}
                            {team.github_username} must create a repository for
                            the team in the{" "}
                            <MuiLink
                              href={`https://github.com/${event.github_org}`}
                              target="_blank"
                            >
                              @{event.github_org}
                            </MuiLink>{" "}
                            organization and add all team members as
                            collaborators.
                          </Typography>
                        )}

                        <Box mt={1.5}>
                          <ActionButton
                            variant="contained"
                            color="inherit"
                            size="small"
                            href={`https://github.com/${event.github_org}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<GitHubIcon />}
                            sx={{
                              bgcolor: "#171515",
                              color: "white",
                              "&:hover": { bgcolor: "#2b2b2b" },
                            }}
                          >
                            GitHub Organization
                          </ActionButton>
                          <ActionButton
                            variant="outlined"
                            size="small"
                            href="https://opportunity-hack.slack.com/archives/C1Q6YHXQU/p1605657678139600"
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ ml: 1 }}
                          >
                            Add people to your GitHub Repo
                          </ActionButton>
                        </Box>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Box>

              {/* DevPost Project Section */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <CodeIcon fontSize="small" sx={{ mr: 1 }} /> DevPost Project
                </Typography>
                <Card
                  variant="outlined"
                  sx={{ borderLeft: "4px solid #003d5c", borderRadius: 1 }}
                >
                  <CardContent>
                    {team.devpost_link ? (
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <CheckIcon sx={{ color: 'success.main', mr: 1 }} />
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            DevPost Link Provided
                          </Typography>
                        </Box>
                        <Typography variant="body1" paragraph>
                          <strong>Your DevPost Project:</strong>{" "}
                          <MuiLink
                            href={team.devpost_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ fontWeight: "bold" }}
                          >
                            View Project on DevPost
                          </MuiLink>
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary", mb: 2 }}
                        >
                          ✅ We have your DevPost project link. You can update it below if needed. Remember to submit your project on DevPost before the{" "}
                          <MuiLink
                          component={Link}
                          href={`/hack/${eventId}#countdown`}
                          underline="hover"
                          sx={{ fontWeight: "bold" }}
                          >
                          deadline
                          </MuiLink>
                          !
                        </Typography>
                      </>
                    ) : (
                      <Typography
                        variant="body1"
                        paragraph
                        sx={{ color: "text.secondary", fontSize: "1.05rem" }}
                      >
                        🔗 <strong>Share Your DevPost Link:</strong> Once you've created your DevPost project page, share the link with us here so we can track your team's submission.
                      </Typography>
                    )}

                    <Box sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        label="DevPost Project URL"
                        placeholder="https://devpost.com/software/your-project-name"
                        value={devpostSubmissions[team.id] || team.devpost_link || ''}
                        onChange={(e) => handleDevPostInputChange(team.id, e.target.value)}
                        error={devpostSubmissions[team.id] && !isValidDevPostUrl(devpostSubmissions[team.id])}
                        helperText={
                          devpostSubmissions[team.id] && !isValidDevPostUrl(devpostSubmissions[team.id])
                            ? "Please enter a valid DevPost URL (e.g., https://devpost.com/software/your-project)"
                            : team.devpost_link && !devpostSubmissions[team.id]
                            ? "Your current DevPost project link is shown above"
                            : "Enter the URL of your DevPost project page"
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CodeIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ 
                          mb: 2,
                          '& .MuiOutlinedInput-root': team.devpost_link && !devpostSubmissions[team.id] ? {
                            backgroundColor: 'rgba(76, 175, 80, 0.04)',
                            '& fieldset': {
                              borderColor: 'rgba(76, 175, 80, 0.3)',
                            },
                          } : {}
                        }}
                      />
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleDevPostSubmit(team.id)}
                          disabled={devpostLoading[team.id] || !devpostSubmissions[team.id] || !isValidDevPostUrl(devpostSubmissions[team.id])}
                          startIcon={devpostLoading[team.id] ? <CircularProgress size={16} /> : <SendIcon />}
                        >
                          {devpostLoading[team.id] ? 'Saving...' : (team.devpost_link ? 'Update Link' : 'Save Link')}
                        </Button>
                        <Button
                          variant="outlined"
                          size="medium"
                          href={event.devpost_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          startIcon={<CodeIcon />}
                        >
                          Create DevPost Project
                        </Button>
                        <Button
                          variant="outlined"
                          size="medium"
                          href="https://youtu.be/vCa7QFFthfU?si=bzMQ91d8j3ZkOD03"
                          target="_blank"
                          rel="noopener noreferrer"
                          startIcon={<HelpIcon />}
                        >
                          How to Create a DevPost Project
                        </Button>
                      </Box>
                    </Box>

                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        <strong>Important:</strong> Sharing your DevPost link here helps us track your team's progress. 
                        Don't forget to actually submit your project on DevPost before the hackathon deadline!
                      </Typography>
                    </Alert>
                  </CardContent>
                </Card>
              </Box>

            </CardContent>
          </Card>

          {/* Quick Action Buttons */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight="bold">
                    <EventIcon
                      fontSize="small"
                      sx={{ verticalAlign: "middle", mr: 0.5 }}
                    />{" "}
                    Hackathon Event
                  </Typography>
                  <ActionButton
                    fullWidth
                    variant="outlined"
                    size="small"
                    component={Link}
                    href={`/hack/${eventId}`}
                    sx={{ mt: 1 }}
                  >
                    View Event Details
                  </ActionButton>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight="bold">
                    <AccountCircleIcon
                      fontSize="small"
                      sx={{ verticalAlign: "middle", mr: 0.5 }}
                    />{" "}
                    Your Profile
                  </Typography>
                  <ActionButton
                    fullWidth
                    variant="outlined"
                    size="small"
                    component={Link}
                    href="/profile"
                    sx={{ mt: 1 }}
                  >
                    Update Profile
                  </ActionButton>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight="bold">
                    <AccessTimeIcon
                      fontSize="small"
                      sx={{ verticalAlign: "middle", mr: 0.5 }}
                    />{" "}
                    Track Hours
                  </Typography>
                  <ActionButton
                    fullWidth
                    variant="outlined"
                    size="small"
                    component={Link}
                    href="/volunteer/track"
                    sx={{ mt: 1 }}
                  >
                    Log Volunteer Time
                  </ActionButton>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight="bold">
                    <HelpIcon
                      fontSize="small"
                      sx={{ verticalAlign: "middle", mr: 0.5 }}
                    />{" "}
                    Support
                  </Typography>
                  <ActionButton
                    fullWidth
                    variant="outlined"
                    size="small"
                    href="https://opportunity-hack.slack.com/app_redirect?channel=ask-a-mentor"
                    target="_blank"
                    sx={{ mt: 1 }}
                  >
                    Ask a Mentor
                  </ActionButton>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Divider between multiple teams */}
          {index < sortedTeams.length - 1 && <Divider sx={{ my: 3 }} />}
        </Box>
      ))}

      {/* Helpful Information Box */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Helpful Resources
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          <AlertTitle>Win Prizes & Get Recognition</AlertTitle>
          <Typography variant="body1" sx={{ fontSize: "1.05rem" }}>
            Don't forget to{" "}
            <Link href="/profile" passHref>
              <MuiLink>update your profile</MuiLink>
            </Link>{" "}
            and{" "}
            <Link href="/volunteer/track" passHref>
              <MuiLink>track your volunteer hours</MuiLink>
            </Link>{" "}
            to be eligible for prizes and recognition!
          </Typography>
        </Alert>

        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          If you need to refresh this page to see updated team status, use the
          browser's refresh button.
        </Typography>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </StyledPaper>
  );
};

export default TeamStatusPanel;