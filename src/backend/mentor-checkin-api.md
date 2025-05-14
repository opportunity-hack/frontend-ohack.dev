# Mentor Check-in API Implementation Guide

This document outlines the backend API endpoints that need to be implemented to support the mentor check-in functionality.

## Required API Endpoints

Review volunteers_views.py and volunteers_service.py for context on these endpoints that already exist.

### 1. Get Mentor Check-in Status

**Endpoint:** `GET /api/mentor/checkin/:event_id/status`

**Description:** Retrieves the current check-in status for the authenticated mentor.

**Authentication:** Requires authenticated user with valid JWT token.

**Request:**
- No request body is required.
- The event ID is included in the URL.

**Response:**
```json
{
  "success": true,
  "isCheckedIn": true|false,
  "checkInTime": "2023-10-15T14:30:00Z", // If checked in
  "timeSlot": "Oct 15: 🌆 Evening (4pm - 7pm PST)" // The time slot they checked in for
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

### 2. Mentor Check-in

**Endpoint:** `POST /api/mentor/checkin/:event_id/in`

**Description:** Marks a mentor as checked in and sends a Slack notification.

**Authentication:** Requires authenticated user with valid JWT token.

**Request:**
```json
{
  "timeSlot": "Oct 15: 🌆 Evening (4pm - 7pm PST)" // Optional, the time slot they're checking in for
}
```

**Response:**
```json
{
  "success": true,
  "message": "Checked in successfully",
  "checkInTime": "2023-10-15T14:30:00Z",
  "slackNotificationSent": true
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

### 3. Mentor Check-out

**Endpoint:** `POST /api/mentor/checkin/:event_id/out`

**Description:** Marks a mentor as checked out and sends a Slack notification.

**Authentication:** Requires authenticated user with valid JWT token.

**Request:**
- No request body is required.

**Response:**
```json
{
  "success": true,
  "message": "Checked out successfully",
  "checkInDuration": "2h 15m", // Optional: duration of check-in period
  "slackNotificationSent": true
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

## Database Schema Updates
Use the volunteers collection and just update the record for the mentor

## Slack Integration

For Slack notifications, use the Slack Web API to send messages to the appropriate channels:

1. When a mentor checks in:
   - Send a message to the `#mentors` channel announcing their availability
   - Mention the mentor's specialty areas so teams know what help is available

2. When a mentor checks out:
   - Send a message to the `#mentors` channel noting they are no longer available

### Example Slack Notification (Check-in)
```
:wave: *Mentor Available!*

@Jane Smith has checked in and is available to help teams!

*Expertise:* Software Development, Data Science & Analytics, Cloud Architecture
*Specialties:* AWS, Back-end (Java, Python, Ruby, etc), Data Analysis

Teams needing help in these areas can reach out to Jane directly or find her in the mentor area.
```

### Example Slack Notification (Check-out)
```
:wave: *Mentor Update*

@Jane Smith has checked out and is no longer available.

Thanks for your support, Jane!
```

## Implementation Notes

1. The backend should validate that the user is actually registered as a mentor for the event before allowing check-in/check-out.

2. Only allow one active check-in per mentor per event. If they check in while already checked in, update the existing record.

3. If a mentor forgets to check out, consider implementing an automatic check-out after a certain period (e.g., 8 hours) or at the end of the event day.

4. Store check-in history for reporting purposes (e.g., tracking mentor participation, hours contributed, etc.).

5. Consider implementing rate limiting to prevent abuse of the API.