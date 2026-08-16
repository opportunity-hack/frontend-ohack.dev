# src/styles — legacy CSS + font tokens

`fonts.js` is the single source of truth for font families (see root CLAUDE.md
"Typography system"). Never hardcode `'Hanken Grotesk'`/`'Fraunces'` — import
`FONT_BODY`/`FONT_DISPLAY`. `npm run lint` + `__tests__/typography.test.js`
enforce this and the `html { font-size: 100% }` root.

## Frozen px values — do not "modernize" back to rem

All px values in these CSS files and in `nonprofit/styles.js` +
`nonprofits/apply/styles.js` were frozen at the look they had under the old
12px root (old rem × 12). Converting them to rem at face value would render
them 33% larger than designed. Leave them px, or re-derive deliberately.

## Opportunistic cleanup (do these when you touch the relevant file)

- `--font-primary`/`--font-secondary` in `theme.css` are LIVE aliases
  (consumed by `general.css` body/h1–h6 and `components/button.css`) — keep.
- The BEM blocks (`.ohack-feature*` in `general.css`, `hero-banner.css`,
  `code-snippet.css`, `content-layout.css`, `profile-grid.css`, parts of
  `footer.css`, `nav-bar.css`) are legacy-but-live. If you migrate or delete
  the LAST consumer of a block (verify with a `className` grep), delete the
  block — and the whole file if it empties — plus its `@import` in the
  `index.css` barrels. Dead blocks were already purged in Aug 2026; don't let
  new ones accumulate.
