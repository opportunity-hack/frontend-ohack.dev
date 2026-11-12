import {
  extractPostTags,
  isJunkTag,
  collectTags,
  postMatchesTag,
  TAG_PREVIEW_COUNT,
} from "../blogTags";

describe("extractPostTags", () => {
  it("reads tags[], then #hashtags, then Slack channel links, de-duplicated", () => {
    const post = {
      tags: ["Nonprofit", "react"],
      description: "Shipped #React and #hackathon updates #55",
      links: [
        { url: "#general", name: "general" },
        { url: "https://x.y", name: "paid" },
        { url: "#C01CMCF4BUN", name: "C01CMCF4BUN" },
      ],
    };
    expect(extractPostTags(post)).toEqual([
      "Nonprofit",
      "react",
      "hackathon",
      "55",
      "general",
    ]);
    expect(extractPostTags(null)).toEqual([]);
    expect(extractPostTags({})).toEqual([]);
  });
});

describe("isJunkTag", () => {
  it.each([
    ["C01CMCF4BUN", true],
    ["55", true],
    ["ab", true],
    ["", true],
    ["react", false],
    ["2023-3rd-virtual-codefusion-collective", false],
  ])("%s → %s", (tag, junk) => {
    expect(isJunkTag(tag)).toBe(junk);
  });
});

describe("collectTags", () => {
  it("counts case-insensitively, sorts by count then name, drops junk", () => {
    const posts = [
      { tags: ["React", "nonprofit"], description: "#55" },
      {
        description: "#react #Hackathon",
        links: [{ url: "#C01CMCF4BUN", name: "C01CMCF4BUN" }],
      },
      { tags: ["hackathon"], links: [{ url: "#general", name: "general" }] },
      { description: "#nonprofit" },
    ];
    expect(collectTags(posts)).toEqual([
      { tag: "Hackathon", count: 2 },
      { tag: "nonprofit", count: 2 },
      { tag: "React", count: 2 },
      { tag: "general", count: 1 },
    ]);
    expect(collectTags(undefined)).toEqual([]);
    expect(TAG_PREVIEW_COUNT).toBe(8);
  });
});

describe("postMatchesTag", () => {
  const post = {
    tags: ["React"],
    description: "A #hackathon story",
    links: [{ url: "#general", name: "general" }],
  };
  it("matches any source, case-insensitively; no tag matches everything", () => {
    expect(postMatchesTag(post, "react")).toBe(true);
    expect(postMatchesTag(post, "HACKATHON")).toBe(true);
    expect(postMatchesTag(post, "General")).toBe(true);
    expect(postMatchesTag(post, "python")).toBe(false);
    expect(postMatchesTag(post, "")).toBe(true);
    expect(postMatchesTag(null, "react")).toBe(false);
  });
});
