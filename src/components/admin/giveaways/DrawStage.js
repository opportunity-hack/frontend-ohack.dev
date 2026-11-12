import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import PropTypes from "prop-types";
import dynamic from "next/dynamic";
import { Box, Dialog } from "@mui/material";
import { keyframes } from "@mui/material/styles";
import { useAuthInfo } from "@propelauth/react";
import { FONT_BODY, FONT_DISPLAY } from "../../../styles/fonts";
import { stillInAfter, AVATAR_ONLY_OVER } from "../../../lib/giveawayDraw";
import {
  giveawayErrorMessage,
  recordGiveawayResult,
  sortedPrizes,
  undoGiveawayResult,
} from "../../../lib/giveawayApi";
import { trackEvent, EventCategory } from "../../../lib/ga";
import ExportCsvButton from "../ExportCsvButton";
import { PrizeImage } from "../../Profile/Giveaways/PrizeOption";
import {
  currentBeat,
  currentWinner,
  drawReducer,
  initDrawState,
  isWaitingBeat,
} from "./drawMachine";

const Confetti = dynamic(() => import("react-confetti"), { ssr: false, loading: () => null });

// The stage is a Portal (MUI Dialog), so RefinedRoot classes and CSS vars
// don't reach it: literal colors only. Built for a projector — nothing under
// 20px, high contrast, one accent, no gradients.
const NAVY = "#12284C";
const NAVY_2 = "#1B3A6B";
const PAPER = "#FBFAF6";
const SOFT = "rgba(251,250,246,0.74)";
const LINE = "rgba(251,250,246,0.2)";
const ACCENT = "#E2552E";

