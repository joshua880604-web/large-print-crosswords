# Print-pack drafts, consistent search and butterfly clue wording

The print-pack chooser previously lost selected games and print options on a
reload. Switching a holiday changed the visible choices but left an older
collection in the address, and hidden selections were represented only by a
count. The chooser now saves a versioned draft in this browser, updates the
filter URL, and shows every selected title with an individual Remove button.

The draft includes at most ten valid, distinct puzzle IDs, the print size,
answer-sheet choice and filters. An explicit topic/search link supplies its own
filter context, while retaining the reader's selected games and print options.
Returning to the chooser or reloading restores the selection. Restoration clears
any previously prepared output and never prepares or prints automatically.
Malformed drafts, unknown/deleted IDs and invalid settings fall back safely.
When browser storage cannot be read or written, selection and printing remain
available for the visit and the page explains that the latest choices cannot be
saved. Clear selections persists the empty selection. Removing a hidden choice
also invalidates prepared sheets and keeps keyboard focus on the next removal
button or the search field.

Catalog and pack searches share the same normalization of apostrophes, periods,
hyphens, accents and extra spaces, and index the same title/theme/scene/series
text. Searches such as `St Patrick`, `st. patrick's`, `café` and `hot-water` now
find the same games in both places. Query parameters are kept out of the clean
canonical and the pack utility remains noindex. Privacy text describes the
local draft and the filter parameters in URLs; no analytics or account service
was introduced.

## Four clue-only corrections

`spring-garden-wildlife-5`, A Butterfly on the First Warm Day, retains its existing
revision 1, all answers, coordinates, numbering and progress key. Four clues now
refer to the butterfly scene: NECTAR to the liquid butterflies sip, WING to the
insect's flight part, FLOWER to a blossom it visits, and ORANGE to the color.
The deployed puzzle and its authoring source are updated together.

The [wording ledger](research/current-clue-corrections-2026-11-16.json) records
each old/new clue and reason. Historical baseline files were not edited. The
preservation audit reverses only those exact documented strings before comparing
the original object/file hashes. It rejects an unexpected clue or board change.
Its current report distinguishes 999 untouched earlier objects from the one
wording-corrected object, with all 1,000 earlier boards and progress associations
retained. The release generator uses the same strict check and retains the
current corrected clues when regenerating the 200 later games.

## Verification

- Production build, TypeScript, board/content/SEO and whitespace checks pass.
  There are still 1,200 games, 3,810 HTML pages and 1,229 canonical sitemap URLs.
- All 121 relevant Playwright tests pass. New coverage includes reload and
  back-navigation recovery, explicit topic links, no automatic sheet requests
  after restoration, hidden-choice removal and keyboard focus, prepared-output
  invalidation, malformed/duplicate/over-limit IDs, blocked reads and writes,
  unchanged game-storage keys, matching punctuation/accents/hyphen searches,
  accessible phone layout and the corrected clues with restored saved letters.
  Existing membership, ten-game limit, failed-sheet, print order, no-script,
  gameplay, collection-history and all current route checks remain included.
- Four ten-game packs pass actual Chromium/PyMuPDF checks: large puzzles 20
  pages, large with answers 40, compact puzzles 10, compact with answers 20.
  Four corrected butterfly puzzle/answer exports add six pages. All 96 pages
  pass expected text, US Letter bounds, page counts and 18pt/13pt typography.
- The restored mobile selection list was visually inspected. Automated checks
  confirm no horizontal overflow and no scanned accessibility violations; this
  is not a complete accessibility conformance claim or physical-printer test.
- Comparing with the parent commit confirms all 1,200 puzzle objects are equal
  after reversing the four documented clue strings. Historical editions and
  game/save code remain unchanged. Both release preservation audits pass. A
  deliberate board mutation and an unrecorded clue fail the historical check.
- The updated release generator reproduces the current catalog byte-for-byte,
  including the four corrected clues.

Repeatable checks:

```sh
npm run typecheck
npm run build
python3 scripts/audit-expansion-1000.py
python3 scripts/audit-expansion-1200.py
npx playwright test tests/print-pack-draft.spec.ts tests/print-pack.spec.ts tests/print-entry.spec.ts tests/collection.spec.ts tests/print-layout.spec.ts tests/seo.spec.ts tests/topics.spec.ts tests/expansion-topics.spec.ts tests/site.spec.ts
git diff --check
```

Current-instance evidence is under
`/workspace/artifacts/print-pack-draft-2026-11-16/`; logs use
`/tmp/lpc-draft-*.log`. Directory pagination/performance and broader topic-aware
difficulty guidance are separate follow-ups requiring their own measurement and
review. No additional puzzles, keyword research or competitor-page claims were
introduced in this update.
