import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import puzzles from '../src/data/puzzles.json' with {type:'json'};

test('home navigation, filtering, and static content',async({page})=>{
 await page.goto('/');await expect(page.getByRole('heading',{level:1})).toContainText('Big letters');
 await page.getByRole('link',{name:'Explore all puzzles'}).click();
 await expect(page.locator('.puzzle-card')).toHaveCount(puzzles.length);
 await page.getByLabel('Find a puzzle').fill('Garden Tools');
 await expect(page.locator('[data-title]:visible')).toHaveCount(1);
 await page.getByLabel('Find a puzzle').fill('backyard birds');await expect(page.locator('[data-title]:visible')).toHaveCount(5);
 await page.getByLabel('Find a puzzle').fill('market morning');await expect(page.locator('[data-title]:visible')).toHaveCount(5);
 await page.getByLabel('Find a puzzle').fill('on the road');await expect(page.locator('[data-title]:visible')).toHaveCount(11);
 for(const id of ['on-the-road','on-the-road-2','on-the-road-3','on-the-road-4','on-the-road-5','country-voice-memories-4','a-rest-stop-on-the-road'])await expect(page.locator(`a.puzzle-card[href="/crosswords/${id}/"]`)).toBeVisible();
 await page.getByLabel('Find a puzzle').fill('cozy at home');await expect(page.locator('[data-title]:visible')).toHaveCount(5);
 await page.getByLabel('Find a puzzle').fill('a day at the farm');await expect(page.locator('[data-title]:visible')).toHaveCount(5);
 await page.getByLabel('Find a puzzle').fill('sunday baking');await expect(page.locator('[data-title]:visible')).toHaveCount(5);
 await page.getByLabel('Find a puzzle').fill('a stitch in time');await expect(page.locator('[data-title]:visible')).toHaveCount(5);
 await page.getByLabel('Find a puzzle').fill('our furry friends');await expect(page.locator('[data-title]:visible')).toHaveCount(5);
 await page.getByLabel('Find a puzzle').fill('a cup of comfort');await expect(page.locator('[data-title]:visible')).toHaveCount(5);
 for(const term of ['movie night','by the sea','autumn walk','holiday table','a good book','weather watching','in the workshop','game night']){
  await page.getByLabel('Find a puzzle').fill(term);await expect(page.locator('[data-title]:visible')).toHaveCount(term==='holiday table'?6:5);
  if(term==='holiday table')await expect(page.locator('a.puzzle-card[href="/crosswords/flowers-through-the-year-4/"]')).toBeVisible();
 }
 await page.getByLabel('Find a puzzle').fill('flower favorites');await expect(page.locator('[data-title]:visible')).toHaveCount(5);
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
 test(`accessibility scan ${path}`,async({page})=>{
  if(path==='/printable/')test.setTimeout(90_000);
  await page.goto(path);
  const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(results.violations.map(v=>({id:v.id,description:v.description,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
 });
}

test('mobile pages fit, touch entry and print navigation',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 for(const path of ['/','/crosswords/','/crosswords/garden-days/','/print/garden-days/']){await page.goto(path);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();}
 await page.goto('/crosswords/garden-days/');await page.locator('.clue-button').first().click();await page.keyboard.type('A');await page.getByRole('link',{name:'Print this puzzle'}).click();await expect(page.getByRole('button',{name:'Print puzzle'})).toBeVisible();
});

// Bound each request context and test budget as the catalog grows. All games
// and both print variants remain covered; release bodies after inspecting them.
for(let start=0;start<puzzles.length;start+=25){
 const batch=puzzles.slice(start,start+25);
 test(`playable and print routes batch ${Math.floor(start/25)+1}`,async({request})=>{
  for(const p of batch)for(const path of [`/crosswords/${p.id}/`,`/print/${p.id}/`,`/print/${p.id}-answers/`]){
   const response=await request.get(path);
   try{expect(response.status(),path).toBe(200);expect(await response.text()).toContain(p.title.replaceAll('&','&amp;'));}
   finally{await response.dispose();}
  }
 });
}

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

test('on-screen keyboard shares input, deletion, hints and saved progress',async({page})=>{
 await page.goto('/crosswords/garden-days/');
 const entry=puzzles[0].entries.find(e=>e.direction==='across')!;
 const first=page.locator(`[data-cell="${entry.row},${entry.col}"] input`);
 await expect(page.getByRole('group',{name:'On-screen crossword keyboard',exact:true})).toBeHidden();
 await page.locator(`[data-entry="${entry.number}-across"]`).click();
 await page.getByRole('button',{name:'Use on-screen keyboard',exact:true}).click();
 const keyboard=page.getByRole('group',{name:'On-screen crossword keyboard',exact:true});
 await expect(keyboard).toBeVisible();await expect(first).toHaveAttribute('inputmode','none');
 await keyboard.getByRole('button',{name:'Type Z',exact:true}).click();await expect(first).toHaveValue('Z');
 await keyboard.getByRole('button',{name:'Delete',exact:true}).click();await expect(first).toHaveValue('');await expect(first).toBeFocused();
 for(const letter of entry.answer)await keyboard.getByRole('button',{name:`Type ${letter}`,exact:true}).click();
 await expect(page.locator('.keyboard-word')).toHaveText(entry.answer);
 await keyboard.getByRole('button',{name:'Next word',exact:true}).click();await expect(page.locator('[data-keyboard-number]')).not.toHaveText(`${entry.number} Across`);
 const selected=page.locator('.cell.selected input');await page.getByRole('button',{name:'Reveal letter',exact:true}).click();await expect(selected).not.toHaveValue('');await expect(page.locator('.keyboard-word')).toContainText(await selected.inputValue());
 await page.reload();await expect(first).toHaveValue(entry.answer[0]);await expect(first).toHaveAttribute('inputmode','none');
 await page.locator(`[data-entry="${entry.number}-across"]`).click();await expect(keyboard).toBeVisible();
 await keyboard.getByRole('button',{name:'Use system keyboard',exact:true}).click();await expect(keyboard).toBeHidden();await expect(first).toHaveAttribute('inputmode','text');
 await page.reload();await expect(first).toHaveAttribute('inputmode','text');
});

test('on-screen letter keys support roving keyboard focus and physical input',async({page})=>{
 await page.goto('/crosswords/garden-days/');await page.getByRole('button',{name:'Use on-screen keyboard',exact:true}).click();
 const keyboard=page.getByRole('group',{name:'On-screen crossword keyboard',exact:true});
 await expect(keyboard.locator('[data-letter][tabindex="0"]')).toHaveCount(1);
 await keyboard.getByRole('button',{name:'Type Q',exact:true}).focus();await page.keyboard.press('ArrowRight');await expect(keyboard.getByRole('button',{name:'Type W',exact:true})).toBeFocused();
 await page.keyboard.press('ArrowDown');await expect(keyboard.getByRole('button',{name:'Type S',exact:true})).toBeFocused();
 await page.keyboard.press('Enter');
 await expect(page.locator('.keyboard-word')).toContainText('S');await page.keyboard.type('AB');await expect(page.locator('.keyboard-word')).toContainText('AB');
 await keyboard.getByRole('button',{name:'Hide keyboard',exact:true}).focus();await page.keyboard.press('Escape');await expect(keyboard).toBeHidden();await expect(page.locator('[data-action=keyboard]')).toBeFocused();
 await page.keyboard.press('Enter');await expect(keyboard).toBeVisible();
 const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(results.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
});

test('mobile on-screen keyboard keeps selected square visible and remembers native preference',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const page=await context.newPage();
 await page.goto('http://127.0.0.1:4321/crosswords/garden-days/');
 const keyboard=page.getByRole('group',{name:'On-screen crossword keyboard',exact:true});
 await expect(keyboard).toBeHidden();await page.locator('.clue-button').first().tap();await expect(keyboard).toBeVisible();
 await expect(page.locator('.cell.selected input')).toHaveAttribute('inputmode','none');
 await keyboard.getByRole('button',{name:'Type A',exact:true}).tap();
 await expect.poll(async()=>page.evaluate(()=>{const cell=document.querySelector('.cell.selected')!.getBoundingClientRect(),panel=document.querySelector('.puzzle-keyboard')!.getBoundingClientRect();return cell.top>=0&&cell.bottom<=panel.top;})).toBeTruthy();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await expect.poll(async()=>page.evaluate(()=>{const board=document.querySelector('.board-scroll')!.getBoundingClientRect(),panel=document.querySelector('.puzzle-keyboard')!.getBoundingClientRect();return board.top>=0&&board.bottom<=panel.top;})).toBeTruthy();
 await keyboard.getByRole('button',{name:'Hide keyboard',exact:true}).tap();await expect(keyboard).toBeHidden();
 await page.locator('.cell.selected input').tap();await expect(keyboard).toBeVisible();
 await keyboard.getByRole('button',{name:'Use system keyboard',exact:true}).tap();await expect(keyboard).toBeHidden();
 await page.reload();await page.locator('.clue-button').first().tap();await expect(keyboard).toBeHidden();await expect(page.locator('.cell.selected input')).toHaveAttribute('inputmode','text');
 await page.setViewportSize({width:320,height:568});await page.getByRole('button',{name:'Use on-screen keyboard',exact:true}).click();await expect(keyboard).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await page.emulateMedia({media:'print'});await expect(keyboard).toBeHidden();await context.close();
});

test('a keyboard-selected clue brings the focused square into view on a narrow window',async({page})=>{
 await page.setViewportSize({width:640,height:450});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/crosswords/errands-on-main-street-2/');
 const clue=page.locator('.clue-button').first();
 for(let step=0;step<35;step++){
  await page.keyboard.press('Tab');
  if(await clue.evaluate(button=>button===document.activeElement))break;
 }
 await expect(clue).toBeFocused();
 await expect(clue).toBeInViewport();
 await page.keyboard.press('Enter');
 const square=page.locator('.cell.selected input');
 await expect(square).toBeFocused();
 await expect(square).toBeInViewport({ratio:1});
 const cell=await square.evaluate(input=>input.parentElement!.dataset.cell);
 await page.keyboard.type('S');
 await page.reload();
 await expect(page.locator(`[data-cell="${cell}"] input`)).toHaveValue('S');
});

test('larger clues enlarges the active clue in the board and touch keyboard',async({browser})=>{
 const context=await browser.newContext({viewport:{width:320,height:568},hasTouch:true,isMobile:true});
 try{
  const page=await context.newPage();
  await page.goto('/crosswords/errands-on-main-street-2/');
  await expect(page.locator('.current-clue')).toHaveCSS('font-size','18px');
  await page.getByRole('button',{name:'Larger clues'}).tap();
  const tip=page.locator('.solving-tip summary');
  await tip.tap();
  await expect(page.locator('.solving-tip p')).toHaveCSS('font-size','22px');
  await tip.tap();
  await page.locator('.clue-button').first().tap();
  const keyboard=page.locator('.puzzle-keyboard');
  await expect(keyboard).toBeVisible();
  await expect(page.locator('.current-clue')).toHaveCSS('font-size','22px');
  await expect(keyboard.locator('.keyboard-clue')).toHaveCSS('font-size','22px');
  await page.setViewportSize({width:667,height:375});
  await expect(keyboard.locator('.keyboard-clue')).toHaveCSS('font-size','20px');
  await expect.poll(()=>page.evaluate(()=>{
   const square=document.querySelector('.cell.selected')!.getBoundingClientRect();
   const dock=document.querySelector('.puzzle-keyboard')!.getBoundingClientRect();
   return square.top>=0&&square.bottom<=dock.top&&document.documentElement.scrollWidth<=innerWidth;
  })).toBeTruthy();
  await page.reload();
  await expect(page.getByRole('button',{name:'Larger clues'})).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.current-clue')).toHaveCSS('font-size','22px');
 }finally{await context.close();}
});

test('the optional tip before the grid opens with the keyboard without scripts or spoilers',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:568}});
 try{
  const page=await context.newPage();
  await page.goto('/crosswords/garden-harvest-baskets-3/');
  const tip=page.locator('.solving-tip');
  const summary=tip.locator('summary');
  await expect(summary).toHaveText('Solving tip');
  await expect(tip.locator('p')).toBeHidden();
  expect(await tip.evaluate(element=>Boolean(element.compareDocumentPosition(document.querySelector('.crossword-board')!)&Node.DOCUMENT_POSITION_FOLLOWING))).toBeTruthy();
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(tip.locator('p')).toBeVisible();
  await expect(summary).toBeFocused();
  await expect(page.locator('.answer-explanations dd').first()).toBeHidden();
  expect(await page.locator('.cell input').evaluateAll(inputs=>inputs.every(input=>(input as HTMLInputElement).value===''))).toBeTruthy();
  await page.keyboard.press('Enter');
  await expect(tip.locator('p')).toBeHidden();
 }finally{await context.close();}
});

test('an entire puzzle can be completed using on-screen keys',async({page})=>{
 await page.goto('/crosswords/garden-days/');await page.getByRole('button',{name:'Use on-screen keyboard',exact:true}).click();
 const keyboard=page.getByRole('group',{name:'On-screen crossword keyboard',exact:true});
 for(const entry of puzzles[0].entries){await page.locator(`[data-entry="${entry.number}-${entry.direction}"]`).click();await page.locator(`[data-cell="${entry.row},${entry.col}"] input`).focus();for(const letter of entry.answer)await keyboard.getByRole('button',{name:`Type ${letter}`,exact:true}).click();}
 await expect(page.getByRole('heading',{name:'A lovely little victory!'})).toBeVisible();
});
