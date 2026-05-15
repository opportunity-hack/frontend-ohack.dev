import React from "react";
import {
  Typography,
  Avatar,
  Grid,
  Link,
  Box,
  Tooltip,
  IconButton,
} from "@mui/material";
import { FaGithub } from "react-icons/fa";

const TeamMember = ({ user, isCurrentUser }) => {
  if (!user) return null;

  const userId = typeof user === "string" ? user : user.user_id || user.id;
  const displayName =
    typeof user === "string" ? "" : user.name || user.nickname || "";
  const githubUsername =
    typeof user === "string" ? null : user.github || user.github_username;

  const cleanGithubUsername = githubUsername
    ? githubUsername.replace(/^https?:\/\/(www\.)?github\.com\//, "")
    : null;
  const profileUrl = `/profile/${userId}`;
  const firstLetter = displayName && displayName.length > 0 ? displayName[0] : "?";
  const profileImage = typeof user === "string" ? undefined : user.profile_image;

  return (
    <Grid>
      <Tooltip
        title={
          <Box sx={{ fontSize: "12px" }}>
            <div>
              {isCurrentUser
                ? "This is you"
                : displayName
                  ? `View ${displayName}'s profile`
                  : "View profile"}
            </div>
            {cleanGithubUsername && (
              <div style={{ marginTop: "4px", fontSize: "11px", opacity: 0.8 }}>
                <FaGithub style={{ marginRight: "4px", fontSize: "10px" }} />@
                {cleanGithubUsername}
              </div>
            )}
          </Box>
        }
      >
        <IconButton
          component={Link}
          href={profileUrl}
          aria-label={`${displayName || "Team member"}'s profile`}
          sx={{
            p: 0,
            "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
          }}
        >
          <Avatar
            src={profileImage}
            alt={displayName}
            sx={{
              ...(isCurrentUser && {
                border: "4px solid #3f51b5",
                boxShadow: "0 0 4px rgba(63, 81, 181, 0.5)",
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
            sx={{
              fontSize: "10px",
              color: "text.secondary",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              mt: 0.25,
            }}
          >
            <FaGithub style={{ marginRight: "2px", fontSize: "8px" }} />@
            {cleanGithubUsername}
          </Typography>
        )}
      </Box>
    </Grid>
  );
};

export default TeamMember;
