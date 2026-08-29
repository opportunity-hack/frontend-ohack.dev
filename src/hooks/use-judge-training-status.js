import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  JUDGE_TRAINING_CERTS,
  certUrlForToken,
  extractCertToken,
  lmsQuery,
  verifyCertToken,
} from "../lib/lmsClient";

// Join key between OHack judge applications and LMS accounts (PropelAuth
// verified emails on both sides).
export const normalizeEmail = (email) => (email || "").trim().toLowerCase();

// Module-level cache for the authed rollup pass (listQuizzes → getQuizResults
// → listUsers). Global rather than per-event — quiz results are
// event-agnostic — and shared across mounts/tab switches so returning to the
// Judges tab within the TTL costs no LMS calls.
const ROLLUP_TTL_MS = 60 * 1000;
let rollupCache = { fetchedAt: 0, promise: null };

// Attempt/completion rollups keyed by normalized email:
// Map<email, { intro?: rollup, tool?: rollup }> where rollup =
// { attemptCount, bestScore, passed, attemptsToPass, lastAttemptAt }.
// Requires the caller's LMS profile to carry MANAGE_QUIZZES + VIEW_USERS
// (owner/admin/editor). listQuizzes/getQuizResults soft-degrade to []/null
// without the role, so an empty quiz match is treated as an auth failure
// rather than rendered as "nobody attempted anything".
const fetchRollupsByEmail = async (accessToken) => {
  const quizzes = await lmsQuery("quizzes:listQuizzes", {}, accessToken);
  const slotQuizzes = JUDGE_TRAINING_CERTS.map((spec) => ({
    spec,
    quiz: (quizzes || []).find((q) =>
      spec.match.test(`${q.title || ""} ${q.targetTitle || ""}`),
    ),
  })).filter((entry) => entry.quiz);
  if (slotQuizzes.length === 0) {
    throw Object.assign(
      new Error("Judge-training quizzes not visible to this LMS account"),
      { code: "auth" },
    );
  }

  const [users, ...quizResults] = await Promise.all([
    lmsQuery("users:listUsers", {}, accessToken),
    ...slotQuizzes.map(({ quiz }) =>
      lmsQuery("quizzes:getQuizResults", { quizId: quiz._id }, accessToken),
    ),
  ]);

  const emailByUserId = new Map();
  (users || []).forEach((user) => {
    if (user?.userId && user?.email) {
      emailByUserId.set(user.userId, normalizeEmail(user.email));
    }
  });

  const byEmail = new Map();
  slotQuizzes.forEach(({ spec }, i) => {
    (quizResults[i]?.results || []).forEach((row) => {
      const email = emailByUserId.get(row.userId);
      if (!email) return;
      const entry = byEmail.get(email) || {};
      entry[spec.key] = {
        attemptCount: row.attemptCount,
        bestScore: row.bestScore,
        passed: row.passed,
        attemptsToPass: row.attemptsToPass,
        lastAttemptAt: row.lastAttemptAt,
      };
      byEmail.set(email, entry);
    });
  });
  return byEmail;
};

const getRollupsCached = (accessToken, force) => {
  const fresh =
    rollupCache.promise && Date.now() - rollupCache.fetchedAt < ROLLUP_TTL_MS;
  if (!fresh || force) {
    const promise = fetchRollupsByEmail(accessToken);
    rollupCache = { fetchedAt: Date.now(), promise };
    // Evict rejected promises so a later run can retry.
    promise.catch(() => {
      if (rollupCache.promise === promise) {
        rollupCache = { fetchedAt: 0, promise: null };
      }
    });
  }
  return rollupCache.promise;
};

const resolveSlot = (spec, rawValue, certResults, rollup) => {
  const raw = (rawValue || "").trim();
  const token = extractCertToken(raw);
  const base = {
    certUrl: token ? certUrlForToken(token) : raw || null,
    cert: null,
    rollup: rollup || null,
  };
  if (!raw) return { ...base, state: "missing" };
  if (!token) return { ...base, state: "invalid" };
  const lookup = certResults.get(token);
  if (!lookup || lookup.status === "error") return { ...base, state: "error" };
  if (!lookup.cert) return { ...base, state: "not_found" };
  const cert = lookup.cert;
  if (!spec.match.test(`${cert.quizTitle || ""} ${cert.targetTitle || ""}`)) {
    return { ...base, cert, state: "mismatch" };
  }
  return { ...base, cert, state: "verified" };
};

