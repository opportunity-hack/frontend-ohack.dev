import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import EntriesTab, { REMOVE_ALL_CONFIRM } from "../EntriesTab";
import { ApiError } from "../../../../lib/giveawayApi";

jest.mock("@propelauth/react", () => ({ useAuthInfo: () => ({ accessToken: "tok" }) }));
jest.mock("../../ExportCsvButton", () => () => null);

const mockRemove = jest.fn();
jest.mock("../../../../lib/giveawayApi", () => {
  const actual = jest.requireActual("../../../../lib/giveawayApi");
  return { ...actual, removeGiveawayEntries: (...a) => mockRemove(...a) };
});

const GIVEAWAY = {
  id: "fall-2026",
  status: "open",
  accepting_entries: true,
  draw: null,
  prizes: [{ id: "mug", name: "Mug", quantity: 1, sort_order: 0 }],
};
const entry = (uid, n = 10) => ({ id: `fall-2026__${uid}`, user_id: uid, entries: n, all_prizes: true, user: { name: uid } });
const ENTRIES = [entry("ada", 20), entry("grace")];

function renderTab(extra = {}) {
  const onEntriesChanged = jest.fn();
  const onSnack = jest.fn();
  render(
    <EntriesTab
      giveaway={GIVEAWAY}
      entries={ENTRIES}
      orgId="org"
      onEntriesChanged={onEntriesChanged}
      onSnack={onSnack}
      {...extra}
    />,
  );
  return { onEntriesChanged, onSnack };
}

beforeEach(() => mockRemove.mockReset());

test("removes one entry after a confirm and hands the fresh list to the page", async () => {
  mockRemove.mockResolvedValue({ entries: [ENTRIES[1]], count: 1, removed: 1 });
  const { onEntriesChanged, onSnack } = renderTab();
  fireEvent.click(screen.getByRole("button", { name: "Remove ada's entry" }));
  expect(screen.getByText(/people can enter again/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Remove entry" }));
  await waitFor(() => expect(onEntriesChanged).toHaveBeenCalledWith([ENTRIES[1]]));
  expect(mockRemove).toHaveBeenCalledWith("fall-2026", { entry_ids: ["fall-2026__ada"] }, { token: "tok", orgId: "org" });
  expect(onSnack).toHaveBeenCalledWith("Removed ada's entry.");
});

test("remove all needs the typed confirm", async () => {
  mockRemove.mockResolvedValue({ entries: [], count: 0, removed: 2 });
  const { onEntriesChanged } = renderTab();
  fireEvent.click(screen.getByRole("button", { name: "Remove all entries…" }));
  const confirm = screen.getByRole("button", { name: "Remove all" });
  expect(confirm).toBeDisabled();
  fireEvent.change(screen.getByLabelText(`Type "${REMOVE_ALL_CONFIRM}" to confirm`), {
    target: { value: REMOVE_ALL_CONFIRM },
  });
  fireEvent.click(confirm);
  await waitFor(() => expect(onEntriesChanged).toHaveBeenCalledWith([]));
  expect(mockRemove).toHaveBeenCalledWith("fall-2026", { all: true }, expect.anything());
});

test("a refused removal keeps the dialog open with the server's message", async () => {
  mockRemove.mockRejectedValue(new ApiError(409, { error: "draw_started", message: "The draw has started." }));
  const { onEntriesChanged } = renderTab();
  fireEvent.click(screen.getByRole("button", { name: "Remove grace's entry" }));
  fireEvent.click(screen.getByRole("button", { name: "Remove entry" }));
  expect(await screen.findByText("The draw has started.")).toBeInTheDocument();
  expect(onEntriesChanged).not.toHaveBeenCalled();
});

test("removal is disabled once the draw has started", () => {
  renderTab({ giveaway: { ...GIVEAWAY, status: "closed", accepting_entries: false, draw: { seed: "123456" } } });
  expect(screen.getByRole("button", { name: "Remove all entries…" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Remove ada's entry" })).toBeDisabled();
  expect(screen.getByText(/Reset the draw on the Draw tab first/)).toBeInTheDocument();
});

test("read-only without onEntriesChanged", () => {
  renderTab({ onEntriesChanged: undefined });
  expect(screen.queryByRole("button", { name: /Remove/ })).not.toBeInTheDocument();
});
