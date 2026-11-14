import puzzles from './puzzles.json';
const series=new Set(['christmas-comforts','winter-holiday-crafts','christmas-kitchen','christmas-post-and-paper','christmas-around-the-room']);
const individual=new Set(['holiday-table-3','flowers-through-the-year-4']);
export const christmasPuzzles=puzzles.filter(p=>series.has(p.series)||individual.has(p.id));
export const christmasPuzzleIds=new Set(christmasPuzzles.map(p=>p.id));
