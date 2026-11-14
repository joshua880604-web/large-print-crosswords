# Christmas collection and 18pt printing — November 14, 2026

The new `/christmas-crosswords/` page groups twelve existing games into greenery/decorations, sweets/miniature scenes and seasonal traditions. It has unique metadata, visible and structured breadcrumbs, text/theme filters, direct game and print links, and links from the home, main directory and printable directory. Each selected game links back to the collection. Selection is shared in `src/data/christmas.ts`. No puzzle object, answer placement, edition, archive or save key changed.

The supplied US Christmas keyword estimate (480 monthly volume, KD 20) and mixed collection/game SERP results support testing this focused seasonal entry point. They do not establish the visitors' ages or guarantee traffic. This is one collection with real games, rather than separate keyword copies for adults, seniors, free, PDF and answers.

## Printing choices

| Layout | Clue / answer-list text | Maximum grid dimension | Answer-grid letters / clue numbers | Pages per sheet route |
| --- | ---: | ---: | ---: | ---: |
| Large (default) | 18 pt | 5.4 inches | 24 pt / 10 pt | 2 |
| Compact | 13 pt | 3.6 inches | 16 pt / 7 pt | 1 |

Both use US Letter portrait at 100% scale. The large layout puts the board first and the clues or answer list on the next page, with the puzzle title repeated. Clues flow down the left column and then the right, with each clue kept together. Compact mode preserves the previous single-page format.

The size selector remembers `lpc:print-layout` when local storage is available. Explicit `?layout=large` or `?layout=compact` overrides the preference. Changing size updates the current query so reload retains that choice. Paired puzzle/answer links carry the selected layout even if storage is blocked. Canonicals remain clean and all 800 print routes remain noindex; no new route is created for a size variant.

Without JavaScript the default 18pt document remains printable from the browser menu. Size controls remain disabled with explanatory text. Printing remains the browser's Print / Save as PDF feature; the website does not host generated PDF downloads. Layout query parameters are sent as part of the page request; privacy text distinguishes them from puzzle letters, which stay in the browser.

## Validation

- Build, TypeScript and expanded SEO checks pass. There are 1,315 HTML files and 414 canonical sitemap URLs, including 400 games and six curated interest pages. All indexable pages remain reachable within two ordinary HTML-link clicks from home.
- Full browser regression: 158 checks passed, including both print sizes, query/preference/reload behavior, paired links, blocked storage, script-free large printing, Christmas links, mobile layout and accessibility scans. A final wording correction distinguishes answer-page help/footers from clue-page wording; the seven print feature checks and representative PDF exports were checked again afterward.
- Exported all 800 print routes in both layouts: 1,600 PDFs. All large versions have two US Letter pages; all compact versions have one. Extracted PDF text contains every expected clue/answer, and the clue/answer-list spans have the actual 18 pt or 13 pt size. No text lies outside the paper and no clue overlaps the footer. These checks do not replace a physical printer or target-reader test.
- Internal artifacts: `/workspace/artifacts/print18-christmas/`, including matrix exports, `print-matrix.json`, `pdf-validation.json`, regression logs and screenshots. The final wording-only correction did not change print CSS or grid geometry; representative final exports verify the corrected labels.

## Google Search Console

The sitemap URL remains `https://largeprintcrosswords.com/sitemap.xml`; its content now includes the Christmas collection. The user has submitted it, but has not supplied indexing figures. No GSC account or URL-inspection tool is connected, and the current Cloud environment does not permit production-domain fetching. Actual Google crawling/indexing is unverified. `docs/search-console.md` lists the home, Christmas collection and representative game URLs for an account-side live URL test. No Google account action or indexing request was performed by this change.
