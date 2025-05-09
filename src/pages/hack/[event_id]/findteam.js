import React, { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Box,
  Grid,
  Container,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Avatar,
  TextField,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Divider,
  IconButton,
  Tooltip,
  Rating,
  Autocomplete,
  Fade,
  Zoom,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { FaSlack, FaUsers, FaSearch, FaFilter, FaHeart, FaRocket, FaLink } from "react-icons/fa";
import { BsChatDots, BsPeople, BsArrowRight, BsStar, BsStarFill } from "react-icons/bs";
import axios from "axios";
import {
  useAuthInfo,
  RequiredAuthProvider,
  RedirectToLogin
} from "@propelauth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
}));

const ProfileCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 20px rgba(0, 0, 0, 0.15)',
  },
}));

const MatchScore = styled(Box)(({ theme, score }) => ({
  position: 'absolute',
  top: 10,
  right: 10,
  width: 45,
  height: 45,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 
    score >= 80 ? theme.palette.success.main :
    score >= 60 ? theme.palette.success.light :
    score >= 40 ? theme.palette.warning.light :
    theme.palette.grey[400],
  color: '#fff',
  fontWeight: 'bold',
  fontSize: '0.9rem',
  border: '2px solid #fff',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
}));

const InterestChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  fontWeight: 500,
}));

const SkillChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
}));

