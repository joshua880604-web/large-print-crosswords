import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import puzzles from '../src/data/puzzles.json' with {type:'json'};
import corrections from '../docs/research/current-clue-corrections-2026-11-16.json' with {type:'json'};

test('pack draft restores filters, choices and print options after reload and return without preparing sheets',async({page})=>{
 await page.goto('/print-pack/?collection=christmas&utm_source=shared');
 await page.getByLabel('Holiday or season').selectOption('winter');
 await page.getByLabel('Find a puzzle').fill('Snowman');
 await page.locator('input[value="winter-comforts-2"]').check();
 await page.getByRole('combobox',{name:'Print size',exact:true}).selectOption('compact');
 await page.getByLabel('Include separate answer sheets').uncheck();
 expect(new URL(page.url()).searchParams.get('collection')).toBe('winter');
 expect(new URL(page.url()).searchParams.get('q')).toBe('Snowman');
 expect(new URL(page.url()).searchParams.get('utm_source')).toBe('shared');
 await page.getByRole('button',{name:'Prepare print pack'}).click();
 await expect(page.locator('#pack-status')).toContainText('Ready: 1 puzzle, 1 US Letter pages.');
 let sheetRequests=0;page.on('request',request=>{if(new URL(request.url()).pathname.startsWith('/print/'))sheetRequests++;});
 await page.reload();
 await expect(page.getByLabel('Holiday or season')).toHaveValue('winter');
 await expect(page.getByLabel('Find a puzzle')).toHaveValue('Snowman');
 await expect(page.locator('input[value="winter-comforts-2"]')).toBeChecked();
 await expect(page.getByRole('combobox',{name:'Print size',exact:true})).toHaveValue('compact');
 await expect(page.getByLabel('Include separate answer sheets')).not.toBeChecked();
 await expect(page.locator('#pack-status')).toHaveText('Selection restored. Prepare the pack when you are ready.');
 await expect(page.locator('#pack-output')).toBeEmpty();
 await expect(page.getByRole('button',{name:'Print prepared pack'})).toBeDisabled();
 expect(sheetRequests).toBe(0);
 await page.goto('/about/');await page.goBack();
 await expect(page.locator('input[value="winter-comforts-2"]')).toBeChecked();
 await expect(page.getByLabel('Holiday or season')).toHaveValue('winter');
 await expect(page.locator('#pack-output')).toBeEmpty();
});

test('a topic link replaces previous filters but keeps the reader’s selected puzzles',async({page})=>{
 await page.goto('/print-pack/?theme=Gardening&q=Garden');
 await page.locator('input[value="garden-days"]').check();
 await page.getByRole('combobox',{name:'Print size',exact:true}).selectOption('compact');
 await page.goto('/print-pack/?collection=christmas');
 await expect(page.getByLabel('Find a puzzle')).toHaveValue('');
 await expect(page.getByRole('combobox',{name:'Theme',exact:true})).toHaveValue('');
 await expect(page.getByLabel('Holiday or season')).toHaveValue('christmas');
 await expect(page.locator('#pack-results')).toHaveText('52 puzzles shown.');
 await expect(page.locator('input[value="garden-days"]')).toBeChecked();
 await expect(page.getByRole('button',{name:'Remove Garden Tools',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Remove Garden Tools',exact:true}).click();
 await expect(page.locator('#pack-count')).toHaveText('0 of 10 puzzles selected.');
 await expect(page.getByLabel('Find a puzzle')).toBeFocused();
 await page.reload();await expect(page.locator('#pack-selected')).toBeEmpty();
});

test('hidden selections can be removed individually and invalidate a prepared pack',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/print-pack/');
 await page.locator('input[value="garden-days"]').check();
 await page.locator('input[value="holiday-table-3"]').check();
 await page.getByRole('button',{name:'Prepare print pack'}).click();
 await expect(page.getByRole('button',{name:'Print prepared pack'})).toBeEnabled();
 await page.getByLabel('Holiday or season').selectOption('christmas');
 await expect(page.locator('input[value="garden-days"]')).not.toBeVisible();
 await page.getByRole('button',{name:'Remove Garden Tools',exact:true}).click();
 await expect(page.locator('input[value="garden-days"]')).not.toBeChecked();
 await expect(page.locator('input[value="holiday-table-3"]')).toBeChecked();
 await expect(page.getByRole('button',{name:'Remove Decorating a Christmas Tree',exact:true})).toBeFocused();
 await expect(page.locator('#pack-output')).toBeEmpty();
 await expect(page.getByRole('button',{name:'Print prepared pack'})).toBeDisabled();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
 await page.getByRole('button',{name:'Clear selections'}).click();await page.reload();
 await expect(page.locator('#pack-count')).toHaveText('0 of 10 puzzles selected.');
});

test('invalid saved IDs are discarded, duplicate choices collapse and restoration never exceeds ten',async({page})=>{
 const ids=puzzles.slice(0,14).map(p=>p.id);
 await page.addInitScript(ids=>{
  localStorage.setItem('lpc:print-pack',JSON.stringify({version:1,ids:[ids[0],ids[0],42,'<script>','missing',...ids.slice(1)],layout:'tiny',answers:'no',filters:{theme:'unknown',collection:'unknown',q:42}}));
  localStorage.setItem('lpc:v1:garden-days:edition:2','{"0,0":"G"}');
  localStorage.setItem('lpc:print-layout','compact');
 },ids);
 await page.goto('/print-pack/');
 expect(await page.locator('input[name=puzzle]:checked').evaluateAll(inputs=>inputs.map(el=>(el as HTMLInputElement).value))).toEqual(ids.slice(0,10));
 await expect(page.locator('#pack-selected button')).toHaveCount(10);
 await expect(page.getByRole('combobox',{name:'Print size',exact:true})).toHaveValue('large');
 await expect(page.getByLabel('Include separate answer sheets')).toBeChecked();
 expect(await page.evaluate(()=>localStorage.getItem('lpc:v1:garden-days:edition:2'))).toBe('{"0,0":"G"}');
 expect(await page.evaluate(()=>localStorage.getItem('lpc:print-layout'))).toBe('compact');
 await page.locator('input[name=puzzle]:not(:checked)').first().click();
 await expect(page.locator('#pack-status')).toHaveText('Choose at most ten puzzles per pack.');
});

test('malformed drafts fall back safely',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('lpc:print-pack','{bad JSON'));
 await page.goto('/print-pack/');
 await expect(page.locator('#pack-count')).toHaveText('0 of 10 puzzles selected.');
 await page.locator('input[value="garden-days"]').check();
 await expect(page.locator('#pack-count')).toHaveText('1 of 10 puzzles selected.');
});

