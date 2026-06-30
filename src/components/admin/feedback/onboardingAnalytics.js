// Pure analytics helpers for the admin Onboarding feedback dashboard.
// Kept dependency-light (only moment, already in the bundle) and side-effect
// free so the panel stays readable and these can be unit-tested in isolation.
import moment from "moment";

// easeOfUnderstanding is an ordinal scale (best -> worst). Colors go green -> red.
export const EASE_ORDER = [
  "Very easy",
  "Mostly clear",
  "Somewhat confusing",
  "Very difficult",
];
export const EASE_COLORS = {
  "Very easy": "#2e7d32",
  "Mostly clear": "#9ccc65",
  "Somewhat confusing": "#ffa726",
  "Very difficult": "#e53935",
};
// "clear" = the two positive ends of the scale.
export const CLEAR_EASE = new Set(["Very easy", "Mostly clear"]);
// The confusing end — used to flag responses that need attention.
export const CONFUSING_EASE = new Set(["Somewhat confusing", "Very difficult"]);

// The fixed onboarding-topic options (stable order for the frequency bar).
export const USEFUL_TOPICS = [
  "Mission Overview",
  "Introduction Guide",
  "Slack Tutorial",
  "Buddy System",
  "FAQ Section",
];

const TS_PREFIX = "__Timestamp__";

/** Parse an API timestamp into a Date (tolerates a stray __Timestamp__ prefix). */
export function parseTs(iso) {
  if (!iso) return null;
  let s = iso;
  if (typeof s === "string" && s.startsWith(TS_PREFIX)) s = s.slice(TS_PREFIX.length);
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

/** moment bucket key (start of week/month), 'YYYY-MM-DD'. */
export function bucketKeyFor(date, granularity) {
  if (!date) return null;
  return moment(date).startOf(granularity).format("YYYY-MM-DD");
}

const bucketLabel = (key, granularity) =>
  granularity === "month"
    ? moment(key).format("MMM YYYY")
    : moment(key).format("MMM D");

/**
 * Group responses into a CONTINUOUS series of week/month buckets (empty buckets
 * are zero-filled so a gap reads as "no responses", not a compressed axis).
 * Each bucket: { key, label, count, avgRating, lowN, ...easeCategoryCounts }.
 * Ease category counts are spread as top-level keys so recharts can stack them.
 */
export function bucketByPeriod(items, granularity) {
  const dated = items
    .map((it) => ({ it, date: parseTs(it.timestamp) }))
    .filter((x) => x.date);
  if (!dated.length) return [];

  const map = new Map();
  let min = null;
  let max = null;
  for (const { it, date } of dated) {
    const key = bucketKeyFor(date, granularity);
    if (!map.has(key)) {
      const b = { key, label: bucketLabel(key, granularity), count: 0, _ratingSum: 0, _ratingN: 0 };
      EASE_ORDER.forEach((e) => { b[e] = 0; });
      map.set(key, b);
    }
    const b = map.get(key);
    b.count += 1;
    if (typeof it.overallRating === "number" && it.overallRating > 0) {
      b._ratingSum += it.overallRating;
      b._ratingN += 1;
    }
    if (it.easeOfUnderstanding && b[it.easeOfUnderstanding] !== undefined) {
      b[it.easeOfUnderstanding] += 1;
    }
    const m = moment(key);
    if (!min || m.isBefore(min)) min = m.clone();
    if (!max || m.isAfter(max)) max = m.clone();
  }

  // Zero-fill the continuous range.
  const out = [];
  const cursor = min.clone();
  while (cursor.isSameOrBefore(max)) {
    const key = cursor.format("YYYY-MM-DD");
    const b = map.get(key) || (() => {
      const empty = { key, label: bucketLabel(key, granularity), count: 0, _ratingSum: 0, _ratingN: 0 };
      EASE_ORDER.forEach((e) => { empty[e] = 0; });
      return empty;
    })();
    b.avgRating = b._ratingN ? +(b._ratingSum / b._ratingN).toFixed(2) : null;
    b.lowN = b.count > 0 && b.count < 3;
    out.push(b);
    cursor.add(1, granularity);
  }
  return out;
}

// Compact stopword list for keyword/bigram theming of short free-text answers.
const STOPWORDS = new Set(
  ("a an the and or but if then to of in on for with about into from by at as is are was were be been being " +
   "it its this that these those i you we they he she them us our your my me more most some any no not yes " +
   "can could should would will just very really also too so than there their what which who how when where why " +
   "do does did done have has had get got make made like want need think feel know thing things lot bit etc " +
   "good great nice okay ok pretty little maybe yeah was were am").split(/\s+/)
);

const tokenize = (text) =>
  (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));

/**
 * Surface recurring themes from a list of free-text strings: top unigrams and
 * bigrams by frequency. Transparent and inspectable — no external NLP.
 * Returns [{ term, count }] sorted desc, capped at `top`.
 */
export function extractThemes(texts, top = 12) {
  const counts = new Map();
  const bump = (term) => counts.set(term, (counts.get(term) || 0) + 1);
  for (const text of texts) {
    const toks = tokenize(text);
    toks.forEach((t) => bump(t));
    for (let i = 0; i < toks.length - 1; i++) bump(`${toks[i]} ${toks[i + 1]}`);
  }
  return [...counts.entries()]
    .filter(([, n]) => n >= 2) // a theme needs at least two mentions
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, top);
}

/** Coarse {browser, os, label} from a user-agent string (no UA-parser dep). */
export function parseDevice(ua) {
  if (!ua) return { browser: "", os: "", label: "Unknown" };
  let browser = "Browser";
  if (/edg/i.test(ua)) browser = "Edge";
  else if (/chrome|crios/i.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua)) browser = "Safari";

  let os = "";
  if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/mac os x/i.test(ua)) os = "macOS";
  else if (/windows/i.test(ua)) os = "Windows";
  else if (/linux/i.test(ua)) os = "Linux";

  return { browser, os, label: [browser, os].filter(Boolean).join(" · ") || "Unknown" };
}
