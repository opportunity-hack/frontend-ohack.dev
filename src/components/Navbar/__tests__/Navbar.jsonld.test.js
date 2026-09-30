/**
 * The NavBar used to emit a second Organization JSON-LD block (with a
 * hard-coded 2024 Event) as a React child, so it rendered HTML-escaped and
 * invalid on every page. `_app.js` owns the global Organization; the NavBar
 * must render no structured data at all.
 */
import React from "react";
import { render } from "@testing-library/react";

jest.mock("next/head", () => ({ __esModule: true, default: ({ children }) => children }));

jest.mock("@propelauth/react", () => ({
  useAuthInfo: () => ({ isLoggedIn: false, user: null }),
  useLogoutFunction: () => jest.fn(),
  useRedirectFunctions: () => ({
    redirectToLoginPage: jest.fn(),
    redirectToSignupPage: jest.fn(),
    redirectToAccountPage: jest.fn(),
  }),
}));

jest.mock("../../../lib/ga", () => ({
  trackEvent: jest.fn(),
  initFacebookPixel: jest.fn(),
  set: jest.fn(),
}));

jest.mock("../../../hooks/use-hearts-summary", () => () => ({
  profile: null,
  hearts: 0,
  tier: null,
  nextTier: null,
  loading: false,
}));

jest.mock("../HeartsStatusMenuItem", () => () => null);

import NavBar from "../Navbar";

test("NavBar renders no JSON-LD but keeps the logo preload", () => {
  const { container } = render(<NavBar />);
  expect(container.querySelector('script[type="application/ld+json"]')).toBeNull();
  expect(container.innerHTML).not.toContain("application/ld+json");
  expect(container.querySelector('link[rel="preload"][as="image"]')).not.toBeNull();
});
