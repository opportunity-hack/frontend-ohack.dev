import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
  Tooltip,
  CircularProgress,
  Avatar,
  Alert,
  InputAdornment,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  useTheme,
  Link
} from '@mui/material';
import { 
  FaEdit, 
  FaTrash, 
  FaStar, 
  FaGithub, 
  FaSlack, 
  FaSort,
  FaSearch,
  FaUsers,
  FaMapMarkerAlt,
  FaHistory,
  FaNotesMedical,
  FaCheck,
  FaTimes,
  FaPaperPlane,
  FaUserPlus,
  FaUserShield,
  FaChevronDown,
  FaChevronUp,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaBug
} from 'react-icons/fa';
import axios from 'axios';
import { useAuthInfo } from '@propelauth/react';
import { useSnackbar } from 'notistack';
import UserSearchDialog from './UserSearchDialog';

// Status options and their colors for visual representation
const TEAM_STATUS_OPTIONS = [
  { value: 'IN_REVIEW', label: 'In Review', color: 'default' },
  { value: 'NONPROFIT_SELECTED', label: 'Nonprofit Selected', color: 'primary' },
  { value: 'ONBOARDED', label: 'Onboarded', color: 'info' },
  { value: 'SWAG_RECEIVED', label: 'Swag Received', color: 'success' },
  { value: 'PROJECT_COMPLETE', label: 'Project Complete', color: 'success' },
  { value: 'INACTIVE', label: 'Inactive', color: 'error' }
];

// Add message templates after TEAM_STATUS_OPTIONS
const MESSAGE_TEMPLATES = {
  CHECK_IN: {
    category: "Check-in & Progress",
    templates: [
      {
        id: "github_check",
        title: "GitHub Progress Check",
        message: "Hi team! 👋\n\nPlease check the GitHub issue above to give us a general sense that your project to support nonprofits is on track for this summer. We'd love to see:\n\n• Current progress status\n• Any blockers you're facing\n• Timeline for key milestones\n\nThanks for keeping us updated! 🚀",
        icon: "🔍"
      },
      {
        id: "first_checkin_complete",
        title: "First Check-in Complete",
        message: "Thanks for completing our first check-in! 🎉\n\nYour team is now locked from adding new members. This helps ensure stability as we move into the main development phase.\n\nNext steps:\n• Focus on your nonprofit project\n• Regular progress updates\n• Reach out if you need any support\n\nKeep up the great work! 💪",
        icon: "✅"
      },
      {
        id: "progress_reminder",
        title: "Progress Update Reminder",
        message: "Hi team! 👋\n\nJust a friendly reminder to update your progress in GitHub. Regular updates help us:\n\n• Provide better support\n• Track overall hackathon progress\n• Celebrate your achievements\n\nThanks for being awesome! 🌟",
        icon: "⏰"
      }
    ]
  },
  APPROVAL: {
    category: "Approval & Assignment",
    templates: [
      {
        id: "nonprofit_assigned",
        title: "Nonprofit Assignment Confirmation",
        message: "Congratulations! 🎉\n\nYour team has been officially assigned to work with [NONPROFIT_NAME]. This is an exciting opportunity to make a real impact!\n\nNext steps:\n• Review the nonprofit's requirements\n• Schedule your kickoff meeting\n• Set up your development environment\n\nWe're here to support you throughout this journey. Let's build something amazing together! 🚀",
        icon: "🎯"
      },
      {
        id: "team_approved",
        title: "Team Approval",
        message: "Welcome to the approved teams! 🌟\n\nYour team has been reviewed and approved for the hackathon. You're now ready to start making a difference!\n\nWhat's next:\n• Review your assigned nonprofit\n• Plan your project approach\n• Start coding and creating\n\nExcited to see what you'll build! 💻✨",
        icon: "✅"
      }
    ]
  },
  SUPPORT: {
    category: "Support & Guidance",
    templates: [
      {
        id: "need_help",
        title: "Offering Help",
        message: "Hi team! 👋\n\nWe noticed you might need some support. Our team is here to help with:\n\n• Technical challenges\n• Project planning\n• Nonprofit communication\n• Resource access\n\nDon't hesitate to reach out - we're all in this together! 🤝",
        icon: "🆘"
      },
      {
        id: "technical_resources",
        title: "Technical Resources",
        message: "Here are some helpful resources for your project: 🛠️\n\n• Documentation: [link]\n• Code examples: [link]\n• Best practices guide: [link]\n• Community forum: [link]\n\nFeel free to ask questions anytime. Happy coding! 💻",
        icon: "📚"
      }
    ]
  },
  MILESTONE: {
    category: "Milestones & Deadlines",
    templates: [
      {
        id: "deadline_reminder",
        title: "Deadline Reminder",
        message: "Friendly reminder! ⏰\n\nYour next milestone is coming up on [DATE]. Please make sure to:\n\n• Complete your current tasks\n• Update your GitHub repository\n• Prepare for the next phase\n\nYou've got this! If you need any support, just let us know. 💪",
        icon: "📅"
      },
      {
        id: "milestone_achieved",
        title: "Milestone Celebration",
        message: "Fantastic work! 🎉\n\nYou've successfully reached an important milestone. Your progress is impressive and your nonprofit partner is going to love what you're building!\n\nKeep up the momentum - you're making a real difference! 🌟",
        icon: "🏆"
      }
    ]
  }
};

