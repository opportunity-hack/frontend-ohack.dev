/**
 * Guards the analytics-identify dedupe in Navbar.
 *
 * Regression: the effect used to depend on the `user` OBJECT from
 * useAuthInfo(), whose identity changes across renders, so `set()` and the
 * "Login Email Set" event fired dozens of times per visit (70K+ user_identify
 * and 60K Login Email Set hits per 90 days in GA4). It must now fire at most
 * once per email per page session.
 */
import React from "react";
import { render } from "@testing-library/react";

const mockAuth = { isLoggedIn: false, user: null };

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

jest.mock("../../../hooks/use-hearts-summary", () => () => ({
  profile: null,
  hearts: 0,
  tier: null,
  nextTier: null,
  loading: false,
}));

jest.mock("../HeartsStatusMenuItem", () => () => null);

import NavBar from "../Navbar";
import { set, trackEvent, initFacebookPixel } from "../../../lib/ga";

describe("NavBar analytics identify guard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.isLoggedIn = false;
    mockAuth.user = null;
  });

  test("does not identify when logged out", () => {
    render(<NavBar />);
    expect(set).not.toHaveBeenCalled();
    expect(trackEvent).not.toHaveBeenCalledWith(
      expect.objectContaining({ action: "Login Email Set" })
    );
    expect(initFacebookPixel).toHaveBeenCalled();
  });

  test("identifies once per email even when the user object identity changes", () => {
    mockAuth.isLoggedIn = true;
    mockAuth.user = { email: "greg@example.org", userId: "u1" };
    const { rerender } = render(<NavBar />);

    expect(set).toHaveBeenCalledTimes(1);
    expect(set).toHaveBeenCalledWith("greg@example.org");
    expect(trackEvent).toHaveBeenCalledTimes(1);
    expect(trackEvent).toHaveBeenCalledWith({
      action: "Login Email Set",
      params: {},
    });

    // New object, same email — the pre-fix effect re-fired here.
    mockAuth.user = { email: "greg@example.org", userId: "u1" };
    rerender(<NavBar />);
    mockAuth.user = { email: "greg@example.org", userId: "u1", pictureUrl: "x" };
    rerender(<NavBar />);

    expect(set).toHaveBeenCalledTimes(1);
    expect(trackEvent).toHaveBeenCalledTimes(1);
  });

  test("re-identifies when the email actually changes", () => {
    mockAuth.isLoggedIn = true;
    mockAuth.user = { email: "a@example.org" };
    const { rerender } = render(<NavBar />);
    expect(set).toHaveBeenCalledTimes(1);

    mockAuth.user = { email: "b@example.org" };
    rerender(<NavBar />);

    expect(set).toHaveBeenCalledTimes(2);
    expect(set).toHaveBeenLastCalledWith("b@example.org");
    expect(trackEvent).toHaveBeenCalledTimes(2);
  });
});
