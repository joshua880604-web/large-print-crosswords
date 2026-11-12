import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import puzzles from '../src/data/puzzles.json' with {type:'json'};

test('home navigation, filtering, and static content',async({page})=>{
 await page.goto('/');await expect(page.getByRole('heading',{level:1})).toContainText('Big letters');
 await page.getByRole('link',{name:'Explore all puzzles'}).click();
 await expect(page.locator('.puzzle-card')).toHaveCount(100);
 await page.getByLabel('Find a puzzle').fill('Garden Days');
 await expect(page.locator('[data-title]:visible')).toHaveCount(5);
 await page.getByLabel('Choose a theme').selectOption('Pets');
 await expect(page.getByText('No puzzles match just yet.')).toBeVisible();
 await page.getByLabel('Find a puzzle').fill('');await expect(page.locator('[data-title]:visible')).toHaveCount(5);
 const sitemap=await page.request.get('/sitemap.xml');expect(await sitemap.text()).toContain('/crosswords/garden-days-5/');
});

test('keyboard entry, check, hint, save, restore, sound and safe reset',async({page})=>{
 await page.goto('/crosswords/garden-days/');
 const e=puzzles[0].entries.find(e=>e.direction==='across')!;
 await page.locator(`[data-entry="${e.number}-across"]`).click();
 const input=page.locator(`[data-cell="${e.row},${e.col}"] input`);
 await expect(input).toBeFocused();await page.keyboard.type('Z');
 await page.getByRole('button',{name:'Check word',exact:true}).click();await expect(input).toHaveAttribute('aria-invalid','true');
 await page.reload();await expect(input).toHaveValue('Z');await expect(page.getByRole('status')).toContainText('restored');
 await page.locator(`[data-entry="${e.number}-across"]`).click();await input.focus();await page.getByRole('button',{name:'Reveal letter',exact:true}).click();await expect(input).toHaveValue(e.answer[0]);
 await expect(page.getByRole('button',{name:'Sound: Off'})).toHaveAttribute('aria-pressed','false');
 await page.getByRole('button',{name:'Sound: Off'}).click();await expect(page.getByRole('button',{name:'Sound: On'})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Larger clues'}).click();await expect(page.locator('.game-layout')).toHaveClass(/large-clues/);
 await page.getByRole('button',{name:'Start over'}).click();await page.getByRole('button',{name:'Keep playing'}).click();await expect(input).toHaveValue(e.answer[0]);
 await page.getByRole('button',{name:'Start over'}).click();await page.getByRole('button',{name:'Clear this puzzle'}).click();await expect(input).toHaveValue('');
});

test('finish an entire puzzle through keyboard input',async({page})=>{
 await page.goto('/crosswords/garden-days/');
 for(const e of puzzles[0].entries){const button=page.locator(`[data-entry="${e.number}-${e.direction}"]`);await button.click();await page.locator(`[data-cell="${e.row},${e.col}"] input`).focus();await page.keyboard.type(e.answer);}
 await expect(page.getByRole('heading',{name:'A lovely little victory!'})).toBeVisible();await expect(page.getByRole('status')).toContainText('Every answer is correct');
});

test('print sheets separate answers and work without scripts',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();
 await page.goto('http://127.0.0.1:4321/print/garden-days/');await expect(page.locator('.print-clues')).toContainText(puzzles[0].entries[0].clue);
 await expect(page.locator('.print-board')).not.toContainText(puzzles[0].entries[0].answer[0]);
 await page.getByRole('link',{name:'Separate answer sheet'}).click();await expect(page.locator('.print-clues')).toContainText(puzzles[0].entries[0].answer);
 await page.emulateMedia({media:'print'});await expect(page.locator('.site-header')).toBeHidden();await expect(page.locator('.print-toolbar')).toBeHidden();
 await context.close();
});

for(const path of ['/','/crosswords/garden-days/','/printable/']){
 test(`accessibility scan ${path}`,async({page})=>{await page.goto(path);const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(results.violations.map(v=>({id:v.id,description:v.description,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);});
}

test('mobile pages fit, touch entry and print navigation',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 for(const path of ['/','/crosswords/','/crosswords/garden-days/','/print/garden-days/']){await page.goto(path);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();}
 await page.goto('/crosswords/garden-days/');await page.locator('.clue-button').first().click();await page.keyboard.type('A');await page.getByRole('link',{name:'Print this puzzle'}).click();await expect(page.getByRole('button',{name:'Print puzzle'})).toBeVisible();
});

test('all 100 playable pages and 200 print sheets were built',async({request})=>{
 for(const p of puzzles){for(const path of [`/crosswords/${p.id}/`,`/print/${p.id}/`,`/print/${p.id}-answers/`]){const response=await request.get(path);expect(response.status(),path).toBe(200);expect(await response.text()).toContain(p.title.replaceAll('&','&amp;'));}}
});

test('touch selection switches direction and larger squares stay inside the board',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const page=await context.newPage();await page.goto('http://127.0.0.1:4321/crosswords/garden-days/');
 const p=puzzles[0];let crossing:{row:number,col:number}|undefined;
 for(const a of p.entries.filter(e=>e.direction==='across'))for(const d of p.entries.filter(e=>e.direction==='down'))if(d.col>=a.col&&d.col<a.col+a.answer.length&&a.row>=d.row&&a.row<d.row+d.answer.length)crossing={row:a.row,col:d.col};
 const input=page.locator(`[data-cell="${crossing!.row},${crossing!.col}"] input`);await input.tap();const before=await page.locator('[data-current-number]').textContent();await input.tap();expect(await page.locator('[data-current-number]').textContent()).not.toEqual(before);
 await page.getByRole('button',{name:'Larger squares',exact:true}).tap();await expect(page.getByRole('button',{name:'Larger squares',exact:true})).toHaveAttribute('aria-pressed','true');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();expect(await page.locator('.board-scroll').evaluate(el=>el.scrollWidth>el.clientWidth)).toBeTruthy();await context.close();
});

test('blocked storage still permits play',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('Blocked storage')}});});await page.goto('/crosswords/garden-days/');await page.locator('.clue-button').first().click();await page.keyboard.type('A');await expect(page.getByRole('status')).toContainText('cannot save progress');
});

test('daily selection rotates to a prebuilt puzzle after the build date',async({page})=>{
 const future=new Date('2027-03-15T16:00:00Z');await page.clock.install({time:future});await page.goto('/daily/');const day=Math.floor(Date.parse('2027-03-15T12:00:00Z')/86400000);await expect(page).toHaveURL(new RegExp(`/crosswords/${puzzles[day%puzzles.length].id}/$`));await expect(page.locator('.game-root')).toBeVisible();
});
