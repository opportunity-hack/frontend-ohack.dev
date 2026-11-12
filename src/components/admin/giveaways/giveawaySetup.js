/**
 * Pure helpers for the /admin/giveaways Setup tab: draft <-> payload,
 * validation (mirrors backend validate_giveaway_campaign_partial /
 * normalize_giveaway_prizes in common/utils/validators.py), dirtiness.
 */

export const LIMITS = {
  title: 120,
  description: 500,
  prizeName: 80,
  prizeDescription: 300,
  quantityMin: 1,
  quantityMax: 50,
  prizes: 50,
};

export const GIVEAWAY_ID_RE = /^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/;

let keySeq = 0;
const newKey = () => {
  keySeq += 1;
  return `new-${Date.now().toString(36)}-${keySeq}`;
};

/** "Fall 2026 giveaway" → "fall-2026-giveaway" (for the New giveaway id). */
export function slugifyGiveawayId(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function blankPrize() {
  return { _key: newKey(), name: "", description: "", quantity: 1, product_url: "", image_url: "" };
}

const prizeForDraft = (p) => ({
  _key: p.id || newKey(),
  id: p.id,
  name: p.name || "",
  description: p.description || "",
  quantity: Number(p.quantity) || 1,
  product_url: p.product_url || "",
  image_url: p.image_url || "",
});

export function draftFromGiveaway(g) {
  if (!g) return null;
  return {
    title: g.title || "",
    description: g.description || "",
    event_id: g.event_id || "",
    closes_at: g.closes_at || null,
    must_be_present: g.must_be_present !== false,
    status: g.status || "draft",
    prizes: [...(g.prizes || [])]
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map(prizeForDraft),
  };
}

const isHttpUrl = (value) => {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

/** {title?, prizes: {[_key]: {name?, description?, quantity?, product_url?}}} — empty ⇒ valid. */
export function validateDraft(draft) {
  const errors = { prizes: {} };
  if (!draft) return errors;
  const title = (draft.title || "").trim();
  if (!title) errors.title = "Give the giveaway a title.";
  else if (title.length > LIMITS.title) errors.title = `At most ${LIMITS.title} characters.`;
  if ((draft.description || "").trim().length > LIMITS.description) {
    errors.description = `At most ${LIMITS.description} characters.`;
  }
  if ((draft.prizes || []).length > LIMITS.prizes) errors.prizeCount = `At most ${LIMITS.prizes} prizes.`;
  for (const prize of draft.prizes || []) {
    const e = {};
    const name = (prize.name || "").trim();
    if (!name) e.name = "Name the prize.";
    else if (name.length > LIMITS.prizeName) e.name = `At most ${LIMITS.prizeName} characters.`;
    if ((prize.description || "").trim().length > LIMITS.prizeDescription) {
      e.description = `At most ${LIMITS.prizeDescription} characters.`;
    }
    const q = Number(prize.quantity);
    if (!Number.isInteger(q) || q < LIMITS.quantityMin || q > LIMITS.quantityMax) {
      e.quantity = `${LIMITS.quantityMin}–${LIMITS.quantityMax}`;
    }
    if (prize.product_url && !isHttpUrl(prize.product_url.trim())) {
      e.product_url = "Use a link that starts with https://";
    }
    if (Object.keys(e).length) errors.prizes[prize._key] = e;
  }
  return errors;
}

export function hasErrors(errors) {
  if (!errors) return false;
  return Boolean(
    errors.title || errors.description || errors.prizeCount || Object.keys(errors.prizes || {}).length,
  );
}

/** PATCH body for the backend. New prizes go without an id (server mints one). */
export function buildSavePayload(draft) {
  return {
    title: draft.title.trim(),
    description: (draft.description || "").trim(),
    event_id: draft.event_id || null,
    closes_at: draft.closes_at || null,
    must_be_present: Boolean(draft.must_be_present),
    status: draft.status,
    prizes: (draft.prizes || []).map((p) => {
      const out = {
        name: (p.name || "").trim(),
        description: (p.description || "").trim(),
        quantity: Number(p.quantity),
        product_url: (p.product_url || "").trim() || null,
        image_url: p.image_url || null,
      };
      if (p.id) out.id = p.id;
      return out;
    }),
  };
}

/** True when the draft would change the saved giveaway. */
export function isDraftDirty(draft, giveaway) {
  if (!draft || !giveaway) return false;
  const saved = draftFromGiveaway(giveaway);
  return JSON.stringify(buildSavePayload(draft)) !== JSON.stringify(buildSavePayload(saved));
}

/** Status the admin may pick; `drawn` is only reached by the draw. */
export const STATUS_OPTIONS = [
  { value: "draft", label: "Draft", help: "Only admins can see it." },
  { value: "open", label: "Open", help: "People can enter from their profile." },
  { value: "closed", label: "Closed", help: "Entries are locked; ready to draw." },
];

/** The picker's default: newest campaign that hasn't been drawn, else the newest. */
export function defaultGiveawayId(giveaways) {
  const list = giveaways || [];
  return (list.find((g) => g.status !== "drawn") || list[0])?.id || null;
}
