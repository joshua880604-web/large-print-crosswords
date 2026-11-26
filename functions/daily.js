import {dailyDescription,dailySelection,dailyTitle} from '../src/data/daily.mjs';

const site='https://largeprintcrosswords.com/';
const canonical=`${site}daily/`;

function freshResponse(response,method){
 const headers=new Headers(response.headers);
 headers.set('Cache-Control','no-store');
 for(const key of ['content-encoding','content-length','etag','last-modified'])headers.delete(key);
 return new Response(method==='HEAD' ? null : response.body,{
  headers,status:response.status,
 });
}

function renderDaily(response,{date,readable,puzzle}){
 const structuredData={
  '@context':'https://schema.org',
  '@graph':[
   {'@type':'WebSite','@id':`${site}#website`,url:site,name:'Large Print Crosswords',inLanguage:'en-US'},
   {'@type':'WebPage','@id':`${canonical}#webpage`,url:canonical,name:dailyTitle,description:dailyDescription,
    inLanguage:'en-US',dateModified:date,isPartOf:{'@id':`${site}#website`}},
  ],
 };
 const text=value=>({element:element=>element.setInnerContent(value)});
 const attribute=(name,value)=>({element:element=>element.setAttribute(name,value)});
 const markup=value=>({element:element=>element.setInnerContent(value,{html:true})});
 const links=`<p class="notice daily-links"><a href="/crosswords/${puzzle}/">Open this puzzle’s permanent link</a> · <a href="/print/${puzzle}-answers/">Print answers</a></p>`;
 return new HTMLRewriter()
  .on('head title',text(dailyTitle))
  .on('head link[rel="canonical"]',attribute('href',canonical))
  .on('head meta[property="og:url"]',attribute('content',canonical))
  .on('head meta[property="og:title"], head meta[name="twitter:title"]',attribute('content',dailyTitle))
  .on('head meta[name="description"], head meta[property="og:description"], head meta[name="twitter:description"]',attribute('content',dailyDescription))
  .on('head script[type="application/ld+json"]',markup(JSON.stringify(structuredData)))
  .on('.site-header nav a[href="/crosswords/"]',{element:element=>element.removeAttribute('aria-current')})
  .on('.site-header nav a[href="/daily/"]',attribute('aria-current','page'))
  .on('.breadcrumb',{element:element=>element.remove()})
  .on('.game-header .eyebrow',markup(`Daily crossword · <time datetime="${date}">${readable}</time>`))
  .on('.game-header a[href^="/print/"]',text('Print today’s puzzle →'))
  .on('.game-header',{element:element=>element.after(links,{html:true})})
  .transform(response);
}

export async function dailyResponse({request,env,next},now=new Date()){
 if(request.method!=='GET'&&request.method!=='HEAD')return next();
 const url=new URL(request.url);
 if(url.pathname==='/daily'){
  url.pathname='/daily/';
  return Response.redirect(url,308);
 }
 try{
  const asset=path=>env.ASSETS.fetch(new URL(path,url).href);
  const order=await asset('/daily-order.json');
  if(!order.ok)throw new Error('Daily rotation is unavailable');
  const selection=dailySelection(await order.json(),now);
  if(!/^[a-z0-9][a-z0-9-]*$/.test(selection.puzzle ?? ''))throw new Error('Daily rotation returned an invalid puzzle');
  const page=await asset(`/crosswords/${selection.puzzle}/`);
  if(!page.ok||!page.headers.get('Content-Type')?.includes('text/html'))throw new Error('Daily puzzle page is unavailable');
  return freshResponse(renderDaily(page,selection),request.method);
 }catch(error){
  console.error('Could not render the daily crossword:',error);
  return freshResponse(await next(),request.method);
 }
}

export const onRequest=context=>dailyResponse(context);