for(const operation of ['getItem','setItem'] as const)test(`pack remains usable when browser storage ${operation} fails`,async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(operation=>{Storage.prototype[operation]=()=>{throw new DOMException('Unavailable','SecurityError');};},operation);
 await page.goto('/print-pack/?q=Garden+Tools');
 await page.locator('input[value="garden-days"]').check();
 await expect(page.locator('#pack-draft-status')).toContainText('cannot be saved');
 await page.getByRole('button',{name:'Prepare print pack'}).click();
 await expect(page.locator('#pack-status')).toContainText('Ready: 1 puzzle and separate answers, 4 US Letter pages.');
 expect(errors).toEqual([]);
});

test('pack and catalog searches match punctuation, accents and hyphens consistently',async({page})=>{
 test.setTimeout(90_000);
 for(const query of ['St Patrick',"st. patrick's",'ST.  PATRICK’S','café','hot-water','hot water']){
  await page.goto('/crosswords/?q='+encodeURIComponent(query));
  await page.waitForFunction(()=>document.querySelector('.result-count')?.textContent?.includes('Showing'));
  const ids=await page.locator('[data-title]:visible a.puzzle-card').evaluateAll(links=>links.map(a=>a.getAttribute('href')!.split('/')[2]).sort());
  expect(ids.length).toBeGreaterThan(0);
  await page.goto('/print-pack/?q='+encodeURIComponent(query));
  expect(await page.locator('.pack-choice:visible input').evaluateAll(inputs=>inputs.map(el=>(el as HTMLInputElement).value).sort())).toEqual(ids);
 }
});

test('butterfly wording corrections retain the existing board, saved letters and print clues',async({page})=>{
 const puzzle=puzzles.find(p=>p.id==='spring-garden-wildlife-5')!;
 await page.goto(`/crosswords/${puzzle.id}/`);
 for(const correction of corrections){
  const e=puzzle.entries.find(e=>e.answer===correction.answer)!;
  await expect(page.locator(`[data-entry="${e.number}-${e.direction}"]`)).toContainText(correction.after);
 }
 const first=puzzle.entries[0],cell=`${first.row},${first.col}`,key=`lpc:v1:${puzzle.id}:edition:1`;
 await page.locator(`[data-cell="${cell}"] input`).fill(first.answer[0]);
 await page.reload();await expect(page.locator(`[data-cell="${cell}"] input`)).toHaveValue(first.answer[0]);
 expect(JSON.parse(await page.evaluate(key=>localStorage.getItem(key),key) || '{}')[cell]).toBe(first.answer[0]);
 await page.getByRole('link',{name:'Print this puzzle →'}).click();
 for(const correction of corrections)await expect(page.locator('.print-clues')).toContainText(correction.after);
});
