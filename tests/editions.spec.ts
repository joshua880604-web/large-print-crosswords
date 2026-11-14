import {test,expect} from '@playwright/test';
import puzzles from '../src/data/puzzles.json' with {type:'json'};
import previousEditions from '../src/data/previous-editions.json' with {type:'json'};

for(const old of previousEditions)test(`preserved edition ${old.id} retains saved letters separately from its replacement`,async({page,request})=>{
 const current=puzzles.find(p=>p.id===old.id)!;
 const oldKey=`lpc:v1:${old.id}:edition:${old.revision}`,newKey=`lpc:v1:${current.id}:edition:${current.revision}`;
 const oldEntry=old.entries[0],cell=`${oldEntry.row},${oldEntry.col}`,oldValue=JSON.stringify({[cell]:oldEntry.answer[0]});
 await page.goto(`/crosswords/${old.id}/`);
 await expect(page.getByRole('link',{name:'Continue your previous puzzle',exact:true})).toBeHidden();
 // An unrelated, unversioned key must not trigger a nonexistent /previous/ link.
 await page.evaluate(id=>localStorage.setItem(`lpc:v1:${id}`,JSON.stringify({'0,0':'Z'})),old.id);
 await page.reload();await expect(page.locator('.previous-progress')).toBeHidden();
 await page.evaluate(({key,value})=>localStorage.setItem(key,value),{key:oldKey,value:oldValue});
 await page.reload();
 const link=page.getByRole('link',{name:'Continue your previous puzzle',exact:true});
 await expect(link).toBeVisible();await expect(link).toHaveAttribute('href',`/crosswords/${old.id}/editions/${old.revision}/`);
 expect(await page.locator('.cell input').evaluateAll(inputs=>inputs.every(input=>(input as HTMLInputElement).value===''))).toBeTruthy();
 const entry=current.entries.find(e=>e.direction==='across')!;
 await page.locator(`[data-entry="${entry.number}-${entry.direction}"]`).click();await page.keyboard.type(entry.answer[0]);
 const saved=await page.evaluate(key=>localStorage.getItem(key),newKey);expect(saved).not.toBeNull();
 expect(await page.evaluate(key=>localStorage.getItem(key),oldKey)).toBe(oldValue);
 await link.click();await expect(page).toHaveURL(new RegExp(`/editions/${old.revision}/$`));
 await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex,follow');
 await expect(page.locator(`[data-cell="${cell}"] input`)).toHaveValue(oldEntry.answer[0]);
 const actual=await page.locator('.game-root').evaluate(el=>JSON.parse((el as HTMLElement).dataset.puzzle!));
 expect(actual).toEqual(old);
 await page.locator(`[data-entry="${oldEntry.number}-${oldEntry.direction}"]`).click();await page.keyboard.type('Z');
 expect(await page.evaluate(key=>localStorage.getItem(key),newKey)).toBe(saved);
 await page.getByRole('link',{name:`try ${current.title}`,exact:true}).click();
 await expect(page.locator(`[data-cell="${entry.row},${entry.col}"] input`)).toHaveValue(entry.answer[0]);
 const sitemap=await(await request.get('/sitemap.xml')).text();expect(sitemap).not.toContain('/editions/');
 const preview=await request.get(`/previews/${old.id}-v${old.revision}.svg`);expect(preview.status()).toBe(200);
});

test('versioned continuation handles blocked and malformed storage',async({page})=>{
 const old=previousEditions[0];
 await page.addInitScript(()=>{Storage.prototype.getItem=()=>{throw new Error('blocked');};Storage.prototype.setItem=()=>{throw new Error('blocked');};});
 await page.goto(`/crosswords/${old.id}/`);await expect(page.locator('.previous-progress')).toBeHidden();
 await expect(page.locator('.crossword-board')).toBeVisible();
});

test('invalid prior progress does not show an earlier-edition link',async({page})=>{
 const old=previousEditions[0],key=`lpc:v1:${old.id}:edition:${old.revision}`;
 await page.goto(`/crosswords/${old.id}/`);
 for(const value of ['{broken','[]','null','{"0,0":123}','{"0,0":""}','{"invalid":"A"}']){
  await page.evaluate(({key,value})=>localStorage.setItem(key,value),{key,value});await page.reload();
  await expect(page.locator('.previous-progress')).toBeHidden();
 }
});
