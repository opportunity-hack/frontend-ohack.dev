import React, { useEffect, useMemo, useRef, useState } from "react";
import ScoreScale from "./ScoreScale";
import {
  JUDGING_CRITERIA,
  calculateTotal,
  categoryTotal,
  feedbackCharCount,
  feedbackCharsRemaining,
  hasAllCoreScores,
  isFeedbackValid,
  roundLabel,
  scoreDiff,
  specialCategoriesForRound,
  MAX_TOTAL,
  FEEDBACK_MIN_CHARS,
} from "./judgingCriteria";

const rowStyle = {
  display: "flex",
  flexWrap: "wrap", // phones: the label takes the row, the scale drops under it
  alignItems: "center",
  justifyContent: "space-between",
  gap: "8px 16px",
  padding: "10px 0",
  borderTop: "1px solid var(--line, #E7E1D4)",
};

const WasTag = ({ from }) => (
  <span
    className="ohx-tag"
    style={{ marginLeft: 8 }}
    aria-label={`was ${from}`}
  >
    was {from}
  </span>
);

/**
 * Inline score editor that lives INSIDE a team card on the judge dashboard.
 *
 * UX contract (why it's safe from accidental clicks):
 *  - It only exists after the judge explicitly pressed "Adjust scores".
 *  - Values change only through the segmented 1–5 buttons (no sliders).
 *  - NOTHING is sent to the server until "Save changes" is pressed; Cancel or
 *    Esc discards every change. The button is disabled until something
 *    actually changed, and the footer spells out what changed.
 *  - Feedback is kept (and editable) so a re-submit never drops it.
 */
