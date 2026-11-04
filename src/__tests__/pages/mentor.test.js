/**
 * /mentor — the mentor dashboard. Lives outside src/pages on purpose (Next
 * builds every file under pages/ as a route).
 *
 * Covers the three data states and the per-card CTA rules: approved live /
 * upcoming cards link to mentor check-in, a pending card links to the
 * application instead, past cards demote to a ghost link, un-applied current
 * events get an "Apply to mentor" row, and the error card retries.
 */
import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";

jest.mock("next/head", () => ({
  __esModule: true,
  default: ({ children }) => <>{children}</>,
}));
// jest.setup.js mocks next/link down to bare children; the hrefs ARE the
// assertions here, so render a real anchor (same override as PeerVoteCTA.test).
jest.mock("next/link", () => {
  const ReactLib = require("react");
  const MockLink = ReactLib.forwardRef(({ children, href, ...rest }, ref) =>
    ReactLib.createElement("a", { href, ref, ...rest }, children),
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});
jest.mock("@propelauth/react", () => ({
  withRequiredAuthInfo: (Component) => Component,
  useAuthInfo: () => ({
    accessToken: "tok",
    user: { userId: "mentor-1", firstName: "Jasmine" },
  }),
}));
jest.mock("../../lib/ga", () => ({
  trackEvent: jest.fn(),
  initFacebookPixel: jest.fn(),
}));
jest.mock("../../hooks/use-mentor-events", () => ({
  __esModule: true,
  default: jest.fn(),
  useMentorEventProbe: jest.fn(() => ({ status: "idle", events: [] })),
}));
jest.mock("../../hooks/use-hackathon-events", () => ({
  __esModule: true,
  default: jest.fn(() => ({ hackathons: [], loading: false })),
}));

import useMentorEvents, {
  useMentorEventProbe,
} from "../../hooks/use-mentor-events";
import useHackathonEvents from "../../hooks/use-hackathon-events";
import { trackEvent } from "../../lib/ga";
import MentorPage from "../../pages/mentor/index";

const iso = (daysFromNow) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
};

const LIVE = {
  event_id: "fall-2026",
  title: "Fall 2026 Hackathon",
  start_date: iso(-1),
  end_date: iso(1),
  location: "Tempe, AZ",
  application: {
    isSelected: true,
    isCheckedIn: false,
    inPerson: "Yes!",
    availability:
      "Saturday Oct 11: ☀️ Morning (9am - 12pm MST), Saturday Oct 11: 🏙️ Afternoon (1pm - 5pm MST)",
  },
};
const UPCOMING_PENDING = {
  event_id: "spring-2027",
  title: "Spring 2027 Hackathon",
  start_date: iso(40),
  end_date: iso(41),
  application: { isSelected: false, status: "pending" },
};
const PAST = {
  event_id: "summer-2025",
  title: "Summer 2025 Hackathon",
  start_date: iso(-400),
  end_date: iso(-399),
  application: {
    isSelected: true,
    isCheckedIn: true,
    inPerson: "No, I'll be virtual",
  },
};

const ready = (events, extra = {}) => ({
  status: "ready",
  events,
  error: "",
  available: true,
  reload: jest.fn(),
  ...extra,
});

beforeEach(() => {
  jest.clearAllMocks();
  useHackathonEvents.mockReturnValue({ hackathons: [], loading: false });
  useMentorEventProbe.mockReturnValue({ status: "idle", events: [] });
});

