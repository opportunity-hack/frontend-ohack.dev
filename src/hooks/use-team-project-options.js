import { useMemo } from "react";
import useAuthedResource from "./use-authed-resource";
import { fetchTeamProjectOptions } from "../lib/teamProjectApi";
import { countProjects, normalizeProjectOptions } from "../lib/projectRanking";

/**
 * The projects a team may rank for an event — ONE request
 * (`GET /api/team/<event_id>/project-options`), replacing the old
 * per-nonprofit + per-project fetch waterfall.
 *
 * `enabled` lets the create flow load it lazily (when the "Choose projects"
 * step is first reached). Any failure — including a 404, which means either
 * an older backend without the route or `event_not_found` — is
 * `status: "error"` so the step renders a Retry card, never an empty
 * "no projects" claim.
 *
 * @returns {{status, nonprofits: Array|null, totalProjects: number|null,
 *   reload: Function}}
 */
export default function useTeamProjectOptions(
  eventId,
  { enabled = true } = {},
) {
  const resource = useAuthedResource(
    ["team-project-options", eventId],
    async ({ token, signal }) =>
      normalizeProjectOptions(
        await fetchTeamProjectOptions(eventId, { token, signal }),
      ),
    { enabled: Boolean(eventId) && Boolean(enabled) },
  );

  const nonprofits = resource.status === "ready" ? resource.data || [] : null;
  const totalProjects = useMemo(
    () => (nonprofits ? countProjects(nonprofits) : null),
    [nonprofits],
  );

  return {
    status: resource.status,
    nonprofits,
    totalProjects,
    reload: resource.reload,
  };
}
