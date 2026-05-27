import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NextLink from "next/link";
import dynamic from "next/dynamic";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  CircularProgress,
  Chip,
  Divider,
  Avatar,
  Link,
  Paper,
  Alert,
  Skeleton,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  GitHub as GitHubIcon,
  VideoLibrary as VideoIcon,
  Group as GroupIcon,
  Launch as LaunchIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import { FaSlack, FaHeart } from "react-icons/fa";
import { isWinningStatus } from "../../../../constants/teamStatus";

const VideoDisplay = dynamic(
  () => import("../../../../components/VideoDisplay/VideoDisplay"),
  { ssr: false }
);

const MentorTeamPanel = dynamic(
  () => import("../../../../components/Teams/MentorTeamPanel"),
  {
    ssr: false,
    loading: () => <Skeleton variant="rectangular" height={420} sx={{ mb: 3, borderRadius: 1 }} />,
  }
);

const TeamCompletionChecklist = dynamic(
  () => import("../../../../components/Teams/TeamCompletionChecklist"),
  {
    ssr: false,
    loading: () => <Skeleton variant="rectangular" height={520} sx={{ mb: 3, borderRadius: 1 }} />,
  }
);

const COMPLETION_VISIBLE_STATUSES = new Set(["DEPLOYED", "NONPROFIT_SIGNOFF"]);

