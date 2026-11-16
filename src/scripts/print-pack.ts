import {normaliseSearch} from './search';

const form=document.querySelector<HTMLFormElement>('#pack-form')!;
const choices=[...form.querySelectorAll<HTMLInputElement>('input[name=puzzle]')];
const byId=new Map(choices.map(choice=>[choice.value,choice]));
const search=document.querySelector<HTMLInputElement>('#pack-search')!;
const theme=document.querySelector<HTMLSelectElement>('#pack-theme')!;
const collection=document.querySelector<HTMLSelectElement>('#pack-collection')!;
const layout=document.querySelector<HTMLSelectElement>('#pack-layout')!;
const answers=document.querySelector<HTMLInputElement>('#pack-answers')!;
const build=document.querySelector<HTMLButtonElement>('#pack-build')!;
const print=document.querySelector<HTMLButtonElement>('#pack-print')!;
const status=document.querySelector<HTMLElement>('#pack-status')!;
const output=document.querySelector<HTMLElement>('#pack-output')!;
const draftStatus=document.querySelector<HTMLElement>('#pack-draft-status')!;
const selectedList=document.querySelector<HTMLUListElement>('#pack-selected')!;
const labels=[...form.querySelectorAll<HTMLElement>('.pack-choice')];
const searchable=new Map(labels.map(label=>[label,normaliseSearch(label.dataset.search||'')]));
const draftKey='lpc:print-pack';
let generation=0,storageAvailable=true;
const selected=()=>choices.filter(choice=>choice.checked);
const option=(select:HTMLSelectElement,value:unknown)=>typeof value==='string'&&[...select.options].some(o=>o.value===value)?value:'';

function persist(){
 if(storageAvailable)try{
  localStorage.setItem(draftKey,JSON.stringify({version:1,ids:selected().map(c=>c.value),layout:layout.value,answers:answers.checked,
   filters:{q:search.value,theme:theme.value,collection:collection.value}}));
 }catch{storageAvailable=false;}
 const message=storageAvailable?'Your selection and print options are saved in this browser. Prepare the pack when you are ready.':'Your latest selection cannot be saved in this browser. Keep this page open to keep your choices.';
 if(draftStatus.textContent!==message)draftStatus.textContent=message;
}

function renderSelected(){
 const current=selected(),fragment=document.createDocumentFragment();
 for(const choice of current){
  const title=choice.closest<HTMLElement>('.pack-choice')!.dataset.title!;
  const item=document.createElement('li'),name=document.createElement('span'),remove=document.createElement('button');
  name.textContent=title;remove.type='button';remove.textContent='Remove';remove.setAttribute('aria-label',`Remove ${title}`);
  remove.addEventListener('click',()=>{
   const index=selected().indexOf(choice);choice.checked=false;invalidate();
   const buttons=selectedList.querySelectorAll<HTMLButtonElement>('button');
   (buttons[Math.min(index,buttons.length-1)]||search).focus({preventScroll:true});
  });
  item.append(name,remove);fragment.append(item);
 }
 selectedList.replaceChildren(fragment);
 document.querySelector<HTMLElement>('#pack-selected-empty')!.hidden=current.length>0;
 document.querySelector('#pack-count')!.textContent=`${current.length} of 10 puzzles selected.`;
}

function invalidate(save=true){
 generation++;print.disabled=true;output.replaceChildren();build.disabled=selected().length===0;
 renderSelected();status.textContent=selected().length?'Choose your puzzles, then prepare the pack.':'Choose at least one puzzle to begin.';
 if(save)persist();
}

function filter(remember=true){
 const query=normaliseSearch(search.value);let count=0;
 for(const label of labels){
  label.hidden=!!((collection.value&&!label.dataset.collections?.split(' ').includes(collection.value))||
   (theme.value&&label.dataset.theme!==theme.value)||(query&&!searchable.get(label)!.includes(query)));
  if(!label.hidden)count++;
 }
 document.querySelector('#pack-results')!.textContent=count?`${count} ${count===1?'puzzle':'puzzles'} shown.`:'No puzzles match. Try another search, holiday, or theme.';
 if(remember){
  const url=new URL(location.href);
  for(const [key,value] of [['q',search.value.trim()],['theme',theme.value],['collection',collection.value]]){
   if(value)url.searchParams.set(key,value);else url.searchParams.delete(key);
  }
  try{history.replaceState(history.state,'',url);}catch{}
  persist();
 }
}

