import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import DrawTab from "../DrawTab";

jest.mock("@propelauth/react", () => ({ useAuthInfo: () => ({ accessToken: "tok" }) }));
jest.mock("../../../../lib/ga", () => ({ trackEvent: jest.fn(), EventCategory: { ADMIN: "admin" } }));
jest.mock("../../ExportCsvButton", () => () => null);
jest.mock("@hello-pangea/dnd", () => ({
  DragDropContext: ({ children }) => children,
  Droppable: ({ children }) => children({ droppableProps: {}, innerRef: () => {}, placeholder: null }),
  Draggable: ({ children }) => children({ draggableProps: {}, dragHandleProps: {}, innerRef: () => {} }),
}));

const mockStage = jest.fn();
jest.mock("../DrawStage", () => {
  const Stage = (props) => {
    mockStage(props);
    return <div data-testid="stage">{props.entries.map((e) => e.user_id).join(",")}</div>;
  };
  return { __esModule: true, default: Stage, winnerRows: () => [] };
});

const mockStart = jest.fn();
const mockEntries = jest.fn();
jest.mock("../../../../lib/giveawayApi", () => {
  const actual = jest.requireActual("../../../../lib/giveawayApi");
  return {
    ...actual,
    startGiveawayDraw: (...a) => mockStart(...a),
    getAdminGiveawayEntries: (...a) => mockEntries(...a),
  };
});

const PRIZES = [{ id: "mug", name: "Mug", quantity: 1, sort_order: 0 }];
const entry = (id, n = 10) => ({ user_id: id, entries: n, all_prizes: true, user: { name: id } });
const PAGE_LOAD_ENTRIES = [entry("ada")];
const AFTER_CLOSE_ENTRIES = [entry("ada", 20), entry("grace")];

function renderTab(giveaway, extra = {}) {
  return render(
    <DrawTab giveaway={giveaway} entries={PAGE_LOAD_ENTRIES} orgId="org" onUpdated={jest.fn()} {...extra} />,
  );
}

beforeEach(() => {
  mockStage.mockReset();
  mockStart.mockReset();
  mockEntries.mockReset();
  window.localStorage.clear();
});

test("Start draws from the entry list as it stands after entries close, not the page-load list", async () => {
  const open = { id: "fall-2026", status: "open", prizes: PRIZES, draw: null };
  mockStart.mockResolvedValue({ ...open, status: "closed", draw: { seed: "482913", results: [] } });
  mockEntries.mockResolvedValue({ entries: AFTER_CLOSE_ENTRIES });
  const onEntriesLoaded = jest.fn();
  renderTab(open, { onEntriesLoaded });

  fireEvent.change(screen.getByLabelText(/seed/i), { target: { value: "482913" } });
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /Start the draw/ }));
  });

  // The list is fetched only after the server has closed entries.
  expect(mockStart.mock.invocationCallOrder[0]).toBeLessThan(mockEntries.mock.invocationCallOrder[0]);
  expect(screen.getByTestId("stage")).toHaveTextContent("ada,grace");
  expect(mockStage.mock.calls[0][0].entries).toEqual(AFTER_CLOSE_ENTRIES);
  expect(onEntriesLoaded).toHaveBeenCalledWith(AFTER_CLOSE_ENTRIES);
});

test("Resume reloads entries before opening the stage", async () => {
  const started = { id: "fall-2026", status: "closed", prizes: PRIZES, draw: { seed: "482913", results: [] } };
  mockEntries.mockResolvedValue({ entries: AFTER_CLOSE_ENTRIES });
  renderTab(started);

  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /Resume the draw/ }));
  });

  expect(mockEntries).toHaveBeenCalledTimes(1);
  expect(mockStage.mock.calls.every((c) => c[0].entries === AFTER_CLOSE_ENTRIES)).toBe(true);
});

test("a failed entry reload keeps the stage closed and says so", async () => {
  const started = { id: "fall-2026", status: "closed", prizes: PRIZES, draw: { seed: "482913", results: [] } };
  mockEntries.mockRejectedValue(new Error("boom"));
  renderTab(started);

  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /Resume the draw/ }));
  });

  expect(screen.queryByTestId("stage")).toBeNull();
  expect(screen.getByText(/couldn't load the latest entries/i)).toBeInTheDocument();
});
