import React, { useState, useEffect, useCallback } from 'react';
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
  Slider,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  FormControlLabel,
  Switch,
  Collapse,
  TextField,
  Skeleton
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  GitHub as GitHubIcon,
  Launch as DevPostIcon,
  VideoLibrary as VideoIcon,
  Save as SaveIcon,
  Send as SubmitIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Code as CodeIcon,
  Security as SecurityIcon,
  Assessment as AssessmentIcon,
  Description as DocumentationIcon,
  AutoFixHigh as PolishIcon,
  Public as WebIcon,
  Timer as TimerIcon,
  HelpOutline as HelpIcon,
  RecordVoiceOver as VoiceIcon,
  Screenshot as ScreenshotIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import { useAuthInfo, withRequiredAuthInfo } from '@propelauth/react';
import { useSnackbar } from 'notistack';
import judgeApi from '../../../../lib/judgeApi';

// Judging criteria from /about/judges
const JUDGING_CRITERIA = [
  {
    category: "scope",
    name: "Scope of Solution",
    maxPoints: 10,
    icon: <AssessmentIcon />,
    color: "primary",
    subCriteria: [
      {
        name: "Impact on Community",
        description: "How many people and nonprofits are impacted by this solution?",
        key: "scopeImpact",
        examples: [
          "How many other nonprofits could potentially use this solution?",
          "Does this address a widespread problem affecting multiple organizations?",
          "With some small changes, could this solution be scaled to help other nonprofits with similar challenges?"
        ]
      },
      {
        name: "Complexity of Problem Solved", 
        description: "How hard was this to do versus what is already out there?",
        key: "scopeComplexity",
        examples: [
          "Is this solving a problem that hasn't been addressed by existing solutions?",
          "How technically challenging is the implementation compared to alternatives?",
          "Does this require innovative approaches or novel integration of technologies?"
        ]
      },
    ],
    tip: "Consider both breadth and depth of impact. Evaluate community impact and problem complexity.",
  },
  {
    category: "documentation",
    name: "Documentation",
    maxPoints: 10,
    icon: <DocumentationIcon />,
    color: "info",
    subCriteria: [
      {
        name: "Code and UX Documentation",
        description: "Clear how to use the solution",
        key: "documentationCode",
        examples: [
          "Is there a clear DevPost project and Github README with setup and usage instructions?",
          "Are the user interfaces intuitive and self-explanatory?",
          "Is the code well-commented and structured for maintainability?"
        ]
      },
      {
        name: "Ease of Understanding",
        description: "Straightforward design",
        key: "documentationEase",
        examples: [
          "Can a new user understand how to use the solution without extensive training?",
          "Is the user experience logical and follows common design patterns?",
          "Are error messages helpful and actionable?"
        ]
      },
    ],
    tip: "Assess documentation quality and clarity. Consider project sustainability.",
  },
  {
    category: "polish",
    name: "Polish",
    maxPoints: 10,
    icon: <PolishIcon />,
    color: "success",
    subCriteria: [
      {
        name: "Work Remaining",
        description: "Minimal work remaining for MVP",
        key: "polishWorkRemaining",
        examples: [
          "How much additional development is needed before the nonprofit could use this?",
          "Are the core features complete and functional?",
          "What percentage of the planned functionality has been implemented?"
        ]
      },
      {
        name: "Can Use Today",
        description: "Deployed in the cloud, able to be shipped now",
        key: "polishCanUseToday",
        examples: [
          "Is the solution hosted and accessible via a public URL (and not localhost)?",
          "Can the nonprofit start using this immediately without additional setup?",
          "Are all major bugs resolved and the solution stable for production use?"
        ]
      },
    ],
    tip: "Evaluate overall refinement and readiness for real-world use.",
  },
  {
    category: "security",
    name: "Security",
    maxPoints: 10,
    icon: <SecurityIcon />,
    color: "error",
    subCriteria: [
      {
        name: "Data Protection",
        description: "Hard to gain access to data because of security controls",
        key: "securityData",
        examples: [
          "Is sensitive data properly encrypted in transit and at rest (e.g. using HTTPS)?",
          "Are there appropriate authentication mechanisms in place?",
          "Is input validation implemented to prevent security vulnerabilities?"
        ]
      },
      {
        name: "Role-based Security",
        description: "Admin versus public access (where applicable)",
        key: "securityRole",
        examples: [
          "Are there different permission levels for different types of users?",
          "Can administrators control who has access to what data?",
          "Is there proper authorization checking for sensitive operations?"
        ]
      },
    ],
    tip: "Assess data protection and role-based security implementation.",
  },
];

