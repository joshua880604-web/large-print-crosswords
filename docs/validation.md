# Validation — 2026-11-12

- `npm run build`: 309 static pages generated; no server adapter.
- `npm run typecheck`: TypeScript checks passed.
- `npm test`: 100 unique connected puzzles, 1,259 clue entries. Crossings, numbering, bounds, unclued letter runs, duplicate grids, and within-series answer variation checked.
- `npm run test:e2e`: 12 Playwright tests passed against the production build in system Chromium. Includes a complete solved puzzle, input and hint behavior, check feedback, persistence, settings/reset, touch direction changes, enlarged board containment, blocked-storage fallback, stale-build daily rotation, all 300 puzzle-related URLs, and static print content with JavaScript disabled.
- Axe WCAG A/AA automated scans passed for the home page, a representative game, and the printable collection. This is not a claim of complete accessibility conformance.
- At a 390px emulated mobile viewport, main pages fit without whole-page horizontal overflow. Enlarged squares scroll inside the board.
- Exported all 100 puzzle print pages through Chromium's PDF renderer, using CSS US Letter settings: all 100 were one page. Browser Save as PDF is the site's export method; downloadable PDF files are not shipped.
- Desktop and mobile screenshots visually inspected. System fonts, no remote images or font services.

Not established: real mobile-device keyboard behavior, physical-printer results, professional clue editing, target-user difficulty feedback, production DNS/HTTPS, indexing, traffic, advertising revenue, or fresh-task snapshot restoration.

## On-screen keyboard update — 2026-11-12

- Build and TypeScript checks passed after adding the shared physical/system/on-screen input handlers.
- 16 Playwright tests passed, including QWERTY input, deletion, next-word selection, hint feedback, saved answers and keyboard preference, physical input while the panel is active, roving focus, Escape/hide/reopen, and complete on-screen solving.
- Touch emulation checked automatic first-interaction opening, active-square visibility above the dock, whole-board visibility when space permits, native-keyboard switching, and a 320px viewport. The keyboard is excluded from print output.
- An automated Axe scan passed with the keyboard visible. Phone-size screenshots were inspected; this does not replace testing the native keyboard on actual iOS and Android devices.

## Search launch update — 2026-11-12

- Full production build and post-build SEO audit passed across 309 HTML files: 108 unique indexable canonical URLs, including all 100 game pages; 200 print copies and the 404 page are noindex.
- All indexable titles and descriptions are unique. Canonical and share URLs use the production HTTPS origin. Every root-relative link/asset target resolves to generated output.
- WebSite/WebPage JSON-LD parses and matches the document metadata; puzzle breadcrumb data matches visible navigation. This does not establish eligibility for any special Google result.
- Committed local Open Graph/Twitter preview image verified at 1200 × 630; image appearance inspected.
- TypeScript checks and 18 Playwright tests passed, including query-string canonical handling, escaped text consistency, image serving, print noindex, and the actual 404 response, plus gameplay/accessibility regressions.
- User reports Search Console ownership verified, with sitemap submission still pending. No Google account action or indexing request was performed by the agent.
- Live-domain HTTP/TLS/redirect verification remains blocked by the current environment's unchanged outbound allowlist. All automated results above refer to the generated build or its local preview, not an externally verified deployment.

## Gardening editorial pilot — 2026-11-12

- Changed exactly five current gardening puzzles; the other 95 layouts and clues remain unchanged. Stable current URLs retained.
- Five original grids preserved byte-for-byte in the legacy archive and verified by the same structural checks. Revisioned progress keys and a previous-edition link allow saved original games to remain playable without contaminating new grids.
- Five new subjects use boards no larger than 11 × 11, with 11–12 clues each, individual introductions/tips, and three explanations tied to actual answers. No professional or target-user review is claimed.
- Gardening: 58 entries / 21 distinct answer-clue pairs before; 58 entries / 58 distinct pairs after. All five intros differ. Collection remains 100 current puzzles / 1,259 entries; current distinct answer-clue pairs rise from 433 to 469.
- Committed content-overlap report generated. It explicitly retains the other 95 puzzles' review signals; no automatic noindex changes made to current puzzles.
- Full collection regeneration reproduced the inspected JSON exactly and left the legacy archive unchanged.
- Build, content audit, SEO audit, TypeScript and 22 Playwright tests passed, including print-grid proportion checks, old/new saved-progress isolation, all five note sections, and noindex legacy routes. Total static output is now 314 HTML pages; the canonical sitemap still has 108 URLs.
- After correcting print-grid proportions and footer spacing without reducing clue text size, all 100 current print sheets exported as single US Letter pages in Chromium. Physical printing and target-user difficulty still need real-world feedback.

## Bird editorial batch — 2026-11-12

