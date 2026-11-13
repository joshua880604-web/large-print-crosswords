# Full puzzle review — 2026-11-13

## Scope and method

Read all 220 current puzzles, including all 2,467 clues, the introductions, subject focus, solving tips, and all 660 answer explanations. Also read all 433 distinct answer/clue pairs in the 100 preserved original layouts. The review considered spelling, singular/plural and part of speech, definition accuracy, reasonable alternate answers, factual distinctions, correspondence with the actually selected words, and repeated content. Familiar answers can recur and crossings may resolve legitimate synonyms; the review does not require every clue to have only one possible answer in isolation.

This was a model-assisted editorial reading, not independent professional editing, live verification of every reference source, or testing with US older readers. Automated board completion verifies the supplied answer mapping and interaction, not whether a definition is factually correct. Those are separate checks.

## Corrections

Changed 45 text fields in 31 current puzzles: twenty clues, seven answer explanations, six solving tips, four focus paragraphs, one title, three introductions, three card descriptions and one card subject label. These are definition corrections, clarity improvements and alignment fixes, not 45 broken grids.

Examples include the butterfly's egg/larval life cycle, atmospheric pressure versus force, baseball hit versus safe arrival on an error or fielder's choice, a valid untouched tennis ace versus an untouched fault, a punt versus a bounced drop kick, the distinction between acoustic operation and vibration common to all instruments, and twilight's relationship to sunrise/sunset. Paired BILL/BEAK and PEEL/RIND clues were made more distinct. Several tips or explanations had referred to a source-pool answer or example that was absent from the actual selected grid; these now describe the words readers really see.

The capital-city group previously labeled South Central also includes Denver and Cheyenne. It is now called “Capital Stops from the Gulf to the Rockies,” with matching introduction and card wording, and remains explicitly a puzzle grouping rather than an official regional classification.

| Puzzle ID | Corrected fields |
| --- | --- |
| `a-good-book` | clue (BORROW) |
| `by-the-sea-2` | clue (EBB) |
| `cozy-at-home-2` | note (LADLE) |
| `backyard-birds-3` | solvingTip |
| `garden-days-4` | clue (BUTTERFLY) |
| `garden-days-5` | solvingTip |
| `backyard-birds-5` | solvingTip |
| `music-memories-5` | solvingTip |
| `by-the-sea-5` | clue (BILL), clue (BEAK) |
| `weather-watching-5` | clue (PRESSURE) |
| `ballpark-baseball-3` | clue (STRIKE), clue (HIT) |
| `ballpark-baseball-4` | clue (HIT), note (INNING) |
| `leisure-sports-5` | clue (ACE), note (DEUCE) |
| `leisure-sports-4` | clue (GATE) |
| `team-sports-2` | clue (PUNT) |
| `team-sports-4` | clue (CORNER) |
| `active-pastimes-3` | clue (GEAR) |
| `american-music-4` | clue (ACOUSTIC), note (ACOUSTIC) |
| `dance-and-song-3` | clue (ALTO) |
| `halloween-evening-4` | clue (TWILIGHT), note (TWILIGHT) |
| `summer-afternoons-5` | clue (LIFEJACKET) |
| `calendar-celebrations` | note (MIDNIGHT) |
| `calendar-celebrations-3` | clue (SHAMROCK), note (SHAMROCK) |
| `handmade-arts-2` | focus |
| `fruit-and-flavor` | clue (PEEL) |
| `geography-journeys-3` | focus |
| `state-capital-stops-4` | title, description, cardDescription, focus, subtheme |
| `state-capital-stops-5` | focus |
| `texas-scenes` | description, cardDescription, solvingTip |
| `texas-scenes-3` | solvingTip |
| `texas-scenes-5` | description, cardDescription |

Full before/after wording, reasons and a 220-row checklist are in the session artifact `/workspace/artifacts/full-review/review-results.xlsx`; CSV wording changes and the review ledger are retained beside it. Git records the exact source and generated JSON changes. The source pools were updated as well, so regeneration does not silently restore the older wording.

## Archives and saved progress

Two exact old clue pairs receive a clearly marked rendering clarification on five archive pages:

- ROOT: “The part of a flower that takes up water from soil” becomes “Plant part that takes up water from soil” on `flower-favorites-2` and `flower-favorites-4`.
- YAM: “A sweet root vegetable” becomes “Starchy edible tuber, distinct from a sweet potato” on `holiday-table-2`, `holiday-table-3` and `holiday-table-4`. True yams are tubers; US retail usage can also apply yam to a sweet potato, which is a different plant.

`src/data/archive-clue-clarifications.json` matches both the answer and original clue, so it cannot blindly replace other clues using the same answer. The original archived JSON snapshots remain unchanged. Affected pages show the earlier and clarified wording in an expandable explanation. There is no answer-key or board revision.

Compared every current ID, revision, dimension, answer, number, direction and coordinate with commit `401afb2`. All remain unchanged. The 189 current puzzles outside the correction set remain object-identical. Existing local-storage keys retain their meaning. Full generation reproduced the revised current JSON byte-for-byte with SHA-256 `ac041f2460794579de34b45a59c2c7c387e9b6ffcdd077074867171d8e6bf528`.

## Verification records

The production structural/content checks and SEO audit pass: 220 current puzzles, 100 preserved layouts, 2,467 distinct answer/clue pairs, 220 distinct introductions, 774 HTML pages, 440 noindex print copies and 233 canonical sitemap URLs. No repeated exact clue pair or introduction was found; repeated answer sets remain separately reported in the content audit.

All 55 Playwright tests pass, including new archive clarification/save-restoration regressions. A separate `npm run audit:playthrough` sweep completed all 220 current and 100 archived boards using actual keyboard entry, compared rendered clues and physical placements, and restored every completed board after reload. All 320 passed, with no failures. Display-order sorting is normalized before comparing physical placements.

All 440 puzzle and answer PDFs were exported again, checked with PDF text extraction and measured: one US Letter page each, every expected title/clue/answer present, and no grid/clue/footer overlap. Printed clue size remains the existing 13 pt (17.3333 CSS px). This validates completeness and pagination; it does not certify an 18 pt large-print edition or physical printer legibility, and no font-size change was made in this content review.

All 320 current/archive game pages fit a 390 px viewport without page-wide overflow. The two newly clarified archive view types pass automated WCAG 2 A/AA and 2.1 AA axe scans with their explanations open; this is not a full accessibility-conformance claim. Visually inspected a clarified archive and the renamed capital-route page on mobile.

Live Cloudflare completion, real-device native keyboards, physical printing, Google indexing, and target-reader difficulty have not been established by these local checks. No age-specific preference or medical benefit is inferred from the review.
