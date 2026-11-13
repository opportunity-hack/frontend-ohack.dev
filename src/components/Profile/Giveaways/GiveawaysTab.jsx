import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Box, Skeleton } from "@mui/material";
import { useAuthInfo } from "@propelauth/react";
import { Eyebrow } from "../../design/refined";
import PrizeOption, { prizeGridSx } from "./PrizeOption";
import useOpenGiveaways from "../../../hooks/use-open-giveaways";
import {
  formatGiveawayClose,
  giveawayErrorCode,
  giveawayErrorMessage,
  saveGiveawayEntry,
  sortedPrizes,
  withdrawGiveawayEntry,
} from "../../../lib/giveawayApi";
import { profileFields } from "../profileFields";
import { trackEvent, EventCategory } from "../../../lib/ga";

// Rendered only inside /profile's RefinedRoot (tab 5), so `.ohx-*` + CSS vars
// are safe here. PrizeOption is shared with the admin preview and carries its
// own fallbacks.

const track = (action, giveawayId, prizeCount) =>
  trackEvent({
    action,
    params: {
      event_category: EventCategory.ENGAGEMENT,
      event_label: giveawayId,
      value: prizeCount,
    },
  });

const isFilled = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value);
};

/** Profile fields the person can still fill (labels), for the nudge line. */
export function missingProfileFields(profile) {
  if (!profile) return [];
  return profileFields
    .filter((f) => !isFilled(profile[f.name]))
    .map((f) => f.label);
}

const sameSet = (a, b) => a.size === b.size && [...a].every((x) => b.has(x));

function EntryBreakdown({ breakdown, total, onOpenBasic, missing }) {
  const b = breakdown || {};
  const profileEntries = b.profile_entries ?? 0;
  const githubEntries = b.github_entries ?? 0;
  return (
    <div>
      <p className="ohx-eyebrow" style={{ margin: "0 0 6px" }}>Your entries</p>
      <p
        className="ohx-display"
        style={{ fontSize: 44, lineHeight: 1, margin: "0 0 8px", color: "var(--brand)" }}
      >
        {total}
      </p>
      <p style={{ margin: "0 0 6px" }}>
        {profileEntries} from your profile ({b.profile_fields ?? 0} of {b.profile_fields_total ?? profileFields.length}{" "}
        fields) · {githubEntries} from GitHub (max {b.github_cap ?? 45})
      </p>
      <p className="ohx-muted" style={{ margin: 0, fontSize: 15 }}>
        Your entries count in every prize drawing you join.
        {missing.length > 0 && (
          <>
            {" "}Still open on your profile: {missing.slice(0, 3).join(", ")}
            {missing.length > 3 ? ` and ${missing.length - 3} more` : ""}.{" "}
            {onOpenBasic ? (
              <button
                type="button"
                className="ohx-link"
                onClick={onOpenBasic}
                style={{ background: "none", border: 0, padding: 0, cursor: "pointer", font: "inherit" }}
              >
                Complete your profile
              </button>
            ) : (
              <a className="ohx-link" href="/profile#basic">Complete your profile</a>
            )}
          </>
        )}
      </p>
    </div>
  );
}

EntryBreakdown.propTypes = {
  breakdown: PropTypes.object,
  total: PropTypes.number,
  onOpenBasic: PropTypes.func,
  missing: PropTypes.arrayOf(PropTypes.string),
};

function StatusLine({ message }) {
  return (
    <p
      role="status"
      aria-live="polite"
      style={{
        minHeight: 24,
        margin: "12px 0 0",
        fontSize: 15,
        color: message?.kind === "error" ? "var(--danger)" : "var(--success)",
      }}
    >
      {message?.text || ""}
    </p>
  );
}

StatusLine.propTypes = { message: PropTypes.object };

