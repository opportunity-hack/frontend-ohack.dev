import {
  LINK_FIELDS,
  buildCreatePayload,
  buildPatch,
  filterByDecision,
  getFieldLabel,
  getRenderedKeys,
  getReviewFields,
  getSearchValues,
  hasChanges,
  linkedinUrlOf,
  readFieldValue,
  getField,
  toFormData,
  toPluralType,
  toSingularType,
  typeOf,
} from "../applicationSchema";

const judgeDoc = {
  id: "j1",
  volunteer_type: "judge",
  name: "Jane Doe",
  email: "jane@example.org",
  companyName: "Acme",
  biography: "",
  shortBio: "",
  shortBiography: "Legacy bio text",
  background: ["Software Development", "Product Management"],
  backgroundAreas: ["Software Development", "Product Management"],
  inPerson: "Yes",
  isInPerson: true,
  agreedToCodeOfConduct: true,
  codeOfConduct: true,
  status: "pending",
  isSelected: false,
  checkedIn: true,
  created_by: "system",
  type: "judges",
};

describe("type normalization", () => {
  it("maps plural and legacy names to singular", () => {
    expect(toSingularType("judges")).toBe("judge");
    expect(toSingularType("judge")).toBe("judge");
    expect(toSingularType("Hackers")).toBe("hacker");
    expect(toSingularType("participant")).toBe("hacker");
    expect(toSingularType("nope")).toBeNull();
    expect(toPluralType("mentor")).toBe("mentors");
    expect(typeOf({ volunteer_type: "mentor" }, "judges")).toBe("mentor");
    expect(typeOf({}, "judges")).toBe("judge");
  });
});

describe("aliases", () => {
  it("reads the bio from the first populated alias", () => {
    const bio = getField("judge", "biography");
    expect(readFieldValue(judgeDoc, bio)).toBe("Legacy bio text");
    expect(getField("judge", "shortBiography")).toBe(bio);
  });

  it("labels aliases with the canonical label", () => {
    expect(getFieldLabel("judge", "shortBiography")).toBe("Bio");
    expect(getFieldLabel("judge", "companyName")).toBe("Company");
    expect(getFieldLabel("judge", "totallyUnknownKey")).toBe("Totally unknown key");
    expect(getFieldLabel("mentor", "softwareEngineeringSpecifics")).toBe("Engineering specifics");
  });

  it("reads inPerson from either representation", () => {
    const inPerson = getField("judge", "inPerson");
    expect(readFieldValue({ inPerson: "Yes" }, inPerson)).toBe(true);
    expect(readFieldValue({ isInPerson: false, inPerson: "Yes" }, inPerson)).toBe(false);
    expect(readFieldValue({ inPerson: "No, I'll be virtual" }, getField("mentor", "inPerson"))).toBe(false);
    expect(readFieldValue({ inPerson: "Yes!" }, getField("mentor", "inPerson"))).toBe(true);
    expect(readFieldValue({}, inPerson)).toBe(false);
  });
});

describe("buildPatch", () => {
  it("returns only id when nothing changed", () => {
    const form = toFormData(judgeDoc, "judge");
    const { patch, roster } = buildPatch(judgeDoc, form, "judge", {
      status: "pending",
      isSelected: false,
    });
    expect(patch).toEqual({ id: "j1" });
    expect(roster).toBeNull();
    expect(hasChanges({ patch, roster })).toBe(false);
  });

  it("writes every bio mirror when the bio changes, and nothing else", () => {
    const form = { ...toFormData(judgeDoc, "judge"), biography: "New bio" };
    const { patch } = buildPatch(judgeDoc, form, "judge");
    expect(patch).toEqual({
      id: "j1",
      biography: "New bio",
      shortBio: "New bio",
      shortBiography: "New bio",
    });
  });

  it("never emits isSelected, type, checkedIn or audit keys", () => {
    const form = { ...toFormData(judgeDoc, "judge"), name: "Janet" };
    const { patch, roster } = buildPatch(judgeDoc, form, "judge", { isSelected: true, status: "approved" });
    expect(patch).toEqual({ id: "j1", name: "Janet", status: "approved" });
    expect(patch).not.toHaveProperty("isSelected");
    expect(patch).not.toHaveProperty("type");
    expect(patch).not.toHaveProperty("checkedIn");
    expect(patch).not.toHaveProperty("created_by");
    expect(roster).toBe(true);
  });

  it("reports a roster toggle separately with an id-only patch", () => {
    const form = toFormData(judgeDoc, "judge");
    const { patch, roster } = buildPatch(judgeDoc, form, "judge", { isSelected: true });
    expect(patch).toEqual({ id: "j1" });
    expect(roster).toBe(true);
    expect(hasChanges({ patch, roster })).toBe(true);
    expect(buildPatch({ ...judgeDoc, isSelected: true }, form, "judge", { isSelected: false }).roster).toBe(false);
  });

  it("writes inPerson in the form's own convention", () => {
    const judgeForm = { ...toFormData(judgeDoc, "judge"), inPerson: false };
    expect(buildPatch(judgeDoc, judgeForm, "judge").patch).toEqual({
      id: "j1",
      isInPerson: false,
      inPerson: "No",
    });
    const mentorDoc = { id: "m1", inPerson: "No, I'll be virtual", isInPerson: false };
    const mentorForm = { ...toFormData(mentorDoc, "mentor"), inPerson: true };
    expect(buildPatch(mentorDoc, mentorForm, "mentor").patch).toEqual({
      id: "m1",
      isInPerson: true,
      inPerson: "Yes!",
    });
  });

  it("writes the code-of-conduct pair together", () => {
    const form = { ...toFormData(judgeDoc, "judge"), agreedToCodeOfConduct: false };
    expect(buildPatch(judgeDoc, form, "judge").patch).toEqual({
      id: "j1",
      agreedToCodeOfConduct: false,
      codeOfConduct: false,
    });
  });

  it("preserves multiselect storage shape per doc", () => {
    const hackerDoc = { id: "h1", primaryRoles: ["DevOps"], skills: "Python, React" };
    const form = { ...toFormData(hackerDoc, "hacker"), primaryRoles: ["DevOps", "QA"], skills: ["Python"] };
    const { patch } = buildPatch(hackerDoc, form, "hacker");
    expect(patch.primaryRoles).toEqual(["DevOps", "QA"]);
    expect(patch.skills).toBe("Python");

    // Sheets-imported judge stores `background` as a string; keep it a string.
    const importedJudge = { id: "j2", background: "Software Development, Other" };
    const jForm = { ...toFormData(importedJudge, "judge"), backgroundAreas: ["Software Development"] };
    const jPatch = buildPatch(importedJudge, jForm, "judge").patch;
    expect(jPatch.background).toBe("Software Development");
    // The canonical key didn't exist on the doc, so it inherits the alias' shape.
    expect(jPatch.backgroundAreas).toBe("Software Development");
  });

  it("normalizes the status it writes and skips no-op status", () => {
    const form = toFormData(judgeDoc, "judge");
    expect(buildPatch(judgeDoc, form, "judge", { status: " Approved " }).patch.status).toBe("approved");
    expect(buildPatch({ ...judgeDoc, status: "Approved" }, form, "judge", { status: "approved" }).patch).toEqual({
      id: "j1",
    });
  });
});