describe("/mentor", () => {
  it("groups events by phase and routes each card by approval state", () => {
    useMentorEvents.mockReturnValue(ready([PAST, UPCOMING_PENDING, LIVE]));
    render(<MentorPage />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Welcome, Jasmine.",
    );
    expect(
      screen.getByRole("heading", { name: "Happening now" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Coming up" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Past events" }),
    ).toBeInTheDocument();

    const live = screen.getByTestId("mentor-event-fall-2026");
    expect(within(live).getByText("Happening now")).toBeInTheDocument();
    expect(within(live).getByText("Approved")).toBeInTheDocument();
    expect(within(live).getByText("In person")).toBeInTheDocument();
    expect(
      within(live).getByText("Saturday Oct 11: ☀️ Morning (9am - 12pm MST)"),
    ).toBeInTheDocument();
    const checkin = within(live).getByRole("link", {
      name: "Check in & see teams",
    });
    expect(checkin).toHaveAttribute("href", "/hack/fall-2026/mentor-checkin");
    fireEvent.click(checkin);
    expect(trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "mentor_dash_open_checkin",
        params: expect.objectContaining({
          event_label: "fall-2026",
          phase: "live",
        }),
      }),
    );

    const pending = screen.getByTestId("mentor-event-spring-2027");
    expect(
      within(pending).getByText("Awaiting confirmation"),
    ).toBeInTheDocument();
    expect(
      within(pending).queryByRole("link", { name: /mentor check-in/i }),
    ).toBeNull();
    expect(
      within(pending).getByRole("link", { name: "Review your application" }),
    ).toHaveAttribute("href", "/hack/spring-2027/mentor-application");
    expect(within(pending).getByText(/by hand/i)).toBeInTheDocument();

    const past = screen.getByTestId("mentor-event-summer-2025");
    expect(within(past).getByText("Virtual")).toBeInTheDocument();
    expect(within(past).getByText("Checked in")).toBeInTheDocument();
    expect(
      within(past).getByRole("link", { name: "Mentor page" }),
    ).toHaveAttribute("href", "/hack/summer-2025/mentor-checkin");
    expect(within(past).getByRole("link", { name: /Results/ })).toHaveAttribute(
      "href",
      "/hack/summer-2025/results",
    );

    // Guide links to the one-stop-shop resources
    expect(
      screen.getByRole("link", { name: "Read the mentor guide" }),
    ).toHaveAttribute("href", "/about/mentors");
    expect(
      screen.getByRole("link", { name: "Watch the overview" }),
    ).toHaveAttribute("href", "/about/mentors/overview");
    expect(trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "mentor_dash_view",
        params: expect.objectContaining({ event_label: "api", value: 3 }),
      }),
    );
  });

  it("offers an apply row for current events the mentor hasn't applied to", () => {
    useMentorEvents.mockReturnValue(ready([LIVE]));
    useHackathonEvents.mockReturnValue({
      hackathons: [
        {
          event_id: "fall-2026",
          title: "Fall 2026 Hackathon",
          start_date: iso(-1),
          end_date: iso(1),
        },
        {
          event_id: "winter-2026",
          title: "Winter 2026 Online",
          start_date: iso(30),
          end_date: iso(31),
        },
      ],
      loading: false,
    });
    render(<MentorPage />);

    expect(
      screen.getByRole("heading", {
        name: "Events you haven't applied to yet",
      }),
    ).toBeInTheDocument();
    const apply = screen.getByRole("link", { name: "Apply to mentor" });
    expect(apply).toHaveAttribute(
      "href",
      "/hack/winter-2026/mentor-application",
    );
    expect(screen.queryByText("Showing current events only.")).toBeNull();
  });

  it("shows an empty state with apply rows when there are no applications", () => {
    useMentorEvents.mockReturnValue(ready([]));
    useHackathonEvents.mockReturnValue({
      hackathons: [
        {
          event_id: "winter-2026",
          title: "Winter 2026 Online",
          start_date: iso(30),
          end_date: iso(31),
        },
      ],
      loading: false,
    });
    render(<MentorPage />);
    expect(screen.getByText("No mentoring events yet")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Apply to mentor" }),
    ).toHaveAttribute("href", "/hack/winter-2026/mentor-application");
  });

  it("falls back to the per-event probe when the batched route is missing", () => {
    useMentorEvents.mockReturnValue(ready([], { available: false }));
    useMentorEventProbe.mockReturnValue({ status: "ready", events: [LIVE] });
    render(<MentorPage />);
    expect(useMentorEventProbe).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: true }),
    );
    expect(
      screen.getByText("Showing current events only."),
    ).toBeInTheDocument();
    expect(screen.getByTestId("mentor-event-fall-2026")).toBeInTheDocument();
  });

  it("renders the error card and retries", () => {
    const reload = jest.fn();
    useMentorEvents.mockReturnValue({
      status: "error",
      events: [],
      error: "boom",
      available: true,
      reload,
    });
    render(<MentorPage />);
    expect(screen.getByRole("alert")).toHaveTextContent("boom");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(reload).toHaveBeenCalled();
  });
});
