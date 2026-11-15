import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('pack filters keep selections and produce puzzles before separate answers',async({page})=>{
 await page.goto('/print-pack/');
 await page.locator('input[value="garden-days"]').check();
 await page.getByLabel('Find a puzzle').fill('Christmas');
 await page.locator('input[value="winter-holiday-crafts"]').check();
 await expect(page.locator('#pack-count')).toHaveText('2 of 10 puzzles selected.');
 await page.getByRole('button',{name:'Prepare print pack'}).click();
 await expect(page.locator('#pack-status')).toContainText('Ready: 2 puzzles and separate answers, 8 US Letter pages.');
 const sheets=page.locator('#pack-output .print-workspace');
 await expect(sheets).toHaveCount(4);
 expect(await sheets.evaluateAll(els=>els.map(el=>(el as HTMLElement).dataset.sheetKind))).toEqual(['clues','clues','answers','answers']);
 await expect(page.locator('#pack-output .print-page h1').first()).toHaveText('Garden Tools');
 await page.emulateMedia({media:'print'});
 expect(await page.locator('#pack-output .print-clues p').first().evaluate(el=>getComputedStyle(el).fontSize)).toBe('24px');
 await expect(page.locator('.pack-controls')).toBeHidden();
 expect(await sheets.nth(1).evaluate(el=>getComputedStyle(el).breakBefore)).toBe('page');
 await page.emulateMedia({media:'screen'});
 await page.getByRole('combobox',{name:'Print size',exact:true}).selectOption('compact');
 await expect(page.getByRole('button',{name:'Print prepared pack'})).toBeDisabled();
 await expect(sheets).toHaveCount(0);
 await page.getByLabel('Include separate answer sheets').uncheck();
 await page.getByRole('button',{name:'Prepare print pack'}).click();
 await expect(page.locator('#pack-status')).toContainText('Ready: 2 puzzles, 2 US Letter pages.');
 await expect(sheets).toHaveCount(2);
 await page.emulateMedia({media:'print'});
 expect(await page.locator('#pack-output .print-clues p').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeCloseTo(13*96/72,2);
});

test('pack enforces ten-puzzle limit, handles missing sheets, and clears safely',async({page})=>{
 await page.goto('/print-pack/');
 const choices=page.locator('input[name=puzzle]');
 for(let i=0;i<10;i++)await choices.nth(i).check();
 await choices.nth(10).click();
 await expect(choices.nth(10)).not.toBeChecked();
 await expect(page.locator('#pack-status')).toHaveText('Choose at most ten puzzles per pack.');
 await page.route('**/print/**',route=>route.fulfill({status:503,body:'Unavailable'}));
 await page.getByRole('button',{name:'Prepare print pack'}).click();
 await expect(page.locator('#pack-status')).toContainText('Could not prepare every sheet.');
 await expect(page.getByRole('button',{name:'Print prepared pack'})).toBeDisabled();
 await expect(page.locator('#pack-output')).toBeEmpty();
 await page.getByRole('button',{name:'Clear selections'}).click();
 await expect(page.locator('#pack-count')).toHaveText('0 of 10 puzzles selected.');
});

test('pack remains accessible at phone width and is excluded from indexing',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/print-pack/?theme=Gardening');
 await expect(page.getByRole('combobox',{name:'Theme',exact:true})).toHaveValue('Gardening');
 await expect(page.locator('meta[name=robots]')).toHaveAttribute('content','noindex,follow');
 await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href','https://largeprintcrosswords.com/print-pack/');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
});
