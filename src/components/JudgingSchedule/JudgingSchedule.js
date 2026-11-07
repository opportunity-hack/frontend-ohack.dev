import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import NextLink from "next/link";
import { styled } from "@mui/material/styles";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LiteVideoThumbnail from "../VideoDisplay/LiteVideoThumbnail";
import VideoDisplay from "../VideoDisplay/VideoDisplay";
import { getWinningStatus } from "../../constants/teamStatus";
import { submissionLabel } from "../Teams/projectMeta";
import { relativeTime } from "../Teams/mentorCoverage";
import { slackChannelUrl, KEY_CHANNELS } from "../../lib/slackLinks";
import { trackEvent, EventCategory } from "../../lib/ga";
import useJudgingSchedule from "../../hooks/use-judging-schedule";
import useTeamsGithubActivity from "../../hooks/use-teams-github-activity";
import {
  READY_RULE_COPY,
  ROUND_LABELS,
  SCHEDULE_ROUNDS,
  formatCommitCount,
  formatDemoTime,
  judgePanelIndex,
  mergeSchedule,
  scheduleState,
  scheduleTotals,
  teamMatchesQuery,
  unassignedActiveTeams,
} from "../../lib/judgingSchedule";

/*
 * The public judging schedule (/hack/[event_id]/judging): panels, rooms,
 * judges and every assigned team's readiness, replacing the Google Doc
 * organizers kept per event. Rendered inside the page's RefinedRoot Shell,
 * so .ohx-* classes and CSS vars are available — EXCEPT inside the MUI
 * video Dialog (a Portal), which uses literal colors.
 *
 * Every section component is module-scope (the SectionBlock remount-storm
 * lesson): the IntersectionObserver ticks `activeId` and the 60s schedule
 * poll re-renders the page, and neither may remount the rows.
 */

const SCROLL_OFFSET = 96;
const POLL_MS = 60000;
const SEARCH_GA_DEBOUNCE_MS = 1500;
const PRINT_ROOT_ID = "judging-print-root";
const SITE = "https://www.ohack.dev";

const ga = (action, eventId, params = {}) =>
  trackEvent({
    action,
    params: {
      event_category: EventCategory.ENGAGEMENT,
      event_label: eventId,
      ...params,
    },
  });

// --- Styles -----------------------------------------------------------------

const Frame = styled("div")({
  "& .js-table": {
    width: "100%",
    borderCollapse: "collapse",
    fontFamily: "var(--body)",
    fontSize: 14.5,
  },
  "& .js-table th": {
    textAlign: "left",
    fontWeight: 600,
    fontSize: 12.5,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "var(--muted)",
    padding: "8px 10px",
    borderBottom: "1px solid var(--line)",
    whiteSpace: "nowrap",
  },
  "& .js-table td": {
    padding: "12px 10px",
    borderBottom: "1px solid var(--line)",
    verticalAlign: "middle",
  },
  "& .js-table tr:last-of-type td": { borderBottom: "none" },
  "& .js-muted": { color: "var(--muted)" },
  "& .js-faint": { color: "var(--faint)" },
  "& mark": {
    background: "var(--accent-soft)",
    color: "inherit",
    borderRadius: 3,
    padding: "0 1px",
  },
  "& .js-print-only": { display: "none" },
  "@media (max-width: 760px)": {
    "& .js-table thead": { display: "none" },
    "& .js-table, & .js-table tbody, & .js-table tr, & .js-table td": {
      display: "block",
      width: "100%",
    },
    "& .js-table tr": {
      borderBottom: "1px solid var(--line)",
      padding: "10px 0",
    },
    "& .js-table tr:last-of-type": { borderBottom: "none" },
    "& .js-table td": {
      border: "none",
      padding: "4px 0",
      display: "flex",
      gap: 12,
      alignItems: "center",
    },
    "& .js-table td[data-label]::before": {
      content: "attr(data-label)",
      flex: "0 0 92px",
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      color: "var(--muted)",
    },
  },
});