const pop = keyframes`
  from { opacity: 0; transform: scale(0.6); }
  to { opacity: 1; transform: scale(1); }
`;
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: none; }
`;

const firstName = (entry) => (entry?.user?.name || entry?.user?.nickname || "Someone").trim().split(/\s+/)[0];
const fullName = (entry) => entry?.user?.name || entry?.user?.nickname || "Someone";

const track = (action, giveawayId, extra = {}) =>
  trackEvent({
    action,
    params: { event_category: EventCategory.ADMIN, event_label: giveawayId, ...extra },
  });

function PersonAvatar({ entry, size }) {
  const [failed, setFailed] = useState(false);
  const src = entry?.user?.profile_image;
  const style = {
    width: size,
    height: size,
    borderRadius: "50%",
    flexShrink: 0,
    objectFit: "cover",
    background: NAVY_2,
    border: `2px solid ${LINE}`,
  };
  if (src && !failed) {
    return <img src={src} alt="" width={size} height={size} style={style} onError={() => setFailed(true)} />;
  }
  return (
    <span
      aria-hidden="true"
      style={{
        ...style,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_DISPLAY,
        fontSize: Math.max(20, size * 0.42),
        color: PAPER,
      }}
    >
      {firstName(entry).charAt(0).toUpperCase()}
    </span>
  );
}

PersonAvatar.propTypes = { entry: PropTypes.object, size: PropTypes.number.isRequired };

const btn = (primary) => ({
  fontFamily: FONT_BODY,
  fontSize: 22,
  fontWeight: 600,
  padding: "14px 26px",
  borderRadius: 10,
  cursor: "pointer",
  border: primary ? `2px solid ${PAPER}` : `2px solid ${LINE}`,
  background: primary ? PAPER : "transparent",
  color: primary ? NAVY : PAPER,
});

function Kbd({ children }) {
  return (
    <span style={{ fontSize: 20, opacity: 0.7, marginLeft: 10, fontWeight: 400 }}>({children})</span>
  );
}

Kbd.propTypes = { children: PropTypes.node };

function PrizeHeadline({ prize, slot, attempt, eyebrow }) {
  const quantity = Number(prize?.quantity) || 1;
  return (
    <div>
      <p style={{ margin: "0 0 8px", fontSize: 22, letterSpacing: "0.08em", textTransform: "uppercase", color: SOFT }}>
        {eyebrow}
        {quantity > 1 ? ` · ${slot + 1} of ${quantity}` : ""}
        {attempt > 0 ? ` · redraw ${attempt}` : ""}
      </p>
      <h2 style={{ margin: 0, color: PAPER, fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: "clamp(40px, 5vw, 76px)", lineHeight: 1.05 }}>
        {prize?.name}
      </h2>
    </div>
  );
}

PrizeHeadline.propTypes = {
  prize: PropTypes.object,
  slot: PropTypes.number,
  attempt: PropTypes.number,
  eyebrow: PropTypes.string,
};

function TileWall({ script, beatIndex, byId, animateIn, reducedMotion }) {
  const before = beatIndex > 0 ? stillInAfter(script, beatIndex - 1) : new Set(script.ids);
  const now = stillInAfter(script, beatIndex);
  const tiles = useMemo(() => [...script.tileIds].sort(), [script]);
  const avatarOnly = script.total > AVATAR_ONLY_OVER;
  const size = avatarOnly ? 44 : 56;
  const visible = tiles.filter((id) => before.has(id));
  const hiddenStill = Math.max(0, now.size - script.tileIds.length);
  const step = visible.length ? Math.min(1500 / visible.length, 40) : 0;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: avatarOnly ? 8 : 14, alignContent: "flex-start" }}>
      {visible.map((id, i) => {
        const leaving = !now.has(id);
        return (
          <Box
            key={id}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
              width: avatarOnly ? size : 96,
              transition: reducedMotion ? "none" : "opacity 700ms ease, transform 700ms ease",
              opacity: leaving ? 0.12 : 1,
              transform: leaving ? "scale(0.7)" : "none",
              animation: animateIn && !reducedMotion ? `${pop} 380ms ease both` : "none",
              animationDelay: animateIn ? `${Math.round(i * step)}ms` : undefined,
            }}
          >
            <PersonAvatar entry={byId[id]} size={size} />
            {!avatarOnly && (
              <span style={{ fontSize: 20, maxWidth: 96, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {firstName(byId[id])}
              </span>
            )}
          </Box>
        );
      })}
      {hiddenStill > 0 && (
        <div
          style={{
            alignSelf: "center",
            fontSize: 24,
            padding: "8px 16px",
            border: `1px solid ${LINE}`,
            borderRadius: 999,
            color: SOFT,
          }}
        >
          +{hiddenStill} more
        </div>
      )}
    </div>
  );
}

TileWall.propTypes = {
  script: PropTypes.object.isRequired,
  beatIndex: PropTypes.number.isRequired,
  byId: PropTypes.object.isRequired,
  animateIn: PropTypes.bool,
  reducedMotion: PropTypes.bool,
};

function FinalCards({ script, beatIndex, byId, reducedMotion }) {
  const before = beatIndex > 0 ? stillInAfter(script, beatIndex - 1) : stillInAfter(script, beatIndex);
  const now = stillInAfter(script, beatIndex);
  // Cards in a stable, non-revealing order (by user id), never by rank.
  const ids = [...before].sort();
  const few = ids.length <= 3;
  return (
    <div
      style={{
        display: "grid",
        gap: 18,
        gridTemplateColumns: few ? `repeat(${ids.length}, minmax(0, 1fr))` : "repeat(auto-fill, minmax(220px, 1fr))",
      }}
    >
      {ids.map((id) => {
        const leaving = !now.has(id);
        return (
          <Box
            key={id}
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: few ? "column" : "row",
              gap: "16px",
              padding: few ? "32px 20px" : "16px 18px",
              borderRadius: "14px",
              background: NAVY_2,
              border: `1px solid ${LINE}`,
              textAlign: few ? "center" : "left",
              transition: reducedMotion ? "none" : "opacity 600ms ease, transform 600ms ease",
              opacity: leaving ? 0.12 : 1,
              transform: leaving ? "scale(0.92)" : "none",
              animation: reducedMotion ? "none" : `${fadeIn} 400ms ease both`,
            }}
          >
            <PersonAvatar entry={byId[id]} size={few ? 120 : 56} />
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: few ? 40 : 26, lineHeight: 1.15 }}>
              {fullName(byId[id])}
            </span>
          </Box>
        );
      })}
    </div>
  );
}

FinalCards.propTypes = {
  script: PropTypes.object.isRequired,
  beatIndex: PropTypes.number.isRequired,
  byId: PropTypes.object.isRequired,
  reducedMotion: PropTypes.bool,
};

function WinnerCard({ entry, prize, reducedMotion }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "48px",
        flexWrap: "wrap",
        animation: reducedMotion ? `${fadeIn} 600ms ease both` : `${pop} 700ms cubic-bezier(.2,1.4,.4,1) both`,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <PersonAvatar entry={entry} size={220} />
        <p style={{ margin: "20px 0 0", fontFamily: FONT_DISPLAY, fontSize: "clamp(48px, 6vw, 88px)", lineHeight: 1 }}>
          {fullName(entry)}
        </p>
        <p style={{ margin: "14px 0 0", fontSize: 26, color: ACCENT, fontWeight: 600 }}>wins</p>
      </div>
      <div style={{ width: 260, maxWidth: "70vw", textAlign: "center" }}>
        <PrizeImage prize={prize} size={260} />
        <p style={{ margin: "12px 0 0", fontSize: 28, fontFamily: FONT_DISPLAY }}>{prize?.name}</p>
      </div>
    </Box>
  );
}

WinnerCard.propTypes = { entry: PropTypes.object, prize: PropTypes.object, reducedMotion: PropTypes.bool };

function WinnersRail({ order, prizesById, results, byId, current, onArrived, busyId }) {
  const won = results.filter((r) => r.outcome === "won");
  const absent = results.filter((r) => r.outcome === "absent");
  return (
    <aside
      aria-label="Winners"
      style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 0, overflowY: "auto", paddingRight: 4 }}
    >
      <p style={{ margin: "0 0 4px", fontSize: 20, letterSpacing: "0.08em", textTransform: "uppercase", color: SOFT }}>
        Winners
      </p>
      {order.map((prizeId) => {
        const prize = prizesById[prizeId];
        if (!prize) return null;
        const quantity = Number(prize.quantity) || 1;
        const winners = won
          .filter((x) => x.prize_id === prizeId)
          .sort((a, b) => Number(a.slot) - Number(b.slot));
        const isCurrent = current && current.prizeId === prizeId;
        const left = quantity - winners.length;
        let status = "up next";
        if (left === 0) status = null;
        else if (isCurrent) status = quantity > 1 ? `drawing now · ${current.slot + 1} of ${quantity}` : "drawing now";
        else if (quantity > 1) status = `${left} to draw`;
        return (
          <div
            key={prizeId}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: `1px solid ${isCurrent ? ACCENT : LINE}`,
              background: isCurrent ? "rgba(226,85,46,0.12)" : "transparent",
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {prize.name}
              {quantity > 1 ? ` ×${quantity}` : ""}
            </div>
            {winners.map((r) => {
              const person = byId[r.user_id] || { user: { name: r.name, profile_image: r.profile_image } };
              return (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                  <PersonAvatar entry={person} size={36} />
                  <span style={{ fontSize: 20, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {fullName(person)}
                  </span>
                </div>
              );
            })}
            {status && <div style={{ fontSize: 20, color: SOFT, marginTop: winners.length ? 6 : 2 }}>{status}</div>}
          </div>
        );
      })}
      {absent.length > 0 && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${LINE}` }}>
          <p style={{ margin: "0 0 8px", fontSize: 20, color: SOFT }}>Not here ({absent.length})</p>
          {absent.map((r) => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 20, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
                {r.name || fullName(byId[r.user_id])}
              </span>
              <button
                type="button"
                onClick={() => onArrived(r.id)}
                disabled={busyId === r.id}
                style={{ ...btn(false), fontSize: 20, padding: "6px 12px" }}
              >
                {busyId === r.id ? "…" : "They've arrived"}
              </button>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}

WinnersRail.propTypes = {
  order: PropTypes.arrayOf(PropTypes.string).isRequired,
  prizesById: PropTypes.object.isRequired,
  results: PropTypes.array.isRequired,
  byId: PropTypes.object.isRequired,
  current: PropTypes.object,
  onArrived: PropTypes.func.isRequired,
  busyId: PropTypes.string,
};

/** Winner rows for the finale board + CSV. */
export function winnerRows(order, prizesById, results, byId) {
  const rows = [];
  for (const prizeId of order) {
    const prize = prizesById[prizeId];
    if (!prize) continue;
    const quantity = Number(prize.quantity) || 1;
    for (let slot = 0; slot < quantity; slot += 1) {
      const r = results.find((x) => x.outcome === "won" && x.prize_id === prizeId && Number(x.slot) === slot);
      const entry = r ? byId[r.user_id] : null;
      rows.push({
        prize: quantity > 1 ? `${prize.name} (${slot + 1} of ${quantity})` : prize.name,
        prize_id: prizeId,
        slot,
        winner: r ? r.name || fullName(entry) : "",
        email: entry?.user?.email || "",
        profile: r ? `https://www.ohack.dev/profile/${r.user_id}` : "",
        user_id: r?.user_id || "",
        profile_image: r?.profile_image || entry?.user?.profile_image || "",
        image_url: prize.image_url || "",
      });
    }
  }
  return rows;
}

const WINNER_CSV_COLUMNS = [
  { key: "prize", label: "Prize" },
  { key: "winner", label: "Winner" },
  { key: "email", label: "Email" },
  { key: "profile", label: "Profile" },
];

function Finale({ rows, absent, giveawayId, onClose }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, minHeight: 0 }}>
      <h2 style={{ margin: 0, color: PAPER, fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: "clamp(44px, 5vw, 72px)" }}>
        Winners
      </h2>
      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", overflowY: "auto" }}>
        {rows.map((row) => (
          <div
            key={`${row.prize_id}-${row.slot}`}
            style={{ display: "flex", gap: 16, alignItems: "center", padding: 16, borderRadius: 14, background: NAVY_2, border: `1px solid ${LINE}` }}
          >
            <div style={{ width: 84, flexShrink: 0 }}>
              <PrizeImage prize={{ name: row.prize, image_url: row.image_url }} size={84} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 20, color: SOFT }}>{row.prize}</div>
              <div style={{ fontSize: 28, fontFamily: FONT_DISPLAY }}>{row.winner || "Not awarded"}</div>
            </div>
          </div>
        ))}
      </div>
      {absent.length > 0 && (
        <p style={{ margin: 0, fontSize: 20, color: SOFT }}>
          Not here: {absent.map((r) => r.name).filter(Boolean).join(", ")}
        </p>
      )}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <ExportCsvButton
          rows={rows.filter((r) => r.winner)}
          columns={WINNER_CSV_COLUMNS}
          filenameParts={["giveaway-winners", giveawayId]}
          table="giveaway_winners"
          label="Export CSV"
          variant="contained"
          sx={{ ...btn(true), textTransform: "none", "&:hover": { background: "#FFFFFF" } }}
        />
        <button type="button" style={btn(false)} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

