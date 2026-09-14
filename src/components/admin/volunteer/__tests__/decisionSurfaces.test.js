/**
 * Smoke + contract tests for the three surfaces that render the two decision
 * axes (status / roster): the edit dialog, the review card, the review list.
 * They assert the transport contract — isSelected never rides in a PATCH —
 * and that the roster control is a switch, not a status chip.
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import VolunteerEditDialog from "../../VolunteerEditDialog";
import ApplicationReviewCard from "../../ApplicationReviewCard";
import ApplicationReviewList from "../../ApplicationReviewList";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props) => <img alt={props.alt || ""} src={typeof props.src === "string" ? props.src : ""} />,
}));
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children }) => <>{children}</>,
}));
jest.mock("../../../VideoDisplay/LiteVideoThumbnail", () => ({
  __esModule: true,
  default: () => <div data-testid="video-thumb" />,
}));
jest.mock("../../../../lib/lmsClient", () => ({
  JUDGE_TRAINING_BUNDLE_URL: "https://lms.example/bundle",
  JUDGE_TRAINING_CERTS: [
    { slot: "intro", field: "judgeTrainingIntroCertUrl", label: "Judge intro", match: /judge\s*intro/i },
    { slot: "tool", field: "judgeTrainingToolCertUrl", label: "Judging tool", match: /judging\s*tool/i },
  ],
  extractCertToken: () => null,
  certUrlForToken: (t) => `https://lms.example/certificate/${t}`,
}));
jest.mock("../../../../hooks/use-judge-training-status", () => ({
  __esModule: true,
  default: () => ({ statusByEmail: {}, lmsAccess: null }),
  normalizeEmail: (e) => String(e || "").toLowerCase(),
}));

const theme = createTheme();
const wrap = (ui) => render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

const judge = {
  id: "j1",
  volunteer_type: "judge",
  name: "Jane Doe",
  email: "jane@example.org",
  title: "Staff Engineer",
  companyName: "Acme",
  shortBiography: "Legacy bio",
  status: "approved",
  isSelected: false,
  timestamp: "2026-08-03T12:00:00Z",
};

describe("VolunteerEditDialog", () => {
  it("renders Review and Event roster panes and disables Save until dirty", () => {
    const onSave = jest.fn();
    wrap(<VolunteerEditDialog open volunteer={judge} volunteerType="judge" onSave={onSave} onClose={() => {}} />);
    expect(screen.getByText(/^Review$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Event roster$/i)).toBeInTheDocument();
    // ONE bio field, populated from the legacy alias (and no duplicate mirrors).
    expect(screen.getAllByDisplayValue("Legacy bio")).toHaveLength(1);
    expect(screen.queryByText("Short Bio")).toBeNull();
    expect(screen.queryByText("Short Biography")).toBeNull();
    expect(screen.getByRole("button", { name: /save changes/i })).toBeDisabled();
  });

  it("sends the roster toggle separately from the field patch", () => {
    const onSave = jest.fn();
    wrap(<VolunteerEditDialog open volunteer={judge} volunteerType="judge" onSave={onSave} onClose={() => {}} />);
    fireEvent.click(screen.getByRole("switch", { name: /on event roster/i }));
    fireEvent.change(screen.getByDisplayValue("Legacy bio"), { target: { value: "New bio" } });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));
    expect(onSave).toHaveBeenCalledTimes(1);
    const { patch, roster } = onSave.mock.calls[0][0];
    expect(patch).toEqual({ id: "j1", biography: "New bio", shortBio: "New bio", shortBiography: "New bio" });
    expect(patch).not.toHaveProperty("isSelected");
    expect(roster).toBe(true);
  });

  it("shows the mismatch hint for approved-but-not-on-roster", () => {
    wrap(<VolunteerEditDialog open volunteer={judge} volunteerType="judge" onSave={() => {}} onClose={() => {}} />);
    expect(screen.getByText(/not on the roster/i)).toBeInTheDocument();
  });
});

describe("ApplicationReviewCard", () => {
  it("routes quick buttons to onStatusChange and the pill to onRosterChange", () => {
    const onStatusChange = jest.fn();
    const onRosterChange = jest.fn();
    wrap(
      <ApplicationReviewCard
        application={{ ...judge, status: "pending" }}
        applicationType="judge"
        onStatusChange={onStatusChange}
        onRosterChange={onRosterChange}
        onEdit={() => {}}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /^approve$/i }));
    expect(onStatusChange).toHaveBeenCalledWith(expect.objectContaining({ id: "j1" }), "approved");
    fireEvent.click(screen.getByRole("button", { name: /^deny$/i }));
    expect(onStatusChange).toHaveBeenCalledWith(expect.objectContaining({ id: "j1" }), "denied");
    fireEvent.click(screen.getByRole("switch", { name: /on event roster/i }));
    expect(onRosterChange).toHaveBeenCalledWith(expect.objectContaining({ id: "j1" }), true);
    // Never writes isSelected through the status callback.
    onStatusChange.mock.calls.forEach(([, value]) => expect(typeof value).toBe("string"));
  });

  it("renders schema primary fields through their aliases", () => {
    wrap(
      <ApplicationReviewCard application={judge} applicationType="judge" onStatusChange={() => {}} onRosterChange={() => {}} />
    );
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByText("Staff Engineer")).toBeInTheDocument();
  });
});

describe("ApplicationReviewList", () => {
  const apps = [
    { ...judge, id: "a", status: "approved", isSelected: false },
    { ...judge, id: "b", name: "Bo", status: "denied", isSelected: true },
    { ...judge, id: "c", name: "Cy", status: "pending", isSelected: false },
  ];

  it("shows Review and Roster stat rows with mismatch presets", () => {
    wrap(<ApplicationReviewList applications={apps} applicationType="judge" onStatusChange={() => {}} onRosterChange={() => {}} />);
    expect(screen.getAllByText(/^Review$/).length).toBeGreaterThan(0);
    // Overline row label + the "Roster" filter select label.
    expect(screen.getAllByText(/^Roster$/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Ready for roster 1/)).toBeInTheDocument();
    expect(screen.getByText(/Roster conflicts 1/)).toBeInTheDocument();
  });

  it("'Add all ready' hands only ready applicants to onBatchRoster", () => {
    const onBatchRoster = jest.fn();
    wrap(
      <ApplicationReviewList
        applications={apps}
        applicationType="judge"
        onStatusChange={() => {}}
        onRosterChange={() => {}}
        onBatchRoster={onBatchRoster}
        showBatchActions
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /add all ready \(1\)/i }));
    expect(onBatchRoster).toHaveBeenCalledTimes(1);
    const [list, direction] = onBatchRoster.mock.calls[0];
    expect(list.map((a) => a.id)).toEqual(["a"]);
    expect(direction).toBe(true);
  });

  it("filters by status for every type (not just judges)", () => {
    wrap(
      <ApplicationReviewList
        applications={apps.map((a) => ({ ...a, volunteer_type: "mentor" }))}
        applicationType="mentor"
        statusFilter="denied"
        onStatusChange={() => {}}
        onRosterChange={() => {}}
      />
    );
    expect(screen.getByText(/Showing 1 of 3 applications/)).toBeInTheDocument();
    expect(screen.getAllByText("Bo").length).toBeGreaterThan(0);
    expect(screen.queryByText("Jane Doe")).toBeNull();
    expect(screen.queryByText("Cy")).toBeNull();
  });
});
