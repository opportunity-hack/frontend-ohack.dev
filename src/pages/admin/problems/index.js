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
} from "@mui/material";
import { Add as AddIcon, Edit as EditIcon, Link as LinkIcon, Save as SaveIcon } from "@mui/icons-material";
import AdminPage from "../../../components/admin/AdminPage";
import LinkManagement from "../../../components/admin/LinkManagement";
import useNonprofit from "../../../hooks/use-nonprofit";

const AdminProblemsPage = () => {
  const { accessToken, userClass } = useAuthInfo();
  const [problems, setProblems] = useState(Array.isArray(null) ? null : []);
  const [loading, setLoading] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderBy, setOrderBy] = useState("title");
  const [order, setOrder] = useState("asc");
  const [selectedNonprofitId, setSelectedNonprofitId] = useState("");
  const [nonprofitSearchTerm, setNonprofitSearchTerm] = useState("");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const org = userClass?.getOrgByName("Opportunity Hack Org");
  const isAdmin = org?.hasPermission("volunteer.admin");
  
  // Use the nonprofit hook to get the list of nonprofits
  const { nonprofits } = useNonprofit();

  const fetchProblems = React.useCallback(async () => {
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
  }, [accessToken]);
  
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
    if (isAdmin) {
      fetchProblems();
    }
  }, [isAdmin, fetchProblems]);

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
    });
    setSelectedNonprofitId("");
    setNonprofitSearchTerm("");
    setDialogOpen(true);
  };

  const handleEditProblem = (problem) => {
    const adaptedProblem = {
      ...problem,
      references: adaptReferencesToLinkFormat(problem.references)
    };
    setEditingProblem(adaptedProblem);
    setSelectedNonprofitId(problem.nonprofit_id || "");
    setNonprofitSearchTerm("");
    setDialogOpen(true);
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
        
        fetchProblems();
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
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedProblems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isTablet ? 4 : 6} align="center" sx={{ py: 3 }}>
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
