import React, { useState, useEffect } from 'react';
import { useAuthInfo } from '@propelauth/react';
import { 
  Typography, 
  FormControl, 
  TextField, 
  InputLabel, 
  MenuItem, 
  Select,
  Checkbox,
  FormControlLabel,
  ListItemText,
  Button,
  Stack,
  Link,
  useTheme,
  useMediaQuery,
  Paper,
  Grid,
  Divider,
  Box,
  CircularProgress,
  Skeleton,
  Tabs,
  Tab
} from "@mui/material";
import useProfileApi from "../../hooks/use-profile-api.js";
import usePrivacySettings from "../../hooks/use-privacy-settings.js";
import BadgeList from "../../components/badge-list";
import ProfileHackathonList from "../../components/profile-hackathon-list";
import FeedbackLite from "../../components/feedback-lite";
import PrivacyToggle from "../../components/PrivacyToggle/PrivacyToggle";
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LoginOrRegister from '../LoginOrRegister/LoginOrRegister2';
import HeartGauge from '../HeartGauge/HeartGauge';
import PersonIcon from '@mui/icons-material/Person';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GitHubIcon from '@mui/icons-material/GitHub';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

import GitHubContributions from './GitHubContribution';
import ShareableGitHubContributions from './ShareableGitHubContributions';
import RaffleEntries from './RaffleEntries';
import CustomSelect from './CustomSelect';
import HelpUsBuildOHack from "../HelpUsBuildOHack/HelpUsBuildOHack";
import { initFacebookPixel, trackEvent, set } from '../../lib/ga';
import Head from "next/head";
import Moment from "react-moment";
import { useRouter } from 'next/router';
import {
  InnerContainer,
  LayoutContainer,
  ProfileAvatar,
  ProfileButton,
  ProfileContainer,
  ProfileDetailText,
  ProfileHeader,
  ProfileHeadline,
} from "../../styles/profile/styles";



// Tab panel component for displaying tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// A11y props for tabs
function a11yProps(index) {
  return {
    id: `profile-tab-${index}`,
    'aria-controls': `profile-tabpanel-${index}`,
  };
}

