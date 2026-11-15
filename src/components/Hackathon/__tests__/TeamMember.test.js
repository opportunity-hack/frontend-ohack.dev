import React from "react";
import { render, screen } from "@testing-library/react";

import TeamMember from "../TeamMember";

// The event page's winner cards. Members arrive as `{ id, user_id, … }`:
// `id` is the user document id (what /profile/<id> expects), `user_id` is the
// login provider's id and must never end up in a link.
describe("TeamMember profile link", () => {
  it("links to the member's document id, not their login id", () => {
    render(
      <TeamMember
        user={{
          id: "AbC123docId",
          user_id: "oauth2|google-oauth2|115019633184572040168",
          name: "Sam Rivera",
        }}
      />,
    );

    const link = screen.getByRole("link", { name: "Sam Rivera's profile" });
    expect(link).toHaveAttribute("href", "/profile/AbC123docId");
    expect(link.getAttribute("href")).not.toContain("oauth2");
  });

  it("links a plain id string (older payload shape)", () => {
    render(<TeamMember user="doc42" />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/profile/doc42");
  });

  it("shows the member without a link when there is no document id", () => {
    render(
      <TeamMember user={{ user_id: "oauth2|slack|T1-U1", name: "Bo Chen" }} />,
    );

    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByLabelText("Bo Chen")).toBeInTheDocument();
  });
});
