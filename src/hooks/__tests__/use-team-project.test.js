/**
 * useTeamProject × token rotation (Class C, docs/plans/reliability-bug-classes-2026-11.md):
 * a debounced autosave scheduled before PropelAuth rotates the token must
 * send the CURRENT token, fire once, and a rotation alone must not save.
 */
import { renderHook, act } from "@testing-library/react";
import useTeamProject from "../use-team-project";

const mockSave = jest.fn();
const mockSubmit = jest.fn();
jest.mock("../../lib/teamDashboardApi", () => {
  const actual = jest.requireActual("../../lib/teamDashboardApi");
  return {
    ...actual,
    saveTeamProject: (...args) => mockSave(...args),
    submitTeamProject: (...args) => mockSubmit(...args),
  };
});

const TEAM = { id: "t1", project_tagline: "Old" };

beforeEach(() => {
  jest.useFakeTimers();
  mockSave.mockReset().mockResolvedValue({ team: {} });
  mockSubmit.mockReset().mockResolvedValue({ team: {} });
});
afterEach(() => {
  jest.useRealTimers();
});

it("a rotation during the debounce: one save, with the new token", async () => {
  const onTeamUpdated = jest.fn();
  const { result, rerender } = renderHook(
    ({ token }) =>
      useTeamProject({ team: TEAM, accessToken: token, onTeamUpdated }),
    { initialProps: { token: "tok-1" } },
  );
  act(() => result.current.setField("project_tagline", "New"));
  rerender({ token: "tok-2" });
  await act(async () => {
    jest.advanceTimersByTime(1600);
  });
  expect(mockSave).toHaveBeenCalledTimes(1);
  expect(mockSave).toHaveBeenCalledWith(
    "t1",
    { project_tagline: "New", base_revs: { project_tagline: 0 } },
    "tok-2",
  );
});

it("a rotation with nothing pending saves nothing", async () => {
  const { rerender } = renderHook(
    ({ token }) =>
      useTeamProject({
        team: TEAM,
        accessToken: token,
        onTeamUpdated: jest.fn(),
      }),
    { initialProps: { token: "tok-1" } },
  );
  rerender({ token: "tok-2" });
  rerender({ token: "tok-3" });
  await act(async () => {
    jest.advanceTimersByTime(5000);
  });
  expect(mockSave).not.toHaveBeenCalled();
});

it("submit uses the current token", async () => {
  const { result, rerender } = renderHook(
    ({ token }) =>
      useTeamProject({
        team: TEAM,
        accessToken: token,
        onTeamUpdated: jest.fn(),
      }),
    { initialProps: { token: "tok-1" } },
  );
  rerender({ token: "tok-9" });
  await act(async () => {
    await result.current.submit();
  });
  expect(mockSubmit).toHaveBeenCalledWith("t1", "tok-9");
});

/**
 * Teammates editing at once: untouched fields follow the server, edited
 * fields a teammate also saved become a conflict the person settles — never
 * a silent overwrite in either direction.
 */
