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
- Node v20.x
- Next.js 14.x
- Material UI for components

## Testing
- Don't worry about writing or running tests
- Jest for unit tests
- Playwright for end-to-end tests
- Test files located in `__tests__` folders for components
- E2E tests located in `/src/tests/e2e/`
- Mock implementation examples available in test files