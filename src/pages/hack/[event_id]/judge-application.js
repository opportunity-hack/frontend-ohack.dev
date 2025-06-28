import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuthInfo, RequiredAuthProvider, RedirectToLogin } from "@propelauth/react";
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
  RadioGroup,
  Radio,
  Paper,
  Divider,
  Alert,
  Link,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  ListItemText,
  Chip,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  useMediaQuery
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Head from 'next/head';
import Script from 'next/script';
import { useEnv } from '../../../context/env.context';
import LoginOrRegister from '../../../components/LoginOrRegister/LoginOrRegister2';
import ApplicationNav from '../../../components/ApplicationNav/ApplicationNav';
import Breadcrumbs from '../../../components/Breadcrumbs/Breadcrumbs';
import InfoIcon from '@mui/icons-material/Info';
import FormPersistenceControls from '../../../components/FormPersistenceControls';
import { useFormPersistence } from '../../../hooks/use-form-persistence';
import { useRecaptcha } from '../../../hooks/use-recaptcha';

const JudgeApplicationComponent = () => {
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
  
  // reCAPTCHA integration
  const { 
    initializeRecaptcha, 
    getRecaptchaToken, 
    isLoading: recaptchaLoading, 
    error: recaptchaError,
    setError: setRecaptchaError 
  } = useRecaptcha();
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  
  // Prevent duplicate confirmation dialogs
  const confirmationShownRef = useRef(false);
  
  // Initial form state
  const initialFormData = {
    timestamp: new Date().toISOString(),
    email: '',
    selected: false,    
    name: '',
    title: '',
    biography: '',
    whyJudge: '',
    availability: '',
    canAttendJudging: '', // New field for judging availability confirmation
    inPerson: '',
    additionalInfo: '',
    companyName: '',
    codeOfConduct: false,
    backgroundAreas: [], // Changed from string to array
    otherBackground: '', // New field for "Other" option
    participationCount: '', // Added participation count field
    agreedToCodeOfConduct: false,
    linkedinProfile: '',
    shortBio: '',
    photoUrl: '',
    pronouns: '',
    country: '',
    state: '',
    event_id: '' // Ensure event_id is included
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
    formType: 'judge',
    eventId: event_id,
    userId: user?.userId,
    initialFormData,
    apiServerUrl,
    accessToken
  });
  
  // Common background areas for judges
  const backgroundOptions = [
    "Software Development",
    "Product Management",
    "UX/UI Design",
    "Data Science & Analytics",
    "Cloud Architecture",
    "Nonprofit Experience",
    "Entrepreneurship",
    "Digital Marketing",
    "Project Management",
    "Business Strategy",
    "Cybersecurity",
    "Education Technology",
    "AI/Machine Learning",
    "Healthcare Technology",
    "Other" // Option to specify custom background
  ];

  // fetch event data from the backend API
  useEffect(() => {
    // Initialize reCAPTCHA when component mounts
    initializeRecaptcha();
    
    if (!event_id || !apiServerUrl) return;

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
        
        // Use UTC methods to avoid timezone conversion issues
        const formattedStartDate = new Date(eventData.start_date + 'T00:00:00Z').toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'UTC'
        });
        const formattedEndDate = new Date(eventData.end_date + 'T00:00:00Z').toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'UTC'
        });
        
        // Check if event is in the past (with 1-day buffer)
        const now = new Date();
        const oneDayBuffer = 24 * 60 * 60 * 1000; // 1 day in milliseconds
        const isEventPast = new Date(endDate.getTime() + oneDayBuffer) < now;
        
        setEventData({
          name: eventData.title || `Opportunity Hack - ${event_id}`,
          description: eventData.description || "Annual hackathon for nonprofits",
          date: new Date(eventData.start_date).getFullYear().toString(),
          startDate: eventData.start_date,
          endDate: eventData.end_date,
          formattedStartDate,
          formattedEndDate,
          location: eventData.location || "Tempe, Arizona",
          image: eventData.image_url || "https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp",
          isEventPast
        });
        
        // Initialize form data with event_id
        setFormData(prevFormData => ({
          ...prevFormData,
          event_id: event_id
        }));
        
        // Process user information if available
        if (user) {
          setFormData(prevFormData => ({
            ...prevFormData,
            email: user.email || prevFormData.email,
            name: user.firstName && user.lastName 
              ? `${user.firstName} ${user.lastName}` 
              : user.username || prevFormData.name,
          }));
          
          // Then try to load previous submission
          try {
            const prevData = await loadPreviousSubmission();
            if (prevData && !confirmationShownRef.current) {
              confirmationShownRef.current = true;
              // If the user has submitted before, ask if they want to load it
              if (window.confirm('We found a previous application. Would you like to load it for editing?')) {
                // Transform API data to match our form structure
                const transformedData = {
                  ...formData,
                  email: prevData.email || formData.email,
                  name: prevData.name || formData.name,
                  pronouns: prevData.pronouns || '',
                  title: prevData.title || '',
                  biography: prevData.biography || prevData.shortBio || '',
                  whyJudge: prevData.whyJudge || '',
                  availability: prevData.availability || '',
                  canAttendJudging: prevData.canAttendJudging || '',
                  inPerson: prevData.inPerson || '',
                  additionalInfo: prevData.additionalInfo || '',
                  companyName: prevData.companyName || '',
                  backgroundAreas: Array.isArray(prevData.backgroundAreas) 
                    ? prevData.backgroundAreas 
                    : (prevData.backgroundAreas || prevData.background || '').split(', ').filter(Boolean),
                  otherBackground: prevData.otherBackground || '', 
                  participationCount: prevData.participationCount || '',
                  codeOfConduct: Boolean(prevData.agreedToCodeOfConduct),
                  country: prevData.country || '',
                  state: prevData.state || '',
                  event_id: event_id,
                  linkedinProfile: prevData.linkedinProfile || '',
                  shortBio: prevData.shortBio || '',
                  photoUrl: prevData.photoUrl || ''
                };
                
                setFormData(transformedData);
                
                // If there's a photo URL, set the preview
                if (prevData.photoUrl) {
                  setPhotoPreview(prevData.photoUrl);
                }
              } else {
                // If user declined to load previous submission, load from localStorage instead
                loadFromLocalStorage();
              }
            } else {
              // If no previous submission, load from localStorage
              loadFromLocalStorage();
            }
          } catch (err) {
            console.error('Error loading previous submission:', err);
            // Fallback to localStorage if API call fails
            loadFromLocalStorage();
          }
        } else {
          // For non-logged in users, try localStorage
          console.log('User not logged in, loading from localStorage');
          loadFromLocalStorage();
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching event data:', err);
        setError('Failed to load event data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [event_id, apiServerUrl, user, setFormData, loadPreviousSubmission, loadFromLocalStorage, initializeRecaptcha]);

  // Extend handleFormChange to handle otherBackground field
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      handleFormChange(e);
    } else {
      handleFormChange(e);
      
      // Additional logic for backgroundAreas
      if (name === 'backgroundAreas' && !value.includes('Other')) {
        setFormData(prev => ({
          ...prev,
          otherBackground: ''
        }));
      }
    }
  };
  
  // Extend handleMultiSelectChange to handle otherBackground field
  const customHandleMultiSelectChange = (event, fieldName) => {
    handleMultiSelectChange(event, fieldName);
    
    // Clear otherBackground when Other is removed from backgroundAreas
    if (fieldName === 'backgroundAreas' && !event.target.value.includes('Other')) {
      setFormData(prev => ({
        ...prev,
        otherBackground: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file is too large. Please choose an image under 5MB.');
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Selected file is not an image. Please select an image file.');
      return;
    }
    
    setPhotoFile(file);
    setError(''); // Clear any previous errors
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.onerror = () => {
      setError('Failed to read the selected file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  // Define steps for stepper
  const steps = ['Basic Info', 'Background & Experience', 'Availability', 'Finish'];

  const handleNext = () => {
    if (activeStep === 0 && !validateBasicInfo()) return;
    if (activeStep === 1 && !validateBackgroundAndExperience()) return;
    if (activeStep === 2 && !validateAvailability()) return;
    
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };
  
  const validateBasicInfo = () => {
    const requiredFields = ['email', 'name'];
    
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
  
  const validateBackgroundAndExperience = () => {
    const requiredFields = ['participationCount'];
    
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`Please fill out the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field`);
        return false;
      }
    }
    
    // Validate backgroundAreas field
    if (!formData.backgroundAreas || formData.backgroundAreas.length === 0) {
      setError('Please select at least one background area');
      return false;
    }
    
    // Validate otherBackground if "Other" is selected
    if (formData.backgroundAreas.includes('Other') && !formData.otherBackground) {
      setError('Please specify your other background area');
      return false;
    }
    
    setError('');
    return true;
  };
  
  const validateAvailability = () => {
    const requiredFields = ['inPerson', 'canAttendJudging'];
    
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`Please fill out the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field`);
        return false;
      }
    }
    
    setError('');
    return true;
  };

  const validateForm = () => {
    return (
      validateBasicInfo() &&
      validateBackgroundAndExperience() &&
      validateAvailability() &&
      formData.codeOfConduct
    );
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
      // Get reCAPTCHA token
      const recaptchaToken = await getRecaptchaToken();

      // If we couldn't get a token and we're in production, show error
      if (!recaptchaToken && process.env.NODE_ENV === "production") {
        setError(
          "Failed to verify you are human. Please refresh the page and try again."
        );
        return;
      }

      // Process background areas for submission - ensure consistent formatting
      const backgroundAreasFormatted =
        formData.backgroundAreas && Array.isArray(formData.backgroundAreas)
          ? formData.backgroundAreas.includes("Other")
            ? [
                ...formData.backgroundAreas.filter((area) => area !== "Other"),
                formData.otherBackground,
              ].join(", ")
            : formData.backgroundAreas.join(", ")
          : "";

      // Create a complete submission object with all required fields
      const submissionData = {
        ...formData,
        timestamp: new Date().toISOString(),
        photoUrl: photoPreview || formData.photoUrl || "", // Use preview if available
        background: backgroundAreasFormatted, // Replace the original background field with formatted list
        backgroundAreas: backgroundAreasFormatted, // Include both formats for compatibility
        volunteer_type: "judge",
        isInPerson: formData.inPerson === "Yes",
        isSelected: false, // Default to false, admin will select later
        agreedToCodeOfConduct: Boolean(formData.codeOfConduct),
        type: "judges",
        shortBio: formData.biography || "", // Map to appropriate field
        shortBiography: formData.biography || "", // Ensure we have both formats
        recaptchaToken, // Add reCAPTCHA token
      };

      if (apiServerUrl) {
        // Submit to API - use the correct endpoint based on whether this is an update
        const submitEndpoint = previouslySubmitted
          ? `${apiServerUrl}/api/judge/application/${event_id}/update`
          : `${apiServerUrl}/api/judge/application/${event_id}/submit`;

        const response = await fetch(submitEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(submissionData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          if (errorData?.error?.includes("recaptcha")) {
            throw new Error(
              "reCAPTCHA verification failed. Please refresh the page and try again."
            );
          }
          throw new Error(
            `Failed to submit application: ${response.status}${errorData ? ` - ${errorData.message}` : ""}`
          );
        }
      } else {
        // In a test environment, log the data and simulate API delay
        console.log("Submitting judge application:", submissionData);
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      // Clear saved form data after successful submission only if they are logged in
      // This is to prevent data loss for users who are not logged in where we don't have their login id
      if (isLoggedIn) {
        clearSavedData();
      }

      setSuccess(true);
    } catch (err) {
      console.error('Error submitting application:', err);
      setError(`Failed to submit your application. ${err.message || 'Please try again.'}`);
    } finally {
      setSubmitting(false);
    }
  };
  
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
          value={formData.email}
          onChange={handleChange}
          sx={{ mb: 3 }}
        />

        <TextField
          label="Your Name"
          name="name"
          required
          fullWidth
          value={formData.name}
          onChange={handleChange}
          sx={{ mb: 3 }}
        />

        <TextField
          label="Pronouns"
          name="pronouns"
          fullWidth
          value={formData.pronouns}
          onChange={handleChange}
          helperText="e.g. he/him, she/her, they/them"
          sx={{ mb: 3 }}
        />

        <TextField
          label="Your Title"
          name="title"
          fullWidth
          value={formData.title}
          onChange={handleChange}
          sx={{ mb: 3 }}
          helperText="e.g. Software Engineer, Product Manager, etc."
        />

        <TextField
          label="Company Name"
          name="companyName"
          fullWidth
          value={formData.companyName}
          onChange={handleChange}
          sx={{ mb: 3 }}          
        />

        <TextField
          label="LinkedIn Profile"
          name="linkedinProfile"
          fullWidth
          value={formData.linkedinProfile}
          onChange={handleChange}
          helperText="Optional - link to your LinkedIn profile"
          sx={{ mb: 3 }}
        />
      </Box>
    </Box>
  );
  
  // Render background and experience form
  const renderBackgroundAndExperienceForm = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
        Background & Experience
      </Typography>
      
      <Box sx={{ mb: 3 }}>       
        <FormControl fullWidth required sx={{ mb: 3 }}>
          <InputLabel id="participation-count-label">How many times have you participated in Opportunity Hack?</InputLabel>
          <Select
            labelId="participation-count-label"
            id="participation-count"
            name="participationCount"
            value={formData.participationCount}
            onChange={handleChange}
            label="How many times have you participated in Opportunity Hack?"
          >
            <MenuItem value="This is my first year! 👆">This is my first year! 👆</MenuItem>
            <MenuItem value="This will be the 2nd time ✌️">This will be the 2nd time ✌️</MenuItem>
            <MenuItem value="This will be the 3rd time ☘️">This will be the 3rd time ☘️</MenuItem>
            <MenuItem value="I've been here 4+ times 🔥">I've been here 4+ times 🔥</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl fullWidth required sx={{ mb: formData.backgroundAreas.includes('Other') ? 1 : 3 }}>
          <InputLabel id="background-areas-label">Which areas best describe your background?</InputLabel>
          <Select
            labelId="background-areas-label"
            id="background-areas"
            multiple
            value={formData.backgroundAreas}
            onChange={(e) => customHandleMultiSelectChange(e, 'backgroundAreas')}
            input={<OutlinedInput label="Which areas best describe your background?" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
          >
            {backgroundOptions.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox checked={formData.backgroundAreas.indexOf(option) > -1} />
                <ListItemText primary={option} />
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>Select all areas that apply to your expertise</FormHelperText>
        </FormControl>
        
        {formData.backgroundAreas.includes('Other') && (
          <TextField
            label="Please specify your background"
            name="otherBackground"
            required
            fullWidth
            value={formData.otherBackground}
            onChange={handleChange}
            helperText="Tell us about your specific area of expertise"
            sx={{ mb: 3 }}
          />
        )}
        
        <TextField
          label="A (short) biography - aim for 200 words"
          name="biography"
          multiline
          rows={4}
          fullWidth
          value={formData.biography}
          onChange={handleChange}
          helperText="Tell us about your professional background and expertise"
          sx={{ mb: 3 }}
        />
        
        <TextField
          label="Why do you want to be a judge for Opportunity Hack?"
          name="whyJudge"
          multiline
          rows={3}
          fullWidth
          value={formData.whyJudge}
          onChange={handleChange}
          sx={{ mb: 3 }}
        />
        
        <Box sx={{ mb: 3 }}>
          <InputLabel htmlFor="photo-upload" sx={{ mb: 1 }}>
            A photo of you we can use on the DevPost site
          </InputLabel>
          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            sx={{ mb: 1 }}
          >
            Upload Photo
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileChange}
            />
          </Button>
          <FormHelperText>Please upload a professional photo of yourself</FormHelperText>
          
          {photoPreview && (
            <Box sx={{ mt: 2, maxWidth: 200 }}>
              <img 
                src={photoPreview} 
                alt="Preview" 
                style={{ width: '100%', borderRadius: '4px' }} 
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
  
  // Render availability form
  const renderAvailabilityForm = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
        Availability & Logistics
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Important Judging Schedule
          </Typography>
          <Typography variant="body2">
            Judging starts at 3:00 PM on the last day of the hackathon (typically Sunday). We expect to complete judging and announce the winning teams by 5:30 PM. Your presence during this entire timeframe is crucial.
          </Typography>
        </Alert>
        
        {eventData && eventData.endDate && (
          <Box sx={{ mb: 3, bgcolor: 'background.paper', p: 2, borderRadius: 1, border: '1px dashed'}}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              For this event: 
            </Typography>
            <Typography variant="body2" paragraph>
              Judging will take place on{' '}
              <Box component="span" fontWeight="bold">
                {new Date(eventData.endDate + 'T00:00:00Z').toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  timeZone: 'UTC'
                })}
              </Box>{' '}
              from{' '}
              <Box component="span" fontWeight="bold">
                3:00 PM to approximately 5:30 PM
              </Box>
            </Typography>
          </Box>
        )}
        
        <FormControl required component="fieldset" sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Can you commit to being present for the entire judging period (3:00 PM to 5:30 PM on the last day)?
          </Typography>
          <RadioGroup
            name="canAttendJudging"
            value={formData.canAttendJudging}
            onChange={handleChange}
          >
            <FormControlLabel 
              value="Yes" 
              control={<Radio />} 
              label="Yes, I can be present for the entire judging period" 
            />
            <FormControlLabel 
              value="No" 
              control={<Radio />} 
              label="No, I cannot commit to this time period" 
            />
            <FormControlLabel 
              value="Partial" 
              control={<Radio />} 
              label="I can attend part of the judging period (please explain in availability)" 
            />
          </RadioGroup>
          {formData.canAttendJudging === "No" && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              Please note that availability during the judging period is a key requirement for judges. Your application may still be considered, but priority will be given to those who can attend the full judging session.
            </Alert>
          )}
        </FormControl>
        
        <TextField
          label="Additional availability details"
          name="availability"
          multiline
          rows={2}
          fullWidth
          value={formData.availability}
          onChange={handleChange}
          helperText="Please specify any additional availability details or constraints"
          sx={{ mb: 3 }}
        />
        
        <FormControl required component="fieldset" sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            {eventData && ['Virtual', 'Global', 'Online'].some(term => 
              eventData.location?.toLowerCase().includes(term.toLowerCase())
            ) ? (
              'Will you be participating online?'
            ) : (
              `Are you joining us in-person${eventData?.location ? ` in ${eventData.location}` : ' at the event location'}?`
            )}
          </Typography>
          <RadioGroup
            name="inPerson"
            value={formData.inPerson}
            onChange={handleChange}
          >
            <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="No" control={<Radio />} label="No" />
          </RadioGroup>
        </FormControl>
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
        label="(Optional) Anything else to share?"
        name="additionalInfo"
        multiline
        rows={3}
        fullWidth
        value={formData.additionalInfo}
        onChange={handleChange}
        sx={{ mb: 4 }}
      />
      
      <FormControlLabel
        control={
          <Checkbox
            name="codeOfConduct"
            checked={formData.codeOfConduct}
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
          By submitting this form, you're expressing interest in judging at Opportunity Hack. 
          Our team will review your application and reach out with further details about judging logistics and criteria.
        </Typography>
      </Alert>
      
      {/* Selected field is not shown to users but stored in state */}
      <input 
        type="hidden" 
        name="selected" 
        value={formData.selected} 
      />
    </Box>
  );
  
  // Function to render the current step form
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderBasicInfoForm();
      case 1:
        return renderBackgroundAndExperienceForm();
      case 2:
        return renderAvailabilityForm();
      case 3:
        return renderReviewForm();
      default:
        return 'Unknown step';
    }
  };

  // SEO metadata and descriptions
  const pageTitle = eventData 
    ? `Judge ${eventData.name} | Evaluate Tech for Good Solutions`
    : "Judge at Opportunity Hack | Evaluate Tech for Good Solutions";
  const pageDescription = eventData
    ? `Apply to judge ${eventData.name} in ${eventData.location}. Evaluate innovative tech solutions for nonprofits and help select winning projects that make real impact.`
    : "Apply to judge our tech for good hackathon. Evaluate innovative solutions for nonprofits and help select winning projects that make real social impact.";
  const canonicalUrl = `https://ohack.dev/hack/${event_id}/judge-application`;
  
  const imageUrl = eventData?.image || "https://cdn.ohack.dev/ohack.dev/2024_hackathon_1.webp";

  // Breadcrumb items for structured data
  const breadcrumbItems = [
    { name: 'Home', url: 'https://ohack.dev' },
    { name: 'Hackathons', url: 'https://ohack.dev/hack' },
    { 
      name: eventData?.name || 'Hackathon Event', 
      url: `https://ohack.dev/hack/${event_id}` 
    },
    { 
      name: 'Judge Application', 
      url: canonicalUrl 
    }
  ];

  // Structured data for judge application
  const judgeApplicationStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": pageTitle,
    "description": pageDescription,
    "url": canonicalUrl,
    "isPartOf": {
      "@type": "WebSite",
      "name": "Opportunity Hack",
      "url": "https://ohack.dev"
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbItems.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.url
      }))
    },
    "mainEntity": {
      "@type": "JobPosting",
      "title": `Judge for ${eventData?.name || 'Opportunity Hack'}`,
      "description": "Evaluate innovative tech solutions created for nonprofits during our hackathon event",
      "hiringOrganization": {
        "@type": "Organization",
        "name": "Opportunity Hack"
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": eventData?.location || "Tempe",
          "addressRegion": "Arizona",
          "addressCountry": "US"
        }
      },
      "employmentType": "VOLUNTEER",
      "industry": "Technology for Social Good",
      "responsibilities": [
        "Evaluate hackathon projects for technical innovation",
        "Assess impact potential for nonprofit organizations", 
        "Provide constructive feedback to development teams",
        "Help select winning solutions"
      ],
      "qualifications": [
        "Professional experience in technology, product management, or related fields",
        "Understanding of nonprofit sector challenges", 
        "Ability to evaluate technical solutions objectively",
        "Commitment to social good initiatives"
      ]
    }
  };

  // If form submitted successfully, show success message
  if (success) {
    return (
      <Container>
        <Head>
          <title>{pageTitle}</title>
          <meta name="description" content={pageDescription} />
          <meta
            name="keywords"
            content="hackathon judge, judge application, tech for good, nonprofit hackathon, opportunity hack, judging, volunteer, tech judging"
          />
          <link rel="canonical" href={canonicalUrl} />

          {/* DNS prefetch and preconnect for performance */}
          <link rel="dns-prefetch" href="//cdn.ohack.dev" />
          <link rel="preconnect" href="https://cdn.ohack.dev" crossOrigin="anonymous" />

          {/* Open Graph tags */}
          <meta property="og:title" content={pageTitle} />
          <meta property="og:description" content={pageDescription} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={canonicalUrl} />
          <meta property="og:image" content={imageUrl} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:alt" content="Judges evaluating tech solutions at Opportunity Hack" />
          <meta property="og:site_name" content="Opportunity Hack" />

          {/* Twitter Card tags */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={pageTitle} />
          <meta name="twitter:description" content={pageDescription} />
          <meta name="twitter:image" content={imageUrl} />
          <meta name="twitter:image:alt" content="Judges evaluating tech solutions at Opportunity Hack" />

          {/* Additional SEO meta tags */}
          <meta name="robots" content="index, follow" />
          <meta name="author" content="Opportunity Hack" />
          <meta name="theme-color" content="#1976d2" />
        </Head>

        {/* Structured Data */}
        <Script
          id="judge-application-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(judgeApplicationStructuredData)
          }}
        />
        
        <Box my={8} textAlign="center">
          <Typography variant="h1" component="h1" sx={{ fontSize: '2.5rem', mb: 4, mt: 12 }}>
            Application Submitted!
          </Typography>
          
          <Alert severity="success" sx={{ mb: 4, mx: 'auto', maxWidth: 600 }}>
            Thank you for applying to be a judge at Opportunity Hack. We'll review your application and contact you soon.
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
          content="hackathon judge, judge application, tech for good, nonprofit hackathon, opportunity hack, judging, volunteer, tech judging"
        />
        <link rel="canonical" href={canonicalUrl} />

        {/* DNS prefetch and preconnect for performance */}
        <link rel="dns-prefetch" href="//cdn.ohack.dev" />
        <link rel="preconnect" href="https://cdn.ohack.dev" crossOrigin="anonymous" />

        {/* Open Graph tags */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Judges evaluating tech solutions at Opportunity Hack" />
        <meta property="og:site_name" content="Opportunity Hack" />

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={imageUrl} />
        <meta name="twitter:image:alt" content="Judges evaluating tech solutions at Opportunity Hack" />

        {/* Additional SEO meta tags */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Opportunity Hack" />
        <meta name="theme-color" content="#1976d2" />
      </Head>

      {/* Structured Data */}
      <Script
        id="judge-application-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(judgeApplicationStructuredData)
        }}
      />
      
      {/* Form persistence notification component */}
      <FormPersistenceControls
        onSave={saveToLocalStorage}
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
          Judge Application
        </Typography>

        {isLoading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {/* Header section with responsive layout */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'flex-start', md: 'flex-start' },
              gap: 2,
              mb: 3
            }}>
              {/* Event info */}
              <Box sx={{ flex: 1 }}>
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
                        color: "text.secondary",
                      }}
                    >
                      {eventData.location}
                    </Typography>

                    <Typography
                      variant="subtitle1"
                      sx={{
                        mb: 1,
                        color: "text.secondary",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Box
                        component="span"
                        sx={{ display: "inline-flex", alignItems: "center" }}
                      >
                        📆 {eventData.formattedStartDate}
                      </Box>
                      {eventData.formattedStartDate !==
                        eventData.formattedEndDate && (
                        <>
                          <Box component="span" sx={{ mx: 0.5 }}>
                            to
                          </Box>
                          <Box
                            component="span"
                            sx={{ display: "inline-flex", alignItems: "center" }}
                          >
                            {eventData.formattedEndDate}
                          </Box>
                        </>
                      )}
                    </Typography>
                  </>
                )}
              </Box>

              {/* Social proof image */}
              <Box 
                sx={{ 
                  width: { xs: '100%', sm: '180px', md: '220px' },
                  height: { xs: '140px', sm: '120px', md: '150px' },
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: 2,
                  flexShrink: 0,
                  alignSelf: { xs: 'center', md: 'flex-start' },
                  maxWidth: '100%',
                  mt: { xs: 0, md: 1 }
                }}
              >
                <img 
                  src="https://cdn.ohack.dev/ohack.dev/2024_hackathon_1.webp" 
                  alt="Professional judges evaluating innovative tech solutions at Opportunity Hack" 
                  style={{ 
                    width: '100%',
                    height: '100%',
                    display: 'block',
                    objectFit: 'cover'
                  }}
                />
              </Box>
            </Box>

            {/* Add ApplicationNav component */}
            <ApplicationNav eventId={event_id} currentType="judge" />

            <Box sx={{ mb: 4 }}>
              {eventData && eventData.isEventPast ? (
                <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                      This event has already ended
                    </Typography>
                    <Typography variant="body1">
                      Applications are no longer being accepted for judges as this hackathon has already concluded.
                      Please check our upcoming events for future judging opportunities.
                    </Typography>
                  </Alert>
                  <Box textAlign="center">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => router.push('/hack')}
                      sx={{ mt: 2 }}
                    >
                      View Upcoming Events
                    </Button>
                  </Box>
                </Paper>
              ) : (
                <>
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
                      Thank you for your interest in judging at Opportunity Hack!
                      Judges play a crucial role in evaluating the projects created
                      by our participants and providing valuable feedback.
                    </Typography>

                    {eventData && eventData.description && (
                      <Typography variant="body1" sx={{ mb: 3 }}>
                        <strong>About this event:</strong> {eventData.description}
                      </Typography>
                    )}

                    
                      <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 4 }}>
                        <Typography variant="body1" paragraph>
                          <strong>
                            Want to learn more about judging at Opportunity Hack?
                          </strong>{" "}
                          Visit our{" "}
                          <Link
                            href="/about/judges"
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ fontWeight: "bold" }}
                          >
                            Judges Information Page
                          </Link>{" "}
                          for details about the evaluation criteria, judging
                          process, and commitment.
                        </Typography>
                      </Alert>
                    

                    <Typography variant="body1" paragraph>
                      As a judge, you'll review innovative solutions developed for
                      nonprofits and help recognize outstanding contributions. Your
                      expertise will help ensure the success of our hackathon.
                    </Typography>

                    {(error || recaptchaError) && (
                      <Alert severity="error" sx={{ mb: 4 }}>
                        {error || recaptchaError}
                      </Alert>
                    )}

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                      }}
                    >
                      {getStepContent(activeStep)}

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mt: 4,
                        }}
                      >
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
                          disabled={submitting || recaptchaLoading}
                        >
                          {activeStep === steps.length - 1 ? (
                            submitting || recaptchaLoading ? (
                              <CircularProgress size={24} />
                            ) : (
                              "Submit Application"
                            )
                          ) : (
                            "Next"
                          )}
                        </Button>
                      </Box>
                    </form>
                  </Paper>
                </>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
};

// Create a new component that uses RequiredAuthProvider
const JudgeApplicationPage = () => {
  const router = useRouter();
  const { event_id } = router.query;

  // Create the current URL for redirection
  const currentUrl = typeof window !== 'undefined' && event_id
    ? `${window.location.origin}/hack/${event_id}/judge-application`
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
      <JudgeApplicationComponent />
    </RequiredAuthProvider>
  );
};

export default JudgeApplicationPage;