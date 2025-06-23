import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  MenuItem,
  Paper,
  Grid,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Checkbox,
  CircularProgress,
  Alert,
  Collapse,
  Card,
  CardContent,
  Divider,
  Link,
  IconButton,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useRecaptcha } from '../../hooks/use-recaptcha';
import axios from 'axios';
import { useEnv } from '../../context/env.context';
import { FaCheck, FaPaperPlane, FaExternalLinkAlt, FaEnvelope } from 'react-icons/fa';

// Inquiry types with associated links and content
const INQUIRY_TYPES = [
  { 
    value: 'general', 
    label: 'General Question',
    description: 'For general inquiries about Opportunity Hack'
  },
  { 
    value: 'hackathon', 
    label: 'Hackathon Information',
    description: 'Questions about upcoming or past hackathons',
    link: '/hack',
    linkText: 'View Current Hackathons'
  },
  { 
    value: 'mentor', 
    label: 'Mentor Opportunities',
    description: 'Information about becoming a mentor',
    link: '/hack',
    linkText: 'Apply to Mentor'
  },
  { 
    value: 'judge', 
    label: 'Judge Opportunities',
    description: 'Information about becoming a judge',
    link: '/hack',
    linkText: 'Apply to Judge'
  },
  { 
    value: 'sponsor', 
    label: 'Sponsorship Opportunities',
    description: 'Information about sponsoring Opportunity Hack',
    link: '/sponsor',
    linkText: 'Sponsorship Details'
  },
  { 
    value: 'nonprofit', 
    label: 'Nonprofit Information',
    description: 'Information for nonprofits interested in participating',
    link: '/nonprofits',
    linkText: 'Nonprofit Details'
  },
  { 
    value: 'technical', 
    label: 'Technical Support',
    description: 'Help with website issues or technical problems'
  },
  { 
    value: 'other', 
    label: 'Other',
    description: 'Any other inquiries not covered above'
  }
];

// Initial form state
const initialFormState = {
  firstName: '',
  lastName: '',
  email: '',
  organization: '',
  inquiryType: '',
  message: '',
  receiveUpdates: false
};

/**
 * Contact form page component
 */
const ContactPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const { apiServerUrl } = useEnv();
  const { getRecaptchaToken, isLoading: recaptchaLoading, error: recaptchaError } = useRecaptcha();
  
  // Form state
  const [formState, setFormState] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // Get inquiry type from URL query if available
  useEffect(() => {
    if (router.query.type && INQUIRY_TYPES.some(type => type.value === router.query.type)) {
      setFormState(prev => ({
        ...prev,
        inquiryType: router.query.type
      }));
    }
  }, [router.query]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    const newValue = e.target.type === 'checkbox' ? checked : value;
    
    setFormState(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Clear field error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formState.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!formState.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formState.inquiryType) {
      errors.inquiryType = 'Please select an inquiry type';
    }
    
    if (!formState.message.trim()) {
      errors.message = 'Message is required';
    } else if (formState.message.trim().length < 10) {
      errors.message = 'Message is too short (minimum 10 characters)';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // Get reCAPTCHA token
      const recaptchaToken = await getRecaptchaToken();
      if (!recaptchaToken && process.env.NODE_ENV !== 'development') {
        setSubmitError('Failed to verify you are human. Please try again.');
        setIsSubmitting(false);
        return;
      }
      
      // Mock API call - replace with actual API endpoint when available
      const response = await axios.post(
        `${apiServerUrl}/api/contact`,
        {
          ...formState,
          recaptchaToken
        }
      );
      
      
      // Set success state
      setSubmitSuccess(true);
      
      // Reset form after submission
      setFormState(initialFormState);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitError('Failed to submit your message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get selected inquiry type info
  const selectedInquiryType = INQUIRY_TYPES.find(type => type.value === formState.inquiryType);

  return (
    <>
      <Head>
        <title>Contact Us - Opportunity Hack</title>
        <meta 
          name="description" 
          content="Contact Opportunity Hack for questions about hackathons, mentorship, sponsorship, or general inquiries. We're here to help!" 
        />
      </Head>
      
      <Container maxWidth="lg">
        <Box sx={{ mt: 12, mb: 8 }}>
          <Typography variant="h2" component="h1" align="center" gutterBottom>
            Contact Us
          </Typography>
          <Typography variant="h5" align="center" color="text.secondary" paragraph>
            We'd love to hear from you. How can we help?
          </Typography>
          
          {/* Main content area */}
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {/* Contact form */}
            <Grid item xs={12} md={8}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: { xs: 3, md: 4 },
                  borderRadius: 2,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {submitSuccess ? (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Box 
                      sx={{ 
                        width: 80, 
                        height: 80, 
                        borderRadius: '50%', 
                        bgcolor: 'success.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3
                      }}
                    >
                      <FaCheck size={36} color="white" />
                    </Box>
                    <Typography variant="h4" gutterBottom>
                      Message Sent!
                    </Typography>
                    <Typography variant="body1" paragraph color="text.secondary">
                      Thank you for reaching out. We've received your message and will get back to you soon.
                    </Typography>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      onClick={() => {
                        setSubmitSuccess(false);
                        window.scrollTo(0, 0);
                      }}
                      sx={{ mt: 2 }}
                    >
                      Send Another Message
                    </Button>
                  </Box>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="First Name"
                          name="firstName"
                          value={formState.firstName}
                          onChange={handleChange}
                          fullWidth
                          required
                          error={!!formErrors.firstName}
                          helperText={formErrors.firstName}
                          disabled={isSubmitting}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Last Name"
                          name="lastName"
                          value={formState.lastName}
                          onChange={handleChange}
                          fullWidth
                          disabled={isSubmitting}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Email Address"
                          name="email"
                          type="email"
                          value={formState.email}
                          onChange={handleChange}
                          fullWidth
                          required
                          error={!!formErrors.email}
                          helperText={formErrors.email}
                          disabled={isSubmitting}
                          InputProps={{
                            startAdornment: <FaEnvelope style={{ marginRight: 8, opacity: 0.6 }} />,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Organization/Company (Optional)"
                          name="organization"
                          value={formState.organization}
                          onChange={handleChange}
                          fullWidth
                          placeholder="Where are you from?"
                          disabled={isSubmitting}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          select
                          label="What are you contacting us about?"
                          name="inquiryType"
                          value={formState.inquiryType}
                          onChange={handleChange}
                          fullWidth
                          required
                          error={!!formErrors.inquiryType}
                          helperText={formErrors.inquiryType || "Select the option that best matches your inquiry"}
                          disabled={isSubmitting}
                        >
                          <MenuItem value="" disabled>
                            <em>Select an option</em>
                          </MenuItem>
                          {INQUIRY_TYPES.map(option => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      
                      {/* Conditional information based on inquiry type */}
                      {selectedInquiryType && selectedInquiryType.link && (
                        <Grid item xs={12}>
                          <Alert 
                            severity="info" 
                            icon={false}
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between'
                            }}
                          >
                            <Typography variant="body2">
                              Looking for information about {selectedInquiryType.label.toLowerCase()}? 
                              Check out our dedicated page.
                            </Typography>
                            <Button
                              variant="outlined"
                              size="small"
                              href={selectedInquiryType.link}
                              endIcon={<FaExternalLinkAlt />}
                              sx={{ ml: 2, whiteSpace: 'nowrap' }}
                            >
                              {selectedInquiryType.linkText}
                            </Button>
                          </Alert>
                        </Grid>
                      )}
                      
                      <Grid item xs={12}>
                        <TextField
                          label="Message"
                          name="message"
                          value={formState.message}
                          onChange={handleChange}
                          multiline
                          rows={6}
                          fullWidth
                          required
                          error={!!formErrors.message}
                          helperText={formErrors.message || "Please provide details about your inquiry"}
                          disabled={isSubmitting}
                          placeholder="How can we help you?"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Checkbox 
                              checked={formState.receiveUpdates} 
                              onChange={handleChange}
                              name="receiveUpdates"
                              color="primary"
                              disabled={isSubmitting}
                            />
                          }
                          label="I'd like to receive updates about upcoming Opportunity Hack events"
                        />
                      </Grid>
                      {submitError && (
                        <Grid item xs={12}>
                          <Alert severity="error">{submitError}</Alert>
                        </Grid>
                      )}
                      {recaptchaError && (
                        <Grid item xs={12}>
                          <Alert severity="error">{recaptchaError}</Alert>
                        </Grid>
                      )}
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="large"
                            disabled={isSubmitting || recaptchaLoading}
                            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <FaPaperPlane />}
                          >
                            {isSubmitting ? 'Sending...' : 'Send Message'}
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </form>
                )}
              </Paper>
            </Grid>
            
            {/* Contact info sidebar */}
            <Grid item xs={12} md={4}>
              <Box sx={{ position: 'sticky', top: 100 }}>
                <Card elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" component="h2" gutterBottom>
                      Quick Links
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Link href="/hack" underline="hover">
                        Current Hackathons
                      </Link>
                      <Link href="/nonprofits" underline="hover">
                        For Nonprofits
                      </Link>
                      <Link href="/sponsor" underline="hover">
                        Sponsorship Opportunities
                      </Link>
                      <Link href="/about" underline="hover">
                        About Opportunity Hack
                      </Link>
                      <Link href="/blog" underline="hover">
                        Blog & News
                      </Link>
                    </Box>
                  </CardContent>
                </Card>
                
                <Card elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" component="h2" gutterBottom>
                      Common Inquiries
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {INQUIRY_TYPES.slice(0, 6).map(type => (
                        <Chip 
                          key={type.value} 
                          label={type.label}
                          onClick={() => {
                            setFormState(prev => ({
                              ...prev,
                              inquiryType: type.value
                            }));
                            // Scroll to form on mobile
                            if (isMobile) {
                              const formElement = document.querySelector('form');
                              if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                          clickable
                          sx={{ mb: 1 }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
                
                <Card elevation={2} sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" component="h2" gutterBottom>
                      Response Time
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2" paragraph>
                      We do our best to respond to all inquiries within 48 hours. For urgent matters, please indicate this in your message.
                    </Typography>
                    <Typography variant="body2">
                      Please note that response times may be longer during hackathon events.
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default ContactPage;