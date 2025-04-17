import React, { useState, useEffect, useCallback, memo, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Chip,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Search as SearchIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import axios from "axios";
import ProblemStatementManagement from "./ProblemStatementManagement";

// Memoize the component to prevent unnecessary re-renders
const NonprofitManagement = memo(({ 
  hackathon,
  accessToken, 
  orgId,
  onUpdate = () => {},
  onError = () => {}
}) => {
  const [nonprofits, setNonprofits] = useState([]);
  const [hackathonNonprofits, setHackathonNonprofits] = useState([]);
  const [problemStatements, setProblemStatements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNonprofitId, setSelectedNonprofitId] = useState("");
  const [problemStatementDialogOpen, setProblemStatementDialogOpen] = useState(false);
  const [selectedNonprofit, setSelectedNonprofit] = useState(null);
  
  // Use refs to keep track of loading state and current hackathon ID to prevent race conditions
  const isLoadingRef = useRef(false);
  const hackathonIdRef = useRef(hackathon?.id);
  const initialLoadDoneRef = useRef(false);

  // Update ref when hackathon changes
  useEffect(() => {
    hackathonIdRef.current = hackathon?.id;
  }, [hackathon?.id]);

  // Memoize fetch functions with better dependency management
  const fetchNonprofits = useCallback(async () => {
    // Use ref to avoid race conditions with loading state
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    setLoading(true);
    
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npos`,
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
            "content-type": "application/json",
            "X-Org-Id": orgId,
          },
        }
      );

      if (response.data && response.data.nonprofits) {
        setNonprofits(response.data.nonprofits);
      }
    } catch (error) {
      console.error("Error fetching nonprofits:", error);
      onError("Failed to fetch nonprofits");
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
  }, [accessToken, orgId, onError]);


  // Fetch all problem statements with better state management
  const fetchProblemStatements = useCallback(async () => {
    // Don't fetch if already loading
    if (isLoadingRef.current) return;
    
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/problem_statements`,
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
            "content-type": "application/json",
            "X-Org-Id": orgId,
          },
        }
      );

      if (response.data && response.data.problem_statements) {
        setProblemStatements(response.data.problem_statements);
      }
    } catch (error) {
      console.error("Error fetching problem statements:", error);
      onError("Failed to fetch problem statements");
    }
  }, [accessToken, orgId, onError]);

  // Fetch nonprofits for the current hackathon with better state management
  const fetchHackathonNonprofits = useCallback(async () => {
    const currentHackathonId = hackathonIdRef.current;
    
    // Skip if no hackathon ID or if already loading
    if (!currentHackathonId || isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    setLoading(true);
    
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npos/hackathon/${currentHackathonId}`,
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
            "content-type": "application/json",
            "X-Org-Id": orgId,
          },
        }
      );

      // Only update state if the hackathon ID hasn't changed during the request
      if (currentHackathonId === hackathonIdRef.current && response.data && response.data.nonprofits) {
        setHackathonNonprofits(response.data.nonprofits);
      }
    } catch (error) {
      console.error("Error fetching hackathon nonprofits:", error);
      onError("Failed to fetch hackathon nonprofits");
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
  }, [accessToken, orgId, onError]);

  // Simplified initial load effect
  useEffect(() => {
    if (!initialLoadDoneRef.current) {
      const loadInitialData = async () => {
        initialLoadDoneRef.current = true;
        
        // Fetch nonprofits first
        await fetchNonprofits();
        
        // Then fetch problem statements
        await fetchProblemStatements();
        
        // Finally fetch hackathon-specific nonprofits if we have a hackathon
        if (hackathon?.id) {
          await fetchHackathonNonprofits();
        }
      };
      
      loadInitialData();
    }
  }, [fetchNonprofits, fetchProblemStatements, fetchHackathonNonprofits, hackathon?.id]);

  // Separate effect for hackathon changes only, with proper cleanup
  useEffect(() => {
    let isMounted = true;
    
    // Only fetch if hackathon ID changes after initial load
    if (initialLoadDoneRef.current && hackathon?.id) {
      const fetchData = async () => {
        if (!isLoadingRef.current && isMounted) {
          await fetchHackathonNonprofits();
        }
      };
      
      fetchData();
    }
    
    return () => {
      isMounted = false;
    };
  }, [hackathon?.id, fetchHackathonNonprofits]);

  // Add a nonprofit to the hackathon with improved state handling
  const addNonprofitToHackathon = async () => {
    if (!selectedNonprofitId || !hackathon?.id || isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    setLoading(true);
    
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/nonprofit`,
        {
          hackathonId: hackathon.id,
          nonprofitId: selectedNonprofitId
        },
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
            "content-type": "application/json",
            "X-Org-Id": orgId,
          },
        }
      );

      if (response.status === 200) {
        setSelectedNonprofitId("");
        onUpdate();
        
        // Only refetch if the current hackathon ID matches
        if (hackathon.id === hackathonIdRef.current) {
          await fetchHackathonNonprofits();
        }
      }
    } catch (error) {
      console.error("Error adding nonprofit to hackathon:", error);
      onError("Failed to add nonprofit to hackathon");
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
  };

  // Remove a nonprofit from the hackathon with improved state handling
  const removeNonprofitFromHackathon = async (nonprofitId) => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    setLoading(true);
    
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/nonprofit`,
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
            "content-type": "application/json",
            "X-Org-Id": orgId,
          },
          data: {
            hackathonId: hackathon.id,
            nonprofitId
          }
        }
      );

      if (response.status === 200) {
        onUpdate();
        
        // Only refetch if the current hackathon ID matches
        if (hackathon.id === hackathonIdRef.current) {
          await fetchHackathonNonprofits();
        }
      }
    } catch (error) {
      console.error("Error removing nonprofit from hackathon:", error);
      onError("Failed to remove nonprofit from hackathon");
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
  };

  // Filter out nonprofits that are already added to this hackathon
  const availableNonprofits = nonprofits.filter(
    nonprofit => !hackathonNonprofits.some(hn => hn.id === nonprofit.id)
  );

  // Filter nonprofits based on search term
  const filteredNonprofits = availableNonprofits.filter(
    nonprofit => nonprofit.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get problem statements for a specific nonprofit
  const getNonprofitProblemStatements = (nonprofitId) => {
    if (!nonprofitId) return [];
    const nonprofit = [...nonprofits, ...hackathonNonprofits].find(np => np.id === nonprofitId);
    return nonprofit?.problem_statements || [];
  };

  const getNonprofit = (nonprofitId) => {
    if (!nonprofitId) return null;
    const nonprofit = [...nonprofits, ...hackathonNonprofits].find(np => np.id === nonprofitId);
    return nonprofit || null;
  };

  // Render component
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Manage Nonprofits for {hackathon?.title || 'Hackathon'}
      </Typography>
      
      {/* Add nonprofit section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Add Nonprofit to Hackathon
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={8}>
            <FormControl fullWidth>
              <InputLabel id="nonprofit-select-label">Select Nonprofit</InputLabel>
              <Select
                labelId="nonprofit-select-label"
                value={selectedNonprofitId}
                onChange={(e) => setSelectedNonprofitId(e.target.value)}
                label="Select Nonprofit"
              >
                <MenuItem value="">
                  <em>Select a nonprofit</em>
                </MenuItem>
                {filteredNonprofits.map((nonprofit) => (
                  <MenuItem key={nonprofit.id} value={nonprofit.id}>
                    {nonprofit.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <Button
              variant="contained"
              color="primary"
              onClick={addNonprofitToHackathon}
              disabled={!selectedNonprofitId || loading}
              startIcon={loading ? <CircularProgress size={24} /> : <AddIcon />}
              fullWidth
            >
              Add to Hackathon
            </Button>
          </Grid>
        </Grid>
        
        {/* Search filter */}
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
          <TextField
            label="Search Nonprofits"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </Box>
      </Paper>

      {/* Currently assigned nonprofits */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Nonprofits in this Hackathon
        </Typography>
        
        {loading && hackathonNonprofits.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : hackathonNonprofits.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            No nonprofits have been added to this hackathon yet.
          </Alert>
        ) : (
          <List>
            {hackathonNonprofits.map((nonprofitId) => {
              const nonprofitProblemStatements = getNonprofitProblemStatements(nonprofitId);
              const nonprofit = getNonprofit(nonprofitId);
              console.log("Nonprofit ID:", nonprofit);
              console.log("Nonprofit Problem Statements:", nonprofitProblemStatements);
              

              return (
                <Accordion key={nonprofit.id}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ fontWeight: "bold" }}>
                      {nonprofit.name}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                      >
                        {nonprofit.name || "No description available"}
                      </Typography>

                      {/* Problem Statements section */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Typography variant="subtitle2">
                          Problem Statements:
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => {
                            setSelectedNonprofit(nonprofit);
                            setProblemStatementDialogOpen(true);
                          }}
                        >
                          Manage Problem Statements
                        </Button>
                      </Box>

                      {nonprofitProblemStatements.length > 0 ? (
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 1,
                            mb: 2,
                          }}
                        >
                          {nonprofitProblemStatements.map((psId) => {
                            const ps = problemStatements.find(
                              (p) => p.id === psId
                            );
                            return ps ? (
                              <Chip
                                key={ps.id}
                                label={ps.title}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            ) : null;
                          })}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No problem statements assigned.
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() =>
                          removeNonprofitFromHackathon(nonprofit.id)
                        }
                        disabled={loading}
                      >
                        Remove from Hackathon
                      </Button>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </List>
        )}
      </Paper>

      {/* Problem Statement Management Dialog */}
      <Dialog 
        open={problemStatementDialogOpen} 
        onClose={() => setProblemStatementDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Manage Problem Statements
        </DialogTitle>
        <DialogContent>
          {selectedNonprofit && (
            <ProblemStatementManagement
              nonprofit={selectedNonprofit}
              accessToken={accessToken}
              orgId={orgId}
              onUpdate={() => {
                fetchHackathonNonprofits();
                onUpdate();
              }}
              onError={onError}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProblemStatementDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

NonprofitManagement.displayName = 'NonprofitManagement';

export default NonprofitManagement;