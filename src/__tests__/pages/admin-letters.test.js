import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

jest.mock("next/head", () => ({ __esModule: true, default: () => null }));
jest.mock("@propelauth/react", () => ({
  useAuthInfo: () => ({ accessToken: "tok" }),
  withRequiredAuthInfo: (C) => (props) =>
    C({
      ...props,
      userClass: {
        getOrgByName: () => ({ orgId: "org-1", hasPermission: (p) => p === "volunteer.admin" }),
      },
    }),
}));
jest.mock("../../components/admin/AdminPage", () => ({
  __esModule: true,
  default: ({ children, isAdmin }) => <div data-admin={String(isAdmin)}>{children}</div>,
}));
jest.mock("../../lib/lettersApi", () => ({
  __esModule: true,
  default: {
    adminList: jest.fn(),
    adminPreview: jest.fn(),
    adminRevoke: jest.fn(),
    adminException: jest.fn(),
  },
}));

import AdminLettersPage from "../../pages/admin/letters";
import lettersApi from "../../lib/lettersApi";

const ROWS = [
  { user_id: "j1", name: "Ada Judge", email: "ada@x.org", role: "judge", eligible: true, evidence: { score_count: 6, is_selected: true } },
  { user_id: "m1", name: "Cy Mentor", email: "cy@x.org", role: "mentor", eligible: true, letter_id: "ABCDEFGHJKMN", status: "issued", issued_at: "2026-11-27T18:00:00Z", facts: { name: "Cy Mentor", role: "mentor" }, evidence: { check_in_time: "2026-11-14T16:00:00Z" } },
];

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ hackathons: [{ event_id: "fall26", title: "Fall 2026", end_date: "2026-11-15" }] }),
  });
  global.URL.createObjectURL = jest.fn(() => "blob:x");
  global.URL.revokeObjectURL = jest.fn();
  lettersApi.adminList.mockResolvedValue({ event_id: "fall26", rows: ROWS });
  lettersApi.adminPreview.mockResolvedValue({ blob: new Blob(["%PDF"]), headers: {} });
  lettersApi.adminRevoke.mockResolvedValue({ status: "revoked" });
});

describe("/admin/letters", () => {
  it("loads the newest event and lists people with eligibility and evidence", async () => {
    render(<AdminLettersPage />);
    const table = await screen.findByTestId("letters-table");
    expect(lettersApi.adminList).toHaveBeenCalledWith("fall26", "tok", "org-1");
    expect(within(table).getByText("Ada Judge")).toBeInTheDocument();
    expect(within(table).getByText("6 scores")).toBeInTheDocument();
    expect(within(table).getByText("Issued")).toBeInTheDocument();
    expect(within(table).getAllByRole("button", { name: "Revoke" })).toHaveLength(1);
  });

  it("previews the stored letter with its frozen facts", async () => {
    render(<AdminLettersPage />);
    const table = await screen.findByTestId("letters-table");
    fireEvent.click(within(table).getAllByRole("button", { name: "Preview" })[1]);
    await waitFor(() =>
      expect(lettersApi.adminPreview).toHaveBeenCalledWith(
        { userId: "m1", eventId: "fall26", role: "mentor" }, "tok", "org-1"),
    );
    expect(await screen.findByText("Frozen facts")).toBeInTheDocument();
    expect(screen.getByText("This is the stored PDF the person downloads.")).toBeInTheDocument();
  });

  it("revoke requires a reason and reloads the list", async () => {
    render(<AdminLettersPage />);
    const table = await screen.findByTestId("letters-table");
    fireEvent.click(within(table).getByRole("button", { name: "Revoke" }));
    const confirm = await screen.findByRole("button", { name: "Revoke letter" });
    expect(confirm).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/Reason/), { target: { value: "Issued in error" } });
    fireEvent.click(confirm);
    await waitFor(() =>
      expect(lettersApi.adminRevoke).toHaveBeenCalledWith("ABCDEFGHJKMN", "Issued in error", "tok", "org-1"),
    );
    await waitFor(() => expect(lettersApi.adminList).toHaveBeenCalledTimes(2));
  });

  it("filters by status", async () => {
    render(<AdminLettersPage />);
    const table = await screen.findByTestId("letters-table");
    expect(within(table).getAllByRole("row")).toHaveLength(3);
    fireEvent.change(screen.getByLabelText("Search name, email, team"), { target: { value: "cy@" } });
    expect(within(table).getAllByRole("row")).toHaveLength(2);
  });
});