// Main component
const FindTeamPage = () => {
  // Authentication and routing
  const { user, accessToken, userClass } = useAuthInfo();
  const router = useRouter();
  const { event_id } = router.query;

  // State variables
  const [loading, setLoading] = useState(true);
  const [myProfile, setMyProfile] = useState(null);
  const [potentialTeammates, setPotentialTeammates] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);
  const [error, setError] = useState('');
  const [allInterests, setAllInterests] = useState([]);
  const [allSkills, setAllSkills] = useState([]);

  // Organization data for API calls
  const org = userClass.getOrgByName("Opportunity Hack Org");
  const orgId = org?.orgId;

  // Fetch current user's profile and application data
  const fetchMyProfile = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/users/profile`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-Org-Id": orgId,
          },
        }
      );

      if (response.data) {
        // Fetch my hacker application for this event
        const applicationResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/hacker/application/${event_id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
              "X-Org-Id": orgId,
            },
          }
        );

        if (applicationResponse.data) {
          // Process the application data to extract interests and skills
          const appData = applicationResponse.data.data;

          console.log("My application data:", appData);
          console.log("socialCauses:", appData.socialCauses);

          // Parse interests from social causes and preferred causes
          const interests = [];
          if (appData.socialCauses) {
            interests.push(...appData.socialCauses.split(/,\s*/));
          }
          if (appData.teamMatchingPreferences?.preferredCauses) {
            interests.push(...appData.teamMatchingPreferences.preferredCauses);
          } else if (appData.teamMatchingPreferredCauses) {
            interests.push(...appData.teamMatchingPreferredCauses.split(/,\s*/));
          }

          // Parse skills from primary roles and skills
          const skills = [];
          if (appData.primaryRoles) {
            skills.push(...appData.primaryRoles.split(/,\s*/));
          }
          if (appData.skills) {
            skills.push(...appData.skills.split(/,\s*/));
          }
          if (appData.teamMatchingPreferences?.preferredSkills) {
            skills.push(...appData.teamMatchingPreferences.preferredSkills);
          } else if (appData.teamMatchingPreferredSkills) {
            skills.push(...appData.teamMatchingPreferredSkills.split(/,\s*/));
          }

          // Get team formation status
          let teamFormation = 'want_to_be_matched';
          if (appData.teamStatus) {
            if (appData.teamStatus.includes('looking for')) {
              teamFormation = 'looking_for_members';
            } else if (appData.teamStatus.includes('already have')) {
              teamFormation = 'already_have_team';
            }
          }

          // Create processed application object
          const processedApp = {
            ...appData,
            interests: [...new Set(interests)], // Remove duplicates
            skills: [...new Set(skills)], // Remove duplicates
            background: appData.shortBio || appData.bio,
            team_formation: teamFormation
          };

          setMyProfile({
            ...response.data,
            application: processedApp,
          });
        } else {
          setMyProfile(response.data);
          setError("You haven't submitted a hacker application for this event yet. Some features may be limited.");
        }
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to fetch your profile. Please try again later.");
    }
  }, [accessToken, orgId, event_id]);

  // Fetch event details
  const fetchEventDetails = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${event_id}`
      );
      if (response.data) {
        setEventDetails(response.data);
      }
    } catch (err) {
      console.error("Error fetching event details:", err);
      setError("Failed to fetch event details.");
    }
  }, [event_id]);

  // Fetch all hackers for the event
  const fetchPotentialTeammates = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/hacker/applications/${event_id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-Org-Id": orgId,
          },
        }
      );

      if (response.data.data && Array.isArray(response.data.data)) {
        console.log("Potential teammates data:", response.data);
        // Process each hacker's application data
        const processedHackers = response.data.data.map(appData => {
          // Parse interests from social causes and preferred causes
          const interests = [];
          if (appData.socialCauses) {
            interests.push(...appData.socialCauses.split(/,\s*/));
          }
          if (appData.teamMatchingPreferences?.preferredCauses) {
            interests.push(...appData.teamMatchingPreferences.preferredCauses);
          } else if (appData.teamMatchingPreferredCauses) {
            interests.push(...appData.teamMatchingPreferredCauses.split(/,\s*/));
          }

          // Parse skills from primary roles and skills
          const skills = [];
          if (appData.primaryRoles) {
            skills.push(...appData.primaryRoles.split(/,\s*/));
          }
          if (appData.skills) {
            skills.push(...appData.skills.split(/,\s*/));
          }
          if (appData.teamMatchingPreferences?.preferredSkills) {
            skills.push(...appData.teamMatchingPreferences.preferredSkills);
          } else if (appData.teamMatchingPreferredSkills) {
            skills.push(...appData.teamMatchingPreferredSkills.split(/,\s*/));
          }

          // Get team formation status
          let teamFormation = 'want_to_be_matched';
          if (appData.teamStatus) {
            if (appData.teamStatus.includes('looking for')) {
              teamFormation = 'looking_for_members';
            } else if (appData.teamStatus.includes('already have')) {
              teamFormation = 'already_have_team';
            }
          }

          return {
            user_id: appData.user_id,
            name: appData.name,
            github: appData.github,
            slack_user_id: appData.slack_user_id,
            application: {
              ...appData,
              interests: [...new Set(interests)], // Remove duplicates
              skills: [...new Set(skills)], // Remove duplicates
              background: appData.shortBio || appData.bio,
              team_formation: teamFormation
            }
          };
        });

        // Only show users who are looking for a team or want to be matched
        const lookingForTeamHackers = processedHackers.filter(hacker =>
          hacker.application.teamStatus &&
          (hacker.application.teamStatus.includes('match') ||
           hacker.application.teamStatus.includes('looking for')) &&
          hacker.user_id !== user?.userId // Don't show the current user
        );

        setPotentialTeammates(lookingForTeamHackers);
        setFiltered(lookingForTeamHackers);

        // Extract all unique interests and skills
        const interests = new Set();
        const skills = new Set();

        lookingForTeamHackers.forEach(hacker => {
          if (hacker.application) {
            hacker.application.interests?.forEach(interest => interests.add(interest));
            hacker.application.skills?.forEach(skill => skills.add(skill));
          }
        });

        setAllInterests(Array.from(interests));
        setAllSkills(Array.from(skills));
      }
    } catch (err) {
      console.error("Error fetching hackers:", err);
      setError("Failed to fetch potential teammates. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, orgId, event_id, user?.userId]);

  // Load data on component mount
  useEffect(() => {
    if (accessToken && event_id) {
      setLoading(true);
      Promise.all([
        fetchMyProfile(),
        fetchEventDetails(),
        fetchPotentialTeammates()
      ]).finally(() => {
        setLoading(false);
      });
    }
  }, [accessToken, event_id, fetchMyProfile, fetchEventDetails, fetchPotentialTeammates]);

  // Load saved favorites from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFavorites = localStorage.getItem(`favorites_${event_id}`);
      if (savedFavorites) {
        try {
          setFavorites(JSON.parse(savedFavorites));
        } catch (e) {
          console.error("Error parsing saved favorites", e);
        }
      }
    }
  }, [event_id]);

  // Save favorites to localStorage
  useEffect(() => {
    if (favorites.length > 0 && typeof window !== 'undefined') {
      localStorage.setItem(`favorites_${event_id}`, JSON.stringify(favorites));
    }
  }, [favorites, event_id]);

  // Calculate match score between two users
  const calculateMatchScore = useCallback((otherUser) => {
    if (!myProfile?.application || !otherUser.application) return 0;
    
    let score = 0;
    const myInterests = myProfile.application.interests || [];
    const mySkills = myProfile.application.skills || [];
    const otherInterests = otherUser.application.interests || [];
    const otherSkills = otherUser.application.skills || [];
    
    // Match interests (higher weight)
    const commonInterests = myInterests.filter(i => otherInterests.includes(i));
    score += (commonInterests.length / Math.max(myInterests.length, 1)) * 60;
    
    // Match complementary skills
    const myUniqueSkills = mySkills.filter(s => !otherSkills.includes(s));
    const otherUniqueSkills = otherSkills.filter(s => !mySkills.includes(s));
    
    // Skill complementarity (lower weight)
    score += (myUniqueSkills.length + otherUniqueSkills.length) / 
             Math.max(mySkills.length + otherSkills.length, 1) * 40;
    
    // Cap at 100
    return Math.min(Math.round(score), 100);
  }, [myProfile]);

  // Filter teammates based on search and filters
  const filterTeammates = useCallback(() => {
    if (!potentialTeammates.length) return;
    
    let result = [...potentialTeammates];
    
    // Text search
    if (searchValue) {
      const lowerSearch = searchValue.toLowerCase();
      result = result.filter(mate => 
        mate.name?.toLowerCase().includes(lowerSearch) ||
        mate.github?.toLowerCase().includes(lowerSearch) ||
        mate.application?.background?.toLowerCase().includes(lowerSearch) ||
        mate.application?.interests?.some(i => i.toLowerCase().includes(lowerSearch)) ||
        mate.application?.skills?.some(s => s.toLowerCase().includes(lowerSearch))
      );
    }
    
    // Interest filters
    if (selectedInterests.length > 0) {
      result = result.filter(mate => 
        selectedInterests.every(interest => 
          mate.application?.interests?.includes(interest)
        )
      );
    }
    
    // Skill filters
    if (selectedSkills.length > 0) {
      result = result.filter(mate => 
        selectedSkills.some(skill => 
          mate.application?.skills?.includes(skill)
        )
      );
    }
    
    // Only show users who are looking for a team or to be matched
    result = result.filter(mate => 
      mate.application?.team_formation === 'looking_for_members' || 
      mate.application?.team_formation === 'want_to_be_matched'
    );
    
    // Don't show self
    result = result.filter(mate => mate.user_id !== user?.userId);
    
    // Sort by match score
    result.sort((a, b) => calculateMatchScore(b) - calculateMatchScore(a));
    
    setFiltered(result);
  }, [potentialTeammates, searchValue, selectedInterests, selectedSkills, calculateMatchScore, user]);

  // Apply filters when dependencies change
  useEffect(() => {
    filterTeammates();
  }, [filterTeammates, potentialTeammates, searchValue, selectedInterests, selectedSkills]);

  // Handle adding/removing favorites
  const toggleFavorite = (userId) => {
    setFavorites(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  // Open contact dialog
  const handleContactClick = (user) => {
    setSelectedUser(user);
    setContactDialogOpen(true);
  };

  // Filtered list based on active tab
  const currentList = selectedTab === 1 
    ? filtered.filter(mate => favorites.includes(mate.user_id))
    : filtered;

  // Navigate to team creation
  const createTeamWithFavorites = () => {
    const favoriteUsers = potentialTeammates.filter(mate => favorites.includes(mate.user_id));
    // Store in session storage to pre-fill the team creation form
    sessionStorage.setItem('team_members', JSON.stringify(favoriteUsers));
    router.push(`/hack/${event_id}/newteam`);
  };

  if (!user) {
    return (
      <CircularProgress />
    );
  }

  return (
    <Container maxWidth="lg">
      <Head>
        <title>Find Teammates - Opportunity Hack</title>
        <meta name="description" content="Connect with potential teammates who share your interests and complement your skills at Opportunity Hack." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://opportunity-hack.slack.com" />
      </Head>

      {/* Page Header */}
      <Box sx={{ pt: { xs: '80px', sm: '100px' }, pb: 4 }}>
        <Typography variant="h3" component="h1" align="center" gutterBottom>
          Find Your Dream Team <FaUsers style={{ verticalAlign: 'middle', marginLeft: '8px' }} />
        </Typography>
        <Typography variant="h6" align="center" color="textSecondary" paragraph>
          Connect with fellow hackers who share your interests and complement your skills.
        </Typography>

        {/* Error message if needed */}
        {error && (
          <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Link to team creation if they've found their teammates */}
        {favorites.length > 0 && (
          <Zoom in={favorites.length > 0}>
            <Box textAlign="center" mt={3} mb={3}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                endIcon={<BsArrowRight />}
                onClick={createTeamWithFavorites}
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: 2,
                  boxShadow: 3,
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-3px)', boxShadow: 4 }
                }}
              >
                Create a team with your {favorites.length} favorite {favorites.length === 1 ? 'teammate' : 'teammates'}
              </Button>
            </Box>
          </Zoom>
        )}
      </Box>

      {/* Main content area */}
      <Grid container spacing={4}>
        {/* Left sidebar - Your profile */}
        <Grid item xs={12} md={4}>
          <StyledPaper>
            <Typography variant="h5" gutterBottom>
              Your Profile
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    src={myProfile?.picture} 
                    alt={myProfile?.name}
                    sx={{ width: 60, height: 60, mr: 2 }}
                  />
                  <Box>
                    <Typography variant="h6">{myProfile?.name}</Typography>
                    {myProfile?.github && (
                      <Typography 
                        variant="body2" 
                        color="textSecondary"
                        sx={{ display: 'flex', alignItems: 'center' }}
                      >
                        GitHub: {myProfile.github}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {myProfile?.application ? (
                  <>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                      Team Status:
                    </Typography>
                    <Chip
                      label={myProfile.application.team_formation === 'looking_for_members' 
                        ? 'Looking for Team Members' 
                        : myProfile.application.team_formation === 'want_to_be_matched'
                          ? 'Want to be Matched'
                          : myProfile.application.team_formation === 'already_have_team'
                            ? 'Already have a Team'
                            : 'Unknown'
                      }
                      color={myProfile.application.team_formation === 'already_have_team' ? 'default' : 'primary'}
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />

                    {myProfile.application.background && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Your Background:
                        </Typography>
                        <Typography variant="body2" paragraph>
                          {myProfile.application.background}
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Your Interests:
                      </Typography>
                      <Box>
                        {myProfile.application.interests && myProfile.application.interests.length > 0 ? (
                          myProfile.application.interests.map(interest => (
                            <InterestChip key={interest} label={interest} size="small" />
                          ))
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            No interests specified
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Your Skills:
                      </Typography>
                      <Box>
                        {myProfile.application.skills && myProfile.application.skills.length > 0 ? (
                          myProfile.application.skills.map(skill => (
                            <SkillChip key={skill} label={skill} size="small" />
                          ))
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            No skills specified
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </>
                ) : (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    You haven't completed a hacker application for this event.
                    <Button 
                      component={Link}
                      href={`/hack/${event_id}/hacker-application`}
                      variant="outlined" 
                      size="small" 
                      sx={{ mt: 1, display: 'block' }}
                    >
                      Complete Application
                    </Button>
                  </Alert>
                )}

                <Box sx={{ mt: 3 }}>
                  <Button
                    component="a"
                    href="https://opportunity-hack.slack.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<FaSlack />}
                    variant="outlined"
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    Join Slack Workspace
                  </Button>

                  <Button
                    component={Link}
                    href={`/hack/${event_id}/newteam`}
                    startIcon={<FaRocket />}
                    variant="contained"
                    fullWidth
                  >
                    Create a Team
                  </Button>
                </Box>
              </>
            )}
          </StyledPaper>
        </Grid>

        {/* Right content area - Potential teammates */}
        <Grid item xs={12} md={8}>
          <StyledPaper>
            <Tabs
              value={selectedTab}
              onChange={(e, newValue) => setSelectedTab(newValue)}
              indicatorColor="primary"
              textColor="primary"
              sx={{ mb: 3 }}
            >
              <Tab 
                label="All Potential Teammates" 
                icon={<BsPeople />} 
                iconPosition="start"
              />
              <Tab 
                label={`Favorites (${favorites.length})`} 
                icon={<FaHeart />} 
                iconPosition="start" 
                disabled={favorites.length === 0}
              />
            </Tabs>

            {/* Filters and search */}
            <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search by name, skill, or interest..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                InputProps={{
                  startAdornment: <FaSearch style={{ marginRight: 8 }} />,
                }}
                size="small"
              />
              
              <Autocomplete
                multiple
                options={allInterests}
                value={selectedInterests}
                onChange={(e, newValue) => setSelectedInterests(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder="Filter by interests"
                    size="small"
                  />
                )}
                sx={{ minWidth: 200 }}
              />
              
              <Autocomplete
                multiple
                options={allSkills}
                value={selectedSkills}
                onChange={(e, newValue) => setSelectedSkills(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder="Filter by skills"
                    size="small"
                  />
                )}
                sx={{ minWidth: 200 }}
              />
            </Box>

            {/* Teammate listing */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
              </Box>
            ) : currentList.length === 0 ? (
              <Alert severity="info" sx={{ mt: 4 }}>
                {selectedTab === 0 
                  ? "No potential teammates found. Try adjusting your filters."
                  : "You haven't saved any favorites yet."}
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {currentList.map((teammate) => {
                  const matchScore = calculateMatchScore(teammate);
                  return (
                    <Grid item xs={12} sm={6} key={teammate.user_id}>
                      <ProfileCard>
                        <CardContent sx={{ position: 'relative', flexGrow: 1 }}>
                          <MatchScore score={matchScore}>
                            {matchScore}%
                          </MatchScore>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar
                              src={teammate.picture}
                              alt={teammate.name || 'User'}
                              sx={{ width: 50, height: 50, mr: 2 }}
                            />
                            <Box>
                              <Typography variant="h6" component="div">
                                {teammate.name || 'Anonymous User'}
                              </Typography>
                              {teammate.github && (
                                <Typography variant="body2" color="text.secondary">
                                  GitHub: {teammate.github}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          
                          <Divider sx={{ mb: 1.5 }} />
                          
                          {teammate.application?.team_formation && (
                            <Box sx={{ mb: 1.5 }}>
                              <Chip
                                size="small"
                                label={
                                  teammate.application.team_formation === 'looking_for_members'
                                    ? 'Looking for Team Members'
                                    : 'Want to be Matched'
                                }
                                color="primary"
                                variant="outlined"
                              />
                            </Box>
                          )}
                          
                          {teammate.application?.background && (
                            <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 1.5 }}>
                              {teammate.application.background.length > 100
                                ? `${teammate.application.background.substring(0, 100)}...`
                                : teammate.application.background}
                            </Typography>
                          )}
                          
                          {teammate.application?.interests?.length > 0 && (
                            <Box sx={{ mb: 1.5 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Interests:
                              </Typography>
                              <Box>
                                {teammate.application.interests.slice(0, 3).map((interest) => (
                                  <InterestChip
                                    key={interest}
                                    label={interest}
                                    size="small"
                                    variant={myProfile?.application?.interests?.includes(interest) ? "filled" : "outlined"}
                                    color={myProfile?.application?.interests?.includes(interest) ? "primary" : "default"}
                                  />
                                ))}
                                {teammate.application.interests.length > 3 && (
                                  <Chip
                                    label={`+${teammate.application.interests.length - 3} more`}
                                    size="small"
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                            </Box>
                          )}
                          
                          {teammate.application?.skills?.length > 0 && (
                            <Box>
                              <Typography variant="subtitle2" gutterBottom>
                                Skills:
                              </Typography>
                              <Box>
                                {teammate.application.skills.slice(0, 3).map((skill) => (
                                  <SkillChip
                                    key={skill}
                                    label={skill}
                                    size="small"
                                    variant={myProfile?.application?.skills?.includes(skill) ? "filled" : "outlined"}
                                  />
                                ))}
                                {teammate.application.skills.length > 3 && (
                                  <Chip
                                    label={`+${teammate.application.skills.length - 3} more`}
                                    size="small"
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                            </Box>
                          )}
                        </CardContent>
                        
                        <CardActions sx={{ pt: 0 }}>
                          <Button
                            size="small"
                            startIcon={<BsChatDots />}
                            onClick={() => handleContactClick(teammate)}
                          >
                            Contact
                          </Button>
                          <Button
                            size="small"
                            startIcon={favorites.includes(teammate.user_id) ? <BsStarFill /> : <BsStar />}
                            color={favorites.includes(teammate.user_id) ? "warning" : "primary"}
                            onClick={() => toggleFavorite(teammate.user_id)}
                          >
                            {favorites.includes(teammate.user_id) ? 'Favorited' : 'Favorite'}
                          </Button>
                        </CardActions>
                      </ProfileCard>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </StyledPaper>
        </Grid>
      </Grid>

      {/* Contact Dialog */}
      <Dialog
        open={contactDialogOpen}
        onClose={() => setContactDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Contact {selectedUser?.name || 'Team Member'}
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  src={selectedUser.picture}
                  alt={selectedUser.name}
                  sx={{ width: 60, height: 60, mr: 2 }}
                />
                <Box>
                  <Typography variant="h6">{selectedUser.name}</Typography>
                  {selectedUser.github && (
                    <Typography variant="body2" color="textSecondary">
                      GitHub: {selectedUser.github}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Alert severity="info" sx={{ mb: 3 }}>
                To connect with this hacker, you can reach out via Slack. All Opportunity Hack participants are part of our Slack workspace.
              </Alert>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Contact Information:
                </Typography>
                <Button
                  startIcon={<FaSlack />}
                  variant="contained"
                  color="primary"
                  href="https://opportunity-hack.slack.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Open Slack
                </Button>

                <Typography variant="body2" paragraph>
                  <strong>Suggested message:</strong>
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="body2">
                    Hi {selectedUser.name?.split(' ')[0] || 'there'}! I found your profile on the Opportunity Hack team finder. I'm interested in collaborating for the {eventDetails?.title || 'hackathon'}. Would you be open to chatting about potentially forming a team?
                  </Typography>
                </Paper>
                <Button
                  size="small"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `Hi ${selectedUser.name?.split(' ')[0] || 'there'}! I found your profile on the Opportunity Hack team finder. I'm interested in collaborating for the ${eventDetails?.title || 'hackathon'}. Would you be open to chatting about potentially forming a team?`
                    );
                  }}
                  sx={{ mt: 1 }}
                >
                  Copy to clipboard
                </Button>
              </Box>

              <Typography variant="subtitle1" gutterBottom>
                Why you should connect:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {/* Match details */}
                {myProfile?.application?.interests?.some(interest => 
                  selectedUser.application?.interests?.includes(interest)
                ) && (
                  <Chip 
                    label="Shared Interests" 
                    color="primary" 
                    size="small" 
                    icon={<FaHeart />} 
                  />
                )}
                
                {myProfile?.application?.skills?.some(skill => 
                  !selectedUser.application?.skills?.includes(skill)
                ) && (
                  <Chip 
                    label="Complementary Skills" 
                    color="secondary" 
                    size="small" 
                    icon={<FaLink />} 
                  />
                )}
                
                {calculateMatchScore(selectedUser) >= 70 && (
                  <Chip 
                    label="High Match Score" 
                    color="success" 
                    size="small" 
                    icon={<BsStarFill />} 
                  />
                )}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContactDialogOpen(false)}>
            Close
          </Button>
          {selectedUser && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                toggleFavorite(selectedUser.user_id);
                setContactDialogOpen(false);
              }}
            >
              {favorites.includes(selectedUser.user_id) 
                ? 'Remove from Favorites' 
                : 'Add to Favorites'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

// Authenticated component that uses auth context
const AuthenticatedFindTeam = () => {
  const { user } = useAuthInfo();
  return <FindTeamPage />;
};

// Export the component with RequiredAuthProvider
const FindTeam = () => {
  const router = useRouter();
  const { event_id } = router.query;

  // Create the current URL for redirection
  const currentUrl = typeof window !== 'undefined' && event_id
    ? `${window.location.origin}/hack/${event_id}/findteam`
    : null;

  return (
    <RequiredAuthProvider
      authUrl={process.env.NEXT_PUBLIC_REACT_APP_AUTH_URL}
      displayIfLoggedOut={
        <RedirectToLogin
          postLoginRedirectUrl={currentUrl || window.location.href}
        />
      }
    >
      <AuthenticatedFindTeam />
    </RequiredAuthProvider>
  );
};

export default FindTeam;