// Editorial review signals, not a prediction of Google's quality classification.
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const puzzles=read('../src/data/puzzles.json');
import {originals,editorialSeries} from './editorial-data.mjs';
const pairKey=e=>`${e.answer}\u0000${e.clue}`;
const base=p=>p.series||p.id.replace(/-\d+$/,'');
function counts(values){const map=new Map();for(const v of values)map.set(v,(map.get(v)||0)+1);return map;}
const entries=puzzles.flatMap(p=>p.entries);
const pairCounts=counts(entries.map(pairKey));
const intros=counts(puzzles.map(p=>p.description));
const sets=new Map(puzzles.map(p=>[p.id,new Set(p.entries.map(pairKey))]));
const answerSets=new Map(puzzles.map(p=>[p.id,new Set(p.entries.map(e=>e.answer))]));
const selfAnswerClues=puzzles.flatMap(p=>p.entries.filter(e=>new RegExp(`\\b${e.answer}\\b`,'i').test(e.clue)).map(e=>({puzzle:p.id,answer:e.answer,clue:e.clue,edited:Boolean(p.editorial)})));
assert.ok(!selfAnswerClues.some(item=>item.edited),'Edited clues must not spell out their own answer');
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
const refinedSeries=editorialSeries.map(config=>{
 const current=puzzles.filter(p=>base(p)===config.id);
 const previous=originals.filter(p=>base(p)===config.id);
 assert.equal(current.length,5);assert.equal(previous.length,config.archive?5:0);
 assert.equal(new Set(current.map(p=>p.title)).size,5);
 assert.equal(new Set(current.map(p=>p.description)).size,5);
 assert.ok(current.every(p=>p.editorial&&p.revision===(config.revision||2)&&!p.title.includes('— No.')));
 const pairs=current.flatMap(p=>p.entries.map(pairKey));
 assert.equal(new Set(pairs).size,pairs.length,`Edited ${config.id} subjects must not repeat identical answer/clue pairs`);
 const es=previous.flatMap(p=>p.entries);
 return {id:config.id,name:config.name,before:{puzzles:previous.length,entries:es.length,uniqueAnswers:new Set(es.map(e=>e.answer)).size,uniqueCluePairs:new Set(es.map(pairKey)).size,uniqueIntroductions:new Set(previous.map(p=>p.description)).size},after:series.find(s=>s.id===config.id),subjects:current.map(p=>p.title)};
});
const report={
 note:'Counts and similarity are internal editorial signals, not Google thresholds or a guarantee of indexation. Repeated familiar words can be appropriate; examine context and complete puzzles.',
 collection:{puzzles:puzzles.length,clueEntries:entries.length,distinctAnswers:new Set(entries.map(e=>e.answer)).size,distinctAnswerCluePairs:pairCounts.size,distinctIntroductions:intros.size,numberedTitles:puzzles.filter(p=>p.title.includes('— No.')).length,editedEditions:puzzles.filter(p=>p.editorial).length},
 refinedSeries,selfAnswerClues,
 repeatedIntroductions:[...intros].filter(([,n])=>n>1).map(([text,pages])=>({pages,puzzles:puzzles.filter(p=>p.description===text).map(p=>p.id)})),
 repeatedClues:[...pairCounts].filter(([,n])=>n>1).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,20).map(([key,occurrences])=>{const [answer,clue]=key.split('\u0000');return {answer,clue,occurrences};}),
 highestOverlapPairs:overlap.slice(0,20),highestAnswerOverlapPairs:answerOverlap.slice(0,20),series
};
console.log(`CONTENT: ${report.collection.puzzles} puzzles; ${entries.length} entries; ${pairCounts.size} distinct answer/clue pairs; ${intros.size} distinct introductions; ${report.collection.editedEditions} edited editions. ${report.collection.numberedTitles} numbered titles remain.`);
for(const group of refinedSeries)console.log(group.before.puzzles?`${group.name}: ${group.before.entries} → ${group.after.entries} entries; ${group.before.uniqueCluePairs} → ${group.after.uniqueCluePairs} distinct answer/clue pairs.`:`${group.name}: ${group.after.entries} first-edition entries; ${group.after.uniqueCluePairs} distinct answer/clue pairs.`);
if(process.argv.includes('--write')){
 writeFileSync(new URL('../docs/content-audit.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
 const blocks=refinedSeries.map(group=>group.before.puzzles?`## ${group.name}: five stable URLs\n\n| Metric | Original five | Current five |\n| --- | ---: | ---: |\n| Clue entries | ${group.before.entries} | ${group.after.entries} |\n| Distinct answer/clue pairs | ${group.before.uniqueCluePairs} | ${group.after.uniqueCluePairs} |\n| Different introductions | ${group.before.uniqueIntroductions} | ${group.after.uniqueIntroductions} |\n\nCurrent subjects: ${group.subjects.join(', ')}.\n`:`## ${group.name}: five first editions\n\n- ${group.after.entries} clues; ${group.after.uniqueCluePairs} distinct answer/clue pairs.\n- Five distinct introductions and three answer explanations per puzzle.\n\nSubjects: ${group.subjects.join(', ')}.\n`).join('\n');
 const remaining=puzzles.length-report.collection.editedEditions;
 const reviewHeading=remaining?'## Next editorial queue':'## Ongoing editorial review';
 const reviewText=remaining?`${remaining} current puzzles still await this editorial treatment. Use the table and reader/search feedback to choose the next series. Similarity alone does not decide indexing.`:`All ${puzzles.length} current puzzles have dedicated editorial content. Continue reviewing clue clarity and difficulty with reader feedback. Exact-clue and answer overlap remain review signals, not indexing rules.`;
 const md=`# Content audit\n\n${report.note}\n\n## Current collection\n\n- ${report.collection.puzzles} current puzzles; ${entries.length} clue entries.\n- ${report.collection.distinctAnswers} distinct answers; ${pairCounts.size} distinct answer/clue pairs.\n- ${intros.size} different introductions; ${report.collection.numberedTitles} numbered titles remain.\n- ${report.collection.editedEditions} editions have dedicated subject notes and answer explanations.\n\n${blocks}\nThe ${originals.length} original layouts remain available as noindex previous editions so browser-saved answers can still be used. Current editions have separate progress keys.\n\n${reviewHeading}\n\n${reviewText}\n\n| Series | Entries | Distinct clue pairs | Different intros | Numbered titles |\n| --- | ---: | ---: | ---: | ---: |\n${series.map(s=>`| ${s.id} | ${s.entries} | ${s.uniqueCluePairs} | ${s.uniqueIntroductions} | ${s.numberedTitles} |`).join('\n')}\n\nSee content-audit.json for the most repeated exact clues and both exact-clue and answer-set overlap pairs. Answer-set overlap ignores clue wording, so paraphrasing clues does not hide reused vocabulary. Run npm run audit:content -- --write after editing data to refresh both reports. The report also lists clues that spell out their own answer; edited editions fail this check until corrected. The production build runs the audit without modifying tracked reports.\n`;
 writeFileSync(new URL('../docs/content-audit.md',import.meta.url),md);
}
