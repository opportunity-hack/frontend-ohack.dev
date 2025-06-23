# Opportunity Hack Application Forms API Design

This document outlines the specifications for developing a Python backend API to support the Opportunity Hack application forms for mentors, sponsors, and judges.

## Table of Contents
1. [Overview](#overview)
2. [Common API Structure](#common-api-structure)
3. [Mentor Application API](#mentor-application-api)
4. [Sponsor Application API](#sponsor-application-api)
5. [Judge Application API](#judge-application-api)
6. [Database Schema](#database-schema)
7. [Authentication & Authorization](#authentication--authorization)
8. [Error Handling](#error-handling)
9. [Implementation Checklist](#implementation-checklist)

## Overview

The backend API will serve three main application forms:
- Mentor applications
- Sponsor applications
- Judge applications

Each application type requires endpoints for:
- Submitting new applications
- Updating existing applications
- Retrieving previously submitted applications
- Admin operations (listing, selecting, and managing applications)

The API should be implemented using Python with a modern web framework (such as FastAPI or Flask) and should integrate with the existing authorization system (PropelAuth).

## Common API Structure

### Base URL
All application APIs should follow this structure:
```
/api/{role}/application/{event_id}/{action}
```

Where:
- `{role}` is one of: `mentor`, `sponsor`, or `judge`
- `{event_id}` is the hackathon event identifier
- `{action}` is one of: `submit`, `update`, `get`

### Authentication
All endpoints must require authentication via Bearer tokens from PropelAuth.

### Response Format
All responses should follow this structure:
```json
{
  "success": true|false,
  "message": "Human-readable message",
  "data": {} // Optional response data object
}
```

## Mentor Application API

### Endpoints

#### 1. Submit Mentor Application
- **URL:** `/api/mentor/application/{event_id}/submit`
- **Method:** `POST`
- **Auth Required:** Yes
- **Request Body:**
```json
{
  "timestamp": "ISO-8601 timestamp",
  "email": "string",
  "name": "string",
  "pronouns": "string",
  "company": "string",
  "bio": "string",
  "picture": "string URL",
  "linkedin": "string URL",
  "inPerson": "string",
  "expertise": "string (comma-separated)",
  "softwareEngineeringSpecifics": "string (comma-separated)",
  "availability": "string (comma-separated)",
  "participationCount": "string",
  "country": "string",
  "state": "string",
  "agreedToCodeOfConduct": "boolean",
  "additionalInfo": "string",
  "shirtSize": "string",
  "linkedinProfile": "string URL",
  "shortBio": "string",
  "photoUrl": "string URL",
  "volunteer_type": "mentor",
  "isInPerson": "boolean",
  "type": "mentors",
  "slack_user_id": "string (optional)"
}
```

#### 2. Update Mentor Application
- **URL:** `/api/mentor/application/{event_id}/update`
- **Method:** `POST`
- **Auth Required:** Yes
- **Request Body:** Same as submit

#### 3. Get Mentor Application
- **URL:** `/api/mentor/application/{event_id}/get`
- **Method:** `GET`
- **Auth Required:** Yes
- **Response:** Returns the user's previously submitted application if it exists

#### 4. Admin: List Mentor Applications
- **URL:** `/api/admin/mentors/{event_id}`
- **Method:** `GET`
- **Auth Required:** Yes (Admin role)
- **Query Parameters:**
  - `page`: Page number (default: 1)
  - `limit`: Results per page (default: 20)
  - `selected`: Filter by selection status (optional)

## Sponsor Application API

### Endpoints

#### 1. Submit Sponsor Application
- **URL:** `/api/sponsor/application/{event_id}/submit`
- **Method:** `POST`
- **Auth Required:** Yes
- **Request Body:**
```json
{
  "timestamp": "ISO-8601 timestamp",
  "email": "string",
  "company": "string",
  "companyName": "string",
  "useLogo": "string",
  "phoneNumber": "string",
  "sponsorshipTypes": "string",
  "otherInvolvement": "string",
  "volunteerType": "string (comma-separated)",
  "volunteerCount": "string|number",
  "volunteerHours": "string|number",
  "name": "string",
  "title": "string",
  "preferredContact": "string",
  "howHeard": "string",
  "photoUrl": "string URL",
  "logoUrl": "string URL",
  "type": "sponsors",
  "volunteer_type": "sponsor",
  "isSelected": "boolean",
  "event_id": "string",
  "slack_user_id": "string (optional)",
  "artifacts": "object (optional)"
}
```

#### 2. Update Sponsor Application
- **URL:** `/api/sponsor/application/{event_id}/update`
- **Method:** `POST`
- **Auth Required:** Yes
- **Request Body:** Same as submit

#### 3. Get Sponsor Application
- **URL:** `/api/sponsor/application/{event_id}/get`
- **Method:** `GET`
- **Auth Required:** Yes
- **Response:** Returns the user's previously submitted application if it exists

#### 4. Admin: List Sponsor Applications
- **URL:** `/api/admin/sponsors/{event_id}`
- **Method:** `GET`
- **Auth Required:** Yes (Admin role)
- **Query Parameters:**
  - `page`: Page number (default: 1)
  - `limit`: Results per page (default: 20)
  - `selected`: Filter by selection status (optional)

## Judge Application API

### Endpoints

#### 1. Submit Judge Application
- **URL:** `/api/judge/application/{event_id}/submit`
- **Method:** `POST`
- **Auth Required:** Yes
- **Request Body:**
```json
{
  "timestamp": "ISO-8601 timestamp",
  "email": "string",
  "helpedBefore": "string",
  "hasHelpedBefore": "string (alternative field name)",
  "name": "string",
  "title": "string",
  "biography": "string",
  "shortBiography": "string",
  "whyJudge": "string",
  "availability": "string",
  "canAttendJudging": "string",
  "inPerson": "string",
  "additionalInfo": "string",
  "companyName": "string",
  "background": "string (comma-separated)",
  "backgroundAreas": "string (comma-separated)",
  "participationCount": "string",
  "agreedToCodeOfConduct": "boolean",
  "linkedinProfile": "string",
  "shortBio": "string",
  "photoUrl": "string URL",
  "pronouns": "string",
  "country": "string",
  "state": "string",
  "volunteer_type": "judge",
  "isInPerson": "boolean",
  "isSelected": "boolean",
  "type": "judges",
  "event_id": "string",
  "slack_user_id": "string (optional)",
  "artifacts": "object (optional)"
}
```

#### 2. Update Judge Application
- **URL:** `/api/judge/application/{event_id}/update`
- **Method:** `POST`
- **Auth Required:** Yes
- **Request Body:** Same as submit

#### 3. Get Judge Application
- **URL:** `/api/judge/application/{event_id}/get`
- **Method:** `GET`
- **Auth Required:** Yes
- **Response:** Returns the user's previously submitted application if it exists

#### 4. Admin: List Judge Applications
- **URL:** `/api/admin/judges/{event_id}`
- **Method:** `GET`
- **Auth Required:** Yes (Admin role)
- **Query Parameters:**
  - `page`: Page number (default: 1)
  - `limit`: Results per page (default: 20)
  - `selected`: Filter by selection status (optional)

## Database Schema

### Volunteers Collection (Common for all application types)
```python
{
  "_id": "ObjectId",
  "id": "string", # Optional secondary ID for backward compatibility
  "user_id": "string", # PropelAuth user ID
  "event_id": "string",
  "timestamp": "datetime",
  "email": "string",
  "name": "string",
  "type": "string", # "mentors", "sponsors", or "judges"
  "volunteer_type": "string", # "mentor", "sponsor", or "judge"
  "isSelected": "boolean",
  "slack_user_id": "string", # Optional Slack user ID for integrations
  
  # Common fields
  "photoUrl": "string",
  "shortBio": "string",
  
  # Tracking and audit fields
  "created_by": "string", # User who created the record
  "created_timestamp": "datetime", # When the record was created
  "updated_by": "string", # User who last updated the record
  "updated_timestamp": "datetime", # When the record was last updated
  
  # Artifacts and references
  "artifacts": "object", # Optional JSON object for storing related artifacts
  
  # Type-specific fields stored as subdocuments
  "mentor_info": { # Only for mentors
    "pronouns": "string",
    "company": "string",
    "expertise": "string",
    "softwareEngineeringSpecifics": "string",
    "availability": "string",
    "participationCount": "string",
    "country": "string",
    "state": "string",
    "isInPerson": "boolean",
    "shirtSize": "string",
    "linkedinProfile": "string",
    "additionalInfo": "string",
  },
  
  "sponsor_info": { # Only for sponsors
    "company": "string",
    "companyName": "string",
    "useLogo": "string",
    "phoneNumber": "string",
    "sponsorshipTypes": "string",
    "otherInvolvement": "string",
    "volunteerType": "string",
    "volunteerCount": "number",
    "volunteerHours": "number",
    "title": "string",
    "preferredContact": "string",
    "howHeard": "string",
    "logoUrl": "string"
  },
  
  "judge_info": { # Only for judges
    "helpedBefore": "string", # Can also be stored as hasHelpedBefore for compatibility
    "title": "string",
    "biography": "string",
    "shortBiography": "string", # Alternative field name for biography
    "whyJudge": "string",
    "availability": "string",
    "canAttendJudging": "string",
    "inPerson": "string",
    "additionalInfo": "string",
    "companyName": "string",
    "background": "string",
    "participationCount": "string",
    "pronouns": "string",
    "country": "string",
    "state": "string",
    "isInPerson": "boolean"
  },
  
  "agreedToCodeOfConduct": "boolean",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

## Authentication & Authorization

### Authentication
- Use PropelAuth for authentication
- All API endpoints must verify the Bearer token
- Extract user_id from the authenticated token

### Authorization
- Admin endpoints should check for admin role
- Regular users should only access their own application data
- Implement middleware to check permissions before handling requests

## Error Handling

Implement consistent error handling throughout the API:

```python
def error_response(status_code, message):
    return {
        "success": False,
        "message": message,
        "status_code": status_code
    }, status_code
```

Common error cases to handle:
- 400: Bad Request (invalid parameters)
- 401: Unauthorized (missing or invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (resource doesn't exist)
- 409: Conflict (duplicate submission)
- 500: Internal Server Error

## Implementation Checklist

1. [ ] Set up Python project structure
2. [ ] Configure database connection (MongoDB recommended)
3. [ ] Implement PropelAuth integration
4. [ ] Create database models
5. [ ] Implement mentor application endpoints
6. [ ] Implement sponsor application endpoints
7. [ ] Implement judge application endpoints
8. [ ] Implement admin endpoints
9. [ ] Add validation for all input fields
10. [ ] Implement error handling
11. [ ] Add logging
12. [ ] Write tests
13. [ ] Document API endpoints
14. [ ] Deploy and test with frontend

## API Implementation Notes

1. Store form data with minimal transformation to maintain compatibility with frontend expectations
2. Implement proper data validation for each field
3. Support both creation and updating of applications
4. Ensure that users can only update their own applications
5. Implement admin views for reviewing and selecting applicants
6. Store image/logo URLs rather than the files themselves (files should be uploaded to a CDN)
7. Add appropriate logging and monitoring
8. Ensure CORS is properly configured
9. Include tracking fields (created_by, updated_by, created_timestamp, updated_timestamp) for audit purposes
10. Support alternative field names for compatibility with existing data (e.g., hasHelpedBefore vs helpedBefore)
11. Consider implementing an API version strategy for future changes