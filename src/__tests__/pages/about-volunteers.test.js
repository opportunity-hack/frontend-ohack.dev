/**
 * /about/volunteers — the event-volunteer guide. Lives outside src/pages on
 * purpose (Next builds every file under pages/ as a route).
 *
 * Covers: one <h1>, the check-in walkthrough + situations table render from the
 * data module, the FAQ accordions mirror the FAQPage JSON-LD exactly (visible
 * UI ↔ schema parity is what earns the rich result), and the upcoming-events
 * band links each event to its volunteer application.
 */
import React from "react";
import { render, screen, within } from "@testing-library/react";

jest.mock("next/link", () => {
  const ReactLib = require("react");
  const MockLink = ReactLib.forwardRef(({ children, href, ...rest }, ref) =>
    ReactLib.createElement("a", { href, ref, ...rest }, children),
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});
jest.mock("next/image", () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ fill, priority, sizes, ...props }) => <img alt="" {...props} />,
}));
jest.mock("../../lib/ga", () => ({
  trackEvent: jest.fn(),
  initFacebookPixel: jest.fn(),
}));
jest.mock("../../hooks/use-hackathon-events", () => ({
  __esModule: true,
  default: jest.fn(() => ({ hackathons: [], loading: false })),
}));

import useHackathonEvents from "../../hooks/use-hackathon-events";
import VolunteersGuide, {
  getStaticProps,
} from "../../pages/about/volunteers/index";
import {
  FAQ_ITEMS,
  CHECKIN_STEPS,
  CHECKIN_SITUATIONS,
  VOLUNTEER_ROLES,
  SHIFT_PRINCIPLES,
  FOOD_AREA_RULES,
  FOOD_RHYTHM,
  PHOTOGRAPHER_NOTES,
} from "../../components/About/Volunteering/volunteerGuideData";

describe("/about/volunteers", () => {
  beforeEach(() => {
    useHackathonEvents.mockReturnValue({ hackathons: [], loading: false });
  });

  it("renders a single h1 and every check-in step in order", () => {
    render(<VolunteersGuide />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole("heading", { level: 2, name: "How check-in works" }),
    ).toBeInTheDocument();
    const stepHeadings = screen
      .getAllByRole("heading", { level: 3 })
      .map((h) => h.textContent);
    CHECKIN_STEPS.forEach((step, i) => {
      expect(stepHeadings.indexOf(step.title)).toBeGreaterThanOrEqual(0);
      if (i > 0) {
        expect(stepHeadings.indexOf(step.title)).toBeGreaterThan(
          stepHeadings.indexOf(CHECKIN_STEPS[i - 1].title),
        );
      }
    });
  });

  it("renders the situations table and every role card", () => {
    render(<VolunteersGuide />);
    const table = screen.getByRole("table");
    CHECKIN_SITUATIONS.forEach((row) => {
      expect(within(table).getByText(row.situation)).toBeInTheDocument();
    });
    VOLUNTEER_ROLES.forEach((role) => {
      expect(
        screen.getByRole("heading", { level: 3, name: role.title }),
      ).toBeInTheDocument();
    });
  });

  it("renders the shared-shift-sheet principles, food-area rules and rhythm", () => {
    render(<VolunteersGuide />);
    SHIFT_PRINCIPLES.forEach((p) => {
      expect(
        screen.getByRole("heading", { level: 3, name: p.title }),
      ).toBeInTheDocument();
    });
    FOOD_AREA_RULES.forEach((rule) => {
      expect(screen.getByText(rule.body)).toBeInTheDocument();
    });
    FOOD_RHYTHM.forEach((row) => {
      expect(screen.getByText(row.when)).toBeInTheDocument();
    });
    expect(document.getElementById("food-area")).not.toBeNull();
  });

  it("renders the photographers callout with its release, conduct, media and tracker links", () => {
    render(<VolunteersGuide />);
    const callout = document.getElementById("photographers");
    expect(callout).not.toBeNull();
    PHOTOGRAPHER_NOTES.forEach((note) => {
      expect(within(callout).getByText(note.title)).toBeInTheDocument();
      note.links.forEach((link) => {
        expect(
          within(callout).getByRole("link", { name: link.label }),
        ).toHaveAttribute("href", link.href);
      });
    });
    expect(
      within(callout).getByRole("link", { name: "Photo release" }),
    ).toHaveAttribute("href", "/hack/photo-release");
    expect(
      within(callout).getByRole("link", { name: "Code of conduct" }),
    ).toHaveAttribute("href", "/hack/code-of-conduct");
  });

  it("keeps the visible FAQ and the FAQPage JSON-LD in sync", async () => {
    render(<VolunteersGuide />);
    FAQ_ITEMS.forEach((item) => {
      expect(screen.getByText(item.question)).toBeInTheDocument();
      expect(screen.getByText(item.answer)).toBeInTheDocument();
    });
    const { props } = await getStaticProps();
    const faq = props.structuredData["@graph"].find(
      (n) => n["@type"] === "FAQPage",
    );
    expect(faq.mainEntity.map((q) => q.name)).toEqual(
      FAQ_ITEMS.map((i) => i.question),
    );
    expect(faq.mainEntity.map((q) => q.acceptedAnswer.text)).toEqual(
      FAQ_ITEMS.map((i) => i.answer),
    );
    const howTo = props.structuredData["@graph"].find(
      (n) => n["@type"] === "HowTo",
    );
    expect(howTo.step.map((s) => s.name)).toEqual(
      CHECKIN_STEPS.map((s) => s.title),
    );
    expect(props.canonical).toBe("https://www.ohack.dev/about/volunteers");
  });

  it("links each upcoming event to its volunteer application", () => {
    useHackathonEvents.mockReturnValue({
      loading: false,
      hackathons: [
        {
          event_id: "fall-2026",
          title: "Fall 2026",
          location: "Tempe, AZ",
          start_date: "2026-11-14",
          end_date: "2026-11-15",
        },
      ],
    });
    render(<VolunteersGuide />);
    expect(
      screen.getByRole("link", { name: "Apply to volunteer" }),
    ).toHaveAttribute("href", "/hack/fall-2026/volunteer-application");
  });

  it("reserves space while events load", () => {
    useHackathonEvents.mockReturnValue({ hackathons: [], loading: true });
    render(<VolunteersGuide />);
    expect(screen.getByText("Loading events…")).toBeInTheDocument();
  });
});