- Replaced only the five current backyard-bird editions. The other 95 current puzzles, including the previously edited gardening batch, remain byte-for-byte identical as puzzle objects.
- Bird subjects: Songbird Neighbors, At the Bird Feeder, Wings in Motion, Nests and New Beginnings, and Birds by the Water. Each has 10–12 clues in a board no larger than 11 × 11, unique introductory and solving text, and three explanations tied to actual answers.
- Bird series: 67 entries / 21 distinct answer-clue pairs before; 55 entries / 55 distinct pairs after. Reusing a word with a different contextual meaning, such as an eggshell versus a seed shell, is permitted and reported separately from exact-clue repetition.
- Collection remains 100 current puzzles, now with 1,247 clue entries, 503 distinct answer-clue pairs, 28 distinct introductions, and 10 edited editions. Ninety current puzzles remain in the editorial queue; 72 numbered titles remain visible in the report.
- The shared series manifest now drives deterministic refinements, preserved-original validation, and previous-edition routes. Existing gardening seeds and results remained unchanged. Full regeneration reproduced all 100 current puzzles exactly, without changing either archive.
- Build, content/SEO audits, TypeScript and 23 Playwright tests passed. Tests cover both families' saved-game isolation, all ten note sections, all ten noindex archives, and lookup using the renamed series' original name.
- All five changed bird print sheets exported as single US Letter pages in Chromium. Reader notes visually inspected. Total static HTML output is 319 pages; canonical sitemap coverage stays at 108 URLs.
- Live Cloudflare deployment status, actual mobile keyboards and physical printers were not verified by these local checks. No target-user or professional editorial review is claimed.

## Music editorial batch — 2026-11-12

- Changed only the five current music-memories puzzles. All other 95 current puzzle objects, including the gardening and bird editions, remain identical to the previous release.
- Subjects: Radio & Records, At the Piano, Songs & Singing, Rhythm & Dance, and Meet the Orchestra. Each has 11–12 clues in a board no larger than 11 × 11, distinct topic/solving text, and three answer explanations. No knowledge of copyrighted lyrics or recording dates is required.
- Music series: 58 entries / 21 distinct answer-clue pairs before; 57 entries / 57 distinct pairs after. Collection remains 100 current puzzles, now with 1,246 entries, 539 distinct answer-clue pairs, 32 distinct introductions and 15 edited editions. Eighty-five puzzles remain in the editorial queue.
- Preserved the five original music layouts and added them to the existing manifest. Full generation reproduced all 100 current puzzles exactly and left all 15 original archives unchanged.
- Added a content-audit check for clues that directly include their own answer as a whole word; edited editions fail that check. No such clues remain in the current collection. This check does not evaluate all forms of ambiguity or factual accuracy.
- Build, content/SEO audits, TypeScript and 24 Playwright tests passed, including saved-game isolation for all three edited families, all fifteen note sections/archive routes, and query-string metadata handling with an ampersand in a real current puzzle title.
- All five new music print sheets exported as a single US Letter page in Chromium; the piano reader notes were visually inspected. Total static HTML output is 324 pages, with 108 canonical sitemap URLs.
- These are local build/browser results. Cloudflare completion, target-user difficulty, physical printing and professional editorial review are not established by these checks.

## Market editorial batch — 2026-11-12

- Changed only the five current market-morning puzzles, preserving the other 95 current puzzle objects, their IDs and layouts. The fifteen already edited gardening/bird/music puzzles remain unchanged.
- New subjects: Fruit Basket Favorites, The Bread Counter, Dairy Case Finds, Pantry Shelf Staples, and Labels, Prices & Checkout. Each has 11–12 clues on a board no larger than 11 × 11, a distinct introduction, a solving tip, and three explanations of actual answers.
- Reviewed the selected entries against the page copy and adjusted several tips to refer to the foods, shapes, packages and shopping terms actually present. No dietary recommendations or expert endorsements were added.
- Market series: 65 entries / 21 distinct answer-clue pairs before; 58 entries / 58 distinct pairs after. Collection stays at 100 current puzzles with 1,239 clue entries, 576 distinct answer-clue pairs, 36 introductions and 20 edited editions. Eighty current puzzles remain in the editorial queue.
- All twenty original layouts remain preserved. Final full regeneration reproduced the current JSON exactly without changing any original archive. Market progress uses a separate edition key and can resume the prior layout through its noindex archive route.
- Build, content/SEO audits, TypeScript and 25 Playwright tests passed, including all twenty reader-note sections, all twenty previous-edition routes, saved-game isolation in all four edited families, and discovery using the original market series name.
- All five updated print sheets exported as single US Letter pages in Chromium. Bread-counter notes visually inspected. Static output now has 329 HTML pages; canonical sitemap coverage remains 108 URLs.
- These checks do not establish Cloudflare deployment completion, physical printer behavior, target-user difficulty, professional review or Google indexing/ranking.

## Travel editorial batch — 2026-11-12

