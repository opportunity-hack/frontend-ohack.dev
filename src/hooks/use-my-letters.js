import useAuthedResource from "./use-authed-resource";
import lettersApi from "../lib/lettersApi";

/**
 * The caller's participation-letter rows — `GET /api/letters/mine`.
 * A 404 (older backend) resolves to `null`: the profile renders no letter
 * actions at all. Any other failure is `error` (never "no letters").
 */
export default function useMyLetters({ enabled = true } = {}) {
  return useAuthedResource(
    "letters-mine",
    ({ token }) => lettersApi.mine(token),
    { enabled, treat404As: null },
  );
}
