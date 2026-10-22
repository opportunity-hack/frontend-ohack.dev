import React, { useEffect, useRef } from "react";
import Link from "next/link";
import InlineScoreAdjuster from "./InlineScoreAdjuster";
import { slackChannelUrl } from "../../lib/slackLinks";
import {
  calculateTotal,
  feedbackText,
  hasAllCoreScores,
  MAX_TOTAL,
  SPECIAL_CATEGORIES,
} from "./judgingCriteria";

const formatDemoTime = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("en-US", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });
};

const linkStyle = { fontSize: 13 };

const memberNames = (members) =>
  (members || [])
    .map((m) => (typeof m === "string" ? m : m?.name))
    .filter(Boolean);

/**
 * One assigned team on the judge dashboard (module scope — never define
 * card components inside the page component).
 *
 * States: not scored (primary "Score this team" → full page), scored
 * (quiet score line + "Adjust scores" inline editor + link to the full page),
 * and round locked (read-only link only). The score line is deliberately
 * small and uncolored so it can't be read from across a table.
 */
const JudgeTeamCard = ({
  team,
  round,
  eventId,
  scoreEntry,
  locked = false,
  isAdjusting = false,
  onOpenAdjust,
  onCloseAdjust,
  onSaveAdjust,
  saving = false,
  anySaving = false,
  saveError = null,
  onWatchVideo,
}) => {
  const judged = Boolean(scoreEntry) || Boolean(team.judged);
  // Inline adjusting needs the full stored score; a team the teams payload
  // calls "judged" but with no complete score row goes to the full page.
  const canAdjust =
    judged && Boolean(scoreEntry) && hasAllCoreScores(scoreEntry.scores);
  const adjustButtonRef = useRef(null);
  const wasAdjustingRef = useRef(isAdjusting);
  // Return focus to the trigger when the editor closes (Save, Cancel, Esc).
  useEffect(() => {
    if (wasAdjustingRef.current && !isAdjusting)
      adjustButtonRef.current?.focus();
    wasAdjustingRef.current = isAdjusting;
  }, [isAdjusting]);
  const total = scoreEntry?.scores
    ? calculateTotal(scoreEntry.scores)
    : team.score;
  const accessibility =
    round === "round1"
      ? (scoreEntry?.scores?.accessibility ??
        team.specialCategoryScores?.accessibility ??
        null)
      : null;
  const fullPageHref = `/judge/${encodeURIComponent(eventId)}/team/${encodeURIComponent(team.id)}?round=${round}`;
  const nonprofit = team.problem_statement || {};
  const videoUrl =
    round === "round1" ? team.demo_video_url || team.video_url : null;
  const names = memberNames(team.members);
  const demoTime = round === "round2" ? formatDemoTime(team.demo_time) : null;

  return (
    <article
      className="ohx-card"
      aria-labelledby={`team-${team.id}-name`}
      style={{
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        borderColor: isAdjusting ? "var(--brand, #1B3A6B)" : undefined,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          alignItems: "center",
        }}
      >
        {locked ? (
          <span className="ohx-tag">Scoring closed</span>
        ) : judged ? (
          <span className="ohx-tag">Scored</span>
        ) : (
          <span className="ohx-tag">Not scored yet</span>
        )}
        {demoTime && <span className="ohx-tag">Demo {demoTime}</span>}
        {round === "round2" && team.room && (
          <span className="ohx-tag">{team.room}</span>
        )}
      </div>

      <h3
        id={`team-${team.id}-name`}
        className="ohx-display"
        style={{ fontSize: 22, lineHeight: 1.15 }}
      >
        {team.name}
      </h3>

      {nonprofit.nonprofit ? (
        nonprofit.nonprofit_id ? (
          <Link
            href={`/nonprofit/${encodeURIComponent(nonprofit.nonprofit_id)}`}
            className="ohx-link"
            target="_blank"
            rel="noopener noreferrer"
            style={linkStyle}
          >
            {nonprofit.nonprofit}
          </Link>
        ) : (
          <p
            style={{ margin: 0, fontSize: 13, color: "var(--muted, #5B6270)" }}
          >
            {nonprofit.nonprofit}
          </p>
        )
      ) : null}

      {names.length > 0 && (
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: "var(--muted, #5B6270)",
            lineHeight: 1.5,
          }}
        >
          <span style={{ color: "var(--faint, #8A8F9A)" }}>Team · </span>
          {names.join(", ")}
        </p>
      )}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px 16px",
          alignItems: "center",
        }}
      >
        {team.github_url && (
          <a
            className="ohx-link"
            href={team.github_url}
            target="_blank"
            rel="noopener noreferrer"
            style={linkStyle}
          >
            GitHub ↗
          </a>
        )}
        {team.devpost_url && (
          <a
            className="ohx-link"
            href={team.devpost_url}
            target="_blank"
            rel="noopener noreferrer"
            style={linkStyle}
          >
            DevPost ↗
          </a>
        )}
        {videoUrl && (
          <button
            type="button"
            className="ohx-link"
            onClick={() => onWatchVideo?.(videoUrl, team.name)}
            style={{
              ...linkStyle,
              background: "none",
              border: 0,
              padding: 0,
              cursor: "pointer",
            }}
          >
            Watch demo video
          </button>
        )}
        {team.slack_channel && (
          <a
            className="ohx-link"
            href={slackChannelUrl(team.slack_channel)}
            target="_blank"
            rel="noopener noreferrer"
            style={linkStyle}
          >
            #{String(team.slack_channel).replace(/^#/, "")} ↗
          </a>
        )}
      </div>

      {judged && (
        <p style={{ margin: 0, fontSize: 13, color: "var(--muted, #5B6270)" }}>
          Your score · {total ?? "—"} of {MAX_TOTAL}
          {accessibility !== null && accessibility !== undefined && (
            <>
              {" "}
              · {SPECIAL_CATEGORIES[0].name} {accessibility} of{" "}
              {SPECIAL_CATEGORIES[0].maxPoints}
            </>
          )}
        </p>
      )}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
          marginTop: 4,
        }}
      >
        {locked ? (
          <Link href={fullPageHref} className="ohx-link" style={linkStyle}>
            {judged ? "View your score →" : "View team →"}
          </Link>
        ) : !judged ? (
          <Link href={fullPageHref} className="ohx-btn ohx-btn--primary">
            Score this team
          </Link>
        ) : canAdjust ? (
          <>
            <button
              ref={adjustButtonRef}
              type="button"
              className="ohx-btn ohx-btn--ghost"
              onClick={isAdjusting ? onCloseAdjust : onOpenAdjust}
              aria-expanded={isAdjusting}
              aria-controls={`adjust-${team.id}`}
              // While any save is in flight, no editor may be closed or
              // another opened — a result must land on the card it belongs to.
              disabled={isAdjusting ? saving : anySaving}
            >
              {isAdjusting ? "Close" : "Adjust scores"}
            </button>
            <Link href={fullPageHref} className="ohx-link" style={linkStyle}>
              Open full scoring page →
            </Link>
          </>
        ) : (
          <Link href={fullPageHref} className="ohx-link" style={linkStyle}>
            Open full scoring page →
          </Link>
        )}
      </div>

      {isAdjusting && canAdjust && !locked && (
        <div id={`adjust-${team.id}`}>
          <InlineScoreAdjuster
            team={team}
            round={round}
            initialScores={scoreEntry?.scores || {}}
            initialFeedback={feedbackText(scoreEntry?.feedback)}
            onSave={onSaveAdjust}
            onCancel={onCloseAdjust}
            saving={saving}
            error={saveError}
          />
        </div>
      )}
    </article>
  );
};

export default JudgeTeamCard;
