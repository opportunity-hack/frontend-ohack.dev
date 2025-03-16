let ReactPixel;

/**
 * Enhanced Google Analytics and Facebook Pixel tracking module
 * 
 * This module implements best practices for marketing analytics:
 * - Consistent event naming convention
 * - User journey tracking
 * - Enhanced segmentation
 * - Content engagement metrics
 * - Conversion attribution
 * - Standardized interface for tracking
 */

// Standard event categories for consistent naming
export const EventCategory = {
  NAVIGATION: 'navigation',
  FORM: 'form',
  CONTENT: 'content',
  ENGAGEMENT: 'engagement',
  CONVERSION: 'conversion',
  DONATION: 'donation',
  ERROR: 'error',
  USER: 'user',
  SOCIAL: 'social'
};

// Standard event actions for consistent naming
export const EventAction = {
  CLICK: 'click',
  VIEW: 'view',
  SUBMIT: 'submit',
  START: 'start',
  COMPLETE: 'complete',
  SHARE: 'share',
  SIGNUP: 'signup',
  LOGIN: 'login',
  SCROLL: 'scroll',
  DOWNLOAD: 'download'
};

// Initialize Facebook Pixel
export const initFacebookPixel = async () => {
  if (typeof window !== 'undefined') {
    try {
      ReactPixel = (await import('react-facebook-pixel')).default;
      const options = {
        autoConfig: true,
        debug: false,
      };
      const advancedMatching = undefined;
      ReactPixel.init(process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID, advancedMatching, options);
    } catch (error) {
      console.error('Failed to initialize Facebook Pixel:', error);
    }
  }
};

/**
 * Track page views with enhanced metadata
 * @param {string} url - The URL being viewed
 * @param {Object} additionalParams - Optional additional page parameters
 */
export const pageview = (url, additionalParams = {}) => {
  if (typeof window !== 'undefined') {
    try {
      // Extract UTM parameters if present
      const utmParams = {};
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
          const value = urlParams.get(param);
          if (value) utmParams[param] = value;
        });
      }

      // Track with combined parameters
      const pageParams = {
        page_path: url,
        page_title: document.title,
        ...utmParams,
        ...additionalParams
      };

      window.gtag('config', process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS, pageParams);
      
      // Facebook Pixel page view
      if (ReactPixel) ReactPixel.pageView();
      
      // Track as an event as well for more flexibility in reporting
      window.gtag('event', 'page_view', pageParams);
    } catch (error) {
      console.error('Error tracking pageview:', error);
    }
  }
};

/**
 * Track user journey step (funnel stage)
 * @param {string} journey - The journey name (e.g., 'volunteer', 'nonprofit')
 * @param {string} step - The step in the journey
 * @param {Object} additionalParams - Optional additional parameters
 */
export const trackJourneyStep = (journey, step, additionalParams = {}) => {
  if (typeof window !== 'undefined') {
    const params = {
      journey_name: journey,
      journey_step: step,
      ...additionalParams
    };
    
    trackEvent({
      action: `${journey}_journey`,
      params: params
    });
  }
};

/**
 * Enhanced event tracking with standardized format
 * @param {Object} params - Event parameters
 * @param {string} params.action - The event action
 * @param {Object} params.params - Additional parameters for the event
 */
