/**
 * videoLinks — the single parser/validator for video links (demo videos,
 * bio videos, judge views). Pure, no React.
 *
 * Consumers: VideoDisplay, LiteVideoThumbnail, TeamDashboard/DemoVideoEditor,
 * admin/TeamManagement (validateDemoVideoUrl), Teams/projectMeta.
 * `ApplicationForm/IntroVideoField` is deliberately separate (its allowlist
 * mirrors the backend's ALLOWED_VIDEO_LINK_HOSTS).
 */

export const DEMO_VIDEO_HOSTS_LABEL = "YouTube, Loom, Vimeo or Google Drive";

const YOUTUBE_ID = /^[\w-]{11}$/;
const DIGITS = /^\d+$/;
const RAW_VIDEO = /\.(mp4|webm|mov)$/i;

// → URL | null. Scheme-less links ("youtu.be/abc…") are tolerated because
// teams have always been able to save them.
function toUrl(input) {
  const trimmed = String(input ?? "").trim();
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  try {
    const u = new URL(withScheme);
    return u.hostname.includes(".") ? u : null;
  } catch {
    return null;
  }
}

function hostOf(u) {
  return u.hostname.toLowerCase().replace(/^(www|m|music)\./, "");
}

function segmentsOf(u) {
  return u.pathname.split("/").filter(Boolean);
}

function parseYoutube(u, host, segs) {
  let id = null;
  if (host === "youtu.be") {
    id = segs[0];
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (segs[0] === "watch") id = u.searchParams.get("v");
    else if (["embed", "shorts", "live", "v", "e"].includes(segs[0]))
      id = segs[1];
    else if (!segs[0] || segs[0] === "") id = u.searchParams.get("v");
  }
  if (!id || !YOUTUBE_ID.test(id)) return null;
  return {
    provider: "youtube",
    id,
    embedUrl: `https://www.youtube.com/embed/${id}`,
  };
}

function parseVimeo(u, host, segs) {
  if (host !== "vimeo.com" && host !== "player.vimeo.com") return null;
  let id = null;
  let hash = u.searchParams.get("h") || null;
  if (DIGITS.test(segs[0] || "")) {
    id = segs[0];
    if (!hash && /^[A-Za-z0-9]{6,}$/.test(segs[1] || "")) hash = segs[1];
  } else if (segs[0] === "video") {
    id = segs[1];
  } else if (segs[0] === "channels") {
    id = segs[2] || segs[1];
  } else if (segs[0] === "groups" && segs[2] === "videos") {
    id = segs[3];
  } else if (segs[0] === "album" && segs[2] === "video") {
    id = segs[3];
  }
  if (!id || !DIGITS.test(id)) return null;
  const embedUrl = `https://player.vimeo.com/video/${id}${hash ? `?h=${hash}` : ""}`;
  return hash
    ? { provider: "vimeo", id, hash, embedUrl }
    : { provider: "vimeo", id, embedUrl };
}

function parseLoom(host, segs) {
  if (host !== "loom.com") return null;
  if (!["share", "embed"].includes(segs[0])) return null;
  if (!/^[a-zA-Z0-9]+$/.test(segs[1] || "")) return null;
  return {
    provider: "loom",
    id: segs[1],
    embedUrl: `https://www.loom.com/embed/${segs[1]}`,
  };
}

function parseDrive(u, host, segs) {
  if (host !== "drive.google.com") return null;
  let id = null;
  if (segs[0] === "file" && segs[1] === "d") id = segs[2];
  else if (segs[0] === "open" || segs[0] === "uc") id = u.searchParams.get("id");
  if (!id || !/^[\w-]+$/.test(id)) return null;
  return {
    provider: "drive",
    id,
    embedUrl: `https://drive.google.com/file/d/${id}/preview`,
  };
}

/** → { provider, id, embedUrl, hash? } | null */
export function parseVideoUrl(url) {
  const u = toUrl(url);
  if (!u) return null;
  const host = hostOf(u);
  const segs = segmentsOf(u);
  const parsed =
    parseYoutube(u, host, segs) ||
    parseVimeo(u, host, segs) ||
    parseLoom(host, segs) ||
    parseDrive(u, host, segs);
  if (parsed) return parsed;
  if (RAW_VIDEO.test(u.pathname)) {
    return { provider: "file", id: null, embedUrl: u.toString() };
  }
  return null;
}

/** Raw .mp4/.webm/.mov links are NOT accepted for team demos by default. */
export function isSupportedVideoUrl(url, { allowFiles = false } = {}) {
  const parsed = parseVideoUrl(url);
  return Boolean(parsed && (allowFiles || parsed.provider !== "file"));
}

/** 11-character YouTube id, or null. */
export function youtubeIdFromUrl(url) {
  const parsed = parseVideoUrl(url);
  return parsed?.provider === "youtube" ? parsed.id : null;
}

const PROVIDER_LABELS = {
  youtube: "YouTube",
  vimeo: "Vimeo",
  loom: "Loom",
  drive: "Google Drive",
  file: "Video",
};

export function videoProviderLabel(url) {
  const parsed = parseVideoUrl(url);
  return parsed ? PROVIDER_LABELS[parsed.provider] : null;
}

/**
 * A specific, friendly reason a link can't be used — null when the link is
 * supported or empty.
 */
export function describeVideoUrlProblem(url) {
  const trimmed = String(url ?? "").trim();
  if (!trimmed) return null;
  if (isSupportedVideoUrl(trimmed)) return null;

  const u = toUrl(trimmed);
  if (u) {
    const host = hostOf(u);
    const segs = segmentsOf(u);
    const first = segs[0] || "";

    if (host === "studio.youtube.com") {
      return "That's the YouTube Studio editing link. On the video, choose Share → Copy link and paste that instead.";
    }
    if (host === "youtube.com" || host === "youtu.be") {
      if (
        first === "playlist" ||
        (u.searchParams.get("list") && !u.searchParams.get("v"))
      ) {
        return "That link is a playlist. Open the video itself and copy its link.";
      }
      if (
        first.startsWith("@") ||
        ["channel", "c", "user"].includes(first)
      ) {
        return "That link is a channel. Open the video itself and copy its link.";
      }
      return "We couldn't find a video in that YouTube link. Use Share → Copy link on the video.";
    }
    if (host === "drive.google.com" && segs.includes("folders")) {
      return "That link is a Drive folder. Open the video file, choose Share → Copy link, and paste that.";
    }
    if (host === "drive.google.com" || host === "docs.google.com") {
      return "That doesn't look like a Drive video file link. Open the video file and choose Share → Copy link.";
    }
    if (host === "loom.com") {
      return "Use the Loom share link — it looks like loom.com/share/…";
    }
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    return "Paste the full link, starting with https://";
  }
  return "We can play YouTube, Loom, Vimeo and Google Drive links. YouTube (Unlisted) is the easiest.";
}
