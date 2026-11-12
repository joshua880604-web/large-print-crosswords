// Editorial review signals, not a prediction of Google's quality classification.
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const puzzles=read('../src/data/puzzles.json');
const originals=read('../src/data/archives/gardening-originals.json');
const pairKey=e=>`${e.answer}\u0000${e.clue}`;
const base=p=>p.series||p.id.replace(/-\d+$/,'');
function counts(values){const map=new Map();for(const v of values)map.set(v,(map.get(v)||0)+1);return map;}
const entries=puzzles.flatMap(p=>p.entries);
const pairCounts=counts(entries.map(pairKey));
const intros=counts(puzzles.map(p=>p.description));
const sets=new Map(puzzles.map(p=>[p.id,new Set(p.entries.map(pairKey))]));
const answerSets=new Map(puzzles.map(p=>[p.id,new Set(p.entries.map(e=>e.answer))]));
const fingerprints=new Set();
for(const p of puzzles){const fingerprint=[...sets.get(p.id)].sort().join('\n');assert.ok(!fingerprints.has(fingerprint),`Identical entire clue set: ${p.id}`);fingerprints.add(fingerprint);}
const overlap=[],answerOverlap=[];
for(let i=0;i<puzzles.length;i++)for(let j=i+1;j<puzzles.length;j++){
 const a=puzzles[i],b=puzzles[j],as=sets.get(a.id),bs=sets.get(b.id);
 const shared=[...as].filter(k=>bs.has(k)).length;
 if(shared)overlap.push({first:a.id,second:b.id,sharedClues:shared,jaccard:Number((shared/(as.size+bs.size-shared)).toFixed(3)),sameSeries:base(a)===base(b)});
 const aw=answerSets.get(a.id),bw=answerSets.get(b.id),sharedWords=[...aw].filter(word=>bw.has(word));
 if(sharedWords.length)answerOverlap.push({first:a.id,second:b.id,sharedAnswers:sharedWords,jaccard:Number((sharedWords.length/(aw.size+bw.size-sharedWords.length)).toFixed(3)),sameSeries:base(a)===base(b)});
}
overlap.sort((a,b)=>b.jaccard-a.jaccard||b.sharedClues-a.sharedClues||a.first.localeCompare(b.first)||a.second.localeCompare(b.second));
answerOverlap.sort((a,b)=>b.jaccard-a.jaccard||b.sharedAnswers.length-a.sharedAnswers.length||a.first.localeCompare(b.first)||a.second.localeCompare(b.second));
const series=[...new Set(puzzles.map(base))].map(id=>{
 const group=puzzles.filter(p=>base(p)===id),es=group.flatMap(p=>p.entries);
 const matches=overlap.filter(o=>group.some(p=>p.id===o.first)&&group.some(p=>p.id===o.second));
 const answerMatches=answerOverlap.filter(o=>group.some(p=>p.id===o.first)&&group.some(p=>p.id===o.second));
 return {id,puzzles:group.length,entries:es.length,uniqueAnswers:new Set(es.map(e=>e.answer)).size,uniqueCluePairs:new Set(es.map(pairKey)).size,uniqueIntroductions:new Set(group.map(p=>p.description)).size,numberedTitles:group.filter(p=>p.title.includes('— No.')).length,editedEditions:group.filter(p=>p.editorial).length,highestExactClueJaccard:matches[0]?.jaccard||0,highestAnswerJaccard:answerMatches[0]?.jaccard||0};
});
const gardening=puzzles.filter(p=>base(p)==='garden-days');
assert.equal(gardening.length,5);
assert.equal(new Set(gardening.map(p=>p.title)).size,5);
assert.equal(new Set(gardening.map(p=>p.description)).size,5);
assert.ok(gardening.every(p=>p.editorial&&p.revision===2&&!p.title.includes('— No.')));
const editedPairs=gardening.flatMap(p=>p.entries.map(pairKey));
assert.equal(new Set(editedPairs).size,editedPairs.length,'Current gardening subjects must not repeat identical answer/clue pairs');
const before=originals.flatMap(p=>p.entries);
const report={
 note:'Counts and similarity are internal editorial signals, not Google thresholds or a guarantee of indexation. Repeated familiar words can be appropriate; examine context and complete puzzles.',
 collection:{puzzles:puzzles.length,clueEntries:entries.length,distinctAnswers:new Set(entries.map(e=>e.answer)).size,distinctAnswerCluePairs:pairCounts.size,distinctIntroductions:intros.size,numberedTitles:puzzles.filter(p=>p.title.includes('— No.')).length,editedEditions:puzzles.filter(p=>p.editorial).length},
 gardeningBefore:{entries:before.length,distinctAnswers:new Set(before.map(e=>e.answer)).size,distinctAnswerCluePairs:new Set(before.map(pairKey)).size,distinctIntroductions:new Set(originals.map(p=>p.description)).size},
 gardeningAfter:series.find(s=>s.id==='garden-days'),
 repeatedIntroductions:[...intros].filter(([,n])=>n>1).map(([text,pages])=>({pages,puzzles:puzzles.filter(p=>p.description===text).map(p=>p.id)})),
 repeatedClues:[...pairCounts].filter(([,n])=>n>1).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,20).map(([key,occurrences])=>{const [answer,clue]=key.split('\u0000');return {answer,clue,occurrences};}),
 highestOverlapPairs:overlap.slice(0,20),highestAnswerOverlapPairs:answerOverlap.slice(0,20),series
};
console.log(`CONTENT: ${report.collection.puzzles} puzzles; ${entries.length} entries; ${pairCounts.size} distinct answer/clue pairs; ${intros.size} distinct introductions. Gardening: ${before.length} → ${report.gardeningAfter.entries} entries, ${report.gardeningBefore.distinctAnswerCluePairs} → ${report.gardeningAfter.uniqueCluePairs} distinct pairs. ${report.collection.numberedTitles} numbered titles remain for later editorial work.`);
if(process.argv.includes('--write')){
 writeFileSync(new URL('../docs/content-audit.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
 const md=`# Content audit\n\n${report.note}\n\n## Current collection\n\n- ${report.collection.puzzles} current puzzles; ${entries.length} clue entries.\n- ${report.collection.distinctAnswers} distinct answers; ${pairCounts.size} distinct answer/clue pairs.\n- ${intros.size} different introductions; ${report.collection.numberedTitles} numbered titles remain.\n- ${report.collection.editedEditions} editions have dedicated subject notes and answer explanations.\n\n## Gardening pilot: five stable URLs\n\n| Metric | Original five | Current five |\n| --- | ---: | ---: |\n| Clue entries | ${before.length} | ${report.gardeningAfter.entries} |\n| Distinct answer/clue pairs | ${report.gardeningBefore.distinctAnswerCluePairs} | ${report.gardeningAfter.uniqueCluePairs} |\n| Different introductions | ${report.gardeningBefore.distinctIntroductions} | ${report.gardeningAfter.uniqueIntroductions} |\n\nThe new subjects are ${gardening.map(p=>p.title).join(', ')}. The five old layouts remain available as noindex previous editions so browser-saved answers can still be used. Current editions have separate progress keys.\n\n## Next editorial queue\n\nThe other 95 current puzzles are unchanged in this pilot. Their warnings remain visible rather than being hidden by a passing site-wide quality score. Choose the next series using the table below and real user/search feedback. Similarity alone does not decide whether a page should be indexed.\n\n| Series | Entries | Distinct clue pairs | Different intros | Numbered titles |\n| --- | ---: | ---: | ---: | ---: |\n${series.map(s=>`| ${s.id} | ${s.entries} | ${s.uniqueCluePairs} | ${s.uniqueIntroductions} | ${s.numberedTitles} |`).join('\n')}\n\nSee content-audit.json for the most repeated exact clues and both exact-clue and answer-set overlap pairs. Answer-set overlap ignores clue wording, so paraphrasing clues does not hide reused vocabulary. Run npm run audit:content -- --write after editing data to refresh both reports. The production build runs the audit without modifying tracked reports.\n`;
 writeFileSync(new URL('../docs/content-audit.md',import.meta.url),md);
}
