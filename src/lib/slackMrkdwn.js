/**
 * Slack "mrkdwn" helpers for the admin Slack composer: a tokenizer that
 * drives the live preview, a Markdown -> mrkdwn converter, and lints for the
 * mistakes that make a pasted announcement look wrong in Slack.
 *
 * Pure functions only (unit-tested in __tests__/slackMrkdwn.test.js).
 */

// Twins of the backend limits in services/slack_admin_message.py.
export const SLACK_SECTION_LIMIT = 3000;
export const SLACK_MESSAGE_LIMIT = 12000;

// Shortcodes the preview can draw. Slack knows thousands more (and the
// workspace's custom ones); anything missing here still sends fine and is
// shown as its :shortcode:.
export const EMOJI = {
  trophy: "🏆",
  raised_hands: "🙌",
  tada: "🎉",
  rocket: "🚀",
  calendar: "📅",
  date: "📅",
  wave: "👋",
  heart: "❤️",
  fire: "🔥",
  clap: "👏",
  white_check_mark: "✅",
  heavy_check_mark: "✔️",
  x: "❌",
  warning: "⚠️",
  mega: "📣",
  loudspeaker: "📢",
  point_right: "👉",
  point_down: "👇",
  star: "⭐",
  star2: "🌟",
  sparkles: "✨",
  100: "💯",
  pray: "🙏",
  eyes: "👀",
  bulb: "💡",
  link: "🔗",
  hammer_and_wrench: "🛠️",
  computer: "💻",
  bell: "🔔",
  clock3: "🕒",
  alarm_clock: "⏰",
  thumbsup: "👍",
  "+1": "👍",
  muscle: "💪",
  dart: "🎯",
  medal: "🏅",
  first_place_medal: "🥇",
  second_place_medal: "🥈",
  third_place_medal: "🥉",
  pizza: "🍕",
  coffee: "☕",
  camera: "📷",
  movie_camera: "🎥",
  memo: "📝",
  books: "📚",
  speech_balloon: "💬",
  question: "❓",
  exclamation: "❗",
  hourglass_flowing_sand: "⏳",
  smile: "😄",
  slightly_smiling_face: "🙂",
  thinking_face: "🤔",
  partying_face: "🥳",
  robot_face: "🤖",
  handshake: "🤝",
  gift: "🎁",
  moneybag: "💰",
  earth_americas: "🌎",
};

