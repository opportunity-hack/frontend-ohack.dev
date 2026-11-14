import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import MentorTeamsTable from "../MentorTeamsTable";

// "Location at Hackathon" is set in the admin Teams section (team.location)
// and arrives on the public event payload; mentors use it to find the team.
const teams = [
  {
    id: "t1",
    name: "Dream",
    active: "True",
    location: "  Table 12, Room 101 ",
  },
  { id: "t2", name: "Karma.js", active: "True" },
];

test("shows a Location column after Availability, trimmed, with a dash when unset", () => {
  render(<MentorTeamsTable teams={teams} eventId="fall-2026" />);

  const headers = screen
    .getAllByRole("columnheader")
    .map((h) => h.textContent.trim());
  expect(headers.indexOf("Location")).toBe(headers.indexOf("Availability") + 1);

  const col = headers.indexOf("Location");
  const cellText = (name) =>
    within(screen.getByText(name).closest("tr"))
      .getAllByRole("cell")
      [col].textContent.trim();
  expect(cellText("Dream")).toBe("Table 12, Room 101");
  expect(cellText("Karma.js")).toBe("—");
});

test("search matches the location", async () => {
  render(<MentorTeamsTable teams={teams} eventId="fall-2026" />);
  fireEvent.change(screen.getByPlaceholderText(/search teams/i), {
    target: { value: "room 101" },
  });
  await waitFor(() => expect(screen.queryByText("Karma.js")).toBeNull());
  expect(screen.getByText("Dream")).toBeInTheDocument();
});
