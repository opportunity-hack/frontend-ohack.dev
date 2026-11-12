import { act, renderHook, waitFor } from "@testing-library/react";

const auth = { accessToken: "tok-1", isLoggedIn: true };
jest.mock("@propelauth/react", () => ({
  useAuthInfo: () => auth,
}));

const membership = { isOnTeam: false, membershipChecked: true };
jest.mock("../use-team-membership", () => ({
  __esModule: true,
  default: jest.fn(() => membership),
}));

jest.mock("../../lib/teamMembershipApi", () => ({
  isMembershipRefusal: (err) => Boolean(err && err.code),
  fetchHackerStatus: jest.fn(),
  joinTeam: jest.fn(),
  leaveTeam: jest.fn(),
}));

import {
  fetchHackerStatus,
  joinTeam,
  leaveTeam,
} from "../../lib/teamMembershipApi";
import useTeamJoinLeave from "../use-team-join-leave";

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

describe("useTeamJoinLeave", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    auth.accessToken = "tok-1";
    auth.isLoggedIn = true;
    membership.isOnTeam = false;
    membership.membershipChecked = true;
    fetchHackerStatus.mockResolvedValue("approved");
  });

  it("resolves the hacker status once per event, keyed on token presence", async () => {
    const { result, rerender } = renderHook(() =>
      useTeamJoinLeave({ eventId: "fall-2026", teamId: "t1" }),
    );
    expect(result.current.hackerStatus).toBeNull();
    await waitFor(() => expect(result.current.hackerStatus).toBe("approved"));
    expect(fetchHackerStatus).toHaveBeenCalledWith({
      accessToken: "tok-1",
      eventId: "fall-2026",
    });

    // PropelAuth rotates the token on refocus — no refetch, no reset.
    auth.accessToken = "tok-2";
    rerender();
    expect(fetchHackerStatus).toHaveBeenCalledTimes(1);
    expect(result.current.hackerStatus).toBe("approved");
  });

  it("is 'none' when logged out and skips the fetch", () => {
    auth.isLoggedIn = false;
    auth.accessToken = null;
    const { result } = renderHook(() =>
      useTeamJoinLeave({ eventId: "fall-2026", teamId: "t1" }),
    );
    expect(result.current.hackerStatus).toBe("none");
    expect(result.current.isLoggedIn).toBe(false);
    expect(fetchHackerStatus).not.toHaveBeenCalled();
  });

  it("join: pending → isOnTeam true, result + onJoined; the rotated token is used", async () => {
    const d = deferred();
    joinTeam.mockReturnValue(d.promise);
    const onJoined = jest.fn();
    const { result, rerender } = renderHook(() =>
      useTeamJoinLeave({
        eventId: "fall-2026",
        teamId: "t1",
        source: "team_page",
        onJoined,
      }),
    );
    auth.accessToken = "tok-rotated";
    rerender();

    act(() => {
      result.current.join();
    });
    expect(result.current.pending).toBe("join");
    expect(result.current.isOnTeam).toBe(false);
    expect(joinTeam).toHaveBeenCalledWith({
      accessToken: "tok-rotated",
      teamId: "t1",
      eventId: "fall-2026",
      source: "team_page",
    });

    await act(async () => {
      d.resolve({ message: "Joined Team", noop: false });
      await d.promise;
    });
    expect(result.current.pending).toBeNull();
    expect(result.current.isOnTeam).toBe(true);
    expect(result.current.result).toEqual({ action: "join", noop: false });
    expect(result.current.error).toBeNull();
    expect(onJoined).toHaveBeenCalledWith({
      message: "Joined Team",
      noop: false,
    });
  });

  it("leave: flips isOnTeam false and reports a noop answer", async () => {
    membership.isOnTeam = true;
    leaveTeam.mockResolvedValue({
      message: "User was not in the team",
      noop: true,
    });
    const onLeft = jest.fn();
    const { result } = renderHook(() =>
      useTeamJoinLeave({ eventId: "fall-2026", teamId: "t1", onLeft }),
    );
    expect(result.current.isOnTeam).toBe(true);
    await act(async () => {
      await result.current.leave();
    });
    expect(result.current.isOnTeam).toBe(false);
    expect(result.current.result).toEqual({ action: "leave", noop: true });
    expect(onLeft).toHaveBeenCalled();
  });

  it("surfaces the API error message and keeps membership unchanged", async () => {
    joinTeam.mockRejectedValue(new Error("We couldn't find your profile."));
    const onJoined = jest.fn();
    const { result } = renderHook(() =>
      useTeamJoinLeave({ eventId: "fall-2026", teamId: "t1", onJoined }),
    );
    await act(async () => {
      await result.current.join();
    });
    expect(result.current.error).toBe("We couldn't find your profile.");
    expect(result.current.isOnTeam).toBe(false);
    expect(result.current.pending).toBeNull();
    expect(onJoined).not.toHaveBeenCalled();

    act(() => result.current.clearFeedback());
    expect(result.current.error).toBeNull();
  });

  it("a server rule refusal settles into `refusal`, not `error`", async () => {
    const err = Object.assign(new Error("This team isn't active right now."), {
      code: "team_inactive",
    });
    joinTeam.mockRejectedValue(err);
    const { result } = renderHook(() =>
      useTeamJoinLeave({ eventId: "fall-2026", teamId: "t1" }),
    );
    await act(async () => {
      await result.current.join();
    });
    expect(result.current.error).toBeNull();
    expect(result.current.refusal).toEqual({
      action: "join",
      code: "team_inactive",
      reason: "This team isn't active right now.",
    });
    expect(result.current.isOnTeam).toBe(false);
  });

  it("ignores a second click while a request is in flight", async () => {
    const d = deferred();
    joinTeam.mockReturnValue(d.promise);
    const { result } = renderHook(() =>
      useTeamJoinLeave({ eventId: "fall-2026", teamId: "t1" }),
    );
    act(() => {
      result.current.join();
    });
    act(() => {
      result.current.join();
      result.current.leave();
    });
    expect(joinTeam).toHaveBeenCalledTimes(1);
    expect(leaveTeam).not.toHaveBeenCalled();
    await act(async () => {
      d.resolve({ message: "Joined Team", noop: false });
      await d.promise;
    });
  });

  it("a fresh server membership answer wins over the optimistic override", async () => {
    joinTeam.mockResolvedValue({ message: "Joined Team", noop: false });
    const { result, rerender } = renderHook(() =>
      useTeamJoinLeave({ eventId: "fall-2026", teamId: "t1" }),
    );
    await act(async () => {
      await result.current.join();
    });
    expect(result.current.isOnTeam).toBe(true);

    // useTeamMembership refetches (checked false → true) and says: not on team.
    membership.membershipChecked = false;
    rerender();
    membership.membershipChecked = true;
    membership.isOnTeam = false;
    rerender();
    await waitFor(() => expect(result.current.isOnTeam).toBe(false));
  });
});
