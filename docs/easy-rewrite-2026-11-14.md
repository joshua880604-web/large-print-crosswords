# Everyday-vocabulary rewrite — November 14, 2026

The user asked for easy, older-reader-friendly themed puzzles and explicitly prioritized quality over catalog size. This release replaces the 27 current boards flagged for specialist vocabulary, keeping the collection at 500 games. It does not add keyword-variant landing pages.

## What changed

The earlier selected answers included CYATHIUM, MYCELIUM, CLITELLUM, ESCUTCHEON, PLECTRUM and other specialist terms. Replacing those answers required rebuilding their grids. Each replacement uses a coherent, familiar scene: ferns beside a path, mushrooms after rain, a window in spring, dishes in a cupboard, a family pocket watch, or a piano duet. Clues use direct ordinary language; the longer words are generally recognizable objects such as LIGHTHOUSE, EARTHWORM and SUNFLOWER, rather than technical names. A familiar word's length alone does not establish difficulty.

The changes revise the answer selections, clues, introductions, tips and three actual-answer explanations. They are not a batch of retitled copies or additional introductory prose around the same specialist answers. Some basic themed vocabulary remains, such as KILN with a potter's-oven definition. Reader difficulty has not been measured or certified.

| Permanent ID | Earlier subject | Current subject | Removed listed specialist answers |
| --- | --- | --- | --- |
| classic-american-stops-2 | Inside a Lighthouse Museum | A Lighthouse by the Shore | FRESNEL |
| backyard-nature-studies-4 | Bark and Tree Rings | Rings on a Tree Stump | CAMBIUM |
| water-and-wildlife-4 | A Turtle on a Log | A Turtle Resting by the Pond | CARAPACE, PLASTRON |
| kitchen-word-science-5 | Measuring Liquids | Reading a Kitchen Measuring Cup | MENISCUS |
| familiar-vehicles-5 | A Streetcar Along the Avenue | Riding a Streetcar Downtown | PANTOGRAPH |
| working-waterfront-3 | In a Wooden Boat Shed | A Wooden Rowboat by the Dock | GUNWALE |
| forest-observations | Ferns on the Forest Floor | Green Ferns Beside the Path | RHIZOME |
| forest-observations-2 | Acorns Beneath an Oak | Acorns Under an Oak Tree | CUPULE |
| forest-observations-4 | Mushrooms After the Rain | Mushrooms After a Woodland Shower | MYCELIUM, HYPHA |
| small-world-nature-3 | An Earthworm in the Garden Soil | An Earthworm After a Spring Shower | CLITELLUM |
| small-world-nature-4 | A Spider at Its Web | Dew Drops on a Spider Web | SPINNERET |
| flowers-through-the-year | A Daffodil in Early Spring | Yellow Daffodils in Spring | SPATHE, TEPAL |
| flowers-through-the-year-2 | A Sunflower Facing the Garden | A Tall Sunflower in Summer | ACHENE |
| flowers-through-the-year-4 | Bright Bracts on a Poinsettia | A Poinsettia on the Holiday Table | CYATHIUM |
| paper-and-lettering-5 | At a Letterpress Workbench | Printing a Card at an Old-Time Press | QUOIN |
| collections-and-keepsakes-4 | Shells Arranged in a Cabinet | Shells Collected at the Beach | GASTROPOD |
| collections-and-keepsakes-5 | A Pocket Watch in Its Case | A Family Pocket Watch | ESCAPEMENT |
| home-details | Parts of an Old-Fashioned Window | An Open Window in Spring | MULLION, MUNTIN |
| home-details-2 | A Door Lock and Its Fittings | Locking the Front Door | ESCUTCHEON |
| home-details-4 | A Cabinet Door and Drawer | Dishes in the Kitchen Cupboard | RABBET |
| everyday-materials | Glass at the Glassblower’s Bench | Glass Bottles on the Kitchen Shelf | ANNEAL |
| everyday-materials-2 | Fibers in a Sheet of Paper | Paper on the Writing Desk | CELLULOSE |
| everyday-materials-3 | Clay Before and After the Kiln | Shaping a Small Clay Bowl | KAOLIN, GROG |
| keyboard-sounds-3 | A Harpsichord in the Music Room | Taking Turns in a Piano Duet | PLECTRUM |
| keyboard-sounds-4 | The Player Piano's Paper Roll | Watching a Player Piano | PNEUMATIC |
| strings-and-picking-2 | A Mandolin's Paired Strings | A Mandolin at a Family Gathering | PLECTRUM |
| music-behind-the-scenes-5 | A Guitar Maker's Workbench | A Guitar Case After the Sing-Along | LUTHIER |

The 27 replacements contain 298 clues, with 10–12 per grid, no dimension above 11 × 11, and 81 explanations tied to placed answers. The current collection has 5,587 clues and 2,490 distinct answers; all 5,587 answer/clue pairs and 500 introductions are distinct. Reusing familiar vocabulary across contexts is appropriate; uniqueness is not a Google quality threshold.

## Earlier progress remains usable

All 27 formerly published first-edition objects are preserved in `src/data/previous-editions.json`. Their IDs, grids, answers, clues, editorial content and revision-1 keys remain unchanged. Their new routes are `/crosswords/<id>/editions/1/`, marked noindex and omitted from the sitemap. The new current versions retain their existing playable URLs and use edition-2 keys.

The continuation notice now uses the actual earlier edition's key and route. It appears only when saved letters exist in that earlier key. A newly revised first edition does not link to the unrelated original-layout `/previous/` route. Current and earlier versions save independently. Invalid or blocked storage is handled without stopping play.

The original 100 archives retain their existing `/previous/` routes and unversioned keys. Their files are untouched. The other 473 current puzzle objects, all 100 series configurations, seed settings, and untouched source subjects remain unchanged. Per-subject `revision` overrides permit replacing one subject without changing its four companions. Validators check that prior numbered editions exist and are older than the current source revision. Old edition-specific SVG URLs also remain available for cached collection previews.

## Discovery and remaining review

There are still 516 canonical sitemap URLs, including 500 current games. The 27 extra HTML files are continuation utilities, giving 1,644 HTML files in total, with 1,000 noindex print/answer copies and 127 noindex historical layouts. There are 500 current and 27 retained older SVG previews. All canonical pages remain reachable within two ordinary HTML-link clicks from home.

The [initial ledger](research/audience-review-2026-11-14-initial.csv) is retained separately. The [updated 500-row ledger](research/audience-review-2026-11-14.csv) now has no matches from the listed specialist-answer prompts, with 66 context/name-recall reviews still open and 434 unflagged candidates. No flag is not evidence that a puzzle is easy, accurate, popular or suitable for every older reader. The 66 reviews were not silently certified by this rewrite.

See [validation.md](validation.md) for source reproducibility, original/current preservation, browser progress isolation, mobile and printing checks. Model-assisted authoring and automated checks are not independent professional editing or target-reader testing. No indexing, ranking or traffic outcome is inferred.
