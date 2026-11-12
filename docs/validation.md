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

## Search launch update — 2026-11-12

- Full production build and post-build SEO audit passed across 309 HTML files: 108 unique indexable canonical URLs, including all 100 game pages; 200 print copies and the 404 page are noindex.
- All indexable titles and descriptions are unique. Canonical and share URLs use the production HTTPS origin. Every root-relative link/asset target resolves to generated output.
- WebSite/WebPage JSON-LD parses and matches the document metadata; puzzle breadcrumb data matches visible navigation. This does not establish eligibility for any special Google result.
- Committed local Open Graph/Twitter preview image verified at 1200 × 630; image appearance inspected.
- TypeScript checks and 18 Playwright tests passed, including query-string canonical handling, escaped text consistency, image serving, print noindex, and the actual 404 response, plus gameplay/accessibility regressions.
- User reports Search Console ownership verified, with sitemap submission still pending. No Google account action or indexing request was performed by the agent.
- Live-domain HTTP/TLS/redirect verification remains blocked by the current environment's unchanged outbound allowlist. All automated results above refer to the generated build or its local preview, not an externally verified deployment.

## Gardening editorial pilot — 2026-11-12

- Changed exactly five current gardening puzzles; the other 95 layouts and clues remain unchanged. Stable current URLs retained.
- Five original grids preserved byte-for-byte in the legacy archive and verified by the same structural checks. Revisioned progress keys and a previous-edition link allow saved original games to remain playable without contaminating new grids.
- Five new subjects use boards no larger than 11 × 11, with 11–12 clues each, individual introductions/tips, and three explanations tied to actual answers. No professional or target-user review is claimed.
- Gardening: 58 entries / 21 distinct answer-clue pairs before; 58 entries / 58 distinct pairs after. All five intros differ. Collection remains 100 current puzzles / 1,259 entries; current distinct answer-clue pairs rise from 433 to 469.
- Committed content-overlap report generated. It explicitly retains the other 95 puzzles' review signals; no automatic noindex changes made to current puzzles.
- Full collection regeneration reproduced the inspected JSON exactly and left the legacy archive unchanged.
- Build, content audit, SEO audit, TypeScript and 22 Playwright tests passed, including print-grid proportion checks, old/new saved-progress isolation, all five note sections, and noindex legacy routes. Total static output is now 314 HTML pages; the canonical sitemap still has 108 URLs.
- After correcting print-grid proportions and footer spacing without reducing clue text size, all 100 current print sheets exported as single US Letter pages in Chromium. Physical printing and target-user difficulty still need real-world feedback.

## Bird editorial batch — 2026-11-12

- Replaced only the five current backyard-bird editions. The other 95 current puzzles, including the previously edited gardening batch, remain byte-for-byte identical as puzzle objects.
- Bird subjects: Songbird Neighbors, At the Bird Feeder, Wings in Motion, Nests and New Beginnings, and Birds by the Water. Each has 10–12 clues in a board no larger than 11 × 11, unique introductory and solving text, and three explanations tied to actual answers.
- Bird series: 67 entries / 21 distinct answer-clue pairs before; 55 entries / 55 distinct pairs after. Reusing a word with a different contextual meaning, such as an eggshell versus a seed shell, is permitted and reported separately from exact-clue repetition.
- Collection remains 100 current puzzles, now with 1,247 clue entries, 503 distinct answer-clue pairs, 28 distinct introductions, and 10 edited editions. Ninety current puzzles remain in the editorial queue; 72 numbered titles remain visible in the report.
- The shared series manifest now drives deterministic refinements, preserved-original validation, and previous-edition routes. Existing gardening seeds and results remained unchanged. Full regeneration reproduced all 100 current puzzles exactly, without changing either archive.
- Build, content/SEO audits, TypeScript and 23 Playwright tests passed. Tests cover both families' saved-game isolation, all ten note sections, all ten noindex archives, and lookup using the renamed series' original name.
- All five changed bird print sheets exported as single US Letter pages in Chromium. Reader notes visually inspected. Total static HTML output is 319 pages; canonical sitemap coverage stays at 108 URLs.
- Live Cloudflare deployment status, actual mobile keyboards and physical printers were not verified by these local checks. No target-user or professional editorial review is claimed.
