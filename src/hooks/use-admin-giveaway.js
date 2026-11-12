import useAuthedResource from "./use-authed-resource";
import {
  getAdminGiveaway,
  getAdminGiveawayEntries,
  listAdminGiveaways,
} from "../lib/giveawayApi";

export const ADMIN_GIVEAWAYS_UNAVAILABLE = Object.freeze({ unavailable: true });

/** Lean campaign list for the /admin/giveaways picker. */
export function useAdminGiveaways(orgId, { enabled = true } = {}) {
  return useAuthedResource(
    ["admin-giveaways", orgId],
    ({ token, signal }) => listAdminGiveaways({ token, orgId, signal }),
    { enabled: enabled && Boolean(orgId), treat404As: ADMIN_GIVEAWAYS_UNAVAILABLE },
  );
}

/**
 * One campaign (incl. its draw) + its full entry list, fetched together:
 * `data = {giveaway, entries}`. The entry list is the ONLY input the draw
 * uses — the Entries tab's search/filter is display-only.
 */
export function useAdminGiveaway(giveawayId, orgId, { enabled = true } = {}) {
  return useAuthedResource(
    ["admin-giveaway", giveawayId, orgId],
    async ({ token, signal }) => {
      const opts = { token, orgId, signal };
      const [giveaway, entryList] = await Promise.all([
        getAdminGiveaway(giveawayId, opts),
        getAdminGiveawayEntries(giveawayId, opts),
      ]);
      return { giveaway, entries: entryList?.entries || [] };
    },
    { enabled: enabled && Boolean(giveawayId) && Boolean(orgId) },
  );
}
