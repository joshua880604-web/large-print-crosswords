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
