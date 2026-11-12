/**
 * Admin approval needs the exact project: the Nonprofit Assignment tab
 * (ProjectAssignmentPanel) + the approve call's body/error mapping.
 */
import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import ProjectAssignmentPanel, {
  approvalBlockedReason,
  defaultProjectFor,
} from "../ProjectAssignmentPanel";
import { approveTeamProject } from "../../../lib/teamProjectApi";

const NONPROFITS = [
  { id: "np1", name: "Food Bank" },
  { id: "np2", name: "Animal Rescue" },
];
const PROJECT_OPTIONS = {
  status: "ready",
  nonprofits: [
    {
      id: "np1",
      name: "Food Bank",
      projects: [
        { id: "p1", title: "Scheduler" },
        { id: "p2", title: "Inventory" },
      ],
    },
    {
      id: "np2",
      name: "Animal Rescue",
      projects: [{ id: "p3", title: "Adoptions" }],
    },
  ],
};
const TEAM = {
  id: "t1",
  name: "Byte Club",
  status: "IN_REVIEW",
  selected_nonprofit_id: "np1",
  nonprofit_rankings: [
    { nonprofit_id: "np2", problem_statement_id: "p3", rank: 1 },
    { nonprofit_id: "np1", problem_statement_id: "p2", rank: 2 },
    { nonprofit_id: "np1", rank: 3 }, // legacy nonprofit-only entry
  ],
};

function renderPanel(props = {}) {
  const handlers = {
    onNonprofitChange: jest.fn(),
    onProjectChange: jest.fn(),
    onAssignRanking: jest.fn(),
    onApproveClick: jest.fn(),
    onSaveProject: jest.fn(),
    onRetryProjects: jest.fn(),
  };
  render(
    <ProjectAssignmentPanel
      team={TEAM}
      nonprofitOptions={NONPROFITS}
      nonprofitSource="hackathon"
      getNonprofitName={(id) => NONPROFITS.find((n) => n.id === id)?.name}
      projectOptions={PROJECT_OPTIONS}
      selectedProjectId=""
      assignedProjectId={null}
      savingProject={false}
      {...handlers}
      {...props}
    />,
  );
  return handlers;
}

it("keeps Approve disabled until a project is chosen for a multi-project nonprofit", () => {
  renderPanel();
  expect(screen.getByRole("button", { name: "Approve Team" })).toBeDisabled();
  expect(screen.getByText("Not ready to approve yet")).toBeInTheDocument();
});

it("enables Approve once the project is set and names it", () => {
  const { onApproveClick } = renderPanel({ selectedProjectId: "p2" });
  const approve = screen.getByRole("button", { name: "Approve Team" });
  expect(approve).not.toBeDisabled();
  expect(screen.getByText(/“Inventory” · Food Bank/)).toBeInTheDocument();
  fireEvent.click(approve);
  expect(onApproveClick).toHaveBeenCalled();
});

it("shows a Project column ('—' for legacy rows) and Assign sets both selects", () => {
  const { onAssignRanking } = renderPanel({ selectedProjectId: "p2" });
  const rows = screen.getAllByRole("row").slice(1);
  expect(within(rows[0]).getByText("Adoptions")).toBeInTheDocument();
  expect(within(rows[2]).getByText("—")).toBeInTheDocument();

  fireEvent.click(
    screen.getByRole("button", { name: "Assign rank 1: Adoptions" }),
  );
  expect(onAssignRanking).toHaveBeenCalledWith({
    nonprofitId: "np2",
    projectId: "p3",
  });
  // the currently selected row can't be re-assigned
  expect(
    screen.getByRole("button", { name: "Assign rank 2: Inventory" }),
  ).toBeDisabled();
});

it("a failed project list shows Retry and blocks approval", () => {
  const { onRetryProjects } = renderPanel({
    projectOptions: { status: "error", nonprofits: [] },
  });
  expect(screen.getByRole("button", { name: "Approve Team" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));
  expect(onRetryProjects).toHaveBeenCalled();
});

it("approved team: changing the project offers Save project", () => {
  const { onSaveProject } = renderPanel({
    team: { ...TEAM, status: "NONPROFIT_SELECTED" },
    assignedProjectId: "p1",
    selectedProjectId: "p2",
  });
  expect(screen.getByText(/project “Scheduler”/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Save project" }));
  expect(onSaveProject).toHaveBeenCalled();
});

describe("defaultProjectFor / approvalBlockedReason", () => {
  const np1 = PROJECT_OPTIONS.nonprofits[0].projects;
  it("prefers the assigned project, then the highest-ranked, then a sole project", () => {
    expect(defaultProjectFor(TEAM, "np1", np1, "p1")).toBe("p1");
    expect(defaultProjectFor(TEAM, "np1", np1, null)).toBe("p2");
    expect(
      defaultProjectFor({ nonprofit_rankings: [] }, "np2", [{ id: "p3" }]),
    ).toBe("p3");
    expect(defaultProjectFor({ nonprofit_rankings: [] }, "np1", np1)).toBe("");
  });
  it("allows a nonprofit with no selectable projects (backend decides)", () => {
    expect(
      approvalBlockedReason({
        nonprofitId: "np9",
        projectId: "",
        projectOptions: PROJECT_OPTIONS,
      }),
    ).toBeNull();
  });
});

describe("approveTeamProject", () => {
  it("sends {teamId, nonprofitId, problemStatementId}", async () => {
    const client = {
      post: jest.fn().mockResolvedValue({ data: { success: true } }),
    };
    await approveTeamProject(
      { teamId: "t1", nonprofitId: "np1", problemStatementId: "p2" },
      { token: "tok", orgId: "org" },
      { client },
    );
    const [url, body, config] = client.post.mock.calls[0];
    expect(url).toMatch(/\/api\/team\/approve$/);
    expect(body).toEqual({
      teamId: "t1",
      nonprofitId: "np1",
      problemStatementId: "p2",
    });
    expect(config.headers).toMatchObject({
      Authorization: "Bearer tok",
      "X-Org-Id": "org",
    });
  });

  it("maps 4xx {error, message} and 200 {success:false} to a showable error", async () => {
    const err = new Error("HTTP 409");
    err.response = { status: 409, data: { error: "already_approved" } };
    await expect(
      approveTeamProject(
        { teamId: "t1", nonprofitId: "np1", problemStatementId: "p2" },
        {},
        { client: { post: jest.fn().mockRejectedValue(err) } },
      ),
    ).rejects.toMatchObject({ code: "already_approved", status: 409 });

    await expect(
      approveTeamProject(
        { teamId: "t1", nonprofitId: "np1", problemStatementId: "p2" },
        {},
        {
          client: {
            post: jest
              .fn()
              .mockResolvedValue({
                data: { success: false, message: "No org" },
              }),
          },
        },
      ),
    ).rejects.toThrow("No org");
  });
});
