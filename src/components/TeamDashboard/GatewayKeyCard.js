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
  DEFAULT_MODEL,
} from "./gatewaySnippets";

const GATEWAY_ENDPOINT = GATEWAY_OPENAI_BASE;
const FALLBACK_MODELS = [DEFAULT_MODEL, "kimi-k2.7-code", "gpt-oss-120b"];

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
function SetupSnippets({ keyValue, model, revealed, onCopy }) {
  const snippets = buildSetupSnippets({ key: keyValue, model });
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
  const [revealed, setRevealed] = useState(false);

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

  const toggleReveal = () => {
    trackEvent({
      action: "team_gateway_key_reveal",
      params: {
        event_category: EventCategory.ENGAGEMENT,
        event_label: revealed ? "hide" : "reveal",
      },
    });
    setRevealed(!revealed);
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
              ? "Your AI key is being prepared. It appears here once your team is approved."
              : error.message || "Couldn't load your AI key."}
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

          <Box sx={{ mb: 2.5 }}>
            <RowLabel>API key</RowLabel>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}
            >
              <code
                style={{ fontSize: "0.9rem", letterSpacing: "0.02em" }}
                aria-label={revealed ? "API key revealed" : "API key hidden"}
              >
                {revealed ? keyData.key : "•".repeat(28)}
              </code>
              <button
                type="button"
                className="ohx-btn ohx-btn--ghost"
                onClick={toggleReveal}
              >
                {revealed ? "Hide" : "Reveal"}
              </button>
              <button
                type="button"
                className="ohx-btn ohx-btn--ghost"
                onClick={() => copy(keyData.key, "key")}
              >
                Copy
              </button>
            </Box>
          </Box>

          {keyData.spend != null && keyData.max_budget > 0 && (
            <Box sx={{ mb: 2.5 }}>
              <RowLabel>Budget</RowLabel>
              <Box sx={{ fontSize: "0.9rem", mb: 1 }}>
                {formatMoney(keyData.spend)} of {formatMoney(keyData.max_budget)}{" "}
                used
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(
                  100,
                  (Number(keyData.spend) / Number(keyData.max_budget)) * 100,
                )}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          )}

          <Box sx={{ mb: 2.5 }}>
            <RowLabel>Models on this key</RowLabel>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {(keyData.models && keyData.models.length > 0
                ? keyData.models
                : FALLBACK_MODELS
              ).map((m) => (
                <Box
                  key={m}
                  component="span"
                  sx={{
                    fontSize: "0.8rem",
                    fontFamily: "monospace",
                    border: "1px solid var(--border, #e0e0e0)",
                    borderRadius: "999px",
                    px: 1.25,
                    py: 0.25,
                  }}
                >
                  {m}
                </Box>
              ))}
            </Box>
          </Box>

          <SetupSnippets
            keyValue={keyData.key}
            model={
              keyData.models && keyData.models.length > 0
                ? keyData.models[0]
                : DEFAULT_MODEL
            }
            revealed={revealed}
            onCopy={copy}
          />

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

          <Box sx={{ fontSize: "0.85rem", color: "var(--faint)" }}>
            Keys are per-team. Keep them out of git and public demos. Key
            leaked? Tell an organizer.
          </Box>
        </>
      )}
    </DashboardSection>
  );
}
