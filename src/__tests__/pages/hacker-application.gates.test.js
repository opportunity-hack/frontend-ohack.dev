/**
 * Page-level gate states for /hack/[event_id]/hacker-application (Nov 2026):
 * the deadline is a nudge, the admin lock + access code, and the capacity
 * statement. Lives under src/__tests__/pages — never under src/pages.
 */
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const API = "http://api.test";

jest.mock("next/router", () => ({
  useRouter: () => ({
    query: { event_id: "fall-2026" },
    push: jest.fn(),
    replace: jest.fn(),
    pathname: "/hack/[event_id]/hacker-application",
    asPath: "/hack/fall-2026/hacker-application",
  }),
}));
jest.mock("next/script", () => () => null);

const AUTH = {
  user: { userId: "me-propel", email: "me@example.com" },
  accessToken: "token",
  isLoggedIn: true,
};
jest.mock("@propelauth/react", () => ({
  useAuthInfo: () => AUTH,
  RequiredAuthProvider: ({ children }) => <>{children}</>,
  RedirectToLogin: () => null,
}));
jest.mock("../../context/env.context", () => ({
  useEnv: () => ({ apiServerUrl: "http://api.test" }),
}));
jest.mock("../../components/ReCaptchaProvider", () => ({ children }) => <>{children}</>);
const RECAPTCHA = {
  initializeRecaptcha: () => {},
  getRecaptchaToken: async () => "tok",
  isLoading: false,
  error: null,
  setError: () => {},
};
jest.mock("../../hooks/use-recaptcha", () => ({ useRecaptcha: () => RECAPTCHA }));
const PROFILE = { profile: null, isLoading: false };
jest.mock("../../hooks/use-profile-api", () => () => PROFILE);
jest.mock("../../components/GiveButterWidget", () => () => null);
jest.mock("../../components/VolunteerCheckInQR", () => () => null);
jest.mock("../../components/ShareCard/ShareCardPromo", () => () => null);
jest.mock("../../lib/ga", () => ({
  trackEvent: jest.fn(),
  initFacebookPixel: jest.fn(),
}));

import { trackEvent } from "../../lib/ga";
import HackerApplicationPage from "../../pages/hack/[event_id]/hacker-application";

const DAY = 24 * 60 * 60 * 1000;
const isoDate = (ms) => new Date(ms).toISOString().slice(0, 10);

function mockEvent({ startInDays, constraints = {} }) {
  const start = Date.now() + startInDays * DAY;
  const event = {
    event_id: "fall-2026",
    title: "Opportunity Hack Fall 2026",
    location: "Tempe, Arizona",
    timezone: "America/Phoenix",
    start_date: isoDate(start),
    end_date: isoDate(start + DAY),
    constraints,
  };
  global.fetch = jest.fn((url) => {
    if (url === `${API}/api/messages/hackathon/fall-2026`) {
      return Promise.resolve({ ok: true, json: async () => event });
    }
    // previous submission, team-code browser, anything else: empty
    return Promise.resolve({ ok: true, json: async () => ({ data: null }) });
  });
}

const renderPage = () =>
  render(<HackerApplicationPage seoMetadata={{ title: "t", description: "d", canonicalUrl: "u", imageUrl: "i", eventName: "Opportunity Hack", location: "Tempe, Arizona" }} />);

beforeEach(() => {
  window.localStorage.clear();
  trackEvent.mockClear();
});

it("is open before the deadline with the normal deadline card", async () => {
  mockEvent({ startInDays: 10 });
  renderPage();
  expect(await screen.findByText("Apply before kickoff")).toBeInTheDocument();
  expect(screen.queryByText(/Applications are closed for this event/)).not.toBeInTheDocument();
});

it("stays open past the deadline (nudge only) with a 'Still open' card", async () => {
  mockEvent({ startInDays: 2 });
  renderPage();
  expect(await screen.findByText("Still open — apply now")).toBeInTheDocument();
  expect(screen.getByText(/Our priority deadline was/)).toBeInTheDocument();
  expect(screen.getByText("Still accepting applications")).toBeInTheDocument();
});

it("shows the capacity statement (and the auto-approve line when on)", async () => {
  mockEvent({ startInDays: 10, constraints: { hacker_capacity: 90, hacker_auto_approve: true } });
  renderPage();
  const statement = await screen.findByTestId("hacker-capacity-statement");
  expect(statement).toHaveTextContent("This event has room for 90 hackers");
  expect(statement).toHaveTextContent("being confirmed as they come in");
});

it("without auto-approve, capacity is decided at the door, not by apply order", async () => {
  mockEvent({ startInDays: 10, constraints: { hacker_capacity: 90 } });
  renderPage();
  const statement = await screen.findByTestId("hacker-capacity-statement");
  expect(statement).toHaveTextContent("This event has room for 90 hackers");
  expect(statement).toHaveTextContent("You need an application to hack");
  expect(statement).toHaveTextContent("first 90 applicants who check in when the doors open");
  expect(statement).toHaveTextContent("applying doesn't hold a seat");
  expect(statement).not.toHaveTextContent("first come, first served");
});

it("locks the form when the admin turns applications off and there is no code", async () => {
  mockEvent({ startInDays: 10, constraints: { application_hacker_enabled: false } });
  renderPage();
  expect(await screen.findByText("Applications are closed for this event")).toBeInTheDocument();
  expect(screen.queryByLabelText(/access code/i)).not.toBeInTheDocument();
  expect(screen.queryByText("Apply before kickoff")).not.toBeInTheDocument();
  // No "deadline passed" wording for a manual lock.
  expect(screen.queryByText(/The deadline passed on/)).not.toBeInTheDocument();
});

it("unlocks a locked form with the access code", async () => {
  mockEvent({
    startInDays: 10,
    constraints: { application_hacker_enabled: false, application_hacker_enabled_code: "late-2026" },
  });
  renderPage();
  const input = await screen.findByLabelText(/access code/i);

  fireEvent.change(input, { target: { value: "wrong" } });
  fireEvent.click(screen.getByRole("button", { name: /unlock application/i }));
  expect(screen.getByText(/That code didn't match/)).toBeInTheDocument();
  expect(screen.queryByText("Apply before kickoff")).not.toBeInTheDocument();

  fireEvent.change(input, { target: { value: "late-2026" } });
  fireEvent.click(screen.getByRole("button", { name: /unlock application/i }));
  expect(await screen.findByText("Apply before kickoff")).toBeInTheDocument();
  expect(screen.getByText(/Access code accepted/)).toBeInTheDocument();
  expect(trackEvent).toHaveBeenCalledWith(
    expect.objectContaining({ action: "hacker_app_unlocked" }),
  );
});

it("auto-closes at the deadline only when opted in, with the deadline sentence", async () => {
  mockEvent({ startInDays: 2, constraints: { application_hacker_close_at_deadline: true } });
  renderPage();
  expect(await screen.findByText(/The deadline passed on/)).toBeInTheDocument();
});

it("the access code also unlocks an event that has ended", async () => {
  mockEvent({ startInDays: -10, constraints: { application_hacker_enabled_code: "late-2026" } });
  renderPage();
  expect(await screen.findByText("This event has already ended")).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText(/access code/i), { target: { value: "late-2026" } });
  fireEvent.click(screen.getByRole("button", { name: /unlock application/i }));
  await waitFor(() => expect(screen.queryByText("This event has already ended")).not.toBeInTheDocument());
  expect(screen.getByText(/Access code accepted/)).toBeInTheDocument();
});
