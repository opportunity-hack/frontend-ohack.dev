// "Who's helping" roster for a project (issue #359). Shows the people who
// raised their hand, split into Developers and Mentors, with when they
// started, and points newcomers at the project's Slack channel where those
// people actually coordinate. Only ever rendered inside ProblemStatement
// (→ inside a RefinedRoot), so the scoped .ohx-* classes are safe here.
//
// Module-scope subcomponents on purpose — see the SectionBlock remount
// lesson in CLAUDE.md.

import React, { useState } from "react";
import Link from "next/link";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import TagIcon from "@mui/icons-material/Tag";
import DeveloperModeIcon from "@mui/icons-material/DeveloperMode";
import SupportIcon from "@mui/icons-material/Support";
import {
  HELPER_TYPES,
  HELPER_TYPE_LABELS,
  groupHelpersByType,
  countHelpers,
  helperDisplayName,
  helperInitials,
  formatSince,
  formatSinceExact,
  isSameHelper,
  helperProfileHref,
  slackChannelHref,
} from "./helpersData";

export const ROSTER_PREVIEW_LIMIT = 8;

/** "2 developers and 1 mentor have raised a hand." — counts-only fallback. */
export function summarizeCounts(helpers) {
  const counts = countHelpers(helpers);
  const parts = [];
  if (counts.hacker) parts.push(`${counts.hacker} ${counts.hacker === 1 ? "developer" : "developers"}`);
  if (counts.mentor) parts.push(`${counts.mentor} ${counts.mentor === 1 ? "mentor" : "mentors"}`);
  const other = counts.total - counts.hacker - counts.mentor;
  if (other) parts.push(`${other} ${other === 1 ? "other helper" : "other helpers"}`);
  if (!parts.length) return "";
  return `${parts.join(" and ")} ${counts.total === 1 ? "has" : "have"} raised a hand.`;
}

const GROUP_ICONS = {
  hacker: <DeveloperModeIcon sx={{ fontSize: 15, color: "var(--accent)" }} />,
  mentor: <SupportIcon sx={{ fontSize: 15, color: "var(--accent)" }} />,
};

const chipStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "5px 10px 5px 6px",
  border: "1px solid var(--line)",
  borderRadius: 999,
  background: "var(--surface)",
  color: "var(--ink)",
  textDecoration: "none",
  fontSize: "0.86rem",
  lineHeight: 1.2,
  maxWidth: "100%",
};

