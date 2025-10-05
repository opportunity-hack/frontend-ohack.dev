/**
 * Slack Invitation Service
 * Handles inviting users to Slack channels via the backend API
 */

class SlackInviteService {
  constructor(apiServerUrl, accessToken, orgId) {
    this.apiServerUrl = apiServerUrl;
    this.accessToken = accessToken;
    this.orgId = orgId;
  }

  /**
   * Invite a single user to a Slack channel
   * @param {string} slackUserId - The Slack user ID
   * @param {string} channel - The Slack channel name
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async inviteUser(slackUserId, channel) {
    try {
      const response = await fetch(`${this.apiServerUrl}/api/slack/invite-to-channel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'X-Org-Id': this.orgId,
        },
        body: JSON.stringify({
          user_id: slackUserId,
          channel: channel,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return { 
          success: false, 
          error: errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Network error occurred'
      };
    }
  }

  /**
   * Invite multiple users to a Slack channel with progress tracking
   * @param {Array} users - Array of user objects with slack_user_id and name
   * @param {string} channel - The Slack channel name
   * @param {Function} onProgress - Callback for progress updates
   * @returns {Promise<{results: Array, summary: Object}>}
   */
  async inviteMultipleUsers(users, channel, onProgress = () => {}) {
    const results = [];
    const summary = {
      total: users.length,
      successful: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      
      // Update progress
      onProgress({
        current: i + 1,
        total: users.length,
        currentUser: user.name || user.slack_user_id,
        percentage: Math.round(((i + 1) / users.length) * 100)
      });

      const result = await this.inviteUser(user.slack_user_id, channel);
      
      const userResult = {
        user: user,
        success: result.success,
        error: result.error
      };

      results.push(userResult);

      if (result.success) {
        summary.successful++;
      } else {
        summary.failed++;
        summary.errors.push({
          user: user.name || user.slack_user_id,
          error: result.error
        });
      }

      // Small delay to avoid overwhelming the API
      if (i < users.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    return { results, summary };
  }

  /**
   * Filter users who have Slack user IDs and are selected
   * @param {Array} users - Array of user objects
   * @returns {Array} Filtered users ready for Slack invitation
   */
  static filterEligibleUsers(users) {
    return users.filter(user => 
      user.isSelected && 
      user.slack_user_id && 
      user.slack_user_id.trim() !== ''
    );
  }

  /**
   * Validate channel name format
   * @param {string} channel - Channel name to validate
   * @returns {boolean} Whether the channel name is valid
   */
  static isValidChannelName(channel) {
    if (!channel || typeof channel !== 'string') return false;
    
    // Remove # if present at the beginning
    const cleanChannel = channel.startsWith('#') ? channel.slice(1) : channel;
    
    // Slack channel names must be lowercase, no spaces, and contain only letters, numbers, hyphens, and underscores
    const channelRegex = /^[a-z0-9_-]+$/;
    
    return channelRegex.test(cleanChannel) && cleanChannel.length <= 50;
  }

  /**
   * Clean channel name to proper format
   * @param {string} channel - Channel name to clean
   * @returns {string} Cleaned channel name
   */
  static cleanChannelName(channel) {
    if (!channel) return '';
    
    // Remove # if present and convert to lowercase
    return channel.startsWith('#') ? channel.slice(1).toLowerCase() : channel.toLowerCase();
  }
}

export default SlackInviteService;