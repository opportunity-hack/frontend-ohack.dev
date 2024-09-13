import React, { useRef } from "react";
import { Typography, Paper, Grid, Chip, Box, Button } from "@mui/material";
import {
  GitHub,
  Code,
  MergeType,
  BugReport,
  RateReview,
  Share,
} from "@mui/icons-material";
import html2canvas from "html2canvas";

const ShareableGitHubContributions = ({ githubHistory, userName }) => {
  const shareableRef = useRef(null);

  if (!githubHistory || githubHistory.length === 0) {
    return null;
  }

  const totalCommits = githubHistory.reduce(
    (sum, repo) => sum + repo.commit_count,
    0
  );
  const totalPRs = githubHistory.reduce((sum, repo) => sum + repo.pr_count, 0);
  const totalIssues = githubHistory.reduce(
    (sum, repo) => sum + repo.issue_count,
    0
  );
  const totalReviews = githubHistory.reduce(
    (sum, repo) => sum + repo.review_count,
    0
  );

  const handleShare = async () => {
    if (shareableRef.current) {
      try {
        const canvas = await html2canvas(shareableRef.current);
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = "my-opportunity-hack-contributions.png";
        link.click();
      } catch (error) {
        console.error("Error generating image:", error);
      }
    }
  };

  return (
    <Box sx={{ mt: 3, mb: 3 }}>
      <Paper
        elevation={3}
        sx={{ p: 3, backgroundColor: "#f5f5f5" }}
        ref={shareableRef}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <img
            src="https://cdn.ohack.dev/ohack.dev/logos/OpportunityHack_2Letter_Dark_Blue.png"
            alt="Opportunity Hack Logo"
            style={{ height: "40px" }}
          />
          <Typography variant="h6" color="primary">
            My Opportunity Hack Contributions
          </Typography>
        </Box>
        <Typography
          variant="h5"
          gutterBottom
          display="flex"
          alignItems="center"
        >
          <GitHub sx={{ mr: 1 }} />
          {userName}'s GitHub Impact
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={3}>
            <Chip
              icon={<Code />}
              label={`${totalCommits} Commits`}
              color="primary"
            />
          </Grid>
          <Grid item xs={3}>
            <Chip
              icon={<MergeType />}
              label={`${totalPRs} PRs`}
              color="secondary"
            />
          </Grid>
          <Grid item xs={3}>
            <Chip
              icon={<BugReport />}
              label={`${totalIssues} Issues`}
              color="info"
            />
          </Grid>
          <Grid item xs={3}>
            <Chip
              icon={<RateReview />}
              label={`${totalReviews} Reviews`}
              color="success"
            />
          </Grid>
        </Grid>
        <Typography variant="body2" color="text.secondary" align="center">
          Contributed to {githubHistory.length} repositories
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          Join us at ohack.dev
        </Typography>
      </Paper>
      <Box mt={2} display="flex" justifyContent="center">
        <Button
          variant="contained"
          color="primary"
          startIcon={<Share />}
          onClick={handleShare}
        >
          Share My Contributions
        </Button>
      </Box>
    </Box>
  );
};

export default ShareableGitHubContributions;