- Replaced only the five current on-the-road editions. The other 95 puzzle objects, including all twenty previously edited puzzles, remain unchanged.
- Subjects: A Relaxed Road Trip, At the Train Station, Around the Airport, A Comfortable Hotel Stay, and Postcards & Travel Memories. Each has 11–12 clues on a board no larger than 11 × 11, a distinct introduction and solving tip, and three explanations tied to actual answers.
- Tightened selected definitions and aligned topic guidance to the placed vocabulary, including American vehicle terms, railway car meanings, the motor/hotel blend, and physical photo keepsakes. No live fares, airline policies, postal prices, or current schedules are asserted.
- Travel series: 64 entries / 21 distinct answer-clue pairs before; 57 entries / 57 distinct pairs after. The collection remains 100 current puzzles with 1,232 entries, 612 distinct answer-clue pairs, 40 introductions, and 25 edited editions. Seventy-five current puzzles still await editorial work.
- Preserved all five earlier travel boards. Exact full regeneration and byte-preserved archives verified for all 100 current puzzles and 25 original editions. Existing gardening, bird, music and market seeds/results were retained.
- Build, content/SEO audits, TypeScript and 26 Playwright tests passed, including all twenty-five note sections and archive routes, independent old/new progress in all five edited families, and search discovery under the original travel series name.
- All five new travel print sheets exported as single US Letter pages in Chromium. Hotel reader notes visually inspected. Static HTML output now totals 334 pages, while the canonical sitemap remains at 108 URLs.
- Local verification does not establish Cloudflare deployment completion, target-user difficulty, physical printer results, professional review, or Google indexing/ranking.

## Home editorial batch — 2026-11-12

- Changed only the five current cozy-at-home puzzles. The other 95 puzzle objects, including all twenty-five previously edited editions, remain unchanged.
- Subjects: In the Living Room, Tools at the Kitchen Counter, Laundry Day Words, At the Front Door, and A Place for Everything. Each has 11–12 clues on a board no larger than 11 × 11, a distinct introduction and solving tip, and three explanations of actual answers.
- Aligned guidance with the placed vocabulary, including kitchen utensil purposes, a complete laundry cycle versus its individual stages, porch features, and storage containers and parts. Laundry reader notes were visually inspected.
- Home series: 64 entries / 21 distinct answer-clue pairs before; 57 entries / 57 distinct pairs after. The collection remains 100 current puzzles with 1,225 entries, 648 distinct answer-clue pairs, 44 introductions, and 30 edited editions. Seventy current puzzles remain in the editorial queue.
- Full regeneration reproduced all 100 current puzzles exactly and preserved all thirty original layouts. Stable IDs, separate edition progress, and the noindex previous-edition routes retain access to saved original games.
- Build, content/SEO audits, TypeScript and 27 Playwright tests passed, including all thirty reader-note sections and archive routes, saved-game isolation for all six edited families, and discovery under the original home series name.
- All five changed print sheets exported as single US Letter pages in Chromium. Static output totals 339 HTML pages; the canonical sitemap remains at 108 URLs.
- These local checks do not establish Cloudflare deployment completion, physical printer results, target-user difficulty, professional editorial review, or Google indexing/ranking.

## Farm editorial batch — 2026-11-12

- Changed only the five current a-day-at-the-farm editions. All other 95 current puzzle objects, including the thirty previously edited editions, remain unchanged.
- Subjects: Meet the Farm Animals, Across the Grain Fields, A Visit to the Orchard, Around the Horse Stable, and At the Country Fair. Each has 11–12 clues on a board no larger than 11 × 11, a distinct introduction and solving tip, and three explanations of actual answers.
- Reviewed the selected vocabulary and aligned guidance to the actual entries, including animal group names, plant parts, horse equipment and movements, and fair displays. U.S. fair ribbon-color clues are qualified rather than presented as universal rules. Orchard notes were visually inspected.
- Farm series: 65 entries / 22 distinct answer-clue pairs before; 58 entries / 58 distinct pairs after. Collection totals are 100 current puzzles, 1,218 entries, 684 distinct answer-clue pairs, 48 introductions, and 35 edited editions. Sixty-five current puzzles remain in the editorial queue.
- All five original farm objects match the previous release exactly. Full generation reproduced all 100 current puzzles byte-for-byte and left all thirty-five archived layouts unchanged. Existing series seeds and results were preserved.
- Build, content/SEO audits, TypeScript and 28 Playwright tests passed, including all thirty-five reader-note sections and archive routes, independent original/current progress for all seven edited families, and discovery under the original farm series name.
- All five updated print sheets exported as single US Letter pages in Chromium. Output now totals 344 static HTML pages; the canonical sitemap still contains 108 URLs.
- These local checks do not establish Cloudflare deployment completion, physical printer results, target-user difficulty, professional editorial review, or Google indexing/ranking.

## Baking editorial batch — 2026-11-12

- Changed only the five current sunday-baking editions. All other 95 current puzzle objects, including the thirty-five previously edited editions, remain unchanged.
- Subjects: Measuring and Mixing, A Loaf of Bread, Making a Homemade Pie, A Tray of Cookies, and A Cake to Share. Each has 11–12 clues on a board no larger than 11 × 11, a distinct introduction and solving tip, and three explanations of actual answers.
- Checked the selected vocabulary and aligned guidance to actual entries, including weight versus fluid volume, bread proofing, pastry edges, cookie-batch words and cake-decorating tools. Measuring-and-mixing notes were visually inspected. These are definitions rather than recipe instructions or dietary advice.
- Baking series: 64 entries / 22 distinct answer-clue pairs before; 56 entries / 56 distinct pairs after. Collection totals are 100 current puzzles, 1,210 entries, 718 distinct answer-clue pairs, 52 introductions, and 40 edited editions. Sixty current puzzles remain in the editorial queue.
- The five original baking objects match the previous release exactly. Full regeneration reproduced all 100 current puzzles byte-for-byte and preserved all forty archived layouts. Existing series seeds and results were retained.
- Build, content/SEO audits, TypeScript and 29 Playwright tests passed, including all forty reader-note sections and archive routes, original/current saved-progress isolation for all eight edited families, and discovery using the original baking series name.
- All five changed print sheets exported as single US Letter pages in Chromium. Static output totals 349 HTML pages; the canonical sitemap remains at 108 URLs.
- These local checks do not establish Cloudflare deployment completion, physical printer results, target-user difficulty, professional editorial review, or Google indexing/ranking.

