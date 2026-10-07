import {
  validateDeadlines,
  upsertCountdownByName,
  hoursBeforeLabel,
} from "../deadlinesUtils";

describe("validateDeadlines", () => {
  it("returns no errors/warnings for an empty or fully-unset object", () => {
    expect(validateDeadlines(undefined)).toEqual({ errors: {}, warnings: {} });
    expect(validateDeadlines({})).toEqual({ errors: {}, warnings: {} });
  });

  it("errors when the late window ends before the submission deadline", () => {
    const { errors } = validateDeadlines({
      submission: "2026-10-11T15:00:00-07:00",
      late_submission_until: "2026-10-11T14:00:00-07:00",
    });
    expect(errors.late_submission_until).toMatch(/late-submission window/i);
  });

  it("allows the late window to equal the submission deadline", () => {
    const { errors } = validateDeadlines({
      submission: "2026-10-11T15:00:00-07:00",
      late_submission_until: "2026-10-11T15:00:00-07:00",
    });
    expect(errors.late_submission_until).toBeUndefined();
  });

  it("errors when voting closes at or before it opens", () => {
    const same = validateDeadlines({
      voting_opens: "2026-10-11T15:00:00-07:00",
      voting_closes: "2026-10-11T15:00:00-07:00",
    });
    expect(same.errors.voting_closes).toMatch(/close after it opens/i);

    const before = validateDeadlines({
      voting_opens: "2026-10-11T15:00:00-07:00",
      voting_closes: "2026-10-11T14:00:00-07:00",
    });
    expect(before.errors.voting_closes).toMatch(/close after it opens/i);
  });

  it("warns (does not error) when voting opens before the submission deadline", () => {
    const { errors, warnings } = validateDeadlines({
      submission: "2026-10-11T15:00:00-07:00",
      voting_opens: "2026-10-10T15:00:00-07:00",
    });
    expect(errors.voting_opens).toBeUndefined();
    expect(warnings.voting_opens).toMatch(/before the submission deadline/i);
  });

  it("ignores unparseable date strings rather than throwing", () => {
    expect(() =>
      validateDeadlines({
        submission: "not-a-date",
        late_submission_until: "also-bad",
      }),
    ).not.toThrow();
    const { errors } = validateDeadlines({
      submission: "not-a-date",
      late_submission_until: "also-bad",
    });
    expect(errors).toEqual({});
  });
});

describe("upsertCountdownByName", () => {
  it("appends a new entry with a generated id when no name matches", () => {
    const result = upsertCountdownByName([], {
      name: "Submissions close",
      time: "2026-10-11T15:00:00-07:00",
      description: "Final project submissions are due.",
    });
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      name: "Submissions close",
      time: "2026-10-11T15:00:00-07:00",
      description: "Final project submissions are due.",
    });
    expect(result[0].id).toBeTruthy();
  });

  it("updates an existing entry in place (case-insensitive) and keeps its id", () => {
    const existing = [
      {
        id: "abc123",
        name: "submissions close",
        description: "old",
        time: "2026-10-10T12:00:00-07:00",
      },
      {
        id: "def456",
        name: "Kickoff",
        description: "",
        time: "2026-10-09T09:00:00-07:00",
      },
    ];
    const result = upsertCountdownByName(existing, {
      name: "Submissions Close",
      time: "2026-10-11T15:00:00-07:00",
      description: "Final project submissions are due.",
    });
    expect(result).toHaveLength(2);
    const updated = result.find((c) => c.id === "abc123");
    expect(updated.time).toBe("2026-10-11T15:00:00-07:00");
    expect(updated.description).toBe("Final project submissions are due.");
    // untouched entry stays untouched
    expect(result.find((c) => c.id === "def456").time).toBe(
      "2026-10-09T09:00:00-07:00",
    );
  });

  it("treats a missing/non-array countdowns list as empty", () => {
    const result = upsertCountdownByName(undefined, {
      name: "Kickoff",
      time: "t",
    });
    expect(result).toHaveLength(1);
  });
});

describe("hoursBeforeLabel", () => {
  it("singularizes 1 hour", () => {
    expect(hoursBeforeLabel(1)).toBe("1 hour before");
  });

  it("pluralizes other hour counts", () => {
    expect(hoursBeforeLabel(24)).toBe("24 hours before");
    expect(hoursBeforeLabel(6)).toBe("6 hours before");
  });

  it("returns an empty string for non-numeric input", () => {
    expect(hoursBeforeLabel(undefined)).toBe("");
    expect(hoursBeforeLabel("abc")).toBe("");
  });
});
