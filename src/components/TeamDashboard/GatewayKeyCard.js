import React, { useState } from "react";
import { Box, Skeleton, LinearProgress } from "@mui/material";
import DashboardSection from "./DashboardSection";
import useGatewayKey from "../../hooks/use-gateway-key";
import { isGatewayKeyNotProvisioned } from "../../lib/teamDashboardApi";
import { trackEvent, EventCategory } from "../../lib/ga";

import {
  buildSetupSnippets,
  maskSnippet,
  GATEWAY_OPENAI_BASE,
  GUIDE_URL,
  GUIDE_PROMPTS_ANCHOR,
  KEY1_MODELS,
  KEY2_MODELS,
  modelNote,
  fastModelFor,
  formatKeyExpiry,
  earliestExpiry,
} from "./gatewaySnippets";

const GATEWAY_ENDPOINT = GATEWAY_OPENAI_BASE;
const FALLBACK_MODELS = KEY1_MODELS;
const FRONTIER_MODELS = KEY2_MODELS;

/** "Key 1" -> "key1", "Key 2" -> "key2": the slug used in GA labels and reveal state. */
function keySlug(entry, index) {
  const label = entry?.label || `Key ${index + 1}`;
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/** "Key 1 - $15" / "Key 2 - $20 frontier", from the entry's own budget. */
function keyDisplayLabel(entry, index) {
  const label = entry?.label || `Key ${index + 1}`;
  const budget = Number(entry?.max_budget);
  const budgetPart = Number.isFinite(budget) ? ` - $${budget.toFixed(0)}` : "";
  const frontierPart = index === 1 ? " frontier" : "";
  return `${label}${budgetPart}${frontierPart}`;
}

/**
 * One key's section: masked key with its own Reveal/Hide and Copy, model
 * chips (spend lives in the card-level UsageSummary), and setup snippets
 * built from that key and the model chip the team picked (the key's first
 * model until they pick another). An entry without usable key material
 * (`status: "missing"` when the
 * mint failed, `"error"` when the backend couldn't decrypt it) renders a
 * short "ask an organizer" line instead — minting is admin-only, so a
 * team-side Retry could never fix it (it would only re-run the GET).
 */
function KeySection({
  entry,
  index,
  revealed,
  onToggleReveal,
  onCopy,
  selectedModel,
  onSelectModel,
}) {
  const slug = keySlug(entry, index);
  const heading = keyDisplayLabel(entry, index);
  const label = entry?.label || `Key ${index + 1}`;
  const isUnusable = entry?.status !== "active" || !entry?.key;

  if (isUnusable) {
    return (
      <Box sx={{ mb: 2.5 }}>
        <RowLabel>{heading}</RowLabel>
        <Box sx={{ color: "var(--muted)" }} role="status">
          {entry?.status === "error"
            ? `${label} couldn't be read right now — ask an organizer in Slack and they can re-issue it.`
            : `${label} isn't ready yet — ask an organizer in Slack and they can mint it for your team.`}
        </Box>
      </Box>
    );
  }

  const models = modelsForKey(entry, index);
  const defaultModel = models[0];
  // The picked chip wins; fall back to the key's default if the list changed
  // underneath it (e.g. a refetch after an organizer edited the key).
  const model = models.includes(selectedModel) ? selectedModel : defaultModel;

  return (
    <Box sx={{ mb: 2.5 }}>
      <RowLabel>{heading}</RowLabel>
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 2.5 }}
      >
        <code
          style={{ fontSize: "0.9rem", letterSpacing: "0.02em" }}
          aria-label={
            revealed
              ? `${entry.label || `Key ${index + 1}`} API key revealed`
              : `${entry.label || `Key ${index + 1}`} API key hidden`
          }
        >
          {revealed ? entry.key : "•".repeat(28)}
        </code>
        <button
          type="button"
          className="ohx-btn ohx-btn--ghost"
          onClick={onToggleReveal}
        >
          {revealed ? "Hide" : "Reveal"}
        </button>
        <button
          type="button"
          className="ohx-btn ohx-btn--ghost"
          onClick={() => onCopy(entry.key, slug)}
        >
          Copy
        </button>
      </Box>

      <Box sx={{ mb: 2.5 }}>
        <RowLabel>Models on this key</RowLabel>
        <Box
          role="group"
          aria-label={`Model for ${label} setup`}
          sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}
        >
          {models.map((m) => {
            const selected = m === model;
            return (
              <button
                key={m}
                type="button"
                aria-pressed={selected}
                onClick={() => onSelectModel(m)}
                style={{
                  fontSize: "0.8rem",
                  fontFamily: "monospace",
                  border: `1px solid ${
                    selected ? "var(--brand, #1B3A6B)" : "var(--border, #e0e0e0)"
                  }`,
                  borderRadius: "999px",
                  padding: "2px 10px",
                  background: selected ? "var(--brand, #1B3A6B)" : "transparent",
                  color: selected ? "#fff" : "var(--ink, #16181D)",
                  cursor: "pointer",
                }}
              >
                {m}
              </button>
            );
          })}
        </Box>
        {models.length > 1 && (
          <Box sx={{ fontSize: "0.8rem", color: "var(--muted)", mt: 0.75 }}>
            Pick one — the setup below uses it.
          </Box>
        )}
        {modelNote(model) && (
          <Box
            sx={{ fontSize: "0.85rem", color: "var(--ink, #16181D)", mt: 0.75 }}
            aria-live="polite"
          >
            {modelNote(model)}
          </Box>
        )}
        {model === "muse-spark" && (
          <Box sx={{ fontSize: "0.8rem", color: "var(--muted)", mt: 0.75 }}>
            Writing your own agent on muse-spark? Send max_tokens of 2000 or
            more and use tool_choice &quot;auto&quot; —{" "}
            <a
              href={`${GUIDE_URL}#troubleshooting`}
              target="_blank"
              rel="noopener noreferrer"
              className="ohx-link"
            >
              why ↗
            </a>
          </Box>
        )}
        {index === 0 && models.includes("muse-spark") && (
          <Box sx={{ fontSize: "0.8rem", color: "var(--muted)", mt: 0.75 }}>
            muse-spark uses Meta&apos;s Contributor tier, so your prompts and
            generated code may be used to train Meta&apos;s models. If your team
            would rather not, pick gpt-oss-120b.{" "}
            <a
              href={`${GUIDE_URL}${GUIDE_PROMPTS_ANCHOR}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ohx-link"
            >
              Details ↗
            </a>
          </Box>
        )}
      </Box>

      <SetupSnippets
        keyValue={entry.key}
        model={model}
        fastModel={fastModelFor({ keyIndex: index, models, model })}
        revealed={revealed}
        onCopy={(text, label) => onCopy(text, `${label}_${slug}`)}
      />
    </Box>
  );
}

/** The key's model list, with a per-slot fallback for older payloads. */
function modelsForKey(entry, index) {
  if (entry?.models && entry.models.length > 0) return entry.models;
  return index === 1 ? FRONTIER_MODELS : FALLBACK_MODELS;
}

/**
 * Spend vs budget for one key. `available` is false when the backend
 * couldn't read spend from LiteLLM (`spend: null`) or the key has no budget.
 */
export function keyUsage(entry) {
  const spent = Number(entry?.spend);
  const budget = Number(entry?.max_budget);
  const available =
    entry?.spend != null && Number.isFinite(spent) && Number.isFinite(budget) && budget > 0;
  if (!available) return { available: false, budget: Number.isFinite(budget) ? budget : null };
  const left = Math.max(0, budget - spent);
  const pct = Math.min(100, (spent / budget) * 100);
  return { available: true, spent, budget, left, pct, exhausted: spent >= budget };
}

/**
 * "Usage so far" — one row per usable key, right under the endpoint so a
 * team sees what they've spent without scrolling past Key 1's snippets.
 * Spend is read from LiteLLM when the card loads (it can lag a minute or two
 * behind the latest request).
 */
function UsageSummary({ keys }) {
  const rows = keys
    .map((entry, i) => ({ entry, i }))
    .filter(({ entry }) => entry?.status === "active" && entry?.key);
  if (rows.length === 0) return null;
  return (
    <Box sx={{ mb: 2.5 }} aria-label="AI usage so far">
      <RowLabel>Usage so far</RowLabel>
      {rows.map(({ entry, i }) => {
        const label = entry.label || `Key ${i + 1}`;
        const u = keyUsage(entry);
        return (
          <Box key={entry.key_alias || label} sx={{ mb: 1.25 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 1,
                flexWrap: "wrap",
                fontSize: "0.9rem",
                mb: 0.5,
              }}
            >
              <span>
                <strong>{label}</strong>{" "}
                {u.available
                  ? `${formatMoney(u.spent)} of ${formatMoney(u.budget)} used`
                  : "usage isn't available right now"}
              </span>
              {u.available && (
                <span style={{ color: "var(--muted)" }}>
                  {formatMoney(u.left)} left
                </span>
              )}
            </Box>
            {u.available && (
              <LinearProgress
                variant="determinate"
                value={u.pct}
                aria-label={`${label} budget used`}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "var(--surface-2, #F6F3EC)",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor:
                      u.pct >= 90 ? "var(--accent, #E2552E)" : "var(--brand, #1B3A6B)",
                  },
                }}
              />
            )}
            {u.exhausted && (
              <Box sx={{ fontSize: "0.8rem", color: "var(--muted)", mt: 0.5 }} role="status">
                {label} has used its whole budget, so new requests will be
                turned away. Ask an organizer in Slack if you need more.
              </Box>
            )}
          </Box>
        );
      })}
      <Box sx={{ fontSize: "0.8rem", color: "var(--faint)" }}>
        Totals from when this page loaded — reload the page for the latest numbers.
      </Box>
    </Box>
  );
}

function copyToClipboard(text) {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
}

function formatMoney(n) {
  const v = Number(n);
  return `$${Number.isFinite(v) ? v.toFixed(2) : "0.00"}`;
}

function RowLabel({ children }) {
  return (
    <Box sx={{ fontSize: "0.8rem", color: "var(--muted)", mb: 0.5 }}>
      {children}
    </Box>
  );
}

/**
 * "Copy everything you need" — one block per tool with the team's key already
 * filled in. On screen the key is masked unless the card's Reveal is on; the
 * Copy button always copies the real thing.
 */
function SetupSnippets({ keyValue, model, fastModel, revealed, onCopy }) {
  const snippets = buildSetupSnippets({ key: keyValue, model, fastModel });
  const [activeId, setActiveId] = useState(snippets[0].id);
  const active = snippets.find((sn) => sn.id === activeId) || snippets[0];
  const shown = revealed ? active.text : maskSnippet(active.text, keyValue);
  return (
    <Box sx={{ mb: 2.5 }}>
      <RowLabel>Copy everything you need</RowLabel>
      <Box
        role="tablist"
        aria-label="Setup snippets by tool"
        sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mb: 1 }}
      >
        {snippets.map((sn) => {
          const selected = sn.id === active.id;
          return (
            <button
              key={sn.id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={`ohx-btn ohx-btn--ghost${selected ? " is-active" : ""}`}
              onClick={() => setActiveId(sn.id)}
              style={{
                padding: "4px 10px",
                fontSize: "0.8rem",
                borderColor: selected ? "var(--brand, #1B3A6B)" : undefined,
                color: selected ? "var(--brand, #1B3A6B)" : undefined,
                fontWeight: selected ? 600 : 400,
              }}
            >
              {sn.label}
            </button>
          );
        })}
      </Box>
      <Box sx={{ fontSize: "0.85rem", color: "var(--muted)", mb: 1 }}>
        {active.hint}{" "}
        <a
          href={`${GUIDE_URL}${active.guideAnchor}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ohx-link"
        >
          Guide ↗
        </a>
      </Box>
      <Box
        component="pre"
        role="tabpanel"
        aria-label={`${active.label} setup`}
        sx={{
          m: 0,
          p: 1.5,
          fontSize: "0.8rem",
          lineHeight: 1.5,
          overflowX: "auto",
          borderRadius: "6px",
          border: "1px solid var(--border, #e0e0e0)",
          background: "var(--surface-2, #F6F3EC)",
          whiteSpace: "pre",
        }}
      >
        {shown}
      </Box>
      <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 1, flexWrap: "wrap" }}>
        <button
          type="button"
          className="ohx-btn ohx-btn--primary"
          onClick={() => onCopy(active.text, `snippet_${active.id}`)}
        >
          Copy {active.label} setup (includes key)
        </button>
        <Box sx={{ fontSize: "0.8rem", color: "var(--faint)" }}>
          Paste it straight in. Don&apos;t commit it or screen-share it.
        </Box>
      </Box>
    </Box>
  );
}

