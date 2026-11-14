import puzzles from '../data/puzzles.json';

export function GET() {
  const seriesCount = new Set(puzzles.map(puzzle => puzzle.series)).size;
  const content = `# Large Print Crosswords

> An independent collection of free American English themed mini crosswords, designed with older adults and anyone who prefers larger letters in mind. Play online or print puzzles with separate answer sheets.

The collection contains ${puzzles.length} independently playable puzzles across ${seriesCount} series. Each current puzzle has its own grid, clues, introduction, solving tip, and three optional answer explanations. Familiar vocabulary can recur across themes. Difficulty varies with the reader's interests and vocabulary.

Online play includes optional hints, larger clues and squares, and an on-screen keyboard. Sound starts off. There is no timer or required account. Puzzle progress and preferences are stored in the player's browser when local storage is available.

Printing defaults to 18pt clues and a larger grid on two US Letter pages. A compact 13pt one-page layout is also available. Puzzle and answer sheets are separate. Use portrait orientation and 100% scale; the browser's Print / Save as PDF dialog creates the PDF. The site does not provide a library of pre-generated PDF downloads.

The canonical site is https://largeprintcrosswords.com/. Individual games use permanent /crosswords/{slug}/ URLs. The daily selection rotates through the existing collection; it does not create a new puzzle each day. Collection search and theme parameters filter the same games. Print sheets and previous editions are utility copies, with their own noindex directives.

## Play and print

- [Home](https://largeprintcrosswords.com/): Introduction and links to the collection.
- [All crosswords](https://largeprintcrosswords.com/crosswords/): Browse all ${puzzles.length} games by title or theme and open their permanent pages.
- [Printable crosswords](https://largeprintcrosswords.com/printable/): Choose puzzles, open print sheets, and access separate answers.
- [Daily selection](https://largeprintcrosswords.com/daily/): A rotating choice from the existing puzzle library.
- [How to play](https://largeprintcrosswords.com/how-to-play/): Keyboard, touch, on-screen input, hints, and saved-progress instructions.

## Topic collections

- [Thanksgiving crosswords](https://largeprintcrosswords.com/thanksgiving-crosswords/): Holiday food, gatherings, side dishes, and sharing.
- [Christmas crosswords](https://largeprintcrosswords.com/christmas-crosswords/): Decorations, festive food, paper crafts, and selected Christmas traditions.
- [Winter crosswords](https://largeprintcrosswords.com/winter-crosswords/): Familiar comforts, backyard nature, weather, and winter pastimes.
- [Music crosswords](https://largeprintcrosswords.com/music-crosswords/): Singers, vocal groups, instruments, recorded sound, music basics, and American music cities.
- [Sports crosswords](https://largeprintcrosswords.com/sports-crosswords/): Familiar equipment, playing areas, and basic actions across sports.
- [Geography and state capitals](https://largeprintcrosswords.com/geography-crosswords/): American landscapes, map vocabulary, and selected state-capital routes.
- [American history crosswords](https://largeprintcrosswords.com/american-history-crosswords/): Selected scenes involving printing, transportation, communication, and invention.
- [Texas crosswords](https://largeprintcrosswords.com/texas-crosswords/): Ranching, wildflowers, food, dance halls, and a road trip.

## Site information

- [About](https://largeprintcrosswords.com/about/): Site purpose, puzzle construction, independence, and permitted printing uses.
- [Accessibility](https://largeprintcrosswords.com/accessibility/): Reading and input options, print sizes, and accessibility limitations.
- [Privacy](https://largeprintcrosswords.com/privacy/): Browser storage, hosting, and current data-handling practices.

The site is not affiliated with AARP or a newspaper puzzle publisher. Its puzzles are for entertainment, with no medical or cognitive-health claims. Personal printing and noncommercial group activities are permitted as described on the About page; that permission does not include republishing or selling the collection.

## Optional

- [XML sitemap](https://largeprintcrosswords.com/sitemap.xml): Complete canonical page inventory, including every current playable puzzle. Print sheets and previous editions are excluded.
`;
  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
