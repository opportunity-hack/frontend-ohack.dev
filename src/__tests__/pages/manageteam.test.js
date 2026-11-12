/**
 * /hack/[event_id]/manageteam × auth (Class C, docs/plans/reliability-bug-classes-2026-11.md).
 *
 * The page used to load /me, the hacker application and the profile from
 * effects keyed on the RAW accessToken: every refocus token rotation showed
 * the hub skeleton and remounted TeamDashboard (wiping editor drafts), and a
 * failed application fetch rendered "Apply first" to an approved hacker.
 * Lives under src/__tests__/pages — never under src/pages.
 */
import React from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

const API = "http://api.test";
process.env.NEXT_PUBLIC_API_SERVER_URL = API;

jest.mock("next/router", () => ({
  useRouter: () => ({
    query: { event_id: "fall-2026" },
    push: jest.fn(),
    replace: jest.fn(),
    pathname: "/hack/[event_id]/manageteam",
    asPath: "/hack/fall-2026/manageteam",
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
jest.mock("../../lib/ga", () => ({
  trackEvent: jest.fn(),
  EventCategory: { ENGAGEMENT: "engagement" },
}));
jest.mock("../../components/Survey/SurveyCTA", () => () => null);

// TeamDashboard stub counts mounts — a remount on token rotation is the bug.
let mockDashboardMounts = 0;
jest.mock("../../components/TeamDashboard/TeamDashboard", () => {
  const ReactInner = require("react");
  return function TeamDashboardStub({ team, onLeftTeam }) {
    ReactInner.useEffect(() => {
      mockDashboardMounts += 1;
    }, []);
    return (
      <div data-testid="team-dashboard">
        {team.name}
        <button type="button" onClick={() => onLeftTeam(team.id, {})}>
          stub-leave
        </button>
      </div>
    );
  };
});

jest.mock("axios", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));
import axios from "axios";

import ManageTeam from "../../pages/hack/[event_id]/manageteam";

const TEAM = { id: "t1", name: "Byte Club", status: "NONPROFIT_SELECTED" };
const http = (status) => {
  const err = new Error(`HTTP ${status}`);
  err.response = { status };
  return err;
};

function mockBackend(overrides = {}) {
  axios.get.mockImplementation((url) => {
    if (overrides[url]) return overrides[url]();
    if (url === `${API}/api/team/fall-2026/me`)
      return Promise.resolve({ data: { teams: [TEAM] } });
    if (url === `${API}/api/hacker/application/fall-2026`)
      return Promise.resolve({ data: { data: { isSelected: true } } });
    if (url === `${API}/api/users/profile`)
      return Promise.resolve({ data: { id: "db-me", github: "me" } });
    if (url === `${API}/api/messages/hackathon/fall-2026`)
      return Promise.resolve({ data: { title: "Fall 2026", nonprofits: [] } });
    return Promise.reject(new Error(`unexpected ${url}`));
  });
}

const callsTo = (suffix) =>
  axios.get.mock.calls.filter(([url]) => url.endsWith(suffix)).length;

beforeEach(() => {
  axios.get.mockReset();
  axios.post.mockReset();
  mockDashboardMounts = 0;
  sessionStorage.clear();
  mockAuth = {
    loading: false,
    isLoggedIn: true,
    user: USER,
    userClass: USER_CLASS,
    accessToken: "tok-1",
  };
});

it("auth resolving mid-flight never shows 'Apply first' or 'no team', then renders the dashboard", async () => {
  mockBackend();
  mockAuth = {
    loading: true,
    isLoggedIn: false,
    user: null,
    userClass: USER_CLASS,
    accessToken: null,
  };
  const { rerender } = render(<ManageTeam />);
  expect(screen.queryByText("Apply first to manage a team")).toBeNull();
  expect(screen.queryByText(/You don.t have a team yet/)).toBeNull();
  expect(callsTo("/me")).toBe(0);

  mockAuth = {
    ...mockAuth,
    loading: false,
    isLoggedIn: true,
    user: USER,
    accessToken: "tok-1",
  };
  rerender(<ManageTeam />);
  expect(await screen.findByTestId("team-dashboard")).toHaveTextContent(
    "Byte Club",
  );
  expect(screen.queryByText("Apply first to manage a team")).toBeNull();
  expect(callsTo("/me")).toBe(1);
  expect(callsTo("/api/hacker/application/fall-2026")).toBe(1);
  expect(callsTo("/api/users/profile")).toBe(1);
});

it("a token rotation fires zero requests and never remounts TeamDashboard", async () => {
  mockBackend();
  const { rerender } = render(<ManageTeam />);
  await screen.findByTestId("team-dashboard");
  const before = axios.get.mock.calls.length;
  expect(mockDashboardMounts).toBe(1);

  mockAuth = { ...mockAuth, accessToken: "tok-2" };
  rerender(<ManageTeam />);
  mockAuth = { ...mockAuth, accessToken: "tok-3" };
  rerender(<ManageTeam />);
  await act(async () => {});

  expect(axios.get.mock.calls.length).toBe(before);
  expect(mockDashboardMounts).toBe(1);
  expect(screen.getByTestId("team-dashboard")).toBeInTheDocument();
});

it("a /me 500 renders the hub's Retry card (teamsError), and Retry recovers", async () => {
  let failMe = true;
  mockBackend({
    [`${API}/api/team/fall-2026/me`]: () =>
      failMe
        ? Promise.reject(http(500))
        : Promise.resolve({ data: { teams: [TEAM] } }),
  });
  render(<ManageTeam />);
  expect(
    await screen.findByText(
      "Failed to fetch team details. Please try again later.",
    ),
  ).toBeInTheDocument();
  failMe = false;
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));
  expect(await screen.findByTestId("team-dashboard")).toBeInTheDocument();
});

it("a hacker-application 500 shows a Retry card, never 'Apply first'", async () => {
  let failApp = true;
  mockBackend({
    [`${API}/api/hacker/application/fall-2026`]: () =>
      failApp
        ? Promise.reject(http(500))
        : Promise.resolve({ data: { data: { isSelected: true } } }),
  });
  render(<ManageTeam />);
  expect(
    await screen.findByText(/couldn.t check your hacker application/),
  ).toBeInTheDocument();
  expect(screen.queryByText("Apply first to manage a team")).toBeNull();

  failApp = false;
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));
  await waitFor(() =>
    expect(
      screen.queryByText(/couldn.t check your hacker application/),
    ).toBeNull(),
  );
  expect(screen.queryByText("Apply first to manage a team")).toBeNull();
});

