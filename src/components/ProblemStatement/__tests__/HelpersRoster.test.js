import React from "react";
import { render, screen, within, fireEvent } from "@testing-library/react";
import HelpersRoster, { ROSTER_PREVIEW_LIMIT, summarizeCounts } from "../HelpersRoster";

// The global jest.setup mock renders next/link as bare children (no <a>);
// the roster's profile links are the point here, so render a real anchor.
jest.mock("next/link", () => {
  const React = require("react");
  const MockLink = React.forwardRef(({ children, href, ...rest }, ref) =>
    React.createElement("a", { href, ref, ...rest }, children),
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

const NOW = new Date("2025-06-10T12:00:00Z");

const helpers = [
  { db_id: "bob", user_id: "oauth2|google-oauth2|9", type: "mentor", since: "2025-04-29T04:16:16Z", name: "Bob Byte", nickname: "bob", profile_image: null },
  { db_id: "alice", user_id: "oauth2|slack|T-UA", type: "hacker", since: "2025-06-09T01:31:16Z", name: "Alice Ada", nickname: "alice", profile_image: "https://cdn/alice.png" },
  { db_id: "ghost", user_id: "oauth2|slack|T-UG", type: "hacker", since: null, name: null, nickname: null, profile_image: null },
];

describe("HelpersRoster", () => {
  it("splits developers and mentors, links to profiles and shows when they started", () => {
    render(<HelpersRoster helpers={helpers} slackChannel="npo-roster" profile={{ id: "alice" }} now={NOW} />);

    expect(screen.getByText("Who’s helping")).toBeInTheDocument();
    expect(screen.getByText("3 people have raised a hand")).toBeInTheDocument();
    expect(screen.getByText("Developers (2)")).toBeInTheDocument();
    expect(screen.getByText("Mentor (1)")).toBeInTheDocument();

    const alice = screen.getByRole("link", { name: /Alice Ada/ });
    expect(alice).toHaveAttribute("href", "/profile/alice");
    expect(within(alice).getByText("· you")).toBeInTheDocument();
    expect(within(alice).getByText("since 1 day ago")).toBeInTheDocument();

    const bob = screen.getByRole("link", { name: /Bob Byte/ });
    expect(within(bob).getByText("since Apr 2025")).toBeInTheDocument();

    // Nameless legacy row still counts, with a neutral label and no date
    expect(screen.getByText("Community member")).toBeInTheDocument();

    const slack = screen.getByRole("link", { name: /npo-roster/ });
    expect(slack).toHaveAttribute(
      "href",
      "https://opportunity-hack.slack.com/app_redirect?channel=npo-roster",
    );
    expect(slack).toHaveAttribute("target", "_blank");
    expect(screen.getByText(/Say hi to them in/)).toBeInTheDocument();
  });

  it("renders the recruiting empty state and the help toggle slot", () => {
    render(
      <HelpersRoster helpers={[]} slackChannel="npo-empty" offerHelp helpToggle={<button>Want to help?</button>} />,
    );
    expect(screen.getByText(/Nobody has raised a hand yet/)).toBeInTheDocument();
    expect(screen.getByText(/The conversation for this project happens in/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Want to help?" })).toBeInTheDocument();
  });

  it("uses a calmer empty state when the project is not recruiting", () => {
    render(<HelpersRoster helpers={[]} offerHelp={false} />);
    expect(screen.getByText(/No one is signed up on this project right now/)).toBeInTheDocument();
    expect(screen.queryByText(/Slack/)).not.toBeInTheDocument();
  });

  it("shows a loading line while the enriched roster is in flight instead of nameless chips", () => {
    const pending = helpers.map((h) => ({ ...h, name: null, nickname: null }));
    render(<HelpersRoster helpers={pending} loading enriched={false} />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading 3 helpers…");
    expect(screen.queryByText("Community member")).not.toBeInTheDocument();
  });

  it("falls back to a counts-only line when the roster endpoint is unavailable", () => {
    const pending = helpers.map((h) => ({ ...h, name: null, nickname: null }));
    render(<HelpersRoster helpers={pending} enriched={false} />);
    expect(screen.getByText("2 developers and 1 mentor have raised a hand.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Community member/ })).not.toBeInTheDocument();
    expect(summarizeCounts([{ type: "hacker" }])).toBe("1 developer has raised a hand.");
    expect(summarizeCounts([])).toBe("");
  });

  it("collapses long groups behind a +N more button", () => {
    const many = Array.from({ length: ROSTER_PREVIEW_LIMIT + 3 }, (_, i) => ({
      db_id: `u${i}`, type: "hacker", since: "2025-01-01T00:00:00Z", name: `Person ${i}`,
    }));
    render(<HelpersRoster helpers={many} />);
    expect(screen.getAllByRole("link")).toHaveLength(ROSTER_PREVIEW_LIMIT);
    fireEvent.click(screen.getByRole("button", { name: "+3 more" }));
    expect(screen.getAllByRole("link")).toHaveLength(ROSTER_PREVIEW_LIMIT + 3);
  });
});
