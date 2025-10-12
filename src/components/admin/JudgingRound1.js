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
  LinearProgress,
  Chip,
  Divider,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Skeleton
} from '@mui/material';
import {
  Groups as GroupsIcon,
  Person as PersonIcon,
  AssignmentTurnedIn as AssignIcon,
  LocationOn as LocationIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Schedule as ScheduleIcon,
  Timer as TimerIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { useAuthInfo } from '@propelauth/react';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const JudgingRound1 = ({ orgId, hackathons, selectedHackathon, setSelectedHackathon }) => {
  const { accessToken } = useAuthInfo();
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(false);
  const [judges, setJudges] = useState([]);
  const [teams, setTeams] = useState([]);
  const [judgeGroups, setJudgeGroups] = useState([]);
  const [selectedHackathonData, setSelectedHackathonData] = useState(null);
  const [editGroupDialog, setEditGroupDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [saving, setSaving] = useState(false);
  const [nonprofitNames, setNonprofitNames] = useState({});
  const [loadingNonprofits, setLoadingNonprofits] = useState(false);
  const [loadingPanels, setLoadingPanels] = useState(false);
  const [loadingJudgeDetails, setLoadingJudgeDetails] = useState({});
  
  // Progressive loading states
  const [loadingJudges, setLoadingJudges] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [dataLoadComplete, setDataLoadComplete] = useState(false);
  
  // Time estimation for judging
  const [demoDurationMinutes, setDemoDurationMinutes] = useState(4);

  // Fetch hackathon details to check if it's in-person
  useEffect(() => {
    if (selectedHackathon && hackathons.length > 0) {
      const hackathon = hackathons.find(h => h.event_id === selectedHackathon);
      setSelectedHackathonData(hackathon);
      console.log('Selected Hackathon Data:', hackathon);
    }
  }, [selectedHackathon, hackathons]);

  // Fetch judge details for a specific judge
  const fetchJudgeDetails = useCallback(async (judgeId) => {
    if (!selectedHackathon) return null;
    
    // Check if we already have this judge's details loading or loaded
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
      setLoadingJudgeDetails(prev => ({ ...prev, [judgeId]: false }));
      return judgeDetails;
    } catch (error) {
      console.error(`Error fetching judge details for ${judgeId}:`, error);
      setLoadingJudgeDetails(prev => ({ ...prev, [judgeId]: false }));
      return null;
    }
  }, [selectedHackathon, accessToken, orgId, loadingJudgeDetails]);

  // Fetch assignments for a specific panel
  const fetchPanelAssignments = useCallback(async (panelId) => {
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
      
      return response.data.assignments || [];
    } catch (error) {
      console.error(`Error fetching assignments for panel ${panelId}:`, error);
      return [];
    }
  }, [accessToken, orgId]);

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

  // Track initial data fetch to prevent loops
  const [initialDataFetched, setInitialDataFetched] = useState(false);
  
  // Calculate judging time estimates
  const calculateJudgingTime = () => {
    const assignedTeams = teams.filter(team => 
      judgeGroups.some(group => group.teams.some(t => t.id === team.id)) &&
      team.status !== 'INACTIVE'
    );
    
    const totalTeams = assignedTeams.length;
    const totalPanels = judgeGroups.length;
    const totalMinutes = totalTeams * demoDurationMinutes;
    const minutesPerPanel = totalPanels > 0 ? totalMinutes / totalPanels : 0;
    
    return {
      totalTeams,
      totalPanels,
      demoDuration: demoDurationMinutes,
      totalMinutes,
      minutesPerPanel,
      hoursPerPanel: minutesPerPanel / 60,
      estimatedEndTime: totalPanels > 0 ? new Date(Date.now() + (minutesPerPanel * 60 * 1000)) : null
    };
  };
  
  const timeEstimate = calculateJudgingTime();

  // Fetch judges and teams for selected hackathon with progressive loading
  const fetchData = useCallback(async () => {
    if (!selectedHackathon || !selectedHackathonData) return;
    
    setLoading(true);
    setDataLoadComplete(false);
    
    try {
      // Step 1: Load judges first
      setLoadingJudges(true);
      console.log('Fetching judges for hackathon:', selectedHackathon);
      const judgesResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${selectedHackathon}/judge`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Org-Id": orgId,
          },
        }
      );
      
      console.log('Raw judges response:', judgesResponse.data);
      
      // Only get accepted judges
      const allJudges = judgesResponse.data.data || [];
      const acceptedJudges = allJudges.filter(judge => judge.isSelected) || [];
      
      console.log('All judges:', allJudges.length);
      console.log('Accepted judges:', acceptedJudges.length);
      console.log('First few judges:', allJudges.slice(0, 3));
      
      setJudges(acceptedJudges);
      setLoadingJudges(false);
      
      // Step 2: Load teams
      setLoadingTeams(true);
      const teamsResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/team/${selectedHackathonData.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Org-Id": orgId,
          },
        }
      );
      
      const teamsData = teamsResponse.data.teams || [];
      setTeams(teamsData);
      setLoadingTeams(false);
      
      // Step 3: Fetch nonprofit names for teams (in background)
      fetchNonprofitNames(teamsData);
      
      setDataLoadComplete(true);
      setInitialDataFetched(true);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      enqueueSnackbar('Failed to fetch judging data', { variant: 'error' });
      setLoadingJudges(false);
      setLoadingTeams(false);
    } finally {
      setLoading(false);
    }
  }, [selectedHackathon, accessToken, orgId, selectedHackathonData, enqueueSnackbar, fetchNonprofitNames]);

  // Only fetch data when hackathon changes, not when internal state changes
  useEffect(() => {
    if (selectedHackathon && selectedHackathonData) {
      setInitialDataFetched(false);
      fetchData();
    }
  }, [selectedHackathon, selectedHackathonData?.id]); // Only depend on hackathon selection

  // Add new judge group
  const addJudgeGroup = () => {
    const newGroup = {
      id: Date.now(),
      name: `Panel ${String.fromCharCode(65 + judgeGroups.length)}`,
      judges: [],
      teams: [],
      room: selectedHackathonData?.location?.includes('Virtual') ? '' : `Room ${judgeGroups.length + 1}`
    };
    setJudgeGroups([...judgeGroups, newGroup]);
  };

  // Remove judge group
  const removeJudgeGroup = async (groupId) => {
    const group = judgeGroups.find(g => g.id === groupId);
    if (!group || !group.panel_id) {
      // If no panel_id, it's just a local group
      setJudgeGroups(judgeGroups.filter(group => group.id !== groupId));
      return;
    }

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/judge/panels/${group.panel_id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Org-Id": orgId,
          },
        }
      );
      
      setJudgeGroups(judgeGroups.filter(group => group.id !== groupId));
      enqueueSnackbar('Panel deleted successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error deleting panel:', error);
      enqueueSnackbar('Failed to delete panel', { variant: 'error' });
    }
  };

  // Edit judge group
  const editJudgeGroup = (group) => {
    setEditingGroup({ ...group });
    setEditGroupDialog(true);
  };

  // Save edited group
  const saveEditedGroup = () => {
    setJudgeGroups(judgeGroups.map(group => 
      group.id === editingGroup.id ? editingGroup : group
    ));
    setEditGroupDialog(false);
    setEditingGroup(null);
  };

  // Assign judge to group
  const assignJudgeToGroup = async (judgeId, groupId) => {
    const judge = judges.find(j => j.user_id === judgeId);
    const group = judgeGroups.find(g => g.id === groupId);
    if (!judge || !group) return;

    // Check if already assigned
    const isAlreadyAssigned = group.judges.some(j => j.user_id === judgeId);
    if (isAlreadyAssigned) return;

    // If panel doesn't exist in backend yet, create it first
    let panelId = group.panel_id;
    if (!panelId) {
      try {
        const panelResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/judge/panels`,
          {
            event_id: selectedHackathon,
            panel_name: group.name,
            room: group.room || null
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
        
        // Update local state with panel_id
        setJudgeGroups(prev => prev.map(g => 
          g.id === groupId ? { ...g, panel_id: panelId } : g
        ));
      } catch (error) {
        console.error('Error creating panel:', error);
        enqueueSnackbar('Failed to create panel', { variant: 'error' });
        return;
      }
    }

    // Create assignments for all teams in the panel
    if (group.teams.length > 0) {
      try {
        for (const team of group.teams) {
          console.log('Assigning judge to team:', team.id, 'judge.user_id:', judge.user_id);
          await axios.post(
            `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/judge/assignments`,
            {
              judge_id: judge.user_id,
              event_id: selectedHackathon,
              team_id: team.id,
              round: 'round1',
              panel_id: panelId,
              room: group.room || null
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
        enqueueSnackbar('Judge assigned successfully', { variant: 'success' });
      } catch (error) {
        console.error('Error creating judge assignments:', error);
        enqueueSnackbar('Failed to assign judge', { variant: 'error' });
        return;
      }
    }

    // Update local state
    setJudgeGroups(judgeGroups.map(g => {
      if (g.id === groupId) {
        return { ...g, judges: [...g.judges, judge] };
      }
      return g;
    }));
  };

  // Remove judge from group
  const removeJudgeFromGroup = async (judgeId, groupId) => {
    const group = judgeGroups.find(g => g.id === groupId);
    if (!group) return;

    // If panel exists in backend, remove assignments
    if (group.panel_id) {
      try {
        // Find and delete all assignments for this judge in this panel
        const assignments = await fetchPanelAssignments(group.panel_id);
        const judgeAssignments = assignments.filter(assignment => assignment.judge_id === judgeId);
        
        for (const assignment of judgeAssignments) {
          await axios.delete(
            `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/judge/assignments/${assignment.id}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "X-Org-Id": orgId,
              },
            }
          );
        }
        enqueueSnackbar('Judge removed successfully', { variant: 'success' });
      } catch (error) {
        console.error('Error removing judge assignments:', error);
        enqueueSnackbar('Failed to remove judge', { variant: 'error' });
        return;
      }
    }

    // Update local state
    setJudgeGroups(judgeGroups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          judges: group.judges.filter(j => j.user_id !== judgeId)
        };
      }
      return group;
    }));
  };

  // Assign team to group
  const assignTeamToGroup = async (teamId, groupId) => {
    const team = teams.find(t => t.id === teamId);
    const group = judgeGroups.find(g => g.id === groupId);
    if (!team || !group) return;

    // Check if already assigned
    const isAlreadyAssigned = group.teams.some(t => t.id === teamId);
    if (isAlreadyAssigned) return;

    console.log('Assigning team to group:', { groupId, teamId, group, judgesInGroup: group.judges.length });

    // If panel exists in backend, create assignments for all judges in the panel
    if (group.panel_id) {
      try {
        // Check if group has judges
        if (group.judges.length === 0) {
          enqueueSnackbar('Cannot assign team - no judges in this panel', { variant: 'warning' });
          return;
        }
        
        // Create assignments for each judge in the panel
        for (const judge of group.judges) {
          const judgeId = judge.user_id || judge.id || judge.judge_id;
          console.log('Assigning team to judge:', judgeId, 'Judge object:', judge);
          
          if (!judgeId) {
            console.error('No valid judge ID found for judge:', judge);
            continue;
          }
          
          await axios.post(
            `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/judge/assignments`,
            {
              judge_id: judgeId,
              event_id: selectedHackathon,
              team_id: teamId,
              round: 'round1',
              panel_id: group.panel_id,
              room: group.room || null
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
        enqueueSnackbar('Team assigned successfully', { variant: 'success' });
      } catch (error) {
        console.error('Error creating team assignments:', error);
        console.error('Error details:', error.response?.data);
        enqueueSnackbar('Failed to assign team', { variant: 'error' });
        return;
      }
    }

    // Update local state
    setJudgeGroups(judgeGroups.map(g => {
      if (g.id === groupId) {
        return { ...g, teams: [...g.teams, team] };
      }
      return g;
    }));
  };

  // Remove team from group
  const removeTeamFromGroup = async (teamId, groupId) => {
    const group = judgeGroups.find(g => g.id === groupId);
    if (!group) return;

    // If panel exists in backend, remove assignments
    if (group.panel_id) {
      try {
        // Find and delete all assignments for this team in this panel
        const assignments = await fetchPanelAssignments(group.panel_id);
        const teamAssignments = assignments.filter(assignment => assignment.team_id === teamId);
        
        for (const assignment of teamAssignments) {
          await axios.delete(
            `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/judge/assignments/${assignment.id}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "X-Org-Id": orgId,
              },
            }
          );
        }
        enqueueSnackbar('Team removed successfully', { variant: 'success' });
      } catch (error) {
        console.error('Error removing team assignments:', error);
        enqueueSnackbar('Failed to remove team', { variant: 'error' });
        return;
      }
    }

    // Update local state
    setJudgeGroups(judgeGroups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          teams: group.teams.filter(t => t.id !== teamId)
        };
      }
      return group;
    }));
  };

  // Get unassigned judges
  const getUnassignedJudges = () => {
    const assignedJudgeIds = judgeGroups.flatMap(group => 
      group.judges.map(j => j.user_id || j.id || j.judge_id)
    );
    
    console.log('Assigned judge IDs from groups:', assignedJudgeIds);
    console.log('All judges user_ids:', judges.map(j => j.user_id));
    
    const unassigned = judges.filter(judge => 
      !assignedJudgeIds.includes(judge.user_id)
    );
    
    console.log('Unassigned judges count:', unassigned.length);
    return unassigned;
  };

  // Get unassigned teams
  const getUnassignedTeams = () => {
    const assignedTeamIds = judgeGroups.flatMap(group => 
      group.teams.map(t => t.id)
    );

    console.log("Teams:", teams);
    const filteredTeams = teams.filter(team => 
      !assignedTeamIds.includes(team.id) && 
      team.status !== 'INACTIVE'
    );

    // Sort teams by nonprofit name, with teams without nonprofits at the end
    return filteredTeams.sort((a, b) => {
      const nonprofitA = a.selected_nonprofit_id ? (nonprofitNames[a.selected_nonprofit_id] || a.selected_nonprofit_id) : 'ZZZ_No Nonprofit';
      const nonprofitB = b.selected_nonprofit_id ? (nonprofitNames[b.selected_nonprofit_id] || b.selected_nonprofit_id) : 'ZZZ_No Nonprofit';
      return nonprofitA.localeCompare(nonprofitB);
    });
  };

  const isInPerson = selectedHackathonData && !selectedHackathonData.location?.includes('Virtual');

  // Skeleton Components
  const StatsCardSkeleton = () => (
    <Card>
      <CardContent sx={{ textAlign: 'center' }}>
        <Skeleton variant="circular" width={40} height={40} sx={{ mx: 'auto', mb: 1 }} />
        <Skeleton variant="text" width={60} height={32} sx={{ mx: 'auto', mb: 1 }} />
        <Skeleton variant="text" width={100} height={20} sx={{ mx: 'auto' }} />
      </CardContent>
    </Card>
  );

  const ControlsSkeleton = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} md={4}>
        <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
      </Grid>
      <Grid item xs={12} md={4}>
        <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 1 }} />
      </Grid>
      <Grid item xs={12} md={4}>
        <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 1 }} />
      </Grid>
    </Grid>
  );

  const StatsSkeleton = () => (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      {[1, 2, 3, 4].map((item) => (
        <Grid item xs={12} sm={3} key={item}>
          <StatsCardSkeleton />
        </Grid>
      ))}
    </Grid>
  );

  const PanelSkeleton = () => (
    <Accordion sx={{ mb: 2 }}>
      <AccordionSummary>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Skeleton variant="text" width={120} height={24} sx={{ mr: 2 }} />
          <Skeleton variant="rectangular" width={80} height={20} sx={{ borderRadius: 3, mr: 2 }} />
          <Skeleton variant="rectangular" width={60} height={20} sx={{ borderRadius: 3 }} />
        </Box>
      </AccordionSummary>
    </Accordion>
  );

  const JudgeListSkeleton = () => (
    <Paper variant="outlined" sx={{ p: 2, minHeight: 200 }}>
      <List dense>
        {[1, 2, 3].map((item) => (
          <ListItem key={item}>
            <ListItemIcon>
              <Skeleton variant="circular" width={24} height={24} />
            </ListItemIcon>
            <ListItemText 
              primary={<Skeleton variant="text" width={150} />}
              secondary={<Skeleton variant="text" width={100} />}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );

  const TeamListSkeleton = () => (
    <Paper variant="outlined" sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
      <List dense>
        {[1, 2, 3, 4, 5].map((item) => (
          <ListItem key={item} sx={{ border: '1px dashed #ccc', mb: 1, borderRadius: 1 }}>
            <ListItemIcon>
              <Skeleton variant="circular" width={24} height={24} />
            </ListItemIcon>
            <Box sx={{ flexGrow: 1 }}>
              <Skeleton variant="text" width={200} height={20} sx={{ mb: 1 }} />
              <Skeleton variant="text" width={120} height={16} sx={{ mb: 1 }} />
              <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                <Skeleton variant="rectangular" width={60} height={20} sx={{ borderRadius: 3 }} />
                <Skeleton variant="rectangular" width={50} height={20} sx={{ borderRadius: 3 }} />
              </Box>
            </Box>
            <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );

  // Save judge panel assignments to backend
  const saveJudgeAssignments = async () => {
    if (!selectedHackathon || judgeGroups.length === 0) {
      enqueueSnackbar('No assignments to save', { variant: 'warning' });
      return;
    }

    setSaving(true);
    try {
      // First, create/update panels (without judge data)
      for (const group of judgeGroups) {
      let panelId = group.panel_id;
      
      try {
        let panelResponse;
        
        if (panelId) {
        // Update existing panel
        panelResponse = await axios.put(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/judge/panels/${panelId}`,
          {
          event_id: selectedHackathon,
          panel_id: panelId,
          panel_name: group.name,
          room: group.room || null
          },
          {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Org-Id": orgId,
            'Content-Type': 'application/json',
          },
          }
        );
        } else {
        // Create new panel
        panelResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/judge/panels`,
          {
          event_id: selectedHackathon,
          panel_name: group.name,
          panel_id: "round1_" + group.id,
          room: group.room || null
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
        
        // Update local state with panel_id for new panels
        setJudgeGroups(prev => prev.map(g => 
          g.id === group.id ? { ...g, panel_id: panelId } : g
        ));
        }

          // Create judge assignments for this panel
          for (const judge of group.judges) {
            for (const team of group.teams) {
              console.log('Saving assignment for judge:', judge.user_id, 'team:', team.id);
              await axios.post(
                `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/judge/assignments`,
                {
                  judge_id: judge.user_id, // Use user_id consistently
                  event_id: selectedHackathon,
                  team_id: team.id,
                  round: 'round1',
                  panel_id: panelId,
                  room: group.room || null
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
        } catch (error) {
          console.error(`Error saving panel ${group.name}:`, error);
          throw error;
        }
      }

      enqueueSnackbar('Judge assignments saved successfully!', { variant: 'success' });
    } catch (error) {
      console.error('Error saving judge assignments:', error);
      enqueueSnackbar('Failed to save judge assignments', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Load existing panel assignments
  const loadExistingAssignments = useCallback(async () => {
    if (!selectedHackathon) return;

    setLoadingPanels(true);
    try {
      // Step 1: Load panels
      console.log('Loading existing panels for hackathon:', selectedHackathon);
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
      console.log('Loaded Panels:', panels);
      
      if (panels.length > 0) {
        const loadedGroups = [];

        // Exclude panels with a null panel_id
        const validPanels = panels.filter(panel => panel.panel_name && panel.panel_id);
        
        // Step 2: For each panel, load assignments and judge details
        for (const panel of validPanels) {
          const assignments = await fetchPanelAssignments(panel.id);
          
          // Group assignments by judge and team
          const judgeMap = new Map();
          const teamSet = new Set();
          
          for (const assignment of assignments) {
            // Collect unique judges
            if (!judgeMap.has(assignment.judge_id)) {
              const judgeDetails = await fetchJudgeDetails(assignment.judge_id);
              if (judgeDetails) {
                // Ensure the judge has user_id field for consistency
                if (!judgeDetails.user_id) {
                  judgeDetails.user_id = assignment.judge_id;
                }
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
          
          const groupJudges = Array.from(judgeMap.values());
          const groupTeams = Array.from(teamSet);
          
          console.log('Loaded judges for panel', panel.panel_name, ':', groupJudges);
          console.log('Judge ID fields:', groupJudges.map(j => ({ user_id: j.user_id, id: j.id, judge_id: j.judge_id })));
          
          loadedGroups.push({
            id: panel.id, // Use panel.id as the group id
            panel_id: panel.id, // Store the backend panel ID
            name: panel.panel_name,
            judges: groupJudges,
            teams: groupTeams,
            room: panel.room || ''
          });
        }
        
        console.log('Final loaded groups with judges:', loadedGroups.map(g => ({
          name: g.name,
          judgeCount: g.judges.length,
          judgeIds: g.judges.map(j => j.user_id || j.id || j.judge_id)
        })));
        
        setJudgeGroups(loadedGroups);
      }
    } catch (error) {
      console.error('Error loading existing assignments:', error);
      // Don't show error to user - this might be first time setup
    } finally {
      setLoadingPanels(false);
    }
  }, [selectedHackathon, accessToken, orgId, fetchPanelAssignments, fetchJudgeDetails, teams]);

  // Load existing assignments after initial data is loaded
  useEffect(() => {
    if (selectedHackathon && initialDataFetched && judges.length > 0 && teams.length > 0) {
      loadExistingAssignments();
    }
  }, [selectedHackathon, initialDataFetched, judges.length, teams.length]);

  return (
    <Box>
      {/* Hackathon Selection */}
      {loading && !selectedHackathon ? (
        <ControlsSkeleton />
      ) : (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
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
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={addJudgeGroup}
              disabled={!selectedHackathon || !dataLoadComplete}
            >
              Add Judge Panel
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              color="success"
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <AssignIcon />}
              onClick={saveJudgeAssignments}
              disabled={!selectedHackathon || judgeGroups.length === 0 || saving || !dataLoadComplete}
              fullWidth
            >
              {saving ? 'Saving...' : 'Save Round 1 Panel'}
            </Button>
          </Grid>
        </Grid>
      )}

      {!selectedHackathon ? (
        <Alert severity="info">Please select a hackathon to manage judging assignments.</Alert>
      ) : (
        <>
          {/* Loading Progress Indicator */}
          {(loading || loadingJudges || loadingTeams || loadingPanels) && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={
                  loading && !dataLoadComplete ? 20 :
                  loadingJudges ? 40 :
                  loadingTeams ? 60 :
                  loadingPanels ? 80 :
                  100
                }
                sx={{ height: 4, borderRadius: 2 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {loading && !dataLoadComplete ? 'Initializing...' :
                 loadingJudges ? 'Loading judges...' :
                 loadingTeams ? 'Loading teams...' :
                 loadingPanels ? 'Loading panels...' :
                 'Ready'}
              </Typography>
            </Box>
          )}
          {/* Summary Stats */}
          {loading || !dataLoadComplete ? (
            <StatsSkeleton />
          ) : (
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <PersonIcon color="primary" sx={{ fontSize: 40 }} />
                    <Typography variant="h6">
                      {loadingJudges ? (
                        <Skeleton variant="text" width={30} sx={{ mx: 'auto' }} />
                      ) : (
                        judges.length
                      )}
                    </Typography>
                    <Typography variant="body2">Total Judges</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <GroupsIcon color="secondary" sx={{ fontSize: 40 }} />
                    <Typography variant="h6">
                      {loadingTeams ? (
                        <Skeleton variant="text" width={30} sx={{ mx: 'auto' }} />
                      ) : (
                        teams.length
                      )}
                    </Typography>
                    <Typography variant="body2">Total Teams</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <AssignIcon color="success" sx={{ fontSize: 40 }} />
                    <Typography variant="h6">
                      {loadingPanels ? (
                        <Skeleton variant="text" width={30} sx={{ mx: 'auto' }} />
                      ) : (
                        judgeGroups.length
                      )}
                    </Typography>
                    <Typography variant="body2">Judge Panels</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <LocationIcon color="info" sx={{ fontSize: 40 }} />
                    <Typography variant="h6">
                      {loading ? (
                        <Skeleton variant="text" width={80} sx={{ mx: 'auto' }} />
                      ) : (
                        isInPerson ? 'In-Person' : 'Virtual'
                      )}
                    </Typography>
                    <Typography variant="body2">Event Type</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Time Estimation Calculator */}
          <Card sx={{ mb: 4, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" color="primary">
                  Round 1 Time Estimation
                </Typography>
              </Box>
              
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Demo Duration (minutes)"
                    type="number"
                    value={demoDurationMinutes}
                    onChange={(e) => setDemoDurationMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                    inputProps={{ min: 1, max: 60, step: 1 }}
                    size="small"
                    fullWidth
                    InputProps={{
                      endAdornment: <Typography variant="caption" color="text.secondary">min</Typography>
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={9}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={3}>
                      <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'background.paper' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                          <GroupsIcon color="secondary" sx={{ fontSize: 20, mr: 0.5 }} />
                          <Typography variant="h6" color="secondary">
                            {timeEstimate.totalTeams}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Teams to Judge
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} sm={3}>
                      <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'background.paper' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                          <TimerIcon color="warning" sx={{ fontSize: 20, mr: 0.5 }} />
                          <Typography variant="h6" color="warning.main">
                            {timeEstimate.totalMinutes}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Total Minutes
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} sm={3}>
                      <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'background.paper' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                          <AssignIcon color="info" sx={{ fontSize: 20, mr: 0.5 }} />
                          <Typography variant="h6" color="info.main">
                            {timeEstimate.totalPanels}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Judge Panels
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} sm={3}>
                      <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: timeEstimate.totalPanels > 0 ? 'success.50' : 'grey.50' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                          <ScheduleIcon color={timeEstimate.totalPanels > 0 ? 'success' : 'disabled'} sx={{ fontSize: 20, mr: 0.5 }} />
                          <Typography 
                            variant="h6" 
                            color={timeEstimate.totalPanels > 0 ? 'success.main' : 'text.disabled'}
                          >
                            {timeEstimate.totalPanels > 0 ? `${Math.round(timeEstimate.minutesPerPanel)}m` : '—'}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Per Panel
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              
              {timeEstimate.totalPanels > 0 && timeEstimate.hoursPerPanel > 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Estimate:</strong> Each panel will spend approximately{' '}
                    <strong>
                      {timeEstimate.hoursPerPanel >= 1 
                        ? `${Math.floor(timeEstimate.hoursPerPanel)}h ${Math.round((timeEstimate.hoursPerPanel % 1) * 60)}m`
                        : `${Math.round(timeEstimate.minutesPerPanel)} minutes`
                      }
                    </strong>{' '}
                    judging {Math.round(timeEstimate.totalTeams / timeEstimate.totalPanels)} teams
                    {demoDurationMinutes > 1 && ` (${demoDurationMinutes} min per demo)`}
                  </Typography>
                </Alert>
              )}
              
              {timeEstimate.totalPanels === 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Create judge panels above to see time estimates
                </Alert>
              )}
              
              {timeEstimate.totalTeams === 0 && timeEstimate.totalPanels > 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Assign teams to panels to see accurate time estimates
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Judge Groups */}
          <Typography variant="h5" gutterBottom>
            Round 1 - Judge Panel Assignments
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Assign judges to panels and teams to each panel for initial video review judging.
          </Typography>

          {/* Show skeleton while loading panels */}
          {loadingPanels && judgeGroups.length === 0 ? (
            <Box>
              {[1, 2].map((item) => (
                <PanelSkeleton key={item} />
              ))}
            </Box>
          ) : (
            judgeGroups.map((group) => (
            <Accordion key={group.id} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    {group.name} {group.panel_id ? `(${group.panel_id})` : ''}
                  </Typography>
                  <Chip 
                    label={`${group.judges.length} judges, ${group.teams.length} teams`} 
                    size="small" 
                    sx={{ mr: 2 }}
                  />
                  {isInPerson && group.room && (
                    <Chip label={group.room} variant="outlined" size="small" sx={{ mr: 2 }} />
                  )}
                  <IconButton onClick={() => editJudgeGroup(group)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => removeJudgeGroup(group.id)} 
                    size="small"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  {/* Assigned Judges */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Assigned Judges ({group.judges.length})
                      {loadingPanels && <CircularProgress size={16} sx={{ ml: 1 }} />}
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, minHeight: 200 }}>
                      <List dense>
                        {group.judges.map((judge) => (
                          <ListItem 
                            key={judge.user_id}
                            secondaryAction={
                              <IconButton 
                                onClick={() => removeJudgeFromGroup(judge.user_id, group.id)}
                                size="small"
                                disabled={loadingJudgeDetails[judge.user_id]}
                              >
                                <DeleteIcon />
                              </IconButton>
                            }
                          >
                            <ListItemIcon>
                              <PersonIcon />
                            </ListItemIcon>
                            <ListItemText 
                              primary={judge.name || judge.firstName + ' ' + judge.lastName}
                              secondary={judge.company || judge.companyName}
                            />
                          </ListItem>
                        ))}
                        {group.judges.length === 0 && !loadingPanels && (
                          <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                            No judges assigned to this panel yet
                          </Typography>
                        )}
                        {loadingPanels && group.judges.length === 0 && (
                          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                            <CircularProgress size={24} />
                          </Box>
                        )}
                      </List>
                    </Paper>
                  </Grid>

                  {/* Assigned Teams */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Assigned Teams ({group.teams.length})
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, minHeight: 200 }}>
                      <List dense>
                        {group.teams.map((team) => (
                          <ListItem 
                            key={team.id}
                            secondaryAction={
                              <IconButton 
                                onClick={() => removeTeamFromGroup(team.id, group.id)}
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            }
                          >
                            <ListItemIcon>
                              <GroupsIcon />
                            </ListItemIcon>
                            <ListItemText 
                              primary={team.name}
                              secondary={`${team.team_members?.length || 0} members`}
                            />
                          </ListItem>
                        ))}
                        {group.teams.length === 0 && (
                          <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                            No teams assigned to this panel yet
                          </Typography>
                        )}
                      </List>
                    </Paper>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))
          )}

          {/* Unassigned Resources */}
          <Grid container spacing={3} sx={{ mt: 4 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Unassigned Judges {loadingJudges ? (
                  <Skeleton variant="text" width={40} component="span" />
                ) : (
                  `(${getUnassignedJudges().length})`
                )}
              </Typography>
              {loadingJudges ? (
                <JudgeListSkeleton />
              ) : (
                <Paper variant="outlined" sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
                  <List dense>
                    {getUnassignedJudges().map((judge) => (
                      <ListItem 
                        key={judge.user_id}
                        sx={{ 
                          border: '1px dashed #ccc', 
                          mb: 1, 
                          borderRadius: 1,
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                      >
                        <ListItemIcon>
                          <PersonIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary={judge.name || judge.firstName + ' ' + judge.lastName}
                          secondary={judge.company || judge.companyName}
                        />
                        {
                          // Also add status and title
                        }
                        <ListItemText 
                          primary={judge.title || judge.jobTitle}
                          secondary={judge.status ? `Status: ${judge.status}` : null}
                          sx={{ textAlign: 'right', mr: 2 }}
                        />
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            displayEmpty
                            value=""
                            onChange={(e) => assignJudgeToGroup(judge.user_id, e.target.value)}
                            disabled={!dataLoadComplete}
                          >
                            <MenuItem value="" disabled>Assign to...</MenuItem>
                            {judgeGroups.map((group) => (
                              <MenuItem key={group.id} value={group.id}>
                                {group.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </ListItem>
                    ))}
                    {getUnassignedJudges().length === 0 && !loadingJudges && (
                      <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                        All judges have been assigned to panels
                      </Typography>
                    )}
                  </List>
                </Paper>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Unassigned Teams {loadingTeams ? (
                  <Skeleton variant="text" width={40} component="span" />
                ) : (
                  `(${getUnassignedTeams().length})`
                )}
              </Typography>
              {loadingTeams ? (
                <TeamListSkeleton />
              ) : (
                <Paper variant="outlined" sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
                  <List dense>
                    {getUnassignedTeams().map((team) => (
                      <ListItem 
                        key={team.id}
                        sx={{ 
                          border: '1px dashed #ccc', 
                          mb: 1, 
                          borderRadius: 1,
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' },
                          flexDirection: 'column',
                          alignItems: 'stretch',
                          py: 2
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', mb: 1 }}>
                          <ListItemIcon sx={{ minWidth: 32, mt: 0 }}>
                            <GroupsIcon />
                          </ListItemIcon>
                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {team.name}
                            </Typography>
                            {team.selected_nonprofit_id && (
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.75rem' }}>
                                {loadingNonprofits ? 'Loading nonprofit...' : (nonprofitNames[team.selected_nonprofit_id] || team.selected_nonprofit_id)}
                              </Typography>
                            )}
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                              <Chip 
                                label={`${team.team_members?.length || 0} members`} 
                                size="small" 
                                variant="outlined"
                              />
                              {team.status && (
                                <Chip 
                                  label={team.status} 
                                  size="small" 
                                  color={
                                    team.status === 'complete' ? 'success' :
                                    team.status === 'active' ? 'primary' :
                                    team.status === 'incomplete' ? 'warning' : 'default'
                                  }
                                  variant="outlined"
                                />
                              )}
                              {team.github_links && team.github_links.length > 0 && (
                                <Chip 
                                  label="GitHub" 
                                  size="small" 
                                  color="success" 
                                  variant="outlined"
                                />
                              )}
                              {team.devpost_link && (
                                <Chip 
                                  label="DevPost" 
                                  size="small" 
                                  color="info" 
                                  variant="outlined"
                                />
                              )}
                             
                              
                              {(!team.github_links || team.github_links.length === 0) && !team.devpost_link && (
                                <Chip 
                                  label="Incomplete" 
                                  size="small" 
                                  color="warning" 
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </Box>
                          <FormControl size="small" sx={{ minWidth: 120, ml: 1 }}>
                            <Select
                              displayEmpty
                              value=""
                              onChange={(e) => assignTeamToGroup(team.id, e.target.value)}
                              disabled={!dataLoadComplete}
                            >
                              <MenuItem value="" disabled>Assign to...</MenuItem>
                              {judgeGroups.map((group) => (
                                <MenuItem key={group.id} value={group.id}>
                                  {group.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                      </ListItem>
                    ))}
                    {getUnassignedTeams().length === 0 && !loadingTeams && (
                      <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                        All teams have been assigned to panels
                      </Typography>
                    )}
                  </List>
                </Paper>
              )}
            </Grid>
          </Grid>
        </>
      )}

      {/* Edit Group Dialog */}
      <Dialog open={editGroupDialog} onClose={() => setEditGroupDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Judge Panel</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Panel Name"
            fullWidth
            variant="outlined"
            value={editingGroup?.name || ''}
            onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          {isInPerson && (
            <TextField
              margin="dense"
              label="Room Assignment"
              fullWidth
              variant="outlined"
              value={editingGroup?.room || ''}
              onChange={(e) => setEditingGroup({ ...editingGroup, room: e.target.value })}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditGroupDialog(false)}>Cancel</Button>
          <Button onClick={saveEditedGroup} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JudgingRound1;