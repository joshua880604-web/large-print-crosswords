# Board validation for the 2,000-game expansion

The published baseline has 1,500 games and 300 five-puzzle series. The initial expansion added 500 first editions and 5,305 clues across 100 series. The resulting 2,000 games include 105 optional Bible stories. These are the results for the initial expansion. The [page quality review](../../puzzle-page-quality-2026-11-19.md) documents three subsequent scene replacements and their preserved first editions in the local draft.

## Editorial basis

The [Semrush review](semrush-review.md) supports making free adult puzzles easy to print with separate answers. Topic decisions also use the existing audience standard and [initial scene comparison](scene-screen.md). Claims about adult readers' preferred subjects or puzzle difficulty require separate evidence.

Clues are written for the words in each scene, with three required answers. The layouts remain within 11 × 11. Comparisons led to further changes after generation. A pet carrier, a smaller grocery cart, a bowl of chowder, and another version of the same traditional song were replaced by a pet gate, weighing bananas at the checkout, creamed corn, and a different traditional song. The five optional Bible puzzles name their books and chapters in the introductions.

The [baseline](preservation-baseline.json) pins all 1,500 earlier puzzles, the registry, archived boards and archived clue clarifications. The [answer comparisons](nearest-answer-sets.json) cover all new boards against the 1,500 published puzzles, 179 archived boards and preceding additions. The largest measured Jaccard overlap across the 500 additions is 0.353. Scene similarity is also checked separately because a different answer set can still describe the same event.

## First batch validation

`python3 scripts/generate-expansion-2000.py --check`, `npm test`, `npm run build`, and `npm run typecheck` passed. The build produced 4,845 HTML pages, 1,574 canonical sitemap URLs and 3,090 noindex puzzle and answer sheets. All indexable pages have an ordinary HTML link path of at most two clicks from home. The build audits reciprocal topic and same-series links for every game.

The generated `llms.txt` lists 1,545 games and 309 series. The sitemap includes all 45 new playable URLs and excludes print copies.

All 45 games were completed with keyboard input and their entries restored after reload. All 45 fit the 390px test viewport with the active square above the touch keyboard. All 180 Chromium PDFs passed the US Letter pagination, 18pt and 13pt text, boundary and footer checks. The export included separate puzzle and answer sheets for every layout. Review with US older adults and printing on physical printers remain unverified.

The Playwright suite ran 551 tests. Two tests hit transient 404s while the preview build directory was being regenerated. The other 549 passed in that run. Both affected tests and three first-batch series checks passed when rerun against the finished build.

Run against a current local production preview on port 4323 to exercise this batch.

```sh
npm run audit:playthrough -- http://127.0.0.1:4323 /tmp/lpc-1545-playthrough.json --new-only --release=1545
node scripts/audit-expansion-mobile.mjs http://127.0.0.1:4323 /tmp/lpc-1545-mobile --release=1545
node scripts/audit-expansion-print.mjs http://127.0.0.1:4323 /tmp/lpc-1545-print --release=1545
python3 scripts/audit-expansion-pdf.py /tmp/lpc-1545-print 180
```

## Second batch validation

The second batch adds 25 boards and 268 clues across five series. Seventeen of the initial scenes became boards. A winter-market cup sleeve matched an earlier scene and was removed. Eight additional reviewed subjects completed the series. Each new board has three answers required by its scene and three individually written notes. The [scene screen](scene-screen.md) records the subject comparisons. The highest answer-set overlap for this batch is 0.263. All 1,545 prior board records and all 309 prior series records were compared byte for byte with the previous checkout.

Generation, board validation, type checking and the production build passed. The build contains 4,920 HTML pages and 1,599 sitemap URLs, with 3,140 printable clue and answer pages marked noindex. All indexable pages are reachable by ordinary HTML links within two clicks from the home page. The generated `llms.txt` lists 1,570 playable puzzles across 314 series.

