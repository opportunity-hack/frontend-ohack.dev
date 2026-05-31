import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { initFacebookPixel, trackEvent } from '../../lib/ga';
import Head from 'next/head';
import { useCookies, CookiesProvider } from 'react-cookie';
import {
  Typography,
  Box,
  Stepper,
  Step,
  Button,
  CircularProgress,
  Alert,
  StepButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { useAuthInfo } from '@propelauth/react';
import { RefinedRoot, RefinedFonts, Eyebrow, Arrow } from '../../components/design/refined';

// Components
import WelcomeSection from '../../components/Onboarding/WelcomeSection';
import MissionOverview from '../../components/Onboarding/MissionOverview';
import IntroductionPrompt from '../../components/Onboarding/IntroductionPrompt';
import SlackTutorial from '../../components/Onboarding/SlackTutorial';
import JudgingOverview from '../../components/Onboarding/JudgingOverview';
import MentoringOverview from '../../components/Onboarding/MentoringOverview';
import OnboardingFAQ from '../../components/Onboarding/OnboardingFAQ';
import FeedbackSection from '../../components/Onboarding/FeedbackSection';
import JourneyTracker, { JourneyTypes } from '../../components/JourneyTracker';

// Define onboarding steps
const steps = [
  'Welcome',
  'Our Mission',
  'Introduce Yourself',
  'Slack Tutorial',
  'Judging Overview',
  'Mentoring',
  'FAQs',
  'Feedback'
];

// Create an Onboarding journey in JourneyTracker
const OnboardingJourney = {
  name: 'onboarding',
  steps: {
    START_ONBOARDING: 'start_onboarding',
    VIEW_MISSION: 'view_mission',
    COMPLETE_INTRODUCTION: 'complete_introduction',
    COMPLETE_TUTORIAL: 'complete_tutorial',
    VIEW_JUDGING: 'view_judging',
    VIEW_MENTORING: 'view_mentoring',
    READ_FAQ: 'read_faq',
    PROVIDE_FEEDBACK: 'provide_feedback',
    COMPLETE_ONBOARDING: 'complete_onboarding'
  }
};

function OnboardingComponent() {
  const { user, isLoading: authLoading } = useAuthInfo();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState({});
  const [highestStepReached, setHighestStepReached] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openCongratulatoryDialog, setOpenCongratulatoryDialog] = useState(false);
  const [cookies, setCookie] = useCookies(['onboarding_visited']);
  
  useEffect(() => { initFacebookPixel(); }, []);

  useEffect(() => {
    const ONBOARDING_VISITED_COOKIE = "onboarding_visited";

    if (!cookies[ONBOARDING_VISITED_COOKIE]) {
        setCookie(ONBOARDING_VISITED_COOKIE, 'true', { path: '/', maxAge: 31536000 });
      
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'onboarding_first_visit', {
          'event_category': 'Onboarding',
          'event_label': 'First Visit'
        });
      }
    }
  }, [cookies, setCookie]);

  // Track onboarding progress and save to localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('ohack_onboarding_progress');
    if (savedProgress) {
      try {
        const { step, completedSteps } = JSON.parse(savedProgress);
        setActiveStep(step);
        setCompleted(completedSteps);
        // Also load highest step reached
        const savedHighestStep = localStorage.getItem('ohack_onboarding_highest_step');
        if (savedHighestStep) {
          try {
            setHighestStepReached(parseInt(savedHighestStep, 10));
          } catch (err) {
            console.error('Error parsing saved highest step reached:', err);
            setHighestStepReached(step); // Fallback to active step if parsing fails
          }
        } else {
          setHighestStepReached(step); // If no highest step saved, use current step
        }
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
    
    // Update highest step reached and save it
    if (activeStep > highestStepReached) {
      setHighestStepReached(activeStep);
      localStorage.setItem('ohack_onboarding_highest_step', activeStep.toString());
    }
    
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
  }, [activeStep, completed, user, highestStepReached]);

  // Calculate completion percentage
  const completedCount = Object.values(completed).filter(Boolean).length;
  const totalSteps = steps.length;
  const completionPercentage = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleComplete();
    } else {
      // Mark current step as completed
      const newCompleted = { ...completed };
      newCompleted[activeStep] = true;
      setCompleted(newCompleted);
      
      // Move to next step
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      trackEvent({ action: 'onboarding_step', params: { event_label: steps[activeStep + 1]?.label, step: activeStep + 2, page: 'onboarding' } });
      // Scroll to top of the page when navigating to next step
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    // Scroll to top of the page when navigating back
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      
      // Mark onboarding as completed to prevent dialog from showing again
      localStorage.setItem('ohack_onboarding_completed', 'true');
      
      trackEvent({ action: 'onboarding_complete', params: { event_label: 'all_steps', page: 'onboarding' } });
      setOpenCongratulatoryDialog(true); // Open the dialog
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
        return <IntroductionPrompt />;
      case 3:
        return <SlackTutorial />;
      case 4:
        return <JudgingOverview />;
      case 5:
        return <MentoringOverview />;
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

  const stepperSx = {
    '& .MuiStepLabel-label': { fontFamily: "'Hanken Grotesk', system-ui, sans-serif", fontSize: '0.92rem', fontWeight: 500, mt: 1, color: '#5B6270' },
    '& .MuiStepLabel-label.Mui-active': { color: '#1B3A6B', fontWeight: 700 },
    '& .MuiStepLabel-label.Mui-completed': { color: '#16181D' },
    '& .MuiStepIcon-root': { color: '#E7E1D4', width: 28, height: 28 },
    '& .MuiStepIcon-root.Mui-active': { color: '#1B3A6B' },
    '& .MuiStepIcon-root.Mui-completed': { color: '#1B3A6B' },
    '& .MuiStepIcon-text': { fill: '#fff' },
    '& .MuiStepConnector-line': { borderColor: '#E7E1D4' },
  };

  return (
    <>
      <Head>
        <title>Onboarding | Opportunity Hack</title>
        <meta name="description" content="Welcome to Opportunity Hack! Let's get you onboarded and ready to contribute to our mission." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <RefinedFonts />
      </Head>

      <JourneyTracker
        journey={OnboardingJourney.name}
        step={Object.values(OnboardingJourney.steps)[activeStep]}
        metadata={{ step_number: activeStep + 1, total_steps: steps.length }}
      />

      <RefinedRoot>
        <section className="ohx-wrap" style={{ paddingTop: "clamp(100px, 12vh, 148px)", paddingBottom: "clamp(48px, 8vh, 96px)" }}>
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <Eyebrow>Welcome aboard</Eyebrow>
            <h1 className="ohx-display" style={{ marginTop: 8 }}>
              Member <span className="ohx-italic">onboarding</span>
            </h1>
            <p className="ohx-faint" style={{ marginTop: 12, fontSize: "0.9rem" }}>
              Step {activeStep + 1} of {steps.length} · {completionPercentage}% complete
            </p>
          </div>

          {/* Stepper */}
          <Box className="ohx-card" sx={{ p: { xs: 2, sm: 3 }, mt: 3 }}>
            <Stepper activeStep={activeStep} alternativeLabel sx={stepperSx}>
              {steps.map((label, index) => (
                <Step key={label} completed={completed[index]}>
                  <StepButton onClick={() => setActiveStep(index)} disabled={index > highestStepReached}>
                    {label}
                  </StepButton>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Step content */}
          <Box className="ohx-card" sx={{ mt: 3, p: { xs: 2, sm: 3, md: 4 } }}>
            {getStepContent(activeStep)}
          </Box>

          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, gap: 12 }}>
            <button
              type="button"
              className="ohx-btn ohx-btn--ghost"
              disabled={activeStep === 0}
              onClick={handleBack}
              style={{ opacity: activeStep === 0 ? 0.45 : 1, cursor: activeStep === 0 ? "not-allowed" : "pointer" }}
            >
              Back
            </button>
            {activeStep === steps.length - 1 ? (
              <button type="button" className="ohx-btn ohx-btn--primary" onClick={handleComplete} disabled={loading}>
                Complete onboarding {loading ? <CircularProgress size={18} sx={{ color: "#fff", ml: 0.5 }} /> : <Arrow />}
              </button>
            ) : (
              <button type="button" className="ohx-btn ohx-btn--primary" onClick={handleNext}>
                Next <Arrow />
              </button>
            )}
          </div>
        </section>
      </RefinedRoot>

      {/* Congratulatory Dialog */}
      <Dialog
        open={openCongratulatoryDialog}
        onClose={() => router.push('/')}
        aria-labelledby="congratulations-dialog-title"
        aria-describedby="congratulations-dialog-description"
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1, maxWidth: 460 } } }}
      >
        <DialogTitle id="congratulations-dialog-title">
          <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500, fontSize: "2rem", color: "#1B3A6B" }}>Welcome to the community!</span>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="congratulations-dialog-description" sx={{ fontSize: '1.05rem' }}>
            You&apos;ve completed the Opportunity Hack member onboarding — you&apos;re all set to start contributing.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            onClick={() => router.push('/')}
            autoFocus
            sx={{
              backgroundColor: '#1B3A6B',
              color: '#fff',
              fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '5px',
              px: 2.5,
              py: 1.1,
              '&:hover': { backgroundColor: '#16315a' },
            }}
          >
            Go to home →
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default function Onboarding() {
  return (
    <CookiesProvider>
      <OnboardingComponent />
    </CookiesProvider>
  );
}