export default function TeamDetailPage({ teamData, eventData, problemStatementsData, nonprofitName: initialNonprofitName }) {
  const router = useRouter();
  const { event_id, team_id } = router.query;
  const [loading, setLoading] = useState(!teamData);
  const [team, setTeam] = useState(teamData || null);
  const [event, setEvent] = useState(eventData || null);
  const [error, setError] = useState(null);
  const [problemStatements, setProblemStatements] = useState(problemStatementsData || []);
  const [nonprofitName, setNonprofitName] = useState(initialNonprofitName || null);

  useEffect(() => {
    if (!event_id || !team_id) return;

    // Always refetch team data on the client after hydration so that newly-added
    // team members (and other live mutations like checklist toggles) are reflected
    // immediately — ISR (revalidate: 60) + the backend's 10-min TTL on get_team
    // would otherwise show stale users[] for several minutes.
    const hadSsrData = !!(teamData && eventData);

    const fetchData = async () => {
      if (!hadSsrData) setLoading(true);
      try {
        const [teamRes, eventRes] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/team/${team_id}`
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${event_id}`
          ),
        ]);

        if (!teamRes.ok) {
          if (!hadSsrData) setError("Team not found");
          return;
        }

        const teamJson = await teamRes.json();
        const eventJson = eventRes.ok ? await eventRes.json() : null;

        const teamObj = teamJson.team || teamJson;
        setTeam(teamObj);
        if (eventJson) setEvent(eventJson);

        if (teamObj.problem_statements?.length > 0) {
          const psDetails = await fetchProblemStatementDetails(teamObj.problem_statements);
          setProblemStatements(psDetails);
        }

        if (teamObj.selected_nonprofit_id) {
          fetchNonprofitName(teamObj.selected_nonprofit_id);
        }
      } catch (err) {
        console.error("Error fetching team data:", err);
        if (!hadSsrData) setError("Failed to load team details");
      } finally {
        if (!hadSsrData) setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event_id, team_id]);

  const fetchNonprofitName = async (nonprofitId) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npo/${nonprofitId}`
      );
      if (res.ok) {
        const data = await res.json();
        // API returns { nonprofits: { name, ... } }
        setNonprofitName(data.nonprofits?.name || data.name || null);
      }
    } catch (err) {
      console.error("Error fetching nonprofit:", err);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          Loading team details...
        </Typography>
      </Container>
    );
  }

  if (error || !team) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || "Team not found"}
        </Alert>
        <Button
          component={NextLink}
          href={`/hack/${event_id}`}
          startIcon={<BackIcon />}
          variant="outlined"
        >
          Back to Event
        </Button>
      </Container>
    );
  }

  const teamName = team.name || "Unnamed Team";
  const eventName = event?.title || event?.event_id || event_id;
  const isActive = team.active === "True" || team.active === true;
  const hasGithubLinks = team.github_links?.length > 0;
  const memberCount = Array.isArray(team.users) ? team.users.length : 0;
  const showCompletionChecklist =
    isWinningStatus(team.status) || COMPLETION_VISIBLE_STATUSES.has(team.status);
  const eventHasStarted = (() => {
    if (!event?.start_date) return false;
    const start = new Date(event.start_date);
    return !Number.isNaN(start.getTime()) && start <= new Date();
  })();

  const pageTitle = `${teamName} | ${eventName} | Opportunity Hack`;
  const pageDescription = `Team ${teamName} participating in ${eventName}. ${memberCount} member${memberCount !== 1 ? "s" : ""}.`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={`https://ohack.dev/hack/${event_id}/team/${team_id}`}
        />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Head>

      <Container maxWidth="md" sx={{ py: 4, mt: 5 }}>
        {/* Back navigation */}
        <Button
          component={NextLink}
          href={`/hack/${event_id}`}
          startIcon={<BackIcon />}
          sx={{ mb: 3 }}
        >
          Back to {eventName}
        </Button>

        {/* Team Header */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <GroupIcon sx={{ fontSize: 32, mr: 1.5, color: "primary.main" }} />
            <Box>
              <Typography variant="h4" component="h1">
                {teamName}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                <Chip
                  label={isActive ? "Active" : "Inactive"}
                  color={isActive ? "success" : "default"}
                  size="small"
                />
                {team.status && (
                  <Chip
                    label={team.status}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
                <Chip
                  label={`${memberCount} member${memberCount !== 1 ? "s" : ""}`}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Box>
          </Box>

          {/* Event context */}
          <Typography variant="body2" color="textSecondary">
            Participating in{" "}
            <Link component={NextLink} href={`/hack/${event_id}`}>
              {eventName}
            </Link>
          </Typography>

          {/* Nonprofit */}
          {(nonprofitName || team.selected_nonprofit_id) && (
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <FaHeart style={{ marginRight: 8, color: "#e91e63", fontSize: 14 }} />
              <Typography variant="body2" color="textSecondary">
                <strong>Nonprofit:</strong>{" "}
                {nonprofitName || team.selected_nonprofit_id}
              </Typography>
            </Box>
          )}

          {/* Created date */}
          {team.created && (
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <CalendarIcon sx={{ fontSize: 14, mr: 1, color: "text.secondary" }} />
              <Typography variant="caption" color="textSecondary">
                Created: {new Date(team.created).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Mentor Support Panel — visible to everyone once the event has started */}
        {eventHasStarted && (
          <MentorTeamPanel
            team={team}
            event={event}
            eventId={event_id}
            onTeamUpdate={(updated) => setTeam(updated)}
          />
        )}

        {/* Project Completion Checklist (winning teams only) */}
        {showCompletionChecklist && (
          <TeamCompletionChecklist
            team={team}
            eventId={event_id}
            onTeamUpdate={(updated) => setTeam(updated)}
          />
        )}

        {/* Team Links */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Slack Channel */}
          {team.slack_channel && (
            <Grid item xs={12} sm={6} md={4}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <FaSlack style={{ fontSize: 20, color: "#4A154B" }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Slack Channel
                    </Typography>
                    <Link
                      href={`https://opportunity-hack.slack.com/app_redirect?channel=${team.slack_channel}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="body2"
                    >
                      #{team.slack_channel}
                    </Link>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* GitHub Repository */}
          {hasGithubLinks && (
            <Grid item xs={12} sm={6} md={4}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <GitHubIcon sx={{ fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      GitHub Repository
                    </Typography>
                    <Link
                      href={team.github_links[0].link}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="body2"
                    >
                      View Code
                    </Link>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* DevPost Link */}
          {team.devpost_link && (
            <Grid item xs={12} sm={6} md={4}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LaunchIcon sx={{ fontSize: 20, color: "#003E54" }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      DevPost Submission
                    </Typography>
                    <Link
                      href={team.devpost_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="body2"
                    >
                      View Submission
                    </Link>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        {/* Demo Video Embed */}
        {team.demo_video_url && (
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <VideoIcon sx={{ fontSize: 20, color: "#FF0000", mr: 1 }} />
              <Typography variant="h6">Demo Video</Typography>
            </Box>
            <VideoDisplay
              url={team.demo_video_url}
              title={`${teamName} Demo`}
            />
          </Paper>
        )}

        {/* Problem Statements */}
        {problemStatements.length > 0 && (
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <FaHeart style={{ marginRight: 8, color: "#e91e63", fontSize: 18 }} />
              <Typography variant="h6">
                Problem Statement{problemStatements.length > 1 ? "s" : ""}
              </Typography>
            </Box>
            {problemStatements.map((ps, index) => (
              <Box key={ps.id || index} sx={{ ml: 1, mb: index < problemStatements.length - 1 ? 2 : 0 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {ps.title || "Untitled Problem Statement"}
                </Typography>
                {ps.description && (
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                    {ps.description.length > 300
                      ? `${ps.description.substring(0, 300)}...`
                      : ps.description}
                  </Typography>
                )}
                {ps.id && (
                  <Link
                    component={NextLink}
                    href={`/project/${ps.id}`}
                    variant="body2"
                    sx={{ mt: 0.5, display: "inline-block" }}
                  >
                    View full project details →
                  </Link>
                )}
              </Box>
            ))}
          </Paper>
        )}

        {/* Team Members */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            <GroupIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Team Members ({memberCount})
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {memberCount > 0 ? (
            <Grid container spacing={2}>
              {team.users.map((user, index) => {
                const isObject = typeof user === "object" && user !== null;
                const displayName = isObject
                  ? user.name || user.nickname || `Team member #${index + 1}`
                  : `Team member #${index + 1}`;
                const profileImage = isObject ? user.profile_image : null;
                const dbId = isObject ? user.id : user;
                const key = dbId || `member-${index}`;

                const tileInner = (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      p: 1,
                      borderRadius: 1,
                      transition: "background-color 150ms ease",
                      "&:hover": dbId ? { backgroundColor: "rgba(0,0,0,0.04)" } : {},
                    }}
                  >
                    <Avatar
                      src={profileImage}
                      alt={displayName}
                      sx={{ width: 56, height: 56, mb: 1 }}
                    >
                      {displayName?.[0] || "?"}
                    </Avatar>
                    <Typography variant="body2" noWrap sx={{ maxWidth: "100%" }}>
                      {displayName}
                    </Typography>
                  </Box>
                );

                return (
                  <Grid item xs={6} sm={4} md={3} key={key}>
                    {dbId ? (
                      <Link
                        component={NextLink}
                        href={`/profile/${dbId}`}
                        underline="none"
                        color="inherit"
                      >
                        {tileInner}
                      </Link>
                    ) : (
                      tileInner
                    )}
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Typography variant="body2" color="textSecondary">
              No members yet. Be the first to join!
            </Typography>
          )}
        </Paper>

        {/* Actions */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button
            component={NextLink}
            href={`/hack/${event_id}/findteam`}
            variant="contained"
            color="primary"
          >
            Find a Team
          </Button>
          <Button
            component={NextLink}
            href={`/hack/${event_id}`}
            variant="outlined"
          >
            View All Teams
          </Button>
        </Box>
      </Container>
    </>
  );
}

// Helper to fetch problem statement details from IDs
async function fetchProblemStatementDetails(problemStatementIds) {
  if (!problemStatementIds?.length) return [];

  const results = await Promise.all(
    problemStatementIds.map(async (psId) => {
      // Handle case where it's already an object
      if (typeof psId === "object" && psId !== null) {
        return psId;
      }
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/problem_statement/${psId}`
        );
        if (res.ok) {
          const data = await res.json();
          return { id: psId, title: data.title, description: data.description, ...data };
        }
      } catch (err) {
        console.error(`Error fetching problem statement ${psId}:`, err);
      }
      return { id: psId, title: null, description: null };
    })
  );

  return results;
}

export async function getStaticProps({ params }) {
  const { event_id, team_id } = params;

  try {
    const [teamRes, eventRes] = await Promise.all([
      fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/team/${team_id}`
      ),
      fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${event_id}`
      ),
    ]);

    const teamRaw = teamRes.ok ? await teamRes.json() : null;
    const eventData = eventRes.ok ? await eventRes.json() : null;

    // API returns { team: { ... } } wrapper
    const teamData = teamRaw?.team || teamRaw;

    if (!teamData) {
      return { notFound: true };
    }

    // Fetch problem statement details
    let problemStatementsData = [];
    if (teamData.problem_statements?.length > 0) {
      problemStatementsData = await fetchProblemStatementDetails(teamData.problem_statements);
    }

    // Fetch nonprofit name if team has selected_nonprofit_id
    let nonprofitName = null;
    if (teamData.selected_nonprofit_id) {
      try {
        const npoRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npo/${teamData.selected_nonprofit_id}`
        );
        if (npoRes.ok) {
          const npoData = await npoRes.json();
          // API returns { nonprofits: { name, ... } }
          nonprofitName = npoData.nonprofits?.name || npoData.name || null;
        }
      } catch (err) {
        console.error("Error fetching nonprofit:", err);
      }
    }

    return {
      props: {
        teamData,
        eventData,
        problemStatementsData,
        nonprofitName,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Error fetching team data:", error);
    return {
      notFound: true,
    };
  }
}

export async function getStaticPaths() {
  // Use blocking fallback so pages are generated on first request
  return {
    paths: [],
    fallback: "blocking",
  };
}
