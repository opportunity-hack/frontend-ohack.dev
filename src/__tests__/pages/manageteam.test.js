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
jest.mock("../../components/Survey/SurveyCTA", () => () => (
  <div data-testid="survey-cta" />
));
// Pass-through dnd (jsdom can't drag; ↑/↓ is the tested reorder path).
jest.mock("@hello-pangea/dnd", () => ({
  DragDropContext: ({ children }) => children,
  Droppable: ({ children }) =>
    children({ innerRef: () => {}, droppableProps: {}, placeholder: null }),
  Draggable: ({ children }) =>
    children({ innerRef: () => {}, draggableProps: {}, dragHandleProps: {} }),
}));

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

// ---- create flow (project ranking, Nov 2026) ----------------------------
// jsdom has no scrollIntoView; step navigation scrolls the new step in.
beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn();
});
const OPTIONS_URL = `${API}/api/team/fall-2026/project-options`;
const PROJECT_OPTIONS = {
  nonprofits: [
    {
      id: "np1",
      name: "Food Bank",
      projects: [
        { id: "p1", title: "Scheduler", skills: ["React"] },
        { id: "p2", title: "Inventory", skills: [] },
      ],
    },
    {
      id: "np2",
      name: "Animal Rescue",
      projects: [{ id: "p3", title: "Adoptions", skills: [] }],
    },
  ],
};

function mockCreateFlowBackend(overrides = {}) {
  mockBackend({
    [`${API}/api/team/fall-2026/me`]: () =>
      Promise.resolve({ data: { teams: [] } }),
    [`${API}/api/validate/slack/byte-club`]: () =>
      Promise.resolve({ data: { valid: true, exists: false } }),
    [`${API}/api/validate/github/me`]: () =>
      Promise.resolve({ data: { valid: true } }),
    [`${API}/api/slack/users/active?active_days=365`]: () =>
      Promise.resolve({ data: { users: [] } }),
    [OPTIONS_URL]: () => Promise.resolve({ data: PROJECT_OPTIONS }),
    ...overrides,
  });
}

const nextButton = () => screen.getByRole("button", { name: "Next" });
const waitEnabled = (getter) =>
  waitFor(() => expect(getter()).not.toBeDisabled(), { timeout: 3000 });

async function fillDetailsAndGithub() {
  render(<ManageTeam />);
  fireEvent.change(await screen.findByLabelText(/Team Name/), {
    target: { value: "Byte Club" },
  });
  fireEvent.change(screen.getByLabelText(/New Slack channel name/), {
    target: { value: "byte-club" },
  });
  await waitEnabled(nextButton);
  fireEvent.click(nextButton());
  // GitHub step: prefilled from the profile ("me") and validated.
  await screen.findByDisplayValue("me");
  await waitEnabled(nextButton);
}

async function goToProjectsStep() {
  await fillDetailsAndGithub();
  fireEvent.click(nextButton());
  return screen.findByRole("heading", {
    name: "Choose the projects you want to build",
  });
}

it("Enter on the GitHub step only advances — it never creates the team", async () => {
  mockCreateFlowBackend();
  await fillDetailsAndGithub();
  const githubInput = screen.getByDisplayValue("me");
  fireEvent.submit(githubInput.closest("form"));
  expect(
    await screen.findByRole("heading", {
      name: "Choose the projects you want to build",
    }),
  ).toBeInTheDocument();
  expect(axios.post).not.toHaveBeenCalled();
});

it("posts the ranked projects as [{nonprofit_id, problem_statement_id, rank}]", async () => {
  mockCreateFlowBackend();
  axios.post.mockResolvedValue({ data: { success: true } });
  await goToProjectsStep();
  expect(nextButton()).toBeDisabled(); // nothing ranked yet

  const adds = await screen.findAllByRole("button", {
    name: "Add to my ranking",
  });
  fireEvent.click(adds[2]); // Adoptions → #1
  fireEvent.click(
    screen.getAllByRole("button", { name: "Add to my ranking" })[0],
  ); // Scheduler → #2
  await waitEnabled(nextButton);
  fireEvent.click(nextButton()); // → Teammates
  await screen.findByRole("heading", { name: "Who's on your team?" });
  fireEvent.click(nextButton()); // → Confirm
  await screen.findByRole("heading", { name: "Check your team details" });

  const create = screen.getByRole("button", { name: "Create team" });
  fireEvent.click(create);
  fireEvent.click(create); // double-click must not double-submit

  await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
  const [url, body] = axios.post.mock.calls[0];
  expect(url).toBe(`${API}/api/team/queue`);
  expect(body).toMatchObject({
    name: "Byte Club",
    slackChannel: "byte-club",
    eventId: "fall-2026",
    githubUsername: "me",
    nonprofitRankings: [
      { nonprofit_id: "np2", problem_statement_id: "p3", rank: 1 },
      { nonprofit_id: "np1", problem_statement_id: "p1", rank: 2 },
    ],
  });
});

