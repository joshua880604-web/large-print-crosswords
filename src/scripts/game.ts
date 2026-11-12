type Entry={answer:string;clue:string;row:number;col:number;direction:string;number:number};
type Puzzle={id:string;entries:Entry[];rows:number;cols:number};
for(const root of document.querySelectorAll<HTMLElement>('.game-root')){
 const p:Puzzle=JSON.parse(root.dataset.puzzle!);
 const inputs=Array.from(root.querySelectorAll<HTMLInputElement>('.cell input'));
 const key=(r:number,c:number)=>`${r},${c}`;
 const inputMap=new Map(inputs.map(el=>[key(+el.dataset.row!,+el.dataset.col!),el]));
 const entryKeys=(e:Entry)=>Array.from(e.answer,(_,i)=>key(e.row+(e.direction==='down'?i:0),e.col+(e.direction==='across'?i:0)));
 const cellEntries=new Map<string,Entry[]>();const answers=new Map<string,string>();
 p.entries.forEach(e=>entryKeys(e).forEach((k,i)=>{cellEntries.set(k,[...(cellEntries.get(k)||[]),e]);answers.set(k,e.answer[i]);}));
 const status=root.querySelector<HTMLElement>('.game-status')!;
 const safeGet=(k:string)=>{try{return localStorage.getItem(k)}catch{return null}};
 const safeSet=(k:string,v:string)=>{try{localStorage.setItem(k,v);return true}catch{return false}};
 const storageKey=`lpc:v1:${p.id}`;
 let saved:Record<string,string>={};try{const raw=JSON.parse(safeGet(storageKey)||'{}');if(raw&&typeof raw==='object'&&!Array.isArray(raw))saved=raw;}catch{}
 let sound=safeGet('lpc:sound')==='on',large=safeGet('lpc:large')==='on';
 let active=p.entries.find(e=>e.direction==='across')||p.entries[0];let current=entryKeys(active)[0];let completed=false;let zoomed=false;
 let audio:AudioContext|undefined;
 function tone(finish=false){if(!sound)return;try{audio??=new AudioContext();void audio.resume();const osc=audio.createOscillator(),gain=audio.createGain();osc.connect(gain);gain.connect(audio.destination);osc.type='sine';osc.frequency.setValueAtTime(finish?660:380,audio.currentTime);osc.frequency.exponentialRampToValueAtTime(finish?880:180,audio.currentTime+.07);gain.gain.setValueAtTime(.045,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+(finish?.3:.07));osc.start();osc.stop(audio.currentTime+(finish?.32:.09));}catch{}}
 function updateLabel(k:string){const el=inputMap.get(k)!;const [r,c]=k.split(',').map(Number);el.setAttribute('aria-label',`Row ${r+1}, column ${c+1}, ${active.number} ${active.direction}, ${active.clue}, ${el.value||'blank'}`);}
 function select(e:Entry,k=entryKeys(e)[0],focus=true){active=e;current=k;
  const activeKeys=entryKeys(e);
  root.querySelectorAll('.cell').forEach(c=>c.classList.toggle('active-word',activeKeys.includes((c as HTMLElement).dataset.cell!)));
  inputs.forEach(el=>{const k=key(+el.dataset.row!,+el.dataset.col!);el.tabIndex=k===current?0:-1;el.parentElement!.classList.toggle('selected',k===current);});
  root.querySelectorAll<HTMLElement>('.clue-button').forEach(b=>{const on=b.dataset.entry===`${e.number}-${e.direction}`;b.classList.toggle('active',on);if(on)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current');});
  root.querySelector('[data-current-number]')!.textContent=`${e.number} ${e.direction==='across'?'Across':'Down'}`;
  root.querySelector('[data-current-text]')!.textContent=e.clue;
  activeKeys.forEach(updateLabel);
  if(focus){const target=inputMap.get(k)!;target.focus({preventScroll:true});if(zoomed){const scroller=root.querySelector<HTMLElement>('.board-scroll')!;const a=target.getBoundingClientRect(),b=scroller.getBoundingClientRect();if(a.left<b.left)scroller.scrollLeft-=b.left-a.left+10;else if(a.right>b.right)scroller.scrollLeft+=a.right-b.right+10;}}
 }
 function persist(){const values=Object.fromEntries(inputs.filter(i=>i.value).map(i=>[key(+i.dataset.row!,+i.dataset.col!),i.value]));if(!safeSet(storageKey,JSON.stringify(values)))status.textContent='Your browser cannot save progress. You can still play here.';}
 function checkComplete(){const correct=[...answers].every(([k,v])=>inputMap.get(k)!.value===v);root.querySelector<HTMLElement>('.game-complete')!.hidden=!correct;if(correct&&!completed){status.textContent='Wonderful! Every answer is correct.';tone(true);}completed=correct;}
 for(const [k,el] of inputMap){if(typeof saved[k]==='string'&&/^[A-Z]$/.test(saved[k]))el.value=saved[k];
  el.addEventListener('focus',()=>{if(k!==current){const available=cellEntries.get(k)!;select(available.find(e=>e.direction===active.direction)||available[0],k,false);}});
  let repeatTap=false;el.addEventListener('pointerdown',()=>{repeatTap=k===current&&document.activeElement===el;});
  el.addEventListener('click',()=>{const available=cellEntries.get(k)!;if(repeatTap&&available.length>1){const next=available.find(e=>e!==active);if(next)select(next,k);}else select(available.find(e=>e.direction===active.direction)||available[0],k);});
  el.addEventListener('input',()=>{const text=el.value.toUpperCase().replace(/[^A-Z]/g,'');el.value=text.slice(-1);el.parentElement!.classList.remove('incorrect','revealed');el.removeAttribute('aria-invalid');updateLabel(k);if(el.value){tone();const ks=entryKeys(active);const at=ks.indexOf(k);if(at<ks.length-1)select(active,ks[at+1]);}persist();checkComplete();});
  el.addEventListener('keydown',event=>{
   if(event.key==='Enter'||event.key===' '){event.preventDefault();const available=cellEntries.get(k)!;if(available.length>1)select(available.find(e=>e!==active)!,k);return;}
   if(event.key==='Backspace'){event.preventDefault();const ks=entryKeys(active),idx=ks.indexOf(k);if(el.value){el.value='';el.parentElement!.classList.remove('incorrect','revealed');el.removeAttribute('aria-invalid');updateLabel(k);}else if(idx>0){const prev=inputMap.get(ks[idx-1])!;prev.value='';prev.parentElement!.classList.remove('incorrect','revealed');prev.removeAttribute('aria-invalid');select(active,ks[idx-1]);}persist();checkComplete();return;}
   const moves:Record<string,[number,number]>={ArrowLeft:[0,-1],ArrowRight:[0,1],ArrowUp:[-1,0],ArrowDown:[1,0]};
   if(moves[event.key]){event.preventDefault();const [dr,dc]=moves[event.key];const dir=dr?'down':'across';let r=+el.dataset.row!+dr,c=+el.dataset.col!+dc;while(r>=0&&r<p.rows&&c>=0&&c<p.cols){const nk=key(r,c);if(inputMap.has(nk)){const available=cellEntries.get(nk)!;select(available.find(e=>e.direction===dir)||available[0],nk);return;}r+=dr;c+=dc;}}
  });
 }
 root.querySelectorAll<HTMLElement>('.clue-button').forEach(b=>b.addEventListener('click',()=>{const e=p.entries.find(e=>`${e.number}-${e.direction}`===b.dataset.entry)!;const ks=entryKeys(e);select(e,ks.find(k=>!inputMap.get(k)!.value)||ks[0]);}));
 const soundButton=root.querySelector<HTMLButtonElement>('[data-action=sound]')!;const largeButton=root.querySelector<HTMLButtonElement>('[data-action=large]')!;
 function settings(){soundButton.textContent=`Sound: ${sound?'On':'Off'}`;soundButton.setAttribute('aria-pressed',String(sound));largeButton.setAttribute('aria-pressed',String(large));root.querySelector('.game-layout')!.classList.toggle('large-clues',large);}
 soundButton.addEventListener('click',()=>{sound=!sound;safeSet('lpc:sound',sound?'on':'off');settings();tone();});
 largeButton.addEventListener('click',()=>{large=!large;safeSet('lpc:large',large?'on':'off');settings();});
 root.querySelector<HTMLButtonElement>('[data-action=zoom]')!.addEventListener('click',event=>{zoomed=!zoomed;root.querySelector('.game-layout')!.classList.toggle('large-board',zoomed);(event.currentTarget as HTMLButtonElement).setAttribute('aria-pressed',String(zoomed));status.textContent=zoomed?'Larger squares are on. Scroll sideways within the board to see more squares.':'Standard square size restored.';});
 root.querySelector('[data-action=check]')!.addEventListener('click',()=>{let wrong=0,blank=0;for(const k of entryKeys(active)){const el=inputMap.get(k)!;const bad=!!el.value&&el.value!==answers.get(k);el.parentElement!.classList.toggle('incorrect',bad);if(bad){el.setAttribute('aria-invalid','true');wrong++;}else el.removeAttribute('aria-invalid');if(!el.value)blank++;}status.textContent=wrong?`${wrong} ${wrong===1?'letter needs':'letters need'} another look in ${active.number} ${active.direction}. Marked letters are underlined.`:blank?'The letters you’ve entered in this word are correct. Keep going!':'This word is correct. Nicely done!';});
 root.querySelector('[data-action=hint]')!.addEventListener('click',()=>{const ks=entryKeys(active);const k=(inputMap.get(current)!.value!==answers.get(current)?current:ks.find(k=>inputMap.get(k)!.value!==answers.get(k)));if(!k){status.textContent='This word is already correct.';return;}const el=inputMap.get(k)!;el.value=answers.get(k)!;el.parentElement!.classList.remove('incorrect');el.removeAttribute('aria-invalid');el.parentElement!.classList.add('revealed');updateLabel(k);status.textContent=`Revealed ${el.value} in ${active.number} ${active.direction}.`;persist();checkComplete();});
 const dialog=root.querySelector<HTMLDialogElement>('dialog')!;
 root.querySelector('[data-action=reset]')!.addEventListener('click',()=>dialog.showModal());
 dialog.addEventListener('close',()=>{if(dialog.returnValue==='reset'){inputs.forEach(el=>{el.value='';el.parentElement!.classList.remove('incorrect','revealed');el.removeAttribute('aria-invalid');});persist();checkComplete();select(p.entries.find(e=>e.direction==='across')||p.entries[0]);status.textContent='A fresh start. Your answers have been cleared.';}});
 settings();select(active,current,false);checkComplete();
 if(Object.keys(saved).length&&!completed)status.textContent='Welcome back. Your progress has been restored.';
}
