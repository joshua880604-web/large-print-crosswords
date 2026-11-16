import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {releaseScope} from './release-scope.mjs';
const base=new URL(process.argv[2]||'http://127.0.0.1:4323');
assert.ok(['127.0.0.1','localhost','[::1]'].includes(base.hostname));
const directory=resolve(process.argv[3]||'/tmp/lpc-expansion-mobile');mkdirSync(directory,{recursive:true});
const puzzles=releaseScope().puzzles;
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const results=[];let cursor=0;
const report=()=>writeFileSync(join(directory,'results.json'),JSON.stringify({expected:puzzles.length,checked:results.length,failures:results.filter(r=>r.error),results},null,2)+'\n');
async function worker(){
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),page=await context.newPage();
 try{while(cursor<puzzles.length){
  const index=cursor++,puzzle=puzzles[index];
  try{
   const response=await page.goto(new URL(`/crosswords/${puzzle.id}/`,base).href);assert.equal(response.status(),200);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Page-wide horizontal overflow');
   await page.locator('.cell input').first().tap();
   await page.locator('.puzzle-keyboard').waitFor({state:'visible'});
   await page.waitForFunction(()=>{const cell=document.querySelector('.cell.selected')?.getBoundingClientRect(),keys=document.querySelector('.puzzle-keyboard')?.getBoundingClientRect();return cell&&keys&&cell.top>=-1&&cell.bottom<=keys.top+1;},{},{timeout:5000});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Keyboard causes horizontal overflow');
   if(['garden-cutting-table-3','bible-meals-and-celebration-3','classic-movie-settings-3','flowers-at-home','bible-helping-hands-5','crafts-from-paper-5'].includes(puzzle.id))await page.screenshot({path:join(directory,`${puzzle.id}.png`),fullPage:true});
   results.push({id:puzzle.id,pageFits:true,keyboardFits:true,activeCellVisible:true});
  }catch(error){results.push({id:puzzle.id,error:String(error.stack||error)});report();throw error;}
  if(results.length%50===0){report();console.log(`Checked ${results.length}/${puzzles.length} mobile games`);}
 }}finally{await context.close();}
}
try{await Promise.all([worker(),worker()]);report();assert.equal(results.length,puzzles.length);console.log(`PASS: all ${puzzles.length} new games fit a 390px viewport with active cell above the touch keyboard.`);}
finally{await browser.close();}
