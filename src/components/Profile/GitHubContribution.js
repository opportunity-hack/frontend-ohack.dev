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
    (sum, contribution) => sum + contribution.commits,
    0
  );
  const totalPRs = githubHistory.reduce(
    (sum, contribution) => sum + contribution.pull_requests.total,
    0
  );
  const totalIssues = githubHistory.reduce(
    (sum, contribution) => sum + contribution.issues.total,
    0
  );
  const totalReviews = githubHistory.reduce(
    (sum, contribution) => sum + contribution.reviews,
    0
  );

  // Group contributions by repository
  const repoContributions = githubHistory.reduce((acc, contribution) => {
    const key = `${contribution.org_name}/${contribution.repo_name}`;
    if (!acc[key]) {
      acc[key] = {
        org_name: contribution.org_name,
        repo_name: contribution.repo_name,
        commits: 0,
        pull_requests: 0,
        issues: 0,
        reviews: 0,
      };
    }
    acc[key].commits += contribution.commits;
    acc[key].pull_requests += contribution.pull_requests.total;
    acc[key].issues += contribution.issues.total;
    acc[key].reviews += contribution.reviews;
    return acc;
  }, {});

  // Sort repositories by total contributions
  const sortedRepos = Object.values(repoContributions).sort((a, b) => {
    const totalA = a.commits + a.pull_requests + a.issues + a.reviews;
    const totalB = b.commits + b.pull_requests + b.issues + b.reviews;
    return totalB - totalA;
  });

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom display="flex" alignItems="center">
        <GitHub sx={{ mr: 1 }} />
        GitHub Contributions for @<strong>{githubHistory[0].login}</strong>
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
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={`${repo.org_name}/${repo.repo_name}`}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom noWrap>
                  {repo.repo_name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {repo.org_name}
                </Typography>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    <Code fontSize="small" /> Commits
                  </Typography>
                  <Typography variant="body2">{repo.commits}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    <MergeType fontSize="small" /> PRs
                  </Typography>
                  <Typography variant="body2">{repo.pull_requests}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    <BugReport fontSize="small" /> Issues
                  </Typography>
                  <Typography variant="body2">{repo.issues}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    <RateReview fontSize="small" /> Reviews
                  </Typography>
                  <Typography variant="body2">{repo.reviews}</Typography>
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<Visibility />}
                  href={`https://github.com/${repo.org_name}/${repo.repo_name}`}
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
            {new Date(githubHistory[0].timestamp).toLocaleString()}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default GitHubContributions;
