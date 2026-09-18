import React from "react";
import * as ga from "../../lib/ga";
import { Eyebrow, Arrow } from "./refined";

// The single Opportunity Hack general fund on Givebutter. Every donation
// touchpoint on the site should link here (the sponsor page already does).
// We deliberately link out instead of loading Givebutter's widget script:
// zero third-party JS on the landing/onboarding pages (CWV) and the look
// stays on-brand. Live goal/raised numbers are a phase-2 item (Givebutter API).
export const DONATE_URL = "https://givebutter.com/a5MSes";

// `placement` is a short slug identifying where on the site the click came
// from (e.g. "home_sponsors", "onboarding_mission"). It lands in Givebutter's
// UTM reporting AND in our GA event, so both sides can attribute the gift.
export function donateHref(placement) {
  const params = new URLSearchParams({
    utm_source: "ohack.dev",
    utm_medium: "web",
    utm_campaign: "general_fund",
    utm_content: placement,
  });
  return `${DONATE_URL}?${params.toString()}`;
}

export function trackDonateClick(placement) {
  ga.trackStructuredEvent(
    ga.EventCategory.DONATION,
    ga.EventAction.CLICK,
    "donate_click",
    null,
    { placement, destination: "givebutter" }
  );
}

// Inline styles that approximate `.ohx-link` for surfaces rendered OUTSIDE a
// RefinedRoot (MUI Dialogs render through a Portal, so the scoped classes and
// CSS variables don't reach them). Fallback colors are the refined tokens.
const plainLinkStyle = {
  color: "var(--brand, #1B3A6B)",
  fontWeight: 600,
  textDecoration: "underline",
  textDecorationColor: "var(--accent, #E2552E)",
  textDecorationThickness: "1.5px",
  textUnderlineOffset: 4,
};

/**
 * A quiet text link to the general fund.
 * - Inside a RefinedRoot: renders as `.ohx-link` (navy, hover underline, arrow).
 * - `plain`: inline-styled equivalent for Portal surfaces (Dialogs).
 */
export function DonateLink({
  placement,
  children = "Make a donation",
  plain = false,
  arrow = !plain,
  className,
  style,
  ...rest
}) {
  return (
    <a
      href={donateHref(placement)}
      target="_blank"
      rel="noopener noreferrer"
      className={plain ? className : ["ohx-link", className].filter(Boolean).join(" ")}
      style={plain ? { ...plainLinkStyle, ...style } : style}
      onClick={() => trackDonateClick(placement)}
      {...rest}
    >
      {children}
      {arrow ? <Arrow /> : null}
    </a>
  );
}

/**
 * A compact hairline card: eyebrow + one sentence + ghost button. Must live
 * inside a RefinedRoot (uses `.ohx-card` / `.ohx-btn`). One per page at most.
 */
export function DonateCard({
  placement,
  eyebrow = "How we're funded",
  children,
  cta = "Make a donation",
  style,
}) {
  return (
    <div
      className="ohx-card"
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "18px 28px",
        padding: "22px 26px",
        ...style,
      }}
    >
      <div style={{ flex: "1 1 320px", maxWidth: "58ch" }}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <p style={{ margin: "8px 0 0", lineHeight: 1.55 }}>{children}</p>
      </div>
      <a
        href={donateHref(placement)}
        target="_blank"
        rel="noopener noreferrer"
        className="ohx-btn ohx-btn--ghost"
        style={{ flex: "0 0 auto" }}
        onClick={() => trackDonateClick(placement)}
      >
        {cta} <Arrow />
      </a>
    </div>
  );
}
