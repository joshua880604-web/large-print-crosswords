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

- 220 independently playable themed mini crosswords across 44 series.
- 2,467 clues; direct American English definitions.
- Each series contains five puzzles with different boards and answer selections. All current editions have distinct subthemes, introductions, solving tips, and three answer explanations each; these boards fit within 11 × 11. Familiar words recur across puzzles; at least three answers differ in each direction between any pair in a series, with answer-set Jaccard similarity at most 0.60.
- Open, connected current layouts, up to 11 × 11; some letters are unchecked (belong to one word). These are not newspaper-style fully checked American grids.
- Every puzzle has a permanent playable page, a printable clue sheet, and a separate printable answer sheet.
- Original word banks and definitions are in `scripts/generate-puzzles.py` and `scripts/word-banks.json`. Run `python3 scripts/generate-puzzles.py` to reproduce `src/data/puzzles.json` (standard library only), then build. This replaces the generated JSON; review changes before accepting them. The shared layout builder is `scripts/crossword_grid.py`. The generator reapplies the series listed in `src/data/editorial-series.json` through `scripts/refine_editorial.py`, so existing edited editions survive regeneration. Run `python3 scripts/refine_editorial.py` to update edited series only. `scripts/refine_gardening.py` remains a gardening-only compatibility entry point.
- Automatic validation checks matching crossings, no unclued contiguous runs, connected words, numbering, size, unique boards, and answer-set variation.
- Content has not been tested with target users or independently edited by a professional crossword editor. No medical benefit or search ranking is promised.

## Features

The main collection and all interest collections support shareable `q` and `theme` filters, for example `/crosswords/?q=golf&theme=Sports`. Back navigation and reload restore the filters and expanded results in that history entry; a copied URL starts with twelve results. Clear filters returns focus to search. Search tolerates common apostrophe, period, hyphen, accent and spacing differences. Query variants retain the clean collection canonical and do not add sitemap pages. The home page links directly to music, sports, geography/state capitals, American history and Texas.

Keyboard/touch entry, arrow-key movement, direction switching at crossings, word checks, letter reveals, confirmation before clearing, browser-local saving, larger clues, optional larger squares with contained scrolling, opt-in synthesized sound, and a docked on-screen QWERTY keyboard. Small touch devices use on-screen mode on first interaction by default; computers start with physical/system input. Users can switch modes, hide the panel, and navigate its letter keys with arrow keys. The selected clue and entered letters remain above the keys, and the selected grid square scrolls above the panel. Browser support for suppressing native touch keyboards varies; physical keyboard input remains enabled in either mode. Without JavaScript, users can read clues and print; interactive play requires JavaScript.

`/daily/` prerenders a selection using America/New_York. With JavaScript, if the build date is stale it selects that day's prebuilt puzzle and redirects to its permanent URL. With JavaScript disabled it clearly labels the build-date selection. This rotates through the existing 220 puzzles; it does not generate new content daily.

PDFs are **not pre-generated downloads**: printable pages use the browser's Print / Save as PDF dialog. Print CSS targets US Letter and uses separate answer routes. Print copies are `noindex,follow`; the sitemap includes the 220 playable pages and primary site pages.

Original editions use `lpc:v1:<puzzle-id>` for progress. Current editions use `lpc:v1:<puzzle-id>:edition:<revision>` and do not overwrite original answers. One hundred noindex `/crosswords/<id>/previous/` pages retain the original boards in the original twenty series; users with legacy answers see a continue link. Preference keys use `lpc:sound`, `lpc:large`, and `lpc:keyboard`. New first editions use revision 1 and have no previous-edition route. The existing refreshed editions retain revision 2 and their archives. No credentials or environment variables are required by the application.

## Browser tests

`npm run test:e2e` uses system Chromium at `/usr/bin/chromium`, a production preview on port 4321, and Playwright. For another machine, change the executable path in `playwright.config.ts` or install Playwright's supported Chromium and omit the path. Tests cover full puzzle completion, hints/checks, saved state, settings, reset confirmation, mobile layout, static print content, accessibility scans, all 660 current puzzle/print/answer routes, and collection filtering and history restoration. Automated accessibility scans do not establish full accessibility conformance.

## Deploy to Cloudflare Pages

1. Connect this repository to Cloudflare Pages.
2. Build command: `npm run build`. Output directory: `dist`. Use Node.js 24.
3. Add `largeprintcrosswords.com` and optionally `www.largeprintcrosswords.com` under Custom domains; follow Cloudflare's DNS instructions in the domain registrar.
4. Choose one primary hostname and redirect the other. Canonical URLs use `https://largeprintcrosswords.com`.
5. Verify HTTPS, mobile play, print output, privacy text, and the sitemap on the real domain before submitting it to Search Console.

The user has connected Cloudflare Pages to this GitHub repository and configured the custom domain. Pushing to `main` triggers the configured build and deployment; a successful push does not prove the Cloudflare build has completed. This coding environment has no Cloudflare account credentials, and live-site checks may require permitting the domain in its outbound network settings. No analytics or advertising are included.

Each cloud task is already isolated: use this checkout directly; do not create a Git worktree unless the user asks for one.

## Search metadata and sharing

