/**
 * Fetch layer for giveaways v2 (`/api/giveaways`, backend `api/giveaways/`).
 *
 * Every call resolves to parsed JSON or throws an `ApiError{status, body}`
 * (shared with teamDashboardApi). Backend errors are
 * `{error: <code>, message: <copy>}`; `giveawayErrorMessage` picks the copy.
 * Deploy order is backend first: callers treat a 404 as "feature off".
 *
 * The legacy `/api/messages/giveaway*` routes are never called from here.
 */
import { ApiError, isNotFound } from "./teamDashboardApi";

export { ApiError, isNotFound };

const API_BASE = process.env.NEXT_PUBLIC_API_SERVER_URL;

async function parseBody(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function request(path, { method = "GET", token, orgId, body, signal } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (orgId) headers["X-Org-Id"] = orgId;
  let payload;
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${API_BASE}/api/giveaways${path}`, {
    method,
    headers,
    body: payload,
    signal,
  });
  const data = await parseBody(res);
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}

const enc = encodeURIComponent;

/** The backend's human copy for an error, else `fallback`. */
export function giveawayErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  const body = error?.body;
  if (body && typeof body.message === "string" && body.message) return body.message;
  return fallback;
}

/** The backend error code (`giveaway_closed`, `slot_filled`, …) or null. */
export function giveawayErrorCode(error) {
  return error?.body?.error || null;
}

// --- Participants --------------------------------------------------------

export const getOpenGiveaways = ({ token, signal } = {}) =>
  request("/open", { token, signal });

export const saveGiveawayEntry = (giveawayId, { all_prizes, prize_ids }, { token } = {}) =>
  request(`/${enc(giveawayId)}/entry`, {
    method: "POST",
    token,
    body: { all_prizes: Boolean(all_prizes), prize_ids: prize_ids || [] },
  });

export const withdrawGiveawayEntry = (giveawayId, { token } = {}) =>
  request(`/${enc(giveawayId)}/entry`, { method: "DELETE", token });

// --- Admin ---------------------------------------------------------------

export const listAdminGiveaways = (opts = {}) => request("/admin", opts);

export const getAdminGiveaway = (giveawayId, opts = {}) =>
  request(`/admin/${enc(giveawayId)}`, opts);

export const getAdminGiveawayEntries = (giveawayId, opts = {}) =>
  request(`/admin/${enc(giveawayId)}/entries`, opts);

export const createAdminGiveaway = (body, opts = {}) =>
  request("/admin", { ...opts, method: "POST", body });

export const updateAdminGiveaway = (giveawayId, body, opts = {}) =>
  request(`/admin/${enc(giveawayId)}`, { ...opts, method: "PATCH", body });

export const startGiveawayDraw = (giveawayId, seed, opts = {}) =>
  request(`/admin/${enc(giveawayId)}/draw/start`, {
    ...opts,
    method: "POST",
    body: { seed },
  });

export const recordGiveawayResult = (giveawayId, body, opts = {}) =>
  request(`/admin/${enc(giveawayId)}/draw/results`, { ...opts, method: "POST", body });

export const undoGiveawayResult = (giveawayId, resultId, opts = {}) =>
  request(`/admin/${enc(giveawayId)}/draw/undo`, {
    ...opts,
    method: "POST",
    body: { result_id: resultId },
  });

export const resetGiveawayDraw = (giveawayId, opts = {}) =>
  request(`/admin/${enc(giveawayId)}/draw/reset`, { ...opts, method: "POST", body: {} });

/**
 * Upload a prize image through the shared upload route (admins may write any
 * directory) → the CDN URL.
 */
export async function uploadPrizeImage(giveawayId, file, { token, orgId } = {}) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("directory", `giveaways/${giveawayId}`);
  const cleanName = (file.name || "prize").replace(/[^a-zA-Z0-9.-]/g, "_");
  formData.append("filename", `${Date.now()}_${cleanName}`);
  const res = await fetch(`${API_BASE}/api/messages/upload-image`, {
    method: "POST",
    body: formData,
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(orgId ? { "X-Org-Id": orgId } : {}),
    },
  });
  const json = await parseBody(res);
  if (!res.ok || !json?.success || !json?.url) {
    throw new ApiError(res.status, json || { message: "Upload failed" });
  }
  return json.url;
}

// --- Display helpers -----------------------------------------------------

export const GIVEAWAY_TIMEZONE = "America/Phoenix";

/** "Sat Nov 14, 4:00 PM Arizona time" — '' for a missing/bad value. */
export function formatGiveawayClose(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: GIVEAWAY_TIMEZONE,
  }).formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type)?.value || "";
  return `${get("weekday")} ${get("month")} ${get("day")}, ${get("hour")}:${get("minute")} ${get("dayPeriod")} Arizona time`;
}

/** Does this entry take part in the drawing for `prizeId`? */
export function entryCoversPrize(entry, prizeId) {
  if (!entry) return false;
  if (entry.all_prizes) return true;
  return Array.isArray(entry.prize_ids) && entry.prize_ids.includes(prizeId);
}

/** Prizes sorted by `sort_order` (copy). */
export function sortedPrizes(giveaway) {
  return [...(giveaway?.prizes || [])].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  );
}
