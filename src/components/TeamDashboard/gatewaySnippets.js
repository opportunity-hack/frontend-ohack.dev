/**
 * Copy-ready setup blocks for the team's AI gateway key.
 *
 * Pure: the card hands in the key + model and gets back text to copy. Keep
 * these in sync with the public guide at https://ai.ohack.dev/ui/guide/ —
 * OpenAI-compatible clients use `/v1`, Anthropic-compatible clients
 * (Claude Code) use the bare host because the client appends `/v1` itself.
 */

export const GATEWAY_HOST = "https://ai.ohack.dev";
export const GATEWAY_OPENAI_BASE = `${GATEWAY_HOST}/v1`;
export const GUIDE_URL = `${GATEWAY_HOST}/ui/guide/`;
export const DEFAULT_MODEL = "muse-spark";

/** "sk-••••••••" — never shows any part of the secret beyond the prefix. */
export function maskKey(key) {
  const s = String(key || "");
  const prefix = s.startsWith("sk-") ? "sk-" : "";
  return `${prefix}${"•".repeat(8)}`;
}

/**
 * `model` is the model the team picked on the card; every block uses it.
 * `fastModel` is what Claude Code runs its background/small tasks on
 * (ANTHROPIC_SMALL_FAST_MODEL + ANTHROPIC_DEFAULT_HAIKU_MODEL) — the card
 * keeps it on the key's default model so picking a bigger model doesn't
 * also bill every background call at that price. Defaults to `model`.
 *
 * @returns {Array<{id: string, label: string, hint: string, guideAnchor: string, text: string}>}
 */
export function buildSetupSnippets({ key, model = DEFAULT_MODEL, fastModel }) {
  const k = String(key || "");
  const m = model || DEFAULT_MODEL;
  const f = fastModel || m;
  return [
    {
      id: "claude-code",
      label: "Claude Code",
      hint: "Paste into your terminal, then you're in Claude Code on the OHack gateway.",
      guideAnchor: "#claude-code",
      text: [
        `export ANTHROPIC_BASE_URL="${GATEWAY_HOST}"`,
        `export ANTHROPIC_AUTH_TOKEN="${k}"`,
        `export ANTHROPIC_MODEL="${m}"`,
        `export ANTHROPIC_SMALL_FAST_MODEL="${f}"`,
        `export ANTHROPIC_DEFAULT_HAIKU_MODEL="${f}"`,
        "claude",
      ].join("\n"),
    },
    {
      id: "claude-settings",
      label: "settings.json",
      hint: "Make it stick: put this in ~/.claude/settings.json (or .claude/settings.json in your repo — don't commit it).",
      guideAnchor: "#claude-code",
      text: JSON.stringify(
        {
          env: {
            ANTHROPIC_BASE_URL: GATEWAY_HOST,
            ANTHROPIC_AUTH_TOKEN: k,
            ANTHROPIC_MODEL: m,
            ANTHROPIC_SMALL_FAST_MODEL: f,
            ANTHROPIC_DEFAULT_HAIKU_MODEL: f,
          },
        },
        null,
        2,
      ),
    },
    {
      id: "cursor",
      label: "Cursor",
      hint: "Cursor → Settings → Models. Point the OpenAI section at the gateway and add the model by name.",
      guideAnchor: "#cursor",
      text: [
        "Cursor → Settings → Models",
        `  OpenAI API Key:           ${k}`,
        `  Override OpenAI Base URL: ${GATEWAY_OPENAI_BASE}`,
        `  Add model:                ${m}`,
      ].join("\n"),
    },
    {
      id: "python",
      label: "Python",
      hint: "pip install openai — the gateway speaks the OpenAI API.",
      guideAnchor: "#python",
      text: [
        "from openai import OpenAI",
        "",
        `client = OpenAI(base_url="${GATEWAY_OPENAI_BASE}", api_key="${k}")`,
        "r = client.chat.completions.create(",
        `    model="${m}",`,
        '    messages=[{"role": "user", "content": "Hello from OHack!"}],',
        ")",
        "print(r.choices[0].message.content)",
      ].join("\n"),
    },
    {
      id: "node",
      label: "Node.js",
      hint: "npm install openai — same OpenAI-compatible endpoint.",
      guideAnchor: "#node",
      text: [
        'import OpenAI from "openai";',
        "",
        "const client = new OpenAI({",
        `  baseURL: "${GATEWAY_OPENAI_BASE}",`,
        `  apiKey: "${k}",`,
        "});",
        "const r = await client.chat.completions.create({",
        `  model: "${m}",`,
        '  messages: [{ role: "user", content: "Hello from OHack!" }],',
        "});",
        "console.log(r.choices[0].message.content);",
      ].join("\n"),
    },
    {
      id: "curl",
      label: "curl",
      hint: "Quickest way to prove the key works.",
      guideAnchor: "#curl",
      text: [
        `curl -s ${GATEWAY_OPENAI_BASE}/chat/completions \\`,
        `  -H "Authorization: Bearer ${k}" \\`,
        '  -H "Content-Type: application/json" \\',
        `  -d '{"model":"${m}","messages":[{"role":"user","content":"say ok"}]}'`,
      ].join("\n"),
    },
  ];
}

/** The same snippet with the secret masked, for on-screen display. */
export function maskSnippet(text, key) {
  if (!key) return text;
  return text.split(key).join(maskKey(key));
}
