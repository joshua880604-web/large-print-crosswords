import {test,expect} from '@playwright/test';
import puzzles from '../src/data/puzzles.json' with {type:'json'};
import {catalogPageSize} from '../src/data/catalog';

test('filtered collection links load directly and keep a clean canonical',async({page})=>{
 await page.goto('/crosswords/?q=golf&theme=Sports&utm_source=shared');
 await expect(page.getByLabel('Find a puzzle')).toHaveValue('golf');
 await expect(page.getByLabel('Choose a theme')).toHaveValue('Sports');
 await expect(page.locator('[data-title]:visible')).toHaveCount(1);
 await expect(page.locator('.result-count')).toHaveText('Showing 1 of 1 puzzle');
 await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href','https://largeprintcrosswords.com/crosswords/');
 await page.getByLabel('Find a puzzle').fill('tennis');
 await expect(page).toHaveURL(/q=tennis/);
 expect(new URL(page.url()).searchParams.get('utm_source')).toBe('shared');
 await page.reload();
 await expect(page.getByLabel('Find a puzzle')).toHaveValue('tennis');
 await expect(page.locator('[data-title]:visible')).toHaveCount(2);
});

test('collection filters accept input after restoring the URL on a slow load',async({page})=>{
 let releaseScripts!:()=>void;
 const scriptsReady=new Promise<void>(resolve=>{releaseScripts=resolve;});
 await page.route('**/_astro/*.js',async route=>{
  await scriptsReady;
  await route.continue();
 });
 const search=page.getByLabel('Find a puzzle');
 const theme=page.getByLabel('Choose a theme');
 try{
  await page.goto('/crosswords/?q=Garden+Tools',{waitUntil:'commit'});
  await expect(search).toBeDisabled();
  await expect(theme).toBeDisabled();
 }finally{releaseScripts();}
 await expect(search).toBeEnabled();
 await expect(theme).toBeEnabled();
 await expect(search).toHaveValue('Garden Tools');
 await search.fill('squirrel burying');
 await expect(page.locator('.result-count')).toHaveText('Showing 1 of 1 puzzle');
 expect(new URL(page.url()).searchParams.get('q')).toBe('squirrel burying');
});

test('returning from a puzzle preserves the theme and expanded results',async({page})=>{
 await page.goto('/crosswords/');
 await page.getByLabel('Choose a theme').selectOption('Sports');
 await expect(page.locator('[data-title]:visible')).toHaveCount(12);
 await page.getByRole('button',{name:'Show more puzzles'}).click();
 await expect(page.locator('[data-title]:visible')).toHaveCount(20);
 await page.getByRole('link',{name:/A Round of Golf/}).first().click();
 await expect(page).toHaveURL(/\/crosswords\/leisure-sports\/$/);
 await page.goBack();
 await expect(page.getByLabel('Choose a theme')).toHaveValue('Sports');
 await expect(page.locator('[data-title]:visible')).toHaveCount(20);
 await page.reload();
 await expect(page.locator('[data-title]:visible')).toHaveCount(20);
});

test('empty results can be cleared without losing unrelated URL parameters',async({page})=>{
 await page.goto('/crosswords/?q=no-such-puzzle&theme=Sports&utm_source=shared');
 await expect(page.locator('.empty-state')).toBeVisible();
 await page.getByRole('button',{name:'Clear filters'}).click();
 await expect(page.getByLabel('Find a puzzle')).toHaveValue('');
 await expect(page.getByLabel('Find a puzzle')).toBeFocused();
 await expect(page.getByLabel('Choose a theme')).toHaveValue('');
 await expect(page.locator('[data-title]:visible')).toHaveCount(12);
 await expect(page.locator('.empty-state')).toBeHidden();
 await expect(page.getByRole('button',{name:'Clear filters'})).toBeHidden();
 const params=new URL(page.url()).searchParams;
 expect(params.has('q')).toBeFalsy();expect(params.has('theme')).toBeFalsy();
 expect(params.get('utm_source')).toBe('shared');
});

test('topic pages restore their own valid filters and reject unavailable themes',async({page})=>{
 await page.goto('/music-crosswords/?q=guitar&theme=Sports');
 await expect(page.getByLabel('Find a puzzle')).toHaveValue('guitar');
 await expect(page.getByLabel('Choose a theme')).toHaveValue('');
 await expect(page.locator('[data-title]:visible')).toHaveCount(10);
 expect(new URL(page.url()).searchParams.has('theme')).toBeFalsy();
 await page.getByRole('button',{name:'Clear filters'}).click();
 await expect(page.locator('[data-title]:visible')).toHaveCount(12);
 await expect(page.locator('.result-count')).toHaveText('Showing 12 of 155 puzzles');
 await page.goto('/');
 await expect(page.getByRole('link',{name:'Music crosswords',exact:true})).toHaveAttribute('href','/music-crosswords/');
 await expect(page.getByRole('link',{name:'Sports crosswords',exact:true})).toHaveAttribute('href','/sports-crosswords/');
});

test('familiar punctuation differences do not hide a matching puzzle',async({page})=>{
 await page.goto('/crosswords/?q=St+Patrick');
 await expect(page.locator('[data-title]:visible')).toHaveCount(1);
 await expect(page.locator('[data-title]:visible')).toContainText('A St. Patrick’s Day Procession');
 await page.getByLabel('Find a puzzle').fill("st.  patrick's");
 await expect(page.locator('[data-title]:visible')).toHaveCount(1);
 await page.reload();
 await expect(page.locator('[data-title]:visible')).toHaveCount(1);
});

test('the print directory loads the full search catalog on demand and retries a network failure',async({page})=>{
 let requests=0;
 await page.route('**/puzzle-catalog.json',route=>{
  requests++;
  return requests===1 ? route.fulfill({status:503}) : route.continue();
 });
 await page.setViewportSize({width:390,height:844});
 await page.goto('/printable/');
 await expect(page.getByRole('button',{name:'Show more puzzles'})).toBeVisible();
 await expect(page.locator('.puzzle-card')).toHaveCount(catalogPageSize);
 expect(requests).toBe(0);

 const puzzle=puzzles.at(-1)!;
 await page.getByLabel('Find a puzzle').fill(puzzle.title);
 await expect(page.getByRole('status')).toHaveText('Puzzle matches unavailable.');
 await expect(page.getByRole('link',{name:'Browse the text index'})).toBeVisible();
 await page.getByRole('button',{name:'Try again'}).click();
 await expect(page.getByRole('status')).toHaveText('Showing 1 of 1 puzzle');
 const row=page.locator(`[data-id="${puzzle.id}"]`);
 await expect(row.locator('a.puzzle-card')).toHaveAttribute('href',`/print/${puzzle.id}/`);
 await expect(row.getByRole('link',{name:`Answer sheet for ${puzzle.title}`})).toHaveAttribute('href',`/print/${puzzle.id}-answers/`);
 await expect(row.getByRole('link',{name:`Play ${puzzle.title} online`})).toHaveAttribute('href',`/crosswords/${puzzle.id}/`);
 await expect(row.locator('img')).toHaveAttribute('width',String(puzzle.cols*24));
 expect(requests).toBe(2);
 await page.getByRole('button',{name:'Clear filters'}).click();
 await page.getByRole('button',{name:'Show more puzzles'}).click();
 await expect(page.locator('.puzzle-card')).toHaveCount(catalogPageSize*2);
 await expect(page.locator('.puzzle-card').nth(catalogPageSize)).toBeFocused();
 expect(requests).toBe(2);
});
