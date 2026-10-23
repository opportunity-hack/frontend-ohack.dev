// Small shell for simple content pages on the refined design, so a legal
// page or an article doesn't re-declare the same wrapper/masthead markup.
// Everything renders inside <RefinedRoot>, so the .ohx-* classes apply.
import React from "react";
import Link from "next/link";
import { RefinedRoot, Eyebrow } from "./refined";

// Clears the absolute 64px NavBar; the section is the first in-flow element.
export const pageSectionStyle = {
  paddingTop: "clamp(96px, 10vh, 128px)",
  paddingBottom: "clamp(56px, 8vh, 112px)",
};

export const RefinedPage = ({
  children,
  narrow = false,
  style,
  as: Tag = "section",
}) => (
  <RefinedRoot>
    <Tag
      className={narrow ? "ohx-wrap ohx-narrow" : "ohx-wrap"}
      style={{ ...pageSectionStyle, ...style }}
    >
      {children}
    </Tag>
  </RefinedRoot>
);

export const BackLink = ({ href, children }) => (
  <Link href={href} className="ohx-link" style={{ fontSize: 13 }}>
    <span aria-hidden="true">←</span> {children}
  </Link>
);

/**
 * Eyebrow → the page's ONE <h1> (optionally with an italic accent phrase) →
 * lead paragraph → optional children (tags, actions, stat row).
 */
export const PageMasthead = ({
  eyebrow,
  title,
  italic,
  lead,
  children,
  style,
}) => (
  <header style={{ marginTop: 18, ...style }}>
    {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
    <h1
      className="ohx-display"
      style={{ marginTop: eyebrow ? 8 : 0, maxWidth: "22ch" }}
    >
      {title}
      {italic && (
        <>
          {" "}
          <span className="ohx-italic">{italic}</span>
        </>
      )}
    </h1>
    {lead && (
      <p className="ohx-lead" style={{ marginTop: 14, maxWidth: "60ch" }}>
        {lead}
      </p>
    )}
    {children}
  </header>
);

export const Prose = ({ children, style, className = "" }) => (
  <div className={`ohx-prose ${className}`.trim()} style={style}>
    {children}
  </div>
);

/** A quiet row of related links: one primary action + soft links. */
export const LinkRow = ({ primary, links = [], style }) => (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: "12px 22px",
      ...style,
    }}
  >
    {primary && (
      <Link href={primary.href} className="ohx-btn ohx-btn--primary">
        {primary.label}
      </Link>
    )}
    {links.map((l) => (
      <Link key={l.href + l.label} href={l.href} className="ohx-link">
        {l.label}{" "}
        <span className="ohx-arrow" aria-hidden="true">
          →
        </span>
      </Link>
    ))}
  </div>
);

/** Navy closing band: eyebrow, Fraunces title, body, one primary + one ghost. */
export const CtaBand = ({
  eyebrow,
  title,
  body,
  primary,
  secondary,
  style,
}) => (
  <div
    className="ohx-card"
    style={{
      marginTop: 48,
      padding: "28px 30px",
      background: "var(--brand)",
      borderColor: "var(--brand)",
      color: "#fff",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 20,
      ...style,
    }}
  >
    <div style={{ maxWidth: "56ch" }}>
      {eyebrow && (
        <p className="ohx-eyebrow" style={{ color: "rgba(255,255,255,0.7)" }}>
          {eyebrow}
        </p>
      )}
      <h2
        className="ohx-display"
        style={{ fontSize: 24, marginTop: eyebrow ? 8 : 0, color: "#fff" }}
      >
        {title}
      </h2>
      {body && (
        <p
          style={{
            margin: "8px 0 0",
            fontSize: 14.5,
            color: "rgba(255,255,255,0.85)",
            lineHeight: 1.55,
          }}
        >
          {body}
        </p>
      )}
    </div>
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      {primary && (
        <Link
          href={primary.href}
          className="ohx-btn"
          style={{ background: "#fff", color: "var(--brand)" }}
        >
          {primary.label}
        </Link>
      )}
      {secondary && (
        <Link
          href={secondary.href}
          className="ohx-btn ohx-btn--ghost"
          style={{ color: "#fff", borderColor: "rgba(255,255,255,0.5)" }}
        >
          {secondary.label}
        </Link>
      )}
    </div>
  </div>
);
