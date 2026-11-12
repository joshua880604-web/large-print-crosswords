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

## On-screen keyboard update — 2026-11-12

- Build and TypeScript checks passed after adding the shared physical/system/on-screen input handlers.
- 16 Playwright tests passed, including QWERTY input, deletion, next-word selection, hint feedback, saved answers and keyboard preference, physical input while the panel is active, roving focus, Escape/hide/reopen, and complete on-screen solving.
- Touch emulation checked automatic first-interaction opening, active-square visibility above the dock, whole-board visibility when space permits, native-keyboard switching, and a 320px viewport. The keyboard is excluded from print output.
- An automated Axe scan passed with the keyboard visible. Phone-size screenshots were inspected; this does not replace testing the native keyboard on actual iOS and Android devices.
