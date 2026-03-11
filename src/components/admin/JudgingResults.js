import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Skeleton,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  Visibility as ViewIcon,
  ExpandMore as ExpandMoreIcon,
  GetApp as DownloadIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
import { useAuthInfo } from '@propelauth/react';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const JudgingResults = ({ orgId, hackathons, selectedHackathon, setSelectedHackathon }) => {
  const { accessToken } = useAuthInfo();
  const { enqueueSnackbar } = useSnackbar();

  // Calculate standard deviation for an array of scores
  const calculateStandardDeviation = (scores) => {
    if (scores.length <= 1) return 0;
    
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const squaredDifferences = scores.map(score => Math.pow(score - mean, 2));
    const variance = squaredDifferences.reduce((sum, diff) => sum + diff, 0) / (scores.length - 1);
    
    return Math.sqrt(variance);
  };
  
  const [loading, setLoading] = useState(false);
  const [selectedHackathonData, setSelectedHackathonData] = useState(null);
  const [round2Scores, setRound2Scores] = useState([]);
  const [loadingScores, setLoadingScores] = useState(false);
  const [viewScoresDialog, setViewScoresDialog] = useState(false);
  const [selectedTeamScores, setSelectedTeamScores] = useState(null);
  const [nonprofitNames, setNonprofitNames] = useState({});
  const [loadingNonprofits, setLoadingNonprofits] = useState(false);
  
  // Caching for performance
  const [judgeDetailsCache, setJudgeDetailsCache] = useState({});
  const [panelAssignmentsCache, setPanelAssignmentsCache] = useState({});
  const [loadingJudgeDetails, setLoadingJudgeDetails] = useState({});

  // Fetch hackathon details
  useEffect(() => {
    if (selectedHackathon && hackathons.length > 0) {
      const hackathon = hackathons.find(h => h.event_id === selectedHackathon);
      setSelectedHackathonData(hackathon);
    }
  }, [selectedHackathon, hackathons]);

  // Clear caches when hackathon changes
  useEffect(() => {
    setJudgeDetailsCache({});
    setPanelAssignmentsCache({});
    setRound2Scores([]);
  }, [selectedHackathon]);

  // Fetch judge details for a specific judge with caching
  const fetchJudgeDetails = useCallback(async (judgeId) => {
    if (!selectedHackathon) return null;
    
    // Check cache first
    if (judgeDetailsCache[judgeId]) {
      return judgeDetailsCache[judgeId];
    }
    
    // Check if we already have this judge's details loading
    if (loadingJudgeDetails[judgeId]) return null;
    
    setLoadingJudgeDetails(prev => ({ ...prev, [judgeId]: true }));
    
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/judge/judge/${judgeId}/event/${selectedHackathon}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Org-Id": orgId,
          },
        }
      );
      
      const judgeDetails = response.data.judge;
      
      // Cache the result
      setJudgeDetailsCache(prev => ({ ...prev, [judgeId]: judgeDetails }));
      setLoadingJudgeDetails(prev => ({ ...prev, [judgeId]: false }));
      
      return judgeDetails;
    } catch (error) {
      console.error(`Error fetching judge details for ${judgeId}:`, error);
      setLoadingJudgeDetails(prev => ({ ...prev, [judgeId]: false }));
      return null;
    }
  }, [selectedHackathon, accessToken, orgId, judgeDetailsCache, loadingJudgeDetails]);

  // Fetch assignments for a specific panel with caching
  const fetchPanelAssignments = useCallback(async (panelId) => {
    // Check cache first
    if (panelAssignmentsCache[panelId]) {
      return panelAssignmentsCache[panelId];
    }
    
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/judge/panel/${panelId}/assignments`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Org-Id": orgId,
          },
        }
      );
      
      const assignments = response.data.assignments || [];
      
      // Cache the result
      setPanelAssignmentsCache(prev => ({ ...prev, [panelId]: assignments }));
      
      return assignments;
    } catch (error) {
      console.error(`Error fetching assignments for panel ${panelId}:`, error);
      return [];
    }
  }, [accessToken, orgId, panelAssignmentsCache]);

  // Fetch nonprofit names for teams
  const fetchNonprofitNames = useCallback(async (teams) => {
    if (!teams || teams.length === 0) return;
    
    setLoadingNonprofits(true);
    const nonprofitIds = [...new Set(teams
      .filter(team => team.selected_nonprofit_id)
      .map(team => team.selected_nonprofit_id))];
    
    if (nonprofitIds.length === 0) {
      setLoadingNonprofits(false);
      return;
    }

    try {
      const nonprofitPromises = nonprofitIds.map(async (nonprofitId) => {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npo/${nonprofitId}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "X-Org-Id": orgId,
              },
            }
          );
          return { id: nonprofitId, name: response.data.nonprofits.name || `Nonprofit ${nonprofitId}` };
        } catch (error) {
          console.error(`Error fetching nonprofit ${nonprofitId}:`, error);
          return { id: nonprofitId, name: `Nonprofit ${nonprofitId}` };
        }
      });

      const nonprofitResults = await Promise.all(nonprofitPromises);
      const nonprofitMap = {};
      nonprofitResults.forEach(result => {
        nonprofitMap[result.id] = result.name;
      });
      
      setNonprofitNames(nonprofitMap);
    } catch (error) {
      console.error('Error fetching nonprofit names:', error);
    } finally {
      setLoadingNonprofits(false);
    }
  }, [accessToken, orgId]);

  // Fetch Round 2 scores
  const fetchRound2Scores = useCallback(async () => {
    if (!selectedHackathon || !selectedHackathonData) return;
    
    setLoadingScores(true);
    try {
      // Get all Round 2 panels
      const panelsResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/judge/panels/${selectedHackathon}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Org-Id": orgId,
          },
        }
      );

      const panels = panelsResponse.data.panels || [];
      const round2Panels = panels.filter(p => p.panel_name.includes('Round 2'));
      
      if (round2Panels.length === 0) {
        setRound2Scores([]);
        return;
      }

      // Load all panel assignments in parallel
      const panelAssignmentPromises = round2Panels.map(panel => 
        fetchPanelAssignments(panel.id)
      );
      
      const allPanelAssignments = await Promise.all(panelAssignmentPromises);
      const flatAssignments = allPanelAssignments.flat();
      
      // Get teams that were judged in Round 2
      const round2TeamIds = [...new Set(flatAssignments.map(a => a.team_id))];
      
      // Fetch team details
      const teamsResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/team/${selectedHackathonData.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Org-Id": orgId,
          },
        }
      );
      
      const allTeams = teamsResponse.data.teams || [];
      const round2Teams = allTeams.filter(team => round2TeamIds.includes(team.id));
      
      // Fetch nonprofit names
      await fetchNonprofitNames(round2Teams);
      
      // Collect all unique judge IDs and load their details in parallel
      const allJudgeIds = [...new Set(flatAssignments.map(a => a.judge_id))];
      const judgeDetailPromises = allJudgeIds.map(judgeId => fetchJudgeDetails(judgeId));
      await Promise.all(judgeDetailPromises);
      
      const teamScores = [];
      
      // Process each team
      for (const team of round2Teams) {
        const teamScoreData = {
          team,
          scores: [],
          averageScore: 0,
          totalScore: 0,
          judgeCount: 0,
          totalAssignedJudges: 0,
          completionPercentage: 0
        };
        
        // Get assignments for this team
        const teamAssignments = flatAssignments.filter(a => a.team_id === team.id);
        teamScoreData.totalAssignedJudges = teamAssignments.length;
        
        // Fetch scores for each assignment in parallel
        const scorePromises = teamAssignments.map(async (assignment) => {
          try {
            const scoreResponse = await axios.get(
              `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/judge/admin/score/${assignment.judge_id}/${team.id}/${selectedHackathon}/round2`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "X-Org-Id": orgId,
                },
              }
            );
            
            if (scoreResponse.data.score && !scoreResponse.data.score.is_draft) {
              const judgeDetails = judgeDetailsCache[assignment.judge_id];
              return {
                judge: judgeDetails || { name: assignment.judge_id },
                score: scoreResponse.data.score
              };
            }
          } catch (error) {
            console.log(`No score found for judge ${assignment.judge_id} and team ${team.id}`);
          }
          return null;
        });
        
        const scoreResults = await Promise.all(scorePromises);
        teamScoreData.scores = scoreResults.filter(result => result !== null);
        teamScoreData.judgeCount = teamScoreData.scores.length;
        
        // Calculate completion percentage
        if (teamScoreData.totalAssignedJudges > 0) {
          teamScoreData.completionPercentage = (teamScoreData.judgeCount / teamScoreData.totalAssignedJudges) * 100;
        }
        
        // Calculate averages using total_score - even with partial scores
        if (teamScoreData.scores.length > 0) {
          const totalScores = teamScoreData.scores.map(s => s.score.total_score || 0);
          
          teamScoreData.totalScore = totalScores.reduce((sum, score) => sum + score, 0);
          teamScoreData.averageScore = teamScoreData.totalScore / teamScoreData.scores.length;
          teamScoreData.standardDeviation = calculateStandardDeviation(totalScores);
        } else {
          teamScoreData.standardDeviation = 0;
        }
        
        // Always add the team, even if no scores yet
        teamScores.push(teamScoreData);
      }
      
      // Sort by completion status first, then by average score, then by standard deviation for tie-breaking
      teamScores.sort((a, b) => {
        // Teams with scores come first
        if (a.judgeCount > 0 && b.judgeCount === 0) return -1;
        if (a.judgeCount === 0 && b.judgeCount > 0) return 1;
        
        // Among teams with scores, sort by average score descending
        if (a.judgeCount > 0 && b.judgeCount > 0) {
          const scoreDiff = b.averageScore - a.averageScore;
          
          // If average scores are very close (within 0.01), use standard deviation for tie-breaking
          if (Math.abs(scoreDiff) < 0.01) {
            // Lower standard deviation wins (more consistent scoring)
            return a.standardDeviation - b.standardDeviation;
          }
          
          return scoreDiff;
        }
        
        // Among teams without scores, sort by team name
        return a.team.name.localeCompare(b.team.name);
      });
      
      setRound2Scores(teamScores);
      
    } catch (error) {
      console.error('Error fetching Round 2 scores:', error);
      enqueueSnackbar('Failed to fetch Round 2 scores', { variant: 'error' });
    } finally {
      setLoadingScores(false);
    }
  }, [selectedHackathon, selectedHackathonData, accessToken, orgId, fetchPanelAssignments, fetchJudgeDetails, judgeDetailsCache, fetchNonprofitNames, enqueueSnackbar]);

  // Fetch Round 2 scores when hackathon is selected
  useEffect(() => {
    if (selectedHackathon && selectedHackathonData) {
      fetchRound2Scores();
    }
  }, [selectedHackathon, selectedHackathonData]);

  // View detailed scores for a team
  const viewTeamScores = (teamScoreData) => {
    setSelectedTeamScores(teamScoreData);
    setViewScoresDialog(true);
  };

  // Generate trophy color based on ranking
  const getTrophyColor = (index) => {
    switch (index) {
      case 0: return 'warning'; // Gold
      case 1: return 'action'; // Silver  
      case 2: return '#CD7F32'; // Bronze
      default: return 'action';
    }
  };

  // Generate podium height based on ranking
  const getPodiumHeight = (index) => {
    switch (index) {
      case 0: return 100; // Winner - tallest
      case 1: return 80;  // Second - medium
      case 2: return 60;  // Third - shortest
      default: return 40;
    }
  };

  // Export results to CSV
  const exportResults = () => {
    if (round2Scores.length === 0) {
      enqueueSnackbar('No results to export', { variant: 'warning' });
      return;
    }

    const csvContent = [
      ['Rank', 'Team Name', 'Nonprofit', 'Average Score', 'Total Score', 'Judges Complete', 'Total Assigned', 'Completion %'],
      ...round2Scores.map((teamData, index) => [
        index + 1,
        teamData.team.name,
        teamData.team.selected_nonprofit_id ? 
          (nonprofitNames[teamData.team.selected_nonprofit_id] || 'Unknown') : 
          'No nonprofit',
        teamData.judgeCount > 0 ? teamData.averageScore.toFixed(1) : 'N/A',
        teamData.judgeCount > 0 ? teamData.totalScore.toFixed(1) : 'N/A',
        teamData.judgeCount,
        teamData.totalAssignedJudges,
        teamData.completionPercentage.toFixed(0) + '%'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `round2-results-${selectedHackathonData?.title || 'hackathon'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    enqueueSnackbar('Results exported successfully!', { variant: 'success' });
  };

  // Copy all feedback for a team to clipboard
  const copyAllFeedback = (teamScoreData) => {
    if (!teamScoreData || teamScoreData.scores.length === 0) {
      enqueueSnackbar('No feedback available to copy', { variant: 'warning' });
      return;
    }

    const feedbackText = [
      `=== Feedback for ${teamScoreData.team.name} ===`,
      `Average Score: ${teamScoreData.averageScore.toFixed(1)}`,
      `Total Score: ${teamScoreData.totalScore.toFixed(1)}`,
      `Judges Complete: ${teamScoreData.judgeCount}/${teamScoreData.totalAssignedJudges}`,
      '',
      '--- Individual Judge Feedback ---',
      ...teamScoreData.scores.map((judgeScore) => {
        const judgeName = judgeScore.judge.name || 
          (judgeScore.judge.firstName && judgeScore.judge.lastName 
            ? `${judgeScore.judge.firstName} ${judgeScore.judge.lastName}` 
            : judgeScore.judge.firstName || judgeScore.judge.lastName || 'Unknown Judge');
        
        const company = judgeScore.judge.company || judgeScore.judge.companyName || 'Unknown Company';
        const totalScore = judgeScore?.score?.total_score || 0;
        const feedback = typeof judgeScore.score?.feedback === 'object' 
          ? judgeScore.score?.feedback?.general || 'No feedback provided'
          : judgeScore.score?.feedback || 'No feedback provided';

        return [                    
          `Judge Feedback: ${feedback}`,
          ''
        ].join('\n');
      })
    ].join('\n');

    navigator.clipboard.writeText(feedbackText).then(() => {
      enqueueSnackbar('All feedback copied to clipboard!', { variant: 'success' });
    }).catch(() => {
      enqueueSnackbar('Failed to copy feedback to clipboard', { variant: 'error' });
    });
  };

  // Winner podium component with animations
  const WinnerPodium = ({ winners }) => (
    <Box sx={{ mb: 4 }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        align="center" 
        sx={{ 
          mb: 4,
          background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        🏆 Final Results 🏆
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        {winners.slice(0, 3).map((teamData, index) => (
          <Grid size={{ xs: 12, sm: 4 }} key={teamData.team.id}>
            <Card 
              sx={{ 
                textAlign: 'center',
                border: index === 0 ? '3px solid gold' : index === 1 ? '2px solid silver' : '1px solid #CD7F32',
                backgroundColor: index === 0 ? 'rgba(255, 215, 0, 0.1)' : 'inherit',
                transform: index === 0 ? 'scale(1.05)' : 'scale(1)',
                position: 'relative',
                minHeight: getPodiumHeight(index) + 200,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: index === 0 ? 'scale(1.08)' : 'scale(1.02)',
                  boxShadow: 6
                }
              }}
            >
              <CardContent>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: index === 0 ? 'warning.main' : index === 1 ? 'grey.400' : '#CD7F32',
                    fontSize: '2rem'
                  }}
                >
                  {index + 1}
                </Avatar>
                <Typography variant={index === 0 ? 'h5' : 'h6'} sx={{ fontWeight: 'bold', mb: 1 }}>
                  {teamData.team.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {teamData.team.selected_nonprofit_id ? 
                    (nonprofitNames[teamData.team.selected_nonprofit_id] || 'Loading...') : 
                    'No nonprofit'
                  }
                </Typography>
                {teamData.judgeCount > 0 ? (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                        {teamData.averageScore.toFixed(1)}
                      </Typography>
                      <Box sx={{ display: 'flex' }}>
                        {[1,2,3,4,5].map(star => (
                          <StarIcon 
                            key={star}
                            sx={{ 
                              fontSize: 20,
                              color: star <= teamData.averageScore/2 ? 'warning.main' : 'action.disabled'
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Chip 
                        label={`${teamData.judgeCount}/${teamData.totalAssignedJudges} judges`} 
                        size="small" 
                        color={teamData.completionPercentage === 100 ? "success" : "warning"}
                        variant="outlined"
                      />
                      {teamData.completionPercentage < 100 && (
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                          {teamData.completionPercentage.toFixed(0)}% complete
                        </Typography>
                      )}
                    </Box>
                  </>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Typography variant="h4" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                        --
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Chip 
                        label={`0/${teamData.totalAssignedJudges} judges`} 
                        size="small" 
                        color="error"
                        variant="outlined"
                      />
                      <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                        Awaiting scores
                      </Typography>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Hackathon Selection */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth>
            <InputLabel>Select Hackathon</InputLabel>
            <Select
              value={selectedHackathon}
              onChange={(e) => setSelectedHackathon(e.target.value)}
              label="Select Hackathon"
            >
              {hackathons.map((hackathon) => (
                <MenuItem key={hackathon.event_id} value={hackathon.event_id}>
                  {hackathon.event_id} - {new Date(hackathon.start_date).toLocaleDateString()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined" 
              startIcon={<DownloadIcon />}
              onClick={exportResults}
              disabled={round2Scores.length === 0 || loadingScores}
            >
              Export Results
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<PrintIcon />}
              onClick={() => window.print()}
            >
              Print Results
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<ShareIcon />}
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                enqueueSnackbar('Results URL copied to clipboard!', { variant: 'success' });
              }}
            >
              Share Results
            </Button>
          </Box>
        </Grid>
      </Grid>

      {!selectedHackathon ? (
        <Alert severity="info">Please select a hackathon to view final results.</Alert>
      ) : (
        <>
          {loadingScores ? (
            <Box>
              <Skeleton variant="text" width={300} height={40} sx={{ mx: 'auto', mb: 4 }} />
              <Grid container spacing={3} justifyContent="center">
                {[1, 2, 3].map((item) => (
                  <Grid size={{ xs: 12, sm: 4 }} key={item}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Skeleton variant="circular" width={80} height={80} sx={{ mx: 'auto', mb: 2 }} />
                        <Skeleton variant="text" width={150} height={30} sx={{ mx: 'auto', mb: 1 }} />
                        <Skeleton variant="text" width={100} height={20} sx={{ mx: 'auto', mb: 2 }} />
                        <Skeleton variant="text" width={80} height={40} sx={{ mx: 'auto' }} />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : round2Scores.length === 0 ? (
            <Alert 
              severity="warning" 
              sx={{ 
                '& .MuiAlert-message': {
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }
              }}
            >
              <TrophyIcon />
              No Round 2 results found. Make sure Round 2 judging has been completed and scores have been submitted.
            </Alert>
          ) : (
            <>
              {/* Partial Results Notice */}
              {round2Scores.some(ts => ts.completionPercentage < 100) && (
                <Alert 
                  severity="info" 
                  sx={{ mb: 3 }}
                  icon={<TrophyIcon />}
                >
                  <Typography variant="body2">
                    <strong>Partial Results:</strong> Some teams are still awaiting judge scores. 
                    Rankings shown are based on currently available scores and may change as judging completes.
                  </Typography>
                </Alert>
              )}

              {/* Winner Podium */}
              <WinnerPodium winners={round2Scores} />

              {/* Detailed Results Table */}
              <Accordion defaultExpanded sx={{ mb: 3 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">
                    Complete Results ({round2Scores.length} teams)
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Rank</TableCell>
                          <TableCell>Team Name</TableCell>
                          <TableCell>Nonprofit</TableCell>
                          <TableCell align="center">Completion</TableCell>
                          <TableCell align="center">Average Score</TableCell>
                          <TableCell align="center">Total Score</TableCell>
                          <TableCell align="center">
                            <Tooltip title="Standard Deviation of scores - lower values indicate more consistent scoring and break ties">
                              <span>Std Dev</span>
                            </Tooltip>
                          </TableCell>
                          <TableCell align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {round2Scores.map((teamScoreData, index) => {
                          const { team, averageScore, judgeCount, totalScore, totalAssignedJudges, completionPercentage, standardDeviation } = teamScoreData;
                          const nonprofitName = team.selected_nonprofit_id ? 
                            (nonprofitNames[team.selected_nonprofit_id] || 'Loading...') : 'No nonprofit';
                          
                          return (
                            <TableRow 
                              key={team.id}
                              sx={{ 
                                backgroundColor: index < 3 && judgeCount > 0 ? 'action.selected' : 'inherit'
                              }}
                            >
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {index < 3 && judgeCount > 0 && (
                                    <TrophyIcon 
                                      sx={{ 
                                        color: getTrophyColor(index),
                                        fontSize: 24
                                      }} 
                                    />
                                  )}
                                  <Typography variant={index < 3 && judgeCount > 0 ? 'h6' : 'body1'} sx={{ fontWeight: index < 3 && judgeCount > 0 ? 600 : 400 }}>
                                    #{index + 1}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body1" sx={{ fontWeight: index < 3 && judgeCount > 0 ? 600 : 400 }}>
                                  {team.name}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {loadingNonprofits ? 'Loading...' : nonprofitName}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Box>
                                  <Chip 
                                    label={`${judgeCount}/${totalAssignedJudges}`} 
                                    size="small" 
                                    color={judgeCount === 0 ? 'error' : completionPercentage === 100 ? 'success' : 'warning'}
                                    variant="outlined"
                                  />
                                  <Typography variant="caption" display="block" color="text.secondary">
                                    {completionPercentage.toFixed(0)}%
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                {judgeCount > 0 ? (
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                      {averageScore.toFixed(1)}
                                    </Typography>
                                    <Box sx={{ display: 'flex' }}>
                                      {[1,2,3,4,5].map(star => (
                                        <StarIcon 
                                          key={star}
                                          sx={{ 
                                            fontSize: 16,
                                            color: star <= averageScore/2 ? 'warning.main' : 'action.disabled'
                                          }}
                                        />
                                      ))}
                                    </Box>
                                  </Box>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    No scores
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                  {totalScore.toFixed(1)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                {judgeCount > 1 ? (
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {teamScoreData.standardDeviation.toFixed(2)}
                                  </Typography>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    {judgeCount === 1 ? 'N/A' : '—'}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell align="center">
                                <Button
                                  size="small"
                                  variant={index < 3 && judgeCount > 0 ? 'contained' : 'outlined'}
                                  color={index === 0 && judgeCount > 0 ? 'warning' : index === 1 && judgeCount > 0 ? 'info' : index === 2 && judgeCount > 0 ? 'secondary' : 'primary'}
                                  startIcon={<ViewIcon />}
                                  onClick={() => viewTeamScores(teamScoreData)}
                                  disabled={totalAssignedJudges === 0}
                                  sx={{
                                    minWidth: 120,
                                    fontWeight: index < 3 && judgeCount > 0 ? 600 : 400
                                  }}
                                >
                                  {judgeCount === 0 ? 'View Assignments' : 'View Details'}
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            </>
          )}
        </>
      )}

      {/* Team Scores Detail Dialog */}
      <Dialog 
        open={viewScoresDialog} 
        onClose={() => setViewScoresDialog(false)} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrophyIcon />
            Round 2 {selectedTeamScores?.judgeCount > 0 ? 'Scores' : 'Assignments'}: {selectedTeamScores?.team?.name}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedTeamScores && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Team Overview
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {selectedTeamScores.averageScore.toFixed(1)}
                        </Typography>
                        <Typography variant="body2">Average Score</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="secondary">
                          {selectedTeamScores.judgeCount}/{selectedTeamScores.totalAssignedJudges}
                        </Typography>
                        <Typography variant="body2">Judges Complete</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main">
                          {selectedTeamScores.totalScore.toFixed(1)}
                        </Typography>
                        <Typography variant="body2">Total Score</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="warning.main">
                          {round2Scores.findIndex(ts => ts.team.id === selectedTeamScores.team.id) + 1}
                        </Typography>
                        <Typography variant="body2">Final Rank</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
              
              {/* Replace heading with container + copy button */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, mt: 2 }}>
                <Typography variant="h6">
                  {selectedTeamScores.scores.length > 0 ? 'Individual Judge Scores' : 'Judge Assignments'}
                </Typography>
                {selectedTeamScores.scores.length > 0 && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => copyAllFeedback(selectedTeamScores)}
                  >
                    Copy All Feedback
                  </Button>
                )}
              </Box>
              
              {selectedTeamScores.totalAssignedJudges === 0 ? (
                <Alert severity="warning">
                  No judges have been assigned to evaluate this team in Round 2.
                </Alert>
              ) : selectedTeamScores.scores.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Judge</TableCell>
                        <TableCell>Company</TableCell>
                        {selectedTeamScores.scores?.[0]?.score?.scores && Object
                          .keys(selectedTeamScores.scores[0].score.scores)
                          .filter(k => k.toLowerCase() !== 'total') // prevent duplicate Total column
                          .map(criteria => (
                            <TableCell key={criteria} align="center">
                              {criteria.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </TableCell>
                        ))}
                        <TableCell align="center">Total</TableCell>
                        <TableCell>Feedback</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedTeamScores.scores.map((judgeScore, index) => {
                        const totalScore = judgeScore?.score?.total_score || 0;
                        if (!judgeScore || !judgeScore.judge) {
                          return null; // Skip invalid entries
                        }
                        return (
                          <TableRow key={index}>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {judgeScore.judge.name || 
                                  (judgeScore.judge.firstName && judgeScore.judge.lastName 
                                    ? `${judgeScore.judge.firstName} ${judgeScore.judge.lastName}` 
                                    : judgeScore.judge.firstName || judgeScore.judge.lastName || 'Unknown Judge')}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {judgeScore.judge.company || judgeScore.judge.companyName || 'Unknown Company'}
                              </Typography>
                            </TableCell>
                            {judgeScore.score?.scores && Object
                              .entries(judgeScore.score.scores)
                              .filter(([k]) => k.toLowerCase() !== 'total')
                              .map(([criteria, score]) => (
                                <TableCell key={criteria} align="center">
                                  <Chip
                                    label={score || 0}
                                    size="small"
                                    color={score >= 8 ? 'success' : score >= 6 ? 'warning' : 'default'}
                                  />
                                </TableCell>
                            ))}
                            <TableCell align="center">
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {totalScore}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {typeof judgeScore.score?.feedback === 'object' 
                                  ? judgeScore.score?.feedback?.general || 'No feedback provided'
                                  : judgeScore.score?.feedback || 'No feedback provided'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    This team has been assigned to {selectedTeamScores.totalAssignedJudges} judge(s) but no scores have been submitted yet.
                  </Alert>
                  <Typography variant="body2" color="text.secondary">
                    Judges will evaluate this team during Round 2 final judging sessions. Scores will appear here once submitted.
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewScoresDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JudgingResults;