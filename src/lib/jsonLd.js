// Serialise structured data for an inline <script type="application/ld+json">.
// JSON.stringify alone is NOT safe there: a user-controlled string containing
// "</script>" would close the tag and inject HTML. Escaping every "<" as
// \u003c keeps the JSON identical once parsed.
export function serializeJsonLd(obj) {
  if (obj === undefined || obj === null) return "";
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}
