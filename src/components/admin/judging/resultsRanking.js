/**
 * Final-results ranking for Round 2 (pure, unit-tested).
 *
 * Order: teams with at least one submitted score first, by average score
 * descending. Averages are compared at the precision the table DISPLAYS
 * (two decimals) — never with an epsilon: an epsilon wider than the smallest
 * real gap (1/210 with 14 vs 15 judges) would reorder teams whose displayed
 * averages differ, and epsilon-equality isn't transitive, which makes a sort
 * undefined. Ties at that precision are broken by the EARLIEST
 * `project_submitted_at` — the first time the team pressed "Submit your
 * project" on its dashboard (the backend only stamps it once). A team with no
 * submission timestamp loses the tie to one that has it. If that still ties
 * (same instant, or neither submitted), lower standard deviation wins, then
 * team name. Teams with no scores sort last, by name.
 */

export const AVERAGE_PRECISION = 2;
const SCALE = 10 ** AVERAGE_PRECISION;

export const parseSubmittedAt = (team) => {
  const raw = team?.project_submitted_at;
  if (!raw) return null;
  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? null : t;
};

/** Earlier timestamp first; missing timestamps last; equal → 0. */
export function compareSubmittedAt(a, b) {
  const ta = parseSubmittedAt(a?.team);
  const tb = parseSubmittedAt(b?.team);
  if (ta === null && tb === null) return 0;
  if (ta === null) return 1;
  if (tb === null) return -1;
  return ta - tb;
}

/** The average as an integer at display precision, or null when unscored. */
export const averageKey = (row) =>
  row?.judgeCount > 0
    ? Math.round((Number(row.averageScore) || 0) * SCALE)
    : null;

const sdOf = (row) => Number(row?.standardDeviation) || 0;
const nameOf = (row) => String(row?.team?.name || "");

const tiedOnAverage = (a, b) => {
  const x = averageKey(a);
  const y = averageKey(b);
  return x !== null && y !== null && x === y;
};

function compareRows(a, b) {
  const x = averageKey(a);
  const y = averageKey(b);
  if (x === null && y === null) return nameOf(a).localeCompare(nameOf(b));
  if (x === null) return 1;
  if (y === null) return -1;
  if (x !== y) return y - x;
  const bySubmission = compareSubmittedAt(a, b);
  if (bySubmission !== 0) return bySubmission;
  const bySd = sdOf(a) - sdOf(b);
  if (bySd !== 0) return bySd;
  return nameOf(a).localeCompare(nameOf(b));
}

/** Which rule separated `a` (ranked higher) from `b` inside a tie group. */
function tieBreakReason(a, b) {
  const bySubmission = compareSubmittedAt(a, b);
  if (bySubmission !== 0) return "project_submitted_at";
  if (sdOf(a) !== sdOf(b)) return "std_dev";
  return "name";
}

/**
 * Returns a NEW array of rows (shallow copies) sorted for the results table,
 * each annotated with:
 *   rank            1-based position
 *   tieGroup        shared id for rows tied on average (null when not tied)
 *   tieBrokenBy     'project_submitted_at' | 'std_dev' | 'name' | null —
 *                   the rule that placed this row relative to the row above
 *                   it within the same tie group (null for the group's first)
 */
export function rankRound2Teams(teamScores) {
  const sorted = [...(teamScores || [])].sort(compareRows);
  let groupId = 0;
  return sorted.map((row, index) => {
    const prev = index > 0 ? sorted[index - 1] : null;
    const next = index < sorted.length - 1 ? sorted[index + 1] : null;
    const tiedWithPrev = prev ? tiedOnAverage(prev, row) : false;
    const tiedWithNext = next ? tiedOnAverage(row, next) : false;
    if (!tiedWithPrev && tiedWithNext) groupId += 1;
    const inGroup = tiedWithPrev || tiedWithNext;
    return {
      ...row,
      rank: index + 1,
      tieGroup: inGroup ? groupId : null,
      tieBrokenBy: tiedWithPrev ? tieBreakReason(prev, row) : null,
    };
  });
}

export const TIE_BREAK_LABELS = {
  project_submitted_at: "earlier project submission",
  std_dev: "more consistent judge scores (lower std dev)",
  name: "team name (no other separator)",
};

/** "Sat Oct 11, 2:58:07 PM MST" — seconds matter when breaking a tie. */
export function formatSubmittedAt(iso, timezone) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const tz = timezone || "America/Phoenix";
  try {
    return date.toLocaleString("en-US", {
      timeZone: tz,
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    });
  } catch (e) {
    return date.toLocaleString("en-US");
  }
}
