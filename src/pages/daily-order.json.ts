import puzzles from '../data/puzzles.json';

export function GET(){
 return Response.json(puzzles.map(puzzle=>puzzle.id));
}
