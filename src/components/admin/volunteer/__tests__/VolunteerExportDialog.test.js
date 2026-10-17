import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import VolunteerExportDialog from "../VolunteerExportDialog";

jest.mock("../../../../lib/csvExport", () => {
  const actual = jest.requireActual("../../../../lib/csvExport");
  return { ...actual, downloadCsv: jest.fn() };
});
jest.mock("../../../../lib/ga", () => ({
  EventCategory: { ADMIN: "admin" },
  trackStructuredEvent: jest.fn(),
}));

const { downloadCsv } = jest.requireMock("../../../../lib/csvExport");
const ga = jest.requireMock("../../../../lib/ga");

const judges = [
  {
    id: "a",
    name: "Ada",
    email: "ada@x.org",
    status: "approved",
    isSelected: true,
    checkedIn: true,
  },
  {
    id: "b",
    name: "Bob",
    email: "bob@x.org",
    status: "pending",
    isSelected: false,
  },
  {
    id: "c",
    name: "Cy",
    email: "cy@x.org",
    status: "denied",
    isSelected: true,
  },
  {
    id: "d",
    name: "Di",
    email: "di@x.org",
    status: "approved",
    isSelected: false,
  },
];

const renderDialog = (props = {}) =>
  render(
    <VolunteerExportDialog
      open
      onClose={jest.fn()}
      type="judges"
      volunteers={judges}
      eventId="fall-2026"
      filterState={{
        statusFilter: "all",
        selectedFilter: "all",
        preset: "none",
        checkedInFilter: "all",
        filter: "",
      }}
      searchText=""
      {...props}
    />,
  );

describe("VolunteerExportDialog", () => {
  beforeEach(() => jest.clearAllMocks());

  it("defaults to everyone and narrows by roster + status with live counts", () => {
    renderDialog();
    expect(screen.getByText(/4 of 4 judges/)).toBeInTheDocument();
    expect(screen.getByLabelText(/On roster \(2\)/)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/On roster \(2\)/));
    expect(screen.getByText(/2 of 4 judges/)).toBeInTheDocument();
    // status counts re-scope to the roster choice
    expect(screen.getByLabelText(/Approved \(1\)/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Denied \(1\)/)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/Denied \(1\)/)); // uncheck
    expect(screen.getByText(/1 of 4 judges/)).toBeInTheDocument();
  });

  it("seeds from the tab's current filters", () => {
    renderDialog({
      filterState: {
        statusFilter: "approved",
        selectedFilter: "no",
        preset: "none",
        checkedInFilter: "all",
        filter: "",
      },
    });
    expect(screen.getByText(/1 of 4 judges/)).toBeInTheDocument(); // Di: approved + not on roster
    expect(screen.getByLabelText(/Not on roster/)).toBeChecked();
    expect(screen.getByLabelText(/Approved \(1\)/)).toBeChecked();
    expect(screen.getByLabelText(/Pending review \(1\)/)).not.toBeChecked();
  });

  it("offers to keep view-only filters and downloads a scoped file", () => {
    const onClose = jest.fn();
    renderDialog({ onClose, searchText: "ada" });
    expect(
      screen.getByLabelText(/Keep the current view's other filters/),
    ).toBeChecked();
    expect(screen.getByText(/1 of 4 judges/)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/On roster \(1\)/));
    fireEvent.click(screen.getByRole("button", { name: /Download CSV/ }));

    expect(downloadCsv).toHaveBeenCalledTimes(1);
    const [filename, csv] = downloadCsv.mock.calls[0];
    expect(filename).toMatch(
      /^fall-2026-judges-on-roster-\d{4}-\d{2}-\d{2}\.csv$/,
    );
    expect(csv.split("\r\n")).toHaveLength(2);
    expect(csv).toMatch(
      /^Name,Email,Application status,On event roster,Checked in,/,
    );
    expect(csv).toContain("Ada,ada@x.org,Approved,Yes,Yes");
    expect(ga.trackStructuredEvent).toHaveBeenCalledWith(
      "admin",
      "admin_csv_export",
      "volunteer_judges",
      1,
      expect.objectContaining({
        event_id: "fall-2026",
        roster: "yes",
        kept_view_filters: true,
      }),
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("disables download when nothing matches", () => {
    renderDialog();
    fireEvent.click(screen.getByRole("button", { name: /^None$/ }));
    expect(
      screen.getByText(/No judges match these filters/),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Download CSV/ })).toBeDisabled();
  });
});
