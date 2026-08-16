import { FONT_BODY, FONT_DISPLAY } from "../../styles/fonts";
import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Box,
  Grid,
  Avatar,
  Chip,
  Tooltip,
  Button,
  Divider,
  Link,
  Badge,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CodeIcon from "@mui/icons-material/Code";
import MergeIcon from "@mui/icons-material/Merge";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import IntegrationInstructionsIcon from "@mui/icons-material/IntegrationInstructions";
import GroupIcon from "@mui/icons-material/Group";
import GitHubIcon from "@mui/icons-material/GitHub";
import LaunchIcon from "@mui/icons-material/Launch";
import LinkIcon from "@mui/icons-material/Link";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HistoryIcon from "@mui/icons-material/History";
import UpdateIcon from "@mui/icons-material/Update";
import UpcomingIcon from "@mui/icons-material/Upcoming";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PullRequestIcon from "@mui/icons-material/CallMerge";
import RateReviewIcon from "@mui/icons-material/RateReview";
import WeekendIcon from "@mui/icons-material/Weekend";
import ExploreIcon from "@mui/icons-material/Explore";
import StarIcon from "@mui/icons-material/Star";
import CommitIcon from "@mui/icons-material/CommitRounded";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import FlagIcon from "@mui/icons-material/Flag";
import ScheduleIcon from "@mui/icons-material/Schedule";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const LeaderboardContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: "#FFFFFF",
  border: "1px solid var(--line, #E7E1D4)",
  boxShadow: "none",
  borderRadius: 10,
  height: "100%",
}));

const StatBox = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(0.5),
  padding: theme.spacing(2, 1),
  borderRadius: 10,
  backgroundColor: "var(--surface-2, #F4F1E9)",
  border: "1px solid var(--line, #E7E1D4)",
  marginBottom: theme.spacing(2),
  transition: "transform 0.2s, box-shadow 0.2s",
  width: "100%",
  overflow: "hidden",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: "0 14px 30px -24px rgba(22,24,29,0.5)",
  },
}));

const StatValue = styled(Typography)(({ theme }) => ({
  fontFamily: FONT_DISPLAY,
  fontWeight: 500,
  fontSize: "1.9rem",
  lineHeight: 1.05,
  color: "var(--brand, #1B3A6B)",
  textAlign: "center",
  width: "100%",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
}));

const StatLabel = styled(Typography)(({ theme }) => ({
  fontFamily: FONT_BODY,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  fontSize: "0.66rem",
  fontWeight: 600,
  color: "var(--muted, #5B6270)",
  textAlign: "center",
  width: "100%",
  overflowWrap: "break-word",
}));

const AchievementCard = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(2),
  borderRadius: 10,
  backgroundColor: "#FFFFFF",
  border: "1px solid var(--line, #E7E1D4)",
  marginBottom: theme.spacing(2),
  boxShadow: "none",
  transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
  overflow: "hidden",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 14px 30px -24px rgba(22,24,29,0.45)",
    borderColor: "#d8d1c0",
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#1B3A6B",
    color: "#fff",
  },
}));

const SectionHeader = styled(Typography)(({ theme }) => ({
  fontFamily: FONT_DISPLAY,
  fontWeight: 500,
  fontSize: "1.3rem",
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(2),
  paddingBottom: theme.spacing(1),
  borderBottom: "1px solid var(--line, #E7E1D4)",
}));

const OrgBanner = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  backgroundColor: "var(--surface-2, #F4F1E9)",
  border: "1px solid var(--line, #E7E1D4)",
  padding: theme.spacing(2),
  borderRadius: 10,
  marginBottom: theme.spacing(3),
  boxShadow: "none",
}));

const LinkButton = styled(Button)(({ theme }) => ({
  marginRight: theme.spacing(1),
  borderRadius: 5,
  textTransform: "none",
  fontWeight: 600,
  backgroundColor: "var(--brand, #1B3A6B)",
  color: "#fff",
  boxShadow: "none",
  "&:hover": { backgroundColor: "#16315a", boxShadow: "none" },
  "&.Mui-disabled": {
    backgroundColor: "rgba(0,0,0,0.12)",
    color: "rgba(0,0,0,0.4)",
  },
}));

