import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import {
  Container,
  Typography,
  Paper,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuthInfo } from '@propelauth/react';
import ExploreIcon from '@mui/icons-material/Explore';

// Components
import WelcomeSection from '../../components/Onboarding/WelcomeSection';
import MissionOverview from '../../components/Onboarding/MissionOverview';
import ChannelsExploration from '../../components/Onboarding/ChannelsExploration';
import IntroductionPrompt from '../../components/Onboarding/IntroductionPrompt';
import SlackTutorial from '../../components/Onboarding/SlackTutorial';
import BuddySystem from '../../components/Onboarding/BuddySystem';
import OnboardingFAQ from '../../components/Onboarding/OnboardingFAQ';
import FeedbackSection from '../../components/Onboarding/FeedbackSection';
import JourneyTracker, { JourneyTypes } from '../../components/JourneyTracker';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  transition: "transform 0.2s",
  "&:hover": {
    transform: "translateY(-2px)",
  },
}));

// Define onboarding steps
const steps = [
  'Welcome',
  'Our Mission',
  'Community Channels',
  'Introduce Yourself',
  'Slack Tutorial',
  'Find a Buddy',
  'FAQs',
  'Feedback'
];

// Create an Onboarding journey in JourneyTracker
const OnboardingJourney = {
  name: 'onboarding',
  steps: {
    START_ONBOARDING: 'start_onboarding',
    VIEW_MISSION: 'view_mission',
    EXPLORE_CHANNELS: 'explore_channels',
    COMPLETE_INTRODUCTION: 'complete_introduction',
    COMPLETE_TUTORIAL: 'complete_tutorial',
    FIND_BUDDY: 'find_buddy',
    READ_FAQ: 'read_faq',
    PROVIDE_FEEDBACK: 'provide_feedback',
    COMPLETE_ONBOARDING: 'complete_onboarding'
  }
};

export default function Onboarding() {
  const { user, isLoading: authLoading } = useAuthInfo();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  
  // Track onboarding progress and save to localStorage
  useEffect(() => {
    // Load saved progress
    const savedProgress = localStorage.getItem('ohack_onboarding_progress');
    if (savedProgress) {
      try {
        const { step, completedSteps } = JSON.parse(savedProgress);
        setActiveStep(step);
        setCompleted(completedSteps);
      } catch (err) {
        console.error('Error parsing saved onboarding progress:', err);
      }
    }
  }, []);

  // Save progress on step change
  useEffect(() => {
    localStorage.setItem('ohack_onboarding_progress', JSON.stringify({
      step: activeStep,
      completedSteps: completed
    }));
    
    // Track journey step
    const currentStepKey = Object.keys(OnboardingJourney.steps)[activeStep];
    const currentStep = OnboardingJourney.steps[currentStepKey];
    
    if (currentStep) {
      // Track the current step in the journey
      const journeyData = {
        step_number: activeStep + 1,
        total_steps: steps.length
      };
      
      // Only track if we have a valid user
      if (user && user.userId) {
        journeyData.user_id = user.userId;
      }
      
      // Use JourneyTracker to track progress
      // This will be rendered but doesn't add anything to the DOM
    }
  }, [activeStep, completed, user]);

  const handleNext = () => {
    // Mark current step as completed
    const newCompleted = { ...completed };
    newCompleted[activeStep] = true;
    setCompleted(newCompleted);
    
    // Move to next step
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleComplete = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Mark all steps as completed
      const allCompleted = steps.reduce((acc, _, index) => {
        acc[index] = true;
        return acc;
      }, {});
      
      setCompleted(allCompleted);
      
      // Show success message and redirect after a delay
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err) {
      console.error('Error completing onboarding:', err);
      setError('There was an error completing the onboarding process. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get current step content
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <WelcomeSection />;
      case 1:
        return <MissionOverview />;
      case 2:
        return <ChannelsExploration />;
      case 3:
        return <IntroductionPrompt />;
      case 4:
        return <SlackTutorial />;
      case 5:
        return <BuddySystem />;
      case 6:
        return <OnboardingFAQ />;
      case 7:
        return <FeedbackSection />;
      default:
        return 'Unknown step';
    }
  };

  // Show loading state while auth is being determined
  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Head>
        <title>Onboarding | Opportunity Hack</title>
        <meta name="description" content="Welcome to Opportunity Hack! Let's get you onboarded and ready to contribute to our mission." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* JourneyTracker to track the onboarding progress */}
      <JourneyTracker 
        journey={OnboardingJourney.name}
        step={Object.values(OnboardingJourney.steps)[activeStep]}
        metadata={{ step_number: activeStep + 1, total_steps: steps.length }}
      />

      {/* Onboarding content */}
      <Box sx={{ pt: { xs: '80px', sm: '100px' }, pb: 4 }}>
        <Typography variant="h2" align="center" gutterBottom>
          Member Onboarding
        </Typography>

        {/* Website Tour Link */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Button
            component={Link}
            href="/onboarding/website-tour"
            variant="outlined"
            color="primary"
            startIcon={<ExploreIcon />}
            sx={{ borderRadius: 4 }}
          >
            Take a Website Tour
          </Button>
        </Box>

        <StyledPaper>
          {/* Stepper */}
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => {
              const stepProps = {};
              const labelProps = {};

              return (
                <Step key={label} {...stepProps} completed={completed[index]}>
                  <StepLabel {...labelProps}>{label}</StepLabel>
                </Step>
              );
            })}
          </Stepper>

          {/* Step Content */}
          <Box sx={{ mt: 4, mb: 4 }}>
            {getStepContent(activeStep)}
          </Box>

          {/* Error message if any */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Navigation buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button
              variant="outlined"
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {activeStep < steps.length - 1 && (
                <Button 
                  variant="text" 
                  onClick={handleSkip}
                  sx={{ color: 'text.secondary' }}
                >
                  Skip
                </Button>
              )}
              
              {activeStep === steps.length - 1 ? (
                <AnimatedButton
                  variant="contained"
                  color="primary"
                  onClick={handleComplete}
                  disabled={loading}
                >
                  Complete Onboarding
                  {loading && <CircularProgress size={24} sx={{ ml: 1 }} />}
                </AnimatedButton>
              ) : (
                <AnimatedButton
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                >
                  Next
                </AnimatedButton>
              )}
            </Box>
          </Box>
        </StyledPaper>
      </Box>
    </Container>
  );
}