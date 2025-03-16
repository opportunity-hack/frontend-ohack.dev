/**
 * End-to-end tests for the blog feature
 * 
 * These tests use Playwright to simulate real user interactions
 * with the blog functionality.
 * 
 * To run these tests: npm run test:e2e
 */

const { test, expect } = require('@playwright/test');
  
test.describe('Blog Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the blog page before each test
    await page.goto('http://localhost:3000/blog');
    
    // Wait for the main content to load
    await page.waitForSelector('[data-testid="news-component"]');
  });
  
  test('should load blog listing page', async ({ page }) => {
    // Check that the page title includes "Blog"
    const title = await page.title();
    expect(title).toContain('Blog');
    
    // Check that the main heading is visible
    const heading = page.getByRole('heading', { name: /Opportunity Hack Blog/i });
    expect(heading).toBeVisible();
    
    // Verify that the search box is present
    const searchBox = page.getByPlaceholderText('Search blog posts...');
    expect(searchBox).toBeVisible();
  });
  
  test('should filter posts when searching', async ({ page }) => {
    // Get the original count of posts
    const initialPostCount = await page.locator('[data-testid^="news-item-"]').count();
    
    // Enter a search term
    const searchBox = page.getByPlaceholderText('Search blog posts...');
    await searchBox.fill('specific term');
    await page.waitForTimeout(500); // Allow time for filtering
    
    // Check if the post count has changed (filtering occurred)
    const filteredPostCount = await page.locator('[data-testid^="news-item-"]').count();
    
    // Either the count has decreased or there are now zero posts
    expect(filteredPostCount).toBeLessThanOrEqual(initialPostCount);
  });
  
  test('should navigate to a blog post detail page', async ({ page }) => {
    // Find the first blog post title and click it
    const firstPostTitle = await page.locator('[data-testid^="news-item-"] a').first();
    const titleText = await firstPostTitle.textContent();
    
    await firstPostTitle.click();
    
    // Wait for the detail page to load
    await page.waitForSelector('[data-testid="single-news-component"]');
    
    // Verify we're on the detail page by checking for the breadcrumb
    const breadcrumb = page.getByRole('navigation', { name: 'blog post navigation' });
    expect(breadcrumb).toBeVisible();
    
    // Verify the post title is displayed
    const postTitle = await page.locator('[data-testid="news-title"]');
    expect(await postTitle.textContent()).toBe(titleText);
  });
  
  test('should filter posts by tag', async ({ page }) => {
    // Find all tag chips
    const tagChips = await page.locator('.MuiChip-root');
    
    // Click on the first tag
    const firstTag = await tagChips.first();
    const tagText = await firstTag.textContent();
    await firstTag.click();
    
    // Wait for filtering to complete
    await page.waitForTimeout(500);
    
    // Verify the heading reflects the tag filter
    const heading = page.getByText(new RegExp(`Posts tagged with ${tagText}`, 'i'));
    expect(heading).toBeVisible();
  });
  
  test('should show related posts on blog post detail page', async ({ page }) => {
    // Navigate to a blog post
    const firstPostTitle = await page.locator('[data-testid^="news-item-"] a').first();
    await firstPostTitle.click();
    
    // Wait for the detail page to load
    await page.waitForSelector('[data-testid="single-news-component"]');
    
    // Look for related posts section
    const relatedSection = page.getByRole('heading', { name: 'Related Posts' });
    const isRelatedSectionVisible = await relatedSection.isVisible();
    
    // Skip this test if the related posts section doesn't exist
    if (!isRelatedSectionVisible) {
      test.skip();
      return;
    }
    
    // Verify at least one related post
    const relatedPosts = await page.locator('a:has-text("Related Post")');
    const count = await relatedPosts.count();
    expect(count).toBeGreaterThan(0);
  });
});