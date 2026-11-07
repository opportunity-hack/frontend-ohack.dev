import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("../../../../lib/ga", () => ({ trackEvent: jest.fn() }));

import VolunteerChecklist, {
  CHECKLIST_TOTAL,
  STORAGE_KEY,
  VOLUNTEER_CHECKLIST,
} from "../VolunteerChecklist";
import { trackEvent } from "../../../../lib/ga";

describe("VolunteerChecklist", () => {
  beforeEach(() => {
    window.localStorage.clear();
    trackEvent.mockClear();
  });

  it("renders every item unchecked with a zero progress bar", () => {
    render(<VolunteerChecklist />);
    expect(screen.getAllByRole("checkbox")).toHaveLength(CHECKLIST_TOTAL);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
    expect(screen.getByText(`0 of ${CHECKLIST_TOTAL} done`)).toBeInTheDocument();
    expect(screen.queryByText("Reset checklist")).not.toBeInTheDocument();
  });

  it("ticks persist to localStorage and hydrate on the next mount", () => {
    const first = VOLUNTEER_CHECKLIST[0].items[0];
    const { unmount } = render(<VolunteerChecklist />);
    fireEvent.click(screen.getByLabelText(first.title));
    expect(screen.getByText(`1 of ${CHECKLIST_TOTAL} done`)).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY))).toEqual({
      [first.id]: true,
    });
    expect(trackEvent).toHaveBeenCalledWith({
      action: "click_volunteers",
      params: { button: "checklist_toggle", item: first.id },
    });
    unmount();

    render(<VolunteerChecklist />);
    expect(screen.getByLabelText(first.title)).toBeChecked();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      String(Math.round((1 / CHECKLIST_TOTAL) * 100)),
    );
  });

  it("reset clears every tick and the stored state", () => {
    const first = VOLUNTEER_CHECKLIST[0].items[0];
    render(<VolunteerChecklist />);
    fireEvent.click(screen.getByLabelText(first.title));
    fireEvent.click(screen.getByText("Reset checklist"));
    expect(screen.getByLabelText(first.title)).not.toBeChecked();
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY))).toEqual({});
  });

  it("survives a broken localStorage value", () => {
    window.localStorage.setItem(STORAGE_KEY, "{not json");
    render(<VolunteerChecklist />);
    expect(screen.getByText(`0 of ${CHECKLIST_TOTAL} done`)).toBeInTheDocument();
  });
});
