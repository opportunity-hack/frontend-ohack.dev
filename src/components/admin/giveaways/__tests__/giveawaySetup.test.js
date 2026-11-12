import {
  blankPrize,
  buildSavePayload,
  draftFromGiveaway,
  hasErrors,
  isDraftDirty,
  slugifyGiveawayId,
  validateDraft,
} from "../giveawaySetup";

const GIVEAWAY = {
  id: "fall-2026",
  title: "Fall giveaway",
  description: "",
  event_id: "2026_fall",
  closes_at: "2026-11-14T16:00:00-07:00",
  must_be_present: true,
  status: "open",
  prizes: [
    { id: "p2", name: "Keyboard", quantity: 3, sort_order: 1 },
    { id: "p1", name: "Headphones", quantity: 1, sort_order: 0, product_url: "https://x.test/h" },
  ],
};

test("draft is sorted by sort_order and round-trips without being dirty", () => {
  const draft = draftFromGiveaway(GIVEAWAY);
  expect(draft.prizes.map((p) => p.id)).toEqual(["p1", "p2"]);
  expect(isDraftDirty(draft, GIVEAWAY)).toBe(false);
  draft.prizes.reverse();
  expect(isDraftDirty(draft, GIVEAWAY)).toBe(true);
});

test("save payload keeps existing ids, omits ids for new prizes, nulls empty links", () => {
  const draft = draftFromGiveaway(GIVEAWAY);
  draft.prizes.push({ ...blankPrize(), name: "  Mug ", quantity: "2" });
  const payload = buildSavePayload(draft);
  expect(payload.prizes.map((p) => p.id)).toEqual(["p1", "p2", undefined]);
  expect(payload.prizes[2]).toEqual({
    name: "Mug", description: "", quantity: 2, product_url: null, image_url: null,
  });
  expect(payload.prizes[2]).not.toHaveProperty("_key");
  expect(payload).toMatchObject({ title: "Fall giveaway", status: "open", event_id: "2026_fall" });
});

test("validation blocks a missing title, unnamed prizes, bad quantities and links", () => {
  const draft = draftFromGiveaway(GIVEAWAY);
  expect(hasErrors(validateDraft(draft))).toBe(false);
  draft.title = " ";
  const bad = { ...blankPrize(), quantity: 0, product_url: "javascript:alert(1)" };
  draft.prizes.push(bad);
  const errors = validateDraft(draft);
  expect(errors.title).toBeTruthy();
  expect(errors.prizes[bad._key]).toEqual({
    name: "Name the prize.",
    quantity: "1–50",
    product_url: "Use a link that starts with https://",
  });
  expect(hasErrors(errors)).toBe(true);
});

test("slugifyGiveawayId", () => {
  expect(slugifyGiveawayId("Fall 2026 — Giveaway!")).toBe("fall-2026-giveaway");
});
