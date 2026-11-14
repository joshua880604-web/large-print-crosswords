type Entry={answer:string;clue:string;row:number;col:number;direction:string;number:number};
type Puzzle={id:string;entries:Entry[];rows:number;cols:number;revision?:number};

for (const root of document.querySelectorAll<HTMLElement>('.game-root')) {
 const p:Puzzle=JSON.parse(root.dataset.puzzle!);
 const inputs=Array.from(root.querySelectorAll<HTMLInputElement>('.cell input'));
 const key=(r:number,c:number)=>`${r},${c}`;
 const inputMap=new Map(inputs.map(el=>[key(+el.dataset.row!,+el.dataset.col!),el]));
 const entryKeys=(e:Entry)=>Array.from(e.answer,(_,i)=>key(e.row+(e.direction==='down'?i:0),e.col+(e.direction==='across'?i:0)));
 const cellEntries=new Map<string,Entry[]>();
 const answers=new Map<string,string>();
 p.entries.forEach(e=>entryKeys(e).forEach((k,i)=>{
  cellEntries.set(k,[...(cellEntries.get(k)||[]),e]);
  answers.set(k,e.answer[i]);
 }));
 const orderedEntries=[...p.entries].sort((a,b)=>a.direction.localeCompare(b.direction)||a.number-b.number);
 const status=root.querySelector<HTMLElement>('.game-status')!;
 const safeGet=(k:string)=>{try{return localStorage.getItem(k)}catch{return null}};
 const safeSet=(k:string,v:string)=>{try{localStorage.setItem(k,v);return true}catch{return false}};
 const legacyKey=`lpc:v1:${p.id}`;
 const storageKey=p.revision?`${legacyKey}:edition:${p.revision}`:legacyKey;
 for(const notice of root.querySelectorAll<HTMLElement>('.previous-progress')){
  try {
   const legacy=JSON.parse(safeGet(notice.dataset.previousKey!)||'{}');
   const hasProgress=legacy&&typeof legacy==='object'&&!Array.isArray(legacy)&&Object.entries(legacy).some(([cell,value])=>/^\d+,\d+$/.test(cell)&&typeof value==='string'&&/^[A-Z]$/.test(value));
   notice.hidden=!hasProgress;
  } catch {}
 }
 let saved:Record<string,string>={};
 try {
  const raw=JSON.parse(safeGet(storageKey)||'{}');
  if(raw&&typeof raw==='object'&&!Array.isArray(raw))saved=raw;
 } catch {}
 let sound=safeGet('lpc:sound')==='on',large=safeGet('lpc:large')==='on';
 let active=p.entries.find(e=>e.direction==='across')||p.entries[0];
 let current=entryKeys(active)[0];
 let completed=false,zoomed=false;
 let audio:AudioContext|undefined;
 const keyboard=root.querySelector<HTMLElement>('.puzzle-keyboard')!;
 const keyboardToggle=root.querySelector<HTMLButtonElement>('[data-action=keyboard]')!;
 const keyboardPreference=safeGet('lpc:keyboard');
 // Small touch devices start in on-screen mode; the panel opens only on interaction.
 let onScreen=keyboardPreference?keyboardPreference==='onscreen':matchMedia('(pointer: coarse) and (max-width: 900px)').matches;
 let scrollFrame=0;

 function tone(finish=false) {
  if(!sound)return;
  try {
   audio??=new AudioContext();void audio.resume();
   const osc=audio.createOscillator(),gain=audio.createGain();
   osc.connect(gain);gain.connect(audio.destination);osc.type='sine';
   osc.frequency.setValueAtTime(finish?660:380,audio.currentTime);
   osc.frequency.exponentialRampToValueAtTime(finish?880:180,audio.currentTime+.07);
   gain.gain.setValueAtTime(.045,audio.currentTime);
   gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+(finish?.3:.07));
   osc.start();osc.stop(audio.currentTime+(finish?.32:.09));
  } catch {}
 }
 function updateLabel(k:string) {
  const el=inputMap.get(k)!;
  const [r,c]=k.split(',').map(Number);
  el.setAttribute('aria-label',`Row ${r+1}, column ${c+1}, ${active.number} ${active.direction}, ${active.clue}, ${el.value||'blank'}`);
 }
 function updateKeyboard() {
  keyboard.querySelector('[data-keyboard-number]')!.textContent=`${active.number} ${active.direction==='across'?'Across':'Down'}`;
  keyboard.querySelector('[data-keyboard-clue]')!.textContent=active.clue;
  const preview=keyboard.querySelector('.keyboard-word')!;
  preview.replaceChildren(...entryKeys(active).map(k=>{
   const span=document.createElement('span');
   span.textContent=inputMap.get(k)!.value;
   span.classList.toggle('is-current',k===current);
   return span;
  }));
  keyboardToggle.textContent=onScreen?'Keyboard: On-screen':'Use on-screen keyboard';
  keyboardToggle.setAttribute('aria-pressed',String(onScreen));
  keyboardToggle.setAttribute('aria-expanded',String(!keyboard.hidden));
 }
 function keepCellVisible() {
  if(keyboard.hidden)return;
  cancelAnimationFrame(scrollFrame);
  scrollFrame=requestAnimationFrame(()=>{
   const target=inputMap.get(current)!;
   const scroller=root.querySelector<HTMLElement>('.board-scroll')!;
   let cell=target.getBoundingClientRect();
   const board=scroller.getBoundingClientRect();
   if(cell.left<board.left)scroller.scrollLeft-=board.left-cell.left+8;
   else if(cell.right>board.right)scroller.scrollLeft+=cell.right-board.right+8;
   cell=target.getBoundingClientRect();
   const top=(window.visualViewport?.offsetTop||0)+12;
   const bottom=keyboard.getBoundingClientRect().top-12;
   if(cell.bottom>bottom||cell.top<top) {
    // Prefer the whole board when it fits; otherwise keep the active square in view.
    const destination=board.height<=bottom-top?board.top-top:cell.top-(top+Math.max(0,(bottom-top-cell.height)/2));
    window.scrollBy({top:destination,behavior:'instant'});
   }
  });
 }
 function measureKeyboard() {
  const height=keyboard.hidden?0:Math.ceil(keyboard.getBoundingClientRect().height);
  document.body.style.setProperty('--puzzle-keyboard-height',`${height}px`);
  if(height)keepCellVisible();
 }
 function showKeyboard() {
  if(!onScreen)return;
  keyboard.hidden=false;
  document.body.classList.add('has-puzzle-keyboard');
  updateKeyboard();measureKeyboard();
 }
 function hideKeyboard() {
  keyboard.hidden=true;
  document.body.classList.remove('has-puzzle-keyboard');
  cancelAnimationFrame(scrollFrame);
  measureKeyboard();updateKeyboard();
 }
 function changeKeyboardMode(enabled:boolean) {
  // Blur first so switching modes can close/reopen the native touch keyboard.
  inputMap.get(current)!.blur();
  onScreen=enabled;
  inputs.forEach(el=>el.inputMode=enabled?'none':'text');
  safeSet('lpc:keyboard',enabled?'onscreen':'system');
  if(enabled)showKeyboard();else hideKeyboard();
  select(active,current);
 }
 new ResizeObserver(measureKeyboard).observe(keyboard);
 window.visualViewport?.addEventListener('resize',keepCellVisible);
 window.addEventListener('resize',measureKeyboard);

 function select(e:Entry,k=entryKeys(e)[0],focus=true) {
  active=e;current=k;
  const activeKeys=entryKeys(e);
  root.querySelectorAll<HTMLElement>('.cell').forEach(c=>c.classList.toggle('active-word',activeKeys.includes(c.dataset.cell!)));
  inputs.forEach(el=>{
   const k=key(+el.dataset.row!,+el.dataset.col!);
   el.tabIndex=k===current?0:-1;
   el.parentElement!.classList.toggle('selected',k===current);
  });
  root.querySelectorAll<HTMLElement>('.clue-button').forEach(b=>{
   const on=b.dataset.entry===`${e.number}-${e.direction}`;
   b.classList.toggle('active',on);
   if(on)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current');
  });
  root.querySelector('[data-current-number]')!.textContent=`${e.number} ${e.direction==='across'?'Across':'Down'}`;
  root.querySelector('[data-current-text]')!.textContent=e.clue;
  activeKeys.forEach(updateLabel);updateKeyboard();
  if(focus) {
   showKeyboard();
   const target=inputMap.get(k)!;
   target.focus({preventScroll:true});
   if(zoomed) {
    const scroller=root.querySelector<HTMLElement>('.board-scroll')!;
    const a=target.getBoundingClientRect(),b=scroller.getBoundingClientRect();
    if(a.left<b.left)scroller.scrollLeft-=b.left-a.left+10;
    else if(a.right>b.right)scroller.scrollLeft+=a.right-b.right+10;
   }
   keepCellVisible();
  }
 }
 function persist() {
  const values=Object.fromEntries(inputs.filter(i=>i.value).map(i=>[key(+i.dataset.row!,+i.dataset.col!),i.value]));
  if(!safeSet(storageKey,JSON.stringify(values)))status.textContent='Your browser cannot save progress. You can still play here.';
 }
 function checkComplete() {
  const correct=[...answers].every(([k,v])=>inputMap.get(k)!.value===v);
  root.querySelector<HTMLElement>('.game-complete')!.hidden=!correct;
  if(correct&&!completed){status.textContent='Wonderful! Every answer is correct.';tone(true);}
  completed=correct;
 }
 function clearFeedback(el:HTMLInputElement) {
  el.parentElement!.classList.remove('incorrect','revealed');
  el.removeAttribute('aria-invalid');
 }
 // Physical, system and on-screen keys share the same input and save behavior.
 function enterLetter(k:string,letter:string) {
  const el=inputMap.get(k)!;
  el.value=letter;clearFeedback(el);updateLabel(k);
  if(letter) {
   tone();
   const ks=entryKeys(active),at=ks.indexOf(k);
   select(active,ks[Math.min(at+1,ks.length-1)]);
  }
  updateKeyboard();persist();checkComplete();
 }
 function eraseLetter() {
  const el=inputMap.get(current)!;
  const ks=entryKeys(active),idx=ks.indexOf(current);
  if(el.value){el.value='';clearFeedback(el);updateLabel(current);select(active,current);}
  else if(idx>0) {
   const previous=ks[idx-1],prev=inputMap.get(previous)!;
   prev.value='';clearFeedback(prev);select(active,previous);
  } else select(active,current);
  updateKeyboard();persist();checkComplete();
 }
 for(const [k,el] of inputMap) {
  if(typeof saved[k]==='string'&&/^[A-Z]$/.test(saved[k]))el.value=saved[k];
  el.inputMode=onScreen?'none':'text';
  el.addEventListener('focus',()=>{
   if(k!==current) {
    const available=cellEntries.get(k)!;
    select(available.find(e=>e.direction===active.direction)||available[0],k,false);
   }
   showKeyboard();
  });
  let repeatTap=false;
  el.addEventListener('pointerdown',()=>{repeatTap=k===current&&document.activeElement===el;});
  el.addEventListener('click',()=>{
   const available=cellEntries.get(k)!;
   if(repeatTap&&available.length>1)select(available.find(e=>e!==active)!,k);
   else select(available.find(e=>e.direction===active.direction)||available[0],k);
  });
  el.addEventListener('input',()=>enterLetter(k,el.value.toUpperCase().replace(/[^A-Z]/g,'').slice(-1)));
  el.addEventListener('keydown',event=>{
   if(event.key==='Enter'||event.key===' ') {
    event.preventDefault();
    const available=cellEntries.get(k)!;
    if(available.length>1)select(available.find(e=>e!==active)!,k);
    return;
   }
   if(event.key==='Backspace'){event.preventDefault();eraseLetter();return;}
   const moves:Record<string,[number,number]>={ArrowLeft:[0,-1],ArrowRight:[0,1],ArrowUp:[-1,0],ArrowDown:[1,0]};
   if(moves[event.key]) {
    event.preventDefault();
    const [dr,dc]=moves[event.key],dir=dr?'down':'across';
    let r=+el.dataset.row!+dr,c=+el.dataset.col!+dc;
    while(r>=0&&r<p.rows&&c>=0&&c<p.cols) {
     const nk=key(r,c);
     if(inputMap.has(nk)) {
      const available=cellEntries.get(nk)!;
      select(available.find(e=>e.direction===dir)||available[0],nk);return;
     }
     r+=dr;c+=dc;
    }
   }
  });
 }
 root.querySelectorAll<HTMLElement>('.clue-button').forEach(b=>b.addEventListener('click',()=>{
  const e=p.entries.find(e=>`${e.number}-${e.direction}`===b.dataset.entry)!;
  const ks=entryKeys(e);select(e,ks.find(k=>!inputMap.get(k)!.value)||ks[0]);
 }));

 const letterButtons=Array.from(keyboard.querySelectorAll<HTMLButtonElement>('[data-letter]'));
 letterButtons.forEach(button=>{
  button.addEventListener('pointerdown',event=>event.preventDefault());
  button.addEventListener('click',()=>enterLetter(current,button.dataset.letter!));
  button.addEventListener('keydown',event=>{
   const row=+button.dataset.keyRow!,col=+button.dataset.keyCol!;
   let next:HTMLButtonElement|undefined;
   if(event.key==='ArrowLeft'||event.key==='ArrowRight') {
    const offset=event.key==='ArrowLeft'?-1:1,index=letterButtons.indexOf(button);
    next=letterButtons[(index+offset+letterButtons.length)%letterButtons.length];
   } else if(event.key==='ArrowUp'||event.key==='ArrowDown') {
    const nextRow=(row+(event.key==='ArrowUp'?2:1))%3;
    const candidates=letterButtons.filter(b=>Number(b.dataset.keyRow)===nextRow);
    next=candidates[Math.min(col,candidates.length-1)];
   } else if(event.key==='Home'||event.key==='End') {
    const candidates=letterButtons.filter(b=>Number(b.dataset.keyRow)===row);
    next=event.key==='Home'?candidates[0]:candidates[candidates.length-1];
   }
   if(next) {
    event.preventDefault();
    letterButtons.forEach(b=>b.tabIndex=b===next?0:-1);next.focus({preventScroll:true});
   }
  });
 });
 keyboard.addEventListener('keydown',event=>{
  if(/^[a-z]$/i.test(event.key)&&!event.ctrlKey&&!event.metaKey&&!event.altKey) {
   event.preventDefault();enterLetter(current,event.key.toUpperCase());
  } else if(event.key==='Backspace'){event.preventDefault();eraseLetter();}
  else if(event.key==='Escape'){event.preventDefault();hideKeyboard();keyboardToggle.focus({preventScroll:true});}
 });
 keyboard.querySelector('[data-keyboard-action=delete]')!.addEventListener('click',eraseLetter);
 keyboard.querySelector('[data-keyboard-action=next]')!.addEventListener('click',()=>{
  const next=orderedEntries[(orderedEntries.indexOf(active)+1)%orderedEntries.length];
  const ks=entryKeys(next);select(next,ks.find(k=>!inputMap.get(k)!.value)||ks[0]);
 });
 keyboard.querySelector('[data-keyboard-action=system]')!.addEventListener('click',()=>changeKeyboardMode(false));
 keyboard.querySelector('[data-keyboard-action=hide]')!.addEventListener('click',()=>{
  hideKeyboard();keyboardToggle.focus({preventScroll:true});
 });
 keyboardToggle.addEventListener('click',()=>{
  if(onScreen&&keyboard.hidden){showKeyboard();select(active,current);}
  else changeKeyboardMode(!onScreen);
 });

 const soundButton=root.querySelector<HTMLButtonElement>('[data-action=sound]')!;
 const largeButton=root.querySelector<HTMLButtonElement>('[data-action=large]')!;
 function settings() {
  soundButton.textContent=`Sound: ${sound?'On':'Off'}`;
  soundButton.setAttribute('aria-pressed',String(sound));
  largeButton.setAttribute('aria-pressed',String(large));
  root.querySelector('.game-layout')!.classList.toggle('large-clues',large);
 }
 soundButton.addEventListener('click',()=>{sound=!sound;safeSet('lpc:sound',sound?'on':'off');settings();tone();});
 largeButton.addEventListener('click',()=>{large=!large;safeSet('lpc:large',large?'on':'off');settings();});
 root.querySelector<HTMLButtonElement>('[data-action=zoom]')!.addEventListener('click',event=>{
  zoomed=!zoomed;root.querySelector('.game-layout')!.classList.toggle('large-board',zoomed);
  (event.currentTarget as HTMLButtonElement).setAttribute('aria-pressed',String(zoomed));
  status.textContent=zoomed?'Larger squares are on. Scroll sideways within the board to see more squares.':'Standard square size restored.';
 });
 root.querySelector('[data-action=check]')!.addEventListener('click',()=>{
  let wrong=0,blank=0;
  for(const k of entryKeys(active)) {
   const el=inputMap.get(k)!,bad=!!el.value&&el.value!==answers.get(k);
   el.parentElement!.classList.toggle('incorrect',bad);
   if(bad){el.setAttribute('aria-invalid','true');wrong++;}else el.removeAttribute('aria-invalid');
   if(!el.value)blank++;
  }
  status.textContent=wrong?`${wrong} ${wrong===1?'letter needs':'letters need'} another look in ${active.number} ${active.direction}. Marked letters are underlined.`:blank?'The letters you’ve entered in this word are correct. Keep going!':'This word is correct. Nicely done!';
 });
 root.querySelector('[data-action=hint]')!.addEventListener('click',()=>{
  const ks=entryKeys(active);
  const k=inputMap.get(current)!.value!==answers.get(current)?current:ks.find(k=>inputMap.get(k)!.value!==answers.get(k));
  if(!k){status.textContent='This word is already correct.';return;}
  const el=inputMap.get(k)!;
  el.value=answers.get(k)!;clearFeedback(el);el.parentElement!.classList.add('revealed');updateLabel(k);updateKeyboard();
  status.textContent=`Revealed ${el.value} in ${active.number} ${active.direction}.`;persist();checkComplete();
 });
 const dialog=root.querySelector<HTMLDialogElement>('dialog')!;
 root.querySelector('[data-action=reset]')!.addEventListener('click',()=>dialog.showModal());
 dialog.addEventListener('close',()=>{
  if(dialog.returnValue==='reset') {
   inputs.forEach(el=>{el.value='';clearFeedback(el);});
   persist();checkComplete();select(p.entries.find(e=>e.direction==='across')||p.entries[0]);
   status.textContent='A fresh start. Your answers have been cleared.';
  }
 });
 settings();select(active,current,false);checkComplete();
 if(Object.keys(saved).length&&!completed)status.textContent='Welcome back. Your progress has been restored.';
}
