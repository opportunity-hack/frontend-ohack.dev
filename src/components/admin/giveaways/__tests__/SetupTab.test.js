import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import SetupTab from "../SetupTab";
import EntriesTab, { filterEntries } from "../EntriesTab";
import { eligibleForPrize } from "../../../../lib/giveawayDraw";

jest.mock("@propelauth/react", () => ({
  useAuthInfo: () => ({ accessToken: "tok", loading: false, isLoggedIn: true, user: { userId: "a" } }),
}));
jest.mock("../../../../hooks/use-hackathon-events", () => () => ({
  hackathons: [{ event_id: "2026_fall", title: "Fall 2026", start_date: "2026-11-13" }],
}));
jest.mock("../../../../lib/ga", () => ({ trackEvent: jest.fn(), EventCategory: { ADMIN: "admin" } }));
jest.mock("next/image", () => ({ __esModule: true, default: (p) => <img src={p.src} alt="" /> }));
jest.mock("@hello-pangea/dnd", () => ({
  DragDropContext: ({ children }) => <div>{children}</div>,
  Droppable: ({ children }) => children({ droppableProps: {}, innerRef: () => {}, placeholder: null }),
  Draggable: ({ children }) => children({ draggableProps: {}, dragHandleProps: {}, innerRef: () => {} }),
}));
jest.mock("../../ExportCsvButton", () => () => <button type="button">Download CSV</button>);

const mockUpdate = jest.fn();
jest.mock("../../../../lib/giveawayApi", () => {
  const actual = jest.requireActual("../../../../lib/giveawayApi");
  return { ...actual, updateAdminGiveaway: (...a) => mockUpdate(...a) };
});

const GIVEAWAY = {
  id: "fall-2026",
  title: "Fall giveaway",
  description: "",
  event_id: null,
  closes_at: null,
  must_be_present: true,
  status: "draft",
  draw_started: false,
  prizes: [{ id: "p1", name: "Headphones", quantity: 1, sort_order: 0 }],
};

beforeEach(() => mockUpdate.mockReset());

test("Save is disabled until something changes, then sends the full payload", async () => {
  mockUpdate.mockImplementation((id, body) => Promise.resolve({ ...GIVEAWAY, ...body, prizes: body.prizes.map((p, i) => ({ id: p.id || `new${i}`, ...p, sort_order: i })) }));
  const onSaved = jest.fn();
  render(<SetupTab giveaway={GIVEAWAY} orgId="org" entriesCount={0} onSaved={onSaved} />);
  const save = screen.getByRole("button", { name: "Save" });
  expect(save).toBeDisabled();

  fireEvent.click(screen.getByRole("button", { name: "Add prize" }));
  // a blank prize blocks Save until it has a name
  expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  const names = screen.getAllByLabelText(/Prize name/);
  fireEvent.change(names[1], { target: { value: "Mug" } });
  fireEvent.click(screen.getByRole("button", { name: "Open" }));
  fireEvent.click(screen.getByRole("button", { name: "Save" }));

  await waitFor(() => expect(mockUpdate).toHaveBeenCalled());
  const [id, body, opts] = mockUpdate.mock.calls[0];
  expect(id).toBe("fall-2026");
  expect(opts).toEqual({ token: "tok", orgId: "org" });
  expect(body.status).toBe("open");
  expect(body.prizes).toEqual([
    { id: "p1", name: "Headphones", description: "", quantity: 1, product_url: null, image_url: null },
    { name: "Mug", description: "", quantity: 1, product_url: null, image_url: null },
  ]);
  await waitFor(() => expect(onSaved).toHaveBeenCalled());
  expect(screen.getByText("All changes saved")).toBeInTheDocument();
});

test("status is locked once the draw has started", () => {
  render(<SetupTab giveaway={{ ...GIVEAWAY, status: "closed", draw_started: true }} orgId="org" entriesCount={3} onSaved={jest.fn()} />);
  expect(screen.getByRole("button", { name: "Open" })).toBeDisabled();
  expect(screen.getByText(/status is locked/)).toBeInTheDocument();
});

const ENTRIES = [
  { user_id: "u1", entries: 50, all_prizes: true, user: { name: "Ada Lovelace", github: "ada" } },
  { user_id: "u2", entries: 10, all_prizes: false, prize_ids: ["p1"], user: { name: "Grace Hopper" } },
  { user_id: "u3", entries: 5, all_prizes: false, prize_ids: [], user: { name: "Linus" } },
];

test("Entries search and prize filter only change the table", () => {
  render(<EntriesTab giveaway={GIVEAWAY} entries={ENTRIES} />);
  expect(screen.getByText("Headphones 2")).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText(/Search name/), { target: { value: "grace" } });
  expect(screen.queryByText("Ada Lovelace")).toBeNull();
  expect(screen.getByText("Grace Hopper")).toBeInTheDocument();
  // The draw input is the full list, untouched by the table's filter.
  expect(filterEntries(ENTRIES, { query: "grace" })).toHaveLength(1);
  expect(eligibleForPrize(ENTRIES, "p1").map((e) => e.user_id)).toEqual(["u1", "u2"]);
});
