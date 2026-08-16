import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Chip,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuthInfo } from '@propelauth/react';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import useHeartsSummary from '../../hooks/use-hearts-summary';
import { trackEvent } from '../../lib/ga';

const STORAGE_KEY_DISMISSED = 'ohack_profile_prompt_dismissed';
const STORAGE_KEY_REMIND_LATER = 'ohack_profile_prompt_remind_later';
const REMIND_LATER_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // 3 days
const PROGRESS_WARNING_THRESHOLD = 50;

// Core fields that define a "complete" profile
const CORE_FIELDS = [
  { key: 'role', label: 'Role' },
  { key: 'expertise', label: 'Areas of Expertise' },
  { key: 'education', label: 'Level of Education' },
  { key: 'github', label: 'GitHub Username' },
  { key: 'company', label: 'Company' },
  { key: 'why', label: 'Why you\'re here' },
  { key: 'shirt_size', label: 'Shirt Size' }
];

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    minWidth: '400px',
    maxWidth: '520px',
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
  marginBottom: theme.spacing(1)
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

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  backgroundColor: theme.palette.grey[200],
  '& .MuiLinearProgress-bar': {
    borderRadius: 5
  }
}));

/**
 * Checks if a profile field is filled
 */
function isFieldFilled(profile, fieldKey) {
  const value = profile[fieldKey];
  if (fieldKey === 'expertise') {
    return Array.isArray(value) && value.length > 0;
  }
  return value !== undefined && value !== null && value !== '';
}

/**
 * Calculates profile completeness percentage and returns missing fields
 */
function getProfileCompleteness(profile) {
  const filledFields = CORE_FIELDS.filter(f => isFieldFilled(profile, f.key));
  const missingFields = CORE_FIELDS.filter(f => !isFieldFilled(profile, f.key));
  const percentage = Math.round((filledFields.length / CORE_FIELDS.length) * 100);
  return { percentage, filledFields, missingFields };
}

/**
 * ProfileCompletionPrompt component
 * Shows a dialog encouraging logged-in users to complete their profile
 * when core profile fields are missing.
 */
