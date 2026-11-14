import puzzles from './puzzles.json';
const thanksgivingSeries=new Set(['thanksgiving-together','thanksgiving-sides','thanksgiving-sharing']);
const winterSeries=new Set(['winter-comforts','winter-backyard','winter-weather-scenes','winter-pastimes']);
export const thanksgivingPuzzles=puzzles.filter(p=>thanksgivingSeries.has(p.series)||p.id==='holiday-table');
export const thanksgivingPuzzleIds=new Set(thanksgivingPuzzles.map(p=>p.id));
export const winterPuzzles=puzzles.filter(p=>winterSeries.has(p.series));
export const winterPuzzleIds=new Set(winterPuzzles.map(p=>p.id));
