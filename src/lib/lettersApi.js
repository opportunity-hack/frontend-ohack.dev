import axios from "axios";

/**
 * The ONE client for the participation-letter API (backend api/letters,
 * contract in its README.md). Every method THROWS `LettersApiError` (with the
 * backend's `code` and, for eligibility refusals, `reason`), so a failure can
 * never read as "no letters".
 *
 * PDFs come back as Blobs; on a non-2xx the Blob body is parsed back into the
 * JSON error so the caller still gets `code`/`message`.
 */

export class LettersApiError extends Error {
  constructor(message, { status, body, cause } = {}) {
    super(message);
    this.name = "LettersApiError";
    this.status = status;
    this.body = body;
    this.code = body && typeof body === "object" ? body.error : undefined;
    this.reason = body && typeof body === "object" ? body.reason : undefined;
    this.cause = cause;
  }
}

const base = () => process.env.NEXT_PUBLIC_API_SERVER_URL || "";

async function errorBody(error) {
  const data = error?.response?.data;
  if (typeof Blob !== "undefined" && data instanceof Blob) {
    try {
      return JSON.parse(await data.text());
    } catch {
      return null;
    }
  }
  return data ?? null;
}

async function request(method, path, accessToken, { data, orgId, blob, fallback }) {
  try {
    const response = await axios({
      method,
      url: `${base()}${path}`,
      data,
      responseType: blob ? "blob" : "json",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(orgId ? { "X-Org-Id": orgId } : {}),
      },
    });
    return blob ? { blob: response.data, headers: response.headers || {} } : response.data;
  } catch (error) {
    const status = error?.response?.status;
    const body = await errorBody(error);
    const serverMessage = body && typeof body === "object" ? body.message : null;
    const message = serverMessage
      ? String(serverMessage)
      : status
        ? `${fallback} (HTTP ${status})`
        : `${fallback} (network error)`;
    throw new LettersApiError(message, { status, body, cause: error });
  }
}

const q = (params) =>
  Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

export const verifyPath = (letterId) => `/letters/verify/${letterId}`;

const lettersApi = {
  /** {rows: [{event_id, event_title, event_end_date, role, eligible, reason, letter_id, status, issued_at}], name_default, title_line} */
  mine(accessToken) {
    return request("get", "/api/letters/mine", accessToken, {
      fallback: "Could not load your letters",
    });
  },

  /** {event_id, role, name_on_letter, show_title_line} -> {letter_id, status, created} */
  request(payload, accessToken) {
    return request("post", "/api/letters", accessToken, {
      data: payload,
      fallback: "Could not issue your letter",
    });
  },

  /** Watermarked preview of the caller's own letter -> {blob} */
  preview({ eventId, role, name, showTitleLine }, accessToken) {
    const query = q({
      event_id: eventId,
      role,
      name,
      show_title_line: showTitleLine ? "true" : "false",
    });
    return request("get", `/api/letters/preview?${query}`, accessToken, {
      blob: true,
      fallback: "Could not render the preview",
    });
  },

  /** The issued PDF (owner or admin) -> {blob} */
  pdf(letterId, accessToken, orgId) {
    return request("get", `/api/letters/${encodeURIComponent(letterId)}/pdf`, accessToken, {
      blob: true,
      orgId,
      fallback: "Could not download the letter",
    });
  },

  // ---- Admin (volunteer.admin; every call carries X-Org-Id) ----

  /** {event_id, event_title, end_date, rows: [{user_id, email, name, role, volunteer_id, eligible, reason, evidence, letter_id, status, issued_at, exception, exception_note, revoked_reason, facts, name_on_letter}]} */
  adminList(eventId, accessToken, orgId) {
    return request("get", `/api/admin/letters?${q({ event_id: eventId })}`, accessToken, {
      orgId,
      fallback: "Could not load letters",
    });
  },

  /** The exact PDF the person gets -> {blob, headers}. Headers:
   * x-letter-status, x-letter-eligible, x-letter-reason, x-letter-id. */
  adminPreview({ userId, eventId, role }, accessToken, orgId) {
    const query = q({ user_id: userId, event_id: eventId, role });
    return request("get", `/api/admin/letters/preview?${query}`, accessToken, {
      orgId,
      blob: true,
      fallback: "Could not render the letter",
    });
  },

  adminRevoke(letterId, reason, accessToken, orgId) {
    return request(
      "post",
      `/api/admin/letters/${encodeURIComponent(letterId)}/revoke`,
      accessToken,
      { orgId, data: { reason }, fallback: "Could not revoke the letter" },
    );
  },

  /** {email | user_id, event_id, role, note} -> {letter_id, status} */
  adminException(payload, accessToken, orgId) {
    return request("post", "/api/admin/letters/exception", accessToken, {
      orgId,
      data: payload,
      fallback: "Could not issue the exception letter",
    });
  },
};

export default lettersApi;

/** Save a Blob as a file (client only). */
export function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export const letterFilename = (letterId) => `OpportunityHack-Letter-${letterId}.pdf`;
