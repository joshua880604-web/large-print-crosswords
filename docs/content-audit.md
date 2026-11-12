# Content audit

Counts and similarity are internal editorial signals, not Google thresholds or a guarantee of indexation. Repeated familiar words can be appropriate; examine context and complete puzzles.

## Current collection

- 100 current puzzles; 1259 clue entries.
- 410 distinct answers; 469 distinct answer/clue pairs.
- 24 different introductions; 76 numbered titles remain.
- 5 editions have dedicated subject notes and answer explanations.

## Gardening pilot: five stable URLs

| Metric | Original five | Current five |
| --- | ---: | ---: |
| Clue entries | 58 | 58 |
| Distinct answer/clue pairs | 21 | 58 |
| Different introductions | 1 | 5 |

The new subjects are Garden Tools, Spring Flowers, The Vegetable Patch, Backyard Wildlife, Starting from Seeds. The five old layouts remain available as noindex previous editions so browser-saved answers can still be used. Current editions have separate progress keys.

## Next editorial queue

The other 95 current puzzles are unchanged in this pilot. Their warnings remain visible rather than being hidden by a passing site-wide quality score. Choose the next series using the table below and real user/search feedback. Similarity alone does not decide whether a page should be indexed.

| Series | Entries | Distinct clue pairs | Different intros | Numbered titles |
| --- | ---: | ---: | ---: | ---: |
| garden-days | 58 | 58 | 5 | 0 |
| sunday-baking | 64 | 22 | 1 | 4 |
| backyard-birds | 67 | 21 | 1 | 4 |
| a-cup-of-comfort | 65 | 22 | 1 | 4 |
| on-the-road | 64 | 21 | 1 | 4 |
| movie-night | 65 | 22 | 1 | 4 |
| music-memories | 58 | 21 | 1 | 4 |
| by-the-sea | 64 | 25 | 1 | 4 |
| cozy-at-home | 64 | 21 | 1 | 4 |
| autumn-walk | 62 | 22 | 1 | 4 |
| holiday-table | 63 | 23 | 1 | 4 |
| a-good-book | 64 | 22 | 1 | 4 |
| our-furry-friends | 58 | 20 | 1 | 4 |
| a-stitch-in-time | 64 | 22 | 1 | 4 |
| weather-watching | 64 | 21 | 1 | 4 |
| market-morning | 65 | 21 | 1 | 4 |
| in-the-workshop | 64 | 21 | 1 | 4 |
| a-day-at-the-farm | 65 | 22 | 1 | 4 |
| game-night | 57 | 21 | 1 | 4 |
| flower-favorites | 64 | 22 | 1 | 4 |

See content-audit.json for the most repeated exact clues and both exact-clue and answer-set overlap pairs. Answer-set overlap ignores clue wording, so paraphrasing clues does not hide reused vocabulary. Run npm run audit:content -- --write after editing data to refresh both reports. The production build runs the audit without modifying tracked reports.
