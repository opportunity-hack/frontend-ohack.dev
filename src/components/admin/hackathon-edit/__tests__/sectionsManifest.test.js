import {
  DEFAULT_SECTION,
  SECTIONS,
  defaultSectionForOrg,
  isValidSection,
  sectionsForOrg,
} from "../sectionsManifest";

const org = (...perms) => ({ hasPermission: (p) => perms.includes(p) });

describe("sectionsManifest permissions", () => {
  it("a full admin sees every section in manifest order", () => {
    expect(sectionsForOrg(org("volunteer.admin")).map((s) => s.slug)).toEqual(
      SECTIONS.map((s) => s.slug),
    );
    expect(defaultSectionForOrg(org("volunteer.admin"))).toBe(DEFAULT_SECTION);
  });

  it("checkin.admin alone sees only Check-in and lands on it", () => {
    const o = org("checkin.admin");
    expect(sectionsForOrg(o).map((s) => s.slug)).toEqual(["checkin"]);
    expect(defaultSectionForOrg(o)).toBe("checkin");
    expect(isValidSection("checkin", o)).toBe(true);
    expect(isValidSection("overview", o)).toBe(false);
    expect(isValidSection("volunteer", o)).toBe(false);
  });

  it("no permission → no sections; slug check without an org stays unscoped", () => {
    expect(sectionsForOrg(org("heart.admin"))).toEqual([]);
    expect(sectionsForOrg(undefined)).toEqual([]);
    expect(isValidSection("overview")).toBe(true);
  });
});
