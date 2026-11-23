import { eventCertificates } from "../certificateStatus";

const ctx = { type: "mentors", eventId: "fall-2026", eventStartDate: "2026-10-10" };

describe("eventCertificates", () => {
  it("matches by event_id and role", () => {
    const certs = [
      { filename: "a.png", reasons: ["mentor"], event_id: "fall-2026" },
      { filename: "b.png", reasons: ["mentor"], event_id: "spring-2026" },
      { filename: "c.png", reasons: ["judge"], event_id: "fall-2026" },
    ];
    expect(eventCertificates(certs, ctx).map((c) => c.filename)).toEqual(["a.png"]);
  });

  it("falls back to a date window for entries without event_id", () => {
    const certs = [
      { filename: "in.png", reasons: ["mentor"], timestamp: "2026-10-20T10:00:00" },
      { filename: "before.png", reasons: ["mentor"], timestamp: "2026-04-01T10:00:00" },
      { filename: "later.png", reasons: ["mentor"], timestamp: "2027-04-01T10:00:00" },
      "legacy-string.png",
    ];
    expect(eventCertificates(certs, ctx).map((c) => c.filename)).toEqual(["in.png"]);
  });

  it("returns nothing for non mentor/judge tabs", () => {
    expect(eventCertificates([{ reasons: ["mentor"], event_id: "fall-2026" }], { ...ctx, type: "hackers" })).toEqual([]);
  });
});
