import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

jest.mock("next/link", () => {
  const ReactLib = require("react");
  const MockLink = ReactLib.forwardRef(({ children, href, ...rest }, ref) =>
    ReactLib.createElement("a", { href, ref, ...rest }, children),
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});
jest.mock("../../../lib/judgeApi", () => ({
  __esModule: true,
  default: { getPublicSchedule: jest.fn() },
}));

import judgeApi from "../../../lib/judgeApi";
import { __resetJudgingScheduleCache } from "../../../hooks/use-judging-schedule";
import JudgingAssignmentCard from "../JudgingAssignmentCard";

const schedule = {
  published: true,
  rounds: {
    round1: [
      {
        panel_id: "pA",
        panel_name: "Panel A",
        room: "Room 101",
        judges: [{ id: "j1", name: "Ada" }, { id: "j2", name: "Bob" }],
        teams: [{ id: "t1", name: "Alpha", room: "Room 101", demo_time: null }],
      },
    ],
    round2: [
      {
        panel_id: "pR2",
        panel_name: "Finals",
        room: "Main hall",
        judges: [{ id: "j3", name: "Cy" }],
        teams: [{ id: "t1", name: "Alpha", room: "Main hall", demo_time: "2025-01-01T22:20:00.000Z" }],
      },
    ],
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  __resetJudgingScheduleCache();
});

it("shows panel, room, judges and the Round 2 demo time", async () => {
  judgeApi.getPublicSchedule.mockResolvedValue(schedule);
  const onAvailability = jest.fn();
  render(
    <JudgingAssignmentCard
      eventId="fall-2026"
      teamId="t1"
      eventTimezone="America/Phoenix"
      onAvailabilityChange={onAvailability}
    />,
  );
  expect(await screen.findByText(/Round 1 · Panel A/)).toBeInTheDocument();
  expect(screen.getByText("Judges: Ada, Bob")).toBeInTheDocument();
  expect(screen.getByText(/Round 2 — final · Finals/)).toHaveTextContent("Demo at 3:20 PM");
  expect(screen.getByRole("link", { name: "Full schedule →" })).toHaveAttribute(
    "href",
    "/hack/fall-2026/judging",
  );
  expect(onAvailability).toHaveBeenLastCalledWith(true);
});

it.each([
  ["an unassigned team", schedule, "t9"],
  ["an unpublished schedule", { ...schedule, published: false }, "t1"],
  ["an older backend (404)", null, "t1"],
])("renders nothing for %s", async (_label, data, teamId) => {
  judgeApi.getPublicSchedule.mockResolvedValue(data);
  const { container } = render(<JudgingAssignmentCard eventId="fall-2026" teamId={teamId} />);
  await waitFor(() => expect(judgeApi.getPublicSchedule).toHaveBeenCalled());
  await new Promise((r) => setTimeout(r, 0));
  expect(container).toBeEmptyDOMElement();
});

it("uses a schedule passed by the parent without fetching", () => {
  render(<JudgingAssignmentCard eventId="fall-2026" teamId="t1" schedule={schedule} />);
  expect(screen.getByText(/Round 1 · Panel A/)).toBeInTheDocument();
  expect(judgeApi.getPublicSchedule).not.toHaveBeenCalled();
});
