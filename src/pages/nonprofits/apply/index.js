'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';
import {
  Typography, TextField, Button, FormControlLabel, Checkbox,
  Container, Box, Grid, Paper, List, ListItem, ListItemIcon,
  ListItemText, CircularProgress, Alert, Card, CardContent,
  Divider, Accordion, AccordionSummary, AccordionDetails, Stepper,
  Step, StepLabel, Avatar, Chip, LinearProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Parallax } from "react-parallax";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CodeIcon from '@mui/icons-material/Code';
import CloudIcon from '@mui/icons-material/Cloud';
import BuildIcon from '@mui/icons-material/Build';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SupportIcon from '@mui/icons-material/Support';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Security';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import StarIcon from '@mui/icons-material/Star';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useTheme } from '@mui/material/styles';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import * as ga from '../../../lib/ga';
import ScrollTracker from '../../../components/ScrollTracker';
import JourneyTracker, { JourneyTypes } from '../../../components/JourneyTracker';

// Debounce function to limit the number of events sent
const debounce = (func, delay) => {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

// Bot detection utility functions
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;

  const disposableDomains = [
    "tempmail.com", "throwaway.email", "guerrillamail.com", "mailinator.com",
    "10minutemail.com", "trashmail.com", "temp-mail.org", "fakeinbox.com",
  ];
  const domain = email.split("@")[1]?.toLowerCase();
  return !disposableDomains.includes(domain);
};

const isValidTextInput = (text, fieldName, minLength = 2) => {
  if (!text || text.trim().length < minLength) return false;
  const trimmedText = text.trim();
  const maxLength = fieldName === 'idea' ? 2000 : 100;
  if (trimmedText.length > maxLength) return false;

  const consonantPattern = /[bcdfghjklmnpqrstvwxyz]{10,}/i;
  if (consonantPattern.test(trimmedText)) return false;

  const words = trimmedText.split(/\s+/);
  for (const word of words) {
    if (word.length > 15) {
      const uppercaseCount = (word.match(/[A-Z]/g) || []).length;
      const lowercaseCount = (word.match(/[a-z]/g) || []).length;
      if (uppercaseCount >= 4 && lowercaseCount >= 4) {
        let caseChanges = 0;
        for (let i = 1; i < word.length; i++) {
          const prevIsUpper = /[A-Z]/.test(word[i - 1]);
          const currIsUpper = /[A-Z]/.test(word[i]);
          if (prevIsUpper !== currIsUpper) caseChanges++;
        }
        if (caseChanges > word.length * 0.3) return false;
      }
    }
  }

  if (trimmedText.length > 8 && !/[aeiou]/i.test(trimmedText)) return false;
  if ((fieldName === 'name' || fieldName === 'organization') && trimmedText.length > 25) {
    if (!trimmedText.includes(' ')) return false;
  }

  if (fieldName !== 'idea') {
    const repetitivePattern = /(.{3,})\1{2,}/;
    if (repetitivePattern.test(trimmedText.replace(/\s/g, ''))) return false;
  }

  if (fieldName !== 'idea' && trimmedText.length <= 30) {
    const uniqueChars = new Set(trimmedText.toLowerCase().replace(/\s/g, ''));
    const charDiversityRatio = uniqueChars.size / Math.max(1, trimmedText.replace(/\s/g, '').length);
    if (charDiversityRatio < 0.25 && trimmedText.replace(/\s/g, '').length > 15) return false;
  }

  return true;
};

// Styled Components
const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  padding: theme.spacing(8, 0),
  textAlign: 'center',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(6, 0),
  },
}));

const StatsCard = styled(Card)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(3),
  height: '100%',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
  },
}));

const BenefitCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.03)',
    boxShadow: theme.shadows[6],
  },
}));

const TestimonialCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.grey[50],
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  marginBottom: theme.spacing(3),
}));

const ProcessStep = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  textAlign: 'center',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
}));