const HelperChip = ({ helper, isYou, now }) => {
  const name = helperDisplayName(helper);
  const since = formatSince(helper.since, now);
  const exact = formatSinceExact(helper.since);
  const href = helperProfileHref(helper);
  const body = (
    <>
      <Avatar
        src={helper.profile_image || undefined}
        alt=""
        sx={{
          width: 24,
          height: 24,
          fontSize: 11,
          bgcolor: "var(--surface-2)",
          color: "var(--brand)",
          border: "1px solid var(--line)",
        }}
        imgProps={{ loading: "lazy", referrerPolicy: "no-referrer" }}
      >
        {helperInitials(helper)}
      </Avatar>
      <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <span
          style={{
            fontWeight: 600,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {name}
          {isYou && (
            <span style={{ color: "var(--accent)", fontWeight: 500 }}> · you</span>
          )}
        </span>
        {since && (
          <span style={{ color: "var(--muted)", fontSize: "0.74rem" }}>
            since {since}
          </span>
        )}
      </span>
    </>
  );
  const style = isYou
    ? { ...chipStyle, borderColor: "var(--brand)" }
    : chipStyle;
  const content = href ? (
    <Link href={href} style={style} className="ohx-card--hover">
      {body}
    </Link>
  ) : (
    <span style={style}>{body}</span>
  );
  return (
    <li style={{ listStyle: "none", minWidth: 0 }}>
      {exact ? (
        <Tooltip title={`Helping since ${exact}`} arrow placement="top" describeChild>
          {content}
        </Tooltip>
      ) : (
        content
      )}
    </li>
  );
};

const HelperGroup = ({ type, helpers, profile, now }) => {
  const [expanded, setExpanded] = useState(false);
  if (!helpers.length) return null;
  const labels = HELPER_TYPE_LABELS[type] || { singular: "Helper", plural: "Helpers" };
  const visible = expanded ? helpers : helpers.slice(0, ROSTER_PREVIEW_LIMIT);
  const hidden = helpers.length - visible.length;
  const label = helpers.length === 1 ? labels.singular : labels.plural;
  return (
    <div style={{ marginTop: 14 }}>
      <p
        className="ohx-eyebrow"
        style={{
          fontSize: "0.66rem",
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {GROUP_ICONS[type]}
        {label} ({helpers.length})
      </p>
      <ul
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          margin: 0,
          padding: 0,
        }}
      >
        {visible.map((helper, index) => (
          <HelperChip
            key={helper.db_id || helper.user_id || index}
            helper={helper}
            isYou={isSameHelper(helper, profile)}
            now={now}
          />
        ))}
        {hidden > 0 && (
          <li style={{ listStyle: "none" }}>
            <button
              type="button"
              className="ohx-tag"
              onClick={() => setExpanded(true)}
              style={{ cursor: "pointer", border: "1px solid var(--line)" }}
            >
              +{hidden} more
            </button>
          </li>
        )}
      </ul>
    </div>
  );
};

/**
 * @param {object} props
 * @param {Array}   props.helpers      normalized roster rows (see helpersData)
 * @param {boolean} props.loading      true while the enriched roster is in flight
 * @param {boolean} props.enriched     false until the roster endpoint has answered — while the
 *                                     backend is behind, show counts instead of nameless chips
 * @param {string}  props.slackChannel project Slack channel (without #)
 * @param {object}  props.profile      signed-in user's profile (for the "you" marker)
 * @param {boolean} props.offerHelp    whether the project is recruiting
 * @param {node}    props.helpToggle   the "Want to help?" control, rendered in the footer
 */
const HelpersRoster = ({
  helpers = [],
  loading = false,
  enriched = true,
  slackChannel,
  profile,
  offerHelp = true,
  helpToggle = null,
  now,
}) => {
  const groups = groupHelpersByType(helpers);
  const total = helpers.length;
  const slackHref = slackChannelHref(slackChannel);
  const namesPending = loading && !enriched && total > 0;
  const namesUnavailable = !loading && !enriched && total > 0;
  const orderedTypes = [...HELPER_TYPES, "other"];

  return (
    <section
      aria-labelledby="helpers-roster-heading"
      aria-busy={loading || undefined}
      className="ohx-card"
      style={{ padding: "18px 20px", marginBottom: 28, minHeight: 96 }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <p id="helpers-roster-heading" className="ohx-eyebrow" style={{ margin: 0 }}>
          Who&rsquo;s helping
        </p>
        {total > 0 && (
          <span className="ohx-muted" style={{ fontSize: "0.86rem" }}>
            {total} {total === 1 ? "person has" : "people have"} raised a hand
          </span>
        )}
      </div>

      {namesPending ? (
        <p
          className="ohx-muted"
          role="status"
          style={{ margin: "12px 0 0", fontSize: "0.9rem" }}
        >
          Loading {total} {total === 1 ? "helper" : "helpers"}…
        </p>
      ) : namesUnavailable ? (
        <p className="ohx-muted" style={{ margin: "12px 0 0", fontSize: "0.9rem" }}>
          {summarizeCounts(helpers)}
        </p>
      ) : total === 0 ? (
        <p className="ohx-muted" style={{ margin: "12px 0 0", fontSize: "0.9rem" }}>
          {loading
            ? "Checking who's helping…"
            : offerHelp
              ? "Nobody has raised a hand yet — be the first, and your name shows up here."
              : "No one is signed up on this project right now."}
        </p>
      ) : (
        orderedTypes.map((type) => (
          <HelperGroup
            key={type}
            type={type}
            helpers={groups[type]}
            profile={profile}
            now={now}
          />
        ))
      )}

      {slackHref && (
        <p
          className="ohx-muted"
          style={{ margin: "16px 0 0", fontSize: "0.9rem", lineHeight: 1.5 }}
        >
          {total > 0
            ? "Say hi to them in "
            : "The conversation for this project happens in "}
          <a
            href={slackHref}
            target="_blank"
            rel="noopener noreferrer"
            className="ohx-link"
            style={{ whiteSpace: "nowrap" }}
          >
            <TagIcon sx={{ fontSize: 13, verticalAlign: "-2px" }} />
            {slackChannel}
          </a>{" "}
          on Slack — that&rsquo;s where helpers coordinate, and the thread is
          public proof of teamwork you can point to later.
        </p>
      )}

      {helpToggle && <div style={{ marginTop: 16 }}>{helpToggle}</div>}
    </section>
  );
};

export default HelpersRoster;
