/**
 * Minimal LexoRank-style position strings for planning board ordering.
 *
 * Positions are strings like "p0000500" — sortable lexicographically.
 * The "p" prefix keeps them non-numeric and prevents JS auto-coercion.
 *
 * Operations:
 *   between(a, b)  — string that sorts between a and b
 *   before(a)      — string that sorts before a
 *   after(a)       — string that sorts after a
 *   initial(n)     — evenly-spaced positions for n items
 *   needsRebalance(positions) — true when gaps are exhausted
 */

const PREFIX = "p";
const DIGITS = 7;
const MIN_VAL = 0;
const MAX_VAL = 9999999;
const REBALANCE_THRESHOLD = 1; // gap < 2 means we can't insert between

function toInt(pos) {
  if (!pos || !pos.startsWith(PREFIX)) return MIN_VAL;
  return parseInt(pos.slice(PREFIX.length), 10) || MIN_VAL;
}

function fromInt(n) {
  const clamped = Math.max(MIN_VAL, Math.min(MAX_VAL, Math.round(n)));
  return PREFIX + String(clamped).padStart(DIGITS, "0");
}

/**
 * Return a position string that sorts strictly between a and b.
 * Returns null if the gap is exhausted (needsRebalance will catch this).
 */
export function between(a, b) {
  const lo = a ? toInt(a) : MIN_VAL;
  const hi = b ? toInt(b) : MAX_VAL;
  if (hi - lo < 2) return null; // gap exhausted
  return fromInt(Math.floor((lo + hi) / 2));
}

/** Return a position that sorts before a (halves the gap to MIN_VAL). */
export function before(a) {
  const n = a ? toInt(a) : MAX_VAL;
  return fromInt(Math.floor(n / 2));
}

/** Return a position that sorts after a (halfway to MAX_VAL). */
export function after(a) {
  const n = a ? toInt(a) : MIN_VAL;
  if (n >= MAX_VAL) return null; // no room after
  return fromInt(Math.floor((n + MAX_VAL) / 2));
}

/** Generate n evenly-spaced initial positions. */
export function initial(n) {
  if (n <= 0) return [];
  const step = Math.floor(MAX_VAL / (n + 1));
  return Array.from({ length: n }, (_, i) => fromInt(step * (i + 1)));
}

/** True when any adjacent gap is too small to insert between. */
export function needsRebalance(positions) {
  if (!positions || positions.length < 2) return false;
  const sorted = [...positions].sort();
  for (let i = 0; i < sorted.length - 1; i++) {
    if (toInt(sorted[i + 1]) - toInt(sorted[i]) < REBALANCE_THRESHOLD + 1) return true;
  }
  return false;
}

/** Rebalance: return evenly-spaced replacements for the same number of positions. */
export function rebalance(count) {
  return initial(count);
}
