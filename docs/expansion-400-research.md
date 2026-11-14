# November 14, 2026 — expansion research

The user requested 100 more independent puzzles for the site's older American audience. The collection grows from 300 to 400. Familiar adult-life scenes, direct American English clues and printable mini grids remain the content direction. Research guides priorities; it does not establish the age of the searchers.

## Supplied data

The user supplied `Christmas-crossword-puzzles_bulk_us_2026-11-14_09-24-07.xlsx` plus three US SERP URL exports for Christmas, animal and food crossword puzzles, exported on November 14. The workbook contains eight keyword rows, despite the initial request listing twelve seeds. Other seeds not appearing in this export have unknown metrics rather than an inferred zero.

| Keyword | US monthly volume estimate | KD | Interpretation |
| --- | ---: | ---: | --- |
| Christmas crossword puzzles | 480 | 20 | First seasonal collection candidate; inspect mixed audience intent |
| animal crossword puzzles | 140 | 4 | Useful subject signal; substantial teaching/ESL overlap |
| food crossword puzzles | 90 | 2 | Useful subject signal; substantial teaching/ESL overlap |
| travel crossword puzzles | 40 | 17 | Secondary subject supporting familiar transport scenes |
| classic movie crossword puzzles | 20 | Unavailable | Small measured signal; uncertainty remains |
| nature crossword puzzles | 20 | Unavailable | Broad editorial category, not a reason for many landing pages |
| bird crossword puzzles | 10 | Unavailable | Small measured signal, useful reader interest |
| hobby crossword puzzles | 0 | Unavailable | Tool estimate of zero does not establish no reader interest |

Exact supplied rows, including normalized trends, are transcribed in `semrush-2026-11-14-keywords.csv`. KD blanks are not zero. The trend arrays lack month labels, so exact peak months are not assigned from their positions. These are tool estimates, not guaranteed traffic or revenue.

## What the SERP exports show

Analysis uses rows with Type `Organic`, rather than mixing AI Overview citations and image-pack entries into an organic ranking list. Organic positions 1–10 are transcribed in `semrush-2026-11-14-serp-top10.csv`. Exported URL paths indicate likely page types; competitor pages were not live-fetched in this restricted environment, and their reader age was not measured.

- **Christmas:** the top ten include North Pole Times, Crossword Labs, My Printable Puzzles, 247 Crossword and Puzzles to Print collection/game URLs. They also include ESL worksheets, Sermons4Kids, an explicit `christmas-crossword-for-kids` page and K12Reader. The phrase supports a Christmas activity collection, but does not specifically establish a senior audience.
- **Animals:** FunTrivia and Crossword Labs lead, with a BrightSprout animal-crosswords collection. EnglishClub ESL, ISLCollective, Reading Is Fundamental, Wordwall and visual/social results also occur. A low KD is not evidence that generic animal content matches the site's adult audience.
- **Food:** Crossword Labs and a FunTrivia game appear near the top, alongside Pinterest and a book product. Explicit kids/ESL worksheet URLs, Twinkl and even a cooking YouTube channel and food-bank homepage occur in the exported top ten. Broad food queries are not a clean senior-puzzle segment.
- AI Overview citations include single-clue crossword solvers for ANIMALS or FOOD. Those are a different task from choosing and playing an original complete puzzle.

`Search Traffic` and `URL Keywords` columns describe the competing URL across its keywords; they must not be treated as traffic from this single query or as expected traffic for this site.

## Decision for this batch

Complete the 100 new playable subjects across twenty series, rather than using the largest volume as a reason for many near-identical holiday grids. The new winter-holiday group and poinsettia puzzle add six seasonal subjects. Existing Christmas games and those additions provide twelve reasonable candidates for a future focused large-print Christmas collection: five `christmas-comforts`, five `winter-holiday-crafts`, the Christmas-tree puzzle and the poinsettia puzzle.

A Christmas collection is the next seasonal candidate. Animal and food content should retain direct adult-life or natural-history scenes rather than copying classroom worksheets. Dedicated new collection pages are not part of this 100-puzzle release; all subjects are discoverable through the main directory, theme/text filters, ordinary HTML links and the sitemap. Do not create separate keyword copies for PDF, adults, seniors and answers.

The supplied bulk workbook and three SERP exports are sufficient for this batch. No further Semrush query is required now. When GSC has real reports, use sitemap status, actual queries, indexed playable URLs and exclusion reasons to guide the next round. The user's latest indexing-status report remains that the sitemap was submitted and no figures were yet available.

## Subsequent implementation

A later November 14 update implements the twelve-game Christmas collection and default 18pt printing. See `christmas-print-upgrade.md` for the final scope, validation and remaining GSC checks.
