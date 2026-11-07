import React from "react";
import { render, screen, within } from "@testing-library/react";

// The global next/link mock returns bare children; this card's whole point
// is its hrefs, so render real anchors here.
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, onClick, className, style }) => (
    <a
      href={typeof href === "string" ? href : href?.pathname}
      onClick={onClick}
      className={className}
      style={style}
    >
      {children}
    </a>
  ),
}));
jest.mock("../../../lib/ga", () => ({
  trackEvent: jest.fn(),
  EventCategory: { ENGAGEMENT: "engagement" },
}));

import MyTeamsCard from "../MyTeamsCard";

const RealDate = Date;
beforeAll(() => {
  const fixed = new RealDate(2026, 9, 11, 12, 0, 0); // mid Fall 2026
  global.Date = class extends RealDate {
    constructor(...args) {
      return args.length ? new RealDate(...args) : new RealDate(fixed);
    }
    static now() {
      return fixed.getTime();
    }
  };
});
afterAll(() => {
  global.Date = RealDate;
});

const live = {
  id: "t-live",
  name: "Night Owls",
  hackathon_event_id: "fall-2026",
  status: "FOUNDING_ENGINEERS",
  awards: ["Hackers' Choice"],
  event: {
    event_id: "fall-2026",
    title: "Fall 2026",
    start_date: "2026-10-10",
    end_date: "2026-10-12",
  },
};
const past = {
  id: "t-past",
  name: "Old Owls",
  hackathon_event_id: "2025_fall",
  status: "COMPLETED_HACKATHON",
  event: {
    event_id: "2025_fall",
    title: "Fall 2025",
    start_date: "2025-10-11",
    end_date: "2025-10-13",
  },
};

describe("MyTeamsCard", () => {
  it("renders nothing when the backend route isn't available", () => {
    const { container } = render(
      <MyTeamsCard teams={[]} loading={false} available={false} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows a skeleton while loading and when data hasn't arrived", () => {
    render(<MyTeamsCard teams={null} loading={false} />);
    expect(
      screen.getByRole("region", { name: /your teams/i }),
    ).toBeInTheDocument();
    expect(document.querySelector("[aria-busy='true']")).toBeInTheDocument();
  });

  it("leads with the live event's team: manage first, team page second, 🏆 status + awards", () => {
    render(<MyTeamsCard teams={[past, live]} loading={false} />);
    const section = screen.getByRole("region", { name: /your teams/i });
    expect(
      within(section).getByRole("heading", { name: /night owls/i }),
    ).toBeInTheDocument();
    expect(section).toHaveTextContent(/happening now/i);
    expect(section).toHaveTextContent(/Fall 2026/);
    expect(within(section).getByText(/🏆 Founding Engineers - 1st Place/)).toBeInTheDocument();
    expect(within(section).getByText("Hackers' Choice")).toBeInTheDocument();

    const manage = within(section).getByRole("link", {
      name: /manage your team/i,
    });
    expect(manage).toHaveAttribute("href", "/hack/fall-2026/manageteam");
    expect(manage.className).toMatch(/ohx-btn--primary/);
    expect(
      within(section).getAllByRole("link", { name: /^team page$/i })[0],
    ).toHaveAttribute("href", "/hack/fall-2026/team/t-live");

    // the older team sits in the compact list with its own links
    const list = within(section).getByRole("list");
    expect(list).toHaveTextContent(/Old Owls/);
    expect(list).toHaveTextContent(/past event/i);
    expect(
      within(list).getByRole("link", { name: /old owls/i }),
    ).toHaveAttribute("href", "/hack/2025_fall/team/t-past");
    expect(within(list).getByRole("link", { name: /manage/i })).toHaveAttribute(
      "href",
      "/hack/2025_fall/manageteam",
    );
  });

  it("for a past-only team the team page is primary and the dashboard is secondary", () => {
    render(<MyTeamsCard teams={[past]} loading={false} />);
    const primary = screen.getByRole("link", { name: /team page/i });
    expect(primary.className).toMatch(/ohx-btn--primary/);
    expect(
      screen.getByRole("link", { name: /team dashboard/i }),
    ).toHaveAttribute("href", "/hack/2025_fall/manageteam");
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("empty state points a registered hacker at Find / Create for their current event", () => {
    render(
      <MyTeamsCard
        teams={[]}
        loading={false}
        hackathons={[
          {
            event_id: "fall-2026",
            title: "Fall 2026",
            start_date: "2026-10-10",
            end_date: "2026-10-12",
            roles: ["Hacker"],
          },
        ]}
      />,
    );
    expect(screen.getByText(/not on a team yet/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /find a team/i })).toHaveAttribute(
      "href",
      "/hack/fall-2026/findteam",
    );
    expect(
      screen.getByRole("link", { name: /create a team/i }),
    ).toHaveAttribute("href", "/hack/fall-2026/manageteam");
  });

  it("empty state without a current hacker registration links to the events page", () => {
    render(<MyTeamsCard teams={[]} loading={false} hackathons={[]} />);
    expect(
      screen.getByRole("link", { name: /see upcoming hackathons/i }),
    ).toHaveAttribute("href", "/hack");
  });

  it("shows the error line instead of the skeleton on failure", () => {
    render(
      <MyTeamsCard
        teams={[]}
        loading={false}
        error="We couldn't load your teams right now."
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent(/couldn't load/i);
  });
});
