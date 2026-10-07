// Fetch helper for getStaticProps (ISR). Semantics:
//   404 or isEmpty(data) -> { kind: "not_found" }  (caller returns notFound + short revalidate)
//   other non-2xx / network error / timeout -> THROWS, so ISR keeps serving
//   the last good copy instead of caching a 404 or an empty page.
// Only use it where a throw is safe: request-time renders (paths: [] +
// fallback "blocking"). A throw during `next build` fails the whole deploy,
// so list pages that build at deploy time must catch instead.
export const NOT_FOUND_REVALIDATE = 60;

export async function fetchForStaticProps(url, { isEmpty = () => false, timeoutMs = 15000, init } = {}) {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
  if (res.status === 404) return { kind: "not_found" };
  if (!res.ok) throw new Error(`Upstream ${res.status} for ${url}`);
  const data = await res.json();
  if (isEmpty(data)) return { kind: "not_found" };
  return { kind: "ok", data };
}
