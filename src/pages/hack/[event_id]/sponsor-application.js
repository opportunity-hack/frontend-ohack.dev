import React, { useState, useEffect } from 'react';
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

const SponsorApplicationPage = () => {
  const router = useRouter();
  const { event_id } = router.query;
  const { isLoggedIn, user, accessToken } = useAuthInfo();
  const { apiServerUrl } = useEnv();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Form navigation state
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [eventData, setEventData] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
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
    additionalNotes: ''
  });
  
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
  
  // Steps for stepper
  const steps = ['Company Info', 'Sponsorship', 'Volunteering', 'Finish'];

  // fetch event data
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
          startDate: "2025-10-15",
          endDate: "2025-10-17",
          location: "Tempe, Arizona",
          formattedStartDate: "Friday, October 15, 2025",
          formattedEndDate: "Sunday, October 17, 2025",
          date: "October 15-17, 2025"
        };
        
        setEventData(mockEvent);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching event data:', err);
        setError('Failed to load event data. Please try again later.');
        setLoading(false);
      }
    };

    fetchEventData();
    
    // If user is logged in, pre-fill email
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        name: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.username || ''
      }));
    }
  }, [event_id, user, apiServerUrl]);

  const handleChange = (e) => {
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
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && !validateCompanyInfo()) return;
    if (activeStep === 1 && !validateSponsorshipInfo()) return;
    if (activeStep === 2 && !validateVolunteerInfo()) return;
    
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };
  
  const validateCompanyInfo = () => {
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
  };
  
  const validateSponsorshipInfo = () => {
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
  };
  
  const validateVolunteerInfo = () => {
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
  };

  const validateForm = () => {
    return (
      validateCompanyInfo() &&
      validateSponsorshipInfo() &&
      validateVolunteerInfo()
    );
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
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
      };
      
      // In a real implementation, you would send the data to your API
      console.log('Submitting sponsor application:', submissionData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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

  // Company Information Form
  const renderCompanyInfoForm = () => (
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
            value={formData.email}
            onChange={handleChange}
            error={error.includes('email')}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            label="Phone Number (Optional)"
            name="phoneNumber"
            fullWidth
            value={formData.phoneNumber}
            onChange={handleChange}
            error={error.includes('phone')}
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
            value={formData.company}
            onChange={handleChange}
            error={error.includes('company')}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            label="Your Name"
            name="name"
            required
            fullWidth
            value={formData.name}
            onChange={handleChange}
            error={error.includes('name')}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            label="Your Title"
            name="title"
            fullWidth
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Director of Community Engagement"
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Preferred Contact Method</InputLabel>
            <Select
              name="preferredContact"
              value={formData.preferredContact}
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
            value={formData.howHeard}
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
                value={formData.useLogo}
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
  );
  
  // Sponsorship Form
  const renderSponsorshipForm = () => (
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
            value={formData.customSponsorship}
            onChange={handleChange}
            error={error.includes('custom')}
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
          value={formData.sponsorshipDetails}
          onChange={handleChange}
          helperText="Any specific requests or details about your sponsorship"
        />
      </Box>
    </Box>
  );
  
  // Volunteering Form
  const renderVolunteeringForm = () => (
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
                  checked={formData.volunteerRoles.includes(role.value)}
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
        
        {formData.volunteerRoles.includes('other') && (
          <TextField
            label="Specify other volunteer role"
            name="otherVolunteerRole"
            fullWidth
            value={formData.otherVolunteerRole}
            onChange={handleChange}
            error={error.includes('other volunteer')}
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
            value={formData.volunteerCount}
            onChange={handleChange}
            error={error.includes('volunteers')}
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
            value={formData.volunteerHours}
            onChange={handleChange}
            error={error.includes('hours')}
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
  );
  
  // Final Review Form
  const renderReviewForm = () => (
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
            <Typography variant="body2">{formData.company}</Typography>
          </Grid>
          
          <Grid item xs={4}>
            <Typography variant="body2" color="text.secondary">Contact:</Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body2">{formData.name}</Typography>
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
            <Typography variant="body2">{formData.email}</Typography>
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
            <Typography variant="body2">{formData.sponsorshipTier}</Typography>
          </Grid>
          
          {formData.sponsorshipTier === 'Custom Sponsorship' && (
            <>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">Custom Details:</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">{formData.customSponsorship}</Typography>
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
            <Typography variant="body2">{formData.useLogo}</Typography>
          </Grid>
        </Grid>
      </Paper>
      
      {(formData.volunteerRoles.length > 0 || formData.volunteerCount || formData.volunteerHours) && (
        <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Volunteering Information
          </Typography>
          
          <Grid container spacing={2}>
            {formData.volunteerRoles.length > 0 && (
              <>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Volunteer Roles:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {formData.volunteerRoles.map(role => (
                      <Chip 
                        key={role} 
                        label={role === 'other' ? formData.otherVolunteerRole : 
                          volunteerRoleOptions.find(opt => opt.value === role)?.label} 
                        size="small" 
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Stack>
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
        value={formData.additionalNotes}
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
  );
  
  // Function to render the current step form
  const getStepContent = (step) => {
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
  };

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

      <Box my={8}>
        <Typography
          variant="h1"
          component="h1"
          sx={{ fontSize: "2.5rem", mb: 2, mt: 12 }}
        >
          Sponsor Application
        </Typography>

        {loading ? (
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
            <ApplicationNav eventId={event_id} currentType="sponsor" />

            <Box sx={{ mb: 4 }}>
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
              
              <Stepper activeStep={activeStep} alternativeLabel={!isMobile} orientation={isMobile ? 'vertical' : 'horizontal'} sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              
              <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
                {error && (
                  <Alert severity="error" sx={{ mb: 4 }}>
                    {error}
                  </Alert>
                )}
                
                <form>
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
                        submitting ? <CircularProgress size={24} /> : 'Submit'
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

export default SponsorApplicationPage;