const InlineScoreAdjuster = ({
  team,
  round,
  initialScores,
  initialFeedback = "",
  onSave,
  onCancel,
  saving = false,
  error = null,
}) => {
  const [draft, setDraft] = useState(() => ({ ...initialScores }));
  const [feedback, setFeedback] = useState(initialFeedback || "");
  const [showFeedback, setShowFeedback] = useState(
    () => !isFeedbackValid(initialFeedback),
  );
  const rootRef = useRef(null);

  // Move focus into the editor when it opens so keyboard users land in it.
  useEffect(() => {
    const first = rootRef.current?.querySelector(
      '[role="radio"][tabindex="0"]',
    );
    first?.focus({ preventScroll: true });
  }, []);

  const changes = useMemo(
    () => scoreDiff(initialScores, draft, round),
    [initialScores, draft, round],
  );
  const feedbackChanged = (feedback || "") !== (initialFeedback || "");
  const hasChanges = changes.length > 0 || feedbackChanged;
  const feedbackOk = isFeedbackValid(feedback);
  const beforeTotal = calculateTotal(initialScores);
  const afterTotal = calculateTotal(draft);
  // A score with a missing criterion would be rejected by the backend (400
  // "Invalid score for …") — never let Save send one.
  const complete = hasAllCoreScores(draft);
  const canSave = hasChanges && feedbackOk && complete && !saving;

  const handleKeyDown = (e) => {
    // Esc discards — except while typing feedback, where it's too easy to hit.
    if (e.key === "Escape" && !saving && e.target?.tagName !== "TEXTAREA") {
      e.stopPropagation();
      onCancel();
    }
  };

  const handleSave = () => {
    if (!canSave) return;
    onSave(draft, feedback);
  };

  const setScore = (key, value) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const specials = specialCategoriesForRound(round);

  return (
    <div
      ref={rootRef}
      onKeyDown={handleKeyDown}
      role="group"
      aria-label={`Adjust ${roundLabel(round)} scores for ${team?.name || "this team"}`}
      style={{
        marginTop: 16,
        padding: "14px 16px 16px",
        background: "var(--surface-2, #F4F1E9)",
        border: "1px solid var(--line, #E7E1D4)",
        borderRadius: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "baseline",
        }}
      >
        <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>
          Adjust scores
        </p>
        <p
          style={{ margin: 0, fontSize: 12.5, color: "var(--muted, #5B6270)" }}
        >
          Nothing changes until you press <strong>Save changes</strong>.
        </p>
      </div>

      {JUDGING_CRITERIA.map((criterion) => (
        <div key={criterion.category} style={{ marginTop: 14 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <p className="ohx-eyebrow" style={{ fontSize: 10 }}>
              {criterion.name}
            </p>
            <span style={{ fontSize: 12, color: "var(--muted, #5B6270)" }}>
              {categoryTotal(criterion, draft)}/{criterion.maxPoints}
            </span>
          </div>
          {criterion.subCriteria.map((sub) => {
            const changed = changes.find((c) => c.key === sub.key);
            return (
              <div key={sub.key} style={rowStyle}>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}
                  >
                    {sub.name}
                    {changed && <WasTag from={changed.from} />}
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: "var(--muted, #5B6270)",
                      lineHeight: 1.4,
                    }}
                  >
                    {sub.description}
                  </div>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <ScoreScale
                    compact
                    label={sub.name}
                    value={draft[sub.key]}
                    onChange={(v) => setScore(sub.key, v)}
                    disabled={saving}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {specials.map((criterion) => (
        <div key={criterion.category} style={{ marginTop: 14 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <p className="ohx-eyebrow" style={{ fontSize: 10 }}>
              {criterion.name} · separate prize, not in total
            </p>
            <span style={{ fontSize: 12, color: "var(--muted, #5B6270)" }}>
              {categoryTotal(criterion, draft)}/{criterion.maxPoints}
            </span>
          </div>
          {criterion.subCriteria.map((sub) => {
            const changed = changes.find((c) => c.key === sub.key);
            return (
              <div key={sub.key} style={rowStyle}>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}
                  >
                    {sub.name}
                    {changed && <WasTag from={changed.from} />}
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: "var(--muted, #5B6270)",
                      lineHeight: 1.4,
                    }}
                  >
                    {sub.description}
                  </div>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <ScoreScale
                    compact
                    label={sub.name}
                    value={draft[sub.key]}
                    onChange={(v) => setScore(sub.key, v)}
                    disabled={saving}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* Feedback — kept so a re-submit never drops it; editable on demand. */}
      <div
        style={{
          marginTop: 16,
          borderTop: "1px solid var(--line, #E7E1D4)",
          paddingTop: 12,
        }}
      >
        {showFeedback ? (
          <>
            <label
              htmlFor={`adjust-feedback-${team?.id || "team"}`}
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              Feedback for the team
            </label>
            <textarea
              id={`adjust-feedback-${team?.id || "team"}`}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              disabled={saving}
              style={{
                width: "100%",
                boxSizing: "border-box",
                fontFamily: "inherit",
                fontSize: 14,
                lineHeight: 1.5,
                padding: "10px 12px",
                border: "1px solid var(--line, #E7E1D4)",
                borderRadius: 6,
                background: "var(--surface, #fff)",
                color: "var(--ink, #16181D)",
                resize: "vertical",
              }}
            />
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 12,
                color: feedbackOk
                  ? "var(--muted, #5B6270)"
                  : "var(--danger, #B04A36)",
              }}
            >
              {feedbackOk
                ? `${feedbackCharCount(feedback)} characters`
                : `${feedbackCharsRemaining(feedback)} more character${feedbackCharsRemaining(feedback) === 1 ? "" : "s"} needed (minimum ${FEEDBACK_MIN_CHARS})`}
            </p>
          </>
        ) : (
          <button
            type="button"
            className="ohx-link"
            onClick={() => setShowFeedback(true)}
            style={{
              background: "none",
              border: 0,
              padding: 0,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Edit feedback
          </button>
        )}
      </div>

      {error && (
        <p
          role="alert"
          style={{
            margin: "12px 0 0",
            fontSize: 13,
            color: "var(--danger, #B04A36)",
          }}
        >
          {error}
        </p>
      )}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginTop: 14,
        }}
      >
        <p
          style={{ margin: 0, fontSize: 13, color: "var(--muted, #5B6270)" }}
          aria-live="polite"
        >
          {!complete
            ? "Pick a score for every criterion before saving."
            : changes.length === 0 && !feedbackChanged
              ? "No changes yet."
              : changes.length === 0
                ? "Feedback edited."
                : `${changes.length} change${changes.length === 1 ? "" : "s"} · total ${beforeTotal} → ${afterTotal} of ${MAX_TOTAL}${feedbackChanged ? " · feedback edited" : ""}`}
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className="ohx-btn ohx-btn--ghost"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="ohx-btn ohx-btn--primary"
            onClick={handleSave}
            disabled={!canSave}
            aria-disabled={!canSave}
            style={
              !canSave ? { opacity: 0.5, cursor: "not-allowed" } : undefined
            }
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InlineScoreAdjuster;
