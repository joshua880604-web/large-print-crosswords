export const dailyTitle='Today’s Easy Large Print Crossword — Play Free';
export const dailyDescription='Enjoy a free daily large print crossword with easy clues, optional hints, and saved progress. Play at your own pace or print a copy with answers.';

const easternDate=new Intl.DateTimeFormat('en-US',{
 timeZone:'America/New_York', year:'numeric', month:'2-digit', day:'2-digit',
});
const readableDate=new Intl.DateTimeFormat('en-US',{
 timeZone:'UTC', dateStyle:'long',
});

/** @template T @param {readonly T[]} puzzles @param {Date} [now] */
export function dailySelection(puzzles,now=new Date()){
 const parts=Object.fromEntries(easternDate.formatToParts(now).map(({type,value})=>[type,value]));
 const date=`${parts.year}-${parts.month}-${parts.day}`;
 const timestamp=Date.parse(`${date}T00:00:00Z`);
 const day=Math.floor(timestamp/86_400_000);
 const index=((day%puzzles.length)+puzzles.length)%puzzles.length;
 return {date,readable:readableDate.format(timestamp),puzzle:puzzles[index]};
}
