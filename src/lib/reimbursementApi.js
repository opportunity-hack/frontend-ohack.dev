import axios from "axios";

/**
 * Reimbursement API client — the ONE client for /api/reimbursements.
 *
 * Public calls (submit, receipt mint, status lookup) carry a reCAPTCHA
 * token and no auth header. Admin calls carry the reviewer's access token
 * plus X-Org-Id, like the other admin clients (see admin/contact).
 *
 * Every method THROWS a `ReimbursementApiError` on failure. Callers decide
 * how to surface it; nothing here pretends a failed submit worked.
 */

export class ReimbursementApiError extends Error {
  constructor(message, { status, body, cause } = {}) {
    super(message);
    this.name = "ReimbursementApiError";
    this.status = status;
    this.body = body;
    this.cause = cause;
  }
}

const baseURL = () => process.env.NEXT_PUBLIC_API_SERVER_URL;

function toApiError(error, fallback) {
  if (error instanceof ReimbursementApiError) return error;
  const status = error?.response?.status;
  const body = error?.response?.data;
  const serverMessage =
    (body && typeof body === "object" && (body.message || body.error)) || null;
  const message = serverMessage
    ? String(serverMessage)
    : status
      ? `${fallback} (HTTP ${status})`
      : `${fallback} (network error)`;
  return new ReimbursementApiError(message, { status, body, cause: error });
}

async function request(method, path, { data, params, headers, fallback } = {}) {
  try {
    const response = await axios({
      method,
      url: `${baseURL()}${path}`,
      data,
      params,
      headers: { "Content-Type": "application/json", ...headers },
    });
    return response.data;
  } catch (error) {
    throw toApiError(error, fallback || "Request failed");
  }
}

const adminHeaders = (accessToken, orgId) => ({
  Authorization: `Bearer ${accessToken}`,
  ...(orgId ? { "X-Org-Id": orgId } : {}),
});

const enc = encodeURIComponent;

// Receipt upload: mint a signed URL, PUT the file to GCS with the
// required headers, and return the blob path + final URL for the submit.
// Same shape as the jobs ResumeUploadField flow, except this mint endpoint
// is public and takes a reCAPTCHA token instead of an auth header.
export async function uploadReceipt(file, recaptchaToken, { onProgress } = {}) {
  const mint = await request("post", "/api/reimbursements/receipt-upload-url", {
    data: {
      contentType: file.type,
      contentLength: file.size,
      recaptchaToken,
    },
    fallback: "Could not start the receipt upload",
  });
  if (!mint?.upload_url || !mint?.blob_path) {
    throw new ReimbursementApiError("Could not start the receipt upload", {
      body: mint,
    });
  }

  await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", mint.upload_url);
    for (const [header, headerValue] of Object.entries(
      mint.required_headers || {},
    )) {
      xhr.setRequestHeader(header, headerValue);
    }
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress)
        onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(
            new ReimbursementApiError(`Receipt upload failed (${xhr.status})`, {
              status: xhr.status,
            }),
          );
    xhr.onerror = () =>
      reject(
        new ReimbursementApiError(
          "Receipt upload failed — check your connection",
        ),
      );
    xhr.send(file);
  });

  return { blobPath: mint.blob_path, finalUrl: mint.final_url };
}

const reimbursementApi = {
  /** Public submit. `payload` uses the API contract's camelCase fields. */
  submit(payload) {
    return request("post", "/api/reimbursements", {
      data: payload,
      fallback: "Could not submit your reimbursement request",
    });
  },

  /** Public status lookup by email + reference ID. */
  lookupStatus(email, referenceId) {
    return request("get", "/api/reimbursements/status", {
      params: { email, reference_id: referenceId },
      fallback: "Could not look up that reimbursement",
    });
  },

  /** Admin list. `query` may carry status, event_id, limit, offset. */
  listAdmin(query, accessToken, orgId) {
    return request("get", "/api/reimbursements/admin", {
      params: query,
      headers: adminHeaders(accessToken, orgId),
      fallback: "Could not load reimbursements",
    });
  },

  /** Admin detail for one claim. */
  getAdmin(id, accessToken, orgId) {
    return request("get", `/api/reimbursements/admin/${enc(id)}`, {
      headers: adminHeaders(accessToken, orgId),
      fallback: "Could not load that reimbursement",
    });
  },

  /** Admin review: move a claim to a new status with an optional note. */
  reviewAdmin(id, { status, reviewNote }, accessToken, orgId) {
    return request("patch", `/api/reimbursements/admin/${enc(id)}`, {
      data: { status, reviewNote },
      headers: adminHeaders(accessToken, orgId),
      fallback: "Could not update that reimbursement",
    });
  },
};

export default reimbursementApi;
