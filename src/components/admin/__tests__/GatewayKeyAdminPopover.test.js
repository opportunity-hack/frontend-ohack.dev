import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import GatewayKeyAdminPopover, { gatewayStatusFor } from "../GatewayKeyAdminPopover";

const team = { id: "t1", name: "Team Rocket", status: "NONPROFIT_SELECTED" };
const anchor = () => document.body;

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
  it("maps IN_REVIEW to not_approved, otherwise the status map or missing", () => {
    expect(gatewayStatusFor({ id: "x", status: "IN_REVIEW" }, {})).toBe("not_approved");
    expect(gatewayStatusFor({ id: "x" }, {})).toBe("not_approved");
    expect(gatewayStatusFor(team, { t1: { status: "active" } })).toBe("active");
    expect(gatewayStatusFor(team, {})).toBe("missing");
    expect(gatewayStatusFor(null, {})).toBeNull();
  });
});

describe("GatewayKeyAdminPopover", () => {
  beforeEach(() => {
    Object.assign(navigator, { clipboard: { writeText: jest.fn().mockResolvedValue() } });
  });

  it("active key: reveals on demand (never pre-fetched), masks by default, copies the real key", async () => {
    const { api } = renderPopover({
      status: { status: "active", key_alias: "fall26-t1", max_budget: 15 },
      api: { reveal: jest.fn().mockResolvedValue({ key: "sk-live-xyz", spend: 1.25 }) },
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
      status: { status: "active", key_alias: "fall26-t1" },
      api: { rotate: jest.fn().mockResolvedValue({ key_alias: "fall26-t1" }) },
    });
    fireEvent.click(screen.getByRole("button", { name: /Rotate key/ }));
    expect(api.rotate).not.toHaveBeenCalled();
    expect(screen.getByText(/stops working the moment you confirm/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Yes, rotate/ }));
    await waitFor(() => expect(api.rotate).toHaveBeenCalledWith("t1"));
    await screen.findByText(/Rotated\. The old key stopped working/);
    expect(onStatusChange).toHaveBeenCalledWith("t1", expect.objectContaining({ status: "active", rotated_at: expect.any(String) }));
  });

  it("a failed rotate shows the error and downgrades the row to missing (backend dropped the doc)", async () => {
    const { onStatusChange } = renderPopover({
      status: { status: "active", key_alias: "fall26-t1" },
      api: { rotate: jest.fn().mockRejectedValue(new Error("The AI gateway didn't respond. Try again in a moment.")) },
    });
    fireEvent.click(screen.getByRole("button", { name: /Rotate key/ }));
    fireEvent.click(screen.getByRole("button", { name: /Yes, rotate/ }));
    await screen.findByText(/gateway didn't respond/);
    expect(onStatusChange).toHaveBeenCalledWith("t1", { status: "missing" });
  });

  it("missing key: offers Provision and marks the row active on success", async () => {
    const { api, onStatusChange } = renderPopover({
      status: undefined,
      api: { provision: jest.fn().mockResolvedValue({ key_alias: "fall26-t1", max_budget: 15, expires: "2026-11-16T07:00:00Z" }) },
    });
    expect(screen.getByText("No key")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Rotate key/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Provision key/ }));
    await screen.findByText(/Key minted/);
    expect(api.provision).toHaveBeenCalledWith("t1");
    expect(onStatusChange).toHaveBeenCalledWith("t1", expect.objectContaining({ status: "active", key_alias: "fall26-t1" }));
  });

  it("pending key: offers Retry mint", () => {
    renderPopover({ status: { status: "pending", key_alias: "fall26-t1" } });
    expect(screen.getByText("Minting…")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Retry mint/ })).toBeInTheDocument();
  });
});