describe("buildCreatePayload", () => {
  it("stamps type/timestamp/status and leaves isSelected false", () => {
    const payload = buildCreatePayload({ name: "New Judge", email: "n@x.org", biography: "Hi" }, "judges", {
      status: "approved",
      isSelected: true,
    });
    expect(payload.volunteer_type).toBe("judge");
    expect(payload.status).toBe("approved");
    expect(payload.isSelected).toBe(false);
    expect(payload.shortBio).toBe("Hi");
    expect(typeof payload.timestamp).toBe("string");
    expect(payload).not.toHaveProperty("type");
  });
});

describe("review / rendered / link / search", () => {
  it("keeps training links out of card rows but inside the rendered set", () => {
    const { secondary, additional, primary } = getReviewFields("judge");
    const keys = [...primary, ...secondary, ...additional].map((f) => f.key);
    expect(keys).not.toContain("introductionVideoUrl");
    expect(keys).not.toContain("judgeTrainingIntroCertUrl");
    expect(keys).not.toContain("status");
    expect(keys).toContain("companyName");
    const rendered = getRenderedKeys("judge");
    ["introductionVideoUrl", "judgeTrainingToolCertUrl", "type", "isSelected", "status", "shortBio", "selected"].forEach(
      (k) => expect(rendered.has(k)).toBe(true)
    );
  });

  it("derives one LINK_FIELDS constant across types", () => {
    ["linkedin", "linkedinProfile", "linkedinUrl", "github", "portfolio", "website", "introductionVideoUrl"].forEach(
      (k) => expect(LINK_FIELDS).toContain(k)
    );
  });

  it("resolves LinkedIn from any alias", () => {
    expect(linkedinUrlOf({ linkedin: "linkedin.com/in/x" })).toBe("https://linkedin.com/in/x");
    expect(linkedinUrlOf({ linkedinProfile: "https://l.co/y" })).toBe("https://l.co/y");
    expect(linkedinUrlOf({})).toBeNull();
  });

  it("builds a search index across aliases and nested artifacts", () => {
    const values = getSearchValues(judgeDoc, "judge");
    expect(values).toContain("Legacy bio text");
    expect(values).toContain("Acme");
    const vol = { name: "V", artifacts: [{ label: "Photos", comment: "Day 1 album" }] };
    expect(getSearchValues(vol, "volunteers")).toEqual(expect.arrayContaining(["Photos", "Day 1 album"]));
  });
});

describe("filterByDecision", () => {
  const list = [
    { id: 1, status: "approved", isSelected: false },
    { id: 2, status: "Approved", isSelected: true },
    { id: 3, status: "denied", isSelected: true },
    { id: 4, status: "", isSelected: false },
  ];
  it("filters by normalized status", () => {
    expect(filterByDecision(list, { statusFilter: "approved" }).map((a) => a.id)).toEqual([1, 2]);
    expect(filterByDecision(list, { statusFilter: "pending" }).map((a) => a.id)).toEqual([4]);
  });
  it("filters by roster and presets independently", () => {
    expect(filterByDecision(list, { selectedFilter: "yes" }).map((a) => a.id)).toEqual([2, 3]);
    expect(filterByDecision(list, { preset: "ready" }).map((a) => a.id)).toEqual([1]);
    expect(filterByDecision(list, { preset: "conflict" }).map((a) => a.id)).toEqual([3]);
    expect(filterByDecision(list, { statusFilter: "approved", selectedFilter: "no" }).map((a) => a.id)).toEqual([1]);
  });
});