export function GiveawayCard({ giveaway, weight, onSaved, onWithdrawn, onOpenBasic, missing }) {
  const { accessToken } = useAuthInfo();
  const prizes = useMemo(() => sortedPrizes(giveaway), [giveaway]);
  const entry = giveaway.my_entry;
  const entered = Boolean(entry);
  const accepting = Boolean(giveaway.accepting_entries);

  const [allPrizes, setAllPrizes] = useState(entry ? Boolean(entry.all_prizes) : false);
  const [picked, setPicked] = useState(() => new Set(entry?.prize_ids || []));
  const [saving, setSaving] = useState(false);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const [message, setMessage] = useState(null);
  const [githubUnavailable, setGithubUnavailable] = useState(Boolean(weight?.github_unavailable));

  const hasPrizes = prizes.length > 0;
  const savedPicked = useMemo(() => new Set(entry?.prize_ids || []), [entry]);
  const changed =
    entered &&
    (Boolean(entry.all_prizes) !== allPrizes || (!allPrizes && !sameSet(savedPicked, picked)));
  const weightDiffers = entered && weight && weight.entries !== entry.entries;
  const somethingPicked = !hasPrizes || allPrizes || picked.size > 0;
  const prizeCount = !hasPrizes ? 0 : allPrizes ? prizes.length : picked.size;
  const enteredCount = !entered ? 0 : entry.all_prizes ? prizes.length : (entry.prize_ids || []).length;

  const total = entered ? entry.entries : weight?.entries ?? 0;
  const breakdown = entered ? entry.breakdown : weight?.breakdown;

  const togglePrize = (id, on) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);
    const body = hasPrizes
      ? { all_prizes: allPrizes, prize_ids: allPrizes ? [] : prizes.map((p) => p.id).filter((id) => picked.has(id)) }
      : { all_prizes: true, prize_ids: [] };
    try {
      const res = await saveGiveawayEntry(giveaway.id, body, { token: accessToken });
      const saved = res?.entry;
      setGithubUnavailable(Boolean(saved?.github_unavailable));
      onSaved(giveaway.id, saved);
      track(entered ? "giveaway_update" : "giveaway_enter", giveaway.id, prizeCount);
      setMessage({
        kind: "ok",
        text: entered ? "Saved. Your picks are updated." : "You're in! Good luck.",
      });
    } catch (err) {
      setMessage({
        kind: "error",
        text:
          giveawayErrorCode(err) === "giveaway_closed"
            ? "Entries just closed for this giveaway."
            : giveawayErrorMessage(err, "We couldn't save your entry. Please try again."),
      });
    } finally {
      setSaving(false);
    }
  };

  const withdraw = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await withdrawGiveawayEntry(giveaway.id, { token: accessToken });
      track("giveaway_withdraw", giveaway.id, enteredCount);
      setConfirmWithdraw(false);
      setAllPrizes(false);
      setPicked(new Set());
      onWithdrawn(giveaway.id);
      setMessage({ kind: "ok", text: "You've withdrawn. You can enter again until entries close." });
    } catch (err) {
      setMessage({ kind: "error", text: giveawayErrorMessage(err, "We couldn't withdraw your entry. Please try again.") });
    } finally {
      setSaving(false);
    }
  };

  const closesLabel = formatGiveawayClose(giveaway.closes_at);
  const readOnly = !accepting;

  let buttonLabel = "Enter giveaway";
  if (entered) buttonLabel = changed ? "Update my picks" : "Refresh my entries";

  return (
    <article className="ohx-card" style={{ padding: 24, marginBottom: 24 }}>
      <Eyebrow style={{ margin: "0 0 6px" }}>{giveaway.event_id ? "Event giveaway" : "Giveaway"}</Eyebrow>
      <h3 className="ohx-display" style={{ fontSize: "clamp(1.4rem,2.4vw,1.8rem)", margin: "0 0 6px" }}>
        {giveaway.title}
      </h3>
      {giveaway.description && <p style={{ margin: "0 0 6px" }}>{giveaway.description}</p>}
      {(closesLabel || giveaway.must_be_present) && accepting && (
        <p className="ohx-muted" style={{ margin: "0 0 20px", fontSize: 15 }}>
          {closesLabel ? `Entries close ${closesLabel}.` : ""}
          {closesLabel && giveaway.must_be_present ? " " : ""}
          {giveaway.must_be_present
            ? "Winners are drawn live at the closing ceremony, so plan to be there."
            : ""}
        </p>
      )}

      {giveaway.status === "drawn" ? (
        giveaway.my_win ? (
          <div
            className="ohx-card"
            style={{ padding: 20, borderColor: "var(--accent)", borderWidth: 2, marginTop: 12 }}
          >
            <p className="ohx-eyebrow" style={{ margin: "0 0 6px" }}>You won</p>
            <p className="ohx-display" style={{ fontSize: 26, margin: 0 }}>{giveaway.my_win.name}</p>
            <p className="ohx-muted" style={{ margin: "8px 0 0" }}>
              Congratulations! An organizer will be in touch about getting it to you.
            </p>
          </div>
        ) : (
          <p style={{ marginTop: 12 }}>Thanks for entering — this one's finished.</p>
        )
      ) : (
        <>
          <div style={{ padding: "16px 0", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
            <EntryBreakdown
              breakdown={breakdown}
              total={total}
              onOpenBasic={accepting ? onOpenBasic : undefined}
              missing={accepting ? missing : []}
            />
            {accepting && weightDiffers && (
              <p style={{ margin: "10px 0 0", fontSize: 15 }}>
                Your profile now earns {weight.entries} entries. Save again to use them.
              </p>
            )}
            {accepting && githubUnavailable && (
              <p className="ohx-muted" style={{ margin: "10px 0 0", fontSize: 15 }}>
                We couldn't reach GitHub just now, so those entries may be low. Save again later to refresh.
              </p>
            )}
          </div>

          {readOnly && (
            <p style={{ margin: "16px 0 0" }}>
              {entered
                ? "Entries are closed. Winners are drawn at the closing ceremony."
                : "Entries are closed."}
            </p>
          )}

          {hasPrizes && (
            <section aria-label="Pick your prizes" style={{ marginTop: 20 }}>
              <h4 className="ohx-display" style={{ fontSize: 20, margin: "0 0 10px" }}>
                {readOnly ? "Your picks" : "Pick your prizes"}
              </h4>
              {!readOnly && (
                <label style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 14, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={allPrizes}
                    onChange={(e) => setAllPrizes(e.target.checked)}
                    style={{ width: 18, height: 18, marginTop: 3, accentColor: "var(--brand)" }}
                  />
                  <span>
                    Enter me for everything
                    <span className="ohx-muted" style={{ display: "block", fontSize: 14 }}>
                      Includes anything we add later.
                    </span>
                  </span>
                </label>
              )}
              <Box sx={prizeGridSx}>
                {prizes.map((prize) => (
                  <PrizeOption
                    key={prize.id}
                    prize={prize}
                    name={`prize-${giveaway.id}`}
                    checked={allPrizes || picked.has(prize.id)}
                    disabled={readOnly || allPrizes || saving}
                    onChange={(on) => togglePrize(prize.id, on)}
                  />
                ))}
              </Box>
            </section>
          )}

          {!readOnly && (
            <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
              {entered && !changed && !weightDiffers ? (
                <p style={{ margin: 0, fontWeight: 600 }}>
                  {hasPrizes
                    ? `You're in for ${enteredCount} of ${prizes.length} prize${prizes.length === 1 ? "" : "s"}.`
                    : "You're in."}
                </p>
              ) : (
                <button
                  type="button"
                  className="ohx-btn ohx-btn--primary"
                  onClick={save}
                  disabled={saving || !somethingPicked}
                >
                  {saving ? "Saving…" : buttonLabel}
                </button>
              )}
              {entered &&
                (confirmWithdraw ? (
                  <span style={{ display: "inline-flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                    <span>Withdraw? You can enter again until entries close.</span>
                    <button type="button" className="ohx-btn ohx-btn--ghost" onClick={withdraw} disabled={saving}>
                      Yes, withdraw
                    </button>
                    <button
                      type="button"
                      className="ohx-link"
                      onClick={() => setConfirmWithdraw(false)}
                      style={{ background: "none", border: 0, cursor: "pointer", font: "inherit" }}
                    >
                      Keep my entry
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    className="ohx-link"
                    onClick={() => setConfirmWithdraw(true)}
                    style={{ background: "none", border: 0, padding: 0, cursor: "pointer", font: "inherit", fontSize: 15 }}
                  >
                    Withdraw from this giveaway
                  </button>
                ))}
            </div>
          )}
          {!readOnly && hasPrizes && !somethingPicked && !entered && (
            <p className="ohx-muted" style={{ margin: "8px 0 0", fontSize: 14 }}>
              Pick at least one prize, or enter for everything.
            </p>
          )}
          <StatusLine message={message} />
        </>
      )}
    </article>
  );
}

GiveawayCard.propTypes = {
  giveaway: PropTypes.object.isRequired,
  weight: PropTypes.object,
  onSaved: PropTypes.func.isRequired,
  onWithdrawn: PropTypes.func.isRequired,
  onOpenBasic: PropTypes.func,
  missing: PropTypes.arrayOf(PropTypes.string),
};

function QuietCard({ children }) {
  return (
    <div className="ohx-card" style={{ padding: 24, marginBottom: 24 }}>
      {children}
    </div>
  );
}

QuietCard.propTypes = { children: PropTypes.node };

export default function GiveawaysTab({ profile, onOpenBasic }) {
  const { status, data, reload, setData } = useOpenGiveaways();
  const missing = useMemo(() => missingProfileFields(profile), [profile]);

  if (status === "loading" || status === "idle" || (status === "ready" && !data)) {
    return (
      <div style={{ minHeight: 320, marginBottom: 24 }} aria-busy="true">
        <Skeleton variant="rectangular" height={320} sx={{ borderRadius: "12px" }} />
      </div>
    );
  }
  if (status === "logged_out") {
    return <QuietCard><p style={{ margin: 0 }}>Log in to see giveaways.</p></QuietCard>;
  }
  if (status === "error") {
    return (
      <QuietCard>
        <p style={{ margin: "0 0 12px" }}>We couldn't load giveaways just now.</p>
        <button type="button" className="ohx-btn ohx-btn--ghost" onClick={reload}>
          Retry
        </button>
      </QuietCard>
    );
  }
  if (data.unavailable) {
    return <QuietCard><p style={{ margin: 0 }}>Giveaways aren't available right now.</p></QuietCard>;
  }

  const giveaways = data.giveaways || [];
  const updateEntry = (giveawayId, entry) =>
    setData((prev) => ({
      ...prev,
      giveaways: (prev?.giveaways || []).map((g) => (g.id === giveawayId ? { ...g, my_entry: entry } : g)),
      my_weight: entry
        ? { entries: entry.entries, breakdown: entry.breakdown, github_unavailable: Boolean(entry.github_unavailable) }
        : prev?.my_weight,
    }));

  if (giveaways.length === 0) {
    return (
      <QuietCard>
        <p style={{ margin: 0 }}>No giveaway is open right now. We'll announce the next one in Slack.</p>
      </QuietCard>
    );
  }

  return (
    <div>
      {giveaways.map((g) => (
        <GiveawayCard
          key={g.id}
          giveaway={g}
          weight={data.my_weight}
          onSaved={updateEntry}
          onWithdrawn={(id) => updateEntry(id, null)}
          onOpenBasic={onOpenBasic}
          missing={missing}
        />
      ))}
    </div>
  );
}

GiveawaysTab.propTypes = {
  profile: PropTypes.object,
  onOpenBasic: PropTypes.func,
};
