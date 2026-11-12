"""Shared deterministic connected crossword layout builder."""
import random

def generate(words,seed,size=13):
 random.seed(seed); grid={}; occupied={}; entries=[]
 words=sorted(words,key=lambda x:-len(x[0]))
 def valid(w,r,c,d):
  dr,dc=(0,1) if d=='across' else (1,0)
  if not(0<=r<size and 0<=c<size and r+dr*(len(w)-1)<size and c+dc*(len(w)-1)<size):return None
  if (r-dr,c-dc) in grid or (r+dr*len(w),c+dc*len(w)) in grid:return None
  cross=0
  for i,ch in enumerate(w):
   p=(r+dr*i,c+dc*i)
   if p in grid:
    if grid[p]!=ch or d in occupied[p]:return None
    cross+=1
   else:
    if (p[0]+dc,p[1]+dr) in grid or (p[0]-dc,p[1]-dr) in grid:return None
  if entries and not cross:return None
  return cross
 for w,clue in words:
  candidates=[]
  if not entries:candidates=[(0,size//2,(size-len(w))//2,'across')]
  else:
   for (gr,gc),ch in grid.items():
    for i,letter in enumerate(w):
     if letter!=ch:continue
     for d in ['across','down']:
      r,c=(gr,gc-i) if d=='across' else (gr-i,gc)
      score=valid(w,r,c,d)
      if score is not None:candidates.append((score+random.random()*.35,r,c,d))
  if not candidates:continue
  _,r,c,d=max(candidates)
  entries.append(dict(answer=w,clue=clue,row=r,col=c,direction=d))
  for i,ch in enumerate(w):
   p=(r,c+i) if d=='across' else (r+i,c);grid[p]=ch;occupied.setdefault(p,set()).add(d)
 minr=min(r for r,c in grid);minc=min(c for r,c in grid)
 for e in entries:e['row']-=minr;e['col']-=minc
 starts=sorted(set((e['row'],e['col']) for e in entries)); nums={p:i+1 for i,p in enumerate(starts)}
 for e in entries:e['number']=nums[e['row'],e['col']]
 return entries,max(r for r,c in grid)-minr+1,max(c for r,c in grid)-minc+1
