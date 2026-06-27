import React, { useState, useEffect, useCallback, useRef } from "react";
import NextLink from "next/link";
import {
  Typography,
  Card,
  CardContent,
  Avatar,
  Grid,
  Link,
  CircularProgress,
  Button,
  Snackbar,
  Box,
  Tooltip,
  IconButton,
  Chip,
  Divider,
  Badge,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Alert as MuiAlertComponent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  FaGithub,
  FaCalendarAlt,
  FaUser,
  FaHeart,
  FaCodeBranch,
  FaExclamationCircle,
  FaCheckCircle,
  FaCode,
  FaGitAlt,
  FaExternalLinkAlt,
  FaClock,
  FaUserFriends,
  FaHandshake,
  FaUsers,
  FaShieldAlt,
  FaTimes,
} from 'react-icons/fa';
import { useAuthInfo } from "@propelauth/react";
import MuiAlert from "@mui/material/Alert";
import { formatDistanceToNow, parseISO } from 'date-fns';
import { TEAM_STATUS_OPTIONS, getStatusOption, isJoiningDisabled } from '../../constants/teamStatus';
import { isHackathonExpired } from '../../lib/dateUtils';
import LiteVideoThumbnail from '../VideoDisplay/LiteVideoThumbnail';
import VideoDisplay from '../VideoDisplay/VideoDisplay';
import {
  MENTOR_COVERAGE_TOTAL,
  coverageDoneCount,
  JUDGING_CRITERIA,
  SCORE_META,
  latestRatingsByMentor,
  consensusForCriterion,
  relativeTime as mentorRelativeTime,
} from '../Teams/mentorCoverage';
import FlagIcon from '@mui/icons-material/Flag';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import GavelIcon from '@mui/icons-material/Gavel';

// Map MUI palette color names to a hex so the dots paint reliably without
// having to pass the whole theme down. Mirrors SCORE_META.color.
const SCORE_DOT_COLORS = {
  green: '#2e7d32',   // success.main
  yellow: '#ed6c02',  // warning.main
  red: '#d32f2f',     // error.main
};

/**
 * 5-dot judging-readiness strip. One dot per criterion, painted by team
 * consensus (worst rating across mentors). Empty dots when nobody's rated.
 * Renders nothing if no criterion has any rating.
 */
