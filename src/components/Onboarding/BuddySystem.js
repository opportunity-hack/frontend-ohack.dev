import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Button,
  Chip,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useEnv } from '../../context/env.context';

// Styled components
const BuddyCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[5]
  }
}));

const BuddyAvatar = styled(Avatar)(({ theme }) => ({
  width: 80,
  height: 80,
  margin: '0 auto',
  border: `3px solid ${theme.palette.primary.main}`,
  boxShadow: theme.shadows[3]
}));

/**
 * BuddySystem component
 * Matches new members with experienced buddies to provide guidance and support
 */
const BuddySystem = () => {
  const { slackSignupUrl } = useEnv();
  const [filters, setFilters] = useState({
    skills: '',
    interests: '',
    availability: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuddy, setSelectedBuddy] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');

  // Handle filter changes
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  // Handle search input
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Select a buddy
  const handleSelectBuddy = (buddy) => {
    setSelectedBuddy(buddy);
    setRequestSent(false);
  };

  // Reset selection
  const handleBackToList = () => {
    setSelectedBuddy(null);
  };

  // Handle sending buddy request
  const handleSendRequest = () => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setLoading(false);
      setRequestSent(true);
    }, 1500);
  };

  return (
    <Box>
      {/* Header */}
      <Box mb={3} textAlign="center">
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontSize: '2.5rem' }}>
          Find a Buddy
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" sx={{ fontSize: '1.25rem' }}>
          Get paired with an experienced member who can guide you
        </Typography>
        <Divider sx={{ mt: 2, mb: 3 }} />
      </Box>

      {/* Buddy system explanation */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ fontSize: '2rem' }}>
          About Our Buddy System
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.25rem' }}>
          Our buddy system pairs new members with experienced volunteers who can answer questions,
          provide guidance, and help you navigate our community. Your buddy can:
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip size="medium" label="1" color="primary" sx={{ width: 36, height: 36, fontSize: '1.2rem', fontWeight: 'bold', borderRadius: '50%', p: 0 }} />
                <Typography variant="body1" sx={{ fontSize: '1.2rem' }}>
                  Answer questions about our community and projects
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip size="medium" label="2" color="primary" sx={{ width: 36, height: 36, fontSize: '1.2rem', fontWeight: 'bold', borderRadius: '50%', p: 0 }} />
                <Typography variant="body1" sx={{ fontSize: '1.2rem' }}>
                  Help you find projects that match your skills and interests
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip size="medium" label="3" color="primary" sx={{ width: 36, height: 36, fontSize: '1.2rem', fontWeight: 'bold', borderRadius: '50%', p: 0 }} />
                <Typography variant="body1" sx={{ fontSize: '1.2rem' }}>
                  Introduce you to other community members
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip size="medium" label="4" color="primary" sx={{ width: 36, height: 36, fontSize: '1.2rem', fontWeight: 'bold', borderRadius: '50%', p: 0 }} />
                <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                  Provide technical guidance on your first contributions
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip size="medium" label="5" color="primary" sx={{ width: 36, height: 36, fontSize: '1.2rem', fontWeight: 'bold', borderRadius: '50%', p: 0 }} />
                <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                  Share resources to help you develop your skills
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip size="medium" label="6" color="primary" sx={{ width: 36, height: 36, fontSize: '1.2rem', fontWeight: 'bold', borderRadius: '50%', p: 0 }} />
                <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                  Offer encouragement and support as you get started
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Selected buddy detail view */}
      {selectedBuddy ? (
        <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Button 
            variant="outlined" 
            onClick={handleBackToList}
            sx={{ mb: 2 }}
          >
            Back to List
          </Button>
          
          <Grid container spacing={3}>
            {/* Buddy profile */}
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <BuddyAvatar>
                  {selectedBuddy.name.charAt(0)}
                </BuddyAvatar>
                <Typography variant="h6" sx={{ fontSize: '1.4rem', fontWeight: 'bold' }}>
                  {selectedBuddy.name}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontSize: '1.2rem' }}>
                  {selectedBuddy.title}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 1 }}>
                  {selectedBuddy.linkedin && (
                    <Button href={selectedBuddy.linkedin} target="_blank" size="small">
                      <LinkedInIcon />
                    </Button>
                  )}
                  {selectedBuddy.github && (
                    <Button href={selectedBuddy.github} target="_blank" size="small">
                      <GitHubIcon />
                    </Button>
                  )}
                  {selectedBuddy.twitter && (
                    <Button href={selectedBuddy.twitter} target="_blank" size="small">
                      <TwitterIcon />
                    </Button>
                  )}
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2" paragraph sx={{ fontStyle: 'italic' }}>
                "{selectedBuddy.bio}"
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Availability:
                </Typography>
                <Chip 
                  label={selectedBuddy.availability} 
                  color={
                    selectedBuddy.availability === 'High' ? 'success' : 
                    selectedBuddy.availability === 'Medium' ? 'primary' : 
                    'warning'
                  }
                  size="small"
                />
              </Box>
            </Grid>
            
            {/* Buddy details and request form */}
            <Grid item xs={12} md={8}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Skills
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selectedBuddy.skills.map((skill, index) => (
                    <Chip key={index} label={skill} size="small" />
                  ))}
                </Box>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Interests
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selectedBuddy.interests.map((interest, index) => (
                    <Chip key={index} label={interest} size="small" variant="outlined" />
                  ))}
                </Box>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              {/* Request form */}
              {requestSent ? (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="body1">
                    Your buddy request has been sent! {selectedBuddy.name} will reach out to you soon.
                  </Typography>
                </Alert>
              ) : (
                <>
                  <Typography variant="h6" gutterBottom>
                    Request {selectedBuddy.name} as Your Buddy
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Tell {selectedBuddy.name.split(' ')[0]} a bit about yourself and what kind of support you're looking for:
                  </Typography>
                  
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Your message"
                    placeholder={`Hi ${selectedBuddy.name.split(' ')[0]}, I'm new to Opportunity Hack and interested in learning more about...`}
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSendRequest}
                    disabled={!requestMessage.trim() || loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <PersonIcon />}
                  >
                    {loading ? 'Sending Request...' : 'Send Buddy Request'}
                  </Button>
                </>
              )}
            </Grid>
          </Grid>
        </Paper>
      ) : (
        <>
          {/* Search and filter section */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label={<span style={{ fontSize: '1.4rem'}}>Search Buddies</span>}
                  placeholder="Search by name, skills, or interests..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: <SearchIcon color="action" sx={{ mr: 1, fontSize: '2rem' }} />,
                    sx: { fontSize: '1.25rem' }
                  }}
                  InputLabelProps={{ sx: { fontSize: '1.4rem', fontWeight: 'bold' } }}
                  sx={{
                    '& .MuiInputBase-input': { fontSize: '1.25rem' },
                    '& .MuiInputLabel-root': { fontSize: '1.4rem', fontWeight: 'bold' }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FilterListIcon sx={{ fontSize: '2rem' }} />}
                  onClick={() => setShowFilters(!showFilters)}
                  sx={{ fontSize: '1.2rem', py: 1.2 }}
                >
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
              </Grid>
            </Grid>
            
            {/* Expandable filters */}
            <Accordion
              expanded={showFilters}
              onChange={() => setShowFilters(!showFilters)}
              sx={{ mt: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontSize: '1.35rem'}}>Filter Options</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ fontSize: '1.2rem' }}>Skills</InputLabel>
                      <Select
                        name="skills"
                        value={filters.skills}
                        onChange={handleFilterChange}
                        label="Skills"
                        sx={{ fontSize: '1.2rem' }}
                      >
                        <MenuItem value="" sx={{ fontSize: '1.2rem' }}>Any Skills</MenuItem>
                        {/* Add skill options here */}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ fontSize: '1.2rem' }}>Interests</InputLabel>
                      <Select
                        name="interests"
                        value={filters.interests}
                        onChange={handleFilterChange}
                        label="Interests"
                        sx={{ fontSize: '1.2rem' }}
                      >
                        <MenuItem value="" sx={{ fontSize: '1.2rem' }}>Any Interests</MenuItem>
                        {/* Add interest options here */}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ fontSize: '1.2rem' }}>Availability</InputLabel>
                      <Select
                        name="availability"
                        value={filters.availability}
                        onChange={handleFilterChange}
                        label="Availability"
                        sx={{ fontSize: '1.2rem' }}
                      >
                        <MenuItem value="" sx={{ fontSize: '1.2rem' }}>Any Availability</MenuItem>
                        {/* Add availability options here */}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>

          {/* Buddy Finder Section - NEED TO REPLACE PLACEHOLDER WITH JSON OF REAL BUDDIES*/}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom sx={{ fontSize: '2rem', mb: 3 }}>
              Available Mentors: Coming Soon!
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ fontSize: '1.2rem' }}>
              We are actively working on building our mentor network.
              Please check back soon for a list of available mentors.
            </Typography>
          </Box>
        </>
      )}

      {/* Additional info */}
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          How the Buddy System Works
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" sx={{ fontSize: '1.3rem', fontWeight: 'bold', mb: 1 }}>
                For New Members
              </Typography>
              <Typography component="ol" sx={{ fontSize: '1.15rem', pl: 2 }}>
                <li>Browse and select a buddy based on your interests and needs</li>
                <li>Send a request with information about what you're looking for</li>
                <li>Your buddy will reach out to you via Slack to introduce themselves</li>
                <li>Schedule an initial meeting to discuss your goals and questions</li>
                <li>Maintain regular communication for the first month</li>
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" sx={{ fontSize: '1.3rem', fontWeight: 'bold', mb: 1 }}>
                Buddy Expectations
              </Typography>
              <Typography component="ul" sx={{ fontSize: '1.15rem', pl: 2 }}>
                <li>Buddies commit to at least one month of regular support</li>
                <li>The relationship is meant to be casual and supportive</li>
                <li>No specific time commitment, but responsiveness is expected</li>
                <li>Focus is on community integration and basic guidance</li>
                <li>For deeper technical mentoring, we have separate programs</li>
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      
      {/* Slack channel info */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body1">
          You can also find buddies in our 
          <strong> #buddy-matching</strong> channel on{' '}
          <a href={slackSignupUrl} target="_blank" rel="noopener noreferrer">
            Slack
          </a>. Post an introduction and what kind of buddy you're looking for!
        </Typography>
      </Alert>
    </Box>
  );
};

export default BuddySystem;