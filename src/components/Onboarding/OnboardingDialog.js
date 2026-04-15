import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuthInfo } from '@propelauth/react';
import SchoolIcon from '@mui/icons-material/School';
import { trackEvent } from '../../lib/ga';

// Styled components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    minWidth: '400px',
    maxWidth: '500px',
    [theme.breakpoints.down('sm')]: {
      minWidth: '90vw',
      margin: theme.spacing(2)
    }
  }
}));

const DialogHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2)
}));

const IconContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText
}));

/**
 * OnboardingDialog component
 * Shows a dialog for first-time visitors to encourage them to go through onboarding
 */
const OnboardingDialog = () => {
  const router = useRouter();
  const { user, isLoggedIn } = useAuthInfo();
  const [open, setOpen] = useState(false);

  // Check if user has already dismissed this dialog, started onboarding, or completed onboarding
  useEffect(() => {
    const hasSeenDialog = localStorage.getItem('ohack_onboarding_dialog_dismissed');
    const hasStartedOnboarding = localStorage.getItem('ohack_onboarding_started');
    const hasCompletedOnboarding = localStorage.getItem('ohack_onboarding_completed');
    const isOnboardingPage = router.pathname === '/onboarding';
    
    // Only show dialog if:
    // 1. User hasn't dismissed it before
    // 2. User hasn't started onboarding before
    // 3. User hasn't completed onboarding before
    // 4. Not currently on onboarding page
    // 5. Show to all visitors (removed login requirement)
    if (!hasSeenDialog && !hasStartedOnboarding && !hasCompletedOnboarding && !isOnboardingPage) {
      // Small delay to ensure page is loaded
      const timer = setTimeout(() => {
        setOpen(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [router.pathname]);

  const handleGoToOnboarding = () => {
    // Track the event
    trackEvent({
      action: 'onboarding_dialog_accepted',
      params: {
        user_id: user?.userId || 'anonymous'
      }
    });

    // Mark that user has started onboarding
    localStorage.setItem('ohack_onboarding_started', 'true');

    // Close dialog and navigate to onboarding
    setOpen(false);
    router.push('/onboarding');
  };

  const handleDismiss = () => {
    // Track the event
    trackEvent({
      action: 'onboarding_dialog_dismissed',
      params: {
        user_id: user?.userId || 'anonymous'
      }
    });

    // Mark that user has dismissed the dialog
    localStorage.setItem('ohack_onboarding_dialog_dismissed', 'true');

    setOpen(false);
  };

  return (
    <StyledDialog
      open={open}
      onClose={handleDismiss}
      aria-labelledby="onboarding-dialog-title"
      aria-describedby="onboarding-dialog-description"
      disableEscapeKeyDown={false}
      disableBackdropClick={false}
    >
      <DialogTitle id="onboarding-dialog-title">
        <DialogHeader>
          <IconContainer>
            <SchoolIcon fontSize="large" />
          </IconContainer>
          <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
            Welcome to Opportunity Hack!
          </Typography>
        </DialogHeader>
      </DialogTitle>
      
      <DialogContent>
        <DialogContentText id="onboarding-dialog-description" sx={{ fontSize: '1.2rem', mb: 3 }}>
          Welcome to Opportunity Hack! We'd love to help you get started with us through 
          our onboarding process.
        </DialogContentText>
        
        <Paper elevation={0} sx={{ p: 0, bgcolor: 'background.default', borderRadius: 1, mb: 2 }}>
          <Typography variant="body2" sx={{ fontSize: '1.2rem', mb: 1 }}>
            <strong>During onboarding, you'll learn:</strong>
          </Typography>
          <Typography variant="body2" component="ul" sx={{ fontSize: '1.2rem', mt: 0, pl: 0, mb: 0, listStyle: 'none' }}>
            <li style={{ position: 'relative', paddingLeft: '20px' }}>
              <span style={{ position: 'absolute', left: 0, top: 0 }}>•</span>
              Our mission and values
            </li>
            <li style={{ position: 'relative', paddingLeft: '20px' }}>
              <span style={{ position: 'absolute', left: 0, top: 0 }}>•</span>
              How to navigate our Slack community
            </li>
            <li style={{ position: 'relative', paddingLeft: '20px' }}>
              <span style={{ position: 'absolute', left: 0, top: 0 }}>•</span>
              Finding a buddy to guide you
            </li>
            <li style={{ position: 'relative', paddingLeft: '20px' }}>
              <span style={{ position: 'absolute', left: 0, top: 0 }}>•</span>
              Getting started with your first project
            </li>
          </Typography>
        </Paper>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <Button 
            onClick={handleDismiss} 
            variant="contained"
            sx={{ 
              fontSize: '1rem', 
              py: 1, 
              px: 3,
              textTransform: 'none',
              backgroundColor: '#ced4da',
              color: '#495057',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#adb5bd',
                textDecoration: 'underline'
              }
            }}
          >
            Don't ask me again
          </Button>
          <Button 
            onClick={handleGoToOnboarding} 
            variant="contained" 
            color="primary"
            sx={{ fontSize: '1rem', py: 1, px: 3 }}
          >
            Go to Onboarding
          </Button>
        </Box>
      </DialogActions>
    </StyledDialog>
  );
};

export default OnboardingDialog; 