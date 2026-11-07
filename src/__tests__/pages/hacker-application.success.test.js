/**
 * Submit → success screen for /hack/[event_id]/hacker-application (Nov 2026):
 * the backend's {success, data} envelope drives the confirmed / waitlisted /
 * pending copy, and a 400 {message} surfaces verbatim. The form-persistence
 * hook is replaced by a pre-filled state so the test can walk the 5 steps.
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
jest.mock("../../components/VolunteerCheckInQR", () => (props) => (
  <div data-testid="checkin-qr" data-volunteer-id={props.volunteerId} />
));
jest.mock("../../components/ShareCard/ShareCardPromo", () => () => null);
jest.mock("../../lib/ga", () => ({
  trackEvent: jest.fn(),
  initFacebookPixel: jest.fn(),
}));

jest.mock("../../hooks/use-form-persistence", () => {
  const React = require("react");
  const FILLED = {
    email: "riley@example.com",
    name: "Riley Hacker",
    participantType: "Student",
    schoolOrganization: "ASU",
    experienceLevel: "Intermediate",
    primaryRoles: ["Backend Developer"],
    otherRole: "",
    skills: ["Python"],
    otherSkills: "",
    inPerson: "Yes",
    country: "Canada",
    state: "Ontario",
    ageRange: "18-24",
    referralSource: "Friend",
    socialCauses: ["Education"],
    otherSocialCause: "",
    teamStatus: "I have a team",
    teamCode: "TEAM1",
    teamMatchingPreferences: { preferredSize: "", preferredSkills: [], preferredCauses: [] },
    workshopInterests: [],
    mealSelections: {},
    codeOfConduct: true,
    requiredQuestionAnswers: [],
  };
  return {
    useFormPersistence: () => {
      const [formData, setFormData] = React.useState(FILLED);
      const [isLoading, setIsLoading] = React.useState(false);
      const formRef = React.useRef(null);
      return {
        formData,
        setFormData,
        formRef,
        handleFormChange: () => {},
        handleMultiSelectChange: () => {},
        loadFromLocalStorage: () => {},
        saveToLocalStorage: () => {},
        clearSavedData: () => {},
        loadPreviousSubmission: async () => null,
        previouslySubmitted: false,
        setPreviouslySubmitted: () => {},
        notification: { open: false, message: "", severity: "info" },
        closeNotification: () => {},
        isLoading,
        setIsLoading,
      };
    },
  };
});

import { trackEvent } from "../../lib/ga";
import HackerApplicationPage from "../../pages/hack/[event_id]/hacker-application";

const DAY = 24 * 60 * 60 * 1000;
const isoDate = (ms) => new Date(ms).toISOString().slice(0, 10);

function mockBackend(submitResponse) {
  const start = Date.now() + 10 * DAY;
  const event = {
    event_id: "fall-2026",
    title: "Opportunity Hack Fall 2026",
    location: "Tempe, Arizona",
    timezone: "America/Phoenix",
    start_date: isoDate(start),
    end_date: isoDate(start + DAY),
    constraints: { hacker_capacity: 90, hacker_auto_approve: true },
  };
  global.fetch = jest.fn((url) => {
    if (url === `${API}/api/messages/hackathon/fall-2026`) {
      return Promise.resolve({ ok: true, json: async () => event });
    }
    if (url === `${API}/api/hacker/application/fall-2026/submit`) {
      return Promise.resolve(submitResponse);
    }
    return Promise.resolve({ ok: true, json: async () => ({ data: null }) });
  });
}

async function submitApplication() {
  render(
    <HackerApplicationPage
      seoMetadata={{ title: "t", description: "d", canonicalUrl: "u", imageUrl: "i", eventName: "Opportunity Hack", location: "Tempe, Arizona" }}
    />,
  );
  await screen.findByText("Apply before kickoff");
  for (let i = 0; i < 4; i += 1) {
    fireEvent.click(screen.getByRole("button", { name: /^next|continue/i }));
  }
  fireEvent.click(await screen.findByRole("button", { name: /submit application/i }));
}

beforeEach(() => trackEvent.mockClear());

it("auto-approved: shows the confirmed state with the saved doc's QR", async () => {
  mockBackend({
    ok: true,
    status: 200,
    json: async () => ({
      success: true,
      data: { id: "vol-42", isSelected: true, status: "approved", auto_approved: true },
    }),
  });
  await submitApplication();
  expect(await screen.findByText(/on the roster for/)).toBeInTheDocument();
  expect(screen.getByTestId("checkin-qr")).toHaveAttribute("data-volunteer-id", "vol-42");
  expect(screen.getByRole("link", { name: /set up your team/i })).toHaveAttribute(
    "href",
    "/hack/fall-2026/manageteam",
  );
  expect(trackEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      action: "hacker_app_auto_approved",
      params: expect.objectContaining({ event_label: "approved" }),
    }),
  );
});

it("at capacity: shows the waitlist copy and no QR", async () => {
  mockBackend({
    ok: true,
    status: 200,
    json: async () => ({ success: true, data: { id: "vol-43", isSelected: false, status: "waitlisted" } }),
  });
  await submitApplication();
  expect(await screen.findByText(/you.re on the waitlist/i)).toBeInTheDocument();
  expect(screen.queryByTestId("checkin-qr")).not.toBeInTheDocument();
});

it("pending review: the received copy plus the capacity line", async () => {
  mockBackend({
    ok: true,
    status: 200,
    json: async () => ({ success: true, data: { id: "vol-44", isSelected: false } }),
  });
  await submitApplication();
  expect(await screen.findByText(/This event has room for 90 hackers/)).toBeInTheDocument();
  expect(screen.queryByTestId("checkin-qr")).not.toBeInTheDocument();
});

it("a 400 from the backend shows its message instead of the success screen", async () => {
  mockBackend({
    ok: false,
    status: 400,
    json: async () => ({ success: false, message: "This hackathon is only open to ASU students." }),
  });
  await submitApplication();
  expect(await screen.findByText("This hackathon is only open to ASU students.")).toBeInTheDocument();
  expect(screen.queryByText(/on the roster for/)).not.toBeInTheDocument();
});