export default function GatewayKeyCard({ team, accessToken, onNotify }) {
  const teamId = team?.id;
  const { loading, error, keyData, retry } = useGatewayKey({
    teamId,
    accessToken,
    enabled: !!teamId && !!accessToken,
  });
  const [revealed, setRevealed] = useState({}); // keyed by key slug ("key1", "key2")
  const [selectedModels, setSelectedModels] = useState({}); // keyed by key slug

  const selectModel = (slug, model) => {
    if (selectedModels[slug] === model) return;
    trackEvent({
      action: "team_gateway_model_select",
      params: {
        event_category: EventCategory.ENGAGEMENT,
        event_label: `${slug}_${model}`,
      },
    });
    setSelectedModels((prev) => ({ ...prev, [slug]: model }));
  };

  const copy = (text, label) => {
    copyToClipboard(text);
    trackEvent({
      action: "team_gateway_key_copy",
      params: {
        event_category: EventCategory.ENGAGEMENT,
        event_label: label,
      },
    });
    if (onNotify) {
      onNotify(
        label.startsWith("snippet_")
          ? "Copied — this includes your team's key, keep it private"
          : "Copied to clipboard",
      );
    }
  };

  const toggleReveal = (slug) => {
    const isRevealed = !!revealed[slug];
    trackEvent({
      action: "team_gateway_key_reveal",
      params: {
        event_category: EventCategory.ENGAGEMENT,
        event_label: isRevealed ? `hide_${slug}` : `reveal_${slug}`,
      },
    });
    setRevealed((prev) => ({ ...prev, [slug]: !isRevealed }));
  };

  return (
    <DashboardSection id="ai-gateway" eyebrow="AI gateway" title="AI API Access">
      {loading || (!error && !keyData) ? (
        // Neutral skeleton while the key loads (or before the token/team is
        // known) - never flash a wrong state, never touch keyData when null.
        <Box aria-label="Loading AI API access">
          <Skeleton
            variant="rectangular"
            height={18}
            width="55%"
            animation="wave"
            sx={{ mb: 1.5 }}
          />
          <Skeleton
            variant="rectangular"
            height={40}
            animation="wave"
            sx={{ mb: 1.5 }}
          />
          <Skeleton
            variant="rectangular"
            height={18}
            width="40%"
            animation="wave"
          />
        </Box>
      ) : error ? (
        <Box>
          <Box sx={{ color: "var(--muted)", mb: 2 }}>
            {isGatewayKeyNotProvisioned(error)
              ? "Your AI keys are being prepared. They appear here once your team is approved."
              : error.message || "Couldn't load your AI keys."}
          </Box>
          <button
            type="button"
            className="ohx-btn ohx-btn--ghost"
            onClick={retry}
          >
            Retry
          </button>
        </Box>
      ) : (
        <>
          <Box sx={{ mb: 2.5 }}>
            <RowLabel>Endpoint</RowLabel>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}
            >
              <code style={{ fontSize: "0.9rem" }}>{GATEWAY_ENDPOINT}</code>
              <button
                type="button"
                className="ohx-btn ohx-btn--ghost"
                onClick={() => copy(GATEWAY_ENDPOINT, "endpoint")}
              >
                Copy
              </button>
            </Box>
          </Box>

          <UsageSummary keys={keyData?.keys || []} />

          {(() => {
            const keys = keyData?.keys || [];
            if (!keys.some((entry) => entry?.key)) {
              return (
                <Box>
                  <Box sx={{ color: "var(--muted)", mb: 2 }}>
                    Your AI keys are being prepared. They appear here once
                    your team is approved.
                  </Box>
                  <button
                    type="button"
                    className="ohx-btn ohx-btn--ghost"
                    onClick={retry}
                  >
                    Retry
                  </button>
                </Box>
              );
            }
            const expiryLabel = formatKeyExpiry(earliestExpiry(keys));
            return (
              <>
                {expiryLabel && (
                  <Box sx={{ mb: 2.5 }}>
                    <RowLabel>Keys work until</RowLabel>
                    <Box sx={{ fontSize: "0.9rem" }}>
                      {expiryLabel}. After that, your team&apos;s keys stop working.
                    </Box>
                  </Box>
                )}
                {keys.map((entry, i) => {
              const slug = keySlug(entry, i);
              return (
                <KeySection
                  key={entry.key_alias || slug}
                  entry={entry}
                  index={i}
                  revealed={!!revealed[slug]}
                  onToggleReveal={() => toggleReveal(slug)}
                  onCopy={copy}
                  selectedModel={selectedModels[slug]}
                  onSelectModel={(m) => selectModel(slug, m)}
                />
              );
                })}
              </>
            );
          })()}

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
            <a
              href={GUIDE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ohx-btn ohx-btn--ghost"
              style={{ display: "inline-block", textDecoration: "none" }}
            >
              Full setup guide ↗
            </a>
          </Box>

          <Box sx={{ fontSize: "0.85rem", color: "var(--muted)", mb: 1 }}>
            Using Cline or Continue in VS Code? The{" "}
            <a
              href={`${GUIDE_URL}#cline`}
              target="_blank"
              rel="noopener noreferrer"
              className="ohx-link"
            >
              guide has their setup
            </a>
            .
          </Box>

          <Box sx={{ fontSize: "0.85rem", color: "var(--faint)" }}>
            Keys are per-team. Keep them out of git and public demos. Key
            leaked? Tell an organizer.
          </Box>
        </>
      )}
    </DashboardSection>
  );
}
