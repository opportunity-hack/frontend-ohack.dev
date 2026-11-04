import {
  SHARE_FORMATS,
  buildCaption,
  buildShareLinks,
  THREADS_LIMIT,
  buildShortCaption,
  eventDisplayName,
  eventTense,
  formatEventDateRange,
  isShareFormat,
  isShareType,
  monogram,
  publicVolunteerForCard,
  shareHeadline,
  shareImageFilename,
  shareImagePath,
  sharePagePath,
  shortLocation,
  withUtm,
} from "../shareCard";

const EVENT = {
  event_id: "fall-2026",
  title: "Fall 2026 Hackathon",
  start_date: "2026-10-10",
  end_date: "2026-10-11",
  location: "Tempe, AZ",
  timezone: "America/Phoenix",
};
const PAGE_URL = "https://www.ohack.dev/hack/fall-2026/share/judge/v1";

describe("paths", () => {
  it("builds the landing page and image paths with encoded segments", () => {
    expect(sharePagePath("fall-2026", "judge", "abc 1")).toBe(
      "/hack/fall-2026/share/judge/abc%201",
    );
    expect(shareImagePath("fall-2026", "judge", "v1", "square")).toBe(
      "/api/share-card/fall-2026/judge/v1?format=square",
    );
    expect(shareImagePath("fall-2026", "judge", "v1")).toMatch(/format=og$/);
  });

  it("validates types and formats", () => {
    expect(isShareType("judge")).toBe(true);
    expect(isShareType("sponsor")).toBe(false);
    expect(isShareFormat("story")).toBe(true);
    expect(isShareFormat("toString")).toBe(false);
    expect(SHARE_FORMATS.og).toEqual(
      expect.objectContaining({ width: 1200, height: 630 }),
    );
  });

  it("tags PAGE_URLs with UTM params", () => {
    const u = new URL(
      withUtm(PAGE_URL, { source: "linkedin", campaign: "fall-2026" }),
    );
    expect(u.searchParams.get("utm_source")).toBe("linkedin");
    expect(u.searchParams.get("utm_medium")).toBe("share_card");
    expect(u.searchParams.get("utm_campaign")).toBe("fall-2026");
  });
});

describe("event naming + tense", () => {
  it("shortens SEO titles to the season, else the first clause", () => {
    expect(eventDisplayName(EVENT)).toBe("Opportunity Hack Fall 2026");
    expect(
      eventDisplayName({
        title:
          "ASU Fall Hackathon 2026 | Phoenix Hackathon for Nonprofits: Nov 14-15",
      }),
    ).toBe("Opportunity Hack Fall 2026");
    expect(
      eventDisplayName({ title: "Global Hack Week: build for good" }),
    ).toBe("Opportunity Hack Global Hack Week");
    expect(eventDisplayName({ title: "Opportunity Hack Fall 2026" })).toBe(
      "Opportunity Hack Fall 2026",
    );
    expect(eventDisplayName({})).toBe("Opportunity Hack");
  });

  it("is present through the end of the last day, then past", () => {
    expect(eventTense(EVENT, new Date(2026, 9, 11, 23, 59))).toBe("present");
    expect(eventTense(EVENT, new Date(2026, 9, 12, 0, 0))).toBe("past");
    expect(eventTense({}, new Date())).toBe("present");
  });

  it("shortens venue addresses to City, ST", () => {
    expect(
      shortLocation(
        "Engineering Center G Wing 501 E Tyler Mall Tempe, AZ 85281",
      ),
    ).toBe("Tempe, AZ");
    expect(shortLocation("San Jose, CA")).toBe("San Jose, CA");
    expect(shortLocation("Online")).toBe("Online");
    expect(shortLocation("")).toBe("");
  });

  it("formats date ranges", () => {
    expect(formatEventDateRange("2026-10-10", "2026-10-11")).toBe(
      "Oct 10–11, 2026",
    );
    expect(formatEventDateRange("2026-10-31", "2026-11-01")).toBe(
      "Oct 31 – Nov 1, 2026",
    );
    expect(formatEventDateRange("2026-10-10", "2026-10-10")).toBe(
      "Oct 10, 2026",
    );
    expect(formatEventDateRange(null)).toBe("");
  });
});

describe("captions", () => {
  it("writes in first person for the participant", () => {
    const c = buildCaption({
      voice: "self",
      type: "judge",
      name: "Satish Kumar M",
      event: EVENT,
      url: PAGE_URL,
    });
    expect(c.startsWith("I'm judging Opportunity Hack Fall 2026 — ")).toBe(
      true,
    );
    expect(c).toContain(PAGE_URL);
    expect(c).toContain("#OpportunityHack");
  });

  it("switches to past tense and third person", () => {
    expect(
      buildCaption({
        voice: "self",
        type: "mentor",
        event: EVENT,
        tense: "past",
        url: PAGE_URL,
      }),
    ).toMatch(/^I mentored at /);
    expect(
      buildCaption({
        voice: "other",
        type: "hacker",
        name: "Ada L",
        event: EVENT,
        url: PAGE_URL,
      }),
    ).toMatch(/^Ada L is hacking at /);
    expect(
      buildCaption({
        voice: "other",
        type: "volunteer",
        name: "Ada L",
        event: EVENT,
        tense: "past",
        url: PAGE_URL,
      }),
    ).toMatch(/^Ada L volunteered at /);
  });

  it("keeps the X caption short and still links", () => {
    const s = buildShortCaption({ type: "judge", event: EVENT, url: PAGE_URL });
    expect(s.length).toBeLessThanOrEqual(240);
    expect(s).toContain(PAGE_URL);
  });

  it("headline reads like a speaker card", () => {
    expect(
      shareHeadline({ type: "judge", name: "Satish Kumar M", event: EVENT }),
    ).toBe("Satish Kumar M is judging Opportunity Hack Fall 2026");
    expect(
      shareHeadline({
        type: "mentor",
        name: "Ada",
        event: EVENT,
        tense: "past",
      }),
    ).toBe("Ada mentored at Opportunity Hack Fall 2026");
  });
});

