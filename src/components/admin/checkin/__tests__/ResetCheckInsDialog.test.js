import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import ResetCheckInsDialog from "../ResetCheckInsDialog";

const PEOPLE = [
  { id: "a", name: "Early Online", volunteerType: "mentor", checkInTime: "2026-11-01T09:00:00-07:00" },
  { id: "b", name: "Day-of Desk", volunteerType: "mentor", checkedInAt: "2026-11-14T17:00:00Z" },
  { id: "c", name: "A Judge", volunteerType: "judge", checkedInAt: "2026-11-01T17:00:00Z" },
];

it("defaults to mentors, selects all, and can narrow to pre-event check-ins", () => {
  const onConfirm = jest.fn();
  render(
    <ResetCheckInsDialog
      open
      onClose={jest.fn()}
      people={PEOPLE}
      eventStartDate="2026-11-14"
      timezone="America/Phoenix"
      onConfirm={onConfirm}
    />,
  );
  expect(screen.queryByText("A Judge")).toBeNull();
  expect(screen.getByText(/nobody is notified/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /reset 2 mentor check-ins/i })).toBeEnabled();

  fireEvent.click(screen.getByRole("button", { name: /before the event starts \(1\)/i }));
  fireEvent.click(screen.getByRole("button", { name: /reset 1 mentor check-in$/i }));
  expect(onConfirm).toHaveBeenCalledWith("mentor", ["a"], { all: false });

  fireEvent.click(screen.getByRole("button", { name: /select none/i }));
  expect(screen.getByRole("button", { name: /reset 0 mentor check-ins/i })).toBeDisabled();
});
