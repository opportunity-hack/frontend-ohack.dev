/**
 * /recruit-tech-talent — recruiter pillar page.
 *
 * Covers the layout invariant behind the Nov 2026 fix: the card grids used to
 * use `auto-fit minmax(...)`, whose columns stretch to whatever the content
 * width allows, so the 4 value cards orphaned 3+1 and the 5 role cards
 * orphaned 4+1. The grids are now breakpoint objects chosen to divide each
 * set, and this test fails if any `auto-fit` grid (or the deprecated
 * `RefinedFonts` stub) comes back. Also guards the one-<h1>, all-sections-
 * render and FAQ ↔ FAQPage JSON-LD parity contracts.
 */
import React from "react";
import { readFileSync } from "fs";
import path from "path";
import { render, screen } from "@testing-library/react";

jest.mock("next/link", () => {
  const ReactLib = require("react");
  const MockLink = ReactLib.forwardRef(({ children, href, ...rest }, ref) =>
    ReactLib.createElement("a", { href, ref, ...rest }, children),
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});
jest.mock("next/image", () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ fill, priority, sizes, ...props }) => <img alt="" {...props} />,
}));
jest.mock("../../lib/ga", () => ({
  trackEvent: jest.fn(),
  initFacebookPixel: jest.fn(),
}));

import RecruitTechTalent, {
  getStaticProps,
  FAQ_ITEMS,
} from "../../pages/recruit-tech-talent/index";

describe("/recruit-tech-talent", () => {
  it("renders one h1 and every card heading", () => {
    render(<RecruitTechTalent />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    [
      "Proof over résumés",
      "Mission-driven, higher retention",
      "See candidates in action",
      "Grit and determination",
      "Software Engineers",
      "Product Managers",
      "Technical PMs",
      "Designers",
      "Data & ML",
      "Tell us who you're hiring",
      "Sponsor the next hackathon",
      "Meet and recruit candidates",
    ].forEach((name) => {
      expect(
        screen.getByRole("heading", { level: 3, name }),
      ).toBeInTheDocument();
    });
  });

  it("uses divisor-matched breakpoints for the card grids, never auto-fit", () => {
    const source = readFileSync(
      path.join(__dirname, "../../pages/recruit-tech-talent/index.js"),
      "utf8",
    );
    // No auto-fit *usage* (the explanatory comment may still name it).
    expect(source).not.toMatch(/gridTemplateColumns[^}]*auto-fit/);
    // 4 value cards + 4 sponsor tiers -> 2-up; 3 steps -> 3-up; 5 roles -> 5-up.
    expect(source).toContain('md: "repeat(2, 1fr)"');
    expect(source).toContain('md: "repeat(3, 1fr)"');
    expect(source).toContain('lg: "repeat(5, 1fr)"');
    expect(source).not.toContain("RefinedFonts");
  });

  it("keeps the visible FAQ and the FAQPage JSON-LD in sync", async () => {
    render(<RecruitTechTalent />);
    FAQ_ITEMS.forEach((item) => {
      expect(screen.getByText(item.q)).toBeInTheDocument();
      expect(screen.getByText(item.a)).toBeInTheDocument();
    });
    const { props } = await getStaticProps();
    const faq = props.structuredData["@graph"].find(
      (n) => n["@type"] === "FAQPage",
    );
    expect(faq.mainEntity.map((q) => q.name)).toEqual(
      FAQ_ITEMS.map((i) => i.q),
    );
  });
});
