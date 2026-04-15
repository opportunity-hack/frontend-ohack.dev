import React from 'react';
import { Box, Typography, Chip, useTheme, alpha } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupIcon from '@mui/icons-material/Group';
import FlashOnIcon from '@mui/icons-material/FlashOn';

// Animation for subtle pulsing effect to catch attention
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(25, 118, 210, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
  }
`;

const SocialProofContainer = styled(Box)(({ theme, urgency, colors }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: colors?.socialBg || theme.palette.common.white,
  border: `1px solid ${colors?.socialBorder || theme.palette.divider}`,
  boxShadow: theme.shadows[1],
  animation: urgency === 'high' ? `${pulse} 2s infinite` : 'none',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    backgroundColor: alpha(colors?.socialBg || theme.palette.common.white, 0.95),
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[2],
  },
}));

const UrgencyContainer = styled(Box)(({ theme, urgency, colors }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  padding: theme.spacing(0.25, 0.75),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: colors?.urgencyBg || theme.palette.warning.main,
  border: `1px solid ${colors?.urgencyBorder || theme.palette.warning.dark}`,
  boxShadow: theme.shadows[1],
}));

/**
 * Social Proof Indicator component for psychological nudging
 * Shows how many people have already been accepted to create FOMO and social proof
 */
const SocialProofIndicator = ({
  accepted = 0,
  total = 0,
  roleType = 'participants',
  showUrgency = false,
  urgencyThreshold = 10,
  variant = 'compact', // 'compact' | 'detailed'
  buttonColor = 'primary' // MUI color to adapt chip colors for contrast
}) => {
  const theme = useTheme();

  // Get high contrast colors based on button background
  const getContrastColors = (bgColor) => {
    const colorMap = {
      primary: {
        socialBg: theme.palette.common.white,
        socialText: theme.palette.primary.main,
        socialBorder: theme.palette.primary.light,
        urgencyBg: theme.palette.warning.main,
        urgencyText: theme.palette.common.white,
        urgencyBorder: theme.palette.warning.dark,
      },
      secondary: {
        socialBg: theme.palette.common.white,
        socialText: theme.palette.secondary.main,
        socialBorder: theme.palette.secondary.light,
        urgencyBg: theme.palette.warning.main,
        urgencyText: theme.palette.common.white,
        urgencyBorder: theme.palette.warning.dark,
      },
      success: {
        socialBg: theme.palette.common.white,
        socialText: theme.palette.success.dark,
        socialBorder: theme.palette.success.main,
        urgencyBg: theme.palette.error.main,
        urgencyText: theme.palette.common.white,
        urgencyBorder: theme.palette.error.dark,
      },
      info: {
        socialBg: theme.palette.common.white,
        socialText: theme.palette.info.dark,
        socialBorder: theme.palette.info.main,
        urgencyBg: theme.palette.warning.main,
        urgencyText: theme.palette.common.white,
        urgencyBorder: theme.palette.warning.dark,
      },
      warning: {
        socialBg: theme.palette.common.white,
        socialText: theme.palette.warning.dark,
        socialBorder: theme.palette.warning.main,
        urgencyBg: theme.palette.error.main,
        urgencyText: theme.palette.common.white,
        urgencyBorder: theme.palette.error.dark,
      },
      error: {
        socialBg: theme.palette.common.white,
        socialText: theme.palette.error.main,
        socialBorder: theme.palette.error.light,
        urgencyBg: theme.palette.warning.main,
        urgencyText: theme.palette.common.white,
        urgencyBorder: theme.palette.warning.dark,
      },
    };

    return colorMap[bgColor] || colorMap.primary;
  };

  const colors = getContrastColors(buttonColor);

  // Calculate acceptance rate and determine messaging strategy
  const acceptanceRate = total > 0 ? (accepted / total) * 100 : 0;
  const isPopular = accepted >= urgencyThreshold;
  const isLimited = acceptanceRate > 70 && accepted >= urgencyThreshold;

  // Determine urgency level for psychological impact (only if showUrgency is enabled)
  const urgencyLevel = showUrgency ? (isLimited ? 'high' : (isPopular ? 'medium' : 'low')) : 'low';

  // Generate psychological messaging
  const getMessage = () => {
    if (accepted === 0) return null; // Don't show if no one is accepted yet

    if (accepted === 1) {
      return `${accepted} ${roleType.slice(0, -1)} already joined!`;
    }

    if (accepted < 5) {
      return `${accepted} ${roleType} already accepted`;
    }

    if (accepted < 20) {
      return `${accepted}+ ${roleType} already in`;
    }

    if (accepted < 50) {
      return `${Math.floor(accepted / 10) * 10}+ ${roleType} confirmed`;
    }

    return `${Math.floor(accepted / 50) * 50}+ ${roleType} joining`;
  };

  const getUrgencyMessage = () => {
    if (!showUrgency) return null;

    if (isLimited) {
      return 'Filling up fast!';
    }

    if (isPopular) {
      return 'Popular choice';
    }

    return null;
  };

  const message = getMessage();
  const urgencyMessage = getUrgencyMessage();

  if (!message && !urgencyMessage) return null;

  if (variant === 'detailed') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
        {message && (
          <SocialProofContainer urgency={urgencyLevel} colors={colors}>
            <GroupIcon
              fontSize="small"
              sx={{
                color: colors.socialText,
                animation: urgencyLevel === 'high' ? `${pulse} 2s infinite` : 'none',
              }}
            />
            <Typography
              variant="caption"
              fontWeight="600"
              sx={{
                color: colors.socialText,
                fontSize: '0.75rem'
              }}
            >
              {message}
            </Typography>
            <TrendingUpIcon
              fontSize="small"
              sx={{ color: colors.socialText }}
            />
          </SocialProofContainer>
        )}

        {urgencyMessage && (
          <UrgencyContainer urgency={urgencyLevel} colors={colors}>
            <FlashOnIcon
              fontSize="small"
              sx={{
                color: colors.urgencyText,
              }}
            />
            <Typography
              variant="caption"
              fontWeight="600"
              sx={{
                color: colors.urgencyText,
                fontSize: '0.7rem'
              }}
            >
              {urgencyMessage}
            </Typography>
          </UrgencyContainer>
        )}
      </Box>
    );
  }

  // Compact variant
  return (
    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
      {message && (
        <Chip
          icon={<GroupIcon />}
          label={message}
          size="small"
          variant="outlined"
          sx={{
            backgroundColor: colors.socialBg,
            borderColor: colors.socialBorder,
            color: colors.socialText,
            fontSize: '0.7rem',
            height: 24,
            fontWeight: 600,
            boxShadow: theme.shadows[1],
            '& .MuiChip-icon': {
              color: colors.socialText,
              fontSize: '0.875rem',
            },
            animation: urgencyLevel === 'high' ? `${pulse} 3s infinite` : 'none',
            '&:hover': {
              backgroundColor: alpha(colors.socialBg, 0.9),
              boxShadow: theme.shadows[2],
            },
          }}
        />
      )}

      {urgencyMessage && (
        <Chip
          icon={<FlashOnIcon />}
          label={urgencyMessage}
          size="small"
          variant="filled"
          sx={{
            backgroundColor: colors.urgencyBg,
            color: colors.urgencyText,
            borderColor: colors.urgencyBorder,
            fontSize: '0.7rem',
            height: 24,
            fontWeight: 600,
            boxShadow: theme.shadows[1],
            '& .MuiChip-icon': {
              color: colors.urgencyText,
              fontSize: '0.875rem',
            },
            '&:hover': {
              backgroundColor: alpha(colors.urgencyBg, 0.9),
              boxShadow: theme.shadows[2],
            },
          }}
        />
      )}
    </Box>
  );
};

export default SocialProofIndicator;