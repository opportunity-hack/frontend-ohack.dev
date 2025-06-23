const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/src/tests/e2e/',
  ],
  moduleNameMapper: {
    // Handle module aliases (if you configured them in Next.js)
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/pages/(.*)$': '<rootDir>/src/pages/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/_*.{js,jsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    }
  },
  // Handle ESM modules - transforms node_modules except those that are pure ESM
  transformIgnorePatterns: [
    '/node_modules/(?!react-markdown|rehype-raw|rehype-sanitize|hast-util-sanitize|estree-util-value-to-estree|remark-rehype|micromark|mdast-util-from-markdown|micromark-extension-gfm|mdast-util-gfm|decode-named-character-reference|@uiw/react-md-editor|mdast-util-to-string|unist-util-stringify-position|vfile-message|remark-parse|unified|bail|trough|vfile|unist-util-visit-parents|unist-util-stringify-position|mdast-util-to-string|micromark-util-combine-extensions|micromark-util-chunked|micromark-util-resolve-all|remark-parse|micromark-extension-gfm|micromark-extension-gfm-autolink-literal|micromark-extension-gfm-footnote|micromark-extension-gfm-strikethrough|micromark-extension-gfm-table|micromark-extension-gfm-tagfilter|micromark-extension-gfm-task-list-item|mdast-util-gfm|mdast-util-gfm-autolink-literal|mdast-util-gfm-footnote|mdast-util-gfm-strikethrough|mdast-util-gfm-table|mdast-util-gfm-task-list-item|react-facebook-pixel)/'
  ]
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);