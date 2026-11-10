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
    { project_tagline: "New" },
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
