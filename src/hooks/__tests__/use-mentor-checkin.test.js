/**
 * useMentorCheckin — the race that flashed "You are not registered as a
 * mentor" on /hack/<event>/mentor-checkin, token rotation, and the rule that a
 * /status failure never demotes a found mentor.
 */
import { renderHook, waitFor, act } from "@testing-library/react";
import axios from "axios";
import useMentorCheckin from "../use-mentor-checkin";

jest.mock("axios", () => {
  const mockAxios = jest.fn();
  mockAxios.default = mockAxios;
  mockAxios.get = jest.fn();
  mockAxios.post = jest.fn();
  return mockAxios;
});

// Stable user identity (an effect keyed on the object would loop); the test
// swaps `mockAuth` and re-renders to simulate PropelAuth resolving/rotating.
const mockUser = { userId: "propel-1", email: "mentor@example.com" };
let mockAuth;
jest.mock("@propelauth/react", () => ({
  useAuthInfo: () => mockAuth,
}));
jest.mock("../../context/env.context", () => ({
  useEnv: () => ({ apiServerUrl: "https://api.test" }),
}));

const EVENT = {
  title: "Fall 2026",
  start_date: "2026-11-14",
  end_date: "2026-11-15",
  timezone: "America/Phoenix",
  teams: [{ id: "t1" }],
  nonprofits: [],
};
const MENTOR = { name: "Mo", email: "mentor@example.com", isSelected: true };
const WINDOW = { state: "upcoming", opens_at: "2026-11-14T00:00:00-07:00", closes_at: null };

