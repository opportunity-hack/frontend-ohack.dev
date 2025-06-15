import { SocialMediaService } from './SocialMediaService';

/**
 * Threads API integration service
 * Extends the base SocialMediaService for Threads-specific functionality
 */
export class ThreadsService extends SocialMediaService {
  constructor(credentials) {
    super(credentials);
    this.name = 'Threads';
    this.characterLimit = 500; // Threads has a 500 character limit
    this.apiBaseUrl = 'https://graph.threads.net';
    
    if (!credentials?.accessToken || !credentials?.userId) {
      throw new Error('Threads credentials must include accessToken and userId');
    }
  }

  /**
   * Validates Threads API credentials by making a test API call
   * @returns {Promise<boolean>}
   */
  async validateCredentials() {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/${this.credentials.userId}?fields=id,username&access_token=${this.credentials.accessToken}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error('Threads credential validation failed:', response.status, response.statusText);
        return false;
      }

      const data = await response.json();
      return data.id && data.username;
    } catch (error) {
      console.error('Error validating Threads credentials:', error);
      return false;
    }
  }

  /**
   * Formats content for Threads posting with platform-specific formatting
   * @param {Object} newsItem - News item to format
   * @returns {string} - Formatted content for Threads
   */
  formatContent(newsItem) {
    const { title, content, url, links } = newsItem;
    
    // Threads-specific formatting with emoji
    let formattedContent = `🚀 ${title}\n\n${content}`;
    
    // Add hashtags for better discoverability
    const hashtags = '\n\n#OpportunityHack #TechForGood #Nonprofit #Volunteering #SocialImpact';
    
    // Use the primary URL from the news item, or fall back to ohack.dev
    let linkSection = '';
    if (url) {
      linkSection = `\n\n🔗 ${url}`;
    } else if (links && links.length > 0) {
      linkSection = `\n\n🔗 ${links[0].url}`;
    } else {
      linkSection = `\n\n🔗 Learn more: https://www.ohack.dev`;
    }
    
    // Calculate space and truncate if needed
    const fullContent = formattedContent + hashtags + linkSection;
    
    if (fullContent.length > this.characterLimit) {
      const fixedParts = hashtags + linkSection;
      const availableSpace = this.characterLimit - fixedParts.length - 3; // Account for "..."
      
      if (availableSpace > 50) { // Ensure we have enough space for meaningful content
        const truncatedMain = formattedContent.substring(0, availableSpace) + '...';
        formattedContent = truncatedMain + fixedParts;
      } else {
        // If space is very limited, prioritize title and link
        const shortContent = `🚀 ${title}...`;
        formattedContent = shortContent + linkSection + '\n\n#OpportunityHack #TechForGood';
      }
    } else {
      formattedContent = fullContent;
    }
    
    return formattedContent;
  }

  /**
   * Posts content to Threads using the Threads API
   * @param {string} content - Formatted content to post
   * @returns {Promise<Object>} - Response from Threads API
   */
  async post(content) {
    try {
      // Step 1: Create media container
      const createResponse = await fetch(
        `${this.apiBaseUrl}/${this.credentials.userId}/threads`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            media_type: 'TEXT',
            text: content,
            access_token: this.credentials.accessToken,
          }),
        }
      );

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(`Failed to create Threads post: ${errorData.error?.message || createResponse.statusText}`);
      }

      const createData = await createResponse.json();
      const mediaContainerId = createData.id;

      // Step 2: Publish the post
      const publishResponse = await fetch(
        `${this.apiBaseUrl}/${this.credentials.userId}/threads_publish`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            creation_id: mediaContainerId,
            access_token: this.credentials.accessToken,
          }),
        }
      );

      if (!publishResponse.ok) {
        const errorData = await publishResponse.json();
        throw new Error(`Failed to publish Threads post: ${errorData.error?.message || publishResponse.statusText}`);
      }

      const publishData = await publishResponse.json();

      return {
        success: true,
        platform: this.name,
        postId: publishData.id,
        message: 'Successfully posted to Threads',
        url: `https://threads.net/@${this.credentials.username}/post/${publishData.id}`,
      };
    } catch (error) {
      console.error('Error posting to Threads:', error);
      return {
        success: false,
        platform: this.name,
        error: error.message,
        message: `Failed to post to Threads: ${error.message}`,
      };
    }
  }

  /**
   * Gets Threads-specific platform limits and capabilities
   * @returns {Object}
   */
  getPlatformLimits() {
    return {
      characterLimit: this.characterLimit,
      supportsImages: true,
      supportsThreads: true,
      rateLimits: {
        postsPerHour: 25,
        postsPerDay: 250
      },
      features: [
        'Text posts',
        'Image posts', 
        'Link previews',
        'Hashtags',
        'Mentions'
      ]
    };
  }
}