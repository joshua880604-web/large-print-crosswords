import {test,expect} from '@playwright/test';

test('sports collection offers adult everyday topics with playable and print links',async({page})=>{
 await page.goto('/sports-crosswords/');
 await expect(page.getByRole('heading',{level:1})).toHaveText('Sports crosswords in large print.');
 await expect(page.locator('.puzzle-card')).toHaveCount(20);
 await page.getByLabel('Find a puzzle').fill('golf');
 await expect(page.locator('[data-title]:visible')).toHaveCount(1);
 await page.getByRole('link',{name:/A Round of Golf/}).first().click();
 await expect(page).toHaveURL(/\/crosswords\/leisure-sports\/$/);
 await expect(page.getByRole('link',{name:'Print this puzzle →'})).toHaveAttribute('href','/print/leisure-sports/');
});

test('music collection combines existing and new subjects and appears in the sitemap',async({page,request})=>{
 await page.goto('/music-crosswords/');
 await expect(page.locator('.puzzle-card')).toHaveCount(20);
 await page.getByLabel('Find a puzzle').fill('guitar');
 await expect(page.locator('[data-title]:visible')).toHaveCount(1);
 await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href','https://largeprintcrosswords.com/music-crosswords/');
 const map=await(await request.get('/sitemap.xml')).text();
 expect(map).toContain('/music-crosswords/');expect(map).toContain('/sports-crosswords/');
});