function deferred() {
  let resolve;
  const promise = new Promise((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

const okJson = (body) => Promise.resolve({ ok: true, json: () => Promise.resolve(body) });

function routeAxios({ application = MENTOR, status, applicationError } = {}) {
  axios.mockImplementation((config) => {
    if (config.url.endsWith("/api/mentor/application/fall-2026")) {
      if (applicationError) return Promise.reject(applicationError);
      return Promise.resolve({ data: { data: application } });
    }
    if (config.url.endsWith("/api/mentor/checkin/fall-2026/status")) {
      if (status instanceof Error) return Promise.reject(status);
      return Promise.resolve({
        data: { data: status || { isCheckedIn: false, isSelected: true, window: WINDOW } },
      });
    }
    return Promise.reject(new Error(`unexpected ${config.url}`));
  });
}

const calls = (suffix) =>
  axios.mock.calls.filter(([config]) => config.url.endsWith(suffix)).length;

beforeEach(() => {
  axios.mockReset();
  global.fetch = jest.fn(() => okJson(EVENT));
  mockAuth = { loading: false, isLoggedIn: true, user: mockUser, accessToken: "tok-1" };
});

it("auth resolving mid-flight with a slow event fetch goes loading → ready, never not_applied/logged_out", async () => {
  const slowEvent = deferred();
  global.fetch = jest.fn(() => slowEvent.promise);
  routeAxios();
  mockAuth = { loading: true, isLoggedIn: false, user: null, accessToken: null };

  const gates = [];
  const { result, rerender } = renderHook(() => {
    const value = useMentorCheckin("fall-2026");
    gates.push(value.gate);
    return value;
  });
  expect(result.current.gate).toBe("loading");

  // PropelAuth settles: logged in.
  mockAuth = { loading: false, isLoggedIn: true, user: mockUser, accessToken: "tok-1" };
  rerender();
  // Then the (slow) event finally lands.
  await act(async () => {
    slowEvent.resolve({ ok: true, json: () => Promise.resolve(EVENT) });
  });

  await waitFor(() => expect(result.current.gate).toBe("ready"));
  expect(gates).not.toContain("not_applied");
  expect(gates).not.toContain("logged_out");
  expect(result.current.mentor.name).toBe("Mo");
  expect(result.current.checkinWindow).toEqual(WINDOW);
  expect(result.current.teams).toEqual([{ id: "t1" }]);
});

it("a token rotation (and a new user object) fires zero new requests", async () => {
  routeAxios();
  const { result, rerender } = renderHook(() => useMentorCheckin("fall-2026"));
  await waitFor(() => expect(result.current.gate).toBe("ready"));
  const axiosCalls = axios.mock.calls.length;
  const fetchCalls = global.fetch.mock.calls.length;

  mockAuth = { ...mockAuth, accessToken: "tok-2", user: { ...mockUser } };
  rerender();
  await act(async () => {});

  expect(axios.mock.calls.length).toBe(axiosCalls);
  expect(global.fetch.mock.calls.length).toBe(fetchCalls);
  expect(result.current.gate).toBe("ready");
});

it("a /status 404 keeps the mentor (gate stays ready)", async () => {
  const notFound = Object.assign(new Error("404"), { response: { status: 404 } });
  routeAxios({ status: notFound });
  const { result } = renderHook(() => useMentorCheckin("fall-2026"));
  await waitFor(() => expect(result.current.gate).toBe("ready"));
  expect(result.current.mentor.name).toBe("Mo");
  expect(result.current.checkedIn).toBe(false);
  expect(result.current.checkinWindow).toBeNull();
});

it("an application 500 is mentor_error and retry() recovers", async () => {
  const boom = Object.assign(new Error("500"), { response: { status: 500 } });
  routeAxios({ applicationError: boom });
  const { result } = renderHook(() => useMentorCheckin("fall-2026"));
  await waitFor(() => expect(result.current.gate).toBe("mentor_error"));

  routeAxios();
  act(() => result.current.retry());
  await waitFor(() => expect(result.current.gate).toBe("ready"));
});

it("no application settles as not_applied", async () => {
  routeAxios({ application: null });
  const { result } = renderHook(() => useMentorCheckin("fall-2026"));
  await waitFor(() => expect(result.current.gate).toBe("not_applied"));
  expect(calls("/status")).toBe(0);
});

it("a pending mentor approved meanwhile flips to ready on refreshStatus, without a loading flash", async () => {
  routeAxios({
    application: { ...MENTOR, isSelected: false },
    status: { isCheckedIn: false, isSelected: false, window: WINDOW },
  });
  const gates = [];
  const { result } = renderHook(() => {
    const value = useMentorCheckin("fall-2026");
    gates.push(value.gate);
    return value;
  });
  await waitFor(() => expect(result.current.gate).toBe("pending"));
  gates.length = 0;

  routeAxios({ status: { isCheckedIn: true, isSelected: true, window: WINDOW } });
  await act(async () => {
    await result.current.refreshStatus();
  });
  expect(result.current.gate).toBe("ready");
  expect(result.current.checkedIn).toBe(true);
  expect(gates).not.toContain("loading");
});

it("logged out after auth settles is logged_out and fires no mentor requests", async () => {
  mockAuth = { loading: false, isLoggedIn: false, user: null, accessToken: null };
  const { result } = renderHook(() => useMentorCheckin("fall-2026"));
  await waitFor(() => expect(result.current.gate).toBe("logged_out"));
  expect(axios).not.toHaveBeenCalled();
});

it("the uncached /status review status wins over a stale application copy", async () => {
  // The application GET returns a stale "denied" copy; /status has the truth.
  routeAxios({
    application: { ...MENTOR, isSelected: false, status: "denied" },
    status: { isCheckedIn: false, isSelected: false, status: "pending", window: WINDOW },
  });
  const gates = [];
  const { result } = renderHook(() => {
    const value = useMentorCheckin("fall-2026");
    gates.push(value.gate);
    return value;
  });
  await waitFor(() => expect(result.current.gate).toBe("pending"));
  expect(gates).not.toContain("not_selected");
});

it("an older backend without status in /status keeps the application's", async () => {
  routeAxios({
    application: { ...MENTOR, isSelected: false, status: "denied" },
    status: { isCheckedIn: false, isSelected: false, window: WINDOW },
  });
  const { result } = renderHook(() => useMentorCheckin("fall-2026"));
  await waitFor(() => expect(result.current.gate).toBe("not_selected"));
});
