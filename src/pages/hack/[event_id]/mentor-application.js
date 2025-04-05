import React, { useState, useEffect } from 'react';
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
  useTheme,
  useMediaQuery
} from '@mui/material';
import Head from 'next/head';
import { useEnv } from '../../../context/env.context';
import LoginOrRegister from '../../../components/LoginOrRegister/LoginOrRegister';
import ApplicationNav from '../../../components/ApplicationNav/ApplicationNav';
import InfoIcon from '@mui/icons-material/Info';
import FormPersistenceControls from '../../../components/FormPersistenceControls';
import { useFormPersistence } from '../../../hooks/use-form-persistence';

const MentorApplicationPage = () => {
  const router = useRouter();
  const { event_id } = router.query;
  const { isLoggedIn, user, accessToken } = useAuthInfo();
  const { apiServerUrl } = useEnv();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Form navigation state
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [eventData, setEventData] = useState(null);
  // Add missing submitting state
  const [submitting, setSubmitting] = useState(false);
  
  // Initial form state
  const initialFormData = {
    timestamp: new Date().toISOString(),
    email: '',
    name: '',
    pronouns: '',
    company: '',
    bio: '',
    picture: '',
    linkedin: '',
    inPerson: '',
    expertise: [], // Changed from string to array
    otherExpertise: '', // New field for "Other" option
    participationCount: '',
    engineeringSpecifics: [],
    availableDays: [],
    country: '',
    state: '',
    codeOfConduct: false,
    comments: '',
    shirtSize: '',
    agreedToCodeOfConduct: false,
    linkedinProfile: '',
    shortBio: '',
    photoUrl: '',
    event_id: '',
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
    formType: 'mentor',
    eventId: event_id,
    userId: user?.userId,
    initialFormData,
    apiServerUrl,
    accessToken
  });
  
  // Available engineering specifics options
  const engineeringOptions = [
    'Front-end (CSS/JS, Node, Angular, React, etc)',
    'Back-end (Java, Python, Ruby, etc)',
    'AWS',
    'Google Cloud',
    'Heroku',
    'Data Science & Machine Learning',
    'Data Analysis',
    'Mobile (iOS, Android)',
    'GitHub ninja'
  ];
  
  // Common expertise areas for mentors
  const expertiseOptions = [
    "Software Development",
    "Product Management",
    "UX/UI Design",
    "Data Science & Analytics",
    "Cloud Architecture",
    "DevOps",
    "Mobile Development",
    "Nonprofit Technology",
    "Entrepreneurship",
    "Digital Marketing",
    "Project Management",
    "Business Strategy",
    "Cybersecurity",
    "Database Management",
    "AI/Machine Learning",
    "Other" // Option to specify custom expertise
  ];
  
  // Function to generate time slots based on event dates - moved outside useEffect to avoid recreating on each render
  const generateTimeSlots = (startDate, endDate) => {
    if (!startDate || !endDate) return [];
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Time blocks with icons and descriptions
    const timeBlocks = [
      { time: '7am - 9am', label: 'Early Morning', icon: '🌅', energy: 'Fresh minds ready to help!' },
      { time: '9am - 12pm', label: 'Morning', icon: '☀️', energy: 'Peak productivity time!' },
      { time: '1pm - 3pm', label: 'Afternoon', icon: '🏙️', energy: 'Post-lunch problem solving' },
      { time: '4pm - 7pm', label: 'Evening', icon: '🌆', energy: 'Steady focus time' },
      { time: '8pm - 11pm', label: 'Night', icon: '🌃', energy: 'Late night debugging sessions' },
      { time: '11pm - 2am', label: 'Late Night', icon: '🌙', energy: 'For the night owls!' }
    ];
    
    const slots = [];
    
    // Loop through each day between start and end dates
    for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
      const dayDate = new Date(day);
      const dateString = dayDate.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'short', 
        day: 'numeric'
      });
      
      // Add each time block for this day
      timeBlocks.forEach(block => {
        slots.push({
          id: `${dateString}-${block.label}`,
          date: dateString,
          time: block.time,
          label: block.label,
          icon: block.icon,
          energy: block.energy,
          displayText: `${dateString}: ${block.icon} ${block.label} (${block.time} PST)`
        });
      });
    }
    
    return slots;
  };
  
  // Available time slots (will be populated from event data)
  const [availabilityOptions, setAvailabilityOptions] = useState([]);

  // fetch event data from the backend API
  useEffect(() => {
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
        
        // Generate time slots based on event dates
        const slots = generateTimeSlots(eventData.start_date, eventData.end_date);
        setAvailabilityOptions(slots);
        
        // Initialize formData with user information and event ID
        if (user) {
          setFormData(prev => ({
            ...prev,
            email: user.email || '',
            name: user.firstName && user.lastName 
              ? `${user.firstName} ${user.lastName}` 
              : user.username || '',
            event_id: event_id
          }));
          
          // Check for previous submission
          const prevData = await loadPreviousSubmission();
          if (prevData) {
            // If the user has submitted before, ask if they want to load it
            if (window.confirm('We found a previous application. Would you like to load it for editing?')) {
              // Transform API data to match our form structure
              const availabilityText = prevData.availability || '';
              
              // Get the already generated slots, not regenerate them
              const matchedSlotIds = slots.filter(slot => 
                availabilityText.includes(slot.displayText)).map(slot => slot.id);
              
              const transformedData = {
                ...formData,
                email: prevData.email || formData.email,
                name: prevData.name || formData.name,
                pronouns: prevData.pronouns || '',
                company: prevData.company || '',
                bio: prevData.shortBio || prevData.bio || '',
                picture: prevData.photoUrl || prevData.picture || '',
                linkedin: prevData.linkedinProfile || prevData.linkedin || '',
                inPerson: prevData.isInPerson ? 'Yes!' : 'No, I\'ll be virtual',
                expertise: (prevData.expertise || '').split(', ').filter(Boolean),
                participationCount: prevData.participationCount || '',
                engineeringSpecifics: (prevData.softwareEngineeringSpecifics || '').split(', ').filter(Boolean),
                availableDays: matchedSlotIds,
                country: prevData.country || '',
                state: prevData.state || '',
                codeOfConduct: prevData.agreedToCodeOfConduct || false,
                comments: prevData.additionalInfo || prevData.comments || '',
                shirtSize: prevData.shirtSize || '',
                event_id: event_id
              };
              
              setFormData(transformedData);
            }
          } else {
            // If no previous submission, try to load from localStorage
            loadFromLocalStorage();
          }
        } else {
          setFormData(prev => ({
            ...prev,
            event_id: event_id
          }));
          
          // Try loading from localStorage for non-logged-in users
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
  }, [event_id, user, apiServerUrl, loadPreviousSubmission, loadFromLocalStorage, setFormData]);

  
  // Now define the custom implementation that uses handleMultiSelectChange
  const customHandleMultiSelectChange = (event, fieldName) => {
    handleMultiSelectChange(event, fieldName);
    
    // Clear otherExpertise when Other is removed from expertise
    if (fieldName === 'expertise' && !event.target.value.includes('Other')) {
      setFormData(prev => ({
        ...prev,
        otherExpertise: ''
      }));
    }
  };

  // Extend handleFormChange to handle otherExpertise field
  const handleChange = (e) => {
    handleFormChange(e);
    
    // Clear otherExpertise when expertise doesn't include "Other"
    const { name, value } = e.target;
    if (name === 'expertise' && !value.includes('Other')) {
      setFormData(prev => ({
        ...prev,
        otherExpertise: ''
      }));
    }
  };
  
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
  
  const validateSkillsAndExperience = () => {
    // Validate expertise field
    if (!formData.expertise || formData.expertise.length === 0) {
      setError('Please select at least one area of expertise');
      return false;
    }
    
    // Validate otherExpertise if "Other" is selected
    if (formData.expertise.includes('Other') && !formData.otherExpertise) {
      setError('Please specify your custom area of expertise');
      return false;
    }
    
    // Validate array fields
    if (!formData.engineeringSpecifics || formData.engineeringSpecifics.length === 0) {
      setError('Please select at least one engineering specific');
      return false;
    }
    
    setError('');
    return true;
  };
  
  const validateAvailability = () => {
    const requiredFields = ['inPerson', 'participationCount', 'country', 'state'];
    
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`Please fill out the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field`);
        return false;
      }
    }
    
    if (!formData.availableDays || formData.availableDays.length === 0) {
      setError('Please select at least one available time slot');
      return false;
    }
    
    setError('');
    return true;
  };

  const validateForm = () => {
    return (
      validateBasicInfo() &&
      validateSkillsAndExperience() &&
      validateAvailability() &&
      formData.codeOfConduct
    );
  };

  const handleNext = () => {
    if (activeStep === 0 && !validateBasicInfo()) return;
    if (activeStep === 1 && !validateSkillsAndExperience()) return;
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
        // Process expertise - combine selected expertise with otherExpertise if present
        expertise: formData.expertise.includes('Other') 
          ? [...formData.expertise.filter(e => e !== 'Other'), formData.otherExpertise].join(', ')
          : formData.expertise.join(', '),
        // Convert array values to strings for API submission
        softwareEngineeringSpecifics: formData.engineeringSpecifics.join(', '),
        // Map available days to their display text
        availability: formData.availableDays
          .map(dayId => availabilityOptions.find(option => option.id === dayId)?.displayText || dayId)
          .join(', '),
        isInPerson: formData.inPerson === "Yes!",
        volunteer_type: 'mentor',
        agreedToCodeOfConduct: formData.codeOfConduct,
        linkedinProfile: formData.linkedin,
        shortBio: formData.bio,
        photoUrl: formData.picture,
        type: 'mentors',
        additionalInfo: formData.comments
      };
      
      if (apiServerUrl) {
        // Submit to API
        const submitEndpoint = previouslySubmitted 
          ? `${apiServerUrl}/api/mentor/application/${event_id}/update` 
          : `${apiServerUrl}/api/mentor/application/${event_id}/submit`;
        
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
        console.log('Submitting mentor application:', submissionData);
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
  
  // SEO metadata and descriptions
  const pageTitle = eventData 
    ? `Mentor Application for ${eventData.name} - Opportunity Hack`
    : "Mentor Application - Opportunity Hack";
  const pageDescription = eventData
    ? `Apply to be a mentor for ${eventData.name} in ${eventData.location}. Help guide teams of technologists to create solutions for nonprofits and make a real impact.`
    : "Apply to be a mentor for our social good hackathon. Help guide teams of technologists to create solutions for nonprofits and make a real impact.";
  const canonicalUrl = `https://ohack.dev/hack/${event_id}/mentor-application`;
  
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
            Thank you for applying to be a mentor at Opportunity Hack. We'll review your application and contact you soon.
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

  // Define steps for stepper
  const steps = ['Basic Info', 'Skills & Experience', 'Availability', 'Finish'];

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
          label="Your Pronouns (Optional)"
          name="pronouns"
          fullWidth
          value={formData.pronouns}
          onChange={handleChange}
          sx={{ mb: 3 }}
        />
        
        <TextField
          label="What company are you working for?"
          name="company"
          required
          fullWidth
          value={formData.company}
          onChange={handleChange}
          sx={{ mb: 3 }}
        />
        
        <TextField
          label="Short bio (Optional)"
          name="bio"
          multiline
          rows={3}
          fullWidth
          value={formData.bio}
          onChange={handleChange}
          helperText="Tell us a bit about yourself and your professional background"
          sx={{ mb: 3 }}
        />
      </Box>
    </Box>
  );
  
  // Render skills and experience form
  const renderSkillsAndExperienceForm = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
        Profile & Experience
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <TextField
          label="Can you send us a picture of you? (Optional)"
          name="picture"
          type="url"
          fullWidth
          value={formData.picture}
          onChange={handleChange}
          helperText="Please provide a URL to your profile picture"
          sx={{ mb: 3 }}
        />
        
        <TextField
          label="LinkedIn Profile (Optional)"
          name="linkedin"
          type="url"
          fullWidth
          value={formData.linkedin}
          onChange={handleChange}
          sx={{ mb: 3 }}
        />
        
        <FormControl fullWidth required sx={{ mb: formData.expertise.includes('Other') ? 1 : 3 }}>
          <InputLabel id="expertise-label">What kind of brain power can you help supply us with?</InputLabel>
          <Select
            labelId="expertise-label"
            id="expertise"
            multiple
            value={formData.expertise}
            onChange={(e) => customHandleMultiSelectChange(e, 'expertise')}
            input={<OutlinedInput label="What kind of brain power can you help supply us with?" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
          >
            {expertiseOptions.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox checked={formData.expertise.indexOf(option) > -1} />
                <ListItemText primary={option} />
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>Select all areas where you can mentor teams (select at least one)</FormHelperText>
        </FormControl>
        
        {/* Conditional text field that appears when "Other" is selected */}
        {formData.expertise.includes('Other') && (
          <TextField
            label="Please specify your expertise"
            name="otherExpertise"
            required
            fullWidth
            value={formData.otherExpertise}
            onChange={handleChange}
            helperText="Tell us about your specific area of expertise"
            sx={{ mb: 3 }}
          />
        )}
        
        <FormControl fullWidth required sx={{ mb: 3 }}>
          <InputLabel id="engineering-specifics-label">Software Engineering Specifics</InputLabel>
          <Select
            labelId="engineering-specifics-label"
            id="engineering-specifics"
            multiple
            value={formData.engineeringSpecifics}
            onChange={(e) => customHandleMultiSelectChange(e, 'engineeringSpecifics')}
            input={<OutlinedInput label="Software Engineering Specifics" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
          >
            {engineeringOptions.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox checked={formData.engineeringSpecifics.indexOf(option) > -1} />
                <ListItemText primary={option} />
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>Select the technologies and areas you can mentor in</FormHelperText>
        </FormControl>
        
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
        <FormControl fullWidth required sx={{ mb: 3 }}>
          <Select
            name="inPerson"
            value={formData.inPerson}
            onChange={handleChange}
            displayEmpty
          >
            <MenuItem value="" disabled>
              <em>Joining us in-person at ASU Tempe?</em>
            </MenuItem>
            <MenuItem value="Yes!">Yes!</MenuItem>
            <MenuItem value="No, I'll be virtual">No, I'll be virtual</MenuItem>
          </Select>
          <FormHelperText>Let us know if you'll be joining in person or virtually</FormHelperText>
        </FormControl>
                
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            When can you help mentor? (Select all that apply)
          </Typography>
          <FormHelperText sx={{ mb: 2 }}>
            Mentors typically help in 3-hour blocks. Select the times that work for you!
          </FormHelperText>
          
          {availabilityOptions.length > 0 ? (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
              gap: 2 
            }}>
              {availabilityOptions.map((slot) => (
                <Paper
                  key={slot.id}
                  elevation={formData.availableDays.includes(slot.id) ? 8 : 1}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    bgcolor: formData.availableDays.includes(slot.id) ? 'primary.light' : 'background.paper',
                    color: formData.availableDays.includes(slot.id) ? 'white' : 'text.primary',
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: formData.availableDays.includes(slot.id) ? 'primary.main' : 'action.hover',
                      transform: 'translateY(-4px)',
                      boxShadow: 6
                    }
                  }}
                  onClick={() => {
                    const newAvailability = formData.availableDays.includes(slot.id)
                      ? formData.availableDays.filter(id => id !== slot.id)
                      : [...formData.availableDays, slot.id];
                    
                    setFormData(prev => ({
                      ...prev,
                      availableDays: newAvailability
                    }));
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Typography variant="body1" sx={{ mb: 1, fontWeight: 'bold' }}>
                      {slot.icon} {slot.date}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {slot.label} ({slot.time})
                    </Typography>
                    <Typography variant="caption" sx={{ mt: 'auto', fontStyle: 'italic' }}>
                      {slot.energy}
                    </Typography>
                    
                    {formData.availableDays.includes(slot.id) && (
                      <Chip 
                        label="Selected!" 
                        color="success" 
                        size="small" 
                        sx={{ alignSelf: 'flex-start', mt: 1 }}
                      />
                    )}
                  </Box>
                </Paper>
              ))}
            </Box>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
              Loading available time slots...
            </Alert>
          )}
          
          {formData.availableDays.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Your selected time slots:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.availableDays.map(slotId => {
                  const slot = availabilityOptions.find(opt => opt.id === slotId);
                  return (
                    <Chip
                      key={slotId}
                      label={`${slot?.icon} ${slot?.date} ${slot?.label}`}
                      onDelete={() => {
                        setFormData(prev => ({
                          ...prev,
                          availableDays: prev.availableDays.filter(id => id !== slotId)
                        }));
                      }}
                      color="primary"
                      sx={{ mb: 1 }}
                    />
                  );
                })}
              </Box>
            </Box>
          )}
          
          {formData.availableDays.length === 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Please select at least one time slot when you'll be available to mentor.
            </Alert>
          )}
        </Box>
        
        <TextField
          label="Which country are you in?"
          name="country"
          required
          fullWidth
          value={formData.country}
          onChange={handleChange}
          sx={{ mb: 3 }}
        />
        
        <TextField
          label="Which state are you in?"
          name="state"
          required
          fullWidth
          value={formData.state}
          onChange={handleChange}
          sx={{ mb: 3 }}
        />
        
        <FormControl fullWidth sx={{ mb: 3 }}>
          <Select
            name="shirtSize"
            value={formData.shirtSize}
            onChange={handleChange}
            displayEmpty
          >
            <MenuItem value="" disabled>
              <em>Shirt Size?</em>
            </MenuItem>
            <MenuItem value="S">S</MenuItem>
            <MenuItem value="M">M</MenuItem>
            <MenuItem value="L">L</MenuItem>
            <MenuItem value="XL">XL</MenuItem>
            <MenuItem value="XXL">XXL</MenuItem>
            <MenuItem value="4XL">4XL</MenuItem>
          </Select>
          <FormHelperText>Optional - Select your t-shirt size if you'd like a hackathon shirt</FormHelperText>
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
        label="Any questions or comments for us?"
        name="comments"
        multiline
        rows={4}
        fullWidth
        value={formData.comments}
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
          By submitting this form, you're expressing interest in mentoring at Opportunity Hack. 
          Our team will review your application and reach out to match you with teams based on your expertise and availability.
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
        return renderReviewForm();
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content="hackathon mentor, mentor application, tech for good, nonprofit hackathon, opportunity hack, mentorship, volunteer, tech mentoring"
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
        onSave={saveToLocalStorage}
        onRestore={loadFromLocalStorage}
        onClear={clearSavedData}
        notification={notification}
        onCloseNotification={closeNotification}
      />

      <Box my={8} ref={formRef}>
        <Typography
          variant="h1"
          component="h1"
          sx={{ fontSize: "2.5rem", mb: 2, mt: 12 }}
        >
          Mentor Application
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
            <ApplicationNav eventId={event_id} currentType="mentor" />

            <Box sx={{ mb: 4 }}>
              <Stepper 
                activeStep={activeStep} 
                alternativeLabel={!isMobile} 
                orientation={isMobile ? 'vertical' : 'horizontal'} 
                sx={{ mb: 4 }}
              >
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
                <Typography variant="body1" paragraph>
                  Thank you for your interest in mentoring at Opportunity Hack! Mentors play a crucial role in guiding teams
                  and helping them create impactful solutions for nonprofits.
                </Typography>
                
                {eventData && eventData.description && (
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    <strong>About this event:</strong> {eventData.description}
                  </Typography>
                )}
                
                <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 4 }}>
                  <Typography variant="body1" paragraph>
                    <strong>Want to learn more about mentoring at Opportunity Hack?</strong> Check out our{' '}
                    <Link 
                      href="/about/mentors" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      sx={{ fontWeight: 'bold' }}
                    >
                      Mentors Guide
                    </Link>{' '}
                    to understand the role, expectations, and impact you'll make.
                  </Typography>
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

export default MentorApplicationPage;