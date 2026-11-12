import React, { memo } from "react";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Autocomplete,
  TextField,
} from "@mui/material";
import { FaUserAlt, FaPlus, FaTrash } from "react-icons/fa";

/**
 * Component for managing team members
 */
const TeamMemberManager = memo(
  ({
    teamMembers,
    memberInput,
    handleAddTeamMember,
    handleRemoveTeamMember,
    setMemberInput,
    slackUsers,
    slackChannel,
    error,
  }) => {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Team Members
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Add the other members of your team. People you pick from the list get
          an invite to your team&apos;s Slack channel.
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {slackUsers?.length
            ? `${slackUsers.length} active Slack users available for selection`
            : "Loading Slack users..."}
        </Typography>

        <Box display="flex" alignItems="center" mb={2}>
          <Autocomplete
            freeSolo
            options={slackUsers || []}
            getOptionLabel={(option) =>
              typeof option === "string"
                ? option
                : option.real_name || option.name || ""
            }
            value={memberInput}
            onChange={(_, newValue) => {
              setMemberInput(newValue);
            }}
            onInputChange={(_, newInputValue) => {
              setMemberInput(newInputValue);
            }}
            fullWidth
            renderInput={(params) => (
              <TextField
                {...params}
                label="Team member's name or Slack handle"
                variant="outlined"
                size="small"
                error={!!error && error.includes("team member")}
                helperText={error && error.includes("team member") ? error : ""}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <FaUserAlt style={{ marginRight: 8 }} />
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTeamMember();
                  }
                }}
              />
            )}
          />
          <Button
            // Explicit "button" — this renders inside CreateTeamFlow's
            // <form onSubmit={handleSubmit}>, and `handleAddTeamMember`
            // doesn't call preventDefault, so an implicit-submit button
            // here would also trigger the whole team-creation submit
            // handler on every "Add Member" click (see CreateTeamFlow.js).
            type="button"
            variant="contained"
            color="primary"
            onClick={handleAddTeamMember}
            startIcon={<FaPlus />}
            sx={{ ml: 2, whiteSpace: "nowrap" }}
          >
            Add Member
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Names you type (not picked from the list) won&apos;t get a Slack
          invite — ask them to join{" "}
          {slackChannel ? `#${slackChannel}` : "your team's channel"}.
        </Typography>

        {teamMembers.length > 0 ? (
          <List>
            {teamMembers.map((member, index) => (
              <ListItem
                // Stable key: Slack users by id, typed names by text
                // (handleAddTeamMember rejects duplicates of either).
                key={
                  typeof member === "string"
                    ? `name:${member}`
                    : `slack:${member.id || member.name}`
                }
                secondaryAction={
                  <IconButton
                    type="button"
                    edge="end"
                    aria-label={`Remove ${
                      typeof member === "string"
                        ? member
                        : member.real_name || member.name || "teammate"
                    }`}
                    onClick={() => handleRemoveTeamMember(index)}
                    color="error"
                    size="small"
                  >
                    <FaTrash />
                  </IconButton>
                }
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemText
                  primary={
                    typeof member === "string"
                      ? member
                      : member.real_name || member.name || ""
                  }
                  secondary="Team Member"
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontStyle: "italic", mt: 1 }}
          >
            No team members added yet.
          </Typography>
        )}
      </Box>
    );
  },
);

TeamMemberManager.displayName = "TeamMemberManager";

export default TeamMemberManager;
