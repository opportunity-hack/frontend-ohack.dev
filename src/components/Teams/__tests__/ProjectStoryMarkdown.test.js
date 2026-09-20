import React from "react";
import { render } from "@testing-library/react";
import { demoteHeadingTag, buildMarkdownComponents } from "../ProjectStoryMarkdown";

// The default export wires these components into a `next/dynamic`-loaded
// react-markdown instance, which isn't worth the flakiness of exercising
// under Jest (no test elsewhere in this codebase renders a `dynamic`
// component either — see SingleNews.js). The logic that matters —
// heading demotion, lazy images, safe links — lives in these two pure
// exports, tested directly here by rendering the elements they return.

describe("demoteHeadingTag", () => {
  it("shifts a heading down by demoteBy levels", () => {
    expect(demoteHeadingTag("h1", 1)).toBe("h2");
    expect(demoteHeadingTag("h2", 1)).toBe("h3");
    expect(demoteHeadingTag("h1", 2)).toBe("h3");
  });

  it("clamps at h6 rather than overflowing", () => {
    expect(demoteHeadingTag("h5", 3)).toBe("h6");
    expect(demoteHeadingTag("h6", 1)).toBe("h6");
  });

  it("defaults to demoting by 1 and treats a negative/NaN shift as 0", () => {
    expect(demoteHeadingTag("h2")).toBe("h3");
    expect(demoteHeadingTag("h2", -5)).toBe("h2");
    expect(demoteHeadingTag("h2", "not-a-number")).toBe("h2");
  });

  it("passes through an unrecognized tag unchanged", () => {
    expect(demoteHeadingTag("p", 1)).toBe("p");
  });
});

describe("buildMarkdownComponents", () => {
  it("renders every heading level demoted by the given amount", () => {
    const components = buildMarkdownComponents(1);
    const Heading = components.h2;
    const { container } = render(<Heading>Section title</Heading>);
    expect(container.querySelector("h3")).toHaveTextContent("Section title");
  });

  it("defaults to demoting by 1 when no components() arg is given", () => {
    const components = buildMarkdownComponents();
    const Heading = components.h1;
    const { container } = render(<Heading>Top</Heading>);
    expect(container.querySelector("h2")).toHaveTextContent("Top");
  });

  it("renders images as lazy + async-decoded", () => {
    const { Img } = { Img: buildMarkdownComponents(1).img };
    const { container } = render(<Img src="https://cdn.ohack.dev/x.png" alt="thumb" />);
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("loading", "lazy");
    expect(img).toHaveAttribute("decoding", "async");
    expect(img).toHaveAttribute("src", "https://cdn.ohack.dev/x.png");
  });

  it("renders links that open in a new tab without leaking window.opener", () => {
    const Link = buildMarkdownComponents(1).a;
    const { container } = render(<Link href="https://example.com">External</Link>);
    const anchor = container.querySelector("a");
    expect(anchor).toHaveAttribute("target", "_blank");
    expect(anchor).toHaveAttribute("rel", "noopener noreferrer");
  });
});
