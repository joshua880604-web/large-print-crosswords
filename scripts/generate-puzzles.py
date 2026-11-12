"""Create connected, original themed mini crosswords. No external puzzle content."""
import random,json,pathlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
THEMES=[
('garden-days','Garden Days','Gardening','A little time among the flowers. Enjoy familiar words from the garden.', [('GARDEN','A place to grow flowers or vegetables'),('ROSE','A fragrant flower with thorns'),('SEED','A tiny beginning for a new plant'),('SOIL','Earth in which plants grow'),('RAKE','Tool used to gather fallen leaves'),('WATER','What a thirsty plant needs'),('LEAF','A flat green part of a plant'),('POT','Container for a houseplant'),('SUN','Our closest star, which helps plants grow'),('ROOT','Part of a plant that grows underground'),('STEM','The stalk that holds up a flower'),('BEE','A buzzing insect that visits flowers')]),
('sunday-baking','Sunday Baking','Food & Home','Something warm from the oven. A comforting crossword for a quiet afternoon.', [('BUTTER','A spread made from cream'),('FLOUR','Powder used to make bread and cakes'),('OVEN','Kitchen appliance used for baking'),('CAKE','A sweet treat often served on birthdays'),('SUGAR','Sweet crystals added to cookie dough'),('PIE','Baked dessert with a pastry crust'),('EGG','An ingredient that comes in a shell'),('ROLL','A small individual bread'),('MIX','Stir ingredients together'),('PAN','Container used to bake a cake'),('TEA','A warm drink made by steeping leaves'),('SALT','Seasoning often paired with pepper')]),
('backyard-birds','Backyard Birds','Nature','Look out the window and listen. Meet some familiar feathered neighbors.', [('ROBIN','Bird often known for its orange-red breast'),('NEST','A home built by birds'),('WING','A body part a bird uses to fly'),('FEATHER','One of the light coverings on a bird'),('OWL','A bird often heard hooting at night'),('DUCK','Water bird that quacks'),('BEAK','The hard mouth part of a bird'),('DOVE','A bird often used as a symbol of peace'),('WREN','A small brown songbird'),('SEED','A common food in a bird feeder'),('EGG','What a baby bird hatches from'),('SWAN','A large, long-necked water bird')]),
('a-cup-of-comfort','A Cup of Comfort','Food & Home','Put the kettle on. Settle in with familiar words from around the kitchen.', [('COFFEE','A drink brewed from roasted beans'),('KETTLE','A vessel used to boil water for tea'),('SPOON','Utensil used to stir a cup'),('CUP','A small drinking vessel with a handle'),('MUG','A sturdy cup for a hot drink'),('HONEY','A sweet food made by bees'),('MILK','A drink often poured over cereal'),('LEMON','A yellow citrus fruit'),('TEA','A drink made from steeped leaves'),('SUGAR','A sweetener for coffee or tea'),('TRAY','A flat object used to carry cups'),('TOAST','Bread browned with heat')]),
('on-the-road','On the Road','Travel','A scenic drive and a new destination. Take this little trip at your own pace.', [('ROAD','A route used by cars'),('MAP','A drawing that shows places and roads'),('TRIP','A journey away from home'),('HOTEL','A place to book a room for the night'),('TRAIN','A vehicle that travels on rails'),('BEACH','A sandy place beside the sea'),('LAKE','A large body of water surrounded by land'),('BOAT','A small watercraft'),('CAR','A common four-wheeled vehicle'),('BAG','Something used to carry your belongings'),('TICKET','Proof that you have paid for a ride'),('PARK','A public green space for a walk')]),
('movie-night','Movie Night','Classic Pastimes','Make yourself comfortable. These clues celebrate an evening at the movies.', [('MOVIE','A story shown on a screen'),('ACTOR','A person who plays a character'),('SCREEN','The surface on which a film is shown'),('STAR','A famous leading performer'),('SCENE','One part of a play or movie'),('SEAT','A place to sit in a theater'),('FILM','Another word for a movie'),('ROLE','A part played by an actor'),('SONG','A piece of music with words'),('PLOT','The main events of a story'),('TICKET','What you buy to enter a movie theater'),('SHOW','A performance for an audience')]),
('music-memories','Music & Memories','Classic Pastimes','Tap your toes to a familiar tune. No music knowledge needed beyond the everyday.', [('PIANO','A keyboard instrument with black and white keys'),('SONG','A piece of music meant to be sung'),('RADIO','A device for listening to broadcast programs'),('BAND','A group of musicians playing together'),('DRUM','An instrument played by striking it'),('NOTE','A single musical sound'),('TUNE','A melody you might hum'),('DANCE','Move your feet to music'),('SING','Make music with your voice'),('HORN','A trumpet is one type of this instrument'),('BELL','A ringing instrument often found in a tower'),('DUET','A performance by two singers')]),
('by-the-sea','By the Sea','Nature','A gentle breeze, a sandy shore, and a few easy clues to enjoy.', [('OCEAN','A very large body of salt water'),('SAND','Tiny grains found on a beach'),('WAVE','A moving swell on the surface of water'),('SHELL','A hard covering you might find on the beach'),('TIDE','The regular rise and fall of sea level'),('BOAT','A vessel used to travel on water'),('GULL','A bird commonly seen near the sea'),('SAIL','Fabric that catches wind to move a boat'),('FISH','An animal that breathes through gills'),('REEF','An underwater ridge often made of coral'),('CRAB','A sea creature with claws'),('SUN','The star that warms a day at the beach')]),
('cozy-at-home','Cozy at Home','Food & Home','There is no place quite like home. Enjoy a few familiar comforts.', [('CHAIR','A piece of furniture for one person to sit on'),('TABLE','Furniture with a flat top for meals'),('LAMP','An electric light for a desk or bedside'),('RUG','A covering for part of a floor'),('DOOR','An entrance that opens and closes'),('BOOK','Pages bound together for reading'),('CLOCK','An object that tells the time'),('SOFA','A long, cushioned seat'),('BED','Furniture used for sleeping'),('SHELF','A board that holds books or other objects'),('VASE','A container for cut flowers'),('QUILT','A warm bed covering made from layers of fabric')]),
('autumn-walk','An Autumn Walk','Seasons','A crisp afternoon and leaves underfoot. Take a relaxed stroll through this puzzle.', [('AUTUMN','Another name for the season called fall'),('LEAF','Part of a tree that may turn gold in fall'),('ACORN','The nut of an oak tree'),('RAKE','Tool for gathering fallen leaves'),('APPLE','A fruit often picked in an orchard'),('OAK','A tree that grows acorns'),('COAT','An outer garment for chilly weather'),('PATH','A route for walking'),('WIND','Moving air'),('GOLD','A yellow color often seen in fall leaves'),('NUT','A hard-shelled food gathered by squirrels'),('TEA','A warm drink made from leaves')]),
('holiday-table','The Holiday Table','Seasons','Gather around a familiar table. A gentle puzzle about food and togetherness.', [('FEAST','A large meal for a special occasion'),('PIE','A dessert with a pastry crust'),('PLATE','A flat dish used to serve food'),('FORK','An eating utensil with prongs'),('GRAVY','A sauce often served with roast turkey'),('ROLL','A small bread served with dinner'),('FAMILY','Relatives gathered together'),('TABLE','Furniture around which a meal is shared'),('CORN','A yellow vegetable that grows on a cob'),('YAM','A sweet root vegetable'),('MEAL','Breakfast, lunch, or dinner'),('GUEST','A person invited to visit')]),
('a-good-book','A Good Book','Classic Pastimes','Turn a page and take a break. Simple clues for anyone who enjoys a good story.', [('BOOK','A collection of bound pages'),('PAGE','One side of a sheet in a book'),('STORY','An account of events, real or imagined'),('READ','Look at and understand written words'),('NOVEL','A long work of fiction'),('POEM','Writing often arranged in verse'),('AUTHOR','The person who writes a book'),('TALE','Another word for a story'),('COVER','The outside of a book'),('TITLE','The name of a book'),('PEN','A tool for writing with ink'),('INK','The colored liquid used in a pen')])
]
def generate(words,seed):
 random.seed(seed); size=13; grid={}; occupied={}; entries=[]
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
  if not entries:candidates=[(0,6,(size-len(w))//2,'across')]
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
extras=json.loads((ROOT/'scripts/word-banks.json').read_text())
new_themes=[
('our-furry-friends','Our Furry Friends','Pets','A friendly little puzzle about the animals who share our homes.'),
('a-stitch-in-time','A Stitch in Time','Crafts','Thread a few familiar words together with this sewing and knitting puzzle.'),
('weather-watching','Weather Watching','Nature','Look to the sky for a relaxed puzzle about everyday weather.'),
('market-morning','Market Morning','Food & Home','Take an easy stroll through familiar foods and grocery-store finds.'),
('in-the-workshop','In the Workshop','Classic Pastimes','A small collection of everyday tools and things to make.'),
('a-day-at-the-farm','A Day at the Farm','Nature','Enjoy familiar farm animals, fields, and country sights.'),
('game-night','Game Night','Classic Pastimes','Gather around for familiar words from cards and board games.'),
('flower-favorites','Flower Favorites','Gardening','A colorful little collection of flowers and the things that help them grow.')]
for t in new_themes:THEMES.append((*t,[]))
out=[]
for idx,(slug,title,theme,description,words) in enumerate(THEMES):
 pool=words+[tuple(w) for w in extras.get(slug,[])]
 previous=[]
 for variant in range(5):
  choices=[]
  for attempt in range(1200):
   seed=idx*100000+variant*2000+attempt
   rng=random.Random(seed)
   selected=rng.sample(pool,min(len(pool),14))
   entries,rows,cols=generate(selected,seed)
   aset=set(e['answer'] for e in entries)
   if len(entries)<8:continue
   if any(len(aset&old)/len(aset|old)>.60 or len(aset-old)<3 or len(old-aset)<3 for old in previous):continue
   choices.append((entries,rows,cols))
   if len(choices)>=30:break
  if not choices:raise RuntimeError(f'Cannot create a distinct puzzle: {slug} {variant}')
  entries,rows,cols=max(choices,key=lambda x:(len(x[0]),-x[1]*x[2]))
  previous.append(set(e['answer'] for e in entries))
  identifier=slug if variant==0 else f'{slug}-{variant+1}'
  puzzle_title=title if variant==0 else f'{title} — No. {variant+1}'
  out.append(dict(id=identifier,title=puzzle_title,theme=theme,description=description,difficulty='Easy',rows=rows,cols=cols,entries=entries))
  print(identifier,len(entries),f'{rows}x{cols}')
# Interleave themes so the collection offers variety from the first row onward.
out=[out[t*5+v] for v in range(5) for t in range(len(THEMES))]
(ROOT/'src/data/puzzles.json').write_text(json.dumps(out,indent=2)+'\n')