const TOKEN_RE =
  /(`[^`\n]+`)|<((?:https?:\/\/|mailto:)[^|>\s]+)(?:\|([^>\n]+))?>|<!(channel|here|everyone)>|<@([UW][A-Z0-9]+)>|<#(C[A-Z0-9]+)(?:\|([^>\n]*))?>|\*([^*\n]+)\*|_([^_\n]+)_|~([^~\n]+)~|:([a-z0-9_+-]+):/g;

const isWordChar = (ch) => Boolean(ch) && /[A-Za-z0-9]/.test(ch);

/**
 * One line of mrkdwn -> a flat list of tokens:
 * {type: text|code|link|broadcast|user|channel|bold|italic|strike|emoji, ...}.
 * bold / italic / strike carry `children` (tokens) so emoji and links inside
 * them still render.
 */
export function tokenizeLine(line) {
  const tokens = [];
  const pushText = (value) => {
    if (!value) return;
    const last = tokens[tokens.length - 1];
    if (last && last.type === "text") last.value += value;
    else tokens.push({ type: "text", value });
  };

  let cursor = 0;
  // A fresh regex per call: bold/italic/strike recurse into this function,
  // and a shared global regex would have its lastIndex reset under the
  // caller (an endless loop).
  const re = new RegExp(TOKEN_RE.source, "g");
  let match = re.exec(line);
  while (match) {
    const [raw] = match;
    const start = match.index;
    const end = start + raw.length;
    const styled =
      match[8] !== undefined ||
      match[9] !== undefined ||
      match[10] !== undefined;
    // Slack only styles *x* / _x_ / ~x~ at word edges (so snake_case_names
    // and 2*3*4 stay literal) and never when the inside starts with a space.
    const inner = match[8] ?? match[9] ?? match[10];
    // The same edge rule keeps a time like 10:30:00 from reading as :30:.
    const edged = isWordChar(line[start - 1]) || isWordChar(line[end]);
    const literal =
      (styled && (edged || inner !== inner.trim())) ||
      (match[11] !== undefined && edged);

    pushText(line.slice(cursor, start));
    if (literal) {
      // Keep the opening marker as text and rescan right after it.
      pushText(raw[0]);
      cursor = start + 1;
      re.lastIndex = cursor;
    } else {
      if (match[1] !== undefined) {
        tokens.push({ type: "code", value: raw.slice(1, -1) });
      } else if (match[2] !== undefined) {
        tokens.push({ type: "link", url: match[2], label: match[3] || match[2] });
      } else if (match[4] !== undefined) {
        tokens.push({ type: "broadcast", value: match[4] });
      } else if (match[5] !== undefined) {
        tokens.push({ type: "user", value: match[5] });
      } else if (match[6] !== undefined) {
        tokens.push({ type: "channel", value: match[7] || match[6] });
      } else if (match[8] !== undefined) {
        tokens.push({ type: "bold", children: tokenizeLine(match[8]) });
      } else if (match[9] !== undefined) {
        tokens.push({ type: "italic", children: tokenizeLine(match[9]) });
      } else if (match[10] !== undefined) {
        tokens.push({ type: "strike", children: tokenizeLine(match[10]) });
      } else if (match[11] !== undefined) {
        const glyph = EMOJI[match[11]];
        tokens.push(
          glyph
            ? { type: "emoji", value: glyph, code: match[11] }
            : { type: "emoji", value: null, code: match[11] },
        );
      }
      cursor = end;
    }
    match = re.exec(line);
  }
  pushText(line.slice(cursor));
  return tokens;
}

/** Whole message -> [{kind: blank|quote|line, tokens}] for the preview. */
export function parseMrkdwn(text) {
  return String(text || "")
    .split("\n")
    .map((line) => {
      if (!line.trim()) return { kind: "blank", tokens: [] };
      if (/^(>|&gt;)\s?/.test(line)) {
        return {
          kind: "quote",
          tokens: tokenizeLine(line.replace(/^(>|&gt;)\s?/, "")),
        };
      }
      return { kind: "line", tokens: tokenizeLine(line) };
    });
}

const MD_LINK_RE = /\[([^\]\n]+)\]\((https?:\/\/[^)\s]+)\)/g;
const MD_BOLD_RE = /\*\*([^*\n]+)\*\*/g;
const MD_HEADING_RE = /^#{1,6}\s+(.+?)\s*#*$/gm;
const MD_BULLET_RE = /^(\s*)[-*]\s+/gm;

/**
 * Markdown -> Slack mrkdwn for the constructs people paste from docs:
 * [label](url) -> <url|label>, **bold** -> *bold*, "# Heading" -> *Heading*,
 * "- item" -> "• item". Text already in mrkdwn is left alone.
 */
export function markdownToMrkdwn(text) {
  return String(text || "")
    .replace(MD_LINK_RE, (_, label, url) => `<${url}|${label}>`)
    .replace(MD_HEADING_RE, (_, title) => `*${title.replace(/\*\*/g, "")}*`)
    .replace(MD_BOLD_RE, "*$1*")
    .replace(MD_BULLET_RE, "$1• ");
}

const countMatches = (text, re) => (text.match(re) || []).length;

/** How many section blocks the backend will send (cuts at blank lines). */
export function sectionCount(text) {
  const length = String(text || "").trim().length;
  if (length <= SLACK_SECTION_LIMIT) return length ? 1 : 0;
  return Math.ceil(length / SLACK_SECTION_LIMIT);
}

/** The broadcast mentions in a message: ["channel", "here", ...] (deduped). */
export function broadcastMentions(text) {
  const found = new Set();
  const re = /<!(channel|here|everyone)>/g;
  let match = re.exec(String(text || ""));
  while (match) {
    found.add(match[1]);
    match = re.exec(String(text || ""));
  }
  return [...found];
}

/**
 * Problems worth showing before a send.
 * [{id, severity: error|warning|info, message, fixable}] — `fixable` means
 * markdownToMrkdwn() resolves it.
 */
export function lintSlackMessage(text) {
  const value = String(text || "");
  const issues = [];
  const trimmed = value.trim();

  if (trimmed.length > SLACK_MESSAGE_LIMIT) {
    issues.push({
      id: "too_long",
      severity: "error",
      message: `The message is ${trimmed.length.toLocaleString()} characters; the limit is ${SLACK_MESSAGE_LIMIT.toLocaleString()}.`,
    });
  } else if (trimmed.length > SLACK_SECTION_LIMIT) {
    issues.push({
      id: "sections",
      severity: "info",
      message: `Over ${SLACK_SECTION_LIMIT.toLocaleString()} characters: it still goes out as one message, split into stacked sections at blank lines.`,
    });
  }

  const mdLinks = countMatches(value, MD_LINK_RE);
  const mdBold = countMatches(value, MD_BOLD_RE);
  const mdHeadings = countMatches(value, MD_HEADING_RE);
  const parts = [];
  if (mdLinks) parts.push(`${mdLinks} Markdown link${mdLinks === 1 ? "" : "s"}`);
  if (mdBold) parts.push(`${mdBold} **bold**`);
  if (mdHeadings) parts.push(`${mdHeadings} # heading${mdHeadings === 1 ? "" : "s"}`);
  if (parts.length) {
    issues.push({
      id: "markdown",
      severity: "warning",
      fixable: true,
      message: `${parts.join(", ")} will show as raw symbols. Slack uses <url|label> and *bold*.`,
    });
  }

  if (/(^|[^\w<!])@(channel|here|everyone)\b/.test(value)) {
    issues.push({
      id: "plain_broadcast",
      severity: "warning",
      message:
        "A typed @channel or @here notifies nobody when the bot posts it. Use the Notify buttons if you want a notification, or remove it.",
    });
  }

  const broadcasts = broadcastMentions(value);
  if (broadcasts.length) {
    issues.push({
      id: "broadcast",
      severity: "warning",
      message: `This notifies ${broadcasts.includes("here") && broadcasts.length === 1 ? "everyone active in" : "everyone in"} the channel (${broadcasts.map((b) => `@${b}`).join(", ")}).`,
    });
  }

  return issues;
}