const JudgingReadinessStrip = ({ team }) => {
  const ratingsByMentor = latestRatingsByMentor(team?.mentor_ratings);
  const hasAnyRating = Object.values(ratingsByMentor).some(
    (perMentor) => perMentor && Object.keys(perMentor).length > 0
  );
  if (!hasAnyRating) return null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5, flexWrap: 'wrap' }}>
      <GavelIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
        Judging readiness
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
        {JUDGING_CRITERIA.map((c) => {
          const consensus = consensusForCriterion(ratingsByMentor[c.slug]);
          const dotColor = consensus ? SCORE_DOT_COLORS[consensus] : 'transparent';
          const label = consensus
            ? `${c.label}: ${SCORE_META[consensus].emoji} ${SCORE_META[consensus].label}`
            : `${c.label}: not rated yet`;
          return (
            <Tooltip key={c.slug} title={label} placement="top" arrow>
              <Box
                aria-label={label}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: dotColor,
                  border: 1,
                  borderColor: consensus ? dotColor : 'divider',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 8,
                  color: '#fff',
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {c.label[0]}
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
};

/**
 * Compact at-a-glance mentor-support summary for the team list cards on
 * /hack/<event_id>. Mirrors the per-team MentorTeamPanel's header pills but
 * stays small. Renders nothing if a team has no mentor activity yet.
 */
const MentorSupportSummary = ({ team, eventId }) => {
  const checklist = team?.mentor_checklist || {};
  const doneCount = coverageDoneCount(checklist);
  const openFlags = Number(team?.mentor_open_flag_count || 0);
  const lastTouchedAt = team?.mentor_last_touched_at;
  const lastTouchedBy = team?.mentor_last_touched_by_name;
  const hasAnyRating = Array.isArray(team?.mentor_ratings) && team.mentor_ratings.length > 0;

  // Hide entirely if there's no mentor activity to report.
  if (!doneCount && !openFlags && !lastTouchedAt && !hasAnyRating) return null;

  const coverageColor =
    doneCount === MENTOR_COVERAGE_TOTAL ? 'success' : doneCount > 0 ? 'primary' : 'default';

  return (
    <Box
      sx={{
        mb: 1,
        p: 1,
        borderRadius: 1,
        backgroundColor: openFlags > 0 ? 'rgba(255,167,38,0.10)' : 'rgba(33,150,243,0.06)',
        border: 1,
        borderColor: openFlags > 0 ? 'warning.light' : 'divider',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
        <EmojiPeopleIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          Mentor support
        </Typography>
        {eventId && team?.id && (
          <Link
            component={NextLink}
            href={`/hack/${eventId}/team/${team.id}/mentor`}
            variant="caption"
            sx={{ ml: 'auto' }}
          >
            Mentor details →
          </Link>
        )}
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
        <Chip
          size="small"
          color={coverageColor}
          label={`${doneCount}/${MENTOR_COVERAGE_TOTAL} covered`}
          sx={{ fontWeight: 600, height: 22 }}
        />
        {openFlags > 0 && (
          <Chip
            size="small"
            color="warning"
            icon={<FlagIcon sx={{ fontSize: 14 }} />}
            label={`${openFlags} open flag${openFlags === 1 ? '' : 's'}`}
            sx={{ height: 22 }}
          />
        )}
        {lastTouchedAt && (
          <Chip
            size="small"
            variant="outlined"
            icon={<ScheduleIcon sx={{ fontSize: 14 }} />}
            label={
              lastTouchedBy
                ? `${mentorRelativeTime(lastTouchedAt)} · ${lastTouchedBy}`
                : mentorRelativeTime(lastTouchedAt)
            }
            sx={{ height: 22 }}
          />
        )}
      </Box>
      <JudgingReadinessStrip team={team} />
    </Box>
  );
};

// Helper function to check if team status prevents joining
const isJoiningDisabledByStatus = (status) => {
  return isJoiningDisabled(status);
};

// Reusable Alert component
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// Loading component - extracted for reuse
const LoadingIndicator = ({ message }) => (
  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
    <CircularProgress />
    <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
      {message}
    </Typography>
  </Box>
);

// Utility function to render team status chip
const renderStatusChip = (status) => {
  const statusOption = TEAM_STATUS_OPTIONS.find((opt) => opt.value === status) || TEAM_STATUS_OPTIONS[0];
  return (
    <Chip
      label={statusOption.label}
      color={statusOption.color}
      size="small"
      variant={statusOption.color === "default" ? "outlined" : "filled"}
      sx={{ ml: 1 }}
    />
  );
};

// Utility function to format date
const formatCreatedDate = (dateString) => {
  if (!dateString) return 'Unknown';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch (error) {
    return 'Unknown';
  }
};

// Helper function to extract org and repo from GitHub URL
const parseGithubUrl = (url) => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(part => part);
    if (pathParts.length >= 2) {
      return {
        org: pathParts[0],
        repo: pathParts[1]
      };
    }
  } catch (error) {
    console.error('Invalid GitHub URL:', url, error);
  }
  return null;
};

// Team Join Confirmation Modal Component
const TeamJoinConfirmationModal = ({ open, onClose, onConfirm, teamName, loading }) => {
  const [confirmations, setConfirmations] = useState({
    knowTeamMember: false,
    notMentor: false,
    understands: false,
  });

  const handleCheckboxChange = (field) => (event) => {
    setConfirmations(prev => ({
      ...prev,
      [field]: event.target.checked
    }));
  };

  const allConfirmed = Object.values(confirmations).every(Boolean);

  const handleConfirm = () => {
    if (allConfirmed) {
      onConfirm();
      // Reset confirmations for next time
      setConfirmations({
        knowTeamMember: false,
        notMentor: false,
        understands: false,
      });
    }
  };

  const handleClose = () => {
    onClose();
    // Reset confirmations when closing
    setConfirmations({
      knowTeamMember: false,
      notMentor: false,
      understands: false,
    });
  };

  const checklistItems = [
    {
      key: 'knowTeamMember',
      icon: <FaHandshake style={{ color: '#2e7d32', fontSize: '20px' }} />,
      title: 'I know someone on this team',
      description: 'Connect with existing members or come with friends for the best experience, don\'t join random teams',
      color: '#2e7d32'
    },
    {
      key: 'notMentor',
      icon: <FaShieldAlt style={{ color: '#1976d2', fontSize: '20px' }} />,
      title: 'I\'m participating as a hacker',
      description: 'Mentors can help multiple teams, may not be available for the entire hackathon, and shouldn\'t join individual teams',
      color: '#1976d2'
    },
    {
      key: 'understands',
      icon: <FaUsers style={{ color: '#9c27b0', fontSize: '20px' }} />,
      title: 'I\'m ready to collaborate',
      description: 'I\'ll contribute actively throughout the hackathon making something great for nonprofits and the community',
      color: '#9c27b0'
    }
  ];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
        }
      }}
    >
      {/* Header with gradient background */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 3,
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1,
          }}
        >
          <Box
            sx={{
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              p: 1.5,
              mr: 2,
            }}
          >
            <FaUserFriends style={{ fontSize: '24px' }} />
          </Box>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
            Ready to join {teamName}?
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Let's make sure you're all set for an awesome collaboration! 🚀
        </Typography>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {/* Quick checklist */}
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', color: 'text.primary' }}>
            Quick Team Guidelines
          </Typography>

          <Grid container spacing={2}>
            {checklistItems.map((item) => (
              <Grid size={{ xs: 12, sm: 4 }} key={item.key}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    border: confirmations[item.key] ? `2px solid ${item.color}` : '2px solid transparent',
                    background: confirmations[item.key] 
                      ? `linear-gradient(135deg, ${item.color}08, ${item.color}15)` 
                      : 'white',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3,
                    }
                  }}
                  onClick={() => handleCheckboxChange(item.key)({ target: { checked: !confirmations[item.key] } })}
                >
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Box sx={{ mb: 2 }}>
                      {item.icon}
                    </Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={confirmations[item.key]}
                          onChange={handleCheckboxChange(item.key)}
                          sx={{ 
                            color: item.color,
                            '&.Mui-checked': { color: item.color }
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      }
                      label={
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          {item.title}
                        </Typography>
                      }
                      sx={{ 
                        flexDirection: 'column',
                        alignItems: 'center',
                        m: 0,
                        '& .MuiFormControlLabel-label': { mt: 1 }
                      }}
                    />
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: '12px', lineHeight: 1.4 }}
                    >
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Progress indicator */}
          <Box sx={{ mt: 3, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Progress: {Object.values(confirmations).filter(Boolean).length}/3
              </Typography>
              <Box sx={{ flexGrow: 1, mx: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={(Object.values(confirmations).filter(Boolean).length / 3) * 100}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #667eea, #764ba2)',
                      borderRadius: 3,
                    }
                  }}
                />
              </Box>
              {allConfirmed && <FaCheckCircle style={{ color: '#4caf50', fontSize: '18px' }} />}
            </Box>
          </Box>

          {/* Encouragement message */}
          {allConfirmed ? (
            <MuiAlertComponent 
              severity="success" 
              sx={{ 
                mt: 2,
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  fontSize: '20px'
                }
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Perfect! 🎉 You're all set to join the team and start building something amazing together.
              </Typography>
            </MuiAlertComponent>
          ) : (
            <MuiAlertComponent 
              severity="info" 
              sx={{ 
                mt: 2,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #e3f2fd, #f3e5f5)',
                border: 'none'
              }}
            >
              <Typography variant="body1">
                Almost there! Just confirm the items above to join your new team. 
              </Typography>
            </MuiAlertComponent>
          )}
        </Box>
      </DialogContent>

      <DialogActions 
        sx={{ 
          px: 3, 
          pb: 3, 
          pt: 0,
          background: 'linear-gradient(to right, #fafafa, #f5f5f5)',
          gap: 2
        }}
      >
        <Button
          onClick={handleClose}
          disabled={loading}
          variant="outlined"
          color="inherit"
          size="large"
          sx={{ 
            minWidth: 100,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Maybe Later
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!allConfirmed || loading}
          variant="contained"
          size="large"
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <FaUserFriends />}
          sx={{
            minWidth: 140,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            background: allConfirmed 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
              : undefined,
            opacity: !allConfirmed ? 0.6 : 1,
            transform: allConfirmed ? 'scale(1.02)' : 'scale(1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: allConfirmed 
                ? 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)' 
                : undefined,
              transform: allConfirmed ? 'scale(1.05)' : 'scale(1)',
            }
          }}
        >
          {loading ? 'Joining Team...' : 'Join Team! 🚀'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Enhanced TeamMember component with GitHub stats integration
const TeamMemberWithStats = ({ user, isCurrentUser, githubStats, onCopyGithubUsername }) => {
  if (!user) return null;
  
  // Handle both profile objects and user ID strings
  const userId = typeof user === 'string' ? user : user.user_id || user.id;
  const displayName = user.name || user.nickname || '';
  const githubUsername = user.github || user.github_username;
  
  // Extract just the username if a full GitHub URL was provided
  const cleanGithubUsername = githubUsername ? githubUsername.replace(/^https?:\/\/(www\.)?github\.com\//, '') : null;
  const profileUrl = `/profile/${userId}`;
  const firstLetter = displayName && displayName.length > 0 ? displayName[0] : '?';
  
  // Get GitHub stats for this member
  const hasActivity = githubStats && (githubStats.commits > 0 || githubStats.issues?.total > 0);
  
  const handleCopyGithubUsername = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!cleanGithubUsername) return;
    
    try {
      await navigator.clipboard.writeText(cleanGithubUsername);
      if (onCopyGithubUsername) {
        onCopyGithubUsername(cleanGithubUsername);
      }
    } catch (err) {
      console.error('Failed to copy GitHub username:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = cleanGithubUsername;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        if (onCopyGithubUsername) {
          onCopyGithubUsername(cleanGithubUsername);
        }
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };
  
  return (
    <Grid>
      <Tooltip
        title={
          <Box sx={{ fontSize: "12px" }}>
            <div>
              <strong>{displayName}</strong>
              {isCurrentUser && " (You)"}
            </div>
            {cleanGithubUsername && (
              <div style={{ marginTop: "4px", fontSize: "11px", opacity: 0.8 }}>
                <FaGithub style={{ marginRight: "4px", fontSize: "10px" }} />@
                {cleanGithubUsername}
                <br />
                <em style={{ fontSize: "10px" }}>Click username below to copy</em>
              </div>
            )}
            {githubStats ? (
              <Box sx={{ mt: 1, fontSize: "11px" }}>
                <div>📝 {githubStats.commits || 0} commits</div>
                <div>🐛 {githubStats.issues?.total || 0} issues</div>
                <div>🔀 {githubStats.pull_requests?.total || 0} PRs</div>
                {githubStats.latest_commit_time && (
                  <div style={{ marginTop: 4, fontSize: '10px', opacity: 0.8 }}>
                    Last active: {new Date(githubStats.latest_commit_time).toLocaleDateString()}
                  </div>
                )}
              </Box>
            ) : (
              <div style={{ fontSize: '10px', opacity: 0.8, marginTop: 4 }}>
                {cleanGithubUsername ? 'No GitHub activity yet' : 'No GitHub username'}
              </div>
            )}
          </Box>
        }
      >
        <IconButton
          component={Link}
          href={profileUrl}
          aria-label={`${displayName}'s profile`}
          sx={{
            p: 0,
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          <Badge
            badgeContent={githubStats?.commits || 0}
            color={hasActivity ? 'success' : 'default'}
            max={99}
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '10px',
                height: '16px',
                minWidth: '16px',
              }
            }}
          >
            <Avatar
              src={user.profile_image}
              alt={displayName}
              sx={{
                ...(isCurrentUser && {
                  border: "4px solid #3f51b5",
                  boxShadow: "0 0 4px rgba(63, 81, 181, 0.5)",
                }),
                ...(hasActivity && {
                  border: hasActivity ? '2px solid #4caf50' : '1px solid #e0e0e0',
                }),
                ...(cleanGithubUsername && {
                  position: "relative",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: -2,
                    right: -2,
                    width: 16,
                    height: 16,
                    backgroundColor: "#24292e",
                    borderRadius: "50%",
                    border: "2px solid white",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z'/%3E%3C/svg%3E")`,
                    backgroundSize: "10px 10px",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  },
                }),
              }}
            >
              {firstLetter}
            </Avatar>
          </Badge>
        </IconButton>
      </Tooltip>
      <Box sx={{ textAlign: "center", maxWidth: 64 }}>
        <Typography
          variant="caption"
          display="block"
          sx={{
            mt: 0.5,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontWeight: isCurrentUser ? "bold" : "normal",
            color: isCurrentUser ? "primary.main" : "inherit",
          }}
        >
          {displayName}
        </Typography>
        {cleanGithubUsername && (
          <Typography
            variant="caption"
            display="block"
            onClick={handleCopyGithubUsername}
            sx={{
              fontSize: "10px",
              color: "text.secondary",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              mt: 0.25,
              cursor: "pointer",
              userSelect: "none",
              padding: "2px 4px",
              borderRadius: "4px",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.08)",
                color: "primary.main",
                transform: "scale(1.05)",
              },
              "&:active": {
                transform: "scale(0.95)",
              },
            }}
            title="Click to copy GitHub username"
          >
            <FaGithub style={{ marginRight: "2px", fontSize: "8px" }} />@
            {cleanGithubUsername}
          </Typography>
        )}
        {githubStats && hasActivity && (
          <Typography
            variant="caption"
            display="block"
            sx={{
              fontSize: "9px",
              color: "success.main",
              fontWeight: "bold",
              mt: 0.25,
            }}
          >
            Active
          </Typography>
        )}
      </Box>
    </Grid>
  );
};

