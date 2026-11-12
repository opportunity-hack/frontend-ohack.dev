/**
 * ProjectBrowser + ProjectRanking: one toggle per project (aria-pressed),
 * max 5, ↑/↓ reorder, remove. Rendered together with real state, the way
 * the create flow wires them.
 */
import React, { useState } from "react";

// Drag-and-drop is exercised in the browser; here a pass-through keeps the
// ↑/↓ path (the keyboard/screen-reader one) under test without dnd's
// jsdom "unexpected store change" noise.
jest.mock("@hello-pangea/dnd", () => ({
  DragDropContext: ({ children }) => children,
  Droppable: ({ children }) =>
    children({ innerRef: () => {}, droppableProps: {}, placeholder: null }),
  Draggable: ({ children }) =>
    children({ innerRef: () => {}, draggableProps: {}, dragHandleProps: {} }),
}));
import { fireEvent, render, screen, within } from "@testing-library/react";
import ProjectBrowser from "../ProjectBrowser";
import ProjectRanking from "../ProjectRanking";
import {
  moveProject,
  normalizeProjectOptions,
  rankingLimits,
  toggleProject,
} from "../../../lib/projectRanking";

const NPOS = normalizeProjectOptions({
  nonprofits: [
    {
      id: "np1",
      name: "Food Bank",
      projects: [
        {
          id: "p1",
          title: "Scheduler",
          description: "Shifts",
          skills: ["React"],
        },
        { id: "p2", title: "Inventory", skills: ["Python"] },
        { id: "p3", title: "Donor CRM", skills: ["SQL"] },
      ],
    },
    {
      id: "np2",
      name: "Animal Rescue",
      projects: [
        { id: "p4", title: "Adoptions", skills: [] },
        { id: "p5", title: "Foster map", skills: [] },
        { id: "p6", title: "Vet records", skills: [] },
      ],
    },
  ],
});

function Harness() {
  const limits = rankingLimits(6);
  const [ranked, setRanked] = useState([]);
  return (
    <>
      <ProjectRanking
        ranked={ranked}
        limits={limits}
        onMove={(from, to) => setRanked((p) => moveProject(p, from, to))}
        onRemove={(e) =>
          setRanked((p) => p.filter((r) => r.projectId !== e.projectId))
        }
      />
      <ProjectBrowser
        nonprofits={NPOS}
        ranked={ranked}
        max={limits.max}
        onToggle={(e) => setRanked((p) => toggleProject(p, e, limits.max))}
      />
    </>
  );
}

const addButtons = () =>
  screen.getAllByRole("button", { name: "Add to my ranking" });
const rankedTitles = () =>
  within(screen.getByRole("list", { name: "Ranked projects" }))
    .getAllByRole("listitem")
    .map((li) => li.textContent);

it("one click adds a project (aria-pressed) and a second removes it", () => {
  render(<Harness />);
  const [first] = addButtons();
  expect(first).toHaveAttribute("aria-pressed", "false");
  fireEvent.click(first);
  const pressed = screen.getByRole("button", { name: "Ranked #1 · Remove" });
  expect(pressed).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByText("1 of 2–5 ranked")).toBeInTheDocument();
  fireEvent.click(pressed);
  expect(screen.getByText("0 of 2–5 ranked")).toBeInTheDocument();
});

it("disables the 6th add with a hint once 5 are ranked", () => {
  render(<Harness />);
  for (let i = 0; i < 5; i += 1) fireEvent.click(addButtons()[0]);
  expect(screen.getByText("5 of 2–5 ranked")).toBeInTheDocument();
  const [sixth] = addButtons();
  expect(sixth).toBeDisabled();
  expect(
    screen.getByText("You've ranked 5 — remove one to add another."),
  ).toBeInTheDocument();
  // two from the same nonprofit are fine
  expect(rankedTitles().filter((t) => t.includes("Food Bank"))).toHaveLength(3);
});

it("reorders with the ↑/↓ buttons and removes with ×", () => {
  render(<Harness />);
  fireEvent.click(addButtons()[0]); // Scheduler
  fireEvent.click(addButtons()[0]); // Inventory
  expect(rankedTitles()[0]).toContain("Scheduler");
  expect(
    screen.getByRole("button", { name: "Move Scheduler up" }),
  ).toBeDisabled();

  fireEvent.click(screen.getByRole("button", { name: "Move Inventory up" }));
  expect(rankedTitles()[0]).toContain("Inventory");
  expect(rankedTitles()[0]).toContain("Top choice");

  fireEvent.click(
    screen.getByRole("button", { name: "Remove Inventory from your ranking" }),
  );
  expect(rankedTitles()).toHaveLength(1);
  expect(rankedTitles()[0]).toContain("Scheduler");
});

it("searches by skill and offers a way to clear an empty search", () => {
  render(<Harness />);
  const search = screen.getByLabelText("Search by nonprofit, project or skill");
  fireEvent.change(search, { target: { value: "python" } });
  expect(screen.getByText("Inventory")).toBeInTheDocument();
  expect(screen.queryByText("Scheduler")).toBeNull();
  fireEvent.change(search, { target: { value: "nothing-matches" } });
  fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
  expect(screen.getByText("Scheduler")).toBeInTheDocument();
});
