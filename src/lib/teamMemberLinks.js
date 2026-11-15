// Where a team roster entry links to.
//
// `/profile/<id>` expects the person's user DOCUMENT id. A roster entry is
// either that id as a string (older payloads) or an object `{ id, user_id,
// name, … }`, where `user_id` is the id their login provider gave them
// (`oauth2|slack|…`, `oauth2|google-oauth2|…`). Linking with `user_id` built
// dead URLs like `/profile/oauth2|google-oauth2|1150…` and put the provider
// id in the address bar, so only `id` is ever used here.

const LOGIN_ID_PREFIX = "oauth2|";

const isLoginId = (value) =>
  typeof value === "string" && value.startsWith(LOGIN_ID_PREFIX);

/** The user document id of a roster entry, or null when it has none. */
export function memberDocId(member) {
  if (!member) return null;
  const id = typeof member === "string" ? member : member.id;
  if (typeof id !== "string" || !id.trim() || isLoginId(id)) return null;
  return id.trim();
}

/** `/profile/<doc id>` for a roster entry, or null (render the name unlinked). */
export function memberProfileHref(member) {
  const id = memberDocId(member);
  return id ? `/profile/${encodeURIComponent(id)}` : null;
}