All 25 new games were solved using browser keyboard input and restored after reload. All 25 passed touch keyboard and viewport checks at 390 × 844 and 360 × 640. All 100 PDF exports passed, including 150 US Letter pages with correct 18pt or 13pt text, complete clues and answers, and no content outside the paper boundary. A mobile print-pack check selected one puzzle from each series, restored all five selections after reload, and generated a 10-page compact pack with the five answer sheets following the puzzle sheets.

A browser regression exposed a race between the first search input and the restored URL filters. Collection search and theme controls now become available once their handlers and initial filters are ready. The slow-load regression holds back JavaScript, checks that the controls wait, then searches for a new puzzle and verifies that the query persists in the URL.

The complete suite ran 558 tests after the filter change. Of those, 557 passed immediately. The added regression test originally expected one unfiltered result for “golf,” which actually returns two. The corrected test uses the new squirrel puzzle as its unique result. The slow-load test and the original catalog filter test each passed three consecutive reruns. They also passed in the final build alongside the updated typewriter answer-note test and the no-JavaScript crawl check.

```sh
npm run audit:playthrough -- http://127.0.0.1:4323 /tmp/lpc-1570-playthrough.json --new-only --release=1570
node scripts/audit-expansion-mobile.mjs http://127.0.0.1:4323 /tmp/lpc-1570-mobile --release=1570
node scripts/audit-expansion-print.mjs http://127.0.0.1:4323 /tmp/lpc-1570-print --release=1570
python3 scripts/audit-expansion-pdf.py /tmp/lpc-1570-print 100
```

## Third batch validation

This batch adds 40 first editions and 428 clues in eight series. The [scene screen](scene-screen.md) records why near-duplicate triangle, garden-line, transit-transfer, film-slide and rehearsal-sheet ideas were skipped. All 40 selected boards use at least three scene-specific answers and have individually written answer notes. The highest measured answer-set overlap for the batch is 0.235. Earlier puzzles, series and archived data matched the starting draft and published preservation baseline.

Generation, content validation, type checking and the production build passed. The build contains 5,040 HTML pages and 1,639 canonical sitemap URLs. All 1,610 playable games are listed in the sitemap, and all 3,220 individual print and answer versions remain noindex. The generated `llms.txt` lists 1,610 playable puzzles across 322 series.

One puzzle from each new series was found using the print-pack search, selected and restored after reload. The actual compact PDF had eight puzzle pages followed by their eight matching answer pages on US Letter.

All 40 puzzles were completed through the browser keyboard and restored after reload. All 40 fit the 390 × 844 and 360 × 640 mobile viewports. The narrower viewport check also used the touch keyboard and restored its input on every puzzle. All 160 puzzle and answer exports passed. The 240 US Letter pages retained the right font sizes, full clue and answer text, and page boundaries. Physical printer tests and review by older US readers remain unverified.

All 568 Playwright regression tests passed against the completed preview build, including collection filters, keyboard play, saved editions, print packs, and no-JavaScript crawlability.

```sh
npm run audit:playthrough -- http://127.0.0.1:4323 /tmp/lpc-1610-playthrough.json --new-only --release=1610
node scripts/audit-expansion-mobile.mjs http://127.0.0.1:4323 /tmp/lpc-1610-mobile --release=1610
node scripts/audit-expansion-print.mjs http://127.0.0.1:4323 /tmp/lpc-1610-print --release=1610
python3 scripts/audit-expansion-pdf.py /tmp/lpc-1610-print 160
```

## Fourth batch validation

This batch adds 45 first editions and 476 clues in nine series. All 45 use three required scene answers and have individually written answer notes. The highest measured answer-set overlap for the batch is 0.278. The 1,610 prior boards and 322 prior series matched the starting draft byte for byte. The preservation check also covered the 179 archived boards.

Generation, content validation, type checking and production build passed. The build contains 5,175 HTML pages and 1,684 canonical sitemap URLs. All playable games are sitemap entries with an HTML link path no longer than two clicks from home. The 3,310 individual print and answer pages retain their noindex directives. The local `llms.txt` lists 1,655 games across 331 series.

