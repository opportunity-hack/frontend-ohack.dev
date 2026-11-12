/**
 * /hack/[event_id]/mentor-checkin — renders strictly by gate (Nov 2026).
 * Lives outside src/pages on purpose (Next builds every file under pages/).
 *
 * - every gate renders exactly one panel heading;
 * - the "waiting" states (A: approved before the event, D: pending,
 *   E: not selected) show NO check-in button and no role="alert";
 * - the race that used to flash "You are not registered as a mentor" while
 *   PropelAuth resolved can't happen (real hook, MutationObserver);
 * - State A flips to the check-in button when the clock passes opens_at.
 */
import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";

jest.mock("next/head", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("next/link", () => {
  const ReactLib = require("react");
  const MockLink = ReactLib.forwardRef(({ children, href, ...rest }, ref) =>
    ReactLib.createElement("a", { href, ref, ...rest }, children),
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});
jest.mock("next/router", () => ({
  useRouter: () => ({ query: { event_id: "fall-2026" }, push: jest.fn() }),
}));
jest.mock("axios", () => {
  const mockAxios = jest.fn();
  mockAxios.default = mockAxios;
  return mockAxios;
});
const mockUser = { userId: "propel-1" };
let mockAuth;
jest.mock("@propelauth/react", () => ({ useAuthInfo: () => mockAuth }));
jest.mock("../../context/env.context", () => ({
  useEnv: () => ({ apiServerUrl: "https://api.test", slackSignupUrl: "https://slack.test" }),
}));
jest.mock("../../lib/ga", () => ({ trackEvent: jest.fn() }));
jest.mock("../../components/Mentor/MentorTeamsTable", () => () => (
  <div data-testid="teams-table" />
));
jest.mock("../../components/Survey/SurveyCTA", () => () => null);
jest.mock("../../components/LoginOrRegister/LoginOrRegister2", () => () => (
  <div>login-or-register</div>
));

import { trackEvent } from "../../lib/ga";
import MentorCheckinPage from "../../pages/hack/[event_id]/mentor-checkin";

const NOW = Date.parse("2026-11-11T12:00:00-07:00");
const OPENS = "2026-11-14T00:00:00-07:00";
const CLOSES = "2026-11-15T23:59:59-07:00";
const EVENT = {
  title: "Opportunity Hack Fall 2026",
  start_date: "2026-11-14",
  end_date: "2026-11-15",
  timezone: "America/Phoenix",
  teams: [],
  nonprofits: [],
};
const MENTOR = {
  name: "Mo Mentor",
  email: "mo@example.com",
  isSelected: true,
  availability: "Saturday Nov 14: ☀️ Morning (9am - 12pm MST)",
};

const PANEL_HEADINGS = [
  /loading mentor check-in/i,
  /login-or-register/i,
  /we couldn.t load your mentor details/i,
  /you are not registered as a mentor/i,
  /awaiting confirmation/i,
  /couldn.t offer you a mentor spot/i,
  /check-in opens/i,
  /you are (not )?checked in/i,
  /thanks for mentoring/i,
];

function setup({ application = MENTOR, status, applicationError, eventOk = true } = {}) {
  global.fetch = jest.fn(() =>
    eventOk
      ? Promise.resolve({ ok: true, json: () => Promise.resolve(EVENT) })
      : Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) }),
  );
  axios.mockImplementation((config) => {
    if (config.url.includes("/api/mentor/application/")) {
      if (applicationError) return Promise.reject(applicationError);
      return Promise.resolve({ data: { data: application } });
    }
    if (config.url.endsWith("/status")) {
      return Promise.resolve({
        data: {
          data: status || {
            isCheckedIn: false,
            isSelected: Boolean(application?.isSelected),
            window: { state: "upcoming", opens_at: OPENS, closes_at: CLOSES },
          },
        },
      });
    }
    if (config.url.endsWith("/in")) {
      return Promise.resolve({ data: { slackNotificationSent: true } });
    }
    return Promise.reject(new Error(`unexpected ${config.url}`));
  });
}

function presentHeadings() {
  const text = document.body.textContent;
  return PANEL_HEADINGS.filter((re) => re.test(text));
}