describe("share links", () => {
  const caption = buildCaption({ type: "judge", event: EVENT, url: PAGE_URL });
  const shortCaption = buildShortCaption({
    type: "judge",
    event: EVENT,
    url: PAGE_URL,
  });
  const links = buildShareLinks({
    pageUrl: PAGE_URL,
    eventId: "fall-2026",
    event: EVENT,
    caption,
    shortCaption,
  });

  it("prefills the LinkedIn composer with the UTM-tagged caption", () => {
    expect(links.linkedinPost).toMatch(
      /^https:\/\/www\.linkedin\.com\/feed\/\?shareActive=true&text=/,
    );
    const text = decodeURIComponent(links.linkedinPost.split("text=")[1]);
    expect(text).toContain("utm_source=linkedin");
    expect(text).not.toContain(`${PAGE_URL} `);
  });

  it("link shares carry only the tagged PAGE_URL", () => {
    expect(decodeURIComponent(links.linkedinLink)).toContain(
      "utm_source=linkedin",
    );
    expect(decodeURIComponent(links.facebook)).toContain("utm_source=facebook");
    expect(links.x).toMatch(/^https:\/\/x\.com\/intent\/post\?text=/);
    expect(decodeURIComponent(links.x)).toContain("utm_source=x");
    expect(links.whatsapp.startsWith("https://wa.me/?text=")).toBe(true);
    expect(links.email).toMatch(/^mailto:\?subject=/);
    expect(links.copyLink).toContain("utm_source=copy");
  });

  it("prefills the Threads composer with the full tagged caption when it fits", () => {
    expect(links.threads).toMatch(
      /^https:\/\/www\.threads\.net\/intent\/post\?text=/,
    );
    const text = decodeURIComponent(links.threads.split("text=")[1]);
    expect(text).toContain("utm_source=threads");
    expect(text).toContain("#OpportunityHack");
    expect(text.length).toBeLessThanOrEqual(THREADS_LIMIT);
  });

  it("falls back to the short caption on Threads when the edited caption is over the limit", () => {
    const long = `${"Thank you to everyone who made this possible. ".repeat(12)} ${PAGE_URL}`;
    expect(long.length).toBeGreaterThan(THREADS_LIMIT);
    const edited = buildShareLinks({
      pageUrl: PAGE_URL,
      eventId: "fall-2026",
      event: EVENT,
      caption: long,
      shortCaption,
    });
    const text = decodeURIComponent(edited.threads.split("text=")[1]);
    expect(text.length).toBeLessThanOrEqual(THREADS_LIMIT);
    expect(text).toContain("utm_source=threads");
    expect(text).not.toContain("Thank you to everyone");
  });

  it("Instagram has no intent — just the site (the kit copies the caption)", () => {
    expect(links.instagram).toBe("https://www.instagram.com/");
  });
});

describe("volunteer projection", () => {
  it("returns null unless on the roster", () => {
    expect(
      publicVolunteerForCard({ id: "v1", name: "Ada", isSelected: false }),
    ).toBeNull();
    expect(publicVolunteerForCard({ id: "v1", isSelected: true })).toBeNull();
    expect(publicVolunteerForCard(null)).toBeNull();
  });

  it("allowlists fields and drops Drive photo links", () => {
    const v = publicVolunteerForCard({
      id: "v1",
      name: " Ada Lovelace ",
      isSelected: true,
      email: "ada@example.com",
      photoUrl: "https://drive.google.com/x",
      companyName: "Analytical Engines",
      title: "Engineer",
    });
    expect(v).toEqual({
      id: "v1",
      name: "Ada Lovelace",
      photoUrl: null,
      subtitle: "Analytical Engines · Engineer",
    });
    expect(
      publicVolunteerForCard({
        id: "v2",
        name: "B",
        isSelected: true,
        photoUrl: "https://cdn.ohack.dev/x.jpg",
      }).photoUrl,
    ).toBe("https://cdn.ohack.dev/x.jpg");
  });

  it("monogram + filenames", () => {
    expect(monogram("Satish Kumar M")).toBe("SK");
    expect(monogram("ada")).toBe("A");
    expect(
      shareImageFilename({
        eventId: "fall-2026",
        type: "judge",
        name: "Satish Kumar M",
        format: "og",
      }),
    ).toBe("opportunity-hack-fall-2026-judge-satish-og.png");
  });
});
