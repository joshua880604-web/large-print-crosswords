# Large Print Crosswords

An English-language static crossword site for older US adults. Built with Astro 5 and browser-native TypeScript; no database, account service, external fonts, or paid APIs.

## Run locally

Requires Node.js 22.12+ (tested on 24.22.1) and npm.

```sh
cd /workspace/large-print-crosswords
npm ci --cache /tmp/lpc-npm-cache
npm run dev -- --port 4322
```

Production build and local validation:

```sh
npm run build
npm run preview -- --port 4321
npm test
npm run typecheck
npm run audit:seo
npm run audit:content
npm run test:e2e
```

`dist/` is the complete deployable website. `npm run build` validates the puzzle collection before rendering and audits all generated HTML afterward. The SEO audit checks unique indexable titles/descriptions, canonical URLs, sitemap coverage, noindex utility pages, structured data, internal links, and the social preview dimensions. Astro telemetry is disabled in the scripts to avoid writing to the managed environment's protected home directory.

## Collection and content

- 100 independently playable themed mini crosswords across 20 series.
- 1,218 clues; direct American English definitions.
- Each series contains five puzzles with different boards and answer selections. Edited series have distinct subthemes, introductions, solving tips, and three answer explanations each; these boards fit within 11 × 11. Familiar words recur across puzzles; at least three answers differ in each direction between any pair in a series, with answer-set Jaccard similarity at most 0.60.
- Open, connected layouts, up to 13 × 13; some letters are unchecked (belong to one word). These are not newspaper-style fully checked American grids.
- Every puzzle has a permanent playable page, a printable clue sheet, and a separate printable answer sheet.
- Original word banks and definitions are in `scripts/generate-puzzles.py` and `scripts/word-banks.json`. Run `python3 scripts/generate-puzzles.py` to reproduce `src/data/puzzles.json` (standard library only), then build. This replaces the generated JSON; review changes before accepting them. The shared layout builder is `scripts/crossword_grid.py`. The generator reapplies the series listed in `src/data/editorial-series.json` through `scripts/refine_editorial.py`, so existing edited editions survive regeneration. Run `python3 scripts/refine_editorial.py` to update edited series only. `scripts/refine_gardening.py` remains a gardening-only compatibility entry point.
- Automatic validation checks matching crossings, no unclued contiguous runs, connected words, numbering, size, unique boards, and answer-set variation.
- Content has not been tested with target users or independently edited by a professional crossword editor. No medical benefit or search ranking is promised.

## Features

Keyboard/touch entry, arrow-key movement, direction switching at crossings, word checks, letter reveals, confirmation before clearing, browser-local saving, larger clues, optional larger squares with contained scrolling, opt-in synthesized sound, and a docked on-screen QWERTY keyboard. Small touch devices use on-screen mode on first interaction by default; computers start with physical/system input. Users can switch modes, hide the panel, and navigate its letter keys with arrow keys. The selected clue and entered letters remain above the keys, and the selected grid square scrolls above the panel. Browser support for suppressing native touch keyboards varies; physical keyboard input remains enabled in either mode. Without JavaScript, users can read clues and print; interactive play requires JavaScript.

`/daily/` prerenders a selection using America/New_York. With JavaScript, if the build date is stale it selects that day's prebuilt puzzle and redirects to its permanent URL. With JavaScript disabled it clearly labels the build-date selection. This rotates through the existing 100 puzzles; it does not generate new content daily.

PDFs are **not pre-generated downloads**: printable pages use the browser's Print / Save as PDF dialog. Print CSS targets US Letter and uses separate answer routes. Print copies are `noindex,follow`; the sitemap includes the 100 playable pages and primary site pages.

Original editions use `lpc:v1:<puzzle-id>` for progress. Refreshed editions use `lpc:v1:<puzzle-id>:edition:<revision>` and do not overwrite original answers. Thirty-five noindex `/crosswords/<id>/previous/` pages retain the original gardening, bird, music, market, travel, home, and farm boards; users with legacy answers see a continue link. Preference keys use `lpc:sound`, `lpc:large`, and `lpc:keyboard`. No credentials or environment variables are required by the application.

## Browser tests

`npm run test:e2e` uses system Chromium at `/usr/bin/chromium`, a production preview on port 4321, and Playwright. For another machine, change the executable path in `playwright.config.ts` or install Playwright's supported Chromium and omit the path. Tests cover full puzzle completion, hints/checks, saved state, settings, reset confirmation, mobile layout, static print content, accessibility scans, and all 300 puzzle/print/answer routes. Automated accessibility scans do not establish full accessibility conformance.

