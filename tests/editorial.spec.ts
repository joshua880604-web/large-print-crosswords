import {test,expect} from '@playwright/test';
import puzzles from '../src/data/puzzles.json' with {type:'json'};
import gardeningOriginals from '../src/data/archives/gardening-originals.json' with {type:'json'};
import birdOriginals from '../src/data/archives/birds-originals.json' with {type:'json'};
import musicOriginals from '../src/data/archives/music-originals.json' with {type:'json'};
import marketOriginals from '../src/data/archives/market-originals.json' with {type:'json'};
import travelOriginals from '../src/data/archives/travel-originals.json' with {type:'json'};
import homeOriginals from '../src/data/archives/home-originals.json' with {type:'json'};
import farmOriginals from '../src/data/archives/farm-originals.json' with {type:'json'};
import bakingOriginals from '../src/data/archives/baking-originals.json' with {type:'json'};
import craftsOriginals from '../src/data/archives/crafts-originals.json' with {type:'json'};
import flowersOriginals from '../src/data/archives/flowers-originals.json' with {type:'json'};
import petsOriginals from '../src/data/archives/pets-originals.json' with {type:'json'};
import drinksOriginals from '../src/data/archives/drinks-originals.json' with {type:'json'};
import moviesOriginals from '../src/data/archives/movies-originals.json' with {type:'json'};
import seasideOriginals from '../src/data/archives/seaside-originals.json' with {type:'json'};
import autumnOriginals from '../src/data/archives/autumn-originals.json' with {type:'json'};
import holidaysOriginals from '../src/data/archives/holidays-originals.json' with {type:'json'};
import readingOriginals from '../src/data/archives/reading-originals.json' with {type:'json'};
import weatherOriginals from '../src/data/archives/weather-originals.json' with {type:'json'};
import workshopOriginals from '../src/data/archives/workshop-originals.json' with {type:'json'};
import gamesOriginals from '../src/data/archives/games-originals.json' with {type:'json'};
import editorialSeries from '../src/data/editorial-series.json' with {type:'json'};
import archiveCorrections from '../src/data/archive-clue-clarifications.json' with {type:'json'};
const originals=[...gardeningOriginals,...birdOriginals,...musicOriginals,...marketOriginals,...travelOriginals,...homeOriginals,...farmOriginals,...bakingOriginals,...craftsOriginals,...flowersOriginals,...petsOriginals,...drinksOriginals,...moviesOriginals,...seasideOriginals,...autumnOriginals,...holidaysOriginals,...readingOriginals,...weatherOriginals,...workshopOriginals,...gamesOriginals];

const edited=puzzles.filter(p=>'revision' in p);

for(const correction of archiveCorrections)test(`archive definition ${correction.answer} is clarified without losing its original saved board`,async({page})=>{
 const old=originals.find(p=>p.entries.some(e=>e.answer===correction.answer&&e.clue===correction.originalClue))!;
 const entry=old.entries.find(e=>e.answer===correction.answer&&e.clue===correction.originalClue)!;
 const key=`lpc:v1:${old.id}`,cell=`${entry.row},${entry.col}`,saved=JSON.stringify({[cell]:entry.answer[0]});
 await page.goto(`/crosswords/${old.id}/previous/`);
 await page.evaluate(({key,saved})=>localStorage.setItem(key,saved),{key,saved});await page.reload();
 await expect(page.locator(`[data-cell="${cell}"] input`)).toHaveValue(entry.answer[0]);
 await expect(page.locator(`[data-entry="${entry.number}-${entry.direction}"]`)).toContainText(correction.clue);
 const actual=await page.locator('.game-root').evaluate(el=>JSON.parse((el as HTMLElement).dataset.puzzle!));
 const placement=(entries:typeof old.entries)=>entries.map(e=>[e.answer,e.number,e.row,e.col,e.direction]);
 expect(placement(actual.entries)).toEqual(placement(old.entries));
 expect(await page.evaluate(key=>localStorage.getItem(key),key)).toBe(saved);
 await page.getByText('About the clarified clue wording',{exact:true}).click();
 await expect(page.locator('.answer-details')).toContainText(correction.originalClue);
 await expect(page.locator('.answer-details')).toContainText(correction.reason);
});

test('edited subjects have distinct reader notes and hidden answer explanations',async({page})=>{
 test.setTimeout(180_000); // Visit every subject in the complete collection.
 expect(edited).toHaveLength(editorialSeries.length*5);
 for(const puzzle of edited){
  await page.goto(`/crosswords/${puzzle.id}/`);
  await expect(page.getByRole('heading',{level:1})).toHaveText(puzzle.title);
  await expect(page.locator('.puzzle-notes')).toContainText(puzzle.editorial!.focus);
  await expect(page.locator('.puzzle-notes')).toContainText(puzzle.editorial!.solvingTip);
  await expect(page.locator('.answer-explanations dt')).toHaveCount(3);
  await expect(page.locator('.answer-explanations dd').first()).toBeHidden();
  await page.getByText('A closer look at three answers (spoilers)',{exact:true}).click();
  for(const note of puzzle.editorial!.answerNotes){expect(puzzle.entries.some(e=>e.answer===note.answer)).toBeTruthy();await expect(page.locator('.answer-explanations')).toContainText(note.text);}
 }
});

