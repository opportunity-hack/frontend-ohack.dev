import React from "react";
import { render, screen } from "@testing-library/react";
import MealSchedule, {
  MEALS_MODE_MENU,
  MEALS_MODE_SCHEDULE,
  getMealsMode,
  formatMealTime,
} from "../MealSchedule";

describe("getMealsMode", () => {
  it("defaults to menu mode for missing or empty constraints", () => {
    expect(getMealsMode(undefined)).toBe(MEALS_MODE_MENU);
    expect(getMealsMode(null)).toBe(MEALS_MODE_MENU);
    expect(getMealsMode({})).toBe(MEALS_MODE_MENU);
    expect(getMealsMode({ meals_mode: null })).toBe(MEALS_MODE_MENU);
    expect(getMealsMode({ meals_mode: "" })).toBe(MEALS_MODE_MENU);
  });

  it("treats unknown values as menu mode", () => {
    expect(getMealsMode({ meals_mode: "buffet" })).toBe(MEALS_MODE_MENU);
    expect(getMealsMode({ meals_mode: 42 })).toBe(MEALS_MODE_MENU);
  });

  it("returns schedule mode only when explicitly set", () => {
    expect(getMealsMode({ meals_mode: "schedule" })).toBe(MEALS_MODE_SCHEDULE);
    expect(getMealsMode({ meals_mode: "menu" })).toBe(MEALS_MODE_MENU);
  });
});

describe("formatMealTime", () => {
  it("returns empty string for falsy values", () => {
    expect(formatMealTime("")).toBe("");
    expect(formatMealTime(null)).toBe("");
    expect(formatMealTime(undefined)).toBe("");
  });

  it("formats ISO datetimes for humans", () => {
    // Local ISO (no zone suffix) keeps the assertion timezone-independent.
    expect(formatMealTime("2026-10-10T19:00:00")).toBe("Sat Oct 10, 7:00 PM");
  });

  it("passes legacy free-text times through untouched", () => {
    expect(formatMealTime("Saturday around noon")).toBe(
      "Saturday around noon",
    );
  });
});

describe("MealSchedule", () => {
  const meals = [
    {
      id: "m1",
      name: "Saturday Lunch",
      time: "2026-10-10T12:00:00",
      dietary_tags: ["vegetarian"],
    },
    {
      id: "m2",
      name: "Saturday Dinner",
      time: "Saturday evening",
      catering_provided: false,
    },
  ];

  it("renders nothing when there are no meals", () => {
    const { container } = render(<MealSchedule meals={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows each meal with a human-readable time and no inputs", () => {
    render(<MealSchedule meals={meals} />);
    expect(screen.getByText("Meal schedule")).toBeInTheDocument();
    expect(screen.getByText("Saturday Lunch")).toBeInTheDocument();
    expect(screen.getByText("Sat Oct 10, 12:00 PM")).toBeInTheDocument();
    expect(screen.getByText("Saturday evening")).toBeInTheDocument();
    // Read-only: nothing for the hacker to select
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("renders slot dietary tags", () => {
    render(<MealSchedule meals={meals} />);
    expect(
      screen.getByText("✓ vegetarian options available"),
    ).toBeInTheDocument();
  });

  it("flags meals without catering", () => {
    render(<MealSchedule meals={meals} />);
    expect(
      screen.getByText(/Catering isn't provided for this meal/),
    ).toBeInTheDocument();
  });

  it("shows the optional event note above the schedule", () => {
    render(
      <MealSchedule meals={meals} note="Vegan options at every meal." />,
    );
    expect(
      screen.getByText("Vegan options at every meal."),
    ).toBeInTheDocument();
  });

  it("omits the note paragraph when no note is set", () => {
    render(<MealSchedule meals={meals} />);
    expect(screen.queryByText(/every meal\./)).not.toBeInTheDocument();
  });
});