const ProfileCompletionPrompt = () => {
  const router = useRouter();
  const { user, isLoggedIn } = useAuthInfo();
  // Shared module-cached fetch (also feeds the NavBar hearts status) — keeps
  // the site at one GET /api/users/profile per page load.
  const { profile, loading: isLoading } = useHeartsSummary();
  const [open, setOpen] = useState(false);
  const [completeness, setCompleteness] = useState(null);

  useEffect(() => {
    // Don't show if not logged in or still loading profile
    if (!isLoggedIn || !user || isLoading) return;

    // Don't show on profile or onboarding pages
    const currentPath = router.pathname;
    if (currentPath.startsWith('/profile') || currentPath === '/onboarding') return;

    // Don't show if user permanently dismissed
    if (localStorage.getItem(STORAGE_KEY_DISMISSED)) return;

    // Don't show if "remind later" cooldown hasn't expired
    const remindLater = localStorage.getItem(STORAGE_KEY_REMIND_LATER);
    if (remindLater) {
      const remindTime = parseInt(remindLater, 10);
      if (Date.now() - remindTime < REMIND_LATER_COOLDOWN_MS) return;
    }

    // Don't show if the onboarding dialog is still pending (hasn't been dismissed/started/completed)
    const onboardingDismissed = localStorage.getItem('ohack_onboarding_dialog_dismissed');
    const onboardingStarted = localStorage.getItem('ohack_onboarding_started');
    const onboardingCompleted = localStorage.getItem('ohack_onboarding_completed');
    if (!onboardingDismissed && !onboardingStarted && !onboardingCompleted) return;

    // Check profile completeness only when profile has loaded with real data
    if (!profile || !profile.profile_url) return;

    const result = getProfileCompleteness(profile);
    // Only show if profile is incomplete
    if (result.percentage >= 100) return;

    setCompleteness(result);

    // Delay showing the dialog to let the page settle
    const timer = setTimeout(() => {
      setOpen(true);
      trackEvent({
        action: 'profile_completion_prompt_shown',
        params: {
          user_id: user?.userId || 'anonymous',
          completeness_percentage: result.percentage,
          missing_fields: result.missingFields.map(f => f.key).join(',')
        }
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [isLoggedIn, user, isLoading, profile, router.pathname]);

  const handleGoToProfile = () => {
    trackEvent({
      action: 'profile_completion_prompt_accepted',
      params: {
        user_id: user?.userId || 'anonymous',
        completeness_percentage: completeness?.percentage || 0
      }
    });
    setOpen(false);
    router.push('/profile');
  };

  const handleRemindLater = () => {
    trackEvent({
      action: 'profile_completion_prompt_remind_later',
      params: {
        user_id: user?.userId || 'anonymous',
        completeness_percentage: completeness?.percentage || 0
      }
    });
    localStorage.setItem(STORAGE_KEY_REMIND_LATER, Date.now().toString());
    setOpen(false);
  };

  const handleDismiss = () => {
    trackEvent({
      action: 'profile_completion_prompt_dismissed',
      params: {
        user_id: user?.userId || 'anonymous',
        completeness_percentage: completeness?.percentage || 0
      }
    });
    localStorage.setItem(STORAGE_KEY_DISMISSED, 'true');
    setOpen(false);
  };

  if (!completeness) return null;

  return (
    <StyledDialog
      open={open}
      onClose={handleRemindLater}
      aria-labelledby="profile-completion-dialog-title"
      aria-describedby="profile-completion-dialog-description"
    >
      <DialogTitle id="profile-completion-dialog-title">
        <DialogHeader>
          <IconContainer>
            <AccountCircleIcon fontSize="large" />
          </IconContainer>
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            Complete Your Profile
          </Typography>
        </DialogHeader>
      </DialogTitle>

      <DialogContent>
        <Typography
          id="profile-completion-dialog-description"
          variant="body1"
          sx={{ mb: 2.5 }}
        >
          Help us match you with the right projects and teams! A complete profile
          helps nonprofits and fellow volunteers find you and makes your Opportunity Hack
          experience even better.
        </Typography>

        {/* Progress Bar */}
        <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, mb: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" fontWeight={600}>
              Profile Completeness
            </Typography>
            <Typography variant="body2" fontWeight={600} color="primary.main">
              {completeness.percentage}%
            </Typography>
          </Box>
          <StyledLinearProgress
            variant="determinate"
            value={completeness.percentage}
            color={completeness.percentage < PROGRESS_WARNING_THRESHOLD ? 'warning' : 'primary'}
          />
        </Paper>

        {/* Missing Fields */}
        <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
          {completeness.missingFields.length === 1
            ? 'Just 1 field left to fill in:'
            : `${completeness.missingFields.length} fields left to fill in:`}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1 }}>
          {CORE_FIELDS.map(field => {
            const filled = isFieldFilled(profile, field.key);
            return (
              <Chip
                key={field.key}
                icon={filled
                  ? <CheckCircleIcon sx={{ fontSize: 16 }} />
                  : <RadioButtonUncheckedIcon sx={{ fontSize: 16 }} />
                }
                label={field.label}
                size="small"
                variant={filled ? 'filled' : 'outlined'}
                color={filled ? 'success' : 'default'}
                sx={{
                  fontWeight: filled ? 400 : 600,
                  opacity: filled ? 0.7 : 1
                }}
              />
            );
          })}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 1 }}>
          <Button
            onClick={handleGoToProfile}
            variant="contained"
            color="primary"
            fullWidth
            sx={{ fontSize: '1rem', py: 1.2, textTransform: 'none', fontWeight: 600 }}
          >
            Complete My Profile
          </Button>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Button
              onClick={handleRemindLater}
              sx={{
                fontSize: '0.85rem',
                textTransform: 'none',
                color: 'text.secondary',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Remind me later
            </Button>
            <Button
              onClick={handleDismiss}
              sx={{
                fontSize: '0.85rem',
                textTransform: 'none',
                color: 'text.secondary',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Don&apos;t show again
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </StyledDialog>
  );
};

export default ProfileCompletionPrompt;
