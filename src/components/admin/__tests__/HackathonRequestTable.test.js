import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HackathonRequestTable from "../HackathonRequestTable";

const mockRequests = [
  {
    id: "req-1",
    companyName: "Acme Corp",
    contactName: "Alice Smith",
    contactEmail: "alice@acme.com",
    organizationType: "corporate",
    employeeCount: "100",
    eventFormat: "in-person",
    location: "Phoenix, AZ",
    expectedHackathonDate: "2025-09-15T00:00:00",
    status: "pending",
    created: "2025-06-01T10:00:00",
  },
  {
    id: "req-2",
    companyName: "State University",
    contactName: "Bob Jones",
    contactEmail: "bob@university.edu",
    organizationType: "university",
    employeeCount: "200",
    eventFormat: "virtual",
    location: "Austin, TX",
    expectedHackathonDate: "2025-10-20T00:00:00",
    status: "approved",
    created: "2025-07-15T14:30:00",
  },
];

describe("HackathonRequestTable", () => {
  const mockOnRequestSort = jest.fn();
  const mockOnViewRequest = jest.fn();

  const defaultProps = {
    requests: mockRequests,
    orderBy: "created",
    order: "desc",
    onRequestSort: mockOnRequestSort,
    onViewRequest: mockOnViewRequest,
  };

  beforeEach(() => {
    mockOnRequestSort.mockClear();
    mockOnViewRequest.mockClear();
  });

  it("should render table with column headers", () => {
    render(<HackathonRequestTable {...defaultProps} />);

    expect(screen.getByText("Organization")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Submitted")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("should render request data in rows", () => {
    render(<HackathonRequestTable {...defaultProps} />);

    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("alice@acme.com")).toBeInTheDocument();
    expect(screen.getByText("State University")).toBeInTheDocument();
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
  });

  it("should render status chips", () => {
    render(<HackathonRequestTable {...defaultProps} />);

    expect(screen.getByText("pending")).toBeInTheDocument();
    expect(screen.getByText("approved")).toBeInTheDocument();
  });

  it("should render organization type chips", () => {
    render(<HackathonRequestTable {...defaultProps} />);

    expect(screen.getByText("corporate")).toBeInTheDocument();
    expect(screen.getByText("university")).toBeInTheDocument();
  });

  it("should format participant count with tilde prefix", () => {
    render(<HackathonRequestTable {...defaultProps} />);

    expect(screen.getByText("~100")).toBeInTheDocument();
    expect(screen.getByText("~200")).toBeInTheDocument();
  });

  it("should render View buttons for each row", () => {
    render(<HackathonRequestTable {...defaultProps} />);

    const viewButtons = screen.getAllByText("View");
    expect(viewButtons).toHaveLength(2);
  });

  it("should call onViewRequest when View button is clicked", async () => {
    const user = userEvent.setup();
    render(<HackathonRequestTable {...defaultProps} />);

    const viewButtons = screen.getAllByText("View");
    await user.click(viewButtons[0]);

    expect(mockOnViewRequest).toHaveBeenCalledWith(mockRequests[0]);
  });

  it("should call onRequestSort when column header is clicked", async () => {
    const user = userEvent.setup();
    render(<HackathonRequestTable {...defaultProps} />);

    await user.click(screen.getByText("Organization"));

    expect(mockOnRequestSort).toHaveBeenCalledWith("companyName");
  });

  it("should show empty message when no requests", () => {
    render(
      <HackathonRequestTable
        {...defaultProps}
        requests={[]}
      />
    );

    expect(screen.getByText("No hackathon requests found.")).toBeInTheDocument();
  });

  it("should format dates in readable format", () => {
    render(<HackathonRequestTable {...defaultProps} />);

    // The exact format depends on locale, but it should contain the month
    expect(screen.getByText(/Jun.*2025/)).toBeInTheDocument();
  });

  it("should show dash for missing field values", () => {
    const requestWithMissing = [
      {
        id: "req-3",
        companyName: "Missing Fields Co",
        status: "pending",
        created: "2025-01-01T00:00:00",
      },
    ];

    render(
      <HackathonRequestTable
        {...defaultProps}
        requests={requestWithMissing}
      />
    );

    expect(screen.getByText("Missing Fields Co")).toBeInTheDocument();
    // Multiple dashes for missing fields
    const dashes = screen.getAllByText("-");
    expect(dashes.length).toBeGreaterThan(0);
  });
});
