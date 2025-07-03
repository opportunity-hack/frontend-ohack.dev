import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Alert, Paper, useTheme } from '@mui/material';
import { useAuthInfo } from '@propelauth/react';
import FavoriteIcon from '@mui/icons-material/Favorite';

const GiveButterWidget = ({ 
  context = 'default', 
  userId = null, 
  applicationType = null,
  onDonationEvent = null,
  size = 'medium',
  hideTitle = false 
}) => {
  const { user } = useAuthInfo();
  const theme = useTheme();
  const widgetRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  
  // Context-specific messaging
  const contextMessages = {
    success: {
      title: "🎉 Thank you for applying!",
      subtitle: "Your application matters. So does your support.",
      description: "You've just taken a step toward creating positive change. Consider amplifying your impact with a donation to keep Opportunity Hack thriving."
    },
    review: {
      title: "💝 Optional: Support Our Mission",
      subtitle: "Help us keep this hackathon free for everyone",
      description: "Your application shows you believe in tech for good. A small donation helps us maintain this platform and keep it accessible to all."
    },
    sidebar: {
      title: "❤️ Support Opportunity Hack",
      subtitle: "Keep the movement growing",
      description: "Every donation helps us organize more events and support more nonprofits."
    },
    default: {
      title: "🚀 Fuel the Mission",
      subtitle: "Support tech for good",
      description: "Help us create more opportunities for developers to make a positive impact."
    }
  };

  const message = contextMessages[context] || contextMessages.default;

  // Load GiveButter script
  useEffect(() => {
    // Check if script is already loaded
    if (window.givebutter || document.querySelector('script[src*="widgets.givebutter.com"]')) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://widgets.givebutter.com/latest.umd.cjs?acct=DANV4dArQAEhX93l&p=other';
    script.async = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => setError('Failed to load donation widget');
    
    document.head.appendChild(script);

    return () => {
      // Cleanup: remove script if component unmounts
      const scriptElement = document.querySelector('script[src*="widgets.givebutter.com"]');
      if (scriptElement) {
        document.head.removeChild(scriptElement);
      }
    };
  }, []);

  // Track donation events
  const trackDonationEvent = (eventType, amount = null) => {
    const eventData = {
      timestamp: new Date().toISOString(),
      userId: userId || user?.userId || null,
      userEmail: user?.email || null,
      applicationType,
      context,
      eventType, // 'widget_loaded', 'donation_started', 'donation_completed'
      amount,
      userAgent: navigator.userAgent,
      referrer: document.referrer
    };

    // Call custom tracking callback if provided
    if (onDonationEvent) {
      onDonationEvent(eventData);
    }

    // Track in console for development (remove in production)
    console.log('GiveButter Event:', eventData);

    // Send to analytics (you can add Google Analytics, Mixpanel, etc.)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'donation_interaction', {
        event_category: 'GiveButter',
        event_label: `${context}_${eventType}`,
        custom_parameter_user_id: userId || user?.userId,
        custom_parameter_application_type: applicationType
      });
    }

    // Send to backend API for persistence
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics/donation-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      }).catch(err => console.warn('Analytics tracking failed:', err));
    }
  };

  // Monitor widget interactions
  useEffect(() => {
    if (!isLoaded || !widgetRef.current) return;

    trackDonationEvent('widget_loaded');

    // Listen for GiveButter events (if available)
    const handleGiveButterEvent = (event) => {
      if (event.detail) {
        switch (event.detail.type) {
          case 'donation_started':
            trackDonationEvent('donation_started');
            break;
          case 'donation_completed':
            trackDonationEvent('donation_completed', event.detail.amount);
            break;
          default:
            break;
        }
      }
    };

    // Add event listeners for GiveButter widget events
    window.addEventListener('givebutter_event', handleGiveButterEvent);

    return () => {
      window.removeEventListener('givebutter_event', handleGiveButterEvent);
    };
  }, [isLoaded, userId, applicationType, context]);

  // Size configurations
  const sizeConfig = {
    small: { maxWidth: 300, padding: 2 },
    medium: { maxWidth: 400, padding: 3 },
    large: { maxWidth: 500, padding: 4 }
  };

  const currentSize = sizeConfig[size] || sizeConfig.medium;

  if (error) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          Support our mission at{' '}
          <a href="https://givebutter.com/opportunity-hack" target="_blank" rel="noopener noreferrer">
            givebutter.com/opportunity-hack
          </a>
        </Typography>
      </Alert>
    );
  }

  return (
    <Paper 
      elevation={context === 'success' ? 4 : 2}
      sx={{ 
        maxWidth: currentSize.maxWidth,
        margin: '0 auto',
        overflow: 'hidden',
        background: context === 'success' 
          ? `linear-gradient(135deg, ${theme.palette.primary.light}15, ${theme.palette.secondary.light}15)`
          : 'background.paper',
        border: context === 'review' ? `1px dashed ${theme.palette.divider}` : 'none'
      }}
    >
      <Box sx={{ p: currentSize.padding }}>
        {!hideTitle && (
          <Box sx={{ mb: 2, textAlign: 'center' }}>
            <Typography 
              variant={size === 'large' ? 'h5' : size === 'medium' ? 'h6' : 'subtitle1'} 
              component="h3" 
              gutterBottom
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 1,
                color: context === 'success' ? 'primary.main' : 'text.primary'
              }}
            >
              {message.title}
            </Typography>
            
            <Typography 
              variant="subtitle2" 
              color="text.secondary" 
              gutterBottom
              sx={{ fontWeight: 500 }}
            >
              {message.subtitle}
            </Typography>
            
            {size !== 'small' && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {message.description}
              </Typography>
            )}
          </Box>
        )}

        <Box 
          ref={widgetRef}
          sx={{ 
            textAlign: 'center',
            '& givebutter-widget': {
              display: 'block',
              margin: '0 auto'
            }
          }}
        >
          {isLoaded ? (
            <givebutter-widget id="p5Ak4p" />
          ) : (
            <Box sx={{ 
              p: 3, 
              bgcolor: 'grey.50', 
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 120
            }}>
              <Typography variant="body2" color="text.secondary">
                Loading donation options...
              </Typography>
            </Box>
          )}
        </Box>

        {context === 'success' && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              <FavoriteIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
              100% of your donation supports our mission
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default GiveButterWidget;