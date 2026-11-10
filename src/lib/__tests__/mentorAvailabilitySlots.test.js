/**
 * The availability parser was moved verbatim out of mentor-checkin.js; these
 * snapshots pin its behaviour on real mentor-form strings so a later edit
 * can't silently change which shifts mentors see.
 */
import {
  parseAvailabilitySlots,
  findCurrentSlot,
} from "../mentorAvailabilitySlots";

const strip = (slots) => slots.map(({ id, ...rest }) => rest);

describe("parseAvailabilitySlots", () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-10-01T12:00:00-07:00"));
  });
  afterAll(() => jest.useRealTimers());

  it("empty / non-string input", () => {
    expect(parseAvailabilitySlots("")).toEqual([]);
    expect(parseAvailabilitySlots(null)).toEqual([]);
    expect(parseAvailabilitySlots(["Saturday"])).toEqual([]);
  });

  it("two shifts on one day (mentor.test.js fixture)", () => {
    const slots = parseAvailabilitySlots(
      "Saturday Oct 11: ☀️ Morning (9am - 12pm MST), Saturday Oct 11: 🏙️ Afternoon (1pm - 5pm MST)",
    );
    expect(strip(slots)).toMatchSnapshot();
    expect(slots.every((s) => typeof s.id === "string")).toBe(true);
  });

  it("shifts across two days in mixed order", () => {
    expect(
      strip(
        parseAvailabilitySlots(
          "Sunday Oct 12: 🌅 Early Morning (7am - 9am MST), Saturday Oct 11: 🌆 Evening (5pm - 8pm MST), Saturday Oct 11: ☀️ Morning (9am - 12pm MST)",
        ),
      ),
    ).toMatchSnapshot();
  });

  it("legacy bare day names fall back to the comma split", () => {
    expect(strip(parseAvailabilitySlots("Friday, Saturday"))).toMatchSnapshot();
  });
});

describe("findCurrentSlot", () => {
  it("finds the slot whose time range contains now", () => {
    const slots = parseAvailabilitySlots(
      "Saturday Oct 11: ☀️ Morning (9am - 12pm MST), Saturday Oct 11: 🏙️ Afternoon (1pm - 5pm MST)",
    );
    const year = new Date().getFullYear();
    const at = (h) => new Date(year, 9, 11, h, 30);
    expect(findCurrentSlot(slots, at(10))?.timePeriod).toMatch(/Morning/);
    expect(findCurrentSlot(slots, at(14))?.timePeriod).toMatch(/Afternoon/);
    expect(findCurrentSlot(slots, at(20))).toBeNull();
    expect(findCurrentSlot([], at(10))).toBeNull();
  });
});