## Crafts editorial batch — 2026-11-12

- Changed only the five current a-stitch-in-time editions. All other 95 current puzzle objects, including the forty previously edited editions, remain unchanged.
- Subjects: Inside the Sewing Box, A Basket of Knitting, With a Crochet Hook, Piecing a Patchwork Quilt, and Mending Everyday Clothes. Each has 11–12 clues on a board no larger than 11 × 11, a distinct introduction and solving tip, and three explanations of actual answers.
- Reviewed selected definitions and aligned guidance with the actual tools, fabric textures, crochet shapes, patchwork edges, and clothing fastenings. Patchwork notes were visually inspected. The clues give direct definitions and do not require reading craft-pattern abbreviations.
- Crafts series: 64 entries / 22 distinct answer-clue pairs before; 57 entries / 57 distinct pairs after. Collection totals are 100 current puzzles, 1,203 entries, 753 distinct answer-clue pairs, 56 introductions, and 45 edited editions. Fifty-five current puzzles remain in the editorial queue.
- The five original crafts objects match the previous release exactly. Full regeneration reproduced all 100 current puzzles byte-for-byte and preserved all forty-five archived layouts. Existing series seeds and results were retained.
- Build, content/SEO audits, TypeScript and 30 Playwright tests passed, including all forty-five reader-note sections and archive routes, original/current saved-progress isolation for all nine edited families, and discovery using the original crafts series name.
- All five updated print sheets exported as single US Letter pages in Chromium. Static output totals 354 HTML pages; the canonical sitemap remains at 108 URLs.
- These local checks do not establish Cloudflare deployment completion, physical printer results, target-user difficulty, professional editorial review, or Google indexing/ranking.

## Flowers editorial batch — 2026-11-12

- Changed only the five current flower-favorites editions. All other 95 current puzzle objects, including the forty-five previously edited editions, remain unchanged.
- Subjects: Parts of a Flowering Plant, At the Flower Shop, Cottage Garden Colors, Visitors Among the Blooms, and Colors and Shapes in Bloom. Each has 11–12 clues on a board no larger than 11 × 11, a distinct introduction and solving tip, and three explanations of actual answers.
- Reviewed the selected definitions and aligned guidance to actual plant parts, flower-shop supplies, flower names, visiting animals, and descriptive words. Clarified pollen versus nectar, qualified variable flower appearances and animal activity, and distinguished a flower visit from successful pollination. Cottage-garden notes were visually inspected.
- Flowers series: 64 entries / 22 distinct answer-clue pairs before; 58 entries / 58 distinct pairs after. Collection totals are 100 current puzzles, 1,197 entries, 790 distinct answer-clue pairs, 60 introductions, and 50 edited editions. Fifty current puzzles remain in the editorial queue.
- The five original flower objects match the previous release exactly. Full regeneration reproduced all 100 current puzzles byte-for-byte and preserved all fifty archived layouts. Existing series seeds and results were retained.
- Build, content/SEO audits, TypeScript and 31 Playwright tests passed, including all fifty reader-note sections and archive routes, original/current saved-progress isolation for all ten edited families, and discovery using the original flower series name.
- All five changed print sheets exported as single US Letter pages in Chromium. Static output totals 359 HTML pages; the canonical sitemap remains at 108 URLs.
- These local checks do not establish Cloudflare deployment completion, physical printer results, target-user difficulty, professional editorial review, or Google indexing/ranking.

## Pets editorial batch — 2026-11-12

- Changed only the five current our-furry-friends editions. All other 95 current puzzle objects, including the fifty previously edited editions, remain unchanged.
- Subjects: Out for a Dog Walk, Around the Cat Basket, Small Pets and Their Homes, Feathered Pet Friends, and Life in a Fish Tank. Each has 11–12 clues on a board no larger than 11 × 11, a distinct introduction and solving tip, and three explanations of actual answers.
- Reviewed the selected definitions and aligned guidance with the actual walking equipment, cat resting places, small mammals, bird sounds and aquarium vocabulary. Fish-tank notes were visually inspected. The material defines words rather than prescribing care routines, diets or animal-health assessments.
- Pets series: 58 entries / 20 distinct answer-clue pairs before; 56 entries / 56 distinct pairs after. Collection totals are 100 current puzzles, 1,195 entries, 826 distinct answer-clue pairs, 64 introductions, and 55 edited editions. Forty-five current puzzles remain in the editorial queue.
- The five original pet objects match the previous release exactly. Full regeneration reproduced all 100 current puzzles byte-for-byte and preserved all fifty-five archived layouts. Existing series seeds and results were retained.
- Build, content/SEO audits, TypeScript and 32 Playwright tests passed, including all fifty-five reader-note sections and archive routes, original/current saved-progress isolation for all eleven edited families, and discovery using the original pet series name.
- All five updated print sheets exported as single US Letter pages in Chromium. Static output totals 364 HTML pages; the canonical sitemap remains at 108 URLs.
- These local checks do not establish Cloudflare deployment completion, physical printer results, target-user difficulty, professional editorial review, or Google indexing/ranking.

