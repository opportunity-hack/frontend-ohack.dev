import { buildCsv } from "../../../../lib/csvExport";
import {
  buildVolunteerExportColumns,
  exportScopeSlug,
  rosterBreakdown,
  scopeVolunteersForExport,
  statusBreakdown,
} from "../volunteerExport";

const judges = [
  {
    id: "a",
    name: "Ada",
    email: "ada@x.org",
    status: "approved",
    isSelected: true,
    checkedIn: true,
    companyName: "Analytical",
    legacyThing: "keep me",
  },
  {
    id: "b",
    name: "Bob",
    email: "bob@x.org",
    status: "Pending",
    isSelected: false,
  },
  {
    id: "c",
    name: "Cy",
    email: "cy@x.org",
    status: "denied",
    isSelected: true,
  },
  {
    id: "d",
    name: "Di",
    email: "di@x.org",
    status: "shortlisted",
    isSelected: false,
    checkedIn: false,
  },
];

describe("scopeVolunteersForExport", () => {
  it("filters by roster and by a status set independently", () => {
    expect(
      scopeVolunteersForExport(judges, {
        type: "judge",
        rosterScope: "yes",
      }).map((j) => j.id),
    ).toEqual(["a", "c"]);
    expect(
      scopeVolunteersForExport(judges, {
        type: "judge",
        rosterScope: "no",
      }).map((j) => j.id),
    ).toEqual(["b", "d"]);
    expect(
      scopeVolunteersForExport(judges, {
        type: "judge",
        statuses: ["approved", "pending"],
      }).map((j) => j.id),
    ).toEqual(["a", "b"]);
    expect(
      scopeVolunteersForExport(judges, {
        type: "judge",
        rosterScope: "yes",
        statuses: ["denied"],
      }).map((j) => j.id),
    ).toEqual(["c"]);
  });

  it("keeps legacy status values selectable", () => {
    expect(
      scopeVolunteersForExport(judges, {
        type: "judge",
        statuses: ["shortlisted"],
      }).map((j) => j.id),
    ).toEqual(["d"]);
  });

  it("only applies search / check-in / preset when keepView is on", () => {
    const view = { search: "ada", checkedInFilter: "yes", preset: "none" };
    expect(
      scopeVolunteersForExport(judges, { type: "judge", view }).length,
    ).toBe(4);
    expect(
      scopeVolunteersForExport(judges, {
        type: "judge",
        keepView: true,
        view,
      }).map((j) => j.id),
    ).toEqual(["a"]);
    expect(
      scopeVolunteersForExport(judges, {
        type: "judge",
        keepView: true,
        view: { preset: "conflict" },
      }).map((j) => j.id),
    ).toEqual(["c"]);
  });
});

describe("breakdowns", () => {
  it("counts statuses in catalog order and appends legacy values", () => {
    const rows = statusBreakdown(judges);
    expect(rows[0]).toEqual({
      value: "pending",
      label: "Pending review",
      count: 1,
    });
    expect(rows.find((r) => r.value === "approved").count).toBe(1);
    expect(rows[rows.length - 1]).toEqual({
      value: "shortlisted",
      label: "shortlisted (legacy)",
      count: 1,
    });
  });

  it("counts roster membership", () => {
    expect(rosterBreakdown(judges)).toEqual({ all: 4, yes: 2, no: 2 });
  });

  it("builds a scope slug for the filename", () => {
    expect(
      exportScopeSlug({
        rosterScope: "yes",
        statuses: ["approved"],
        allStatusCount: 8,
      }),
    ).toBe("on-roster-approved");
    expect(
      exportScopeSlug({
        rosterScope: "all",
        statuses: ["a", "b", "c", "d"],
        allStatusCount: 8,
      }),
    ).toBe("filtered");
    expect(exportScopeSlug({ rosterScope: "no", statuses: null })).toBe(
      "not-on-roster",
    );
  });
});

describe("buildVolunteerExportColumns", () => {
  it("leads with name/email + decision columns, then schema fields, then extras", () => {
    const cols = buildVolunteerExportColumns("judges", judges, "all");
    const labels = cols.map((c) => c.label);
    expect(labels.slice(0, 6)).toEqual([
      "Name",
      "Email",
      "Application status",
      "On event roster",
      "Checked in",
      "Checked in at",
    ]);
    // schema-driven field present for judges
    expect(labels).toContain("Company");
    // schema-unknown key on a doc is appended, never dropped
    expect(cols[cols.length - 1].key).toBe("legacyThing");
    // system id is included because rows carry it
    expect(cols.some((c) => c.key === "id")).toBe(true);
  });

  it("renders readable values through buildCsv", () => {
    const cols = buildVolunteerExportColumns("judges", judges, "all");
    const csv = buildCsv(judges, cols);
    const lines = csv.split("\r\n");
    expect(lines[1].startsWith("Ada,ada@x.org,Approved,Yes,Yes,")).toBe(true);
    expect(lines[2].startsWith("Bob,bob@x.org,Pending review,No,No,")).toBe(
      true,
    );
    expect(lines[4]).toContain("shortlisted (legacy)");
  });

  it("essentials is a short fixed set", () => {
    const cols = buildVolunteerExportColumns("hackers", judges, "essentials");
    const keys = cols.map((c) => c.key);
    expect(keys[0]).toBe("name");
    expect(keys).toContain("status");
    expect(keys).toContain("isSelected");
    expect(keys[keys.length - 1]).toBe("id");
    expect(keys.length).toBeLessThan(12);
  });
});
