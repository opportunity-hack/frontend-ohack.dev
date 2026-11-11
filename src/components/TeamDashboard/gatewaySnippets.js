/**
 * Copy-ready setup blocks for the team's AI gateway key.
 *
 * Pure: the card hands in the key + model and gets back text to copy.
 *
 * SOURCE OF TRUTH: the public guide, `hack-llm/web/guide/index.html`
 * (served at https://ai.ohack.dev/ui/guide/). Model names, prices, notes
 * and the expiry copy here must match it; the per-key model lists must
 * match the backend's `GATEWAY_MODELS` / `KEY2_MODELS` in
 * `backend-ohack.dev/api/teams/gateway_keys.py` (pinned by
 * __tests__/gatewaySnippets.test.js). Prices also live in hack-llm's
 * `config/litellm-config.yaml` — change all three together.
 *
 * OpenAI-compatible clients use `/v1`, Anthropic-compatible clients
 * (Claude Code) use the bare host because the client appends `/v1` itself.
 */

export const GATEWAY_HOST = "https://ai.ohack.dev";
export const GATEWAY_OPENAI_BASE = `${GATEWAY_HOST}/v1`;
export const GUIDE_URL = `${GATEWAY_HOST}/ui/guide/`;
export const DEFAULT_MODEL = "muse-spark";
/** Mirrors backend GATEWAY_MODELS (Key 1, $15) and KEY2_MODELS (Key 2, $20). */
export const KEY1_MODELS = ["muse-spark", "kimi-k2.7-code", "gpt-oss-120b"];
export const KEY2_MODELS = ["muse-wonder", "kimi-k3"];
/** The guide's "Where your prompts go" notice (muse-spark Contributor tier). */
export const GUIDE_PROMPTS_ANCHOR = "#where-prompts-go";

/**
 * One-line guidance per model, copied from the guide's Models table.
 * `name` is what it is, `price` is per 1M tokens, `bestFor` is plain advice.
 */
export const MODEL_NOTES = {
  "muse-spark": {
    name: "Muse Spark 1.3 (Meta)",
    price: "$0.10 in / $0.20 out",
    bestFor: "fast, cheap default for everyday coding help",
  },
  "kimi-k2.7-code": {
    name: "Kimi K2.7 Code (Moonshot)",
    price: "$0.95 in / $4.00 out",
    bestFor: "stronger coding help when muse-spark isn't enough",
  },
  "gpt-oss-120b": {
    name: "GPT-OSS 120B",
    price: "free",
    bestFor: "costs nothing (free-tier rate limits apply)",
  },
  "muse-wonder": {
    name: "Muse Wonder (Meta)",
    price: "$4.00 in / $20.00 out",
    bestFor:
      "long, hard agentic jobs — frontier prices use up the $20 fast, so save it for the hard stuff",
  },
  "kimi-k3": {
    name: "Kimi K3.1 Pro (Moonshot)",
    price: "$2.00 in / $10.00 out",
    bestFor:
      "a cheaper frontier option; accepts reasoning_effort low / high / max (default max, low is cheapest)",
  },
};

/** "Muse Spark 1.3 (Meta) · $0.10 in / $0.20 out per 1M tokens — fast, …" or null. */
export function modelNote(model) {
  const n = MODEL_NOTES[model];
  if (!n) return null;
  const price = n.price === "free" ? "free" : `${n.price} per 1M tokens`;
  return `${n.name} · ${price} — ${n.bestFor}`;
}

/**
 * Which model Claude Code runs its background calls on
 * (ANTHROPIC_SMALL_FAST_MODEL / ANTHROPIC_DEFAULT_HAIKU_MODEL).
 * Key 1 keeps them on its cheap default (muse-spark) whatever the team
 * picks. Key 2 has no cheap model — its first model, muse-wonder, is the
 * PRICIER one — so all three vars use the picked model, as the guide says.
 */
export function fastModelFor({ keyIndex, models, model }) {
  if (keyIndex === 0 && models && models.length > 0) return models[0];
  return model;
}

const ARIZONA_TZ = "America/Phoenix";

/**
 * "Sun Nov 15, 6:00 PM Arizona time" from an ISO instant, or null when the
 * value is missing/unparseable. Always rendered in Arizona time (the event's
 * timezone, no DST) so every team sees the same wall-clock moment.
 */
export function formatKeyExpiry(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: ARIZONA_TZ,
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
      .formatToParts(d)
      .map((p) => [p.type, p.value]),
  );
  return `${parts.weekday} ${parts.month} ${parts.day}, ${parts.hour}:${parts.minute} ${parts.dayPeriod} Arizona time`;
}

/** The earliest valid `expires` across the team's keys (ISO string) or null. */
export function earliestExpiry(keys) {
  let best = null;
  for (const k of keys || []) {
    const t = k?.expires ? new Date(k.expires).getTime() : NaN;
    if (!Number.isNaN(t) && (best === null || t < best.t)) best = { t, iso: k.expires };
  }
  return best ? best.iso : null;
}

/** True when a key's recorded spend has reached its budget. */
export function isBudgetSpent(entry) {
  const spend = Number(entry?.spend);
  const budget = Number(entry?.max_budget);
  return (
    entry?.spend != null &&
    Number.isFinite(spend) &&
    Number.isFinite(budget) &&
    budget > 0 &&
    spend >= budget
  );
}

/** "sk-••••••••" — never shows any part of the secret beyond the prefix. */
export function maskKey(key) {
  const s = String(key || "");
  const prefix = s.startsWith("sk-") ? "sk-" : "";
  return `${prefix}${"•".repeat(8)}`;
}

/**
 * `model` is the model the team picked on the card; every block uses it.
 * `fastModel` is what Claude Code runs its background/small tasks on
 * (ANTHROPIC_SMALL_FAST_MODEL + ANTHROPIC_DEFAULT_HAIKU_MODEL) — see
 * `fastModelFor()` for how the card picks it. Defaults to `model`.
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
      hint: 'npm install openai, then save as .mjs or set "type": "module" in package.json (the snippet uses import).',
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
      hint: "Quickest way to prove the key works. On Windows, type curl.exe instead of curl.",
      guideAnchor: "#curl",
      // ONE line, like the guide: `\` continuations break in PowerShell
      // and some terminals.
      text: `curl -s ${GATEWAY_OPENAI_BASE}/chat/completions -H "Authorization: Bearer ${k}" -H "Content-Type: application/json" -d '{"model":"${m}","messages":[{"role":"user","content":"say ok"}]}'`,
    },
  ];
}

/** The same snippet with the secret masked, for on-screen display. */
export function maskSnippet(text, key) {
  if (!key) return text;
  return text.split(key).join(maskKey(key));
}
