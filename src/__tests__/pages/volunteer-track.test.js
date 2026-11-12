/**
 * /volunteer/track × auth (Class C, docs/plans/reliability-bug-classes-2026-11.md):
 * one initial fetch, zero requests on a token rotation, requests carry the
 * current token, and a backend 500 renders the inline Retry.
 * Lives under src/__tests__/pages — never under src/pages.
 */
import React from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

process.env.NEXT_PUBLIC_API_SERVER_URL = "http://api.test";

let mockAuth;
jest.mock("@propelauth/react", () => ({
  withAuthInfo: (Component) =>
    function WithAuth(props) {
      return <Component {...props} {...mockAuth} />;
    },
}));
jest.mock("next/dynamic", () => () => () => null);
jest.mock("../../lib/ga", () => ({
  initFacebookPixel: jest.fn(),
  trackEvent: jest.fn(),
}));
jest.mock(
  "../../components/FunVolunteerTimer/FunVolunteerTimer",
  () => () => null,
);
jest.mock(
  "../../components/VolunteerStatsTable/VolunteerStatsTable",
  () => () => null,
);

import VolunteerTrack from "../../pages/volunteer/track";

const ok = (body) =>
  Promise.resolve({ ok: true, status: 200, json: async () => body });
const DATA = {
  totalActiveHours: 2,
  totalCommitmentHours: 3,
  allVolunteering: [],
};
const PAGE_PROPS = {
  metaTitle: "Track",
  metaDescription: "d",
  metaKeywords: "k",
  ogImage: "i",
  canonicalUrl: "https://www.ohack.dev/volunteer/track",
};

beforeEach(() => {
  localStorage.clear();
  mockAuth = { isLoggedIn: true, accessToken: "tok-1" };
  global.fetch = jest.fn(() => ok(DATA));
});
afterEach(() => {
  delete global.fetch;
});

it("fetches once, a token rotation fires nothing, and the next request uses the new token", async () => {
  const { rerender } = render(<VolunteerTrack {...PAGE_PROPS} />);
  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
  expect(global.fetch.mock.calls[0][1].headers.Authorization).toBe(
    "Bearer tok-1",
  );

  mockAuth = { ...mockAuth, accessToken: "tok-2" };
  rerender(<VolunteerTrack {...PAGE_PROPS} />);
  await act(async () => {});
  expect(global.fetch).toHaveBeenCalledTimes(1);

  fireEvent.click(
    screen.getByRole("button", { name: "Fetch volunteer report" }),
  );
  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
  expect(global.fetch.mock.calls[1][1].headers.Authorization).toBe(
    "Bearer tok-2",
  );
});

it("a 500 renders the inline Retry, which recovers", async () => {
  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })
    .mockImplementation(() => ok(DATA));
  const err = jest.spyOn(console, "error").mockImplementation(() => {});
  render(<VolunteerTrack {...PAGE_PROPS} />);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "We couldn't load your volunteer data just now.",
  );
  fireEvent.click(screen.getByRole("button", { name: /Retry/ }));
  await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
  err.mockRestore();
});

it("logged out: no request", async () => {
  mockAuth = { isLoggedIn: false, accessToken: null };
  render(<VolunteerTrack {...PAGE_PROPS} />);
  await act(async () => {});
  expect(global.fetch).not.toHaveBeenCalled();
});
