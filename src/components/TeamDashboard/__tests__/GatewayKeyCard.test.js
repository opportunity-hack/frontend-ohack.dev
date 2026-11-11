import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import GatewayKeyCard from "../GatewayKeyCard";
import { fetchGatewayKey, ApiError } from "../../../lib/teamDashboardApi";

jest.mock("../../../lib/teamDashboardApi", () => {
  const actual = jest.requireActual("../../../lib/teamDashboardApi");
  return { ...actual, fetchGatewayKey: jest.fn() };
});
jest.mock("../../../lib/ga", () => ({
  trackEvent: jest.fn(),
  EventCategory: { ENGAGEMENT: "engagement" },
}));

const team = { id: "team-1" };

describe("GatewayKeyCard", () => {
  beforeEach(() => fetchGatewayKey.mockReset());

  // Regression: Oct 2026 staging crash "Cannot read properties of null
  // (reading 'spend')". The hook used to start with loading=false, and the
  // card's data branch ran on the first paint with keyData === null.
  it("renders the loading skeleton on first paint instead of dereferencing a null key", () => {
    fetchGatewayKey.mockReturnValue(new Promise(() => {})); // never resolves
    render(<GatewayKeyCard team={team} accessToken="tok" />);
    expect(screen.getByLabelText("Loading AI API access")).toBeInTheDocument();
    expect(screen.queryByText(/Reveal/)).not.toBeInTheDocument();
  });

  it("stays on the skeleton (not the data branch) while the token is not known yet", () => {
    render(<GatewayKeyCard team={team} accessToken={null} />);
    expect(screen.getByLabelText("Loading AI API access")).toBeInTheDocument();
    expect(fetchGatewayKey).not.toHaveBeenCalled();
  });

  it("shows the 'being prepared' copy when the keys are not provisioned yet", async () => {
    fetchGatewayKey.mockRejectedValue(
      new ApiError(404, { error: "key_not_provisioned", retryable: true }),
    );
    render(<GatewayKeyCard team={team} accessToken="tok" />);
    expect(
      await screen.findByText(/Your AI keys are being prepared/),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("renders the masked key and budget meter once the keys load", async () => {
    fetchGatewayKey.mockResolvedValue({
      team_id: "team-1",
      keys: [
        {
          label: "Key 1",
          key: "sk-live-abc",
          key_alias: "fall26-team-1",
          models: ["muse-spark"],
          max_budget: 15,
          expires: "2026-11-16T01:00:00Z",
          spend: 3.5,
          status: "active",
        },
      ],
    });
    render(<GatewayKeyCard team={team} accessToken="tok" />);
    expect(await screen.findByLabelText("Key 1 API key hidden")).toBeInTheDocument();
    expect(screen.getByText(/\$3\.50 of \$15\.00/)).toBeInTheDocument();
    expect(screen.queryByText("sk-live-abc")).not.toBeInTheDocument();
  });

  it("omits the budget meter when spend is unavailable, without crashing", async () => {
    fetchGatewayKey.mockResolvedValue({
      team_id: "team-1",
      keys: [
        {
          label: "Key 1",
          key: "sk-live-abc",
          key_alias: "fall26-team-1",
          models: [],
          max_budget: 15,
          spend: null,
          status: "active",
        },
      ],
    });
    render(<GatewayKeyCard team={team} accessToken="tok" />);
    expect(await screen.findByLabelText("Key 1 API key hidden")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByText(/of \$15\.00/)).not.toBeInTheDocument(),
    );
  });

  it("shows the 'being prepared' copy with Retry when the keys list is empty", async () => {
    fetchGatewayKey.mockResolvedValue({ team_id: "team-1", keys: [] });
    render(<GatewayKeyCard team={team} accessToken="tok" />);
    expect(
      await screen.findByText(/Your AI keys are being prepared/),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });
});

describe("GatewayKeyCard setup snippets", () => {
  const loaded = {
    team_id: "team-1",
    keys: [
      {
        label: "Key 1",
        key: "sk-live-abc123def456",
        key_alias: "fall26-team-1",
        models: ["muse-spark", "gpt-oss-120b"],
        max_budget: 15,
        spend: 0,
        status: "active",
      },
    ],
  };

  beforeEach(() => {
    fetchGatewayKey.mockReset();
    fetchGatewayKey.mockResolvedValue(loaded);
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
    });
  });

  it("shows the Claude Code block by default with the key masked, and copies it WITH the key", async () => {
    const { fireEvent } = require("@testing-library/react");
    const onNotify = jest.fn();
    render(<GatewayKeyCard team={team} accessToken="tok" onNotify={onNotify} />);
    const panel = await screen.findByRole("tabpanel", { name: "Claude Code setup" });
    expect(panel.textContent).toContain('ANTHROPIC_AUTH_TOKEN="sk-••••••••"');
    expect(panel.textContent).not.toContain("abc123");
    expect(panel.textContent.trim().endsWith("claude")).toBe(true);

    fireEvent.click(
      screen.getByRole("button", { name: /Copy Claude Code setup/ }),
    );
    const copied = navigator.clipboard.writeText.mock.calls[0][0];
    expect(copied).toContain('ANTHROPIC_AUTH_TOKEN="sk-live-abc123def456"');
    expect(copied).toContain('ANTHROPIC_MODEL="muse-spark"');
    expect(onNotify).toHaveBeenCalledWith(expect.stringMatching(/includes your team/));
  });

  it("switches tools and unmasks the snippet when the key is revealed", async () => {
    const { fireEvent } = require("@testing-library/react");
    render(<GatewayKeyCard team={team} accessToken="tok" />);
    await screen.findByRole("tabpanel", { name: "Claude Code setup" });

    fireEvent.click(screen.getByRole("tab", { name: "Python" }));
    const py = screen.getByRole("tabpanel", { name: "Python setup" });
    expect(py.textContent).toContain('base_url="https://ai.ohack.dev/v1"');
    expect(py.textContent).toContain('api_key="sk-••••••••"');

    fireEvent.click(screen.getByRole("button", { name: "Reveal" }));
    expect(
      screen.getByRole("tabpanel", { name: "Python setup" }).textContent,
    ).toContain('api_key="sk-live-abc123def456"');
  });
});

describe("GatewayKeyCard two keys", () => {
  const twoKeys = {
    team_id: "team-1",
    keys: [
      {
        label: "Key 1",
        key: "sk-live-key1",
        key_alias: "fall26-team-1",
        models: ["muse-spark", "kimi-k2.7-code", "gpt-oss-120b"],
        max_budget: 15,
        expires: "2026-11-16T01:00:00Z",
        spend: 3.5,
        status: "active",
      },
      {
        label: "Key 2",
        key: "sk-live-key2",
        key_alias: "fall26-team-1-frontier",
        models: ["muse-wonder", "kimi-k3"],
        max_budget: 20,
        expires: "2026-11-16T01:00:00Z",
        spend: 1,
        status: "active",
      },
    ],
  };

  beforeEach(() => {
    fetchGatewayKey.mockReset();
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
    });
  });

  it("renders both keys with the right models and budgets", async () => {
    fetchGatewayKey.mockResolvedValue(twoKeys);
    render(<GatewayKeyCard team={team} accessToken="tok" />);
    expect(await screen.findByText("Key 1 - $15")).toBeInTheDocument();
    expect(screen.getByText("Key 2 - $20 frontier")).toBeInTheDocument();
    expect(screen.getByText(/\$3\.50 of \$15\.00/)).toBeInTheDocument();
    expect(screen.getByText(/\$1\.00 of \$20\.00/)).toBeInTheDocument();
    expect(screen.getByText("muse-wonder")).toBeInTheDocument();
    expect(screen.getByText("kimi-k3")).toBeInTheDocument();
    expect(screen.queryByText("sk-live-key1")).not.toBeInTheDocument();
    expect(screen.queryByText("sk-live-key2")).not.toBeInTheDocument();
  });

  it("revealing Key 1 does not reveal Key 2", async () => {
    const { fireEvent } = require("@testing-library/react");
    fetchGatewayKey.mockResolvedValue(twoKeys);
    render(<GatewayKeyCard team={team} accessToken="tok" />);
    await screen.findByLabelText("Key 1 API key hidden");
    fireEvent.click(screen.getAllByRole("button", { name: "Reveal" })[0]);
    expect(screen.getByLabelText("Key 1 API key revealed")).toBeInTheDocument();
    expect(screen.getByLabelText("Key 2 API key hidden")).toBeInTheDocument();
    expect(screen.queryByText("sk-live-key2")).not.toBeInTheDocument();
    expect(screen.getByText("sk-live-key1")).toBeInTheDocument();
  });

  it("Key 2 snippets use muse-wonder and copy the Key 2 key", async () => {
    const { fireEvent } = require("@testing-library/react");
    fetchGatewayKey.mockResolvedValue(twoKeys);
    render(<GatewayKeyCard team={team} accessToken="tok" />);
    const panels = await screen.findAllByRole("tabpanel", { name: "Claude Code setup" });
    expect(panels).toHaveLength(2);
    expect(panels[1].textContent).toContain('ANTHROPIC_MODEL="muse-wonder"');
    expect(panels[0].textContent).toContain('ANTHROPIC_MODEL="muse-spark"');

    fireEvent.click(
      screen.getAllByRole("button", { name: /Copy Claude Code setup/ })[1],
    );
    const copied = navigator.clipboard.writeText.mock.calls[0][0];
    expect(copied).toContain('ANTHROPIC_AUTH_TOKEN="sk-live-key2"');
    expect(copied).toContain('ANTHROPIC_MODEL="muse-wonder"');
  });

  it("picking a model chip rewrites that key's snippets (and only that key's)", async () => {
    const { fireEvent } = require("@testing-library/react");
    const { trackEvent } = require("../../../lib/ga");
    fetchGatewayKey.mockResolvedValue(twoKeys);
    render(<GatewayKeyCard team={team} accessToken="tok" />);
    await screen.findAllByRole("tabpanel", { name: "Claude Code setup" });

    const chip = screen.getByRole("button", { name: "kimi-k2.7-code" });
    expect(chip).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "muse-spark" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    fireEvent.click(chip);
    expect(chip).toHaveAttribute("aria-pressed", "true");

    const panels = screen.getAllByRole("tabpanel", { name: "Claude Code setup" });
    expect(panels[0].textContent).toContain('ANTHROPIC_MODEL="kimi-k2.7-code"');
    // Background tasks stay on the key's default (cheapest) model.
    expect(panels[0].textContent).toContain('ANTHROPIC_SMALL_FAST_MODEL="muse-spark"');
    expect(panels[1].textContent).toContain('ANTHROPIC_MODEL="muse-wonder"');
    expect(trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "team_gateway_model_select",
        params: expect.objectContaining({ event_label: "key1_kimi-k2.7-code" }),
      }),
    );

    // The pick survives switching tools, and the copy carries it.
    fireEvent.click(screen.getAllByRole("tab", { name: "Python" })[0]);
    expect(
      screen.getByRole("tabpanel", { name: "Python setup" }).textContent,
    ).toContain('model="kimi-k2.7-code"');
    fireEvent.click(
      screen.getAllByRole("button", { name: /Copy Python setup/ })[0],
    );
    expect(navigator.clipboard.writeText.mock.calls[0][0]).toContain(
      'model="kimi-k2.7-code"',
    );
  });

  it("copies are tagged key1/key2 in the GA event label", async () => {
    const { fireEvent } = require("@testing-library/react");
    const { trackEvent } = require("../../../lib/ga");
    fetchGatewayKey.mockResolvedValue(twoKeys);
    render(<GatewayKeyCard team={team} accessToken="tok" />);
    await screen.findByLabelText("Key 1 API key hidden");
    // Buttons named "Copy": endpoint, Key 1, Key 2, in that order.
    const copies = screen.getAllByRole("button", { name: "Copy" });
    fireEvent.click(copies[2]);
    expect(trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "team_gateway_key_copy",
        params: expect.objectContaining({ event_label: "key2" }),
      }),
    );
    fireEvent.click(copies[1]);
    expect(trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "team_gateway_key_copy",
        params: expect.objectContaining({ event_label: "key1" }),
      }),
    );
  });

  // Minting is admin-only (volunteer.admin on /gateway-key/retry), so a
  // team-side Retry could only re-run the GET and never fix a missing key.
  it("Key 2 missing tells the team to ask an organizer and offers no Retry", async () => {
    const missingKey2 = {
      team_id: "team-1",
      keys: [
        twoKeys.keys[0],
        {
          label: "Key 2",
          key: null,
          key_alias: "fall26-team-1-frontier",
          models: ["muse-wonder", "kimi-k3"],
          max_budget: 20,
          expires: "2026-11-16T01:00:00Z",
          spend: null,
          status: "missing",
        },
      ],
    };
    fetchGatewayKey.mockResolvedValue(missingKey2);
    render(<GatewayKeyCard team={team} accessToken="tok" />);
    expect(
      await screen.findByText(/Key 2 isn't ready yet — ask an organizer/),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Key 2 API key hidden")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
    // Key 1 is still fully usable.
    expect(screen.getByLabelText("Key 1 API key hidden")).toBeInTheDocument();
  });

  it("Key 2 with status 'error' (backend decrypt failure) gets its own ask-an-organizer line", async () => {
    fetchGatewayKey.mockResolvedValue({
      team_id: "team-1",
      keys: [
        twoKeys.keys[0],
        { ...twoKeys.keys[1], key: null, spend: null, status: "error" },
      ],
    });
    render(<GatewayKeyCard team={team} accessToken="tok" />);
    expect(
      await screen.findByText(/Key 2 couldn't be read right now — ask an organizer/),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Key 2 API key hidden")).not.toBeInTheDocument();
  });

  it("Key 2 runs Claude Code's background calls on the picked model (no pricier default)", async () => {
    const { fireEvent } = require("@testing-library/react");
    fetchGatewayKey.mockResolvedValue(twoKeys);
    render(<GatewayKeyCard team={team} accessToken="tok" />);
    await screen.findAllByRole("tabpanel", { name: "Claude Code setup" });
    fireEvent.click(screen.getByRole("button", { name: "kimi-k3" }));
    const panels = screen.getAllByRole("tabpanel", { name: "Claude Code setup" });
    expect(panels[1].textContent).toContain('ANTHROPIC_MODEL="kimi-k3"');
    expect(panels[1].textContent).toContain('ANTHROPIC_SMALL_FAST_MODEL="kimi-k3"');
    expect(panels[1].textContent).toContain('ANTHROPIC_DEFAULT_HAIKU_MODEL="kimi-k3"');
    expect(panels[1].textContent).not.toContain("muse-wonder");
  });

  it("shows when the keys stop working, in Arizona time", async () => {
    fetchGatewayKey.mockResolvedValue(twoKeys);
    render(<GatewayKeyCard team={team} accessToken="tok" />);
    expect(
      await screen.findByText(/Sun Nov 15, 6:00 PM Arizona time/),
    ).toBeInTheDocument();
  });

  it("hides the expiry line when the payload has no expires", async () => {
    fetchGatewayKey.mockResolvedValue({
      team_id: "team-1",
      keys: twoKeys.keys.map((k) => ({ ...k, expires: null })),
    });
    render(<GatewayKeyCard team={team} accessToken="tok" />);
    await screen.findByLabelText("Key 1 API key hidden");
    expect(screen.queryByText("Keys work until")).not.toBeInTheDocument();
  });

  it("shows a note for the picked model and the muse-spark training disclosure on Key 1", async () => {
    const { fireEvent } = require("@testing-library/react");
    fetchGatewayKey.mockResolvedValue(twoKeys);
    render(<GatewayKeyCard team={team} accessToken="tok" />);
    expect(await screen.findByText(/Muse Spark 1\.3 \(Meta\)/)).toBeInTheDocument();
    expect(screen.getByText(/Contributor tier/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Details/ })).toHaveAttribute(
      "href",
      "https://ai.ohack.dev/ui/guide/#where-prompts-go",
    );
    expect(screen.getByText(/Muse Wonder \(Meta\)/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "gpt-oss-120b" }));
    expect(screen.getByText(/GPT-OSS 120B · free/)).toBeInTheDocument();
  });

  it("says the budget is used up when spend reaches the cap", async () => {
    fetchGatewayKey.mockResolvedValue({
      team_id: "team-1",
      keys: [{ ...twoKeys.keys[0], spend: 15 }, twoKeys.keys[1]],
    });
    render(<GatewayKeyCard team={team} accessToken="tok" />);
    expect(
      await screen.findByText(/This key's budget is used up — find an organizer/),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/budget is used up/)).toHaveLength(1);
  });
});
