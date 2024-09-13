import React from "react";
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Chip,
} from "@mui/material";
import { Star, GitHub, Person } from "@mui/icons-material";
import { profileFields } from "./profileFields";

const RaffleEntries = ({ profile, githubHistory }) => {
  const completedFields = profileFields.filter(
    (field) => profile[field.name]
  ).length;
  const profileEntries = completedFields * 5;

  const githubEntries = githubHistory.reduce((total, repo) => {
    return (
      total +
      repo.commit_count +
      repo.pr_count +
      repo.issue_count +
      repo.review_count
    );
  }, 0);

  const totalEntries = profileEntries + githubEntries;

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom display="flex" alignItems="center">
        <Star sx={{ mr: 1 }} color="primary" />
        Your Raffle Entries
      </Typography>

      <Box display="flex" justifyContent="center" mb={2}>
        <Chip
          icon={<Star />}
          label={`Total Entries: ${totalEntries}`}
          color="primary"
          size="large"
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      <List>
        <ListItem>
          <ListItemText
            primary={
              <Typography variant="h6" display="flex" alignItems="center">
                <Person sx={{ mr: 1 }} />
                Profile Completeness
              </Typography>
            }
            secondary={`${profileEntries} entries (${completedFields} / ${profileFields.length} fields completed)`}
          />
        </ListItem>

        <ListItem>
          <ListItemText
            primary={
              <Typography variant="h6" display="flex" alignItems="center">
                <GitHub sx={{ mr: 1 }} />
                GitHub Contributions
              </Typography>
            }
            secondary={`${githubEntries} entries`}
          />
        </ListItem>
      </List>

      <Divider sx={{ my: 2 }} />

      <Typography variant="body2" color="text.secondary">
        You get 5 entries for each completed profile field and 1 entry for each
        GitHub contribution (commit, PR, issue, or review).
      </Typography>
    </Paper>
  );
};

export default RaffleEntries;