## Drinks editorial batch — 2026-11-12

- Changed only the five current a-cup-of-comfort editions. All other 95 current puzzle objects, including the fifty-five previously edited editions, remain unchanged.
- Subjects: A Pot of Tea, Morning Coffee Words, A Warm Cup of Cocoa, At the Diner Counter, and Lemonade on the Porch. Each has eleven clues on a board no larger than 11 × 11, a distinct introduction and solving tip, and three explanations of actual answers.
- Reviewed the selected definitions and aligned guidance to actual teaware, coffee vocabulary, cocoa toppings, diner service and citrus parts. Clarified vessel functions, word forms, American restaurant usage and citrus-cut shapes. Lemonade notes were visually inspected. No recipe timings, dietary recommendations or current restaurant policies are asserted.
- Drinks series: 65 entries / 22 distinct answer-clue pairs before; 55 entries / 55 distinct pairs after. Collection totals are 100 current puzzles, 1,185 entries, 859 distinct answer-clue pairs, 68 introductions, and 60 edited editions. Forty current puzzles remain in the editorial queue.
- The five original drink objects match the previous release exactly. Full regeneration reproduced all 100 current puzzles byte-for-byte and preserved all sixty archived layouts. Existing series seeds and results were retained.
- Build, content/SEO audits, TypeScript and 33 Playwright tests passed, including all sixty reader-note sections and archive routes, original/current saved-progress isolation for all twelve edited families, and discovery using the original drinks series name.
- All five updated print sheets exported as single US Letter pages in Chromium. Static output totals 369 HTML pages; the canonical sitemap remains at 108 URLs.
- These local checks do not establish Cloudflare deployment completion, physical printer results, target-user difficulty, professional editorial review, or Google indexing/ranking.

## Final forty editions and complete collection — 2026-11-12

- Replaced exactly the forty previously unedited editions in Movies, Seaside, Autumn, Holidays, Reading, Weather, Workshop, and Games. The sixty already edited puzzle objects remain identical to the preceding release.
- Each of the forty new subjects has 11–12 clues in a board no larger than 11 × 11, an individual introduction, a solving tip, and three explanations of actual answers. Revised guidance after inspecting the selected entries, including American checkers terminology, forecast vocabulary, workshop dimensions and parts, and book-reading terms.
- The full collection now has 100 edited puzzles, 1,135 clue entries, 1,135 distinct answer/clue pairs, 886 distinct answers, 100 different introductions, and 300 answer explanations. No numbered-edition titles remain. Repeated familiar answers are still reported independently of exact clue wording; these counts are editorial signals, not search-ranking guarantees.
- All forty newly archived original objects match the preceding release, and all earlier archive files remain byte-identical. Full generation reproduces the final inspected current JSON exactly without modifying any of the 100 original layouts. Stable current URLs and separate revision-2 progress keys remain in use.
- Build, TypeScript, content audit and SEO audit passed. Output totals 409 static HTML pages, with 100 indexable puzzle pages and 108 canonical sitemap URLs. All 200 print copies and 100 previous-edition routes remain noindex.
- All 41 Playwright tests passed, including gameplay, on-screen input, local progress, accessible main views, collection search using original series names, all 100 reader-note sections, all 100 archived routes, and original/current progress isolation for all twenty families. The two tests visiting every current or original edition have explicit catalog-sized time budgets.
- After a final two-field wording adjustment to reader notes, rebuilt and repeated the affected 100-subject note test successfully. Grid, clue, title and print-description fields were verified unchanged by that adjustment; the final full generator also reproduced those wording edits exactly.
- Exported every current puzzle and separate answer sheet through Chromium: all 200 outputs are one US Letter page. All 200 layouts have no grid/clue overlap and retain clue text of at least 17 CSS pixels. Physical printers and actual mobile keyboards remain outside these browser-renderer checks.
- Captured note screenshots for all eight new families and visually inspected representative movie, reading, weather and chess examples. Refreshed the chess and table-setting captures after final wording changes.
- The content report now describes ongoing review rather than an unfinished queue. Reader difficulty feedback and professional editing remain useful next evidence; neither is claimed by these automated and editorial checks.
- Cloudflare deployment completion, live-domain HTTP/TLS/redirects, Google indexing and traffic were not verified by these local checks.

## Expansion to 200 puzzles — 2026-11-12