const GitHubChip = styled(Chip)(({ theme }) => ({
  cursor: "pointer",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const TruncatedText = styled(Typography)(({ theme }) => ({
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: "100%",
}));

const FlexContent = styled(Box)({
  minWidth: 0,
  overflow: "hidden",
});

const PlaceholderIllustration = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  margin: theme.spacing(2, 0),
}));

const AnimatedPulse = styled(Box)(({ theme }) => ({
  animation: "pulse 2s infinite",
  "@keyframes pulse": {
    "0%": {
      opacity: 1,
    },
    "50%": {
      opacity: 0.5,
    },
    "100%": {
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
    link: <LinkIcon {...defaultProps} />,
    rocket_launch: <RocketLaunchIcon {...defaultProps} />,
    group: <GroupIcon {...defaultProps} />,
    flag: <FlagIcon {...defaultProps} />,
    schedule: <ScheduleIcon {...defaultProps} />,
  };

  if (iconMap[iconName]) {
    return iconMap[iconName];
  }

  if (iconName.includes("commit") || iconName.includes("code")) {
    return <CodeIcon {...defaultProps} />;
  } else if (
    iconName.includes("merge") ||
    iconName.includes("pr") ||
    iconName.includes("pull")
  ) {
    return <MergeIcon {...defaultProps} />;
  } else if (
    iconName.includes("time") ||
    iconName.includes("hour") ||
    iconName.includes("day")
  ) {
    return <AccessTimeIcon {...defaultProps} />;
  } else if (iconName.includes("task") || iconName.includes("issue")) {
    return <TaskAltIcon {...defaultProps} />;
  } else if (iconName.includes("review") || iconName.includes("comment")) {
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

// Reason taxonomy for "Teams Ready for a Boost".
// `reason_code` is supplied by the backend (Phase 2); we infer it when absent.
const BOOST_REASONS = {
  blocked_flag: {
    label: "Blocked",
    color: "#C62828",
    bg: "rgba(198,40,40,0.07)",
    icon: "flag",
    mentorAction:
      "This team is blocked. Open their team page, read the flag, and hop into their Slack channel to help unblock them.",
  },
  open_flag: {
    label: "Needs attention",
    color: "#E2552E",
    bg: "rgba(226,85,46,0.07)",
    icon: "flag",
    mentorAction:
      "A mentor flagged something here. Review the flag on the team page and offer guidance — or take it over.",
  },
  stale_no_touch: {
    label: "No recent mentor visit",
    color: "#1B3A6B",
    bg: "rgba(27,58,107,0.05)",
    icon: "schedule",
    mentorAction:
      "No mentor has checked in for 4+ hours. Drop by their table or Slack, then log a quick coverage note on the team page.",
  },
  default: {
    label: "Could use a boost",
    color: "#1B3A6B",
    bg: "rgba(27,58,107,0.05)",
    icon: "rocket_launch",
    mentorAction:
      "Check this team's recent activity and help them get their project moving.",
  },
};

function resolveBoostReason(opp) {
  if (opp?.reason_code && BOOST_REASONS[opp.reason_code]) {
    return BOOST_REASONS[opp.reason_code];
  }
  const value = (opp?.value || "").toLowerCase();
  if (opp?.icon === "flag" && value.includes("block"))
    return BOOST_REASONS.blocked_flag;
  if (opp?.icon === "flag") return BOOST_REASONS.open_flag;
  if (opp?.icon === "schedule" || value.includes("no mentor touch"))
    return BOOST_REASONS.stale_no_touch;
  return BOOST_REASONS.default;
}

const BADGE_CRITERIA = {
  "Most Commits": "Most code commits by one person",
  "Epic PR": "Largest merged pull request",
  "First to Commit": "First person to push code",
  "Night Owl": "Most commits late at night",
  "Most Productive Team": "Highest number of commits",
  "Most Collaborative": "Most pull requests merged",
  "Largest Team": "Most unique contributors",
};

const HackathonLeaderboard = ({
  initialGeneralStats,
  initialIndividualAchievements,
  initialTeamAchievements,
  githubOrg,
  eventName,
  eventId,
  startDate,
  endDate,
}) => {
  const [generalStats, setGeneralStats] = useState(initialGeneralStats || []);
  const [individualAchievements, setIndividualAchievements] = useState(
    initialIndividualAchievements || [],
  );
  const [teamAchievements, setTeamAchievements] = useState(
    initialTeamAchievements || [],
  );
  const [mentorOpportunities, setMentorOpportunities] = useState([]);
  const [orgName, setOrgName] = useState(githubOrg || "");
  const [hackathonName, setHackathonName] = useState(eventName || "");
  const [loading, setLoading] = useState(!initialGeneralStats);
  const [error, setError] = useState(null);
  const [loadingAttempted, setLoadingAttempted] = useState(false);

  const now = new Date();
  const eventStartDate = startDate ? new Date(startDate) : null;
  const eventEndDate = endDate ? new Date(endDate) : null;

  const eventStatus = React.useMemo(() => {
    if (!eventStartDate || !eventEndDate) return "unknown";
    if (now < eventStartDate) return "upcoming";
    if (now > eventEndDate) return "past";
    return "ongoing";
  }, [eventStartDate, eventEndDate, now]);

  const daysSinceEnd = eventEndDate
    ? Math.floor((now - eventEndDate) / (1000 * 60 * 60 * 24))
    : null;
  const daysUntilStart = eventStartDate
    ? Math.floor((eventStartDate - now) / (1000 * 60 * 60 * 24))
    : null;

  useEffect(() => {
    if (
      (!initialGeneralStats ||
        !initialIndividualAchievements ||
        !initialTeamAchievements) &&
      eventId
    ) {
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
        throw new Error(
          `Failed to fetch leaderboard data: ${response.statusText}`,
        );
      }

      const data = await response.json();
      console.log("Fetched leaderboard data:", data);

      setGeneralStats(data.generalStats || []);
      setIndividualAchievements(data.individualAchievements || []);
      setTeamAchievements(data.teamAchievements || []);
      setMentorOpportunities(data.mentorOpportunities || []);
      setOrgName(data.githubOrg || "");
      setHackathonName(data.eventName || "");
    } catch (err) {
      console.error("Error fetching leaderboard data:", err);
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
    return `https://github.com/${orgName}/${team}`;
  };

  const renderContextualPlaceholder = () => {
    if (loading) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          py={6}
        >
          <CircularProgress size={48} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2, fontWeight: "medium" }}>
            Loading GitHub statistics...
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Fetching the latest development activity
          </Typography>
        </Box>
      );
    }

    if (error || (!loading && loadingAttempted && !generalStats.length)) {
      if (eventStatus === "upcoming") {
        return (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            py={4}
          >
            <UpcomingIcon sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
            <Typography variant="h6" align="center" gutterBottom>
              Leaderboard Coming Soon
            </Typography>
            <Typography variant="body1" align="center" color="textSecondary">
              {daysUntilStart === 1
                ? "This event starts tomorrow!"
                : `This event starts in ${daysUntilStart} days.`}
            </Typography>
            <Typography
              variant="body2"
              align="center"
              color="textSecondary"
              sx={{ mt: 1, mb: 3, maxWidth: 450 }}
            >
              Once the hackathon begins, this leaderboard will display real-time
              statistics and achievements from GitHub.
            </Typography>
            <Box width="100%" mt={2}>
              <Typography
                variant="subtitle2"
                color="textSecondary"
                gutterBottom
                sx={{ pl: 1 }}
              >
                Preview of stats to come:
              </Typography>
              <Grid container spacing={2} sx={{ px: 1 }}>
                {["Commits", "Pull Requests", "Hours Coded"].map(
                  (stat, idx) => (
                    <Grid size={4} key={idx}>
                      <Skeleton
                        variant="rounded"
                        height={80}
                        animation="wave"
                      />
                    </Grid>
                  ),
                )}
              </Grid>
            </Box>
          </Box>
        );
      }

      if (eventStatus === "past") {
        return (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            py={4}
          >
            <HistoryIcon
              sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="h6" align="center" gutterBottom>
              Event Completed
            </Typography>
            <Typography variant="body1" align="center" color="textSecondary">
              {daysSinceEnd === 0
                ? "This event ended today!"
                : daysSinceEnd === 1
                  ? "This event ended yesterday."
                  : `This event ended ${daysSinceEnd} days ago.`}
            </Typography>
            <Typography
              variant="body2"
              align="center"
              color="textSecondary"
              sx={{ mt: 1, maxWidth: 450 }}
            >
              {daysSinceEnd && daysSinceEnd > 90
                ? "Leaderboard data for older events may no longer be available."
                : "The hackathon leaderboard data is currently unavailable."}
            </Typography>
            <Box sx={{ mt: 3, width: "100%", px: 2 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                <EmojiEventsIcon
                  fontSize="small"
                  sx={{ mr: 0.5, verticalAlign: "text-bottom" }}
                />
                Hackathon Highlights:
              </Typography>
              <Box
                sx={{
                  p: 2,
                  bgcolor: "background.paper",
                  borderRadius: 1,
                  border: "1px dashed",
                  borderColor: "divider",
                }}
              >
                <Typography variant="body2" paragraph>
                  Teams built innovative solutions for nonprofits during this
                  hackathon.
                  {githubOrg && (
                    <>
                      {" "}
                      Check out the{" "}
                      <Link
                        href={getGitHubOrgUrl()}
                        target="_blank"
                        rel="noopener"
                      >
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
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          py={4}
        >
          <UpdateIcon sx={{ fontSize: 60, color: "info.main", mb: 2 }} />
          <Typography variant="h6" align="center" gutterBottom>
            Collecting Development Stats
          </Typography>
          <Typography variant="body1" align="center" color="textSecondary">
            The leaderboard is being prepared.
          </Typography>
          <Typography
            variant="body2"
            align="center"
            color="textSecondary"
            sx={{ mt: 1, mb: 3, maxWidth: 450 }}
          >
            GitHub statistics will appear here as teams begin coding. Check back
            soon for live updates!
          </Typography>
          <AnimatedPulse sx={{ width: "100%" }}>
            <Grid container spacing={2} sx={{ px: 2 }}>
              {["GitHub Commits", "Pull Requests", "Lines of Code"].map(
                (stat, idx) => (
                  <Grid size={4} key={idx}>
                    <Box
                      sx={{
                        bgcolor: "background.paper",
                        p: 2,
                        borderRadius: 1,
                        boxShadow: 1,
                        height: 80,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        align="center"
                      >
                        {stat}
                      </Typography>
                      <Typography
                        variant="h6"
                        align="center"
                        sx={{ opacity: 0.5 }}
                      >
                        —
                      </Typography>
                    </Box>
                  </Grid>
                ),
              )}
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
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
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
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontFamily: FONT_DISPLAY, fontWeight: 500 }}
          >
            Hackathon Leaderboard
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Live statistics and achievements from ongoing development
          </Typography>
        </Box>
      </Box>
      <OrgBanner sx={{ flexWrap: { xs: "wrap", md: "nowrap" } }}>
        <GitHubIcon fontSize="large" sx={{ mr: 2, flexShrink: 0 }} />
        <FlexContent flexGrow={1} sx={{ mb: { xs: 2, md: 0 } }}>
          <TruncatedText variant="h6" fontWeight="bold" title={hackathonName}>
            {hackathonName}
          </TruncatedText>
          <TruncatedText variant="body2" color="textSecondary">
            All projects and contributions are hosted on GitHub
          </TruncatedText>
        </FlexContent>
        <Box
          sx={{
            flexShrink: 0,
            width: { xs: "100%", md: "auto" },
          }}
        >
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
        {generalStats &&
          generalStats.map((stat, index) => (
            <Grid
              size={{ xs: 6, sm: 4, md: index < 3 ? 4 : 6 }}
              key={index}
              sx={{
                order: {
                  xs: index,
                  md: index < 3 ? 0 : 1,
                },
              }}
            >
              <Tooltip
                title={
                  <Box>
                    <Typography variant="subtitle2">{stat.stat}</Typography>
                    <Typography variant="body2">{stat.description}</Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: "bold", mt: 1 }}
                    >
                      Value: {stat.value.toLocaleString()}
                    </Typography>
                  </Box>
                }
                arrow
                placement="top"
              >
                <StatBox
                  sx={{
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    px: { xs: 1, md: 2 },
                    py: { xs: 1.5, md: 1.5 },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      mb: 1,
                    }}
                  >
                    {renderIcon(stat.icon, {
                      fontSize: "large",
                      sx: { color: "var(--accent, #E2552E)" },
                    })}
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      minWidth: 0,
                    }}
                  >
                    <StatValue
                      variant="h4"
                      sx={{
                        fontSize: "1.3rem",
                        textAlign: "center",
                        lineHeight: 1.2,
                      }}
                    >
                      {stat.value.toLocaleString()}
                    </StatValue>
                    <StatLabel
                      variant="subtitle2"
                      title={stat.stat}
                      sx={{
                        mt: 0.2,
                        textAlign: "center",
                        maxWidth: "100%",
                        lineHeight: 1.2,
                        fontSize: "0.75rem",
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
      <Box sx={{ display: { xs: "block", sm: "none", md: "block" } }}>
        <SectionHeader variant="h6">Individual Achievements</SectionHeader>
        <Grid container spacing={2}>
          {individualAchievements &&
            individualAchievements.map((achievement, index) => {
              const hasUserProfile = achievement.person?.githubUsername;
              const hasRepo = achievement.repo;
              const hasPrLink = hasRepo && achievement.prNumber;
              const hasCommitLink = hasRepo && achievement.commitId;

              return (
                <Grid size={12} key={index}>
                  <AchievementCard
                    sx={{
                      flexDirection: { xs: "row", md: "row" },
                      cursor: hasRepo ? "pointer" : "default",
                      position: "relative",
                      "&:hover": {
                        transform: hasRepo ? "scale(1.02)" : "none",
                        boxShadow: hasRepo ? 3 : 1,
                      },
                    }}
                    component={hasRepo ? Link : Box}
                    href={
                      hasRepo ? getGitHubRepoUrl(achievement.repo) : undefined
                    }
                    target={hasRepo ? "_blank" : undefined}
                    rel={hasRepo ? "noopener" : undefined}
                    underline="none"
                    onClick={(e) => {
                      if (hasPrLink) {
                        e.preventDefault();
                        window.open(
                          getGitHubPrUrl(
                            achievement.repo,
                            achievement.prNumber,
                          ),
                          "_blank",
                        );
                      } else if (hasCommitLink) {
                        e.preventDefault();
                        window.open(
                          getGitHubCommitUrl(
                            achievement.repo,
                            achievement.commitId,
                          ),
                          "_blank",
                        );
                      }
                    }}
                  >
                    <Tooltip
                      title={`View ${achievement.person.name}'s GitHub profile`}
                    >
                      <Avatar
                        src={achievement.person.avatar}
                        alt={achievement.person.name}
                        sx={{
                          width: { xs: 40, md: 48 },
                          height: { xs: 40, md: 48 },
                          mr: { xs: 1.5, md: 2 },
                          cursor: hasUserProfile ? "pointer" : "default",
                          flexShrink: 0,
                          zIndex: 2,
                        }}
                        component={hasUserProfile ? Link : "div"}
                        href={
                          hasUserProfile
                            ? getGitHubUserUrl(
                                achievement.person.githubUsername,
                              )
                            : undefined
                        }
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
                        <Tooltip
                          arrow
                          title={
                            BADGE_CRITERIA[achievement.title] ||
                            achievement.description ||
                            ""
                          }
                        >
                          <TruncatedText
                            variant="subtitle1"
                            fontWeight="bold"
                            title={achievement.title}
                            sx={{ fontSize: { xs: "0.95rem", md: "1rem" } }}
                          >
                            {achievement.title}
                          </TruncatedText>
                        </Tooltip>

                        {achievement.icon && (
                          <Box
                            component="span"
                            ml={1}
                            display="inline-flex"
                            flexShrink={0}
                          >
                            {renderIcon(achievement.icon, { color: "primary" })}
                          </Box>
                        )}

                        {(hasPrLink || hasCommitLink) && (
                          <Tooltip
                            title={
                              hasPrLink
                                ? `View pull request #${achievement.prNumber}`
                                : `View commit ${achievement.commitId?.substring(0, 7)}`
                            }
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
                          sx={{
                            fontSize: { xs: "0.8rem", md: "0.875rem" },
                            mr: 1,
                          }}
                        >
                          {achievement.person.name} • {achievement.person.team}
                        </TruncatedText>

                        {hasRepo && (
                          <Tooltip
                            title={`View repository: ${achievement.repo}`}
                          >
                            <Chip
                              icon={<GitHubIcon fontSize="small" />}
                              label={(() => {
                                const repoName =
                                  achievement.repo.split("/").pop() ||
                                  achievement.repo.split("-").pop();
                                return repoName.length > 30
                                  ? repoName.substring(0, 30) + "..."
                                  : repoName;
                              })()}
                              size="small"
                              variant="outlined"
                              sx={{
                                height: 20,
                                "& .MuiChip-label": {
                                  px: 1,
                                  fontSize: "0.7rem",
                                  maxWidth: "50px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                },
                                "& .MuiChip-icon": {
                                  fontSize: "0.85rem",
                                  ml: 0.5,
                                },
                                zIndex: 2,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(
                                  getGitHubRepoUrl(achievement.repo),
                                  "_blank",
                                );
                              }}
                            />
                          </Tooltip>
                        )}
                      </Box>
                    </FlexContent>

                    <Box
                      sx={{
                        ml: { xs: 0.5, md: 1 },
                        flexShrink: 0,
                        minWidth: { xs: "70px", md: "90px" },
                        textAlign: "right",
                      }}
                    >
                      <Typography
                        variant="h6"
                        noWrap
                        sx={{
                          fontFamily: FONT_DISPLAY,
                          fontWeight: 500,
                          color: "var(--brand, #1B3A6B)",
                          fontSize: { xs: "1.05rem", md: "1.2rem" },
                        }}
                      >
                        {achievement.value}
                      </Typography>
                      {achievement.description && (
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          noWrap
                          sx={{ fontSize: "0.65rem", display: "block" }}
                        >
                          {achievement.description}
                        </Typography>
                      )}
                    </Box>
                  </AchievementCard>
                </Grid>
              );
            })}

          {(!individualAchievements || individualAchievements.length === 0) && (
            <Grid size={12}>
              <Box
                p={3}
                textAlign="center"
                bgcolor="background.paper"
                borderRadius={1}
              >
                <Typography color="textSecondary">
                  No individual achievements to display
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
      <Box sx={{ display: { xs: "block", sm: "none", md: "block" } }}>
        <SectionHeader variant="h6">Team Achievements</SectionHeader>
        <Grid container spacing={2}>
          {teamAchievements &&
            teamAchievements.map((achievement, index) => {
              const hasTeamPage = achievement.teamPage;
              const hasRepo = achievement.repo;

              return (
                <Grid size={12} key={index}>
                  <AchievementCard
                    sx={{
                      flexDirection: "row",
                      p: { xs: 1.5, md: 2 },
                      alignItems: "center",
                      cursor: hasRepo || hasTeamPage ? "pointer" : "default",
                      "&:hover": {
                        transform:
                          hasRepo || hasTeamPage ? "scale(1.02)" : "none",
                        boxShadow: hasRepo || hasTeamPage ? 3 : 1,
                      },
                    }}
                    component={hasRepo || hasTeamPage ? Link : Box}
                    href={
                      hasRepo
                        ? getGitHubRepoUrl(achievement.repo)
                        : hasTeamPage
                          ? getGitHubTeamUrl(achievement.teamPage)
                          : undefined
                    }
                    target={hasRepo || hasTeamPage ? "_blank" : undefined}
                    rel="noopener"
                    underline="none"
                  >
                    <StyledBadge
                      badgeContent={achievement.members}
                      color="primary"
                      overlap="circular"
                      sx={{
                        "& .MuiBadge-badge": {
                          fontSize: "0.7rem",
                          height: "18px",
                          minWidth: "18px",
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          width: { xs: 40, md: 48 },
                          height: { xs: 40, md: 48 },
                          mr: { xs: 1.5, md: 2 },
                          bgcolor:
                            index % 2 === 0 ? "primary.main" : "secondary.main",
                          flexShrink: 0,
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
                          sx={{
                            mr: 1,
                            fontSize: { xs: "0.95rem", md: "1rem" },
                          }}
                        >
                          {achievement.title}
                        </TruncatedText>
                      </Box>

                      <Box display="flex" alignItems="center">
                        <TruncatedText
                          variant="body2"
                          color="textSecondary"
                          title={`${achievement.team} • ${achievement.members} members`}
                          sx={{
                            fontSize: { xs: "0.8rem", md: "0.875rem" },
                            mr: 1,
                          }}
                        >
                          {achievement.team} • {achievement.members} members
                        </TruncatedText>

                        {hasRepo && (
                          <Tooltip
                            title={`View repository: ${achievement.repo}`}
                          >
                            <Chip
                              icon={<GitHubIcon fontSize="small" />}
                              label={
                                achievement.repo.split("/").pop() ||
                                achievement.repo.split("-").pop()
                              }
                              size="small"
                              variant="outlined"
                              sx={{
                                height: 20,
                                "& .MuiChip-label": {
                                  px: 1,
                                  fontSize: "0.7rem",
                                },
                                "& .MuiChip-icon": {
                                  fontSize: "0.85rem",
                                  ml: 0.5,
                                },
                                zIndex: 2,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(
                                  getGitHubRepoUrl(achievement.repo),
                                  "_blank",
                                );
                              }}
                            />
                          </Tooltip>
                        )}
                      </Box>
                      {(BADGE_CRITERIA[achievement.title] ||
                        achievement.description) && (
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          sx={{
                            display: "block",
                            mt: 0.25,
                            whiteSpace: "normal",
                            lineHeight: 1.3,
                          }}
                        >
                          {BADGE_CRITERIA[achievement.title] ||
                            achievement.description}
                        </Typography>
                      )}
                    </FlexContent>

                    <Box
                      sx={{
                        ml: { xs: 0.5, md: 1 },
                        flexShrink: 0,
                        minWidth: { xs: "70px", md: "90px" },
                        textAlign: "right",
                      }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color="primary"
                        noWrap
                        sx={{ fontSize: { xs: "1.1rem", md: "1.25rem" } }}
                      >
                        {achievement.value}
                      </Typography>
                      {achievement.description && (
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          noWrap
                          sx={{ fontSize: "0.65rem", display: "block" }}
                        >
                          {achievement.description}
                        </Typography>
                      )}
                    </Box>
                  </AchievementCard>
                </Grid>
              );
            })}
          {(!teamAchievements || teamAchievements.length === 0) && (
            <Grid size={12}>
              <Box
                p={3}
                textAlign="center"
                bgcolor="background.paper"
                borderRadius={1}
              >
                <Typography color="textSecondary">
                  No team achievements to display
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
      {mentorOpportunities && mentorOpportunities.length > 0 && (
        <Box sx={{ display: { xs: "block", sm: "none", md: "block" } }}>
          <SectionHeader
            variant="h6"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <RocketLaunchIcon
              sx={{ verticalAlign: "middle", color: "var(--accent, #E2552E)" }}
            />
            Teams Ready for a Boost
            <Tooltip
              arrow
              placement="top"
              title={
                <Box sx={{ p: 0.5 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    How teams land here
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <b>Blocked / Needs attention</b> — a mentor raised a flag on
                    the team page.
                  </Typography>
                  <Typography variant="body2">
                    <b>No recent mentor visit</b> — no mentor has checked in for
                    4+ hours during the event.
                  </Typography>
                </Box>
              }
            >
              <InfoOutlinedIcon
                fontSize="small"
                sx={{ color: "var(--muted, #5B6270)", cursor: "help" }}
              />
            </Tooltip>
          </SectionHeader>

          <Typography variant="body2" color="textSecondary" sx={{ mb: 1.5 }}>
            These teams could use a mentor check-in. Flagged or long-untouched
            teams show a specific reason and suggested action below. Others were
            surfaced from GitHub activity. If this is your team, open your team
            page to see the full picture.
          </Typography>

          {/* Legend — states the criteria at a glance */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
            {["blocked_flag", "open_flag", "stale_no_touch"].map((k) => (
              <Chip
                key={k}
                size="small"
                variant="outlined"
                icon={renderIcon(BOOST_REASONS[k].icon, { fontSize: "small" })}
                label={BOOST_REASONS[k].label}
                sx={{
                  borderColor: BOOST_REASONS[k].color,
                  color: BOOST_REASONS[k].color,
                  "& .MuiChip-icon": { color: BOOST_REASONS[k].color },
                }}
              />
            ))}
          </Box>

          <Grid container spacing={2}>
            {mentorOpportunities.map((opportunity, index) => {
              const reason = resolveBoostReason(opportunity);
              const tp = opportunity.teamPage;
              const isAbsolute = !!tp && /^https?:\/\//i.test(tp);
              const href = isAbsolute ? tp : tp ? getGitHubTeamUrl(tp) : null;
              const ctaLabel = isAbsolute
                ? "View team & how to help"
                : "View on GitHub";
              // Default = GitHub-signal-only; no specific flag/stale reason text available.
              // Suppress the WHY + HOW TO HELP sections to avoid identical noise on every card.
              const isDefaultReason = reason === BOOST_REASONS.default;

              return (
                <Grid size={{ xs: 12, md: 6 }} key={index}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      p: 2,
                      height: "100%",
                      borderRadius: "10px",
                      backgroundColor: reason.bg,
                      border: "1px solid var(--line, #E7E1D4)",
                      borderLeft: `4px solid ${reason.color}`,
                    }}
                  >
                    {/* Header: avatar + team name + reason chip + member count */}
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: reason.color,
                          flexShrink: 0,
                        }}
                      >
                        {renderIcon(reason.icon, { sx: { color: "#fff" } })}
                      </Avatar>
                      <FlexContent flexGrow={1}>
                        <TruncatedText
                          variant="subtitle1"
                          fontWeight="bold"
                          title={opportunity.team}
                        >
                          {opportunity.team}
                        </TruncatedText>
                        {/* flexWrap so the chip never squeezes the member count off-screen */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mt: 0.25,
                            flexWrap: "wrap",
                          }}
                        >
                          <Chip
                            size="small"
                            label={reason.label}
                            sx={{
                              bgcolor: reason.color,
                              color: "#fff",
                              fontWeight: 700,
                              height: 20,
                              "& .MuiChip-label": { px: 1, fontSize: "0.7rem" },
                            }}
                          />
                          {typeof opportunity.members === "number" && (
                            <Typography
                              variant="caption"
                              color="textSecondary"
                              sx={{ flexShrink: 0, whiteSpace: "nowrap" }}
                            >
                              {opportunity.members} member
                              {opportunity.members !== 1 ? "s" : ""}
                            </Typography>
                          )}
                        </Box>
                      </FlexContent>
                    </Box>

                    {/* WHY — only for flag/stale cards that carry a real specific reason */}
                    {!isDefaultReason && opportunity.description && (
                      <Typography
                        variant="body2"
                        sx={{ color: "var(--ink, #16181D)" }}
                      >
                        {opportunity.description}
                      </Typography>
                    )}

                    {/* HOW TO HELP — only when we have specific actionable guidance */}
                    {!isDefaultReason && (
                      <Box
                        sx={{
                          display: "flex",
                          gap: 0.75,
                          alignItems: "flex-start",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            color: "var(--muted, #5B6270)",
                            flexShrink: 0,
                            mt: "2px",
                          }}
                        >
                          How to help
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {opportunity.mentor_action || reason.mentorAction}
                        </Typography>
                      </Box>
                    )}

                    {/* CTA — single anchor, no nested <a> */}
                    {href && (
                      <Box sx={{ mt: "auto", pt: 0.5 }}>
                        <Button
                          component="a"
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="small"
                          endIcon={<LaunchIcon />}
                          sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            color: reason.color,
                          }}
                        >
                          {ctaLabel}
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}
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
        <TruncatedText
          variant="caption"
          display="block"
          color="textSecondary"
          mt={1}
        >
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

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  if (hasError) {
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: "background.default" }}>
        <Typography variant="h5" color="error" gutterBottom>
          Error Loading Leaderboard
        </Typography>
        <Typography variant="body2">
          There was a problem loading the leaderboard data. Please check the
          console for more details.
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

HackathonLeaderboardWithErrorBoundary.displayName =
  "HackathonLeaderboardWithErrorBoundary";

export default HackathonLeaderboardWithErrorBoundary;
