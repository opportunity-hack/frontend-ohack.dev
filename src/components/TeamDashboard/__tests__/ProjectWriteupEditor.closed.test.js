/**
 * The "Submissions closed" notice must say WHEN and WHY — a bare
 * "Submissions closed" (Oct 2026) left teams guessing whether they missed
 * the deadline, a late window, or just the event.
 */
import { describeClosedWindow } from "../ProjectWriteupEditor";

jest.mock("@uiw/react-md-editor", () => ({ default: () => null }), {
  virtual: true,
});

const event = { timezone: "America/Phoenix" };
const NOW = new Date("2026-10-12T20:00:00Z").getTime();

describe("describeClosedWindow", () => {
  it("names the deadline when there was no late window", () => {
    const { headline, detail } = describeClosedWindow(
      { deadline: "2026-10-11T17:00:00-07:00", lateUntil: null },
      event,
      NOW,
    );
    expect(headline).toMatch(/^Submissions closed .*5:00 PM MST/);
    expect(detail).toMatch(/No late window/);
    expect(detail).toMatch(/won't be saved/);
  });

  it("names both moments once the late window has also passed", () => {
    const { headline, detail } = describeClosedWindow(
      {
        deadline: "2026-10-11T17:00:00-07:00",
        lateUntil: "2026-10-12T09:00:00-07:00",
      },
      event,
      NOW,
    );
    expect(headline).toMatch(/Submissions closed .*9:00 AM MST/);
    expect(detail).toMatch(/deadline was .*5:00 PM MST/);
    expect(detail).toMatch(/late window has ended/);
  });

  it("frames a still-open late window as late, not closed", () => {
    const { headline, detail } = describeClosedWindow(
      {
        deadline: "2026-10-11T17:00:00-07:00",
        lateUntil: "2026-10-13T09:00:00-07:00",
      },
      event,
      NOW,
    );
    expect(headline).toMatch(/deadline .*has passed/);
    expect(detail).toMatch(/still open until .*9:00 AM MST/);
    expect(detail).not.toMatch(/won't be saved/);
  });

  it("degrades gracefully with no timestamps at all", () => {
    const { headline } = describeClosedWindow({}, event, NOW);
    expect(headline).toBe("Submissions closed.");
  });
});
