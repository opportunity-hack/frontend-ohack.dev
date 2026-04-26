# OHack Frontend Development Guidelines

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run postbuild` - Generate sitemap (runs automatically after build)
- `npm run test` - Run Jest unit tests
- `npm run test:e2e` - Run Playwright E2E tests
- `npx eslint src/**/*.js` - Run ESLint on specific files
- `npx prettier --write src/**/*.js` - Format code with Prettier

## Code Style
- Use functional components with React hooks
- Dynamic imports with Next.js for code splitting
- Use Material UI (MUI) components for consistent UI
- Follow React best practices for performance
- Proper error boundaries and fallbacks for dynamic imports
- Organize imports: React, Next.js, libraries, then local imports
- Prefer async/await over promise chains
- Use descriptive variable/function names (camelCase)
- Component file structure: imports, component, exports

## Project Structure
- `/src/pages` - Next.js routes
- `/src/components` - Reusable React components
- `/src/lib` - Utility functions and shared code
- `/public` - Static assets

## Environment
- Node v22.x
- Next.js 16.x
- Material UI for components
- Use nvm for Node Version Management

## Testing
- Don't worry about writing or running tests
- Jest for unit tests
- Playwright for end-to-end tests
- Test files located in `__tests__` folders for components
- E2E tests located in `/src/tests/e2e/`
- Mock implementation examples available in test files

## Core Web Vitals (CLS hygiene)
Patterns that must stay in place to keep Google Search Console CWV green:
- `NavBar` and `Footer` are `ssr: true` in `_app.js`; their loading placeholders in `_app.js` match the rendered heights (NavBar 64px, Footer 760px/560px mobile/desktop). Don't flip them back to `ssr: false`.
- The auth-reactive right side of `Navbar.js` (Log In button ↔ Avatar) must stay inside the fixed-width slot (`minWidth: { xs: 56, md: 140 }`). Adding content there requires keeping both branches the same width.
- `HeartsLeaderboard` reserves `minHeight: { xs: 128, md: 172 }` in both its loading placeholder on `pages/index.js` and in the component's empty state — don't return `null` from it.
- Any new above-the-fold async component on the homepage must reserve space via `minHeight` in its loading fallback. `SimplePlaceholder` (opacity:0 with no height) is not enough.
- Raw `<img>` tags need `width`/`height` attributes. Prefer `next/image` with explicit dimensions.
- Iframes (YouTube, Instagram, Calendar) must be wrapped in an aspect-ratio container (the existing pattern is `paddingBottom: '56.25%'` with `height: 0` + absolutely-positioned iframe) or given a fixed pixel height.
- `initFacebookPixel` in `src/lib/ga/index.js` is idempotent via `pixelInitPromise`. Don't add `ReactPixel.init` calls outside of it.

## Admin Email Compose (`AdminEmailCompose`)
- The component accepts an optional `fixedSubject` prop. When set, the Subject field is read-only and that exact value is sent.
- `ContactSubmissionDetailDialog` passes a subject derived from `submission.inquiryType` matching the backend format in `backend-ohack.dev/api/contact/contact_service.py`: `Contact Us: {inquiry_type_display.lower()} - Opportunity Hack`. The `INQUIRY_TYPE_DISPLAY` map in `ContactSubmissionDetailDialog.js` must stay in sync with the backend's map so admin replies thread with the original confirmation email.

## Pillar Landing Pages
The following SEO pillar pages follow the `hackathon-judge-opportunities.js` pattern (getStaticProps with openGraphData + structuredData arrays, initFacebookPixel in useEffect, trackEvent on button clicks):
- `/coding-for-nonprofits` — `src/pages/coding-for-nonprofits/index.js` — covers the free software development model, 3-step process, project types, FAQ (8 items), FAQPage schema. Internal links from homepage (Button), about page (inline Link), and NonProfitList component (Alert callout).
- `/hackathon-judge-opportunities` — `src/pages/hackathon-judge-opportunities.js`

## Social Media Integration

### Overview
The social media integration system allows admins to post Opportunity Hack news to various social media platforms directly from the admin panel. The system is designed with a generalized architecture that makes it easy to add new social media platforms.

### Architecture
- **Service Layer**: Abstract `SocialMediaService` base class with platform-specific implementations
- **News Service**: Fetches news from `/api/messages/news` endpoint
- **Social Media Manager**: Orchestrates posting to multiple platforms
- **Admin UI**: Located at `/admin/social-media` for managing posts

### Current Platforms
- **Threads**: Fully implemented with Meta's Threads API
- **Twitter/X**: Placeholder for future implementation
- **LinkedIn**: Placeholder for future implementation

### Environment Variables
Configure these in your `.env` file:

```env
# Threads API Configuration
THREADS_ACCESS_TOKEN=your_threads_access_token_here
THREADS_USER_ID=your_threads_user_id_here  
THREADS_USERNAME=opportunityhack
```

### Getting Threads API Credentials
1. Create a Meta Developer account at https://developers.facebook.com/
2. Create a new app and enable the Threads API
3. Generate a long-lived access token for your Threads account
4. Get your Threads user ID from the API
5. Add the credentials to your `.env` file

### Usage
1. Navigate to `/admin/social-media` in the admin panel
2. The system will automatically fetch latest news from the backend
3. Use "Preview Mode" (dry run) to see formatted posts before publishing
4. Configure which platforms to post to in the settings
5. Click "Post to Social Media" to publish (or "Preview Posts" in dry run mode)

### Adding New Platforms
To add a new social media platform:

1. Create a new service class extending `SocialMediaService`:
```javascript
// src/lib/social-media/TwitterService.js
import { SocialMediaService } from './SocialMediaService';

export class TwitterService extends SocialMediaService {
  constructor(credentials) {
    super(credentials);
    this.name = 'Twitter';
    this.characterLimit = 280;
  }
  
  async validateCredentials() {
    // Implement Twitter credential validation
  }
  
  async post(content) {
    // Implement Twitter posting logic
  }
}
```

2. Add the service to the manager in `SocialMediaManager.js`:
```javascript
// In createFromEnvironment method
if (env.TWITTER_API_KEY && env.TWITTER_API_SECRET) {
  const twitterService = new TwitterService({
    apiKey: env.TWITTER_API_KEY,
    apiSecret: env.TWITTER_API_SECRET,
    // ... other credentials
  });
  manager.registerService('twitter', twitterService);
}
```

3. Add environment variables to `.env`
4. Update `SUPPORTED_PLATFORMS` in `src/lib/social-media/index.js`