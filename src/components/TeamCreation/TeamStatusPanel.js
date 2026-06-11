import React, { useEffect, useState, useCallback } from 'react';
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
  Snackbar,
  GlobalStyles,
} from '@mui/material';
import { TEAM_STATUS_OPTIONS, isWinningStatus, getWinningStatus } from '../../constants/teamStatus';
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
import YouTubeIcon from '@mui/icons-material/YouTube';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import StarIcon from '@mui/icons-material/Star';
import Link from 'next/link';
import LiteVideoThumbnail from '../VideoDisplay/LiteVideoThumbnail';

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
    case 'COMPLETED_HACKATHON':
      return <CheckCircleIcon />;
    case 'FOUNDING_ENGINEERS':
      return <EmojiEventsIcon />;
    case 'COMPLETION_SUPPORT':
      return <WorkspacePremiumIcon />;
    case 'CATEGORY_WINNER':
      return <StarIcon />;
    case 'INACTIVE':
      return <ErrorIcon />;
    default:
      return <PendingIcon />;
  }
};

/* Example github link within team:
"github_links": [
    {
      "link": "https://github.com/2024-Arizona-Opportunity-Hack/NEWRR",
      "name": "test1111-ControlAltDeleteLLC-TangibleDonations"
    }
  ],
*/
const getTeamGitHubLink = (team) => {
  const githubLinks = team?.github_links || [];
  return githubLinks.length > 0 && githubLinks[0].link ? githubLinks[0].link : null;
};

const getTeamGitHubName = (team) => {
  const githubLinks = team?.github_links || [];
  return githubLinks.length > 0 && githubLinks[0].name ? githubLinks[0].name : null;
};

// Use TEAM_STATUS_OPTIONS from constants — no local label/icon/color duplicates needed.

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