const CTAButton = styled(Button)(({ theme }) => ({
  fontSize: '1.2rem',
  padding: theme.spacing(2, 6),
  borderRadius: theme.spacing(3),
  boxShadow: theme.shadows[4],
  '&:hover': {
    boxShadow: theme.shadows[8],
    transform: 'translateY(-2px)',
  },
  transition: 'all 0.3s ease-in-out',
}));

export default function Apply({ title, description, openGraphData }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    idea: '',
    isNonProfit: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [lastTrackedValues, setLastTrackedValues] = useState({
    name: '', email: '', organization: '', idea: '', isNonProfit: false,
  });
  const [formStartTime, setFormStartTime] = useState(null);
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formVisible, setFormVisible] = useState(false);

  // Bot detection state
  const [honeypot, setHoneypot] = useState('');
  const formInteractionStartTime = useRef(null);
  const submissionAttemptsRef = useRef(0);
  const lastSubmissionTimeRef = useRef(0);
  const formSectionRef = useRef(null);

  // Track section views
  const [viewedSections, setViewedSections] = useState(new Set());

  useEffect(() => {
    ga.initFacebookPixel();
    setFormStartTime(new Date());

    const pageMetadata = {
      page_type: 'application_form',
      form_type: 'nonprofit_application',
      referrer: document.referrer || 'direct'
    };

    ga.trackJourneyStep(
      JourneyTypes.NONPROFIT.name,
      JourneyTypes.NONPROFIT.steps.VIEW_APPLY,
      pageMetadata
    );

    ga.trackStructuredEvent(
      ga.EventCategory.FORM,
      ga.EventAction.VIEW,
      'nonprofit_application',
      null,
      pageMetadata
    );

    ga.trackForm('nonprofit_application', ga.EventAction.START, null, null);

    return () => {
      if (!submitSuccess && formStartTime) {
        const timeSpent = Math.round((new Date() - formStartTime) / 1000);
        ga.trackForm('nonprofit_application', 'abandon', null, timeSpent);
      }
    };
  }, []);

  // Track section visibility
  const trackSectionView = useCallback((sectionName) => {
    if (!viewedSections.has(sectionName)) {
      setViewedSections(prev => new Set([...prev, sectionName]));
      ga.trackContentEngagement(
        'page_section',
        sectionName,
        'view',
        { page_type: 'nonprofit_application' }
      );
    }
  }, [viewedSections]);

  // Enhanced form field tracking
  const trackFormField = useCallback((fieldName, fieldValue, interactionType = 'change') => {
    ga.trackForm(
      'nonprofit_application',
      interactionType,
      fieldName,
      typeof fieldValue === 'string' ? fieldValue.length : fieldValue
    );
  }, []);

  const debouncedTrackFieldChange = useCallback(
    debounce((fieldName, fieldValue) => {
      if (fieldValue !== lastTrackedValues[fieldName]) {
        trackFormField(fieldName, fieldValue);
        setLastTrackedValues(prev => ({ ...prev, [fieldName]: fieldValue }));
      }
    }, 800),
    [lastTrackedValues, trackFormField]
  );

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    const fieldValue = name === 'isNonProfit' ? checked : value;

    if (!formInteractionStartTime.current) {
      formInteractionStartTime.current = Date.now();
    }

    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (formError) setFormError(null);

    setFormData(prev => ({ ...prev, [name]: fieldValue }));
    debouncedTrackFieldChange(name, fieldValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    ga.trackForm('nonprofit_application', 'submit_attempt', null, null);

    try {
      // Bot detection checks
      if (honeypot) {
        console.warn('Bot detected: honeypot filled');
        setFormError('Something went wrong. Please try again.');
        setIsSubmitting(false);
        ga.trackError('bot_detection', 'honeypot_filled', 'nonprofit_application');
        return;
      }

      if (formInteractionStartTime.current) {
        const timeTaken = Date.now() - formInteractionStartTime.current;
        if (timeTaken < 3000) {
          console.warn('Bot detected: submission too quick', timeTaken);
          setFormError('Please take your time filling out the form.');
          setIsSubmitting(false);
          ga.trackError('bot_detection', 'submission_too_quick', 'nonprofit_application');
          return;
        }
      }

      const now = Date.now();
      const timeSinceLastSubmission = now - lastSubmissionTimeRef.current;
      if (timeSinceLastSubmission < 10000) {
        setFormError('Please wait a moment before submitting again.');
        setIsSubmitting(false);
        return;
      }

      if (submissionAttemptsRef.current >= 3) {
        setFormError('Too many attempts. Please refresh the page and try again.');
        setIsSubmitting(false);
        return;
      }

      // Validate all text fields
      const errors = {};
      if (!isValidEmail(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
      if (!isValidTextInput(formData.name, 'name', 2)) {
        errors.name = 'Please enter a valid name (at least 2 characters, no random strings)';
      }
      if (formData.organization && !isValidTextInput(formData.organization, 'organization', 2)) {
        errors.organization = 'Please enter a valid organization name (no random strings)';
      }
      if (!isValidTextInput(formData.idea, 'idea', 10)) {
        errors.idea = 'Please provide a meaningful description of your idea (at least 10 characters)';
      }

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setFormError('Please fix the errors in the form before submitting.');
        setIsSubmitting(false);
        ga.trackError('form_validation', 'invalid_fields', 'nonprofit_application');
        return;
      }

      if (!executeRecaptcha) {
        console.error('Execute recaptcha not yet available');
        setFormError('reCAPTCHA not ready. Please try again in a moment.');
        setIsSubmitting(false);
        return;
      }

      const token = await executeRecaptcha('nonprofit_application_submit');
      if (!token) {
        throw new Error('Failed to obtain reCAPTCHA token');
      }

      submissionAttemptsRef.current += 1;
      lastSubmissionTimeRef.current = Date.now();

      const formDataWithToken = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        organization: formData.organization.trim(),
        idea: formData.idea.trim(),
        isNonProfit: formData.isNonProfit,
        token
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npo/submit-application`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDataWithToken),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Network response was not ok');
      }

      const result = await response.json();
      console.log(result);

      const timeToComplete = formStartTime ? Math.round((new Date() - formStartTime) / 1000) : null;

      ga.trackForm('nonprofit_application', ga.EventAction.COMPLETE, null, timeToComplete);

      ga.trackJourneyStep(
        JourneyTypes.NONPROFIT.name,
        JourneyTypes.NONPROFIT.steps.SUBMIT_APPLICATION,
        {
          organization_provided: !!formData.organization,
          is_nonprofit: formData.isNonProfit,
          idea_length: formData.idea.length,
          time_to_complete: timeToComplete
        }
      );

      if (formData.email) ga.set(formData.email);

      setFormData({
        name: '', email: '', organization: '', idea: '', isNonProfit: false,
      });
      formInteractionStartTime.current = null;
      setSubmitSuccess(true);

      // Scroll to success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error submitting form:', error);
      ga.trackError('form_submission_error', error.message, 'nonprofit_application');
      setFormError(error.message || 'An error occurred while submitting the form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIdeaChange = useCallback((e) => {
    const value = e.target.value;
    if (!formInteractionStartTime.current) {
      formInteractionStartTime.current = Date.now();
    }
    if (fieldErrors.idea) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.idea;
        return newErrors;
      });
    }
    if (formError) setFormError(null);
    setFormData(prev => ({ ...prev, idea: value }));

    const significantThresholds = [20, 50, 100, 200];
    const previousLength = formData.idea.length;
    const currentLength = value.length;
    const previousThreshold = significantThresholds.findIndex(threshold => previousLength < threshold);
    const currentThreshold = significantThresholds.findIndex(threshold => currentLength < threshold);

    if (previousThreshold !== currentThreshold && currentThreshold !== -1) {
      ga.trackForm('nonprofit_application', 'milestone', 'idea_length', significantThresholds[currentThreshold]);
    } else {
      debouncedTrackFieldChange('idea', value);
    }
  }, [formData.idea, debouncedTrackFieldChange, fieldErrors, formError]);

  const scrollToForm = () => {
    setFormVisible(true);
    ga.trackStructuredEvent(
      ga.EventCategory.NAVIGATION,
      ga.EventAction.CLICK,
      'scroll_to_form_cta',
      null,
      { cta_location: 'hero' }
    );
    setTimeout(() => {
      formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        {openGraphData.map((og) => (
          <meta key={og.key} name={og.name} property={og.property} content={og.content} />
        ))}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "Nonprofit and Social Good Project Application - Opportunity Hack",
              "description": "Submit your nonprofit project or social good idea for free software development support. Opportunity Hack connects innovators with skilled volunteers to create tech solutions for social impact.",
              "url": "https://ohack.dev/nonprofits/apply",
              "potentialAction": {
                "@type": "ApplyAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://ohack.dev/nonprofits/apply",
                  "actionPlatform": [
                    "http://schema.org/DesktopWebPlatform",
                    "http://schema.org/MobileWebPlatform"
                  ]
                },
                "result": {
                  "@type": "CreativeWork",
                  "name": "Nonprofit Project Application"
                }
              }
            }
          `}
        </script>
      </Head>

      <JourneyTracker
        journey={JourneyTypes.NONPROFIT.name}
        step={JourneyTypes.NONPROFIT.steps.START_APPLICATION}
      />

      <ScrollTracker pageType="nonprofit_application" />

      {/* Hero Section with Clear Value Proposition */}
      <HeroSection>
        <Container maxWidth="lg">
          <Typography
            variant="h1"
            component="h1"
            gutterBottom
            sx={{
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
              fontWeight: 'bold',
              mb: 2,
              mt: 5
            }}
          >
            Turn Your Nonprofit Vision Into Reality
          </Typography>
          <Typography
            variant="h5"
            component="h2"
            sx={{
              fontSize: { xs: '1.2rem', sm: '1.5rem' },
              mb: 4,
              opacity: 0.95,
            }}
          >
            Get Free Professional Software Development for Your Social Impact Project
          </Typography>
          <CTAButton
            variant="contained"
            color="secondary"
            size="large"
            onClick={scrollToForm}
            sx={{ mt: 2 }}
          >
            Apply Now - It's Free
          </CTAButton>
          <Typography sx={{ mt: 2, fontSize: '0.9rem', opacity: 0.9 }}>
            We'll respond within 7 days • No technical expertise required
          </Typography>
        </Container>
      </HeroSection>

      <Container maxWidth="lg" sx={{ my: 8 }}>
        {submitSuccess && (
          <Alert
            severity="success"
            sx={{ mb: 4, fontSize: '1.1rem', p: 3 }}
            icon={<CheckCircleOutlineIcon fontSize="large" />}
          >
            <Typography variant="h6" gutterBottom>Application Submitted Successfully!</Typography>
            <Typography>
              Thank you for applying! Our team will review your submission and respond within 7 days.
              Check your email (including spam folder) for our response from an @ohack.org address.
            </Typography>
          </Alert>
        )}

        {/* Social Proof - Impact Stats */}
        <Box sx={{ mb: 8 }} onMouseEnter={() => trackSectionView('impact_stats')}>
          <Typography variant="h4" component="h2" align="center" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
            Proven Impact Across Nonprofits
          </Typography>
          <Grid container spacing={3}>
            {[
              { number: '50+', label: 'Nonprofits Helped', icon: <GroupWorkIcon fontSize="large" /> },
              { number: '200+', label: 'Volunteer Developers', icon: <CodeIcon fontSize="large" /> },
              { number: '$500K+', label: 'Value Delivered', icon: <MonetizationOnIcon fontSize="large" /> },
              { number: '10+', label: 'Years of Impact', icon: <TrendingUpIcon fontSize="large" /> },
            ].map((stat, index) => (
              <Grid size={{ xs: 6, md: 3 }} key={index}>
                <StatsCard elevation={2}>
                  <Box sx={{ color: 'primary.main', mb: 1 }}>{stat.icon}</Box>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {stat.number}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {stat.label}
                  </Typography>
                </StatsCard>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Key Benefits Section */}
        <Box sx={{ mb: 8 }} onMouseEnter={() => trackSectionView('key_benefits')}>
          <Typography variant="h4" component="h2" align="center" gutterBottom sx={{ mb: 2, fontWeight: 'bold' }}>
            What You Get With Opportunity Hack
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem' }}>
            Everything you need to bring your tech solution to life - at no cost to you
          </Typography>
          <Grid container spacing={3}>
            {[
              {
                icon: <CodeIcon sx={{ fontSize: 50 }} />,
                title: 'Free Professional Development',
                description: 'Skilled developers build your solution during our hackathons - zero development costs for you',
                color: '#667eea'
              },
              {
                icon: <GroupWorkIcon sx={{ fontSize: 50 }} />,
                title: 'Passionate Tech Volunteers',
                description: 'Work with experienced professionals who care about social impact and want to help nonprofits succeed',
                color: '#764ba2'
              },
              {
                icon: <CloudIcon sx={{ fontSize: 50 }} />,
                title: 'Hosting Support Included',
                description: 'We cover hosting costs up to $20/month plus $250 for one-time setup - you focus on your mission',
                color: '#f093fb'
              },
              {
                icon: <SupportIcon sx={{ fontSize: 50 }} />,
                title: 'Ongoing Maintenance',
                description: 'Quarterly check-ins and volunteer network for urgent needs - we stay with you after launch',
                color: '#4facfe'
              },
              {
                icon: <SecurityIcon sx={{ fontSize: 50 }} />,
                title: 'Open Source & Yours Forever',
                description: 'MIT licensed code means you own it, can modify it, and use it however you need - no vendor lock-in',
                color: '#43e97b'
              },
              {
                icon: <MonetizationOnIcon sx={{ fontSize: 50 }} />,
                title: '50% Profit Sharing',
                description: 'If we successfully sell your solution to others, you receive 50% of profits - free to use, potential revenue',
                color: '#fa709a'
              },
            ].map((benefit, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={index}>
                <BenefitCard elevation={3}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ color: benefit.color, mb: 2 }}>
                      {benefit.icon}
                    </Box>
                    <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                      {benefit.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '1rem' }}>
                      {benefit.description}
                    </Typography>
                  </CardContent>
                </BenefitCard>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Success Stories / Testimonials */}
        <Box sx={{ mb: 8, backgroundColor: 'grey.50', p: 4, borderRadius: 2 }} onMouseEnter={() => trackSectionView('testimonials')}>
          <Typography variant="h4" component="h2" align="center" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
            Real Nonprofits, Real Results
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TestimonialCard elevation={0}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <FormatQuoteIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 2, fontSize: '1.05rem' }}>
                      "Matthews Crossing Data Manager has transformed our operations. It's allowed us to redirect valuable volunteer time from paperwork to serving our community. The automated reports have given us new insights to better serve the 80,000 people we help each year."
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>MC</Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          Matthews Crossing Food Bank
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Estimated $150K in time savings across food bank network
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </TestimonialCard>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TestimonialCard elevation={0}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <FormatQuoteIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 2, fontSize: '1.05rem' }}>
                      "Zuri's Dashboard has revolutionized how we interact with our community. It's not just about collecting emails anymore; it's about understanding our impact. This technology allows us to focus on what truly matters - helping families, the elderly, and the homeless."
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>ZC</Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          Zuri's Circle
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Streamlined event management and community engagement
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </TestimonialCard>
            </Grid>
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button
              variant="outlined"
              color="primary"
              href="/about/success-stories"
              onClick={() => {
                ga.trackStructuredEvent(
                  ga.EventCategory.NAVIGATION,
                  ga.EventAction.CLICK,
                  'view_success_stories',
                  null,
                  { source: 'nonprofit_application' }
                );
              }}
            >
              Read More Success Stories
            </Button>
          </Box>
        </Box>

        {/* Process Overview */}
        <Box sx={{ mb: 8 }} onMouseEnter={() => trackSectionView('process_overview')}>
          <Typography variant="h4" component="h2" align="center" gutterBottom sx={{ mb: 2, fontWeight: 'bold' }}>
            How It Works - Simple 4-Step Process
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem' }}>
            From application to launch, we guide you every step of the way
          </Typography>
          <Grid container spacing={3}>
            {[
              {
                step: '1',
                title: 'Apply in 5 Minutes',
                description: 'Submit your project idea through our simple form below. No technical knowledge needed.',
                icon: <AccessTimeIcon sx={{ fontSize: 40 }} />
              },
              {
                step: '2',
                title: 'We Review & Respond',
                description: 'Our team reviews your application within 7 days and helps refine your project scope.',
                icon: <CheckCircleOutlineIcon sx={{ fontSize: 40 }} />
              },
              {
                step: '3',
                title: 'Hackathon Development',
                description: 'Skilled volunteers build your solution during a weekend hackathon event.',
                icon: <CodeIcon sx={{ fontSize: 40 }} />
              },
              {
                step: '4',
                title: 'Launch & Support',
                description: 'For teams that win the hackathon, we help deploy the solution and provide ongoing quarterly check-ins.',
                icon: <TrendingUpIcon sx={{ fontSize: 40 }} />
              },
            ].map((process, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <ProcessStep elevation={2}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {process.icon}
                  </Box>
                  <Chip
                    label={`Step ${process.step}`}
                    color="primary"
                    size="small"
                    sx={{ mb: 2, fontWeight: 'bold' }}
                  />
                  <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {process.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {process.description}
                  </Typography>
                </ProcessStep>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* FAQ Section */}
        <Box sx={{ mb: 8 }} onMouseEnter={() => trackSectionView('faq')}>
          <Typography variant="h4" component="h2" align="center" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
            Common Questions Answered
          </Typography>
          {[
            {
              question: 'Do I need to be a registered 501(c)(3) nonprofit?',
              answer: 'No! While we prioritize registered nonprofits, we welcome all social good projects. Whether you\'re a community group, social enterprise, or individual with a mission-driven idea, we want to hear from you.'
            },
            {
              question: 'What if I\'m not technical - can I still apply?',
              answer: 'Absolutely! No technical expertise required. Our team will work with you to understand your needs and translate them into a technical solution. We\'ll guide you through the entire process in plain language.'
            },
            {
              question: 'What types of projects do you accept?',
              answer: 'We accept a wide range of projects: data management systems, volunteer coordination tools, donation tracking, event management platforms, community engagement apps, and more. If technology can help your mission, we want to help.'
            },
            {
              question: 'How much does this cost?',
              answer: 'Zero upfront costs! Development is completely free. We cover initial hosting ($20/month + $250 one-time setup). As your project grows, you may need to cover additional hosting costs, but we\'ll help you understand and manage these expenses.'
            },
            {
              question: 'What happens after the hackathon?',
              answer: 'We don\'t just build and leave! You get quarterly check-ins for maintenance, access to our volunteer network for urgent needs, and ongoing support to ensure your solution continues serving your mission.'
            },
            {
              question: 'Can I see examples of past projects?',
              answer: 'Yes! Check out our success stories page to see real nonprofits we\'ve helped, including Matthews Crossing Food Bank (estimated $150K in savings), Zuri\'s Circle (improved community engagement), and many more.'
            },
          ].map((faq, index) => (
            <Accordion
              key={index}
              elevation={1}
              sx={{ mb: 1 }}
              onChange={(e, expanded) => {
                if (expanded) {
                  ga.trackStructuredEvent(
                    ga.EventCategory.CONTENT,
                    'expand',
                    `faq_${index}`,
                    null,
                    { question: faq.question }
                  );
                }
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 'bold' }}>{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="text.secondary">{faq.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {/* Trust Signals */}
        <Box sx={{ mb: 8, textAlign: 'center' }} onMouseEnter={() => trackSectionView('trust_signals')}>
          <Grid container spacing={2} justifyContent="center">
            {[
              { icon: <VerifiedIcon />, text: 'Trusted by 50+ Nonprofits' },
              { icon: <SecurityIcon />, text: 'Secure & Confidential' },
              { icon: <StarIcon />, text: '10+ Years of Service' },
            ].map((trust, index) => (
              <Grid key={index}>
                <Chip
                  icon={trust.icon}
                  label={trust.text}
                  color="primary"
                  variant="outlined"
                  sx={{ fontSize: '1rem', p: 2, height: 'auto' }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Application Form */}
        <Paper
          ref={formSectionRef}
          elevation={6}
          sx={{ p: isMobile ? 3 : 5, my: 4, backgroundColor: 'background.default' }}
          onMouseEnter={() => trackSectionView('application_form')}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
              Ready to Get Started? Apply Now
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
              Takes less than 5 minutes • Response within 7 days • Completely free
            </Typography>
          </Box>

          {!submitSuccess ? (
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{
                  position: 'absolute',
                  left: '-9999px',
                  width: '1px',
                  height: '1px',
                  opacity: 0,
                  pointerEvents: 'none',
                }}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              {formError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {formError}
                </Alert>
              )}

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Your Name *"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    error={!!fieldErrors.name}
                    helperText={fieldErrors.name || ''}
                    onFocus={() => trackFormField('name', formData.name, 'focus')}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Email Address *"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    error={!!fieldErrors.email}
                    helperText={fieldErrors.email || ''}
                    onFocus={() => trackFormField('email', formData.email, 'focus')}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Organization Name"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    error={!!fieldErrors.organization}
                    helperText={fieldErrors.organization || 'Optional - Leave blank if you\'re an individual'}
                    onFocus={() => trackFormField('organization', formData.organization, 'focus')}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Your Project Idea or Problem to Solve *"
                    name="idea"
                    multiline
                    rows={6}
                    value={formData.idea}
                    onChange={handleIdeaChange}
                    required
                    disabled={isSubmitting}
                    error={!!fieldErrors.idea}
                    helperText={
                      fieldErrors.idea ||
                      'Tell us about your challenge. What would you like to accomplish? Who would it help? No need to be technical - just describe your vision in your own words.'
                    }
                    onFocus={() => trackFormField('idea', formData.idea, 'focus')}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.isNonProfit}
                        onChange={handleChange}
                        name="isNonProfit"
                        disabled={isSubmitting}
                      />
                    }
                    label="I represent a registered 501(c)(3) nonprofit organization (Optional - we accept all social good projects!)"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <CTAButton
                    variant="contained"
                    color="primary"
                    type="submit"
                    fullWidth
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={24} color="inherit" /> : null}
                  >
                    {isSubmitting ? 'Submitting Your Application...' : 'Submit Your Project Application'}
                  </CTAButton>
                  <Typography
                    variant="caption"
                    display="block"
                    align="center"
                    sx={{ mt: 2 }}
                    color="text.secondary"
                  >
                    By submitting, you agree to our terms. We'll respond within 7 days.
                  </Typography>
                </Grid>
              </Grid>
            </form>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                Thank You for Applying!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                We've received your application and will review it carefully. You'll hear from us within 7 days.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Check your email (including spam folder) for our response.
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Final CTA Section */}
        <Box sx={{ textAlign: 'center', my: 6, p: 4, backgroundColor: 'primary.light', borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Questions? We're Here to Help
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Not sure if your project is a good fit? Reach out and let's discuss how we can help bring your vision to life.
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            href="/contact"
            onClick={() => {
              ga.trackStructuredEvent(
                ga.EventCategory.NAVIGATION,
                ga.EventAction.CLICK,
                'contact_us',
                null,
                { source: 'nonprofit_application' }
              );
            }}
          >
            Contact Us
          </Button>
        </Box>

        {/* Video Section */}
        <Box mb={4} mt={4} onMouseEnter={() => trackSectionView('video')}>
          <Typography variant="h4" component="h4" gutterBottom align="center" sx={{ mb: 3, fontWeight: 'bold' }}>
            See Opportunity Hack in Action
          </Typography>
          <Box
            sx={{
              position: 'relative',
              paddingBottom: '56.25%',
              height: 0,
              overflow: 'hidden',
              borderRadius: 2,
              boxShadow: 3
            }}
          >
            <iframe
              src="https://www.youtube.com/embed/Ia_xsX-318E"
              title="Opportunity Hack: Connecting Nonprofits with Tech Solutions"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 0
              }}
              onLoad={() => {
                ga.trackContentEngagement('video', 'intro_video', 'load', { page: 'nonprofit_application' });
              }}
            />
          </Box>
        </Box>
      </Container>
    </>
  );
}

export async function getStaticProps() {
  return {
    props: {
      title: "Apply for Opportunity Hack - Free Tech Solutions for Nonprofits",
      description: "Submit your nonprofit project for Opportunity Hack anytime. Get free software development support, connect with skilled tech volunteers, and benefit from 50% profit sharing on successful solutions.",
      openGraphData: [
        {
          name: "og:title",
          property: "og:title",
          content: "Apply Now: Opportunity Hack - Free Tech Solutions for Nonprofits",
          key: "ogtitle"
        },
        {
          name: "og:description",
          property: "og:description",
          content: "Submit your nonprofit project for Opportunity Hack! Get free software development, connect with skilled volunteers, and enjoy 50% profit sharing on successful solutions.",
          key: "ogdescription"
        },
        {
          name: "title",
          property: "title",
          content: "Apply Now: Opportunity Hack - Free Tech Solutions for Nonprofits",
          key: "title"
        },
        {
          name: "author",
          property: "author",
          content: "Opportunity Hack",
          key: "author"
        },
        {
          name: "image",
          property: "og:image",
          content: "https://ohack.dev/OHack_NonProfit_Application.png",
          key: "ognameimage"
        },
        {
          property: "og:image:width",
          content: "1200",
          key: "ogimagewidth",
        },
        {
          property: "og:image:height",
          content: "630",
          key: "ogimageheight",
        },
        {
          name: "url",
          property: "url",
          content: "https://ohack.dev/nonprofits/apply",
          key: "url"
        },
        {
          name: "org:url",
          property: "org:url",
          content: "https://ohack.dev/nonprofits/apply",
          key: "ogurl"
        },
        {
          name: "twitter:card",
          property: "twitter:card",
          content: "summary_large_image",
          key: "twittercard"
        },
        {
          name: "twitter:site",
          property: "twitter:site",
          content: "@opportunityhack",
          key: "twittersite"
        },
        {
          name: "twitter:title",
          property: "twitter:title",
          content: "Apply Now: Opportunity Hack - Free Tech Solutions for Nonprofits",
          key: "twittertitle"
        },
        {
          name: "twitter:description",
          property: "twitter:description",
          content: "Submit your nonprofit project anytime! Get free software development, connect with skilled volunteers, and enjoy 50% profit sharing on successful solutions.",
          key: "twitterdesc"
        },
        {
          name: "twitter:image",
          property: "twitter:image",
          content: "https://ohack.dev/OHack_NonProfit_Application.png",
          key: "twitterimage"
        },
        {
          name: "twitter:image:alt",
          property: "twitter:image:alt",
          content: "Opportunity Hack logo for nonprofit applications",
          key: "twitterimagealt"
        },
        {
          name: "twitter:creator",
          property: "twitter:creator",
          content: "@opportunityhack",
          key: "twittercreator"
        }
      ]
    },
  };
}