## Deploy to Cloudflare Pages

1. Connect this repository to Cloudflare Pages.
2. Build command: `npm run build`. Output directory: `dist`. Use Node.js 24.
3. Add `largeprintcrosswords.com` and optionally `www.largeprintcrosswords.com` under Custom domains; follow Cloudflare's DNS instructions in the domain registrar.
4. Choose one primary hostname and redirect the other. Canonical URLs use `https://largeprintcrosswords.com`.
5. Verify HTTPS, mobile play, print output, privacy text, and the sitemap on the real domain before submitting it to Search Console.

The user has connected Cloudflare Pages to this GitHub repository and configured the custom domain. Pushing to `main` triggers the configured build and deployment; a successful push does not prove the Cloudflare build has completed. This coding environment has no Cloudflare account credentials, and live-site checks may require permitting the domain in its outbound network settings. No analytics or advertising are included.

Each cloud task is already isolated: use this checkout directly; do not create a Git worktree unless the user asks for one.

## Search metadata and sharing

Every playable puzzle has its own title and description. WebSite/WebPage JSON-LD describes the actual site, and puzzle BreadcrumbList data matches the visible breadcrumb. These types do not promise special Google search features or ranking. Print copies and 404 are noindex; the sitemap lists 108 canonical HTTPS URLs, including all 100 playable puzzles.

`public/social-card.png` is a committed 1200 × 630 share image. It is served locally and referenced by Open Graph and Twitter Card metadata. To regenerate it, run `npm run social:generate` with a supported local Chromium installation; image generation is not part of the Cloudflare build.

See `docs/search-console.md` for the user's verified-property sitemap submission and launch checks. No Google account actions or indexing requests have been performed by this code.

## Content review batches

Thirty-five current puzzles have been edited into distinct subjects. The gardening URLs contain Garden Tools, Spring Flowers, The Vegetable Patch, Backyard Wildlife, and Starting from Seeds. The bird URLs contain Songbird Neighbors, At the Bird Feeder, Wings in Motion, Nests and New Beginnings, and Birds by the Water. The music URLs contain Radio & Records, At the Piano, Songs & Singing, Rhythm & Dance, and Meet the Orchestra. The market URLs contain Fruit Basket Favorites, The Bread Counter, Dairy Case Finds, Pantry Shelf Staples, and Labels, Prices & Checkout. The travel URLs contain A Relaxed Road Trip, At the Train Station, Around the Airport, A Comfortable Hotel Stay, and Postcards & Travel Memories. The home URLs contain In the Living Room, Tools at the Kitchen Counter, Laundry Day Words, At the Front Door, and A Place for Everything. The farm URLs contain Meet the Farm Animals, Across the Grain Fields, A Visit to the Orchard, Around the Horse Stable, and At the Country Fair. All use stable IDs and separate edition-2 progress keys.

| Series | Original entries / distinct clue pairs | Current entries / distinct clue pairs |
| --- | --- | --- |
| Gardening | 58 / 21 | 58 / 58 |
| Birds | 67 / 21 | 55 / 55 |
| Music | 58 / 21 | 57 / 57 |
| Market | 65 / 21 | 58 / 58 |
| Travel | 64 / 21 | 57 / 57 |
| Home | 64 / 21 | 57 / 57 |
| Farm | 65 / 22 | 58 / 58 |

The current collection has 1,218 clue entries. Sixty-five current puzzles still await this editorial treatment; the report keeps their repetition signals visible. `npm run audit:content` checks for identical complete clue sets and validates each edited series registered in `src/data/editorial-series.json`. It reports exact-clue overlap, answer-set overlap, reused introductions, and remaining numbered titles. The report also lists clues that directly spell out their answer, and edited editions must pass that check. These are review signals, not Google thresholds; warnings do not automatically change indexing. Run `npm run audit:content -- --write` to refresh `docs/content-audit.md` and the JSON report. Production builds run the audit without changing tracked reports.

The series manifest supplies fixed seeds, source filenames, and archive filenames. An existing series keeps its seed, layout settings, and word order when a new series is added. This prevents previously published edited puzzles from changing silently. Legacy archive files in `src/data/archives/` are immutable snapshots; do not regenerate or overwrite them with current layouts. Build-time archive routing and validation use the same manifest. Archive pages are excluded from the sitemap and marked noindex. Use a new revision whenever changing an existing grid so saved letters cannot be applied to a different puzzle.
