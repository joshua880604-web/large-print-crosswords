import type {APIRoute} from 'astro';
import puzzles from '../../data/puzzles.json';
import previousEditions from '../../data/previous-editions.json';

export function getStaticPaths(){
 return [...puzzles,...previousEditions].map(puzzle=>({params:{slug:`${puzzle.id}-v${puzzle.revision||1}`},props:{puzzle}}));
}

// Decorative previews contain the board and clue numbers, never answer letters.
// External images keep all collection links/text in HTML without thousands of
// individual grid cells. Edition-specific URLs avoid reusing an older layout.
export const GET:APIRoute=({props})=>{
 const puzzle=props.puzzle as (typeof puzzles)[number];
 const cells=new Map<string,number|undefined>();
 for(const entry of puzzle.entries)for(let i=0;i<entry.answer.length;i++){
  const row=entry.row+(entry.direction==='down'?i:0),col=entry.col+(entry.direction==='across'?i:0),key=`${row},${col}`;
  cells.set(key,i===0?entry.number:cells.get(key));
 }
 const squares:string[]=[],numbers:string[]=[];
 for(const [key,number] of cells){
  const [row,col]=key.split(',').map(Number),x=col*24,y=row*24;
  squares.push(`M${x} ${y}h23v23h-23Z`);
  if(number)numbers.push(`<text x="${x+2}" y="${y+7}">${number}</text>`);
 }
 const width=puzzle.cols*24,height=puzzle.rows*24;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#3b5147"/><path fill="#fffdf7" d="${squares.join('')}"/><g fill="#34483b" font-family="Arial,Helvetica,sans-serif" font-size="6">${numbers.join('')}</g></svg>`;
 return new Response(svg,{headers:{'Content-Type':'image/svg+xml; charset=utf-8'}});
};
