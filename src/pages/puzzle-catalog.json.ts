import puzzles from '../data/puzzles.json';
import type {CatalogPuzzle} from '../data/catalog';

export function GET() {
 const catalog: CatalogPuzzle[] = puzzles.map(puzzle => ({
  id: puzzle.id,
  title: puzzle.title,
  description: puzzle.cardDescription || `${puzzle.entries.length} familiar clues. A little moment for you.`,
  theme: puzzle.theme,
  subtheme: puzzle.subtheme,
  series: puzzle.series,
  rows: puzzle.rows,
  cols: puzzle.cols,
  revision: puzzle.revision,
 }));
 return Response.json(catalog);
}