it("a 400 refusal shows the server's message and returns to the right step", async () => {
  mockCreateFlowBackend();
  const refusal = new Error("HTTP 400");
  refusal.response = {
    status: 400,
    data: {
      error: "invalid_rankings",
      message: "One of your projects is no longer available.",
    },
  };
  axios.post.mockRejectedValue(refusal);
  await goToProjectsStep();
  const adds = await screen.findAllByRole("button", {
    name: "Add to my ranking",
  });
  fireEvent.click(adds[0]);
  fireEvent.click(
    screen.getAllByRole("button", { name: "Add to my ranking" })[0],
  );
  await waitEnabled(nextButton);
  fireEvent.click(nextButton());
  fireEvent.click(nextButton());
  fireEvent.click(await screen.findByRole("button", { name: "Create team" }));

  expect(
    await screen.findByText("One of your projects is no longer available."),
  ).toBeInTheDocument();
  // invalid_rankings → options re-fetched and back on the projects step
  expect(
    await screen.findByRole("heading", {
      name: "Choose the projects you want to build",
    }),
  ).toBeInTheDocument();
  await waitFor(() => expect(callsTo("/project-options")).toBe(2));
});

it("a create that outlasts the client timeout refreshes teams instead of saying it failed", async () => {
  mockCreateFlowBackend();
  const timeout = new Error("timeout of 90000ms exceeded");
  timeout.code = "ECONNABORTED";
  axios.post.mockRejectedValue(timeout);
  await goToProjectsStep();
  fireEvent.click(
    (await screen.findAllByRole("button", { name: "Add to my ranking" }))[0],
  );
  fireEvent.click(
    screen.getAllByRole("button", { name: "Add to my ranking" })[0],
  );
  await waitEnabled(nextButton);
  fireEvent.click(nextButton());
  fireEvent.click(nextButton());
  const mesBefore = callsTo("/api/team/fall-2026/me");
  fireEvent.click(await screen.findByRole("button", { name: "Create team" }));

  expect(
    await screen.findByText(/taking longer than usual/),
  ).toBeInTheDocument();
  // Form closed (no second "Create team" click → no duplicate team) and the
  // teams list re-read to show the team if it did get created.
  expect(screen.queryByRole("button", { name: "Create team" })).toBeNull();
  await waitFor(() =>
    expect(callsTo("/api/team/fall-2026/me")).toBeGreaterThan(mesBefore),
  );
  expect(screen.queryByText(/unexpected error/i)).toBeNull();
});

it("a project-options 500 shows a Retry card, never a 'no projects' claim", async () => {
  let fail = true;
  mockCreateFlowBackend({
    [OPTIONS_URL]: () =>
      fail
        ? Promise.reject(http(500))
        : Promise.resolve({ data: PROJECT_OPTIONS }),
  });
  await goToProjectsStep();
  expect(
    await screen.findByText(/couldn.t load this hackathon.s projects/),
  ).toBeInTheDocument();
  expect(screen.queryByText(/No projects are open/)).toBeNull();
  expect(nextButton()).toBeDisabled();

  fail = false;
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));
  expect(
    await screen.findAllByRole("button", { name: "Add to my ranking" }),
  ).toHaveLength(3);
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

// ---- teammates not on Slack + the survey card (Nov 2026) -----------------

it("the live-survey card never shows during team creation, only with a team", async () => {
  mockCreateFlowBackend();
  render(<ManageTeam />);
  await screen.findByLabelText(/Team Name/);
  expect(screen.queryByTestId("survey-cta")).toBeNull();
});

it("shows the survey card to someone who already has a team", async () => {
  mockBackend();
  render(<ManageTeam />);
  await screen.findByTestId("team-dashboard");
  expect(screen.getByTestId("survey-cta")).toBeInTheDocument();
});

it("typed teammates are sent as names, listed as 'joining later', and saved as the dashboard reminder", async () => {
  mockCreateFlowBackend();
  axios.post.mockResolvedValue({ data: { success: true } });
  localStorage.clear();
  await goToProjectsStep();
  const adds = await screen.findAllByRole("button", {
    name: "Add to my ranking",
  });
  fireEvent.click(adds[0]);
  fireEvent.click(
    screen.getAllByRole("button", { name: "Add to my ranking" })[1],
  );
  await waitEnabled(nextButton);
  fireEvent.click(nextButton()); // → Teammates
  await screen.findByRole("heading", { name: "Who's on your team?" });
  expect(
    screen.getByText(
      /Everyone on your team needs to be on the Opportunity Hack Slack/,
    ),
  ).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText(/Teammate's name/), {
    target: { value: "Priya" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Add to invite list" }));
  expect(
    screen.getByRole("list", { name: /joining later/i }),
  ).toHaveTextContent("Priya");

  fireEvent.click(nextButton()); // → Confirm
  await screen.findByRole("heading", { name: "Check your team details" });
  expect(
    screen.getByText("Joining later from your team page"),
  ).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Create team" }));
  await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
  expect(axios.post.mock.calls[0][1].teamMembers).toEqual(["Priya"]);
  await waitFor(() =>
    expect(
      JSON.parse(localStorage.getItem("ohx.team.pendingTeammates.byte-club")),
    ).toEqual(["Priya"]),
  );
});