All 45 games were completed through keyboard input, restored after reload, and checked at a 390 × 844 phone viewport. A mixed print pack selected and restored one title per new series. Its compact US Letter PDF contained nine puzzle pages followed by the nine matching answer pages.

All 45 games also passed the 360 × 640 check, including touch entry and restoration after reload. All 180 individual PDFs passed the US Letter, 18pt and 13pt text, page boundary and answer checks. The exports contain 270 pages in total. Physical printers and older US reader sessions remain unverified.

All 579 Playwright regression tests passed, covering the catalog, game routes, saved editions, seasonal collections, print settings and print packs.

```sh
npm run audit:playthrough -- http://127.0.0.1:4323 /tmp/lpc-1655-playthrough.json --new-only --release=1655
node scripts/audit-expansion-mobile.mjs http://127.0.0.1:4323 /tmp/lpc-1655-mobile --release=1655
node scripts/audit-expansion-print.mjs http://127.0.0.1:4323 /tmp/lpc-1655-print --release=1655
python3 scripts/audit-expansion-pdf.py /tmp/lpc-1655-print 180
```

## Completion batch

The last 345 boards add 3,646 clues in 69 series. Every board has a separate scene, three required words with contextual clues, and a supporting answer set. The scene file reuses established definitions for supporting everyday words. The shared clue file supplies vocabulary absent from the earlier collection and keeps alternate definitions of common words in the appropriate sense. The highest measured answer-set overlap for the final batch is 0.353. The [scene review](scene-screen.md) records examples of near-duplicate topics that were replaced.

The 1,655 preexisting puzzle records and 331 series records matched the starting draft byte for byte within the original array contents. This preserves IDs, positions, revisions, URLs, and saved-progress keys. The generator also checked the earlier published baseline and all 179 archived boards.

Generation, content validation, type checking and production build passed. The build contains 6,210 HTML pages and 2,029 canonical sitemap URLs. All 2,000 games have a path within two clicks from home using ordinary HTML links. The 4,000 print and answer pages retain their noindex directives. The local `llms.txt` lists 2,000 games across 400 series.

A print pack spanning ten new series retained all ten selections, search text and print size after reload. Chromium generated 20 compact and 40 large-print US Letter pages, with ten puzzles followed by their matching answer sheets in each layout.

All 1,380 individual puzzle and answer PDFs passed. The 2,070 US Letter pages were checked for clue and answer text, 18pt and 13pt font sizes, clipping, footer overlap and expected pagination. The print route checks also compared blank and filled grids against the source boards.

All 345 new games passed real key-by-key completion and restored every letter after reload. All 345 also passed the 390 × 844 mobile check, including touch input, keeping the selected square above the on-screen keyboard and restoring the entered letter after reload.

The final catalog IDs match the five batch reports. Every one of the 500 additions passed keyboard completion, reload restoration and the mobile check. The print reports cover 2,000 verified PDFs across the two sizes and separate puzzle and answer sheets.

The first full Playwright run passed 660 of 661 cases. The search for “on the road” includes the five new rest-stop games. The corrected assertion expects eleven results and verifies a new rest-stop URL alongside the original matches. All 661 cases passed together in the final run against the completed build.

Physical printing and sessions with older US readers remain unverified. The completed 2,000-game collection is in the local draft.

```sh
npm run audit:playthrough -- http://127.0.0.1:4323 /tmp/lpc-2000-playthrough.json --new-only --release=2000
node scripts/audit-expansion-mobile.mjs http://127.0.0.1:4323 /tmp/lpc-2000-mobile --release=2000
node scripts/audit-expansion-print.mjs http://127.0.0.1:4323 /tmp/lpc-2000-print --release=2000
python3 scripts/audit-expansion-pdf.py /tmp/lpc-2000-print 1380
```