export default function Profile(props) {
  const { isLoggedIn, user } = useAuthInfo();
  const { badges, hackathons, profile, feedback_url, update_profile_metadata, isLoading } =
    useProfileApi({});
  const { privacySettings, togglePrivacySetting, isLoading: privacyLoading } = usePrivacySettings();
  const theme = useTheme();
  const [githubHistory, setGithubHistory] = useState([]);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [isSaving, setIsSaving] = useState({});
  const router = useRouter();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Tab state
  const [activeTab, setActiveTab] = useState(0);

  const [role, setRole] = React.useState("");
  const [expertise, setExpertise] = React.useState([]);
  const [education, setEducation] = React.useState("");
  const [shirtSize, setShirtSize] = React.useState("");
  const [linkedInUrl, setLinkedInUrl] = React.useState("");
  const [instagramUrl, setInstagramUrl] = React.useState("");
  const [why, setWhy] = React.useState("");
  const [github, setGithub] = React.useState("");
  const [lastGithubUpdate, setLastGithubUpdate] = React.useState(0);

  const [lastCompanyUpdate, setLastCompanyUpdate] = React.useState(0);
  const [lastWhyUpdate, setLastWhyUpdate] = React.useState(0);
  const [company, setCompany] = React.useState("");
  
  // Address fields
  const [streetAddress, setStreetAddress] = React.useState("");
  const [streetAddress2, setStreetAddress2] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("");
  const [postalCode, setPostalCode] = React.useState("");
  const [country, setCountry] = React.useState("United States");
  const [lastAddressUpdate, setLastAddressUpdate] = React.useState(0);
  
  // Sticker preference
  const [wantStickers, setWantStickers] = React.useState(false);

  // Update profile data from the backend
  React.useEffect(() => {
    if (!profile) {
      return;
    }

    console.log("Profile data", profile);
    setInstagramUrl(profile?.instagram_url);
    setLinkedInUrl(profile?.linkedin_url);
    setRole(profile?.role);
    setEducation(profile?.education);
    setShirtSize(profile?.shirt_size || "");
    setWhy(profile?.why);
    setGithub(profile?.github);
    setCompany(profile?.company);

    // Set address fields
    setStreetAddress(profile?.street_address || "");
    setStreetAddress2(profile?.street_address_2 || "");
    setCity(profile?.city || "");
    setState(profile?.state || "");
    setPostalCode(profile?.postal_code || "");
    setCountry(profile?.country || "United States");
    
    // Set sticker preference
    setWantStickers(profile?.want_stickers || false);

    if (profile?.expertise) {
      setExpertise(profile?.expertise);
    }

    initFacebookPixel();

    if (user && user.email) {
      set(user.email);
    }
  }, [profile]);

  // Load tab from URL hash if present
  useEffect(() => {
    // Map hash to tab index
    const hashTabMap = {
      '#basic': 0,
      '#impact': 1,
      '#github': 2,
      '#swag': 3,
      '#volunteer': 4,
      '#giveaways': 5
    };
    
    if (router.asPath.includes('#')) {
      const hash = router.asPath.split('#')[1];
      const formattedHash = `#${hash}`;
      
      if (hashTabMap[formattedHash] !== undefined) {
        setActiveTab(hashTabMap[formattedHash]);
      }
    }
  }, [router.asPath]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    const tabNames = ['basic', 'impact', 'github', 'swag', 'volunteer', 'giveaways'];
    trackEvent({ action: 'profile_tab_change', params: { event_label: tabNames[newValue], page: 'profile' } });

    // Update URL hash based on tab
    const tabHashMap = {
      0: 'basic',
      1: 'impact',
      2: 'github',
      3: 'swag',
      4: 'volunteer',
      5: 'giveaways'
    };
    
    const hash = tabHashMap[newValue];
    
    // Update URL without full page reload
    router.push(`/profile#${hash}`, undefined, { shallow: true });
  };

  useEffect(() => {
    if (github) {
      const github_history_url = `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/profile/github/${github}`;
      
      setIsGithubLoading(true);
      fetch(github_history_url)
        .then((response) => response.json())
        .then((data) => {          
          setGithubHistory(data.github_history || []);
        })
        .catch((error) => {
          console.error("Error fetching GitHub history", error);
        })
        .finally(() => {
          setIsGithubLoading(false);
        });
    }
  }, [github]);
  
  const expertiseOptions = [
  { value: "Software Engineering", label: "Software Engineering" },
  { value: "Software Engineering: Front-end", label: "Software Engineering: Front-end (CSS/JS, Node, Angular, React, etc)" },
  { value: "Software Engineering: Back-end", label: "Software Engineering: Back-end (Java, Python, Ruby, etc)" },
  { value: "Software Engineering: Mobile", label: "Software Engineering: Mobile (iOS, Android)" },
  { value: "Software Engineering: Data Science & Machine Learning", label: "Software Engineering: Data Science & Machine Learning" },
  { value: "DevOps", label: "DevOps: AWS, Fly.io, Google Cloud, Heroku" },
  { value: "GitHub ninja", label: "GitHub ninja" },
  { value: "Product Management", label: "Product Management" },
  { value: "Project Manager", label: "Project Manager" },
  { value: "User Experience", label: "User Experience" },
  { value: "Data Science", label: "Data Science" },
  { value: "Data Analysis", label: "Data Analysis" },
  { value: "Nonprofit Mindset", label: "Nonprofit Mindset" },
  { value: "Marketing", label: "Marketing" },
  { value: "Business", label: "Business" },
  { value: "Finance", label: "Finance" },
];

  const onRoleChange = (event) => {
    // Call the API to save the user's profile
    console.log("Save to backend", event.target.value);

    setIsSaving({...isSaving, role: true});
    const onComplete = () => {
      console.log("Profile role updated");
      setIsSaving({...isSaving, role: false});
    };

    update_profile_metadata({ role: event.target.value }, onComplete);

    setRole(event.target.value);
  };

  const handleExpertiseChange = (event) => {
    const {
      target: { value },
    } = event;

    // On autofill we get the stringified value.
    const toSet = typeof value === "string" ? value.split(",") : value;

    setExpertise(toSet);

    // Call the API to save the user's profile
    console.log("Save to backend", {
      toSet,
    });

    const onComplete = () => {
      console.log("Profile expertise updated");
    };

    update_profile_metadata({ expertise: toSet }, onComplete);
  };

  const handleEducationChange = (event) => {
    // Call the API to save the user's profile
    console.log("Save to backend", event.target.value);

    setIsSaving({...isSaving, education: true});
    const onComplete = () => {
      console.log("Profile education updated");
      setIsSaving({...isSaving, education: false});
    };

    update_profile_metadata({ education: event.target.value }, onComplete);

    setEducation(event.target.value);
  };

  const handleShirtSizeChange = (event) => {
    // Call the API to save the user's profile
    console.log("Save to backend shirt size:", event.target.value);

    setIsSaving({...isSaving, shirtSize: true});
    const onComplete = () => {
      console.log("Profile shirt size updated");
      setIsSaving({...isSaving, shirtSize: false});
    };

    update_profile_metadata({ shirt_size: event.target.value }, onComplete);

    setShirtSize(event.target.value);
  };

  const handleCompanyChange = (event) => {
    // Since company is a text field, wait a few seconds for the user to type before calling to save
    // Call the API to save the user's profile
    console.log("Save to backend", event.target.value);

    const onComplete = () => {
      console.log("Profile company updated");
    };

    // To prevent too many calls to the backend we'll wait a few seconds before calling the API
    // This is a common pattern to prevent too many calls to the backend
    // This is called "debouncing"
    setCompany(event.target.value);

    // Clear the last timeout
    clearTimeout(lastCompanyUpdate);

    // Set a new timeout
    setLastCompanyUpdate(
      setTimeout(() => {
        update_profile_metadata({ company: event.target.value }, onComplete);
      }, 2000)
    );
  };

  const handleGithubChange = (event) => {
    // Since company is a text field, wait a few seconds for the user to type before calling to save
    // Call the API to save the user's profile
    console.log("Save to backend", event.target.value);

    const onComplete = () => {
      console.log("GitHub updated");
    };

    // To prevent too many calls to the backend we'll wait a few seconds before calling the API
    // This is a common pattern to prevent too many calls to the backend
    // This is called "debouncing"
    setGithub(event.target.value);

    // Clear the last timeout
    clearTimeout(lastGithubUpdate);

    // Set a new timeout
    setLastGithubUpdate(
      setTimeout(() => {
        update_profile_metadata({ github: event.target.value }, onComplete);
      }, 2000)
    );
  };

  const handleWhyChange = (event) => {
    // Since company is a text field, wait a few seconds for the user to type before calling to save
    // Call the API to save the user's profile
    console.log("Save to backend", event.target.value);

    const onComplete = () => {
      console.log("Why updated");
    };

    // To prevent too many calls to the backend we'll wait a few seconds before calling the API
    // This is a common pattern to prevent too many calls to the backend
    // This is called "debouncing"
    setWhy(event.target.value);

    // Clear the last timeout
    clearTimeout(lastWhyUpdate);

    // Set a new timeout
    setLastWhyUpdate(
      setTimeout(() => {
        update_profile_metadata({ why: event.target.value }, onComplete);
      }, 2000)
    );
  };

  const handleLinkedInChange = (event) => {
    // Call the API to save the user's profile
    console.log("Save to backend", event.target.value);

    const onComplete = () => {
      console.log("LinkedIn updated");
    };

    setLinkedInUrl(event.target.value);

    update_profile_metadata({ linkedin_url: event.target.value }, onComplete);
  }

  const handleInstagramChange = (event) => {
    // Call the API to save the user's profile
    console.log("Save to backend", event.target.value);

    const onComplete = () => {
      console.log("Instagram updated");
    };

    setInstagramUrl(event.target.value);

    update_profile_metadata({ instagram_url: event.target.value }, onComplete);
  }
  
  // Address field handlers with debouncing
  const handleAddressChange = (field, setter) => (event) => {
    setter(event.target.value);
    
    // Clear the last timeout
    clearTimeout(lastAddressUpdate);
    
    // Set a new timeout to update all address fields at once
    setLastAddressUpdate(
      setTimeout(() => {
        const addressData = {
          street_address: field === "street_address" ? event.target.value : streetAddress,
          street_address_2: field === "street_address_2" ? event.target.value : streetAddress2,
          city: field === "city" ? event.target.value : city,
          state: field === "state" ? event.target.value : state,
          postal_code: field === "postal_code" ? event.target.value : postalCode,
          country: field === "country" ? event.target.value : country,
        };
        
        const onComplete = () => {
          console.log("Address updated");
        };
        
        update_profile_metadata(addressData, onComplete);
      }, 2000)
    );
  };
  
  // Sticker preference handler
  const handleStickersChange = (event) => {
    const checked = event.target.checked;
    setWantStickers(checked);
    
    const onComplete = () => {
      console.log("Sticker preference updated");
    };
    
    update_profile_metadata({ want_stickers: checked }, onComplete);
  };

  const roleOptions = [
    { value: "", label: "Select a role" },
    { value: "hacker_in_school", label: "Hacker (In School)" },
    { value: "hacker_pro", label: "Hacker (working in industry)" },
    { value: "mentor", label: "Mentor" },
    { value: "volunteer", label: "Volunteer" },
    { value: "judge", label: "Judge" },
    { value: "nonprofit", label: "Nonprofit" },
    { value: "sponsor", label: "Sponsor" },
    { value: "organizer", label: "Organizer" }
  ];

  const educationOptions = [
    { value: "", label: "Select a level of education" },
    { value: "high-school", label: "High School" },
    { value: "some-college", label: "Some College" },
    { value: "completed-undergraduate-school", label: "Completed Undergraduate" },
    { value: "some-graduate-school", label: "Some Graduate School" },
    { value: "completed-graduate-school", label: "Completed Graduate School" },
    { value: "coding-bootcamp", label: "Some Coding Bootcamp" },
    { value: "completed-coding-bootcamp", label: "Completed Coding Bootcamp" },
    { value: "other", label: "Other" }
  ];

  

  const shirtSizeOptions = [
    { value: "", label: "Select a shirt size" },
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
    { value: "x-large", label: "X-Large" },
    { value: "xx-large", label: "XX-Large" },
    { value: "xxx-large", label: "XXX-Large" }
  ];
  
  const countryOptions = [
    { value: "United States", label: "United States" },
    { value: "Canada", label: "Canada" },
    { value: "Mexico", label: "Mexico" },
    { value: "United Kingdom", label: "United Kingdom" },
    { value: "Australia", label: "Australia" },
    { value: "India", label: "India" },
    { value: "Other", label: "Other" }
  ];

  const style = {
    fontSize: 14,
  };

  // Loading component for form fields
  const LoadingOverlay = ({ isLoading, field, children }) => {
    if (isSaving[field]) {
      return (
        <Box sx={{ position: 'relative' }}>
          {children}
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            right: 10, 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center' 
          }}>
            <CircularProgress size={20} />
          </Box>
        </Box>
      );
    }
    return children;
  };

  if (!isLoggedIn) {
    return (
      <LayoutContainer mt={5}>
        <Typography variant="h4">You must be logged in to view this page.</Typography>
        <LoginOrRegister introText="Ready to join us?" previousPage="/profile" />
      </LayoutContainer>
    );
  }

  return (
    <LayoutContainer container>
      <InnerContainer container sx={{ maxWidth: '100%', overflowX: 'hidden' }}>
        <Head>
          <title>Profile - Opportunity Hack Developer Portal</title>
        </Head>
        
        {isLoggedIn ? (
          <ProfileContainer sx={{ width: '100%', maxWidth: '100%', px: isMobile ? 2 : 4 }}>
            {/* Header Section */}
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 4, borderRadius: 2 }}>
              {isLoading ? (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Skeleton variant="circular" width={80} height={80} sx={{ mr: 2 }} />
                    <Box>
                      <Skeleton variant="text" width={250} height={60} />
                      <Skeleton variant="text" width={180} height={20} />
                      <Skeleton variant="text" width={150} height={20} />
                    </Box>
                  </Box>
                </>
              ) : (
                <>
                  <ProfileHeader container
                    sx={{
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'center', sm: 'flex-start' },
                      textAlign: { xs: 'center', sm: 'left' },
                    }}
                  >
                    <ProfileAvatar
                      src={user?.pictureUrl}
                      alt="Profile"
                      width={isMobile ? 64 : 80}
                      height={isMobile ? 64 : 80}
                    />
                    <ProfileHeadline>
                      <Typography
                        variant="h2"
                        sx={{
                          fontWeight: 600,
                          fontSize: isMobile ? "1.6rem" : "3rem",
                          marginBottom: "0.5rem",
                          wordBreak: 'break-word',
                        }}
                      >
                        {user?.firstName} {user?.lastName}{" "}
                        <VerifiedUserIcon color="success" fontSize={isMobile ? "medium" : "large"} />
                      </Typography>
                      <ProfileDetailText sx={{ fontSize: isMobile ? "0.9rem" : "1.4rem" }}>
                        {user?.email}
                      </ProfileDetailText>
                      <ProfileDetailText sx={{ fontSize: isMobile ? "0.9rem" : "1.4rem" }}>
                        Member since: <Moment fromNow>{user?.createdAt * 1000}</Moment>
                      </ProfileDetailText>
                    </ProfileHeadline>
                  </ProfileHeader>
                  
                  <Box sx={{
                    mt: 2,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'stretch', sm: 'center' },
                    flexWrap: 'wrap',
                    gap: 2
                  }}>
                    <Link href={profile.profile_url} style={{ textDecoration: 'none' }}>
                      <Button variant="contained" color="primary" fullWidth={isMobile}>
                        See Your Public Profile
                      </Button>
                    </Link>
                    
                    <HeartGauge history={profile.history} />
                  </Box>
                </>
              )}
            </Paper>
            
            {/* Tab Navigation */}
            <Paper elevation={3} sx={{ p: 0, mb: 4, borderRadius: 2 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                  value={activeTab} 
                  onChange={handleTabChange} 
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                  aria-label="profile tabs"
                  sx={{ 
                    backgroundColor: theme.palette.primary.light,
                    borderRadius: '8px 8px 0 0',
                    '& .MuiTab-root': {
                      color: theme.palette.common.white,
                      opacity: 0.7,
                      minWidth: { xs: 60, sm: 90 },
                      px: { xs: 1, sm: 2 },
                      '&.Mui-selected': {
                        color: theme.palette.common.white,
                        opacity: 1,
                        fontWeight: 'bold'
                      }
                    }
                  }}
                >
                  <Tab 
                    icon={<PersonIcon />} 
                    label={isMobile ? undefined : "Basic Info"}
                    title="Basic Info"
                    {...a11yProps(0)} 
                  />
                  <Tab 
                    icon={<EmojiEventsIcon />} 
                    label={isMobile ? undefined : "Impact"}
                    title="Impact"
                    {...a11yProps(1)} 
                  />
                  <Tab 
                    icon={<GitHubIcon />} 
                    label={isMobile ? undefined : "GitHub"}
                    title="GitHub"
                    {...a11yProps(2)} 
                  />
                  <Tab 
                    icon={<LocalShippingIcon />} 
                    label={isMobile ? undefined : "Swag & Shipping"}
                    title="Swag & Shipping"
                    {...a11yProps(3)} 
                  />
                  <Tab 
                    icon={<VolunteerActivismIcon />} 
                    label={isMobile ? undefined : "Volunteer History"}
                    title="Volunteer History"
                    {...a11yProps(4)} 
                  />
                  <Tab 
                    icon={<CardGiftcardIcon />} 
                    label={isMobile ? undefined : "Giveaway Entries"}
                    title="Giveaway Entries"
                    {...a11yProps(5)} 
                  />
                </Tabs>
              </Box>
              
              <Box sx={{ p: { xs: 2, sm: 3 } }}>
                {/* Basic Information Tab */}
                <TabPanel value={activeTab} index={0}>
                  <Typography variant="h4" sx={{ mb: 3, fontWeight: 500, fontSize: { xs: '1.4rem', sm: '2.125rem' } }}>
                    Basic Information
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    Tell us more about yourself and why you're here with Opportunity Hack.
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      {isLoading ? (
                        <Skeleton variant="rectangular" height={56} />
                      ) : (
                        <LoadingOverlay isLoading={isLoading} field="role">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CustomSelect
                              label="What hat are you currently wearing?"
                              value={role}
                              onChange={onRoleChange}
                              options={roleOptions}
                              id="role-select"
                              sx={{ flex: 1 }}
                            />
                            <PrivacyToggle
                              field="role"
                              isPrivate={privacySettings.role !== 'public'}
                              onToggle={togglePrivacySetting}
                              size="small"
                              disabled={privacyLoading}
                            />
                          </Box>
                        </LoadingOverlay>
                      )}
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FormControl fullWidth>            
                          <TextField
                            id="github"
                            onChange={handleGithubChange}
                            label="GitHub username (not email)"
                            value={github || ""}
                            fullWidth
                            variant="outlined"
                            InputLabelProps={{ shrink: Boolean(github) }}
                          />
                        </FormControl>
                        <PrivacyToggle
                          field="github"
                          isPrivate={privacySettings.github !== 'public'}
                          onToggle={togglePrivacySetting}
                          size="small"
                          disabled={privacyLoading}
                        />
                      </Box>
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      {isLoading ? (
                        <Skeleton variant="rectangular" height={56} />
                      ) : (
                        <LoadingOverlay isLoading={isLoading} field="education">
                          <CustomSelect
                            label="Level of Education"
                            value={education}
                            onChange={handleEducationChange}
                            options={educationOptions}
                            id="education-select"
                          />
                        </LoadingOverlay>
                      )}
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FormControl fullWidth>            
                          <TextField
                            id="company"
                            onChange={handleCompanyChange}
                            label="Company (if working)"
                            value={company || ""}
                            fullWidth
                            variant="outlined"
                            InputLabelProps={{ shrink: Boolean(company) }}
                          />
                        </FormControl>
                        <PrivacyToggle
                          field="company"
                          isPrivate={privacySettings.company !== 'public'}
                          onToggle={togglePrivacySetting}
                          size="small"
                          disabled={privacyLoading}
                        />
                      </Box>
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <FormControl fullWidth>            
                        <TextField
                          id="linkedin"
                          onChange={handleLinkedInChange}
                          label="LinkedIn Profile URL"
                          value={linkedInUrl || ""}
                          fullWidth
                          variant="outlined"
                          InputLabelProps={{ shrink: Boolean(linkedInUrl) }}
                        />            
                      </FormControl>
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <FormControl fullWidth>            
                        <TextField
                          id="instagram"
                          onChange={handleInstagramChange}
                          label="Instagram Profile URL"
                          value={instagramUrl || ""}
                          fullWidth
                          variant="outlined"
                          InputLabelProps={{ shrink: Boolean(instagramUrl) }}
                        />
                      </FormControl>
                    </Grid>
                    
                    <Grid size={{ xs: 12 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <FormControl fullWidth>            
                          <TextField
                            id="why"
                            onChange={handleWhyChange}
                            label="Why are you here with us at OHack?"
                            value={why || ""}
                            multiline
                            rows={2}
                            fullWidth
                            variant="outlined"
                            InputLabelProps={{ shrink: Boolean(why) }}
                          />
                        </FormControl>
                        <Box sx={{ mt: 1 }}>
                          <PrivacyToggle
                            field="why"
                            isPrivate={privacySettings.why !== 'public'}
                            onToggle={togglePrivacySetting}
                            size="small"
                            disabled={privacyLoading}
                          />
                        </Box>
                      </Box>
                    </Grid>
                    
                    <Grid size={{ xs: 12 }}>
                      {isLoading ? (
                        <Skeleton variant="rectangular" height={80} />
                      ) : (
                        <LoadingOverlay isLoading={isLoading} field="expertise">
                          <CustomSelect
                            label="Areas of Expertise"
                            value={expertise}
                            onChange={handleExpertiseChange}
                            options={expertiseOptions}
                            id="expertise-select"
                            multiple
                          />
                        </LoadingOverlay>
                      )}
                    </Grid>
                  </Grid>
                </TabPanel>

                {/* Impact Tab */}
                <TabPanel value={activeTab} index={1}>
                  <Typography variant="h4" sx={{ mb: 3, fontWeight: 500, fontSize: { xs: '1.4rem', sm: '2.125rem' } }}>
                    Your Impact & Achievements
                  </Typography>
                  
                  <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      {isLoading ? (
                        <Skeleton variant="rectangular" height={180} />
                      ) : (
                        <RaffleEntries profile={profile} githubHistory={githubHistory} />
                      )}
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      {isLoading || isGithubLoading ? (
                        <Skeleton variant="rectangular" height={180} />
                      ) : (
                        <ShareableGitHubContributions githubHistory={githubHistory} userName={github} />
                      )}
                    </Grid>
                  </Grid>
                </TabPanel>

                {/* GitHub Contributions Tab */}
                <TabPanel value={activeTab} index={2}>
                  <Typography variant="h4" sx={{ mb: 3, fontWeight: 500, fontSize: { xs: '1.4rem', sm: '2.125rem' } }}>
                    GitHub Contributions
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <FormControl fullWidth sx={{ mb: 3 }}>            
                      <TextField
                        id="github-username"
                        onChange={handleGithubChange}
                        label="GitHub username"
                        value={github || ""}
                        fullWidth
                        variant="outlined"
                        InputLabelProps={{ shrink: Boolean(github) }}
                      />
                    </FormControl>
                  </Box>
                  
                  {isLoading || isGithubLoading ? (
                    <Skeleton variant="rectangular" height={300} />
                  ) : (
                    <>
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="h5" sx={{ mb: 2, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>Your Contribution Graph</Typography>
                        <GitHubContributions githubHistory={githubHistory} />
                      </Box>
                      
                      <Box>
                        <Typography variant="h5" sx={{ mb: 2, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>Shareable Card</Typography>
                        <ShareableGitHubContributions githubHistory={githubHistory} userName={github} />
                      </Box>
                    </>
                  )}
                </TabPanel>

                {/* Swag & Shipping Tab */}
                <TabPanel value={activeTab} index={3}>
                  <Typography variant="h4" sx={{ mb: 3, fontWeight: 500, fontSize: { xs: '1.4rem', sm: '2.125rem' } }}>
                    Swag & Shipping Information
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    We occasionally send swag to our active members. Please provide your shipping details if you'd like to receive some OHack goodies!
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      {isLoading ? (
                        <Skeleton variant="rectangular" height={56} />
                      ) : (
                        <LoadingOverlay isLoading={isLoading} field="shirtSize">
                          <CustomSelect
                            label="T-Shirt Size"
                            value={shirtSize}
                            onChange={handleShirtSizeChange}
                            options={shirtSizeOptions}
                            id="shirt-size-select"
                          />
                        </LoadingOverlay>
                      )}
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <FormControlLabel
                        control={
                          <Checkbox 
                            checked={wantStickers} 
                            onChange={handleStickersChange}
                            color="primary"
                          />
                        }
                        label="I'd like to receive OHack stickers too!"
                      />
                    </Grid>
                  </Grid>
                  
                  <Typography variant="h5" sx={{ mt: 4, mb: 2, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
                    Shipping Address
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12 }}>
                      <FormControl fullWidth>
                        <TextField
                          id="street_address"
                          label="Street Address"
                          value={streetAddress || ""}
                          onChange={handleAddressChange("street_address", setStreetAddress)}
                          fullWidth
                          variant="outlined"
                          InputLabelProps={{ shrink: Boolean(streetAddress) }}
                        />
                      </FormControl>
                    </Grid>
                    
                    <Grid size={{ xs: 12 }}>
                      <FormControl fullWidth>
                        <TextField
                          id="street_address_2"
                          label="Apartment, suite, etc. (optional)"
                          value={streetAddress2 || ""}
                          onChange={handleAddressChange("street_address_2", setStreetAddress2)}
                          fullWidth
                          variant="outlined"
                          InputLabelProps={{ shrink: Boolean(streetAddress2) }}
                        />
                      </FormControl>
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <FormControl fullWidth>
                        <TextField
                          id="city"
                          label="City"
                          value={city || ""}
                          onChange={handleAddressChange("city", setCity)}
                          fullWidth
                          variant="outlined"
                          InputLabelProps={{ shrink: Boolean(city) }}
                        />
                      </FormControl>
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <FormControl fullWidth>
                        <TextField
                          id="state"
                          label="State/Province"
                          value={state || ""}
                          onChange={handleAddressChange("state", setState)}
                          fullWidth
                          variant="outlined"
                          InputLabelProps={{ shrink: Boolean(state) }}
                        />
                      </FormControl>
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <FormControl fullWidth>
                        <TextField
                          id="postal_code"
                          label="Postal/ZIP Code"
                          value={postalCode || ""}
                          onChange={handleAddressChange("postal_code", setPostalCode)}
                          fullWidth
                          variant="outlined"
                          InputLabelProps={{ shrink: Boolean(postalCode) }}
                        />
                      </FormControl>
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <CustomSelect
                        label="Country"
                        value={country}
                        onChange={handleAddressChange("country", setCountry)}
                        options={countryOptions}
                        id="country-select"
                      />
                    </Grid>
                  </Grid>
                </TabPanel>

                {/* Volunteer History Tab */}
                <TabPanel value={activeTab} index={4}>
                  <Typography variant="h4" sx={{ mb: 3, fontWeight: 500, fontSize: { xs: '1.4rem', sm: '2.125rem' } }}>
                    Your Volunteer History
                  </Typography>
                  
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="h5" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>Badges</Typography>
                      <PrivacyToggle
                        field="badges"
                        isPrivate={privacySettings.badges !== 'public'}
                        onToggle={togglePrivacySetting}
                        size="small"
                        disabled={privacyLoading}
                      />
                    </Box>
                    {isLoading ? (
                      <Skeleton variant="rectangular" height={100} />
                    ) : (
                      <>
                        <BadgeList badges={badges} />
                        {badges && badges.length > 0 && (
                          <Box sx={{ 
                            mt: 2, 
                            p: 2, 
                            backgroundColor: 'action.hover', 
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider'
                          }}>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap' }}>
                              <EmojiEventsIcon fontSize="small" color="primary" />
                              <strong>Congratulations on your achievement!</strong> 
                              If you've reached a milestone and are eligible for a prize, please{' '}
                              <Link href="/contact?type=prize" underline="hover" color="primary">
                                contact us
                              </Link>
                              {' '}to claim it.
                            </Typography>
                          </Box>
                        )}
                      </>
                    )}
                  </Box>
                  
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="h5" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>Hackathons</Typography>
                      <PrivacyToggle
                        field="hackathons"
                        isPrivate={privacySettings.hackathons !== 'public'}
                        onToggle={togglePrivacySetting}
                        size="small"
                        disabled={privacyLoading}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      We've tried our best to keep track of each time you've volunteered,
                      mentored, or judged a hackathon. If anything is missing, please let us know on Slack!
                    </Typography>
                    {isLoading ? (
                      <Skeleton variant="rectangular" height={150} />
                    ) : (
                      <ProfileHackathonList hackathons={hackathons} />
                    )}
                  </Box>
                  
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="h5" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>Feedback Exchange</Typography>
                      <PrivacyToggle
                        field="feedback"
                        isPrivate={privacySettings.feedback !== 'public'}
                        onToggle={togglePrivacySetting}
                        size="small"
                        disabled={privacyLoading}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Feedback you've given and received from the community.
                    </Typography>
                    <FeedbackLite feedback_url={feedback_url} history={profile?.history} />
                  </Box>
                  
                  <Box>
                    <Typography variant="h5" sx={{ mb: 2, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>Summer Internships</Typography>
                    <Typography variant="body2">
                      These are distinctly different than hackathons as they span over a
                      couple months.
                    </Typography>
                    <HelpUsBuildOHack
                      github_link="https://github.com/opportunity-hack/frontend-ohack.dev/issues/8"
                      github_name="Issue #8"
                    />
                  </Box>
                </TabPanel>

                {/* Giveaway Entries Tab */}
                <TabPanel value={activeTab} index={5}>
                  <Typography variant="h4" sx={{ mb: 3, fontWeight: 500, fontSize: { xs: '1.4rem', sm: '2.125rem' } }}>
                    Giveaway Entries
                  </Typography>
                  
                  <Paper elevation={1} sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 2, bgcolor: theme.palette.primary.light + '10' }}>
                    <Typography variant="h5" sx={{ mb: 2, color: theme.palette.primary.main, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
                      Your Entries
                    </Typography>
                    
                    {isLoading ? (
                      <Skeleton variant="rectangular" height={180} />
                    ) : (
                      <RaffleEntries profile={profile} githubHistory={githubHistory} />
                    )}
                  </Paper>
                  
                  <Typography variant="h5" sx={{ mt: 4, mb: 2, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
                    How to Earn More Entries
                  </Typography>
                  
                  <Box component="ul" sx={{ pl: 2 }}>
                    <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                      Contribute to Opportunity Hack projects on GitHub
                    </Typography>
                    <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                      Participate in hackathons as a hacker, mentor, or judge
                    </Typography>
                    <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                      Complete your profile information
                    </Typography>
                    <Typography component="li" variant="body1">
                      Refer other volunteers to join Opportunity Hack
                    </Typography>
                  </Box>
                </TabPanel>
              </Box>
            </Paper>
          </ProfileContainer>
        ) : (
          <LoginOrRegister introText="Ready to join us?" previousPage="/profile" />
        )}
      </InnerContainer>
    </LayoutContainer>
  );
}