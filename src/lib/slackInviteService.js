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
   * @param {Object} [person] - The application row; only used so the backend's
   *   audit line can name the person (name, email, id, type, event).
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async inviteUser(slackUserId, channel, person = null) {
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
          ...SlackInviteService.auditContext(person),
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
   * Who is being invited, for the backend audit line. Empty values are left out.
   */
  static auditContext(person) {
    if (!person) return {};
    const context = {
      name: person.name,
      email: person.email,
      volunteer_id: person.id,
      volunteer_type: person.volunteer_type,
      event_id: person.event_id,
    };
    return Object.fromEntries(
      Object.entries(context).filter(([, value]) => typeof value === 'string' && value.trim())
    );
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

      const result = await this.inviteUser(user.slack_user_id, channel, user);
      
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
   * Re-check an event's applicants against the Slack workspace and save the
   * Slack id for anyone who joined Slack after they applied.
   *
   * THROWS on any failure — a failed check must never read as "nobody new".
   * @param {string} eventId
   * @param {string} [volunteerType] mentor | judge | volunteer | hacker | sponsor
   * @returns {Promise<{checked: number, updated: Array, unmatched: Array}>}
   */
  async refreshSlackIds(eventId, volunteerType) {
    let response;
    try {
      response = await fetch(
        `${this.apiServerUrl}/api/slack/admin/volunteers/${encodeURIComponent(eventId)}/refresh`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            'X-Org-Id': this.orgId,
          },
          body: JSON.stringify(volunteerType ? { volunteer_type: volunteerType } : {}),
        }
      );
    } catch (error) {
      throw new Error("Couldn't reach the server to check Slack. Try again.");
    }

    if (response.status === 404) {
      throw new Error("Checking Slack for new members isn't available on this backend yet.");
    }
    if (response.status === 502) {
      throw new Error("Slack couldn't be reached, so nothing was changed. Try again in a minute.");
    }
    if (!response.ok) {
      throw new Error(`Couldn't check Slack for new members (HTTP ${response.status}).`);
    }

    const data = await response.json().catch(() => null);
    if (!data || !Array.isArray(data.updated)) {
      throw new Error("Couldn't read the Slack check result. Try again.");
    }
    return {
      checked: data.checked || 0,
      updated: data.updated,
      unmatched: Array.isArray(data.unmatched) ? data.unmatched : [],
    };
  }

  /**
   * Roster people who can't be invited yet because no Slack account is linked.
   * @param {Array} users
   * @returns {Array}
   */
  static filterRosterWithoutSlack(users) {
    return users.filter(user =>
      user.isSelected &&
      !(user.slack_user_id && user.slack_user_id.trim() !== '')
    );
  }

  /**
   * One-line summary of a refreshSlackIds() result for a toast.
   * @param {{updated: Array, unmatched: Array}} result
   * @returns {string}
   */
  static refreshSummary(result) {
    const found = result.updated.length;
    const missing = result.unmatched.length;
    const head = found > 0
      ? `Found ${found} ${found === 1 ? 'person' : 'people'} who joined Slack`
      : 'No new Slack members found';
    return missing > 0 ? `${head} · ${missing} still not on Slack` : head;
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
