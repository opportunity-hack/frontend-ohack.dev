# Share-card fonts

Static TTF instances used ONLY by the satori renderer in
`src/pages/api/share-card/[event_id]/[type]/[volunteer_id].js` (satori can't
read the woff2 variable fonts the site ships in `src/styles/fonts/`). They live under `public/` so the deployment also serves them at `/share-card/fonts/<file>` — the route's fallback when the files aren't in the function bundle.

| file                   | family                                   | weight / style |
| ---------------------- | ---------------------------------------- | -------------- |
| `display-600.ttf`        | the site's display serif (see OFL-Fraunces.txt)     | 600 normal, opsz 72 |
| `display-600-italic.ttf` | same family, italic                                | 600 italic, opsz 72 |
| `body-400.ttf`           | the site's body grotesk (see OFL-HankenGrotesk.txt) | 400 normal |
| `body-600.ttf`           | same family                                         | 600 normal |

Neutral file names on purpose: the eslint `no-restricted-syntax` font-literal
rule (src/styles/fonts.js is the single source of family names) would flag
the family names in JS. Both families are SIL Open Font License 1.1 — the
license texts are alongside. Instances were fetched from the Google Fonts CSS
API (`family=…:ital,opsz,wght@0,72,600;1,72,600` / `wght@400;600`).