- Added exactly 100 new first-edition puzzles in twenty new five-puzzle series. The previously published 100 puzzle objects are unchanged, and all 100 legacy archive files remain unchanged. The complete generator reproduces the inspected 200-puzzle JSON byte-for-byte.
- The complete collection contains 2,251 clue entries, 2,251 distinct answer/clue pairs, 1,333 distinct answers, 200 individual introductions, and 600 explanations tied to actual answers. New boards have 10–12 clues and fit within 11 × 11. All numbered-edition titles remain absent.
- New first editions use revision 1 and their own edition progress key. They have no nonexistent previous-edition link. Existing refreshed puzzles retain revision 2 and their original archive/legacy progress bridge. Archive routing, structural validation and content reports distinguish these two cases.
- Read the user's US bulk keyword workbook and both sports/music SERP exports. Research notes preserve the distinction between estimated search demand and unverified reader age. Sports has substantial educational/children's intent; music also mixes entertainment with education. The implemented content uses direct definitions and familiar adult-life scenes rather than player statistics, recording dates or grade-specific worksheets.
- Added sports and music collection pages, each linking to twenty actual puzzles. Music includes the existing five plus fifteen new subjects. Added collection links, matching visible breadcrumbs, canonical URLs and sitemap entries. The component also continues to serve all 200 puzzles on the main collection.
- TypeScript, structural/content validation, production build and SEO audit passed. Output is 711 HTML pages: 200 indexable puzzle pages, two interest collections and eight other indexable pages; 400 print copies, 100 original archives and the 404 page are noindex. Sitemap coverage is 210 canonical URLs.
- All 44 Playwright tests passed. Coverage includes all 200 reader-note sections, all 600 puzzle/print/answer URLs, original/current progress isolation for the twenty archived families, all 100 original routes, first-edition save/reload behavior, and sports/music navigation and filtering.
- Exported all 400 puzzle and answer pages with Chromium: every output is one US Letter page, with no grid/clue overlap and clue text at least 17 CSS pixels. The print audit is preserved in `/workspace/artifacts/200-print-audit.json`; this does not replace a physical-printer check.
- Visually inspected desktop/mobile topic screenshots and a new baseball note section. Moved the topic puzzle selectors before the longer solving guidance after that review. Rebuilt and reran both affected topic tests successfully. At a 390 × 844 viewport, the search field begins within the first viewport on both topic pages and neither causes page-wide horizontal overflow. Puzzle and print data did not change in that layout adjustment.
- Live Cloudflare completion, live-domain responses, Google indexing, target-reader difficulty, professional clue review, physical printing and native keyboards on real phones are not established by these local checks.

## Collection browsing — 2026-11-13

- Added shareable search/theme query parameters to all three collections. Returning from a puzzle or reloading preserves that history entry's filters and expanded result count. Copied URLs start with twelve results. Clear filters restores all themes and focuses search; unrelated URL parameters survive changes. Unavailable themes on a topic page are cleared.
- Search normalizes common apostrophe, period, hyphen, accent and whitespace differences. Both `St Patrick` and `st.  patrick's` find the existing St. Patrick’s Day puzzle. Query variants retain their clean collection canonical and are absent from the sitemap.
- Added direct music and sports links beneath the home page's featured puzzles. Updated launch research and Search Console instructions to reflect the completed 200-puzzle collection and its interest pages.
- TypeScript, structural/content validation, production build and SEO audit passed. All 49 Playwright tests passed, including five new browsing scenarios and the existing gameplay, saved-progress, archive, topic and accessibility coverage. Output remains 711 HTML pages and 210 canonical sitemap URLs.
- Checked filtered results at widths 320, 390 and 1120 CSS pixels: no page-wide overflow, a 54-pixel-high clear button, and zero axe violations under WCAG 2 A/AA and 2.1 AA tags. Visually inspected screenshots at `/workspace/artifacts/browsing-filters-phone.png` and `/workspace/artifacts/browsing-filters-desktop.png`. Automated checks do not establish full accessibility conformance.
- Puzzle data, archives, progress logic, print templates and styles are unchanged. The previous 400-sheet print audit remains applicable to the unchanged output; no new print export was needed. Live deployment and Google indexing were not verified from this environment.

## Geography, history and Texas pilot — 2026-11-13