Finale.propTypes = {
  rows: PropTypes.array.isRequired,
  absent: PropTypes.array.isRequired,
  giveawayId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The full-screen draw. Mounted only while open (DrawTab), so closing it
 * clears every timer and all local state; results live on the server, so
 * reopening resumes at the next unsettled prize slot.
 */
export default function DrawStage({ giveaway, entries, drawOrder, orgId, onUpdated, onClose }) {
  const { accessToken } = useAuthInfo();
  const tokenRef = useRef(accessToken);
  tokenRef.current = accessToken;

  const prizes = useMemo(() => sortedPrizes(giveaway), [giveaway]);
  const prizesById = useMemo(() => Object.fromEntries(prizes.map((p) => [p.id, p])), [prizes]);
  const byId = useMemo(() => Object.fromEntries((entries || []).map((e) => [e.user_id, e])), [entries]);
  const order = useMemo(
    () => [...(drawOrder || []).filter((id) => prizesById[id]), ...prizes.map((p) => p.id).filter((id) => !(drawOrder || []).includes(id))],
    [drawOrder, prizes, prizesById],
  );

  const [state, dispatch] = useReducer(drawReducer, null, () =>
    initDrawState({
      entries,
      seed: giveaway.draw?.seed,
      prizes,
      drawOrder: order,
      results: giveaway.draw?.results || [],
      reducedMotion: prefersReducedMotion(),
    }),
  );
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [arrivingId, setArrivingId] = useState(null);
  const [railError, setRailError] = useState("");

  const beat = currentBeat(state);
  const prize = state.current ? prizesById[state.current.prizeId] : null;
  const winner = currentWinner(state);
  const opts = useCallback(() => ({ token: tokenRef.current, orgId }), [orgId]);

  // ONE timer, keyed on the beat on screen. Waiting beats have no timer.
  useEffect(() => {
    if (state.phase !== "stage" || state.saving || !beat || isWaitingBeat(beat) || !beat.ms) return undefined;
    const t = setTimeout(() => dispatch({ type: "ADVANCE" }), beat.ms);
    return () => clearTimeout(t);
  }, [state.phase, state.saving, state.index, state.current, state.beat, beat]);

  const record = useCallback(
    async (outcome) => {
      if (state.saving || !state.current || !winner || beat?.type !== "check") return;
      dispatch({ type: "SAVE_START" });
      try {
        const res = await recordGiveawayResult(
          giveaway.id,
          {
            prize_id: state.current.prizeId,
            slot: state.current.slot,
            user_id: winner.user_id,
            outcome,
            attempt: state.current.attempt,
          },
          opts(),
        );
        const updated = res?.giveaway;
        if (updated) onUpdated(updated);
        const results = updated?.draw?.results || [...state.results, res?.result].filter(Boolean);
        if (outcome === "won") {
          track("admin_giveaway_winner_confirmed", giveaway.id, { value: state.current.attempt });
          dispatch({ type: "WON_SAVED", results });
        } else {
          track("admin_giveaway_redraw", giveaway.id, { value: state.current.attempt + 1 });
          dispatch({ type: "ABSENT_SAVED", results });
        }
      } catch (err) {
        dispatch({ type: "SAVE_FAILED", message: giveawayErrorMessage(err, "Couldn't save that. Check the connection and try again.") });
      }
    },
    [state, winner, beat, giveaway.id, opts, onUpdated],
  );

  const arrived = useCallback(
    async (resultId) => {
      setArrivingId(resultId);
      setRailError("");
      try {
        const updated = await undoGiveawayResult(giveaway.id, resultId, opts());
        onUpdated(updated);
        dispatch({ type: "RESULTS_UPDATED", results: updated?.draw?.results || [] });
      } catch (err) {
        setRailError(giveawayErrorMessage(err, "Couldn't bring them back. Try again."));
      } finally {
        setArrivingId(null);
      }
    },
    [giveaway.id, opts, onUpdated],
  );

  // Finale: mark the giveaway drawn once (covers skipped slots too).
  const finishedRef = useRef(false);
  useEffect(() => {
    if (state.phase !== "finale" || finishedRef.current) return;
    finishedRef.current = true;
    if (giveaway.status === "drawn") return;
    recordGiveawayResult(giveaway.id, { finish: true }, opts())
      .then((res) => {
        if (res?.giveaway) onUpdated(res.giveaway);
        track("admin_giveaway_draw_finish", giveaway.id, {
          value: (res?.giveaway?.draw?.results || state.results).filter((r) => r.outcome === "won").length,
        });
      })
      .catch(() => {
        finishedRef.current = false;
      });
  }, [state.phase, state.results, giveaway.id, giveaway.status, opts, onUpdated]);

  const requestClose = useCallback(() => {
    const unrecorded = state.phase === "stage" && (beat?.type === "check" || beat?.type === "winner");
    if (unrecorded && !confirmLeave) setConfirmLeave(true);
    else onClose();
  }, [state.phase, beat, confirmLeave, onClose]);

  // Keyboard: Space continue · Enter they're here · N not here · S skip to the
  // final three · Esc leave. Capture phase + preventDefault so a focused
  // button never also fires.
  const keyRef = useRef(null);
  keyRef.current = (e) => {
    const key = e.key;
    if (key === "Escape") {
      e.preventDefault();
      if (confirmLeave) setConfirmLeave(false);
      else requestClose();
      return;
    }
    if (confirmLeave) return;
    if (key === " " || key === "Spacebar") {
      e.preventDefault();
      if (state.phase === "next" || isWaitingBeat(beat)) dispatch({ type: "ADVANCE" });
    } else if (key === "Enter") {
      e.preventDefault();
      if (beat?.type === "check") record("won");
    } else if (key === "n" || key === "N") {
      if (beat?.type === "check") {
        e.preventDefault();
        record("absent");
      }
    } else if (key === "s" || key === "S") {
      e.preventDefault();
      dispatch({ type: "SKIP_TO_FINAL" });
    }
  };
  useEffect(() => {
    const handler = (e) => keyRef.current?.(e);
    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, []);

  const results = state.results;
  const absent = results.filter((r) => r.outcome === "absent");
  const script = state.current?.script;

  let main;
  if (state.phase === "finale") {
    main = (
      <Finale
        rows={winnerRows(order, prizesById, results, byId)}
        absent={absent}
        giveawayId={giveaway.id}
        onClose={onClose}
      />
    );
  } else if (state.phase === "next") {
    const nextSlot = state.queue[state.index + 1];
    const nextPrize = nextSlot ? prizesById[nextSlot.prizeId] : null;
    main = (
      <div style={{ display: "flex", flexDirection: "column", gap: 28, justifyContent: "center", flex: 1 }}>
        <p style={{ margin: 0, fontSize: 26, color: SOFT }}>
          {fullName(byId[results.filter((r) => r.outcome === "won").slice(-1)[0]?.user_id])} is recorded. Next prize:
        </p>
        <PrizeHeadline prize={nextPrize} slot={nextSlot?.slot || 0} attempt={0} eyebrow="Up next" />
        <div>
          <button type="button" style={btn(true)} onClick={() => dispatch({ type: "ADVANCE" })}>
            Continue <Kbd>Space</Kbd>
          </button>
        </div>
      </div>
    );
  } else if (state.current && beat) {
    const headline = (
      <PrizeHeadline
        prize={prize}
        slot={state.current.slot}
        attempt={state.current.attempt}
        eyebrow={state.current.redraw ? "Drawing again" : "Now drawing"}
      />
    );
    let body = null;
    if (beat.type === "prize") {
      body = (
        <Box sx={{ display: "flex", gap: "40px", alignItems: "center", flexWrap: "wrap", animation: `${fadeIn} 500ms ease both` }}>
          <div style={{ width: "min(38vh, 360px)" }}>
            <PrizeImage prize={prize} size={360} />
          </div>
          <div style={{ maxWidth: 560 }}>
            {prize?.description && <p style={{ margin: "0 0 18px", fontSize: 24, color: SOFT }}>{prize.description}</p>}
            <p style={{ margin: 0, fontSize: 28 }}>
              {script.total.toLocaleString()} {script.total === 1 ? "person" : "people"} in the running ·{" "}
              {state.current.totalEntries.toLocaleString()} entries
            </p>
          </div>
        </Box>
      );
    } else if (beat.type === "seed") {
      body = (
        <Box sx={{ animation: `${fadeIn} 500ms ease both` }}>
          <p style={{ margin: 0, fontSize: 28, color: SOFT }}>Seed</p>
          <p style={{ margin: "4px 0 12px", fontFamily: FONT_DISPLAY, fontSize: "clamp(64px, 8vw, 120px)", letterSpacing: "0.06em" }}>
            {state.seed}
          </p>
          <p style={{ margin: 0, fontSize: 24, color: SOFT }}>Same seed, same result — anyone can re-run it.</p>
        </Box>
      );
    } else if (beat.type === "everyone" || beat.type === "wave") {
      body = (
        <div style={{ display: "flex", flexDirection: "column", gap: 18, minHeight: 0 }}>
          <p style={{ margin: 0, fontSize: 30 }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: 56, color: ACCENT }}>{beat.remaining.toLocaleString()}</span>{" "}
            still in
          </p>
          <div style={{ overflow: "hidden", minHeight: 0 }}>
            <TileWall
              script={script}
              beatIndex={state.beat}
              byId={byId}
              animateIn={beat.type === "everyone"}
              reducedMotion={state.reducedMotion}
            />
          </div>
        </div>
      );
    } else if (["finalists", "leave", "final3", "final2"].includes(beat.type)) {
      body = (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <p style={{ margin: 0, fontSize: 30 }}>
            {beat.type === "final2"
              ? "The final two"
              : beat.type === "final3"
                ? "The final three"
                : `${beat.remaining} still in`}
          </p>
          <FinalCards script={script} beatIndex={state.beat} byId={byId} reducedMotion={state.reducedMotion} />
        </div>
      );
    } else if (beat.type === "winner" || beat.type === "check") {
      body = (
        <>
          {beat.type === "winner" && !state.reducedMotion && (
            <Confetti recycle={false} numberOfPieces={500} colors={[ACCENT, PAPER, "#F2B705", "#7FB3D5"]} />
          )}
          <WinnerCard entry={winner} prize={prize} reducedMotion={state.reducedMotion} />
        </>
      );
    } else if (beat.type === "empty") {
      body = (
        <div>
          <p style={{ margin: "0 0 24px", fontSize: 32 }}>No one left in the running for {prize?.name}.</p>
          <button type="button" style={btn(true)} onClick={() => dispatch({ type: "SKIP_PRIZE" })}>
            Skip prize
          </button>
        </div>
      );
    }

    main = (
      <div style={{ display: "flex", flexDirection: "column", gap: 28, flex: 1, minHeight: 0 }}>
        {beat.type !== "winner" && beat.type !== "check" && headline}
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>{body}</div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", minHeight: 64 }}>
          {beat.type === "check" ? (
            <>
              <button type="button" style={btn(true)} onClick={() => record("won")} disabled={state.saving}>
                {state.saving ? "Saving…" : "They're here"} <Kbd>Enter</Kbd>
              </button>
              <button type="button" style={btn(false)} onClick={() => record("absent")} disabled={state.saving}>
                Not here — draw again <Kbd>N</Kbd>
              </button>
            </>
          ) : isWaitingBeat(beat) && beat.type !== "empty" ? (
            <button type="button" style={btn(true)} onClick={() => dispatch({ type: "ADVANCE" })}>
              Continue <Kbd>Space</Kbd>
            </button>
          ) : null}
          {state.error && (
            <span role="alert" style={{ fontSize: 22, color: "#FFB4A1", display: "inline-flex", gap: 14, alignItems: "center" }}>
              {state.error}
              {beat.type === "check" && (
                <button type="button" style={{ ...btn(false), fontSize: 20, padding: "6px 14px" }} onClick={() => dispatch({ type: "SKIP_PRIZE" })}>
                  Skip this prize
                </button>
              )}
            </span>
          )}
        </div>
      </div>
    );
  } else {
    main = <p style={{ fontSize: 28 }}>Nothing left to draw.</p>;
  }

  return (
    <Dialog
      open
      fullScreen
      disableEscapeKeyDown
      onClose={requestClose}
      aria-label={`Live draw: ${giveaway.title}`}
      PaperProps={{ sx: { background: NAVY, color: PAPER, fontFamily: FONT_BODY } }}
    >
      <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "24px 32px", gap: 16, boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, minHeight: 48 }}>
          <span style={{ fontSize: 22, color: SOFT, flex: 1 }}>{giveaway.title}</span>
          {confirmLeave ? (
            <span role="alertdialog" aria-label="Leave the draw?" style={{ display: "inline-flex", gap: 12, alignItems: "center", fontSize: 22 }}>
              The winner on screen isn't recorded yet. Leave anyway?
              <button type="button" style={{ ...btn(true), fontSize: 20, padding: "8px 16px" }} onClick={onClose}>
                Leave
              </button>
              <button type="button" style={{ ...btn(false), fontSize: 20, padding: "8px 16px" }} onClick={() => setConfirmLeave(false)}>
                Stay
              </button>
            </span>
          ) : (
            <button type="button" style={{ ...btn(false), fontSize: 20, padding: "8px 16px" }} onClick={requestClose}>
              Leave <Kbd>Esc</Kbd>
            </button>
          )}
        </div>
        <div style={{ display: "flex", gap: 32, flex: 1, minHeight: 0 }}>
          <section aria-label="Draw" style={{ flex: 3, minWidth: 0, display: "flex", flexDirection: "column", minHeight: 0 }}>{main}</section>
          <div style={{ flex: 1, minWidth: 280, maxWidth: 380, borderLeft: `1px solid ${LINE}`, paddingLeft: 24, display: "flex", flexDirection: "column", minHeight: 0 }}>
            <WinnersRail
              order={order}
              prizesById={prizesById}
              results={results}
              byId={byId}
              current={state.phase === "stage" ? state.current : null}
              onArrived={arrived}
              busyId={arrivingId}
            />
            {railError && (
              <p role="alert" style={{ fontSize: 20, color: "#FFB4A1" }}>{railError}</p>
            )}
          </div>
        </div>
        <p style={{ margin: 0, fontSize: 20, color: SOFT }}>
          Space continue · Enter they're here · N not here · S skip to the final three · Esc leave
        </p>
      </div>
    </Dialog>
  );
}

DrawStage.propTypes = {
  giveaway: PropTypes.object.isRequired,
  entries: PropTypes.arrayOf(PropTypes.object).isRequired,
  drawOrder: PropTypes.arrayOf(PropTypes.string),
  orgId: PropTypes.string,
  onUpdated: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
