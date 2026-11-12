/**
 * The live draw's state machine — pure (no React, no network), so every path
 * the operator can take is unit-tested. The stage (DrawStage.js) owns the
 * side effects: it runs ONE timer for the current beat, calls the API, and
 * dispatches the outcome here. Nothing advances on an unsaved result.
 *
 * Phases:
 *   stage   — playing a prize slot's beats (prize → … → winner → check)
 *   next    — the winner is recorded; "Next prize: …" waits for the operator
 *   finale  — every slot settled (or skipped): the winners board
 */
import {
  WAITING_BEATS,
  buildDrawScript,
  eligibleForPrize,
  rankEntrants,
  skipTargetIndex,
} from "../../../lib/giveawayDraw";

export const wonUserIds = (results) =>
  (results || []).filter((r) => r.outcome === "won").map((r) => r.user_id);

export const absentUserIds = (results) =>
  (results || []).filter((r) => r.outcome === "absent").map((r) => r.user_id);

const slotWon = (results, prizeId, slot) =>
  (results || []).some((r) => r.outcome === "won" && r.prize_id === prizeId && Number(r.slot) === slot);

/** Unfilled slots in draw order: [{prizeId, slot}]. */
export function buildQueue(prizes, drawOrder, results) {
  const byId = Object.fromEntries((prizes || []).map((p) => [p.id, p]));
  const order = [
    ...(drawOrder || []).filter((id) => byId[id]),
    ...(prizes || []).map((p) => p.id).filter((id) => !(drawOrder || []).includes(id)),
  ];
  const queue = [];
  for (const prizeId of order) {
    const quantity = Number(byId[prizeId].quantity) || 1;
    for (let slot = 0; slot < quantity; slot += 1) {
      if (!slotWon(results, prizeId, slot)) queue.push({ prizeId, slot });
    }
  }
  return queue;
}

/** Ranking + script for one slot, from the FULL entry list and the recorded results. */
export function prepareSlot({ entries, seed, results, reducedMotion }, { prizeId, slot }, { redraw = false } = {}) {
  const eligible = eligibleForPrize(entries, prizeId, {
    wonUserIds: wonUserIds(results),
    absentUserIds: absentUserIds(results),
  });
  const ranking = rankEntrants(eligible, seed, prizeId, slot);
  const attempt = (results || []).filter(
    (r) => r.outcome === "absent" && r.prize_id === prizeId && Number(r.slot) === slot,
  ).length;
  return {
    prizeId,
    slot,
    attempt,
    redraw,
    ranking,
    totalEntries: ranking.reduce((sum, e) => sum + (Number(e.entries) || 0), 0),
    script: buildDrawScript(ranking, { intro: !redraw, reducedMotion }),
  };
}

const withSlot = (state, index, opts) => {
  if (index >= state.queue.length) {
    return { ...state, index, current: null, beat: 0, phase: "finale", saving: false, error: null };
  }
  return {
    ...state,
    index,
    current: prepareSlot(state, state.queue[index], opts),
    beat: 0,
    phase: "stage",
    saving: false,
    error: null,
  };
};

export function initDrawState({ entries, seed, prizes, drawOrder, results, reducedMotion = false }) {
  const base = {
    entries: entries || [],
    seed,
    prizes: prizes || [],
    reducedMotion,
    results: results || [],
    queue: buildQueue(prizes, drawOrder, results),
    index: 0,
    current: null,
    beat: 0,
    phase: "stage",
    saving: false,
    error: null,
  };
  return withSlot(base, 0);
}

export const currentBeat = (state) => state.current?.script.beats[state.beat] || null;

/** The person on screen at the "check" beat (ranking[0]). */
export const currentWinner = (state) => state.current?.ranking[0] || null;

export function drawReducer(state, action) {
  switch (action.type) {
    case "ADVANCE": {
      // Timer tick or Space / "Continue". Never moves past the check beat —
      // that needs "They're here" or "Not here".
      if (state.saving) return state;
      if (state.phase === "next") return withSlot(state, state.index + 1);
      if (state.phase !== "stage" || !state.current) return state;
      const beats = state.current.script.beats;
      const beat = beats[state.beat];
      if (!beat || beat.type === "check" || beat.type === "empty") return state;
      if (state.beat >= beats.length - 1) return state;
      return { ...state, beat: state.beat + 1 };
    }
    case "SKIP_TO_FINAL": {
      if (state.phase !== "stage" || !state.current || state.saving) return state;
      const target = skipTargetIndex(state.current.script, state.beat);
      return target > state.beat ? { ...state, beat: target } : state;
    }
    case "SKIP_PRIZE":
      // Nobody left in the running (or the operator gives up on a slot that
      // someone else filled). No server write; the finale says it's unawarded.
      if (state.saving) return state;
      return withSlot(state, state.index + 1);
    case "SAVE_START":
      return { ...state, saving: true, error: null };
    case "SAVE_FAILED":
      return { ...state, saving: false, error: action.message || "Couldn't save. Try again." };
    case "WON_SAVED": {
      const results = action.results;
      const next = { ...state, results, saving: false, error: null };
      return state.index + 1 >= state.queue.length
        ? { ...next, phase: "finale", current: null }
        : { ...next, phase: "next" };
    }
    case "ABSENT_SAVED": {
      // Same slot, redraw among the rest: the ranking is per-person, so this
      // is exactly the next present person in the original ranking.
      const next = { ...state, results: action.results };
      return withSlot(next, state.index, { redraw: true });
    }
    case "RESULTS_UPDATED":
      // "They've arrived" (an absent result undone) or any other refresh of
      // the recorded results. The slot on screen keeps playing as it is.
      return { ...state, results: action.results };
    default:
      return state;
  }
}

/** True when the current beat waits for the operator. */
export const isWaitingBeat = (beat) => Boolean(beat && (beat.wait || WAITING_BEATS.has(beat.type)));
