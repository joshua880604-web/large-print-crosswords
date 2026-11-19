import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('print directory opens the sheet directly and keeps answers and play separate',async({page,browser})=>{
 test.setTimeout(90_000);
 await page.setViewportSize({width:390,height:844});
 await page.goto('/printable/?q=Garden+Tools');
 const card=page.locator('a.puzzle-card:visible').first();
 await expect(card).toContainText('Print puzzle');
 await expect(card).toHaveAttribute('href','/print/garden-days/');
 const row=page.locator('[data-title]:visible').first();
 await expect(row.getByRole('link',{name:'Answer sheet for Garden Tools',exact:true})).toHaveAttribute('href','/print/garden-days-answers/');
 await expect(row.getByRole('link',{name:'Play Garden Tools online',exact:true})).toHaveAttribute('href','/crosswords/garden-days/');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
 await card.click();
 await expect(page).toHaveURL(/\/print\/garden-days\/$/);
 await expect(page.getByRole('button',{name:'Print puzzle',exact:true})).toBeEnabled();
 await expect(page.getByLabel('Print size')).toHaveValue('large');
 await page.getByRole('link',{name:'Separate answer sheet',exact:true}).click();
 await expect(page).toHaveURL(/\/print\/garden-days-answers\/\?layout=large$/);
 const context=await browser.newContext({javaScriptEnabled:false});
 try{
  // Chromium eagerly fetches lazy images when JavaScript is disabled.
  // This check exercises the catalog links and printable sheet.
  await context.route('**/previews/*.svg',route=>route.abort());
  const plain=await context.newPage();await plain.goto('/printable/',{waitUntil:'domcontentloaded'});
  const featured=plain.getByRole('region',{name:'Featured puzzles to print'});
  await expect(featured.getByRole('heading',{level:3})).toHaveText(['Gardening','Nostalgia','Food']);
  await expect(featured.locator('li > p')).toHaveCount(6);
  await expect(featured.locator('li > p').first()).toContainText('rinse the harvest');
  const featuredIds=[
   'garden-harvest-baskets','garden-harvest-baskets-2','street-sights-remembered-2',
   'family-photos-and-film-4','bakers-specialties-2','eating-at-the-diner-5'
  ];
  const featuredLinks=await featured.getByRole('link').evaluateAll(links=>links.map(link=>link.getAttribute('href')));
  expect(featuredLinks).toEqual(featuredIds.flatMap(id=>[
   `/print/${id}/`,`/print/${id}-answers/`,`/crosswords/${id}/`
  ]));
  await expect(plain.getByRole('link',{name:'Browse all puzzles',exact:true})).toHaveAttribute('href','#all-puzzles');
  await plain.locator('a.puzzle-card[href="/print/garden-days/"]').click();
  await expect(plain.locator('.print-clues')).toBeVisible();
  await expect(plain.getByRole('link',{name:'Separate answer sheet',exact:true})).toHaveAttribute('href','/print/garden-days-answers/');
 }finally{await context.close();}
});

for(const collection of ['christmas','thanksgiving','winter'])test(`${collection} pack offers the complete topic including cross-theme games`,async({page})=>{
 await page.goto(`/${collection}-crosswords/`);
 const ids=await page.locator('a.puzzle-card').evaluateAll(links=>links.map(a=>a.getAttribute('href')!.split('/')[2]).sort());
 await page.getByRole('link',{name:new RegExp(`Choose ${collection} puzzles for a print pack`,'i')}).click();
 await expect(page.getByLabel('Holiday or season')).toHaveValue(collection);
 expect(await page.locator('.pack-choice:visible input').evaluateAll(inputs=>inputs.map(el=>(el as HTMLInputElement).value).sort())).toEqual(ids);
 await expect(page.locator('#pack-results')).toHaveText(`${ids.length} puzzles shown.`);
 // The collection includes games whose Theme differs from the topic name.
 const crossTheme=page.locator(`.pack-choice:visible:not([data-theme="${collection[0].toUpperCase()+collection.slice(1)}"]) input`).first();
 await crossTheme.check();const id=await crossTheme.inputValue();
 await page.getByLabel('Holiday or season').selectOption('');
 await page.getByRole('combobox',{name:'Theme',exact:true}).selectOption('Gardening');
 await expect(page.locator(`input[value="${id}"]`)).toBeChecked();
 await page.getByRole('button',{name:'Prepare print pack'}).click();
 await expect(page.locator('#pack-status')).toContainText('Ready: 1 puzzle and separate answers, 4 US Letter pages.');
 await expect(page.locator('#pack-output .print-workspace')).toHaveCount(2);
});

test('invalid pack collection falls back safely and filters keep the ten-puzzle limit',async({page})=>{
 await page.goto('/print-pack/?collection=unknown&theme=Gardening');
 await expect(page.getByLabel('Holiday or season')).toHaveValue('');
 await expect(page.getByRole('combobox',{name:'Theme',exact:true})).toHaveValue('Gardening');
 await page.getByRole('combobox',{name:'Theme',exact:true}).selectOption('');
 await page.getByLabel('Holiday or season').selectOption('christmas');
 const choices=page.locator('.pack-choice:visible input');
 for(let i=0;i<10;i++)await choices.nth(i).check();
 await page.getByLabel('Holiday or season').selectOption('thanksgiving');
 const extra=page.locator('.pack-choice:visible input:not(:checked)').first();await extra.click();
 await expect(extra).not.toBeChecked();
 await expect(page.locator('#pack-count')).toHaveText('10 of 10 puzzles selected.');
 await page.getByLabel('Find a puzzle').fill('no-matching-puzzle');
 await expect(page.locator('#pack-results')).toHaveText('No puzzles match. Try another search, holiday, or theme.');
});
