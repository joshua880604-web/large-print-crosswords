# Expansion to 1,000 games — November 15, 2026

The collection adds **500 first-edition games in 100 five-game series**, for 1,000 current games and 11,204 clues. The new games contain 5,614 clues. All 500 earlier puzzle objects, their URLs and progress keys, the 100 original layouts, and the 79 numbered older editions are preserved.

## Editorial allocation

| Interest | New games |
| --- | ---: |
| Gardening and familiar flowers | 50 |
| Nature, animals, and outdoors | 40 |
| Food, cooking, and baking | 80 |
| Home, town, and everyday life | 100 |
| Hobbies and crafts | 50 |
| Nostalgia, familiar songs, and classic movies | 30 |
| Clearly optional basic Bible stories | 50 |
| Seasons and holidays | 100 |
| **Total** | **500** |

The seasonal allocation is spring 20, summer 15, autumn 15, winter 15, Christmas 15, Easter 10, Thanksgiving 5, and Halloween 5. These are editorial allocations rather than forecasts of search traffic.

Each scene starts with an explicit title, two defining answers, and a candidate vocabulary. Layout selection must retain both defining answers. Every new board has 10–12 clues and fits within 11 × 11. The source banks provide the exact selected clues and three explanations for answers actually in the board.

The [scene plans](../scripts/expansion-1000-scenes.txt), [individual descriptions](../scripts/expansion-1000-descriptions.txt), reviewed definitions, and explanatory notes precede generation. The compiler keeps each new series' own fixed seed. Existing source banks, seeds, and archives are not regenerated. New source files are ordinary editorial JSON, so the deployed site does not need Python or an authoring API.

Model-assisted review distinguishes meanings in context: bank/river bank, card/greeting card, needle/evergreen leaf, ring/bell sound, roll/bread roll, bed/garden bed, and the two Bible figures named Joseph. The glasses scene uses an ordinary arm rather than a temple term. Unhelpful fragments and technical choices such as CRISS, ALP, MITER, and SHANK were removed from the new scene pools. Flower names with less general familiarity have direct descriptions and selected first-letter hints. Ornamental sweet peas are explicitly distinguished from edible peas.

The new Bible collection is labeled optional in its introduction and on every game. Passage references identify the story context; clues do not ask readers to recall verse numbers. Household Easter customs have their own collection and link separately to Bible stories. Movie scenes identify their interest and give direct character hints rather than release-date or detailed cast quizzes.

The preservation audit compares each earlier complete object against its release hash, the original 100 manifest entries against their complete-object hash, and every earlier source/archive file against its byte hash. Answer-set comparisons cover each new game against all preceding games in the old and new collection. The largest measured answer-set Jaccard overlap is 0.4667; no pair crosses the 0.50 review signal. These comparisons supplement reading the scenes, not a certification of difficulty or reader value.

## Research actually available

This machine contains the user's handover and the repository's earlier research. It does **not** contain the original 40 report attachments, 13 new XLSX files, twelve screenshots, prior keyword-row exports, or preliminary authoring cache. No claim is made that those missing originals were independently parsed here. The handover's source-completeness statement and all twelve intent summaries are retained in [sources.json](research/expansion-1000/sources.json), [request disposition](research/expansion-1000/request-disposition.csv), and [intent notes](research/expansion-1000/search-intent.md).

No repeat queries or screenshots were requested. Missing metrics remain unknown, not zero; near-synonym keyword volumes are not added together. Search Console performance and target-reader feedback remain later observations, not invented evidence for these scenes.

## Practical group printing

`/print-pack/` lets a reader filter by title or theme and select up to ten games. Selections remain when filters change. Preparing a pack fetches the actual static print articles; a failed fetch clears the partial output. Changing selection, size, or answer options invalidates a prepared pack.

Puzzles come first and optional answer sheets follow. Every sheet starts on a fresh page. Default large type is 18pt on two US Letter pages per puzzle or answer sheet; compact is 13pt on one page per sheet. A full ten-game pack is therefore 20 pages without answers or 40 with answers in large type, and 10 or 20 pages in compact type. Browser headers/footers should be disabled, with portrait orientation and 100% scale.

