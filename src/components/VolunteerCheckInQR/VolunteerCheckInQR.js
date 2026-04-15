import React from 'react';
import {
  Box,
  Paper,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import QRCode from 'react-qr-code';

/**
 * VolunteerCheckInQR Component
 * 
 * Displays a QR code for volunteer check-in at hackathon events.
 * QR code format: eventId|volunteerId|volunteerType
 * 
 * @param {Object} props
 * @param {string} props.eventId - The hackathon event ID (e.g., "2025_fall")
 * @param {string} props.volunteerId - Unique volunteer ID
 * @param {string} props.volunteerType - Type of volunteer ("mentor", "judge", "volunteer", "hacker", "sponsor")
 * @param {string} props.name - Volunteer's display name
 * @param {boolean} props.isSubmitted - Whether the application has been submitted
 * @param {boolean} props.isSelected - Whether to display the component (default: false)
 * @param {Object} props.sx - Additional MUI sx prop styling
 * @param {number} props.qrSize - Size of the QR code (default: 120)
 * @param {boolean} props.showOnlyIfSubmitted - Only show QR code if application is submitted (default: false)
 */
const VolunteerCheckInQR = ({
  eventId,
  volunteerId,
  volunteerType,
  name,
  isSubmitted = false,
  isSelected = false,
  sx = {},
  qrSize = 120,
  showOnlyIfSubmitted = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Don't render if not selected
  if (!isSelected || isSelected == null || isSelected === undefined) {
    return null;
  }

  // Don't render if we don't have the necessary data
  if (!volunteerId || !eventId || !volunteerType) {
    return null;
  }

  // Don't render if showOnlyIfSubmitted is true and not submitted
  if (showOnlyIfSubmitted && !isSubmitted) {
    return null;
  }

  // Set a background color based on the volunteerType, where judge is red, mentor is black, and hackers are purple
  const volunteerColors = {
    judge: theme.palette.error.main,
    mentor: theme.palette.grey[900],
    volunteer: theme.palette.primary.main,
    hacker: theme.palette.secondary.main,
    sponsor: theme.palette.warning.main
  };

  // Fallback color if volunteerType is unrecognized
  const volunteerColor = volunteerColors[volunteerType] || theme.palette.grey[700];

  // Generate QR code data
  const qrCodeData = `${eventId}|${volunteerId}|${volunteerType}`;

  // Capitalize volunteer type for display
  const displayVolunteerType = volunteerType.charAt(0).toUpperCase() + volunteerType.slice(1);

  // Determine styling and messaging based on submission status
  const paperProps = isSubmitted 
    ? { 
        bgcolor: volunteerColor,
        color: 'white',
        border: `2px solid ${theme.palette.success.main}`
      }
    : { 
        bgcolor: 'info.light', 
        color: 'white',
        border: `2px solid ${theme.palette.info.main}`
      };

  const getTitle = () => {
    if (isSubmitted) {
      return '📱 Your Check-In QR Code';
    }
    return '📱 Check-In QR Code';
  };

  const getMessage = () => {
    if (isSubmitted) {
      return 'Your application has been submitted! Use this QR code to check in at the event (if you are attending in-person)';
    }
    return 'Save this QR code for quick check-in at the event (available after application submission).';
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        mb: 4, 
        ...paperProps,
        ...sx
      }}
    >
      <Typography 
        variant="h6" 
        gutterBottom 
        sx={{ 
          color: 'white', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          fontSize: isMobile ? '1.1rem' : '1.25rem'
        }}
      >
        {getTitle()}
      </Typography>
      
      <Typography 
        variant="body2" 
        sx={{ 
          mb: 2, 
          color: 'rgba(255,255,255,0.9)',
          fontSize: isMobile ? '0.85rem' : '0.875rem'
        }}
      >
        {getMessage()}
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        gap: 2
      }}>
        {/* QR Code */}
        <Box sx={{ 
          p: 1.5,
          bgcolor: 'white',
          borderRadius: 2,
          display: 'flex',
          justifyContent: 'center',
          minWidth: 'fit-content'
        }}>
          <QRCode
            size={isMobile ? Math.min(qrSize, 200) : qrSize}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            value={qrCodeData}
            viewBox="0 0 256 256"
          />
        </Box>
        
        {/* QR Code Details */}
        <Box sx={{ 
          textAlign: { xs: 'center', sm: 'left' },
          flex: 1
        }}>
          {name && (
            <Typography 
              variant="h6" 
              sx={{ 
                display: 'block', 
                mb: 1, 
                color: 'white',
                fontWeight: 'bold',
                fontSize: isMobile ? '1rem' : '1.1rem'
              }}
            >
              {name}
            </Typography>
          )}
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block', 
              mb: 0.5, 
              color: 'rgba(255,255,255,0.8)',
              fontSize: isMobile ? '0.7rem' : '0.75rem'
            }}
          >
            Event: {eventId}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block', 
              mb: 0.5, 
              color: 'rgba(255,255,255,0.8)',
              fontSize: isMobile ? '0.7rem' : '0.75rem'
            }}
          >
            Role: {displayVolunteerType}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block', 
              color: 'rgba(255,255,255,0.8)',
              fontSize: isMobile ? '0.7rem' : '0.75rem'
            }}
          >
            ID: {volunteerId}
          </Typography>
          
          {isSubmitted && (
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block', 
                mt: 1, 
                fontWeight: 'bold', 
                color: 'white',
                fontSize: isMobile ? '0.75rem' : '0.8rem'
              }}
            >
              ✅ Application Submitted
            </Typography>
          )}
          
          {!isSubmitted && (
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block', 
                mt: 1, 
                fontWeight: 'bold', 
                color: 'rgba(255,255,255,0.9)',
                fontSize: isMobile ? '0.75rem' : '0.8rem'
              }}
            >
              ⏳ Complete application to activate
            </Typography>
          )}
        </Box>
      </Box>
      
      {/* Additional instructions */}
      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'rgba(255,255,255,0.7)',
            display: 'block',
            textAlign: 'center',
            fontSize: isMobile ? '0.65rem' : '0.7rem'
          }}
        >
          💡 Save this page or take a screenshot for easy access at check-in
        </Typography>
      </Box>
    </Paper>
  );
};

export default VolunteerCheckInQR;