import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Tabs,
  Tab,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  Avatar,
  IconButton,
  Tooltip,
  Badge,
  Divider
} from '@mui/material';
import {
  Gavel as JudgeIcon,
  VideoLibrary as VideoIcon,
  LiveTv as LiveIcon,
  GitHub as GitHubIcon,
  Launch as DevPostIcon,
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon,
  Groups as TeamIcon,
  ArrowBack as BackIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useAuthInfo, withRequiredAuthInfo } from '@propelauth/react';
import { useSnackbar } from 'notistack';
import judgeApi from '../../lib/judgeApi';

const HackathonJudgePage = withRequiredAuthInfo(({ userClass }) => {
  const { accessToken, user } = useAuthInfo();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const { event_id } = router.query;
  
  const [loading, setLoading] = useState(true);
  const [teamsData, setTeamsData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Initialize tab from URL parameter only once when event_id is available
  useEffect(() => {
    if (!event_id || !router.isReady) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam === 'round2') {
      setActiveTab(1);
    } else if (tabParam === 'round1') {
      setActiveTab(0);
    }
    // Remove the URL parameter dependency that was causing re-renders
  }, [event_id, router.isReady]);

  useEffect(() => {
    if (!event_id || !router.isReady) return;
    
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const data = await judgeApi.getJudgeTeams(user.userId, event_id, accessToken);
        setTeamsData(data);
      } catch (error) {
        console.error('Error fetching teams:', error);
        enqueueSnackbar('Failed to load team assignments', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [event_id, user.userId, accessToken, enqueueSnackbar, router.isReady]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    
    // Update URL parameter to persist tab selection
    const tabParam = newValue === 1 ? 'round2' : 'round1';
    
    // Use router.asPath to get the actual path with interpolated values
    const currentPath = router.asPath.split('?')[0]; // Remove existing query params
    router.replace(`${currentPath}?tab=${tabParam}`, undefined, { shallow: true });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const TeamCard = ({ team, round, showDemoTime = false }) => (
    <Grid size={{ xs: 12, md: 6 }} key={`${round}_${team.id}`}>
      <Card sx={{ 
        height: '100%',
        border: team.judged ? '2px solid' : '1px solid',
        borderColor: team.judged ? 'success.main' : 'divider',
        position: 'relative'
      }}>
        {team.judged && (
          <Box sx={{ 
            position: 'absolute', 
            top: 8, 
            right: 8, 
            zIndex: 1 
          }}>
            <Chip 
              icon={<CompletedIcon />} 
              label="Scored" 
              color="success" 
              size="small"
            />
          </Box>
        )}
        
        <CardContent sx={{ p: 3 }}>
          {/* Team Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TeamIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" component="h3" gutterBottom sx={{ mb: 0, flexGrow: 1 }}>
              {team.name} {team.slack_channel && (
              <Tooltip title="Open Slack channel" arrow>
                <Button
                size="small"
                variant="outlined"
                startIcon={<TeamIcon />}
                onClick={() => window.open(`https://opportunity-hack.slack.com/app_redirect?channel=${team.slack_channel}`, '_blank')}
                sx={{ 
                  ml: 1,
                  textTransform: 'none',
                  minWidth: 'auto',
                  fontSize: '0.75rem',
                  height: '24px'
                }}
                >
                #{team.slack_channel}
                </Button>
              </Tooltip>
              )}
            </Typography>            
          </Box>

          {/* Problem Statement */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              <Button
              component="a"
              href={`/nonprofit/${team.problem_statement.nonprofit_id}`}
              target="_blank"
              rel="noopener noreferrer"
              variant="text"
              size="small"
              sx={{
                textTransform: 'none',
                p: 0,
                minWidth: 'auto',
                fontWeight: 'inherit',
                fontSize: 'inherit',
                color: 'primary.main',
                textDecoration: 'underline',
                '&:hover': {
                textDecoration: 'none'
                }
              }}
              >
              {team.problem_statement.nonprofit}
              </Button>
            </Typography>
            
          </Box>

          {/* Demo Time for Round 2 */}
          {showDemoTime && team.demo_time && (
            <Box sx={{ mb: 2 }}>
              <Chip 
                icon={<LiveIcon />}
                label={`Demo: ${formatDateTime(team.demo_time)}`}
                variant="outlined"
                color="primary"
                size="small"
              />
              {team.room && (
                <Chip 
                  label={team.room}
                  variant="outlined"
                  size="small"
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
          )}

          {/* Team Members */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon sx={{ fontSize: 16, mr: 0.5 }} />
              Team Members ({team.members.length})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {team.members.map((member, index) => (
                <Tooltip key={index} title={member.role} arrow>
                  <Chip 
                    label={member.name}
                    size="small"
                    variant="outlined"
                  />
                </Tooltip>
              ))}
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Links and Actions */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
              PROJECT LINKS
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {team.github_url && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<GitHubIcon />}
                  onClick={() => window.open(team.github_url, '_blank')}
                  sx={{ 
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    color: 'text.primary',
                    borderColor: 'divider'
                  }}
                >
                  GitHub Repository
                </Button>
              )}
              {team.devpost_url && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<DevPostIcon />}
                  onClick={() => window.open(team.devpost_url, '_blank')}
                  sx={{ 
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    color: 'text.primary',
                    borderColor: 'divider'
                  }}
                >
                  DevPost Submission
                </Button>
              )}
              {round === 'round1' && team.video_url && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<VideoIcon />}
                  onClick={() => window.open(team.video_url, '_blank')}
                  sx={{ 
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    color: 'primary.main',
                    borderColor: 'primary.main'
                  }}
                >
                  Watch Pitch Video
                </Button>
              )}
            </Box>
          </Box>

          {/* Score Display */}
          {team.judged && team.score && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1, mb: 1 }}>
                <Typography variant="body2" color="success.dark">
                  <strong>Your Score: {team.score}/40</strong>
                </Typography>
              </Box>
              {round === 'round1' && team.specialCategoryScores && Object.keys(team.specialCategoryScores).length > 0 && (
                <Box sx={{
                  p: 2,
                  bgcolor: Object.values(team.specialCategoryScores).some(score => score === null) ? 'grey.100' : 'warning.light',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: Object.values(team.specialCategoryScores).some(score => score === null) ? 'grey.400' : 'warning.main'
                }}>
                  <Typography
                    variant="caption"
                    color={Object.values(team.specialCategoryScores).some(score => score === null) ? 'text.secondary' : 'warning.dark'}
                    sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}
                  >
                    Special Category
                  </Typography>
                  {Object.entries(team.specialCategoryScores).map(([category, score]) => (
                    <Box key={category} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="body2"
                        color={score === null ? 'text.secondary' : 'warning.dark'}
                        sx={{ fontWeight: 500 }}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}:
                      </Typography>
                      {score === null ? (
                        <Chip
                          label="Not scored yet"
                          size="small"
                          variant="outlined"
                          color="default"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      ) : (
                        <Typography variant="body2" color="warning.dark" sx={{ fontWeight: 600 }}>
                          {score}/5
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}

          {/* Action Button */}
          <Button
            variant={team.judged ? "outlined" : "contained"}
            fullWidth
            startIcon={<JudgeIcon />}
            onClick={() => router.push(`/judge/${event_id}/team/${team.id}?round=${round}`)}
          >
            {team.judged ? 'Review Score' : 'Score Team'}
          </Button>
        </CardContent>
      </Card>
    </Grid>
  );

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!teamsData) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 12 }}>
          <Alert severity="error">
            Failed to load team assignments. Please refresh the page or contact support.
          </Alert>
        </Box>
      </Container>
    );
  }

  const round1Teams = teamsData.round1_teams || [];
  const round2Teams = teamsData.round2_teams || [];
  const round1Completed = round1Teams.filter(team => team.judged).length;
  const round2Completed = round2Teams.filter(team => team.judged).length;

  console.log('Round 1 Teams:', round1Teams);
  console.log('Round 2 Teams:', round2Teams);

  return (
    <>
      <Head>
        <title>{`Judging ${event_id} - Opportunity Hack`}</title>
        <meta name="description" content="Judge hackathon teams and evaluate their innovative solutions" />
      </Head>

      <Container maxWidth="lg">
        <Box sx={{ mt: 12, mb: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton onClick={() => router.push('/judge')} sx={{ mr: 2 }}>
              <BackIcon />
            </IconButton>
            <div>
              <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 1 }}>
                Judging {event_id.replace('_', ' ').toUpperCase()}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Review and score the assigned teams for each judging round
              </Typography>
            </div>
          </Box>

          {/* Summary Stats */}
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="primary">
                    {round1Teams.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Round 1 Teams
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="secondary">
                    {round2Teams.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Round 2 Teams
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="success.main">
                    {round1Completed + round2Completed}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Teams Scored
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Round Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab 
                label={
                  <Badge 
                    badgeContent={round1Teams.length - round1Completed} 
                    color="error"
                    invisible={round1Completed === round1Teams.length}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <VideoIcon sx={{ mr: 1 }} />
                      Round 1
                    </Box>
                  </Badge>
                }
              />
              <Tab 
                label={
                  <Badge 
                    badgeContent={round2Teams.length - round2Completed} 
                    color="error"
                    invisible={round2Completed === round2Teams.length}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LiveIcon sx={{ mr: 1 }} />
                      Round 2
                    </Box>
                  </Badge>
                }
              />
            </Tabs>
          </Box>

          {/* Round 1 Teams */}
          {activeTab === 0 && (
            <Box>
              {round1Teams.length === 0 ? (
                <Alert severity="info">
                  You have no teams assigned for Round 1 judging.
                </Alert>
              ) : (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5">
                      Round 1 Teams ({round1Completed}/{round1Teams.length} completed)
                    </Typography>                    
                  </Box>
                  <Grid container spacing={3}>
                    {round1Teams.map(team => (
                      <TeamCard key={team.id} team={team} round="round1" />
                    ))}
                  </Grid>
                </>
              )}
            </Box>
          )}

          {/* Round 2 Teams */}
          {activeTab === 1 && (
            <Box>
              {round2Teams.length === 0 ? (
                <Alert severity="info">
                  You have no teams assigned for Round 2 judging.
                </Alert>
              ) : (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5">
                      Round 2 Finalist Teams ({round2Completed}/{round2Teams.length} completed)
                    </Typography>
                    <Chip 
                      label="Live Demos" 
                      icon={<LiveIcon />} 
                      color="secondary" 
                      variant="outlined"
                    />
                  </Box>
                  <Grid container spacing={3}>
                    {round2Teams.map(team => (
                      <TeamCard key={team.id} team={team} round="round2" showDemoTime={true} />
                    ))}
                  </Grid>
                </>
              )}
            </Box>
          )}
        </Box>
      </Container>
    </>
  );
});

export default HackathonJudgePage;