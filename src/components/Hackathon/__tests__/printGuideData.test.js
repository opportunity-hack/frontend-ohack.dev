import {
  parseSections,
  serializeSections,
  pickPerson,
  pickEvent,
  groupAvailability,
  groupCountdownsByDay,
  eventDayKeys,
  formatEventDates,
  initialsOf,
} from "../printGuideData";

describe("printGuideData", () => {
  describe("parseSections / serializeSections", () => {
    it("defaults to every section when the param is missing, empty, or junk", () => {
      expect(parseSections(undefined)).toEqual(["schedule", "mentors", "judges", "volunteers"]);
      expect(parseSections("")).toEqual(["schedule", "mentors", "judges", "volunteers"]);
      expect(parseSections("hackers,nope")).toEqual(["schedule", "mentors", "judges", "volunteers"]);
    });

    it("keeps canonical order and drops unknown ids", () => {
      expect(parseSections("volunteers, Schedule ,bogus")).toEqual(["schedule", "volunteers"]);
      expect(parseSections(["mentors", "judges"])).toEqual(["mentors", "judges"]);
    });

    it("serializes to an empty string when everything is selected (param omitted)", () => {
      expect(serializeSections(["judges", "schedule", "mentors", "volunteers"])).toBe("");
      expect(serializeSections(["judges", "schedule"])).toBe("schedule,judges");
    });
  });

  describe("pickPerson", () => {
    it("projects a public volunteer record to print-safe fields", () => {
      const person = pickPerson({
        id: "abc",
        name: "Ada Lovelace",
        pronouns: "she/her",
        companyName: "Analytical Engines",
        title: "Engineer",
        background: "Math, Computing",
        photoUrl: "https://cdn.ohack.dev/judges/ada.jpg",
        inPerson: "Yes!",
        availableDays: ["Saturday, Oct 11-Morning", 42],
        email: "should-not-leak@example.com",
      });
      expect(person).toEqual({
        id: "abc",
        name: "Ada Lovelace",
        pronouns: "she/her",
        org: "Analytical Engines",
        title: "Engineer",
        focus: "Math, Computing",
        photoUrl: "https://cdn.ohack.dev/judges/ada.jpg",
        inPerson: true,
        availableDays: ["Saturday, Oct 11-Morning"],
      });
      expect(person).not.toHaveProperty("email");
    });

    it("drops Google Drive photo links and treats virtual answers as not in person", () => {
      const person = pickPerson({
        name: "Bo",
        photoUrl: "https://drive.google.com/file/d/xyz/view",
        inPerson: "No, I'll be virtual",
      });
      expect(person.photoUrl).toBe("");
      expect(person.inPerson).toBe(false);
      expect(pickPerson({ name: "Cy" }).inPerson).toBeNull();
      expect(pickPerson(null)).toBeNull();
    });
  });

  describe("pickEvent", () => {
    it("never emits undefined and drops countdowns without a valid time", () => {
      const event = pickEvent(
        { id: "1", title: " Fall 2025 ", countdowns: [{ name: "Kickoff", time: "2025-10-11T09:00:00-0700" }, { name: "bad" }] },
        "2025_fall",
      );
      expect(event.event_id).toBe("2025_fall");
      expect(event.title).toBe("Fall 2025");
      expect(event.countdowns).toEqual([{ name: "Kickoff", time: "2025-10-11T09:00:00-0700", description: "" }]);
      Object.values(event).forEach((v) => expect(v).not.toBeUndefined());
    });
  });

  describe("groupAvailability", () => {
    it("groups slots by day and joins nested parts (volunteer role)", () => {
      expect(
        groupAvailability([
          "Saturday, Oct 11-Early Morning",
          "Saturday, Oct 11-Morning",
          "Sunday, Oct 12-Lunch-Food Service",
          "Saturday, Oct 11-Morning",
        ]),
      ).toEqual([
        { day: "Saturday, Oct 11", details: ["Early Morning", "Morning"] },
        { day: "Sunday, Oct 12", details: ["Lunch · Food Service"] },
      ]);
    });
  });

  describe("groupCountdownsByDay", () => {
    const tz = "America/Phoenix";
    const countdowns = [
      { name: "Awards", time: "2025-10-12T16:00:00-0700", description: "" },
      { name: "Kickoff", time: "2025-10-11T09:00:00-0700", description: "Welcome" },
      { name: "Nonprofits selected", time: "2025-09-07T12:00:00-0700", description: "" },
    ];

    it("sorts by time and groups by calendar day in the event timezone", () => {
      const { groups, filtered, total } = groupCountdownsByDay(countdowns, tz);
      expect(total).toBe(3);
      expect(filtered).toBe(false);
      expect(groups.map((g) => g.key)).toEqual(["2025-09-07", "2025-10-11", "2025-10-12"]);
      expect(groups[1].items[0]).toEqual({ name: "Kickoff", description: "Welcome", timeLabel: "9:00 AM" });
    });

    it("keeps only event days when asked, and falls back to everything if nothing matches", () => {
      const inWindow = groupCountdownsByDay(countdowns, tz, {
        eventDaysOnly: true,
        startDate: "2025-10-11",
        endDate: "2025-10-12",
      });
      expect(inWindow.filtered).toBe(true);
      expect(inWindow.groups.map((g) => g.key)).toEqual(["2025-10-11", "2025-10-12"]);

      const noMatch = groupCountdownsByDay(countdowns, tz, {
        eventDaysOnly: true,
        startDate: "2026-01-01",
        endDate: "2026-01-02",
      });
      expect(noMatch.filtered).toBe(false);
      expect(noMatch.groups).toHaveLength(3);
    });

    it("tolerates an event doc whose start_date is a day late (padded window)", () => {
      // Real case: 2025_fall has start_date 2025-10-12 but kickoff was Saturday 10-11.
      const { groups, filtered } = groupCountdownsByDay(countdowns, tz, {
        eventDaysOnly: true,
        startDate: "2025-10-12",
        endDate: "2025-10-13",
      });
      expect(filtered).toBe(true);
      expect(groups.map((g) => g.key)).toEqual(["2025-10-11", "2025-10-12"]);
    });

    it("survives an unknown timezone", () => {
      expect(() => groupCountdownsByDay(countdowns, "Not/AZone")).not.toThrow();
    });
  });

  it("eventDayKeys spans start..end inclusive from date-only strings, with optional padding", () => {
    expect([...eventDayKeys("2025-10-30", "2025-11-02", "America/Phoenix")]).toEqual([
      "2025-10-30",
      "2025-10-31",
      "2025-11-01",
      "2025-11-02",
    ]);
    expect([
      ...eventDayKeys("2025-10-12", "2025-10-12", "America/Phoenix", { padBefore: 1, padAfter: 1 }),
    ]).toEqual(["2025-10-11", "2025-10-12", "2025-10-13"]);
  });

  it("formatEventDates collapses same-month ranges", () => {
    expect(formatEventDates("2025-10-12", "2025-10-13")).toBe("Oct 12–13, 2025");
    expect(formatEventDates("2025-10-30", "2025-11-02")).toBe("Oct 30 – Nov 2, 2025");
    expect(formatEventDates("2025-10-12", "2025-10-12")).toBe("Oct 12, 2025");
    expect(formatEventDates("garbage")).toBe("");
  });

  it("initialsOf takes the first two words", () => {
    expect(initialsOf("Ada Byron Lovelace")).toBe("AB");
    expect(initialsOf("")).toBe("");
  });
});
