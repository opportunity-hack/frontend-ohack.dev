// Shared client for the OHack LMS's Convex Functions HTTP API
// (lms.ohack.dev). Used two ways:
// - anonymously: certificates:getCertificateByShareToken verifies a pasted
//   link (same query the LMS's own /certificate/:token page uses);
// - authenticated: lms.ohack.dev signs in through the SAME PropelAuth
//   instance as www.ohack.dev (auth.ohack.dev, registered as a trusted
//   customJwt issuer with EXTERNAL_AUTH_TRUST_EMAILS=true), so a user's own
//   accessToken can call caller-scoped queries (getMyCertificates) and — when
//   their LMS profile carries an admin/editor role — admin queries like
//   quizzes:getQuizResults via `Authorization: Bearer`.
// CORS is open on both. Dev caveat: localhost logs into a propelauthtest
// issuer the production LMS does not trust — authed calls fail there with
// code "auth"; anonymous calls are unaffected.

export const LMS_CONVEX_BASE =
  process.env.NEXT_PUBLIC_LMS_CONVEX_URL ||
  "https://majestic-trout-419.convex.cloud";
const LMS_CONVEX_QUERY_URL = `${LMS_CONVEX_BASE}/api/query`;
const LMS_CONVEX_MUTATION_URL = `${LMS_CONVEX_BASE}/api/mutation`;

// Accepts a full LMS certificate URL or a bare 64-hex share token.
const CERT_TOKEN_RE = /^[0-9a-f]{64}$/i;
const CERT_URL_RE = /lms\.ohack\.dev\/certificate\/([0-9a-f]{64})/i;

export const extractCertToken = (input) => {
  const value = (input || "").trim();
  if (!value) return null;
  if (CERT_TOKEN_RE.test(value)) return value.toLowerCase();
  const match = CERT_URL_RE.exec(value);
  return match ? match[1].toLowerCase() : null;
};

export const certUrlForToken = (token) =>
  `https://lms.ohack.dev/certificate/${token}`;

// The judge-training bundle on the OHack LMS (two videos, each with a
// knowledge check that issues a shareable certificate on a passing score).
export const JUDGE_TRAINING_BUNDLE_URL =
  "https://lms.ohack.dev/bundles/kn7ect1nhxqkcn2tp32tbypzdx8ckjx6";

// The two required certificates. `match` runs against the certificate's
// quizTitle + targetTitle (snapshotted at issuance) and against LMS quiz
// titles in the admin rollup, so it keeps working if the LMS titles get
// lightly reworded — keep these in sync with the bundle's video/quiz names
// ("Judge Intro" / "Using the judging tool").
export const JUDGE_TRAINING_CERTS = [
  {
    field: "judgeTrainingIntroCertUrl",
    key: "intro",
    videoTitle: "Judge Intro",
    match: /judge\s*intro/i,
  },
  {
    field: "judgeTrainingToolCertUrl",
    key: "tool",
    videoTitle: "Using the judging tool",
    match: /judging\s*tool/i,
  },
];

// Convex function call. Throws { code: "auth"|"network"|"server" } so callers
// can tell "this login isn't trusted by the LMS / lacks the required role"
// (expected in dev, or for admins without an LMS account) apart from
// transient failures.
const callLms = async (url, path, args, accessToken) => {
  const headers = { "Content-Type": "application/json" };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ path, args: args || {}, format: "json" }),
    });
  } catch (err) {
    throw Object.assign(new Error(`LMS unreachable: ${err.message}`), {
      code: "network",
    });
  }
  if (response.status === 401 || response.status === 403) {
    throw Object.assign(new Error(`LMS auth rejected: ${response.status}`), {
      code: "auth",
    });
  }
  if (!response.ok) {
    throw Object.assign(new Error(`LMS call failed: ${response.status}`), {
      code: "server",
    });
  }
  const body = await response.json();
  if (body?.status !== "success") {
    const message = body?.errorMessage || "LMS call failed";
    throw Object.assign(new Error(message), {
      code: /auth|unauthenticated|identity/i.test(message) ? "auth" : "server",
    });
  }
  return body.value;
};

export const lmsQuery = (path, args = {}, accessToken = null) =>
  callLms(LMS_CONVEX_QUERY_URL, path, args, accessToken);

export const lmsMutation = (path, args = {}, accessToken = null) =>
  callLms(LMS_CONVEX_MUTATION_URL, path, args, accessToken);

// Anonymous certificate lookup, promise-cached module-wide: concurrent
// callers share one in-flight request per token, and settled successes stay
// cached for the page's lifetime (certs are immutable once issued). Rejected
// promises are evicted so a retry can succeed.
const certLookupCache = new Map(); // token -> Promise<cert | null>

export const verifyCertToken = (token) => {
  const key = (token || "").toLowerCase();
  const cached = certLookupCache.get(key);
  if (cached) return cached;
  const promise = lmsQuery("certificates:getCertificateByShareToken", {
    shareToken: key,
  }).then(
    // null value = token doesn't resolve to a certificate
    (value) => value || null,
    (err) => {
      certLookupCache.delete(key);
      throw err;
    },
  );
  certLookupCache.set(key, promise);
  return promise;
};
