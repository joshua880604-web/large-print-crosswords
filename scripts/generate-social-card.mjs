// Generate the committed social preview locally, without remote fonts or assets.
// This is not part of the Cloudflare build; public/social-card.png ships as a static file.
import {chromium} from 'playwright';
import {readFileSync,existsSync} from 'node:fs';
const puzzle=JSON.parse(readFileSync(new URL('../src/data/puzzles.json',import.meta.url),'utf8'))[0];
const cells=new Map();
for(const entry of puzzle.entries)for(let i=0;i<entry.answer.length;i++){
 const r=entry.row+(entry.direction==='down'?i:0),c=entry.col+(entry.direction==='across'?i:0),key=`${r},${c}`;
 cells.set(key,{letter:entry.answer[i],number:i===0?entry.number:cells.get(key)?.number});
}
const grid=Array.from({length:puzzle.rows*puzzle.cols},(_,i)=>{
 const cell=cells.get(`${Math.floor(i/puzzle.cols)},${i%puzzle.cols}`);
 return `<div class="cell ${cell?'':'block'}">${cell?.number?`<small>${cell.number}</small>`:''}${cell?.letter||''}</div>`;
}).join('');
const executablePath=process.env.CHROMIUM_EXECUTABLE_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
const browser=await chromium.launch({executablePath,args:['--no-sandbox']});
try {
 const page=await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
 await page.setContent(`<!doctype html><html lang="en"><head><style>
 *{box-sizing:border-box}body{margin:0;background:#faf8f2;color:#263e36;font-family:Georgia,serif;width:1200px;height:630px;overflow:hidden}.brand{position:absolute;top:53px;left:62px;font:600 17px Arial,sans-serif;letter-spacing:3px;display:flex;align-items:center;gap:18px}.mark{width:45px;height:45px;background:#254c40;color:#faf8f2;font:32px Georgia;display:grid;place-items:center;transform:rotate(-7deg)}h1{position:absolute;left:62px;top:142px;font-weight:400;font-size:76px;letter-spacing:-3px;line-height:1.08;margin:0}h1 em{color:#a94b30;font-weight:400}.sub{position:absolute;left:65px;top:405px;font:24px/1.6 Arial,sans-serif;margin:0}.bottom{position:absolute;bottom:0;left:0;width:100%;height:57px;background:#254c40;color:#faf8f2;padding:17px 63px;font:18px Arial,sans-serif;letter-spacing:.5px}.bottom span{float:right}.circle{position:absolute;right:20px;top:60px;width:450px;height:450px;background:#e7eadf;border-radius:50%}.paper{position:absolute;right:73px;top:93px;width:342px;background:#fffdf7;padding:23px;transform:rotate(-7deg);box-shadow:0 12px 25px #203b2720;border:1px solid #e5e1d4}.paper h2{font-size:29px;line-height:1.2;font-weight:400;margin:15px 0 20px}.paper>span{font:9px Arial;letter-spacing:2px}.grid{display:grid;grid-template-columns:repeat(${puzzle.cols},1fr);aspect-ratio:${puzzle.cols}/${puzzle.rows};gap:1px;background:#3b5147;border:1px solid #3b5147}.cell{background:#fffdf7;position:relative;font:20px Georgia;display:grid;place-content:center}.block{background:#3b5147}.cell small{position:absolute;top:1px;left:2px;font:7px Arial}.paper p{font:10px Arial;letter-spacing:2px;margin:17px 0 0}.note{position:absolute;top:464px;right:37px;background:#f1e3c9;padding:17px 22px;transform:rotate(5deg);font:italic 23px Georgia;color:#254c40}
 </style></head><body><div class="brand"><span class="mark">L</span>LARGE PRINT CROSSWORDS</div><div class="circle"></div><h1>Big letters.<br/>Little victories.<br/><em>Your own pace.</em></h1><p class="sub">Free, easy crosswords.<br/>Play online or print a page.</p><div class="paper"><span>YOUR NEXT LITTLE BREAK</span><h2>A little time<br/>in the garden.</h2><div class="grid">${grid}</div><p>CLEAR CLUES. EVERYDAY ENJOYMENT.</p></div><div class="note">Just add a little curiosity.</div><div class="bottom">largeprintcrosswords.com<span>No timer. No account.</span></div></body></html>`);
 await page.screenshot({path:new URL('../public/social-card.png',import.meta.url).pathname});
 console.log('Generated public/social-card.png (1200 × 630)');
} finally {await browser.close();}
