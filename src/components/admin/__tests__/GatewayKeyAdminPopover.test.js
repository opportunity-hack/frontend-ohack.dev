import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import GatewayKeyAdminPopover, {
  gatewayStatusFor,
  gatewayNeedsProvision,
} from "../GatewayKeyAdminPopover";

const team = { id: "t1", name: "Team Rocket", status: "NONPROFIT_SELECTED" };
const anchor = () => document.body;

const key1Active = {
  label: "Key 1",
  key_alias: "fall26-t1",
  models: ["muse-spark"],
  max_budget: 15,
  expires: "2026-11-16T01:00:00Z",
  status: "active",
};

const key2Active = {
  label: "Key 2",
  key_alias: "fall26-t1-frontier",
  models: ["muse-wonder", "kimi-k3"],
  max_budget: 20,
  expires: "2026-11-16T01:00:00Z",
  status: "active",
};

function renderPopover({ status, api = {}, onStatusChange = jest.fn() }) {
  const fullApi = { reveal: jest.fn(), rotate: jest.fn(), provision: jest.fn(), ...api };
  render(
    <GatewayKeyAdminPopover
      open
      anchorEl={anchor()}
      onClose={() => {}}
      team={team}
      status={status}
      api={fullApi}
      onStatusChange={onStatusChange}
    />,
  );
  return { api: fullApi, onStatusChange };
}

describe("gatewayStatusFor", () => {
  it("maps IN_REVIEW to not_approved, otherwise the Key 1 status or missing", () => {
    expect(gatewayStatusFor({ id: "x", status: "IN_REVIEW" }, {})).toBe("not_approved");
    expect(gatewayStatusFor({ id: "x" }, {})).toBe("not_approved");
    expect(gatewayStatusFor(team, { t1: { keys: [key1Active] } })).toBe("active");
    expect(gatewayStatusFor(team, { t1: { keys: [] } })).toBe("missing");
    expect(gatewayStatusFor(team, {})).toBe("missing");
    expect(gatewayStatusFor(null, {})).toBeNull();
  });
});

// The "No AI key" filter and the bulk "Provision missing" button use this —
// a team whose Key 2 mint failed during approval (Key 1 active) must count.
describe("gatewayNeedsProvision", () => {
  it("is false for IN_REVIEW teams and fully active teams", () => {
    expect(gatewayNeedsProvision({ id: "x", status: "IN_REVIEW" }, {})).toBe(false);
    expect(gatewayNeedsProvision(team, { t1: { keys: [key1Active, key2Active] } })).toBe(false);
  });
  it("is true when Key 1 is active but Key 2 is missing or pending", () => {
    expect(
      gatewayNeedsProvision(team, { t1: { keys: [key1Active, { ...key2Active, status: "missing" }] } }),
    ).toBe(true);
    expect(
      gatewayNeedsProvision(team, { t1: { keys: [key1Active, { ...key2Active, status: "pending" }] } }),
    ).toBe(true);
    expect(gatewayNeedsProvision(team, { t1: { keys: [key1Active] } })).toBe(true);
  });
  it("is true with no record, an empty keys list, or Key 1 missing", () => {
    expect(gatewayNeedsProvision(team, {})).toBe(true);
    expect(gatewayNeedsProvision(team, { t1: { keys: [] } })).toBe(true);
    expect(
      gatewayNeedsProvision(team, { t1: { keys: [{ ...key1Active, status: "missing" }, key2Active] } }),
    ).toBe(true);
  });
});

describe("GatewayKeyAdminPopover", () => {
  beforeEach(() => {
    Object.assign(navigator, { clipboard: { writeText: jest.fn().mockResolvedValue() } });
  });

  it("active key: reveals on demand (never pre-fetched), masks by default, copies the real key", async () => {
    const { api } = renderPopover({
      status: { keys: [key1Active, { ...key2Active, status: "missing" }] },
      api: {
        reveal: jest.fn().mockResolvedValue({
          team_id: "t1",
          keys: [{ ...key1Active, key: "sk-live-xyz", spend: 1.25 }],
        }),
      },
    });
    expect(api.reveal).not.toHaveBeenCalled();
    expect(screen.getByText("Active")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Reveal key/ }));
    await screen.findByText("sk-live-xyz");
    expect(api.reveal).toHaveBeenCalledWith("t1");
    expect(screen.getByText(/\$1\.25 spent/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Hide" }));
    expect(screen.queryByText("sk-live-xyz")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("sk-live-xyz");
  });

  it("rotate is two-step and reports the new state through onStatusChange", async () => {
    const { api, onStatusChange } = renderPopover({
      status: { keys: [key1Active] },
      api: {
        rotate: jest.fn().mockResolvedValue({
          team_id: "t1",
          keys: [key1Active, { ...key2Active, status: "missing" }],
        }),
      },
    });
    fireEvent.click(screen.getByRole("button", { name: /Rotate key/ }));
    expect(api.rotate).not.toHaveBeenCalled();
    expect(screen.getByText(/stops working the moment you confirm/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Yes, rotate/ }));
    await waitFor(() => expect(api.rotate).toHaveBeenCalledWith("t1", "key1"));
    await screen.findByText(/Rotated\. The old key stopped working/);
    expect(onStatusChange).toHaveBeenCalledWith(
      "t1",
      expect.objectContaining({
        keys: expect.arrayContaining([
          expect.objectContaining({ key_alias: "fall26-t1", status: "active" }),
        ]),
      }),
    );
  });

  it("a failed rotate shows the error and downgrades only that key to missing", async () => {
    const { onStatusChange } = renderPopover({
      status: { keys: [key1Active] },
      api: { rotate: jest.fn().mockRejectedValue(new Error("The AI gateway didn't respond. Try again in a moment.")) },
    });
    fireEvent.click(screen.getByRole("button", { name: /Rotate key/ }));
    fireEvent.click(screen.getByRole("button", { name: /Yes, rotate/ }));
    await screen.findByText(/gateway didn't respond/);
    expect(onStatusChange).toHaveBeenCalledWith("t1", {
      keys: [{ ...key1Active, status: "missing" }],
    });
  });

  it("missing key: offers Provision and marks the row active on success", async () => {
    const { api, onStatusChange } = renderPopover({
      status: undefined,
      api: {
        provision: jest.fn().mockResolvedValue({
          team_id: "t1",
          keys: [key1Active, key2Active],
        }),
      },
    });
    expect(screen.getAllByText("No key")).toHaveLength(2); // Key 1 and Key 2 both missing
    expect(screen.queryByRole("button", { name: /Rotate key/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Provision key/ }));
    await screen.findByText(/Keys minted/);
    expect(api.provision).toHaveBeenCalledWith("t1");
    expect(onStatusChange).toHaveBeenCalledWith(
      "t1",
      expect.objectContaining({
        keys: expect.arrayContaining([
          expect.objectContaining({ key_alias: "fall26-t1", status: "active" }),
        ]),
      }),
    );
  });

  it("pending key: offers Retry mint", () => {
    renderPopover({ status: { keys: [{ ...key1Active, status: "pending" }] } });
    expect(screen.getByText("Minting…")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Retry mint/ })).toBeInTheDocument();
  });
});

