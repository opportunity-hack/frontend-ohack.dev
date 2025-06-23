import React, { useState, useEffect, useMemo } from "react";
import { useAuthInfo, RequiredAuthProvider, RedirectToLogin } from "@propelauth/react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  CircularProgress,
  TableSortLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
  useTheme,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Autocomplete,
  OutlinedInput,
} from "@mui/material";
import { Add as AddIcon, Edit as EditIcon, Link as LinkIcon, Save as SaveIcon, Delete as DeleteIcon, Event as EventIcon, Close as CloseIcon } from "@mui/icons-material";
import AdminPage from "../../../components/admin/AdminPage";
import LinkManagement from "../../../components/admin/LinkManagement";
import useNonprofit from "../../../hooks/use-nonprofit";
import useHackathonEvents from "../../../hooks/use-hackathon-events";

const AdminProblemsPage = () => {
  const { accessToken, userClass } = useAuthInfo();
  const [problems, setProblems] = useState(Array.isArray(null) ? null : []);
  const [loading, setLoading] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTabValue, setDialogTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderBy, setOrderBy] = useState("title");
  const [order, setOrder] = useState("asc");
  const [selectedNonprofitId, setSelectedNonprofitId] = useState("");
  const [nonprofitSearchTerm, setNonprofitSearchTerm] = useState("");
  const [selectedHackathonId, setSelectedHackathonId] = useState("");
  const [customSkillInput, setCustomSkillInput] = useState("");

  // Common skills based on database examples
  const commonSkills = [
    "Java", "JavaScript", "Python", "TypeScript", "React", "Node.js",
    "PostgreSQL", "MySQL", "MongoDB", "Firebase",
    "Mobile", "iOS", "Android", "React Native", "Flutter",
    "Full-stack", "Frontend", "Backend", "DevOps",
    "Machine Learning", "AI", "NLP", "Data Science",
    "Blockchain", "Solidity", "Web3",
    "UI/UX", "Design", "Figma", "Adobe",
    "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes",
    "Testing", "A/B Testing", "QA", "Automation",
    "API Development", "REST", "GraphQL", "ChatGPT API",
    "E-commerce", "Shopify", "Shopify App",
    "Security", "Authentication", "Identity Verification",
    "Search", "Elasticsearch", "Geographical Search",
    "Matching Algorithms", "Recommendation Systems"
  ];

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const org = userClass?.getOrgByName("Opportunity Hack Org");
  const isAdmin = org?.hasPermission("volunteer.admin");
  
  // Use the nonprofit and hackathon hooks
  const { nonprofits } = useNonprofit();
  const { hackathons, handle_problem_statement_to_event_link_update } = useHackathonEvents(false);

  const fetchProblems = React.useCallback(async () => {
    if (!accessToken || !isAdmin) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/problem-statements`,
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();                
        setProblems(data.problem_statements || []);
      } else {
        throw new Error("Failed to fetch problems");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [accessToken, isAdmin]);
  
  // Create a lookup map for which problem statements each nonprofit has
  const nonprofitProblemStatementsMap = useMemo(() => {
    const map = {};
    
    // For each nonprofit, create an entry in the map with its problem statements
    nonprofits.forEach(nonprofit => {
      if (nonprofit.problem_statements && Array.isArray(nonprofit.problem_statements)) {
        nonprofit.problem_statements.forEach(psId => {
          // If this problem statement ID isn't in the map yet, add it with this nonprofit
          if (!map[psId]) {
            map[psId] = [];
          }
          // Add this nonprofit to the list of nonprofits for this problem statement
          map[psId].push(nonprofit);
        });
      }
    });
    
    return map;
  }, [nonprofits]);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const filteredAndSortedProblems = Array.isArray(problems) ? problems
    .filter(
      (problem) =>
        problem.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        problem.description?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        problem.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        problem.first_thought_of?.toLowerCase().includes(searchQuery.toLowerCase()) 
    )
    .sort((a, b) => {
      const isAsc = order === "asc";
      

      // Handle case where column is a number or null/not set
        if (typeof a[orderBy] === "number") {
            return (a[orderBy] - b[orderBy]) * (isAsc ? 1 : -1);
        }

    // Handle case where column is a number but is a string
    if (typeof a[orderBy] === "string" && !isNaN(a[orderBy])) {
        return (parseInt(a[orderBy]) - parseInt(b[orderBy])) * (isAsc ? 1 : -1);
    }
    
      const aValue = String(a[orderBy]).toLowerCase();
      const bValue = String(b[orderBy]).toLowerCase();
      return (aValue < bValue ? -1 : 1) * (isAsc ? 1 : -1);
    })
    : [];  

  const handleAddProblem = () => {
    setEditingProblem({
      title: "",
      description: "",
      status: "draft",
      first_thought_of: new Date().getFullYear().toString(),
      github: [],
      references: [],
      slack_channel: "",
      helping: [],
      rank: "",
      nonprofit_id: "",
      events: [],
      skills: [],
    });
    setSelectedNonprofitId("");
    setNonprofitSearchTerm("");
    setSelectedHackathonId("");
    setCustomSkillInput("");
    setDialogTabValue(0);
    setDialogOpen(true);
  };

  const handleEditProblem = (problem) => {
    const adaptedProblem = {
      ...problem,
      references: adaptReferencesToLinkFormat(problem.references),
      events: problem.events || [],
      skills: problem.skills || [],
    };
    setEditingProblem(adaptedProblem);
    setSelectedNonprofitId(problem.nonprofit_id || "");
    setNonprofitSearchTerm("");
    setSelectedHackathonId("");
    setCustomSkillInput("");
    setDialogTabValue(0);
    setDialogOpen(true);
  };

  const handleAddHackathonEvent = () => {
    if (!selectedHackathonId || !editingProblem?.id) return;

    const selectedHackathon = hackathons.find(h => h.id === selectedHackathonId);
    if (!selectedHackathon) return;

    // Check if this event is already linked
    const isAlreadyLinked = editingProblem.events.some(event => event.id === selectedHackathon.id);
    if (isAlreadyLinked) return;

    // Update the problem statement events
    const updatedEvents = [...editingProblem.events, selectedHackathon];
    setEditingProblem(prev => ({
      ...prev,
      events: updatedEvents
    }));

    // Create mapping for API call
    const mapping = {
      problem_statement_id: editingProblem.id,
      event_id: selectedHackathon.id
    };

    // Call the API to update the link
    handle_problem_statement_to_event_link_update(mapping, (response) => {
      console.log("Event linked:", response);
      // Remove the fetchProblems call here to prevent unnecessary re-fetch
      // The local state is already updated above
    });

    setSelectedHackathonId("");
  };

  const handleRemoveHackathonEvent = (eventToRemove) => {
    if (!editingProblem?.id) return;

    // Update the local state
    const updatedEvents = editingProblem.events.filter(event => event.id !== eventToRemove.id);
    setEditingProblem(prev => ({
      ...prev,
      events: updatedEvents
    }));

    // Note: We might need a separate API call to remove the link
    // For now, we'll just update the local state
    console.log("Event removed locally:", eventToRemove);
  };

  const handleAddCustomSkill = () => {
    if (!customSkillInput.trim()) return;
    
    const newSkill = customSkillInput.trim();
    if (!editingProblem.skills.includes(newSkill)) {
      setEditingProblem(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill]
      }));
    }
    setCustomSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setEditingProblem(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSkillsChange = (event, newValue) => {
    setEditingProblem(prev => ({
      ...prev,
      skills: newValue
    }));
  };

  const handleSaveProblem = async () => {
    // Include the selected nonprofit ID with the problem statement data
    const problemToSave = {
      ...editingProblem,
      nonprofit_id: selectedNonprofitId || null
    };
    
    console.log("Saving problem with data:", problemToSave);
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/problem-statements`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-Org-Id": org.orgId,
          },
          body: JSON.stringify(problemToSave),
        }
      );
      if (response.ok) {
        // If a nonprofit was selected, also update the nonprofit's problem statements
        if (selectedNonprofitId) {
          try {
            // First get the current problem statements for this nonprofit
            const nonprofitResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npo/${selectedNonprofitId}`,
              {
                headers: {
                  authorization: `Bearer ${accessToken}`,
                },
              }
            );
            
            if (nonprofitResponse.ok) {
              const nonprofitData = await nonprofitResponse.json();
              const currentProblemStatements = nonprofitData.nonprofits?.problem_statements || [];
              
              // Only update if this is a new problem statement or if it's not already associated
              if (!editingProblem.id || !currentProblemStatements.includes(editingProblem.id)) {
                // The response from the first API call contains the ID of the newly created/updated problem statement
                const problemData = await response.json();
                const problemId = problemData.id || editingProblem.id;
                
                if (problemId) {
                  // Add this problem statement ID to the nonprofit's problem statements
                  const updatedProblemStatements = [...currentProblemStatements, problemId];
                  
                  await fetch(
                    `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npo`,
                    {
                      method: "PATCH",
                      headers: {
                        authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                        "X-Org-Id": org.orgId,
                      },
                      body: JSON.stringify({
                        id: selectedNonprofitId,
                        problem_statements: updatedProblemStatements
                      }),
                    }
                  );
                }
              }
            }
          } catch (nonprofitError) {
            console.error("Error linking problem statement to nonprofit:", nonprofitError);
          }
        }
        
        // Only fetch problems after successful save, and close dialog
        await fetchProblems();
        setDialogOpen(false);
      } else {
        throw new Error("Failed to save problem statement");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleReferencesChange = (newReferences) => {
    setEditingProblem((prev) => ({
      ...prev,
      references: newReferences.map(ref => ({
        name: ref.name,
        link: ref.link
      }))
    }));
  };

  const adaptReferencesToLinkFormat = (references) => {
    return (references || []).map(ref => ({
      name: ref.name || '',
      link: ref.link || '',
      color: 'primary',
      size: 'medium',
      variant: 'text',
      open_new: 'True'
    }));
  };

  if (!isAdmin) {
    return (
      <RequiredAuthProvider
        authUrl={process.env.NEXT_PUBLIC_REACT_APP_AUTH_URL}
        displayIfLoggedOut={<RedirectToLogin postLoginRedirectUrl={window.location.href} />}
      >
        <AdminPage title="Problem Statement Management" isAdmin={false}>
          <Typography>You do not have permission to view this page.</Typography>
        </AdminPage>
      </RequiredAuthProvider>
    );
  }

  return (
    <RequiredAuthProvider
      authUrl={process.env.NEXT_PUBLIC_REACT_APP_AUTH_URL}
      displayIfLoggedOut={<RedirectToLogin postLoginRedirectUrl={window.location.href} />}
    >
      <AdminPage title="Problem Statement Management" isAdmin={isAdmin}>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search Problem Statements"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, description, or status..."
                variant="outlined"
                size="medium"
              />
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddProblem}
                size="large"
              >
                Add Problem Statement
              </Button>
            </Grid>
          </Grid>
          
          {/* Stats summary */}
          <Box sx={{ mt: 2, mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Paper 
              sx={{ 
                px: 2, 
                py: 1, 
                display: 'flex', 
                alignItems: 'center',
                bgcolor: '#f5f5f5' 
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                Total Problem Statements:
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {problems?.length || 0}
              </Typography>
            </Paper>
            
            <Paper 
              sx={{ 
                px: 2, 
                py: 1, 
                display: 'flex', 
                alignItems: 'center',
                bgcolor: '#f5f5f5' 
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                Linked to Nonprofits:
              </Typography>
              <Typography variant="body1" fontWeight="bold" color="success.main">
                {problems?.filter(p => 
                  p.nonprofit_id || 
                  (nonprofitProblemStatementsMap[p.id] && nonprofitProblemStatementsMap[p.id].length > 0)
                ).length || 0}
              </Typography>
            </Paper>
            
            <Paper 
              sx={{ 
                px: 2, 
                py: 1, 
                display: 'flex', 
                alignItems: 'center',
                bgcolor: '#f5f5f5' 
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                Unlinked Problem Statements:
              </Typography>
              <Typography variant="body1" fontWeight="bold" color="error.main">
                {problems?.filter(p => 
                  !p.nonprofit_id && 
                  (!nonprofitProblemStatementsMap[p.id] || nonprofitProblemStatementsMap[p.id].length === 0)
                ).length || 0}
              </Typography>
            </Paper>

            <Paper 
              sx={{ 
                px: 2, 
                py: 1, 
                display: 'flex', 
                alignItems: 'center',
                bgcolor: '#f5f5f5' 
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                With Events:
              </Typography>
              <Typography variant="body1" fontWeight="bold" color="info.main">
                {problems?.filter(p => p.events && p.events.length > 0).length || 0}
              </Typography>
            </Paper>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : isMobile ? (
          // Mobile card view
          <Box sx={{ mt: 2 }}>
            {filteredAndSortedProblems.length === 0 ? (
              <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }} color="text.secondary">
                No problem statements found.
              </Typography>
            ) : (
              filteredAndSortedProblems.map((problem) => (
                <Card key={problem.id} sx={{ mb: 2, overflow: 'visible' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', flex: 1 }}>
                        {problem.title}
                      </Typography>
                      <Chip
                        label={problem.status}
                        color={
                          problem.status === "production"
                            ? "success"
                            : problem.status === "active"
                            ? "primary"
                            : "default"
                        }
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      <Chip size="small" label={`Rank: ${problem.rank || 'N/A'}`} variant="outlined" />
                      <Chip size="small" label={`Year: ${problem.first_thought_of || 'N/A'}`} variant="outlined" />
                    </Box>
                    
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Nonprofit:
                    </Typography>
                    
                    {problem.nonprofit_id ? (
                      <Chip
                        icon={<LinkIcon />}
                        label={nonprofits.find(np => np.id === problem.nonprofit_id)?.name || problem.nonprofit_id}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ) : (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {nonprofitProblemStatementsMap[problem.id]?.length > 0 ? (
                          <>
                            {nonprofitProblemStatementsMap[problem.id].map((nonprofit) => (
                              <Chip
                                key={nonprofit.id}
                                icon={<LinkIcon />}
                                label={nonprofit.name}
                                size="small"
                                color="success"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: '24px' }}
                              />
                            ))}
                          </>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Not linked
                          </Typography>
                        )}
                      </Box>
                    )}

                    {/* Add event information */}
                    {problem.events && problem.events.length > 0 && (
                      <>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, mt: 2 }}>
                          Events:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {problem.events.map((event, index) => (
                            <Chip
                              key={index}
                              icon={<EventIcon />}
                              label={event.title || event.event_id}
                              size="small"
                              color="info"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </>
                    )}

                    {/* Add skills information */}
                    {problem.skills && problem.skills.length > 0 && (
                      <>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, mt: 2 }}>
                          Skills:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {problem.skills.map((skill, index) => (
                            <Chip
                              key={index}
                              label={skill}
                              size="small"
                              color="secondary"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: '20px' }}
                            />
                          ))}
                        </Box>
                      </>
                    )}
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                    <Button 
                      size="small" 
                      startIcon={<EditIcon />} 
                      onClick={() => handleEditProblem(problem)}
                      color="primary"
                    >
                      Edit
                    </Button>
                  </CardActions>
                </Card>
              ))
            )}
          </Box>
        ) : (
          // Desktop table view
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "title"}
                      direction={orderBy === "title" ? order : "asc"}
                      onClick={() => handleSort("title")}
                    >
                      Title
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "status"}
                      direction={orderBy === "status" ? order : "asc"}
                      onClick={() => handleSort("status")}
                    >
                      Status
                    </TableSortLabel>
                  </TableCell>
                  {!isTablet && (
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === "rank"}
                        direction={orderBy === "rank" ? order : "asc"}
                        onClick={() => handleSort("rank")}
                      >
                        Rank
                      </TableSortLabel>
                    </TableCell>
                  )}
                  {!isTablet && (
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === "first_thought_of"}
                        direction={orderBy === "first_thought_of" ? order : "asc"}
                        onClick={() => handleSort("first_thought_of")}
                      >
                        First Thought Of
                      </TableSortLabel>
                    </TableCell>
                  )}
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "nonprofit_id"}
                      direction={orderBy === "nonprofit_id" ? order : "asc"}
                      onClick={() => handleSort("nonprofit_id")}
                    >
                      Nonprofit
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "skills"}
                      direction={orderBy === "skills" ? order : "asc"}
                      onClick={() => handleSort("skills")}
                    >
                      Skills
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Events</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedProblems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isTablet ? 6 : 8} align="center" sx={{ py: 3 }}>
                      <Typography variant="body1" color="text.secondary">
                        No problem statements found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedProblems.map((problem) => (
                    <TableRow key={problem.id}>
                      <TableCell>{problem.title}</TableCell>
                      <TableCell>
                        <Chip
                          label={problem.status}
                          color={
                            problem.status === "production"
                              ? "success"
                              : problem.status === "active"
                              ? "primary"
                              : "default"
                          }
                          size="small"
                        />
                      </TableCell>
                      {!isTablet && (<TableCell>{problem.rank}</TableCell>)}
                      {!isTablet && (<TableCell>{problem.first_thought_of}</TableCell>)}
                      <TableCell>
                        {problem.nonprofit_id ? (
                          <Chip
                            icon={<LinkIcon />}
                            label={nonprofits.find(np => np.id === problem.nonprofit_id)?.name || problem.nonprofit_id}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ mr: 0.5 }}
                          />
                        ) : (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {nonprofitProblemStatementsMap[problem.id]?.length > 0 ? (
                              <>
                                {nonprofitProblemStatementsMap[problem.id].map((nonprofit, i) => (
                                  <Chip
                                    key={nonprofit.id}
                                    icon={<LinkIcon />}
                                    label={nonprofit.name}
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                    sx={{ 
                                      fontSize: '0.7rem', 
                                      height: '24px',
                                      '& .MuiChip-icon': { fontSize: '0.7rem' },
                                      mb: 0.5 
                                    }}
                                    title={`This problem statement is linked to ${nonprofit.name}`}
                                  />
                                ))}
                              </>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Not linked
                              </Typography>
                            )}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        {problem.skills && problem.skills.length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: '200px' }}>
                            {problem.skills.slice(0, 3).map((skill, index) => (
                              <Chip
                                key={index}
                                label={skill}
                                size="small"
                                color="secondary"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: '20px' }}
                              />
                            ))}
                            {problem.skills.length > 3 && (
                              <Chip
                                label={`+${problem.skills.length - 3} more`}
                                size="small"
                                color="secondary"
                                variant="filled"
                                sx={{ fontSize: '0.65rem', height: '20px' }}
                                title={problem.skills.slice(3).join(', ')}
                              />
                            )}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No skills
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {problem.events && problem.events.length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {problem.events.map((event, index) => (
                              <Chip
                                key={index}
                                icon={<EventIcon />}
                                label={event.title || event.event_id}
                                size="small"
                                color="info"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: '24px' }}
                              />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No events
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEditProblem(problem)}>
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ pb: 1 }}>
            {editingProblem?.id ? "Edit Problem" : "Add Problem"}
            {editingProblem?.id && (
              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 0.5 }}>
                ID: {editingProblem.id}
              </Typography>
            )}
          </DialogTitle>
          <DialogContent>
            <Tabs
              value={dialogTabValue}
              onChange={(e, newValue) => setDialogTabValue(newValue)}
              aria-label="problem edit tabs"
              sx={{ mb: 3 }}
            >
              <Tab label="Basic Info" value={0} />
              <Tab label="Events" value={1} disabled={!editingProblem?.id} />
              <Tab label="Nonprofit & References" value={2} />
            </Tabs>

            {dialogTabValue === 0 && (
              <>
                <TextField
                  fullWidth
                  label="Title"
                  value={editingProblem?.title || ""}
                  onChange={(e) =>
                    setEditingProblem((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Description"
                  value={editingProblem?.description || ""}
                  onChange={(e) =>
                    setEditingProblem((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  margin="normal"
                  multiline
                  rows={4}
                />

                {/* Skills Section */}
                <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
                  Required Skills
                </Typography>
                
                {/* Skills Autocomplete */}
                <Autocomplete
                  multiple
                  freeSolo
                  options={commonSkills}
                  value={editingProblem?.skills || []}
                  onChange={handleSkillsChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select or type skills"
                      placeholder="Choose from common skills or type custom ones"
                      helperText="Select from dropdown or press Enter to add custom skills"
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option}
                        size="small"
                        color="primary"
                        {...getTagProps({ index })}
                        key={option}
                      />
                    ))
                  }
                  sx={{ mb: 2 }}
                />

                {/* Custom Skill Input */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    label="Add custom skill"
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomSkill();
                      }
                    }}
                    size="small"
                    sx={{ flexGrow: 1 }}
                    placeholder="Type a custom skill and press Enter or click Add"
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddCustomSkill}
                    disabled={!customSkillInput.trim()}
                    startIcon={<AddIcon />}
                    size="small"
                  >
                    Add
                  </Button>
                </Box>

                {/* Display selected skills */}
                {editingProblem?.skills && editingProblem.skills.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Selected Skills ({editingProblem.skills.length}):
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {editingProblem.skills.map((skill, index) => (
                        <Chip
                          key={index}
                          label={skill}
                          onDelete={() => handleRemoveSkill(skill)}
                          color="primary"
                          variant="filled"
                          size="small"
                          deleteIcon={<CloseIcon />}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                <TextField
                  fullWidth
                  label="Status"
                  value={editingProblem?.status || ""}
                  onChange={(e) =>
                    setEditingProblem((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  margin="normal" 
                />
                <TextField
                  fullWidth
                  label="First Thought Of"
                  value={editingProblem?.first_thought_of || ""}
                  onChange={(e) =>
                    setEditingProblem((prev) => ({
                      ...prev,
                      first_thought_of: e.target.value,
                    }))
                  }
                  margin="normal" 
                />

                <TextField
                label="Rank"
                value={editingProblem?.rank || ""}
                onChange={(e) =>
                  setEditingProblem((prev) => ({
                    ...prev,
                    rank: e.target.value,
                  }))
                }
                margin="normal"
                />
              </>
            )}

            {dialogTabValue === 1 && editingProblem?.id && (
              <>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Associated Events/Hackathons
                </Typography>
                
                {/* Add new event section */}
                <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Link to New Event
                  </Typography>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={8}>
                      <FormControl fullWidth>
                        <InputLabel>Select Hackathon Event</InputLabel>
                        <Select
                          value={selectedHackathonId}
                          onChange={(e) => setSelectedHackathonId(e.target.value)}
                          label="Select Hackathon Event"
                        >
                          <MenuItem value="">
                            <em>Choose an event...</em>
                          </MenuItem>
                          {hackathons
                            .filter(hackathon => 
                              !editingProblem.events.some(event => event.id === hackathon.id)
                            )
                            .map((hackathon) => (
                              <MenuItem key={hackathon.id} value={hackathon.id}>
                                {hackathon.title} - {hackathon.event_id} ({hackathon.start_date})
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Button
                        onClick={handleAddHackathonEvent}
                        disabled={!selectedHackathonId}
                        variant="contained"
                        startIcon={<AddIcon />}
                        fullWidth
                      >
                        Link Event
                      </Button>
                    </Grid>
                  </Grid>
                </Box>

                {/* Current linked events */}
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Currently Linked Events ({editingProblem.events?.length || 0})
                </Typography>
                
                {editingProblem.events && editingProblem.events.length > 0 ? (
                  <List>
                    {editingProblem.events.map((event, index) => (
                      <ListItem key={index} divider>
                        <ListItemText
                          primary={event.title || event.event_id}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Event ID: {event.event_id}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Date: {event.start_date} - Location: {event.location}
                              </Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton 
                            edge="end" 
                            onClick={() => handleRemoveHackathonEvent(event)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 2 }}>
                    No events linked to this problem statement.
                  </Typography>
                )}
              </>
            )}

            {dialogTabValue === 2 && (
              <>
                {/* Nonprofit selection with enhanced information */}
                <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                  Associated Nonprofit
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel id="nonprofit-select-label">Link to Nonprofit</InputLabel>
                      <Select
                        labelId="nonprofit-select-label"
                        value={selectedNonprofitId}
                        onChange={(e) => setSelectedNonprofitId(e.target.value)}
                        label="Link to Nonprofit"
                      >
                        <MenuItem value="">
                          <em>None - No nonprofit associated</em>
                        </MenuItem>
                        {nonprofits
                          .filter(np => 
                            !nonprofitSearchTerm || 
                            np.name.toLowerCase().includes(nonprofitSearchTerm.toLowerCase())
                          )
                          .map((nonprofit) => (
                            <MenuItem key={nonprofit.id} value={nonprofit.id}>
                              {nonprofit.name}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  {nonprofits.length > 10 && (
                    <Grid item xs={12}>
                      <TextField
                        label="Search Nonprofits"
                        variant="outlined"
                        size="small"
                        value={nonprofitSearchTerm}
                        onChange={(e) => setNonprofitSearchTerm(e.target.value)}
                        fullWidth
                      />
                    </Grid>
                  )}
                  
                  {/* Display selected nonprofit details */}
                  {selectedNonprofitId && (
                    <Grid item xs={12}>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 2, 
                          mt: 1, 
                          backgroundColor: "#f9f9f9",
                          borderLeft: "4px solid #3f51b5" 
                        }}
                      >
                        {(() => {
                          const selectedNonprofit = nonprofits.find(np => np.id === selectedNonprofitId);
                          return selectedNonprofit ? (
                            <>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {selectedNonprofit.name}
                              </Typography>
                              
                              {selectedNonprofit.description && (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                  {selectedNonprofit.description.length > 200 
                                    ? `${selectedNonprofit.description.substring(0, 200)}...` 
                                    : selectedNonprofit.description}
                                </Typography>
                              )}
                              
                              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {selectedNonprofit.website && (
                                  <Chip 
                                    size="small" 
                                    label="Website" 
                                    color="primary" 
                                    variant="outlined"
                                    sx={{ fontSize: '0.75rem' }}
                                    icon={<LinkIcon fontSize="small" />}
                                    onClick={() => window.open(selectedNonprofit.website, '_blank')}
                                  />
                                )}
                                {selectedNonprofit.slack_channel && (
                                  <Chip 
                                    size="small" 
                                    label={`#${selectedNonprofit.slack_channel}`} 
                                    color="secondary" 
                                    variant="outlined"
                                    sx={{ fontSize: '0.75rem' }}
                                  />
                                )}
                                {selectedNonprofit.problem_statements && (
                                  <Chip 
                                    size="small" 
                                    label={`${selectedNonprofit.problem_statements?.length || 0} Problem Statements`} 
                                    color="success" 
                                    variant="outlined"
                                    sx={{ fontSize: '0.75rem' }}
                                  />
                                )}
                              </Box>
                            </>
                          ) : (
                            <Typography color="text.secondary">
                              Selected nonprofit information not available
                            </Typography>
                          );
                        })()} 
                      </Paper>
                    </Grid>
                  )}
                </Grid>

                <Divider sx={{ my: 3 }} />
                
                <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                  References
                </Typography>
                <LinkManagement
                  links={adaptReferencesToLinkFormat(editingProblem?.references)}
                  onChange={handleReferencesChange}
                />
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
            <Box sx={{ display: 'flex', flexGrow: 1, alignItems: 'center' }}>
              {editingProblem?.id && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                    Nonprofit Status:
                  </Typography>
                  {selectedNonprofitId ? (
                    <Chip 
                      size="small" 
                      color="success" 
                      icon={<LinkIcon />}
                      label={nonprofits.find(np => np.id === selectedNonprofitId)?.name || 'Linked'} 
                      variant="outlined" 
                    />
                  ) : nonprofitProblemStatementsMap[editingProblem.id]?.length > 0 ? (
                    <Chip 
                      size="small" 
                      color="info" 
                      label={`Linked to ${nonprofitProblemStatementsMap[editingProblem.id].length} nonprofit(s)`} 
                      variant="outlined" 
                    />
                  ) : (
                    <Chip 
                      size="small" 
                      color="error" 
                      label="Not Linked" 
                      variant="outlined" 
                    />
                  )}
                </Box>
              )}
            </Box>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSaveProblem} 
              variant="contained" 
              color="primary"
              startIcon={<SaveIcon />}
            >
              Save Problem Statement
            </Button>
          </DialogActions>
        </Dialog>
      </AdminPage>
    </RequiredAuthProvider>
  );
};

export default AdminProblemsPage;
