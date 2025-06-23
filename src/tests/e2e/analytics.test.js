/**
 * End-to-end tests for Google Analytics implementation
 * 
 * These tests verify that Google Analytics events are being properly sent
 * during user interactions.
 * 
 * To run these tests: npm run test:e2e
 */

const { test, expect } = require('@playwright/test');
  
test.describe('Google Analytics Tracking', () => {
  let gaCalls = [];
  
  test.beforeEach(async ({ page }) => {
    // Intercept and track Google Analytics calls
    gaCalls = [];
    
    // Listen for gtag calls
    await page.route('**www.google-analytics.com/g/collect**', async (route) => {
      const url = route.request().url();
      gaCalls.push(url);
      // Collect analytics info but don't block the call
      await route.continue();
    });
    
    // This is needed for some configurations where GA uses analytics.js
    await page.route('**www.google-analytics.com/analytics.js**', async (route) => {
      const url = route.request().url();
      gaCalls.push(url);
      await route.continue();
    });
    
    // Navigate to the homepage
    await page.goto('http://localhost:3000');
    
    // Wait for initial page load
    await page.waitForSelector('.hero-banner', { state: 'visible' });
  });
  
  test('should track pageview events', async ({ page }) => {
    // Verify initial page view was tracked
    expect(gaCalls.length).toBeGreaterThan(0);
    expect(gaCalls.some(url => url.includes('page_view') || url.includes('pageview'))).toBeTruthy();
    
    // Reset tracking calls
    gaCalls = [];
    
    // Navigate to another page
    await page.click('text=All projects you can work on');
    await page.waitForURL('**/nonprofits');
    
    // Verify the new page view was tracked
    expect(gaCalls.some(url => url.includes('page_view') || url.includes('pageview'))).toBeTruthy();
  });
  
  test('should track navigation button clicks', async ({ page }) => {
    // Reset tracking calls
    gaCalls = [];
    
    // Click on a button
    await page.locator('button', { hasText: 'Donate with PayPal' }).click();
    
    // Verify event was tracked - either looking for the donation click event
    // or a navigation event with the button parameter
    expect(gaCalls.some(url => 
      url.includes('donation_click') || 
      url.includes('navigation_click') ||
      url.includes('button_donate')
    )).toBeTruthy();
  });
  
  test('should track blog content interaction', async ({ page }) => {
    // Navigate to blog page
    await page.goto('http://localhost:3000/blog');
    await page.waitForSelector('[data-testid="news-component"]', { state: 'visible' });
    
    // Reset tracking calls
    gaCalls = [];
    
    // Interact with content by searching
    await page.fill('[placeholder="Search blog posts..."]', 'test search');
    await page.waitForTimeout(1000); // Wait for debounce
    
    // Verify search was tracked
    expect(gaCalls.some(url => 
      url.includes('search') || 
      url.includes('content_search')
    )).toBeTruthy();
    
    // Reset tracking calls
    gaCalls = [];
    
    // Click on a tag if available
    const tagChip = await page.locator('.MuiChip-root').first();
    const tagCount = await tagChip.count();
    
    // Skip this test condition if no tags exist
    if (tagCount === 0) {
      test.skip();
      return;
    }
    
    await tagChip.click();
    await page.waitForTimeout(500);
    
    // Verify tag filter was tracked
    expect(gaCalls.some(url => 
      url.includes('filter') || 
      url.includes('content_filter')
    )).toBeTruthy();
  });
  
  test('should track scroll depth', async ({ page }) => {
    // Navigate to a content page
    await page.goto('http://localhost:3000/blog');
    await page.waitForSelector('[data-testid="news-component"]', { state: 'visible' });
    
    // Reset tracking calls
    gaCalls = [];
    
    // Scroll to bottom of page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000); // Wait for events to fire
    
    // Verify scroll depth was tracked
    // Looking for content_scroll, scroll_depth, etc.
    expect(gaCalls.some(url => 
      url.includes('scroll')
    )).toBeTruthy();
  });
  
  test('should track form interactions', async ({ page }) => {
    // Navigate to a form page
    await page.goto('http://localhost:3000/nonprofits/apply');
    await page.waitForSelector('form', { state: 'visible' });
    
    // Reset tracking calls
    gaCalls = [];
    
    // Fill in a form field
    await page.fill('[name="name"]', 'Test User');
    await page.waitForTimeout(1000); // Wait for debounce
    
    // Verify form field interaction was tracked
    expect(gaCalls.some(url => 
      url.includes('form_') || 
      url.includes('field_change')
    )).toBeTruthy();
  });
  });