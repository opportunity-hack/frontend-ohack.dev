import { SocialMediaService } from './SocialMediaService';

export class SlackService extends SocialMediaService {
  constructor(credentials) {
    super(credentials);
    this.name = 'Slack';
    this.characterLimit = 4000; // Slack has a higher character limit
    this.availableChannels = ['general', 'ask-a-mentor']; // Default channels
  }

  async validateCredentials() {
    // For Slack, we'll assume credentials are valid if we have the basic setup
    // In a real implementation, you might want to test the API endpoint
    return true;
  }

  formatContent(newsItem) {
    const { title, content, url, publishedAt } = newsItem;
    
    // Slack-specific formatting with Markdown
    let formattedContent = `*${title}*\n\n${content}`;
    
    if (url) {
      formattedContent += `\n\n🔗 <${url}|Read more>`;
    }
    
    // Add some Slack-specific emoji
    formattedContent = `📢 ${formattedContent}`;
    
    return formattedContent;
  }

  async post(content, channel = 'general') {
    try {
      // Make API call to our backend endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/slack/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.credentials?.accessToken && { 
            'authorization': `Bearer ${this.credentials.accessToken}` 
          }),
          ...(this.credentials?.orgId && { 
            'X-Org-Id': this.credentials.orgId 
          }),
        },
        body: JSON.stringify({
          message: content,
          channel: channel
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to post to Slack');
      }

      const result = await response.json();
      
      return {
        success: true,
        message: `Successfully posted to #${channel}`,
        platform: this.name,
        url: result.permalink || null,
        timestamp: result.ts || null,
        channel: channel
      };
    } catch (error) {
      console.error('Slack posting error:', error);
      return {
        success: false,
        message: `Failed to post to Slack: ${error.message}`,
        platform: this.name,
        error: error.message
      };
    }
  }

  async postNews(newsItem, channel = 'general') {
    const formattedContent = this.formatContent(newsItem);
    return await this.post(formattedContent, channel);
  }

  getAvailableChannels() {
    return this.availableChannels;
  }

  getPlatformLimits() {
    return {
      characterLimit: this.characterLimit,
      supportsImages: true,
      supportsThreads: true,
      rateLimits: {
        postsPerMinute: 1,
        postsPerHour: 100,
        postsPerDay: 10000
      },
      channels: this.availableChannels
    };
  }
}