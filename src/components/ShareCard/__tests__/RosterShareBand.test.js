import React from "react";
import { render, screen } from "@testing-library/react";
import RosterShareBand from "../RosterShareBand";
import ShareCardPromo from "../ShareCardPromo";

jest.mock("../../../lib/ga", () => ({ trackEvent: jest.fn() }));
// jest.setup.js mocks next/link down to bare children; the hrefs ARE the
// assertions here, so render a real anchor (same override as mentor.test).
jest.mock("next/link", () => {
  const ReactLib = require("react");
  const MockLink = ReactLib.forwardRef(({ children, href, ...rest }, ref) =>
    ReactLib.createElement("a", { href, ref, ...rest }, children),
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

const EVENT = { event_id: "fall-2026", title: "ASU Fall Hackathon 2026 | Phoenix Hackathon for Nonprofits" };

describe("RosterShareBand", () => {
  it("renders nothing without a selected role", () => {
    const { container } = render(<RosterShareBand event={EVENT} roles={[]} />);
    expect(container).toBeEmptyDOMElement();
    const { container: c2 } = render(
      <RosterShareBand event={EVENT} roles={[{ type: "judge", id: "v1", isSelected: false }]} />,
    );
    expect(c2).toBeEmptyDOMElement();
  });

  it("links each selected role to its share kit", () => {
    render(
      <RosterShareBand
        event={EVENT}
        roles={[
          { type: "judge", id: "v1", isSelected: true },
          { type: "mentor", id: "v2", isSelected: true },
          { type: "sponsor", id: "v3", isSelected: true },
        ]}
      />,
    );
    expect(screen.getByText(/you're judging Opportunity Hack Fall 2026/)).toBeInTheDocument();
    expect(screen.getByText(/you're mentoring at Opportunity Hack Fall 2026/)).toBeInTheDocument();
    const links = screen.getAllByRole("link", { name: /Get your share card/ });
    expect(links.map((l) => l.getAttribute("href"))).toEqual([
      "/hack/fall-2026/share/judge/v1#kit",
      "/hack/fall-2026/share/mentor/v2#kit",
    ]);
  });

  it("uses past tense after the event", () => {
    render(
      <RosterShareBand event={EVENT} tense="past" roles={[{ type: "hacker", id: "v1", isSelected: true }]} />,
    );
    expect(screen.getByText(/you're hacked at Opportunity Hack Fall 2026/)).toBeInTheDocument();
  });
});

describe("ShareCardPromo", () => {
  it("renders the og thumbnail and a #kit link, nothing without an id", () => {
    const { container } = render(<ShareCardPromo eventId="fall-2026" type="judge" volunteerId="" event={EVENT} />);
    expect(container).toBeEmptyDOMElement();
    render(<ShareCardPromo eventId="fall-2026" type="judge" volunteerId="v1" event={EVENT} page="judge_application" />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "/api/share-card/fall-2026/judge/v1?format=og");
    expect(screen.getByRole("link", { name: /Get your share card/ })).toHaveAttribute(
      "href",
      "/hack/fall-2026/share/judge/v1#kit",
    );
  });
});
