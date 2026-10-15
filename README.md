# Story & Scroll Studio · animirani demo

Statički sajt (Astro). Tekstovi su u `src/data/` (JSON), spremni za Decap CMS.

- `npm install`, pa `npm run build` → gotov sajt je u `dist/`
- Netlify čita podešavanja iz `netlify.toml` (build: `npm run build`, objavljuje `dist`)
- Demo je namerno sakriven od pretraživača (`src/data/site.json` → `bezIndeksiranja`, i `public/robots.txt`).
