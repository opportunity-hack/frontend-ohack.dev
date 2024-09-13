import React from "react";
import {
  Typography,
  Paper,
  Grid,
  Chip,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Divider,
} from "@mui/material";
import {
  GitHub,
  Code,
  MergeType,
  BugReport,
  RateReview,
  Visibility,
} from "@mui/icons-material";

const GitHubContributions = ({ githubHistory }) => {
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

  // Sort repositories by total contributions
  const sortedRepos = [...githubHistory].sort((a, b) => {
    const totalA = a.commit_count + a.pr_count + a.issue_count + a.review_count;
    const totalB = b.commit_count + b.pr_count + b.issue_count + b.review_count;
    return totalB - totalA;
  });

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom display="flex" alignItems="center">
        <GitHub sx={{ mr: 1 }} />
        GitHub Contributions
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Chip
            icon={<Code />}
            label={`${totalCommits} Commits`}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Chip
            icon={<MergeType />}
            label={`${totalPRs} Pull Requests`}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Chip
            icon={<BugReport />}
            label={`${totalIssues} Issues`}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Chip
            icon={<RateReview />}
            label={`${totalReviews} Reviews`}
            color="success"
          />
        </Grid>
      </Grid>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" gutterBottom>
        Contributions by Repository
      </Typography>
      <Grid container spacing={2}>
        {sortedRepos.map((repo) => (
          <Grid item xs={12} sm={6} md={4} key={repo.repo_name}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom noWrap>
                  {repo.repo_name}
                </Typography>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    <Code fontSize="small" /> Commits
                  </Typography>
                  <Typography variant="body2">{repo.commit_count}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    <MergeType fontSize="small" /> PRs
                  </Typography>
                  <Typography variant="body2">{repo.pr_count}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    <BugReport fontSize="small" /> Issues
                  </Typography>
                  <Typography variant="body2">{repo.issue_count}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    <RateReview fontSize="small" /> Reviews
                  </Typography>
                  <Typography variant="body2">{repo.review_count}</Typography>
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<Visibility />}
                  href={`https://github.com/${repo.repo_full_name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Repo
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      {githubHistory.length > 0 && (
        <Box mt={2}>
          <Typography variant="body2" color="text.secondary">
            Last updated:{" "}
            {new Date(githubHistory[0].collected_at).toLocaleString()}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default GitHubContributions;
