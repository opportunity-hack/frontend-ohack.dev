import React, { useState, useEffect, useCallback } from "react";
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
} from "@mui/material";
import { useAuthInfo } from "@propelauth/react";
import MuiAlert from "@mui/material/Alert";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const TeamList = ({ teams, eventId }) => {
  const [teamData, setTeamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [userProfile, setUserProfile] = useState(null);
  const { isLoggedIn, accessToken } = useAuthInfo();

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
          console.log("User profile:", data);
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

  const fetchTeamData = useCallback(async () => {
    try {
      const teamPromises = teams.map(async (team) => {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/team/${team.id}`
        );
        const data = await response.json();

        const userPromises = data.users.map(async (userId) => {
          const userResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/profile/${userId}`
          );
          return await userResponse.json();
        });
        const users = await Promise.all(userPromises);

        return { ...data, users };
      });

      const fetchedTeamData = await Promise.all(teamPromises);
      setTeamData(fetchedTeamData);
    } catch (error) {
      console.error("Error fetching team data:", error);
      setSnackbar({
        open: true,
        message: "Error fetching team data",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [teams]);

  useEffect(() => {
    fetchUserProfile();
    if (teams && teams.length > 0) {
      fetchTeamData();
    } else {
      setLoading(false);
    }
  }, [teams, fetchTeamData, fetchUserProfile]);

  const handleJoinTeam = async (teamId) => {
    try {
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
        setTeamData((prevTeams) =>
          prevTeams.map((team) =>
            team.id === teamId
              ? { ...team, users: [...team.users, userProfile] }
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
    }
  };

  const handleUnjoinTeam = async (teamId) => {
    try {
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
        setTeamData((prevTeams) =>
          prevTeams.map((team) =>
            team.id === teamId
              ? {
                  ...team,
                  users: team.users.filter(
                    (u) => u.user_id !== userProfile.user_id
                  ),
                }
              : team
          )
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
      console.error("Error unjoining team:", error);
      setSnackbar({
        open: true,
        message: "Error leaving team",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (teamData.length === 0) {
    return <Typography>No teams found for this event.</Typography>;
  }

  console.log("Team data:", teamData);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Teams
      </Typography>

      <Box mb={2}>
        <Button variant="contained" color="primary" href={`/hack/newteam`}>
          Create a Team
        </Button>
      </Box>

      <Grid container spacing={2}>
        {teamData.map((team) => (
          <Grid item xs={12} sm={6} md={4} key={team.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{team.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Slack Channel:{" "}
                  <Link
                    href={`https://opportunity-hack.slack.com/app_redirect?channel=${team.slack_channel}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {team.slack_channel}
                  </Link>
                </Typography>
                {team.github_links && team.github_links.length > 0 && (
                  <Link
                    href={team.github_links[0].link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub Repository
                  </Link>
                )}
                <Typography variant="subtitle1" style={{ marginTop: "10px" }}>
                  Team Members:
                </Typography>
                <Grid container spacing={1}>
                  {team.users &&
                    team.users.map(
                      (user) =>
                        user && (
                          <Grid item key={user.id}>
                            <Tooltip
                              title=<span style={{ fontSize: "12px" }}>
                              {`View ${user.name || user.nickname}'s profile`}
                            </span>
                            >
                              <IconButton
                                component={Link}
                                href={`/profile/${user.id}`}
                                aria-label={`${user.name || user.nickname}'s profile`}
                                sx={{
                                  p: 0,
                                  "&:hover": {
                                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                                  },
                                }}
                              >
                                <Avatar
                                  src={user.profile_image}
                                  alt={user.name || user.nickname}
                                >
                                  {user.name || user.nickname
                                    ? (user.name || user.nickname)[0]
                                    : "?"}
                                </Avatar>
                              </IconButton>
                            </Tooltip>
                            <Typography
                              variant="caption"
                              display="block"
                              align="center"
                              sx={{
                                mt: 0.5,
                                maxWidth: 64,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {user.name || user.nickname}
                            </Typography>
                          </Grid>
                        )
                    )}
                </Grid>
                {isLoggedIn && userProfile && (
                  <div style={{ marginTop: "10px" }}>
                    {team.users.some(
                      (u) => u.user_id === userProfile.user_id
                    ) ? (
                      <Button
                        size="small"
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleUnjoinTeam(team.id)}
                      >
                        Leave Team
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={() => handleJoinTeam(team.id)}
                      >
                        Join Team
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
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
