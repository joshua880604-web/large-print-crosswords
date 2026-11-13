// Exercise every generated board through its real keyboard and save/reload flow.
// Run against a local production preview; this is separate from editorial review.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {originals} from './editorial-data.mjs';

const puzzles=JSON.parse(readFileSync(new URL('../src/data/puzzles.json',import.meta.url),'utf8'));
const corrections=JSON.parse(readFileSync(new URL('../src/data/archive-clue-clarifications.json',import.meta.url),'utf8'));
const base=new URL(process.argv[2]||'http://127.0.0.1:4323');
assert.ok(['127.0.0.1','localhost','[::1]'].includes(base.hostname),'Use a local production preview');
const output=resolve(process.argv[3]||'/tmp/lpc-playthrough-audit.json');mkdirSync(dirname(output),{recursive:true});
const cases=[...puzzles.map(puzzle=>({puzzle,archive:false})),...originals.map(puzzle=>({puzzle,archive:true}))];
const results=[];let cursor=0;
const report=()=>writeFileSync(output,JSON.stringify({expected:cases.length,checked:results.length,complete:results.filter(r=>!r.error).length,failures:results.filter(r=>r.error),results:[...results].sort((a,b)=>a.index-b.index)},null,2)+'\n');
// A display may sort clues; physical positions and their labels must stay equal.
const placement=entries=>entries.map(({answer,number,row,col,direction})=>({answer,number,row,col,direction})).sort((a,b)=>a.number-b.number||a.direction.localeCompare(b.direction));
const browser=await chromium.launch({executablePath:process.env.LPC_CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
async function worker(){
 const context=await browser.newContext({viewport:{width:1120,height:1000}}),page=await context.newPage();
 page.setDefaultTimeout(10000);
 try{
  while(cursor<cases.length){
   const index=cursor++,{puzzle,archive}=cases[index],path=`/crosswords/${puzzle.id}/${archive?'previous/':''}`;
   try{
    await page.goto(new URL(path,base).href);
    const root=page.locator('.game-root');await root.waitFor();
    const actual=await root.evaluate(el=>JSON.parse(el.dataset.puzzle));
    assert.deepEqual(placement(actual.entries),placement(puzzle.entries),`${path}: board changed`);
    for(const entry of puzzle.entries){
     const correction=archive&&corrections.find(c=>c.answer===entry.answer&&c.originalClue===entry.clue);
     const clue=correction?correction.clue:entry.clue;
     const button=page.locator(`[data-entry="${entry.number}-${entry.direction}"]`);
     assert.ok((await button.innerText()).includes(clue),`${path}: rendered clue differs`);
     await button.click();await page.locator(`[data-cell="${entry.row},${entry.col}"] input`).focus();
     await page.keyboard.type(entry.answer);
    }
    assert.equal(await page.locator('.game-complete').isVisible(),true,`${path}: no completion`);
    const answerMap={};
    for(const entry of puzzle.entries)for(let i=0;i<entry.answer.length;i++)answerMap[`${entry.row+(entry.direction==='down'?i:0)},${entry.col+(entry.direction==='across'?i:0)}`]=entry.answer[i];
    const key=`lpc:v1:${puzzle.id}${puzzle.revision?`:edition:${puzzle.revision}`:''}`;
    assert.deepEqual(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key),answerMap,`${path}: saved letters differ`);
    await page.reload();await page.locator('.game-complete').waitFor({state:'visible'});
    const restored=await page.locator('.cell input').evaluateAll(inputs=>Object.fromEntries(inputs.map(el=>[`${el.dataset.row},${el.dataset.col}`,el.value])));
    assert.deepEqual(restored,answerMap,`${path}: restored letters differ`);
    results.push({index,id:puzzle.id,archive,entries:puzzle.entries.length,cells:Object.keys(answerMap).length,completed:true,restored:true});
    if(results.length%20===0){report();console.log(`Completed and restored ${results.length}/${cases.length} boards`);}
   }catch(error){results.push({index,id:puzzle.id,archive,error:String(error.stack||error)});report();throw error;}
  }
 }finally{await context.close();}
}
try{await Promise.all([worker(),worker()]);report();console.log(`PASS: ${results.length} boards completed through keyboard input and restored from saved progress. ${output}`);}
finally{await browser.close();}
