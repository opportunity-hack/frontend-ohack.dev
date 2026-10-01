/**
 * useHackathonEvents must never expose `hackathons` as undefined: makeRequest
 * returns the axios error.response object on a non-2xx, and the effect used to
 * do setHackathons(data.hackathons) with it, so a 429/5xx crashed every
 * consumer's .map. Failures now yield [] plus an `error`.
 */
import { renderHook, waitFor } from "@testing-library/react";
import axios from "axios";
import useHackathonEvents from "../use-hackathon-events";

jest.mock("axios", () => {
  const mockAxios = jest.fn();
  mockAxios.default = mockAxios;
  mockAxios.isAxiosError = jest.fn(() => true);
  return mockAxios;
});
jest.mock("@propelauth/react", () => {
  const stable = { user: null, orgHelper: null, isLoggedIn: false };
  return { useAuthInfo: () => stable };
});
jest.mock("../../context/env.context", () => ({
  useEnv: () => ({ apiServerUrl: "https://api.test" }),
}));

describe("useHackathonEvents", () => {
  beforeEach(() => axios.mockReset());

  it("yields [] and an error (not undefined) when the backend answers 429", async () => {
    axios.mockRejectedValue({
      response: { status: 429, statusText: "Too Many Requests", data: { error: "rate_limited" } },
    });
    const { result } = renderHook(() => useHackathonEvents("current"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hackathons).toEqual([]);
    expect(result.current.error).toEqual({ status: 429, message: "rate_limited" });
  });

  it("stays quiet on 403 (no events for this user) and on success", async () => {
    axios.mockRejectedValueOnce({ response: { status: 403, statusText: "Forbidden", data: {} } });
    const first = renderHook(() => useHackathonEvents("current"));
    await waitFor(() => expect(first.result.current.loading).toBe(false));
    expect(first.result.current.hackathons).toEqual([]);
    expect(first.result.current.error).toBeNull();

    axios.mockResolvedValueOnce({ data: { hackathons: [{ id: "a" }] } });
    const second = renderHook(() => useHackathonEvents("current"));
    await waitFor(() => expect(second.result.current.loading).toBe(false));
    expect(second.result.current.hackathons).toHaveLength(1);
    expect(second.result.current.error).toBeNull();
  });
});
