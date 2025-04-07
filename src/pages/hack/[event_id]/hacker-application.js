import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuthInfo } from '@propelauth/react';
import {
  Typography,
  Container,
  Box,
  TextField,
  Button,
  FormControlLabel,
  CircularProgress,
  Checkbox,
  FormControl,
  FormHelperText,
  Select,
  MenuItem,
  Paper,
  Divider,
  Alert,
  Link,
  OutlinedInput,
  ListItemText,
  InputLabel,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Radio,
  RadioGroup,
  useTheme,
  useMediaQuery
} from '@mui/material';
import Head from 'next/head';
import { useEnv } from '../../../context/env.context';
import ApplicationNav from '../../../components/ApplicationNav/ApplicationNav';
import InfoIcon from '@mui/icons-material/Info';
import FormPersistenceControls from '../../../components/FormPersistenceControls';
import { useFormPersistence } from '../../../hooks/use-form-persistence';

const HackerApplicationPage = () => {
  const router = useRouter();
  const { event_id } = router.query;
  const { isLoggedIn, user, accessToken } = useAuthInfo();
  const { apiServerUrl } = useEnv();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Form navigation state
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [eventData, setEventData] = useState(null);
  
  // Store refs for data loading
  const initialLoadRef = useRef(false);
  const formInitializedRef = useRef(false);
  
  // Initial form state
  const initialFormData = {
    timestamp: new Date().toISOString(),
    email: '',
    name: '',
    pronouns: '',
    participantType: '', // Student, Professional, Educator, Community Member, Other
    participantTypeOther: '',
    schoolOrganization: '',
    experienceLevel: '',
    primaryRoles: [], // Array of selected roles
    otherRole: '',
    skills: [], // Technical skills
    otherSkills: '',
    bio: '',
    linkedin: '',
    github: '',
    portfolio: '',
    inPerson: '',
    shirtSize: '',
    participationCount: '',
    arizonaResident: '',
    county: '',
    ageRange: '',
    referralSource: '',
    referralSourceOther: '',
    socialCauses: [], // Array of selected causes
    otherSocialCause: '',
    socialImpactExperience: '',
    motivation: '',
    teamStatus: '',
    teamCode: '',
    teamNeededSkills: '',
    teamMatchingPreferences: {
      preferredSize: '',
      preferredSkills: [],
      preferredCauses: []
    },
    workshopInterests: [],
    interestedInTaxCredit: false,
    willContinue: false,
    codeOfConduct: false,
    dietaryRestrictions: '',
    country: '',
    state: '',
    additionalInfo: '',
    event_id: event_id || '',
    isSelected: false
  };
  
  // Use form persistence hook
  const {
    formData,
    setFormData,
    formRef,
    handleFormChange,
    handleMultiSelectChange,
    loadFromLocalStorage,
    saveToLocalStorage,
    clearSavedData,
    loadPreviousSubmission,
    previouslySubmitted,
    setPreviouslySubmitted,
    notification,
    closeNotification,
    isLoading,
    setIsLoading
  } = useFormPersistence({
    formType: 'hacker',
    eventId: event_id || '',
    userId: user?.userId || '',
    initialFormData,
    apiServerUrl: apiServerUrl || '',
    accessToken: accessToken || ''
  });
  
  // Participant type options
  const participantTypeOptions = [
    'Student',
    'Professional',
    'Educator',
    'Community Member',
    'Other'
  ];
  
  // Experience level options
  const experienceLevelOptions = [
    'First-time hacker',
    'Some hackathon experience (1-3 events)',
    'Experienced hacker (4+ events)'
  ];
  
  // Primary role options
  const primaryRoleOptions = [
    'Software Development - Frontend',
    'Software Development - Backend',
    'Software Development - Mobile',
    'Software Development - Full Stack',
    'Design (UI/UX, Graphics)',
    'Data Science/Analytics',
    'Project Management',
    'Business Analysis',
    'Quality Assurance',
    'DevOps',
    'Other'
  ];
  
  // Technical skills options
  const technicalSkillsOptions = [
    'JavaScript/TypeScript',
    'React',
    'Angular',
    'Vue.js',
    'Node.js',
    'Python',
    'Java',
    'Ruby',
    'PHP',
    'C#/.NET',
    'Go',
    'Swift/iOS',
    'Kotlin/Android',
    'React Native',
    'Flutter',
    'AWS',
    'Azure',
    'Google Cloud',
    'Docker/Kubernetes',
    'CI/CD Pipelines',
    'SQL Databases',
    'NoSQL Databases',
    'Machine Learning',
    'AI/NLP',
    'Data Visualization',
    'Blockchain',
    'UX Research',
    'UI Design',
    'Graphic Design',
    'Other'
  ];
  
  // Social causes options
  const socialCausesOptions = [
    'Education',
    'Healthcare',
    'Environment',
    'Economic Opportunity',
    'Community Development',
    'Accessibility/Inclusion',
    'Homelessness',
    'Food Security',
    'Mental Health',
    'Disaster Relief',
    'Animal Welfare',
    'Other'
  ];
  
  // Workshop interest options
  const workshopOptions = [
    'Pre-hackathon skill-building workshops',
    'During-event technical sessions',
    'Social impact design thinking',
    'Git/GitHub workflow',
    'Cloud deployment',
    'UX/UI fundamentals',
    'API integration',
    'Database design',
    'Mobile development',
    'Machine learning basics'
  ];
  
  // Arizona county options
  const arizonaCountyOptions = [
    'Apache',
    'Cochise',
    'Coconino',
    'Gila',
    'Graham',
    'Greenlee',
    'La Paz',
    'Maricopa',
    'Mohave',
    'Navajo',
    'Pima',
    'Pinal',
    'Santa Cruz',
    'Yavapai',
    'Yuma'
  ];
  
  // Age range options
  const ageRangeOptions = [
    'Under 18',
    '18-24',
    '25-34',
    '35-44',
    '45-54',
    '55+'
  ];
  
  // Referral source options
  const referralSourceOptions = [
    'School/University',
    'Employer',
    'Social Media',
    'Friend/Colleague',
    'Previous Participant',
    'Nonprofit Organization',
    'Other'
  ];
  
  // Team size preferences
  const teamSizeOptions = [
    '2-3 people',
    '4-5 people',
    '6+ people',
    'No preference'
  ];
  
  // Set up form with event_id
  useEffect(() => {
    if (event_id && !formInitializedRef.current) {
      formInitializedRef.current = true;
      setFormData(prev => ({
        ...prev,
        event_id: event_id
      }));
    }
  }, [event_id, setFormData]);
  
  // Now define the custom implementation that uses handleMultiSelectChange
  const customHandleMultiSelectChange = useCallback((event, fieldName) => {
    handleMultiSelectChange(event, fieldName);
    
    // Clear otherRole when Other is removed from primaryRoles
    if (fieldName === 'primaryRoles' && !event.target.value.includes('Other')) {
      setFormData(prev => ({
        ...prev,
        otherRole: ''
      }));
    }
    
    // Clear otherSkills when Other is removed from skills
    if (fieldName === 'skills' && !event.target.value.includes('Other')) {
      setFormData(prev => ({
        ...prev,
        otherSkills: ''
      }));
    }
    
    // Clear otherSocialCause when Other is removed from socialCauses
    if (fieldName === 'socialCauses' && !event.target.value.includes('Other')) {
      setFormData(prev => ({
        ...prev,
        otherSocialCause: ''
      }));
    }
  }, [handleMultiSelectChange, setFormData]);
  
  // Handle change function that extends the basic formChange
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    // Custom handling for participant type to clear the "other" field when not needed
    if (name === 'participantType' && value !== 'Other') {
      setFormData(prev => ({
        ...prev,
        participantTypeOther: ''
      }));
    }
    
    // Custom handling for referral source to clear the "other" field when not needed
    if (name === 'referralSource' && value !== 'Other') {
      setFormData(prev => ({
        ...prev,
        referralSourceOther: ''
      }));
    }
    
    // Custom handling for Arizona residency to clear county when not an Arizona resident
    if (name === 'arizonaResident' && value !== 'Arizona Resident') {
      setFormData(prev => ({
        ...prev,
        county: ''
      }));
    }
    
    // Custom handling for team status to clear team-specific fields when not needed
    if (name === 'teamStatus') {
      if (value !== 'I have a team') {
        setFormData(prev => ({
          ...prev,
          teamCode: ''
        }));
      }
      
      if (value !== "I'm looking for team members") {
        setFormData(prev => ({
          ...prev,
          teamNeededSkills: ''
        }));
      }
      
      if (value !== "I'd like to be matched with a team") {
        setFormData(prev => ({
          ...prev,
          teamMatchingPreferences: {
            preferredSize: '',
            preferredSkills: [],
            preferredCauses: []
          }
        }));
      }
    }
    
    // Pass the event to the main handler
    handleFormChange(e);
  }, [handleFormChange, setFormData]);
  
  // Handle team matching preferences changes
  const handleTeamMatchingChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      teamMatchingPreferences: {
        ...prev.teamMatchingPreferences,
        [field]: value
      }
    }));
    
    // Auto-save to localStorage after changes
    setTimeout(() => {
      saveToLocalStorage();
    }, 500);
  }, [setFormData, saveToLocalStorage]);
  
  // Handle manual form save
  const handleManualSave = useCallback(() => {
    saveToLocalStorage();
  }, [saveToLocalStorage]);
  
  // Fetch event data and initialize form
  useEffect(() => {
    if (!event_id || !apiServerUrl || initialLoadRef.current) return;
    initialLoadRef.current = true;
    
    const fetchEventData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch event data from the actual API
        const response = await fetch(`${apiServerUrl}/api/messages/hackathon/${event_id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch event data: ${response.status} ${response.statusText}`);
        }
        
        const eventData = await response.json();
        
        if (!eventData || !eventData.start_date || !eventData.end_date) {
          throw new Error('Invalid event data received');
        }
        
        // Format dates for display
        const startDate = new Date(eventData.start_date);
        const endDate = new Date(eventData.end_date);
        const formattedStartDate = startDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        const formattedEndDate = endDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        setEventData({
          name: eventData.title || `Opportunity Hack - ${event_id}`,
          description: eventData.description || "Annual hackathon for nonprofits",
          date: new Date(eventData.start_date).getFullYear().toString(),
          startDate: eventData.start_date,
          endDate: eventData.end_date,
          formattedStartDate,
          formattedEndDate,
          location: eventData.location || "Tempe, Arizona",
          image: eventData.image_url || "https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp"
        });
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching event data:', err);
        setError('Failed to load event data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [event_id, apiServerUrl, setIsLoading]);

  // Handle user data and application loading - separate from event loading
  useEffect(() => {
    const loadUserAndFormData = async () => {
      // Skip if already initialized, event_id missing, or user not loaded yet
      if (!event_id || !formInitializedRef.current) return;
      
      try {
        // Pre-fill with user information if available
        if (user) {
          setFormData(prev => ({
            ...prev,
            email: user.email || prev.email,
            name: (user.firstName && user.lastName) ? 
              `${user.firstName} ${user.lastName}` : (user.username || prev.name)
          }));
          
          // Try to load previous submission if logged in and have access token
          if (accessToken) {
            try {
              const prevData = await loadPreviousSubmission();
              
              if (prevData) {
                // If the user has submitted before, ask if they want to load it
                if (window.confirm('We found a previous application. Would you like to load it for editing?')) {
                  // Transform API data to match our form structure
                  const parsePreviousArrayField = (field, fallback = []) => {
                    if (Array.isArray(prevData[field])) return prevData[field];
                    if (typeof prevData[field] === 'string' && prevData[field]) {
                      return prevData[field].split(',').map(item => item.trim());
                    }
                    return fallback;
                  };
                  
                  const transformedData = {
                    ...initialFormData,
                    email: prevData.email || user.email || '',
                    name: prevData.name || ((user.firstName && user.lastName) ? 
                      `${user.firstName} ${user.lastName}` : (user.username || '')),
                    pronouns: prevData.pronouns || '',
                    participantType: prevData.participantType || '',
                    participantTypeOther: prevData.participantTypeOther || '',
                    schoolOrganization: prevData.schoolOrganization || prevData.school || prevData.organization || '',
                    experienceLevel: prevData.experienceLevel || '',
                    primaryRoles: parsePreviousArrayField('primaryRoles'),
                    otherRole: prevData.otherRole || '',
                    skills: parsePreviousArrayField('skills'),
                    otherSkills: prevData.otherSkills || '',
                    bio: prevData.bio || prevData.shortBio || '',
                    linkedin: prevData.linkedin || prevData.linkedinProfile || '',
                    github: prevData.github || '',
                    portfolio: prevData.portfolio || '',
                    inPerson: prevData.inPerson || (prevData.isInPerson ? 'Yes' : 'No'),
                    shirtSize: prevData.shirtSize || '',
                    participationCount: prevData.participationCount || '',
                    arizonaResident: prevData.arizonaResident || '',
                    county: prevData.county || '',
                    ageRange: prevData.ageRange || '',
                    referralSource: prevData.referralSource || '',
                    referralSourceOther: prevData.referralSourceOther || '',
                    socialCauses: parsePreviousArrayField('socialCauses'),
                    otherSocialCause: prevData.otherSocialCause || '',
                    socialImpactExperience: prevData.socialImpactExperience || '',
                    motivation: prevData.motivation || '',
                    teamStatus: prevData.teamStatus || '',
                    teamCode: prevData.teamCode || '',
                    teamNeededSkills: prevData.teamNeededSkills || '',
                    teamMatchingPreferences: {
                      preferredSize: prevData.teamMatchingPreferences?.preferredSize || '',
                      preferredSkills: parsePreviousArrayField('teamMatchingPreferredSkills'),
                      preferredCauses: parsePreviousArrayField('teamMatchingPreferredCauses')
                    },
                    workshopInterests: parsePreviousArrayField('workshopInterests'),
                    interestedInTaxCredit: prevData.interestedInTaxCredit || false,
                    willContinue: prevData.willContinue || false,
                    codeOfConduct: prevData.codeOfConduct || prevData.agreedToCodeOfConduct || false,
                    dietaryRestrictions: prevData.dietaryRestrictions || '',
                    country: prevData.country || '',
                    state: prevData.state || '',
                    additionalInfo: prevData.additionalInfo || prevData.comments || '',
                    event_id: event_id
                  };
                  
                  setFormData(transformedData);
                  setPreviouslySubmitted(true);
                  return;
                }
              }
            } catch (err) {
              console.error('Error loading previous submission:', err);
              // Fail silently and continue to try localStorage
            }
          }
        }
        
        // If no previous submission loaded, try to load from localStorage
        const loadedFromLocal = loadFromLocalStorage();
        
        // Handle manual save after the component is loaded
        if (!loadedFromLocal) {
          setTimeout(() => {
            saveToLocalStorage();
          }, 1000);
        }
      } catch (err) {
        console.error('Error initializing form:', err);
      }
    };
    
    loadUserAndFormData();
  }, [user, accessToken, event_id]);
  
  // Validation functions
  const validateBasicInfo = () => {
    const requiredFields = ['email', 'name', 'participantType', 'schoolOrganization'];
    
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`Please fill out the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field`);
        return false;
      }
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // Check for "Other" participant type
    if (formData.participantType === 'Other' && !formData.participantTypeOther) {
      setError('Please specify your participant type');
      return false;
    }
    
    setError('');
    return true;
  };
  
  const validateSkillsInfo = () => {
    // Validate primary roles
    if (!formData.primaryRoles || formData.primaryRoles.length === 0) {
      setError('Please select at least one primary role');
      return false;
    }
    
    // Check for "Other" role
    if (formData.primaryRoles.includes('Other') && !formData.otherRole) {
      setError('Please specify your other role');
      return false;
    }
    
    // Validate skills
    if (!formData.skills || formData.skills.length === 0) {
      setError('Please select at least one technical skill');
      return false;
    }
    
    // Check for "Other" skill
    if (formData.skills.includes('Other') && !formData.otherSkills) {
      setError('Please specify your other technical skills');
      return false;
    }
    
    setError('');
    return true;
  };
  
  const validateLocationInfo = () => {
    const requiredFields = ['inPerson', 'arizonaResident', 'country', 'state', 'ageRange'];
    
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`Please fill out the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field`);
        return false;
      }
    }
    
    // Check for Arizona resident and county
    if (formData.arizonaResident === 'Arizona Resident' && !formData.county) {
      setError('Please select your county');
      return false;
    }
    
    // Check for referral source and "Other"
    if (!formData.referralSource) {
      setError('Please indicate how you heard about Opportunity Hack');
      return false;
    }
    
    if (formData.referralSource === 'Other' && !formData.referralSourceOther) {
      setError('Please specify how you heard about Opportunity Hack');
      return false;
    }
    
    setError('');
    return true;
  };
  
  const validateInterestsInfo = () => {
    // Validate social causes
    if (!formData.socialCauses || formData.socialCauses.length === 0) {
      setError('Please select at least one social cause you are interested in');
      return false;
    }
    
    // Check for "Other" social cause
    if (formData.socialCauses.includes('Other') && !formData.otherSocialCause) {
      setError('Please specify your other social cause interest');
      return false;
    }
    
    // Validate team status
    if (!formData.teamStatus) {
      setError('Please indicate your team status');
      return false;
    }
    
    // Specific validations based on team status
    if (formData.teamStatus === 'I have a team' && !formData.teamCode) {
      setError('Please enter your team code');
      return false;
    }
    
    if (formData.teamStatus === "I'm looking for team members" && !formData.teamNeededSkills) {
      setError('Please specify what skills you are looking for in teammates');
      return false;
    }
    
    if (formData.teamStatus === "I'd like to be matched with a team") {
      // Check team matching preferences
      if (!formData.teamMatchingPreferences.preferredSize) {
        setError('Please select your preferred team size');
        return false;
      }
      
      if (!formData.teamMatchingPreferences.preferredSkills || 
          formData.teamMatchingPreferences.preferredSkills.length === 0) {
        setError('Please select at least one preferred skill set to work with');
        return false;
      }
      
      if (!formData.teamMatchingPreferences.preferredCauses || 
          formData.teamMatchingPreferences.preferredCauses.length === 0) {
        setError('Please select at least one preferred social cause');
        return false;
      }
    }
    
    setError('');
    return true;
  };

  const validateForm = () => {
    return (
      validateBasicInfo() &&
      validateSkillsInfo() &&
      validateLocationInfo() &&
      validateInterestsInfo() &&
      formData.codeOfConduct
    );
  };

  const handleNext = () => {
    if (activeStep === 0 && !validateBasicInfo()) return;
    if (activeStep === 1 && !validateSkillsInfo()) return;
    if (activeStep === 2 && !validateLocationInfo()) return;
    if (activeStep === 3 && !validateInterestsInfo()) return;
    
    // Save progress when moving between steps
    handleManualSave();
    
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    // Save progress when moving between steps
    handleManualSave();
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!formData.codeOfConduct) {
      setError('You must agree to the code of conduct');
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      // Update timestamp before submission
      const submissionData = {
        ...formData,
        timestamp: new Date().toISOString(),
        // Process data for API submission
        isInPerson: formData.inPerson === "Yes",
        // Process primaryRoles with otherRole if needed
        primaryRoles: formData.primaryRoles.includes('Other') 
          ? [...formData.primaryRoles.filter(r => r !== 'Other'), formData.otherRole].join(', ')
          : formData.primaryRoles.join(', '),
        // Process skills with otherSkills if needed  
        skills: formData.skills.includes('Other')
          ? [...formData.skills.filter(s => s !== 'Other'), formData.otherSkills].join(', ')
          : formData.skills.join(', '),
        // Process socialCauses with otherSocialCause if needed
        socialCauses: formData.socialCauses.includes('Other')
          ? [...formData.socialCauses.filter(c => c !== 'Other'), formData.otherSocialCause].join(', ')
          : formData.socialCauses.join(', '),
        // Process workshopInterests
        workshopInterests: formData.workshopInterests.join(', '),
        // Convert team matching preferences to strings for API
        teamMatchingPreferredSkills: formData.teamMatchingPreferences.preferredSkills.join(', '),
        teamMatchingPreferredCauses: formData.teamMatchingPreferences.preferredCauses.join(', '),
        teamMatchingPreferredSize: formData.teamMatchingPreferences.preferredSize,
        // Add type information
        type: 'hackers',
        volunteer_type: 'hacker',
        agreedToCodeOfConduct: formData.codeOfConduct,
        linkedinProfile: formData.linkedin,
        shortBio: formData.bio
      };
      
      if (apiServerUrl) {
        // Submit to API
        const submitEndpoint = previouslySubmitted 
          ? `${apiServerUrl}/api/hacker/application/${event_id}/update` 
          : `${apiServerUrl}/api/hacker/application/${event_id}/submit`;
        
        const response = await fetch(submitEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(submissionData)
        });
        
        if (!response.ok) {
          throw new Error(`Failed to submit application: ${response.status}`);
        }
      } else {
        // In a test environment, log the data and simulate API delay
        console.log('Submitting hacker application:', submissionData);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      // Clear saved form data after successful submission
      clearSavedData();
      
      setSuccess(true);
    } catch (err) {
      console.error('Error submitting application:', err);
      setError('Failed to submit your application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Define steps for stepper
  const steps = ['Basic Info', 'Skills & Experience', 'Location & Demographics', 'Interests & Teams', 'Review'];

  // Render basic information form
  const renderBasicInfoForm = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
        Basic Information
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <TextField
          label="Email Address"
          name="email"
          type="email"
          required
          fullWidth
          value={formData.email || ''}
          onChange={handleChange}
          sx={{ mb: 3 }}
        />
        
        <TextField
          label="Your Name"
          name="name"
          required
          fullWidth
          value={formData.name || ''}
          onChange={handleChange}
          sx={{ mb: 3 }}
        />
        
        <TextField
          label="Your Pronouns (Optional)"
          name="pronouns"
          fullWidth
          value={formData.pronouns || ''}
          onChange={handleChange}
          sx={{ mb: 3 }}
        />
        
        <FormControl fullWidth required sx={{ mb: 3 }}>
          <InputLabel id="participant-type-label">Participant Type</InputLabel>
          <Select
            labelId="participant-type-label"
            id="participant-type"
            name="participantType"
            value={formData.participantType || ''}
            onChange={handleChange}
            label="Participant Type"
          >
            {participantTypeOptions.map(option => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
          <FormHelperText>Select what best describes you</FormHelperText>
        </FormControl>
        
        {formData.participantType === 'Other' && (
          <TextField
            label="Please specify your participant type"
            name="participantTypeOther"
            required
            fullWidth
            value={formData.participantTypeOther || ''}
            onChange={handleChange}
            sx={{ mb: 3 }}
          />
        )}
        
        <TextField
          label="School or Organization"
          name="schoolOrganization"
          required
          fullWidth
          value={formData.schoolOrganization || ''}
          onChange={handleChange}
          sx={{ mb: 3 }}
          helperText="Your school, university, company, or organization"
        />
        
        <FormControl fullWidth required sx={{ mb: 3 }}>
          <InputLabel id="experience-level-label">Hackathon Experience Level</InputLabel>
          <Select
            labelId="experience-level-label"
            id="experience-level"
            name="experienceLevel"
            value={formData.experienceLevel || ''}
            onChange={handleChange}
            label="Hackathon Experience Level"
          >
            {experienceLevelOptions.map(option => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
          <FormHelperText>How much experience do you have with hackathons?</FormHelperText>
        </FormControl>
        
        <FormControl fullWidth required sx={{ mb: formData.primaryRoles?.includes('Other') ? 1 : 3 }}>
          <InputLabel id="primary-roles-label">Primary Role/Skill Set</InputLabel>
          <Select
            labelId="primary-roles-label"
            id="primary-roles"
            multiple
            value={formData.primaryRoles || []}
            onChange={(e) => customHandleMultiSelectChange(e, 'primaryRoles')}
            input={<OutlinedInput label="Primary Role/Skill Set" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
          >
            {primaryRoleOptions.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox checked={(formData.primaryRoles || []).indexOf(option) > -1} />
                <ListItemText primary={option} />
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>Select your primary roles or skill sets (select at least one)</FormHelperText>
        </FormControl>
        
        {formData.primaryRoles?.includes('Other') && (
          <TextField
            label="Please specify your other role"
            name="otherRole"
            required
            fullWidth
            value={formData.otherRole || ''}
            onChange={handleChange}
            helperText="Tell us about your specific role or skill set"
            sx={{ mb: 3 }}
          />
        )}
      </Box>
    </Box>
  );
  
  // Render skills and experience form
  const renderSkillsAndExperienceForm = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
        Skills & Experience
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth required sx={{ mb: formData.skills?.includes('Other') ? 1 : 3 }}>
          <InputLabel id="skills-label">Technical Skills</InputLabel>
          <Select
            labelId="skills-label"
            id="skills"
            multiple
            value={formData.skills || []}
            onChange={(e) => customHandleMultiSelectChange(e, 'skills')}
            input={<OutlinedInput label="Technical Skills" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
          >
            {technicalSkillsOptions.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox checked={(formData.skills || []).indexOf(option) > -1} />
                <ListItemText primary={option} />
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>Select your technical skills (select at least one)</FormHelperText>
        </FormControl>
        
        {formData.skills?.includes('Other') && (
          <TextField
            label="Please specify your other technical skills"
            name="otherSkills"
            required
            fullWidth
            value={formData.otherSkills || ''}
            onChange={handleChange}
            helperText="Tell us about your other technical skills"
            sx={{ mb: 3 }}
          />
        )}
        
        <TextField
          label="Short bio"
          name="bio"
          multiline
          rows={3}
          fullWidth
          value={formData.bio || ''}
          onChange={handleChange}
          helperText="Tell us a bit about yourself and your background (aim for 100-200 words)"
          sx={{ mb: 3 }}
        />
        
        <TextField
          label="LinkedIn Profile (Optional)"
          name="linkedin"
          type="url"
          fullWidth
          value={formData.linkedin || ''}
          onChange={handleChange}
          sx={{ mb: 3 }}
          placeholder="https://linkedin.com/in/yourprofile"
        />
        
        <TextField
          label="GitHub Profile (Optional)"
          name="github"
          type="url"
          fullWidth
          value={formData.github || ''}
          onChange={handleChange}
          sx={{ mb: 3 }}
          placeholder="https://github.com/yourusername"
        />
        
        <TextField
          label="Portfolio/Personal Website (Optional)"
          name="portfolio"
          type="url"
          fullWidth
          value={formData.portfolio || ''}
          onChange={handleChange}
          sx={{ mb: 3 }}
          placeholder="https://yourwebsite.com"
        />
        
        <FormControl fullWidth required sx={{ mb: 3 }}>
          <InputLabel id="participation-count-label">How many times have you participated in Opportunity Hack?</InputLabel>
          <Select
            labelId="participation-count-label"
            id="participation-count"
            name="participationCount"
            value={formData.participationCount || ''}
            onChange={handleChange}
            label="How many times have you participated in Opportunity Hack?"
          >
            <MenuItem value="This is my first year! 👆">This is my first year! 👆</MenuItem>
            <MenuItem value="This will be the 2nd time ✌️">This will be the 2nd time ✌️</MenuItem>
            <MenuItem value="This will be the 3rd time ☘️">This will be the 3rd time ☘️</MenuItem>
            <MenuItem value="I've been here 4+ times 🔥">I've been here 4+ times 🔥</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
  
  // Render location and demographics form
  const renderLocationDemographicsForm = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
        Location & Demographics
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <FormControl required component="fieldset" sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Are you joining us in-person or virtually?
          </Typography>
          <RadioGroup
            name="inPerson"
            value={formData.inPerson || ''}
            onChange={handleChange}
          >
            <FormControlLabel value="Yes" control={<Radio />} label="Yes, I'll attend in person" />
            <FormControlLabel value="No" control={<Radio />} label="No, I'll participate virtually" />
          </RadioGroup>
        </FormControl>
        
        <FormControl fullWidth required sx={{ mb: 3 }}>
          <InputLabel id="arizona-resident-label">Arizona Residency</InputLabel>
          <Select
            labelId="arizona-resident-label"
            id="arizona-resident"
            name="arizonaResident"
            value={formData.arizonaResident || ''}
            onChange={handleChange}
            label="Arizona Residency"
          >
            <MenuItem value="Arizona Resident">Arizona Resident</MenuItem>
            <MenuItem value="Non-Arizona Resident">Non-Arizona Resident</MenuItem>
          </Select>
          <FormHelperText>This information helps with our QCO reporting requirements</FormHelperText>
        </FormControl>
        
        {formData.arizonaResident === 'Arizona Resident' && (
          <FormControl fullWidth required sx={{ mb: 3 }}>
            <InputLabel id="county-label">County</InputLabel>
            <Select
              labelId="county-label"
              id="county"
              name="county"
              value={formData.county || ''}
              onChange={handleChange}
              label="County"
            >
              {arizonaCountyOptions.map(county => (
                <MenuItem key={county} value={county}>{county}</MenuItem>
              ))}
            </Select>
            <FormHelperText>Select your county in Arizona</FormHelperText>
          </FormControl>
        )}
        
        <TextField
          label="Country"
          name="country"
          required
          fullWidth
          value={formData.country || ''}
          onChange={handleChange}
          sx={{ mb: 3 }}
        />
        
        <TextField
          label="State/Province"
          name="state"
          required
          fullWidth
          value={formData.state || ''}
          onChange={handleChange}
          sx={{ mb: 3 }}
        />
        
        <FormControl fullWidth required sx={{ mb: 3 }}>
          <InputLabel id="age-range-label">Age Range</InputLabel>
          <Select
            labelId="age-range-label"
            id="age-range"
            name="ageRange"
            value={formData.ageRange || ''}
            onChange={handleChange}
            label="Age Range"
          >
            {ageRangeOptions.map(option => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
          <FormHelperText>This helps us understand our participant demographics</FormHelperText>
        </FormControl>
        
        <FormControl fullWidth required sx={{ mb: formData.referralSource === 'Other' ? 1 : 3 }}>
          <InputLabel id="referral-source-label">How did you hear about Opportunity Hack?</InputLabel>
          <Select
            labelId="referral-source-label"
            id="referral-source"
            name="referralSource"
            value={formData.referralSource || ''}
            onChange={handleChange}
            label="How did you hear about Opportunity Hack?"
          >
            {referralSourceOptions.map(option => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {formData.referralSource === 'Other' && (
          <TextField
            label="Please specify how you heard about us"
            name="referralSourceOther"
            required
            fullWidth
            value={formData.referralSourceOther || ''}
            onChange={handleChange}
            sx={{ mb: 3 }}
          />
        )}
        
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="shirt-size-label">T-Shirt Size (Optional)</InputLabel>
          <Select
            labelId="shirt-size-label"
            id="shirt-size"
            name="shirtSize"
            value={formData.shirtSize || ''}
            onChange={handleChange}
            label="T-Shirt Size (Optional)"
          >
            <MenuItem value="XS">XS</MenuItem>
            <MenuItem value="S">S</MenuItem>
            <MenuItem value="M">M</MenuItem>
            <MenuItem value="L">L</MenuItem>
            <MenuItem value="XL">XL</MenuItem>
            <MenuItem value="XXL">XXL</MenuItem>
            <MenuItem value="3XL">3XL</MenuItem>
            <MenuItem value="4XL">4XL</MenuItem>
          </Select>
          <FormHelperText>For in-person attendees (subject to availability)</FormHelperText>
        </FormControl>
        
        <TextField
          label="Dietary Restrictions (Optional)"
          name="dietaryRestrictions"
          fullWidth
          value={formData.dietaryRestrictions || ''}
          onChange={handleChange}
          sx={{ mb: 3 }}
          helperText="Please let us know about any dietary restrictions for in-person attendees"
        />
        
        {formData.arizonaResident === 'Arizona Resident' && (
          <FormControlLabel
            control={
              <Checkbox
                name="interestedInTaxCredit"
                checked={formData.interestedInTaxCredit || false}
                onChange={handleChange}
                color="primary"
              />
            }
            label="I'm interested in receiving information about Arizona tax credits for supporting Opportunity Hack"
            sx={{ mb: 2 }}
          />
        )}
      </Box>
    </Box>
  );
  
  // Render interests and team formation form
  const renderInterestsTeamsForm = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
        Interests & Team Formation
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth required sx={{ mb: formData.socialCauses?.includes('Other') ? 1 : 3 }}>
          <InputLabel id="social-causes-label">Social Causes You're Interested In</InputLabel>
          <Select
            labelId="social-causes-label"
            id="social-causes"
            multiple
            value={formData.socialCauses || []}
            onChange={(e) => customHandleMultiSelectChange(e, 'socialCauses')}
            input={<OutlinedInput label="Social Causes You're Interested In" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
          >
            {socialCausesOptions.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox checked={(formData.socialCauses || []).indexOf(option) > -1} />
                <ListItemText primary={option} />
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>Select causes you're passionate about (select at least one)</FormHelperText>
        </FormControl>
        
        {formData.socialCauses?.includes('Other') && (
          <TextField
            label="Please specify your other social cause interest"
            name="otherSocialCause"
            required
            fullWidth
            value={formData.otherSocialCause || ''}
            onChange={handleChange}
            helperText="Tell us about your specific interest"
            sx={{ mb: 3 }}
          />
        )}
        
        <TextField
          label="Previous Social Impact Experience (Optional)"
          name="socialImpactExperience"
          multiline
          rows={3}
          fullWidth
          value={formData.socialImpactExperience || ''}
          onChange={handleChange}
          helperText="Share any previous experience with social impact projects or nonprofits"
          sx={{ mb: 3 }}
        />
        
        <TextField
          label="What motivates you to participate in Opportunity Hack?"
          name="motivation"
          multiline
          rows={3}
          fullWidth
          value={formData.motivation || ''}
          onChange={handleChange}
          helperText="What impact do you hope to create?"
          sx={{ mb: 3 }}
        />
        
        <FormControl fullWidth required sx={{ mb: 3 }}>
          <InputLabel id="team-status-label">Team Status</InputLabel>
          <Select
            labelId="team-status-label"
            id="team-status"
            name="teamStatus"
            value={formData.teamStatus || ''}
            onChange={handleChange}
            label="Team Status"
          >
            <MenuItem value="I have a team">I have a team</MenuItem>
            <MenuItem value="I'm looking for team members">I'm looking for team members</MenuItem>
            <MenuItem value="I'd like to be matched with a team">I'd like to be matched with a team</MenuItem>
          </Select>
          <FormHelperText>Let us know your team situation</FormHelperText>
        </FormControl>
        
        {formData.teamStatus === 'I have a team' && (
          <TextField
            label="Team Code"
            name="teamCode"
            required
            fullWidth
            value={formData.teamCode || ''}
            onChange={handleChange}
            helperText="Enter your team's code to be added to their roster"
            sx={{ mb: 3 }}
          />
        )}
        
        {formData.teamStatus === "I'm looking for team members" && (
          <TextField
            label="What skills are you looking for in teammates?"
            name="teamNeededSkills"
            required
            multiline
            rows={2}
            fullWidth
            value={formData.teamNeededSkills || ''}
            onChange={handleChange}
            helperText="Describe what skills would complement your team"
            sx={{ mb: 3 }}
          />
        )}
        
        {formData.teamStatus === "I'd like to be matched with a team" && (
          <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 2, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Team Matching Preferences
            </Typography>
            
            <FormControl fullWidth required sx={{ mb: 3 }}>
              <InputLabel id="preferred-size-label">Preferred Team Size</InputLabel>
              <Select
                labelId="preferred-size-label"
                id="preferred-size"
                value={formData.teamMatchingPreferences?.preferredSize || ''}
                onChange={(e) => handleTeamMatchingChange('preferredSize', e.target.value)}
                label="Preferred Team Size"
              >
                {teamSizeOptions.map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth required sx={{ mb: 3 }}>
              <InputLabel id="preferred-skills-label">Preferred Skills to Work With</InputLabel>
              <Select
                labelId="preferred-skills-label"
                id="preferred-skills"
                multiple
                value={formData.teamMatchingPreferences?.preferredSkills || []}
                onChange={(e) => handleTeamMatchingChange('preferredSkills', e.target.value)}
                input={<OutlinedInput label="Preferred Skills to Work With" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {primaryRoleOptions.filter(option => option !== 'Other').map((option) => (
                  <MenuItem key={option} value={option}>
                    <Checkbox checked={(formData.teamMatchingPreferences?.preferredSkills || []).indexOf(option) > -1} />
                    <ListItemText primary={option} />
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Select skills you'd like in your teammates</FormHelperText>
            </FormControl>
            
            <FormControl fullWidth required sx={{ mb: 3 }}>
              <InputLabel id="preferred-causes-label">Preferred Social Causes</InputLabel>
              <Select
                labelId="preferred-causes-label"
                id="preferred-causes"
                multiple
                value={formData.teamMatchingPreferences?.preferredCauses || []}
                onChange={(e) => handleTeamMatchingChange('preferredCauses', e.target.value)}
                input={<OutlinedInput label="Preferred Social Causes" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {socialCausesOptions.filter(option => option !== 'Other').map((option) => (
                  <MenuItem key={option} value={option}>
                    <Checkbox checked={(formData.teamMatchingPreferences?.preferredCauses || []).indexOf(option) > -1} />
                    <ListItemText primary={option} />
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Select causes you'd like to work on</FormHelperText>
            </FormControl>
          </Box>
        )}
        
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="workshop-interests-label">Workshop Interests (Optional)</InputLabel>
          <Select
            labelId="workshop-interests-label"
            id="workshop-interests"
            multiple
            value={formData.workshopInterests || []}
            onChange={(e) => customHandleMultiSelectChange(e, 'workshopInterests')}
            input={<OutlinedInput label="Workshop Interests (Optional)" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
          >
            {workshopOptions.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox checked={(formData.workshopInterests || []).indexOf(option) > -1} />
                <ListItemText primary={option} />
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>Select workshops you're interested in attending</FormHelperText>
        </FormControl>
        
        <FormControlLabel
          control={
            <Checkbox
              name="willContinue"
              checked={formData.willContinue || false}
              onChange={handleChange}
              color="primary"
            />
          }
          label="I'm interested in continuing project development after the hackathon"
          sx={{ mb: 2, display: 'block' }}
        />
      </Box>
    </Box>
  );
  
  // Render review form
  const renderReviewForm = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
        Review & Submit
      </Typography>
      
      <TextField
        label="Any additional information or questions?"
        name="additionalInfo"
        multiline
        rows={4}
        fullWidth
        value={formData.additionalInfo || ''}
        onChange={handleChange}
        sx={{ mb: 4 }}
      />
      
      <FormControlLabel
        control={
          <Checkbox
            name="codeOfConduct"
            checked={formData.codeOfConduct || false}
            onChange={handleChange}
            color="primary"
            required
          />
        }
        label={
          <Typography variant="body2">
            I agree to the{" "}
            <Link
              href="/hack/code-of-conduct"
              target="_blank"
              rel="noopener noreferrer"
            >
              Code of Conduct
            </Link>
          </Typography>
        }
        sx={{ mb: 2 }}
      />
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          By submitting this form, you're expressing interest in participating in Opportunity Hack. 
          We'll review your application and send you further details about the event.
        </Typography>
      </Alert>
    </Box>
  );
  
  // Function to render the current step form
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderBasicInfoForm();
      case 1:
        return renderSkillsAndExperienceForm();
      case 2:
        return renderLocationDemographicsForm();
      case 3:
        return renderInterestsTeamsForm();
      case 4:
        return renderReviewForm();
      default:
        return 'Unknown step';
    }
  };
  
  // SEO metadata and descriptions
  const pageTitle = eventData 
    ? `Hacker Application for ${eventData.name} - Opportunity Hack`
    : "Hacker Application - Opportunity Hack";
  const pageDescription = eventData
    ? `Apply to be a hacker for ${eventData.name} in ${eventData.location}. Join a team to create tech solutions for nonprofits and make a real impact.`
    : "Apply to be a hacker for our social good hackathon. Join a team to create tech solutions for nonprofits and make a real impact.";
  const canonicalUrl = `https://ohack.dev/hack/${event_id}/hacker-application`;
  
  const imageUrl = eventData?.image || "https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp";

  // If form submitted successfully, show success message
  if (success) {
    return (
      <Container>
        <Head>
          <title>{pageTitle}</title>
          <meta name="description" content={pageDescription} />
          <link rel="canonical" href={canonicalUrl} />
        </Head>
        
        <Box my={8} textAlign="center">
          <Typography variant="h1" component="h1" sx={{ fontSize: '2.5rem', mb: 4, mt: 12 }}>
            Application Submitted!
          </Typography>
          
          <Alert severity="success" sx={{ mb: 4, mx: 'auto', maxWidth: 600 }}>
            Thank you for applying to participate in Opportunity Hack. We'll review your application and contact you with next steps soon.
          </Alert>
          
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push(`/hack/${event_id}`)}
            sx={{ mt: 2 }}
          >
            Return to Hackathon Page
          </Button>
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
          content="hackathon, hacker application, tech for good, nonprofit hackathon, opportunity hack, coding for social good, volunteer, tech projects"
        />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph tags */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta
          property="og:image"
          content={imageUrl}
        />

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta
          name="twitter:image"
          content={imageUrl}
        />
      </Head>

      {/* Form persistence notification component */}
      <FormPersistenceControls
        onSave={handleManualSave}
        onRestore={loadFromLocalStorage}
        onClear={clearSavedData}
        notification={notification}
        onCloseNotification={closeNotification}
      />

      <Box ref={formRef}>
        <Typography
          variant="h1"
          component="h1"
          sx={{ fontSize: "2.5rem", mb: 2, mt: 0 }}
        >
          Hacker Application
        </Typography>

        {isLoading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {eventData && (
              <>
                <Typography
                  variant="h2"
                  component="h2"
                  sx={{ fontSize: "1.75rem", mb: 1 }}
                >
                  {eventData.name}
                </Typography>
                
                <Typography 
                  variant="h3" 
                  component="h3" 
                  sx={{ 
                    fontSize: "1.25rem", 
                    mb: 1,
                    color: "text.secondary" 
                  }}
                >
                  {eventData.location}
                </Typography>
                
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    mb: 3,
                    color: "text.secondary",
                    display: "flex",
                    alignItems: "center",
                    gap: 1
                  }}
                >
                  <Box component="span" sx={{ display: "inline-flex", alignItems: "center" }}>
                    📆 {eventData.formattedStartDate}
                  </Box>
                  {eventData.formattedStartDate !== eventData.formattedEndDate && (
                    <>
                      <Box component="span" sx={{ mx: 0.5 }}>to</Box>
                      <Box component="span" sx={{ display: "inline-flex", alignItems: "center" }}>
                        {eventData.formattedEndDate}
                      </Box>
                    </>
                  )}
                </Typography>
              </>
            )}

            {/* Add ApplicationNav component */}
            {event_id && <ApplicationNav eventId={event_id} currentType="hacker" />}

            <Box sx={{ mb: 4 }}>
              <Stepper
                activeStep={activeStep}
                alternativeLabel={!isMobile}
                orientation={isMobile ? "horizontal" : "horizontal"}
                sx={{ 
                  mb: 4,
                  ...(isMobile && {
                    '& .MuiStepLabel-root': {
                      padding: '0 4px', // Reduce padding on mobile
                    },
                    '& .MuiStepLabel-labelContainer': {
                      width: 'auto', // Let the label container be as small as possible
                    },
                    '& .MuiStepLabel-label': {
                      fontSize: '0.7rem', // Smaller text on mobile
                      whiteSpace: 'nowrap', // Prevent text wrapping
                    },
                    '& .MuiSvgIcon-root': {
                      width: 20, // Smaller icons
                      height: 20,
                    },
                    overflowX: 'auto', // Allow horizontal scrolling if needed
                    '&::-webkit-scrollbar': {
                      display: 'none' // Hide scrollbar on webkit browsers
                    },
                    scrollbarWidth: 'none', // Hide scrollbar on Firefox
                  })
                }}
              >
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{isMobile ? (
                      // On mobile, show abbreviated labels or just the step number
                      activeStep === steps.indexOf(label) ? label : (steps.indexOf(label) + 1)
                    ) : (
                      // On desktop, show full labels
                      label
                    )}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
                <Typography variant="body1" paragraph>
                  Thank you for your interest in participating as a hacker at Opportunity Hack! Hackers like you build
                  innovative solutions for nonprofits that make a real difference in their communities.
                </Typography>
                
                {eventData && eventData.description && (
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    <strong>About this event:</strong> {eventData.description}
                  </Typography>
                )}
                
                <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 4 }}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>What to expect as a hacker:</strong>
                  </Typography>
                  <ul style={{ marginBottom: 0, paddingLeft: '1.5rem' }}>
                    <li>Work in teams to develop solutions for nonprofit challenges</li>
                    <li>Gain experience with new technologies and collaboration tools</li>
                    <li>Learn from mentors and nonprofit partners about social impact</li>
                    <li>Present your solution to judges and compete for prizes</li>
                    <li>Build your portfolio and network with tech professionals</li>
                  </ul>
                </Alert>
                
                {error && (
                  <Alert severity="error" sx={{ mb: 4 }}>
                    {error}
                  </Alert>
                )}

                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                  {getStepContent(activeStep)}
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button
                      disabled={activeStep === 0 || submitting}
                      onClick={handleBack}
                      variant="outlined"
                    >
                      Back
                    </Button>
                    
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleNext}
                      disabled={submitting}
                    >
                      {activeStep === steps.length - 1 ? (
                        submitting ? <CircularProgress size={24} /> : 'Submit Application'
                      ) : (
                        'Next'
                      )}
                    </Button>
                  </Box>
                </form>
              </Paper>
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default HackerApplicationPage;