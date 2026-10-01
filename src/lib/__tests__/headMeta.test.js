import { ensureDescriptionMeta } from "../headMeta";

describe("ensureDescriptionMeta", () => {
  it("appends an un-keyed description meta when only og:description is present", () => {
    const openGraphData = [{ name: "og:description", property: "og:description", content: "OG text" }];
    const result = ensureDescriptionMeta(openGraphData, "Plain description");

    expect(result).toHaveLength(2);
    const added = result[1];
    expect(added).toEqual({ name: "description", content: "Plain description" });
    expect(added.key).toBeUndefined();
  });

  it("leaves the array unchanged when a name=description entry already exists", () => {
    const openGraphData = [
      { name: "description", content: "Already there" },
      { property: "og:description", content: "OG text" },
    ];
    const result = ensureDescriptionMeta(openGraphData, "Would-be duplicate");

    expect(result).toBe(openGraphData);
    expect(result).toHaveLength(2);
  });

  it("returns the input unchanged when description is empty or undefined", () => {
    const openGraphData = [{ property: "og:description", content: "OG text" }];

    expect(ensureDescriptionMeta(openGraphData, undefined)).toBe(openGraphData);
    expect(ensureDescriptionMeta(openGraphData, "")).toBe(openGraphData);
  });

  it("does not mutate the input array", () => {
    const openGraphData = [{ property: "og:description", content: "OG text" }];
    const original = [...openGraphData];
    ensureDescriptionMeta(openGraphData, "New description");
    expect(openGraphData).toEqual(original);
  });

  it("defaults openGraphData to an empty array", () => {
    const result = ensureDescriptionMeta(undefined, "Solo description");
    expect(result).toEqual([{ name: "description", content: "Solo description" }]);
  });
});
