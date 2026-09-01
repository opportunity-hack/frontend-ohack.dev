import React from "react";
import { render, screen } from "@testing-library/react";
import LocationDemographicsStep from "../LocationDemographicsStep";

const MEALS = [
  { id: "m1", name: "Saturday Lunch", time: "2026-10-10T12:00:00", items: [] },
  {
    id: "m2",
    name: "Saturday Dinner",
    time: "2026-10-10T18:00:00",
    items: [
      { id: "i1", name: "Veggie bowl" },
      { id: "i2", name: "Chicken bowl" },
    ],
  },
];

const renderStep = (eventData) =>
  render(
    <LocationDemographicsStep
      formData={{}}
      setFormData={jest.fn()}
      handleChange={jest.fn()}
      eventData={eventData}
    />,
  );

describe("LocationDemographicsStep meals rendering", () => {
  it("renders the item picker by default when meals are configured", () => {
    renderStep({
      isOnlineEvent: false,
      constraints: { meals: MEALS },
    });
    expect(screen.getByText("Meal selections")).toBeInTheDocument();
    expect(screen.queryByText("Meal schedule")).not.toBeInTheDocument();
    expect(screen.getAllByRole("radio").length).toBeGreaterThan(0);
  });

  it("renders the read-only schedule when meals_mode is 'schedule'", () => {
    renderStep({
      isOnlineEvent: false,
      constraints: {
        meals: MEALS,
        meals_mode: "schedule",
        meals_note: "Breakfast, lunch, and dinner are on us.",
      },
    });
    expect(screen.getByText("Meal schedule")).toBeInTheDocument();
    expect(
      screen.getByText("Breakfast, lunch, and dinner are on us."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Meal selections")).not.toBeInTheDocument();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    // Menu items never render in schedule mode
    expect(screen.queryByText("Veggie bowl")).not.toBeInTheDocument();
  });

  it("renders no meal section for online events regardless of mode", () => {
    renderStep({
      isOnlineEvent: true,
      constraints: { meals: MEALS, meals_mode: "schedule" },
    });
    expect(screen.queryByText("Meal schedule")).not.toBeInTheDocument();
    expect(screen.queryByText("Meal selections")).not.toBeInTheDocument();
  });

  it("renders no meal section when no meals are configured", () => {
    renderStep({
      isOnlineEvent: false,
      constraints: { meals_mode: "schedule" },
    });
    expect(screen.queryByText("Meal schedule")).not.toBeInTheDocument();
    expect(screen.queryByText("Meal selections")).not.toBeInTheDocument();
  });
});
