import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  Link, // Add this import
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Alert,
  InputAdornment,
  useTheme,
  Tabs,
  Tab
} from '@mui/material';
import { TEAM_STATUS_OPTIONS, getStatusOption } from '../../constants/teamStatus';
import { 
  FaEdit, 
  FaUsers, 
  FaGithub, 
  FaSlack, 
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaExternalLinkAlt,
  FaStar,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaCheckCircle,
  FaQuestionCircle
} from 'react-icons/fa';
import axios from 'axios';
import { useAuthInfo } from '@propelauth/react';
import { useSnackbar } from 'notistack';

// Constants for assignment status
const ASSIGNMENT_STATUS = {
  ASSIGNED: 'assigned',
  UNASSIGNED: 'unassigned',
  MULTIPLE: 'multiple',
  FINALIZING: 'finalizing'
};

const TeamAssignments = ({ orgId, hackathons, selectedHackathon, setSelectedHackathon }) => {
  const theme = useTheme();
  const { accessToken } = useAuthInfo();
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(false);
  const [nonprofits, setNonprofits] = useState([]);
  const [teams, setTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState(0); // 0 = Nonprofit View, 1 = Team View
  
  // Assignment management dialog state
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [selectedNonprofit, setSelectedNonprofit] = useState(null);
  const [assignableTeams, setAssignableTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  
  // Sort configuration
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  // Fetch both nonprofits and teams when hackathon changes
  useEffect(() => {
    if (selectedHackathon) {
      fetchNonprofits(selectedHackathon);
      fetchTeams(selectedHackathon);
    }
  }, [selectedHackathon]);

  // Change sort order
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Fetch nonprofits for a hackathon
  const fetchNonprofits = async (hackathonId) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npos/hackathon/${hackathonId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Org-Id": orgId,
          },
        }
      );

      if (response.data && response.data.nonprofits) {
        setNonprofits(response.data.nonprofits);
      }
    } catch (error) {
      console.error("Error fetching nonprofits:", error);
      enqueueSnackbar("Failed to fetch nonprofits", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Fetch teams for the selected hackathon
  const fetchTeams = async (hackathonId) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/team/${hackathonId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Org-Id": orgId,
          },
        }
      );

      if (response.data && response.data.teams) {
        setTeams(response.data.teams);
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
      enqueueSnackbar("Failed to fetch teams", { variant: "error" });
    }
  };

  // Handle opening the assignment dialog
  const handleAssignTeam = (nonprofit) => {
    setSelectedNonprofit(nonprofit);
    
    // Create a consistent view of the nonprofit with its assigned teams
    const nonprofitWithTeams = {
      ...nonprofit,
      assigned_teams: nonprofit.assignedTeams || [] // Map to the original property name used in the dialog
    };
    setSelectedNonprofit(nonprofitWithTeams);
    
    // Filter teams that are active and don't have a nonprofit selected
    // or already assigned to this nonprofit
    const eligibleTeams = teams.filter(team => 
      team.active === "True" && 
      (!team.selected_nonprofit_id || team.selected_nonprofit_id === nonprofit.id)
    );
    
    setAssignableTeams(eligibleTeams);
    setSelectedTeamId(nonprofitWithTeams.assigned_teams.length > 0 
      ? nonprofitWithTeams.assigned_teams[0].id 
      : ''
    );
    
    setAssignmentDialogOpen(true);
  };

  // Save team assignment
  const handleSaveAssignment = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/admin/team/assign/${selectedHackathon}`,
        {
          team_id: selectedTeamId,
          nonprofit_id: selectedNonprofit.id,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-Org-Id": orgId,
          },
        }
      );

      if (response.data && response.data.success) {
        enqueueSnackbar("Team assignment updated successfully", { variant: "success" });
        setAssignmentDialogOpen(false);
        
        // Refresh data
        fetchNonprofits(selectedHackathon);
        fetchTeams(selectedHackathon);
      }
    } catch (error) {
      console.error("Error updating team assignment:", error);
      enqueueSnackbar("Failed to update team assignment", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };


  // Render status chip based on assignment status
  const renderAssignmentStatus = (status) => {
    switch (status) {
      case ASSIGNMENT_STATUS.ASSIGNED:
        return (
          <Chip 
            icon={<FaCheckCircle />} 
            label="Assigned" 
            color="success" 
            size="small" 
          />
        );
      case ASSIGNMENT_STATUS.MULTIPLE:
        return (
          <Chip             
            label="Multiple Teams" 
            color="warning" 
            size="small" 
          />
        );
      case ASSIGNMENT_STATUS.FINALIZING:
        return (
          <Chip 
            icon={<FaStar />} 
            label="Finalizing" 
            color="info" 
            size="small" 
          />
        );
      case ASSIGNMENT_STATUS.UNASSIGNED:
      default:
        return (
          <Chip 
            icon={<FaQuestionCircle />} 
            label="Unassigned" 
            color="default" 
            variant="outlined"
            size="small" 
          />
        );
    }
  };

  // Render team status chip
  const renderTeamStatus = (status) => {
    const statusOption = getStatusOption(status);
    return (
      <Chip
        label={statusOption.label}
        color={statusOption.color}
        size="small"
        variant={statusOption.color === "default" ? "outlined" : "filled"}
      />
    );
  };

  // Render nonprofit view using the teams data structure
  const renderNonprofitView = () => {
    // Group teams by nonprofit assignment
    const nonprofitMap = {};
    
    // First, create a map of all nonprofits
    nonprofits.forEach(nonprofit => {
      nonprofitMap[nonprofit.id] = {
        ...nonprofit,
        assignedTeams: []
      };
    });
    
    // Then, add teams to their assigned nonprofits
    teams.forEach(team => {
      if (team.selected_nonprofit_id && nonprofitMap[team.selected_nonprofit_id]) {
        nonprofitMap[team.selected_nonprofit_id].assignedTeams.push(team);
      }
    });
    
    // Convert to array and filter by search term if needed
    const nonprofitList = Object.values(nonprofitMap)
      .filter(nonprofit => 
        !searchTerm || 
        nonprofit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (nonprofit.description && nonprofit.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (nonprofit.assignedTeams && nonprofit.assignedTeams.some(team => 
          team.name.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      )
      .sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });

    return (
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                  onClick={() => requestSort("name")}
                >
                  Nonprofit Name
                  {sortConfig.key === "name" &&
                    (sortConfig.direction === "asc" ? (
                      <FaChevronUp size={14} />
                    ) : (
                      <FaChevronDown size={14} />
                    ))}
                </Box>
              </TableCell>
              <TableCell>Assignment Status</TableCell>
              <TableCell>Assigned Teams</TableCell>
              <TableCell>Primary Contact</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {nonprofitList.map((nonprofit) => {
              // Determine assignment status based on team assignments
              let assignmentStatus = ASSIGNMENT_STATUS.UNASSIGNED;
              if (nonprofit.assignedTeams.length > 0) {
                assignmentStatus = nonprofit.assignedTeams.length > 1 
                  ? ASSIGNMENT_STATUS.MULTIPLE 
                  : ASSIGNMENT_STATUS.ASSIGNED;
              }
              
              return (
                <TableRow key={nonprofit.id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                      <Typography variant="body1" fontWeight="medium">
                        {nonprofit.name}
                      </Typography>                      
                    </Box>
                  </TableCell>
                  <TableCell>
                    {renderAssignmentStatus(assignmentStatus)}
                  </TableCell>
                  <TableCell>
                    {nonprofit.assignedTeams.length > 0 ? (
                      <Box
                        sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                      >
                        {nonprofit.assignedTeams.map((team) => (
                          <Box
                            key={team.id}
                            sx={{ display: "flex", alignItems: "center", gap: 1 }}
                          >
                            <Chip
                              icon={<FaUsers size={12} />}
                              label={team.name}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                            {renderTeamStatus(team.status || "IN_REVIEW")}                            
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No teams assigned
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {nonprofit.contact_people ? (
                      // This is a list of just names as an array, display in a simple way
                      nonprofit.contact_people.map((contact, index) => (
                        <Box
                          key={index}
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                        {contact}
                        </Box>
                      ))                                          
                    ) : (
                      "No contact info"
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<FaEdit />}
                      onClick={() => handleAssignTeam(nonprofit)}
                    >
                      Manage Teams
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Render team view
  const renderTeamView = () => {
    // Group teams by nonprofit assignment
    const teamsByAssignment = {
      assigned: [],
      unassigned: []
    };

    teams.forEach(team => {
      if (team.selected_nonprofit_id) {
        teamsByAssignment.assigned.push(team);
      } else {
        teamsByAssignment.unassigned.push(team);
      }
    });

    const getNonprofitName = (nonprofitId) => {
      const nonprofit = nonprofits.find(np => np.id === nonprofitId);
      return nonprofit ? nonprofit.name : "Unknown Nonprofit";
    };

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">
              Assigned Teams ({teamsByAssignment.assigned.length})
            </Typography>
            <Chip 
              icon={<FaCheckCircle />} 
              label="Teams with assignments" 
              color="success" 
              variant="outlined"
            />
          </Box>
          <TableContainer component={Paper} elevation={2}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Team Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Assigned Nonprofit</TableCell>
                  <TableCell>Members</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teamsByAssignment.assigned.length > 0 ? (
                  teamsByAssignment.assigned.map(team => (
                    <TableRow key={team.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body1" fontWeight="medium">
                            {team.name}
                          </Typography>
                          {team.slack_channel && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <FaSlack size={12} />
                              <Link
                                href={`https://opportunity-hack.slack.com/app_redirect?channel=${team.slack_channel}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ 
                                  fontSize: '0.75rem',
                                  color: 'text.secondary',
                                  textDecoration: 'none',
                                  '&:hover': {
                                    textDecoration: 'underline'
                                  }
                                }}
                              >
                                {team.slack_channel}
                              </Link>
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {renderTeamStatus(team.status || "IN_REVIEW")}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">
                            {getNonprofitName(team.selected_nonprofit_id)}
                          </Typography>
                          
                        </Box>
                      </TableCell>
                      <TableCell>
                        {team.team_members ? (
                          <Chip
                            label={`${team.team_members.length} members`}
                            icon={<FaUsers size={12} />}
                            size="small"
                          />
                        ) : (
                          <Chip
                            label="0 members"
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          component="a"
                          href={`/admin/teams?id=${team.id}`}
                          target="_blank"
                          endIcon={<FaExternalLinkAlt />}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        No teams have been assigned to nonprofits yet.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">
              Unassigned Teams ({teamsByAssignment.unassigned.length})
            </Typography>
            <Chip 
              icon={<FaQuestionCircle />} 
              label="Teams without assignments" 
              color="default" 
              variant="outlined"
            />
          </Box>
          <TableContainer component={Paper} elevation={2}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Team Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Members</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teamsByAssignment.unassigned.length > 0 ? (
                  teamsByAssignment.unassigned.map(team => (
                    <TableRow key={team.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body1" fontWeight="medium">
                            {team.name}
                          </Typography>
                          {team.slack_channel && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <FaSlack size={12} />
                              <Link
                                href={`https://opportunity-hack.slack.com/app_redirect?channel=${team.slack_channel}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ 
                                  fontSize: '0.75rem',
                                  color: 'text.secondary',
                                  textDecoration: 'none',
                                  '&:hover': {
                                    textDecoration: 'underline'
                                  }
                                }}
                              >
                                {team.slack_channel}
                              </Link>
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {renderTeamStatus(team.status || "IN_REVIEW")}
                      </TableCell>
                      <TableCell>
                        {team.team_members ? (
                          <Chip
                            label={`${team.team_members.length} members`}
                            icon={<FaUsers size={12} />}
                            size="small"
                          />
                        ) : (
                          <Chip
                            label="0 members"
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(team.created).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          color="primary"
                          onClick={() => {
                            // Find any nonprofit to assign to
                            if (nonprofits.length > 0) {
                              const firstNonprofit = nonprofits[0];
                              setSelectedNonprofit(firstNonprofit);
                              setAssignableTeams([team]);
                              setSelectedTeamId(team.id);
                              setAssignmentDialogOpen(true);
                            } else {
                              enqueueSnackbar("No nonprofits available for assignment", { variant: "error" });
                            }
                          }}
                        >
                          Assign to Nonprofit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        All teams have been assigned to nonprofits.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    );
  };

  // Update renderAssignmentStats to use the same data approach
  const renderAssignmentStats = () => {
    // Create a map of nonprofits with their assigned teams
    const nonprofitMap = {};
    nonprofits.forEach(nonprofit => {
      nonprofitMap[nonprofit.id] = {
        ...nonprofit,
        assignedTeams: []
      };
    });
    
    // Populate with team assignments
    teams.forEach(team => {
      if (team.selected_nonprofit_id && nonprofitMap[team.selected_nonprofit_id]) {
        nonprofitMap[team.selected_nonprofit_id].assignedTeams.push(team);
      }
    });
    
    // Calculate stats based on the map
    const totalNonprofits = nonprofits.length;
    const assignedNonprofits = Object.values(nonprofitMap).filter(np => np.assignedTeams.length > 0).length;
    const unassignedNonprofits = totalNonprofits - assignedNonprofits;
    
    const totalTeams = teams.length;
    const assignedTeams = teams.filter(team => team.selected_nonprofit_id).length;
    const unassignedTeams = totalTeams - assignedTeams;
    
    const multipleAssignmentNonprofits = Object.values(nonprofitMap).filter(np => np.assignedTeams.length > 1).length;

    return (
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardHeader title="Nonprofit Assignment Status" />
              <Divider />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">Total Nonprofits:</Typography>
                    <Chip 
                      label={totalNonprofits} 
                      color="primary" 
                      variant="outlined" 
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">Assigned:</Typography>
                    <Chip 
                      label={assignedNonprofits} 
                      color="success" 
                      icon={<FaCheckCircle />}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">Unassigned:</Typography>
                    <Chip 
                      label={unassignedNonprofits} 
                      color="default" 
                      variant="outlined"
                      icon={<FaQuestionCircle />}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">With Multiple Teams:</Typography>
                    <Chip 
                      label={multipleAssignmentNonprofits} 
                      color="warning" 
                      icon={<FaExclamationTriangle />}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardHeader title="Team Assignment Status" />
              <Divider />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">Total Teams:</Typography>
                    <Chip 
                      label={totalTeams} 
                      color="primary" 
                      variant="outlined" 
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">Assigned:</Typography>
                    <Chip 
                      label={assignedTeams} 
                      color="success" 
                      icon={<FaCheckCircle />}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">Unassigned:</Typography>
                    <Chip 
                      label={unassignedTeams} 
                      color="default" 
                      variant="outlined"
                      icon={<FaQuestionCircle />}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">Assignment Rate:</Typography>
                    <Chip 
                      label={`${totalTeams ? Math.round((assignedTeams / totalTeams) * 100) : 0}%`} 
                      color="info"
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardHeader title="Assignment Suggestions" />
              <Divider />
              <CardContent>
                {unassignedTeams > 0 && unassignedNonprofits > 0 ? (
                  <Box>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      {`You have ${unassignedTeams} teams and ${unassignedNonprofits} nonprofits that need assignments.`}
                    </Alert>
                    <Button 
                      variant="contained" 
                      color="primary"
                      fullWidth
                      onClick={() => setViewMode(1)}
                    >
                      View Unassigned Teams
                    </Button>
                  </Box>
                ) : unassignedTeams > 0 ? (
                  <Box>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      {`You have ${unassignedTeams} teams without nonprofits, but all nonprofits are assigned.`}
                    </Alert>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Consider adding more nonprofits or assigning multiple teams to the same nonprofit.
                    </Typography>
                    <Button 
                      variant="contained" 
                      color="primary"
                      fullWidth
                      onClick={() => setViewMode(1)}
                    >
                      View Unassigned Teams
                    </Button>
                  </Box>
                ) : unassignedNonprofits > 0 ? (
                  <Box>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      {`You have ${unassignedNonprofits} nonprofits without teams, but all teams are assigned.`}
                    </Alert>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Consider recruiting more teams or reassigning teams to cover unassigned nonprofits.
                    </Typography>
                    <Button 
                      variant="contained" 
                      color="primary"
                      fullWidth
                      onClick={() => setViewMode(0)}
                    >
                      View Unassigned Nonprofits
                    </Button>
                  </Box>
                ) : (
                  <Alert severity="success">
                    All teams and nonprofits have been assigned! Great job!
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <div>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Team Assignments
        </Typography>
        <Typography variant="body1" paragraph>
          Manage assignments between teams and nonprofits. Ensure all nonprofits have the right teams to support their projects.
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="hackathon-select-label">
                Select Hackathon
              </InputLabel>
              <Select
                labelId="hackathon-select-label"
                value={selectedHackathon}
                onChange={(e) => setSelectedHackathon(e.target.value)}
                label="Select Hackathon"
              >
                <MenuItem value="">
                  <em>Select a hackathon</em>
                </MenuItem>
                {hackathons.map((hackathon) => (
                  <MenuItem key={hackathon.id} value={hackathon.id}>
                    {hackathon.event_id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search nonprofits, teams, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FaSearch />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setSearchTerm("")} size="small">
                      <FaTimes />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && !selectedHackathon ? (
        <Alert severity="info" sx={{ my: 2 }}>
          Please select a hackathon to view team assignments.
        </Alert>
      ) : !loading && selectedHackathon && (
        <>
          {/* Render assignment statistics */}
          {renderAssignmentStats()}

          {/* Toggle between Nonprofit and Team views */}
          <Box sx={{ mb: 3 }}>
            <Tabs 
              value={viewMode} 
              onChange={(e, newValue) => setViewMode(newValue)}
              aria-label="assignment view tabs"
            >
              <Tab label="Nonprofit View" />
              <Tab label="Team View" />
            </Tabs>
          </Box>

          {/* Render the appropriate view */}
          {viewMode === 0 ? renderNonprofitView() : renderTeamView()}
        </>
      )}

      {/* Team Assignment Dialog */}
      <Dialog
        open={assignmentDialogOpen}
        onClose={() => setAssignmentDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {`Manage Team Assignments for ${selectedNonprofit?.name || ""}`}
        </DialogTitle>
        <DialogContent>
          {selectedNonprofit && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Nonprofit Information
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Name:
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {selectedNonprofit.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Project Type:
                      </Typography>                      
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Description:
                      </Typography>
                      <Typography variant="body1">
                        {selectedNonprofit.description || "No description provided"}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Current Team Assignments
                </Typography>
                {selectedNonprofit.assigned_teams && 
                selectedNonprofit.assigned_teams.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Team Name</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Members</TableCell>                        
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedNonprofit.assigned_teams.map(team => (
                          <TableRow key={team.id}>
                            <TableCell>{team.name}</TableCell>
                            <TableCell>
                              {renderTeamStatus(team.status || "IN_REVIEW")}
                            </TableCell>
                            <TableCell>
                              {team.team_members ? 
                                `${team.team_members.length} members` : 
                                "No members"
                              }
                            </TableCell>
                            
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Alert severity="info">
                    No teams are currently assigned to this nonprofit.
                  </Alert>
                )}
              </Box>

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Assign a Team
                </Typography>
                <FormControl fullWidth>
                  <InputLabel id="team-select-label">Select Team</InputLabel>
                  <Select
                    labelId="team-select-label"
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    label="Select Team"
                  >
                    <MenuItem value="">
                      <em>Select a team</em>
                    </MenuItem>
                    {assignableTeams.map((team) => (
                      <MenuItem key={team.id} value={team.id}>
                        {team.name} 
                        {team.selected_nonprofit_id && 
                          team.selected_nonprofit_id === selectedNonprofit.id && 
                          " (Currently Assigned)"}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {assignableTeams.length === 0 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    No eligible teams available for assignment. Teams might already be assigned to other nonprofits.
                  </Alert>
                )}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignmentDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveAssignment}
            variant="contained"
            color="primary"
            disabled={loading || !selectedTeamId}
          >
            {loading ? <CircularProgress size={24} /> : "Save Assignment"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TeamAssignments;