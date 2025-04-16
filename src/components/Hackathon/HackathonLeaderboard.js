import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, Grid, Avatar, Chip, Tooltip, 
  Button, Divider, Link, Badge, CircularProgress, Skeleton } from '@mui/material';
import { styled } from '@mui/material/styles';
import CodeIcon from '@mui/icons-material/Code';
import MergeIcon from '@mui/icons-material/Merge';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import GroupIcon from '@mui/icons-material/Group';
import GitHubIcon from '@mui/icons-material/GitHub';
import LaunchIcon from '@mui/icons-material/Launch';
import LinkIcon from '@mui/icons-material/Link';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HistoryIcon from '@mui/icons-material/History';
import UpdateIcon from '@mui/icons-material/Update';
import UpcomingIcon from '@mui/icons-material/Upcoming';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PullRequestIcon from '@mui/icons-material/CallMerge';
import RateReviewIcon from '@mui/icons-material/RateReview';
import WeekendIcon from '@mui/icons-material/Weekend';
import ExploreIcon from '@mui/icons-material/Explore';
import StarIcon from '@mui/icons-material/Star';
import CommitIcon from '@mui/icons-material/CommitRounded';

const LeaderboardContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  height: '100%',
}));

const StatBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  marginBottom: theme.spacing(2),
  transition: 'transform 0.2s, box-shadow 0.2s',
  width: '100%',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[4],
  },
}));

const StatValue = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  fontSize: '1.5rem',
  color: theme.palette.primary.main,
  textAlign: 'center',
  width: '100%',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

const StatLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.8rem',
  color: theme.palette.text.secondary,
  textAlign: 'center',
  width: '100%',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

const AchievementCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  marginBottom: theme.spacing(2),
  boxShadow: theme.shadows[1],
  transition: 'transform 0.2s',
  overflow: 'hidden',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[3],
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
  },
}));

const SectionHeader = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(2),
  paddingBottom: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const OrgBanner = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(3),
  boxShadow: theme.shadows[1],
}));

const LinkButton = styled(Button)(({ theme }) => ({
  marginRight: theme.spacing(1),
  borderRadius: '20px',
}));

const GitHubChip = styled(Chip)(({ theme }) => ({
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const TruncatedText = styled(Typography)(({ theme }) => ({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '100%',
}));

const FlexContent = styled(Box)({
  minWidth: 0,
  overflow: 'hidden',
});

const PlaceholderIllustration = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  margin: theme.spacing(2, 0),
}));

const AnimatedPulse = styled(Box)(({ theme }) => ({
  animation: 'pulse 2s infinite',
  '@keyframes pulse': {
    '0%': {
      opacity: 1,
    },
    '50%': {
      opacity: 0.5,
    },
    '100%': {
      opacity: 1,
    },
  },
}));

const getIconComponent = (iconName, props = {}) => {
  const defaultProps = { fontSize: "small", color: "primary", ...props };

  const iconMap = {
    code: <CodeIcon {...defaultProps} />,
    commit: <CommitIcon {...defaultProps} />,
    merge: <MergeIcon {...defaultProps} />,
    pull_request: <PullRequestIcon {...defaultProps} />,
    github: <GitHubIcon {...defaultProps} />,
    accessTime: <AccessTimeIcon {...defaultProps} />,
    history: <HistoryIcon {...defaultProps} />,
    weekend: <WeekendIcon {...defaultProps} />,
    task_alt: <TaskAltIcon {...defaultProps} />,
    rate_review: <RateReviewIcon {...defaultProps} />,
    integration_instructions: <IntegrationInstructionsIcon {...defaultProps} />,
    trophy: <EmojiEventsIcon {...defaultProps} />,
    explore: <ExploreIcon {...defaultProps} />,
    launch: <LaunchIcon {...defaultProps} />,
    link: <LinkIcon {...defaultProps} />
  };

  if (iconMap[iconName]) {
    return iconMap[iconName];
  }

  if (iconName.includes('commit') || iconName.includes('code')) {
    return <CodeIcon {...defaultProps} />;
  } else if (iconName.includes('merge') || iconName.includes('pr') || iconName.includes('pull')) {
    return <MergeIcon {...defaultProps} />;
  } else if (iconName.includes('time') || iconName.includes('hour') || iconName.includes('day')) {
    return <AccessTimeIcon {...defaultProps} />;
  } else if (iconName.includes('task') || iconName.includes('issue')) {
    return <TaskAltIcon {...defaultProps} />;
  } else if (iconName.includes('review') || iconName.includes('comment')) {
    return <RateReviewIcon {...defaultProps} />;
  }

  console.warn(`No icon found for name: ${iconName}, using default.`);
  return <StarIcon {...defaultProps} />;
};

