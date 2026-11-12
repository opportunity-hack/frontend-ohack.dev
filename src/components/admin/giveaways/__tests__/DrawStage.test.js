import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import DrawStage from "../DrawStage";

jest.mock("@propelauth/react", () => ({ useAuthInfo: () => ({ accessToken: "tok" }) }));
jest.mock("next/dynamic", () => () => () => null);
jest.mock("next/image", () => ({ __esModule: true, default: (p) => <img src={p.src} alt="" /> }));
jest.mock("../../../../lib/ga", () => ({ trackEvent: jest.fn(), EventCategory: { ADMIN: "admin" } }));
jest.mock("../../ExportCsvButton", () => () => <button type="button">Export CSV</button>);

const mockRecord = jest.fn();
const mockUndo = jest.fn();
jest.mock("../../../../lib/giveawayApi", () => {
  const actual = jest.requireActual("../../../../lib/giveawayApi");
  return {
    ...actual,
    recordGiveawayResult: (...a) => mockRecord(...a),
    undoGiveawayResult: (...a) => mockUndo(...a),
  };
});

const PRIZES = [
  { id: "mug", name: "Mug", quantity: 1, sort_order: 0 },
  { id: "kb", name: "Keyboard", quantity: 1, sort_order: 1 },
];
const ENTRIES = ["ada", "grace", "linus", "katherine"].map((id, i) => ({
  user_id: id,
  entries: 10 + i,
  all_prizes: true,
  user: { name: `${id[0].toUpperCase()}${id.slice(1)} Tester` },
}));
const GIVEAWAY = { id: "fall-2026", title: "Fall giveaway", status: "closed", prizes: PRIZES, draw: { seed: "482913", results: [] } };

const space = () => fireEvent.keyDown(window, { key: " " });
const flush = async () => {
  await act(async () => {
    jest.runOnlyPendingTimers();
  });
};

/** Space through waiting beats and run timers until the check beat. */
async function playToCheck() {
  for (let i = 0; i < 40 && !screen.queryByRole("button", { name: /They're here/ }); i += 1) {
    space();
    await flush();
  }
}

let results;
beforeEach(() => {
  jest.useFakeTimers();
  results = [];
  mockRecord.mockReset();
  mockUndo.mockReset();
  mockRecord.mockImplementation((id, body) => {
    if (body.finish) return Promise.resolve({ result: null, status: "drawn", giveaway: { ...GIVEAWAY, status: "drawn", draw: { seed: "482913", results } } });
    const result = { id: `r${results.length}`, ...body, name: ENTRIES.find((e) => e.user_id === body.user_id).user.name, at: "2026-11-14T23:00:00Z" };
    results = [...results, result];
    return Promise.resolve({ result, status: "closed", giveaway: { ...GIVEAWAY, draw: { seed: "482913", results } } });
  });
  window.matchMedia = jest.fn().mockReturnValue({ matches: false });
});
afterEach(() => jest.useRealTimers());

test("prize → winner → not here → redraw → confirm → next prize → finale", async () => {
  const onUpdated = jest.fn();
  render(<DrawStage giveaway={GIVEAWAY} entries={ENTRIES} drawOrder={["mug", "kb"]} orgId="org" onUpdated={onUpdated} onClose={jest.fn()} />);
  expect(screen.getByText("4 people in the running · 46 entries")).toBeInTheDocument();

  await playToCheck();
  await act(async () => {
    fireEvent.keyDown(window, { key: "n" });
  });
  expect(mockRecord.mock.calls[0][1]).toMatchObject({ prize_id: "mug", slot: 0, outcome: "absent", attempt: 0 });
  const absentId = mockRecord.mock.calls[0][1].user_id;
  expect(screen.getByText("Not here (1)")).toBeInTheDocument();

  await playToCheck();
  await act(async () => {
    fireEvent.keyDown(window, { key: "Enter" });
  });
  const won = mockRecord.mock.calls[1][1];
  expect(won).toMatchObject({ prize_id: "mug", outcome: "won", attempt: 1 });
  expect(won.user_id).not.toBe(absentId);
  expect(onUpdated).toHaveBeenCalled();
  expect(screen.getByText(/Next prize:/)).toBeInTheDocument();

  space();
  await flush();
  // The winner and the absentee are out of the next prize's pool.
  const left = ENTRIES.filter((e) => e.user_id !== won.user_id && e.user_id !== absentId);
  const leftEntries = left.reduce((n, e) => n + e.entries, 0);
  expect(screen.getByText(`2 people in the running · ${leftEntries} entries`)).toBeInTheDocument();
  await playToCheck();
  await act(async () => {
    fireEvent.keyDown(window, { key: "Enter" });
  });
  expect(mockRecord.mock.calls[2][1].user_id).not.toBe(won.user_id);
  expect(mockRecord.mock.calls[2][1].user_id).not.toBe(absentId);
  expect(await screen.findByRole("heading", { name: "Winners" })).toBeInTheDocument();
  expect(mockRecord.mock.calls.some(([, b]) => b.finish === true)).toBe(true);
});

test("a failed save stays on the winner with the error", async () => {
  mockRecord.mockRejectedValueOnce(Object.assign(new Error("x"), { body: { message: "Network down" } }));
  render(<DrawStage giveaway={GIVEAWAY} entries={ENTRIES} drawOrder={[]} orgId="org" onUpdated={jest.fn()} onClose={jest.fn()} />);
  await playToCheck();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /They're here/ }));
  });
  expect(screen.getByRole("alert")).toHaveTextContent("Network down");
  expect(screen.getByRole("button", { name: /They're here/ })).toBeEnabled();
  expect(screen.queryByText(/Next prize:/)).toBeNull();
});

test("reduced motion goes from the prize straight to the winner", async () => {
  window.matchMedia = jest.fn().mockReturnValue({ matches: true });
  render(<DrawStage giveaway={GIVEAWAY} entries={ENTRIES} drawOrder={[]} orgId="org" onUpdated={jest.fn()} onClose={jest.fn()} />);
  space();
  await flush();
  expect(screen.queryByText("Seed")).toBeNull();
  await flush();
  expect(screen.getByRole("button", { name: /They're here/ })).toBeInTheDocument();
});

test("Esc with an unrecorded winner on screen asks first", async () => {
  const onClose = jest.fn();
  render(<DrawStage giveaway={GIVEAWAY} entries={ENTRIES} drawOrder={[]} orgId="org" onUpdated={jest.fn()} onClose={onClose} />);
  await playToCheck();
  fireEvent.keyDown(window, { key: "Escape" });
  expect(onClose).not.toHaveBeenCalled();
  expect(screen.getByText(/isn't recorded yet/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Leave" }));
  expect(onClose).toHaveBeenCalled();
});
