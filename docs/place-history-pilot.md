# Geography, history and Texas pilot

## Published content scope

The pilot adds twenty first editions in four series, bringing the collection from 200 to 220 puzzles. At pilot publication, all 200 previously published puzzle objects and all 100 archived originals were unchanged. The subsequent [full-catalog review](puzzle-review-2026-11-13.md) clarifies selected wording while retaining every answer placement and progress key. The new puzzles have their own IDs and revision-1 progress keys. There are three new interest collections, not a set of fifty state landing pages:

- `/geography-crosswords/`: five map/landscape puzzles and five regional US capital-city puzzles. The capitals section links directly to the five actual games. Multiword clues state when to omit spaces or supply part of a name; regional routes are puzzle groupings rather than an official regional classification.
- `/american-history-crosswords/`: five selected scenes about printing in 1776, the 1869 rail connection, letters/telegraph messages, early flight, and Erie Canal work. These do not purport to be a complete US history curriculum or experiences shared by every older reader.
- `/texas-crosswords/`: five subjects covering ranching, spring wildflowers, pecans, social dancing and a geographic road trip. The page explains that traditions and vocabulary can be shared with other places. It is an original collection, not an affiliated newspaper game or a driving itinerary.

Every added game has 10–12 clues, a board no larger than 11 × 11, a distinct introduction and solving tip, and three explanations of actual answers. The batch adds 216 entries and 60 answer explanations. The full collection has 2,467 entries, 2,467 distinct answer/clue pairs, 1,472 distinct answers, 220 distinct introductions and 660 explanations. Familiar words recur in different scenes; exact-clue and answer-set reuse are reported separately in the content audit, not treated as Google quality thresholds.

## Search evidence and limitations

The user's November 13 US bulk, broad-match, SERP and exact-URL Positions exports informed the scope. Geography, American history and state-capital queries have results for actual puzzles or collections alongside teaching resources and, in history, retail pages. Texas has a mixture of media game entries, public puzzles, teaching and single-clue queries. California and New York have substantial media/brand or single-clue ambiguity. Only exported URLs and metrics were inspected; live competitor content was not retrieved.

Useful examples are `state capital crossword puzzle` (480 / KD 6), `american history crossword puzzles` (140 / KD 3), `geography crossword puzzle` (210 / KD 8), `geography crossword puzzles` (70 / KD 7), and `texas crossword puzzle` (170 / KD 8). Singular/plural variants may overlap and are not summed into an audience count. The plural geography SERP is not silently presented as a live check of the singular term. All figures are tool estimates, not traffic promises or demographic measurements.

The two Texas Monthly Positions exports contain the same table and were counted once. AI Overview citations were excluded when comparing organic rankings. The user reported that further requested data could not be found: missing values remain unavailable rather than zero. State-level 65+ counts/shares were not retrieved successfully, so this pilot makes no claim that its state choice follows a verified senior-population ranking. Google indexing and age-specific reader preference remain unverified.

Research artifacts and source inventories are retained in the session workspace at `/workspace/artifacts/state-topic-research.md` and `/workspace/artifacts/state-research-round3/`. Uploaded workbooks are not committed to this repository.

## Editorial decisions

- Defining Texas words must survive grid selection. Source `requiredAnswers` enforces LONGHORN, BLUEBONNET, PECAN, TWOSTEP, and the road-trip anchors BIGBEND/AUSTIN. The Erie Canal subject requires ERIE/LOCK. The layout builder rejects candidates that drop these answers, and validation checks the finished games against the source requirements. Existing sources without this optional field retain their original selection behavior.
- Capital clues distinguish a capital city from a capitol building, and identify omitted spaces or name fragments. Long names are not silently truncated: for example, the Oklahoma City fragment is explicitly clued as a fragment without spelling out the answer. The board can offer map/civic words as shorter entry points.
- Historical explanations distinguish the Declaration's announcement from equal legal rights, Utah Territory in 1869 from later statehood, the flight site at Kill Devil Hills from nearby Kitty Hawk, and canal water-level control from ordinary gates. Dates and proper names are limited to the named scene rather than used as an additional trivia hurdle.
- Biology and geography wording is qualified where needed: not every river mouth has a delta, deserts are defined by dryness rather than constant heat, evening primroses differ from true primroses, and the Rio Grande forms much of the Texas boundary rather than the entire US–Mexico boundary.
- Comparisons against the existing catalog found no repeated exact answer/clue pairs. The largest newly introduced answer-set overlap in the report is 0.278 between the dance-hall puzzle and an existing social-dance puzzle, with distinct clues and scenes. This is an editorial check, not a ranking guarantee.

Reference points for continued fact review include the [National Archives Declaration transcript](https://www.archives.gov/founding-docs/declaration-transcript), [Golden Spike National Historical Park](https://www.nps.gov/gosp/learn/historyculture/index.htm), [Wright Brothers National Memorial](https://www.nps.gov/wrbr/learn/historyculture/thefirstflight.htm), [Erie Canalway](https://www.nps.gov/erie/learn/historyculture/index.htm), [Texas State Library symbols](https://www.tsl.texas.gov/ref/abouttx/symbols.html), [Big Bend National Park](https://www.nps.gov/bibe/index.htm), and [USA.gov state resources](https://www.usa.gov/states-and-territories). These reference links have not been live-checked in the restricted environment; they do not imply independent professional editorial review. Target-user feedback is still needed for clue difficulty, particularly city names and regional flower vocabulary.

## Delivery and follow-up

The new pages reuse the static collection filter, hints, local progress and browser print flow. Home and main-collection topic links expose the new entries; new games link back to their interest collection. Each actual game keeps one canonical playable URL, and print/answer copies remain noindex. The sitemap includes the three interest pages and twenty new games, bringing it to 233 canonical URLs; output is 774 HTML pages with 440 print utilities and the unchanged 100 archives.

Review real Search Console queries and reader feedback before adding more states. Do not create copies for free/printable/PDF/seniors or claim local service availability. Build and browser checks are recorded separately in `validation.md`; they do not establish live Cloudflare completion, physical printer results or Google indexing.
