import {
  rankMyTeams,
  teamPhase,
  currentHackerEvent,
  PHASE_LABELS,
} from "../myTeams";

const NOW = new Date(2026, 9, 11, 12, 0, 0); // Oct 11 2026, mid-event

const team = (id, start, end, extra = {}) => ({
  id,
  name: id,
  hackathon_event_id: `ev-${id}`,
  event: start
    ? { event_id: `ev-${id}`, start_date: start, end_date: end }
    : null,
  ...extra,
});

describe("rankMyTeams", () => {
  it("puts a live event first, then soonest upcoming, then past newest-first", () => {
    const teams = [
      team("old-2024", "2024-10-12", "2024-10-14"),
      team("later-2027", "2027-03-01", "2027-03-03"),
      team("past-2025", "2025-10-11", "2025-10-13"),
      team("live", "2026-10-10", "2026-10-12"),
      team("soon-2026-12", "2026-12-05", "2026-12-06"),
      team("undated"),
    ];
    expect(rankMyTeams(teams, NOW).map((t) => `${t.id}:${t.phase}`)).toEqual([
      "live:live",
      "soon-2026-12:upcoming",
      "later-2027:upcoming",
      "undated:upcoming",
      "past-2025:past",
      "old-2024:past",
    ]);
  });

  it("keeps the server order for ties and tolerates bad input", () => {
    const a = team("a", "2025-10-11", "2025-10-13");
    const b = team("b", "2025-10-11", "2025-10-13");
    expect(rankMyTeams([a, b, null], NOW).map((t) => t.id)).toEqual(["a", "b"]);
    expect(rankMyTeams(undefined)).toEqual([]);
  });

  it("teamPhase treats the end date as inclusive", () => {
    expect(
      teamPhase(
        team("x", "2026-10-10", "2026-10-12"),
        new Date(2026, 9, 12, 23),
      ),
    ).toBe("live");
    expect(
      teamPhase(
        team("x", "2026-10-10", "2026-10-12"),
        new Date(2026, 9, 13, 0, 1),
      ),
    ).toBe("past");
    expect(PHASE_LABELS.live).toBe("Happening now");
  });
});

describe("currentHackerEvent", () => {
  const hackathons = [
    {
      event_id: "2025_fall",
      title: "Fall 2025",
      start_date: "2025-10-11",
      end_date: "2025-10-13",
      roles: ["Hacker"],
    },
    {
      event_id: "fall-2026",
      title: "Fall 2026",
      start_date: "2026-10-10",
      end_date: "2026-10-12",
      roles: ["Mentor"],
    },
    {
      event_id: "winter-2026",
      title: "Winter 2026",
      start_date: "2026-12-05",
      end_date: "2026-12-06",
      roles: ["hacker", "Volunteer"],
    },
    {
      event_id: "spring-2027",
      title: "Spring 2027",
      start_date: "2027-03-01",
      end_date: "2027-03-02",
      roles: ["Hacker"],
    },
  ];

  it("picks the live or soonest upcoming event where the person is a hacker", () => {
    // fall-2026 is live but as a mentor → skipped; winter is the next hacker event
    expect(currentHackerEvent(hackathons, NOW)?.event_id).toBe("winter-2026");
  });

  it("prefers a live hacker event over an upcoming one", () => {
    const live = [
      ...hackathons,
      {
        event_id: "live-now",
        start_date: "2026-10-11",
        end_date: "2026-10-11",
        roles: ["Hacker"],
      },
    ];
    expect(currentHackerEvent(live, NOW)?.event_id).toBe("live-now");
  });

  it("returns null with no upcoming hacker registration", () => {
    expect(currentHackerEvent(hackathons.slice(0, 2), NOW)).toBeNull();
    expect(currentHackerEvent(null, NOW)).toBeNull();
  });
});