function expectNoCheckinButtonOrAlert() {
  expect(screen.queryByRole("button", { name: /check in & notify/i })).toBeNull();
  expect(screen.queryByRole("alert")).toBeNull();
}

beforeEach(() => {
  jest.useFakeTimers({ doNotFake: ["nextTick", "queueMicrotask"] });
  jest.setSystemTime(NOW);
  axios.mockReset();
  trackEvent.mockClear();
  mockAuth = { loading: false, isLoggedIn: true, user: mockUser, accessToken: "tok" };
});
afterEach(() => {
  jest.useRealTimers();
});

it("logged out → login panel only", async () => {
  mockAuth = { loading: false, isLoggedIn: false, user: null, accessToken: null };
  setup();
  render(<MentorCheckinPage />);
  expect(await screen.findByText("login-or-register")).toBeInTheDocument();
  expect(presentHeadings()).toEqual([/login-or-register/i]);
});

it("no application → the existing apply CTA", async () => {
  setup({ application: null });
  render(<MentorCheckinPage />);
  expect(await screen.findByText(/you are not registered as a mentor/i)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /apply to be a mentor/i })).toHaveAttribute(
    "href",
    "/hack/fall-2026/mentor-application",
  );
  expect(presentHeadings()).toHaveLength(1);
});

it("application fetch failure → retry card, never the apply CTA", async () => {
  setup({ applicationError: Object.assign(new Error("500"), { response: { status: 500 } }) });
  render(<MentorCheckinPage />);
  expect(await screen.findByText(/we couldn.t load your mentor details/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  expect(screen.queryByText(/not registered/i)).toBeNull();
});

it("event fetch failure → retry card", async () => {
  setup({ eventOk: false });
  render(<MentorCheckinPage />);
  expect(await screen.findByText(/we couldn.t load your mentor details/i)).toBeInTheDocument();
});

it("State D — pending: awaiting confirmation, no button, no alert", async () => {
  setup({ application: { ...MENTOR, isSelected: false } });
  render(<MentorCheckinPage />);
  expect(await screen.findByText(/your mentor application is awaiting confirmation/i)).toBeInTheDocument();
  expect(screen.getByText(/usually within about a week/i)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /review your application/i })).toHaveAttribute(
    "href",
    "/hack/fall-2026/mentor-application",
  );
  expect(screen.getByText(/just got your confirmation email\? refresh this page/i)).toBeInTheDocument();
  expectNoCheckinButtonOrAlert();
  expect(presentHeadings()).toHaveLength(1);
});

it("State D — waitlisted variant", async () => {
  setup({ application: { ...MENTOR, isSelected: false, status: "waitlisted" } });
  render(<MentorCheckinPage />);
  expect(await screen.findByText(/you're on the waitlist/i)).toBeInTheDocument();
  expectNoCheckinButtonOrAlert();
});

it("State E — not selected (explicit denied only): calm alternatives", async () => {
  setup({ application: { ...MENTOR, isSelected: false, status: "denied" } });
  render(<MentorCheckinPage />);
  expect(await screen.findByText(/we couldn.t offer you a mentor spot this time/i)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /help on a year-round project/i })).toHaveAttribute(
    "href",
    "/projects",
  );
  expect(screen.getByRole("link", { name: /volunteer at this event/i })).toHaveAttribute(
    "href",
    "/hack/fall-2026/volunteer-application",
  );
  expect(screen.getByRole("link", { name: /questions\? contact us/i })).toBeInTheDocument();
  expectNoCheckinButtonOrAlert();
  expect(presentHeadings()).toHaveLength(1);
});

it("State A — approved before the event: 'Check-in opens' card, no button, then flips to B at opens_at", async () => {
  setup();
  render(<MentorCheckinPage />);
  expect(await screen.findByText(/check-in opens sat, nov 14/i)).toBeInTheDocument();
  expect(screen.getByText(/in 3 days/i)).toBeInTheDocument();
  expect(screen.getByText(/your first shift: saturday nov 14 · 9am - 12pm mst/i)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /read the mentor guide/i })).toHaveAttribute(
    "href",
    "/about/mentors/overview",
  );
  expect(screen.getByTestId("teams-table")).toBeInTheDocument();
  expectNoCheckinButtonOrAlert();

  // The clock passes opens_at while the tab stays open.
  await act(async () => {
    jest.setSystemTime(Date.parse(OPENS) + 1000);
    jest.advanceTimersByTime(30000);
  });
  expect(await screen.findByRole("button", { name: /check in & notify teams/i })).toBeInTheDocument();
  expect(screen.queryByText(/check-in opens/i)).toBeNull();
  expect(trackEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      action: "mentor_checkin_gate_view",
      params: expect.objectContaining({ event_label: "ready_upcoming" }),
    }),
  );
  expect(trackEvent).toHaveBeenCalledWith(
    expect.objectContaining({ params: expect.objectContaining({ event_label: "ready_open" }) }),
  );
});

