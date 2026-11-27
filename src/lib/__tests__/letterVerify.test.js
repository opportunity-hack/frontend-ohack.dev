import { LETTER_ID_RE, VERIFY_STATUS, verifyView } from "../letterVerify";

describe("verifyView", () => {
  const letter = {
    name_on_letter: "Ada King",
    role: "mentor",
    event_title: "Opportunity Hack Fall 2026",
    served_date: "November 14, 2026",
    issued_at: "2026-11-27T18:00:00Z",
    status: "issued",
  };

  it("valid", () => {
    expect(verifyView(letter)).toEqual({
      status: VERIFY_STATUS.VALID,
      name: "Ada King",
      role: "Mentor",
      eventTitle: "Opportunity Hack Fall 2026",
      servedDate: "November 14, 2026",
      issued: "November 27, 2026",
    });
  });

  it("revoked / not found / unavailable", () => {
    expect(verifyView({ ...letter, status: "revoked" }).status).toBe(VERIFY_STATUS.REVOKED);
    expect(verifyView(null)).toEqual({ status: VERIFY_STATUS.NOT_FOUND });
    expect(verifyView(null, true)).toEqual({ status: VERIFY_STATUS.UNAVAILABLE });
  });

  it("only carries the verify payload's fields", () => {
    const view = verifyView({ ...letter, email: "ada@example.com", user_id: "p1" });
    expect(JSON.stringify(view)).not.toMatch(/ada@example|p1/);
  });

  it("letter id format", () => {
    expect(LETTER_ID_RE.test("ABCDEFGHJKMN")).toBe(true);
    expect(LETTER_ID_RE.test("abcdefghjkmn")).toBe(false);
    expect(LETTER_ID_RE.test("ABC")).toBe(false);
  });
});
