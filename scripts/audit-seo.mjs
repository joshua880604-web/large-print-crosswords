// Validate generated HTML rather than assuming templates produce crawlable pages.
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {join,relative} from 'node:path';
import assert from 'node:assert/strict';
const dist=new URL('../dist/',import.meta.url).pathname;
const origin='https://largeprintcrosswords.com';
const puzzles=JSON.parse(readFileSync(new URL('../src/data/puzzles.json',import.meta.url),'utf8'));
const decode=s=>s.replace(/&(#x[0-9a-f]+|#[0-9]+|quot|apos|amp|lt|gt);/gi,(_,entity)=>{
 if(entity[0]==='#')return String.fromCodePoint(entity[1].toLowerCase()==='x'?parseInt(entity.slice(2),16):Number(entity.slice(1)));
 return {quot:'"',apos:"'",amp:'&',lt:'<',gt:'>'}[entity.toLowerCase()];
});
const attr=(tag,name)=>tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1]||'';
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(dir,e.name)):[join(dir,e.name)]);}
function meta(html,name){return (html.match(/<meta\b[^>]*>/g)||[]).find(tag=>attr(tag,'name')===name||attr(tag,'property')===name)||'';}
function canonical(html){return (html.match(/<link\b[^>]*>/g)||[]).find(tag=>attr(tag,'rel')==='canonical')||'';}
const descriptions=new Set(),titles=new Set(),indexable=new Set(),navigation=new Map();
let printCount=0,puzzleCount=0,htmlCount=0;
for(const file of walk(dist).filter(f=>f.endsWith('.html'))){
 const name=relative(dist,file),html=readFileSync(file,'utf8');htmlCount++;
 const noindex=attr(meta(html,'robots'),'content').includes('noindex');
 const url=attr(canonical(html),'href');assert.ok(url.startsWith(origin+'/'),`${name}: production canonical required`);
 const title=decode(html.match(/<title>([^<]*)<\/title>/)?.[1]||'');
 const description=decode(attr(meta(html,'description'),'content'));
 assert.ok(title&&description,`${name}: title and description required`);
 assert.equal(attr(html.match(/<html\b[^>]*>/)?.[0]||'','lang'),'en-US',`${name}: document language`);
 assert.equal((html.match(/<h1\b/g)||[]).length,1,`${name}: exactly one primary heading`);
 assert.equal(attr(meta(html,'og:url'),'content'),url,`${name}: canonical and sharing URLs must agree`);
 assert.equal(attr(meta(html,'og:title'),'content'),attr(meta(html,'twitter:title'),'content'),`${name}: matching share titles`);
 assert.equal(attr(meta(html,'og:image'),'content'),origin+'/social-card.png');
 if(name.startsWith('print/')){printCount++;assert.ok(noindex,`${name}: utility copies should not compete in search`);}
 if(name==='404.html')assert.ok(noindex,'404 should be excluded from indexing');
 if(!noindex){
  const expected=origin+'/'+(name==='index.html'?'':name.replace(/index\.html$/,''));
  assert.equal(url,expected,`${name}: canonical must identify this generated page without query parameters`);
  assert.ok(!titles.has(title),`${name}: duplicate indexable title`);titles.add(title);
  assert.ok(!descriptions.has(description),`${name}: duplicate indexable description`);descriptions.add(description);
  assert.ok(!indexable.has(url),`${name}: duplicate canonical`);indexable.add(url);
  const source=html.match(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)?.[1];assert.ok(source,`${name}: structured data missing`);
  const data=JSON.parse(source);assert.equal(data['@context'],'https://schema.org');
  const page=data['@graph'].find(item=>item['@type']==='WebPage');assert.equal(page.url,url);assert.equal(page.name,title);assert.equal(page.description,description);
  if(/^crosswords\/[^/]+\/index\.html$/.test(name)){
   puzzleCount++;
   const breadcrumb=data['@graph'].find(item=>item['@type']==='BreadcrumbList');assert.equal(breadcrumb.itemListElement.length,3);assert.equal(breadcrumb.itemListElement.at(-1).item,url);
   assert.ok(html.includes('aria-label="Breadcrumb"'),`${name}: breadcrumb data needs a visible counterpart`);
  }
 }
 const destinations=new Set();
 // Verify every root-relative navigation and asset link resolves to a generated file.
 for(const tag of html.match(/<(?:a|link|script|img)\b[^>]*>/g)||[]){
  const value=decode(attr(tag,'href')||attr(tag,'src'));
  if(!value.startsWith('/')||value.startsWith('//'))continue;
  const path=new URL(value,origin).pathname;
  assert.ok(existsSync(join(dist,path))||existsSync(join(dist,path,'index.html')),`${name}: missing internal target ${path}`);
  if(tag.startsWith('<a')&&!attr(tag,'rel').split(/\s+/).includes('nofollow'))destinations.add(origin+path);
 }
 navigation.set(url,destinations);
}
// Sitemap membership alone does not make a page discoverable through the site.
// Follow ordinary HTML anchors through indexable pages, without JavaScript or
// relying on print/previous-edition utility pages as the only route to a game.
const depth=new Map([[origin+'/',0]]),queue=[origin+'/'];
for(let i=0;i<queue.length;i++)for(const target of navigation.get(queue[i])||[]){
 if(indexable.has(target)&&!depth.has(target)){depth.set(target,depth.get(queue[i])+1);queue.push(target);}
}
for(const url of indexable)assert.ok(depth.has(url),`Indexable page has no HTML navigation path from home: ${url}`);
const sitemap=readFileSync(join(dist,'sitemap.xml'),'utf8');
const listed=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>decode(m[1]));
assert.equal(new Set(listed).size,listed.length,'Sitemap has duplicate URLs');
assert.deepEqual([...listed].sort(),[...indexable].sort(),'Sitemap must match all indexable pages, excluding print copies and 404');
assert.equal(puzzleCount,puzzles.length);assert.equal(printCount,puzzles.length*2);
const robots=readFileSync(join(dist,'robots.txt'),'utf8');assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`));assert.ok(!/Disallow:\s*\/\s*$/m.test(robots));
const image=readFileSync(join(dist,'social-card.png'));assert.equal(image.subarray(1,4).toString(),'PNG');assert.equal(image.readUInt32BE(16),1200);assert.equal(image.readUInt32BE(20),630);
for(const path of ['crosswords/index.html','printable/index.html']){
 const html=readFileSync(join(dist,path),'utf8');
 const previews=(html.match(/<img\b[^>]*>/g)||[]).filter(tag=>attr(tag,'src').startsWith('/previews/'));
 assert.equal(previews.length,puzzles.length,`${path}: each puzzle keeps its preview and HTML link`);
 assert.ok(!html.includes('class="mini-cell'),`${path}: decorative cards must not expand every board cell into the DOM`);
 for(const tag of previews){assert.equal(attr(tag,'alt'),'');assert.equal(attr(tag,'loading'),'lazy');assert.ok(Number(attr(tag,'width'))>0&&Number(attr(tag,'height'))>0,'Preview needs intrinsic dimensions');}
}
console.log(`PASS SEO: ${htmlCount} HTML pages; ${puzzleCount} indexable puzzles; ${listed.length} unique sitemap URLs; ${printCount} noindex print copies; unique titles/descriptions, canonical URLs, structured data, internal targets, and 1200 × 630 sharing image verified.`);
console.log(`CRAWL: all ${indexable.size} indexable pages reachable through HTML links within ${Math.max(...depth.values())} clicks of home; collection previews use dimensioned, lazy-loaded images.`);
