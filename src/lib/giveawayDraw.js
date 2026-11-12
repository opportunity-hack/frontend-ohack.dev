/**
 * The giveaway draw, as pure functions (no React, no network).
 *
 * How a winner is chosen — the whole rule, so it can be read aloud:
 *
 *   1. The people in the running for a prize are everyone who entered that
 *      prize (or "everything") with more than 0 entries, minus anyone who
 *      already won a prize in this giveaway and anyone marked "not here".
 *      The input is ALWAYS the full, unfiltered entry list — the admin
 *      table's search and filters never reach this file.
 *   2. Each person gets a random number u in (0, 1) from the seed, the prize
 *      and their own user id: makeRng(`${seed}|${prizeId}|${slot}|${userId}`).
 *   3. Their key is -ln(u) / entries. Lowest key wins (weighted sampling
 *      without replacement, Efraimidis–Spirakis). Each person's chance of
 *      being first is exactly entries / total entries.
 *
 * Because each person's number depends only on the seed, the prize slot and
 * their own id, the order between any two people never changes when someone
 * else joins or leaves the pool — so "not here, draw again" is simply the
 * next person in the same ranking (`nextPresent`), which is the same as a
 * fresh weighted draw among everyone still present. Same seed, same result:
 * anyone can re-run it.
 *
 * `buildDrawScript` turns a ranking into the beats the stage plays. People
 * leave in reverse ranking order, so the animation is the real result played
 * backwards — the last one standing is ranking[0].
 */

/** 32-bit string hash generator (xmur3). */
export function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i += 1) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function next() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

/** mulberry32 PRNG → numbers in (0, 1) (never exactly 0, so -ln(u) is finite). */
export function mulberry32(a) {
  let state = a >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return (((t ^ (t >>> 14)) >>> 0) + 0.5) / 4294967296;
  };
}

/** Seeded random number generator from any string. */
export function makeRng(seedString) {
  return mulberry32(xmur3(String(seedString))());
}

/** A readable 6-digit seed ("482913") — easy to say out loud. */
export function generateSeed(random = Math.random) {
  return String(Math.floor(random() * 900000) + 100000);
}

function entryCovers(entry, prizeId) {
  if (!entry) return false;
  if (entry.all_prizes) return true;
  return Array.isArray(entry.prize_ids) && entry.prize_ids.includes(prizeId);
}

