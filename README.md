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
npm run test:e2e
```

`dist/` is the complete deployable website. `npm run build` validates the puzzle collection before rendering. Astro telemetry is disabled in the scripts to avoid writing to the managed environment's protected home directory.

## Collection and content

- 100 independently playable themed mini crosswords across 20 subjects.
- 1,259 clues; direct American English definitions.
- Each series contains five puzzles with different boards and answer selections. Familiar words recur across puzzles; at least three answers differ in each direction between any pair in a series, with answer-set Jaccard similarity at most 0.60.
- Open, connected layouts, up to 13 × 13; some letters are unchecked (belong to one word). These are not newspaper-style fully checked American grids.
- Every puzzle has a permanent playable page, a printable clue sheet, and a separate printable answer sheet.
- Original word banks and definitions are in `scripts/generate-puzzles.py` and `scripts/word-banks.json`. Run `python3 scripts/generate-puzzles.py` to reproduce `src/data/puzzles.json` (standard library only), then build. This replaces the generated JSON; review changes before accepting them.
- Automatic validation checks matching crossings, no unclued contiguous runs, connected words, numbering, size, unique boards, and answer-set variation.
- Content has not been tested with target users or independently edited by a professional crossword editor. No medical benefit or search ranking is promised.

## Features

Keyboard/touch entry, arrow-key movement, direction switching at crossings, word checks, letter reveals, confirmation before clearing, browser-local saving, larger clues, optional larger squares with contained scrolling, and opt-in synthesized sound. Without JavaScript, users can read clues and print; interactive play requires JavaScript.

`/daily/` prerenders a selection using America/New_York. With JavaScript, if the build date is stale it selects that day's prebuilt puzzle and redirects to its permanent URL. With JavaScript disabled it clearly labels the build-date selection. This rotates through the existing 100 puzzles; it does not generate new content daily.

PDFs are **not pre-generated downloads**: printable pages use the browser's Print / Save as PDF dialog. Print CSS targets US Letter and uses separate answer routes. Print copies are `noindex,follow`; the sitemap includes the 100 playable pages and primary site pages.

Local storage keys use `lpc:v1:<puzzle-id>`, `lpc:sound`, and `lpc:large`. No credentials or environment variables are required by the application.

## Browser tests

`npm run test:e2e` uses system Chromium at `/usr/bin/chromium`, a production preview on port 4321, and Playwright. For another machine, change the executable path in `playwright.config.ts` or install Playwright's supported Chromium and omit the path. Tests cover full puzzle completion, hints/checks, saved state, settings, reset confirmation, mobile layout, static print content, accessibility scans, and all 300 puzzle/print/answer routes. Automated accessibility scans do not establish full accessibility conformance.

## Deploy to Cloudflare Pages

1. Connect this repository to Cloudflare Pages.
2. Build command: `npm run build`. Output directory: `dist`. Use Node.js 24.
3. Add `largeprintcrosswords.com` and optionally `www.largeprintcrosswords.com` under Custom domains; follow Cloudflare's DNS instructions in the domain registrar.
4. Choose one primary hostname and redirect the other. Canonical URLs use `https://largeprintcrosswords.com`.
5. Verify HTTPS, mobile play, print output, privacy text, and the sitemap on the real domain before submitting it to Search Console.

No Cloudflare account changes, domain DNS updates, or production deployment have been performed. Update the privacy page to identify the selected host and its policy before public launch. No analytics or advertising are included.

Each cloud task is already isolated: use this checkout directly; do not create a Git worktree unless the user asks for one.
