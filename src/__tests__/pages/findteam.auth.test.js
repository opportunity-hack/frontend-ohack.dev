/**
 * /hack/[event_id]/findteam × auth (Class C, docs/plans/reliability-bug-classes-2026-11.md).
 * The three loads used to re-run on every refocus token rotation (the list
 * was swapped for "checking your application"), and a failed profile fetch
 * showed "Apply first" under the error. Lives under src/__tests__/pages.
 */
import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";

const API = "http://api.test";
process.env.NEXT_PUBLIC_API_SERVER_URL = API;

jest.mock("next/router", () => ({
  useRouter: () => ({
    query: { event_id: "fall-2026" },
    push: jest.fn(),
    replace: jest.fn(),
    pathname: "/hack/[event_id]/findteam",
    asPath: "/hack/fall-2026/findteam",
  }),
}));

const USER = { userId: "me-propel", email: "me@example.com" };
const USER_CLASS = { getOrgByName: () => ({ orgId: "org-1" }) };
let mockAuth;
jest.mock("@propelauth/react", () => ({
  useAuthInfo: () => mockAuth,
  RequiredAuthProvider: ({ children }) => <>{children}</>,
  RedirectToLogin: () => null,
}));
jest.mock("../../context/env.context", () => ({
  useEnv: () => ({ slackSignupUrl: "https://slack.example/signup" }),
}));
jest.mock("axios", () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));
import axios from "axios";

import FindTeam from "../../pages/hack/[event_id]/findteam";

const ME_APP = {
  user_id: "me-propel",
  name: "Me Myself",
  isSelected: true,
  teamStatus: "I'm looking for team members",
  socialCauses: "Education",
  skills: "Python",
};
const ADA = {
  ...ME_APP,
  user_id: "u-ada",
  name: "Ada Lovelace",
  skills: "React",
};

function mockBackend({ profile, application } = {}) {
  axios.get.mockImplementation((url) => {
    if (url === `${API}/api/users/profile`)
      return profile
        ? profile()
        : Promise.resolve({ data: { id: "db-me", name: "Me Myself" } });
    if (url === `${API}/api/hacker/application/fall-2026`)
      return application
        ? application()
        : Promise.resolve({ data: { data: ME_APP } });
    if (url === `${API}/api/messages/hackathon/fall-2026`)
      return Promise.resolve({ data: { title: "Fall 2026" } });
    if (url === `${API}/api/hacker/applications/fall-2026`)
      return Promise.resolve({ data: { data: [ADA, ME_APP] } });
    return Promise.reject(new Error(`unexpected ${url}`));
  });
}

const http = (status) => {
  const err = new Error(`HTTP ${status}`);
  err.response = { status };
  return err;
};
const authedCalls = () =>
  axios.get.mock.calls.filter(
    ([url]) => !url.includes("/api/messages/hackathon/"),
  ).length;

beforeEach(() => {
  localStorage.clear();
  axios.get.mockReset();
  mockAuth = {
    loading: false,
    isLoggedIn: true,
    user: USER,
    userClass: USER_CLASS,
    accessToken: "tok-1",
  };
});

it("auth resolving mid-flight never shows 'Apply first', then lists teammates", async () => {
  mockBackend();
  mockAuth = {
    ...mockAuth,
    loading: true,
    isLoggedIn: false,
    user: null,
    accessToken: null,
  };
  const { rerender } = render(<FindTeam />);
  expect(screen.queryByText("Apply first to use the Team Finder")).toBeNull();
  expect(authedCalls()).toBe(0);

  mockAuth = {
    ...mockAuth,
    loading: false,
    isLoggedIn: true,
    user: USER,
    accessToken: "tok-1",
  };
  rerender(<FindTeam />);
  expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
  expect(screen.queryByText("Apply first to use the Team Finder")).toBeNull();
});

it("a token rotation fires zero requests and keeps the list on screen", async () => {
  mockBackend();
  const { rerender } = render(<FindTeam />);
  await screen.findByText("Ada Lovelace");
  const before = axios.get.mock.calls.length;
  mockAuth = { ...mockAuth, accessToken: "tok-2" };
  rerender(<FindTeam />);
  await act(async () => {});
  expect(axios.get.mock.calls.length).toBe(before);
  expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
});

it("a profile 500 shows the warning with Retry — never 'Apply first' — and Retry recovers", async () => {
  let fail = true;
  mockBackend({
    profile: () =>
      fail
        ? Promise.reject(http(500))
        : Promise.resolve({ data: { id: "db-me", name: "Me Myself" } }),
  });
  render(<FindTeam />);
  expect(
    await screen.findByText(
      "Failed to fetch your profile. Please try again later.",
    ),
  ).toBeInTheDocument();
  expect(screen.queryByText("Apply first to use the Team Finder")).toBeNull();

  fail = false;
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));
  expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
  expect(
    screen.queryByText("Failed to fetch your profile. Please try again later."),
  ).toBeNull();
});

it("no application as 200 + data:null shows 'Apply first' with no error warning", async () => {
  mockBackend({ application: () => Promise.resolve({ data: { data: null } }) });
  render(<FindTeam />);
  expect(
    await screen.findByText("Apply first to use the Team Finder"),
  ).toBeInTheDocument();
  expect(screen.queryByText(/Failed to fetch your profile/)).toBeNull();
});
