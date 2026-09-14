import { applyBulkRow, parseBulkRow } from "../bulkPaste";

describe("parseBulkRow", () => {
  it("parses a header row + one data row", () => {
    const text = "Your Name\tYour title\nJane\tEngineer";
    expect(parseBulkRow(text)).toEqual({ "Your Name": "Jane", "Your title": "Engineer" });
  });

  it("handles quoted cells with embedded newlines and escaped quotes", () => {
    const text = 'Your Name\tA (short) biography - aim for 200 words\nJane\t"Line one\nLine ""two"""';
    expect(parseBulkRow(text)).toEqual({
      "Your Name": "Jane",
      "A (short) biography - aim for 200 words": 'Line one\nLine "two"',
    });
  });

  it("returns an empty object without a data row", () => {
    expect(parseBulkRow("Your Name")).toEqual({});
    expect(parseBulkRow("")).toEqual({});
  });
});

describe("applyBulkRow", () => {
  it("maps judge headers onto doc keys and never carries isSelected", () => {
    const text =
      "Your Name\tCompany Name\tAre you joining us in-person at ASU in Tempe, Arizona?\nJane\tAcme\tYes, in person";
    const out = applyBulkRow(text, "judges");
    expect(out.name).toBe("Jane");
    expect(out.companyName).toBe("Acme");
    expect(out.isInPerson).toBe(true);
    expect(out).not.toHaveProperty("isSelected");
  });

  it("passes unknown types through as raw headers", () => {
    expect(applyBulkRow("Foo\tBar\n1\t2", "sponsor")).toEqual({ Foo: "1", Bar: "2" });
  });
});
