# Privacy Toggle Implementation

This document describes how the privacy toggle functionality works for user profiles.

## Overview

The privacy toggle feature allows users to control the visibility of their profile information. Each section of the profile can be set to either "public" or "private".

## Architecture

### Components

1. **`usePrivacySettings` Hook** (`src/hooks/use-privacy-settings.js`)
   - Manages privacy state across components
   - Handles API calls for fetching and updating privacy settings
   - Provides default privacy settings if none exist
   - Uses debouncing and error handling

2. **`PrivacyToggle` Component** (`src/components/PrivacyToggle/PrivacyToggle.js`)
   - Reusable UI component for privacy switches
   - Consistent styling across all toggles
   - Supports custom labels and disabled states

### Integration Points

- **`feedback-lite.js`**: Updated to use the new privacy system for "what" and "how" sections
- **`Profile.js`**: Added privacy toggles to all required sections

## Privacy Fields

The following profile fields support privacy controls:

- `github_username` - GitHub username visibility
- `current_role` - Current role/position visibility 
- `current_company` - Company information visibility
- `why_are_you_here` - Why joining OHack text visibility
- `badges` - Badge collection visibility
- `feedback` - Feedback section visibility
- `what` - Skills/achievements visibility
- `how` - Process/methodology visibility
- `hackathon_history` - Hackathon participation history visibility

## API Integration

### GET `/api/users/profile/privacy`
Retrieves current privacy settings for the authenticated user.

**Response Format:**
```json
{
  "github_username": "public",
  "current_role": "public",
  "current_company": "public",
  "why_are_you_here": "public",
  "badges": "private",
  "feedback": "public",
  "what": "public", 
  "how": "private",
  "hackathon_history": "public",
  "last_updated": "2024-08-20 10:00:00"
}
```

### PATCH `/api/users/profile/privacy`
Updates a specific privacy setting.

**Request Format:**
```json
{
  "current_role": "private"
}
```

## Usage

### In Components

```jsx
import usePrivacySettings from '../hooks/use-privacy-settings';
import PrivacyToggle from '../components/PrivacyToggle/PrivacyToggle';

function MyComponent() {
  const { privacySettings, togglePrivacySetting } = usePrivacySettings();
  
  return (
    <PrivacyToggle
      field="current_role"
      isPrivate={privacySettings.current_role === 'private'}
      onToggle={togglePrivacySetting}
    />
  );
}
```

### Error Handling

The privacy system gracefully handles:
- Network failures (falls back to defaults)
- Authentication issues (waits for user login)
- Missing backend endpoints (uses defaults)
- Concurrent updates (optimistic updates with rollback)

## Testing

Tests are included for:
- Privacy settings hook functionality
- Privacy toggle component behavior
- Integration with existing profile components

Run tests with: `npm run test`