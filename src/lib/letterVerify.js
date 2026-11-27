// Pure helpers for the public letter verification page (/letters/verify/[id]).
import { roleLabel } from "../components/Profile/Letters/letterStates";

export const LETTER_ID_RE = /^[A-Z2-7]{12}$/;

export const VERIFY_STATUS = Object.freeze({
  VALID: "valid",
  REVOKED: "revoked",
  NOT_FOUND: "not_found",
  UNAVAILABLE: "unavailable",
});

export function formatIssued(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/Phoenix",
  });
}

/** Map the verify payload (or a failure) to what the page shows. Pure. */
export function verifyView(letter, failed = false) {
  if (failed) return { status: VERIFY_STATUS.UNAVAILABLE };
  if (!letter) return { status: VERIFY_STATUS.NOT_FOUND };
  return {
    status: letter.status === "issued" ? VERIFY_STATUS.VALID : VERIFY_STATUS.REVOKED,
    name: letter.name_on_letter || "",
    role: roleLabel(letter.role),
    eventTitle: letter.event_title || "",
    servedDate: letter.served_date || "",
    issued: formatIssued(letter.issued_at),
  };
}
