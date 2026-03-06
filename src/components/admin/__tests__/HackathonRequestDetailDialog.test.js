import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, createTheme } from "@mui/material";
import HackathonRequestDetailDialog from "../HackathonRequestDetailDialog";

const theme = createTheme();

const mockRequest = {
  id: "req-123",
  companyName: "Test Corporation",
  organizationType: "corporate",
  contactName: "Jane Doe",
  contactEmail: "jane@testcorp.com",
  contactPhone: "555-0123",
  employeeCount: "200",
  eventFormat: "in-person",
  location: "San Francisco, CA",
  participantType: ["internal-staff", "students"],
  hackathonTheme: "social-impact",
  expectedHackathonDate: "2025-11-15T00:00:00",
  preferredDate: "2025-08-08T00:00:00",
  alternateDate: "2025-08-15T00:00:00",
  hasNonprofitList: "partial",
  hasWorkedWithNonprofitsBefore: "yes",
  nonprofitDetails: "Local food bank, animal shelter",
  nonprofitSource: ["ohack-support"],
  preferredNonprofitLocation: "local",
  responsibilities: {
    venue: "requestor",
    food: "requestor",
    prizes: "shared",
    judges: "ohack",
    mentors: "shared",
    marketing: "requestor",
    nonprofitRecruitment: "shared",
    participantRecruitment: "requestor",
    postEventSupport: "shared",
  },
  budget: 25000,
  donationPercentage: 20,
  additionalInfo: "We want to focus on education nonprofits.",
  status: "pending",
  created: "2025-07-01T10:00:00",
  updated: "2025-07-05T14:30:00",
  adminNotes: "",
};

const renderDialog = (props = {}) => {
  return render(
    <ThemeProvider theme={theme}>
      <HackathonRequestDetailDialog
        open={true}
        onClose={jest.fn()}
        request={mockRequest}
        onSave={jest.fn()}
        {...props}
      />
    </ThemeProvider>
  );
};

describe("HackathonRequestDetailDialog", () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSave.mockClear();
  });

  it("should not render when request is null", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <HackathonRequestDetailDialog
          open={true}
          onClose={mockOnClose}
          request={null}
          onSave={mockOnSave}
        />
      </ThemeProvider>
    );

    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it("should display organization name in title", () => {
    renderDialog();
    const matches = screen.getAllByText("Test Corporation");
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("should display contact information", () => {
    renderDialog();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@testcorp.com")).toBeInTheDocument();
    expect(screen.getByText("555-0123")).toBeInTheDocument();
  });

  it("should display event details", () => {
    renderDialog();
    expect(screen.getByText("~200")).toBeInTheDocument();
    expect(screen.getByText("San Francisco, CA")).toBeInTheDocument();
  });

  it("should display budget information", () => {
    renderDialog();
    expect(screen.getByText("$25,000")).toBeInTheDocument();
    expect(screen.getByText("20%")).toBeInTheDocument();
    expect(screen.getByText("$5,000")).toBeInTheDocument(); // 25000 * 0.20
  });

  it("should display additional information", () => {
    renderDialog();
    expect(
      screen.getByText("We want to focus on education nonprofits.")
    ).toBeInTheDocument();
  });

  it("should display request ID", () => {
    renderDialog();
    expect(screen.getByText(/req-123/)).toBeInTheDocument();
  });

  it("should display responsibility divisions", () => {
    renderDialog();
    expect(screen.getByText("Venue & Equipment")).toBeInTheDocument();
    expect(screen.getByText("Food & Refreshments")).toBeInTheDocument();
    expect(screen.getByText("Prizes & Swag")).toBeInTheDocument();
  });

  it("should show admin controls with status selector", () => {
    renderDialog();
    expect(screen.getByText("Admin Controls")).toBeInTheDocument();
    const statusElements = screen.getAllByText("Status");
    expect(statusElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Admin Notes").length).toBeGreaterThanOrEqual(1);
  });

  it("should show Open Edit Form link", () => {
    renderDialog();
    expect(screen.getByText("Open Edit Form")).toBeInTheDocument();
  });

  it("should call onSave when Save Changes is clicked", async () => {
    const user = userEvent.setup();
    renderDialog({ onSave: mockOnSave });

    // Click save
    await user.click(screen.getByText("Save Changes"));

    expect(mockOnSave).toHaveBeenCalledWith({
      id: "req-123",
      status: "pending",
      adminNotes: "",
    });
  });

  it("should call onClose when Cancel is clicked", async () => {
    const user = userEvent.setup();
    renderDialog({ onClose: mockOnClose });

    await user.click(screen.getByText("Cancel"));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("should display nonprofit engagement details", () => {
    renderDialog();
    expect(screen.getByText("Partial")).toBeInTheDocument();
    expect(screen.getByText("Yes")).toBeInTheDocument(); // hasWorkedWithNonprofitsBefore
    expect(
      screen.getByText("Local food bank, animal shelter")
    ).toBeInTheDocument();
  });

  it("should handle request with no responsibilities", () => {
    const requestNoResp = { ...mockRequest, responsibilities: undefined };
    renderDialog({ request: requestNoResp });
    // Should not crash and should not show responsibilities section
    expect(screen.queryByText("Venue & Equipment")).not.toBeInTheDocument();
  });

  it("should handle request with no additional info", () => {
    const requestNoInfo = { ...mockRequest, additionalInfo: "" };
    renderDialog({ request: requestNoInfo });
    // Should not show additional information section
    expect(
      screen.queryByText("Additional Information")
    ).not.toBeInTheDocument();
  });
});