function restore(){
 let raw:string|null=null;
 try{raw=localStorage.getItem(draftKey);}catch{storageAvailable=false;}
 let draft:Record<string,unknown>|null=null;
 try{const parsed=raw?JSON.parse(raw):null;if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed)&&parsed.version===1)draft=parsed;}catch{/* Ignore malformed drafts. */}
 for(const c of choices)c.checked=false;
 if(Array.isArray(draft?.ids)){
  const ids=[...new Set(draft.ids.filter((id):id is string=>typeof id==='string'&&byId.has(id)))].slice(0,10);
  for(const id of ids)byId.get(id)!.checked=true;
 }
 layout.value=draft?.layout==='compact'?'compact':'large';answers.checked=typeof draft?.answers==='boolean'?draft.answers:true;
 const params=new URLSearchParams(location.search);
 const explicit=['q','theme','collection'].some(key=>params.has(key));
 const saved=draft?.filters&&typeof draft.filters==='object'?draft.filters as Record<string,unknown>:{};
 search.value=explicit?(params.get('q')||''):typeof saved.q==='string'?saved.q:'';
 theme.value=option(theme,explicit?params.get('theme'):saved.theme);
 collection.value=option(collection,explicit?params.get('collection'):saved.collection);
 invalidate(false);filter();
 if(selected().length)status.textContent='Selection restored. Prepare the pack when you are ready.';
}

search.addEventListener('input',()=>filter());theme.addEventListener('change',()=>filter());collection.addEventListener('change',()=>filter());
form.addEventListener('change',event=>{
 const target=event.target as HTMLInputElement|HTMLSelectElement;
 if(target instanceof HTMLInputElement&&target.name==='puzzle'&&selected().length>10){target.checked=false;status.textContent='Choose at most ten puzzles per pack.';return;}
 if(target.name==='puzzle'||target===layout||target===answers)invalidate();
});
document.querySelector('#pack-clear')!.addEventListener('click',()=>{for(const c of choices)c.checked=false;invalidate();});
window.addEventListener('pageshow',event=>{if(event.persisted)restore();});
window.addEventListener('popstate',()=>{
 const params=new URLSearchParams(location.search);
 search.value=params.get('q')||'';theme.value=option(theme,params.get('theme'));collection.value=option(collection,params.get('collection'));filter();
});
restore();

form.addEventListener('submit',async event=>{
 event.preventDefault();const ids=selected().map(c=>c.value);if(!ids.length||ids.length>10)return;
 const token=++generation,size=layout.value,withAnswers=answers.checked;
 print.disabled=true;build.disabled=true;output.replaceChildren();status.textContent='Preparing sheets…';
 const fragment=document.createDocumentFragment();
 try{
  const sheets=[...ids.map(id=>({id,answer:false})),...(withAnswers?ids.map(id=>({id,answer:true})):[])];
  for(const [i,sheet] of sheets.entries()){
   const response=await fetch(`/print/${sheet.id}${sheet.answer?'-answers':''}/`);if(!response.ok)throw Error('Sheet request failed');
   const doc=new DOMParser().parseFromString(await response.text(),'text/html'),article=doc.querySelector('.print-page');if(!article)throw Error('Missing sheet');
   const workspace=document.createElement('div');workspace.className='print-workspace';workspace.dataset.printLayout=size;workspace.dataset.sheetKind=sheet.answer?'answers':'clues';
   workspace.append(document.importNode(article,true));fragment.append(workspace);
   if(token!==generation)return;status.textContent=`Preparing sheet ${i+1} of ${sheets.length}…`;
  }
  if(token!==generation)return;output.append(fragment);print.disabled=false;
  status.textContent=`Ready: ${ids.length} ${ids.length===1?'puzzle':'puzzles'}${withAnswers?' and separate answers':''}, ${sheets.length*(size==='large'?2:1)} US Letter pages. Print the prepared pack below.`;
 }catch{if(token===generation){output.replaceChildren();status.textContent='Could not prepare every sheet. Check your connection and try again; no partial pack was printed.';}}
 finally{if(token===generation)build.disabled=false;}
});
print.addEventListener('click',()=>{if(!print.disabled)window.print();});
