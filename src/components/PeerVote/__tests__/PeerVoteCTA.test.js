import React from "react";
import { render, screen } from "@testing-library/react";
import PeerVoteCTA from "../PeerVoteCTA";

// The global jest.setup mock renders next/link as bare children (no <a>);
// this component's href is the point of one assertion below, so render a
// real anchor (same override as HelpersRoster.test.js).
jest.mock("next/link", () => {
  const ReactLib = require("react");
  const MockLink = ReactLib.forwardRef(({ children, href, ...rest }, ref) =>
    ReactLib.createElement("a", { href, ref, ...rest }, children)
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

const NOW_ISO = "2026-09-19T12:00:00.000Z";

describe("PeerVoteCTA", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(NOW_ISO));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const openDeadlines = {
    voting_opens: "2026-09-19T00:00:00.000Z",
    voting_closes: "2026-09-25T00:00:00.000Z",
  };
  const enabled = { peer_vote_enabled: true };

  it("renders nothing without an eventId", () => {
    const { container } = render(
      <PeerVoteCTA eventId={null} deadlines={openDeadlines} constraints={enabled} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when peer voting is disabled", () => {
    const { container } = render(
      <PeerVoteCTA eventId="2026_fall" deadlines={openDeadlines} constraints={{}} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing once voting has closed", () => {
    const { container } = render(
      <PeerVoteCTA
        eventId="2026_fall"
        deadlines={{ voting_opens: "2026-09-01T00:00:00Z", voting_closes: "2026-09-10T00:00:00Z" }}
        constraints={enabled}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when voting opens more than 24h from now", () => {
    const { container } = render(
      <PeerVoteCTA
        eventId="2026_fall"
        deadlines={{ voting_opens: "2026-09-25T00:00:00Z", voting_closes: "2026-09-30T00:00:00Z" }}
        constraints={enabled}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders an open-voting CTA linking to the vote page", () => {
    render(<PeerVoteCTA eventId="2026_fall" deadlines={openDeadlines} constraints={enabled} />);
    expect(screen.getByText("Vote for Hackers' Choice")).toBeInTheDocument();
    const link = screen.getByText("Vote now →");
    expect(link).toHaveAttribute("href", "/hack/2026_fall/vote");
  });

  it("renders an opening-soon CTA when voting opens within 24h", () => {
    render(
      <PeerVoteCTA
        eventId="2026_fall"
        deadlines={{ voting_opens: "2026-09-20T06:00:00.000Z", voting_closes: "2026-09-25T00:00:00Z" }}
        constraints={enabled}
      />
    );
    expect(screen.getByText("Voting opens soon")).toBeInTheDocument();
    expect(screen.getByText("Learn more →")).toBeInTheDocument();
  });

  it("uses dashboard-flavored copy for variant=\"dashboard\"", () => {
    render(
      <PeerVoteCTA
        eventId="2026_fall"
        deadlines={openDeadlines}
        constraints={enabled}
        variant="dashboard"
      />
    );
    expect(
      screen.getByText(/pick a couple of projects you'd be proud to have built/i)
    ).toBeInTheDocument();
  });

  it("defaults to event-page copy", () => {
    render(<PeerVoteCTA eventId="2026_fall" deadlines={openDeadlines} constraints={enabled} />);
    expect(screen.getByText(/personal slate of projects to review/i)).toBeInTheDocument();
  });
});