// Print: hide everything that is neither the print root, inside it, nor
// one of its ancestors (NavBar, Footer, Portals…); one panel per page.
const PRINT_CSS = `
@media print {
  @page { size: letter; margin: 0.5in; }
  body *:not(:has(#${PRINT_ROOT_ID})):not(#${PRINT_ROOT_ID}):not(#${PRINT_ROOT_ID} *) { display: none !important; }
  #${PRINT_ROOT_ID} .js-no-print { display: none !important; }
  #${PRINT_ROOT_ID} .js-print-only { display: revert !important; }
  #${PRINT_ROOT_ID}, #${PRINT_ROOT_ID} * { color: #000 !important; background: #fff !important; box-shadow: none !important; }
  #${PRINT_ROOT_ID} { font-size: 11pt; }
  #${PRINT_ROOT_ID} .js-panel { break-inside: avoid; page-break-inside: avoid; border: 1px solid #999 !important; }
  #${PRINT_ROOT_ID} .js-panel + .js-panel { break-before: page; page-break-before: always; }
  #${PRINT_ROOT_ID} .js-round + .js-round { break-before: page; page-break-before: always; }
  #${PRINT_ROOT_ID} a.js-print-url::after { content: " (" attr(href) ")"; font-size: 9pt; word-break: break-all; }
  #${PRINT_ROOT_ID} .js-layout { display: block !important; }
}
`;

// --- Small atoms --------------------------------------------------------------

const Highlight = ({ text, query }) => {
  const q = (query || "").trim();
  if (!q || !text) return text || null;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
};

const usablePhoto = (url) =>
  typeof url === "string" &&
  /^https?:\/\//i.test(url) &&
  !url.includes("drive.google.com");

const JudgeAvatar = ({ judge }) => {
  const [failed, setFailed] = useState(false);
  const initial = (judge.name || "?").trim().charAt(0).toUpperCase() || "?";
  if (!failed && usablePhoto(judge.photoUrl)) {
    return (
      // Photo hosts vary (CDN, LinkedIn, Gravatar…) — a plain sized <img>
      // instead of next/image, which only allows cdn.ohack.dev.
      <img
        src={judge.photoUrl}
        alt=""
        width={36}
        height={36}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
          background: "var(--surface-2)",
        }}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        flexShrink: 0,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--surface-2)",
        color: "var(--brand)",
        fontFamily: "var(--display)",
        fontWeight: 600,
        fontSize: 16,
      }}
    >
      {initial}
    </span>
  );
};

const JudgeChip = ({ judge, otherPanels }) => {
  const sub = [judge.title, judge.company].filter(Boolean).join(" · ");
  return (
    <li style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
      <JudgeAvatar judge={judge} />
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block", fontWeight: 600, lineHeight: 1.25 }}>
          {judge.linkedinProfile ? (
            <a
              href={judge.linkedinProfile}
              target="_blank"
              rel="noopener noreferrer"
              className="ohx-link"
              style={{ textDecoration: "none" }}
            >
              {judge.name || "Judge"}
            </a>
          ) : (
            judge.name || "Judge"
          )}
        </span>
        {sub && (
          <span
            className="js-muted"
            style={{ display: "block", fontSize: 13, lineHeight: 1.3 }}
          >
            {sub}
          </span>
        )}
        {otherPanels.length > 0 && (
          <span
            className="js-faint"
            style={{ display: "block", fontSize: 12.5 }}
          >
            Also on {otherPanels.map((p) => p.panel_name).join(", ")}
          </span>
        )}
      </span>
    </li>
  );
};

