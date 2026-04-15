# Google Login Configuration via PropelAuth

This document explains how to configure Google OAuth login for the Opportunity Hack platform using PropelAuth.

## Overview

The frontend code now supports both Slack and Google authentication via PropelAuth. Users can log in using either their Slack account (as before) or their Google account (new feature).

## Frontend Implementation

The frontend changes are minimal and consist of:

1. **LoginOrRegister2.js** (Primary Component)
   - Added `handleGoogleLoginClick()` function that redirects to `${authUrl}/google/login`
   - Updated UI to show both "Continue with Google" and "Continue with Slack" buttons
   - Added Google Analytics tracking for Google login events

2. **LoginOrRegister.js** (Legacy Component)
   - Same changes as LoginOrRegister2.js for consistency

## PropelAuth Configuration (Required)

To enable Google login, you **must** configure Google as an authentication provider in the PropelAuth dashboard. The frontend code alone is not sufficient.

### Steps to Configure Google OAuth in PropelAuth:

1. **Log in to PropelAuth Dashboard**
   - Go to [https://auth.propelauth.com/](https://auth.propelauth.com/)
   - Sign in with your Opportunity Hack PropelAuth admin account

2. **Navigate to Authentication Settings**
   - In the left sidebar, go to **Configuration** → **Authentication**
   - Look for the **Social Login Providers** section

3. **Enable Google OAuth**
   - Click **Add Provider** or **Configure** next to Google
   - You'll need to provide:
     - **Google Client ID**: Obtain from Google Cloud Console
     - **Google Client Secret**: Obtain from Google Cloud Console
   
4. **Configure Google Cloud Console** (if not already done)
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or use existing one
   - Enable Google+ API or Google Identity services
   - Create OAuth 2.0 credentials:
     - Application type: Web application
     - Authorized redirect URIs: Add PropelAuth's callback URL
       - Format: `https://auth.ohack.dev/google/callback`
       - PropelAuth will provide the exact URL in their dashboard
   - Copy the Client ID and Client Secret to PropelAuth

5. **Configure Allowed Domains** (Optional but Recommended)
   - In PropelAuth, you can restrict which Google domains can sign in
   - Leave unrestricted for public access, or limit to specific domains

6. **Test the Configuration**
   - Go to [https://test.ohack.dev/signup2](https://test.ohack.dev/signup2) (test environment)
   - Click "Continue with Google"
   - Verify that the Google OAuth flow works correctly
   - Check that user profile data is captured properly

7. **Deploy to Production**
   - Once tested, the same configuration applies to production
   - Visit [https://ohack.dev/signup2](https://ohack.dev/signup2) to verify

## User Experience

Users will see two login options:

1. **Continue with Google** - Quick login for users with Google accounts
2. **Continue with Slack** - Existing login method for Slack workspace members

Both options integrate seamlessly with PropelAuth and provide the same user experience after authentication.

## Analytics Tracking

The implementation includes Google Analytics event tracking:
- `login_google` - Fired when user clicks "Continue with Google"
- `login_slack` - Fired when user clicks "Continue with Slack"

## Security Considerations

- PropelAuth handles all OAuth security including token management, CSRF protection, and secure redirects
- No sensitive credentials are stored in the frontend code
- All authentication flows use HTTPS
- Google OAuth follows industry best practices for security

## Troubleshooting

### "Google login is not enabled" error
- Verify Google OAuth is configured in PropelAuth dashboard
- Check that Google Client ID and Secret are correctly entered
- Ensure authorized redirect URIs include PropelAuth's callback URL

### Users can't complete Google login
- Verify the Google Cloud Console project is properly configured
- Check that OAuth consent screen is properly set up
- Ensure user's Google account email is not restricted

### Frontend shows Google button but login fails
- Check browser console for JavaScript errors
- Verify `NEXT_PUBLIC_REACT_APP_AUTH_URL` is set correctly in `.env`
- Ensure PropelAuth service is responding (check status page)

## Additional Resources

- [PropelAuth Documentation](https://docs.propelauth.com/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Opportunity Hack Development Setup](./DevSetup.md)
