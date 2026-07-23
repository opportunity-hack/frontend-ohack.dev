# Email API Endpoint Usage

## Overview

The system now supports two different API endpoints for sending emails, automatically choosing the correct one based on recipient type.

## API Endpoints

### 1. User ID Endpoint (Registered Users)

**Endpoint:** `POST /api/admin/{user.id}/message`

**Used for:** Recipients who have user accounts in the system (have a user ID)

**Request Body:**

```json
{
  "message": "Email content here",
  "subject": "Email Subject",
  "recipient_type": "mentor|judge|volunteer|hacker|sponsor",
  "recipient_id": "user_id_here"
}
```

### 2. Email-Only Endpoint (Non-Registered Recipients)

**Endpoint:** `POST /api/admin/email/send`

**Used for:** Recipients who only have email addresses (no user account)

**Request Body:**

```json
{
  "email": "user@example.com",
  "message": "Email content here",
  "subject": "Email Subject",
  "recipient_type": "mentor|judge|volunteer|hacker|sponsor",
  "name": "John Doe"
}
```

## Automatic Detection Logic

The system automatically detects which endpoint to use based on these criteria:

```javascript
const isEmailOnlyRecipient =
  !user.id || user.source === "custom" || user.source === "csv";
```

**Email-only endpoint used when:**

- User has no ID (`!user.id`)
- User source is 'custom' (manually added email)
- User source is 'csv' (imported from CSV file)

**User ID endpoint used when:**

- User has a valid ID from the database
- User was fetched from Slack/volunteer system

## Updated Components

### BatchEmailService (`src/lib/batchEmailService.js`)

- **Enhanced:** `sendEmailToUser()` method now detects recipient type
- **Added:** Endpoint tracking for debugging (`result.endpoint`)
- **Improved:** Error messages include endpoint context
- **Performance:** `sendBatchEmails()` uses bounded parallelism (`MAX_PARALLEL_SENDS = 8`) instead of sending every request strictly one-by-one

### VolunteerCommunication (`src/components/admin/VolunteerCommunication.js`)

- **Enhanced:** `handleSendMessage()` method now uses dual-endpoint logic
- **Maintained:** All existing functionality and UI behavior

## Benefits

1. **Flexibility:** Can now send emails to both registered users and email-only recipients
2. **Automatic:** No manual configuration needed - system detects automatically
3. **Debugging:** Endpoint information included in results for troubleshooting
4. **Backward Compatible:** Existing registered user email functionality unchanged

## Usage in Social Media Management

When using `/admin/social-media`:

1. **Slack Users:** Will use user ID endpoint (registered users)
2. **Custom Email Addresses:** Will use email-only endpoint (entered manually)
3. **CSV Imported Emails:** Will use email-only endpoint (imported from file)
4. **Mixed Recipients:** System handles both types automatically in same batch

## Error Handling

Enhanced error messages now include endpoint context:

- `"Error message (via user-ID endpoint)"`
- `"Error message (via email-only endpoint)"`

This helps with debugging API issues and understanding which type of recipient failed.