- Added twenty first editions in four five-puzzle series: map/landscape geography, regional US state capitals, selected American-history scenes and Texas subjects. They have 10–12 clues on boards no larger than 11 × 11, individual introductions/tips, and three explanations each. The complete collection is now 220 puzzles, 2,467 entries, 2,467 distinct answer/clue pairs, 1,472 distinct answers, 220 introductions and 660 explanations. No exact answer/clue pairs or introductions repeat.
- Compared the first 200 current objects with the preceding committed JSON: all remain equal. No archive files, print templates, game-progress code or global styles changed. Full `scripts/generate-puzzles.py` regeneration reproduced the reviewed 220-puzzle JSON byte-for-byte (SHA-256 `c09b051c15b4f58879f915e0bb0c58f74db3dfe6dfcce801e9f29ff747dbacad`). Original/current save separation and the 100 preserved layouts remain in place; new puzzles use revision-1 keys and have no dangling archive link.
- During content review, layout selection was found to omit some defining subject words. Added optional source `requiredAnswers`, enforced by both generation and validation. The final Texas games retain LONGHORN, BLUEBONNET, PECAN, TWOSTEP and the named road-trip anchors; the canal puzzle retains ERIE/LOCK. A long city name was replaced with an explicitly clued state/name fragment rather than silently truncating an answer. Capital clues and notes distinguish city versus state, capital versus capitol, and omitted spaces.
- Added geography/state-capital (ten games), American-history (five) and Texas (five) collection pages. Home and main collection link to all five interest collections. New games link back to their topic. Canonical pages, visible breadcrumbs, structured data and the sitemap match; query variants continue to canonicalize to the clean collection.
- TypeScript, structural/content validation, production build and SEO audit passed. Output is 774 HTML pages, 220 playable puzzles, 233 canonical sitemap URLs, 440 noindex print utilities and the unchanged 100 noindex archives, plus the noindex 404.
- All 53 Playwright tests passed. Four added scenarios cover the three new topic-to-game-to-print routes, sitemap/canonical discovery, topic return links, state-capital filtering, and typing/saving/reloading the multiword DESMOINES answer without spaces. Existing checks include all 220 note sections, all 660 current puzzle/print/answer routes, gameplay, original/current saved-progress isolation, all original routes and collection history behavior.
- Exported all forty new puzzle and answer sheets with Chromium. Each is one US Letter page; every expected clue/answer appears in extracted PDF text; grids, clues and footers do not overlap; clue text is at least 17 CSS pixels. Results are in `/workspace/artifacts/220-print-audit.json`, with individual PDFs in `/workspace/artifacts/220-print/`. The previous 400-sheet result applies to the unchanged earlier content/templates. Physical printer results remain untested.
- Checked each new topic at widths 320, 390 and 1120 pixels: no page-wide horizontal overflow. On 390-pixel layouts all three search fields begin between 565 and 611 pixels from the top. Axe scans of the three mobile topic views found zero WCAG 2 A/AA or 2.1 AA violations; this is not a full conformance claim. Layout report: `/workspace/artifacts/220-layout-audit.json`. Visually inspected geography/history phone views, the Texas desktop view and the pecan answer explanations.
- Research scope and factual/editorial distinctions are recorded in `place-history-pilot.md`. Unavailable keyword data was not filled with zeros; population rankings and age-specific demand were not inferred. Live Cloudflare completion, live-domain responses, Google indexing, independent professional editing and target-reader difficulty are not established by these checks.

## Full-catalog editorial and operational review — 2026-11-13

- Read all 220 current subjects: 2,467 clues, every introduction/focus/tip and all 660 answer explanations. Also read the 433 distinct answer/clue pairs in all 100 archived originals. The review record and affected IDs are in `puzzle-review-2026-11-13.md`; full before/after text and the 220-row checklist are in `/workspace/artifacts/full-review/review-results.xlsx`.
- Corrected or clarified 45 text fields in 31 current puzzles: twenty clues, seven notes, six tips, four focus paragraphs, one title, three introductions, three card summaries and one subject label. Covered scientific definitions, sports scoring, same-length synonym ambiguity, and text that referred to words absent from the selected grid. The 189 other objects remain identical to commit `401afb2`.
- All 220 IDs, revisions, dimensions, answers, numbers, directions and coordinates are unchanged. All original archive files remain unchanged. A render-time exact-pair clarification fixes ROOT/YAM definitions on five archived pages and displays the earlier wording and reason. Two regression tests verify the clarified clue, original geometry and restoration of the legacy saved letter.
- Source pools contain the same corrections. Full generation reproduces the reviewed JSON byte-for-byte, SHA-256 `ac041f2460794579de34b45a59c2c7c387e9b6ffcdd077074867171d8e6bf528`. Current totals remain 220 puzzles, 2,467 distinct answer/clue pairs, 220 distinct introductions and 660 notes, with no repeated exact pair or introduction.
- TypeScript, structural/content validation, production build and SEO audit passed. All 55 Playwright tests passed. Output remains 774 HTML pages, 233 canonical sitemap URLs, 440 noindex print copies and 100 noindex archive pages.
- Added a reusable local-preview `audit:playthrough` command. It completed all 320 current/original boards through actual keyboard entry, checked rendered clue content and physical answer placements, verified completion and saved values, then reloaded and checked all restored letters. All 320 passed. Report: `/workspace/artifacts/full-review/playthrough.json`. This operational check does not replace editorial judgment about the clue meanings.
- Re-exported all 440 puzzle and answer PDFs. All are single US Letter pages with every expected title/clue/answer in extracted text and no grid, clue or footer overlap. Report: `/workspace/artifacts/full-review/print-audit.json`; PDFs are under its `print/` directory. Current clue size measures 13 pt; the audit establishes completeness/pagination rather than certification to an 18 pt large-print standard or physical printer legibility. Font sizes were not changed in this content review.
- Checked every current and original game page at a 390-pixel mobile viewport: all 320 fit without page-wide horizontal overflow. The two archive-clarification view types with details open have zero axe WCAG 2 A/AA and 2.1 AA violations. Report: `/workspace/artifacts/full-review/mobile-audit.json`. Visually inspected the ROOT clarification and renamed capital-route mobile page.
- This is model-assisted editorial review plus local automated verification. It does not establish independent professional editing, target-reader difficulty, real-device keyboard behavior, physical printing, live Cloudflare completion or Google indexing. No full accessibility-conformance or age-preference claim is made.

