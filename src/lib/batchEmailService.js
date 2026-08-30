/**
 * Batch Email Service
 * Handles sending emails to multiple selected users via the backend API
 *
 * Automatically detects recipient type and uses appropriate API endpoint:
 * - Registered users (with ID): /api/admin/{user.id}/message (also Slack-DMs them)
 * - Email-only recipients, in bulk: /api/admin/broadcasts/batch-send
 *   (Resend Batch API server-side — up to 100 emails per Resend call; falls
 *   back to per-recipient /api/admin/email/send if the endpoint is unavailable
 *   or the message embeds a [QRCode:...] attachment, which Resend Batch
 *   doesn't support)
 */

import { replacePlaceholders } from "./messageTemplates";

// Recipients sourced from Slack carry a Slack ID in user.id, which is NOT a
// user-doc id — they must go down the email-only path, never /api/admin/{id}/message.
const EMAIL_ONLY_SOURCES = new Set(["custom", "csv", "slack"]);
const QR_MARKER_RE = /\[QRCode:/i;

class BatchEmailService {
  static MAX_PARALLEL_SENDS = 8;
  static BATCH_CHUNK_SIZE = 100;

  constructor(apiServerUrl, accessToken, orgId) {
    this.apiServerUrl = apiServerUrl;
    this.accessToken = accessToken;
    this.orgId = orgId;
    this.batchEndpointUnavailable = false;
  }

  static isEmailOnlyRecipient(user) {
    return !user.id || EMAIL_ONLY_SOURCES.has(user.source);
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
    const isEmailOnlyRecipient = BatchEmailService.isEmailOnlyRecipient(user);

    try {
      // Use shared utility to replace placeholders in message
      const processedMessage = replacePlaceholders(message, {
        eventId: eventId,
        volunteerId: user.id,
        volunteerType: recipientType,
      });

      let endpoint, requestBody;

      if (isEmailOnlyRecipient) {
        // Use email-only endpoint for recipients without user accounts
        endpoint = `${this.apiServerUrl}/api/admin/email/send`;
        requestBody = {
          email: user.email,
          message: processedMessage,
          subject: subject,
          recipient_type: recipientType,
          name: user.name || user.email || "Recipient",
          volunteer_id: user.id || null,
        };
      } else {
        // Use user ID endpoint for registered users
        endpoint = `${this.apiServerUrl}/api/admin/${user.id}/message`;
        requestBody = {
          message: processedMessage,
          subject: subject,
          recipient_type: recipientType,
          recipient_id: user.id,
          email: user.email,
          name: user.name || user.email || "Recipient",
        };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
          "X-Org-Id": this.orgId,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: data.success || true,
          data,
          endpoint: isEmailOnlyRecipient ? "email-only" : "user-id",
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message ||
          errorData.error ||
          `HTTP ${response.status}: ${response.statusText}`;

        // Add context about which endpoint was used for better debugging
        const contextualError = `${errorMessage} (via ${isEmailOnlyRecipient ? "email-only" : "user-ID"} endpoint)`;

        return {
          success: false,
          error: contextualError,
          endpoint: isEmailOnlyRecipient ? "email-only" : "user-id",
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `${error.message || "Network error occurred"} (${isEmailOnlyRecipient ? "email-only" : "user-ID"} endpoint)`,
        endpoint: isEmailOnlyRecipient ? "email-only" : "user-id",
      };
    }
  }

  /**
   * Send one chunk (≤100 recipients) through the server-side Resend Batch
   * endpoint. Returns per-recipient results in input order, or null when the
   * endpoint is unavailable (older backend) so the caller can fall back.
   */
  async sendBatchChunk(recipients, subject, recipientType) {
    try {
      const response = await fetch(
        `${this.apiServerUrl}/api/admin/broadcasts/batch-send`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
            "X-Org-Id": this.orgId,
          },
          body: JSON.stringify({
            subject,
            recipient_type: recipientType,
            recipients: recipients.map((r) => ({
              email: r.user.email,
              name: r.user.name || r.user.real_name || r.user.email,
              message: r.message,
            })),
          }),
        },
      );

      if (response.status === 404 || response.status === 405) {
        // Backend without the batch endpoint yet — signal fallback.
        this.batchEndpointUnavailable = true;
        return null;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message ||
          errorData.error ||
          `HTTP ${response.status}: ${response.statusText}`;
        return recipients.map(() => ({
          success: false,
          error: `${errorMessage} (via batch endpoint)`,
          endpoint: "batch",
        }));
      }

      const data = await response.json();
      const perRecipient = Array.isArray(data?.results) ? data.results : [];
      return recipients.map((_, i) => {
        const entry = perRecipient[i] || {};
        return {
          success: Boolean(entry.success),
          error: entry.success
            ? undefined
            : `${entry.error || "Unknown batch send error"} (via batch endpoint)`,
          data: entry,
          endpoint: "batch",
        };
      });
    } catch (error) {
      return recipients.map(() => ({
        success: false,
        error: `${error.message || "Network error occurred"} (batch endpoint)`,
        endpoint: "batch",
      }));
    }
  }

  /**
   * Send emails to multiple users with progress tracking.
   *
   * Email-only recipients (custom/CSV/Slack-sourced) are sent in bulk through
   * the Resend Batch endpoint (100 per call) when the message has no
   * [QRCode:...] attachment marker; registered users keep the per-recipient
   * /api/admin/{id}/message path (which also Slack-DMs them).
   *
   * @param {Array} users - Array of user objects with id, name, email
   * @param {string} message - The email message content
   * @param {string} subject - The email subject
   * @param {string} recipientType - The recipient type
   * @param {string} eventId - The event ID for placeholder replacement
   * @param {Function} onProgress - Callback for progress updates
   * @returns {Promise<{results: Array, summary: Object}>}
   */
  async sendBatchEmails(
    users,
    message,
    subject,
    recipientType,
    eventId,
    onProgress = () => {},
  ) {
    const results = new Array(users.length);
    const summary = {
      total: users.length,
      successful: 0,
      failed: 0,
      errors: [],
    };

    if (users.length === 0) {
      onProgress({
        current: 0,
        total: 0,
        currentUser: null,
        percentage: 100,
        inFlight: 0,
        concurrency: 0,
      });
      return { results: [], summary };
    }

    let completed = 0;
    let inFlight = 0;
    let concurrency = 0;

    const reportProgress = (user) => {
      onProgress({
        current: completed,
        total: users.length,
        currentUser: user?.name || user?.email || user?.id || null,
        percentage: Math.round((completed / users.length) * 100),
        inFlight,
        concurrency,
      });
    };

    const recordResult = (index, user, result) => {
      results[index] = {
        user,
        success: result.success,
        error: result.error,
        data: result.data,
        endpoint: result.endpoint,
      };
      completed += 1;
      if (result.success) {
        summary.successful += 1;
      } else {
        summary.failed += 1;
        summary.errors.push({
          user: user.name || user.email || user.id,
          error: result.error,
        });
      }
    };

    // Partition: bulk-capable vs per-recipient.
    const canBatch =
      !QR_MARKER_RE.test(message) && !this.batchEndpointUnavailable;
    const batchIndices = [];
    const perUserIndices = [];
    users.forEach((user, index) => {
      if (canBatch && BatchEmailService.isEmailOnlyRecipient(user)) {
        batchIndices.push(index);
      } else {
        perUserIndices.push(index);
      }
    });

    reportProgress();

    // Bulk path: chunked Resend Batch sends.
    if (batchIndices.length > 0) {
      const prepared = batchIndices.map((index) => ({
        index,
        user: users[index],
        message: replacePlaceholders(message, {
          eventId,
          volunteerId: users[index].id,
          volunteerType: recipientType,
        }),
      }));

      for (
        let offset = 0;
        offset < prepared.length;
        offset += BatchEmailService.BATCH_CHUNK_SIZE
      ) {
        const chunk = prepared.slice(
          offset,
          offset + BatchEmailService.BATCH_CHUNK_SIZE,
        );
        inFlight = chunk.length;
        reportProgress(chunk[0]?.user);

        const chunkResults = await this.sendBatchChunk(
          chunk,
          subject,
          recipientType,
        );
        inFlight = 0;

        if (chunkResults === null) {
          // Endpoint unavailable — route this and all remaining bulk
          // recipients down the per-recipient path instead.
          prepared
            .slice(offset)
            .forEach(({ index }) => perUserIndices.push(index));
          break;
        }

        chunk.forEach(({ index, user }, i) =>
          recordResult(index, user, chunkResults[i]),
        );
        reportProgress(chunk[chunk.length - 1]?.user);
      }
    }

    // Per-recipient path: bounded worker pool.
    if (perUserIndices.length > 0) {
      concurrency = Math.min(
        BatchEmailService.MAX_PARALLEL_SENDS,
        perUserIndices.length,
      );
      let cursor = 0;

      const worker = async () => {
        while (true) {
          const slot = cursor;
          if (slot >= perUserIndices.length) {
            return;
          }
          cursor += 1;

          const index = perUserIndices[slot];
          const user = users[index];
          inFlight += 1;

          const result = await this.sendEmailToUser(
            user,
            message,
            subject,
            recipientType,
            eventId,
          );

          inFlight -= 1;
          recordResult(index, user, result);
          reportProgress(user);
        }
      };

      await Promise.all(Array.from({ length: concurrency }, () => worker()));
    }

    reportProgress();
    return { results: results.filter(Boolean), summary };
  }

  /**
   * Filter users who are selected and have email addresses
   * @param {Array} users - Array of user objects
   * @returns {Array} Filtered users ready for email sending
   */
  static filterEligibleUsers(users) {
    return users.filter(
      (user) =>
        (user.isSelected !== undefined ? user.isSelected : true) && // Default to selected for community members
        user.email &&
        user.email.trim() !== "" &&
        user.id, // Must have an ID for the API endpoint
    );
  }

  /**
   * Filter users who are NOT selected and have email addresses (for rejection emails)
   * @param {Array} users - Array of user objects
   * @returns {Array} Filtered users ready for rejection email sending
   */
  static filterNotSelectedUsers(users) {
    return users.filter(
      (user) =>
        !user.isSelected && user.email && user.email.trim() !== "" && user.id, // Must have an ID for the API endpoint
    );
  }

  /**
   * Validate email message content
   * @param {string} message - Message content to validate
   * @returns {string} Error message if invalid, empty string if valid
   */
  static validateMessage(message) {
    if (!message || typeof message !== "string") {
      return "Message content is required";
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
      return "Message cannot be empty";
    }

    if (trimmedMessage.length > 10000) {
      return "Message is too long (max 10,000 characters)";
    }

    return "";
  }

  /**
   * Validate email subject
   * @param {string} subject - Subject to validate
   * @returns {string} Error message if invalid, empty string if valid
   */
  static validateSubject(subject) {
    if (!subject || typeof subject !== "string") {
      return "Subject is required";
    }

    const trimmedSubject = subject.trim();
    if (trimmedSubject.length === 0) {
      return "Subject cannot be empty";
    }

    if (trimmedSubject.length > 200) {
      return "Subject is too long (max 200 characters)";
    }

    return "";
  }

  /**
   * Get recipient type from volunteer type
   * @param {string} volunteerType - The volunteer type (mentors, judges, etc.)
   * @returns {string} Singular form of the volunteer type
   */
  static getRecipientType(volunteerType) {
    const typeMap = {
      mentors: "mentor",
      judges: "judge",
      volunteers: "volunteer",
      hackers: "hacker",
      sponsors: "sponsor",
      "community members": "community",
      community: "community",
      slack: "community",
    };

    return typeMap[volunteerType] || volunteerType;
  }
}

export default BatchEmailService;
