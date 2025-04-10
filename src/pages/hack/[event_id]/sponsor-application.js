import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuthInfo } from '@propelauth/react';
import {
  Typography,
  Container,
  Box,
  TextField,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Paper,
  Divider,
  Alert,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  CardActions,
  Chip,
  Stack,
  Tooltip,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  FormGroup,
  useTheme,
  useMediaQuery,
  Link
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import InfoIcon from '@mui/icons-material/Info';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Head from 'next/head';
import { useEnv } from '../../../context/env.context';
import ApplicationNav from '../../../components/ApplicationNav/ApplicationNav';
import FormPersistenceControls from '../../../components/FormPersistenceControls';
import { useFormPersistence } from '../../../hooks/use-form-persistence';
import { useRecaptcha } from '../../../hooks/use-recaptcha';

// Sponsorship tiers
const sponsorshipTiers = [
  {
    name: 'Platinum Sponsor',
    amount: '$10,000',
    benefits: [
      'Premium logo placement on event website',
      'Recognition during opening and closing ceremonies',
      'Dedicated table at event',
      'Social media promotion',
      'Access to participant resumes',
      'Opportunity to present prize',
      '10-minute presentation opportunity'
    ]
  },
  {
    name: 'Gold Sponsor',
    amount: '$5,000',
    benefits: [
      'Logo placement on event website',
      'Recognition during opening ceremony',
      'Shared table at event',
      'Social media promotion',
      'Access to participant resumes'
    ]
  },
  {
    name: 'Silver Sponsor',
    amount: '$2,500',
    benefits: [
      'Logo placement on event website',
      'Recognition during opening ceremony',
      'Social media promotion'
    ]
  },
  {
    name: 'Bronze Sponsor',
    amount: '$1,000',
    benefits: [
      'Logo placement on event website',
      'Recognition during opening ceremony'
    ]
  },
  {
    name: 'Custom Sponsorship',
    amount: 'Custom',
    benefits: [
      'Tailored to your organization\'s needs and budget'
    ]
  }
];

// Volunteer role options
const volunteerRoleOptions = [
  {
    value: 'mentoring',
    label: 'Mentoring',
    description: 'Assist teams with technical guidance and expertise'
  },
  {
    value: 'judging',
    label: 'Judging',
    description: 'Evaluate final projects and provide feedback'
  },
  {
    value: 'workshop',
    label: 'Technical Workshop',
    description: 'Host a workshop on a specific technology or skill'
  },
  {
    value: 'prizes',
    label: 'Prize Donation',
    description: 'Provide prizes for winning teams or special categories'
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Other ways you\'d like to contribute'
  }
];

// Helper function to extract sponsorship tier from details string
const getSponsorshipTierFromDetails = (details) => {
  if (!details) return '';
  
  const tierNames = sponsorshipTiers.map(tier => tier.name);
  
  for (const tier of tierNames) {
    if (details.includes(tier)) return tier;
  }
  
  return 'Custom Sponsorship'; // Default to custom if no match
};

const SponsorApplicationPage = () => {
  const router = useRouter();
  const { event_id } = router.query;
  const { isLoggedIn, user, accessToken } = useAuthInfo();
  const { apiServerUrl } = useEnv();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Add the initialization ref at the top level
  const initializationRef = useRef(false);
  
  // Initial form state
  const initialFormData = {
    timestamp: new Date().toISOString(),
    email: '',
    company: '',
    useLogo: 'Yes',
    phoneNumber: '',
    sponsorshipTier: '',
    customSponsorship: '',
    sponsorshipDetails: '',
    volunteerRoles: [],
    otherVolunteerRole: '',
    volunteerCount: '',
    volunteerHours: '',
    name: '',
    title: '',
    preferredContact: 'email',
    howHeard: '',
    additionalNotes: '',
    event_id: event_id || '',
    isSelected: false
  };
  
  // Form navigation state
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [eventData, setEventData] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [error, setError] = useState('');
  
  // reCAPTCHA integration
  const { 
    initializeRecaptcha, 
    getRecaptchaToken, 
    isLoading: recaptchaLoading, 
    error: recaptchaError,
    setError: setRecaptchaError 
  } = useRecaptcha();
  
  // Steps for stepper
  const steps = ['Company Info', 'Sponsorship', 'Volunteering', 'Finish'];
  
  // Form persistence hook - keeping dependencies minimal
  const hookConfig = {
    formType: 'sponsor',
    eventId: event_id || '',
    userId: user?.userId || '',
    initialFormData,
    apiServerUrl: apiServerUrl || '',
    accessToken: accessToken || ''
  };
  
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
  } = useFormPersistence(hookConfig);

  // Fetch event data once when event_id is available
  useEffect(() => {
    // Initialize reCAPTCHA when component mounts
    initializeRecaptcha();
    
    if (!event_id || !apiServerUrl) return;
    
    const fetchEventData = async () => {
      try {
        setIsLoading(true);
        
        const response = await fetch(`${apiServerUrl}/api/messages/hackathon/${event_id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch event data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data || !data.start_date || !data.end_date) {
          throw new Error('Invalid event data received');
        }
        
        // Format dates for display
        const startDate = new Date(data.start_date);
        const endDate = new Date(data.end_date);
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
        
        // Check if event is in the past (with 1-day buffer)
        const now = new Date();
        const oneDayBuffer = 24 * 60 * 60 * 1000; // 1 day in milliseconds
        const isEventPast = new Date(endDate.getTime() + oneDayBuffer) < now;
        
        setEventData({
          name: data.title || `Opportunity Hack - ${event_id}`,
          description: data.description || "Annual hackathon for nonprofits",
          date: new Date(data.start_date).getFullYear().toString(),
          startDate: data.start_date,
          endDate: data.end_date,
          formattedStartDate,
          formattedEndDate,
          location: data.location || "Tempe, Arizona",
          image: data.image_url || "https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp",
          isEventPast
        });
      } catch (err) {
        console.error('Error fetching event data:', err);
        setError('Failed to load event data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [event_id, apiServerUrl, initializeRecaptcha]);

  // Update form data with event_id once it's available
  useEffect(() => {
    if (!event_id) return;
    
    setFormData(prev => {
      // Only update if the event_id has changed to avoid loops
      if (prev.event_id !== event_id) {
        return { ...prev, event_id };
      }
      return prev;
    });
  }, [event_id, setFormData]);

  // Initialize form data once when dependencies are ready
  useEffect(() => {
    // Skip if any dependencies are missing or if loading is in progress
    if (!event_id || !user || isLoading || initializationRef.current) return;
    
    // Initialize form data once
    const initFormData = async () => {
      try {
        initializationRef.current = true;
        
        // Pre-fill with user information if logged in
        setFormData(prevData => ({
          ...prevData,
          email: user.email || prevData.email,
          name: user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : user.username || prevData.name
        }));
        
        // Check for previous submission if user is logged in with access token
        if (accessToken) {
          try {
            const prevData = await loadPreviousSubmission();
            
            if (prevData) {
              // If the user has submitted before, ask if they want to load it
              if (window.confirm('We found a previous application. Would you like to load it for editing?')) {
                // Transform API data to match our form structure
                const volunteerRolesArray = prevData.volunteerType 
                  ? prevData.volunteerType.split(', ').map(role => {
                      // Check if this is a custom role or a predefined one
                      const matchedPredefined = volunteerRoleOptions.find(opt => 
                        opt.label.toLowerCase() === role.toLowerCase());
                        
                      if (matchedPredefined) return matchedPredefined.value;
                      return 'other'; // If no match, assume it's a custom role
                    })
                  : [];
                
                // Extract "other" role if present
                let otherRole = '';
                if (prevData.volunteerType && !volunteerRoleOptions.some(opt => 
                  prevData.volunteerType.includes(opt.label))) {
                  otherRole = prevData.volunteerType;
                }
                
                const transformedData = {
                  ...initialFormData,
                  email: prevData.email || user.email || '',
                  name: prevData.name || (user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user.username || ''),
                  company: prevData.company || prevData.companyName || '',
                  useLogo: prevData.useLogo || 'Yes',
                  phoneNumber: prevData.phoneNumber || '',
                  sponsorshipTier: getSponsorshipTierFromDetails(prevData.sponsorshipTypes || ''),
                  customSponsorship: prevData.sponsorshipTier === 'Custom Sponsorship' ? prevData.sponsorshipDetails || '' : '',
                  sponsorshipDetails: prevData.sponsorshipDetails || '',
                  volunteerRoles: volunteerRolesArray,
                  otherVolunteerRole: otherRole,
                  volunteerCount: prevData.volunteerCount || '',
                  volunteerHours: prevData.volunteerHours || '',
                  title: prevData.title || '',
                  preferredContact: prevData.preferredContact || 'email',
                  howHeard: prevData.howHeard || '',
                  additionalNotes: prevData.additionalNotes || prevData.otherInvolvement || '',
                  event_id
                };
                
                setFormData(transformedData);
                
                // If there's a logo URL, set the preview
                if (prevData.photoUrl || prevData.logoUrl) {
                  setLogoPreview(prevData.photoUrl || prevData.logoUrl);
                }
                
                return;
              }
            }
          } catch (err) {
            console.error('Error loading previous submission:', err);
          }
        }
        
        // If no previous submission or user declined to load it, try localStorage
        loadFromLocalStorage();
        
      } catch (err) {
        console.error('Error initializing form data:', err);
      }
    };

    initFormData();
  }, [user, accessToken, event_id, loadPreviousSubmission, loadFromLocalStorage, setFormData, isLoading]);

  // Handle checkbox changes separately to avoid re-renders with form data
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      // Handle checkbox for volunteer roles
      if (name.startsWith('volunteerRole-')) {
        const role = name.replace('volunteerRole-', '');
        
        setFormData(prev => {
          const updatedRoles = checked
            ? [...prev.volunteerRoles, role]
            : prev.volunteerRoles.filter(r => r !== role);
            
          return {
            ...prev,
            volunteerRoles: updatedRoles
          };
        });
      } else {
        handleFormChange(e);
      }
    } else {
      handleFormChange(e);
    }      
  }, [handleFormChange, setFormData]);
  
  const handleFileChange = useCallback((e) => {
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
    
    setLogoFile(file);
    setError(''); // Clear any previous errors
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
      
      // Also update the form data with the logo URL
      setFormData(prev => ({
        ...prev,
        photoUrl: reader.result
      }));
    };
    reader.onerror = () => {
      setError('Failed to read the selected file. Please try again.');
    };
    reader.readAsDataURL(file);
  }, [setFormData]);

  // Validation functions
  const validateCompanyInfo = useCallback(() => {
    if (!formData.email) {
      setError('Please enter your email address');
      return false;
    }
    
    if (!formData.company) {
      setError('Please enter your company name');
      return false;
    }
    
    if (!formData.name) {
      setError('Please enter your name');
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // Phone number validation (if provided)
    if (formData.phoneNumber) {
      const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
      if (!phoneRegex.test(formData.phoneNumber)) {
        setError('Please enter a valid phone number');
        return false;
      }
    }
    
    setError('');
    return true;
  }, [formData]);
  
  const validateSponsorshipInfo = useCallback(() => {
    if (!formData.sponsorshipTier) {
      setError('Please select a sponsorship tier');
      return false;
    }
    
    if (formData.sponsorshipTier === 'Custom Sponsorship' && !formData.customSponsorship) {
      setError('Please provide details for your custom sponsorship');
      return false;
    }
    
    setError('');
    return true;
  }, [formData]);
  
  const validateVolunteerInfo = useCallback(() => {
    // Volunteer info is optional, so just check for valid numbers
    if (formData.volunteerCount && (isNaN(formData.volunteerCount) || parseInt(formData.volunteerCount) < 0)) {
      setError('Please enter a valid number of volunteers');
      return false;
    }
    
    if (formData.volunteerHours && (isNaN(formData.volunteerHours) || parseInt(formData.volunteerHours) < 0)) {
      setError('Please enter a valid number of volunteer hours');
      return false;
    }
    
    if (formData.volunteerRoles.includes('other') && !formData.otherVolunteerRole) {
      setError('Please specify your other volunteer role');
      return false;
    }
    
    setError('');
    return true;
  }, [formData]);

  const validateForm = useCallback(() => {
    return (
      validateCompanyInfo() &&
      validateSponsorshipInfo() &&
      validateVolunteerInfo()
    );
  }, [validateCompanyInfo, validateSponsorshipInfo, validateVolunteerInfo]);

  // Form submission - Define this BEFORE handleNext
  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      // Get reCAPTCHA token
      const recaptchaToken = await getRecaptchaToken();
      
      // Handling token retrieval failure
      if (!recaptchaToken && process.env.NODE_ENV === 'production') {
        setError('Failed to verify you are human. Please refresh the page and try again.');
        return;
      }
      
      // Prepare submission data
      const sponsorshipDetails = formData.sponsorshipTier === 'Custom Sponsorship'
        ? formData.customSponsorship
        : formData.sponsorshipDetails;
      
      const volunteerType = formData.volunteerRoles.length > 0
        ? formData.volunteerRoles.map(role => {
            if (role === 'other') return formData.otherVolunteerRole;
            return volunteerRoleOptions.find(option => option.value === role)?.label || role;
          }).join(', ')
        : '';
      
      // Combine data for API submission
      const submissionData = {
        timestamp: new Date().toISOString(),
        email: formData.email,
        company: formData.company,
        companyName: formData.company, // Add mapping for companyName
        useLogo: formData.useLogo,
        phoneNumber: formData.phoneNumber,
        sponsorshipTypes: `${formData.sponsorshipTier} - ${sponsorshipDetails}`,
        otherInvolvement: formData.additionalNotes,
        volunteerType,
        volunteerCount: formData.volunteerCount,
        volunteerHours: formData.volunteerHours,
        name: formData.name,
        title: formData.title,
        event_id,
        preferredContact: formData.preferredContact,
        howHeard: formData.howHeard,
        logoFile: logoFile ? logoFile.name : null,
        photoUrl: logoPreview, // Map logo to photoUrl for consistency
        type: 'sponsors',
        volunteer_type: 'sponsor',
        isSelected: false,
        logoUrl: logoPreview,
        recaptchaToken
      };
      
      if (apiServerUrl && accessToken) {
        // Submit to API
        const submitEndpoint = previouslySubmitted 
          ? `${apiServerUrl}/api/sponsor/application/${event_id}/update` 
          : `${apiServerUrl}/api/sponsor/application/${event_id}/submit`;
        
        const response = await fetch(submitEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(submissionData)
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          if (errorData?.error?.includes('recaptcha')) {
            throw new Error('reCAPTCHA verification failed. Please refresh the page and try again.');
          }
          throw new Error(`Failed to submit application: ${response.status}${errorData ? ` - ${errorData.message}` : ''}`);
        }
      } else {
        // In a test environment or when API isn't available
        console.log('Submitting sponsor application:', submissionData);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      // Clear saved form data after successful submission
      clearSavedData();
      
      setSuccess(true);
    } catch (err) {
      console.error('Error submitting application:', err);
      setError(`Failed to submit your application. ${err.message || 'Please try again.'}`);
    } finally {
      setSubmitting(false);
    }
  }, [formData, validateForm, apiServerUrl, accessToken, event_id, previouslySubmitted, logoFile, logoPreview, clearSavedData, getRecaptchaToken]);

  // Navigation handlers - Now define these AFTER handleSubmit
  const handleNext = useCallback(() => {
    if (activeStep === 0 && !validateCompanyInfo()) return;
    if (activeStep === 1 && !validateSponsorshipInfo()) return;
    if (activeStep === 2 && !validateVolunteerInfo()) return;
    
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep(prev => prev + 1);
    }
  }, [activeStep, steps.length, validateCompanyInfo, validateSponsorshipInfo, validateVolunteerInfo, handleSubmit]);

  const handleBack = useCallback(() => {
    setActiveStep(prev => Math.max(0, prev - 1));
  }, []);

  // Company Information Form
  const renderCompanyInfoForm = useCallback(() => (
    <Box>
      <Typography variant="h6" component="h3" sx={{ mb: 3 }}>
        Tell us about your organization
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Email Address"
            name="email"
            type="email"
            required
            fullWidth
            value={formData.email || ''}
            onChange={handleChange}
            error={typeof error === 'string' && error.includes('email')}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            label="Phone Number (Optional)"
            name="phoneNumber"
            fullWidth
            value={formData.phoneNumber || ''}
            onChange={handleChange}
            error={typeof error === 'string' && error.includes('phone')}
            helperText="We'll only call if urgent"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Format: (123) 456-7890">
                    <IconButton edge="end">
                      <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            label="Company Name"
            name="company"
            required
            fullWidth
            value={formData.company || ''}
            onChange={handleChange}
            error={typeof error === 'string' && error.includes('company')}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            label="Your Name"
            name="name"
            required
            fullWidth
            value={formData.name || ''}
            onChange={handleChange}
            error={typeof error === 'string' && error.includes('name')}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            label="Your Title"
            name="title"
            fullWidth
            value={formData.title || ''}
            onChange={handleChange}
            placeholder="e.g., Director of Community Engagement"
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Preferred Contact Method</InputLabel>
            <Select
              name="preferredContact"
              value={formData.preferredContact || 'email'}
              onChange={handleChange}
              label="Preferred Contact Method"
            >
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="phone">Phone</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            label="How did you hear about us?"
            name="howHeard"
            fullWidth
            value={formData.howHeard || ''}
            onChange={handleChange}
            placeholder="e.g., Social media, referral, etc."
          />
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Company Logo (Optional)
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 1 }}>
              <Select
                name="useLogo"
                value={formData.useLogo || 'Yes'}
                onChange={handleChange}
                displayEmpty
              >
                <MenuItem value="Yes">Yes, you can use our logo</MenuItem>
                <MenuItem value="No">No, please don't use our logo</MenuItem>
                <MenuItem value="Not sure">Not sure yet</MenuItem>
              </Select>
              <FormHelperText>
                Can we use your company logo for promotional materials?
              </FormHelperText>
            </FormControl>
            
            {formData.useLogo === 'Yes' && (
              <Box sx={{ mt: 2 }}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mb: 1 }}
                >
                  Upload Logo
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleFileChange}
                  />
                </Button>
                <FormHelperText>
                  Recommended: High-resolution PNG or SVG with transparent background
                </FormHelperText>
                
                {logoPreview && (
                  <Box sx={{ mt: 2, maxWidth: 200 }}>
                    <img 
                      src={logoPreview} 
                      alt="Logo Preview" 
                      style={{ width: '100%', borderRadius: '4px' }} 
                    />
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  ), [formData, error, handleChange, handleFileChange, logoPreview]);
  
  // Sponsorship Form
  const renderSponsorshipForm = useCallback(() => (
    <Box>
      <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
        Choose Your Sponsorship Level
      </Typography>
      
      <Typography variant="body2" sx={{ mb: 3 }}>
        Select the sponsorship tier that fits your organization's goals. Each tier includes different benefits and recognition.
      </Typography>
      
      <Grid container spacing={3}>
        {sponsorshipTiers.map((tier) => (
          <Grid item xs={12} md={tier.name === 'Custom Sponsorship' ? 12 : 6} key={tier.name}>
            <Card 
              raised={formData.sponsorshipTier === tier.name} 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s',
                border: formData.sponsorshipTier === tier.name ? 
                  `2px solid ${theme.palette.primary.main}` : 'none',
                '&:hover': {
                  boxShadow: 6
                }
              }}
              onClick={() => handleChange({ 
                target: { name: 'sponsorshipTier', value: tier.name } 
              })}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" component="div">
                    {tier.name}
                  </Typography>
                  <Chip label={tier.amount} color="primary" />
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Benefits:
                </Typography>
                
                <ul style={{ paddingLeft: '20px' }}>
                  {tier.benefits.map((benefit, idx) => (
                    <li key={idx}>
                      <Typography variant="body2">{benefit}</Typography>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  color="primary"
                  onClick={() => handleChange({ 
                    target: { name: 'sponsorshipTier', value: tier.name } 
                  })}
                >
                  {formData.sponsorshipTier === tier.name ? 'Selected' : 'Select'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {formData.sponsorshipTier === 'Custom Sponsorship' && (
        <Box sx={{ mt: 3 }}>
          <TextField
            label="Describe your custom sponsorship"
            name="customSponsorship"
            multiline
            rows={3}
            fullWidth
            value={formData.customSponsorship || ''}
            onChange={handleChange}
            error={typeof error === 'string' && error.includes('custom')}
            helperText="Please describe your sponsorship proposal, budget, and what you'd like to offer"
          />
        </Box>
      )}
      
      <Box sx={{ mt: 3 }}>
        <TextField
          label="Additional Sponsorship Details (Optional)"
          name="sponsorshipDetails"
          multiline
          rows={3}
          fullWidth
          value={formData.sponsorshipDetails || ''}
          onChange={handleChange}
          helperText="Any specific requests or details about your sponsorship"
        />
      </Box>
    </Box>
  ), [formData, error, handleChange, theme.palette.primary.main]);
  
  // Volunteering Form
  const renderVolunteeringForm = useCallback(() => (
    <Box>
      <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
        Volunteering Opportunities
      </Typography>
      
      <Typography variant="body2" sx={{ mb: 3 }}>
        Many sponsors also contribute through volunteering. If you're interested in getting your team involved, let us know how you'd like to help.
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          How would you like to volunteer? (Select all that apply)
        </Typography>
        
        <FormGroup>
          {volunteerRoleOptions.map((role) => (
            <FormControlLabel
              key={role.value}
              control={
                <Checkbox
                  checked={formData.volunteerRoles?.includes(role.value) || false}
                  onChange={handleChange}
                  name={`volunteerRole-${role.value}`}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">{role.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {role.description}
                  </Typography>
                </Box>
              }
            />
          ))}
        </FormGroup>
        
        {formData.volunteerRoles?.includes('other') && (
          <TextField
            label="Specify other volunteer role"
            name="otherVolunteerRole"
            fullWidth
            value={formData.otherVolunteerRole || ''}
            onChange={handleChange}
            error={typeof error === 'string' && error.includes('other volunteer')}
            sx={{ mt: 2 }}
          />
        )}
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="How many people do you expect to volunteer?"
            name="volunteerCount"
            type="number"
            fullWidth
            value={formData.volunteerCount || ''}
            onChange={handleChange}
            error={typeof error === 'string' && error.includes('volunteers')}
            InputProps={{
              inputProps: { min: 0 },
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Estimate of how many employees will participate">
                    <IconButton edge="end">
                      <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            label="How many hours total do you expect to volunteer?"
            name="volunteerHours"
            type="number"
            fullWidth
            value={formData.volunteerHours || ''}
            onChange={handleChange}
            error={typeof error === 'string' && error.includes('hours')}
            InputProps={{
              inputProps: { min: 0 },
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Total hours across all volunteers">
                    <IconButton edge="end">
                      <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>
    </Box>
  ), [formData, error, handleChange]);
  
  // Final Review Form
  const renderReviewForm = useCallback(() => (
    <Box>
      <Typography variant="h6" component="h3" sx={{ mb: 3 }}>
        Review Your Information
      </Typography>
      
      <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Company Information
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant="body2" color="text.secondary">Company:</Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body2">{formData.company || 'Not provided'}</Typography>
          </Grid>
          
          <Grid item xs={4}>
            <Typography variant="body2" color="text.secondary">Contact:</Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body2">{formData.name || 'Not provided'}</Typography>
          </Grid>
          
          <Grid item xs={4}>
            <Typography variant="body2" color="text.secondary">Title:</Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body2">{formData.title || 'Not provided'}</Typography>
          </Grid>
          
          <Grid item xs={4}>
            <Typography variant="body2" color="text.secondary">Email:</Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body2">{formData.email || 'Not provided'}</Typography>
          </Grid>
          
          <Grid item xs={4}>
            <Typography variant="body2" color="text.secondary">Phone:</Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body2">{formData.phoneNumber || 'Not provided'}</Typography>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Sponsorship Details
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant="body2" color="text.secondary">Sponsorship Tier:</Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body2">{formData.sponsorshipTier || 'Not selected'}</Typography>
          </Grid>
          
          {formData.sponsorshipTier === 'Custom Sponsorship' && (
            <>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">Custom Details:</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">{formData.customSponsorship || 'Not provided'}</Typography>
              </Grid>
            </>
          )}
          
          {formData.sponsorshipDetails && (
            <>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">Additional Details:</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">{formData.sponsorshipDetails}</Typography>
              </Grid>
            </>
          )}
          
          <Grid item xs={4}>
            <Typography variant="body2" color="text.secondary">Logo Usage:</Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body2">{formData.useLogo || 'Not specified'}</Typography>
          </Grid>
        </Grid>
      </Paper>
      
      {(formData.volunteerRoles?.length > 0 || formData.volunteerCount || formData.volunteerHours) && (
        <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Volunteering Information
          </Typography>
          
          <Grid container spacing={2}>
            {formData.volunteerRoles?.length > 0 && (
              <>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Volunteer Roles:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.volunteerRoles.map(role => (
                      <Chip 
                        key={role} 
                        label={role === 'other' ? formData.otherVolunteerRole : 
                          volunteerRoleOptions.find(opt => opt.value === role)?.label} 
                        size="small" 
                        sx={{ mb: 1, mr: 1 }}
                      />
                    ))}
                  </Box>
                </Grid>
              </>
            )}
            
            {formData.volunteerCount && (
              <>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Volunteer Count:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2">{formData.volunteerCount} people</Typography>
                </Grid>
              </>
            )}
            
            {formData.volunteerHours && (
              <>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Volunteer Hours:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2">{formData.volunteerHours} hours</Typography>
                </Grid>
              </>
            )}
          </Grid>
        </Paper>
      )}
      
      <TextField
        label="Any additional notes or questions?"
        name="additionalNotes"
        multiline
        rows={3}
        fullWidth
        value={formData.additionalNotes || ''}
        onChange={handleChange}
        sx={{ mb: 3 }}
      />
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          By submitting this form, you're expressing interest in sponsoring Opportunity Hack. 
          Our team will contact you within 2-3 business days to discuss next steps and finalize details.
        </Typography>
      </Alert>
    </Box>
  ), [formData, handleChange]);
  
  // Function to render the current step form
  const getStepContent = useCallback((step) => {
    switch (step) {
      case 0:
        return renderCompanyInfoForm();
      case 1:
        return renderSponsorshipForm();
      case 2:
        return renderVolunteeringForm();
      case 3:
        return renderReviewForm();
      default:
        return 'Unknown step';
    }
  }, [renderCompanyInfoForm, renderSponsorshipForm, renderVolunteeringForm, renderReviewForm]);

  // SEO metadata and descriptions
  const pageTitle = eventData 
    ? `Sponsorship Application for ${eventData.name} - Opportunity Hack`
    : "Sponsorship Application - Opportunity Hack";
  const pageDescription = "Apply to sponsor our social good hackathon. Support technology solutions for nonprofits and make a real impact in the community.";
  const canonicalUrl = `https://ohack.dev/hack/${event_id}/sponsor-application`;

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
            Thank you for your interest in sponsoring Opportunity Hack. Our team will review your application and contact you within 2-3 business days.
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
          content="hackathon sponsor, sponsorship application, tech for good, nonprofit hackathon, opportunity hack, corporate sponsorship, volunteer, tech sponsorship"
        />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph tags */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta
          property="og:image"
          content={eventData?.image || "https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp"}
        />

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta
          name="twitter:image"
          content={eventData?.image || "https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp"}
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

      <Box ref={formRef}>
        <Typography
          variant="h1"
          component="h1"
          sx={{ fontSize: "2.5rem", mb: 2, mt: 0 }}
        >
          Sponsor Application
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
            {event_id && <ApplicationNav eventId={event_id} currentType="sponsor" />}

            <Box sx={{ mb: 4 }}>
              {eventData && eventData.isEventPast ? (
                <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                      This event has already ended
                    </Typography>
                    <Typography variant="body1">
                      Applications are no longer being accepted for sponsors as this hackathon has already concluded.
                      Please check our upcoming events for future sponsorship opportunities.
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
                  <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 4 }}>
                    <Typography variant="body1">
                      By sponsoring Opportunity Hack, you help develop real-world tech solutions for nonprofits while connecting with top talent. Your support directly impacts communities in need.
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Link 
                        href="/sponsor" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        sx={{ fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
                      >
                        Learn more about sponsor benefits and impact <InfoIcon fontSize="small" />
                      </Link>
                    </Box>
                  </Alert>
                  
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
                    {(error || recaptchaError) && (
                      <Alert severity="error" sx={{ mb: 4 }}>
                        {error || recaptchaError}
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
                          disabled={submitting || recaptchaLoading}
                        >
                          {activeStep === steps.length - 1 ? (
                            submitting || recaptchaLoading ? <CircularProgress size={24} /> : 'Submit'
                          ) : (
                            'Next'
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

export default SponsorApplicationPage;