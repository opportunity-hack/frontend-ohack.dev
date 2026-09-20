import React from "react";
import { render, screen } from "@testing-library/react";
import TeamMasthead from "../TeamMasthead";

describe("TeamMasthead", () => {
  it("renders the 'Create a team' h1 with no team yet", () => {
    render(
      <TeamMasthead
        eventId="e1"
        eventTitle="Fall 2026"
        team={null}
        hasTeam={false}
      />,
    );
    expect(
      screen.getByRole("heading", { level: 1, name: "Create a team" }),
    ).toBeInTheDocument();
  });

  it("renders the 'Your team' h1 plus status/nonprofit/award tags once a team exists", () => {
    render(
      <TeamMasthead
        eventId="e1"
        eventTitle="Fall 2026"
        hasTeam
        nonprofitName="Opportunity Hack Inc."
        team={{
          id: "t1",
          name: "Team Rocket",
          status: "NONPROFIT_SELECTED",
          awards: ["Hackers' Choice"],
        }}
      />,
    );
    expect(
      screen.getByRole("heading", { level: 1, name: "Your team" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Team Rocket")).toBeInTheDocument();
    expect(screen.getByText("Nonprofit Selected")).toBeInTheDocument();
    expect(screen.getByText("Opportunity Hack Inc.")).toBeInTheDocument();
    expect(screen.getByText("Hackers' Choice")).toBeInTheDocument();
  });

  it("prefixes a winning status label with the trophy emoji", () => {
    render(
      <TeamMasthead
        eventId="e1"
        hasTeam
        team={{ id: "t1", name: "Team Rocket", status: "FOUNDING_ENGINEERS" }}
      />,
    );
    expect(
      screen.getByText("🏆 Founding Engineers - 1st Place"),
    ).toBeInTheDocument();
  });

  it("skips the status tag for INACTIVE (the dot elsewhere already conveys it)", () => {
    render(
      <TeamMasthead
        eventId="e1"
        hasTeam
        team={{ id: "t1", name: "Team Rocket", status: "INACTIVE" }}
      />,
    );
    expect(screen.queryByText("Inactive")).not.toBeInTheDocument();
  });
});