export const trackEvent = ({ action, params = {} }) => {
  if (typeof window !== 'undefined') {
    try {
      // Add timestamp for time-series analysis
      const enhancedParams = {
        event_time: new Date().toISOString(),
        ...params
      };
      
      // Google Analytics
      window.gtag('event', action, enhancedParams);
      
      // Facebook Pixel
      if (ReactPixel) ReactPixel.track(action, enhancedParams);
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }
};

/**
 * Track structured events with consistent naming
 * @param {string} category - Event category (use EventCategory enum)
 * @param {string} action - Event action (use EventAction enum)
 * @param {string} label - Event label (what was acted upon)
 * @param {any} value - Optional numeric value
 * @param {Object} additionalParams - Any additional parameters
 */
export const trackStructuredEvent = (category, action, label, value = null, additionalParams = {}) => {
  const params = {
    event_category: category,
    event_label: label,
    ...additionalParams
  };
  
  if (value !== null) {
    params.value = value;
  }
  
  trackEvent({
    action: `${category}_${action}`,
    params: params
  });
};

/**
 * Track form interactions with enhanced data
 * @param {string} formName - Name of the form
 * @param {string} action - Action (start, field_change, completion, etc.)
 * @param {string} fieldName - For field changes, the name of the field
 * @param {any} value - Optional value (e.g., selected option)
 */
export const trackForm = (formName, action, fieldName = null, value = null) => {
  const params = {
    form_name: formName
  };
  
  if (fieldName) params.field_name = fieldName;
  if (value !== null) params.value = value;
  
  trackStructuredEvent(
    EventCategory.FORM,
    action,
    formName,
    value,
    params
  );
};

/**
 * Track content engagement metrics
 * @param {string} contentType - Type of content (blog, project, nonprofit, etc.)
 * @param {string} contentId - ID of the content
 * @param {string} action - Action (view, scroll, share, etc.)
 * @param {Object} metrics - Metrics like scroll_depth, time_spent
 */
export const trackContentEngagement = (contentType, contentId, action, metrics = {}) => {
  trackStructuredEvent(
    EventCategory.CONTENT,
    action,
    `${contentType}_${contentId}`,
    null,
    {
      content_type: contentType,
      content_id: contentId,
      ...metrics
    }
  );
};

/**
 * Track scroll depth on a page
 * @param {string} pageType - Type of page being scrolled
 * @param {number} depth - Scroll depth percentage (25, 50, 75, 100)
 */
export const trackScrollDepth = (pageType, depth) => {
  trackContentEngagement(
    'page',
    pageType,
    EventAction.SCROLL,
    { scroll_depth: depth }
  );
};

/**
 * Track donation-related events using Enhanced Ecommerce paradigm
 * @param {string} action - Action in donation flow (begin, add_payment_info, complete)
 * @param {number} amount - Donation amount
 * @param {string} currency - Currency code (default: USD)
 * @param {Object} additionalParams - Additional parameters
 */
export const trackDonation = (action, amount, currency = 'USD', additionalParams = {}) => {
  trackStructuredEvent(
    EventCategory.DONATION,
    action,
    'donation',
    amount,
    {
      currency: currency,
      donation_amount: amount,
      ...additionalParams
    }
  );
  
  // If this is a completed donation, also track it as a conversion
  if (action === 'complete') {
    window.gtag('event', 'purchase', {
      transaction_id: `donation_${Date.now()}`,
      value: amount,
      currency: currency,
      ...additionalParams
    });
  }
};

/**
 * Legacy event tracking function (for backward compatibility)
 * @deprecated Use trackStructuredEvent instead
 */
export const event = (action, params) => {
  if (typeof window !== 'undefined') {
    console.warn('ga.event is deprecated. Please use trackStructuredEvent instead.');
    window.gtag('event', action, params);
  }
};

/**
 * Set user properties and associate user to session
 * @param {string} email - User email
 * @param {Object} additionalProperties - Additional user properties
 */
export const set = (email, additionalProperties = {}) => {
  if (typeof window !== 'undefined') {
    try {
      // Set user data for advertising/remarketing
      window.gtag('set', 'user_data', {
        email: email,
        ...additionalProperties
      });
      
      // Also track as a user_identified event for more flexible analysis
      trackStructuredEvent(
        EventCategory.USER,
        'identify',
        'user',
        null,
        { email_hash: hashEmail(email) }
      );
    } catch (error) {
      console.error('Error setting user data:', error);
    }
  }
};

/**
 * Hash email for privacy while still allowing for user identification
 * @param {string} email - Email to hash
 * @returns {string} - Hashed email
 */
const hashEmail = (email) => {
  try {
    // This is a simple hash function - in production you might want to use
    // a more sophisticated hashing algorithm
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      const char = email.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  } catch (e) {
    return '';
  }
};

/**
 * Track errors encountered by users
 * @param {string} errorType - Type of error
 * @param {string} errorMessage - Error message details
 * @param {string} location - Where the error occurred
 */
export const trackError = (errorType, errorMessage, location) => {
  trackStructuredEvent(
    EventCategory.ERROR,
    errorType,
    location,
    null,
    { error_message: errorMessage }
  );
};

// Export an enhanced GA object with all tracking functions
const ga = {
  pageview,
  trackEvent,
  trackStructuredEvent,
  trackJourneyStep,
  trackForm,
  trackContentEngagement,
  trackScrollDepth,
  trackDonation,
  trackError,
  event, // Legacy/deprecated
  set,
  initFacebookPixel,
  
  // Export constants for consistent use
  EventCategory,
  EventAction
};

export default ga;