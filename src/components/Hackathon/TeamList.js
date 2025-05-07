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

// Reusable Alert component
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// TeamMember component - extracted for better organization
const TeamMember = ({ user }) => {
  if (!user) return null;
  
  // Handle both profile objects and user ID strings
  const userId = typeof user === 'string' ? user : user.user_id || user.id;
  const displayName = user.name || user.nickname || 'User';
  const profileUrl = `/profile/${userId}`;
  const firstLetter = displayName && displayName.length > 0 ? displayName[0] : '?';
  
  return (
    <Grid item>
      <Tooltip
        title={
          <span style={{ fontSize: "12px" }}>
            {`View ${displayName}'s profile`}
          </span>
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
          <Avatar
            src={user.profile_image}
            alt={displayName}
          >
            {firstLetter}
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
        {displayName}
      </Typography>
    </Grid>
  );
};

// Loading component - extracted for reuse
const LoadingIndicator = ({ message }) => (
  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
    <CircularProgress />
    <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
      {message}
    </Typography>
  </Box>
);

// Team Card component - extracted for better organization
const TeamCard = ({ team, userProfile, isLoggedIn, onJoin, onLeave }) => {
  const hasGithubLinks = team.github_links && team.github_links.length > 0;
  
  
  // Check if current user is in the team
  const isUserInTeam = isLoggedIn && userProfile && Array.isArray(team.users) && 
    team.users.some(user => {      
      // Handle both object and string cases
      if (typeof user === 'string') {
        return user === userProfile.user_id;
      }
      return user.id === userProfile.id;
    });

  return (
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
        
        {hasGithubLinks && (
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
          {Array.isArray(team.users) && 
            team.users.map((user, index) => (
              <TeamMember 
                key={typeof user === 'string' ? user : user?.id || `user-${index}`} 
                user={user} 
              />
            ))
          }
        </Grid>
        
        {isLoggedIn && userProfile && (
          <div style={{ marginTop: "10px" }}>
            {isUserInTeam ? (
              <Button
                size="small"
                variant="outlined"
                color="secondary"
                onClick={() => onLeave(team.id)}
              >
                Leave Team
              </Button>
            ) : (
              <Button
                size="small"
                variant="outlined"
                color="primary"
                onClick={() => onJoin(team.id)}
              >
                Join Team
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const TeamList = ({ teams, eventId }) => {  
  const [teamData, setTeamData] = useState(teams);
  const [loading, setLoading] = useState(false);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [userProfile, setUserProfile] = useState(null);
  const { isLoggedIn, accessToken } = useAuthInfo();

  // Fetch detailed profile information for all team members
  const fetchTeamMemberProfiles = useCallback(async (teamsData) => {
    if (!teamsData?.length || !accessToken) return;
    
    setProfilesLoading(true);
    try {
      // Extract unique user IDs from all teams (users are stored as string IDs)
      const userIds = new Set();
      teamsData.forEach(team => {
        if (Array.isArray(team.users)) {
          team.users.forEach(userId => {
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
              { headers: { Authorization: `Bearer ${accessToken}` }}
            );
            
            if (!response.ok) throw new Error(`Failed to fetch profile for user ${userId}`);
            
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
            console.error(`Error fetching profile for user ${userId}:`, error);
            return { userId, error };
          }
        })
      );
      
      // Update teams with detailed user profiles, converting string IDs to profile objects
      const updatedTeams = teamsData.map(team => ({
        ...team,
        users: Array.isArray(team.users) 
          ? team.users.map(userId => profileMap[userId] || { user_id: userId })
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
  }, [accessToken]);

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

  
  useEffect(() => {
    fetchUserProfile();
    // Fetch detailed profiles for team members
    if (teams && teams.length > 0) {
      fetchTeamMemberProfiles(teams);
    }
  }, [teams, fetchUserProfile, fetchTeamMemberProfiles]);

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
        // Update local state by adding the user profile to the team
        // After joining, store the user's full profile object
        setTeamData((prevTeams) =>
          prevTeams.map((team) =>
            team.id === teamId
              ? { 
                  ...team, 
                  users: [...team.users, userProfile]
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
        // Update local state by removing the user from the team
        // Handle both string IDs and user objects
        setTeamData((prevTeams) =>
          prevTeams.map((team) => {
            if (team.id === teamId) {
              return {
                ...team,
                users: team.users.filter(user => {
                  if (typeof user === 'string') {
                    return user !== userProfile.user_id;
                  }
                  return user.user_id !== userProfile.user_id;
                })
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
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return <LoadingIndicator message="Loading teams..." />;
  }

  if (teamData.length === 0) {
    return <Typography>No teams found for this event.</Typography>;
  }

  return (
    <div>      
      <Box mb={2}>
        <Button 
          variant="contained" 
          color="primary" 
          href={`/hack/${eventId}/newteam`}
        >
          Create a Team
        </Button>
      </Box>

      {/* Non-blocking loading indicator while profiles are loading */}
      {profilesLoading && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CircularProgress size={16} sx={{ mr: 1 }} />
          <Typography variant="body2" color="textSecondary">
            Updating team member profiles...
          </Typography>
        </Box>
      )}

      <Grid container spacing={2}>
        {teamData.map((team) => (
          <Grid item xs={12} sm={6} md={4} key={team.id}>
            <TeamCard 
              team={team}
              userProfile={userProfile}
              isLoggedIn={isLoggedIn}
              onJoin={handleJoinTeam}
              onLeave={handleUnjoinTeam}
            />
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
