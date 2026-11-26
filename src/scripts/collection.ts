import {catalogPageSize, type CatalogPuzzle} from '../data/catalog';
import {collectionSearchText, normaliseSearch} from './search';

const search=document.querySelector<HTMLInputElement>('#puzzle-search')!;
const select=document.querySelector<HTMLSelectElement>('#theme-select')!;
const collection=document.querySelector<HTMLElement>('.collection-grid')!;
const grid=collection.querySelector<HTMLElement>('.puzzle-cards')!;
const more=collection.querySelector<HTMLButtonElement>('#load-more')!;
const clear=document.querySelector<HTMLButtonElement>('#clear-filters')!;
const result=document.querySelector<HTMLElement>('.result-count')!;
const empty=collection.querySelector<HTMLElement>('.empty-state')!;
const error=collection.querySelector<HTMLElement>('.catalog-error');
const url=collection.dataset.catalog;
const print=collection.dataset.print==='true';
const total=Number(collection.dataset.total);
const initialCards=Array.from(grid.querySelectorAll<HTMLElement>('[data-title]'),row=>({
 row, theme:row.dataset.theme, search:normaliseSearch(row.dataset.title ?? ''),
}));
const initialById=new Map(initialCards.map(({row})=>[row.dataset.id,row]));
const cardTemplate=url ? initialCards[0]?.row.cloneNode(true) as HTMLElement | undefined : undefined;
type CatalogEntry = {puzzle:CatalogPuzzle; search:string; index:number};
let catalog:CatalogEntry[] | undefined;
let download:Promise<CatalogEntry[]> | undefined;
let limit=catalogPageSize;
let updateNumber=0;

function loadCatalog(source:string){
 download ??= fetch(source).then(async response=>{
  if(!response.ok)throw new Error('Puzzle catalog unavailable');
  const puzzles:CatalogPuzzle[]=await response.json();
  catalog=puzzles.map((puzzle,index)=>({puzzle,index,search:normaliseSearch(collectionSearchText(puzzle))}));
  return catalog;
 }).finally(()=>{download=undefined;});
 return download;
}

function catalogRow({puzzle,index}:CatalogEntry){
 const existing=initialById.get(puzzle.id);
 if(existing)return existing;

 // Clone the same server-rendered card used by the initial entries.
 const row=cardTemplate!.cloneNode(true) as HTMLElement;
 const link=row.querySelector<HTMLAnchorElement>('a.puzzle-card')!;
 const preview=link.querySelector<HTMLImageElement>('img.mini-grid')!;
 row.dataset.id=puzzle.id;
 row.dataset.title=collectionSearchText(puzzle);
 row.dataset.theme=puzzle.theme;
 link.classList.remove('tone-0','tone-1','tone-2','tone-3');
 link.classList.add(`tone-${index%4}`);
 link.href=print ? `/print/${puzzle.id}/` : `/crosswords/${puzzle.id}/`;
 link.querySelector('.pill')!.textContent=puzzle.subtheme || puzzle.theme;
 link.querySelector('.card-meta')!.textContent=`EASY • ${puzzle.rows} × ${puzzle.cols}`;
 link.querySelector('h3')!.textContent=puzzle.title;
 link.querySelector('.card-body p')!.textContent=puzzle.description;
 preview.width=puzzle.cols*24;
 preview.height=puzzle.rows*24;
 preview.src=`/previews/${puzzle.id}-v${puzzle.revision || 1}.svg`;
 if(print){
  const links=row.querySelector<HTMLElement>('.print-card-links')!;
  const [answers,play]=links.querySelectorAll<HTMLAnchorElement>('a');
  links.setAttribute('aria-label',`More options for ${puzzle.title}`);
  answers.href=`/print/${puzzle.id}-answers/`;
  answers.setAttribute('aria-label',`Answer sheet for ${puzzle.title}`);
  play.href=`/crosswords/${puzzle.id}/`;
  play.setAttribute('aria-label',`Play ${puzzle.title} online`);
 }
 return row;
}

