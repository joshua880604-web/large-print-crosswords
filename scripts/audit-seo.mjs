// Validate generated HTML rather than assuming templates produce crawlable pages.
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {join,relative} from 'node:path';
import assert from 'node:assert/strict';
const dist=new URL('../dist/',import.meta.url).pathname;
const origin='https://largeprintcrosswords.com';
const puzzles=JSON.parse(readFileSync(new URL('../src/data/puzzles.json',import.meta.url),'utf8'));
const recommendations=JSON.parse(readFileSync(new URL('../src/data/puzzle-recommendations.json',import.meta.url),'utf8'));
const decode=s=>s.replace(/&(#x[0-9a-f]+|#[0-9]+|quot|apos|amp|lt|gt);/gi,(_,entity)=>{
 if(entity[0]==='#')return String.fromCodePoint(entity[1].toLowerCase()==='x'?parseInt(entity.slice(2),16):Number(entity.slice(1)));
 return {quot:'"',apos:"'",amp:'&',lt:'<',gt:'>'}[entity.toLowerCase()];
});
const attr=(tag,name)=>tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1]||'';
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(dir,e.name)):[join(dir,e.name)]);}
function meta(html,name){return (html.match(/<meta\b[^>]*>/g)||[]).find(tag=>attr(tag,'name')===name||attr(tag,'property')===name)||'';}
function canonical(html){return (html.match(/<link\b[^>]*>/g)||[]).find(tag=>attr(tag,'rel')==='canonical')||'';}
function renderedPuzzleList(html,isPrintable){
 const featured=isPrintable ? html.match(/<section\b[^>]*class="featured-print"[^>]*>([\s\S]*?)<\/section>/)?.[1]||'' : '';
 const items=isPrintable ? featured.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g) : html.matchAll(/(<a\b[^>]*class="puzzle-card [^"]*"[^>]*>[\s\S]*?)<\/a>/g);
 return Array.from(items,([,markup],index)=>({
  '@type':'ListItem',position:index+1,
  name:decode(markup.match(/<h[34]\b[^>]*>([^<]+)<\/h[34]>/)?.[1]||''),
  url:origin+(markup.match(/<a\b[^>]*href="(\/crosswords\/[^"/]+\/)"/)?.[1]||''),
 }));
}
const descriptions=new Set(),titles=new Set(),indexable=new Set(),navigation=new Map();
const printPages=new Set();
const collectionItemUrls=new Set();
let puzzleCount=0,htmlCount=0,collectionCount=0;
for(const file of walk(dist).filter(f=>f.endsWith('.html'))){
 const name=relative(dist,file),html=readFileSync(file,'utf8');htmlCount++;
 const noindex=attr(meta(html,'robots'),'content').toLowerCase().split(/[,\s]+/).includes('noindex');
 const url=attr(canonical(html),'href');assert.ok(url.startsWith(origin+'/'),`${name}: production canonical required`);
 const title=decode(html.match(/<title>([^<]*)<\/title>/)?.[1]||'');
 const description=decode(attr(meta(html,'description'),'content'));
 assert.ok(title&&description,`${name}: title and description required`);
 assert.equal(attr(html.match(/<html\b[^>]*>/)?.[0]||'','lang'),'en-US',`${name}: document language`);
 assert.equal((html.match(/<h1\b/g)||[]).length,1,`${name}: exactly one primary heading`);
 assert.equal(attr(meta(html,'og:url'),'content'),url,`${name}: canonical and sharing URLs must agree`);
 assert.equal(attr(meta(html,'og:title'),'content'),attr(meta(html,'twitter:title'),'content'),`${name}: matching share titles`);
 assert.equal(attr(meta(html,'og:image'),'content'),origin+'/social-card.png');
 const source=html.match(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)?.[1];
 if(noindex)assert.equal(source,undefined,`${name}: noindex pages omit structured data`);
 if(name.startsWith('print/')){
  assert.ok(noindex,`${name}: print and answer sheets must carry noindex`);
  printPages.add(name);
 }
 if(name==='404.html')assert.ok(noindex,'404 should be excluded from indexing');
 if(!noindex){
  const expected=origin+'/'+(name==='index.html'?'':name.replace(/index\.html$/,''));
  assert.equal(url,expected,`${name}: canonical must identify this generated page without query parameters`);
  assert.ok(!titles.has(title),`${name}: duplicate indexable title`);titles.add(title);
  assert.ok(!descriptions.has(description),`${name}: duplicate indexable description`);descriptions.add(description);
  assert.ok(!indexable.has(url),`${name}: duplicate canonical`);indexable.add(url);
  assert.ok(source,`${name}: structured data missing`);
  const data=JSON.parse(source);assert.equal(data['@context'],'https://schema.org');
  const isTopic=/^[^/]+-crosswords\/index\.html$/.test(name);
  const isPrintable=name==='printable/index.html';
  const isCollection=isTopic||isPrintable||name==='crosswords/index.html';
  const page=data['@graph'].find(item=>item['@id']===`${url}#webpage`);
  assert.equal(page?.['@type'],isCollection?'CollectionPage':'WebPage',`${name}: structured page type`);
  assert.equal(page.url,url);assert.equal(page.name,title);assert.equal(page.description,description);
  const lists=data['@graph'].filter(item=>item['@type']==='ItemList');
  assert.equal(lists.length,isCollection?1:0,`${name}: puzzle lists in structured data`);
  if(isCollection){
   collectionCount++;
   const list=lists[0],items=renderedPuzzleList(html,isPrintable);
   assert.ok(items.length&&items.every(item=>item.name&&item.url.startsWith(`${origin}/crosswords/`)),`${name}: expected visible puzzle names and links`);
   assert.equal(new Set(items.map(item=>item.url)).size,items.length,`${name}: duplicate puzzle links in marked list`);
   assert.equal(list['@id'],`${url}#puzzle-list`);
   assert.deepEqual(page.mainEntity,{'@id':list['@id']});
   assert.equal(list.numberOfItems,items.length);
   assert.deepEqual(list.itemListElement,items,`${name}: structured list must match visible names, links and order`);
   for(const item of items)collectionItemUrls.add(item.url);
  }
  const isGame=/^crosswords\/[^/]+\/index\.html$/.test(name);
  const games=data['@graph'].filter(item=>item['@type']==='Game');
  assert.equal(games.length,isGame?1:0,`${name}: Game schema belongs on permanent puzzle pages`);
  if(isGame){
   puzzleCount++;
   const game=games[0];
   const heading=html.match(/<h1\b[^>]*>([^<]+)<\/h1>\s*<p\b[^>]*>([^<]+)<\/p>/);
   assert.ok(heading,`${name}: a visible puzzle title and introduction are required`);
   assert.deepEqual(game,{
    '@type':'Game','@id':`${url}#puzzle`,url,name:decode(heading[1]),description:decode(heading[2]),
    inLanguage:'en-US',genre:'Crossword puzzle',isAccessibleForFree:true,
   },`${name}: Game schema must describe the visible crossword`);
   assert.deepEqual(page.mainEntity,{'@id':game['@id']});
  }
  if(isGame||isTopic){
   const breadcrumb=data['@graph'].find(item=>item['@type']==='BreadcrumbList');
   assert.equal(breadcrumb?.itemListElement.length,3);assert.equal(breadcrumb.itemListElement.at(-1).item,url);
   assert.deepEqual(page.breadcrumb,{'@id':breadcrumb['@id']});
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
// Validate the two-way topic and series navigation in the generated HTML.
const topicUrls=[...indexable].filter(url=>url.endsWith('-crosswords/'));
assert.equal(collectionCount,topicUrls.length+2,'Both directories and all topic pages need structured puzzle lists');
for(const url of collectionItemUrls)assert.ok(indexable.has(url),`Structured puzzle list links to a non-indexable game: ${url}`);
const gamesBySeries=new Map();
const gameUrl=p=>`${origin}/crosswords/${p.id}/`;
for(const puzzle of puzzles){
 const urls=gamesBySeries.get(puzzle.series)||[];
 urls.push(gameUrl(puzzle));
 gamesBySeries.set(puzzle.series,urls);
}
for(const puzzle of puzzles){
 const url=gameUrl(puzzle),links=navigation.get(url);
 assert.ok(indexable.has(url),`${url}: current game must be indexable`);
 const printUrl=`${origin}/print/${puzzle.id}/`;
 const answerUrl=`${origin}/print/${puzzle.id}-answers/`;
 for(const slug of [puzzle.id,`${puzzle.id}-answers`]){
  assert.ok(printPages.delete(`print/${slug}/index.html`),`Missing noindex print page: /print/${slug}/`);
 }
 assert.ok(links.has(printUrl),`${url}: missing link to its print sheet`);
 assert.ok(navigation.get(printUrl)?.has(answerUrl),`${printUrl}: missing link to its answer sheet`);
 assert.ok(topicUrls.some(topic=>links.has(topic)&&navigation.get(topic).has(url)),
  `${url}: needs a reciprocal topic link`);
 for(const peer of gamesBySeries.get(puzzle.series)){
  if(peer!==url)assert.ok(links.has(peer),`${url}: missing link to series peer ${peer}`);
 }
}
const puzzlesById=new Map(puzzles.map(puzzle=>[puzzle.id,puzzle]));
for(const {puzzles: ids} of recommendations){
 assert.equal(ids.length,2,'A recommendation connects two games');
 const [first,second]=ids.map(id=>puzzlesById.get(id));
 assert.ok(first&&second&&first.series!==second.series,`Recommendation must link two current games from different series: ${ids.join(', ')}`);
 const a=gameUrl(first),b=gameUrl(second);
 assert.ok(navigation.get(a).has(b)&&navigation.get(b).has(a),`Recommendation must appear in both games: ${ids.join(', ')}`);
}
const sitemap=readFileSync(join(dist,'sitemap.xml'),'utf8');
const listed=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>decode(m[1]));
assert.equal(new Set(listed).size,listed.length,'Sitemap has duplicate URLs');
assert.deepEqual([...listed].sort(),[...indexable].sort(),'Sitemap must match all indexable pages, excluding print copies and 404');
assert.equal(puzzleCount,puzzles.length);
assert.equal(printPages.size,0,'Unexpected print pages outside the current collection');
assert.ok(indexable.has(`${origin}/printable/`),'Printable directory must be indexable');
const robots=readFileSync(join(dist,'robots.txt'),'utf8');assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`));assert.ok(!/Disallow:\s*\/\s*$/m.test(robots));
const dailyOrder=JSON.parse(readFileSync(join(dist,'daily-order.json'),'utf8'));
assert.deepEqual(dailyOrder,puzzles.map(puzzle=>puzzle.id),'Daily rotation must use current puzzle URLs in catalog order');
const dailyRoutes=JSON.parse(readFileSync(join(dist,'_routes.json'),'utf8'));
assert.deepEqual(dailyRoutes.include,['/daily','/daily/'],'Only the daily page should invoke its Pages Function');
assert.ok(indexable.has(`${origin}/daily/`),'Daily crossword must keep its indexable canonical URL');
// The AI-readable guide must point to real canonical pages or the sitemap.
const llms=readFileSync(join(dist,'llms.txt'),'utf8');
assert.match(llms,/^# Large Print Crosswords\n/,'LLM guide needs its site heading');
assert.ok(!llms.includes('<html'),'LLM guide must be plain Markdown, not an HTML fallback');
for(const [,url] of llms.matchAll(/\[[^\]]+\]\((https:\/\/[^)]+)\)/g)){
 assert.ok(indexable.has(url)||url===`${origin}/sitemap.xml`,`LLM guide links to a missing or noncanonical page: ${url}`);
}
const image=readFileSync(join(dist,'social-card.png'));assert.equal(image.subarray(1,4).toString(),'PNG');assert.equal(image.readUInt32BE(16),1200);assert.equal(image.readUInt32BE(20),630);
const catalog=JSON.parse(readFileSync(join(dist,'puzzle-catalog.json'),'utf8'));
assert.deepEqual(catalog.map(({id,title,theme,subtheme,series,rows,cols,revision})=>({id,title,theme,subtheme,series,rows,cols,revision})),puzzles.map(({id,title,theme,subtheme,series,rows,cols,revision})=>({id,title,theme,subtheme,series,rows,cols,revision})),'Search catalog must contain all current games in order');
const firstIndex=`${origin}/puzzle-index/1/`;
const textIndex=new Set();
for(const [url,links] of navigation){
 if(!url.startsWith(`${origin}/puzzle-index/`))continue;
 assert.ok(!indexable.has(url),`${url}: navigation-only index pages must be noindex`);
 assert.ok(navigation.get(firstIndex)?.has(url),`${url}: text index page needs a direct HTML link`);
 for(const link of links)textIndex.add(link);
}
for(const puzzle of puzzles){
 assert.ok(textIndex.has(gameUrl(puzzle)),`${puzzle.id}: missing from text index`);
 assert.ok(textIndex.has(`${origin}/print/${puzzle.id}/`)&&textIndex.has(`${origin}/print/${puzzle.id}-answers/`),`${puzzle.id}: text index must link to both sheets`);
}
for(const path of ['crosswords/index.html','printable/index.html']){
 const html=readFileSync(join(dist,path),'utf8');
 const previews=(html.match(/<img\b[^>]*>/g)||[]).filter(tag=>attr(tag,'src').startsWith('/previews/'));
 assert.equal(previews.length,Math.min(12,puzzles.length),`${path}: only the initial cards should be present`);
 assert.ok(navigation.get(origin+'/'+path.replace('index.html',''))?.has(firstIndex),`${path}: text index must be available without scripts`);
 assert.ok(!html.includes('class="mini-cell'),`${path}: decorative cards must not expand every board cell into the DOM`);
 for(const tag of previews){assert.equal(attr(tag,'alt'),'');assert.equal(attr(tag,'loading'),'lazy');assert.ok(Number(attr(tag,'width'))>0&&Number(attr(tag,'height'))>0,'Preview needs intrinsic dimensions');}
}
console.log(`PASS SEO: ${htmlCount} HTML pages; ${puzzleCount} indexable puzzles; ${listed.length} unique sitemap URLs; ${puzzleCount*2} noindex print copies; unique titles/descriptions, canonical URLs, structured data, internal targets, and 1200 × 630 sharing image verified.`);
console.log(`SCHEMA: ${puzzleCount} Game nodes match their visible titles and introductions; ${collectionCount} collection lists match their visible game titles, links and order.`);
console.log(`CRAWL: all ${indexable.size} indexable pages reachable through HTML links within ${Math.max(...depth.values())} clicks of home; the text index links to all games and both print sheets without scripts.`);
