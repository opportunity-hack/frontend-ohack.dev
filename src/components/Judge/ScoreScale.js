import React, { useRef } from "react";
import { SCORE_DESCRIPTIONS, SCORE_MIN, SCORE_MAX } from "./judgingCriteria";

const VALUES = Array.from(
  { length: SCORE_MAX - SCORE_MIN + 1 },
  (_, i) => SCORE_MIN + i,
);

/**
 * Segmented 1–5 control used everywhere a judge sets a score.
 *
 * Why not a slider: on a laptop trackpad or a phone, a slider changes value
 * on an accidental drag/scroll and gives no confirmation. Five explicit
 * buttons require a deliberate click, show the chosen value plainly, and work
 * with a keyboard (roving tabindex radiogroup: arrows move, Home/End jump).
 * Inline styles with var() fallbacks so it renders the same inside a Portal.
 */
const ScoreScale = ({
  value,
  onChange,
  label,
  disabled = false,
  compact = false,
  id,
}) => {
  const groupRef = useRef(null);
  const size = compact ? 34 : 42;
  const current = Number.isInteger(value) ? value : null;

  const focusValue = (v) => {
    const el = groupRef.current?.querySelector(`[data-value="${v}"]`);
    el?.focus();
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    let next = null;
    // ARIA radio-group pattern: Right/Down = next, Left/Up = previous.
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      next = Math.min(SCORE_MAX, (current ?? SCORE_MIN - 1) + 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      next = Math.max(SCORE_MIN, (current ?? SCORE_MAX + 1) - 1);
    } else if (e.key === "Home") {
      next = SCORE_MIN;
    } else if (e.key === "End") {
      next = SCORE_MAX;
    }
    if (next !== null) {
      e.preventDefault();
      if (next !== current) onChange(next);
      focusValue(next);
    }
  };

  return (
    <div
      ref={groupRef}
      id={id}
      role="radiogroup"
      aria-label={label}
      aria-disabled={disabled || undefined}
      onKeyDown={handleKeyDown}
      style={{
        display: "inline-flex",
        border: "1px solid var(--line, #E7E1D4)",
        borderRadius: 6,
        overflow: "hidden",
        background: "var(--surface, #fff)",
        opacity: disabled ? 0.55 : 1,
      }}
    >
      {VALUES.map((v, i) => {
        const selected = current === v;
        // Roving tabindex: only one stop in the tab order per group.
        const tabIndex =
          current === null ? (i === 0 ? 0 : -1) : selected ? 0 : -1;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`${v} — ${SCORE_DESCRIPTIONS[v]}`}
            title={SCORE_DESCRIPTIONS[v]}
            data-value={v}
            tabIndex={tabIndex}
            disabled={disabled}
            onClick={() => {
              if (!disabled && v !== current) onChange(v);
            }}
            style={{
              width: size,
              height: compact ? 32 : 40,
              border: 0,
              borderLeft: i === 0 ? 0 : "1px solid var(--line, #E7E1D4)",
              background: selected ? "var(--brand, #1B3A6B)" : "transparent",
              color: selected ? "#fff" : "var(--ink, #16181D)",
              fontFamily: "inherit",
              fontSize: compact ? 13 : 15,
              fontWeight: selected ? 700 : 500,
              cursor: disabled ? "not-allowed" : "pointer",
              padding: 0,
              lineHeight: 1,
              transition: "background-color .15s ease, color .15s ease",
            }}
          >
            {v}
          </button>
        );
      })}
    </div>
  );
};

export default ScoreScale;
