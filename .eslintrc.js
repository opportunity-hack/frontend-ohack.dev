module.exports = {
  extends: 'next/core-web-vitals',
  rules: {
    'react/no-unescaped-entities': 'off',
  },
  overrides: [
    {
      files: ['src/tests/e2e/**/*.js'],
      rules: {
        'jest/no-conditional-expect': 'off',
        'testing-library/prefer-screen-queries': 'off',
        'testing-library/no-await-sync-query': 'off'
      }
    }
  ]
};