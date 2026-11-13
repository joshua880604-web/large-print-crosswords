import {test,expect} from '@playwright/test';
import puzzles from '../src/data/puzzles.json' with {type:'json'};

test('production metadata survives query strings and matches visible breadcrumbs',async({page,request})=>{
 const ampPuzzle=puzzles.find(p=>p.title.includes('&'))!;
 expect(ampPuzzle).toBeDefined();
 await page.goto(`/crosswords/${ampPuzzle.id}/?utm_source=launch-check`);
 const canonical=`https://largeprintcrosswords.com/crosswords/${ampPuzzle.id}/`;
 await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href',canonical);
 await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content',canonical);
 await expect(page.getByRole('navigation',{name:'Breadcrumb',exact:true})).toContainText(ampPuzzle.title);
 const data=await page.locator('script[type="application/ld+json"]').evaluate(el=>JSON.parse(el.textContent!)) as {'@graph':{'@type':string;name?:string;description?:string;itemListElement?:{name:string;item:string}[]}[]};
 const webPage=data['@graph'].find(item=>item['@type']==='WebPage')!;
 expect(webPage.name).toEqual(await page.title());
 expect(webPage.description).toEqual(await page.locator('meta[name=description]').getAttribute('content'));
 const crumbs=data['@graph'].find(item=>item['@type']==='BreadcrumbList')!.itemListElement!;
 expect(crumbs.map(crumb=>crumb.name)).toEqual(['Home','Crosswords',ampPuzzle.title]);
 expect(crumbs.at(-1)!.item).toEqual(canonical);
 await expect(page.locator('meta[name=robots]')).toHaveCount(0);
 await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content','summary_large_image');
 const response=await request.get('/social-card.png');expect(response.status()).toEqual(200);expect(response.headers()['content-type']).toContain('image/png');
 const image=await response.body();expect(image.readUInt32BE(16)).toEqual(1200);expect(image.readUInt32BE(20)).toEqual(630);
});

test('print copies and missing pages are excluded from indexing',async({page,request})=>{
 await page.goto('/print/garden-days-answers/');await expect(page.locator('meta[name=robots]')).toHaveAttribute('content','noindex,follow');
 const missing=await request.get('/this-puzzle-does-not-exist/');expect(missing.status()).toEqual(404);expect(await missing.text()).toContain('noindex,follow');
 const response=await request.get('/robots.txt');expect(await response.text()).toContain('Sitemap: https://largeprintcrosswords.com/sitemap.xml');
});

test('collections keep every puzzle crawlable without scripts and load compact previews',async({browser,request})=>{
 const context=await browser.newContext({javaScriptEnabled:false}),page=await context.newPage();
 try{
  for(const path of ['/crosswords/','/printable/']){
   await page.goto(path);
   await expect(page.locator('a.puzzle-card')).toHaveCount(puzzles.length);
   const links=await page.locator('a.puzzle-card').evaluateAll(anchors=>anchors.map(a=>a.getAttribute('href')));
   expect(links.sort()).toEqual(puzzles.map(p=>`/crosswords/${p.id}/`).sort());
   await expect(page.locator('.puzzle-card .mini-cell')).toHaveCount(0);
   await expect(page.locator('.puzzle-card img[loading="lazy"][alt=""]')).toHaveCount(puzzles.length);
  }
  // A rectangular preview must keep its real board geometry and clue numbers.
  const puzzle=puzzles.find(p=>p.rows!==p.cols)!;
  const response=await request.get(`/previews/${puzzle.id}-v${puzzle.revision||1}.svg`);
  expect(response.status()).toBe(200);expect(response.headers()['content-type']).toContain('image/svg+xml');
  const svg=await response.text();
  expect(svg).toContain(`viewBox="0 0 ${puzzle.cols*24} ${puzzle.rows*24}"`);
  const starts=new Set(puzzle.entries.map(e=>e.number));
  expect([...svg.matchAll(/<text\b[^>]*>(\d+)<\/text>/g)].map(m=>Number(m[1])).sort((a,b)=>a-b)).toEqual([...starts].sort((a,b)=>a-b));
  const image=page.locator(`.puzzle-card[href="/crosswords/${puzzle.id}/"] img`);
  await image.scrollIntoViewIfNeeded();
  await expect(image).toHaveJSProperty('complete',true);
  expect(await image.evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBe(puzzle.cols*24);
 }finally{await context.close();}
});
