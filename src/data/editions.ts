import previousEditions from './previous-editions.json';
import series from './editorial-series.json';

const legacySeries=new Set(series.filter(item=>'archive' in item).map(item=>item.id));

export function previousEditionLinks(puzzle:{id:string;revision?:number}) {
  if(!puzzle.revision)return [];
  const baseKey=`lpc:v1:${puzzle.id}`;
  const saved=previousEditions
    .filter(old=>old.id===puzzle.id&&old.revision<puzzle.revision!)
    .sort((a,b)=>b.revision-a.revision)
    .map(old=>({storageKey:`${baseKey}:edition:${old.revision}`,href:`/crosswords/${old.id}/editions/${old.revision}/`,edition:String(old.revision)}));
  if(puzzle.revision>1&&legacySeries.has(puzzle.id.replace(/-\d+$/,''))) {
    saved.push({storageKey:baseKey,href:`/crosswords/${puzzle.id}/previous/`,edition:'original'});
  }
  return saved;
}
