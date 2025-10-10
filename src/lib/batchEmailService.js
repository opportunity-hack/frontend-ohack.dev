/**
 * Batch Email Service
 * Handles sending emails to multiple selected users via the backend API
 *
 * Automatically detects recipient type and uses appropriate API endpoint:
 * - Registered users (with ID): /api/admin/{user.id}/message
 * - Email-only recipients: /api/admin/email/send
 */

import { replacePlaceholders } from './messageTemplates';

class BatchEmailService {
  constructor(apiServerUrl, accessToken, orgId) {
    this.apiServerUrl = apiServerUrl;
    this.accessToken = accessToken;
    this.orgId = orgId;
  }

  /**
   * Send an email to a single user
   * @param {Object} user - The user object
   * @param {string} message - The email message content
   * @param {string} subject - The email subject
   * @param {string} recipientType - The recipient type (mentor, judge, etc.)
   * @param {string} eventId - The event ID for placeholder replacement
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async sendEmailToUser(user, message, subject, recipientType, eventId) {
    try {
      // Use shared utility to replace placeholders in message
      const processedMessage = replacePlaceholders(message, {
        eventId: eventId,
        volunteerId: user.id,
        volunteerType: recipientType
      });

      // Determine if this is a user with an ID (registered user) or email-only recipient
      const isEmailOnlyRecipient = !user.id || user.source === 'custom' || user.source === 'csv';

      let endpoint, requestBody;

      if (isEmailOnlyRecipient) {
        // Use email-only endpoint for recipients without user accounts
        endpoint = `${this.apiServerUrl}/api/admin/email/send`;
        requestBody = {
          email: user.email,
          message: processedMessage,
          subject: subject,
          recipient_type: recipientType,
          name: user.name || user.email || 'Recipient'
        };
      } else {
        // Use user ID endpoint for registered users
        endpoint = `${this.apiServerUrl}/api/admin/${user.id}/message`;
        requestBody = {
          message: processedMessage,
          subject: subject,
          recipient_type: recipientType,
          recipient_id: user.id
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'X-Org-Id': this.orgId,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: data.success || true,
          data,
          endpoint: isEmailOnlyRecipient ? 'email-only' : 'user-id'
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;

        // Add context about which endpoint was used for better debugging
        const contextualError = `${errorMessage} (via ${isEmailOnlyRecipient ? 'email-only' : 'user-ID'} endpoint)`;

        return {
          success: false,
          error: contextualError,
          endpoint: isEmailOnlyRecipient ? 'email-only' : 'user-id'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `${error.message || 'Network error occurred'} (${isEmailOnlyRecipient ? 'email-only' : 'user-ID'} endpoint)`,
        endpoint: isEmailOnlyRecipient ? 'email-only' : 'user-id'
      };
    }
  }

  /**
   * Send emails to multiple users with progress tracking
   * @param {Array} users - Array of user objects with id, name, email
   * @param {string} message - The email message content
   * @param {string} subject - The email subject
   * @param {string} recipientType - The recipient type
   * @param {string} eventId - The event ID for placeholder replacement
   * @param {Function} onProgress - Callback for progress updates
   * @returns {Promise<{results: Array, summary: Object}>}
   */
  async sendBatchEmails(users, message, subject, recipientType, eventId, onProgress = () => {}) {
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
        currentUser: user.name || user.email || user.id,
        percentage: Math.round(((i + 1) / users.length) * 100)
      });

      const result = await this.sendEmailToUser(user, message, subject, recipientType, eventId);
      
      const userResult = {
        user: user,
        success: result.success,
        error: result.error,
        data: result.data,
        endpoint: result.endpoint // Track which endpoint was used
      };

      results.push(userResult);

      if (result.success) {
        summary.successful++;
      } else {
        summary.failed++;
        summary.errors.push({
          user: user.name || user.email || user.id,
          error: result.error
        });
      }

      // Small delay to avoid overwhelming the API
      if (i < users.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    return { results, summary };
  }

  /**
   * Filter users who are selected and have email addresses
   * @param {Array} users - Array of user objects
   * @returns {Array} Filtered users ready for email sending
   */
  static filterEligibleUsers(users) {
    return users.filter(user =>
      (user.isSelected !== undefined ? user.isSelected : true) && // Default to selected for community members
      user.email &&
      user.email.trim() !== '' &&
      user.id // Must have an ID for the API endpoint
    );
  }

  /**
   * Filter users who are NOT selected and have email addresses (for rejection emails)
   * @param {Array} users - Array of user objects
   * @returns {Array} Filtered users ready for rejection email sending
   */
  static filterNotSelectedUsers(users) {
    return users.filter(user => 
      !user.isSelected && 
      user.email && 
      user.email.trim() !== '' &&
      user.id // Must have an ID for the API endpoint
    );
  }

  /**
   * Validate email message content
   * @param {string} message - Message content to validate
   * @returns {string} Error message if invalid, empty string if valid
   */
  static validateMessage(message) {
    if (!message || typeof message !== 'string') {
      return 'Message content is required';
    }
    
    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
      return 'Message cannot be empty';
    }
    
    if (trimmedMessage.length > 10000) {
      return 'Message is too long (max 10,000 characters)';
    }
    
    return '';
  }

  /**
   * Validate email subject
   * @param {string} subject - Subject to validate
   * @returns {string} Error message if invalid, empty string if valid
   */
  static validateSubject(subject) {
    if (!subject || typeof subject !== 'string') {
      return 'Subject is required';
    }
    
    const trimmedSubject = subject.trim();
    if (trimmedSubject.length === 0) {
      return 'Subject cannot be empty';
    }
    
    if (trimmedSubject.length > 200) {
      return 'Subject is too long (max 200 characters)';
    }
    
    return '';
  }

  /**
   * Get recipient type from volunteer type
   * @param {string} volunteerType - The volunteer type (mentors, judges, etc.)
   * @returns {string} Singular form of the volunteer type
   */
  static getRecipientType(volunteerType) {
    const typeMap = {
      'mentors': 'mentor',
      'judges': 'judge',
      'volunteers': 'volunteer',
      'hackers': 'hacker',
      'sponsors': 'sponsor',
      'community members': 'community',
      'community': 'community',
      'slack': 'community'
    };

    return typeMap[volunteerType] || volunteerType;
  }
}

export default BatchEmailService;