const weightOf = (entry) => {
  const n = Number(entry?.entries);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

/**
 * People in the running for one prize. `entries` must be the FULL list from
 * the server; `wonUserIds` / `absentUserIds` are arrays or Sets.
 */
export function eligibleForPrize(entries, prizeId, { wonUserIds = [], absentUserIds = [] } = {}) {
  const won = new Set(wonUserIds);
  const absent = new Set(absentUserIds);
  return (entries || []).filter(
    (e) =>
      e &&
      e.user_id &&
      entryCovers(e, prizeId) &&
      weightOf(e) > 0 &&
      !won.has(e.user_id) &&
      !absent.has(e.user_id),
  );
}

/** The (0,1) draw number for one person in one prize slot. */
export function drawNumber(seed, prizeId, slot, userId) {
  return makeRng(`${seed}|${prizeId}|${slot}|${userId}`)();
}

/**
 * Ranking for one prize slot, best first. ranking[0] is the winner. Ties
 * (vanishingly rare) break by user_id so the result is total and stable.
 */
export function rankEntrants(eligible, seed, prizeId, slot) {
  const keyed = (eligible || []).map((entry) => ({
    entry,
    key: -Math.log(drawNumber(seed, prizeId, slot, entry.user_id)) / weightOf(entry),
  }));
  keyed.sort((a, b) => {
    if (a.key !== b.key) return a.key - b.key;
    return String(a.entry.user_id).localeCompare(String(b.entry.user_id));
  });
  return keyed.map((k) => k.entry);
}

/** The redraw: first person in the ranking who isn't marked absent. */
export function nextPresent(ranking, absentUserIds = []) {
  const absent = new Set(absentUserIds);
  return (ranking || []).find((e) => !absent.has(e.user_id)) || null;
}

// ---------------------------------------------------------------------------
// The script the stage plays
// ---------------------------------------------------------------------------

export const MAX_TILES = 300;
export const AVATAR_ONLY_OVER = 120;
export const FINAL_COUNT = 10;
export const REDRAW_FINAL_COUNT = 5;

/** Beat types that wait for the operator (Space / "Continue"). */
export const WAITING_BEATS = new Set(["prize", "final3", "final2", "check", "empty"]);

/**
 * Beats for one prize slot. Every beat carries `remaining` (people still in
 * after it) and, when people leave, `leaving` (their user ids). Waiting beats
 * have `wait: true`; timed beats have `ms`.
 *
 * Options:
 *   intro (default true)  — prize → seed → everyone → waves. false (a redraw
 *                           after "not here") starts at the final cards with
 *                           the top `finalCount` people.
 *   finalCount            — cards in the final round (10; 5 for a redraw).
 *   maxTiles              — wall tiles; the rest is a "+N more" counter.
 *   reducedMotion         — prize ⏸ → winner → check, nothing in between.
 */
export function buildDrawScript(ranking, options = {}) {
  const {
    intro = true,
    finalCount = intro ? FINAL_COUNT : REDRAW_FINAL_COUNT,
    maxTiles = MAX_TILES,
    reducedMotion = false,
  } = options;
  const ids = (ranking || []).map((e) => e.user_id);
  const n = ids.length;
  const beats = [];
  const script = {
    ids,
    total: n,
    winnerId: n ? ids[0] : null,
    tileIds: ids.slice(0, maxTiles),
    hiddenCount: Math.max(0, n - maxTiles),
    beats,
  };

  if (intro || n === 0) beats.push({ type: "prize", wait: true, remaining: n });
  if (n === 0) {
    beats.push({ type: "empty", wait: true, remaining: 0 });
    return script;
  }
  if (reducedMotion || n === 1) {
    beats.push({ type: "winner", ms: reducedMotion ? 1500 : 4000, remaining: 1 });
    beats.push({ type: "check", wait: true, remaining: 1 });
    return script;
  }

  let remaining = n;
  if (intro) {
    beats.push({ type: "seed", ms: 2000, remaining });
    beats.push({ type: "everyone", ms: 2000, remaining });
    while (remaining > finalCount) {
      const count = Math.min(Math.ceil(remaining / 2), remaining - finalCount);
      beats.push({
        type: "wave",
        ms: 1800,
        leaving: ids.slice(remaining - count, remaining).reverse(),
        remaining: remaining - count,
      });
      remaining -= count;
    }
  } else {
    remaining = Math.min(n, finalCount);
  }

  beats.push({ type: "finalists", ms: 900, remaining });

  const singles = Math.max(0, remaining - 3);
  for (let i = 0; i < singles; i += 1) {
    const gap = singles > 1 ? 700 + Math.round((800 * i) / (singles - 1)) : 1000;
    remaining -= 1;
    beats.push({ type: "leave", ms: gap, leaving: [ids[remaining]], remaining });
  }
  if (remaining === 3) {
    beats.push({ type: "final3", wait: true, remaining });
    remaining -= 1;
    beats.push({ type: "leave", ms: 1200, leaving: [ids[2]], remaining });
  }
  if (remaining === 2) {
    beats.push({ type: "final2", wait: true, remaining });
    remaining -= 1;
    beats.push({ type: "leave", ms: 1200, leaving: [ids[1]], remaining });
  }
  beats.push({ type: "winner", ms: 4000, remaining: 1 });
  beats.push({ type: "check", wait: true, remaining: 1 });
  return script;
}

/** Ids still in the running after beat `beatIndex` has played. */
export function stillInAfter(script, beatIndex) {
  if (!script.ids.length) return new Set();
  const visibleCount = script.beats[beatIndex]?.remaining ?? script.ids.length;
  // `remaining` is always a prefix of the ranking: the first N ids are in.
  return new Set(script.ids.slice(0, visibleCount));
}

/** Beat index for the "S — skip to the final three" shortcut (or -1). */
export function skipTargetIndex(script, fromIndex = 0) {
  const order = ["final3", "final2", "winner"];
  for (const type of order) {
    const idx = script.beats.findIndex((b, i) => i > fromIndex && b.type === type);
    if (idx >= 0) return idx;
  }
  return -1;
}
