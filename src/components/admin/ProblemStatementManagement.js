import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Divider,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import axios from "axios";

const ProblemStatementManagement = ({ 
  nonprofit,
  accessToken, 
  orgId,
  onUpdate = () => {},
  onError = () => {} 
}) => {
  const [problemStatements, setProblemStatements] = useState([]);
  const [nonprofitProblemStatements, setNonprofitProblemStatements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProblemStatementId, setSelectedProblemStatementId] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch all problem statements
  const fetchProblemStatements = useCallback(async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }, [accessToken, orgId, onError]);

  // Fetch problem statements for the current nonprofit
  const fetchNonprofitProblemStatements = useCallback(async () => {
    if (!nonprofit || !nonprofit.id) return;
    
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npo/${nonprofit.id}`,
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
            "content-type": "application/json",
            "X-Org-Id": orgId,
          },
        }
      );

      if (response.data && response.data.nonprofits && response.data.nonprofits.problem_statements) {
        setNonprofitProblemStatements(response.data.nonprofits.problem_statements || []);
      }
    } catch (error) {
      console.error("Error fetching nonprofit problem statements:", error);
      onError("Failed to fetch nonprofit problem statements");
    } finally {
      setLoading(false);
    }
  }, [nonprofit, accessToken, orgId, onError]);

  // Load data when component mounts or nonprofit changes
  useEffect(() => {
    fetchProblemStatements();
    fetchNonprofitProblemStatements();
  }, [fetchProblemStatements, fetchNonprofitProblemStatements]);

  // Add a problem statement to the nonprofit
  const addProblemStatementToNonprofit = async () => {
    if (!selectedProblemStatementId || !nonprofit.id) return;
    
    setLoading(true);
    try {
      // Create an updated list of problem statements for this nonprofit
      const updatedProblemStatements = [...nonprofitProblemStatements, selectedProblemStatementId];
      
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npo/edit`,
        {
          id: nonprofit.id,
          problem_statements: updatedProblemStatements
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
        setNonprofitProblemStatements(updatedProblemStatements);
        setSelectedProblemStatementId("");
        onUpdate();
      }
    } catch (error) {
      console.error("Error adding problem statement to nonprofit:", error);
      onError("Failed to add problem statement to nonprofit");
    } finally {
      setLoading(false);
    }
  };

  // Remove a problem statement from the nonprofit
  const removeProblemStatementFromNonprofit = async (problemStatementId) => {
    setLoading(true);
    try {
      // Create an updated list of problem statements excluding the one to remove
      const updatedProblemStatements = nonprofitProblemStatements.filter(
        id => id !== problemStatementId
      );
      
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npo/edit`,
        {
          id: nonprofit.id,
          problem_statements: updatedProblemStatements
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
        setNonprofitProblemStatements(updatedProblemStatements);
        onUpdate();
      }
    } catch (error) {
      console.error("Error removing problem statement from nonprofit:", error);
      onError("Failed to remove problem statement from nonprofit");
    } finally {
      setLoading(false);
    }
  };

  // Filter out problem statements that are already added to this nonprofit
  const availableProblemStatements = problemStatements.filter(
    ps => !nonprofitProblemStatements.includes(ps.id)
  );

  // Filter problem statements based on search term
  const filteredProblemStatements = availableProblemStatements.filter(
    ps => ps.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Manage Problem Statements for {nonprofit?.name || 'Nonprofit'}
      </Typography>
      
      {/* Add problem statement section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Add Problem Statement to Nonprofit
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={8}>
            <FormControl fullWidth>
              <InputLabel id="problem-statement-select-label">Select Problem Statement</InputLabel>
              <Select
                labelId="problem-statement-select-label"
                value={selectedProblemStatementId}
                onChange={(e) => setSelectedProblemStatementId(e.target.value)}
                label="Select Problem Statement"
              >
                <MenuItem value="">
                  <em>Select a problem statement</em>
                </MenuItem>
                {filteredProblemStatements.map((ps) => (
                  <MenuItem key={ps.id} value={ps.id}>
                    {ps.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <Button
              variant="contained"
              color="primary"
              onClick={addProblemStatementToNonprofit}
              disabled={!selectedProblemStatementId || loading}
              startIcon={loading ? <CircularProgress size={24} /> : <AddIcon />}
              fullWidth
            >
              Add to Nonprofit
            </Button>
          </Grid>
        </Grid>
        
        {/* Search filter */}
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
          <TextField
            label="Search Problem Statements"
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

      {/* Currently assigned problem statements */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Problem Statements for this Nonprofit
        </Typography>
        
        {loading && nonprofitProblemStatements.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : nonprofitProblemStatements.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            No problem statements have been added to this nonprofit yet.
          </Alert>
        ) : (
          <List>
            {nonprofitProblemStatements.map((psId) => {
              const ps = problemStatements.find(p => p.id === psId);
              
              return ps ? (
                <ListItem key={ps.id} divider>
                  <ListItemText 
                    primary={ps.title}
                    secondary={ps.description ? ps.description.substring(0, 100) + (ps.description.length > 100 ? '...' : '') : 'No description available'}
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      aria-label="remove" 
                      onClick={() => removeProblemStatementFromNonprofit(ps.id)}
                      disabled={loading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ) : null;
            })}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default ProblemStatementManagement;