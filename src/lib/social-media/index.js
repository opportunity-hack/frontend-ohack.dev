// Social Media Integration Library
// Provides a generalized architecture for posting to multiple social media platforms

export { SocialMediaService } from './SocialMediaService';
export { ThreadsService } from './ThreadsService';
export { NewsService } from './NewsService';
export { SocialMediaManager } from './SocialMediaManager';

// Convenience function to create a configured manager
export const createSocialMediaManager = (env = process.env, apiServerUrl) => {
  return SocialMediaManager.createFromEnvironment(env, apiServerUrl);
};

// Platform constants for easy reference
export const SUPPORTED_PLATFORMS = {
  THREADS: 'threads',
  // Add more platforms here as they are implemented
  // TWITTER: 'twitter',
  // LINKEDIN: 'linkedin',
  // FACEBOOK: 'facebook'
};

// Default configuration options
export const DEFAULT_NEWS_OPTIONS = {
  limit: 10,
  filterCriteria: {
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year (very lenient)
    minContentLength: 20,
    requireTitle: true
  }
};

export const DEFAULT_POSTING_OPTIONS = {
  platforms: [SUPPORTED_PLATFORMS.THREADS],
  limit: 5,
  dryRun: false
};