/**
 * EventSurvey × auth (Class C, docs/plans/reliability-bug-classes-2026-11.md).
 * The context fetch used to key on the raw token: it ran anonymously while
 * PropelAuth resolved (a selected volunteer briefly got the nonprofit-only
 * form) and re-ran — spinner replacing the form — on every refocus rotation.
 */
import React from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

jest.mock("next/router", () => ({
  useRouter: () => ({ query: { event_id: "fall-2026" } }),
}));

const USER = { userId: "propel-1" };
let mockAuth;
jest.mock("@propelauth/react", () => ({
  useAuthInfo: () => mockAuth,
}));
jest.mock("../../../hooks/use-recaptcha", () => ({
  useRecaptcha: () => ({ getRecaptchaToken: jest.fn(async () => "captcha") }),
}));
jest.mock("axios", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));
import axios from "axios";

import EventSurvey from "../EventSurvey";

const HACKER_CTX = {
  success: true,
  mode: "post",
  allowed_roles: ["hacker"],
  primary_role: "hacker",
  requires_captcha: false,
  already_submitted: false,
  event: { title: "Fall 2026" },
};
const ANON_CTX = {
  ...HACKER_CTX,
  allowed_roles: ["nonprofit"],
  primary_role: "nonprofit",
  requires_captcha: true,
};

function routeContext() {
  axios.get.mockImplementation((url, { headers }) =>
    Promise.resolve({
      data: headers.Authorization ? HACKER_CTX : ANON_CTX,
    }),
  );
}

beforeEach(() => {
  axios.get.mockReset();
  mockAuth = {
    loading: false,
    isLoggedIn: true,
    user: USER,
    accessToken: "tok-1",
  };
});

it("auth resolving mid-flight: one authed context request, never the anonymous nonprofit form", async () => {
  routeContext();
  mockAuth = {
    loading: true,
    isLoggedIn: false,
    user: null,
    accessToken: null,
  };
  const { rerender } = render(<EventSurvey />);
  expect(axios.get).not.toHaveBeenCalled();
  expect(screen.queryByText("Share your feedback")).toBeNull();

  mockAuth = {
    loading: false,
    isLoggedIn: true,
    user: USER,
    accessToken: "tok-1",
  };
  rerender(<EventSurvey />);
  expect(await screen.findByText("Share your feedback")).toBeInTheDocument();
  expect(screen.getByText("You're giving feedback as")).toBeInTheDocument();
  // The fixed role chip is the volunteer's role, not the anonymous fallback.
  expect(screen.getByText("Hacker", { selector: "span" })).toBeInTheDocument();
  expect(screen.queryByText("Nonprofit", { selector: "span" })).toBeNull();
  expect(axios.get).toHaveBeenCalledTimes(1);
  expect(axios.get.mock.calls[0][1].headers.Authorization).toBe("Bearer tok-1");
});

it("a token rotation fires zero requests and keeps the form mounted", async () => {
  routeContext();
  const { rerender } = render(<EventSurvey />);
  const heading = await screen.findByText("Share your feedback");
  mockAuth = { ...mockAuth, accessToken: "tok-2" };
  rerender(<EventSurvey />);
  await act(async () => {});
  expect(axios.get).toHaveBeenCalledTimes(1);
  expect(screen.getByText("Share your feedback")).toBe(heading);
});

it("anonymous visitors (nonprofits) still load the form without a token", async () => {
  routeContext();
  mockAuth = {
    loading: false,
    isLoggedIn: false,
    user: null,
    accessToken: null,
  };
  render(<EventSurvey />);
  expect(await screen.findByText("Share your feedback")).toBeInTheDocument();
  expect(axios.get.mock.calls[0][1].headers.Authorization).toBeUndefined();
});

it("a 500 renders an error with Try again, which recovers", async () => {
  const err = new Error("boom");
  err.response = { status: 500 };
  axios.get
    .mockRejectedValueOnce(err)
    .mockResolvedValueOnce({ data: HACKER_CTX });
  render(<EventSurvey />);
  expect(
    await screen.findByText(
      "Could not load the feedback form. Please try again.",
    ),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  await waitFor(() =>
    expect(screen.getByText("Share your feedback")).toBeInTheDocument(),
  );
});

it("a 404 says the event wasn't found, with no retry", async () => {
  const err = new Error("nf");
  err.response = { status: 404 };
  axios.get.mockRejectedValueOnce(err);
  render(<EventSurvey />);
  expect(
    await screen.findByText("We couldn't find that event."),
  ).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
});