it("no application (200 + data:null) still shows 'Apply first'", async () => {
  mockBackend({
    [`${API}/api/hacker/application/fall-2026`]: () =>
      Promise.resolve({ data: { data: null } }),
  });
  render(<ManageTeam />);
  expect(
    await screen.findByText("Apply first to manage a team"),
  ).toBeInTheDocument();
});

it("leaving from the dashboard drops the team, shows the notice, and a /me refresh confirms it", async () => {
  let left = false;
  mockBackend({
    [`${API}/api/team/fall-2026/me`]: () =>
      Promise.resolve({ data: { teams: left ? [] : [TEAM] } }),
  });
  render(<ManageTeam />);
  await screen.findByTestId("team-dashboard");

  left = true;
  fireEvent.click(screen.getByRole("button", { name: "stub-leave" }));

  expect(await screen.findByRole("status")).toHaveTextContent(
    "You've left Byte Club.",
  );
  expect(screen.queryByTestId("team-dashboard")).toBeNull();
  expect(screen.getByText(/You don.t have a team yet/)).toBeInTheDocument();
  await waitFor(() => expect(callsTo("/me")).toBe(2));
  expect(screen.queryByTestId("team-dashboard")).toBeNull();

  fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
  expect(screen.queryByText("You've left Byte Club.")).toBeNull();
});

it("leaving one of two teams switches the dashboard to the other team", async () => {
  const OTHER = { id: "t2", name: "Null Pointers", status: "IN_REVIEW" };
  mockBackend({
    [`${API}/api/team/fall-2026/me`]: () =>
      Promise.resolve({ data: { teams: [TEAM, OTHER] } }),
  });
  render(<ManageTeam />);
  expect(await screen.findByTestId("team-dashboard")).toHaveTextContent(
    "Byte Club",
  );
  fireEvent.click(screen.getByRole("button", { name: "stub-leave" }));
  expect(await screen.findByTestId("team-dashboard")).toHaveTextContent(
    "Null Pointers",
  );
});
