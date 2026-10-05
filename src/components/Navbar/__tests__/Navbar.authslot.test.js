/**
 * Guards the navbar auth slot against the signed-in login flash.
 *
 * Regression: `useAuthInfo()` returns `{ loading: true, isLoggedIn: undefined }`
 * while the PropelAuth client validates the session. The slot rendered the
 * logged-out "Log In" button for that window because `undefined` is falsy, so
 * signed-in users saw a login flash on every navigation until the client
 * resolved. While `loading` the slot must render a neutral skeleton instead.
 */
import React from "react";
import { render, screen } from "@testing-library/react";

const mockAuth = { loading: false, isLoggedIn: false, user: null };

jest.mock("@propelauth/react", () => ({
  useAuthInfo: () => mockAuth,
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

jest.mock("../../../lib/authRedirectLogging", () => ({
  redirectToLoginPageWithLogging: jest.fn(),
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

describe("NavBar auth slot", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.loading = false;
    mockAuth.isLoggedIn = false;
    mockAuth.user = null;
  });

  test("renders a skeleton (not the Log In button) while auth is loading", () => {
    mockAuth.loading = true;
    mockAuth.isLoggedIn = undefined;
    render(<NavBar />);
    expect(
      screen.getByLabelText("Checking sign-in status")
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Log In" })
    ).not.toBeInTheDocument();
  });

  test("renders the Log In button once loading resolves logged-out", () => {
    mockAuth.loading = false;
    mockAuth.isLoggedIn = false;
    render(<NavBar />);
    expect(
      screen.getByRole("button", { name: "Log In" })
    ).toBeInTheDocument();
  });

  test("renders the avatar once loading resolves logged-in", () => {
    mockAuth.loading = false;
    mockAuth.isLoggedIn = true;
    mockAuth.user = { firstName: "Greg", pictureUrl: "" };
    render(<NavBar />);
    expect(
      screen.queryByRole("button", { name: "Log In" })
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("Open settings")).toBeInTheDocument();
  });
});
