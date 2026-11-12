import {
  buildQueue,
  currentBeat,
  currentWinner,
  drawReducer,
  initDrawState,
} from "../drawMachine";

const PRIZES = [
  { id: "mug", name: "Mug", quantity: 1, sort_order: 0 },
  { id: "kb", name: "Keyboard", quantity: 2, sort_order: 1 },
];
const ENTRIES = Array.from({ length: 30 }, (_, i) => ({
  user_id: `u${String(i).padStart(2, "0")}`,
  entries: 5 + (i % 7),
  all_prizes: true,
  user: { name: `Person ${i}` },
}));

const playToCheck = (state) => {
  let s = state;
  for (let i = 0; i < 200 && currentBeat(s)?.type !== "check"; i += 1) s = drawReducer(s, { type: "ADVANCE" });
  return s;
};

const won = (s, extra = {}) => ({
  id: `r${s.results.length}`,
  prize_id: s.current.prizeId,
  slot: s.current.slot,
  user_id: currentWinner(s).user_id,
  outcome: "won",
  ...extra,
});

test("queue follows the chosen draw order and skips filled slots", () => {
  expect(buildQueue(PRIZES, ["kb", "mug"], [])).toEqual([
    { prizeId: "kb", slot: 0 },
    { prizeId: "kb", slot: 1 },
    { prizeId: "mug", slot: 0 },
  ]);
  expect(buildQueue(PRIZES, [], [{ prize_id: "kb", slot: 0, outcome: "won" }])).toEqual([
    { prizeId: "mug", slot: 0 },
    { prizeId: "kb", slot: 1 },
  ]);
});

test("walk-through: winner → not here → redraw → confirm → next prize excludes the winner", () => {
  let s = initDrawState({ entries: ENTRIES, seed: "482913", prizes: PRIZES, drawOrder: ["mug", "kb"], results: [] });
  expect(currentBeat(s).type).toBe("prize");
  s = playToCheck(s);
  // ADVANCE never moves past the check beat.
  expect(drawReducer(s, { type: "ADVANCE" })).toBe(s);
  const first = currentWinner(s);
  const second = s.current.ranking[1];

  // Not here → redraw on the same slot; the new winner is the next in the ranking.
  s = drawReducer(s, { type: "SAVE_START" });
  s = drawReducer(s, {
    type: "ABSENT_SAVED",
    results: [{ id: "a1", prize_id: "mug", slot: 0, user_id: first.user_id, outcome: "absent" }],
  });
  expect(s.current.redraw).toBe(true);
  expect(s.current.attempt).toBe(1);
  expect(currentBeat(s).type).toBe("finalists");
  expect(s.current.script.beats.filter((b) => b.type === "leave")).toHaveLength(4);
  s = playToCheck(s);
  expect(currentWinner(s).user_id).toBe(second.user_id);

  // They're here → next prize, which excludes this winner and the absentee.
  const results = [...s.results, won(s)];
  s = drawReducer(s, { type: "WON_SAVED", results });
  expect(s.phase).toBe("next");
  s = drawReducer(s, { type: "ADVANCE" });
  expect(s.phase).toBe("stage");
  expect(s.current.prizeId).toBe("kb");
  const ids = s.current.ranking.map((e) => e.user_id);
  expect(ids).not.toContain(second.user_id);
  expect(ids).not.toContain(first.user_id);
});

test("a failed save keeps the operator on the check beat", () => {
  let s = playToCheck(initDrawState({ entries: ENTRIES, seed: "1", prizes: PRIZES, drawOrder: [], results: [] }));
  s = drawReducer(s, { type: "SAVE_START" });
  expect(drawReducer(s, { type: "ADVANCE" })).toBe(s);
  s = drawReducer(s, { type: "SAVE_FAILED", message: "Network down" });
  expect(s.error).toBe("Network down");
  expect(s.saving).toBe(false);
  expect(currentBeat(s).type).toBe("check");
  expect(s.phase).toBe("stage");
});

test("reduced motion: prize → winner → check", () => {
  const s = initDrawState({ entries: ENTRIES, seed: "1", prizes: PRIZES, drawOrder: [], results: [], reducedMotion: true });
  expect(s.current.script.beats.map((b) => b.type)).toEqual(["prize", "winner", "check"]);
});

test("S skips to the final three; nobody eligible → skip prize", () => {
  let s = initDrawState({ entries: ENTRIES, seed: "1", prizes: PRIZES, drawOrder: [], results: [] });
  s = drawReducer(s, { type: "SKIP_TO_FINAL" });
  expect(currentBeat(s).type).toBe("final3");

  let empty = initDrawState({ entries: [], seed: "1", prizes: PRIZES, drawOrder: [], results: [] });
  empty = drawReducer(empty, { type: "ADVANCE" });
  expect(currentBeat(empty).type).toBe("empty");
  empty = drawReducer(empty, { type: "SKIP_PRIZE" });
  expect(empty.current.prizeId).toBe("kb");
});

test("the last slot goes straight to the finale; a fully drawn giveaway opens on it", () => {
  const all = [
    { prize_id: "mug", slot: 0, user_id: "u01", outcome: "won" },
    { prize_id: "kb", slot: 0, user_id: "u02", outcome: "won" },
  ];
  let s = initDrawState({ entries: ENTRIES, seed: "1", prizes: PRIZES, drawOrder: [], results: all });
  expect(s.queue).toEqual([{ prizeId: "kb", slot: 1 }]);
  s = playToCheck(s);
  s = drawReducer(s, { type: "WON_SAVED", results: [...all, won(s)] });
  expect(s.phase).toBe("finale");
  const done = initDrawState({ entries: ENTRIES, seed: "1", prizes: PRIZES, drawOrder: [], results: [...all, { prize_id: "kb", slot: 1, user_id: "u03", outcome: "won" }] });
  expect(done.phase).toBe("finale");
});
