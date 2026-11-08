/**
 * /admin/check-in redirect stub: must wait for PropelAuth + the current-events
 * fetch before deciding, and send both roles straight to the newest current
 * event's Check-in section. Regression: deciding on the first render (auth
 * still loading) bounced every admin to /admin.
 */
import React from "react";
import { render, act } from "@testing-library/react";

const replace = jest.fn();
let routerQuery = {};
let auth = { userClass: undefined, loading: true };
let events = { hackathons: [], loading: true };

jest.mock("next/router", () => ({
  useRouter: () => ({
    isReady: true,
    query: routerQuery,
    replace,
    pathname: "/admin/check-in",
  }),
}));
jest.mock("@propelauth/react", () => ({ useAuthInfo: () => auth }));
jest.mock("../../hooks/use-hackathon-events", () => ({
  __esModule: true,
  default: () => events,
}));

const Page = require("../../pages/admin/check-in/index").default;
const { newestEventId } = require("../../lib/newestEvent");

const org = (...perms) => ({
  getOrgByName: () => ({ hasPermission: (p) => perms.includes(p) }),
});
const EVENTS = [
  { event_id: "2025_fall", start_date: "2025-10-11" },
  { event_id: "fall-2026", start_date: "2026-10-10" },
];

beforeEach(() => {
  replace.mockClear();
  routerQuery = {};
  auth = { userClass: undefined, loading: true };
  events = { hackathons: [], loading: true };
});

test("newestEventId picks the latest start date", () => {
  expect(newestEventId(EVENTS)).toBe("fall-2026");
  expect(newestEventId([])).toBeNull();
  expect(newestEventId(undefined)).toBeNull();
});

test("?event_id goes straight to that event's Check-in section", () => {
  routerQuery = { event_id: "fall-2026", foo: "1" };
  render(<Page />);
  expect(replace).toHaveBeenCalledWith({
    pathname: "/admin/hackathons/fall-2026",
    query: { foo: "1", section: "checkin" },
  });
});

test("does NOT redirect while auth or events are loading, then picks the newest current event", () => {
  const { rerender } = render(<Page />);
  expect(replace).not.toHaveBeenCalled();

  auth = { userClass: org("checkin.admin"), loading: false };
  rerender(<Page />);
  expect(replace).not.toHaveBeenCalled(); // events still loading

  events = { hackathons: EVENTS, loading: false };
  act(() => rerender(<Page />));
  expect(replace).toHaveBeenCalledTimes(1);
  expect(replace).toHaveBeenCalledWith({
    pathname: "/admin/hackathons/fall-2026",
    query: { section: "checkin" },
  });
});

test("no current event: full admin → hackathon list, helper → /admin", () => {
  events = { hackathons: [], loading: false };
  auth = { userClass: org("volunteer.admin"), loading: false };
  render(<Page />);
  expect(replace).toHaveBeenLastCalledWith({
    pathname: "/admin/hackathons",
    query: {},
  });

  replace.mockClear();
  auth = { userClass: org("checkin.admin"), loading: false };
  render(<Page />);
  expect(replace).toHaveBeenLastCalledWith({ pathname: "/admin", query: {} });
});
