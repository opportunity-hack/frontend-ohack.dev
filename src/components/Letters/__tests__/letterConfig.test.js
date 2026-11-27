import {
  LETTER_LABELS,
  LETTER_TYPES,
  PROFILE_LETTERS_PATH,
  runChecklist,
} from "../letterConfig";


describe("runChecklist (generator keeps only General + OPT)", () => {
  it("sends mentors and judges to their profile instead of producing a letter", () => {
    expect(runChecklist({ role: "mentor" })).toEqual({ letterType: null, redirectTo: PROFILE_LETTERS_PATH });
    expect(runChecklist({ role: "judge" })).toEqual({ letterType: null, redirectTo: PROFILE_LETTERS_PATH });
    expect(PROFILE_LETTERS_PATH).toBe("/profile#volunteer-history");
  });

  it("only offers General and OPT letter types", () => {
    expect(Object.values(LETTER_TYPES).sort()).toEqual(["general", "opt"]);
    expect(Object.keys(LETTER_LABELS).sort()).toEqual(["general", "opt"]);
  });

  it("keeps the software branch table intact", () => {
    expect(runChecklist({ role: "software", needsImmigration: "no" }).letterType).toBe("general");
    expect(runChecklist({ role: "software", needsImmigration: "yes", optType: "stem" })).toMatchObject({
      letterType: "general",
      block: true,
    });
    expect(runChecklist({ role: "software", needsImmigration: "yes", optType: "unsure" }).letterType).toBe("general");
    expect(runChecklist({ role: "software", needsImmigration: "yes", optType: "initial", ack: {} })).toEqual({
      letterType: null,
      needsAck: true,
    });
    expect(runChecklist({})).toEqual({ letterType: null });
  });
});

describe("OPT still needs every acknowledgment", () => {
  // eslint-disable-next-line global-require
  const { OPT_ACKNOWLEDGMENTS } = require("../letterConfig");
  it("unlocks OPT only when all are checked", () => {
    const ack = Object.fromEntries(OPT_ACKNOWLEDGMENTS.map((a) => [a.key, true]));
    expect(runChecklist({ role: "software", needsImmigration: "yes", optType: "initial", ack }).letterType).toBe("opt");
  });
});
