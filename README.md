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

## Current collection and group printing

This checkout has **2,000 games**, including the completed 500-game expansion. The November 18 release contains 1,500 current puzzles. All published puzzles, 100 original archives, 82 numbered archives, and their saved-progress keys are preserved. See [the current validation notes](docs/research/expansion-2000/board-validation.md), [the page quality review](docs/puzzle-page-quality-2026-11-19.md), and [the 300-game release](docs/expansion-1500.md). The optional Bible collection in this checkout has 105 games.

[The print-pack page](https://largeprintcrosswords.com/print-pack/) lets a reader select up to ten games, filter by theme or title, and prepare one print job. Puzzle sheets precede optional separate answers. The default uses 18pt text and two US Letter pages per sheet; compact uses 13pt and one page. This still uses the browser's Print / Save as PDF, with no pre-generated PDF downloads. The utility page is noindex and excluded from the sitemap.

The printable directory opens print sheets directly, with separate answer and online-play links on each card. Christmas, Thanksgiving and winter pages link to complete seasonal print-pack collections, including games filed under other themes. The Holiday or season filter keeps selections when changed. See [the print-entry update](docs/print-entry-2026-11-16.md) for the measured flow and validation.

Print packs save a local selection draft and print options for reload/return, show selected titles with individual removal buttons, and share the catalog's punctuation-tolerant search. A topic link changes the filter without discarding selected games; a restored draft still needs to be prepared before printing. See [the draft and wording update](docs/print-pack-draft-2026-11-16.md).

Production builds generate 6,213 HTML files and 2,029 canonical sitemap URLs. All 2,000 games are reachable through ordinary HTML links. The standard checks are `npm run build`, `npm run typecheck`, and `npm run test:e2e`.

Run `python3 scripts/generate-expansion-2000.py --check` to reproduce the current additions and verify their preservation, board uniqueness, and answer-set comparisons. Earlier releases have their own preservation and validation reports.

With a production preview on port 4323, run `npm run audit:playthrough -- http://127.0.0.1:4323 /tmp/lpc-2000-playthrough.json --new-only --release=2000` to exercise the latest 345 local additions through keyboard input and saved-progress restoration. Use `--release=1655`, `--release=1610`, `--release=1570`, `--release=1545`, `--release=1500`, `--release=1200` or `--release=1000` for the earlier additions. Omitting `--new-only` checks current and archived boards.

## Collection and content

- 2,000 independently playable themed mini crosswords across 400 series.
- 21,868 clues with direct American English definitions.
- Each series contains five puzzles with different boards and answer selections. Each current edition has a subtheme, an introduction, solving guidance, and three answer explanations; these boards fit within 11 × 11. Familiar words recur across puzzles; at least three answers differ in each direction between any pair in a series, with answer-set Jaccard similarity at most 0.60.
- Open, connected current layouts, up to 11 × 11; some letters are unchecked (belong to one word). These are not newspaper-style fully checked American grids.
- Every puzzle has a permanent playable page, a printable clue sheet, and a separate printable answer sheet.
- The November 16 additions have reviewable scene, definition, context-clue and answer-note files in `scripts/expansion-1200-*.txt`. Run `python3 scripts/prepare-expansion-1200.py` and `python3 scripts/generate-expansion-1200.py` to reproduce only this addition while retaining the first 1,000 objects. The original tools `scripts/generate-puzzles.py` and `scripts/refine_editorial.py` remain for historical authoring; they rebuild boards and are not a routine refresh for published progress keys. Any published answer or layout replacement needs proper edition handling and a preserved prior snapshot. The shared layout builder is `scripts/crossword_grid.py`.
- Automatic validation checks matching crossings, no unclued contiguous runs, connected words, numbering, size, unique boards, and answer-set variation.
- Content has not been tested with target users or independently edited by a professional crossword editor. No medical benefit or search ranking is promised.

## Features

The main collection and all interest collections support shareable `q` and `theme` filters, for example `/crosswords/?q=golf&theme=Sports`. Back navigation and reload restore the filters and expanded results in that history entry; a copied URL starts with twelve results. Clear filters returns focus to search. Search tolerates common apostrophe, period, hyphen, accent and spacing differences. Query variants retain the clean collection canonical and do not add sitemap pages. The home page links directly to Christmas, music, sports, geography/state capitals, American history and Texas.

Keyboard/touch entry, arrow-key movement, direction switching at crossings, word checks, letter reveals, confirmation before clearing, browser-local saving, larger clues, optional larger squares with contained scrolling, opt-in synthesized sound, and a docked on-screen QWERTY keyboard. Small touch devices use on-screen mode on first interaction by default; computers start with physical/system input. Users can switch modes, hide the panel, and navigate its letter keys with arrow keys. The selected clue and entered letters remain above the keys, and the selected grid square scrolls above the panel. Browser support for suppressing native touch keyboards varies; physical keyboard input remains enabled in either mode. Without JavaScript, users can read clues and print; interactive play requires JavaScript.

`/daily/` prerenders a selection using America/New_York. With JavaScript, if the build date is stale it selects that day's prebuilt puzzle and redirects to its permanent URL. With JavaScript disabled it clearly labels the build-date selection. This rotates through the existing 2,000 puzzles; it does not generate new content daily.

The Christmas collection and both print layouts are described in [the November 14 upgrade](docs/christmas-print-upgrade.md).

PDFs are **not pre-generated downloads**: printable pages use the browser's Print / Save as PDF dialog. Print CSS targets US Letter at 100% scale and uses separate answer routes. The default layout has 18pt clues, a grid up to 5.4 inches, and two pages (grid first, clues or answers second). A compact option retains 13pt clues and a grid up to 3.6 inches on one page. The selector remembers `lpc:print-layout` when storage is available, and paired puzzle/answer links carry `?layout=large` or `?layout=compact`; their canonical stays clean. Without JavaScript the 18pt layout remains printable using the browser menu. Print copies are `noindex,follow`; the sitemap includes the 2,000 playable pages and primary site pages.

Original editions use `lpc:v1:<puzzle-id>` for progress. Current editions use `lpc:v1:<puzzle-id>:edition:<revision>` and do not overwrite original answers. One hundred noindex `/crosswords/<id>/previous/` pages retain the original boards in the original twenty series; users with legacy answers see a continue link. Preference keys use `lpc:sound`, `lpc:large`, and `lpc:keyboard`. New first editions use revision 1. Seventy-nine replacements preserve their numbered predecessors at `/crosswords/<id>/editions/<revision>/` and retain the same current URL. Most use revision 2; the quilt is revision 3 with its numbered revision 2 and separate original layout intact. Their continuation links check the actual prior edition key. The original twenty refreshed series retain their original legacy archive routes. No credentials or environment variables are required by the application.

## Browser tests

`npm run test:e2e` uses system Chromium at `/usr/bin/chromium`, a production preview on port 4321, and Playwright. For another machine, change the executable path in `playwright.config.ts` or install Playwright's supported Chromium and omit the path. Tests cover full puzzle completion, hints/checks, saved state, settings, reset confirmation, mobile layout, static print content, accessibility scans, all 6,000 current puzzle, print, and answer routes, and collection filtering and history restoration. Automated accessibility scans do not establish full accessibility conformance.

For an exhaustive board check, start a production preview on port 4323 and run `npm run audit:playthrough -- http://127.0.0.1:4323 /tmp/lpc-playthrough-audit.json`. This types every answer through the real keyboard flow on all 2,000 current, 100 original and 82 numbered archived boards, compares rendered clues and physical placements, and checks completion and saved-progress restoration after reload. It accepts only a local preview URL and writes its report outside the repository by default. `LPC_CHROMIUM_PATH` can select a different installed Chromium. This verifies game operation, separately from reading the clues for accuracy.

## Deploy to Cloudflare Pages

1. Connect this repository to Cloudflare Pages.
2. Build command: `npm run build`. Output directory: `dist`. Use Node.js 24.
3. Add `largeprintcrosswords.com` and optionally `www.largeprintcrosswords.com` under Custom domains; follow Cloudflare's DNS instructions in the domain registrar.
4. Choose one primary hostname and redirect the other. Canonical URLs use `https://largeprintcrosswords.com`.
5. Verify HTTPS, mobile play, print output, privacy text, and the sitemap on the real domain before submitting it to Search Console.

The user has connected Cloudflare Pages to this GitHub repository and configured the custom domain. Pushing to `main` triggers the configured build and deployment; a successful push does not prove the Cloudflare build has completed. This coding environment has no Cloudflare account credentials, and live-site checks may require permitting the domain in its outbound network settings. No analytics or advertising are included.

Each cloud task is already isolated: use this checkout directly; do not create a Git worktree unless the user asks for one.

## Search metadata and sharing

Collection cards use edition-specific static SVG board previews with intrinsic dimensions and lazy loading. Every puzzle title, description and ordinary HTML link remains server-rendered, including when JavaScript is disabled. The build checks navigation reachability from home as well as sitemap membership; see [the November 13 SEO review](docs/seo-review-2026-11-13.md).

Every playable puzzle has its own title and description. WebSite/WebPage JSON-LD describes the site, and puzzle BreadcrumbList data matches the visible breadcrumb. The sitemap lists 2,029 canonical HTTPS URLs, including all 2,000 playable puzzles. Print copies and the 404 page use `noindex`.

`/llms.txt` provides a Markdown guide for AI reading tools with the site purpose, play and print instructions, topic collections, site information and the XML sitemap. Astro prerenders it as a static UTF-8 text file with puzzle and series counts from the current data. The production SEO audit verifies its links against the generated canonical pages.

`public/social-card.png` is a committed 1200 × 630 share image. It is served locally and referenced by Open Graph and Twitter Card metadata. To regenerate it, run `npm run social:generate` with a supported local Chromium installation; image generation is not part of the Cloudflare build.

See `docs/search-console.md` for the user's verified-property sitemap submission and launch checks. No Google account actions or indexing requests have been performed by this code.

## Content review

All 2,000 current puzzles have a subject introduction, solving guidance, and three explanations tied to actual answers. The original 100 layouts remain archived with their legacy progress keys. Their refreshed editions use separate keys. The current revision inventory is 1,819 first editions, 180 second editions and one third edition. The [everyday-vocabulary rewrite](docs/easy-rewrite-2026-11-14.md) and [context review](docs/context-review-2026-11-14.md) account for 79 archived boards. The [page quality review](docs/puzzle-page-quality-2026-11-19.md) accounts for the other three.

| Series | Current puzzles | Clues | Edition |
| --- | ---: | ---: | --- |
| Gardening | 5 | 58 | Refreshed, with original archive |
| Birds | 5 | 55 | Refreshed, with original archive |
| Music | 5 | 57 | Refreshed, with original archive |
| Market | 5 | 58 | Refreshed, with original archive |
| Travel | 5 | 57 | Refreshed, with original archive |
| Home | 5 | 57 | Refreshed, with original archive |
| Farm | 5 | 58 | Refreshed, with original archive |
| Baking | 5 | 56 | Refreshed, with original archive |
| Crafts | 5 | 58 | Refreshed; original and numbered archives retained |
| Flowers | 5 | 58 | Refreshed, with original archive |
| Pets | 5 | 56 | Refreshed, with original archive |
| Drinks | 5 | 55 | Refreshed, with original archive |
| Movies | 5 | 55 | Refreshed, with original archive |
| Seaside | 5 | 55 | Refreshed, with original archive |
| Autumn | 5 | 58 | Refreshed, with original archive |
| Holidays | 5 | 57 | Refreshed, with original archive |
| Reading | 5 | 57 | Refreshed, with original archive |
| Weather | 5 | 56 | Refreshed, with original archive |
| Workshop | 5 | 57 | Refreshed, with original archive |
| Games | 5 | 58 | Refreshed, with original archive |
| Baseball | 5 | 56 | First publication |
| Leisure Sports | 5 | 57 | First publication |
| Team Sports | 5 | 56 | First publication |
| Active Pastimes | 5 | 55 | First publication |
| American Music | 5 | 55 | First publication |
| Musical Instruments | 5 | 56 | Selected subjects refreshed; numbered archives retained |
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
| Collections | 5 | 55 | Selected subjects refreshed; numbered archives retained |
| Geography | 5 | 56 | Selected subjects refreshed; numbered archives retained |
| State Capitals | 5 | 52 | First publication |
| American History | 5 | 55 | First publication |
| Texas | 5 | 53 | First publication |
| Neighborhood Stops | 5 | 56 | First publication |
| Hands-on Hobbies | 5 | 54 | Selected subjects refreshed; numbered archives retained |
| American Landmarks | 5 | 55 | First publication |
| Classic American Stops | 5 | 57 | Selected subjects refreshed; numbered archives retained |
| Backyard Nature Studies | 5 | 56 | Selected subjects refreshed; numbered archives retained |
| Evening Sky | 5 | 56 | Selected subjects refreshed; numbered archives retained |
| Water and Wildlife | 5 | 53 | Selected subjects refreshed; numbered archives retained |
| Home Inventions | 5 | 55 | First publication |
| Local Outings | 5 | 56 | First publication |
| Garden Details | 5 | 54 | Selected subjects refreshed; numbered archives retained |
| Kitchen Word Science | 5 | 56 | Selected subjects refreshed; numbered archives retained |
| Clothes and Fabrics | 5 | 55 | Selected subjects refreshed; numbered archives retained |
| Weather and Light Tools | 5 | 54 | Selected subjects refreshed; numbered archives retained |
| Everyday Wordplay | 5 | 57 | First publication |
| Recreation Room | 5 | 56 | First publication |
| Simple Machines | 5 | 56 | Selected subjects refreshed; numbered archives retained |
| Rail and Water Travel | 5 | 54 | Selected subjects refreshed; numbered archives retained |
| Roadside Americana | 5 | 56 | First publication |
| Familiar Vehicles | 5 | 56 | Selected subjects refreshed; numbered archives retained |
| Working Waterfront | 5 | 58 | Selected subjects refreshed; numbered archives retained |
| Forest Observations | 5 | 56 | Selected subjects refreshed; numbered archives retained |
| Open Country Wildlife | 5 | 57 | Selected subjects refreshed; numbered archives retained |
| Small World Nature | 5 | 57 | Selected subjects refreshed; numbered archives retained |
| Garden Styles | 5 | 56 | First publication |
| Flowers Through the Year | 5 | 55 | Selected subjects refreshed; numbered archives retained |
| American Regional Tables | 5 | 56 | First publication |
| Bakers Specialties | 5 | 55 | First publication |
| Craft Room Techniques | 5 | 56 | Selected subjects refreshed; numbered archives retained |
| Paper and Lettering | 5 | 57 | Selected subjects refreshed; numbered archives retained |
| Old Time Entertainment | 5 | 56 | Selected subjects refreshed; numbered archives retained |
| Stage and Performance | 5 | 55 | First publication |
| Collections and Keepsakes | 5 | 56 | Selected subjects refreshed; numbered archives retained |
| Home Details | 5 | 54 | Selected subjects refreshed; numbered archives retained |
| Everyday Materials | 5 | 56 | Selected subjects refreshed; numbered archives retained |
| Word Patterns | 5 | 56 | First publication |
| Winter Holiday Crafts | 5 | 56 | First publication |
| Thanksgiving Side Dishes | 5 | 56 | First publication |
| Sharing Thanksgiving | 5 | 57 | First publication |
| Christmas Kitchen Traditions | 5 | 55 | Selected subjects refreshed; numbered archives retained |
| Christmas Post and Paper | 5 | 55 | First publication |
| Christmas Around the Room | 5 | 57 | Selected subjects refreshed; numbered archives retained |
| Winter Backyard Observations | 5 | 54 | First publication |
| Understanding Winter Weather | 5 | 54 | Selected subjects refreshed; numbered archives retained |
| Winter Pastimes | 5 | 55 | First publication |
| Country Voice Memories | 5 | 54 | Selected subjects refreshed; numbered archives retained |
| Classic American Voices | 5 | 56 | Selected subjects refreshed; numbered archives retained |
| Vocal Group Memories | 5 | 57 | Selected subjects refreshed; numbered archives retained |
| American Music City Stops | 5 | 53 | Selected subjects refreshed; numbered archives retained |
| Records and Listening | 5 | 59 | First publication |
| Keyboard Sounds and Mechanisms | 5 | 57 | Selected subjects refreshed; numbered archives retained |
| Strings and Picking | 5 | 58 | Selected subjects refreshed; numbered archives retained |
| Winds and Bellows | 5 | 58 | First publication |
| Music Patterns Made Clear | 5 | 58 | Selected subjects refreshed; numbered archives retained |
| Voices in Company | 5 | 56 | Selected subjects refreshed; numbered archives retained |
| American Style Memories | 5 | 54 | First publication |
| Music Behind the Scenes | 5 | 56 | Selected subjects refreshed; numbered archives retained |

The 500-game checkpoint had 5,590 clues, 5,590 distinct answer/clue pairs, 500 different introductions and 1500 answer explanations. Familiar answers recur in different contexts; answer-set overlap is reported separately. No numbered-edition titles remain. See [the content audit](docs/content-audit.md) and [the audience/research notes](docs/expansion-200-research.md).

At the 500-game checkpoint, eight curated topic pages covered Thanksgiving, Christmas, winter, sports, music, geography/state capitals, American history and Texas. That checkpoint grouped 16 Thanksgiving games, 27 Christmas, 20 winter, and 80 music. Each collection links to games and print sheets, with reciprocal links from its games. Geography groups five landscape/map subjects and five capital-city routes in one collection. The twenty geography/history/Texas puzzles are a limited interest/state pilot described in [the research and editorial notes](docs/place-history-pilot.md). The following 80-puzzle expansion adds neighborhood scenes, crafts, landmarks, nature, home inventions, outings, gardening, kitchen vocabulary, clothing, everyday science, wordplay and recreational games; see [the 300-puzzle expansion](docs/expansion-300.md). The preceding 100 puzzles cover transport, natural history, flowers, regional foods, crafts, performance, collectibles, home materials, wordplay and winter holidays; see [the 400-puzzle expansion](docs/expansion-400.md) and [November 14 research](docs/expansion-400-research.md). The 401–500 batch added Thanksgiving, music, Christmas and winter subjects selected using the supplied reports and a full-catalog comparison; see [the 500-puzzle expansion](docs/expansion-500.md) and [the theme decisions](docs/expansion-500-research.md). Each actual puzzle retains one canonical playable URL.

`npm run audit:content` checks identical complete clue sets, within-series repetition, self-answer clues, subject text and the archived/first-edition distinction. Counts and overlap are internal review signals, not Google thresholds. Run `npm run audit:content -- --write` to refresh reports; production builds audit without rewriting them.

Source subjects may declare `requiredAnswers` for defining words that must appear in the finished grid; layout selection and validation both enforce this. The series manifest supplies fixed seeds, source filenames, and archive filenames. An existing series keeps its seed, layout settings, and word order when a new series is added. This prevents previously published edited puzzles from changing silently. First-edition series omit `archive` and set `revision: 1`; their source subjects are appended by the generator. Legacy archive files in `src/data/archives/` are immutable snapshots; do not regenerate or overwrite them with current layouts. Build-time archive routing and validation use the same manifest. Archive pages are excluded from the sitemap and marked noindex. Use a new revision whenever changing an existing grid so saved letters cannot be applied to a different puzzle.

For a grid replacement, copy the complete published puzzle into `src/data/previous-editions.json` and set the replacement source subject's `revision` to the next number. Keep the series' base revision and seed unchanged. `previousEditionLinks` and the numbered archive route provide continuation using the exact older key. Validators require all numbered predecessors back to the base revision, and browser tests check both directions of save isolation. Current and retained SVG previews use edition-specific paths. Increasing a revision alone is not a complete migration.

Clue-only corrections preserve the existing answer placements, IDs and revision keys. The full-catalog review is recorded in [the November 13 review](docs/puzzle-review-2026-11-13.md). Original archive JSON remains immutable; `src/data/archive-clue-clarifications.json` can clarify an exact old answer/clue pair at render time. Affected archive pages show the earlier wording and the reason for the clarification without changing the saved board.

## Audience-first editorial work

The user prioritizes easy, large-print, printable, coherent themes over puzzle counts. See [the audience standard](docs/audience-content-standard.md), [the 500-row review ledger](docs/research/audience-review-2026-11-14.csv), and repository `AGENTS.md`. The initial November 14 triage flagged 27 games for specialist-vocabulary replacement/review and 66 for context review. The first pass simplified twenty-two clues without changing boards. The subsequent rewrite replaces all 27 flagged boards with everyday-vocabulary editions and preserves their earlier versions. The remaining 66 received recorded decisions: 52 boards replaced and 14 retained with 18 simpler clues. The current prompt screen still flags 10 theme/name-dependent games; their individual decisions and limits are documented in the [context review](docs/context-review-2026-11-14.md). Neither a recorded decision nor absence of a flag certifies difficulty for older readers.

Run `python3 scripts/review-audience.py --date YYYY-MM-DD` to refresh a dated review ledger using the curated criteria. This records editorial prompts; it does not edit puzzles, change indexing, or certify suitability. Familiarity must be judged in context and, when available, with real reader feedback. Do not use longer introductions, exact-pair uniqueness, or a low automated score as a substitute for reader value.
