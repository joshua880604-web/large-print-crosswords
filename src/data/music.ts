import puzzles from './puzzles.json';
const originalSeries=new Set(['music-memories','american-music','instrument-families','dance-and-song']);
export const musicPuzzles=puzzles.filter(p=>p.theme==='Music'||originalSeries.has(p.series));
export const musicPuzzleIds=new Set(musicPuzzles.map(p=>p.id));
