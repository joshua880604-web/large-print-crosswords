import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for(const mode of ['large','compact'] as const)test(`print ${mode} layout keeps its physical size and clean canonical`,async({page})=>{
 await page.goto(`/print/garden-days/?layout=${mode}&utm_source=print-check`);
 await expect(page.getByLabel('Print size')).toHaveValue(mode);
 await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href','https://largeprintcrosswords.com/print/garden-days/');
 await expect(page.locator('meta[name=robots]')).toHaveAttribute('content','noindex,follow');
 await page.emulateMedia({media:'print'});
 const metrics=await page.evaluate(()=>{
  const grid=document.querySelector('.print-board .mini-grid')!.getBoundingClientRect(),clue=document.querySelector('.print-clues p')!;
  return {font:parseFloat(getComputedStyle(clue).fontSize),width:grid.width,height:grid.height,breakBefore:getComputedStyle(document.querySelector('.print-clue-sheet')!).breakBefore};
 });
 expect(metrics.font).toBeCloseTo((mode==='large'?18:13)*96/72,1);
 expect(Math.max(metrics.width,metrics.height)).toBeCloseTo((mode==='large'?5.4:3.6)*96,0);
 if(mode==='large')expect(metrics.breakBefore).toBe('page');
 await expect(page.locator('.print-toolbar')).toBeHidden();
});

test('print size persists through query changes, answer links and reload',async({page})=>{
 await page.goto('/print/garden-days/?layout=compact');
 await page.getByLabel('Print size').selectOption('large');
 await page.reload();await expect(page.getByLabel('Print size')).toHaveValue('large');
 await page.getByLabel('Print size').selectOption('compact');
 await page.getByRole('link',{name:'Separate answer sheet'}).click();
 await expect(page).toHaveURL(/garden-days-answers\/\?layout=compact$/);
 await expect(page.getByLabel('Print size')).toHaveValue('compact');
 await expect(page.locator('#print-layout-help')).toContainText('13pt answers');
 await expect(page.locator('.print-overview-footer')).toContainText('Answers on the next page.');
 await page.goto('/print/winter-holiday-crafts/');
 await expect(page.getByLabel('Print size')).toHaveValue('compact');
});

test('print choices still work when browser storage is blocked',async({page})=>{
 await page.addInitScript(()=>{Storage.prototype.getItem=()=>{throw new Error('blocked');};Storage.prototype.setItem=()=>{throw new Error('blocked');};});
 await page.goto('/print/garden-days/');
 await expect(page.getByLabel('Print size')).toHaveValue('large');
 await page.getByLabel('Print size').selectOption('compact');
 await expect(page.locator('.print-workspace')).toHaveAttribute('data-print-layout','compact');
 await page.getByRole('link',{name:'Separate answer sheet'}).click();
 await expect(page.getByLabel('Print size')).toHaveValue('compact');
 await page.reload();await expect(page.getByLabel('Print size')).toHaveValue('compact');
});

test('large print and Christmas collection remain usable without page scripts',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false}),page=await context.newPage();
 try{
  await page.goto('/christmas-crosswords/');await expect(page.locator('a.puzzle-card')).toHaveCount(12);
  await page.goto('/print/winter-holiday-crafts/');
  await expect(page.getByLabel('Print size')).toBeDisabled();
  await expect(page.locator('.print-clues')).toContainText('Ring-shaped decoration');
  await page.emulateMedia({media:'print'});
  const font=await page.locator('.print-clues p').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
  expect(font).toBe(24);
 }finally{await context.close();}
});

for(const path of ['/christmas-crosswords/','/print/winter-holiday-crafts/'])test(`accessible new controls and content ${path}`,async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto(path);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
 expect(results.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
});