Every playable puzzle has its own title and description. WebSite/WebPage JSON-LD describes the actual site, and puzzle BreadcrumbList data matches the visible breadcrumb. These types do not promise special Google search features or ranking. Print copies and 404 are noindex; the sitemap lists 233 canonical HTTPS URLs, including all 220 playable puzzles.

`public/social-card.png` is a committed 1200 × 630 share image. It is served locally and referenced by Open Graph and Twitter Card metadata. To regenerate it, run `npm run social:generate` with a supported local Chromium installation; image generation is not part of the Cloudflare build.

See `docs/search-console.md` for the user's verified-property sitemap submission and launch checks. No Google account actions or indexing requests have been performed by this code.

## Content review

All 220 current puzzles have distinct subjects, introductions, solving tips, and three explanations tied to actual answers. The original 100 published puzzle objects and their progress keys are unchanged. The later 120 use new stable IDs and first-edition progress keys.

| Series | Current puzzles | Clues | Edition |
| --- | ---: | ---: | --- |
| Gardening | 5 | 58 | Refreshed, with archive |
| Birds | 5 | 55 | Refreshed, with archive |
| Music | 5 | 57 | Refreshed, with archive |
| Market | 5 | 58 | Refreshed, with archive |
| Travel | 5 | 57 | Refreshed, with archive |
| Home | 5 | 57 | Refreshed, with archive |
| Farm | 5 | 58 | Refreshed, with archive |
| Baking | 5 | 56 | Refreshed, with archive |
| Crafts | 5 | 57 | Refreshed, with archive |
| Flowers | 5 | 58 | Refreshed, with archive |
| Pets | 5 | 56 | Refreshed, with archive |
| Drinks | 5 | 55 | Refreshed, with archive |
| Movies | 5 | 55 | Refreshed, with archive |
| Seaside | 5 | 55 | Refreshed, with archive |
| Autumn | 5 | 58 | Refreshed, with archive |
| Holidays | 5 | 57 | Refreshed, with archive |
| Reading | 5 | 57 | Refreshed, with archive |
| Weather | 5 | 56 | Refreshed, with archive |
| Workshop | 5 | 57 | Refreshed, with archive |
| Games | 5 | 58 | Refreshed, with archive |
| Baseball | 5 | 56 | First publication |
| Leisure Sports | 5 | 57 | First publication |
| Team Sports | 5 | 56 | First publication |
| Active Pastimes | 5 | 55 | First publication |
| American Music | 5 | 55 | First publication |
| Musical Instruments | 5 | 56 | First publication |
| Dance and Song | 5 | 58 | First publication |
| Christmas | 5 | 55 | First publication |
| Thanksgiving | 5 | 55 | First publication |
| Halloween | 5 | 56 | First publication |
| Easter | 5 | 55 | First publication |
| Spring Days | 5 | 57 | First publication |
| Summer Days | 5 | 54 | First publication |
| Winter Days | 5 | 56 | First publication |
| Celebrations | 5 | 55 | First publication |
| Painting | 5 | 55 | First publication |
| Handmade Arts | 5 | 57 | First publication |
| Everyday Meals | 5 | 56 | First publication |
| Fruit and Flavor | 5 | 56 | First publication |
| Collections | 5 | 56 | First publication |
| Geography | 5 | 56 | First publication |
| State Capitals | 5 | 52 | First publication |
| American History | 5 | 55 | First publication |
| Texas | 5 | 53 | First publication |

The collection has 2,467 clues, 2,467 distinct answer/clue pairs, 220 different introductions and 660 answer explanations. Familiar answers recur in different contexts; answer-set overlap is reported separately. No numbered-edition titles remain. See [the content audit](docs/content-audit.md) and [the audience/research notes](docs/expansion-200-research.md).

Five curated topic pages cover sports, music, geography/state capitals, American history and Texas. Geography groups five landscape/map subjects and five capital-city routes in one collection. The twenty newest puzzles are a limited interest/state pilot described in [the research and editorial notes](docs/place-history-pilot.md). Each actual puzzle retains one canonical playable URL.

`npm run audit:content` checks identical complete clue sets, within-series repetition, self-answer clues, subject text and the archived/first-edition distinction. Counts and overlap are internal review signals, not Google thresholds. Run `npm run audit:content -- --write` to refresh reports; production builds audit without rewriting them.

Source subjects may declare `requiredAnswers` for defining words that must appear in the finished grid; layout selection and validation both enforce this. The series manifest supplies fixed seeds, source filenames, and archive filenames. An existing series keeps its seed, layout settings, and word order when a new series is added. This prevents previously published edited puzzles from changing silently. First-edition series omit `archive` and set `revision: 1`; their source subjects are appended by the generator. Legacy archive files in `src/data/archives/` are immutable snapshots; do not regenerate or overwrite them with current layouts. Build-time archive routing and validation use the same manifest. Archive pages are excluded from the sitemap and marked noindex. Use a new revision whenever changing an existing grid so saved letters cannot be applied to a different puzzle.

When a first-edition grid is changed in a future release, preserve its numbered predecessor progress key and implement/test that archive bridge. The current legacy bridge applies to the original hundred archived puzzles; increasing a revision alone is not a complete migration for a revision-1 puzzle.