describe("GatewayKeyAdminPopover Key 2", () => {
  beforeEach(() => {
    Object.assign(navigator, { clipboard: { writeText: jest.fn().mockResolvedValue() } });
  });

  const withKey2 = { keys: [key1Active, key2Active] };

  it("shows the Key 2 row alongside Key 1 and rotates Key 2 separately", async () => {
    const { api, onStatusChange } = renderPopover({
      status: withKey2,
      api: {
        rotate: jest.fn().mockResolvedValue({ team_id: "t1", keys: [key1Active, key2Active] }),
      },
    });
    expect(screen.getByText("Key 2 - $20 frontier")).toBeInTheDocument();
    expect(screen.getByText("fall26-t1-frontier")).toBeInTheDocument();
    expect(screen.getAllByText("Active")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: /Rotate Key 2/ }));
    expect(api.rotate).not.toHaveBeenCalled();
    expect(screen.getByText(/Key 1 keeps working/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Yes, rotate Key 2/ }));
    await waitFor(() => expect(api.rotate).toHaveBeenCalledWith("t1", "key2"));
    await screen.findByText(/Key 2 rotated/);
    expect(onStatusChange).toHaveBeenCalledWith(
      "t1",
      expect.objectContaining({
        keys: expect.arrayContaining([
          expect.objectContaining({ key_alias: "fall26-t1-frontier", status: "active" }),
        ]),
      }),
    );
  });

  it("reveals Key 2 from the same GET and keeps Key 1 masked until its own Show", async () => {
    const { api } = renderPopover({
      status: { keys: [key1Active, key2Active] },
      api: {
        reveal: jest.fn().mockResolvedValue({
          team_id: "t1",
          keys: [
            { ...key1Active, key: "sk-key1-plain", spend: 0.5 },
            { ...key2Active, key: "sk-key2-plain", spend: 3.75 },
          ],
        }),
      },
    });
    fireEvent.click(screen.getByRole("button", { name: /Reveal Key 2/ }));
    await screen.findByText("sk-key2-plain");
    expect(api.reveal).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/\$3\.75 spent/)).toBeInTheDocument();
    // Key 1 came back in the same response: masked, no second request.
    expect(screen.queryByText("sk-key1-plain")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Reveal key/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Show" }));
    expect(screen.getByText("sk-key1-plain")).toBeInTheDocument();
    expect(api.reveal).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Copy Key 2" }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("sk-key2-plain");
  });

  it("a provision that minted Key 1 but not Key 2 shows a warning, not success, and records both statuses", async () => {
    const { onStatusChange } = renderPopover({
      status: undefined,
      api: {
        provision: jest.fn().mockResolvedValue({
          team_id: "t1",
          keys: [key1Active, { ...key2Active, status: "missing" }],
          partial_failure: { key: "key2", label: "Key 2", error: "LiteLLM down" },
        }),
      },
    });
    fireEvent.click(screen.getByRole("button", { name: /Provision key/ }));
    await screen.findByText(/Key 1 is ready, but Key 2 failed to mint: LiteLLM down/);
    expect(screen.queryByText(/Keys minted/)).not.toBeInTheDocument();
    // The host merges this into its statuses map, so the re-rendered popover
    // offers "Provision Key 2" (covered by the next test).
    expect(onStatusChange).toHaveBeenCalledWith("t1", {
      keys: [key1Active, { ...key2Active, status: "missing" }],
    });
  });

  it("a missing Key 2 offers Provision Key 2 and marks it active on success", async () => {
    const { api, onStatusChange } = renderPopover({
      status: { keys: [key1Active, { ...key2Active, status: "missing" }] },
      api: {
        provision: jest.fn().mockResolvedValue({
          team_id: "t1",
          keys: [key1Active, key2Active],
        }),
      },
    });
    fireEvent.click(screen.getByRole("button", { name: /Provision Key 2/ }));
    await screen.findByText(/Key 2 minted/);
    expect(api.provision).toHaveBeenCalledWith("t1");
    expect(onStatusChange).toHaveBeenCalledWith(
      "t1",
      expect.objectContaining({
        keys: expect.arrayContaining([
          expect.objectContaining({ key_alias: "fall26-t1-frontier", status: "active" }),
        ]),
      }),
    );
  });
});
