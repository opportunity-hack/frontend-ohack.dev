import { serializeJsonLd } from "../jsonLd";

describe("serializeJsonLd", () => {
  const obj = {
    "@type": "SoftwareSourceCode",
    name: "Team </script><img src=x onerror=alert(1)>",
    nested: { list: ["a<b", 1, null] },
  };

  it("escapes < so a value can't close the script tag", () => {
    const out = serializeJsonLd(obj);
    expect(out).not.toContain("</script>");
    expect(out).not.toContain("<");
    expect(out).toContain("\\u003c/script>");
  });

  it("round-trips through JSON.parse", () => {
    expect(JSON.parse(serializeJsonLd(obj))).toEqual(obj);
  });

  it("returns an empty string for null/undefined", () => {
    expect(serializeJsonLd(undefined)).toBe("");
    expect(serializeJsonLd(null)).toBe("");
  });
});
