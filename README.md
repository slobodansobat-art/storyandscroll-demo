# Story & Scroll Studio · animirani demo

Statički sajt (Astro). Tekstovi su u `src/data/` (JSON), spremni za Decap CMS.

- `npm install`, pa `npm run build` → gotov sajt je u `dist/`
- Netlify čita podešavanja iz `netlify.toml` (build: `npm run build`, objavljuje `dist`)
- Demo je namerno sakriven od pretraživača (`src/data/site.json` → `bezIndeksiranja`, i `public/robots.txt`).

## Uređivanje sadržaja (Decap CMS)

- Adresa: `/admin/`. Prijava je preko GitHub naloga koji ima pravo upisa u ovaj repo (Netlify je posrednik za prijavu, GitHub OAuth).
- Sav sadržaj je u `src/data/` (JSON). CMS menja te fajlove i pravi commit; Netlify zatim sam objavi novu verziju (oko minut).
- Slike koje se ubace kroz CMS idu u `public/img/izvorne/`. Pri svakom buildu `scripts/slike.mjs` pravi manje verzije (480–1600 px, WebP) u `public/img/v/` i spisak u `src/data/slike-meta.json` (oba se ne čuvaju u repou).
- Lokalni test CMS-a: `npx decap-server` u ovom folderu, pa `npm run dev` i otvoriti `http://localhost:4321/admin/`.
