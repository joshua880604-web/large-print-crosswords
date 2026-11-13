import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const puzzles=JSON.parse(readFileSync(new URL('../src/data/puzzles.json',import.meta.url),'utf8'));
import {originals,editorialSeries} from './editorial-data.mjs';
const archiveCorrections=JSON.parse(readFileSync(new URL('../src/data/archive-clue-clarifications.json',import.meta.url),'utf8'));
assert.equal(new Set(archiveCorrections.map(c=>`${c.answer}\0${c.originalClue}`)).size,archiveCorrections.length,'Unique archive correction targets');
for(const correction of archiveCorrections){assert.ok(correction.clue.trim().length>3&&correction.reason);assert.ok(originals.some(p=>p.entries.some(e=>e.answer===correction.answer&&e.clue===correction.originalClue)),'Archive clarification must match a preserved original clue');}
assert.equal(puzzles.length,editorialSeries.length*5,'Each registered series must contain five puzzles');
assert.equal(new Set(puzzles.map(p=>p.id)).size,puzzles.length,'Unique slugs');
const grids=new Set();let clueCount=0;
// Defining subject words must survive layout selection, not just exist in a pool.
for(const config of editorialSeries){
 const sources=JSON.parse(readFileSync(new URL(config.source,import.meta.url),'utf8'));
 for(const source of sources){const current=puzzles.find(p=>p.id===source.id);assert.ok(current,`${source.id}: registered subject missing`);for(const answer of source.requiredAnswers||[])assert.ok(current.entries.some(e=>e.answer===answer),`${source.id}: defining answer ${answer} missing`);}
}
for(const p of [...puzzles,...originals]){
 const map=new Map(),members=new Map(),starts=new Map(),entrySignatures=new Set();
 assert.ok(p.entries.length>=8,`${p.id}: at least eight clues`);
 assert.ok(p.rows<=13&&p.cols<=13,`${p.id}: maximum board size`);
 for(const e of p.entries){assert.match(e.answer,/^[A-Z]{3,}$/);assert.ok(e.clue.trim().length>3);assert.ok(['across','down'].includes(e.direction));
  const signature=`${e.row},${e.col},${e.direction}`;assert.ok(!entrySignatures.has(signature));entrySignatures.add(signature);
  const start=`${e.row},${e.col}`;if(starts.has(start))assert.equal(starts.get(start),e.number);else starts.set(start,e.number);
  for(let i=0;i<e.answer.length;i++){const r=e.row+(e.direction==='down'?i:0),c=e.col+(e.direction==='across'?i:0),k=`${r},${c}`;assert.ok(r>=0&&r<p.rows&&c>=0&&c<p.cols);if(map.has(k))assert.equal(map.get(k),e.answer[i],`${p.id}: crossing mismatch`);map.set(k,e.answer[i]);members.set(k,[...(members.get(k)||[]),e]);}
 }
 const numbered=[...starts.keys()].sort((a,b)=>{const [ar,ac]=a.split(',').map(Number),[br,bc]=b.split(',').map(Number);return ar-br||ac-bc;});numbered.forEach((k,i)=>assert.equal(starts.get(k),i+1,`${p.id}: numbering`));
 // Every continuous letter run of length 2+ must correspond to exactly one clue.
 for(const [k] of map){const [r,c]=k.split(',').map(Number);for(const d of ['across','down']){const dr=d==='down'?1:0,dc=d==='across'?1:0;if(map.has(`${r-dr},${c-dc}`))continue;let run='',i=0;while(map.has(`${r+dr*i},${c+dc*i}`)){run+=map.get(`${r+dr*i},${c+dc*i}`);i++;}if(run.length>1){const e=p.entries.find(e=>e.row===r&&e.col===c&&e.direction===d);assert.ok(e,`${p.id}: unclued ${d} run at ${k}`);assert.equal(e.answer,run);}}}
 // Ensure all entries are joined through crossings, with no isolated words.
 const seen=new Set([p.entries[0]]),queue=[p.entries[0]];
 while(queue.length){const e=queue.shift();for(const group of members.values()){if(group.includes(e))for(const other of group)if(!seen.has(other)){seen.add(other);queue.push(other);}}}
 assert.equal(seen.size,p.entries.length,`${p.id}: disconnected grid`);
 const fingerprint=JSON.stringify([...map].sort());assert.ok(!grids.has(fingerprint),`${p.id}: duplicate board`);grids.add(fingerprint);if(puzzles.includes(p))clueCount+=p.entries.length;
 if(p.editorial){
  assert.ok(p.revision>=1&&p.subtheme&&p.cardDescription,'Editorial puzzles need an edition and subject');
  assert.ok(p.rows<=11&&p.cols<=11&&p.entries.length<=12,'Edited themed puzzles keep a compact, readable board');
  assert.ok(p.editorial.focus&&p.editorial.solvingTip);
  assert.equal(p.editorial.answerNotes.length,3);
  assert.equal(new Set(p.editorial.answerNotes.map(n=>n.answer)).size,3);
  for(const note of p.editorial.answerNotes){assert.ok(p.entries.some(e=>e.answer===note.answer),'Notes must describe actual answers');assert.ok(note.text.trim().length>20);}
 }
}
// Within a five-puzzle series, require meaningful differences in the answer sets.
for(let i=0;i<puzzles.length;i++)for(let j=i+1;j<puzzles.length;j++){
 const a=puzzles[i],b=puzzles[j];if(a.id.replace(/-\d+$/,'')!==b.id.replace(/-\d+$/,''))continue;
 const as=new Set(a.entries.map(e=>e.answer)),bs=new Set(b.entries.map(e=>e.answer));const overlap=[...as].filter(x=>bs.has(x)).length;assert.ok(as.size-overlap>=3&&bs.size-overlap>=3,'Series needs at least three different answers each');assert.ok(overlap/(as.size+bs.size-overlap)<=.60,'Series overlap threshold');
}
for(const old of originals){const current=puzzles.find(p=>p.id===old.id);assert.ok(current?.revision>=2,'Every archived layout has a current edition');assert.ok(!old.revision,'Originals retain their legacy progress key');}
console.log(`PASS: ${puzzles.length} unique, connected puzzles; ${clueCount} clues; matching crossings, complete clues, valid numbering, bounds, and series variation; ${originals.length} preserved legacy layouts validated.`);
