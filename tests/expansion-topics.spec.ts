import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const collections=[
 ['gardening',80],['flower',30],['nature',110],['food',110],['everyday',140],
 ['hobby',100],['nostalgia',45],['bible',60],['spring',30],['summer',25],
 ['autumn',25],['easter',20],['halloween',10]
] as const;
for(const [slug,count] of collections)test(`${slug} collection has actual games and clean navigation`,async({page,request})=>{
 const path=`/${slug}-crosswords/`;
 await page.goto(`${path}?q=&utm_source=collection-check`);
 await expect(page.locator('a.puzzle-card')).toHaveCount(count);
 await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href',`https://largeprintcrosswords.com${path}`);
 const links=await page.locator('a.puzzle-card').evaluateAll(els=>els.map(el=>el.getAttribute('href')));
 expect(new Set(links).size).toBe(count);
 expect(await (await request.get('/sitemap.xml')).text()).toContain(`https://largeprintcrosswords.com${path}`);
 await expect(page.getByRole('link',{name:/Choose a group of puzzles to print together/})).toHaveAttribute('href',/\/print-pack\//);
 await page.locator('a.puzzle-card').first().click();
 await expect(page.locator('.game-root')).toBeVisible();
 // A puzzle can belong to more than one interest collection; all should be reachable.
 await expect(page.locator(`a[href="${path}"]`).first()).toBeVisible();
});

test('optional Bible scenes are identified and collections fit a phone',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/bible-crosswords/');
 await expect(page.getByText(/optional collection of 60 basic Bible/)).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
 await page.goto('/crosswords/bible-beginnings/');
 await expect(page.getByRole('heading',{level:1})).toHaveText('Bible Story: Light and the Created World');
 await expect(page.locator('.game-header')).toContainText('Genesis 1');
 await page.goto('/easter-crosswords/');
 await expect(page.getByRole('link',{name:'Explore the optional Bible story collection.'})).toHaveAttribute('href','/bible-crosswords/');
});
