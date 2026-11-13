import React, { useState } from "react";
import PropTypes from "prop-types";
import Image from "next/image";
import { Box } from "@mui/material";
import { FONT_DISPLAY } from "../../../styles/fonts";

// Shared by the profile tab (inside RefinedRoot) and the admin "What hackers
// see" preview (outside it), so every color is `var(--x, fallback)`.
const C = {
  ink: "var(--ink, #16181D)",
  muted: "var(--muted, #5B6270)",
  line: "var(--line, #E7E1D4)",
  brand: "var(--brand, #1B3A6B)",
  surface: "var(--surface, #FFFFFF)",
  surface2: "var(--surface-2, #F4F1E9)",
};

const isOwnCdn = (url) => {
  try {
    return new URL(url).hostname === "cdn.ohack.dev";
  } catch {
    return false;
  }
};

/** 1:1 prize image with a reserved box; Fraunces initial when missing/broken. */
export function PrizeImage({ prize, size = 320 }) {
  const [failed, setFailed] = useState(false);
  const url = prize?.image_url;
  const initial = (prize?.name || "?").trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "1 / 1",
        background: C.surface2,
        borderRadius: 8,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {url && !failed ? (
        isOwnCdn(url) ? (
          <Image
            src={url}
            alt=""
            fill
            sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 300px"
            style={{ objectFit: "cover" }}
            onError={() => setFailed(true)}
          />
        ) : (
          <img
            src={url}
            alt=""
            width={size}
            height={size}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )
      ) : (
        <span
          aria-hidden="true"
          style={{ fontFamily: FONT_DISPLAY, fontSize: 56, color: C.brand, opacity: 0.55 }}
        >
          {initial}
        </span>
      )}
    </div>
  );
}

PrizeImage.propTypes = {
  prize: PropTypes.object,
  size: PropTypes.number,
};

/**
 * One prize as a checkbox card. The real <input type="checkbox"> lives inside
 * the <label>; "View product ↗" sits OUTSIDE the label so following the link
 * never toggles the pick.
 */
export default function PrizeOption({ prize, checked, disabled, onChange, name }) {
  const quantity = Number(prize?.quantity) || 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
      <Box
        component="label"
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          padding: "12px",
          borderRadius: "12px",
          background: C.surface,
          border: `${checked ? 2 : 1}px solid ${checked ? C.brand : C.line}`,
          // keep the box size identical when the border thickens
          margin: checked ? 0 : "1px",
          cursor: disabled ? "default" : "pointer",
          opacity: disabled && !checked ? 0.7 : 1,
          "&:focus-within": { outline: `2px solid ${C.brand}`, outlineOffset: "2px" },
        }}
      >
        <input
          type="checkbox"
          name={name}
          checked={Boolean(checked)}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
          style={{ position: "absolute", opacity: 0, width: 1, height: 1, margin: 0 }}
        />
        <PrizeImage prize={prize} />
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            width: 28,
            height: 28,
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: checked ? C.brand : "rgba(255,255,255,0.92)",
            border: `1px solid ${checked ? C.brand : C.line}`,
            color: "#FFFFFF",
            fontSize: 16,
            lineHeight: 1,
          }}
        >
          {checked ? "✓" : ""}
        </span>
        <span style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          <span
            style={{ fontFamily: FONT_DISPLAY, fontSize: 19, lineHeight: 1.25, color: C.ink, fontWeight: 500 }}
          >
            {prize?.name}
          </span>
          {quantity > 1 && (
            <span
              style={{
                fontSize: 13,
                padding: "1px 8px",
                borderRadius: 999,
                border: `1px solid ${C.line}`,
                background: C.surface2,
                color: C.muted,
              }}
            >
              ×{quantity}
            </span>
          )}
        </span>
        {prize?.description ? (
          <span
            style={{
              fontSize: 14.5,
              lineHeight: 1.5,
              color: C.muted,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {prize.description}
          </span>
        ) : null}
      </Box>
      {prize?.product_url ? (
        <a
          href={prize.product_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 14, color: C.brand, paddingLeft: 4, alignSelf: "flex-start" }}
        >
          View product ↗
        </a>
      ) : null}
    </div>
  );
}

PrizeOption.propTypes = {
  prize: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    image_url: PropTypes.string,
    product_url: PropTypes.string,
    quantity: PropTypes.number,
  }).isRequired,
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  name: PropTypes.string,
};

/** Divisor-matched grid: 1-up xs, 2-up sm, 3-up md (never auto-fit). */
export const prizeGridSx = {
  display: "grid",
  gap: "16px",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" },
};
