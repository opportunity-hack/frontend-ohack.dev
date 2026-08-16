// Minimal flat config — currently exists to enforce ONE contract:
// font families come from src/styles/fonts.js (see CLAUDE.md "Typography
// system"). next/font renames loaded families to hashed names, so a hardcoded
// 'Hanken Grotesk' / 'Fraunces' literal silently renders a fallback font.
// Run with: npm run lint

export default [
  {
    // Global ignores (own object = applies to everything).
    ignores: [
      "src/styles/fonts.js", // the single place family names may appear
      "src/pages/12-years-of-social-good/**", // bespoke report, loads its own fonts
      "src/tests/**",
      "**/__tests__/**",
    ],
  },
  {
    files: ["src/**/*.{js,jsx,mjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    linterOptions: {
      // Old inline eslint-disable comments reference plugin rules (react-hooks,
      // @next/next) this minimal config doesn't load — don't error on them.
      noInlineConfig: true,
      reportUnusedDisableDirectives: "off",
    },
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "Literal[value=/Fraunces|Hanken Grotesk|Montserrat|Space Grotesk/]",
          message:
            "Font families are tokens: import FONT_BODY / FONT_DISPLAY from src/styles/fonts.js instead of hardcoding family names (hardcoded names don't match the next/font self-hosted fonts).",
        },
      ],
    },
  },
];