const CodeCell = ({ code }) => {
  switch (code.state) {
    case "pending":
      return <span className="js-faint">Checking…</span>;
    case "no_repo":
      return <span className="js-faint">No repo</span>;
    case "unavailable":
      return (
        <a
          href={code.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ohx-link js-print-url"
        >
          Couldn't check
        </a>
      );
    case "none":
      return (
        <a
          href={code.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ohx-link js-print-url"
          style={{ color: "var(--danger)" }}
        >
          No commits yet
        </a>
      );
    default: {
      const ago = code.lastCommitAt ? relativeTime(code.lastCommitAt) : "";
      return (
        <a
          href={code.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ohx-link js-print-url"
        >
          {formatCommitCount(code.commits)}
          {ago ? ` · ${ago}` : ""}
        </a>
      );
    }
  }
};

const Check = ({ ok, yes = "Yes", no = "Missing" }) =>
  ok ? (
    <span style={{ color: "var(--success)", fontWeight: 600 }}>
      <span aria-hidden="true">✓ </span>
      {yes}
    </span>
  ) : (
    <span className="js-faint">— {no}</span>
  );

const TeamRow = ({
  team,
  round,
  eventId,
  timezone,
  query,
  onPlayVideo,
  onTeamClick,
}) => {
  const r = team.readiness;
  const slackUrl = slackChannelUrl(team.slack_channel);
  const winning = getWinningStatus(team.status);
  const submitted = submissionLabel(team, timezone).tag;
  const teamHref = `/hack/${encodeURIComponent(eventId)}/team/${encodeURIComponent(team.id)}`;
  return (
    <tr id={`team-${team.id}`}>
      {round === "round2" && (
        <td data-label="Demo" style={{ whiteSpace: "nowrap", fontWeight: 600 }}>
          {formatDemoTime(team.demo_time, timezone) || (
            <span className="js-faint">—</span>
          )}
        </td>
      )}
      <td data-label="Team" style={{ minWidth: 160 }}>
        <span style={{ display: "block" }}>
          <NextLink
            href={teamHref}
            className="ohx-link"
            style={{ fontWeight: 600 }}
            onClick={() => onTeamClick(team.id)}
          >
            {winning && (
              <span aria-label={winning.label} title={winning.label}>
                🏆{" "}
              </span>
            )}
            <Highlight text={team.name || "Unnamed team"} query={query} />
          </NextLink>
          {r?.ready && (
            <span
              className="ohx-tag ohx-tag--accent"
              style={{ marginLeft: 8, verticalAlign: "middle" }}
            >
              Ready
            </span>
          )}
        </span>
        {slackUrl && (
          <a
            href={slackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="js-muted"
            style={{ fontSize: 13, textDecoration: "none" }}
          >
            #<Highlight text={team.slack_channel} query={query} />
          </a>
        )}
        <span className="js-print-only" style={{ fontSize: "9pt" }}>
          {" "}
          {SITE}
          {teamHref}
        </span>
      </td>
      <td data-label="Nonprofit" className="js-muted" style={{ fontSize: 14 }}>
        {team.nonprofitName ? (
          <Highlight text={team.nonprofitName} query={query} />
        ) : (
          <span className="js-faint">—</span>
        )}
      </td>
      <td data-label="Code" style={{ fontSize: 14 }}>
        <CodeCell code={r.code} />
      </td>
      <td data-label="Video">
        {team.demo_video_url ? (
          <>
            <span className="js-no-print" style={{ display: "inline-block" }}>
              <LiteVideoThumbnail
                url={team.demo_video_url}
                width={96}
                height={54}
                label={`Watch ${team.name || "team"} demo`}
                onClick={() => onPlayVideo(team.demo_video_url, team.name)}
              />
            </span>
            <span className="js-print-only" style={{ fontSize: "9pt" }}>
              {team.demo_video_url}
            </span>
          </>
        ) : (
          <span className="js-faint">No video</span>
        )}
      </td>
      <td data-label="Write-up" style={{ fontSize: 14 }}>
        <Check ok={r.story} yes="Done" no="None" />
      </td>
      <td data-label="Submitted" style={{ fontSize: 14 }}>
        {submitted ? (
          <span
            style={{
              color:
                submitted === "In progress" ? "var(--muted)" : "var(--ink)",
            }}
          >
            {submitted}
          </span>
        ) : (
          <span className="js-faint">—</span>
        )}
      </td>
    </tr>
  );
};

const PanelCard = ({
  panel,
  round,
  eventId,
  timezone,
  judgeIndex,
  query,
  codeLoaded,
  onPlayVideo,
  onTeamClick,
}) => {
  const visibleTeams = panel.teams.filter((t) => teamMatchesQuery(t, query));
  const anchorId = `${round}-${panel.panel_id}`;
  const teamCount = panel.teams.length;
  // While searching, panels without a match get out of the way.
  if (query.trim() && visibleTeams.length === 0) return null;
  return (
    <section
      id={anchorId}
      data-schedule-section
      aria-labelledby={`${anchorId}-title`}
      className="ohx-card js-panel"
      style={{
        padding: "22px 24px",
        marginBottom: 20,
        scrollMarginTop: SCROLL_OFFSET,
      }}
    >
      <header
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "baseline",
          gap: "6px 12px",
        }}
      >
        <h3
          id={`${anchorId}-title`}
          className="ohx-display"
          style={{ fontSize: 24, margin: 0, lineHeight: 1.2 }}
        >
          {panel.panel_name}
        </h3>
        {panel.room && (
          <span className="ohx-tag ohx-tag--accent">{panel.room}</span>
        )}
        <span className="js-muted" style={{ fontSize: 14 }}>
          {teamCount} team{teamCount === 1 ? "" : "s"}
          {codeLoaded ? ` · ${panel.readyCount} ready` : ""}
        </span>
      </header>
      {panel.panelNonprofits.length > 0 && (
        <p
          className="js-muted"
          style={{ margin: "6px 0 0", fontSize: 15, lineHeight: 1.45 }}
        >
          {panel.panelNonprofits.map((n, i) => (
            <React.Fragment key={n.id}>
              {i > 0 && " · "}
              <NextLink
                href={`/nonprofit/${encodeURIComponent(n.id)}`}
                className="ohx-link"
              >
                {n.name}
              </NextLink>
            </React.Fragment>
          ))}
        </p>
      )}

      <h4 className="ohx-eyebrow" style={{ margin: "18px 0 10px" }}>
        Judges
      </h4>
      {panel.judges.length > 0 ? (
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 14,
          }}
        >
          {panel.judges.map((j) => (
            <JudgeChip
              key={j.id || j.name}
              judge={j}
              otherPanels={(judgeIndex[j.id] || []).filter(
                (p) => !(p.round === round && p.panel_id === panel.panel_id),
              )}
            />
          ))}
        </ul>
      ) : (
        <p className="js-faint" style={{ margin: 0 }}>
          Judges will be listed here once they're assigned.
        </p>
      )}

      <h4 className="ohx-eyebrow" style={{ margin: "22px 0 4px" }}>
        Teams
      </h4>
      {visibleTeams.length > 0 ? (
        <div style={{ overflowX: "auto" }}>
          <table className="js-table">
            <thead>
              <tr>
                {round === "round2" && <th scope="col">Demo</th>}
                <th scope="col">Team</th>
                <th scope="col">Nonprofit</th>
                <th scope="col">Code</th>
                <th scope="col">Video</th>
                <th scope="col">Write-up</th>
                <th scope="col">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {visibleTeams.map((t) => (
                <TeamRow
                  key={t.id}
                  team={t}
                  round={round}
                  eventId={eventId}
                  timezone={timezone}
                  query={query}
                  onPlayVideo={onPlayVideo}
                  onTeamClick={onTeamClick}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="js-faint" style={{ margin: "8px 0 0" }}>
          No active teams on this panel.
        </p>
      )}
      {panel.inactiveCount > 0 && (
        <p className="js-faint" style={{ margin: "12px 0 0", fontSize: 13.5 }}>
          {panel.inactiveCount} team{panel.inactiveCount === 1 ? "" : "s"}{" "}
          left the hackathon and {panel.inactiveCount === 1 ? "isn't" : "aren't"}{" "}
          listed.
        </p>
      )}
    </section>
  );
};

const ScheduleToc = ({ items, activeId, onJump }) => (
  <nav
    aria-label="Panels on this page"
    className="ohx-card js-no-print"
    style={{
      padding: "16px 14px",
      boxSizing: "border-box",
    }}
  >
    <p className="ohx-eyebrow" style={{ margin: "0 0 10px 4px" }}>
      Panels
    </p>
    <ul className="js-toc-list">
      {items.map((item) => {
        const active = activeId === item.id;
        return (
          <li key={item.id} style={{ flexShrink: 0 }}>
            <a
              href={`#${item.id}`}
              onClick={(e) => onJump(e, item.id)}
              aria-current={active ? "location" : undefined}
              className={`js-toc-link${item.heading ? " js-toc-heading" : ""}${
                active ? " is-active" : ""
              }`}
            >
              {item.name}
              {item.room ? (
                <span className="js-toc-room"> · {item.room}</span>
              ) : null}
            </a>
          </li>
        );
      })}
    </ul>
  </nav>
);

const TocStyles = styled("div")({
  "& .js-toc-list": {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  "& .js-toc-link": {
    display: "block",
    textDecoration: "none",
    whiteSpace: "nowrap",
    fontFamily: "var(--body)",
    fontWeight: 600,
    fontSize: "0.86rem",
    lineHeight: 1.3,
    borderRadius: 6,
    padding: "7px 10px",
    color: "var(--muted)",
    transition: "background-color .18s ease, color .18s ease",
  },
  "& .js-toc-heading": {
    color: "var(--ink)",
    fontSize: "0.8rem",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  "& .js-toc-room": { fontWeight: 400 },
  "& .js-toc-link:hover": {
    color: "var(--ink)",
    backgroundColor: "rgba(27,58,107,0.06)",
  },
  "& .js-toc-link.is-active": {
    color: "#fff",
    backgroundColor: "var(--brand)",
  },
  "& .js-toc-link.is-active .js-toc-room": { color: "rgba(255,255,255,0.8)" },
  "& .js-layout": { display: "flex", gap: 32, alignItems: "flex-start" },
  "& .js-toc-col": {
    flex: "0 0 240px",
    position: "sticky",
    top: SCROLL_OFFSET,
    maxHeight: `calc(100vh - ${SCROLL_OFFSET + 16}px)`,
    overflowY: "auto",
  },
  "@media (max-width: 899px)": {
    "& .js-layout": { flexDirection: "column", gap: 16 },
    "& .js-toc-col": {
      flex: "none",
      width: "100%",
      position: "static",
      maxHeight: "none",
      overflowY: "visible",
    },
    "& .js-toc-list": {
      flexDirection: "row",
      overflowX: "auto",
      WebkitOverflowScrolling: "touch",
      gap: 4,
    },
  },
});

const StateCard = ({ state, eventHref, eventTitle }) => {
  const title =
    state === "empty"
      ? "Panels are still being set up."
      : state === "unpublished"
        ? "The judging schedule hasn't been published yet."
        : "The judging schedule isn't available right now.";
  const body =
    state === "empty"
      ? "The schedule is published, but no panels have been assigned yet. Check back closer to judging."
      : "Check back closer to judging, or ask in #ask-a-mentor on Slack.";
  return (
    <div
      className="ohx-card"
      role="status"
      style={{ padding: "26px 28px", maxWidth: 720 }}
    >
      <h2 className="ohx-display" style={{ fontSize: 24, margin: 0 }}>
        {title}
      </h2>
      <p className="ohx-muted" style={{ margin: "10px 0 18px", maxWidth: "60ch" }}>
        {body}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <NextLink href={eventHref} className="ohx-btn ohx-btn--primary">
          Back to {eventTitle}
        </NextLink>
        <a
          href={slackChannelUrl(KEY_CHANNELS.askAMentor)}
          target="_blank"
          rel="noopener noreferrer"
          className="ohx-btn ohx-btn--ghost"
        >
          Open #ask-a-mentor
        </a>
      </div>
    </div>
  );
};

const LockTags = ({ locks }) => {
  const closed = SCHEDULE_ROUNDS.filter((r) => locks?.[r]?.locked);
  if (closed.length === 0) return null;
  return closed.map((r) => (
    <span key={r} className="ohx-tag">
      {r === "round1" ? "Round 1" : "Round 2"} scoring closed
    </span>
  ));
};

const UnassignedTeams = ({ teams, eventId, onTeamClick }) => (
  <section
    id="unassigned"
    data-schedule-section
    className="ohx-card js-no-print"
    style={{
      padding: "20px 24px",
      marginBottom: 28,
      background: "var(--surface-2)",
      scrollMarginTop: SCROLL_OFFSET,
    }}
  >
    <h3 className="ohx-display" style={{ fontSize: 20, margin: 0 }}>
      {teams.length} active team{teams.length === 1 ? "" : "s"}{" "}
      {teams.length === 1 ? "isn't" : "aren't"} on a Round 1 panel yet
    </h3>
    <p className="ohx-muted" style={{ margin: "6px 0 12px", fontSize: 14.5 }}>
      Organizers: these teams still need judges. Teams: an organizer will add
      you — no action needed.
    </p>
    <ul
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      {teams.map((t) => (
        <li key={t.id}>
          <NextLink
            href={`/hack/${encodeURIComponent(eventId)}/team/${encodeURIComponent(t.id)}`}
            className="ohx-tag"
            style={{ textDecoration: "none" }}
            onClick={() => onTeamClick(t.id)}
          >
            {t.name || "Unnamed team"}
          </NextLink>
        </li>
      ))}
    </ul>
  </section>
);

// --- Main body ------------------------------------------------------------------

export default function JudgingSchedule({
  eventId,
  eventData,
  initialSchedule,
}) {
  const timezone = eventData?.timezone || null;
  const eventHref = `/hack/${eventId}`;
  const eventTitle = eventData?.title || eventId;

  const { schedule, loading } = useJudgingSchedule(eventId, {
    initialData: initialSchedule,
    pollMs: POLL_MS,
  });
  const state = loading ? "loading" : scheduleState(schedule);

  // Readiness only needs the teams that are actually on a panel.
  const assignedTeams = useMemo(() => {
    if (state !== "ready") return [];
    const ids = new Set();
    SCHEDULE_ROUNDS.forEach((r) =>
      (schedule.rounds[r] || []).forEach((p) =>
        (p.teams || []).forEach((t) => ids.add(t.id)),
      ),
    );
    return (eventData?.teams || []).filter((t) => ids.has(t.id));
  }, [state, schedule, eventData]);
  const activity = useTeamsGithubActivity(assignedTeams, {
    enabled: state === "ready",
  });
  const codeLoaded = activity.status === "ready";

  // Teams with a repo read "Checking…" until their entry lands in byTeam
  // (codeState treats a missing entry as pending); no-repo teams resolve
  // immediately.
  const merged = useMemo(
    () =>
      state === "ready"
        ? mergeSchedule(schedule, eventData, activity.byTeam)
        : null,
    [state, schedule, eventData, activity.byTeam],
  );

  const judgeIndex = useMemo(() => judgePanelIndex(schedule), [schedule]);
  const totals = useMemo(() => scheduleTotals(merged), [merged]);
  const unassigned = useMemo(
    () =>
      state === "ready" ? unassignedActiveTeams(schedule, eventData, "round1") : [],
    [state, schedule, eventData],
  );

  // --- search -----------------------------------------------------------------
  const [query, setQuery] = useState("");
  const searchGaTimer = useRef(null);
  const onQueryChange = (e) => {
    setQuery(e.target.value);
    if (searchGaTimer.current) clearTimeout(searchGaTimer.current);
    searchGaTimer.current = setTimeout(
      () => ga("judging_schedule_search", eventId),
      SEARCH_GA_DEBOUNCE_MS,
    );
  };
  useEffect(
    () => () => searchGaTimer.current && clearTimeout(searchGaTimer.current),
    [],
  );
  const matchCount = useMemo(() => {
    if (!merged || !query.trim()) return null;
    const ids = new Set();
    SCHEDULE_ROUNDS.forEach((r) =>
      merged[r].forEach((p) =>
        p.teams.forEach((t) => teamMatchesQuery(t, query) && ids.add(t.id)),
      ),
    );
    return ids.size;
  }, [merged, query]);

  // --- GA view (once, with the resolved state) ---------------------------------
  const viewSentRef = useRef(false);
  useEffect(() => {
    if (viewSentRef.current || state === "loading") return;
    viewSentRef.current = true;
    ga("judging_schedule_view", eventId, { state });
  }, [state, eventId]);

  const onTeamClick = useCallback(
    () => ga("judging_schedule_team_click", eventId),
    [eventId],
  );

  // --- video dialog (exactly one) ---------------------------------------------------
  const [video, setVideo] = useState({ open: false, url: null, teamName: null });
  const onPlayVideo = useCallback(
    (url, teamName) => {
      setVideo({ open: true, url, teamName: teamName || null });
      ga("judging_schedule_video_play", eventId);
    },
    [eventId],
  );
  const closeVideo = useCallback(
    () => setVideo((v) => ({ ...v, open: false })),
    [],
  );

  const onPrint = () => {
    ga("judging_schedule_print", eventId);
    if (typeof window !== "undefined") window.print();
  };

  // --- TOC ----------------------------------------------------------------------
  const tocItems = useMemo(() => {
    if (!merged) return [];
    const items = [];
    SCHEDULE_ROUNDS.forEach((r) => {
      if (merged[r].length === 0) return;
      items.push({ id: r, name: ROUND_LABELS[r], heading: true });
      merged[r].forEach((p) =>
        items.push({
          id: `${r}-${p.panel_id}`,
          name: p.panel_name,
          room: p.room,
        }),
      );
    });
    if (unassigned.length > 0)
      items.push({ id: "unassigned", name: "Not on a panel yet" });
    return items;
  }, [merged, unassigned.length]);

  const [activeId, setActiveId] = useState(null);
  const tocKey = tocItems.map((i) => i.id).join(",");
  useEffect(() => {
    if (typeof window === "undefined" || !tocKey) return undefined;
    const els = Array.from(
      document.querySelectorAll("[data-schedule-section]"),
    );
    if (els.length === 0 || typeof IntersectionObserver === "undefined")
      return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: `-${SCROLL_OFFSET}px 0px -55% 0px`, threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [tocKey]);

  // Honor a deep link (#round1-<panel>) once panels render client-side.
  const deepLinkedRef = useRef(false);
  useEffect(() => {
    if (deepLinkedRef.current || !tocKey || typeof window === "undefined")
      return;
    const hash = window.location.hash?.slice(1);
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) {
      deepLinkedRef.current = true;
      requestAnimationFrame(() => el.scrollIntoView());
    }
  }, [tocKey]);

  const onJump = useCallback((e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth" });
    window.history.replaceState(null, "", `#${id}`);
    setActiveId(id);
  }, []);

  // --- render ---------------------------------------------------------------------
  if (state === "loading") {
    return (
      <div
        aria-busy="true"
        style={{ minHeight: 640 }}
        className="ohx-card"
        role="status"
      >
        <p className="ohx-muted" style={{ padding: "26px 28px", margin: 0 }}>
          Loading the judging schedule…
        </p>
      </div>
    );
  }

  if (state !== "ready") {
    return (
      <StateCard state={state} eventHref={eventHref} eventTitle={eventTitle} />
    );
  }

  return (
    <Frame id={PRINT_ROOT_ID}>
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />
      <p
        className="js-print-only"
        style={{ fontSize: "16pt", fontWeight: 700, margin: "0 0 8pt" }}
      >
        Judging schedule — {eventTitle} ({SITE}
        {eventHref}/judging)
      </p>

      {/* Top strip: search, lock state, print, totals, legend */}
      <div
        className="ohx-card js-no-print"
        style={{
          padding: "18px 22px",
          marginBottom: 24,
          display: "flex",
          flexWrap: "wrap",
          gap: "14px 20px",
          alignItems: "center",
        }}
      >
        <label
          htmlFor="judging-team-search"
          style={{ flex: "1 1 260px", minWidth: 0 }}
        >
          <span className="ohx-eyebrow" style={{ display: "block", marginBottom: 6 }}>
            Find your team
          </span>
          <input
            id="judging-team-search"
            type="search"
            value={query}
            onChange={onQueryChange}
            placeholder="Team name, Slack channel or nonprofit"
            autoComplete="off"
            style={{
              width: "100%",
              boxSizing: "border-box",
              font: "inherit",
              fontSize: 15,
              padding: "10px 12px",
              border: "1px solid var(--line)",
              borderRadius: 8,
              background: "var(--surface)",
              color: "var(--ink)",
            }}
          />
        </label>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            alignItems: "center",
          }}
        >
          <LockTags locks={schedule.locks} />
          <button
            type="button"
            className="ohx-btn ohx-btn--ghost"
            onClick={onPrint}
          >
            Print
          </button>
        </div>
        <p
          className="ohx-muted"
          style={{ flexBasis: "100%", margin: 0, fontSize: 14 }}
          aria-live="polite"
        >
          {matchCount !== null
            ? `${matchCount} team${matchCount === 1 ? "" : "s"} match “${query.trim()}”.`
            : `${totals.panels} panel${totals.panels === 1 ? "" : "s"} · ${totals.teams} team${
                totals.teams === 1 ? "" : "s"
              } · ${totals.judges} judge${totals.judges === 1 ? "" : "s"}.`}{" "}
          {READY_RULE_COPY}
        </p>
      </div>

      <TocStyles>
        <div className="js-layout">
          <div className="js-toc-col js-no-print">
            <ScheduleToc items={tocItems} activeId={activeId} onJump={onJump} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {SCHEDULE_ROUNDS.map((round) =>
              merged[round].length === 0 ? null : (
                <section
                  key={round}
                  id={round}
                  className="js-round"
                  aria-labelledby={`${round}-heading`}
                  style={{ scrollMarginTop: SCROLL_OFFSET, marginBottom: 28 }}
                >
                  <h2
                    id={`${round}-heading`}
                    className="ohx-display"
                    style={{ fontSize: "clamp(1.5rem, 2.8vw, 2rem)", margin: "0 0 16px" }}
                  >
                    {ROUND_LABELS[round]}
                  </h2>
                  {merged[round].map((panel) => (
                    <PanelCard
                      key={panel.panel_id}
                      panel={panel}
                      round={round}
                      eventId={eventId}
                      timezone={timezone}
                      judgeIndex={judgeIndex}
                      query={query}
                          codeLoaded={codeLoaded}
                      onPlayVideo={onPlayVideo}
                      onTeamClick={onTeamClick}
                    />
                  ))}
                  {round === "round1" && unassigned.length > 0 && (
                    <UnassignedTeams
                      teams={unassigned}
                      eventId={eventId}
                      onTeamClick={onTeamClick}
                    />
                  )}
                </section>
              ),
            )}
          </div>
        </div>
      </TocStyles>

      <Dialog
        open={video.open}
        onClose={closeVideo}
        maxWidth="md"
        fullWidth
        aria-labelledby="judging-video-title"
      >
        <DialogTitle id="judging-video-title" sx={{ pr: 6 }}>
          {video.teamName ? `${video.teamName} demo` : "Team demo"}
          <IconButton
            aria-label="Close demo video"
            onClick={closeVideo}
            sx={{ position: "absolute", right: 8, top: 8, color: "#5B6270" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {video.url && (
            <VideoDisplay url={video.url} title={video.teamName || "Team demo"} />
          )}
        </DialogContent>
      </Dialog>
    </Frame>
  );
}