function filters(){
 return {q:search.value.trim(),theme:select.value};
}

function remember(q:string,theme:string){
 const locationUrl=new URL(location.href);
 if(q)locationUrl.searchParams.set('q',q);else locationUrl.searchParams.delete('q');
 if(theme)locationUrl.searchParams.set('theme',theme);else locationUrl.searchParams.delete('theme');
 try{history.replaceState({...history.state,lpcCollection:{q,theme,limit}},'',locationUrl);}catch{}
}

function showCount(shown:number,matches:number){
 result.textContent=`Showing ${shown} of ${matches} ${matches===1?'puzzle':'puzzles'}`;
 empty.hidden=matches!==0;
 more.hidden=shown===matches;
}

async function filter({reset=true,focusNew=false}={}){
 const update=++updateNumber;
 const {q,theme}=filters();
 const query=normaliseSearch(q);
 if(reset)limit=catalogPageSize;
 const previouslyShown=grid.querySelectorAll('[data-title]:not([hidden])').length;
 clear.hidden=!q&&!theme;
 remember(q,theme);
 if(error)error.hidden=true;
 more.disabled=false;
 grid.hidden=false;
 grid.removeAttribute('aria-busy');

 if(!url){
  const matching=initialCards.filter(card=>card.search.includes(query)&&(!theme||card.theme===theme));
  const visible=new Set(matching.slice(0,limit));
  initialCards.forEach(card=>card.row.hidden=!visible.has(card));
  showCount(visible.size,matching.length);
 }else if(!query&&!theme&&limit<=catalogPageSize){
  grid.replaceChildren(...initialCards.map(card=>card.row));
  showCount(initialCards.length,total);
 }else{
  if(!catalog){
   result.textContent='Loading puzzle matches…';
   empty.hidden=true;
   more.disabled=true;
   grid.hidden=Boolean(query||theme);
   grid.setAttribute('aria-busy','true');
   try{await loadCatalog(url);}
   catch{
    if(update!==updateNumber)return;
    grid.removeAttribute('aria-busy');
    result.textContent='Puzzle matches unavailable.';
    more.hidden=true;
    if(error)error.hidden=false;
    return;
   }
   if(update!==updateNumber)return;
  }
  const matching=catalog!.filter(({puzzle,search})=>search.includes(query)&&(!theme||puzzle.theme===theme));
  const visible=matching.slice(0,limit);
  grid.replaceChildren(...visible.map(catalogRow));
  grid.hidden=false;
  grid.removeAttribute('aria-busy');
  more.disabled=false;
  showCount(visible.length,matching.length);
 }
 if(focusNew)grid.querySelectorAll<HTMLElement>('[data-title]:not([hidden]) a.puzzle-card')[previouslyShown]?.focus();
}

function restore(){
 const params=new URL(location.href).searchParams;
 search.value=params.get('q')||'';
 const theme=params.get('theme')||'';
 select.value=Array.from(select.options).some(option=>option.value===theme)?theme:'';
 const saved=history.state?.lpcCollection,{q,theme:selectedTheme}=filters();
 limit=saved?.q===q&&saved?.theme===selectedTheme&&Number.isInteger(saved.limit)?Math.max(catalogPageSize,Math.min(saved.limit,total)):catalogPageSize;
 void filter({reset:false});
}

search.addEventListener('input',()=>void filter());
select.addEventListener('change',()=>void filter());
clear.addEventListener('click',()=>{search.value='';select.value='';void filter();search.focus({preventScroll:true});});
more.addEventListener('click',()=>{limit+=catalogPageSize;void filter({reset:false,focusNew:true});});
error?.querySelector('button')?.addEventListener('click',()=>void filter({reset:false}));
window.addEventListener('popstate',restore);
window.addEventListener('pageshow',restore);
restore();
search.disabled=false;
select.disabled=false;
