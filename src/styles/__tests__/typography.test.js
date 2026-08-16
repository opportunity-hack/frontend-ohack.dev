/**
 * Typography system contract locks (see CLAUDE.md "Typography system").
 *
 * These assertions protect invariants that broke silently for years:
 * - html { font-size: 12px } made every rem-based size render at 75% of its
 *   face value (12px body text, 10.5px buttons). The root must stay 100%.
 * - Legacy CSS was frozen to px when the root was fixed; a rem sneaking back
 *   into src/styles/**.css would render at a different size than its author
 *   saw pre-flip.
 * - Font families must come from src/styles/fonts.js. next/font renames
 *   loaded families to hashed names, so a hardcoded 'Hanken Grotesk' literal
 *   silently falls back to system fonts.
 */
import fs from "fs";
import path from "path";
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from "../fonts";
import theme from "../../assets/theme";

const STYLES_DIR = path.join(__dirname, "..");

function cssFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return cssFiles(p);
    return e.name.endsWith(".css") ? [p] : [];
  });
}

describe("root font-size", () => {
  const generalCss = fs.readFileSync(
    path.join(STYLES_DIR, "general.css"),
    "utf8",
  );

  it("html font-size is 100% (never a fixed px value)", () => {
    const htmlBlock = generalCss.match(/html\s*\{[^}]*\}/)[0];
    expect(htmlBlock).toMatch(/font-size:\s*100%/);
  });

  it("no rem values remain in src/styles CSS (frozen to px at the flip)", () => {
    for (const file of cssFiles(STYLES_DIR)) {
      const css = fs
        .readFileSync(file, "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, ""); // ignore comments
      const rems = css.match(/[\d.]+rem\b/g) || [];
      expect({ file: path.relative(STYLES_DIR, file), rems }).toEqual({
        file: path.relative(STYLES_DIR, file),
        rems: [],
      });
    }
  });
});

describe("font tokens (src/styles/fonts.js is the single source)", () => {
  it("exports the expected token strings", () => {
    expect(FONT_BODY).toBe(
      "var(--font-body, 'Hanken Grotesk', system-ui, -apple-system, sans-serif)",
    );
    expect(FONT_DISPLAY).toBe(
      "var(--font-display, 'Fraunces', Georgia, 'Times New Roman', serif)",
    );
    expect(FONT_MONO).toBe(
      "ui-monospace, 'Fira Code', SFMono-Regular, Menlo, Consolas, monospace",
    );
  });
});

describe("global MUI theme typography", () => {
  it("body and every heading variant use the body token", () => {
    expect(theme.typography.fontFamily).toBe(FONT_BODY);
    for (const v of ["h1", "h2", "h3", "h4", "h5", "h6"]) {
      expect(theme.typography[v].fontFamily).toBe(FONT_BODY);
    }
  });

  it("h1 no longer falls back to monospace (the old Montserrat bug)", () => {
    expect(theme.typography.h1.fontFamily).not.toMatch(/Montserrat|monospace/);
  });
});
