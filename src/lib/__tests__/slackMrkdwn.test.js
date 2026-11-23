import {
  broadcastMentions,
  lintSlackMessage,
  markdownToMrkdwn,
  parseMrkdwn,
  tokenizeLine,
  SLACK_MESSAGE_LIMIT,
} from "../slackMrkdwn";

const ANNOUNCEMENT = `:trophy: Fall 2026 hackathon update

What's next: each team works through the 8-item <https://www.ohack.dev/about/completion|Definition of Done> (deployed, nonprofit signoff).

Huge thanks to all 15 teams. :raised_hands:`;

describe("tokenizeLine", () => {
  test("link with a label, emoji and plain text", () => {
    const tokens = tokenizeLine(
      "the <https://www.ohack.dev/about/completion|Definition of Done> :raised_hands:",
    );
    expect(tokens).toEqual([
      { type: "text", value: "the " },
      {
        type: "link",
        url: "https://www.ohack.dev/about/completion",
        label: "Definition of Done",
      },
      { type: "text", value: " " },
      { type: "emoji", value: "🙌", code: "raised_hands" },
    ]);
  });

  test("bold, italic, strike and code", () => {
    const types = tokenizeLine("*b* _i_ ~s~ `c`").map((t) => t.type);
    expect(types).toEqual(["bold", "text", "italic", "text", "strike", "text", "code"]);
  });

  test("snake_case, 2*3*4 and times stay literal", () => {
    expect(tokenizeLine("my_var_name and 2*3*4 at 10:30:00")).toEqual([
      { type: "text", value: "my_var_name and 2*3*4 at 10:30:00" },
    ]);
  });

  test("broadcasts and unknown emoji", () => {
    expect(tokenizeLine("<!channel> :not_a_real_one:")).toEqual([
      { type: "broadcast", value: "channel" },
      { type: "text", value: " " },
      { type: "emoji", value: null, code: "not_a_real_one" },
    ]);
  });

  test("emoji inside bold still renders", () => {
    const [bold] = tokenizeLine("*:tada: Winners*");
    expect(bold.type).toBe("bold");
    expect(bold.children[0]).toEqual({ type: "emoji", value: "🎉", code: "tada" });
  });
});

describe("parseMrkdwn", () => {
  test("keeps blank lines as spacing", () => {
    expect(parseMrkdwn(ANNOUNCEMENT).map((l) => l.kind)).toEqual([
      "line",
      "blank",
      "line",
      "blank",
      "line",
    ]);
  });

  test("quote lines", () => {
    expect(parseMrkdwn("> quoted")[0].kind).toBe("quote");
  });
});

describe("markdownToMrkdwn", () => {
  test("converts links, bold, headings and bullets", () => {
    expect(
      markdownToMrkdwn("# Update\n**Big** news: [docs](https://ohack.dev/x)\n- one\n- two"),
    ).toBe("*Update*\n*Big* news: <https://ohack.dev/x|docs>\n• one\n• two");
  });

  test("leaves mrkdwn alone", () => {
    expect(markdownToMrkdwn(ANNOUNCEMENT)).toBe(ANNOUNCEMENT);
  });
});

describe("lintSlackMessage", () => {
  test("a clean announcement has no issues", () => {
    expect(lintSlackMessage(ANNOUNCEMENT)).toEqual([]);
  });

  test("markdown is fixable and the fix clears it", () => {
    const text = "See [the guide](https://ohack.dev) and **read it**";
    const [issue] = lintSlackMessage(text);
    expect(issue).toMatchObject({ id: "markdown", fixable: true });
    expect(lintSlackMessage(markdownToMrkdwn(text))).toEqual([]);
  });

  test("typed @channel warns; a real broadcast warns separately", () => {
    expect(lintSlackMessage("@channel hello").map((i) => i.id)).toEqual(["plain_broadcast"]);
    expect(lintSlackMessage("<!channel> hello").map((i) => i.id)).toEqual(["broadcast"]);
    expect(lintSlackMessage("mail me@here.org").map((i) => i.id)).toEqual([]);
  });

  test("over the limit is an error", () => {
    const [issue] = lintSlackMessage("x".repeat(SLACK_MESSAGE_LIMIT + 1));
    expect(issue).toMatchObject({ id: "too_long", severity: "error" });
  });
});

test("broadcastMentions dedupes", () => {
  expect(broadcastMentions("<!here> a <!here> b <!channel>")).toEqual(["here", "channel"]);
});
