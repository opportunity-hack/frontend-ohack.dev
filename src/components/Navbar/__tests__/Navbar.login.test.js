/**
 * The navbar "Log In" button must actually call the SDK's
 * redirectToLoginPage. Oct 2026 regression: the logging wrapper read
 * getLoginPageUrl off the useRedirectFunctions() object (it lives on
 * useHostedPageUrls()), threw, and returned early — the button did nothing
 * on www.ohack.dev and test.ohack.dev. This test runs the REAL wrapper.
 */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

const redirectToLoginPage = jest.fn();
const getLoginPageUrl = jest.fn(() => "https://auth.test/login");

jest.mock("@propelauth/react", () => ({
  useAuthInfo: () => ({ loading: false, isLoggedIn: false, user: null }),
  useLogoutFunction: () => jest.fn(),
  // Mirrors the real SDK: the redirect hook does NOT expose getLoginPageUrl.
  useRedirectFunctions: () => ({
    redirectToLoginPage,
    redirectToSignupPage: jest.fn(),
    redirectToAccountPage: jest.fn(),
  }),
  useHostedPageUrls: () => ({ getLoginPageUrl }),
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

describe("NavBar Log In button", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "info").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("clicking Log In redirects through the SDK with the current URL", () => {
    render(<NavBar />);
    fireEvent.click(screen.getByRole("button", { name: "Log In" }));
    expect(redirectToLoginPage).toHaveBeenCalledTimes(1);
    expect(redirectToLoginPage).toHaveBeenCalledWith({
      postLoginRedirectUrl: window.location.href,
    });
    expect(getLoginPageUrl).toHaveBeenCalledWith({
      postLoginRedirectUrl: window.location.href,
    });
    expect(console.error).not.toHaveBeenCalled();
  });
});