// Special Category Prizes (configured separately, not part of main judging)
const SPECIAL_CATEGORIES = [
  {
    category: "accessibility",
    name: "Accessibility",
    maxPoints: 5,
    icon: <PersonIcon />,
    color: "info",
    description: "Accessibility is important when building software. Consider the four W3C usability principles: perceivable, operable, understandable, robust.",
    subCriteria: [
      {
        name: "Accessibility Implementation",
        description: "How well does the solution implement accessibility principles?",
        key: "accessibility",
        examples: [
          "Is the content perceivable? (Can users see/hear content regardless of disabilities?)",
          "Is it operable? (Can users navigate with keyboard, screen readers, etc.?)",
          "Is it understandable? (Is the UI intuitive and error messages clear?)",
          "Is it robust? (Does it work across different browsers and assistive technologies?)",
          "What is the Lighthouse Accessibility score? (95+ is excellent)"
        ]
      }
    ],
    tip: "Special category prizes recognize excellence in specific areas beyond main judging criteria.",
    reference: "https://www.w3.org/WAI/fundamentals/accessibility-principles/"
  }
];

const SCORE_DESCRIPTIONS = {
  1: "Poor - Significantly below expectations",
  2: "Fair - Below expectations", 
  3: "Good - Meets expectations",
  4: "Very Good - Exceeds expectations",
  5: "Excellent - Significantly exceeds expectations",
};