const renderIcon = (icon, props = {}) => {
  if (!icon) return null;

  if (React.isValidElement(icon)) {
    return React.cloneElement(icon, props);
  }

  return getIconComponent(icon, props);
};

const HackathonLeaderboard = ({ 
  initialGeneralStats,
  initialIndividualAchievements,
  initialTeamAchievements,
  githubOrg,
  eventName,
  eventId,
  startDate,
  endDate
}) => {
  const [generalStats, setGeneralStats] = useState(initialGeneralStats || []);
  const [individualAchievements, setIndividualAchievements] = useState(initialIndividualAchievements || []);
  const [teamAchievements, setTeamAchievements] = useState(initialTeamAchievements || []);
  const [orgName, setOrgName] = useState(githubOrg || '');
  const [hackathonName, setHackathonName] = useState(eventName || '');
  const [loading, setLoading] = useState(!initialGeneralStats);
  const [error, setError] = useState(null);
  const [loadingAttempted, setLoadingAttempted] = useState(false);

  const now = new Date();
  const eventStartDate = startDate ? new Date(startDate) : null;
  const eventEndDate = endDate ? new Date(endDate) : null;

  const eventStatus = React.useMemo(() => {
    if (!eventStartDate || !eventEndDate) return 'unknown';
    if (now < eventStartDate) return 'upcoming';
    if (now > eventEndDate) return 'past';
    return 'ongoing';
  }, [eventStartDate, eventEndDate, now]);

  const daysSinceEnd = eventEndDate ? Math.floor((now - eventEndDate) / (1000 * 60 * 60 * 24)) : null;
  const daysUntilStart = eventStartDate ? Math.floor((eventStartDate - now) / (1000 * 60 * 60 * 24)) : null;

  useEffect(() => {
    if ((!initialGeneralStats || !initialIndividualAchievements || !initialTeamAchievements) && eventId) {
      fetchLeaderboardData();
    }
  }, [eventId]);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/leaderboard/${eventId}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard data: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Fetched leaderboard data:', data);

      setGeneralStats(data.generalStats || []);
      setIndividualAchievements(data.individualAchievements || []);
      setTeamAchievements(data.teamAchievements || []);
      setOrgName(data.githubOrg || '');
      setHackathonName(data.eventName || '');

    } catch (err) {
      console.error('Error fetching leaderboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingAttempted(true);
    }
  };

  const getGitHubOrgUrl = () => `https://github.com/${orgName}`;
  
  const getGitHubRepoUrl = (repo) => {
    if (!repo || !orgName) return null;
    if (repo.includes(orgName)) {
      return `https://github.com/${repo}`;
    }
    return `https://github.com/${orgName}/${repo}`;
  };
  
  const getGitHubUserUrl = (username) => {
    if (!username) return null;
    return `https://github.com/${username}`;
  };
  
  const getGitHubPrUrl = (repo, prNumber) => {
    if (!prNumber || !repo) return null;
    const repoUrl = getGitHubRepoUrl(repo);
    if (repoUrl) {
      return `${repoUrl}/pull/${prNumber}`;
    }
    return null;
  };
  
  const getGitHubCommitUrl = (repo, commitId) => {
    if (!commitId || !repo) return null;
    const repoUrl = getGitHubRepoUrl(repo);
    if (repoUrl) {
      return `${repoUrl}/commit/${commitId}`;
    }
    return null;
  };
  
  const getGitHubTeamUrl = (team) => {
    if (!team || !orgName) return null;
    return `https://github.com/orgs/${orgName}/teams/${team}`;
  };

  const renderContextualPlaceholder = () => {
    if (loading) {
      return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={6}>
          <CircularProgress size={48} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2, fontWeight: 'medium' }}>
            Loading GitHub statistics...
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Fetching the latest development activity
          </Typography>
        </Box>
      );
    }

    if (error || (!loading && loadingAttempted && !generalStats.length)) {
      if (eventStatus === 'upcoming') {
        return (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={4}>
            <UpcomingIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" align="center" gutterBottom>
              Leaderboard Coming Soon
            </Typography>
            <Typography variant="body1" align="center" color="textSecondary">
              {daysUntilStart === 1 
                ? "This event starts tomorrow!" 
                : `This event starts in ${daysUntilStart} days.`
              }
            </Typography>
            <Typography variant="body2" align="center" color="textSecondary" sx={{ mt: 1, mb: 3, maxWidth: 450 }}>
              Once the hackathon begins, this leaderboard will display real-time statistics and achievements from GitHub.
            </Typography>
            <Box width="100%" mt={2}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ pl: 1 }}>
                Preview of stats to come:
              </Typography>
              <Grid container spacing={2} sx={{ px: 1 }}>
                {['Commits', 'Pull Requests', 'Hours Coded'].map((stat, idx) => (
                  <Grid item xs={4} key={idx}>
                    <Skeleton variant="rounded" height={80} animation="wave" />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        );
      }
      
      if (eventStatus === 'past') {
        return (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={4}>
            <HistoryIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" align="center" gutterBottom>
              Event Completed
            </Typography>
            <Typography variant="body1" align="center" color="textSecondary">
              {daysSinceEnd === 0 
                ? "This event ended today!" 
                : daysSinceEnd === 1 
                  ? "This event ended yesterday."
                  : `This event ended ${daysSinceEnd} days ago.`
              }
            </Typography>
            <Typography variant="body2" align="center" color="textSecondary" sx={{ mt: 1, maxWidth: 450 }}>
              {daysSinceEnd && daysSinceEnd > 90 
                ? "Leaderboard data for older events may no longer be available."
                : "The hackathon leaderboard data is currently unavailable."
              }
            </Typography>
            <Box sx={{ mt: 3, width: '100%', px: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                <EmojiEventsIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'text-bottom' }}/>
                Hackathon Highlights:
              </Typography>
              <Box sx={{ 
                p: 2, 
                bgcolor: 'background.paper', 
                borderRadius: 1,
                border: '1px dashed',
                borderColor: 'divider'
              }}>
                <Typography variant="body2" paragraph>
                  Teams built innovative solutions for nonprofits during this hackathon.
                  {githubOrg && (
                    <>
                      {" "}Check out the{" "}
                      <Link href={getGitHubOrgUrl()} target="_blank" rel="noopener">
                        project repositories
                      </Link>{" "}
                      to see their work.
                    </>
                  )}
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  startIcon={<GitHubIcon />}
                  href={getGitHubOrgUrl()}
                  disabled={!githubOrg}
                  target="_blank"
                  rel="noopener"
                >
                  View Projects on GitHub
                </Button>
              </Box>
            </Box>
          </Box>
        );
      }
      
      return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={4}>
          <UpdateIcon sx={{ fontSize: 60, color: 'info.main', mb: 2 }} />
          <Typography variant="h6" align="center" gutterBottom>
            Collecting Development Stats
          </Typography>
          <Typography variant="body1" align="center" color="textSecondary">
            The leaderboard is being prepared.
          </Typography>
          <Typography variant="body2" align="center" color="textSecondary" sx={{ mt: 1, mb: 3, maxWidth: 450 }}>
            GitHub statistics will appear here as teams begin coding. Check back soon for live updates!
          </Typography>
          <AnimatedPulse sx={{ width: '100%' }}>
            <Grid container spacing={2} sx={{ px: 2 }}>
              {['GitHub Commits', 'Pull Requests', 'Lines of Code'].map((stat, idx) => (
                <Grid item xs={4} key={idx}>
                  <Box sx={{ 
                    bgcolor: 'background.paper', 
                    p: 2, 
                    borderRadius: 1,
                    boxShadow: 1,
                    height: 80,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <Typography variant="body2" color="textSecondary" align="center">{stat}</Typography>
                    <Typography variant="h6" align="center" sx={{ opacity: 0.5 }}>—</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </AnimatedPulse>
          <Box sx={{ mt: 3 }}>
            <Button 
              variant="text"
              onClick={fetchLeaderboardData}
              startIcon={<UpdateIcon />}
            >
              Refresh Data
            </Button>
          </Box>
        </Box>
      );
    }

    return null;
  };

  const contextualPlaceholder = renderContextualPlaceholder();
  if (contextualPlaceholder) {
    return (
      <LeaderboardContainer elevation={2} id="leaderboard">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Hackathon Leaderboard
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Development statistics and achievements
            </Typography>
          </Box>
        </Box>
        {contextualPlaceholder}
      </LeaderboardContainer>
    );
  }

  return (
    <LeaderboardContainer elevation={2} id="leaderboard">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Hackathon Leaderboard
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Live statistics and achievements from ongoing development
          </Typography>
        </Box>
      </Box>
      <OrgBanner sx={{ flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
        <GitHubIcon fontSize="large" sx={{ mr: 2, flexShrink: 0 }} />
        <FlexContent flexGrow={1} sx={{ mb: { xs: 2, md: 0 } }}>
          <TruncatedText variant="h6" fontWeight="bold" title={hackathonName}>
            {hackathonName}
          </TruncatedText>
          <TruncatedText variant="body2" color="textSecondary">
            All projects and contributions are hosted on GitHub
          </TruncatedText>
        </FlexContent>
        <Box sx={{ 
          flexShrink: 0, 
          width: { xs: '100%', md: 'auto' } 
        }}>
          <LinkButton 
            variant="contained" 
            startIcon={<LaunchIcon />}
            href={getGitHubOrgUrl()}
            target="_blank"
            rel="noopener noreferrer"
            color="primary"
            fullWidth={window.innerWidth < 600}
            disabled={!orgName}
          >
            View GitHub Organization
          </LinkButton>
        </Box>
      </OrgBanner>
      <SectionHeader variant="h6">General Statistics</SectionHeader>
      <Grid container spacing={2}>
        {generalStats && generalStats.map((stat, index) => (
          <Grid 
            item 
            xs={6} 
            sm={4} 
            md={index < 3 ? 4 : 6} 
            key={index}
            sx={{
              order: { 
                xs: index,
                md: index < 3 ? 0 : 1 
              }
            }}
          >
            <Tooltip 
              title={
                <Box>
                  <Typography variant="subtitle2">{stat.stat}</Typography>
                  <Typography variant="body2">{stat.description}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>
                    Value: {stat.value.toLocaleString()}
                  </Typography>
                </Box>
              } 
              arrow 
              placement="top"
            >
              <StatBox sx={{
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: { md: 'flex-start' },
                alignItems: { xs: 'center', md: 'center' },
                height: '100%',
                px: { xs: 1, md: 2 },
                py: { xs: 1.5, md: 1.5 }
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  mr: { md: 2 },
                  mb: { xs: 1, md: 0 }
                }}>
                  {renderIcon(stat.icon, { fontSize: "large" })}
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', md: 'column' },
                  alignItems: { xs: 'center', md: 'flex-start' },
                  justifyContent: 'center',
                  width: '100%'
                }}>
                  <StatValue 
                    variant="h4" 
                    sx={{ 
                      fontSize: { xs: '1.3rem', md: '1.3rem' },
                      textAlign: { xs: 'center', md: 'left' },
                      lineHeight: 1.2
                    }}
                  >
                    {stat.value.toLocaleString()}
                  </StatValue>
                  <StatLabel 
                    variant="subtitle2" 
                    title={stat.stat}
                    sx={{ 
                      mt: { xs: 0.2, md: 0.2 },
                      textAlign: { xs: 'center', md: 'left' },
                      maxWidth: '100%',
                      lineHeight: 1.2,
                      fontSize: '0.75rem'
                    }}
                  >
                    {stat.stat}
                  </StatLabel>
                </Box>
              </StatBox>
            </Tooltip>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ display: { xs: 'block', sm: 'none', md: 'block' } }}>
        <SectionHeader variant="h6">Individual Achievements</SectionHeader>
        <Grid container spacing={2}>
          {individualAchievements && individualAchievements.map((achievement, index) => {
            const hasUserProfile = achievement.person?.githubUsername;
            const hasRepo = achievement.repo;
            const hasPrLink = hasRepo && achievement.prNumber;
            const hasCommitLink = hasRepo && achievement.commitId;
            
            return (
              <Grid item xs={12} md={12} key={index}>
                <AchievementCard 
                  sx={{ 
                    flexDirection: { xs: 'row', md: 'row' }, 
                    cursor: hasRepo ? 'pointer' : 'default',
                    position: 'relative',
                    '&:hover': {
                      transform: hasRepo ? 'scale(1.02)' : 'none',
                      boxShadow: hasRepo ? 3 : 1,
                    },
                  }}
                  component={hasRepo ? Link : Box}
                  href={hasRepo ? getGitHubRepoUrl(achievement.repo) : undefined}
                  target={hasRepo ? "_blank" : undefined}
                  rel={hasRepo ? "noopener" : undefined}
                  underline="none"
                  onClick={(e) => {
                    if (hasPrLink) {
                      e.preventDefault();
                      window.open(getGitHubPrUrl(achievement.repo, achievement.prNumber), '_blank');
                    } else if (hasCommitLink) {
                      e.preventDefault();
                      window.open(getGitHubCommitUrl(achievement.repo, achievement.commitId), '_blank');
                    }
                  }}
                >
                  <Tooltip title={`View ${achievement.person.name}'s GitHub profile`}>
                    <Avatar 
                      src={achievement.person.avatar} 
                      alt={achievement.person.name} 
                      sx={{ 
                        width: { xs: 40, md: 48 }, 
                        height: { xs: 40, md: 48 }, 
                        mr: { xs: 1.5, md: 2 },
                        cursor: hasUserProfile ? 'pointer' : 'default',
                        flexShrink: 0,
                        zIndex: 2
                      }}
                      component={hasUserProfile ? Link : 'div'}
                      href={hasUserProfile ? getGitHubUserUrl(achievement.person.githubUsername) : undefined}
                      target="_blank"
                      rel="noopener"
                      onClick={(e) => {
                        if (hasUserProfile) {
                          e.stopPropagation();
                        }
                      }}
                    />
                  </Tooltip>
                  
                  <FlexContent flexGrow={1}>
                    <Box display="flex" alignItems="center">
                      <TruncatedText 
                        variant="subtitle1" 
                        fontWeight="bold" 
                        title={achievement.title}
                        sx={{ fontSize: { xs: '0.95rem', md: '1rem' } }}
                      >
                        {achievement.title}
                      </TruncatedText>
                      
                      {achievement.icon && (
                        <Box component="span" ml={1} display="inline-flex" flexShrink={0}>
                          {renderIcon(achievement.icon, { color: "primary" })}
                        </Box>
                      )}
                      
                      {(hasPrLink || hasCommitLink) && (
                        <Tooltip 
                          title={hasPrLink 
                            ? `View pull request #${achievement.prNumber}` 
                            : `View commit ${achievement.commitId?.substring(0, 7)}`}
                        >
                          <LinkIcon 
                            fontSize="small" 
                            color="action" 
                            sx={{ ml: 1, opacity: 0.7 }}
                          />
                        </Tooltip>
                      )}
                    </Box>
                    
                    <Box display="flex" alignItems="center">
                      <TruncatedText 
                        variant="body2" 
                        color="textSecondary" 
                        title={`${achievement.person.name} • ${achievement.person.team}`}
                        sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' }, mr: 1 }}
                      >
                        {achievement.person.name} • {achievement.person.team}
                      </TruncatedText>
                      
                      {hasRepo && (
                        <Tooltip title={`View repository: ${achievement.repo}`}>
                          <Chip
                            icon={<GitHubIcon fontSize="small" />}
                            label={(() => {
                              const repoName = achievement.repo.split('/').pop() || achievement.repo.split('-').pop();
                              return repoName.length > 30 ? repoName.substring(0, 30) + '...' : repoName;
                            })()}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              height: 20, 
                              '& .MuiChip-label': { px: 1, fontSize: '0.7rem', maxWidth: '50px', overflow: 'hidden', textOverflow: 'ellipsis' },
                              '& .MuiChip-icon': { fontSize: '0.85rem', ml: 0.5 },
                              zIndex: 2
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(getGitHubRepoUrl(achievement.repo), '_blank');
                            }}
                          />
                        </Tooltip>
                      )}
                    </Box>
                  </FlexContent>
                  
                  <Box sx={{ 
                    ml: { xs: 0.5, md: 1 }, 
                    flexShrink: 0, 
                    minWidth: { xs: '70px', md: '90px' }, 
                    textAlign: 'right'
                  }}>
                    <Typography 
                      variant="h6" 
                      fontWeight="bold" 
                      color="primary" 
                      noWrap
                      sx={{ fontSize: { xs: '1rem', md: '1.15rem' } }}
                    >
                      {achievement.value}
                    </Typography>
                  </Box>
                </AchievementCard>
              </Grid>
            );
          })}
          
          {(!individualAchievements || individualAchievements.length === 0) && (
            <Grid item xs={12}>
              <Box p={3} textAlign="center" bgcolor="background.paper" borderRadius={1}>
                <Typography color="textSecondary">No individual achievements to display</Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
      <Box sx={{ display: { xs: 'block', sm: 'none', md: 'block' } }}>
        <SectionHeader variant="h6">Team Achievements</SectionHeader>
        <Grid container spacing={2}>
          {teamAchievements && teamAchievements.map((achievement, index) => {
            const hasTeamPage = achievement.teamPage;
            const hasRepo = achievement.repo;
            
            return (
              <Grid item xs={12} md={12} key={index}>
                <AchievementCard 
                  sx={{ 
                    flexDirection: 'row', 
                    p: { xs: 1.5, md: 2 }, 
                    alignItems: 'center',
                    cursor: hasRepo || hasTeamPage ? 'pointer' : 'default',
                    '&:hover': {
                      transform: hasRepo || hasTeamPage ? 'scale(1.02)' : 'none',
                      boxShadow: hasRepo || hasTeamPage ? 3 : 1,
                    },
                  }}
                  component={hasRepo || hasTeamPage ? Link : Box}
                  href={hasRepo ? getGitHubRepoUrl(achievement.repo) : 
                        hasTeamPage ? getGitHubTeamUrl(achievement.teamPage) : undefined}
                  target={hasRepo || hasTeamPage ? "_blank" : undefined}
                  rel="noopener"
                  underline="none"
                >
                  <StyledBadge 
                    badgeContent={achievement.members} 
                    color="primary" 
                    overlap="circular"
                    sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem', height: '18px', minWidth: '18px' } }}
                  >
                    <Avatar 
                      sx={{ 
                        width: { xs: 40, md: 48 }, 
                        height: { xs: 40, md: 48 }, 
                        mr: { xs: 1.5, md: 2 }, 
                        bgcolor: index % 2 === 0 ? 'primary.main' : 'secondary.main',
                        flexShrink: 0
                      }}
                    >
                      {renderIcon(achievement.icon, { color: "inherit" })}
                    </Avatar>
                  </StyledBadge>
                  
                  <FlexContent flexGrow={1}>
                    <Box display="flex" alignItems="center" flexWrap="wrap">
                      <TruncatedText 
                        variant="subtitle1" 
                        fontWeight="bold" 
                        title={achievement.title}
                        sx={{ mr: 1, fontSize: { xs: '0.95rem', md: '1rem' } }}
                      >
                        {achievement.title}
                      </TruncatedText>
                    </Box>
                    
                    <Box display="flex" alignItems="center">
                      <TruncatedText 
                        variant="body2" 
                        color="textSecondary"
                        title={`${achievement.team} • ${achievement.members} members`}
                        sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' }, mr: 1 }}
                      >
                        {achievement.team} • {achievement.members} members
                      </TruncatedText>
                      
                      {hasRepo && (
                        <Tooltip title={`View repository: ${achievement.repo}`}>
                          <Chip
                            icon={<GitHubIcon fontSize="small" />}
                            label={achievement.repo.split('/').pop() || achievement.repo.split('-').pop()}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              height: 20, 
                              '& .MuiChip-label': { px: 1, fontSize: '0.7rem' },
                              '& .MuiChip-icon': { fontSize: '0.85rem', ml: 0.5 },
                              zIndex: 2
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(getGitHubRepoUrl(achievement.repo), '_blank');
                            }}
                          />
                        </Tooltip>
                      )}
                    </Box>
                  </FlexContent>
                  
                  <Box sx={{ 
                    ml: { xs: 0.5, md: 1 }, 
                    flexShrink: 0, 
                    minWidth: { xs: '70px', md: '90px' }, 
                    textAlign: 'right' 
                  }}>
                    <Typography 
                      variant="h6" 
                      fontWeight="bold" 
                      color="primary" 
                      noWrap
                      sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}
                    >
                      {achievement.value}
                    </Typography>
                  </Box>
                </AchievementCard>
              </Grid>
            );
          })}
          {(!teamAchievements || teamAchievements.length === 0) && (
            <Grid item xs={12}>
              <Box p={3} textAlign="center" bgcolor="background.paper" borderRadius={1}>
                <Typography color="textSecondary">No team achievements to display</Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
      <Box textAlign="center" mt={4} pt={1} borderTop={1} borderColor="divider">
        <Button
          variant="outlined"
          startIcon={<GitHubIcon />}
          href={getGitHubOrgUrl()}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ borderRadius: 4 }}
          disabled={!orgName}
        >
          View All Projects on GitHub
        </Button>
        <TruncatedText variant="caption" display="block" color="textSecondary" mt={1}>
          Data sourced from the {orgName} GitHub organization
        </TruncatedText>
      </Box>
    </LeaderboardContainer>
  );
};

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  React.useEffect(() => {
    const handleError = (error) => {
      console.error("LeaderboardError:", error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
        <Typography variant="h5" color="error" gutterBottom>
          Error Loading Leaderboard
        </Typography>
        <Typography variant="body2">
          There was a problem loading the leaderboard data. Please check the console for more details.
        </Typography>
      </Paper>
    );
  }

  return children;
};

const HackathonLeaderboardWithErrorBoundary = (props) => (
  <ErrorBoundary>
    <HackathonLeaderboard {...props} />
  </ErrorBoundary>
);

HackathonLeaderboardWithErrorBoundary.displayName = 'HackathonLeaderboardWithErrorBoundary';

export default HackathonLeaderboardWithErrorBoundary;