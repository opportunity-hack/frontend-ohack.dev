/**
 * Broadcast Service
 * Thin client for the backend's Resend segment/broadcast endpoints
 * (/api/admin/broadcasts/*). Mass sends go: pick sources → sync contacts into
 * a Resend segment (background job, polled) → send ONE broadcast to the
 * segment, instead of one email per recipient.
 */

class BroadcastService {
  constructor(apiServerUrl, accessToken, orgId) {
    this.apiServerUrl = apiServerUrl;
    this.accessToken = accessToken;
    this.orgId = orgId;
  }

  async request(path, { method = "GET", body } = {}) {
    const response = await fetch(`${this.apiServerUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        "X-Org-Id": this.orgId,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message =
        (typeof data.text === "string" && data.text) ||
        data.error ||
        `HTTP ${response.status}: ${response.statusText}`;
      const error = new Error(message);
      error.status = response.status;
      error.data = data;
      throw error;
    }
    return data;
  }

  listSegments() {
    return this.request("/api/admin/broadcasts/segments");
  }

  previewSources({ sources, customEmails }) {
    return this.request("/api/admin/broadcasts/preview", {
      method: "POST",
      body: { sources, custom_emails: customEmails },
    });
  }

  startSegmentSync({ segmentId, segmentName, sources, customEmails }) {
    return this.request("/api/admin/broadcasts/segments/sync", {
      method: "POST",
      body: {
        segment_id: segmentId,
        segment_name: segmentName,
        sources,
        custom_emails: customEmails,
      },
    });
  }

  getSyncStatus(segmentId) {
    return this.request(
      `/api/admin/broadcasts/segments/${encodeURIComponent(segmentId)}/sync-status`,
    );
  }

  createBroadcast({
    segmentId,
    subject,
    bodyMarkdown,
    name,
    fromAddress,
    replyTo,
    send,
    scheduledAt,
  }) {
    return this.request("/api/admin/broadcasts", {
      method: "POST",
      body: {
        segment_id: segmentId,
        subject,
        body_markdown: bodyMarkdown,
        name,
        from_address: fromAddress || undefined,
        reply_to: replyTo || undefined,
        send: Boolean(send),
        scheduled_at: scheduledAt || undefined,
      },
    });
  }

  sendBroadcast(broadcastId, { scheduledAt } = {}) {
    return this.request(
      `/api/admin/broadcasts/${encodeURIComponent(broadcastId)}/send`,
      { method: "POST", body: { scheduled_at: scheduledAt || undefined } },
    );
  }

  listBroadcasts() {
    return this.request("/api/admin/broadcasts");
  }

  listContacts({ force = false } = {}) {
    return this.request(
      `/api/admin/broadcasts/contacts${force ? "?force=true" : ""}`,
    );
  }

  // mode: "unsubscribed" | "emails" | "all"; emails required for mode=emails.
  startContactPrune({ mode, emails }) {
    return this.request("/api/admin/broadcasts/contacts/prune", {
      method: "POST",
      body: { mode, emails },
    });
  }

  getPruneStatus() {
    return this.request("/api/admin/broadcasts/contacts/prune-status");
  }
}

export default BroadcastService;
