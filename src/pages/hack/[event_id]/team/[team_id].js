import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NextLink from "next/link";
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
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  GitHub as GitHubIcon,
  VideoLibrary as VideoIcon,
  Group as GroupIcon,
  Launch as LaunchIcon,
} from "@mui/icons-material";
import { FaSlack, FaHeart } from "react-icons/fa";

export default function TeamDetailPage({ teamData, eventData }) {
  const router = useRouter();
  const { event_id, team_id } = router.query;
  const [loading, setLoading] = useState(!teamData);
  const [team, setTeam] = useState(teamData || null);
  const [event, setEvent] = useState(eventData || null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (teamData && eventData) return;
    if (!event_id || !team_id) return;

    const fetchData = async () => {
      setLoading(true);
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
          setError("Team not found");
          setLoading(false);
          return;
        }

        const teamJson = await teamRes.json();
        const eventJson = eventRes.ok ? await eventRes.json() : null;

        setTeam(teamJson);
        setEvent(eventJson);
      } catch (err) {
        console.error("Error fetching team data:", err);
        setError("Failed to load team details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [event_id, team_id, teamData, eventData]);

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
        </Paper>

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

          {/* Demo Video */}
          {team.demo_video_url && (
            <Grid item xs={12} sm={6} md={4}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <VideoIcon sx={{ fontSize: 20, color: "#FF0000" }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Demo Video
                    </Typography>
                    <Link
                      href={team.demo_video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="body2"
                    >
                      Watch Demo
                    </Link>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        {/* Nonprofit Information */}
        {team.problem_statements && team.problem_statements.length > 0 && (
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <FaHeart style={{ marginRight: 8, color: "#e91e63", fontSize: 18 }} />
              <Typography variant="h6">Problem Statement</Typography>
            </Box>
            {team.problem_statements.map((ps, index) => (
              <Box key={index} sx={{ ml: 3 }}>
                <Typography variant="body2">
                  {typeof ps === "string" ? ps : ps.title || ps.name || "View problem statement"}
                </Typography>
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
                  ? user.name || user.nickname || "Team Member"
                  : "Team Member";
                const profileImage = isObject ? user.profile_image : null;
                const userId = isObject ? user.user_id || user.id : user;

                return (
                  <Grid item xs={6} sm={4} md={3} key={userId || index}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
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

    const teamData = teamRes.ok ? await teamRes.json() : null;
    const eventData = eventRes.ok ? await eventRes.json() : null;

    if (!teamData) {
      return { notFound: true };
    }

    return {
      props: {
        teamData,
        eventData,
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
