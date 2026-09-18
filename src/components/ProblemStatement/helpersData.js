// Pure helpers for the project "Who's helping" roster (issue #359).
//
// Backend contract (GET /api/problem-statements/<id>/helpers):
//   { helpers: [{ db_id, user_id, type, since, name, nickname, profile_image }],
//     counts: { hacker, mentor, total }, slack_channel }
// `normalizeHelpers` applies the same dedupe rules to the raw `helping` array
// that ships with the static problem statement, so counts render on the
// server and the roster degrades gracefully if the endpoint is unavailable.

export const HELPER_TYPES = ["hacker", "mentor"];

export const HELPER_TYPE_LABELS = {
  hacker: { singular: "Developer", plural: "Developers" },
  mentor: { singular: "Mentor", plural: "Mentors" },
};

const isoOrNull = (value) =>
  typeof value === "string" && value.trim() ? value : null;

/**
 * Collapse raw `helping` entries ({user, slack_user, type, timestamp}) into
 * one record per person: earliest timestamp wins as `since`, latest `type`
 * wins, malformed entries are dropped. Oldest first.
 */
export function normalizeHelpers(rawHelping) {
  const byKey = new Map();
  (Array.isArray(rawHelping) ? rawHelping : []).forEach((entry) => {
    if (!entry || typeof entry !== "object") return;
    const key = entry.user || entry.slack_user;
    if (!key) return;
    const since = isoOrNull(entry.timestamp);
    const type = typeof entry.type === "string" && entry.type ? entry.type : null;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, {
        db_id: entry.user || null,
        user_id: entry.slack_user || null,
        type,
        since,
        latest: since,
        name: null,
        nickname: null,
        profile_image: null,
      });
      return;
    }
    if (since && (!existing.since || since < existing.since)) existing.since = since;
    const isLatest = since
      ? !existing.latest || since >= existing.latest
      : !existing.latest;
    if (type && isLatest) existing.type = type;
    if (since && (!existing.latest || since >= existing.latest)) existing.latest = since;
    if (!existing.db_id && entry.user) existing.db_id = entry.user;
    if (!existing.user_id && entry.slack_user) existing.user_id = entry.slack_user;
  });
  return [...byKey.values()]
    .map(({ latest, ...rest }) => rest)
    .sort((a, b) => {
      if (!a.since && !b.since) return 0;
      if (!a.since) return 1;
      if (!b.since) return -1;
      return a.since < b.since ? -1 : a.since > b.since ? 1 : 0;
    });
}

/** → { hacker: [...], mentor: [...], other: [...] } preserving input order. */
export function groupHelpersByType(helpers) {
  const groups = { hacker: [], mentor: [], other: [] };
  (helpers || []).forEach((helper) => {
    const bucket = HELPER_TYPES.includes(helper?.type) ? helper.type : "other";
    groups[bucket].push(helper);
  });
  return groups;
}

export function countHelpers(helpers) {
  const groups = groupHelpersByType(helpers);
  return {
    hacker: groups.hacker.length,
    mentor: groups.mentor.length,
    total: (helpers || []).length,
  };
}

const cleanName = (value) => (typeof value === "string" ? value.trim() : "");

export function helperDisplayName(helper) {
  return cleanName(helper?.name) || cleanName(helper?.nickname) || "Community member";
}

export function helperInitials(helper) {
  const name = cleanName(helper?.name) || cleanName(helper?.nickname);
  if (!name) return "?";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const RECENT_DAYS = 14;

/**
 * "May 2025" style label for when someone started helping. Sign-ups within
 * the last two weeks read as "today" / "N days ago" so momentum is visible.
 * Returns "" for missing/invalid timestamps (legacy entries without one).
 */
export function formatSince(iso, now = new Date()) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const days = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (days >= 0 && days < 1) return "today";
  if (days >= 1 && days < RECENT_DAYS) return `${days} day${days === 1 ? "" : "s"} ago`;
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** Full date for tooltips; "" when unknown. */
export function formatSinceExact(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Match a roster row to the signed-in profile (db id first, OAuth id fallback). */
export function isSameHelper(helper, profile) {
  if (!helper || !profile) return false;
  if (helper.db_id && profile.id && helper.db_id === profile.id) return true;
  if (helper.user_id && profile.user_id && helper.user_id === profile.user_id) return true;
  return false;
}

export function findCurrentUserHelper(helpers, profile) {
  if (!profile) return null;
  return (helpers || []).find((helper) => isSameHelper(helper, profile)) || null;
}

/** Optimistic add/update of the signed-in user's own row. */
export function upsertHelper(helpers, helper) {
  const list = Array.isArray(helpers) ? helpers : [];
  const index = list.findIndex((h) => isSameHelper(h, { id: helper.db_id, user_id: helper.user_id }));
  if (index === -1) return [...list, helper];
  const existing = list[index];
  const merged = { ...existing, ...helper, since: existing.since || helper.since };
  return list.map((h, i) => (i === index ? merged : h));
}

export function removeHelper(helpers, profile) {
  return (helpers || []).filter((helper) => !isSameHelper(helper, profile));
}

export function helperProfileHref(helper) {
  return helper?.db_id ? `/profile/${helper.db_id}` : null;
}

export function slackChannelHref(channel) {
  return channel
    ? `https://opportunity-hack.slack.com/app_redirect?channel=${encodeURIComponent(channel)}`
    : null;
}
