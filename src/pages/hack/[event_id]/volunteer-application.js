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

const VolunteerApplicationPage = () => {
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
    bio: '',
    company: '',
    title: '',
    linkedin: '',
    github: '',
    portfolio: '',
    country: '',
    state: '',
    inPerson: '',
    availability: '',
    experienceLevel: '',
    volunteerType: [],
    otherVolunteerType: '',
    skills: [],
    otherSkills: '',
    socialCauses: [],
    otherSocialCause: '',
    motivation: '',
    previousExperience: '',
    codeOfConduct: false,
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
    formType: 'volunteer',
    eventId: event_id || '',
    userId: user?.userId || '',
    initialFormData,
    apiServerUrl: apiServerUrl || '',
    accessToken: accessToken || ''
  });
  
  // Experience level options
  const experienceLevelOptions = [
    'First-time volunteer',
    'Some volunteering experience (1-3 events)',
    'Experienced volunteer (4+ events)'
  ];

  // Volunteer type options
  const volunteerTypeOptions = [
    'Product Management',
    'Project Coordination',
    'Event Organization',
    'Technical Support',
    'Mentoring',
    'Documentation',
    'Content Creation',
    'Marketing/Communications',
    'Design',
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
    'SQL Databases',
    'NoSQL Databases',
    'API Development',
    'Cloud Computing (AWS, Azure, GCP)',
    'DevOps',
    'Mobile Development',
    'UI/UX Design',
    'Product Management',
    'Project Management',
    'Technical Writing',
    'Content Creation',
    'Marketing',
    'Social Media',
    'Data Analysis',
    'Public Speaking',
    'Community Building',
    'Event Planning',
    'Education/Training',
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
    'Technology Access',
    'Youth Development',
    'Arts & Culture',
    'Civil Rights',
    'Other'
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
  
  // Custom implementation for multi-select changes
  const customHandleMultiSelectChange = useCallback((event, fieldName) => {
    handleMultiSelectChange(event, fieldName);
    
    // Clear otherVolunteerType when Other is removed from volunteerType
    if (fieldName === 'volunteerType' && !event.target.value.includes('Other')) {
      setFormData(prev => ({
        ...prev,
        otherVolunteerType: ''
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
        
        // Fetch event data from the API
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
                    bio: prevData.bio || prevData.shortBio || '',
                    company: prevData.company || prevData.companyName || '',
                    title: prevData.title || '',
                    linkedin: prevData.linkedin || prevData.linkedinProfile || '',
                    github: prevData.github || '',
                    portfolio: prevData.portfolio || '',
                    country: prevData.country || '',
                    state: prevData.state || '',
                    inPerson: prevData.inPerson || (prevData.isInPerson ? 'Yes' : 'No'),
                    availability: prevData.availability || '',
                    experienceLevel: prevData.experienceLevel || '',
                    volunteerType: parsePreviousArrayField('volunteerType'),
                    otherVolunteerType: prevData.otherVolunteerType || '',
                    skills: parsePreviousArrayField('skills'),
                    otherSkills: prevData.otherSkills || '',
                    socialCauses: parsePreviousArrayField('socialCauses'),
                    otherSocialCause: prevData.otherSocialCause || '',
                    motivation: prevData.motivation || '',
                    previousExperience: prevData.previousExperience || '',
                    codeOfConduct: prevData.codeOfConduct || prevData.agreedToCodeOfConduct || false,
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
    const requiredFields = ['email', 'name', 'company'];
    
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
    
    setError('');
    return true;
  };
  
  const validateSkillsInfo = () => {
    // Validate volunteer types
    if (!formData.volunteerType || formData.volunteerType.length === 0) {
      setError('Please select at least one volunteer type');
      return false;
    }
    
    // Check for "Other" volunteer type
    if (formData.volunteerType.includes('Other') && !formData.otherVolunteerType) {
      setError('Please specify your other volunteer type');
      return false;
    }
    
    // Validate skills
    if (!formData.skills || formData.skills.length === 0) {
      setError('Please select at least one skill');
      return false;
    }
    
    // Check for "Other" skill
    if (formData.skills.includes('Other') && !formData.otherSkills) {
      setError('Please specify your other skills');
      return false;
    }
    
    setError('');
    return true;
  };
  
  const validateAvailabilityInfo = () => {
    const requiredFields = ['inPerson', 'country', 'state'];
    
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`Please fill out the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field`);
        return false;
      }
    }
    
    if (!formData.availability) {
      setError('Please provide your availability');
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
    
    // Validate motivation
    if (!formData.motivation) {
      setError('Please share your motivation for volunteering with Opportunity Hack');
      return false;
    }
    
    setError('');
    return true;
  };

  const validateForm = () => {
    return (
      validateBasicInfo() &&
      validateSkillsInfo() &&
      validateAvailabilityInfo() &&
      validateInterestsInfo() &&
      formData.codeOfConduct
    );
  };

  const handleNext = () => {
    if (activeStep === 0 && !validateBasicInfo()) return;
    if (activeStep === 1 && !validateSkillsInfo()) return;
    if (activeStep === 2 && !validateAvailabilityInfo()) return;
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
        // Process volunteerType with otherVolunteerType if needed
        volunteerType: formData.volunteerType.includes('Other') 
          ? [...formData.volunteerType.filter(t => t !== 'Other'), formData.otherVolunteerType].join(', ')
          : formData.volunteerType.join(', '),
        // Process skills with otherSkills if needed  
        skills: formData.skills.includes('Other')
          ? [...formData.skills.filter(s => s !== 'Other'), formData.otherSkills].join(', ')
          : formData.skills.join(', '),
        // Process socialCauses with otherSocialCause if needed
        socialCauses: formData.socialCauses.includes('Other')
          ? [...formData.socialCauses.filter(c => c !== 'Other'), formData.otherSocialCause].join(', ')
          : formData.socialCauses.join(', '),
        // Convert boolean values
        isInPerson: formData.inPerson === "Yes",
        // Add type information
        type: 'volunteers',
        volunteer_type: 'volunteer',
        agreedToCodeOfConduct: formData.codeOfConduct,
        linkedinProfile: formData.linkedin,
        shortBio: formData.bio
      };
      
      if (apiServerUrl) {
        // Submit to API
        const submitEndpoint = previouslySubmitted 
          ? `${apiServerUrl}/api/volunteer/application/${event_id}/update` 
          : `${apiServerUrl}/api/volunteer/application/${event_id}/submit`;
        
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
        console.log('Submitting volunteer application:', submissionData);
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
  const steps = ['Basic Info', 'Skills & Experience', 'Availability', 'Interests', 'Review'];

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
          onChange={handleFormChange}
          sx={{ mb: 3 }}
        />
        
        <TextField
          label="Your Name"
          name="name"
          required
          fullWidth
          value={formData.name || ''}
          onChange={handleFormChange}
          sx={{ mb: 3 }}
        />
        
        <TextField
          label="Your Pronouns (Optional)"
          name="pronouns"
          fullWidth
          value={formData.pronouns || ''}
          onChange={handleFormChange}
          sx={{ mb: 3 }}
        />
        
        <TextField
          label="Company or Organization"
          name="company"
          required
          fullWidth
          value={formData.company || ''}
          onChange={handleFormChange}
          sx={{ mb: 3 }}
        />
        
        <TextField
          label="Job Title"
          name="title"
          fullWidth
          value={formData.title || ''}
          onChange={handleFormChange}
          sx={{ mb: 3 }}
        />
        
        <TextField
          label="Short bio"
          name="bio"
          multiline
          rows={3}
          fullWidth
          value={formData.bio || ''}
          onChange={handleFormChange}
          helperText="Tell us a bit about yourself (aim for 100-200 words)"
          sx={{ mb: 3 }}
        />
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
        <FormControl fullWidth required sx={{ mb: formData.volunteerType?.includes('Other') ? 1 : 3 }}>
          <InputLabel id="volunteer-type-label">How would you like to volunteer?</InputLabel>
          <Select
            labelId="volunteer-type-label"
            id="volunteer-type"
            multiple
            value={formData.volunteerType || []}
            onChange={(e) => customHandleMultiSelectChange(e, 'volunteerType')}
            input={<OutlinedInput label="How would you like to volunteer?" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
          >
            {volunteerTypeOptions.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox checked={(formData.volunteerType || []).indexOf(option) > -1} />
                <ListItemText primary={option} />
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>Select all that apply</FormHelperText>
        </FormControl>
        
        {formData.volunteerType?.includes('Other') && (
          <TextField
            label="Please specify how you'd like to volunteer"
            name="otherVolunteerType"
            required
            fullWidth
            value={formData.otherVolunteerType || ''}
            onChange={handleFormChange}
            helperText="Tell us about your specific role or interest"
            sx={{ mb: 3 }}
          />
        )}
        
        <FormControl fullWidth required sx={{ mb: formData.skills?.includes('Other') ? 1 : 3 }}>
          <InputLabel id="skills-label">What skills can you contribute?</InputLabel>
          <Select
            labelId="skills-label"
            id="skills"
            multiple
            value={formData.skills || []}
            onChange={(e) => customHandleMultiSelectChange(e, 'skills')}
            input={<OutlinedInput label="What skills can you contribute?" />}
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
          <FormHelperText>Select all skills that you can contribute (select at least one)</FormHelperText>
        </FormControl>
        
        {formData.skills?.includes('Other') && (
          <TextField
            label="Please specify your other skills"
            name="otherSkills"
            required
            fullWidth
            value={formData.otherSkills || ''}
            onChange={handleFormChange}
            helperText="Tell us about your other skills"
            sx={{ mb: 3 }}
          />
        )}
        
        <TextField
          label="Previous Experience (Optional)"
          name="previousExperience"
          multiline
          rows={3}
          fullWidth
          value={formData.previousExperience || ''}
          onChange={handleFormChange}
          helperText="Share any relevant volunteer or professional experience"
          sx={{ mb: 3 }}
        />
        
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="experience-level-label">Volunteer Experience Level</InputLabel>
          <Select
            labelId="experience-level-label"
            id="experience-level"
            name="experienceLevel"
            value={formData.experienceLevel || ''}
            onChange={handleFormChange}
            label="Volunteer Experience Level"
          >
            {experienceLevelOptions.map(option => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
          <FormHelperText>How much experience do you have with volunteering?</FormHelperText>
        </FormControl>
        
        <TextField
          label="LinkedIn Profile (Optional)"
          name="linkedin"
          type="url"
          fullWidth
          value={formData.linkedin || ''}
          onChange={handleFormChange}
          sx={{ mb: 3 }}
          placeholder="https://linkedin.com/in/yourprofile"
        />
        
        <TextField
          label="GitHub Profile (Optional)"
          name="github"
          type="url"
          fullWidth
          value={formData.github || ''}
          onChange={handleFormChange}
          sx={{ mb: 3 }}
          placeholder="https://github.com/yourusername"
        />
        
        <TextField
          label="Portfolio/Personal Website (Optional)"
          name="portfolio"
          type="url"
          fullWidth
          value={formData.portfolio || ''}
          onChange={handleFormChange}
          sx={{ mb: 3 }}
          placeholder="https://yourwebsite.com"
        />
      </Box>
    </Box>
  );
  
  // Render availability form
  const renderAvailabilityForm = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
        Availability & Location
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <FormControl required component="fieldset" sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Are you joining us in-person or virtually?
          </Typography>
          <RadioGroup
            name="inPerson"
            value={formData.inPerson || ''}
            onChange={handleFormChange}
          >
            <FormControlLabel value="Yes" control={<Radio />} label="Yes, I'll attend in person" />
            <FormControlLabel value="No" control={<Radio />} label="No, I'll participate virtually" />
          </RadioGroup>
        </FormControl>
        
        <TextField
          label="Country"
          name="country"
          required
          fullWidth
          value={formData.country || ''}
          onChange={handleFormChange}
          sx={{ mb: 3 }}
        />
        
        <TextField
          label="State/Province"
          name="state"
          required
          fullWidth
          value={formData.state || ''}
          onChange={handleFormChange}
          sx={{ mb: 3 }}
        />
        
        <TextField
          label="Availability"
          name="availability"
          required
          multiline
          rows={3}
          fullWidth
          value={formData.availability || ''}
          onChange={handleFormChange}
          helperText="Please provide details about when you're available to volunteer during the event"
          sx={{ mb: 3 }}
        />
      </Box>
    </Box>
  );
  
  // Render interests form
  const renderInterestsForm = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
        Interests & Motivation
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
            onChange={handleFormChange}
            helperText="Tell us about your specific interest"
            sx={{ mb: 3 }}
          />
        )}
        
        <TextField
          label="What motivates you to volunteer with Opportunity Hack?"
          name="motivation"
          multiline
          rows={3}
          required
          fullWidth
          value={formData.motivation || ''}
          onChange={handleFormChange}
          helperText="Share your motivation for getting involved"
          sx={{ mb: 3 }}
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
        onChange={handleFormChange}
        sx={{ mb: 4 }}
      />
      
      <FormControlLabel
        control={
          <Checkbox
            name="codeOfConduct"
            checked={formData.codeOfConduct || false}
            onChange={handleFormChange}
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
          By submitting this form, you're expressing interest in volunteering with Opportunity Hack. 
          We'll review your application and send you further details about how you can contribute.
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
        return renderAvailabilityForm();
      case 3:
        return renderInterestsForm();
      case 4:
        return renderReviewForm();
      default:
        return 'Unknown step';
    }
  };
  
  // SEO metadata and descriptions
  const pageTitle = eventData 
    ? `Volunteer Application for ${eventData.name} - Opportunity Hack`
    : "Volunteer Application - Opportunity Hack";
  const pageDescription = eventData
    ? `Apply to volunteer for ${eventData.name} in ${eventData.location}. Help support the hackathon and make a real impact.`
    : "Apply to volunteer for our social good hackathon. Help support the event and make a real impact.";
  const canonicalUrl = `https://ohack.dev/hack/${event_id}/volunteer-application`;
  
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
            Thank you for applying to volunteer with Opportunity Hack. We'll review your application and contact you with next steps soon.
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
          content="hackathon volunteer, volunteer application, tech for good, nonprofit hackathon, opportunity hack, social good, volunteer, community service"
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
          Volunteer Application
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
            {event_id && <ApplicationNav eventId={event_id} currentType="volunteer" />}

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
                  Thank you for your interest in volunteering with Opportunity Hack! Volunteers play a crucial role
                  in the success of our events and help create a supportive environment for participants.
                </Typography>
                
                {eventData && eventData.description && (
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    <strong>About this event:</strong> {eventData.description}
                  </Typography>
                )}
                
                <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 4 }}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>What to expect as a volunteer:</strong>
                  </Typography>
                  <ul style={{ marginBottom: 0, paddingLeft: '1.5rem' }}>
                    <li>Support the organization and logistics of the hackathon</li>
                    <li>Help participants navigate the event and find resources</li>
                    <li>Contribute your skills to make the event a success</li>
                    <li>Connect with a community passionate about social impact</li>
                    <li>Gain experience and build your network</li>
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

export default VolunteerApplicationPage;