/**
 * Admin permission helpers — the ONE place that knows which PropelAuth
 * permissions open which admin surfaces, so pages can't drift.
 *
 * `org` is `userClass.getOrgByName("Opportunity Hack Org")` (an OrgInfo with
 * `.hasPermission`) — never `orgHelper` (plain objects, no methods).
 *
 * - `volunteer.admin` — global admin; superset of everything below.
 * - `checkin.admin`  — registration-desk helper: the check-in workbench
 *   (`/admin/hackathons/<event>?section=checkin`) and nothing else. Backed by
 *   the backend's `/api/checkin/*` routes (`require_any_permission`).
 */
export const ADMIN_PERMISSION = "volunteer.admin";
export const CHECKIN_PERMISSION = "checkin.admin";
export const CHECKIN_PERMISSIONS = [ADMIN_PERMISSION, CHECKIN_PERMISSION];

export const hasPermission = (org, permission) => {
  try {
    return Boolean(org?.hasPermission?.(permission));
  } catch {
    return false;
  }
};

export const hasAnyPermission = (org, permissions) =>
  (permissions || []).some((p) => hasPermission(org, p));

/** Full admin (every admin page + write). */
export const orgIsFullAdmin = (org) => hasPermission(org, ADMIN_PERMISSION);

/** May use the check-in workbench (full admin OR desk helper). */
export const orgCanCheckIn = (org) =>
  hasAnyPermission(org, CHECKIN_PERMISSIONS);

/** Desk helper only — can check in but must not see the rest of the admin. */
export const orgIsCheckInOnly = (org) =>
  orgCanCheckIn(org) && !orgIsFullAdmin(org);
