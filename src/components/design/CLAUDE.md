# src/components/design — refined design system

`RefinedFonts` in `refined.js` is a **deprecated null stub** (fonts load
globally via next/font in `_document.js`; source of truth is
`src/styles/fonts.js`). ~40 legacy call sites still render it.

- **Never** re-add Google Fonts `<link>`s here or add new `<RefinedFonts />`
  call sites.
- When you touch a file that renders `<RefinedFonts />`, delete the usage and
  its import as part of your change (it renders nothing).
- When the last call site is gone (`grep -rl "<RefinedFonts" src/`), delete
  the stub itself.

The `.ohx-*` sizes in `refined.js` are px, frozen at the pre-root-flip look
(see root CLAUDE.md "Typography system") — don't convert them to rem. Any
deliberate size bump (e.g. the 9px eyebrows/tags) is a design decision, not a
migration.
