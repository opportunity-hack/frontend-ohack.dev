import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, createTheme } from "@mui/material";
import AdminHackathonRequestsPage from "../../../pages/admin/hackathon-requests/index";

const theme = createTheme();

// Mock PropelAuth
const mockAccessToken = "test-token-123";
const mockOrgId = "org-456";
const mockOrg = {
  hasPermission: jest.fn().mockReturnValue(true),
  orgId: mockOrgId,
};
const mockUserClass = {
  getOrgByName: jest.fn().mockReturnValue(mockOrg),
};

jest.mock("@propelauth/react", () => ({
  useAuthInfo: () => ({ accessToken: mockAccessToken }),
  withRequiredAuthInfo: (Component) => (props) =>
    Component({ ...props, userClass: mockUserClass }),
}));

// Mock fetch
const mockRequests = [
  {
    id: "req-1",
    companyName: "Alpha Corp",
    contactName: "Alice",
    contactEmail: "alice@alpha.com",
    organizationType: "corporate",
    employeeCount: "100",
    eventFormat: "in-person",
    location: "Phoenix, AZ",
    status: "pending",
    created: "2025-06-01T10:00:00",
  },
  {
    id: "req-2",
    companyName: "Beta University",
    contactName: "Bob",
    contactEmail: "bob@beta.edu",
    organizationType: "university",
    employeeCount: "200",
    eventFormat: "virtual",
    location: "Austin, TX",
    status: "approved",
    created: "2025-07-01T10:00:00",
  },
  {
    id: "req-3",
    companyName: "Gamma Group",
    contactName: "Carol",
    contactEmail: "carol@gamma.org",
    organizationType: "community",
    employeeCount: "50",
    eventFormat: "hybrid",
    location: "Denver, CO",
    status: "pending",
    created: "2025-08-01T10:00:00",
  },
];

const mockFetch = jest.fn();
global.fetch = mockFetch;

const renderPage = () =>
  render(
    <ThemeProvider theme={theme}>
      <AdminHackathonRequestsPage />
    </ThemeProvider>
  );

beforeEach(() => {
  mockFetch.mockClear();
  mockOrg.hasPermission.mockReturnValue(true);
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({ requests: mockRequests }),
  });
});

describe("AdminHackathonRequestsPage", () => {
  it("should render the page title", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Hackathon Request Management")).toBeInTheDocument();
    });
  });

  it("should fetch requests on mount", async () => {
    renderPage();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/messages/admin/hackathon-requests"),
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            authorization: `Bearer ${mockAccessToken}`,
            "X-Org-Id": mockOrgId,
          }),
        })
      );
    });
  });

  it("should display requests in the table after fetch", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Alpha Corp")).toBeInTheDocument();
      expect(screen.getByText("Beta University")).toBeInTheDocument();
      expect(screen.getByText("Gamma Group")).toBeInTheDocument();
    });
  });

  it("should display status summary chips", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Total: 3")).toBeInTheDocument();
      expect(screen.getByText("pending: 2")).toBeInTheDocument();
      expect(screen.getByText("approved: 1")).toBeInTheDocument();
    });
  });

  it("should filter requests by text search", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Alpha Corp")).toBeInTheDocument();
    });

    const filterInput = screen.getByLabelText(
      "Filter by Organization, Contact, Email, or Location"
    );
    await user.type(filterInput, "Alpha");

    expect(screen.getByText("Alpha Corp")).toBeInTheDocument();
    expect(screen.queryByText("Beta University")).not.toBeInTheDocument();
    expect(screen.queryByText("Gamma Group")).not.toBeInTheDocument();
  });

  it("should filter requests by status chip click", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Alpha Corp")).toBeInTheDocument();
    });

    // Click the "approved" status chip to filter
    await user.click(screen.getByText("approved: 1"));

    expect(screen.queryByText("Alpha Corp")).not.toBeInTheDocument();
    expect(screen.getByText("Beta University")).toBeInTheDocument();
    expect(screen.queryByText("Gamma Group")).not.toBeInTheDocument();
  });

  it("should show permission denied for non-admin users", async () => {
    mockOrg.hasPermission.mockReturnValue(false);
    renderPage();

    expect(
      screen.getByText("You do not have permission to view this page.")
    ).toBeInTheDocument();
  });

  it("should show error snackbar on fetch failure", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText("Failed to fetch hackathon requests. Please try again.")
      ).toBeInTheDocument();
    });
  });

  it("should refresh data when Refresh button is clicked", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Alpha Corp")).toBeInTheDocument();
    });

    // Clear and setup new mock
    mockFetch.mockClear();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ requests: [mockRequests[0]] }),
    });

    await user.click(screen.getByText("Refresh Data"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  it("should send PATCH request when saving request updates", async () => {
    const user = userEvent.setup();

    // First call: list, second call: update, third call: re-fetch
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ requests: mockRequests }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockRequests[0], status: "approved" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ requests: mockRequests }),
      });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Alpha Corp")).toBeInTheDocument();
    });

    // Click View on first request
    const viewButtons = screen.getAllByText("View");
    await user.click(viewButtons[0]);

    // The detail dialog should open
    await waitFor(() => {
      expect(screen.getByText("Admin Controls")).toBeInTheDocument();
    });

    // Click Save Changes
    await user.click(screen.getByText("Save Changes"));

    await waitFor(() => {
      // req-3 is first in the table because it has the newest created date
      // and default sort is created desc
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/messages/admin/hackathon-requests/req-3"),
        expect.objectContaining({
          method: "PATCH",
          headers: expect.objectContaining({
            authorization: `Bearer ${mockAccessToken}`,
          }),
        })
      );
    });
  });
});
