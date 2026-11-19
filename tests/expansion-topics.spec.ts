import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const collections=[
 ['gardening',157],['flower',35],['nature',175],['food',252],['everyday',399],
 ['hobby',231],['nostalgia',175],['bible',105],['spring',45],['summer',46],
 ['autumn',35],['easter',25],['halloween',15]
] as const;
const starters: Record<string, string[]> = {
 gardening: ['garden-from-the-beginning-3', 'garden-harvest-baskets', 'garden-evening-chores-2'],
 nostalgia: ['memories-of-main-street-4', 'memories-of-home-entertainment-4', 'saved-messages'],
 everyday: ['shopping-and-returning', 'errands-on-main-street-2', 'visits-and-gatherings'],
};
for(const [slug,count] of collections)test(`${slug} collection has actual games and clean navigation`,async({page,request})=>{
 const path=`/${slug}-crosswords/`;
 if(starters[slug])await page.setViewportSize({width:390,height:844});
 await page.goto(`${path}?q=&utm_source=collection-check`);
 await expect(page.locator('a.puzzle-card')).toHaveCount(count);
 await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href',`https://largeprintcrosswords.com${path}`);
 const links=await page.locator('a.puzzle-card').evaluateAll(els=>els.map(el=>el.getAttribute('href')));
 expect(new Set(links).size).toBe(count);
 if(starters[slug]){
  const featured=page.getByRole('region',{name:'Start with one of these puzzles'});
  await expect(featured.getByRole('heading',{level:3})).toHaveCount(3);
  const choices=await featured.locator('li a').evaluateAll(anchors=>anchors.map(a=>a.getAttribute('href')));
  expect(choices).toEqual(starters[slug].flatMap(id=>[
   `/crosswords/${id}/`,`/print/${id}/`,`/print/${id}-answers/`,
  ]));
  await expect(featured.getByRole('link',{name:`Browse all ${count} puzzles`})).toHaveAttribute('href','#all-puzzles');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 }
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
 await expect(page.getByText(/optional collection of 105 basic Bible/)).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
 await page.goto('/crosswords/bible-beginnings/');
 await expect(page.getByRole('heading',{level:1})).toHaveText('Bible Story: Light and the Created World');
 await expect(page.locator('.game-header')).toContainText('Genesis 1');
 await page.goto('/easter-crosswords/');
 await expect(page.getByRole('link',{name:'Explore the optional Bible story collection.'})).toHaveAttribute('href','/bible-crosswords/');
});
