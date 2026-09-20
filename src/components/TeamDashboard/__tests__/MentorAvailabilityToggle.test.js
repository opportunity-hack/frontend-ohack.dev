import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MentorAvailabilityToggle from "../MentorAvailabilityToggle";
import { setMentorAvailability, ApiError } from "../../../lib/teamDashboardApi";

jest.mock("../../../lib/teamDashboardApi", () => {
  const actual = jest.requireActual("../../../lib/teamDashboardApi");
  return { ...actual, setMentorAvailability: jest.fn() };
});

describe("MentorAvailabilityToggle", () => {
  beforeEach(() => {
    setMentorAvailability.mockReset();
  });

  it("defaults to 'Open to mentors' selected when mentor_help_wanted is absent", () => {
    render(
      <MentorAvailabilityToggle
        team={{ id: "t1" }}
        accessToken="tok"
        onTeamUpdated={() => {}}
      />,
    );
    const open = screen.getByRole("radio", { name: "Open to mentors" });
    expect(open).toHaveAttribute("aria-checked", "true");
  });

  it("switches to Heads-down, saves, and reports the change via onTeamUpdated", async () => {
    setMentorAvailability.mockResolvedValueOnce({ success: true });
    const onTeamUpdated = jest.fn();
    render(
      <MentorAvailabilityToggle
        team={{ id: "t1" }}
        accessToken="tok"
        onTeamUpdated={onTeamUpdated}
      />,
    );

    fireEvent.click(screen.getByRole("radio", { name: "Heads-down" }));

    await waitFor(() =>
      expect(setMentorAvailability).toHaveBeenCalledWith("t1", false, "tok"),
    );
    expect(onTeamUpdated).toHaveBeenCalledWith("t1", {
      mentor_help_wanted: false,
    });
    expect(screen.getByRole("radio", { name: "Heads-down" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("reverts the optimistic selection when the save fails", async () => {
    setMentorAvailability.mockRejectedValueOnce(new Error("network down"));
    render(
      <MentorAvailabilityToggle
        team={{ id: "t1" }}
        accessToken="tok"
        onTeamUpdated={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("radio", { name: "Heads-down" }));

    await waitFor(() => expect(setMentorAvailability).toHaveBeenCalled());
    await waitFor(() =>
      expect(
        screen.getByRole("radio", { name: "Open to mentors" }),
      ).toHaveAttribute("aria-checked", "true"),
    );
  });

  it("hides itself entirely on a 404 (older backend)", async () => {
    setMentorAvailability.mockRejectedValueOnce(
      new ApiError(404, { error: "not_found" }),
    );
    const { container } = render(
      <MentorAvailabilityToggle
        team={{ id: "t1" }}
        accessToken="tok"
        onTeamUpdated={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("radio", { name: "Heads-down" }));

    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});
