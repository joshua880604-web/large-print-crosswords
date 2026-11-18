# November 18 expansion to 1,500 crosswords

This release adds 300 first editions in 60 five-puzzle series. It started from the published `main` tip `df93f2122cf74674b9e0d1a56dcdd7397ab16c8d` with 1,200 current puzzles and a clean working tree. The catalog and series registry retain the earlier entries verbatim. The 100 original boards, 79 numbered editions, and existing clue clarification files match the [baseline checksums](research/expansion-1500/preservation-baseline.json).

## Research and editorial work

The [previous research handoff](research/expansion-1200/research-and-editorial-review.md) records the earlier 13 reports and twelve search samples. The [source inventory](research/expansion-1000/sources.json), [search summaries](research/expansion-1000/search-intent.md), [audience standard](audience-content-standard.md), and [audience review ledger](research/audience-review-2026-11-14.csv) guided the scenes. Those records distinguish free online play and real large-print output from books, classroom exercises, and interest-specific results. No fresh queries were run.

The original earlier spreadsheets and screenshots were unavailable. The current attachment service also failed to resolve the three named XLSX uploads for qets.com, myprintablepuzzles.com and puzzles-to-print.com. The filenames identify Semrush PagesV3 US exports with November 16 as the report date and November 18 timestamps. The format, dates inside the files, duplicate rows, adult large-print pages, and traffic figures remain unverified. None of those figures was used.

The [scene list](../scripts/expansion-1500-scenes.txt) records the setting and the answer pool for every addition. The first three words in each pool must appear in the generated board. [Additional definitions](../scripts/expansion-1500-clues.txt) and [scene-specific clues](../scripts/expansion-1500-context-clues.txt) supplement the existing clue bank. Context clues distinguish a duck's bill from an invoice, the table's removable leaf from a plant part, and the name Saul in Acts from King Saul. The optional Bible games identify their source passages.

Candidate titles and answer pools were compared with the earlier catalog and one another. Close candidates were read together. A repeat of the guest-towel scene became a basket of slippers, the repeat of the apron recipe pocket became an identifying cloth tie on a shared dish, and a second record-needle scene became an exercise in left and right headphone channels. The [selected answer-set report](research/expansion-1500/nearest-answer-sets.json) records the nearest earlier current, historical, or newly added board for every addition. Board geometry and letter placement are checked separately. These are model-assisted editorial and software checks. No sessions with older readers or physical-printer checks were conducted.

## Reproducing the release checks

Run from the repository root. The preview serves the local build and the PDF check uses Chromium and PyMuPDF.

```sh
python3 scripts/generate-expansion-1500.py --check
npm test
npm run build
npm run typecheck
npm run test:e2e
```

Start the preview with `npm run preview -- --port 4323` before running the release-specific browser checks in a separate terminal.

```sh
npm run audit:playthrough -- http://127.0.0.1:4323 /tmp/lpc-1500-playthrough.json --new-only --release=1500
node scripts/audit-expansion-mobile.mjs http://127.0.0.1:4323 /tmp/lpc-1500-mobile --release=1500
node scripts/audit-expansion-print.mjs http://127.0.0.1:4323 /tmp/lpc-1500-print --release=1500
python3 scripts/audit-expansion-pdf.py /tmp/lpc-1500-print 1200
```

## Validation results

- Reproduction and preservation passed. The 300 additions contribute 3,079 clues, for 16,563 clues total. The highest compared answer-set overlap was 0.40 by Jaccard similarity. All earlier object order, IDs, revisions, boards, and clue data were preserved.
- Board validation, content audit, TypeScript and the production build passed. The build produced 4,710 HTML files, 1,529 canonical sitemap entries and 3,000 noindex print and answer pages. All 300 new games linked both ways with their topics and had corresponding print and answer sheets.
- All 300 additions fit a 390px touch viewport. The active cell stayed above the on-screen keyboard.
- All 1,200 Chromium PDF exports passed. The 1,800 US Letter pages used the expected pagination and 18pt or 13pt clue and answer sizes. The browser check matched every grid cell, number, clue and answer with puzzle data. PDF checks covered all clue and answer text, physical page bounds and footer overlap.
- All 300 new games completed through real keyboard input, saved the exact coordinate-to-letter map, and restored every letter and the completed state after reload.
- The full Playwright run passed 536 of 540 tests. All four remaining tests passed in a single-worker rerun after updating the Christmas pack count and addressing three timeouts. Chromium eagerly requests lazy previews with scripts disabled. The no-script tests retain the full catalog and link assertions and verify a real preview separately. The printable accessibility scan retains its original assertions with more time for the larger directory.
