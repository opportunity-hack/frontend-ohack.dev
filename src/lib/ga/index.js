let ReactPixel;

// Initialize Facebook Pixel
export const initFacebookPixel = async () => {
  if (typeof window !== 'undefined') {
    ReactPixel = (await import('react-facebook-pixel')).default;
    const options = {
      autoConfig: true,
      debug: false,
    };
    const advancedMatching = undefined;
    ReactPixel.init(process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID, advancedMatching, options);
  }
};

// log the pageview with their URL
export const pageview = (url) => {
  if (typeof window !== 'undefined') {
    window.gtag('config', process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS, {
      page_path: url,
    });
    ReactPixel.pageView();
  }
}

// log specific events happening for both Google Analytics and Facebook Pixel
export const trackEvent = ({ action, params }) => {
  if (typeof window !== 'undefined') {
    // Google Analytics
    window.gtag('event', action, params);
    
    // Facebook Pixel
    ReactPixel.track(action, params);
  }
}

export const event = ( action, params ) => {
  if (typeof window !== 'undefined') {
    // Google Analytics
    window.gtag('event', action, params);
  }
}

// associate user to session
// https://support.google.com/google-ads/answer/12785474
export const set = (email) => {
  if (typeof window !== 'undefined') {
    window.gtag('set', 'user_data', {
      "email": email
    });
  }
}

const ga = {
  pageview,
  trackEvent, // TODO: Move everything over to use this since it sends to both GA and FB
  event, // TODO: Remove this after moving to trackEvent
  set,
  initFacebookPixel,
};

export default ga;