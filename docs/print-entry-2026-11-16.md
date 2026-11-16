# Easier print entry and complete seasonal packs — November 16, 2026

Printing from the directory previously sent readers through a game page. The
print directory now opens each puzzle's print sheet directly; separate answer
and online-play links are beside the card. Links remain separate HTML elements,
with no nested anchors. Other collections still open the game. All 1,200 games,
their boards, permanent URLs, editions and browser-progress keys are unchanged.

The directory now places search and selection before the 21-link interest
navigation. Copy and spacing are shorter; font sizes were not reduced. In the
same 390 × 844 Chromium viewport, search moved from 1,130px to 661px and the
first card from 1,355px to 886px. At 1,280 × 900, the first card moved from 806px
to 581px. These are local layout measurements, not field performance or ranking
improvement claims.

Christmas, Thanksgiving and winter pages now link to their complete collections
in the existing print-pack tool. The new Holiday or season filter reuses the
same membership definitions as the topic pages. It includes 47 Christmas,
26 Thanksgiving and 40 winter games, rather than the 20, 10 and 20 games found
under their single Theme labels. Theme and title filtering still work within a
selected collection, selections survive filter changes, and the ten-game limit
still applies. Invalid collection parameters fall back to all collections.
The shown-results message explains empty filters. The utility remains noindex
with its clean canonical and stays out of the sitemap.

The default remains 18pt on two US Letter pages, with a compact 13pt one-page
alternative. Pack answers follow the puzzle sheets. Browser Print / Save as PDF
remains the export method; no pre-generated PDF library was added.

## Evidence and validation

- Build, TypeScript, content/board checks, SEO and whitespace checks pass.
  Output remains 3,810 HTML pages and 1,229 canonical sitemap URLs. All indexable
  pages remain within two ordinary HTML-link clicks of home.
- All 112 relevant Playwright checks pass, including direct print and answer
  links, no-script printing, complete seasonal membership, retained cross-theme
  selections, invalid parameters, ten-game limits, failed-sheet handling, filter
  history, accessibility, mobile gameplay, saved progress, and all current
  game/print/answer routes. The no-script catalog audit checks all 1,200 direct
  print links, 1,200 answer links and 1,200 separate online-play links.
- Four ten-game Christmas packs containing cross-theme games were rendered by
  Chromium and inspected with PyMuPDF. Large puzzles: 20 pages; large with
  answers: 40; compact puzzles: 10; compact with answers: 20. All 90 pages pass
  US Letter dimensions, expected text, 18pt/13pt typography and paper boundaries.
- Mobile and desktop directory screenshots were reviewed; neither had horizontal
  overflow. The mobile search is now visible in the initial viewport.
- The expansion preservation audit passes, and a Git diff confirms the puzzle
  catalog, manifest, archive JSON and game/save implementation are untouched.

Checks:

```sh
npm run build
npm run typecheck
python3 scripts/audit-expansion-1200.py
npx playwright test tests/print-entry.spec.ts tests/print-pack.spec.ts tests/seo.spec.ts tests/collection.spec.ts tests/print-layout.spec.ts tests/topics.spec.ts tests/expansion-topics.spec.ts tests/site.spec.ts
git diff --check
```

Current-instance screenshots, measurements, export/validation helpers and PDFs
are under `/workspace/artifacts/print-entry-improvement-2026-11-16/`; logs use
`/tmp/lpc-print-entry-*.log`. These are browser and PDF checks, not a real-printer
test or a study with older readers.

## Competitor comparison status

These changes address the site's own measured paths. Requests to QETS, My
Printable Puzzles and Puzzles to Print still receive proxy CONNECT 403, before
any competitor HTML is obtained. No competitor layout, print quality or actual
download path is claimed to have been inspected. The required domains are saved
in the environment draft; applying/publishing that environment configuration is
separate from publishing the website. No additional Semrush query was made.