describe("teammates editing the same write-up", () => {
  const { ApiError } = jest.requireActual("../../lib/teamDashboardApi");
  const meta = (revs, by = "Jo") =>
    Object.fromEntries(
      Object.entries(revs).map(([key, rev]) => [key, { rev, by, at: "x" }]),
    );
  const BASE = {
    id: "t1",
    project_tagline: "Old tagline",
    project_story: "Old story",
    project_field_meta: meta({ project_tagline: 1, project_story: 1 }),
  };
  const setup = (team = BASE) =>
    renderHook(
      ({ team: t }) =>
        useTeamProject({ team: t, accessToken: "tok", onTeamUpdated: jest.fn() }),
      { initialProps: { team } },
    );

  it("an untouched field adopts a teammate's save", () => {
    const { result, rerender } = setup();
    rerender({
      team: {
        ...BASE,
        project_story: "Jo's story",
        project_field_meta: meta({ project_tagline: 1, project_story: 2 }),
      },
    });
    expect(result.current.draft.project_story).toBe("Jo's story");
    expect(result.current.conflicts).toEqual({});
  });

  it("adopting saves nothing, and the next save uses the new revision", async () => {
    const { result, rerender } = setup();
    rerender({
      team: {
        ...BASE,
        project_story: "Jo's story",
        project_field_meta: meta({ project_tagline: 1, project_story: 2 }),
      },
    });
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(mockSave).not.toHaveBeenCalled();
    act(() => result.current.setField("project_story", "Jo's story + mine"));
    await act(async () => {
      jest.advanceTimersByTime(1600);
    });
    expect(mockSave).toHaveBeenCalledWith(
      "t1",
      { project_story: "Jo's story + mine", base_revs: { project_story: 2 } },
      "tok",
    );
  });

  it("an older (stale) revision never replaces the draft", () => {
    const { result, rerender } = setup({
      ...BASE,
      project_field_meta: meta({ project_tagline: 1, project_story: 5 }),
    });
    rerender({
      team: {
        ...BASE,
        project_story: "Stale copy",
        project_field_meta: meta({ project_tagline: 1, project_story: 4 }),
      },
    });
    expect(result.current.draft.project_story).toBe("Old story");
  });

  it("a field with unsaved edits becomes a conflict instead of being replaced or saved", async () => {
    const { result, rerender } = setup();
    act(() => result.current.setField("project_story", "My story"));
    rerender({
      team: {
        ...BASE,
        project_story: "Jo's story",
        project_field_meta: meta({ project_tagline: 1, project_story: 2 }),
      },
    });
    expect(result.current.draft.project_story).toBe("My story");
    expect(result.current.conflicts.project_story).toEqual({
      value: "Jo's story",
      rev: 2,
      by: "Jo",
    });
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(mockSave).not.toHaveBeenCalled();
    // Submitting would publish the teammate's text while this page shows
    // different text — refused until the choice is made.
    let res;
    await act(async () => {
      res = await result.current.submit();
    });
    expect(res.success).toBe(false);
    expect(res.conflict).toBe(true);
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("'Keep mine' saves the local text against the teammate's revision", async () => {
    const { result, rerender } = setup();
    act(() => result.current.setField("project_story", "My story"));
    rerender({
      team: {
        ...BASE,
        project_story: "Jo's story",
        project_field_meta: meta({ project_tagline: 1, project_story: 2 }),
      },
    });
    mockSave.mockResolvedValue({
      team: { project_field_meta: meta({ project_story: 3 }, "Me") },
    });
    await act(async () => {
      result.current.resolveConflict("project_story", "mine");
    });
    expect(mockSave).toHaveBeenCalledWith(
      "t1",
      { project_story: "My story", base_revs: { project_story: 2 } },
      "tok",
    );
    expect(result.current.conflicts).toEqual({});
    expect(result.current.draft.project_story).toBe("My story");
  });

  it("'Use theirs' takes the teammate's text, saves nothing, and returns the local text", async () => {
    const { result, rerender } = setup();
    act(() => result.current.setField("project_story", "My story"));
    rerender({
      team: {
        ...BASE,
        project_story: "Jo's story",
        project_field_meta: meta({ project_tagline: 1, project_story: 2 }),
      },
    });
    let mine;
    act(() => {
      mine = result.current.resolveConflict("project_story", "theirs");
    });
    expect(mine).toBe("My story");
    expect(result.current.draft.project_story).toBe("Jo's story");
    expect(result.current.conflicts).toEqual({});
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(mockSave).not.toHaveBeenCalled();
  });

  it("a 409 project_conflict keeps the local text, flags the field, and still saves the other fields", async () => {
    const fresh = {
      id: "t1",
      project_tagline: "Old tagline",
      project_story: "Jo's story",
      project_field_meta: meta({ project_tagline: 1, project_story: 2 }),
    };
    mockSave
      .mockRejectedValueOnce(
        new ApiError(409, {
          error: "project_conflict",
          fields: ["project_story"],
          team: fresh,
        }),
      )
      .mockResolvedValue({ team: {} });
    const { result } = setup();
    act(() => {
      result.current.setField("project_story", "My story");
      result.current.setField("project_tagline", "My tagline");
    });
    await act(async () => {
      jest.advanceTimersByTime(1600);
    });
    await act(async () => {
      jest.advanceTimersByTime(10);
    });
    expect(result.current.draft.project_story).toBe("My story");
    expect(result.current.conflicts.project_story.value).toBe("Jo's story");
    expect(mockSave).toHaveBeenCalledTimes(2);
    expect(mockSave).toHaveBeenLastCalledWith(
      "t1",
      { project_tagline: "My tagline", base_revs: { project_tagline: 1 } },
      "tok",
    );
    // No retry loop on the conflicted field.
    await act(async () => {
      jest.advanceTimersByTime(10000);
    });
    expect(mockSave).toHaveBeenCalledTimes(2);
  });

  it("the echo of our own save is not read as a teammate's edit", async () => {
    const saved = {
      ...BASE,
      project_story: "Mine v1",
      project_field_meta: meta({ project_tagline: 1, project_story: 2 }, "Me"),
    };
    mockSave.mockResolvedValue({ team: saved });
    const { result, rerender } = setup();
    act(() => result.current.setField("project_story", "Mine v1"));
    await act(async () => {
      jest.advanceTimersByTime(1600);
    });
    // Typed more before the response was merged into `team`.
    act(() => result.current.setField("project_story", "Mine v2"));
    rerender({ team: saved });
    expect(result.current.conflicts).toEqual({});
    expect(result.current.draft.project_story).toBe("Mine v2");
  });
});
