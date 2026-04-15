# Opportunity Hack Frontend Development

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively
- **Bootstrap and develop the repository**:
  - Install Node.js v20.x (use `.nvmrc` which specifies 20.10.0)
  - `npm install` - takes ~60 seconds. NEVER CANCEL. Set timeout to 120+ seconds.
  - Copy `.env` file from `env_template` and configure required variables (see Environment Setup below)
- **Development workflow**:
  - `npm run dev` - starts development server on port 3000 or 3001 if 3000 occupied (~2 seconds startup)
  - `npm run test` - runs Jest unit tests (4 tests pass in ~3 seconds) 
  - `npx eslint src/**/*.js` - runs ESLint linting (~3 seconds)
  - `npx prettier --write src/**/*.js` - formats code with Prettier (~2 seconds)
- **Production build**:
  - `npm run build` - DOES NOT WORK in development environment due to static generation requiring live API access during build time
  - Pages with `getStaticProps` fail during build when API is not accessible
  - Build succeeds in production environment with proper API connectivity

## Environment Setup
Create `.env` file in repository root with these REQUIRED variables:
```bash
# Backend API servers (REQUIRED)
NEXT_PUBLIC_API_SERVER_URL=https://api.ohack.dev
NEXT_PUBLIC_API_NODEJS_SERVER_URL=https://api.ohack.dev

# PropelAuth authentication (REQUIRED) 
NEXT_PUBLIC_REACT_APP_AUTH_URL=https://auth.ohack.dev

# Additional required variables
NEXT_PUBLIC_SLACK_SIGNUP_LINK=https://slack.ohack.dev
NEXT_PUBLIC_GOOGLE_CAPTCHA_SITE_KEY=your-recaptcha-key

# Optional analytics (can be set to DISABLED)
NEXT_PUBLIC_GOOGLE_ANALYTICS=DISABLED
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=DISABLED
```

Without these variables, the application will fail to start with "Missing required environment variables" error.

## Validation
- **Development server validation**: 
  - Home page (`/`) loads successfully - test with `curl -s -o /dev/null -w "%{http_code}" http://localhost:3001`
  - Projects page (`/projects`) loads with API fetch warnings (expected in dev) 
  - Volunteer page (`/volunteer`) loads successfully
  - Nonprofits page (`/nonprofits`) may return 500 due to static generation requirements (expected in dev)
- **ALWAYS run through complete user scenarios** after making changes:
  - Navigate to home page and verify content loads
  - Test navigation between main sections (projects, volunteer, about)
  - Verify Material UI components render properly
- **Code quality validation**:
  - ALWAYS run `npx eslint src/**/*.js` before committing (warnings are acceptable, errors are not)
  - ALWAYS run `npx prettier --write src/**/*.js` to format code
- **Testing validation**:
  - Jest unit tests: `npm run test` (should complete in under 10 seconds)
  - Playwright E2E tests: Installation often fails in sandboxed environments - document as limitation

## Technology Stack & Architecture
- **Frontend**: Next.js 14.x with React 18, Material UI (MUI) components
- **Authentication**: PropelAuth (requires `NEXT_PUBLIC_REACT_APP_AUTH_URL`)
- **Runtime**: Node.js v20.x (specified in `.nvmrc` and `package.json`)
- **Testing**: Jest for unit tests, Playwright for E2E (may not work in all environments)
- **Deployment**: Vercel with automatic deployments (main → ohack.dev, develop → test.ohack.dev)

## Project Structure
```
/src/pages/          - Next.js routes and pages
/src/components/     - Reusable React components
/src/lib/            - Utility functions and shared code
    /social-media/   - Social media integration system
    /ga/             - Google Analytics utilities
/src/hooks/          - Custom React hooks
/src/context/        - React context providers
/src/styles/         - Global styles and theming
/src/data/           - Static data and mock files
/src/tests/e2e/      - Playwright E2E tests (may not work in all environments)
/public/             - Static assets
```

## Key Components & Functionality
- **Social Media Integration**: Located in `/src/lib/social-media/` with support for Threads, Twitter/X, LinkedIn
- **Authentication**: PropelAuth integration across admin and user areas
- **Admin Panel**: Located at `/admin/*` routes with team management, judging, and content management
- **Hackathon Management**: Core functionality for organizing and running hackathons
- **Nonprofit Portal**: Project submission and management for nonprofit organizations

## Common Issues & Solutions
- **"Missing required environment variables"**: Copy and configure `.env` file from `env_template`
- **"Unable to initialize auth client"**: Set `NEXT_PUBLIC_REACT_APP_AUTH_URL` in `.env`
- **Build failures**: Normal in development due to static generation requiring API access
- **Port conflicts**: Dev server automatically uses port 3001 if 3000 is occupied
- **API fetch errors**: Expected in development when external API is not accessible
- **Playwright installation failures**: Common in sandboxed environments, document as limitation

## Performance & Timing Expectations
- **NEVER CANCEL**: Always set appropriate timeouts and wait for completion
- `npm install`: ~60 seconds - set timeout to 120+ seconds
- `npm run dev`: ~2 seconds startup - set timeout to 30+ seconds  
- `npm run test`: ~3 seconds - set timeout to 30+ seconds
- `npm run build`: Fails in development environments, succeeds in production - set timeout to 300+ seconds when API is available
- ESLint: ~3 seconds - set timeout to 60+ seconds
- Prettier: ~2 seconds - set timeout to 30+ seconds

## Code Style & Standards
- Use functional components with React hooks
- Dynamic imports with Next.js for code splitting  
- Material UI (MUI) components for consistent UI
- Organize imports: React, Next.js, libraries, then local imports
- Prefer async/await over promise chains
- Use descriptive variable/function names (camelCase)
- Component file structure: imports, component, exports

## Development Workflow
1. Install dependencies with `npm install`
2. Configure `.env` file with required variables
3. Start development server with `npm run dev`
4. Make changes and test locally
5. Run code quality checks (`eslint`, `prettier`)
6. Run unit tests with `npm run test`
7. Manual validation through browser testing
8. Commit changes (build validation happens in CI/CD)

Always reference these instructions and validate your environment setup before starting development work.