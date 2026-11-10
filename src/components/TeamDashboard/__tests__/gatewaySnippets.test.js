import {
  buildSetupSnippets,
  maskKey,
  maskSnippet,
  GATEWAY_HOST,
  GATEWAY_OPENAI_BASE,
  KEY1_MODELS,
  KEY2_MODELS,
  MODEL_NOTES,
  modelNote,
  fastModelFor,
  formatKeyExpiry,
  earliestExpiry,
  isBudgetSpent,
} from "../gatewaySnippets";

const KEY = "sk-live-abc123def456";

describe("gatewaySnippets", () => {
  const snippets = buildSetupSnippets({ key: KEY, model: "muse-spark" });
  const byId = Object.fromEntries(snippets.map((s) => [s.id, s]));

  it("builds every tool block with the real key and model filled in", () => {
    expect(snippets.map((s) => s.id)).toEqual([
      "claude-code",
      "claude-settings",
      "cursor",
      "python",
      "node",
      "curl",
    ]);
    for (const s of snippets) {
      expect(s.text).toContain(KEY);
      expect(s.text).toContain("muse-spark");
      expect(s.label).toBeTruthy();
      expect(s.guideAnchor).toMatch(/^#/);
    }
  });

  it("Claude Code uses the bare host, OpenAI clients use /v1 (matches the guide)", () => {
    expect(byId["claude-code"].text).toContain(
      `export ANTHROPIC_BASE_URL="${GATEWAY_HOST}"`,
    );
    expect(byId["claude-code"].text).not.toContain(`${GATEWAY_HOST}/v1"`);
    expect(byId["claude-code"].text.trim().endsWith("\nclaude")).toBe(true);
    expect(byId.python.text).toContain(`base_url="${GATEWAY_OPENAI_BASE}"`);
    expect(byId.node.text).toContain(`baseURL: "${GATEWAY_OPENAI_BASE}"`);
    expect(byId.curl.text).toContain(`${GATEWAY_OPENAI_BASE}/chat/completions`);
    expect(byId.cursor.text).toContain(GATEWAY_OPENAI_BASE);
  });

  it("settings.json is valid JSON with the five ANTHROPIC_* vars", () => {
    const parsed = JSON.parse(byId["claude-settings"].text);
    expect(parsed.env).toEqual({
      ANTHROPIC_BASE_URL: GATEWAY_HOST,
      ANTHROPIC_AUTH_TOKEN: KEY,
      ANTHROPIC_MODEL: "muse-spark",
      ANTHROPIC_SMALL_FAST_MODEL: "muse-spark",
      ANTHROPIC_DEFAULT_HAIKU_MODEL: "muse-spark",
    });
  });

  it("falls back to the default model when none is given", () => {
    const [cc] = buildSetupSnippets({ key: KEY });
    expect(cc.text).toContain('ANTHROPIC_MODEL="muse-spark"');
  });

  it("keeps Claude Code's background models on fastModel when a bigger model is picked", () => {
    const snippets = buildSetupSnippets({
      key: KEY,
      model: "kimi-k2.7-code",
      fastModel: "muse-spark",
    });
    const cc = snippets.find((sn) => sn.id === "claude-code").text;
    expect(cc).toContain('ANTHROPIC_MODEL="kimi-k2.7-code"');
    expect(cc).toContain('ANTHROPIC_SMALL_FAST_MODEL="muse-spark"');
    expect(cc).toContain('ANTHROPIC_DEFAULT_HAIKU_MODEL="muse-spark"');
    const settings = JSON.parse(
      snippets.find((sn) => sn.id === "claude-settings").text,
    );
    expect(settings.env.ANTHROPIC_MODEL).toBe("kimi-k2.7-code");
    expect(settings.env.ANTHROPIC_SMALL_FAST_MODEL).toBe("muse-spark");
    for (const id of ["cursor", "python", "node", "curl"]) {
      expect(snippets.find((sn) => sn.id === id).text).toContain("kimi-k2.7-code");
    }
  });

  it("masks the key for display without leaking any of the secret", () => {
    expect(maskKey(KEY)).toBe("sk-••••••••");
    expect(maskKey("abc")).toBe("••••••••");
    const masked = maskSnippet(byId["claude-code"].text, KEY);
    expect(masked).not.toContain(KEY);
    expect(masked).not.toContain("abc123");
    expect(masked).toContain('ANTHROPIC_AUTH_TOKEN="sk-••••••••"');
    expect(maskSnippet("no key here", "")).toBe("no key here");
  });

  it("curl is ONE line, like the guide (multi-line breaks in PowerShell)", () => {
    expect(byId.curl.text).not.toContain("\n");
    expect(byId.curl.text).not.toContain("\\");
    expect(byId.curl.text.startsWith("curl -s ")).toBe(true);
    expect(byId.curl.hint).toMatch(/curl\.exe/);
  });

  it("Node hint explains the ES-module requirement", () => {
    expect(byId.node.hint).toMatch(/\.mjs/);
    expect(byId.node.hint).toMatch(/"type": "module"/);
  });
});

// Pinned against backend-ohack.dev/api/teams/gateway_keys.py
// GATEWAY_MODELS / KEY2_MODELS. If the backend lists change, change these
// AND the notes (prices come from hack-llm/web/guide/index.html).
describe("model catalog matches the backend and the guide", () => {
  it("key model lists equal the backend's", () => {
    expect(KEY1_MODELS).toEqual(["muse-spark", "kimi-k2.7-code", "gpt-oss-120b"]);
    expect(KEY2_MODELS).toEqual(["muse-wonder", "kimi-k3"]);
  });

  it("every model has exactly one note, with the guide's prices", () => {
    expect(Object.keys(MODEL_NOTES).sort()).toEqual(
      [...KEY1_MODELS, ...KEY2_MODELS].sort(),
    );
    expect(modelNote("gpt-oss-120b")).toMatch(/free/);
    expect(modelNote("kimi-k3")).toMatch(/Kimi K3\.1 Pro/);
    expect(modelNote("kimi-k3")).toMatch(/\$2\.00 in \/ \$10\.00 out per 1M tokens/);
    expect(modelNote("kimi-k3")).toMatch(/reasoning_effort/);
    expect(modelNote("muse-wonder")).toMatch(/\$4\.00 in \/ \$20\.00 out/);
    expect(modelNote("muse-spark")).toMatch(/\$0\.10 in \/ \$0\.20 out/);
    expect(modelNote("nope")).toBeNull();
  });
});

describe("fastModelFor (Claude Code background model)", () => {
  it("Key 1 keeps background calls on its cheap first model", () => {
    expect(fastModelFor({ keyIndex: 0, models: KEY1_MODELS, model: "kimi-k2.7-code" })).toBe(
      "muse-spark",
    );
  });

  it("Key 2 uses the PICKED model — its first model is the pricier one", () => {
    expect(fastModelFor({ keyIndex: 1, models: KEY2_MODELS, model: "kimi-k3" })).toBe("kimi-k3");
    expect(fastModelFor({ keyIndex: 1, models: KEY2_MODELS, model: "muse-wonder" })).toBe(
      "muse-wonder",
    );
  });
});

describe("key expiry + budget helpers", () => {
  it("formats the expiry in Arizona time whatever the host timezone", () => {
    expect(formatKeyExpiry("2026-11-16T01:00:00Z")).toBe(
      "Sun Nov 15, 6:00 PM Arizona time",
    );
    expect(formatKeyExpiry(null)).toBeNull();
    expect(formatKeyExpiry("garbage")).toBeNull();
  });

  it("earliestExpiry picks the soonest valid instant", () => {
    expect(
      earliestExpiry([
        { expires: "2026-11-16T07:00:00Z" },
        { expires: "2026-11-16T01:00:00Z" },
        { expires: null },
        {},
      ]),
    ).toBe("2026-11-16T01:00:00Z");
    expect(earliestExpiry([])).toBeNull();
    expect(earliestExpiry(undefined)).toBeNull();
  });

  it("isBudgetSpent only when spend reaches a known budget", () => {
    expect(isBudgetSpent({ spend: 15, max_budget: 15 })).toBe(true);
    expect(isBudgetSpent({ spend: 15.2, max_budget: 15 })).toBe(true);
    expect(isBudgetSpent({ spend: 14.99, max_budget: 15 })).toBe(false);
    expect(isBudgetSpent({ spend: null, max_budget: 15 })).toBe(false);
    expect(isBudgetSpent({ spend: 3, max_budget: 0 })).toBe(false);
    expect(isBudgetSpent(null)).toBe(false);
  });
});
