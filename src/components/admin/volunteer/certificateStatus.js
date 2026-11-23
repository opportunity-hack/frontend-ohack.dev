// Did this volunteer get their mentor/judge certificate for THIS event?
//
// Certificates live on the user record (history.certificates) and span every
// event. New entries carry `event_id` (stamped by BulkCertificateDialog →
// POST /api/hearts). Older entries have none, so they fall back to a date
// window after the event start.

const ROLE_BY_TYPE = { mentors: "mentor", judges: "judge" };
const LEGACY_WINDOW_MS = 120 * 24 * 60 * 60 * 1000;

export const certificateRoleForType = (type) => ROLE_BY_TYPE[type] || null;

export function eventCertificates(certs, { type, eventId, eventStartDate } = {}) {
  const role = certificateRoleForType(type);
  if (!role || !Array.isArray(certs)) return [];
  const start = eventStartDate ? new Date(eventStartDate).getTime() : NaN;

  return certs.filter((cert) => {
    if (!cert || typeof cert !== "object") return false;
    if (!Array.isArray(cert.reasons) || !cert.reasons.includes(role)) return false;
    if (cert.event_id) return cert.event_id === eventId;
    const sent = cert.timestamp ? new Date(cert.timestamp).getTime() : NaN;
    if (Number.isNaN(start) || Number.isNaN(sent)) return false;
    return sent >= start && sent < start + LEGACY_WINDOW_MS;
  });
}