const TeamScoringPage = withRequiredAuthInfo(({ userClass }) => {
  const { accessToken, user } = useAuthInfo();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const { event_id, team_id } = router.query;
  const round = router.query.round || 'round1';
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [teamData, setTeamData] = useState(null);
  const [scores, setScores] = useState({});
  const [autoSave, setAutoSave] = useState(true);
  const [submitDialog, setSubmitDialog] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [feedback, setFeedback] = useState({});
  const [expandedExamples, setExpandedExamples] = useState({});

  const setFeedbackGeneral = (value) => {
    setFeedback(prev => ({ ...prev, general: value }));
  };

  // Initialize default scores
  const initializeScores = useCallback(() => {
    const defaultScores = {};
    JUDGING_CRITERIA.forEach(criterion => {
      criterion.subCriteria.forEach(subCriterion => {
        defaultScores[subCriterion.key] = 3; // Default to "Good"
      });
    });
    // Add Special Category scores only for Round 1
    if (round === 'round1') {
      SPECIAL_CATEGORIES.forEach(criterion => {
        criterion.subCriteria.forEach(subCriterion => {
          defaultScores[subCriterion.key] = 3; // Default to "Good"
        });
      });
    }
    return defaultScores;
  }, [round]);

  // Fetch team data and existing scores
  useEffect(() => {
    if (!team_id || !event_id) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const [teamResponse, scoresResponse] = await Promise.all([
          judgeApi.getTeamDetails(team_id, accessToken),
          judgeApi.getJudgeScores(user.userId, event_id, accessToken)
        ]);
        console.log('Team Response:', teamResponse);
        setTeamData(teamResponse.team);

        console.log('Scores Response:', scoresResponse);

        // Find existing submitted score for this team
        const existingScore = scoresResponse.scores?.find(
          score => score.team_id === team_id && score.round === round
        );
        
        if (existingScore) {
          // Use submitted score if it exists
          setScores(existingScore.scores);
          setFeedback(existingScore.feedback || {});
          console.log('Loaded submitted score:', existingScore.scores);
        } else {
          // If no submitted score, check for draft
          try {
            const draftResponse = await judgeApi.getDraft(user.userId, team_id, event_id, round, accessToken);
            console.log('Draft Response:', draftResponse);
            if (draftResponse && draftResponse.draft && draftResponse.draft.scores) {
              // Remove the 'total' key from draft scores to avoid interference
              const { total, ...draftScores } = draftResponse.draft.scores;
              setScores(draftScores);
              setFeedback(draftResponse.draft.feedback || {});
              console.log('Loaded draft score:', draftScores);
              console.log('Loaded draft feedback:', draftResponse.draft.feedback);
              enqueueSnackbar('Draft scores loaded', { variant: 'info' });
            } else {
              setScores(initializeScores());
              setFeedback({});
              console.log('No existing scores or drafts, initialized defaults');
            }
          } catch (draftError) {
            console.log('No draft found, using default scores');
            setScores(initializeScores());
            setFeedback({});
          }
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        enqueueSnackbar('Failed to load team data', { variant: 'error' });
        setScores(initializeScores());
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [team_id, event_id, round, user.userId, accessToken, enqueueSnackbar]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || loading || Object.keys(scores).length === 0) return;
    
    const saveTimer = setTimeout(async () => {
      try {
        setSaving(true);
        await judgeApi.saveDraft(user.userId, team_id, event_id, scores, round, accessToken, feedback);
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setSaving(false);
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(saveTimer);
  }, [scores, feedback, autoSave, loading, user.userId, team_id, event_id, round, accessToken]);

  const handleScoreChange = (key, value) => {
    setScores(prev => ({ ...prev, [key]: value }));
  };

  const calculateTotal = () => {
    console.log('Calculating total score:', scores);
    // Filter out the 'total' key to avoid double counting
    const total_score = Object.entries(scores)
      .filter(([key]) => key !== 'total')
      .reduce((sum, [, score]) => sum + (score || 0), 0);
    console.log('Total score calculated:', total_score);
    return total_score;
  };

  const validateFeedback = () => {
    const feedbackText = feedback.general?.replace(/[#*`\-\n\r\s]/g, '').trim();
    return feedbackText && feedbackText.length >= 20;
  };

  const getFeedbackCharCount = () => {
    const feedbackText = feedback.general?.replace(/[#*`\-\n\r\s]/g, '').trim() || '';
    return feedbackText.length;
  };

  const getRemainingChars = () => {
    const current = getFeedbackCharCount();
    return Math.max(0, 20 - current);
  };

  const handleSubmit = async () => {
    if (!validateFeedback()) {
      enqueueSnackbar('Please provide meaningful feedback (at least 10 characters) to help the team improve.', { variant: 'warning' });
      return;
    }

    try {
      setSubmitting(true);
      const totalScore = calculateTotal();
      const scoreData = { ...scores, total: totalScore };
      
      await judgeApi.submitScore(user.userId, team_id, event_id, scoreData, round, accessToken, feedback);
      
      enqueueSnackbar('Score and feedback submitted successfully!', { variant: 'success' });
      setSubmitDialog(false);
      
      // Go back to hackathon page, preserving the round tab
      const tabParam = round === 'round2' ? 'round2' : 'round1';
      router.push(`/judge/${event_id}?tab=${tabParam}`);
      
    } catch (error) {
      console.error('Error submitting score:', error);
      enqueueSnackbar('Failed to submit score. Please try again.', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleExamples = (key) => {
    setExpandedExamples(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const renderSlider = (criterion) => (
    <Box key={criterion.key} sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle1" gutterBottom>
          {criterion.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            startIcon={<HelpIcon />}
            onClick={() => toggleExamples(criterion.key)}
            sx={{ minWidth: 'auto', px: 1 }}
          >
            Examples
          </Button>
          <Chip 
            label={`${scores[criterion.key] || 3}/5`} 
            size="small" 
            color="primary"
          />
        </Box>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {criterion.description}
      </Typography>
      
      <Collapse in={expandedExamples[criterion.key]}>
        <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.200' }}>
          <Typography variant="subtitle2" gutterBottom color="primary">
            Consider these questions when scoring:
          </Typography>
          <List dense>
            {(criterion.examples || []).map((example, index) => (
              <ListItem key={index} sx={{ pl: 0 }}>
                <ListItemText
                  primary={`• ${example}`}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Collapse>
      
      <Slider
        value={scores[criterion.key] || 3}
        onChange={(_, value) => handleScoreChange(criterion.key, value)}
        step={1}
        marks
        min={1}
        max={5}
        valueLabelDisplay="auto"
        valueLabelFormat={(value) => SCORE_DESCRIPTIONS[value]}
        sx={{ mb: 1 }}
      />
      <Typography variant="caption" color="text.secondary">
        {SCORE_DESCRIPTIONS[scores[criterion.key] || 3]}
      </Typography>
    </Box>
  );

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 12, mb: 4 }}>
          {/* Header Skeleton */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
            <div style={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={40} sx={{ mb: 1 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Skeleton variant="rounded" width={80} height={24} />
                <Skeleton variant="text" width={120} height={20} />
              </Box>
            </div>
          </Box>

          <Grid container spacing={3}>
            {/* Team Information Panel Skeleton */}
            <Grid item xs={12} lg={4}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Skeleton variant="text" width="70%" height={32} sx={{ mb: 2 }} />
                
                {/* Problem Statement Skeleton */}
                <Box sx={{ mb: 3 }}>
                  <Skeleton variant="text" width="80%" height={24} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="90%" height={28} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="100%" />
                  <Skeleton variant="text" width="75%" />
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Team Members Skeleton */}
                <Box sx={{ mb: 3 }}>
                  <Skeleton variant="text" width="50%" height={24} sx={{ mb: 1 }} />
                  {[1, 2, 3].map((i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Skeleton variant="text" width="60%" />
                    </Box>
                  ))}
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Project Links Skeleton */}
                <Box sx={{ mb: 3 }}>
                  <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} variant="rounded" width="100%" height={36} />
                    ))}
                  </Box>
                </Box>

                {/* Slack Channel Skeleton */}
                <Box sx={{ mb: 3 }}>
                  <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
                  <Skeleton variant="rounded" width="100%" height={48} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="70%" height={16} />
                </Box>

                {/* Score Summary Skeleton */}
                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  textAlign: 'center'
                }}>
                  <Skeleton variant="text" width="60%" height={48} sx={{ mx: 'auto', mb: 1 }} />
                  <Skeleton variant="text" width="40%" height={20} sx={{ mx: 'auto' }} />
                </Box>

                {/* Auto-save Toggle Skeleton */}
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <Skeleton variant="rounded" width={38} height={22} sx={{ mr: 1 }} />
                  <Skeleton variant="text" width="30%" />
                </Box>
              </Paper>
            </Grid>

            {/* Scoring Panel Skeleton */}
            <Grid item xs={12} lg={8}>
              <Skeleton variant="text" width="40%" height={40} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="80%" height={20} sx={{ mb: 3 }} />

              {/* Judging Criteria Accordions Skeleton */}
              {[1, 2, 3, 4].map((i) => (
                <Box key={i} sx={{ mb: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
                  <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                    <Skeleton variant="circular" width={24} height={24} sx={{ mr: 2 }} />
                    <Skeleton variant="text" width="60%" height={24} sx={{ flexGrow: 1 }} />
                    <Skeleton variant="rounded" width={40} height={24} sx={{ ml: 1 }} />
                    <Skeleton variant="circular" width={20} height={20} sx={{ ml: 1 }} />
                  </Box>
                </Box>
              ))}

              {/* Feedback Section Skeleton */}
              <Card sx={{ mt: 4, mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
                    <Skeleton variant="text" width="30%" height={32} />
                  </Box>
                  <Skeleton variant="text" width="90%" height={20} sx={{ mb: 2 }} />
                  
                  <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Skeleton variant="text" width="100%" />
                    <Skeleton variant="text" width="80%" />
                  </Box>

                  <Skeleton variant="rounded" width="100%" height={150} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="70%" height={16} />
                </CardContent>
              </Card>

              {/* Action Buttons Skeleton */}
              <Box sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Skeleton variant="rounded" width={80} height={36} />
                  <Skeleton variant="rounded" width={180} height={36} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    );
  }

  if (!teamData) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 12 }}>
          <Alert severity="error">
            Failed to load team information. Please refresh the page or go back.
          </Alert>
        </Box>
      </Container>
    );
  }

  const totalScore = calculateTotal();
  const isRound2 = round === 'round2';

  return (
    <>
      <Head>
        <title>{`Judging ${teamData.name} - Opportunity Hack`}</title>
        <meta name="description" content={`Score ${teamData.name} for ${event_id} hackathon judging`} />
      </Head>

      <Container maxWidth="lg">
        <Box sx={{ mt: 12, mb: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton onClick={() => router.push(`/judge/${event_id}?tab=${round === 'round2' ? 'round2' : 'round1'}`)} sx={{ mr: 2 }}>
              <BackIcon />
            </IconButton>
            <div>
              <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 1 }}>
                Judging: {teamData.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip 
                  label={isRound2 ? 'Round 2' : 'Round 1'} 
                  color={isRound2 ? 'secondary' : 'primary'} 
                  icon={isRound2 ? <VideoIcon /> : <VideoIcon />}
                />
                {saving && (
                  <Chip 
                    label="Saving..." 
                    size="small" 
                    icon={<TimerIcon />} 
                    variant="outlined"
                  />
                )}
                {lastSaved && (
                  <Typography variant="caption" color="text.secondary">
                    Last saved: {lastSaved.toLocaleTimeString()}
                  </Typography>
                )}
              </Box>
            </div>
          </Box>

          <Grid container spacing={3}>
            {/* Team Information Panel */}
            <Grid item xs={12} lg={4}>
              <Paper elevation={2} sx={{ p: 3, position: 'sticky', top: 20 }}>
                <Typography variant="h6" gutterBottom>
                  Team Information
                </Typography>
                
                {/* Problem Statement */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    {teamData.problem_statement.nonprofit}
                  </Typography>
                  <Typography variant="body1" gutterBottom sx={{ fontWeight: 500 }}>
                    {teamData.problem_statement.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {teamData.problem_statement.description}
                  </Typography>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Team Members */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    Team Members
                  </Typography>
                  <List dense>
                    {teamData.members.map((member, index) => (
                      <ListItem key={index} disablePadding>
                        <ListItemText 
                          primary={member.name}
                          secondary={member.role}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Project Links */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                    Project Links
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    You'll be evaluating the DevPost project, video, and GitHub repository against the judging criteria below.
                    </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {teamData.github_url && (
                      <Button
                        startIcon={<GitHubIcon />}
                        variant="outlined"
                        size="small"
                        href={teamData.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        GitHub Repository
                      </Button>
                    )}
                    {teamData.devpost_url && (
                      <Button
                        startIcon={<DevPostIcon />}
                        variant="outlined"
                        size="small"
                        href={teamData.devpost_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        DevPost Project
                      </Button>
                    )}
                    {teamData.demo_url && (
                      <Button
                        startIcon={<WebIcon />}
                        variant="outlined"
                        size="small"
                        href={teamData.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Live Demo
                      </Button>
                    )}
                    {teamData.video_url && !isRound2 && (
                      <Button
                        startIcon={<VideoIcon />}
                        variant="contained"
                        size="small"
                        href={teamData.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Watch Pitch Video
                      </Button>
                    )}
                  </Box>
                </Box>

                {/* Slack Channel */}
                {teamData.slack_channel && (
                  <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Slack Channel
                  </Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    fullWidth
                    href={`https://opportunity-hack.slack.com/app_redirect?channel=${teamData.slack_channel.replace('#', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ mb: 1 }}
                  >
                    Join {teamData.slack_channel}
                  </Button>
                    <Alert severity="info" sx={{ mt: 1 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, fontSize: '1.1rem', mb: 1 }}>
                      💬 Slack Communication Guidelines
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1.5, fontSize: '1rem' }}>
                      Use Slack to ask clarifying questions about the team's solution:
                    </Typography>
                    <List dense sx={{ ml: -1 }}>
                      <ListItem disablePadding>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <GroupIcon fontSize="small" color="action" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Use @here or @channel to notify all team members"
                        primaryTypographyProps={{ variant: 'body2', style: { fontSize: '0.95rem' } }}
                      />
                      </ListItem>
                      <ListItem disablePadding>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <VoiceIcon fontSize="small" color="action" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Record video/audio clips for complex questions"
                        primaryTypographyProps={{ variant: 'body2', style: { fontSize: '0.95rem' } }}
                      />
                      </ListItem>
                      <ListItem disablePadding>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <ScreenshotIcon fontSize="small" color="action" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Screenshot specific areas you need clarification on"
                        primaryTypographyProps={{ variant: 'body2', style: { fontSize: '0.95rem' } }}
                      />
                      </ListItem>
                    </List>
                    <Box sx={{ mt: 1.5, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Link 
                      href="https://slack.com/help/articles/4406235165587-Create-audio-and-video-clips-in-Slack" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      sx={{ 
                        fontSize: '0.95rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        textDecoration: 'none',
                        '&:hover': {
                        textDecoration: 'underline'
                        }
                      }}
                      >
                      📹 Learn how to create audio and video clips in Slack
                      </Link>
                    </Box>
                    </Alert>
                </Box>
                )}

                {/* Score Summary */}
                <Box sx={{ 
                  p: 2, 
                  bgcolor: totalScore >= 32 ? 'success.light' : totalScore >= 24 ? 'warning.light' : 'error.light',
                  borderRadius: 1,
                  textAlign: 'center'
                }}>
                  <Typography variant="h4" component="div" gutterBottom>
                    {totalScore}/40
                  </Typography>
                  <Typography variant="body2">
                    Current Total Score
                  </Typography>
                </Box>

                {/* Auto-save Toggle */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoSave}
                      onChange={(e) => setAutoSave(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Auto-save"
                  sx={{ mt: 2 }}
                />
              </Paper>
            </Grid>

            {/* Scoring Panel */}
            <Grid item xs={12} lg={8}>
              <Typography variant="h5" gutterBottom>
                Scoring Criteria
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Evaluate this team across the four key areas below. Each criterion is scored from 1-5 points.
              </Typography>

              {JUDGING_CRITERIA.map((criterion) => (
                <Accordion key={criterion.category} sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Box sx={{ color: `${criterion.color}.main`, mr: 2 }}>
                        {criterion.icon}
                      </Box>
                      <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        {criterion.name} ({criterion.maxPoints} points)
                      </Typography>
                      <Chip
                        label={`${criterion.subCriteria.reduce((sum, sub) => sum + (scores[sub.key] || 0), 0)}/${criterion.maxPoints}`}
                        size="small"
                        color={criterion.color}
                      />
                      <Tooltip title={criterion.tip} arrow>
                        <InfoIcon color="action" sx={{ ml: 1, fontSize: 20 }} />
                      </Tooltip>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    {criterion.subCriteria.map(renderSlider)}
                  </AccordionDetails>
                </Accordion>
              ))}

              {/* Special Categories Section - Only for Round 1 */}
              {round === 'round1' && SPECIAL_CATEGORIES.length > 0 && (
                <>
                  <Divider sx={{ my: 4 }} />
                  <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                    Special Category Prizes
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    These special categories are judged separately and do not affect the main scoring. They recognize excellence in specific areas.
                  </Typography>

                  {SPECIAL_CATEGORIES.map((criterion) => (
                    <Accordion key={criterion.category} sx={{ mb: 2, borderLeft: '4px solid', borderColor: `${criterion.color}.main` }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <Box sx={{ color: `${criterion.color}.main`, mr: 2 }}>
                            {criterion.icon}
                          </Box>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6">
                              {criterion.name} ({criterion.maxPoints} points)
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Special Category Prize
                            </Typography>
                          </Box>
                          <Chip
                            label={`${criterion.subCriteria.reduce((sum, sub) => sum + (scores[sub.key] || 0), 0)}/${criterion.maxPoints}`}
                            size="small"
                            color={criterion.color}
                          />
                          <Tooltip title={criterion.tip} arrow>
                            <InfoIcon color="action" sx={{ ml: 1, fontSize: 20 }} />
                          </Tooltip>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        {criterion.description && (
                          <Alert severity="info" sx={{ mb: 2 }}>
                            <Typography variant="body2">
                              {criterion.description}
                              {criterion.reference && (
                                <>
                                  {' '}
                                  <Link href={criterion.reference} target="_blank" rel="noopener noreferrer">
                                    Learn more
                                  </Link>
                                </>
                              )}
                            </Typography>
                          </Alert>
                        )}
                        {criterion.subCriteria.map(renderSlider)}
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </>
              )}

              {/* Feedback Section */}
              <Card sx={{ mt: 4, mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <DocumentationIcon sx={{ mr: 1 }} />
                    Team Feedback
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Provide constructive feedback to help this team improve their solution. Your feedback will be anonymized and shared with the team after judging is complete.
                  </Typography>
                  
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Feedback Guidelines:</strong> Focus on specific strengths and areas for improvement. 
                      Be constructive and actionable. Consider technical implementation, user experience, and overall impact.
                    </Typography>
                  </Alert>

                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    value={feedback.general || ''}
                    onChange={(e) => setFeedbackGeneral(e.target.value)}
                    placeholder="Provide specific, constructive feedback to help this team improve their solution... Consider commenting on: Technical implementation and code quality, User experience and design, Impact and scalability, Areas for improvement, What they did well"
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: '0.95rem',
                        lineHeight: 1.5
                      }
                    }}
                  />
                  
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="caption" color="text.secondary">
                      Format your feedback with basic markdown: **bold**, *italic*, bullet points with •
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color={validateFeedback() ? "success.main" : "warning.main"}
                      sx={{ fontWeight: 500, fontSize: '0.875rem' }}
                    >
                      {validateFeedback() 
                        ? `${getFeedbackCharCount()} ${getFeedbackCharCount() === 1 ? 'character' : 'characters'} - you did it!` 
                        : `${getFeedbackCharCount()}/20 ${getFeedbackCharCount() === 1 ? 'character' : 'characters'} (${getRemainingChars()} more needed)`
                      }
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Box sx={{ mt: 4 }}>
                {!validateFeedback() && (
                    <Alert severity="warning" sx={{ mb: 2, fontSize: '1.0rem' }}>
                    Please provide meaningful feedback to help the team improve before submitting your score. 
                    <br/>
                    {getRemainingChars()} more {getRemainingChars() === 1 ? 'character' : 'characters'}.
                    </Alert>
                )}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => router.push(`/judge/${event_id}?tab=${round === 'round2' ? 'round2' : 'round1'}`)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SubmitIcon />}
                    onClick={() => setSubmitDialog(true)}
                    disabled={submitting || !validateFeedback()}
                  >
                    Submit Score & Feedback
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* Submit Confirmation Dialog */}
      <Dialog open={submitDialog} onClose={() => setSubmitDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Submit Score for {teamData.name}?</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            You are about to submit your final score and feedback for this team. You can edit it later if needed.
          </Alert>
          
          <Typography variant="h6" gutterBottom>
            Score Summary:
          </Typography>
          
          {JUDGING_CRITERIA.map((criterion) => (
            <Box key={criterion.category} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">
                {criterion.name}:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {criterion.subCriteria.reduce((sum, sub) => sum + (scores[sub.key] || 0), 0)}/{criterion.maxPoints}
              </Typography>
            </Box>
          ))}
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">
              Total Score:
            </Typography>
            <Typography variant="h6" color="primary">
              {totalScore}/40
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            Feedback Summary:
          </Typography>
          
          <Box sx={{ 
            maxHeight: 120, 
            overflow: 'auto', 
            p: 2, 
            bgcolor: 'grey.50', 
            borderRadius: 1, 
            border: '1px solid', 
            borderColor: 'grey.200' 
          }}>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {feedback.general ? feedback.general.replace(/[#*`\-]/g, '').trim() : 'No feedback provided'}
            </Typography>
          </Box>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Your feedback will be anonymized and shared with the team to help them improve.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmitDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} /> : <SubmitIcon />}
          >
            {submitting ? 'Submitting...' : 'Submit Score'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});

export default TeamScoringPage;