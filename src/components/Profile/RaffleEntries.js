import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Chip,
  Button,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { Star, GitHub, Person, EmojiEvents } from "@mui/icons-material";
import { profileFields } from "./profileFields";
import axios from "axios";
import { trackEvent, initFacebookPixel } from "../../lib/ga";

const RaffleEntries = ({ profile, githubHistory }) => {
  const [giveawayEntries, setGiveawayEntries] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const completedFields = profileFields.filter(
    (field) => profile[field.name]
  ).length;
  const profileEntries = completedFields * 5;

  const githubEntries = githubHistory.reduce((total, contribution) => {
    return (
      total +
      contribution.commits +
      contribution.pull_requests.total +
      contribution.issues.total +
      contribution.reviews
    );
  }, 0);

  const totalEntries = profileEntries + githubEntries;

  const uniqueRepos = [
    ...new Set(
      githubHistory.map(
        (contribution) => `${contribution.org_name}/${contribution.repo_name}`
      )
    ),
  ];

  useEffect(() => {
    initFacebookPixel();
    fetchGiveawayEntries();        
  }, []);

  const fetchGiveawayEntries = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/giveaway`
      );
      console.log("Giveaway entries:", response.data.giveaways);
      const sortedEntries = response.data.giveaways.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      setGiveawayEntries(sortedEntries.slice(0, 50));
    } catch (error) {
      console.error("Error fetching giveaway entries:", error);
    }
  };

  const handleEnterGiveaway = async () => {

    // Limit gitHubEntries to maximum of 45
    const realGitHubEntries = githubEntries > 45 ? 45 : githubEntries;
    const realTotalEntries = profileEntries + realGitHubEntries;
    

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/giveaway`,
        {
          entries: realTotalEntries,
          giveaway_id: "2024_fall",
          giveaway_data: {
            profileEntries: profileEntries,
            githubEntries: realGitHubEntries,
          },
        }
      );

      trackEvent("giveaway", {
        action: "enter",
        label: "Entered giveaway",
        value: totalEntries,
      });
      


      fetchGiveawayEntries();
      setSnackbar({
        open: true,
        message: "You've been entered into the giveaway!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error entering giveaway:", error);
      setSnackbar({
        open: true,
        message: "Failed to enter giveaway. Please try again.",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  const mostRecentEntry = giveawayEntries[0];

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom display="flex" alignItems="center">
        <EmojiEvents sx={{ mr: 1 }} color="primary" />
        Giveaway Entries
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
                OHack.dev Profile Completeness
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
                {githubHistory[0]?.login}'s GitHub Contributions
              </Typography>
            }
            secondary={
              <>
                <Typography>{`${githubEntries} entries`}</Typography>
                <Typography variant="body2">{`Contributions across ${uniqueRepos.length} repositories`}</Typography>
              </>
            }
          />
        </ListItem>
      </List>

      <Divider sx={{ my: 2 }} />

      <Typography variant="body2" color="text.secondary" gutterBottom>
        You get 5 entries for each completed profile field and 1 entry for each
        GitHub contribution (commit, PR, issue, or review). Maximum of 45 entries.
      </Typography>

      <Box mt={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleEnterGiveaway}
          startIcon={<EmojiEvents />}
        >
          Enter Giveaway
        </Button>
      </Box>

      {giveawayEntries.length > 0 && (
        <>
          <Typography variant="body2" color="text.secondary" mt={2}>
            Your most recent entry:{" "}
            {new Date(mostRecentEntry.timestamp).toLocaleString()} with{" "}
            {mostRecentEntry.entries} entries.
          </Typography>
          <Typography variant="body2" color="primary" mt={1}>
            Note: Your most recent entry will be used for the giveaway.
          </Typography>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Entry Date</TableCell>
                  <TableCell align="right">Entries</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {giveawayEntries.map((entry, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      "&:first-of-type td, &:first-of-type th": {
                        fontWeight: "bold",
                      },
                    }}
                  >
                    <TableCell component="th" scope="row">
                      {new Date(entry.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell align="right">{entry.entries}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <Typography variant="body2" color="error" mt={2}>
        Note: You must be present to win this giveaway.
      </Typography>

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
    </Paper>
  );
};

export default RaffleEntries;
