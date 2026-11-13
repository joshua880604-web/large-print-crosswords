import {test,expect} from '@playwright/test';
import puzzles from '../src/data/puzzles.json' with {type:'json'};

test('sports collection offers adult everyday topics with playable and print links',async({page})=>{
 await page.goto('/sports-crosswords/');
 await expect(page.getByRole('heading',{level:1})).toHaveText('Sports crosswords in large print.');
 await expect(page.locator('.puzzle-card')).toHaveCount(20);
 await page.getByLabel('Find a puzzle').fill('golf');
 await expect(page.locator('[data-title]:visible')).toHaveCount(1);
 await page.getByRole('link',{name:/A Round of Golf/}).first().click();
 await expect(page).toHaveURL(/\/crosswords\/leisure-sports\/$/);
 await expect(page.getByRole('link',{name:'Print this puzzle →'})).toHaveAttribute('href','/print/leisure-sports/');
 await expect(page.getByRole('link',{name:'Explore more sports crosswords →'})).toHaveAttribute('href','/sports-crosswords/');
});

test('music collection combines existing and new subjects and appears in the sitemap',async({page,request})=>{
 await page.goto('/music-crosswords/');
 await expect(page.locator('.puzzle-card')).toHaveCount(20);
 await page.getByLabel('Find a puzzle').fill('guitar');
 await expect(page.locator('[data-title]:visible')).toHaveCount(1);
 await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href','https://largeprintcrosswords.com/music-crosswords/');
 const map=await(await request.get('/sitemap.xml')).text();
 expect(map).toContain('/music-crosswords/');expect(map).toContain('/sports-crosswords/');
 await page.getByRole('link',{name:/Inside a Guitar Case/}).click();
 await expect(page.getByRole('link',{name:'Explore more music crosswords →'})).toHaveAttribute('href','/music-crosswords/');
});

for(const topic of [
 {path:'/geography-crosswords/',heading:'Geography crosswords in large print.',count:10,slug:'geography-journeys'},
 {path:'/american-history-crosswords/',heading:'American history crosswords in large print.',count:5,slug:'american-history-scenes'},
 {path:'/texas-crosswords/',heading:'Texas crosswords in large print.',count:5,slug:'texas-scenes'}
])test(`new topic ${topic.path} links to real games, print sheets and a canonical collection`,async({page,request})=>{
 await page.goto('/');
 await expect(page.locator(`a[href="${topic.path}"]`)).toBeVisible();
 await page.locator(`a[href="${topic.path}"]`).click();
 await expect(page.getByRole('heading',{level:1})).toHaveText(topic.heading);
 await expect(page.locator('.puzzle-card')).toHaveCount(topic.count);
 await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href',`https://largeprintcrosswords.com${topic.path}`);
 expect(await(await request.get('/sitemap.xml')).text()).toContain(topic.path);
 await page.locator(`a.puzzle-card[href="/crosswords/${topic.slug}/"]`).click();
 await expect(page.getByRole('link',{name:'Print this puzzle →'})).toHaveAttribute('href',`/print/${topic.slug}/`);
 await expect(page.locator(`.notice a[href="${topic.path}"]`)).toBeVisible();
 await page.getByRole('link',{name:'Print this puzzle →'}).click();
 await expect(page.getByRole('link',{name:'Separate answer sheet'})).toHaveAttribute('href',`/print/${topic.slug}-answers/`);
});

test('state capitals filter shares a focused collection and accepts a city without spaces',async({page})=>{
 await page.goto('/geography-crosswords/?theme=State+Capitals');
 await expect(page.locator('[data-title]:visible')).toHaveCount(5);
 await page.getByLabel('Find a puzzle').fill('Midwest');
 await expect(page.locator('[data-title]:visible')).toHaveCount(1);
 await page.getByRole('link',{name:/Capital Stops in the Midwest/}).first().click();
 const puzzle=puzzles.find(p=>p.id==='state-capital-stops-3')!;
 const entry=puzzle.entries.find(e=>e.answer==='DESMOINES')!;
 expect(entry.clue).toContain('spaces omitted');
 await page.locator(`[data-entry="${entry.number}-${entry.direction}"]`).click();
 await page.keyboard.type(entry.answer);
 await page.reload();
 for(let i=0;i<entry.answer.length;i++){
  const row=entry.row+(entry.direction==='down'?i:0),col=entry.col+(entry.direction==='across'?i:0);
  await expect(page.locator(`[data-cell="${row},${col}"] input`)).toHaveValue(entry.answer[i]);
 }
 await expect(page.getByRole('link',{name:'Continue your previous puzzle'})).toHaveCount(0);
});
