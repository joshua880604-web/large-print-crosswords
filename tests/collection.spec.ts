import {test,expect} from '@playwright/test';

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
 await expect(page.locator('[data-title]:visible')).toHaveCount(4);
 expect(new URL(page.url()).searchParams.has('theme')).toBeFalsy();
 await page.getByRole('button',{name:'Clear filters'}).click();
 await expect(page.locator('[data-title]:visible')).toHaveCount(12);
 await expect(page.locator('.result-count')).toHaveText('Showing 12 of 80 puzzles');
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
