# SEO review — November 13, 2026

## Verified scope

The production build has 1,014 HTML pages. Its 313 indexable canonical pages comprise 300 playable puzzles, eight primary site pages, and five curated interest collections. All 600 print copies, 100 previous editions and the missing-page template remain noindex. This review checks the generated site and a local production preview; it does not establish that Google has indexed these URLs.

| Check | Result |
| --- | --- |
| Titles and descriptions | Present on every HTML page; unique across all 313 indexable pages |
| Primary heading and language | One H1 per HTML page; en-US language and mobile viewport configured |
| Canonical and query variants | Production HTTPS URLs identify the actual page; filters and tracking parameters do not create different canonicals |
| Sitemap | Exactly matches all 313 indexable pages; no duplicates, print copies or archives |
| Robots file | Allows crawling and points to the production sitemap |
| Structured data | WebSite/WebPage data agrees with titles, descriptions and URLs; puzzle breadcrumbs agree with the visible trail |
| Social sharing | Open Graph and Twitter metadata; local 1200 × 630 image |
| Internal links and assets | Root-relative targets exist; no indexable page is orphaned; all 313 are reachable from home within two HTML-link clicks |
| Content | 300 distinct puzzle introductions, 3,360 distinct answer/clue pairs, and 900 explanations tied to actual answers; actual difficulty and reader usefulness still need reader feedback |
| Script-free discovery | Both full directories retain all 300 puzzle anchors and descriptions without JavaScript |
| Topic navigation | Sports and music games now link back to their curated collections, joining the existing geography/history/Texas links |

No meta-keyword tags, fabricated ratings, dates, or search-result promises were added. The schema describes the actual pages rather than claiming eligibility for unsupported rich results. Existing title/description lengths were also inspected; a title over an arbitrary character count is not by itself a search error.

## Directory rendering improvement

Each catalog card previously expanded its decorative crossword into individual cell and number elements. At 300 puzzles this produced an unnecessarily large directory DOM. Replaced those decorative grids with 300 prerendered SVG files at edition-specific URLs. Cards specify intrinsic dimensions and lazy loading; actual game grids and printable grids are unchanged. The SVGs show board shapes and clue numbers without answer letters.

| Page | HTML bytes before → after | Gzip bytes before → after | Elements before → after |
| --- | ---: | ---: | ---: |
| /crosswords/ | 1,419,796 → 242,316 | 50,144 → 27,814 | 39,026 → 4,001 |
| /printable/ | 1,419,756 → 242,276 | 50,127 → 27,801 | 39,023 → 3,998 |

This reduces raw HTML by about 83%, compressed HTML by about 45%, and DOM elements by about 90%, while preserving the searchable collection and crawlable links. These are build-output measurements, not field Core Web Vitals, a Lighthouse score, or a prediction of ranking.

## Verification and remaining observations

- Production build, type checking and expanded SEO audit passed. The audit now checks exact indexable canonical paths, document language, ordinary-link reachability, and compact/dimensioned directory previews.
- The SEO, collection-filter/history and topic suites passed all 14 tests, including script-free discovery of all 300 puzzles and a rectangular SVG preview's dimensions, clue numbers and successful image load.
- Desktop/mobile screenshots were visually inspected. Home, mobile layout and affected template accessibility regressions were checked separately; results are recorded in `validation.md`.
- Local artifacts: `/workspace/artifacts/seo-review-300/`, including before/after metrics, build output, browser logs and screenshots. The puzzle data, IDs, layouts, saves, print templates and advertising configuration are unchanged.
- The user reports the sitemap was just submitted and no GSC indexing data is available yet. Submission status and indexing outcomes therefore remain unverified; the sitemap address stays `https://largeprintcrosswords.com/sitemap.xml`.
- The attached environment's enforced outbound policy permits package hosts but not the production apex/www or Cloudflare Pages hosts. Live HTTP/TLS/hostname redirects, CDN headers, Googlebot access and live Core Web Vitals were not verified in this review. The policy restriction is not evidence of a public-site error. Cloudflare deployment checks can be read through the connected GitHub repository.
- When GSC reports arrive, review the sitemap fetch status and representative main/puzzle/topic URLs. Separate expected exclusions (print sheets, archives and clean canonical duplicates) from unexpected exclusions of playable puzzle pages. Daily selection rotates through the existing collection; it does not publish a new puzzle every day.