// Component for managing teams in the admin panel
const TeamManagement = ({ orgId, hackathons, selectedHackathon, setSelectedHackathon }) => {
  const theme = useTheme();
  const { accessToken } = useAuthInfo();
  const { enqueueSnackbar } = useSnackbar();

  // State for teams data and UI
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: "created",
    direction: "desc",
  });
  // Add nonprofitMap state to store nonprofit id to name mapping
  const [nonprofitMap, setNonprofitMap] = useState({});
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [teamData, setTeamData] = useState(null);
  const [nonprofitOptions, setNonprofitOptions] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [tableLoading, setTableLoading] = useState(false); // Add a separate loading state for table operations

  // Dialog states
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  // Add new states for message templates
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customMessage, setCustomMessage] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false); // New state for approval dialog
  const [userSearchDialogOpen, setUserSearchDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogAction, setConfirmDialogAction] = useState(null);
  const [confirmDialogData, setConfirmDialogData] = useState(null);
  const [confirmDialogMessage, setConfirmDialogMessage] = useState("");

  // Fetch teams for the selected hackathon
  useEffect(() => {
    if (selectedHackathon) {
      fetchTeams(selectedHackathon);
    }
  }, [selectedHackathon]);

  console.log("Team Data:", teamData);
  // Filter teams based on search term
  useEffect(() => {
    if (!teams) return;

    const filtered = teams.filter(
      (team) =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (team.slack_channel &&
          team.slack_channel
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (team.team_members &&
          team.team_members.some(
            (member) =>
              member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              member.email.toLowerCase().includes(searchTerm.toLowerCase())
          ))
    );

    setFilteredTeams(filtered);
  }, [searchTerm, teams]);

  // Sort teams when sortConfig changes
  useEffect(() => {
    if (!filteredTeams) return;

    const sortedTeams = [...filteredTeams].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    setFilteredTeams(sortedTeams);
  }, [sortConfig]);

  // Fetch teams for a hackathon
  const fetchTeams = async (hackathonId) => {
    setLoading(true);
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
        setFilteredTeams(response.data.teams);
        
        // Fetch nonprofits to build the map for displaying nonprofit names
        fetchNonprofits(hackathonId);
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
      enqueueSnackbar("Failed to fetch teams", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Fetch nonprofits for the selected hackathon
  const fetchNonprofits = async (hackathonId) => {
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
        setNonprofitOptions(response.data.nonprofits);
        
        // Build the nonprofit map for quick lookups
        const npMap = {};
        response.data.nonprofits.forEach(nonprofit => {
          npMap[nonprofit.id] = nonprofit.name;
        });
        setNonprofitMap(npMap);
      }
    } catch (error) {
      console.error("Error fetching nonprofits:", error);
      enqueueSnackbar("Failed to fetch nonprofits", { variant: "error" });
    }
  };

  // Load team details for editing - improve data handling
  const loadTeamDetails = async (teamId) => {
    setTableLoading(true); // Use the table-specific loading state
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/team/${teamId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Org-Id": orgId,
          },
        }
      );
      console.log("Team Details Response:", response.data);
      if (response.data && response.data.team) {
        // Ensure team_members is always an array to prevent rendering issues
        const team = {
          ...response.data.team,
          team_members: response.data.team.team_members || [],
          active: response.data.team.active === "True",
        };
        setSelectedTeam(team);
        setTeamData(team);
      }
    } catch (error) {
      console.error("Error fetching team details:", error);
      enqueueSnackbar("Failed to fetch team details", { variant: "error" });
    } finally {
      setTableLoading(false); // End loading state
    }
  };

  // Change sort order
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Open the edit dialog and load team details
  const handleEditTeam = (team) => {
    setSelectedTeam(team);
    setTeamData({
      ...team,
      active: team.active === "True",
    });
    fetchNonprofits(selectedHackathon);
    // Reset message dialog state when switching teams
    setSelectedTemplate(null);
    setCustomMessage(false);
    setMessageText("");
    setEditDialogOpen(true);
  };

  // Update team data when inputs change
  const handleTeamDataChange = (field, value) => {
    setTeamData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Save team updates
  const handleSaveTeam = async () => {
    setLoading(true);
    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/team/edit`,        
        {
            ...teamData,
            active: teamData.active ? "True" : "False",          
        },
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
            "content-type": "application/json",
            "X-Org-Id": orgId,
          },                
        });

      if (response.data && response.data.success) {
        enqueueSnackbar("Team updated successfully", { variant: "success" });
        setEditDialogOpen(false);
        fetchTeams(selectedHackathon);
      }
    } catch (error) {
      console.error("Error updating team:", error);
      enqueueSnackbar("Failed to update team", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Send message to team's slack channel
  const handleSendMessage = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/team/admin/${teamData.id}/message`,
        {
          message: messageText,          
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
        enqueueSnackbar("Message sent successfully", { variant: "success" });
        setMessageDialogOpen(false);
        setMessageText("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      enqueueSnackbar("Failed to send message", { variant: "error" });
    } finally {
      setLoading(false);
      loadTeamDetails(teamData.id); // Reload team details to reflect the message
    }
  };

  // Change message dialog close handler
  const handleCloseMessageDialog = () => {
    setMessageDialogOpen(false);
    setMessageText("");
    setSelectedTemplate(null);
    setCustomMessage(false);
  };

  // Handle template selection
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    // Replace nonprofit placeholder if applicable
    let message = template.message;
    if (teamData?.selected_nonprofit_id && message.includes('[NONPROFIT_NAME]')) {
      const nonprofitName = getNonprofitName(teamData.selected_nonprofit_id);
      message = message.replace(/\[NONPROFIT_NAME\]/g, nonprofitName);
    }
    setMessageText(message);
    setCustomMessage(false);
  };

  // Handle custom message toggle
  const handleCustomMessageToggle = () => {
    setCustomMessage(true);
    setSelectedTemplate(null);
    setMessageText("");
  };

  // Handle team approval and nonprofit assignment
  const handleApproveTeam = async () => {
    if (!teamData || !teamData.id || !teamData.selected_nonprofit_id) {
      enqueueSnackbar("Please select a nonprofit before approving the team", { variant: "error" });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/team/approve`,
        {
          teamId: teamData.id,
          nonprofitId: teamData.selected_nonprofit_id
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
        enqueueSnackbar("Team approved successfully", { variant: "success" });
        setApprovalDialogOpen(false);
        
        // Update team status to reflect approval
        const updatedTeamData = {
          ...teamData,
          status: "NONPROFIT_SELECTED"
        };
        setTeamData(updatedTeamData);
        
        // Refresh the teams list
        fetchTeams(selectedHackathon);
      }
    } catch (error) {
      console.error("Error approving team:", error);
      enqueueSnackbar(error.response?.data?.message || "Failed to approve team", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Handle user selection from user search dialog
  const handleUserSelect = (user) => {
    if (user && user.id) {
      console.log("User added to team:", user);
      // Reload team details to reflect the new member
      loadTeamDetails(teamData.id);
      // Show success message
      enqueueSnackbar(`${user.name || 'User'} added to team successfully`, { 
        variant: "success" 
      });
    }
  };

  // Remove a member from the team
  const handleRemoveMember = async (memberId) => {
    setTableLoading(true); // Use table-specific loading
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/team/${teamData.id}/member`,
        {
          data: { id: memberId },
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Org-Id": orgId,
          },
        }
      );

      if (response.data && response.data.success) {
        enqueueSnackbar(response.data.message || "Team member removed successfully", {
          variant: "success",
        });
        
        // Reload team details immediately after successful removal
        await loadTeamDetails(teamData.id);
      }
    } catch (error) {
      console.error("Error removing team member:", error);
      enqueueSnackbar(error.response?.data?.message || "Failed to remove team member", { variant: "error" });
    } finally {
      setTableLoading(false); // End loading
    }
  };

  // Delete the team
  const handleDeleteTeam = async (teamId) => {
    setTableLoading(true); // Use table-specific loading
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/team/${teamId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Org-Id": orgId,
          },
        }
      );
      if (response.data && response.data.success) {
        enqueueSnackbar("Team deleted successfully", { variant: "success" });
        setEditDialogOpen(false);
        fetchTeams(selectedHackathon);
      }
    } catch (error) {
      console.error("Error deleting team:", error);
      enqueueSnackbar("Failed to delete team", { variant: "error" });
    } finally {
      setTableLoading(false); // End loading
    }
  };
  

  // Set a member as team lead
  const handleSetTeamLead = async (memberId) => {
    setTableLoading(true); // Use table-specific loading
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/admin/team/${teamData.id}/lead/${memberId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-Org-Id": orgId,
          },
        }
      );

      if (response.data && response.data.success) {
        enqueueSnackbar(response.data.message || "Team lead updated successfully", {
          variant: "success",
        });
        
        // Reload team details immediately after successful update
        await loadTeamDetails(teamData.id);
      }
    } catch (error) {
      console.error("Error updating team lead:", error);
      enqueueSnackbar(error.response?.data?.message || "Failed to update team lead", { variant: "error" });
    } finally {
      setTableLoading(false); // End loading
    }
  };

  // Update a member's GitHub username
  const handleUpdateGithub = async (memberId, githubUsername) => {
    setTableLoading(true); // Use table-specific loading
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/admin/team/${teamData.id}/member/${memberId}/github`,
        { github_username: githubUsername },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-Org-Id": orgId,
          },
        }
      );

      if (response.data && response.data.success) {
        enqueueSnackbar(response.data.message || "GitHub username updated successfully", {
          variant: "success",
        });
        
        // Reload team details immediately after successful update
        await loadTeamDetails(teamData.id);
      }
    } catch (error) {
      console.error("Error updating GitHub username:", error);
      enqueueSnackbar(error.response?.data?.message || "Failed to update GitHub username", { variant: "error" });
    } finally {
      setTableLoading(false); // End loading
    }
  };

  // Handle confirmation dialog actions
  const handleConfirmAction = async () => {
    if (!confirmDialogAction || !confirmDialogData) return;

    // Close the confirmation dialog first for better UX
    setConfirmDialogOpen(false);
    
    switch (confirmDialogAction) {
      case "removeMember":
        await handleRemoveMember(confirmDialogData);
        break;
      case "setLead":
        await handleSetTeamLead(confirmDialogData);
        break;
      case "deleteTeam":
        await handleDeleteTeam(confirmDialogData);
        break;
      default:
        break;
    }

    setConfirmDialogAction(null);
    setConfirmDialogData(null);
  };

  // Open confirmation dialog with specific action and data
  const confirmAction = (action, data, message) => {
    setConfirmDialogAction(action);
    setConfirmDialogData(data);
    setConfirmDialogMessage(message);
    setConfirmDialogOpen(true);
  };

  // Render team status chip
  const renderStatusChip = (status) => {
    const statusOption =
      TEAM_STATUS_OPTIONS.find((opt) => opt.value === status) ||
      TEAM_STATUS_OPTIONS[0];
    return (
      <Chip
        label={statusOption.label}
        color={statusOption.color}
        size="small"
        variant={statusOption.color === "default" ? "outlined" : "filled"}
      />
    );
  };

  // Render selected nonprofit with history
  const renderNonprofitSelection = () => {
    if (!teamData || !teamData.nonprofit_rankings) return null;

    return (
      <Card elevation={1} sx={{ mb: 3 }}>
        <CardHeader
          title="Nonprofit Assignment"
          subheader="Current selection and ranking history"
        />
        <Divider />
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Current Assignment
            </Typography>
            <FormControl fullWidth>
              <InputLabel id="nonprofit-select-label">
                Assigned Nonprofit
              </InputLabel>
              <Select
                labelId="nonprofit-select-label"
                value={teamData.selected_nonprofit_id || ""}
                onChange={(e) =>
                  handleTeamDataChange("selected_nonprofit_id", e.target.value)
                }
                label="Assigned Nonprofit"
              >
                <MenuItem value="">
                  <em>Not assigned yet</em>
                </MenuItem>
                {nonprofitOptions.map((nonprofit) => (
                  <MenuItem key={nonprofit.id} value={nonprofit.id}>
                    {nonprofit.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            Team's Nonprofit Rankings
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Rank</TableCell>
                  <TableCell>Nonprofit</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teamData.nonprofit_rankings.map((ranking, index) => {
                  const nonprofit = nonprofitOptions.find(
                    (n) => n.id === ranking.nonprofit_id
                  );
                  const isSelected =
                    teamData.selected_nonprofit_id === ranking.nonprofit_id;

                  return (
                    <TableRow key={index} selected={isSelected}>
                      <TableCell>{ranking.rank}</TableCell>
                      <TableCell>
                        {nonprofit ? nonprofit.name : "Unknown Nonprofit"}
                      </TableCell>
                      <TableCell>
                        {isSelected ? (
                          <Chip
                            size="small"
                            color="primary"
                            label="Selected"
                            icon={<FaCheck />}
                          />
                        ) : (
                          <Chip
                            size="small"
                            variant="outlined"
                            label="Not Selected"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  };

  // Render team member management
  const renderTeamMembers = () => {
    if (!teamData) return null;

    // Always ensure team_members is an array, even if it's null or undefined
    const teamMembers = Array.isArray(teamData.team_members) ? teamData.team_members : [];
    
    return (
      <Card elevation={1} sx={{ mb: 3 }}>
        <CardHeader
          title="Team Members"
          subheader="Manage team composition"
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                startIcon={tableLoading ? <CircularProgress size={16} /> : <FaUserPlus />}
                onClick={() => setUserSearchDialogOpen(true)}
                color="primary"
                variant="contained"
                size="small"
                disabled={tableLoading}
              >
                Find User
              </Button>              
            </Box>
          }
        />
        <Divider />
        <CardContent>
          {tableLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={40} />
            </Box>
          ) : teamMembers.length === 0 ? (
            // Only show the "No team members" message when we're certain the array is empty
            <Box sx={{ py: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                No team members yet. Add members to build your team.
              </Typography>
              <Button
                startIcon={<FaUserPlus />}
                onClick={() => setUserSearchDialogOpen(true)}
                color="primary"
                variant="contained"
                size="small"
                sx={{ mt: 1 }}
              >
                Find and Add Team Members
              </Button>
            </Box>
          ) : (
            // This section renders the table with team members
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Slack ID</TableCell>
                    <TableCell>GitHub</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id || `member-${Math.random()}`}>
                      <TableCell>{member.name || "Unnamed Member"}</TableCell>
                      <TableCell>{member.user_id || "N/A"}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <TextField
                            size="small"
                            variant="outlined"
                            value={member.github || ""}
                            placeholder="GitHub username"
                            onChange={(e) => {
                              const updatedMembers = teamMembers.map(
                                (m) =>
                                  m.id === member.id
                                    ? { ...m, github: e.target.value }
                                    : m
                              );
                              handleTeamDataChange("team_members", updatedMembers);
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <FaGithub />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleUpdateGithub(member.id, member.github)
                                    }
                                    disabled={!member.github}
                                  >
                                    <FaCheck />
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        {member.is_lead ? (
                          <Chip
                            size="small"
                            color="secondary"
                            label="Team Lead"
                            icon={<FaStar />}
                          />
                        ) : (
                          <Chip
                            size="small"
                            variant="outlined"
                            label="Member"
                            onClick={() =>
                              confirmAction(
                                "setLead",
                                member.id,
                                `Make ${member.name || "this member"} the team lead?`
                              )
                            }
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Remove from team">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              confirmAction(
                                "removeMember",
                                member.id,
                                `Remove ${member.name || "this member"} from the team?`
                              )
                            }
                          >
                            <FaTrash />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    );
  };

  // Render team details and metadata
  const renderTeamDetails = () => {
    if (!teamData) return null;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={1} sx={{ mb: 3, height: "100%" }}>
            <CardHeader title="Team Information" />
            <Divider />
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Team Name"
                  value={teamData.name || ""}
                  onChange={(e) => handleTeamDataChange("name", e.target.value)}
                />

                <TextField
                  fullWidth
                  label="Slack Channel"
                  value={teamData.slack_channel || ""}
                  onChange={(e) =>
                    handleTeamDataChange("slack_channel", e.target.value)
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FaSlack />
                      </InputAdornment>
                    ),
                    endAdornment: teamData.slack_channel && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          component="a"
                          href={`https://opportunity-hack.slack.com/app_redirect?channel=${teamData.slack_channel}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          color="primary"
                        >
                          <FaExternalLinkAlt size={14} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <FormControl fullWidth>
                  <InputLabel id="status-select-label">Team Status</InputLabel>
                  <Select
                    labelId="status-select-label"
                    value={teamData.status || "IN_REVIEW"}
                    onChange={(e) =>
                      handleTeamDataChange("status", e.target.value)
                    }
                    label="Team Status"
                  >
                    {TEAM_STATUS_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={teamData.active}
                      onChange={(e) =>
                        handleTeamDataChange("active", e.target.checked)
                      }
                      color="primary"
                    />
                  }
                  label="Active Team"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={1} sx={{ mb: 3, height: "100%" }}>
            <CardHeader title="Additional Information" />
            <Divider />
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Location at Hackathon"
                  value={teamData.location || ""}
                  onChange={(e) =>
                    handleTeamDataChange("location", e.target.value)
                  }
                  placeholder="e.g., Table 5, Room 101"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FaMapMarkerAlt />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Admin Notes (Private)"
                  value={teamData.admin_notes || ""}
                  onChange={(e) =>
                    handleTeamDataChange("admin_notes", e.target.value)
                  }
                  multiline
                  rows={4}
                  placeholder="Add private notes about this team (not visible to team members)"
                />

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Created: {new Date(teamData.created).toLocaleString()}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // Render GitHub links
  const renderGitHubLinks = () => {
    if (!teamData) return null;

    return (
      <Card elevation={1} sx={{ mb: 3 }}>
        <CardHeader
          title="GitHub Repositories"
          subheader="Manage team repositories"
          action={
            <Button
              startIcon={<FaGithub />}
              onClick={() => {
                /* Open GitHub link dialog */
              }}
              color="primary"
              variant="contained"
              size="small"
              disabled
            >
              Add Repository
            </Button>
          }
        />
        <Divider />
        <CardContent>
          {teamData.github_links && teamData.github_links.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Repository Name</TableCell>
                    <TableCell>URL</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teamData.github_links.map((repo, index) => (
                    <TableRow key={index}>
                      <TableCell>{repo.name}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            {repo.link}
                          </Typography>
                          <IconButton
                            size="small"
                            color="primary"
                            component="a"
                            href={repo.link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FaExternalLinkAlt />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Remove repository">
                          <IconButton size="small" color="error">
                            <FaTrash />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">
              No GitHub repositories have been linked to this team yet.
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  // Render communication section
  const renderCommunication = () => {
    if (!teamData) return null;

    return (
      <Card elevation={1} sx={{ mb: 3 }}>
        <CardHeader
          title="Team Communication"
          subheader="Send messages to the team's Slack channel"
        />
        <Divider />
        <CardContent>
          <Box sx={{ mb: 2, display: "flex", gap: 2, alignItems: "center" }}>
            <Typography variant="body2" gutterBottom>
              Send a message to #{teamData.slack_channel || 'team-channel'}
            </Typography>
            <Button
              startIcon={<FaPaperPlane />}
              variant="contained"
              color="primary"
              onClick={() => {
                // Reset dialog state when opening
                setSelectedTemplate(null);
                setCustomMessage(false);
                setMessageText("");
                setMessageDialogOpen(true);
              }}
              disabled={!teamData.slack_channel}
            >
              Send Message
            </Button>

            {/* Add Approve Team Button */}
            <Button
              startIcon={<FaCheckCircle />}
              variant="contained"
              color="success"
              onClick={() => setApprovalDialogOpen(true)}
              disabled={
                !teamData.selected_nonprofit_id ||
                teamData.status !== "IN_REVIEW"
              }
              sx={{ ml: 2 }}
            >
              Approve Team
            </Button>
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            Recent Communications
          </Typography>
          {teamData.communication_history &&
          teamData.communication_history.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Sender</TableCell>
                    <TableCell>Message</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teamData.communication_history.map((message, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {new Date(message.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>{message.sender}</TableCell>
                      <TableCell>{message.text}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No communication history available.
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  };

  // Helper function to get nonprofit name from id
  const getNonprofitName = (nonprofitId) => {
    return nonprofitId && nonprofitMap[nonprofitId] 
      ? nonprofitMap[nonprofitId] 
      : "Not assigned";
  };

  // Helper function to render GitHub links for a team
  const renderGitHubCell = (team) => {
    if (!team.github_links || team.github_links.length === 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
          <FaGithub style={{ marginRight: 4, opacity: 0.5 }} />
          <Typography variant="body2" color="text.secondary">
            No repos
          </Typography>
        </Box>
      );
    }

    // If there's only one repository, show it directly
    if (team.github_links.length === 1) {
      const repo = team.github_links[0];
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Link
            href={repo.link}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'primary.main',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            <FaGithub style={{ marginRight: 4 }} />
            <Typography variant="body2" noWrap sx={{ maxWidth: 120 }}>
              {repo.name || 'Repository'}
            </Typography>
            <FaExternalLinkAlt size={12} style={{ marginLeft: 4 }} />
          </Link>
          <Tooltip title="View GitHub Issues">
            <IconButton
              size="small"
              color="secondary"
              component="a"
              href={`${repo.link}/issues`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaBug size={12} />
            </IconButton>
          </Tooltip>
        </Box>
      );
    }

    // If there are multiple repositories, show a dropdown or count
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          icon={<FaGithub />}
          label={`${team.github_links.length} repos`}
          size="small"
          color="primary"
          variant="outlined"
          onClick={() => {
            // Open the first repository or show all in the edit dialog
            if (team.github_links[0]) {
              window.open(team.github_links[0].link, '_blank');
            }
          }}
          sx={{ cursor: 'pointer' }}
        />
        <Tooltip title="View all repositories">
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleEditTeam(team)}
          >
            <FaExternalLinkAlt size={12} />
          </IconButton>
        </Tooltip>
      </Box>
    );
  };

  return (
    <div>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Team Management
        </Typography>
        <Typography variant="body1" paragraph>
          Manage teams, assign nonprofits, and monitor team progress across all
          hackathons.
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
              placeholder="Search teams, members, or slack channels..."
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

      {loading && !editDialogOpen ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {!selectedHackathon ? (
            <Alert severity="info" sx={{ my: 2 }}>
              Please select a hackathon to view teams.
            </Alert>
          ) : filteredTeams.length === 0 ? (
            <Alert severity="info" sx={{ my: 2 }}>
              No teams found for this hackathon.
            </Alert>
          ) : (
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
                        Team Name
                        {sortConfig.key === "name" &&
                          (sortConfig.direction === "asc" ? (
                            <FaChevronUp size={14} />
                          ) : (
                            <FaChevronDown size={14} />
                          ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                        }}
                        onClick={() => requestSort("slack_channel")}
                      >
                        Slack Channel
                        {sortConfig.key === "slack_channel" &&
                          (sortConfig.direction === "asc" ? (
                            <FaChevronUp size={14} />
                          ) : (
                            <FaChevronDown size={14} />
                          ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                        }}
                        onClick={() => requestSort("status")}
                      >
                        Status
                        {sortConfig.key === "status" &&
                          (sortConfig.direction === "asc" ? (
                            <FaChevronUp size={14} />
                          ) : (
                            <FaChevronDown size={14} />
                          ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                        }}
                        onClick={() => requestSort("created")}
                      >
                        Created
                        {sortConfig.key === "created" &&
                          (sortConfig.direction === "asc" ? (
                            <FaChevronUp size={14} />
                          ) : (
                            <FaChevronDown size={14} />
                          ))}
                      </Box>
                    </TableCell>
                    <TableCell>Members</TableCell>
                    <TableCell>GitHub</TableCell>
                    <TableCell>Nonprofit</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTeams
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((team) => (
                      <TableRow key={team.id} hover>
                        <TableCell>
                          {team.name}
                          {team.active === "True" ? (
                            <Chip
                              size="small"
                              color="success"
                              label="Active"
                              sx={{ ml: 1 }}
                            />
                          ) : (
                            <Chip
                              size="small"
                              color="default"
                              label="Inactive"
                              variant="outlined"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <FaSlack style={{ marginRight: 8 }} />
                            {team.slack_channel ? (
                              <Link
                                href={`https://opportunity-hack.slack.com/app_redirect?channel=${team.slack_channel}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ 
                                  textDecoration: 'none',
                                  color: theme.palette.primary.main,
                                  '&:hover': {
                                    textDecoration: 'underline'
                                  }
                                }}
                              >
                                {team.slack_channel}
                              </Link>
                            ) : (
                              "N/A"
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {renderStatusChip(team.status || "IN_REVIEW")}
                        </TableCell>
                        <TableCell>
                          {new Date(team.created).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {team.team_members ? (
                            <Chip
                              label={`${team.team_members.length} members`}
                              icon={<FaUsers />}
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
                          {renderGitHubCell(team)}
                        </TableCell>
                        <TableCell>
                          {getNonprofitName(team.selected_nonprofit_id)}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Tooltip title="Edit Team">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEditTeam(team)}
                              >
                                <FaEdit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Team">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() =>
                                  confirmAction(
                                    "deleteTeam",
                                    team.id,
                                    `Delete team ${team.name}? This cannot be undone.`
                                  )
                                }
                              >
                                <FaTrash />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={filteredTeams.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
              />
            </TableContainer>
          )}
        </>
      )}

      {/* Edit Team Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Edit Team: {teamData?.name}</DialogTitle>
        <DialogContent>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ mb: 3 }}
          >
            <Tab label="Team Details" />
            <Tab label="Nonprofit Assignment" />
            <Tab label="Team Members" />
            <Tab label="GitHub Links" />
            <Tab label="Communication" />
          </Tabs>

          <Box sx={{ mt: 2 }}>
            {activeTab === 0 && renderTeamDetails()}
            {activeTab === 1 && renderNonprofitSelection()}
            {activeTab === 2 && renderTeamMembers()}
            {activeTab === 3 && renderGitHubLinks()}
            {activeTab === 4 && renderCommunication()}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveTeam}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog
        open={messageDialogOpen}
        onClose={handleCloseMessageDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FaPaperPlane />
            Send Message to #{teamData?.slack_channel}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            {!customMessage && !selectedTemplate && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Choose a Message Template
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Select from common messages or write a custom one
                </Typography>
                
                {Object.entries(MESSAGE_TEMPLATES).map(([categoryKey, category]) => (
                  <Box key={categoryKey} sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      {category.category}
                    </Typography>
                    <Grid container spacing={2}>
                      {category.templates.map((template) => (
                        <Grid item xs={12} sm={6} key={template.id}>
                          <Card 
                            variant="outlined" 
                            sx={{ 
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              '&:hover': {
                                borderColor: 'primary.main',
                                boxShadow: 1
                              }
                            }}
                            onClick={() => handleTemplateSelect(template)}
                          >
                            <CardContent sx={{ pb: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="h6" component="span">
                                  {template.icon}
                                </Typography>
                                <Typography variant="subtitle2" fontWeight="bold">
                                  {template.title}
                                </Typography>
                              </Box>
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                              >
                                {template.message}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                ))}
                
                <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleCustomMessageToggle}
                    startIcon={<FaEdit />}
                  >
                    Write Custom Message
                  </Button>
                </Box>
              </Box>
            )}

            {(selectedTemplate || customMessage) && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">
                    {selectedTemplate ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{selectedTemplate.icon}</span>
                        {selectedTemplate.title}
                      </Box>
                    ) : (
                      'Custom Message'
                    )}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => {
                      setSelectedTemplate(null);
                      setCustomMessage(false);
                      setMessageText("");
                    }}
                  >
                    Back to Templates
                  </Button>
                </Box>
                
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  label="Message Content"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message to the team..."
                  variant="outlined"
                  helperText={`Message will be sent to #${teamData?.slack_channel || 'team-channel'}`}
                />
                
                {selectedTemplate && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      💡 Feel free to customize this template before sending. The message above can be edited to fit your specific needs.
                    </Typography>
                  </Alert>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMessageDialog}>Cancel</Button>
          {(selectedTemplate || customMessage) && (
            <Button
              onClick={handleSendMessage}
              variant="contained"
              color="primary"
              disabled={loading || !messageText.trim()}
              startIcon={loading ? <CircularProgress size={16} /> : <FaPaperPlane />}
            >
              Send Message
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Approve Team Dialog */}
      <Dialog
        open={approvalDialogOpen}
        onClose={() => setApprovalDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Approve Team Assignment</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography variant="body1" gutterBottom>
              You are about to approve team <strong>{teamData?.name}</strong> and assign them to:
            </Typography>
            
            <Box sx={{ my: 2, p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="subtitle1" color="primary" fontWeight="bold">
                {teamData?.selected_nonprofit_id ? getNonprofitName(teamData.selected_nonprofit_id) : "No nonprofit selected"}
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              This will notify the team and update their status to "Nonprofit Selected".
            </Typography>
            
            {!teamData?.selected_nonprofit_id && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Please select a nonprofit before approving the team.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleApproveTeam}
            variant="contained"
            color="success"
            disabled={loading || !teamData?.selected_nonprofit_id}
            startIcon={loading ? <CircularProgress size={16} /> : <FaCheckCircle />}
          >
            Confirm Approval
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <Typography variant="body1">{confirmDialogMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmAction}
            variant="contained"
            color="error"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Search Dialog */}
      {teamData && (
        <UserSearchDialog
          open={userSearchDialogOpen}
          onClose={() => setUserSearchDialogOpen(false)}
          onUserSelect={handleUserSelect}
          teamId={teamData.id}
          hackathonId={selectedHackathon}
          orgId={orgId}
          onAddSuccess={(user) => {
            // This callback provides an immediate UI update after adding a member
            loadTeamDetails(teamData.id);
          }}
        />
      )}
    </div>
  );
};

export default TeamManagement;