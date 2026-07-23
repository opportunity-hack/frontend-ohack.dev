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
  Alert,
  Autocomplete,
  Tooltip,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  OpenInNew as OpenInNewIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import { useRouter } from "next/router";
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
  const router = useRouter();
  const [nonprofits, setNonprofits] = useState([]);
  const [hackathonNonprofits, setHackathonNonprofits] = useState([]);
  const [problemStatements, setProblemStatements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nonprofitToAdd, setNonprofitToAdd] = useState(null);
  const [problemStatementDialogOpen, setProblemStatementDialogOpen] = useState(false);
  const [selectedNonprofit, setSelectedNonprofit] = useState(null);
  const [visiblePsIds, setVisiblePsIds] = useState(hackathon?.visible_problem_statements || null);
  const [visibilityDirty, setVisibilityDirty] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);

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
    if (!nonprofitToAdd?.id || !hackathon?.id || isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    setLoading(true);
    
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/nonprofit`,
        {
          hackathonId: hackathon.id,
          nonprofitId: nonprofitToAdd.id
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
        setNonprofitToAdd(null);
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

  // Toggle visibility of a problem statement in the hackathon
  const togglePsVisibility = (psId) => {
    setVisiblePsIds((prev) => {
      // If null (no visibility list yet), build one with all PS IDs minus the toggled one
      if (prev === null) {
        const allPsIds = getAllProblemStatementIds();
        return allPsIds.filter((id) => id !== psId);
      }
      if (prev.includes(psId)) {
        return prev.filter((id) => id !== psId);
      }
      return [...prev, psId];
    });
    setVisibilityDirty(true);
  };

  const isPsVisible = (psId) => {
    // If no visibility list, all are visible
    if (visiblePsIds === null) return true;
    return visiblePsIds.includes(psId);
  };

  const getAllProblemStatementIds = () => {
    const ids = [];
    hackathonNonprofits.forEach((npoOrId) => {
      const npo = getNonprofit(npoOrId);
      if (npo?.problem_statements) {
        npo.problem_statements.forEach((psId) => {
          if (!ids.includes(psId)) ids.push(psId);
        });
      }
    });
    return ids;
  };

  const saveVisibility = async () => {
    if (!hackathon?.id) return;
    setSavingVisibility(true);
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/problem_statements`,
        {
          hackathonId: hackathon.id,
          problemStatementIds: visiblePsIds || getAllProblemStatementIds(),
        },
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
            "content-type": "application/json",
            "X-Org-Id": orgId,
          },
        }
      );
      setVisibilityDirty(false);
      onUpdate();
    } catch (error) {
      console.error("Error saving visibility:", error);
      onError("Failed to save project visibility settings");
    } finally {
      setSavingVisibility(false);
    }
  };

  // Filter out nonprofits that are already added to this hackathon
  const availableNonprofits = nonprofits.filter(
    nonprofit => !hackathonNonprofits.some(hn => hn.id === nonprofit.id)
  );

  // Get problem statements for a specific nonprofit
  const getNonprofitProblemStatements = (nonprofitId) => {
    if (!nonprofitId) return [];
    // Handle both cases: when nonprofitId is an ID or when it's a nonprofit object
    const id = typeof nonprofitId === 'object' ? nonprofitId.id : nonprofitId;
    const nonprofit = [...nonprofits, ...hackathonNonprofits].find(np => np.id === id);
    return nonprofit?.problem_statements || [];
  };

  const getNonprofit = (nonprofitOrId) => {
    if (!nonprofitOrId) return null;
    // If it's already a nonprofit object, return it
    if (typeof nonprofitOrId === 'object' && nonprofitOrId.id) return nonprofitOrId;
    // Otherwise, find the nonprofit by ID
    const nonprofit = [...nonprofits, ...hackathonNonprofits].find(np => np.id === nonprofitOrId);
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
        <Grid container spacing={2} alignItems="flex-start">
          <Grid size={{ xs: 8 }}>
            <Autocomplete
              options={availableNonprofits}
              getOptionLabel={(option) => option.name || ""}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={nonprofitToAdd}
              onChange={(_, newValue) => setNonprofitToAdd(newValue)}
              filterOptions={(options, { inputValue }) => {
                const lc = inputValue.toLowerCase();
                if (!lc) return options;
                return options.filter(
                  (o) =>
                    o.name?.toLowerCase().includes(lc) ||
                    o.description?.toLowerCase().includes(lc)
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search nonprofits"
                  placeholder="Type to filter by name or description…"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <SearchIcon sx={{ ml: 0.5, mr: 0.5, color: "text.secondary", flexShrink: 0 }} />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props} key={option.id}>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {option.name}
                    </Typography>
                    {option.description && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", maxWidth: 420 }}
                        noWrap
                      >
                        {option.description.length > 110
                          ? option.description.slice(0, 110) + "…"
                          : option.description}
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
              noOptionsText={
                loading ? "Loading…" : "No nonprofits available to add"
              }
              loading={loading}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={addNonprofitToHackathon}
              disabled={!nonprofitToAdd || loading}
              startIcon={loading ? <CircularProgress size={24} /> : <AddIcon />}
              fullWidth
              sx={{ height: 56 }}
            >
              Add to Hackathon
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Project visibility save bar */}
      {visibilityDirty && (
        <Alert
          severity="warning"
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={savingVisibility ? <CircularProgress size={16} /> : <SaveIcon />}
              onClick={saveVisibility}
              disabled={savingVisibility}
            >
              Save Visibility
            </Button>
          }
        >
          You have unsaved project visibility changes.
        </Alert>
      )}

      {/* Currently assigned nonprofits */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography variant="subtitle1">
            Nonprofits in this Hackathon
          </Typography>
          {hackathonNonprofits.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              {visiblePsIds === null
                ? `All projects visible`
                : `${visiblePsIds.length} of ${getAllProblemStatementIds().length} projects visible`}
            </Typography>
          )}
        </Box>
        
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
            {hackathonNonprofits.map((nonprofitOrId) => {
              const nonprofit = getNonprofit(nonprofitOrId);
              
              // Skip rendering if nonprofit is null
              if (!nonprofit) {
                console.warn("Null or undefined nonprofit found:", nonprofitOrId);
                return null;
              }
              
              const nonprofitProblemStatements = getNonprofitProblemStatements(nonprofit.id);
              
              return (
                <Accordion key={nonprofit.id}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%", pr: 1 }}>
                      <Typography sx={{ fontWeight: "bold", flex: 1 }}>
                        {nonprofit.name || "Unnamed Nonprofit"}
                      </Typography>
                      <Tooltip title="Edit nonprofit details">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/admin/nonprofit?id=${nonprofit.id}&from=${encodeURIComponent(`/admin/hackathons/${hackathon?.event_id || ''}`)}`);
                          }}
                          aria-label={`Edit ${nonprofit.name}`}
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                      >
                        {nonprofit.description || "No description available"}
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
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                            Toggle visibility to control which projects appear on the hackathon page:
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 1,
                            }}
                          >
                            {nonprofitProblemStatements.map((psId) => {
                              const ps = problemStatements.find(
                                (p) => p.id === psId
                              );
                              const visible = isPsVisible(psId);
                              return ps ? (
                                <Chip
                                  key={ps.id}
                                  icon={visible ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                                  label={ps.title}
                                  size="small"
                                  color={visible ? "primary" : "default"}
                                  variant={visible ? "filled" : "outlined"}
                                  onClick={() => togglePsVisibility(ps.id)}
                                  sx={{ cursor: "pointer" }}
                                />
                              ) : null;
                            })}
                          </Box>
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