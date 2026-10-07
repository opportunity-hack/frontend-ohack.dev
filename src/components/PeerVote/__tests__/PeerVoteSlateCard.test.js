import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import PeerVoteSlateCard from "../PeerVoteSlateCard";

const baseItem = {
  team_id: "team-1",
  name: "Team Rocket",
  project_tagline: "Blasting off toward a better nonprofit workflow.",
  project_thumbnail_url: null,
  demo_video_url: null,
  github_links: ["https://github.com/opportunity-hack/team-rocket"],
  users_count: 3,
};

describe("PeerVoteSlateCard", () => {
  it("renders nothing without an item", () => {
    const { container } = render(
      <PeerVoteSlateCard item={null} eventId="2026_fall" />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the team name, tagline and links, and calls onToggle on click", () => {
    const onToggle = jest.fn();
    render(
      <PeerVoteSlateCard
        item={baseItem}
        eventId="2026_fall"
        selected={false}
        onToggle={onToggle}
      />,
    );

    expect(screen.getByText("Team Rocket")).toBeInTheDocument();
    expect(
      screen.getByText("Blasting off toward a better nonprofit workflow."),
    ).toBeInTheDocument();

    const githubLink = screen.getByText("GitHub ↗");
    expect(githubLink).toHaveAttribute(
      "href",
      "https://github.com/opportunity-hack/team-rocket",
    );
    const projectLink = screen.getByText("Project page ↗");
    expect(projectLink).toHaveAttribute("href", "/hack/2026_fall/team/team-1");

    const pickButton = screen.getByRole("button", {
      name: "Pick this project",
    });
    expect(pickButton).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(pickButton);
    expect(onToggle).toHaveBeenCalledWith("team-1");
  });

  it("shows a picked state and stays clickable when selected, even at the pick cap", () => {
    const onToggle = jest.fn();
    render(
      <PeerVoteSlateCard
        item={baseItem}
        eventId="2026_fall"
        selected
        disabled // at max picks, but this card IS the selection
        onToggle={onToggle}
      />,
    );
    const pickButton = screen.getByRole("button", { name: "Picked ✓" });
    expect(pickButton).toHaveAttribute("aria-pressed", "true");
    expect(pickButton).not.toBeDisabled();
    fireEvent.click(pickButton);
    expect(onToggle).toHaveBeenCalledWith("team-1");
  });

  it("disables the pick button for unselected cards once the pick cap is reached", () => {
    render(
      <PeerVoteSlateCard
        item={baseItem}
        eventId="2026_fall"
        selected={false}
        disabled
      />,
    );
    const pickButton = screen.getByRole("button", {
      name: "Pick this project",
    });
    expect(pickButton).toBeDisabled();
    expect(pickButton).toHaveAttribute("title", "You've used all your picks");
  });

  it("toggles the local Watched checkbox via onWatched", () => {
    const onWatched = jest.fn();
    render(
      <PeerVoteSlateCard
        item={baseItem}
        eventId="2026_fall"
        watched={false}
        onWatched={onWatched}
      />,
    );
    const checkbox = screen.getByRole("checkbox", { name: "Watched" });
    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    expect(onWatched).toHaveBeenCalledWith("team-1");
  });

  it("falls back to an initial placeholder when there is no thumbnail or video", () => {
    render(<PeerVoteSlateCard item={baseItem} eventId="2026_fall" />);
    expect(screen.getByText("T")).toBeInTheDocument();
  });
});
