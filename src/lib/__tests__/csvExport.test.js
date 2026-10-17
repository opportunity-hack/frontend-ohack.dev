import {
  buildCsv,
  csvField,
  csvFilename,
  formatCsvValue,
  isFormulaLike,
  slugForFilename,
} from "../csvExport";

describe("csvField", () => {
  it("leaves plain values alone", () => {
    expect(csvField("hello")).toBe("hello");
    expect(csvField(42)).toBe("42");
    expect(csvField(null)).toBe("");
  });

  it("quotes commas, quotes and newlines (RFC-4180)", () => {
    expect(csvField("a,b")).toBe('"a,b"');
    expect(csvField('say "hi"')).toBe('"say ""hi"""');
    expect(csvField("line1\nline2")).toBe('"line1\nline2"');
  });

  it("defuses formula-looking cells but not numbers or phone numbers", () => {
    expect(csvField('=HYPERLINK("x")')).toBe('"\'=HYPERLINK(""x"")"');
    expect(csvField("@SUM(1)")).toBe("'@SUM(1)");
    expect(csvField("-cmd|' /C calc'!A0")).toBe("'-cmd|' /C calc'!A0");
    expect(csvField("+SUM(1)")).toBe("'+SUM(1)");
    expect(csvField("-5")).toBe("-5");
    expect(csvField("+1 (480) 555-1234")).toBe("+1 (480) 555-1234");
    expect(isFormulaLike("")).toBe(false);
    expect(isFormulaLike(12)).toBe(false);
  });
});

describe("formatCsvValue", () => {
  it("normalises scalars", () => {
    expect(formatCsvValue(undefined)).toBe("");
    expect(formatCsvValue(true)).toBe("Yes");
    expect(formatCsvValue(false)).toBe("No");
    expect(formatCsvValue(3.5)).toBe("3.5");
    expect(formatCsvValue(NaN)).toBe("");
    expect(formatCsvValue(new Date("2026-10-16T12:00:00Z"))).toBe(
      "2026-10-16T12:00:00.000Z",
    );
  });

  it("joins arrays and serialises objects", () => {
    expect(formatCsvValue(["a", "", "b"])).toBe("a; b");
    expect(formatCsvValue([{ url: "x" }])).toBe('{"url":"x"}');
    expect(formatCsvValue({ a: 1 })).toBe('{"a":1}');
  });
});

describe("buildCsv", () => {
  const rows = [
    { name: "Ada, Lovelace", tags: ["x", "y"], ok: true, nested: { n: 1 } },
    { name: "Bob", tags: [], ok: false },
  ];

  it("emits a header row and one line per row with CRLF endings", () => {
    const csv = buildCsv(rows, [
      "name",
      { key: "tags", label: "Tags" },
      { key: "ok", label: "OK" },
      { key: "computed", label: "Len", get: (r) => r.name.length },
    ]);
    expect(csv.split("\r\n")).toEqual([
      "name,Tags,OK,Len",
      '"Ada, Lovelace",x; y,Yes,13',
      "Bob,,No,3",
    ]);
  });

  it("never throws on a bad getter or missing row fields", () => {
    const csv = buildCsv(
      [{}, null],
      [{ key: "a", label: "A", get: (r) => r.x.y }],
    );
    expect(csv).toBe("A\r\n\r\n");
  });

  it("handles empty input", () => {
    expect(buildCsv([], ["a"])).toBe("a");
    expect(buildCsv(undefined, undefined)).toBe("");
  });
});

describe("filenames", () => {
  it("slugs parts and stamps the date", () => {
    expect(slugForFilename("Fall 2026 / Judges!")).toBe("fall-2026-judges");
    expect(csvFilename("fall-2026", "", "On roster")).toMatch(
      /^fall-2026-on-roster-\d{4}-\d{2}-\d{2}\.csv$/,
    );
    expect(csvFilename()).toMatch(/^export-\d{4}-\d{2}-\d{2}\.csv$/);
  });
});
