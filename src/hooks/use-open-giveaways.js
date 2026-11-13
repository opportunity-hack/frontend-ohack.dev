import useAuthedResource from "./use-authed-resource";
import { getOpenGiveaways } from "../lib/giveawayApi";

/** Sentinel for an older backend without /api/giveaways (404). */
export const GIVEAWAYS_UNAVAILABLE = Object.freeze({ unavailable: true });

/**
 * The profile tab's ONE request: open giveaways (plus closed/drawn ones the
 * caller entered) and the caller's current weight. Keys on token presence via
 * useAuthedResource — a token rotation never refetches or shows a spinner.
 * A 404 resolves to GIVEAWAYS_UNAVAILABLE; any other failure is `error`.
 */
export default function useOpenGiveaways({ enabled = true } = {}) {
  return useAuthedResource(
    "giveaways-open",
    ({ token, signal }) => getOpenGiveaways({ token, signal }),
    { enabled, treat404As: GIVEAWAYS_UNAVAILABLE },
  );
}