it("State B — live event: existing check-in button", async () => {
  setup({
    status: {
      isCheckedIn: false,
      isSelected: true,
      window: { state: "open", opens_at: "2026-11-10T00:00:00-07:00", closes_at: CLOSES },
    },
  });
  render(<MentorCheckinPage />);
  expect(await screen.findByRole("button", { name: /check in & notify teams/i })).toBeInTheDocument();
  expect(screen.getByText("You are not checked in")).toBeInTheDocument();
});

it("State C — event over, not checked in: thanks card; still checked in: check-out only", async () => {
  const closed = { state: "closed", opens_at: "2026-11-01T00:00:00-07:00", closes_at: "2026-11-02T23:59:59-07:00" };
  setup({ status: { isCheckedIn: false, isSelected: true, window: closed } });
  const { unmount } = render(<MentorCheckinPage />);
  expect(await screen.findByText(/thanks for mentoring opportunity hack fall 2026/i)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /see the results/i })).toHaveAttribute(
    "href",
    "/hack/fall-2026/results",
  );
  expect(screen.queryByRole("button", { name: /check in & notify/i })).toBeNull();
  unmount();

  setup({ status: { isCheckedIn: true, isSelected: true, window: closed } });
  render(<MentorCheckinPage />);
  expect(await screen.findByRole("button", { name: /check out & notify teams/i })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /check in & notify/i })).toBeNull();
});

it("the auth-resolving race never renders 'not registered' or the login panel", async () => {
  setup();
  // PropelAuth starts unresolved.
  mockAuth = { loading: true, isLoggedIn: false, user: null, accessToken: null };
  const seen = new Set();
  const observer = new MutationObserver(() => {
    const text = document.body.textContent;
    if (/not registered/i.test(text)) seen.add("not_registered");
    if (/login-or-register/i.test(text)) seen.add("login");
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });

  const { rerender } = render(<MentorCheckinPage />);
  expect(screen.getByText(/loading mentor check-in/i)).toBeInTheDocument();
  mockAuth = { loading: false, isLoggedIn: true, user: mockUser, accessToken: "tok" };
  rerender(<MentorCheckinPage />);

  expect(await screen.findByText(/check-in opens sat/i)).toBeInTheDocument();
  await waitFor(() => expect(screen.getByTestId("teams-table")).toBeInTheDocument());
  observer.disconnect();
  expect(seen.size).toBe(0);
});

it("a stale-tab refusal settles into the matching state instead of erroring", async () => {
  setup({
    status: {
      isCheckedIn: false,
      isSelected: true,
      window: { state: "open", opens_at: "2026-11-10T00:00:00-07:00", closes_at: CLOSES },
    },
  });
  render(<MentorCheckinPage />);
  const button = await screen.findByRole("button", { name: /check in & notify teams/i });

  // The backend now says not approved.
  axios.mockImplementation((config) => {
    if (config.url.endsWith("/in")) {
      return Promise.reject(
        Object.assign(new Error("403"), {
          response: { status: 403, data: { error: "not_approved", message: "nope" } },
        }),
      );
    }
    if (config.url.endsWith("/status")) {
      return Promise.resolve({
        data: { data: { isCheckedIn: false, isSelected: false, window: null } },
      });
    }
    return Promise.reject(new Error("unexpected"));
  });
  await act(async () => {
    button.click();
  });
  await act(async () => {
    screen.getByRole("button", { name: /check in & send notification/i }).click();
  });
  expect(await screen.findByText(/awaiting confirmation/i)).toBeInTheDocument();
  expect(screen.queryByText(/failed to check in/i)).toBeNull();
});
