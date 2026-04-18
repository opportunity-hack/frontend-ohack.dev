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
  Button,
  Alert,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Switch,
  FormControlLabel,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import {
  Groups as GroupsIcon,
  Person as PersonIcon,
  EmojiEvents as TrophyIcon,
  LocationOn as LocationIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Visibility as ViewIcon,
  Sort as SortIcon,
  Edit as EditIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
import { useAuthInfo } from '@propelauth/react';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const JudgingRound2 = ({ orgId, hackathons, selectedHackathon, setSelectedHackathon }) => {
  const { accessToken } = useAuthInfo();
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(false);
  const [judges, setJudges] = useState([]);
  const [teams, setTeams] = useState([]);
  const [finalistTeams, setFinalistTeams] = useState([]);
  const [selectedHackathonData, setSelectedHackathonData] = useState(null);
  const [sessionSettings, setSessionSettings] = useState({
    sessionDuration: 6, // minutes per team presentation
    breakDuration: 1,    // minutes between presentations
    startTime: '16:40',
    room: 'Main Room'
  });
  const [settingsDialog, setSettingsDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [round1Scores, setRound1Scores] = useState([]);
  const [loadingScores, setLoadingScores] = useState(false);
  const [sortBy, setSortBy] = useState('totalScore');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewScoresDialog, setViewScoresDialog] = useState(false);
  const [selectedTeamScores, setSelectedTeamScores] = useState(null);
  const [detailScoresSortBy, setDetailScoresSortBy] = useState('judge');
  const [detailScoresSortOrder, setDetailScoresSortOrder] = useState('asc');
  const [nonprofitNames, setNonprofitNames] = useState({});
  const [loadingNonprofits, setLoadingNonprofits] = useState(false);
  const [loadingJudgeDetails, setLoadingJudgeDetails] = useState({});
  const [judgeGroups, setJudgeGroups] = useState([]);
  const [loadingPanels, setLoadingPanels] = useState(false);

  // Add caching states
  const [judgeDetailsCache, setJudgeDetailsCache] = useState({});
  const [panelAssignmentsCache, setPanelAssignmentsCache] = useState({});
  const [scoresCache, setScoresCache] = useState({});

  // Fetch hackathon details
  useEffect(() => {
    if (selectedHackathon && hackathons.length > 0) {
      const hackathon = hackathons.find(h => h.event_id === selectedHackathon);
      setSelectedHackathonData(hackathon);
      console.log('Selected Hackathon Data:', hackathon);
    }
  }, [selectedHackathon, hackathons]);

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
      console.log('Successfully fetched judge details for', judgeId, ':', judgeDetails);
      
      // Ensure consistent user_id field
      if (judgeDetails && !judgeDetails.user_id) {
        judgeDetails.user_id = judgeId;
      }
      
      // Cache the result
      setJudgeDetailsCache(prev => ({ ...prev, [judgeId]: judgeDetails }));
      setLoadingJudgeDetails(prev => ({ ...prev, [judgeId]: false }));
      
      return judgeDetails;
    } catch (error) {
      console.error(`Error fetching judge details for ${judgeId}:`, error);
      setLoadingJudgeDetails(prev => ({ ...prev, [judgeId]: false }));
      
      // Try to find the judge in the initially loaded judges as fallback
      const fallbackJudge = judges.find(j => j.user_id === judgeId);
      if (fallbackJudge) {
        console.log('Using fallback judge from initial load:', fallbackJudge);
        setJudgeDetailsCache(prev => ({ ...prev, [judgeId]: fallbackJudge }));
        return fallbackJudge;
      }
      
      return null;
    }
  }, [selectedHackathon, accessToken, orgId, judgeDetailsCache, loadingJudgeDetails, judges]);

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

  // Clear caches when hackathon changes
  useEffect(() => {
    setJudgeDetailsCache({});
    setPanelAssignmentsCache({});
    setScoresCache({});
  }, [selectedHackathon]);

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

  // Optimized fetch Round 1 scores with single API call
  const fetchRound1Scores = useCallback(async () => {
    if (!selectedHackathon || teams.length === 0) return;
    
    // Check if we have cached scores for this hackathon
    const cacheKey = `${selectedHackathon}_${teams.length}`;
    if (scoresCache[cacheKey]) {
      setRound1Scores(scoresCache[cacheKey]);
      return;
    }
    
    setLoadingScores(true);
    try {
      // Single API call to get all Round 1 scores
      const scoresResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/judge/admin/scores/${selectedHackathon}/round1`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Org-Id": orgId,
          },
        }
      );

      const allScores = scoresResponse.data.scores || [];
      console.log('Fetched all Round 1 scores:', allScores);
      
      // Group scores by team
      const teamScoreMap = new Map();
      
      // Initialize all teams with empty score data
      teams.forEach(team => {
        teamScoreMap.set(team.id, {
          team,
          scores: [],
          averageScore: 0,
          totalScore: 0,
          judgeCount: 0
        });
      });
      
      // Process scores and group by team
      allScores.forEach(scoreData => {
        if (teamScoreMap.has(scoreData.team_id)) {
          const teamData = teamScoreMap.get(scoreData.team_id);
          
          // Create judge info from the score data
          const judgeInfo = {
            name: scoreData.judge_name || `Judge ${scoreData.judge_id}`,
            user_id: scoreData.judge_id,
            company: 'N/A' // Not provided in the new endpoint
          };
          
          teamData.scores.push({
            judge: judgeInfo,
            score: {
              total_score: scoreData.total_score,
              scores: scoreData.scores,
              feedback: scoreData.feedback?.general || '',
              is_draft: false, // Scores from this endpoint are submitted
              created_at: scoreData.created_at,
              submitted_at: scoreData.submitted_at
            }
          });
        }
      });
      
      // Calculate averages, totals, and statistics for each team
      const teamScores = Array.from(teamScoreMap.values()).map(teamData => {
        if (teamData.scores.length > 0) {
          const totalScores = teamData.scores.map(s => s.score.total_score || 0);
          teamData.totalScore = totalScores.reduce((sum, score) => sum + score, 0);
          teamData.averageScore = teamData.totalScore / teamData.scores.length;
          teamData.judgeCount = teamData.scores.length;

          // Calculate standard deviation
          if (totalScores.length > 1) {
            const mean = teamData.averageScore;
            const variance = totalScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / totalScores.length;
            teamData.standardDeviation = Math.sqrt(variance);
          } else {
            teamData.standardDeviation = 0;
          }

          // Calculate highest and lowest scores
          teamData.highestScore = Math.max(...totalScores);
          teamData.lowestScore = Math.min(...totalScores);

          // Calculate median score
          const sortedScores = [...totalScores].sort((a, b) => a - b);
          const mid = Math.floor(sortedScores.length / 2);
          if (sortedScores.length % 2 === 0) {
            teamData.medianScore = (sortedScores[mid - 1] + sortedScores[mid]) / 2;
          } else {
            teamData.medianScore = sortedScores[mid];
          }
        } else {
          teamData.standardDeviation = 0;
          teamData.highestScore = 0;
          teamData.lowestScore = 0;
          teamData.medianScore = 0;
        }
        return teamData;
      });
      
      // Sort by average score descending
      teamScores.sort((a, b) => b.averageScore - a.averageScore);
      
      // Cache the results
      setScoresCache(prev => ({ ...prev, [cacheKey]: teamScores }));
      setRound1Scores(teamScores);
      
      // Auto-select top teams as finalists if none selected
      if (finalistTeams.length === 0 && teamScores.length > 0) {
        const topTeams = teamScores
          .filter(ts => ts.judgeCount > 0)
          .slice(0, Math.min(5, teamScores.length))
          .map(ts => ts.team);
        setFinalistTeams(topTeams);
      }
      
    } catch (error) {
      console.error('Error fetching Round 1 scores:', error);
      enqueueSnackbar('Failed to fetch Round 1 scores', { variant: 'error' });
    } finally {
      setLoadingScores(false);
    }
  }, [selectedHackathon, teams, accessToken, orgId, scoresCache, finalistTeams.length, enqueueSnackbar]);

  // Fetch judges and teams for selected hackathon
  const fetchData = useCallback(async () => {
    if (!selectedHackathon || !selectedHackathonData) return;
    
    setLoading(true);
    try {
      const [judgesResponse, teamsResponse] = await Promise.all([
        axios.get(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/admin/hackathon/${selectedHackathon}/judge`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "X-Org-Id": orgId,
            },
          }
        ),
        axios.get(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/team/${selectedHackathonData.id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "X-Org-Id": orgId,
            },
          }
        )
      ]);

      // Only get accepted judges
      const acceptedJudges = judgesResponse.data.data?.filter(judge => judge.isSelected) || [];
      console.log('Loaded judges in Round 2:', acceptedJudges);
      console.log('Sample judge structure:', acceptedJudges[0]);
      setJudges(acceptedJudges);
      
      const allTeams = teamsResponse.data.teams || [];
      setTeams(allTeams);
      
      // Fetch nonprofit names for teams
      await fetchNonprofitNames(allTeams);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      enqueueSnackbar('Failed to fetch judging data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [selectedHackathon, selectedHackathonData, accessToken, orgId, fetchNonprofitNames, enqueueSnackbar]);

  // Load existing Round 2 assignments
  const loadExistingRound2 = useCallback(async () => {
    if (!selectedHackathon || teams.length === 0) return;

    setLoadingPanels(true);
    try {
      // Step 1: Load panels
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
      const round2Panel = panels.find(p => p.panel_name === 'Round 2 - Final Judging');
      
      if (round2Panel) {
        // Step 2: Load assignments for Round 2 panel
        const assignments = await fetchPanelAssignments(round2Panel.id);
        
        // Group assignments by judge and team
        const judgeMap = new Map();
        const teamSet = new Set();
        
        for (const assignment of assignments) {
          // Collect unique judges
          if (!judgeMap.has(assignment.judge_id)) {
            const judgeDetails = await fetchJudgeDetails(assignment.judge_id);
            if (judgeDetails) {
              judgeMap.set(assignment.judge_id, judgeDetails);
            }
          }
          
          // Collect unique teams
          if (assignment.team_id) {
            const team = teams.find(t => t.id === assignment.team_id);
            if (team) {
              teamSet.add(team);
            }
          }
        }
        
        const panelJudges = Array.from(judgeMap.values());
        const panelTeams = Array.from(teamSet);
        
        // Update state
        setFinalistTeams(panelTeams);
        setJudgeGroups([{
          id: round2Panel.id,
          panel_id: round2Panel.id,
          name: round2Panel.panel_name,
          judges: panelJudges,
          teams: panelTeams,
          room: round2Panel.room || ''
        }]);
        
        // Update session settings from panel data
        if (round2Panel.room) {
          setSessionSettings(prev => ({ ...prev, room: round2Panel.room }));
        }
      }
    } catch (error) {
      console.error('Error loading existing Round 2 assignments:', error);
      // Don't show error to user - this might be first time setup
    } finally {
      setLoadingPanels(false);
    }
  }, [selectedHackathon, teams, accessToken, orgId, fetchPanelAssignments, fetchJudgeDetails]);

  // Fetch Round 1 scores when teams data is available (only once per hackathon/teams change)
  useEffect(() => {
    let mounted = true;
    
    if (selectedHackathon && teams.length > 0) {
      fetchRound1Scores().then(() => {
        if (!mounted) return;
        // Only auto-select finalists if we haven't loaded existing Round 2 data
        // and no finalists are currently selected
      });
    }
    
    return () => {
      mounted = false;
    };
  }, [selectedHackathon, teams.length]); // Removed fetchRound1Scores dependency

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Load existing Round 2 assignments when data is available
  useEffect(() => {
    if (selectedHackathon && judges.length > 0 && teams.length > 0) {
      loadExistingRound2();
    }
  }, [selectedHackathon, judges.length, teams.length]); // Removed loadExistingRound2 dependency

  // Toggle team finalist status
  const toggleFinalistStatus = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    const isCurrentlyFinalist = finalistTeams.some(t => t.id === teamId);
    
    if (isCurrentlyFinalist) {
      setFinalistTeams(finalistTeams.filter(t => t.id !== teamId));
    } else {
      setFinalistTeams([...finalistTeams, team]);
    }
  };

  // Handle sorting of teams by scores
  const handleSort = (field) => {
    const isAsc = sortBy === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortBy(field);
  };

  // Get sorted teams with scores
  const getSortedTeamsWithScores = () => {
    if (round1Scores.length === 0) return teams.map(team => ({
      team,
      averageScore: 0,
      judgeCount: 0,
      scores: [],
      standardDeviation: 0,
      highestScore: 0,
      lowestScore: 0,
      medianScore: 0
    }));

    const sorted = [...round1Scores].sort((a, b) => {
      switch (sortBy) {
        case 'teamName':
          return sortOrder === 'asc' ? a.team.name.localeCompare(b.team.name) : b.team.name.localeCompare(a.team.name);
        case 'judgeCount':
          return sortOrder === 'asc' ? a.judgeCount - b.judgeCount : b.judgeCount - a.judgeCount;
        case 'standardDeviation':
          return sortOrder === 'asc' ? a.standardDeviation - b.standardDeviation : b.standardDeviation - a.standardDeviation;
        case 'highestScore':
          return sortOrder === 'asc' ? a.highestScore - b.highestScore : b.highestScore - a.highestScore;
        case 'lowestScore':
          return sortOrder === 'asc' ? a.lowestScore - b.lowestScore : b.lowestScore - a.lowestScore;
        case 'medianScore':
          return sortOrder === 'asc' ? a.medianScore - b.medianScore : b.medianScore - a.medianScore;
        case 'totalScore':
        default:
          return sortOrder === 'asc' ? a.averageScore - b.averageScore : b.averageScore - a.averageScore;
      }
    });

    return sorted;
  };

  // View detailed scores for a team
  const viewTeamScores = (teamScoreData) => {
    setSelectedTeamScores(teamScoreData);
    setViewScoresDialog(true);
    // Reset sorting when opening dialog
    setDetailScoresSortBy('judge');
    setDetailScoresSortOrder('asc');
  };

  // Handle sorting for detail scores table
  const handleDetailScoresSort = (field) => {
    const isAsc = detailScoresSortBy === field && detailScoresSortOrder === 'asc';
    setDetailScoresSortOrder(isAsc ? 'desc' : 'asc');
    setDetailScoresSortBy(field);
  };

  // Get sorted judge scores for detail view
  const getSortedDetailScores = () => {
    if (!selectedTeamScores || !selectedTeamScores.scores) return [];

    const sorted = [...selectedTeamScores.scores].sort((a, b) => {
      let aValue, bValue;

      switch (detailScoresSortBy) {
        case 'judge':
          aValue = a.judge.name || `${a.judge.firstName} ${a.judge.lastName}`;
          bValue = b.judge.name || `${b.judge.firstName} ${b.judge.lastName}`;
          return detailScoresSortOrder === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);

        case 'total':
          aValue = a.score.total_score || 0;
          bValue = b.score.total_score || 0;
          return detailScoresSortOrder === 'asc' ? aValue - bValue : bValue - aValue;

        case 'created_at':
          aValue = new Date(a.score.created_at || 0).getTime();
          bValue = new Date(b.score.created_at || 0).getTime();
          return detailScoresSortOrder === 'asc' ? aValue - bValue : bValue - aValue;

        case 'submitted_at':
          aValue = new Date(a.score.submitted_at || 0).getTime();
          bValue = new Date(b.score.submitted_at || 0).getTime();
          return detailScoresSortOrder === 'asc' ? aValue - bValue : bValue - aValue;

        default:
          // Handle criteria sorting
          aValue = a.score.scores[detailScoresSortBy] || 0;
          bValue = b.score.scores[detailScoresSortBy] || 0;
          return detailScoresSortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });

    return sorted;
  };

  // Format timestamp for display (readable format with seconds)
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '-';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return timestamp;
    }
  };

  // Copy team ID to clipboard
  const copyTeamId = (teamId, teamName) => {
    navigator.clipboard.writeText(teamId).then(() => {
      enqueueSnackbar(`Copied team ID for ${teamName}`, { variant: 'success' });
    }).catch((err) => {
      console.error('Failed to copy team ID:', err);
      enqueueSnackbar('Failed to copy team ID', { variant: 'error' });
    });
  };

  // Copy judge ID to clipboard
  const copyJudgeId = (judgeId, judgeName) => {
    navigator.clipboard.writeText(judgeId).then(() => {
      enqueueSnackbar(`Copied judge ID for ${judgeName}`, { variant: 'success' });
    }).catch((err) => {
      console.error('Failed to copy judge ID:', err);
      enqueueSnackbar('Failed to copy judge ID', { variant: 'error' });
    });
  };

  // Copy all feedback from judges to clipboard
  const copyAllFeedback = () => {
    if (!selectedTeamScores || selectedTeamScores.scores.length === 0) return;

    const feedbackText = selectedTeamScores.scores
      .map((judgeScore, index) => {
        const judgeName = judgeScore.judge.name || `${judgeScore.judge.firstName} ${judgeScore.judge.lastName}`;
        const feedback = judgeScore.score.feedback || 'No feedback provided';
        const createdAt = formatTimestamp(judgeScore.score.created_at);
        const submittedAt = formatTimestamp(judgeScore.score.submitted_at);
        return `Judge ${index + 1} - ${judgeName}:\nCreated: ${createdAt}\nSubmitted: ${submittedAt}\nFeedback: ${feedback}`;
      })
      .join('\n\n---\n\n');

    navigator.clipboard.writeText(feedbackText).then(() => {
      enqueueSnackbar('Feedback copied to clipboard!', { variant: 'success' });
    }).catch((err) => {
      console.error('Failed to copy feedback:', err);
      enqueueSnackbar('Failed to copy feedback', { variant: 'error' });
    });
  };

  // Auto-select top N teams as finalists
  const selectTopTeams = (count) => {
    const sortedTeams = getSortedTeamsWithScores();
    const topTeams = sortedTeams
      .filter(ts => ts.judgeCount > 0)
      .slice(0, count)
      .map(ts => ts.team);
    setFinalistTeams(topTeams);
    enqueueSnackbar(`Selected top ${topTeams.length} teams as finalists`, { variant: 'success' });
  };

  // Calculate presentation schedule
  const calculateSchedule = () => {
    const schedule = [];
    let currentTime = new Date(`2025-01-01T${sessionSettings.startTime}:00`);
    
    finalistTeams.forEach((team, index) => {
      schedule.push({
        team: team,
        startTime: new Date(currentTime),
        endTime: new Date(currentTime.getTime() + sessionSettings.sessionDuration * 60000)
      });
      
      // Add session duration + break duration for next slot
      currentTime = new Date(currentTime.getTime() + (sessionSettings.sessionDuration + sessionSettings.breakDuration) * 60000);
    });
    
    return schedule;
  };

  const schedule = calculateSchedule();
  const isInPerson = selectedHackathonData && !selectedHackathonData.location?.includes('Virtual');

  // Save Round 2 configuration to backend
  const saveRound2Configuration = async () => {
    if (!selectedHackathon || finalistTeams.length === 0) {
      enqueueSnackbar('Please select finalist teams before saving', { variant: 'warning' });
      return;
    }

    setSaving(true);
    try {
      // Check if Round 2 panel already exists
      let panelId = null;
      let existingPanel = judgeGroups.find(g => g.name === 'Round 2 - Final Judging');
      
      if (existingPanel && existingPanel.panel_id) {
        // Update existing panel
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/judge/panels/${existingPanel.panel_id}`,
          {
            event_id: selectedHackathon,
            panel_name: 'Round 2 - Final Judging',
            room: sessionSettings.room || null
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "X-Org-Id": orgId,
              'Content-Type': 'application/json',
            },
          }
        );
        panelId = existingPanel.panel_id;
      } else {
        // Create new Round 2 panel
        const panelResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/judge/panels`,
          {
            event_id: selectedHackathon,
            panel_name: 'Round 2 - Final Judging',
            room: sessionSettings.room || null
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "X-Org-Id": orgId,
              'Content-Type': 'application/json',
            },
          }
        );
        panelId = panelResponse.data.panel_id || panelResponse.data.panel?.id;
      }

      // Assign all judges to all finalist teams for Round 2
      for (const judge of judges) {
        for (const team of finalistTeams) {
          const teamSchedule = schedule.find(s => s.team.id === team.id);
          
          await axios.post(
            `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/judge/assignments`,
            {
              judge_id: judge.user_id, // Use user_id consistently
              event_id: selectedHackathon,
              team_id: team.id,
              round: 'round2',
              panel_id: panelId,
              room: sessionSettings.room || null,
              demo_time: teamSchedule ? teamSchedule.startTime.toISOString() : null
            },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "X-Org-Id": orgId,
                'Content-Type': 'application/json',
              },
            }
          );
        }
      }

      // Update local state
      if (!existingPanel) {
        setJudgeGroups(prev => [
          ...prev,
          {
            id: panelId,
            panel_id: panelId,
            name: 'Round 2 - Final Judging',
            judges: judges,
            teams: finalistTeams,
            room: sessionSettings.room || ''
          }
        ]);
      }

      enqueueSnackbar('Round 2 configuration saved successfully!', { variant: 'success' });
    } catch (error) {
      console.error('Error saving Round 2 configuration:', error);
      enqueueSnackbar('Failed to save Round 2 configuration', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Calculate standard deviation for a set of scores
  const calculateStandardDeviation = (scores) => {
    if (scores.length <= 1) return 0;
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    return Math.sqrt(variance);
  };

  // Get category mapping for score fields
  const getCategoryMapping = () => {
    return {
      documentation: ['documentationCode', 'documentationEase'],
      polish: ['polishCanUseToday', 'polishWorkRemaining'],
      scope: ['scopeComplexity', 'scopeImpact'],
      security: ['securityData', 'securityRole']
    };
  };

  // Get special category mapping for score fields
  const getSpecialCategoryMapping = () => {
    return {
      accessibility: ['accessibility']
    };
  };

  // Analyze top teams by scoring categories
  const analyzeTopTeamsByCategory = () => {
    if (round1Scores.length === 0) return {};
    
    const categoryMapping = getCategoryMapping();
    const categoryResults = {};
    
    Object.entries(categoryMapping).forEach(([categoryName, scoreFields]) => {
      const teamsWithCategoryScores = round1Scores
        .filter(teamData => teamData.judgeCount > 0)
        .map(teamData => {
          // Calculate category scores for each judge
          const categoryScores = teamData.scores.map(judgeScore => {
            const categoryTotal = scoreFields.reduce((sum, field) => {
              return sum + (judgeScore.score.scores[field] || 0);
            }, 0);
            return categoryTotal;
          });
          
          // Calculate average and standard deviation for this category
          const averageScore = categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length;
          const standardDeviation = calculateStandardDeviation(categoryScores);
          
          return {
            ...teamData,
            categoryScores,
            categoryAverage: averageScore,
            categoryStandardDeviation: standardDeviation,
            maxPossible: scoreFields.length * 5 * teamData.judgeCount, // Assuming max score of 5 per field
            categoryPercentage: (averageScore / (scoreFields.length * 5)) * 100
          };
        })
        .sort((a, b) => {
          // Primary sort: highest average score
          if (Math.abs(a.categoryAverage - b.categoryAverage) > 0.01) {
            return b.categoryAverage - a.categoryAverage;
          }
          // Tiebreaker: lowest standard deviation (more consistent)
          return a.categoryStandardDeviation - b.categoryStandardDeviation;
        });
      
      categoryResults[categoryName] = teamsWithCategoryScores.slice(0, 6); // Top 3 teams per category
    });
    
    return categoryResults;
  };

  const topTeamsByCategory = analyzeTopTeamsByCategory();

  // Analyze top teams by special categories
  const analyzeTopTeamsBySpecialCategory = () => {
    if (round1Scores.length === 0) return {};

    const specialCategoryMapping = getSpecialCategoryMapping();
    const specialCategoryResults = {};

    Object.entries(specialCategoryMapping).forEach(([categoryName, scoreFields]) => {
      const teamsWithCategoryScores = round1Scores
        .filter(teamData => teamData.judgeCount > 0)
        .map(teamData => {
          // Calculate special category scores for each judge
          const categoryScores = teamData.scores
            .map(judgeScore => {
              const categoryTotal = scoreFields.reduce((sum, field) => {
                return sum + (judgeScore.score.scores[field] || 0);
              }, 0);
              return categoryTotal;
            })
            .filter(score => score > 0); // Only include if judge scored this special category

          // Only include teams that have at least one special category score
          if (categoryScores.length === 0) return null;

          // Calculate average and standard deviation for this special category
          const averageScore = categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length;
          const standardDeviation = calculateStandardDeviation(categoryScores);

          return {
            ...teamData,
            categoryScores,
            categoryAverage: averageScore,
            categoryStandardDeviation: standardDeviation,
            maxPossible: scoreFields.length * 5, // Assuming max score of 5 per field
            categoryPercentage: (averageScore / (scoreFields.length * 5)) * 100,
            judgesWhoScored: categoryScores.length
          };
        })
        .filter(team => team !== null) // Remove teams with no special category scores
        .sort((a, b) => {
          // Primary sort: highest average score
          if (Math.abs(a.categoryAverage - b.categoryAverage) > 0.01) {
            return b.categoryAverage - a.categoryAverage;
          }
          // Tiebreaker: lowest standard deviation (more consistent)
          return a.categoryStandardDeviation - b.categoryStandardDeviation;
        });

      specialCategoryResults[categoryName] = teamsWithCategoryScores.slice(0, 6); // Top 6 teams per special category
    });

    return specialCategoryResults;
  };

  const topTeamsBySpecialCategory = analyzeTopTeamsBySpecialCategory();

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
        <Grid size={{ xs: 12, md: 4 }}>
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
        <Grid size={{ xs: 12, md: 4 }}>
          <Button
            variant="contained"
            startIcon={<ScheduleIcon />}
            onClick={() => setSettingsDialog(true)}
            disabled={!selectedHackathon}
          >
            Configure Session Settings
          </Button>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Button
            variant="contained"
            color="success"
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <TrophyIcon />}
            onClick={saveRound2Configuration}
            disabled={!selectedHackathon || finalistTeams.length === 0 || saving}
            fullWidth
          >
            {saving ? 'Saving...' : 'Save Round 2 Setup'}
          </Button>
        </Grid>
      </Grid>

      {!selectedHackathon ? (
        <Alert severity="info">Please select a hackathon to manage Round 2 judging.</Alert>
      ) : (
        <>
          {/* Summary Stats */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <PersonIcon color="primary" sx={{ fontSize: 40 }} />
                  <Typography variant="h6">{judges.length}</Typography>
                  <Typography variant="body2">All Judges</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrophyIcon color="warning" sx={{ fontSize: 40 }} />
                  <Typography variant="h6">{finalistTeams.length}</Typography>
                  <Typography variant="body2">Finalist Teams</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <ScheduleIcon color="info" sx={{ fontSize: 40 }} />
                  <Typography variant="h6">{schedule.length * sessionSettings.sessionDuration}min</Typography>
                  <Typography variant="body2">Total Duration</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <LocationIcon color="success" sx={{ fontSize: 40 }} />
                  <Typography variant="h6">{isInPerson ? 'In-Person' : 'Virtual'}</Typography>
                  <Typography variant="body2">Event Type</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Typography variant="h5" gutterBottom>
            Round 2 - Final Judging Setup
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Review Round 1 scores and select finalist teams for the final judging session where all judges evaluate the top teams.
          </Typography>

          {/* Round 1 Scores Overview */}
          <Accordion defaultExpanded sx={{ mb: 3 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6">
                  Round 1 Results & Team Scores
                </Typography>
                {loadingScores && <CircularProgress size={20} />}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Review all team scores from Round 1 judging. Teams are ranked by average score across all judges.
              </Typography>
              
              {/* Quick selection buttons */}
              <Box sx={{ mb: 3, display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography variant="body2" sx={{ mr: 1 }}>Quick select:</Typography>
                <Button 
                  size="small" 
                  variant="outlined" 
                  onClick={() => selectTopTeams(3)}
                >
                  Top 3
                </Button>
                <Button 
                  size="small" 
                  variant="outlined" 
                  onClick={() => selectTopTeams(5)}
                >
                  Top 5
                </Button>
                <Button 
                  size="small" 
                  variant="outlined" 
                  onClick={() => selectTopTeams(8)}
                >
                  Top 8
                </Button>
                <Button 
                  size="small" 
                  variant="text" 
                  onClick={() => setFinalistTeams([])}
                >
                  Clear All
                </Button>
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Finalist</TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sortBy === 'teamName'}
                          direction={sortBy === 'teamName' ? sortOrder : 'asc'}
                          onClick={() => handleSort('teamName')}
                        >
                          Team Name
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Nonprofit</TableCell>
                      <TableCell align="center">
                        <TableSortLabel
                          active={sortBy === 'judgeCount'}
                          direction={sortBy === 'judgeCount' ? sortOrder : 'asc'}
                          onClick={() => handleSort('judgeCount')}
                        >
                          Judges
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="center">
                        <TableSortLabel
                          active={sortBy === 'totalScore'}
                          direction={sortBy === 'totalScore' ? sortOrder : 'asc'}
                          onClick={() => handleSort('totalScore')}
                        >
                          Avg Score
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Standard Deviation - Lower means more consistent judging">
                          <TableSortLabel
                            active={sortBy === 'standardDeviation'}
                            direction={sortBy === 'standardDeviation' ? sortOrder : 'asc'}
                            onClick={() => handleSort('standardDeviation')}
                          >
                            Std Dev
                          </TableSortLabel>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <TableSortLabel
                          active={sortBy === 'medianScore'}
                          direction={sortBy === 'medianScore' ? sortOrder : 'asc'}
                          onClick={() => handleSort('medianScore')}
                        >
                          Median
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="center">
                        <TableSortLabel
                          active={sortBy === 'highestScore'}
                          direction={sortBy === 'highestScore' ? sortOrder : 'asc'}
                          onClick={() => handleSort('highestScore')}
                        >
                          High
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="center">
                        <TableSortLabel
                          active={sortBy === 'lowestScore'}
                          direction={sortBy === 'lowestScore' ? sortOrder : 'asc'}
                          onClick={() => handleSort('lowestScore')}
                        >
                          Low
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getSortedTeamsWithScores().map((teamScoreData, index) => {
                      const { team, averageScore, judgeCount, scores, standardDeviation, medianScore, highestScore, lowestScore } = teamScoreData;
                      const isFinalist = finalistTeams.some(t => t.id === team.id);
                      const nonprofitName = team.selected_nonprofit_id ?
                        (nonprofitNames[team.selected_nonprofit_id] || 'Loading...') : 'No nonprofit';
                      
                      return (
                        <TableRow 
                          key={team.id}
                          sx={{ 
                            backgroundColor: isFinalist ? 'action.selected' : 'inherit',
                            '&:hover': { backgroundColor: 'action.hover' }
                          }}
                        >
                          <TableCell>
                            <Switch
                              checked={isFinalist}
                              onChange={() => toggleFinalistStatus(team.id)}
                              color="primary"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {index < 3 && judgeCount > 0 && (
                                <Chip 
                                  icon={<TrophyIcon />} 
                                  label={`#${index + 1}`} 
                                  size="small" 
                                  color={index === 0 ? 'warning' : 'default'}
                                  variant="outlined"
                                />
                              )}
                              <Typography variant="body2" sx={{ fontWeight: isFinalist ? 600 : 400 }}>
                                {team.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {loadingNonprofits ? 'Loading...' : nonprofitName}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={judgeCount} 
                              size="small" 
                              color={judgeCount === 0 ? 'error' : judgeCount < 3 ? 'warning' : 'success'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            {judgeCount > 0 ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
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
                            {judgeCount > 0 ? (
                              <Typography
                                variant="body2"
                                sx={{
                                  color: standardDeviation < 1 ? 'success.main' : standardDeviation < 2 ? 'warning.main' : 'error.main',
                                  fontWeight: 500
                                }}
                              >
                                {standardDeviation.toFixed(2)}
                              </Typography>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                -
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {judgeCount > 0 ? (
                              <Typography variant="body2">
                                {medianScore.toFixed(1)}
                              </Typography>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                -
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {judgeCount > 0 ? (
                              <Chip
                                label={highestScore.toFixed(1)}
                                size="small"
                                color="success"
                                variant="outlined"
                              />
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                -
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {judgeCount > 0 ? (
                              <Chip
                                label={lowestScore.toFixed(1)}
                                size="small"
                                color="warning"
                                variant="outlined"
                              />
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                -
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="View detailed scores">
                              <IconButton
                                size="small"
                                onClick={() => viewTeamScores(teamScoreData)}
                                disabled={judgeCount === 0}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {round1Scores.length === 0 && !loadingScores && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No Round 1 scores found. Teams may not have been judged yet, or no Round 1 panels exist.
                </Alert>
              )}
            </AccordionDetails>
          </Accordion>

          {/* Top Teams by Category */}
          <Accordion defaultExpanded sx={{ mb: 3 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                Top Teams by Category
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Teams ranked by average performance in specific scoring categories. In case of ties, teams with lower standard deviation (more consistent scores) are ranked higher.
              </Typography>
              
              {Object.keys(topTeamsByCategory).length > 0 ? (
                <Grid container spacing={3}>
                  {Object.entries(topTeamsByCategory).map(([categoryName, teams]) => (
                    <Grid size={{ xs: 12, md: 6 }} key={categoryName}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom sx={{ 
                            textTransform: 'capitalize',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}>
                            {categoryName === 'documentation' && <EditIcon color="primary" />}
                            {categoryName === 'polish' && <StarIcon color="warning" />}
                            {categoryName === 'scope' && <TrophyIcon color="success" />}
                            {categoryName === 'security' && <CheckIcon color="error" />}
                            {categoryName} Excellence
                          </Typography>
                          
                          <List dense>
                            {teams.map((teamData, index) => {
                              const isTopTeam = index === 0;
                              const isTied = index > 0 && Math.abs(teams[0].categoryAverage - teamData.categoryAverage) < 0.01;
                              
                              return (
                                <ListItem key={teamData.team.id} sx={{ 
                                  px: 0,
                                  backgroundColor: isTopTeam ? 'action.selected' : 'transparent',
                                  borderRadius: 1,
                                  mb: 1
                                }}>
                                  <ListItemIcon sx={{ minWidth: 36 }}>
                                    <Box sx={{ 
                                      width: 24, 
                                      height: 24, 
                                      borderRadius: '50%',
                                      backgroundColor: isTopTeam ? 'primary.main' : isTied ? 'warning.main' : 'action.disabled',
                                      color: 'white',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '0.75rem',
                                      fontWeight: 600
                                    }}>
                                      {index + 1}
                                    </Box>
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: isTopTeam ? 600 : 400 }}>
                                          {teamData.team.name}
                                        </Typography>
                                        {isTopTeam && (
                                          <Chip 
                                            label="Leader" 
                                            size="small" 
                                            color="primary" 
                                            variant="outlined"
                                          />
                                        )}
                                        {isTied && (
                                          <Chip 
                                            label="Tied" 
                                            size="small" 
                                            color="warning" 
                                            variant="outlined"
                                          />
                                        )}
                                      </Box>
                                    }
                                    secondary={
                                      <Box sx={{ mt: 0.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                                          <Typography variant="caption" color="text.secondary">
                                            Avg: {teamData.categoryAverage.toFixed(1)}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            SD: {teamData.categoryStandardDeviation.toFixed(2)}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            {teamData.categoryPercentage.toFixed(0)}%
                                          </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <Box sx={{ 
                                            width: 100, 
                                            height: 4, 
                                            backgroundColor: 'action.hover',
                                            borderRadius: 2,
                                            overflow: 'hidden'
                                          }}>
                                            <Box sx={{
                                              width: `${Math.min(teamData.categoryPercentage, 100)}%`,
                                              height: '100%',
                                              backgroundColor: isTopTeam ? 'primary.main' : isTied ? 'warning.main' : 'action.disabled',
                                              transition: 'width 0.3s ease'
                                            }} />
                                          </Box>
                                          <Chip 
                                            label={`${teamData.judgeCount} judges`} 
                                            size="small" 
                                            variant="outlined"
                                            sx={{ fontSize: '0.6rem', height: 20 }}
                                          />
                                        </Box>
                                      </Box>
                                    }
                                  />
                                </ListItem>
                              );
                            })}
                          </List>
                          
                          {teams.length === 0 && (
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                              No teams have scores in this category yet
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Alert severity="info">
                  No category analysis available. Teams need to be scored in Round 1 first.
                </Alert>
              )}
              
              {Object.keys(topTeamsByCategory).length > 0 && (
                <Box sx={{ mt: 3, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Scoring Notes:</strong> Teams are ranked by average score in each category. 
                    Ties are broken by standard deviation (lower is better, indicating more consistent judging). 
                    Percentage shows performance relative to maximum possible score in that category.
                  </Typography>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>

          {/* Special Category Prizes */}
          {Object.keys(topTeamsBySpecialCategory).length > 0 && (
            <Accordion defaultExpanded sx={{ mb: 3 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">
                  Top Teams by Special Category
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Teams ranked by average performance in special category prizes. These are judged separately from main criteria and recognize excellence in specific areas.  We want to pick teams who already haven't won a prize in the most ideal way.
                </Typography>

                <Grid container spacing={3}>
                  {Object.entries(topTeamsBySpecialCategory).map(([categoryName, teams]) => (
                    <Grid size={{ xs: 12 }} key={categoryName}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" gutterBottom sx={{
                            textTransform: 'capitalize',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}>
                            <StarIcon color="warning" />
                            {categoryName} Prize
                          </Typography>

                          <List dense>
                            {teams.map((teamData, index) => {
                              const isTopTeam = index === 0;
                              const isTied = index > 0 && Math.abs(teams[0].categoryAverage - teamData.categoryAverage) < 0.01;

                              return (
                                <ListItem key={teamData.team.id} sx={{
                                  px: 0,
                                  backgroundColor: isTopTeam ? 'action.selected' : 'transparent',
                                  borderRadius: 1,
                                  mb: 1
                                }}>
                                  <ListItemIcon sx={{ minWidth: 36 }}>
                                    <Box sx={{
                                      width: 24,
                                      height: 24,
                                      borderRadius: '50%',
                                      backgroundColor: isTopTeam ? 'warning.main' : isTied ? 'warning.light' : 'action.disabled',
                                      color: 'white',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '0.75rem',
                                      fontWeight: 600
                                    }}>
                                      {index + 1}
                                    </Box>
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: isTopTeam ? 600 : 400 }}>
                                          {teamData.team.name}
                                        </Typography>
                                        {isTopTeam && (
                                          <Chip
                                            label="Winner"
                                            size="small"
                                            color="warning"
                                            variant="outlined"
                                          />
                                        )}
                                        {isTied && (
                                          <Chip
                                            label="Tied"
                                            size="small"
                                            color="warning"
                                            variant="outlined"
                                          />
                                        )}
                                      </Box>
                                    }
                                    secondary={
                                      <Box sx={{ mt: 0.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                                          <Typography variant="caption" color="text.secondary">
                                            Avg: {teamData.categoryAverage.toFixed(1)} / {teamData.maxPossible}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            SD: {teamData.categoryStandardDeviation.toFixed(2)}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            {teamData.categoryPercentage.toFixed(0)}%
                                          </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <Box sx={{
                                            width: 100,
                                            height: 4,
                                            backgroundColor: 'action.hover',
                                            borderRadius: 2,
                                            overflow: 'hidden'
                                          }}>
                                            <Box sx={{
                                              width: `${Math.min(teamData.categoryPercentage, 100)}%`,
                                              height: '100%',
                                              backgroundColor: isTopTeam ? 'warning.main' : isTied ? 'warning.light' : 'action.disabled',
                                              transition: 'width 0.3s ease'
                                            }} />
                                          </Box>
                                          <Chip
                                            label={`${teamData.judgesWhoScored} judges scored`}
                                            size="small"
                                            variant="outlined"
                                            sx={{ fontSize: '0.6rem', height: 20 }}
                                          />
                                        </Box>
                                      </Box>
                                    }
                                  />
                                </ListItem>
                              );
                            })}
                          </List>

                          {teams.length === 0 && (
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                              No teams have scores in this special category yet
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {Object.keys(topTeamsBySpecialCategory).length > 0 && (
                  <Box sx={{ mt: 3, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Special Category Notes:</strong> Special category prizes are judged only in Round 1 and are separate from main judging criteria.
                      Teams are ranked by average score, with ties broken by standard deviation (lower is better, indicating more consistent judging).
                    </Typography>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          )}

          {/* Judging Panel */}
          <Accordion defaultExpanded sx={{ mb: 3 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                Final Judging Panel ({judges.length} judges)
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                All accepted judges will participate in Round 2 final judging sessions.
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <List>
                  {judges.map((judge, index) => (
                    <React.Fragment key={judge.user_id}>
                      <ListItem>
                        <ListItemIcon>
                          <PersonIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary={judge.name || judge.firstName + ' ' + judge.lastName}
                          secondary={
                            <Box>
                              <Typography variant="body2" component="span">
                                {judge.company || judge.companyName}
                              </Typography>
                              {judge.expertise && (
                                <Chip 
                                  label={judge.expertise} 
                                  size="small" 
                                  sx={{ ml: 1 }}
                                />
                              )}
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {judge.user_id}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < judges.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                  {judges.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                      No judges available for this hackathon
                    </Typography>
                  )}
                </List>
              </Paper>
            </AccordionDetails>
          </Accordion>

          {/* Presentation Schedule */}
          {finalistTeams.length > 0 && (
            <Accordion defaultExpanded sx={{ mb: 3 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">
                  Presentation Schedule
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Live presentation schedule for finalist teams ({sessionSettings.sessionDuration} min per team + {sessionSettings.breakDuration} min break)
                  </Typography>
                  {isInPerson && sessionSettings.room && (
                    <Chip 
                      icon={<LocationIcon />}
                      label={sessionSettings.room} 
                      variant="outlined" 
                    />
                  )}
                </Box>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <List>
                    {schedule.map((slot, index) => (
                      <React.Fragment key={slot.team.id}>
                        <ListItem>
                          <ListItemIcon>
                            <TrophyIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="subtitle1">
                                  {slot.team.name}
                                </Typography>
                                <Chip 
                                  label={`${slot.startTime.toLocaleTimeString('en-US', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })} - ${slot.endTime.toLocaleTimeString('en-US', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}`}
                                  size="small"
                                  variant="outlined"
                                />
                              </Box>
                            }
                            secondary={`${sessionSettings.sessionDuration} minute presentation with Q&A`}
                          />
                        </ListItem>
                        {index < schedule.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              </AccordionDetails>
            </Accordion>
          )}

          {finalistTeams.length === 0 && (
            <Alert severity="warning" sx={{ mt: 3 }}>
              Please select at least one team to advance to Round 2 final judging.
            </Alert>
          )}
        </>
      )}

      {/* Session Settings Dialog */}
      <Dialog open={settingsDialog} onClose={() => setSettingsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Round 2 Session Settings</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Session Duration (minutes)"
                type="number"
                fullWidth
                value={sessionSettings.sessionDuration}
                onChange={(e) => setSessionSettings({
                  ...sessionSettings,
                  sessionDuration: parseInt(e.target.value) || 15
                })}
                inputProps={{ min: 5, max: 60 }}
                InputLabelProps={{ shrink: true }}
                sx={{ mt: 1 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Break Duration (minutes)"
                type="number"
                fullWidth
                value={sessionSettings.breakDuration}
                onChange={(e) => setSessionSettings({
                  ...sessionSettings,
                  breakDuration: parseInt(e.target.value) || 5
                })}
                inputProps={{ min: 0, max: 30 }}
                InputLabelProps={{ shrink: true }}
                sx={{ mt: 1 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Start Time"
                type="time"
                fullWidth
                value={sessionSettings.startTime}
                onChange={(e) => setSessionSettings({
                  ...sessionSettings,
                  startTime: e.target.value
                })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            {isInPerson && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Room/Location"
                  fullWidth
                  value={sessionSettings.room}
                  onChange={(e) => setSessionSettings({
                    ...sessionSettings,
                    room: e.target.value
                  })}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialog(false)}>Cancel</Button>
          <Button onClick={() => setSettingsDialog(false)} variant="contained">Save Settings</Button>
        </DialogActions>
      </Dialog>

      {/* Team Scores Detail Dialog */}
      <Dialog
        open={viewScoresDialog}
        onClose={() => setViewScoresDialog(false)}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrophyIcon />
              <Typography variant="h6" component="span">
                Detailed Scores:{' '}
              </Typography>
              {selectedTeamScores && (
                <Tooltip title={`Click to copy Team ID: ${selectedTeamScores.team.id}`} arrow>
                  <Box
                    onClick={() => copyTeamId(selectedTeamScores.team.id, selectedTeamScores.team.name)}
                    sx={{
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        borderRadius: 1,
                        padding: '2px 6px',
                        margin: '-2px -6px'
                      }
                    }}
                  >
                    <Typography variant="h6" component="span">
                      {selectedTeamScores.team.name}
                    </Typography>
                    <ContentCopyIcon sx={{ fontSize: 18, opacity: 0.6 }} />
                  </Box>
                </Tooltip>
              )}
            </Box>
            <Tooltip title="Copy all feedback to clipboard">
              <IconButton
                onClick={copyAllFeedback}
                disabled={!selectedTeamScores || selectedTeamScores.scores.length === 0}
                color="primary"
              >
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
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
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {selectedTeamScores.averageScore.toFixed(1)}
                        </Typography>
                        <Typography variant="body2">Average Score</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="secondary">
                          {selectedTeamScores.judgeCount}
                        </Typography>
                        <Typography variant="body2">Judges</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main">
                          {selectedTeamScores.totalScore.toFixed(1)}
                        </Typography>
                        <Typography variant="body2">Total Score</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
              
              <Typography variant="h6" gutterBottom>
                Individual Judge Scores
              </Typography>
              
              {selectedTeamScores.scores.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <TableSortLabel
                            active={detailScoresSortBy === 'judge'}
                            direction={detailScoresSortBy === 'judge' ? detailScoresSortOrder : 'asc'}
                            onClick={() => handleDetailScoresSort('judge')}
                          >
                            Judge
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="center">
                          <TableSortLabel
                            active={detailScoresSortBy === 'total'}
                            direction={detailScoresSortBy === 'total' ? detailScoresSortOrder : 'asc'}
                            onClick={() => handleDetailScoresSort('total')}
                          >
                            Total
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={detailScoresSortBy === 'created_at'}
                            direction={detailScoresSortBy === 'created_at' ? detailScoresSortOrder : 'asc'}
                            onClick={() => handleDetailScoresSort('created_at')}
                          >
                            First Created At
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={detailScoresSortBy === 'submitted_at'}
                            direction={detailScoresSortBy === 'submitted_at' ? detailScoresSortOrder : 'asc'}
                            onClick={() => handleDetailScoresSort('submitted_at')}
                          >
                            Submitted At
                          </TableSortLabel>
                        </TableCell>
                        {selectedTeamScores.scores[0] && Object.keys(selectedTeamScores.scores[0].score.scores).map(criteria => (
                          <TableCell key={criteria} align="center">
                            <TableSortLabel
                              active={detailScoresSortBy === criteria}
                              direction={detailScoresSortBy === criteria ? detailScoresSortOrder : 'asc'}
                              onClick={() => handleDetailScoresSort(criteria)}
                            >
                              {criteria.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </TableSortLabel>
                          </TableCell>
                        ))}

                        <TableCell>Feedback</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getSortedDetailScores().map((judgeScore, index) => {
                        const totalScore = judgeScore.score.total_score || 0;
                        const judgeName = judgeScore.judge.name || judgeScore.judge.firstName + ' ' + judgeScore.judge.lastName;
                        const judgeId = judgeScore.judge.user_id;
                        return (
                          <TableRow key={index}>
                            <TableCell>
                              <Tooltip title={`Click to copy Judge ID: ${judgeId}`} arrow>
                                <Box
                                  onClick={() => copyJudgeId(judgeId, judgeName)}
                                  sx={{
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    '&:hover': {
                                      backgroundColor: 'action.hover',
                                      borderRadius: 1,
                                      padding: '2px 4px',
                                      margin: '-2px -4px'
                                    }
                                  }}
                                >
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {judgeName}
                                  </Typography>
                                  <ContentCopyIcon sx={{ fontSize: 14, opacity: 0.6 }} />
                                </Box>
                              </Tooltip>
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {totalScore}
                              </Typography>
                            </TableCell>                            
                            <TableCell>
                              <Typography variant="caption" color="text.secondary">
                                {formatTimestamp(judgeScore.score.created_at)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" color="text.secondary">
                                {formatTimestamp(judgeScore.score.submitted_at)}
                              </Typography>
                            </TableCell>
                            {Object.entries(judgeScore.score.scores).map(([criteria, score]) => (
                              <TableCell key={criteria} align="center">
                                <Chip
                                  label={score}
                                  size="small"
                                  color={score >= 8 ? 'success' : score >= 6 ? 'warning' : 'default'}
                                />
                              </TableCell>
                            ))}
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {judgeScore.score.feedback || 'No feedback provided'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">
                  No scores available for this team.
                </Alert>
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

export default JudgingRound2;