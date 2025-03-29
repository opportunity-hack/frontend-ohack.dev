import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthInfo } from '@propelauth/react';
import { 
  Typography, 
  Container, 
  Box, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  FormControlLabel, 
  Switch, 
  Chip, 
  CircularProgress,
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  FormControl,
  FormHelperText,
  Select,
  MenuItem,
  Rating
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Head from 'next/head';
import { useEnv } from '../../../context/env.context';
import LoginOrRegister from '../../../components/LoginOrRegister/LoginOrRegister';

const TeamMatchPage = () => {
  const router = useRouter();
  const { event_id } = router.query;
  const { isLoggedIn, user, accessToken } = useAuthInfo();
  const { apiServerUrl } = useEnv();
  
  const [nonprofits, setNonprofits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasTeam, setHasTeam] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [comments, setComments] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [eventData, setEventData] = useState(null);
  const [teamLeadConfirmed, setTeamLeadConfirmed] = useState(false);

  // Mock data for initial development
  const mockNonprofits = [
    { id: 1, name: 'Save the Oceans', description: 'Working to reduce ocean pollution and protect marine life', logo: '/npo_placeholder.png' },
    { id: 2, name: 'Code for Schools', description: 'Bringing computer science education to underserved schools', logo: '/npo_placeholder.png' },
    { id: 3, name: 'Food Rescue', description: 'Reducing food waste by connecting restaurants with food banks', logo: '/npo_placeholder.png' },
    { id: 4, name: 'Mental Health Alliance', description: 'Improving access to mental health resources', logo: '/npo_placeholder.png' },
    { id: 5, name: 'Urban Gardens', description: 'Creating sustainable community gardens in urban areas', logo: '/npo_placeholder.png' },
  ];

  // fetch event and nonprofit data
  useEffect(() => {
    if (!event_id) return;

    const fetchEventData = async () => {
      try {
        // In a real implementation, this would fetch from the backend
        // For now we'll use mock data
        setLoading(true);
        
        // Simulating API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock event data
        const mockEvent = {
          name: "Opportunity Hack 2025",
          description: "Annual hackathon for nonprofits",
          date: "2025"
        };
        
        setEventData(mockEvent);
        setNonprofits(mockNonprofits);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching event data:', err);
        setError('Failed to load event data. Please try again later.');
        setLoading(false);
      }
    };

    // Only fetch data if user is logged in
    if (user) {
      fetchEventData();
    } else {
      setLoading(false);
    }
  }, [event_id, user, apiServerUrl]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(nonprofits);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setNonprofits(items);
  };

  const handleTeamToggle = (event) => {
    setHasTeam(event.target.checked);
    if (!event.target.checked) {
      setTeamMembers([]);
    }
  };

  const handleAddTeamMember = () => {
    if (memberInput.trim() === '') return;
    
    // Check for duplicates
    if (teamMembers.includes(memberInput.trim())) {
      setError('This team member has already been added');
      return;
    }
    
    setTeamMembers([...teamMembers, memberInput.trim()]);
    setMemberInput('');
    setError('');
  };

  const handleRemoveTeamMember = (index) => {
    const newMembers = [...teamMembers];
    newMembers.splice(index, 1);
    setTeamMembers(newMembers);
  };

  const handleSubmit = async () => {
    // Validation
    if (nonprofits.length === 0) {
      setError('Please rank at least one nonprofit');
      return;
    }
    
    if (hasTeam && teamMembers.length === 0) {
      setError('Please add at least one team member');
      return;
    }

    if (hasTeam && !teamLeadConfirmed) {
      setError('Please confirm you are the designated team lead');
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare data for submission
      const rankings = nonprofits.map((nonprofit, index) => ({
        nonprofit_id: nonprofit.id,
        rank: index + 1
      }));
      
      const submissionData = {
        user_id: user.userId,
        event_id,
        rankings,
        has_team: hasTeam,
        team_members: hasTeam ? teamMembers : [],
        comments
      };
      
      // In a real implementation, this would be an API call
      console.log('Submitting data:', submissionData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess('Your nonprofit preferences have been submitted successfully!');
      setError('');
    } catch (err) {
      console.error('Error submitting preferences:', err);
      setError('Failed to submit preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // SEO metadata and descriptions
  const pageTitle = eventData 
    ? `Team Matching for ${eventData.name} - Opportunity Hack`
    : "Hackathon Team Matching - Opportunity Hack";
  const pageDescription = "Join our innovative team matching system for social good hackathons. Find the perfect nonprofit project match, form teams, and create technology solutions that make a real impact.";
  const canonicalUrl = `https://ohack.dev/hack/${event_id}/team-match`;

  // If not logged in, show login component
  if (!user) {
    return (
      <Container>
        <Head>
          <title>{pageTitle}</title>
          <meta name="description" content={pageDescription} />
          <meta name="keywords" content="hackathon team matching, form hackathon team, social good technology, nonprofit tech projects, opportunity hack team system, tech for good, hackathon process, find hackathon team" />
          <link rel="canonical" href={canonicalUrl} />
          
          {/* Open Graph tags */}
          <meta property="og:title" content={pageTitle} />
          <meta property="og:description" content={pageDescription} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={canonicalUrl} />
          <meta property="og:image" content="https://ohack.dev/images/opportunity-hack-social.png" />
          
          {/* Twitter Card tags */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={pageTitle} />
          <meta name="twitter:description" content={pageDescription} />
          <meta name="twitter:image" content="https://ohack.dev/images/opportunity-hack-social.png" />
        </Head>
        
        <Box my={8}>
          <Typography variant="h1" component="h1" sx={{ fontSize: '2.5rem', mb: 2, mt: 12 }}>
            Hackathon Team Matching System
          </Typography>
          <Typography variant="h2" component="h2" sx={{ fontSize: '1.5rem', mb: 3, color: 'text.secondary' }}>
            Create Technology Solutions for Social Good
          </Typography>
          <Typography variant="body1" paragraph>
            Our team matching system helps connect passionate technologists with nonprofit projects 
            that need your skills. Find the perfect team or project match for maximum impact.
          </Typography>
          <Typography variant="body1" gutterBottom>
            You need to login to access our hackathon team matching features
          </Typography>
          <LoginOrRegister 
            introText="Please log in to rank nonprofits for team matching" 
            previousPage={`/hack/${event_id}/team-match`} 
          />
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content="hackathon team matching, form hackathon team, social good technology, nonprofit tech projects, opportunity hack team system, tech for good, hackathon process, find hackathon team"
        />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph tags */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta
          property="og:image"
          content="https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp"
        />

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta
          name="twitter:image"
          content="https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp"
        />
      </Head>

      <Box  my={8}>
        <Typography
          variant="h1"
          component="h1"
          sx={{ fontSize: "2.5rem", mb: 2, mt: 12 }}
        >
          Team Matching for Social Good Hackathon
        </Typography>

        {loading && !error ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : error && !success ? (
          <Box my={4}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : success ? (
          <Box my={4}>
            <Typography color="primary">{success}</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push(`/hack/${event_id}`)}
              sx={{ mt: 2 }}
            >
              Return to Hackathon Page
            </Button>
          </Box>
        ) : (
          <Box>
            {eventData && (
              <Typography
                variant="h2"
                component="h2"
                sx={{ fontSize: "1.75rem", mb: 3 }}
              >
                {eventData.name} - {eventData.date}
              </Typography>
            )}

            <Box mb={4}>
              <Typography variant="body1" paragraph>
                Welcome to our innovative hackathon team matching system! This
                platform helps match participants with nonprofits based on
                shared interests and skills, maximizing your impact for social
                good.
              </Typography>
              <Typography variant="body1" paragraph>
                Rank the nonprofits below in order of your preference. Drag and
                drop to reorder them. Your choices will help us create balanced
                teams focused on making a real difference.
              </Typography>
            </Box>

            <Box mb={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={hasTeam}
                    onChange={handleTeamToggle}
                    color="primary"
                  />
                }
                label="I already have a team"
              />

              {hasTeam && (
                <Box mt={2}>
                  <Box
                    sx={{
                      p: 3,
                      mb: 4,
                      border: "2px solid #f44336",
                      borderRadius: 1,
                      bgcolor: "rgba(244, 67, 54, 0.08)",
                    }}
                  >
                    <Typography
                      variant="h5"
                      component="h5"
                      fontWeight="bold"
                      gutterBottom
                      color="error"
                    >
                      ⚠️ IMPORTANT: ONE SUBMISSION PER TEAM
                    </Typography>
                    <Typography variant="body1" paragraph>
                      <strong>Only one person (the team lead) should submit this form for your entire team.</strong> 
                      Multiple submissions from the same team will cause confusion in the matching process.
                    </Typography>
                    <Typography variant="body1" mb={3}>
                      Please coordinate with your team members to ensure only you, as the team lead, 
                      are submitting these preferences on behalf of everyone.
                    </Typography>
                    
                    <Box 
                      sx={{ 
                        p: 2, 
                        border: '1px solid #f44336', 
                        borderRadius: 1,
                        bgcolor: 'white'
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={teamLeadConfirmed}
                            onChange={(e) => setTeamLeadConfirmed(e.target.checked)}
                            color="error"
                          />
                        }
                        label={
                          <Typography fontWeight="bold">
                            I confirm I am the designated team lead and the ONLY person submitting preferences for my team
                          </Typography>
                        }
                      />
                    </Box>
                  </Box>

                  <Typography variant="subtitle1" gutterBottom>
                    As team lead, add your team members:
                  </Typography>
                  <Box display="flex" alignItems="center" mb={2}>
                    <TextField
                      label="Team member Slack handle"
                      variant="outlined"
                      size="small"
                      value={memberInput}
                      onChange={(e) => setMemberInput(e.target.value)}
                      fullWidth
                      error={!!error && error.includes("team member")}
                      helperText={
                        error && error.includes("team member") ? error : ""
                      }
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleAddTeamMember}
                      sx={{ ml: 2 }}
                    >
                      Add
                    </Button>
                  </Box>

                  {teamMembers.length > 0 && (
                    <List>
                      {teamMembers.map((member, index) => (
                        <ListItem
                          key={index}
                          secondaryAction={
                            <Button
                              size="small"
                              color="error"
                              onClick={() => handleRemoveTeamMember(index)}
                            >
                              Remove
                            </Button>
                          }
                        >
                          <ListItemText primary={member} />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              )}

              {!hasTeam && (
                <Box mt={2}>
                  <Typography variant="body2" color="textSecondary">
                    If you don't have a team, we'll match you with other
                    participants who share similar interests in making a
                    positive social impact through technology.
                  </Typography>
                </Box>
              )}
            </Box>

            <Typography
              variant="h3"
              component="h3"
              sx={{ fontSize: "1.5rem", mb: 2 }}
            >
              Nonprofit Rankings (Drag to reorder)
            </Typography>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="nonprofits">
                {(provided) => (
                  <Box {...provided.droppableProps} ref={provided.innerRef}>
                    {nonprofits.map((nonprofit, index) => (
                      <Draggable
                        key={nonprofit.id.toString()}
                        draggableId={nonprofit.id.toString()}
                        index={index}
                      >
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            sx={{
                              mb: 2,
                              boxShadow: 2,
                              "&:hover": {
                                boxShadow: 4,
                              },
                            }}
                          >
                            <CardContent>
                              <Box display="flex" alignItems="center">
                                <Box
                                  {...provided.dragHandleProps}
                                  sx={{ mr: 2, color: "text.secondary" }}
                                >
                                  <DragIndicatorIcon />
                                </Box>
                                <Box flexGrow={1}>
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    mb={1}
                                  >
                                    <Chip
                                      label={`#${index + 1}`}
                                      color="primary"
                                      size="small"
                                      sx={{ mr: 2 }}
                                    />
                                    <Typography variant="h6" component="h4">
                                      {nonprofit.name}
                                    </Typography>
                                  </Box>
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                  >
                                    {nonprofit.description}
                                  </Typography>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </DragDropContext>

            <Box mt={5}>
              <Typography
                variant="h3"
                component="h3"
                sx={{ fontSize: "1.5rem", mb: 2 }}
              >
                Additional Information
              </Typography>
              <TextField
                label="Additional Comments (Optional)"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                helperText="Add any additional information that might help us match you with the right nonprofit. Include your skills, interests, and how you hope to contribute to social good through technology."
              />
            </Box>

            <Box mt={4} mb={3}>
              <Typography
                variant="h4"
                component="h4"
                sx={{ fontSize: "1.25rem", mb: 2 }}
              >
                How Our Hackathon Team Matching Process Works
              </Typography>
              <Typography variant="body2" paragraph>
                Our unique team matching algorithm considers your nonprofit
                preferences, skills, and interests to create balanced teams that
                can make the biggest impact. This process ensures that every
                team has the right mix of developers, designers, and project
                managers to tackle complex social challenges.
              </Typography>
              <Typography variant="body2">
                After submissions close, our organizers will review all
                preferences and form teams optimized for success. You'll be
                notified about your team and nonprofit assignment before the
                hackathon begins.
              </Typography>
            </Box>

            <Box mt={4} display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleSubmit}
                disabled={loading || (hasTeam && !teamLeadConfirmed)}
              >
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  "Submit Preferences"
                )}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default TeamMatchPage;