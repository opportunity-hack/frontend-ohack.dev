# End-to-End Testing with Playwright

This directory contains configuration and test files for end-to-end testing using Playwright.

## Setup

1. Install Playwright dependencies:
   ```
   npm install
   npx playwright install
   OR npx playwright install --with-deps chromium
   ```

2. Run the tests:
   ```
   npm run test:e2e
   ```

## Test Structure

End-to-end tests are located in `/src/tests/e2e/`.

- `blog.test.js`: Tests for blog page functionality
- `analytics.test.js`: Tests for Google Analytics tracking

## Viewing Test Reports

After running tests, view the HTML report with:
```
npx playwright show-report
```

## Writing New Tests

Create new test files in `/src/tests/e2e/` following the same structure as existing tests.

Example template:
```javascript
const { test, expect } = require('@playwright/test');

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup code
    await page.goto('http://localhost:3000/path');
  });
  
  test('should do something', async ({ page }) => {
    // Test code
  });
});
```