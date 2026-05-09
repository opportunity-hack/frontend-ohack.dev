/**
 * Card status — single source of truth for the option list, labels, and colors.
 *
 * Mirrors backend ALLOWED_CARD_STATUSES in model/planning.py. Any addition here
 * must also be added there or the PATCH will return 400.
 */

export const CARD_STATUSES = [
  {
    id: "planned",
    label: "Planned",
    // Neutral grey — implies "queued, not yet started"
    color: "#90a4ae",
    // Used for icons / chip backgrounds
    palette: "default",
  },
  {
    id: "in_progress",
    label: "In progress",
    color: "#1976d2",
    palette: "info",
  },
  {
    id: "blocked",
    label: "Blocked",
    color: "#d32f2f",
    palette: "error",
  },
  {
    id: "completed",
    label: "Completed",
    color: "#2e7d32",
    palette: "success",
  },
];

export function statusMeta(id) {
  return CARD_STATUSES.find((s) => s.id === id) || null;
}