// Updated GitHubStats component - now only shows repository overview
const GitHubStats = ({ githubUrl, teamMembers, accessToken, onStatsLoaded }) => {
  const [githubData, setGithubData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGithubStats = async () => {
      if (!githubUrl || !accessToken) return;

      const parsedUrl = parseGithubUrl(githubUrl);
      if (!parsedUrl) {
        setError('Invalid GitHub URL');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/github/repository?org=${parsedUrl.org}&repo=${parsedUrl.repo}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          console.warn(`GitHub stats returned ${response.status} for ${parsedUrl.org}/${parsedUrl.repo}`);
          setError(null);
          return;
        }

        const data = await response.json();
        setGithubData(data);
        
        // Pass stats back to parent component
        if (onStatsLoaded) {
          onStatsLoaded(data);
        }
      } catch (err) {
        console.error('Error fetching GitHub stats:', err);
        setError('Failed to load GitHub statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchGithubStats();
  }, [githubUrl, accessToken, onStatsLoaded]);

  if (loading) {
    return (
      <Box sx={{ mt: 1, mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <FaGithub style={{ marginRight: 8, fontSize: '14px' }} />
          <Typography variant="body2">Loading GitHub stats...</Typography>
        </Box>
        <LinearProgress size="small" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 1, mb: 1 }}>
        <Typography variant="caption" color="error" sx={{ display: 'flex', alignItems: 'center' }}>
          <FaExclamationCircle style={{ marginRight: 4, fontSize: '12px' }} />
          {error}
        </Typography>
      </Box>
    );
  }

  if (!githubData) return null;

  // Calculate total commits
  const totalCommits = githubData.contributors?.reduce((sum, contributor) => sum + (contributor.commits || 0), 0) || 0;

  // Get the latest_commit_time from all contributors
  const latestCommitTime = githubData.contributors?.reduce((latest, contributor) => 
    contributor.latest_commit_time && (!latest || new Date(contributor.latest_commit_time) > new Date(latest))
      ? contributor.latest_commit_time 
      : latest, null) || null;
  
  // Calculate total issues
  const totalIssues = githubData.contributors?.reduce((sum, contributor) => {
    const issues = contributor.issues || {};
    return sum + (issues.total || 0);
  }, 0) || 0;

  // Calculate total PRs
  const totalPRs = githubData.contributors?.reduce((sum, contributor) => {
    const prs = contributor.pull_requests || {};
    return sum + (prs.total || 0);
  }, 0) || 0;

  return (
    <Box sx={{ mt: 1, mb: 1 }}>
      {/* Repository Overview Stats */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>        
        <Chip
          icon={<FaGitAlt />}
          label={`${totalCommits} commits`}
          size="small"
          color={totalCommits > 0 ? 'success' : 'default'}
          variant={totalCommits > 0 ? 'filled' : 'outlined'}
        />
        {totalIssues > 0 && (
          <Chip
            icon={<FaExclamationCircle />}
            label={`${totalIssues} issues`}
            size="small"
            color="info"
            variant="outlined"
          />
        )}
        {totalPRs > 0 && (
          <Chip
            icon={<FaCodeBranch />}
            label={`${totalPRs} PRs`}
            size="small"
            color="primary"
            variant="outlined"
          />
        )}
        <Typography variant="caption" color="textSecondary">
          {githubData.contributor_count} contributor{githubData.contributor_count !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* Last commit time */}
      {latestCommitTime && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <FaClock style={{ marginRight: 6, fontSize: '12px', color: '#666' }} />
          <Typography variant="caption" color="textSecondary">
            Last commit: {formatDistanceToNow(parseISO(latestCommitTime), { addSuffix: true })}
          </Typography>
        </Box>
      )}

      {/* Encouragement message for inactive teams */}
      {totalCommits === 0 && (
        <Box sx={{ mt: 1, p: 1, backgroundColor: '#fff3e0', borderRadius: 1, border: '1px solid #ffcc02' }}>
          <Typography variant="caption" color="#e65100" sx={{ display: 'flex', alignItems: 'center' }}>
            <FaCode style={{ marginRight: 4, fontSize: '12px' }} />
            Get started! No commits yet - time to push some code! 🚀
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// Team Card component - extracted for better organization
const TeamCard = ({ team, userProfile, isLoggedIn, onJoin, onLeave, loadingTeamId, isHackathonExpired, teamJoinEnabled, hackerStatus, nonprofitMap, accessToken, onCopyGithubUsername, onPlayVideo, event_id, onVisible }) => {
  const hasGithubLinks = team?.github_links && team?.github_links.length > 0;
  const [githubData, setGithubData] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const cardRef = useRef(null);
  const visibilityFiredRef = useRef(false);

  useEffect(() => {
    if (!onVisible) return;
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !visibilityFiredRef.current) {
          visibilityFiredRef.current = true;
          onVisible(team);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onVisible, team]);
  
  // Check if this team's button is currently loading
  const isLoading = loadingTeamId === team?.id;
  
  // Check if current user is in the team
  const isUserInTeam = isLoggedIn && userProfile && Array.isArray(team?.users) && 
    team.users.some(user => {      
      // Handle both object and string cases
      if (typeof user === 'string') {
        return user === userProfile.user_id;
      }
      return user.id === userProfile.id;
    });
    
  // Check if the team is active - override with hackathon expiration and team join enabled
  const isActive = !isHackathonExpired && (team.active === "True" || team.active === true);
  const canJoinLeave = isActive && teamJoinEnabled;
  
  // Check if joining is disabled by team status
  const joiningDisabledByStatus = isJoiningDisabledByStatus(team?.status);
  // Only approved hackers can join a team. Mentors/judges/non-applicants resolve
  // to a non-"approved" hackerStatus and are blocked from joining. null means the
  // status hasn't loaded yet — keep Join disabled until we know.
  const isApprovedHacker = hackerStatus === "approved";
  const canJoin = canJoinLeave && !joiningDisabledByStatus && isApprovedHacker;
  const canLeave = canJoinLeave; // Users can still leave teams with restricted statuses

  // Map team members to their GitHub stats
  const getStatsForMember = (teamMember) => {
    if (!githubData?.contributors || !teamMember) return null;

    // Try to match by GitHub username
    const githubUsername = teamMember.github || teamMember.github_username;
    if (!githubUsername) return null;

    // Clean the username (remove @ and URL parts)
    const cleanUsername = githubUsername.replace(/^@/, '').replace(/^https?:\/\/(www\.)?github\.com\//, '');

    return githubData.contributors.find(contributor =>
      contributor.login === cleanUsername || contributor.id === cleanUsername
    );
  };

  // Handle showing join confirmation modal
  const handleJoinClick = () => {
    setShowJoinModal(true);
  };

  // Handle confirmed join action
  const handleConfirmJoin = () => {
    setShowJoinModal(false);
    onJoin(team.id);
  };

  // Handle modal close
  const handleCloseJoinModal = () => {
    setShowJoinModal(false);
  };

  return (
    <Card
      ref={cardRef}
      elevation={0}
      sx={{
        position: "relative",
        height: "100%",
        opacity: isActive ? 1 : 0.72,
        border: "1px solid var(--line, #E7E1D4)",
        borderRadius: "10px",
        boxShadow: "none",
        transition: "transform .2s ease, box-shadow .2s ease, border-color .2s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 18px 40px -28px rgba(22,24,29,0.45)",
          borderColor: "#d8d1c0",
        },
      }}
    >
      {!isActive && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            backgroundColor: isHackathonExpired
              ? "error.light"
              : "warning.light",
            color: isHackathonExpired
              ? "error.contrastText"
              : "warning.contrastText",
            px: 1,
            py: 0.5,
            borderBottomLeftRadius: 4,
            fontSize: "0.75rem",
            fontWeight: "bold",
            zIndex: 1,
          }}
        >
          {isHackathonExpired ? "Hackathon Ended" : "Inactive Team"}
        </Box>
      )}
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', mb: 1 }}>
          <Typography variant="h6" component="h3" sx={{ mr: 1, fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}>
            <Link
              component={NextLink}
              href={`/hack/${event_id}/team/${team?.id}`}
              underline="hover"
              sx={{ color: "var(--ink, #16181D)", "&:hover": { color: "var(--brand, #1B3A6B)" } }}
            >
              {team?.name}
            </Link>
          </Typography>
          {team?.status && renderStatusChip(team?.status)}
        </Box>
        
        {!isActive && (
          <Typography variant="body2" color="error" sx={{ mb: 1 }}>
            {isHackathonExpired
              ? "This hackathon has ended"
              : "This team is currently inactive"}
          </Typography>
        )}

        {/* At-a-glance mentor support — renders nothing if no mentor activity yet */}
        <MentorSupportSummary team={team} eventId={event_id} />

        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
          Slack Channel:{" "}
          <Link
            href={`https://opportunity-hack.slack.com/app_redirect?channel=${team?.slack_channel}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {team?.slack_channel}
          </Link>
        </Typography>

        {/* Nonprofit Information */}
        {team?.selected_nonprofit_id && nonprofitMap && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <FaHeart style={{ marginRight: 8, color: '#e91e63', fontSize: '14px' }} />
            <Typography variant="body2" color="textSecondary">
              <strong>Nonprofit:</strong> {nonprofitMap[team.selected_nonprofit_id] || 'Unknown Nonprofit'}
            </Typography>
          </Box>
        )}

        {/* GitHub Repository and Admin */}
        <Box sx={{ mb: 1 }}>
          {hasGithubLinks && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <FaGithub style={{ marginRight: 8, fontSize: '14px' }} />
                <Link
                  href={team.github_links[0].link}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="body2"
                >
                  GitHub Repository
                </Link>
              </Box>
              
              {/* GitHub Statistics */}
              <GitHubStats 
                githubUrl={team.github_links[0].link}
                teamMembers={team.users}
                accessToken={accessToken}
                onStatsLoaded={setGithubData}
              />
            </>
          )}
          
          {team?.github_username && (
            <Box sx={{ display: 'flex', alignItems: 'center', ml: hasGithubLinks ? 3 : 0 }}>
              <FaUser style={{ marginRight: 8, fontSize: '12px' }} />
              <Typography variant="caption" color="textSecondary">
                Admin: @{team.github_username}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Demo Video */}
        {team?.demo_video_url && (
          <Box sx={{ mb: 1.5 }}>
            <LiteVideoThumbnail
              url={team.demo_video_url}
              label={`Watch ${team?.name || 'team'} demo`}
              onClick={() => onPlayVideo?.(team.demo_video_url, team?.name)}
            />
          </Box>
        )}

        {/* DevPost Project */}
        <Box sx={{ mb: 1 }}>
          {team?.devpost_link ? (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <FaExternalLinkAlt style={{ marginRight: 8, fontSize: '14px' }} />
              <Link
                href={team.devpost_link}
                target="_blank"
                rel="noopener noreferrer"
                variant="body2"
              >
                DevPost Project
              </Link>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <FaExternalLinkAlt style={{ marginRight: 8, fontSize: '14px', opacity: 0.5 }} />
              <Link
                href={`/hack/${team?.hackathon_event_id}/manageteam`}
                variant="body2"
                sx={{ fontStyle: 'italic', color: 'text.secondary' }}
              >
                Add DevPost Project
              </Link>
            </Box>
          )}
        </Box>

        {/* Created Date */}
        {team?.created && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FaCalendarAlt style={{ marginRight: 8, fontSize: '12px' }} />
            <Typography variant="caption" color="textSecondary">
              Created: {formatCreatedDate(team.created)}
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 1 }} />

        <Typography
          variant="subtitle2"
          sx={{ mt: 1.5, mb: 1, fontFamily: "'Hanken Grotesk', system-ui, sans-serif", textTransform: "uppercase", letterSpacing: "0.14em", fontSize: "0.66rem", fontWeight: 600, color: "var(--muted, #5B6270)" }}
        >
          Team members
        </Typography>
        <Grid container spacing={1}>
          {Array.isArray(team?.users) &&
            team.users.map((user, index) => {
              // Determine if this is the current logged-in user
              const userId =
                typeof user === "string" ? user : user?.id || user?.user_id;
              const isCurrentUser =
                userProfile &&
                (userId === userProfile.id || userId === userProfile.user_id);

              // Get GitHub stats for this user
              const githubStats = getStatsForMember(user);

              return (
                <TeamMemberWithStats
                  key={
                    typeof user === "string"
                      ? user
                      : user?.id || `user-${index}`
                  }
                  user={user}
                  isCurrentUser={isCurrentUser}
                  githubStats={githubStats}
                  onCopyGithubUsername={onCopyGithubUsername}
                />
              );
            })}
        </Grid>

        {isLoggedIn && userProfile && (
          <div style={{ marginTop: "10px" }}>
            {isUserInTeam ? (
              <>
                <Button
                  size="small"
                  variant="outlined"
                  color="secondary"
                  onClick={() => onLeave(team.id)}
                  disabled={isLoading || !canLeave}
                  startIcon={isLoading && <CircularProgress size={16} />}
                >
                  {isLoading ? "Leaving..." : "Leave Team"}
                </Button>
                {!canLeave && (
                  <Typography
                    variant="caption"
                    color="error"
                    display="block"
                    sx={{ mt: 1 }}
                  >
                    {isHackathonExpired
                      ? "Hackathon has ended - teams are now closed"
                      : !teamJoinEnabled
                        ? "Team joining is currently disabled"
                        : "Team operations are currently restricted"}
                  </Typography>
                )}
              </>
            ) : isApprovedHacker ? (
              <>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleJoinClick}
                  disabled={isLoading || !canJoin}
                  startIcon={isLoading && <CircularProgress size={16} />}
                  sx={{ textTransform: "none", borderColor: "var(--brand, #1B3A6B)", color: "var(--brand, #1B3A6B)", "&:hover": { borderColor: "#16315a", backgroundColor: "rgba(27,58,107,0.06)" } }}
                >
                  {isLoading ? "Joining..." : "Join Team"}
                </Button>
                {!canJoin && (
                  <Typography
                    variant="caption"
                    color="error"
                    display="block"
                    sx={{ mt: 1 }}
                  >
                    {isHackathonExpired
                      ? "Hackathon has ended - teams are now closed"
                      : !teamJoinEnabled
                        ? "Team joining is currently disabled"
                        : !isActive
                          ? "You cannot join inactive teams"
                          : joiningDisabledByStatus
                            ? "This team is no longer accepting new members"
                            : "Team operations are currently restricted"}
                  </Typography>
                )}
              </>
            ) : hackerStatus === "pending" ? (
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Your hacker application is awaiting confirmation. You can join a
                team once it&apos;s approved.
              </Typography>
            ) : hackerStatus === "none" ? (
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Joining a team is for approved hackers.{" "}
                <Link
                  component={NextLink}
                  href={`/hack/${event_id}/hacker-application`}
                  underline="hover"
                >
                  Apply as a hacker
                </Link>{" "}
                to get started.
              </Typography>
            ) : null}
          </div>
        )}

        {/* Team Join Confirmation Modal */}
        <TeamJoinConfirmationModal
          open={showJoinModal}
          onClose={handleCloseJoinModal}
          onConfirm={handleConfirmJoin}
          teamName={team?.name}
          loading={isLoading}
        />
      </CardContent>
    </Card>
  );
};

const TeamList = ({ teams, event_id, id, endDate, eventTimezone, constraints = {} }) => {
  const [teamData, setTeamData] = useState(teams || []);
  const [loading, setLoading] = useState(false);
  const [profilesLoading, setProfilesLoading] = useState(false);
  // Add state to track which team's button is being processed
  const [loadingTeamId, setLoadingTeamId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [userProfile, setUserProfile] = useState(null);
  // Approved-hacker gate for Join: "approved" when the caller's hacker
  // application for this event exists and isSelected === true. Mentors/judges
  // hit the hacker-scoped endpoint and get nothing back, so they can't join.
  // null = unknown/loading, "approved" | "pending" | "none" once resolved.
  const [hackerStatus, setHackerStatus] = useState(null);
  const [nonprofitMap, setNonprofitMap] = useState({});
  const [nonprofitsLoading, setNonprofitsLoading] = useState(false);
  const [videoDialog, setVideoDialog] = useState({
    open: false,
    url: null,
    teamName: null,
  });
  const { isLoggedIn, accessToken } = useAuthInfo();

  const handlePlayVideo = useCallback((url, teamName) => {
    setVideoDialog({ open: true, url, teamName: teamName || null });
  }, []);

  const handleCloseVideoDialog = useCallback(() => {
    setVideoDialog((prev) => ({ ...prev, open: false }));
  }, []);

  // Check if team joining is enabled from constraints
  const teamJoinEnabled = constraints.team_join_enabled !== false; // Default to true if not specified

  // Fetch detailed profile information for all team members
  const fetchTeamMemberProfiles = useCallback(
    async (teamsData) => {
      if (!teamsData?.length || !accessToken) return;

      setProfilesLoading(true);
      try {
        // Extract unique user IDs from all teams (users are stored as string IDs)
        const userIds = new Set();
        teamsData.forEach((team) => {
          if (Array.isArray(team?.users)) {
            team.users.forEach((userId) => {
              if (userId) userIds.add(userId);
            });
          }
        });

        // Fetch all user profiles in parallel
        const profileMap = {};
        await Promise.all(
          Array.from(userIds).map(async (userId) => {
            try {
              const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/profile/${userId}`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
              );

              if (!response.ok)
                throw new Error(`Failed to fetch profile for user ${userId}`);

              const data = await response.json();
              const profile = data.text || data;

              // Add user ID to the profile object for reference
              if (profile) {
                profile.user_id = userId;
              }

              // Add to lookup map
              profileMap[userId] = profile;
              return { userId, profile };
            } catch (error) {
              console.error(
                `Error fetching profile for user ${userId}:`,
                error
              );
              return { userId, error };
            }
          })
        );

        // Update teams with detailed user profiles, converting string IDs to profile objects
        const updatedTeams = teamsData.map((team) => ({
          ...team,
          users: Array.isArray(team?.users)
            ? team.users.map(
                (userId) => profileMap[userId] || { user_id: userId }
              )
            : [],
        }));

        setTeamData(updatedTeams);
      } catch (error) {
        console.error("Error fetching team member profiles:", error);
        setSnackbar({
          open: true,
          message: "Error fetching some team member profiles",
          severity: "warning",
        });
      } finally {
        setProfilesLoading(false);
      }
    },
    [accessToken]
  );

  const fetchUserProfile = useCallback(async () => {
    if (isLoggedIn && accessToken) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/profile`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setUserProfile(data.text);
        } else {
          throw new Error("Failed to fetch user profile");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setSnackbar({
          open: true,
          message: "Error fetching user profile",
          severity: "error",
        });
      }
    }
  }, [isLoggedIn, accessToken]);

  // Resolve the caller's hacker application for this event. The endpoint is
  // volunteer_type-scoped to "hacker", so a mentor/judge (or someone with no
  // application) gets null back and is never treated as an approved hacker.
  const fetchHackerStatus = useCallback(async () => {
    if (!isLoggedIn || !accessToken || !event_id) {
      setHackerStatus("none");
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/hacker/application/${event_id}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!response.ok) {
        setHackerStatus("none");
        return;
      }
      const data = await response.json();
      const app = data?.data ?? null;
      if (!app) {
        setHackerStatus("none");
      } else {
        setHackerStatus(app.isSelected === true ? "approved" : "pending");
      }
    } catch (error) {
      console.error("Error resolving hacker application status:", error);
      setHackerStatus("none");
    }
  }, [isLoggedIn, accessToken, event_id]);

  // Fetch nonprofits for the event to build a name mapping
  const fetchNonprofits = useCallback(async () => {
    if (!id || !accessToken) return;

    setNonprofitsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npos/hackathon/${id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();        
        if (data.nonprofits) {
          // Build a map of nonprofit ID to nonprofit name for quick lookups
          const npMap = {};
          data.nonprofits.forEach((nonprofit) => {
            npMap[nonprofit.id] = nonprofit.name;
          });
          setNonprofitMap(npMap);
        }
      } else {
        console.warn("Failed to fetch nonprofits for event");
      }
    } catch (error) {
      console.error("Error fetching nonprofits:", error);
      setSnackbar({
        open: true,
        message: "Error fetching nonprofit information",
        severity: "warning",
      });
    } finally {
      setNonprofitsLoading(false);
    }
  }, [event_id, accessToken]);

  const fetchedTeamProfilesRef = useRef(new Set());

  const fetchTeamProfiles = useCallback(async (team) => {
    if (!team?.id || !accessToken) return;
    if (fetchedTeamProfilesRef.current.has(team.id)) return;
    fetchedTeamProfilesRef.current.add(team.id);

    const userIds = Array.isArray(team.users)
      ? team.users.filter((u) => typeof u === "string" && u)
      : [];
    if (!userIds.length) return;

    const profileMap = {};
    await Promise.all(
      userIds.map(async (userId) => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/profile/${userId}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          if (!response.ok) return;
          const data = await response.json();
          const profile = data.text || data;
          if (profile) {
            profile.user_id = userId;
            profileMap[userId] = profile;
          }
        } catch {
          // silently ignore per-user failures
        }
      })
    );

    if (!Object.keys(profileMap).length) return;

    setTeamData((prev) =>
      prev.map((t) =>
        t.id === team.id
          ? {
              ...t,
              users: Array.isArray(t.users)
                ? t.users.map((u) =>
                    typeof u === "string" ? profileMap[u] || { user_id: u } : u
                  )
                : t.users,
            }
          : t
      )
    );
  }, [accessToken]);

  useEffect(() => {
    fetchUserProfile();
    fetchHackerStatus();
    fetchNonprofits();
  }, [fetchUserProfile, fetchHackerStatus, fetchNonprofits]);

  const handleJoinTeam = async (teamId) => {
    try {
      // Set loading state for this specific team
      setLoadingTeamId(teamId);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/team`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ teamId }),
        }
      );
      if (response.ok) {
        // Update local state by adding the user profile to the team
        // After joining, store the user's full profile object
        setTeamData((prevTeams) =>
          prevTeams.map((team) =>
            team.id === teamId
              ? {
                  ...team,
                  users: [...team.users, userProfile],
                }
              : team
          )
        );

        setSnackbar({
          open: true,
          message: "Successfully joined the team",
          severity: "success",
        });
      } else {
        throw new Error("Failed to join team");
      }
    } catch (error) {
      console.error("Error joining team:", error);
      setSnackbar({
        open: true,
        message: "Error joining team",
        severity: "error",
      });
    } finally {
      // Clear loading state regardless of success/failure
      setLoadingTeamId(null);
    }
  };

  const handleUnjoinTeam = async (teamId) => {
    try {
      // Set loading state for this specific team
      setLoadingTeamId(teamId);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/team`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ teamId }),
        }
      );
      if (response.ok) {
        // Update local state by removing the user from the team
        // Handle both string IDs and user objects
        setTeamData((prevTeams) =>
          prevTeams.map((team) => {
            if (team.id === teamId) {
              return {
                ...team,
                users: team.users.filter((user) => {
                  if (typeof user === "string") {
                    return (
                      user !== userProfile.user_id && user !== userProfile.id
                    );
                  }
                  return (
                    user.id !== userProfile.id &&
                    user.user_id !== userProfile.user_id
                  );
                }),
              };
            }
            return team;
          })
        );

        setSnackbar({
          open: true,
          message: "Successfully left the team",
          severity: "success",
        });
      } else {
        throw new Error("Failed to leave team");
      }
    } catch (error) {
      console.error("Error leaving team:", error);
      setSnackbar({
        open: true,
        message: "Error leaving team",
        severity: "error",
      });
    } finally {
      // Clear loading state regardless of success/failure
      setLoadingTeamId(null);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCopyGithubUsername = (username) => {
    setSnackbar({
      open: true,
      message: `GitHub username "${username}" copied to clipboard!`,
      severity: "success",
    });
  };

  if (loading) {
    return <LoadingIndicator message="Loading teams..." />;
  }


  return (
    <div>
      

      {/* Non-blocking loading indicator while profiles are loading */}
      {(profilesLoading || nonprofitsLoading) && (
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <CircularProgress size={16} sx={{ mr: 1 }} />
          <Typography variant="body2" color="textSecondary">
            {profilesLoading && nonprofitsLoading 
              ? "Loading team member profiles and nonprofit information..."
              : profilesLoading 
                ? "Updating team member profiles..."
                : "Loading nonprofit information..."
            }
          </Typography>
        </Box>
      )}

      <Grid container spacing={2}>
        {(teamData || []).map((team) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={team?.id}>
            <TeamCard
              team={team}
              userProfile={userProfile}
              isLoggedIn={isLoggedIn}
              onJoin={handleJoinTeam}
              onLeave={handleUnjoinTeam}
              loadingTeamId={loadingTeamId}
              isHackathonExpired={isHackathonExpired(endDate, eventTimezone)}
              teamJoinEnabled={teamJoinEnabled}
              hackerStatus={hackerStatus}
              nonprofitMap={nonprofitMap}
              accessToken={accessToken}
              onCopyGithubUsername={handleCopyGithubUsername}
              onPlayVideo={handlePlayVideo}
              event_id={event_id}
              onVisible={isLoggedIn ? fetchTeamProfiles : undefined}
            />
          </Grid>        
        ))}
      </Grid>

      <Dialog
        open={videoDialog.open}
        onClose={handleCloseVideoDialog}
        maxWidth="md"
        fullWidth
        aria-labelledby="team-demo-video-title"
      >
        <DialogTitle id="team-demo-video-title" sx={{ pr: 6 }}>
          {videoDialog.teamName ? `${videoDialog.teamName} demo` : "Team demo"}
          <IconButton
            aria-label="Close demo video"
            onClick={handleCloseVideoDialog}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <FaTimes />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {videoDialog.url && (
            <VideoDisplay
              url={videoDialog.url}
              title={videoDialog.teamName || "Team demo"}
            />
          )}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default TeamList;
