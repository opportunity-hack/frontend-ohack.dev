import {
  parseVideoUrl,
  isSupportedVideoUrl,
  youtubeIdFromUrl,
  videoProviderLabel,
  describeVideoUrlProblem,
} from "../videoLinks";

const YT = "dQw4w9WgXcQ";

describe("parseVideoUrl", () => {
  const cases = [
    [`https://www.youtube.com/watch?v=${YT}`, "youtube", YT, `https://www.youtube.com/embed/${YT}`],
    [`https://youtube.com/watch?feature=share&v=${YT}&t=30s`, "youtube", YT],
    [`https://m.youtube.com/watch?v=${YT}`, "youtube", YT],
    [`https://music.youtube.com/watch?v=${YT}`, "youtube", YT],
    [`https://youtu.be/${YT}?si=abc`, "youtube", YT],
    [`https://www.youtube.com/embed/${YT}`, "youtube", YT],
    [`https://www.youtube.com/shorts/${YT}`, "youtube", YT],
    [`https://www.youtube.com/live/${YT}?feature=share`, "youtube", YT],
    [`https://www.youtube.com/v/${YT}`, "youtube", YT],
    [`youtu.be/${YT}`, "youtube", YT],
    ["https://vimeo.com/123456789", "vimeo", "123456789", "https://player.vimeo.com/video/123456789"],
    ["https://vimeo.com/video/123456789", "vimeo", "123456789"],
    ["https://player.vimeo.com/video/123456789", "vimeo", "123456789"],
    ["https://vimeo.com/channels/staffpicks/123456789", "vimeo", "123456789"],
    ["https://vimeo.com/groups/abc/videos/123456789", "vimeo", "123456789"],
    ["https://vimeo.com/album/42/video/123456789", "vimeo", "123456789"],
    ["https://loom.com/share/abc123DEF?sid=xyz", "loom", "abc123DEF", "https://www.loom.com/embed/abc123DEF"],
    ["https://www.loom.com/embed/abc123", "loom", "abc123"],
    ["https://drive.google.com/file/d/1AbC_-x/view?usp=sharing", "drive", "1AbC_-x", "https://drive.google.com/file/d/1AbC_-x/preview"],
    ["https://drive.google.com/open?id=1AbC_-x", "drive", "1AbC_-x"],
    ["https://drive.google.com/uc?id=1AbC_-x&export=download", "drive", "1AbC_-x"],
  ];
  it.each(cases.map((c) => [c[0], c[1], c[2], c[3] ?? null]))("%s", (url, provider, id, embedUrl) => {
    const parsed = parseVideoUrl(url);
    expect(parsed).toMatchObject({ provider, id });
    if (embedUrl) expect(parsed.embedUrl).toBe(embedUrl);
  });

  it("keeps the Vimeo unlisted hash (path and ?h=)", () => {
    expect(parseVideoUrl("https://vimeo.com/123456789/abcdef1234")).toMatchObject({
      hash: "abcdef1234",
      embedUrl: "https://player.vimeo.com/video/123456789?h=abcdef1234",
    });
    expect(parseVideoUrl("https://vimeo.com/123456789?h=abcdef1234").hash).toBe("abcdef1234");
  });

  it("recognises raw files", () => {
    expect(parseVideoUrl("https://cdn.ohack.dev/a/b.mp4?x=1")).toMatchObject({
      provider: "file",
    });
  });

  it.each([
    "https://studio.youtube.com/video/dQw4w9WgXcQ/edit",
    "https://www.youtube.com/playlist?list=PL123",
    "https://www.youtube.com/@ohack",
    "https://drive.google.com/drive/folders/abc",
    "https://www.youtube.com/watch?v=short12345",
    "",
    "not a url",
  ])("rejects %s", (url) => {
    expect(parseVideoUrl(url)).toBeNull();
  });
});

describe("helpers", () => {
  it("raw files are unsupported unless allowed", () => {
    const url = "https://cdn.ohack.dev/bio.mp4";
    expect(isSupportedVideoUrl(url)).toBe(false);
    expect(isSupportedVideoUrl(url, { allowFiles: true })).toBe(true);
  });
  it("youtubeIdFromUrl + labels", () => {
    expect(youtubeIdFromUrl(`https://youtube.com/shorts/${YT}`)).toBe(YT);
    expect(youtubeIdFromUrl("https://vimeo.com/1")).toBeNull();
    expect(videoProviderLabel("https://vimeo.com/1")).toBe("Vimeo");
    expect(videoProviderLabel("https://loom.com/share/a")).toBe("Loom");
    expect(videoProviderLabel("https://drive.google.com/file/d/a")).toBe("Google Drive");
    expect(videoProviderLabel("https://x.com/a.webm")).toBe("Video");
    expect(videoProviderLabel("nope")).toBeNull();
  });
});

describe("describeVideoUrlProblem", () => {
  it.each([
    ["", null],
    [`https://youtu.be/${YT}`, null],
    [`https://studio.youtube.com/video/${YT}/edit`, /Studio editing link/],
    ["https://www.youtube.com/playlist?list=PL1", /playlist/],
    ["https://www.youtube.com/watch?list=PL1", /playlist/],
    ["https://www.youtube.com/@ohack", /channel/],
    ["https://www.youtube.com/channel/UC123", /channel/],
    ["https://www.youtube.com/watch?v=short", /couldn't find a video/],
    ["https://drive.google.com/drive/folders/abc", /Drive folder/],
    ["https://drive.google.com/drive/u/0/folders/abc", /Drive folder/],
    ["https://docs.google.com/document/d/abc", /Drive video file/],
    ["https://drive.google.com/drive/my-drive", /Drive video file/],
    ["https://www.loom.com/library", /Loom share link/],
    ["not a url", /starting with https/],
    ["https://example.com/video", /YouTube \(Unlisted\) is the easiest/],
  ])("%s", (url, expected) => {
    const msg = describeVideoUrlProblem(url);
    if (expected === null) expect(msg).toBeNull();
    else expect(msg).toMatch(expected);
  });
});
