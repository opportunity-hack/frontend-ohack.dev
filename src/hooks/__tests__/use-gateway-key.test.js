/**
 * useGatewayKey must survive PropelAuth token rotation (a fresh accessToken on
 * every tab refocus). It used to key its fetch on the raw token and null the
 * key on every run: the card dropped to a skeleton each time a hacker came
 * back from the terminal, the tool tab reset, the backend made two more
 * LiteLLM calls, and a failed refetch replaced a working key with an error.
 */
import { act, renderHook, waitFor } from "@testing-library/react";
import useGatewayKey from "../use-gateway-key";

const mockFetch = jest.fn();
jest.mock("../../lib/teamDashboardApi", () => ({
  fetchGatewayKey: (...args) => mockFetch(...args),
}));

const KEYS = (teamId) => ({ team_id: teamId, keys: [{ label: "Key 1", key: `sk-${teamId}` }] });

beforeEach(() => {
  mockFetch.mockReset();
  mockFetch.mockImplementation(async (teamId) => KEYS(teamId));
});

const render = (props) =>
  renderHook((p) => useGatewayKey(p), { initialProps: props });

test("a token rotation makes no request and keeps the key on screen", async () => {
  const { result, rerender } = render({ teamId: "t1", accessToken: "tok-1", enabled: true });
  await waitFor(() => expect(result.current.keyData).toEqual(KEYS("t1")));
  expect(mockFetch).toHaveBeenCalledTimes(1);

  rerender({ teamId: "t1", accessToken: "tok-2", enabled: true });

  expect(result.current.loading).toBe(false);
  expect(result.current.keyData).toEqual(KEYS("t1"));
  expect(mockFetch).toHaveBeenCalledTimes(1);
});

test("retry uses the current token", async () => {
  const { result, rerender } = render({ teamId: "t1", accessToken: "tok-1", enabled: true });
  await waitFor(() => expect(result.current.keyData).not.toBeNull());
  rerender({ teamId: "t1", accessToken: "tok-2", enabled: true });

  await act(async () => {
    result.current.retry();
  });

  expect(mockFetch).toHaveBeenLastCalledWith("t1", "tok-2");
});

test("switching teams refetches and drops the previous team's key", async () => {
  let resolveT2;
  const { result, rerender } = render({ teamId: "t1", accessToken: "tok-1", enabled: true });
  await waitFor(() => expect(result.current.keyData).toEqual(KEYS("t1")));
  mockFetch.mockImplementationOnce(() => new Promise((r) => { resolveT2 = r; }));

  rerender({ teamId: "t2", accessToken: "tok-1", enabled: true });

  expect(result.current.keyData).toBeNull();
  expect(result.current.loading).toBe(true);
  await act(async () => resolveT2(KEYS("t2")));
  expect(result.current.keyData).toEqual(KEYS("t2"));
});

test("a failed refetch keeps the last good key", async () => {
  const { result } = render({ teamId: "t1", accessToken: "tok-1", enabled: true });
  await waitFor(() => expect(result.current.keyData).toEqual(KEYS("t1")));
  mockFetch.mockRejectedValueOnce(new Error("LiteLLM down"));

  await act(async () => {
    result.current.retry();
  });

  // The card renders its error branch whenever `error` is set, so a failed
  // background refetch must not surface one over a working key.
  expect(result.current.keyData).toEqual(KEYS("t1"));
  expect(result.current.error).toBeNull();
  expect(result.current.loading).toBe(false);
});

test("an error with no key yet is reported", async () => {
  mockFetch.mockRejectedValueOnce(new Error("nope"));
  const { result } = render({ teamId: "t1", accessToken: "tok-1", enabled: true });
  await waitFor(() => expect(result.current.error).not.toBeNull());
  expect(result.current.keyData).toBeNull();
  expect(result.current.loading).toBe(false);
});

test("starts loading when the fetch will fire on mount", () => {
  mockFetch.mockImplementation(() => new Promise(() => {}));
  const { result } = render({ teamId: "t1", accessToken: "tok-1", enabled: true });
  expect(result.current.loading).toBe(true);
  expect(result.current.keyData).toBeNull();
});
