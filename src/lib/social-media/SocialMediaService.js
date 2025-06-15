/**
 * Abstract base class for social media posting services
 * This allows easy extension to support multiple social media platforms
 */
export class SocialMediaService {
  constructor(credentials) {
    this.credentials = credentials;
    this.name = 'Unknown Platform';
    this.characterLimit = 280; // Default Twitter-like limit
  }

  /**
   * Validates the service credentials
   * @returns {Promise<boolean>}
   */
  async validateCredentials() {
    throw new Error('validateCredentials must be implemented by subclass');
  }

  /**
   * Formats content according to platform-specific rules
   * @param {Object} newsItem - News item to format
   * @returns {string} - Formatted content ready for posting
   */
  formatContent(newsItem) {
    const { title, content, url, publishedAt } = newsItem;
    
    // Basic formatting - can be overridden by specific platforms
    let formattedContent = `${title}\n\n${content}`;
    
    if (url) {
      formattedContent += `\n\n🔗 ${url}`;
    }
    
    // Truncate if needed
    if (formattedContent.length > this.characterLimit) {
      const availableSpace = this.characterLimit - (url ? url.length + 5 : 0) - 3; // Account for "..." and URL
      formattedContent = `${formattedContent.substring(0, availableSpace)}...`;
      if (url) {
        formattedContent += `\n\n🔗 ${url}`;
      }
    }
    
    return formattedContent;
  }

  /**
   * Posts content to the social media platform
   * @param {string} content - Formatted content to post
   * @returns {Promise<Object>} - Response from the platform API
   */
  async post(content) {
    throw new Error('post must be implemented by subclass');
  }

  /**
   * Posts a news item (combines formatting and posting)
   * @param {Object} newsItem - News item to post
   * @returns {Promise<Object>} - Response from the platform API
   */
  async postNews(newsItem) {
    const formattedContent = this.formatContent(newsItem);
    return await this.post(formattedContent);
  }

  /**
   * Gets the platform name for display purposes
   * @returns {string}
   */
  getPlatformName() {
    return this.name;
  }

  /**
   * Gets platform-specific posting limits and rules
   * @returns {Object}
   */
  getPlatformLimits() {
    return {
      characterLimit: this.characterLimit,
      supportsImages: false,
      supportsThreads: false,
      rateLimits: {
        postsPerHour: 100,
        postsPerDay: 2400
      }
    };
  }
}