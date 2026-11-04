import {
  applicationState,
  attendanceMode,
  eventPhase,
  formatEventDates,
  partitionMentorEvents,
  splitAvailability,
  upcomingNotApplied,
} from "../mentorEvents";

const NOW = new Date(2026, 9, 11, 15, 0, 0); // Oct 11 2026, 3pm local

describe("eventPhase", () => {
  it("is live from the start date through the END of the end date", () => {
    const e = { start_date: "2026-10-10", end_date: "2026-10-12" };
    expect(eventPhase(e, NOW)).toBe("live");
    expect(eventPhase(e, new Date(2026, 9, 12, 23, 59))).toBe("live");
    expect(eventPhase(e, new Date(2026, 9, 13, 0, 0))).toBe("past");
    expect(eventPhase(e, new Date(2026, 9, 9, 23, 59))).toBe("upcoming");
  });

  it("treats a dateless event as upcoming, never past", () => {
    expect(eventPhase({}, NOW)).toBe("upcoming");
    expect(eventPhase({ start_date: "not a date" }, NOW)).toBe("upcoming");
  });

  it("uses the start date alone when there is no end date", () => {
    expect(eventPhase({ start_date: "2026-10-01" }, NOW)).toBe("live");
    expect(eventPhase({ start_date: "2026-11-01" }, NOW)).toBe("upcoming");
  });
});

describe("applicationState", () => {
  it("only ever renders a bare isSelected=false as awaiting confirmation", () => {
    expect(applicationState({ isSelected: false })).toBe("pending");
    expect(applicationState({})).toBe("pending");
    expect(applicationState(null)).toBe("pending");
    expect(applicationState({ isSelected: false, status: "approved" })).toBe(
      "pending",
    );
  });

  it("maps the explicit review status admins set", () => {
    expect(applicationState({ isSelected: true })).toBe("approved");
    expect(applicationState({ status: "Denied" })).toBe("not_selected");
    expect(applicationState({ status: "waitlisted" })).toBe("waitlisted");
    // The roster axis wins over a stale review status
    expect(applicationState({ isSelected: true, status: "denied" })).toBe(
      "approved",
    );
  });
});

describe("attendanceMode", () => {
  it("reads the mentor form's string convention first", () => {
    expect(attendanceMode({ inPerson: "Yes!" })).toBe("in_person");
    expect(attendanceMode({ inPerson: "No, I'll be virtual" })).toBe("virtual");
    expect(attendanceMode({ inPerson: "", isInPerson: true })).toBe(null);
    expect(attendanceMode({ isInPerson: false })).toBe("virtual");
    expect(attendanceMode({})).toBe(null);
  });
});

describe("splitAvailability", () => {
  it("splits machine-generated slot strings and dedupes", () => {
    const text =
      "Saturday Oct 11: ☀️ Morning (9am - 12pm MST), Saturday Oct 11: 🏙️ Afternoon (1pm - 5pm MST), Saturday Oct 11: ☀️ Morning (9am - 12pm MST)";
    expect(splitAvailability(text)).toEqual([
      "Saturday Oct 11: ☀️ Morning (9am - 12pm MST)",
      "Saturday Oct 11: 🏙️ Afternoon (1pm - 5pm MST)",
    ]);
  });

  it("falls back to a comma split for free text and passes arrays through", () => {
    expect(splitAvailability("Friday evening, Saturday all day")).toEqual([
      "Friday evening",
      "Saturday all day",
    ]);
    expect(splitAvailability(["A", " B ", "", "A"])).toEqual(["A", "B"]);
    expect(splitAvailability("")).toEqual([]);
    expect(splitAvailability(undefined)).toEqual([]);
  });
});

describe("partitionMentorEvents / upcomingNotApplied", () => {
  const events = [
    { event_id: "past-2", start_date: "2025-03-01", end_date: "2025-03-02" },
    { event_id: "up-2", start_date: "2027-01-10", end_date: "2027-01-11" },
    { event_id: "live", start_date: "2026-10-10", end_date: "2026-10-12" },
    { event_id: "past-1", start_date: "2025-10-01", end_date: "2025-10-02" },
    { event_id: "up-1", start_date: "2026-11-20", end_date: "2026-11-21" },
  ];

  it("groups by phase, soonest-first for live/upcoming and newest-first for past", () => {
    const g = partitionMentorEvents(events, NOW);
    expect(g.live.map((e) => e.event_id)).toEqual(["live"]);
    expect(g.upcoming.map((e) => e.event_id)).toEqual(["up-1", "up-2"]);
    expect(g.past.map((e) => e.event_id)).toEqual(["past-1", "past-2"]);
  });

  it("lists current hackathons the mentor has not applied to, skipping ended ones", () => {
    const hackathons = [
      { event_id: "up-1", start_date: "2026-11-20", end_date: "2026-11-21" },
      {
        event_id: "new-late",
        start_date: "2027-02-01",
        end_date: "2027-02-02",
      },
      {
        event_id: "new-soon",
        start_date: "2026-12-01",
        end_date: "2026-12-02",
      },
      { event_id: "ended", start_date: "2026-09-01", end_date: "2026-09-02" },
      { title: "no id" },
    ];
    expect(
      upcomingNotApplied(hackathons, events, NOW).map((h) => h.event_id),
    ).toEqual(["new-soon", "new-late"]);
  });
});

describe("formatEventDates", () => {
  it("collapses ranges sensibly", () => {
    expect(formatEventDates("2026-10-11", "2026-10-12")).toBe(
      "Oct 11 – 12, 2026",
    );
    expect(formatEventDates("2026-10-31", "2026-11-01")).toBe(
      "Oct 31 – Nov 1, 2026",
    );
    expect(formatEventDates("2026-10-11", "2026-10-11")).toBe("Oct 11, 2026");
    expect(formatEventDates("2026-10-11", null)).toBe("Oct 11, 2026");
    expect(formatEventDates(null, null)).toBe("");
  });
});
