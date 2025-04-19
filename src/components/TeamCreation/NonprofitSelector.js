import React, { memo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Checkbox,
  Button,
  Alert
} from '@mui/material';
import { FaTimes, FaRocket } from 'react-icons/fa';

/**
 * Component for selecting nonprofits from a list
 */
const NonprofitSelector = memo(({ 
  searchTerm, 
  filteredNonprofits, 
  selectedNonprofits, 
  handleSearchChange, 
  toggleNonprofitSelection, 
  clearSearch,
  proceedToRanking
}) => {
  return (
    <Box 
      sx={{ 
        p: 3,
        border: '1px solid',
        borderColor: 'primary.light',
        borderRadius: 2,
        bgcolor: 'rgba(25, 118, 210, 0.04)'
      }}
    >
      <Typography variant="h6" gutterBottom>
        Select the nonprofits you're interested in
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Browse the nonprofits below and select all that interest you. You'll be able to rank them in the next step.
      </Typography>
      
      {/* Search Filter */}
      <TextField
        fullWidth
        label="Search nonprofits by name, description, or problem statements"
        variant="outlined"
        size="small"
        value={searchTerm}
        onChange={handleSearchChange}
        sx={{ mb: 3 }}
        InputProps={{
          endAdornment: searchTerm ? (
            <InputAdornment position="end">
              <IconButton onClick={clearSearch}>
                <FaTimes />
              </IconButton>
            </InputAdornment>
          ) : null
        }}
      />
      
      {filteredNonprofits.length > 0 ? (
        <Grid container spacing={2}>
          {filteredNonprofits.map((nonprofit) => {
            const isSelected = selectedNonprofits.some(np => np.id === nonprofit.id);
            
            return (
              <Grid item xs={12} md={6} key={nonprofit.id}>
                <Card 
                  sx={{
                    mb: 2,
                    boxShadow: isSelected ? 4 : 1,
                    cursor: 'pointer',
                    borderLeft: '5px solid',
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    bgcolor: isSelected ? 'rgba(25, 118, 210, 0.04)' : 'background.paper',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-4px)'
                    }
                  }}
                  onClick={() => toggleNonprofitSelection(nonprofit)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box 
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            overflow: 'hidden',
                            flexShrink: 0,
                            mr: 2,
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                        >
                          <img 
                            src={nonprofit.image || "/npo_placeholder.png"} 
                            alt={nonprofit.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </Box>
                        <Typography variant="h6" component="h4">
                          {nonprofit.name}
                        </Typography>
                      </Box>
                      <Checkbox 
                        checked={isSelected} 
                        color="primary" 
                        onChange={() => toggleNonprofitSelection(nonprofit)}
                      />
                    </Box>
                    
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {nonprofit.description || "Join this nonprofit's mission to make a positive social impact."}
                    </Typography>
                    
                    {nonprofit.problem_statements && nonprofit.problem_statements.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Problem Statements:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {nonprofit.problem_statements
                          .filter(problem => problem.status !== "production")
                          .map((problem, idx) => (
                            <Chip 
                              key={idx} 
                              label={problem.displayTitle} 
                              size="small" 
                              variant="outlined" 
                              sx={{ mb: 0.5 }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Alert severity="info" sx={{ my: 2 }}>
          {searchTerm ? "No nonprofits match your search. Try different keywords." : "Loading nonprofit information..."}
        </Alert>
      )}
      
      {selectedNonprofits.length > 0 && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={proceedToRanking}
            startIcon={<FaRocket />}
          >
            Continue to Rank {selectedNonprofits.length} Selected Nonprofit{selectedNonprofits.length > 1 ? 's' : ''}
          </Button>
        </Box>
      )}
    </Box>
  );
});

NonprofitSelector.displayName = 'NonprofitSelector';

export default NonprofitSelector;