/**
 * LMS training status for a list of judge applications, for admin review.
 *
 * Two passes run in parallel and merge into one state update:
 * - anonymous certificate verification of each judge's stored
 *   judgeTraining*CertUrl (works for every admin — Convex CORS is open);
 * - an authed rollup (attempt counts / best score / passed) using the
 *   admin's own PropelAuth token, available only when their LMS profile has
 *   an admin/editor role. Failure of this pass (no role, untrusted dev
 *   issuer, LMS down) degrades to certs-only — never an error state for the
 *   whole hook.
 *
 * Returns { statusByEmail, lmsAccess, loading, refresh }:
 * - statusByEmail[normalizedEmail] = { slots: { intro, tool }, complete },
 *   each slot { state, certUrl, cert, rollup } with state one of
 *   verified | mismatch | not_found | invalid | missing | error.
 * - lmsAccess: null (not yet checked) | "full" | "certs-only" | "unavailable".
 *
 * Token-rotation stability (CLAUDE.md): the access token is read through a
 * ref and the fetch effect keys on token PRESENCE + a judges fingerprint, so
 * PropelAuth's refocus rotation never refires it.
 */
export default function useJudgeTrainingStatus({
  accessToken,
  judges,
  enabled = true,
}) {
  const [result, setResult] = useState({ statusByEmail: {}, lmsAccess: null });
  const [loading, setLoading] = useState(false);

  const accessTokenRef = useRef(accessToken);
  const judgesRef = useRef(judges);
  const runIdRef = useRef(0);

  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);
  useEffect(() => {
    judgesRef.current = judges;
  }, [judges]);

  const hasToken = Boolean(accessToken);

  // Refetch only when the judge list meaningfully changes (emails or stored
  // cert tokens) — not on unrelated parent re-renders or array identity.
  const fingerprint = useMemo(() => {
    if (!enabled || !judges?.length) return "";
    return judges
      .map((judge) =>
        [
          normalizeEmail(judge.email),
          ...JUDGE_TRAINING_CERTS.map(
            (spec) => extractCertToken(judge[spec.field]) || "",
          ),
        ].join("|"),
      )
      .sort()
      .join(";");
  }, [enabled, judges]);

  const run = useCallback(async (force = false) => {
    const list = judgesRef.current || [];
    if (list.length === 0) return;
    const runId = ++runIdRef.current;
    setLoading(true);
    try {
      const tokens = new Set();
      list.forEach((judge) => {
        JUDGE_TRAINING_CERTS.forEach((spec) => {
          const token = extractCertToken(judge[spec.field]);
          if (token) tokens.add(token);
        });
      });

      // Anonymous pass — per-token failures degrade to slot state "error".
      const certPromise = Promise.all(
        Array.from(tokens).map((token) =>
          verifyCertToken(token).then(
            (cert) => [token, { status: "ok", cert }],
            () => [token, { status: "error", cert: null }],
          ),
        ),
      ).then((entries) => new Map(entries));

      // Authed rollup pass — outcome captured, never thrown.
      const authToken = accessTokenRef.current;
      const rollupPromise = authToken
        ? getRollupsCached(authToken, force).then(
            (byEmail) => ({ ok: true, byEmail }),
            (err) => ({ ok: false, code: err?.code || "server" }),
          )
        : Promise.resolve({ ok: false, code: "auth" });

      const [certResults, rollupOutcome] = await Promise.all([
        certPromise,
        rollupPromise,
      ]);
      if (runIdRef.current !== runId) return; // stale — a newer run superseded

      const rollupsByEmail = rollupOutcome.ok ? rollupOutcome.byEmail : null;
      const statusByEmail = {};
      list.forEach((judge) => {
        const email = normalizeEmail(judge.email);
        if (!email || statusByEmail[email]) return;
        const rollups = rollupsByEmail?.get(email) || null;
        const slots = {};
        let complete = true;
        JUDGE_TRAINING_CERTS.forEach((spec) => {
          const slot = resolveSlot(
            spec,
            judge[spec.field],
            certResults,
            rollups?.[spec.key] || null,
          );
          slots[spec.key] = slot;
          if (!(slot.state === "verified" || slot.rollup?.passed)) {
            complete = false;
          }
        });
        statusByEmail[email] = { slots, complete };
      });

      let lmsAccess = "full";
      if (!rollupOutcome.ok) {
        const anyCertOk = Array.from(certResults.values()).some(
          (entry) => entry.status === "ok",
        );
        lmsAccess =
          rollupOutcome.code === "network" && !anyCertOk
            ? "unavailable"
            : "certs-only";
      }

      // Single state update for the whole judge list — never per judge/token.
      setResult({ statusByEmail, lmsAccess });
    } finally {
      if (runIdRef.current === runId) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled || !fingerprint) return;
    run(false);
  }, [enabled, fingerprint, hasToken, run]);

  const refresh = useCallback((force = true) => run(force), [run]);

  return {
    statusByEmail: result.statusByEmail,
    lmsAccess: result.lmsAccess,
    loading,
    refresh,
  };
}
