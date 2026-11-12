# Validation — 2026-11-12

- `npm run build`: 309 static pages generated; no server adapter.
- `npm run typecheck`: TypeScript checks passed.
- `npm test`: 100 unique connected puzzles, 1,259 clue entries. Crossings, numbering, bounds, unclued letter runs, duplicate grids, and within-series answer variation checked.
- `npm run test:e2e`: 12 Playwright tests passed against the production build in system Chromium. Includes a complete solved puzzle, input and hint behavior, check feedback, persistence, settings/reset, touch direction changes, enlarged board containment, blocked-storage fallback, stale-build daily rotation, all 300 puzzle-related URLs, and static print content with JavaScript disabled.
- Axe WCAG A/AA automated scans passed for the home page, a representative game, and the printable collection. This is not a claim of complete accessibility conformance.
- At a 390px emulated mobile viewport, main pages fit without whole-page horizontal overflow. Enlarged squares scroll inside the board.
- Exported all 100 puzzle print pages through Chromium's PDF renderer, using CSS US Letter settings: all 100 were one page. Browser Save as PDF is the site's export method; downloadable PDF files are not shipped.
- Desktop and mobile screenshots visually inspected. System fonts, no remote images or font services.

Not established: real mobile-device keyboard behavior, physical-printer results, professional clue editing, target-user difficulty feedback, production DNS/HTTPS, indexing, traffic, advertising revenue, or fresh-task snapshot restoration.
