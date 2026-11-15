// Export the new collection's real Chromium print output, not screen snapshots.
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const base=new URL(process.argv[2]||'http://127.0.0.1:4323');
assert.ok(['127.0.0.1','localhost','[::1]'].includes(base.hostname));
const directory=resolve(process.argv[3]||'/tmp/lpc-expansion-print');mkdirSync(directory,{recursive:true});
const puzzles=JSON.parse(readFileSync(new URL('../src/data/puzzles.json',import.meta.url),'utf8')).slice(500);
assert.equal(puzzles.length,500);
const allCases=puzzles.flatMap(puzzle=>['large','compact'].flatMap(layout=>[false,true].map(answers=>({puzzle,layout,answers}))));
const key=({puzzle,layout,answers})=>`${puzzle.id}-${answers?'answers':'puzzle'}-${layout}.pdf`;
const signature=(p,answers)=>JSON.stringify({title:p.title,description:p.description,rows:p.rows,cols:p.cols,entries:p.entries.map(e=>({answer:e.answer,number:e.number,row:e.row,col:e.col,direction:e.direction,...(!answers?{clue:e.clue}:{})}))});
const results=[];let cursor=0;let cases=allCases;
if(process.argv[4]){
 const before=new Map(JSON.parse(readFileSync(resolve(process.argv[4]),'utf8')).map(p=>[p.id,p]));
 const previous=JSON.parse(readFileSync(join(directory,'exports.json'),'utf8'));
 assert.equal(previous.expected,2000);assert.equal(previous.checked,2000);assert.equal(previous.failures.length,0);
 const byFile=new Map(previous.results.map(r=>[r.file,r]));
 cases=allCases.filter(c=>{
  const old=before.get(c.puzzle.id),saved=byFile.get(key(c));
  assert.ok(old&&saved&&!saved.error&&existsSync(join(directory,saved.file)));
  assert.deepEqual(saved.expectedText,old.entries.map(e=>c.answers?e.answer:e.clue),'Baseline must match the previous export run');
  if(signature(old,c.answers)===signature(c.puzzle,c.answers)){results.push({...saved,reused:true});return false;}
  return true;
 });
 console.log(`Reusing ${results.length} unchanged sheets; refreshing ${cases.length} changed sheets.`);
}
const report=()=>writeFileSync(join(directory,'exports.json'),JSON.stringify({expected:allCases.length,checked:results.length,reused:results.filter(r=>r.reused).length,failures:results.filter(r=>r.error),results},null,2)+'\n');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
async function worker(){
 const page=await browser.newPage();
 try{while(cursor<cases.length){
  const index=cursor++,{puzzle,layout,answers}=cases[index];
  const file=`${puzzle.id}-${answers?'answers':'puzzle'}-${layout}.pdf`;
  try{
   const response=await page.goto(new URL(`/print/${puzzle.id}${answers?'-answers':''}/?layout=${layout}`,base).href);assert.equal(response.status(),200);
   await page.waitForFunction(layout=>document.querySelector('.print-workspace')?.dataset.printLayout===layout,layout);
   await page.pdf({path:join(directory,file),preferCSSPageSize:true,printBackground:true});
   results.push({id:puzzle.id,layout,answers,file,pages:layout==='large'?2:1,font:layout==='large'?18:13,title:puzzle.title,expectedText:puzzle.entries.map(e=>answers?e.answer:e.clue)});
   if(results.length%100===0){report();console.log(`Exported ${results.length}/${allCases.length}`);}
  }catch(error){results.push({id:puzzle.id,file,error:String(error.stack||error)});report();throw error;}
 }}finally{await page.close();}
}
try{await Promise.all([worker(),worker()]);report();assert.equal(results.length,allCases.length);console.log(`Exported all ${results.length} new puzzle/answer layout PDFs. Validate their physical contents with audit-expansion-pdf.py.`);}
finally{await browser.close();}
