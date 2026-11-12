import {
  approvedTeamState,
  saveProjectPayload,
  teamSavePayload,
} from "../teamProjectApi";

describe("approvedTeamState", () => {
  it("marks the team active so a later Save Changes can't deactivate it", () => {
    const prev = { id: "t1", status: "IN_REVIEW", active: false, name: "A" };
    expect(approvedTeamState(prev, "ps-2")).toEqual({
      id: "t1",
      name: "A",
      status: "NONPROFIT_SELECTED",
      active: true,
      problem_statements: ["ps-2"],
    });
    expect(teamSavePayload(approvedTeamState(prev, "ps-2"), prev, "ps-2").active).toBe("True");
  });

  it("leaves problem_statements alone without a project", () => {
    const prev = { id: "t1", problem_statements: ["old"] };
    expect(approvedTeamState(prev, null).problem_statements).toEqual(["old"]);
  });
});

describe("saveProjectPayload", () => {
  it("sends the dialog's nonprofit with the project", () => {
    expect(
      saveProjectPayload({ id: "t1", selected_nonprofit_id: "npo-2", name: "x" }, "ps-9"),
    ).toEqual({ id: "t1", problem_statement_id: "ps-9", selected_nonprofit_id: "npo-2" });
  });
});

describe("teamSavePayload", () => {
  const original = { id: "t1", status: "NONPROFIT_SELECTED", selected_nonprofit_id: "npo-1" };

  it("maps active and omits a null submission status", () => {
    const p = teamSavePayload({ ...original, active: false, project_submission_status: null }, original, "ps-1");
    expect(p.active).toBe("False");
    expect("project_submission_status" in p).toBe(false);
  });

  it("does not touch the project when the nonprofit is unchanged", () => {
    const p = teamSavePayload({ ...original, active: true, name: "New" }, original, "ps-1");
    expect("problem_statement_id" in p).toBe(false);
  });

  it("moves the project with a nonprofit change on an approved team", () => {
    const p = teamSavePayload({ ...original, selected_nonprofit_id: "npo-2", active: true }, original, "ps-7");
    expect(p.problem_statement_id).toBe("ps-7");
  });

  it("clears the project when the new nonprofit has none selected", () => {
    const p = teamSavePayload({ ...original, selected_nonprofit_id: "npo-2", active: true }, original, "");
    expect(p.problem_statement_id).toBeNull();
  });

  it("leaves project assignment to approval while the team is in review", () => {
    const inReview = { id: "t1", status: "IN_REVIEW", selected_nonprofit_id: null };
    const p = teamSavePayload({ ...inReview, selected_nonprofit_id: "npo-2", active: false }, inReview, "ps-7");
    expect("problem_statement_id" in p).toBe(false);
  });
});