for(const series of editorialSeries.filter(series=>'archive' in series)){
test(`refreshed ${series.id} retains the original saved game and isolates new progress`,async({page})=>{
 const old=originals.find(p=>p.id===series.id)!,fresh=puzzles.find(p=>p.id===old.id)!;
 const legacyKey=`lpc:v1:${old.id}`,currentKey=`${legacyKey}:edition:2`;
 const oldEntry=old.entries.find(e=>e.direction==='across')!;
 const oldCell=`${oldEntry.row},${oldEntry.col}`;
 const oldValues=JSON.stringify({[oldCell]:oldEntry.answer[0]});
 await page.goto(`/crosswords/${old.id}/`);await page.evaluate(({key,value})=>localStorage.setItem(key,value),{key:legacyKey,value:oldValues});
 await page.reload();
 await expect(page.getByRole('link',{name:'Continue your previous puzzle'})).toBeVisible();
 expect(await page.locator('.cell input').evaluateAll(elements=>elements.every(el=>(el as HTMLInputElement).value===''))).toBeTruthy();
 const freshEntry=fresh.entries.find(e=>e.direction==='across')!;
 await page.locator(`[data-entry="${freshEntry.number}-across"]`).click();await page.keyboard.type(freshEntry.answer[0]);
 const savedCurrent=await page.evaluate(key=>localStorage.getItem(key),currentKey);
 expect(savedCurrent).not.toBeNull();expect(await page.evaluate(key=>localStorage.getItem(key),legacyKey)).toBe(oldValues);
 await page.getByRole('link',{name:'Continue your previous puzzle'}).click();
 await expect(page).toHaveURL(new RegExp(`/crosswords/${old.id}/previous/$`));
 await expect(page.locator(`[data-cell="${oldCell}"] input`)).toHaveValue(oldEntry.answer[0]);
 await page.locator(`[data-entry="${oldEntry.number}-across"]`).click();await page.keyboard.type('Z');
 expect(await page.evaluate(key=>localStorage.getItem(key),currentKey)).toBe(savedCurrent);
 expect(await page.evaluate(key=>localStorage.getItem(key),legacyKey)).not.toBe(oldValues);
 await page.getByRole('link',{name:`Try ${fresh.title}`,exact:true}).click();
 await expect(page.locator(`[data-cell="${freshEntry.row},${freshEntry.col}"] input`)).toHaveValue(freshEntry.answer[0]);
});

}

test('previous editions remain reachable but are not index targets',async({page,request})=>{
 test.setTimeout(120_000); // Verify all 100 preserved original routes.
 const sitemap=await (await request.get('/sitemap.xml')).text();
 for(const old of originals){
  await page.goto(`/crosswords/${old.id}/previous/`);
  await expect(page.locator('meta[name=robots]')).toHaveAttribute('content','noindex,follow');
  await expect(page.locator('.game-root')).toBeVisible();
  expect(sitemap).not.toContain(`/crosswords/${old.id}/previous/`);
 }
});

test('printed rectangular grids keep their proportions without covering clues',async({page})=>{
 await page.goto('/print/garden-days/');await page.emulateMedia({media:'print'});
 const layout=await page.evaluate(()=>{
  const grid=document.querySelector('.print-board .mini-grid')!.getBoundingClientRect();
  const clues=document.querySelector('.print-clues')!.getBoundingClientRect();
  const paragraph=document.querySelector('.print-clues p')!;
  return {gridBottom:grid.bottom,cluesTop:clues.top,gridHeight:grid.height,gridWidth:grid.width,fontSize:parseFloat(getComputedStyle(paragraph).fontSize)};
 });
 expect(layout.gridBottom).toBeLessThanOrEqual(layout.cluesTop);
 expect(Math.max(layout.gridHeight,layout.gridWidth)).toBeLessThanOrEqual(3.6*96+1);
 expect(layout.fontSize).toBeGreaterThanOrEqual(17);
});

test('first editions save independently without a nonexistent previous-edition link',async({page})=>{
 const puzzle=puzzles.find(p=>p.revision===1)!;
 const key=`lpc:v1:${puzzle.id}:edition:1`,legacy=`lpc:v1:${puzzle.id}`;
 const first=puzzle.entries.find(e=>e.direction==='across')!;
 await page.goto(`/crosswords/${puzzle.id}/`);
 await page.evaluate(k=>localStorage.setItem(k,JSON.stringify({'0,0':'Z'})),legacy);
 await page.reload();
 await expect(page.locator('.previous-progress')).toHaveCount(0);
 expect(await page.locator('.cell input').evaluateAll(inputs=>inputs.every(input=>(input as HTMLInputElement).value===''))).toBeTruthy();
 await page.locator(`[data-entry="${first.number}-across"]`).click();await page.keyboard.type(first.answer[0]);
 expect(await page.evaluate(k=>localStorage.getItem(k),key)).not.toBeNull();
 await page.reload();
 await expect(page.locator(`[data-cell="${first.row},${first.col}"] input`)).toHaveValue(first.answer[0]);
 expect(await page.evaluate(k=>localStorage.getItem(k),legacy)).toBe(JSON.stringify({'0,0':'Z'}));
});
