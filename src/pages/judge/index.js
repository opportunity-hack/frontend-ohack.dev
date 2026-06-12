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
  LinearProgress,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  Divider
} from '@mui/material';
import {
  Gavel as JudgeIcon,
  Event as EventIcon,
  Groups as TeamsIcon,
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon,
  EmojiEvents as TrophyIcon,
  PlayCircleOutlineRounded,
  VideoLibraryRounded
} from '@mui/icons-material';
import { useAuthInfo, withRequiredAuthInfo } from '@propelauth/react';
import { useSnackbar } from 'notistack';
import judgeApi from '../../lib/judgeApi';
import { initFacebookPixel, trackEvent } from '../../lib/ga';

const JudgeDashboard = withRequiredAuthInfo(({ userClass }) => {
  const { accessToken, user } = useAuthInfo();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => { initFacebookPixel(); }, []);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const data = await judgeApi.getJudgeAssignments(user.userId, accessToken);
        setAssignments(data.hackathons || []);
      } catch (error) {
        console.error('Error fetching assignments:', error);
        enqueueSnackbar('Failed to load judging assignments', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [user.userId, accessToken, enqueueSnackbar]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateProgress = (completed, total) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const getProgressColor = (progress) => {
    if (progress === 100) return 'success';
    if (progress >= 50) return 'primary';
    return 'primary';
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Head>
        <title>Judge Dashboard - Evaluate Hackathon Projects | Opportunity Hack</title>
        <meta name="description" content="Access your judge assignments and evaluate innovative nonprofit technology solutions. Complete dashboard tutorial available to guide you through Round 1 and Round 2 judging." />
        <meta name="keywords" content="judge dashboard, hackathon judging, nonprofit technology evaluation, scoring criteria, judge tutorial" />
        <meta property="og:title" content="Judge Dashboard - Evaluate Hackathon Projects | Opportunity Hack" />
        <meta property="og:description" content="Access your judge assignments and evaluate innovative nonprofit technology solutions. Complete dashboard tutorial available to guide you through Round 1 and Round 2 judging." />
        <meta property="og:url" content="https://www.ohack.dev/judge" />
        <meta property="og:image" content="https://cdn.ohack.dev/ohack.dev/judge_1.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Judge Dashboard - Evaluate Hackathon Projects | Opportunity Hack" />
        <meta name="twitter:description" content="Access your judge assignments and evaluate innovative nonprofit technology solutions. Complete dashboard tutorial available to guide you through Round 1 and Round 2 judging." />
        <meta name="twitter:image" content="https://cdn.ohack.dev/ohack.dev/judge_1.jpg" />
      </Head>

      <Container maxWidth="lg">
        <Box sx={{ mt: 12, mb: 4 }}>
          {/* Header */}
          <Paper elevation={2} sx={{ p: 4, mb: 4, bgcolor: 'primary.light', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <JudgeIcon sx={{ fontSize: 48, mr: 2 }} />
              <div>
                <Typography variant="h3" component="h1" gutterBottom sx={{ color: 'white', mb: 1 }}>
                  Welcome, Judge {user.firstName}!
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  Your Hackathon Judging Assignments
                </Typography>
              </div>
            </Box>
          </Paper>

          {/* Assignments */}
          {assignments.length === 0 ? (
            <Alert severity="info" sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>No Current Judging Assignments</Typography>
              <Typography variant="body1">
                You don't have any active judging assignments at the moment. 
                Check back later or contact the hackathon organizers if you believe this is an error.
              </Typography>
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {assignments.map((hackathon) => {
                const round1Progress = calculateProgress(
                  hackathon.judging_status.round1.completed,
                  hackathon.judging_status.round1.total
                );
                const round2Progress = calculateProgress(
                  hackathon.judging_status.round2.completed,
                  hackathon.judging_status.round2.total
                );
                
                return (
                  <Grid size={{ xs: 12, md: 6 }} key={hackathon.event_id}>
                    <Card sx={{ height: '100%', position: 'relative' }}>
                      <CardContent sx={{ p: 3 }}>
                        {/* Hackathon Header */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <EventIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 0 }}>
                            {hackathon.title}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          {formatDate(hackathon.start_date)} - {formatDate(hackathon.end_date)}
                        </Typography>

                        <Divider sx={{ mb: 3 }} />

                        {/* Round 1 Progress */}
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                              <TeamsIcon sx={{ mr: 1, fontSize: 20 }} />
                              Round 1 - Find the top teams
                            </Typography>
                            <Chip 
                              label={`${hackathon.judging_status.round1.completed}/${hackathon.judging_status.round1.total}`}
                              size="small"
                              color={round1Progress === 100 ? 'success' : 'default'}
                            />
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={round1Progress} 
                            color={getProgressColor(round1Progress)}
                            sx={{ height: 8, borderRadius: 4, mb: 1 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {round1Progress}% complete
                          </Typography>
                        </Box>

                        {/* Round 2 Progress */}
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                              <TrophyIcon sx={{ mr: 1, fontSize: 20 }} />
                              Round 2 - Rank the top team
                            </Typography>
                            <Chip 
                              label={`${hackathon.judging_status.round2.completed}/${hackathon.judging_status.round2.total}`}
                              size="small"
                              color={round2Progress === 100 ? 'success' : 'default'}
                            />
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={round2Progress} 
                            color={getProgressColor(round2Progress)}
                            sx={{ height: 8, borderRadius: 4, mb: 1 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {round2Progress}% complete
                          </Typography>
                        </Box>

                        {/* Action Button */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            {round1Progress === 100 && round2Progress === 100 ? (
                              <Chip 
                                icon={<CompletedIcon />} 
                                label="Judging Complete" 
                                color="success" 
                                variant="outlined"
                              />
                            ) : (
                              <Chip 
                                icon={<PendingIcon />} 
                                label="In Progress" 
                                color="primary" 
                                variant="outlined"
                              />
                            )}
                          </Box>
                          <Button
                            variant="contained"
                            onClick={() => {
                              trackEvent({ action: 'judge_dash_start', params: { event_label: hackathon.event_id, page: 'judge_dashboard' } });
                              router.push(`/judge/${hackathon.event_id}`);
                            }}
                            startIcon={<JudgeIcon />}
                          >
                            Start Judging
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}

          {/* Video Tutorial CTA Section */}
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              mt: 4, 
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              color: 'white',
              textAlign: 'center'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <VideoLibraryRounded sx={{ fontSize: 40, mr: 2 }} />
              <Typography variant="h5" component="h3">
                New to Our Judge Dashboard?
              </Typography>
            </Box>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 3, 
                fontSize: '16px',
                opacity: 0.9,
                maxWidth: '600px',
                mx: 'auto'
              }}
            >
              Watch our complete tutorial to master the judging process! See exactly how to navigate the dashboard, evaluate projects in both rounds, and provide meaningful feedback to teams.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                sx={{ 
                  bgcolor: 'white', 
                  color: 'primary.main',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5,
                  '&:hover': { 
                    bgcolor: 'rgba(255,255,255,0.9)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  },
                  transition: 'all 0.3s ease'
                }}
                href="/judge/overview"
                startIcon={<PlayCircleOutlineRounded />}
              >
                Watch Dashboard Tutorial
              </Button>
            </Box>
          </Paper>

          {/* Help Section */}
          <Paper elevation={1} sx={{ p: 3, mt: 4, bgcolor: 'grey.50' }}>
            <Typography variant="h6" gutterBottom>
              Quick Reference: Judging Process
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              As a judge, you'll evaluate teams in two rounds (in most hackathons):
            </Typography>
            <Box component="ul" sx={{ pl: 3, mb: 2 }}>
              <li>
                <Typography variant="body2">
                  <strong>Round 1:</strong> Review 4-minute team pitch videos (from DevPost) and project on GitHub - evaluate based on our scoring criteria
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Round 2:</strong> Review responses to Round 1 questions, and re-evaluate projects based on new information, then submit final scores. In-person: Live demos with finalist teams, including Q&A sessions
                </Typography>
              </li>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Each project is scored across four categories: Scope, Documentation, Polish, and Security.               
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
              <Button
                variant="outlined"
                size="small"
                href="/judge/overview"
                startIcon={<VideoLibraryRounded />}
              >
                Dashboard Tutorial
              </Button>
              <Button
                variant="outlined"
                size="small"
                href="/about/judges#judging-criteria"
              >
                Scoring Criteria
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    </>
  );
});

export default JudgeDashboard;