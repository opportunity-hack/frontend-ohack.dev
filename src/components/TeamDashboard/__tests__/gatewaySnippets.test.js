import {
  buildSetupSnippets,
  maskKey,
  maskSnippet,
  GATEWAY_HOST,
  GATEWAY_OPENAI_BASE,
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

  it("masks the key for display without leaking any of the secret", () => {
    expect(maskKey(KEY)).toBe("sk-••••••••");
    expect(maskKey("abc")).toBe("••••••••");
    const masked = maskSnippet(byId["claude-code"].text, KEY);
    expect(masked).not.toContain(KEY);
    expect(masked).not.toContain("abc123");
    expect(masked).toContain('ANTHROPIC_AUTH_TOKEN="sk-••••••••"');
    expect(maskSnippet("no key here", "")).toBe("no key here");
  });
});