## Expansion from 220 to 300 — November 13, 2026

- Added 80 first editions in sixteen five-subject series, each with 10–12 clues on a connected board no larger than 11 × 11. Current totals: 300 puzzles, 3,360 distinct answer/clue pairs, 1,859 distinct answers, 300 introductions and 900 answer explanations. No exact pair or introduction repeats. See `expansion-300.md` for subject scope and research limits.
- Compared the entire prior 220 puzzle objects with the pre-expansion baseline: all equal. Existing series configurations, archive files, revisions and save keys are unchanged. New sources specify required defining answers and revision 1.
- Full generation reproduced the generated collection byte-for-byte. Final review then clarified two tips and two context paragraphs in three new puzzles; focused regeneration of the two affected series reproduced the final objects and placements. Final JSON SHA-256: `26c45b766356619cb3080029ea7a3b069bb5e34da38a7d4ddea73782b6997ae6`.
- TypeScript, structural/content checks, production build and SEO audit passed. Build: 1,014 HTML pages, 313 canonical sitemap URLs, 600 noindex print copies and 100 previous-edition pages. No advertising runtime code or domain settings changed.
- Initial browser run passed 54 functional/regression checks; the single 300-page editorial loop reached its 180-second total budget under concurrent audits. Replaced that loop with one bounded test per series, retaining every assertion. All 60 per-series tests passed, covering all 300 titles, context notes, tips, explanations and spoiler controls. Both affected series passed again after final wording changes. Together these cover the current suite's 114 distinct checks. Logs: `/workspace/artifacts/300-pilot/e2e.log`, `editorial-series-e2e.log`, and `final-wording-e2e.log`.
- All 80 new boards completed through real keyboard entry, displayed completion, saved the exact letters and restored them after reload. Report: `/workspace/artifacts/300-pilot/new-playthrough.json`. An earlier whole-catalog replay was stopped to focus operational testing on the new boards; it is not counted as a completed 400-board audit. All 400 current/original layouts passed structural validation; the prior 320-board operational audit remains recorded above.
- Exported all 160 new puzzle/answer PDFs: every file is one US Letter page with all expected title/clue/answer text present and no board/clue/footer overlap. The existing clue size remains 13 pt; this checks content and pagination, not an 18 pt print standard or a physical printer. Reports: `/workspace/artifacts/300-pilot/print-audit.json` and `print-layout.json`; PDFs are in its `print/` directory. The unchanged earlier 440 print sheets were not re-exported in this batch.
- All 80 new game pages fit a 390-pixel viewport without page-wide overflow. Visually inspected the Golden Gate game and the Everyday Science filtered collection. Report: `/workspace/artifacts/300-pilot/mobile-audit.json`. Existing template accessibility and keyboard regression checks passed; this is browser emulation rather than a target-user study.

## SEO and directory rendering review — November 13, 2026

- Rechecked all 1,014 HTML pages, 313 indexable URLs and 600 noindex print copies. Unique metadata, exact production canonical paths, en-US language, one H1, robots, structured data, sitemap coverage and root-relative targets passed. New ordinary-link traversal confirms all 313 indexable pages are reachable from home within two clicks, without requiring JavaScript or print/archive pages as intermediaries.
- Replaced decorative card-cell markup with 300 edition-specific static SVG previews. Directory text and all 300 game anchors remain in server-rendered HTML. Each preview uses intrinsic dimensions, empty decorative alt text and lazy loading. Game boards, print grids, all puzzle data and save keys are unchanged.
- Main directory HTML decreased from 1,419,796 to 242,316 bytes; gzip from 50,144 to 27,814 bytes; element count from 39,026 to 4,001. The printable directory has comparable reductions. See `seo-review-2026-11-13.md` for both measurements and scope; these are not field Core Web Vitals.
- Added sports/music game links back to their existing curated collections. Existing geography/history/Texas return links remain.
- Production build and TypeScript checks passed. All 14 SEO, topic and collection tests passed, including script-free discovery of all 300 games, compact preview loading/geometry, clean query canonicals and the added topic return links. Five home/mobile/accessibility regressions also passed. Inspected desktop and mobile card screenshots.
- Artifacts: `/workspace/artifacts/seo-review-300/`, with `initial-page-metrics.json`, `final-page-metrics.json`, `build.log`, `e2e.log`, `home-mobile-a11y.log` and two screenshots. No puzzle or advertising data changed.
- User confirms the sitemap was just submitted and no GSC indexing figures exist yet; updated `search-console.md` accordingly. Live-domain HTTP/TLS, hostname redirects, CDN headers, Googlebot access and actual indexing were not verified: the current enforced environment policy does not permit production apex/www/Pages hosts. A public hosting error cannot be inferred from this restriction.