const TeamStatusPanel = ({ teams, loading, error, nonprofits, event, eventId, accessToken, onTeamUpdated }) => {
  const [selectedVideo, setSelectedVideo] = useState('');
  const [devpostSubmissions, setDevpostSubmissions] = useState({});
  const [devpostLoading, setDevpostLoading] = useState({});
  const [demoVideoSubmissions, setDemoVideoSubmissions] = useState({});
  const [demoVideoLoading, setDemoVideoLoading] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * waitingVideos.length);
    setSelectedVideo(waitingVideos[randomIndex]);
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

      if (onTeamUpdated) onTeamUpdated(teamId, { devpost_link: url });

      setSnackbar({
        open: true,
        message: 'DevPost link updated successfully!',
        severity: 'success'
      });

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

  // Demo video URL: accept YouTube, Vimeo, Loom, or Google Drive (matches VideoDisplay providers)
  const isValidDemoVideoUrl = (url) => {
    if (!url) return false;
    const trimmed = url.trim();
    return (
      /youtube\.com\/.+v=[\w-]{11}/i.test(trimmed) ||
      /youtu\.be\/[\w-]{11}/i.test(trimmed) ||
      /vimeo\.com\/\d+/i.test(trimmed) ||
      /loom\.com\/(share|embed)\/[a-zA-Z0-9]+/i.test(trimmed) ||
      /drive\.google\.com\/file\/d\//i.test(trimmed)
    );
  };

  const handleDemoVideoInputChange = (teamId, value) => {
    setDemoVideoSubmissions(prev => ({ ...prev, [teamId]: value }));
  };

  const handleDemoVideoSubmit = async (teamId) => {
    const url = (demoVideoSubmissions[teamId] || '').trim();
    if (!url) {
      setSnackbar({ open: true, message: 'Please enter a video URL', severity: 'error' });
      return;
    }
    if (!isValidDemoVideoUrl(url)) {
      setSnackbar({
        open: true,
        message: 'Please enter a YouTube, Vimeo, Loom, or Google Drive video URL.',
        severity: 'error',
      });
      return;
    }

    setDemoVideoLoading(prev => ({ ...prev, [teamId]: true }));
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/team/${teamId}/demo-video`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ demo_video_url: url }),
        }
      );
      if (!response.ok) throw new Error('Failed to update demo video');

      if (onTeamUpdated) onTeamUpdated(teamId, { demo_video_url: url });
      // Keep the input in sync so the preview still shows after save
      setDemoVideoSubmissions(prev => ({ ...prev, [teamId]: url }));

      setSnackbar({
        open: true,
        message: 'Demo video saved! Judges and visitors will see it on the event page.',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error updating demo video URL:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update demo video. Please try again.',
        severity: 'error',
      });
    } finally {
      setDemoVideoLoading(prev => ({ ...prev, [teamId]: false }));
    }
  };

  const statusLabel = (status) => {
    const opt = TEAM_STATUS_OPTIONS.find((o) => o.value === status);
    const label = opt?.label || status;
    return isWinningStatus(status) ? `🏆 ${label}` : label;
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
            <Grid size={{ xs: 12, sm: 6 }}>
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <ResourceCard>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    <VolunteerActivismIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Track Your Hours
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Don't forget to track your volunteer hours if you need them for school or work!
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
      <GlobalStyles styles={{
        '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
        '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.6 } },
        '@keyframes ohx-fade': { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'none' } },
      }} />
      <Typography variant="h5" gutterBottom>
        Your Hackathon Team Hub
      </Typography>

      {sortedTeams.length > 1 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Multiple Teams</AlertTitle>
          <Typography variant="body1" sx={{ fontSize: "1.05rem" }}>
            <strong>You are part of multiple teams for this hackathon.</strong> Your active team will be listed first.
            <br /><br />
            Please coordinate with your teammates to ensure everyone is on the same page.
            <br /><br />
            You should only be on <strong>one team per hackathon</strong> to avoid confusion.
          </Typography>
        </Alert>
      )}

      {sortedTeams.map((team, index) => (
        <Box key={team.id} sx={{ mb: index < sortedTeams.length - 1 ? 4 : 0 }}>
          {/* Team Header */}
          <Card
            elevation={0}
            sx={{
              mb: 3,
              borderRadius: 2,
              bgcolor: "var(--surface-2, #F4F1E9)",
              border: "1px solid var(--line, #E7E1D4)",
              position: "relative",
              overflow: "visible",
            }}
          >
            <CardContent sx={{ pb: 2 }}>
              <Grid container alignItems="center" spacing={2}>
                <Grid>
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
                <Grid size={{ xs: true }}>
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
                      label={statusLabel(team.status)}
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
              {/* Waiting state for teams under review */}
              {team.status === "IN_REVIEW" && (
                <Box
                  sx={{
                    mb: 3,
                    p: 3,
                    borderRadius: 2,
                    bgcolor: "var(--surface-2, #F4F1E9)",
                    border: "1px solid var(--line, #E7E1D4)",
                  }}
                >

                  {/* Fun waiting video */}
                  {selectedVideo && (
                    <Box
                      sx={{
                        width: { xs: "100%", sm: "40%" },
                        mb: 3,
                        borderRadius: 2,
                        overflow: "hidden",
                        border: "1px solid var(--line, #E7E1D4)",
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: "var(--surface-2, #F4F1E9)",
                          px: 2,
                          py: 1,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          borderBottom: "1px solid var(--line, #E7E1D4)",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: "var(--ink, #16181D)" }}
                        >
                          <PendingIcon
                            sx={{
                              verticalAlign: "middle",
                              mr: 0.5,
                              fontSize: "1rem",
                              animation: "spin 3s infinite linear",
                            }}
                          />
                          While you wait…
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
                          px: 2,
                          py: 1,
                          textAlign: "center",
                          bgcolor: "var(--surface-2, #F4F1E9)",
                          borderTop: "1px solid var(--line, #E7E1D4)",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontStyle: "italic", color: "text.secondary" }}
                        >
                          Refresh to see a different animal!
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}
                  >
                    <PendingIcon
                      sx={{
                        color: "var(--brand, #1B3A6B)",
                        mr: 2,
                        fontSize: "2rem",
                        animation: "spin 3s infinite linear",
                      }}
                    />
                    <Box>
                      <Typography
                        variant="h5"
                        sx={{ color: "var(--brand, #1B3A6B)", fontWeight: "bold", mb: 1 }}
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
                      bgcolor: "var(--surface-2, #F4F1E9)",
                      border: "1px solid var(--line, #E7E1D4)",
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
                        <AccessTimeIcon sx={{ color: "var(--brand, #1B3A6B)" }} />
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
                            bgcolor: "var(--brand, #1B3A6B)",
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
                            bgcolor: "var(--brand, #1B3A6B)",
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
                            bgcolor: "var(--brand, #1B3A6B)",
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
                    
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", fontSize: "0.95rem", mt: 1.5 }}
                    >
                      <strong>Use your team channel to:</strong><br />
                      • Chat and coordinate with your teammates throughout the hackathon<br />
                      • Invite mentors who are helping your team to join the channel<br />
                      • Start <MuiLink href="https://slack.com/features/huddles" target="_blank" rel="noopener noreferrer">Slack huddles</MuiLink> for quick voice/video calls as needed<br />
                      • Share code snippets, ideas, and project updates
                    </Typography>
                    
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", fontSize: "0.95rem", mt: 1.5, mb: 1.5 }}
                    >
                      <strong>Channel Guide:</strong><br />
                      • <strong>#{eventId?.replace(/_/g, '-')}</strong> - Open discussions, questions, and team coordination during the hackathon<br />
                      • <strong>#general</strong> - Official announcements, giveaways, and food/meal updates<br />
                      • <strong>#ask-a-mentor</strong> - Get help and guidance from experienced mentors throughout the event
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
                        href={`https://opportunity-hack.slack.com/app_redirect?channel=${eventId?.replace(/_/g, '-')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ ml: 1 }}
                      >
                        Join #{eventId?.replace(/_/g, '-')}
                      </ActionButton>
                      <ActionButton
                        variant="outlined"
                        size="small"
                        href="https://opportunity-hack.slack.com/app_redirect?channel=general"
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ ml: 1 }}
                      >
                        Join #general
                      </ActionButton>
                      <ActionButton
                        variant="outlined"
                        size="small"
                        href="https://opportunity-hack.slack.com/app_redirect?channel=ask-a-mentor"
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ ml: 1 }}
                      >
                        Join #ask-a-mentor
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
                          <MuiLink underline="hover" color="primary">
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

                      {/* Hackathon Context & Guidance */}
                      <Box sx={{ 
                        mt: 2, 
                        p: 2, 
                        bgcolor: 'rgba(46, 125, 50, 0.08)', 
                        borderRadius: 1,
                        border: '1px solid rgba(46, 125, 50, 0.2)'
                      }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1.5, color: '#2E7D32' }}>
                          💡 Building for Your Nonprofit - Key Guidelines
                        </Typography>
                        
                        <Typography variant="body2" paragraph sx={{ mb: 1.5, fontSize: '0.95rem' }}>
                          <strong>Focus on Impact:</strong> You don't need all the details to get started! Focus on building something that clearly solves the nonprofit's core problem. A working solution that addresses 80% of their needs is better than a perfect solution that's incomplete.
                        </Typography>

                        <Typography variant="body2" paragraph sx={{ mb: 1.5, fontSize: '0.95rem' }}>
                          <strong>Research is Your Friend:</strong> Spend 30-60 minutes researching existing solutions in this problem space. Look at what tools, platforms, or approaches already exist - you can often build upon or integrate existing solutions rather than starting from scratch.
                        </Typography>

                        <Typography variant="body2" paragraph sx={{ mb: 1.5, fontSize: '0.95rem' }}>
                          <strong>Don't Reinvent the Wheel:</strong> Use existing tools and services! Don't spend hours building a custom login system when you can use{" "}
                          <MuiLink href="https://auth0.com/" target="_blank" rel="noopener noreferrer">Auth0</MuiLink>,{" "}
                          <MuiLink href="https://www.propelauth.com/" target="_blank" rel="noopener noreferrer">PropelAuth</MuiLink>,{" "}
                          <MuiLink href="https://firebase.google.com/products/auth" target="_blank" rel="noopener noreferrer">Firebase Auth</MuiLink>, or similar services. Focus your limited time on the unique problem-solving aspects of your solution.
                        </Typography>

                        <Typography variant="body2" paragraph sx={{ mb: 1.5, fontSize: '0.95rem' }}>
                          <strong>Smart Assumptions Are OK:</strong> If you're missing specific details about the nonprofit's workflow or preferences, make reasonable assumptions and document them. You can always validate and adjust these assumptions later.
                        </Typography>

                        <Typography variant="body2" paragraph sx={{ mb: 1.5, fontSize: '0.95rem' }}>
                          <strong>MVP Mindset:</strong> Build a Minimum Viable Product that demonstrates the core functionality. A simple, working prototype that solves the main problem will impress{" "}
                          <MuiLink component={Link} href="/about/judges#judging-criteria" target="_blank" rel="noopener noreferrer">judges</MuiLink>{" "}
                          more than a complex solution that's partially implemented.
                        </Typography>

                        <Typography variant="body2" paragraph sx={{ mb: 0, fontSize: '0.95rem' }}>
                          <strong>Real Industry Experience:</strong> Take note of what this feels like - working with people to build a solution under time pressure, making technical decisions, and delivering results. You're gaining experience over a few days that many people get in industry over a year!
                        </Typography>
                      </Box>

                      <Box mt={1.5}>
                        <Button
                          variant="outlined"
                          size="small"
                          component={Link}
                          href={`/nonprofit/${team.selected_nonprofit_id}`}
                        >
                          View Nonprofit Details
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          component="a"
                          href="https://opportunity-hack.slack.com/app_redirect?channel=ask-a-mentor"
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ ml: 1 }}
                        >
                          Ask Mentors for Guidance
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
                          use the official hackathon GitHub repo for the
                          entire event. <strong>Do not create separate repositories</strong> outside of the official event{" "}
                          <MuiLink
                          href={`https://github.com/${event.github_org}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          >
                          GitHub organization
                          </MuiLink>.
                        </Typography>

                        <Typography
                          variant="body2"
                          paragraph
                          sx={{ 
                            color: "text.primary", 
                            fontSize: "1rem",
                            bgcolor: "rgba(255, 193, 7, 0.1)",
                            p: 1.5,
                            borderRadius: 1,
                            border: "1px solid rgba(255, 193, 7, 0.3)"
                          }}
                        >
                          📝 <strong>Code Organization:</strong> Ensure all your final code is in the <strong>main branch</strong> of your repository. Avoid having important code scattered across multiple branches - judges and organizers will only review the main branch for final submissions.
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
                            {team.github_username} should use the repository automatically created for
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
                          {getTeamGitHubLink(team) ? (
                            <ActionButton
                              variant="contained"
                              color="inherit"
                              size="small"
                              href={getTeamGitHubLink(team)}
                              target="_blank"
                              rel="noopener noreferrer"
                              startIcon={<GitHubIcon />}
                              sx={{
                                bgcolor: "#171515",
                                color: "white",
                                "&:hover": { bgcolor: "#2b2b2b" },
                              }}
                            >
                              {getTeamGitHubName(team) || 'View Team Repository'}
                            </ActionButton>
                          ) : (
                            <Alert severity="warning" sx={{ mb: 1.5 }}>
                              <AlertTitle>Repository Not Yet Created</AlertTitle>
                              <Typography variant="body2">
                                Your team's GitHub repository has not been created yet. It will be automatically created by the Opportunity Hack team and linked here once your team is approved. Check back soon!
                              </Typography>
                            </Alert>
                          )}
                          <ActionButton
                            variant="contained"
                            color="primary"
                            size="small"
                            href="https://youtu.be/kHs0jOewVKI"
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<YouTubeIcon />}
                            sx={{ ml: getTeamGitHubLink(team) ? 1 : 0 }}
                          >
                            How to add people to your GitHub Repo
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
                      <>
                        <Typography
                          variant="body1"
                          paragraph
                          sx={{ color: "text.secondary", fontSize: "1.05rem" }}
                        >
                          🔗 <strong>Share Your DevPost Link:</strong> Once you've created your DevPost project page, share the link with us here so we can track your team's submission.
                        </Typography>

                        <Typography
                          variant="body2"
                          paragraph
                          sx={{ 
                            color: "text.primary", 
                            fontSize: "1rem",
                            bgcolor: "rgba(255, 87, 34, 0.1)",
                            p: 1.5,
                            borderRadius: 1,
                            border: "1px solid rgba(255, 87, 34, 0.3)"
                          }}
                        >
                          🎥 <strong>Video Demo Requirements:</strong> Your project demo video must be <strong>4 minutes or less</strong>. Don't wait until the last minute to upload - video processing can take time and you don't want technical issues preventing your submission!
                        </Typography>
                      </>
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
                          href={event?.devpost_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          startIcon={<CodeIcon />}
                        >
                          Hackathon DevPost Site
                        </Button>
                        <Button
                          variant="outlined"
                          size="medium"
                          href="https://youtu.be/rsAAd7LXMDE"
                          target="_blank"
                          rel="noopener noreferrer"
                          startIcon={<YouTubeIcon />}
                        >
                          How to Create a DevPost Project
                        </Button>
                        <Button
                          variant="outlined"
                          size="medium"
                          href="/about/judges#judging-criteria"
                          target="_blank"
                          rel="noopener noreferrer"
                          startIcon={<HelpIcon />}
                        >
                          Judging Criteria
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              {/* Demo Video Section */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <YouTubeIcon fontSize="small" sx={{ mr: 1 }} /> Demo Video
                </Typography>
                <Card
                  variant="outlined"
                  sx={{ borderLeft: "4px solid #c4302b", borderRadius: 1 }}
                >
                  <CardContent>
                    {team.demo_video_url ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CheckIcon sx={{ color: 'success.main', mr: 1 }} />
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          Demo Video Linked
                        </Typography>
                      </Box>
                    ) : (
                      <Typography
                        variant="body1"
                        paragraph
                        sx={{ color: "text.secondary", fontSize: "1.05rem" }}
                      >
                        🎬 <strong>Share Your Demo Video:</strong> Paste a public YouTube (or Vimeo / Loom / Google Drive) link so judges and visitors can watch your demo right from the event page.
                      </Typography>
                    )}

                    <TextField
                      fullWidth
                      label="Demo Video URL"
                      placeholder="https://youtu.be/..."
                      value={demoVideoSubmissions[team.id] ?? team.demo_video_url ?? ''}
                      onChange={(e) => handleDemoVideoInputChange(team.id, e.target.value)}
                      error={
                        !!demoVideoSubmissions[team.id] &&
                        !isValidDemoVideoUrl(demoVideoSubmissions[team.id])
                      }
                      helperText={
                        demoVideoSubmissions[team.id] && !isValidDemoVideoUrl(demoVideoSubmissions[team.id])
                          ? "Enter a YouTube, Vimeo, Loom, or Google Drive URL."
                          : team.demo_video_url && !demoVideoSubmissions[team.id]
                          ? "Your current demo video is shown above."
                          : "Public link only — viewers will not need to sign in."
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <YouTubeIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 2 }}
                    />

                    {(() => {
                      const previewUrl =
                        (demoVideoSubmissions[team.id] && isValidDemoVideoUrl(demoVideoSubmissions[team.id])
                          ? demoVideoSubmissions[team.id]
                          : team.demo_video_url) || null;
                      return previewUrl ? (
                        <Box sx={{ mb: 2, maxWidth: 360 }}>
                          <LiteVideoThumbnail
                            url={previewUrl}
                            label="Preview"
                            onClick={() => window.open(previewUrl, '_blank', 'noopener,noreferrer')}
                          />
                        </Box>
                      ) : null;
                    })()}

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleDemoVideoSubmit(team.id)}
                        disabled={
                          demoVideoLoading[team.id] ||
                          !demoVideoSubmissions[team.id] ||
                          !isValidDemoVideoUrl(demoVideoSubmissions[team.id])
                        }
                        startIcon={demoVideoLoading[team.id] ? <CircularProgress size={16} /> : <SendIcon />}
                      >
                        {demoVideoLoading[team.id] ? 'Saving...' : (team.demo_video_url ? 'Update Video' : 'Save Video')}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>

            </CardContent>
          </Card>

          {/* Quick Action Buttons */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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