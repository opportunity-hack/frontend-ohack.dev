/**
 * Pure helpers for the create-team "Choose projects" step.
 *
 * A team ranks ONE flat list of projects (problem statements). Each entry is
 * `{ nonprofitId, nonprofitName, projectId, title }`; several entries may come
 * from the same nonprofit. The backend (`queue_team` →
 * `validate_project_rankings`) enforces the same limits, using the same
 * `GET /api/team/<event_id>/project-options` list the page shows, so the page
 * and the API can't disagree.
 */

export const RANKING_MIN = 2;
export const RANKING_MAX = 5;

const asArray = (v) => (Array.isArray(v) ? v : []);
const lower = (v) => (typeof v === "string" ? v.toLowerCase() : "");

/**
 * Normalise the project-options payload so every consumer can rely on
 * `nonprofits[].projects[]` being arrays and `skills` being a string array.
 */
export function normalizeProjectOptions(payload) {
  return asArray(payload?.nonprofits)
    .filter((np) => np && np.id)
    .map((np) => ({
      ...np,
      name: np.name || "Unnamed nonprofit",
      projects: asArray(np.projects)
        .filter((p) => p && p.id)
        .map((p) => ({
          ...p,
          title: p.title || "Untitled project",
          description: typeof p.description === "string" ? p.description : "",
          skills: asArray(p.skills).filter((s) => typeof s === "string"),
        })),
    }))
    .filter((np) => np.projects.length > 0);
}

/** Total selectable projects across every nonprofit. */
export function countProjects(nonprofits) {
  return asArray(nonprofits).reduce(
    (sum, np) => sum + asArray(np?.projects).length,
    0,
  );
}

/**
 * `{min, max}` for an event with `totalAvailable` projects: 2–5, or every
 * project when the event has fewer than 2.
 */
export function rankingLimits(totalAvailable) {
  const total = Math.max(0, Number(totalAvailable) || 0);
  return {
    min: Math.min(RANKING_MIN, total),
    max: Math.min(RANKING_MAX, total),
  };
}

export function isRanked(ranked, projectId) {
  return asArray(ranked).some((r) => r.projectId === projectId);
}

/** Build a ranked entry from an options nonprofit + project. */
export function toRankedEntry(nonprofit, project) {
  return {
    nonprofitId: nonprofit.id,
    nonprofitName: nonprofit.name,
    projectId: project.id,
    title: project.title,
  };
}

/**
 * Add the project to the end of the ranking, or remove it when it's already
 * ranked. Adding past `max` is a no-op (the UI disables the button too).
 */
export function toggleProject(ranked, entry, max = RANKING_MAX) {
  const list = asArray(ranked);
  if (!entry || !entry.projectId) return list;
  if (isRanked(list, entry.projectId)) {
    return list.filter((r) => r.projectId !== entry.projectId);
  }
  if (list.length >= max) return list;
  return [...list, entry];
}

/** Move the entry at `from` to `to`. Out-of-range moves return the input. */
export function moveProject(ranked, from, to) {
  const list = asArray(ranked);
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= list.length ||
    to >= list.length
  ) {
    return list;
  }
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** The `nonprofitRankings` body for `POST /api/team/queue`. */
export function rankingsPayload(ranked) {
  return asArray(ranked).map((r, index) => ({
    nonprofit_id: r.nonprofitId,
    problem_statement_id: r.projectId,
    rank: index + 1,
  }));
}

/**
 * Plain-language reason the ranking can't be submitted yet, or null.
 * `totalAvailable` null/undefined (options not loaded) is reported as such.
 */
export function rankingError(ranked, totalAvailable) {
  const count = asArray(ranked).length;
  if (totalAvailable == null) return "Projects are still loading.";
  const { min, max } = rankingLimits(totalAvailable);
  if (max === 0) return "This hackathon has no projects open for teams yet.";
  if (count < min) {
    return min === 1
      ? "Add the project to your ranking."
      : `Rank at least ${min} projects.`;
  }
  if (count > max) return `You can rank up to ${max} projects.`;
  return null;
}

/**
 * Drop ranked entries that are no longer selectable (after a refetch — a
 * project was hidden, or moved to production). Keeps order; refreshes names.
 */
export function pruneRanked(ranked, nonprofits) {
  const byProject = new Map();
  asArray(nonprofits).forEach((np) => {
    asArray(np.projects).forEach((p) => {
      byProject.set(p.id, { np, p });
    });
  });
  return asArray(ranked)
    .filter((r) => {
      const hit = byProject.get(r.projectId);
      return hit && hit.np.id === r.nonprofitId;
    })
    .map((r) => {
      const { np, p } = byProject.get(r.projectId);
      return toRankedEntry(np, p);
    });
}

/**
 * Search by nonprofit name, project title or skill. A nonprofit whose name
 * matches keeps all its projects; otherwise only its matching projects stay.
 */
export function filterProjectOptions(nonprofits, term) {
  const list = asArray(nonprofits);
  const q = lower(term).trim();
  if (!q) return list;
  return list
    .map((np) => {
      if (lower(np.name).includes(q)) return np;
      const projects = asArray(np.projects).filter(
        (p) =>
          lower(p.title).includes(q) ||
          asArray(p.skills).some((s) => lower(s).includes(q)),
      );
      return projects.length > 0 ? { ...np, projects } : null;
    })
    .filter(Boolean);
}
