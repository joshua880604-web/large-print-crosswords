# Adding 200 independent games — November 16, 2026

This release adds 200 first editions in 40 five-game series to the existing
1,000-game collection. Earlier current objects, original archives, numbered
editions, permanent addresses and browser-progress associations are preserved.

The result is 1,200 games and 13,484 clues, including 2,280 new clues.

| Interest | New games |
| --- | ---: |
| Gardening and flowers | 25 |
| Nature and pets | 15 |
| Food and kitchen tasks | 30 |
| Everyday life and ordinary routines | 40 |
| Crafts and hobbies | 20 |
| Familiar songs and singing | 10 |
| Nostalgia | 15 |
| Spring, summer, autumn and winter | 20 |
| Thanksgiving, Christmas and household Easter | 15 |
| Optional Bible stories | 10 |
| **Total** | **200** |

The authoring plan starts with a distinct scene and three defining answers.
All three must remain in the selected board, with three scene-specific answer
notes. Each new board has 10–12 clues and fits within 11 × 11. Earlier source
banks, series seeds and archives are not regenerated. New content is English
for US adults who prefer direct clues, larger letters, and printable sheets.
Optional Bible-interest scenes carry passage references and are labeled as such.
Ordinary daily-routine scenes make no medical or cognitive-benefit claims.

See the [research reuse and editorial review](research/expansion-1200/research-and-editorial-review.md),
[complete scene plan](../scripts/expansion-1200-scenes.txt), and
[preservation/nearest-neighbor report](research/expansion-1200/preservation-and-overlap.json).
The original research attachments are not in this snapshot; retained handover
summaries were reused without collecting new reports or searches.

## Reading, printing and discovery

New games use the existing playable, print, and separate-answer route generators.
The default print format is 18pt on two US Letter pages; compact is 13pt on one.
The print-pack tool includes the new games automatically. These remain browser
Print / Save as PDF pages, not a library of pre-generated PDF downloads.

Existing interest collections include the new games through their actual themes.
Each game links back to its collection and related games. The Bible collection's
displayed total is now derived from the data. No near-duplicate SEO landing pages
were added. The shared templates provide unique titles and descriptions, clean
canonical URLs, WebSite/WebPage/BreadcrumbList data, and sitemap membership.
Print, answer, utility, and historical copies retain noindex and stay outside
the canonical sitemap.

## Reproducing this release

Subsequent wording-only corrections are recorded in the
[current clue ledger](research/current-clue-corrections-2026-11-16.json).
The original release baseline remains unchanged; the audit and generator
permit only those exact clue substitutions while preserving all board fields.

Use the existing checkout. To rebuild only this release's authoring outputs:

```sh
python3 scripts/prepare-expansion-1200.py
python3 scripts/generate-expansion-1200.py
python3 scripts/audit-expansion-1200.py
npm run build
npm run typecheck
npm run test:e2e
```

Do not use a whole-catalog generator to refresh just the 200 new games. The
release compiler retains the first 1,000 objects verbatim. Generation uses four
processes on this five-CPU machine and caches results by complete source,
configuration, and generator digests. No partial catalog is written if a series
fails. Caches and PDF exports are environment artifacts outside the checkout.

Run a current production preview on port 4323, then:

```sh
node scripts/audit-playthrough.mjs http://127.0.0.1:4323 /tmp/lpc-1200-playthrough.json --new-only --release=1200
node scripts/audit-expansion-mobile.mjs http://127.0.0.1:4323 /tmp/lpc-1200-mobile --release=1200
node scripts/audit-expansion-print.mjs http://127.0.0.1:4323 /tmp/lpc-1200-print --release=1200
python3 scripts/audit-expansion-pdf.py /tmp/lpc-1200-print 800
```

The release selector asserts an explicit 200-game membership. The earlier
`--release=1000` remains a fixed 500-game target instead of silently expanding
its scope. Omitting `--new-only` from the playthrough checks all current and
historical boards. PyMuPDF is required only for PDF inspection, not deployment.

Current-instance evidence is kept under `/workspace/artifacts/expansion-1200/`;
logs use `/tmp/lpc-1200-*.log`. Automated checks do not establish independent
editing, target-reader difficulty, a real printer result, or search performance.

## Verified results

- Exactly 200 new first editions and 2,280 new clues; 1,200 games and 13,484
  clues overall. All 1,000 earlier objects, 200 earlier series settings and 226
  retained file hashes pass preservation checks. The only earlier metadata edit
  makes the Bible collection count data-driven; archives and source banks stay
  unchanged. The preceding release's preservation audit also passes.
- Every new board is unique and connected, has matching crossings and complete
  numbering, and retains all three defining answers. The maximum selected-answer
  Jaccard comparison with any preceding game is 0.4375. Each side retains at
  least three different answers. This supplements scene review rather than
  certifying reader difficulty.
- Production build, TypeScript, content audit, SEO audit and whitespace checks
  pass. Output: 3,810 HTML pages, 1,229 canonical sitemap URLs and 2,400 noindex
  individual print/answer pages. All indexable pages are reachable within two
  ordinary HTML-link clicks of home. Existing historical routes remain noindex.
- The final full browser run passed 453 of 454 tests. The remaining complete
  no-script catalog audit exceeded its old 30-second total budget; all assertions
  were retained and the per-test budget was raised to 90 seconds. Its traced
  single-worker rerun passed in 26.6 seconds, checking both 1,200-card documents,
  all links and preview markup, actual SVG geometry and image loading. All 454
  regression checks therefore pass across the full run and focused rerun. The
  other test edits update explicit collection totals for actual new membership.
- All 200 final new boards were solved through real keyboard input. Every saved
  coordinate/letter map matched, and all completed boards restored after reload.
  Earlier edition/save-key behavior also passes the regression cases.
- All 200 new games fit a 390px touch viewport with the active cell above the
  on-screen keyboard. Representative flower and Bible screens were inspected.
- All 800 new PDF exports pass: puzzle and answer sheets in both layouts, 1,200
  physical PDF pages overall, US Letter size, expected 18pt/13pt typography,
  complete clue/answer text, paper bounds and no clue/footer overlap. Large
  garden pages and a compact Bible page were visually inspected. Existing
  print-pack tests also pass; no print behavior was changed.
- Repeating the release compiler and generator reproduced the catalog, manifest
  and all 40 new source banks byte-for-byte (42 output files).

The GitHub push triggers the repository's existing Cloudflare Pages deployment.
The exact SHA and deployment result are recorded in the final task report and
`/workspace/artifacts/expansion-1200/deployment.json`. Direct custom-domain HTTP
requests from this machine currently receive proxy CONNECT 403. Required domain
additions were saved in the environment draft; that save does not apply runtime
network changes or publish the environment. Deployment status is checked on the
exact public GitHub commit-check page, separately from a direct live-domain test.