The site still uses the browser's **Print / Save as PDF** dialog. Test PDFs are environment artifacts, not pre-generated production downloads. No account, timer, or sound requirement was introduced.

## Navigation and SEO

Thirteen actual-content collections add gardening, flowers, nature, food, everyday life, hobbies, nostalgia/classic movies, Bible stories, spring, summer, autumn, Easter, and Halloween. Together with the eight earlier collections there are 21 interest pages. Membership overlaps where readers have different useful entry points; no duplicate free/easy/PDF/seniors variants were created.

Games link back to their applicable collections, including secondary interests. All 1,000 current games remain discoverable through ordinary HTML links. The build produces 3,210 HTML pages and 1,029 canonical sitemap URLs: 1,000 games, 21 collections, and eight base pages. The 2,000 individual print/answer pages, 179 historical layouts, print-pack utility, and 404 are noindex and excluded from the sitemap. Filter parameters retain clean canonicals. The existing sitemap address, sharing image, and robots route remain in use; llms.txt includes the expanded library and collections.

## Verification

The environment uses Node 24.22.1, npm 11.9.0, system Chromium 156, and PyMuPDF 1.26.6 for PDF inspection.

- Production build, TypeScript, structural/content/SEO checks, release preservation audit, and whitespace check pass.
- The final complete Playwright regression passed all 406 tests, including existing gameplay, all numbered-edition save-isolation cases, collection filters/history, print controls, new collections, group printing, mobile layout, and automated accessibility checks.
- All 500 new games passed a 390px touch-layout sweep, including the active square remaining above the on-screen keyboard. Representative flower, Bible, and print-pack views were visually inspected.
- All 2,000 new puzzle/answer PDFs passed US Letter page counts, expected text, 18pt/13pt typography, paper boundaries, and clue/footer checks. Hyphenated words split at a line ending are rejoined only in extracted-text comparison; no printed letters or assertions were removed. Unchanged exports are reused only after comparing their entire rendered-data signature to the verified prior snapshot; changed sheets are re-exported.
- Four full ten-game packs passed physical page-count and text checks: large puzzles 20 pages, large with answers 40, compact puzzles 10, compact with answers 20. Representative large and compact pages were visually inspected.
- The final keyboard sweep passed all 500 new games: complete answers and saved progress restored after reload. It checks rendered clues and coordinates, uses real keyboard events, checks completion, compares every saved coordinate/letter pair, and reloads progress. Clue clicks must focus a square in their selected word. Explicitly returning to the word's first square uses `preventScroll` to avoid irrelevant smooth-scrolling overhead.

Current-instance artifacts and logs are under `/workspace/artifacts/expansion-1000/` and `/tmp/lpc-expansion-*.log`. They are not a claim of fresh-task snapshot restoration. Automated checks and model-assisted review do not establish professional editing, real-device behavior, physical-printer output, or target-reader difficulty. The earlier ten context/name prompts remain documented; preserving the published 500 does not silently certify them.

### Repeatable release checks

```sh
cd /workspace/large-print-crosswords
npm run build
npm run typecheck
npm run test:e2e
python3 scripts/audit-expansion-1000.py
npm run preview -- --port 4323
```

With that preview running in another terminal:

```sh
npm run audit:playthrough -- http://127.0.0.1:4323 /tmp/lpc-new-playthrough.json --new-only
node scripts/audit-expansion-mobile.mjs http://127.0.0.1:4323 /tmp/lpc-mobile
node scripts/audit-expansion-print.mjs http://127.0.0.1:4323 /tmp/lpc-print
python3 scripts/audit-expansion-pdf.py /tmp/lpc-print
```

PyMuPDF is required only for the optional PDF inspection command. The normal application build and deployment use the existing npm dependencies and lockfile.

### Deployment evidence

The exact release SHA and its Cloudflare result are recorded in the final task report and `/workspace/artifacts/expansion-1000/deployment.json` after the authorized main push. The current environment's outbound policy blocks direct requests to the formal domain and GitHub API with proxy CONNECT 403. Required domain additions are saved in the environment draft. GitHub's normal public commit-check page remains accessible and can independently report the Cloudflare Pages result for the exact pushed SHA; it does not substitute for a direct custom-domain HTTP check.
