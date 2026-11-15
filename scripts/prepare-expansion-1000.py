"""Assemble the reviewed scene plans into first-edition editorial sources.

Does not rewrite existing sources, editions, or puzzles. Run before generating
only the new manifest entries. General definitions come from the original 100
source banks, with the explicit reviewed glossary taking precedence.
"""
import collections
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
read = lambda path: json.loads((ROOT / path).read_text())
configs = read('src/data/editorial-series.json')
original = configs[:100]
definitions = collections.defaultdict(list)
for config in original:
    for source in read('scripts/' + config['source']):
        for answer, clue in source['words']:
            if clue not in definitions[answer]:
                definitions[answer].append(clue)
# Use one general candidate until explicitly supplied alternatives are reviewed.
definitions = {w: [min(clues, key=len)] for w, clues in definitions.items()}
for line in (ROOT / 'scripts/expansion-1000-definitions.txt').read_text().splitlines():
    if line and not line.startswith('#'):
        answer, clues = line.split('=', 1)
        definitions[answer] = clues.split('~')
notes = read('scripts/expansion-1000-notes.json')
notes.update(read('scripts/expansion-1000-more-notes.json'))
scenes = collections.defaultdict(list)
for line in (ROOT / 'scripts/expansion-1000-scenes.txt').read_text().splitlines():
    if line and not line.startswith('#'):
        fields = line.split('|')
        scenes[fields[0]].append(fields)

# Context changes a word's meaning; these clues take precedence over the glossary.
overrides = {
    ('garden-harvest-baskets', 4, 'HEAD'): 'Whole rounded cluster of lettuce leaves',
    ('garden-harvest-baskets', 3, 'EYE'): 'Small bud on a potato',
    ('errands-on-main-street', 3, 'BANK'): 'Business that holds deposits and cashes checks',
    ('errands-on-main-street', 4, 'CLAIM'): 'Pick up an item left with a service',
    ('food-shops', 4, 'ORDER'): 'Request for a sandwich at the counter',
    ('spring-first-outings', 4, 'BAT'): 'Wooden implement used to hit a baseball',
    ('bible-christmas-and-childhood', 1, 'JOSEPH'): "Mary's husband in the Nativity story",
    ('bible-christmas-and-childhood', 4, 'JOSEPH'): "Mary's husband who searched for young Jesus",
    ('bible-christmas-and-childhood', 4, 'MARY'): 'Mother who searched for Jesus in Jerusalem',
    ('bible-christmas-and-childhood', 4, 'TEMPLE'): 'Worship building where young Jesus met teachers',
    ('bible-by-the-lake', 0, 'JOHN'): 'Bible baptizer at the Jordan River',
    ('bible-by-the-lake', 0, 'JESUS'): 'Person John baptized in the Gospel story',
    ('bible-by-the-lake', 1, 'JOHN'): 'Fisherman who was the brother of James',
    ('bible-meals-and-celebration', 2, 'PALM'): 'Tree whose branches were carried to greet Jesus',
    ('bible-meals-and-celebration', 2, 'COLT'): 'Young donkey in the entry-to-Jerusalem story',
    ('bible-seeds-and-finding', 1, 'MUSTARD'): 'Plant with a tiny seed in a familiar parable',
    ('bible-seeds-and-finding', 2, 'NINETY'): '___-nine: sheep remaining while one is sought',
    ('bible-meals-and-celebration', 0, 'LOAF'): 'Whole portion of bread; five were shared in the story',
    ('bible-beginnings', 1, 'NAME'): 'Give a word by which an animal is known',
    ('bible-beginnings', 3, 'OLIVE'): 'Tree whose leaf the dove brought to Noah',
    ('bible-beginnings', 4, 'LANGUAGE'): 'System of speech used by a people',
    ('bible-family-journeys', 3, 'SHEAF'): 'Bundle of grain stalks seen in a dream',
    ('bible-moses-and-the-journey', 2, 'PILLAR'): 'Tall column of cloud or fire in Exodus',
    ('bible-moses-and-the-journey', 4, 'TABLET'): 'Flat stone slab bearing written commands',
    ('bible-courage-and-care', 4, 'SCEPTER'): "Royal staff extended to Esther",
    ('bible-stories-jesus-told', 0, 'ANIMAL'): 'Creature on which the injured traveler was carried',
    ('bible-moses-and-the-journey', 0, 'NURSE'): 'Woman caring for and feeding the baby in the story',
    ('kitchen-preparation', 0, 'DICE'): 'Cut food into small cubes',
    ('salads-to-share', 0, 'DICE'): 'Chop potatoes into small even cubes',
    ('salads-to-share', 4, 'DICE'): 'Cut fruit into little cubes',
    ('quiet-table-hobbies', 3, 'SUIT'): 'Card group such as hearts or spades',
    ('quiet-table-hobbies', 4, 'BONE'): 'Informal name for a domino tile',
    ('quiet-table-hobbies', 4, 'DOUBLE'): 'Domino with matching numbers at both ends',
    ('quiet-table-hobbies', 4, 'HAND'): 'Tiles held by a domino player',
    ('food-shops', 0, 'BAG'): 'Paper sack for carrying fresh bagels',
    ('drinks-to-serve', 0, 'BAG'): 'Small porous pouch holding leaves for brewing',
    ('summer-tastes-and-traditions', 3, 'DOG'): 'Hot ___: sausage on a stick in this fair food',
    ('summer-tastes-and-traditions', 3, 'STRAW'): 'Thin tube used to sip lemonade',
    ('drinks-to-serve', 1, 'PUNCH'): 'Fruit drink served from a large bowl',
    ('supper-on-the-stove', 3, 'CHOP'): 'Bone-in cut of pork cooked in a skillet',
    ('keeping-food-fresh', 4, 'ROLL'): 'Small individual bread kept beside a loaf',
    ('paper-for-keepsakes', 3, 'FAN'): 'Folded paper tool waved to cool the face',
    ('garden-cutting-table', 3, 'SWEETPEA'): 'Fragrant ornamental vine with pink or purple blooms (two words)',
    ('spring-garden-wildlife', 4, 'WARM'): 'Mildly heated, as a pleasant spring day',
    ('garden-from-the-beginning', 1, 'SHOOT'): 'Young growth pushing upward from a seed',
    ('garden-fruit-trees', 0, 'CORE'): "Fruit's central seed-bearing part",
    ('garden-harvest-baskets', 1, 'CAGE'): 'Wire support placed around a tomato plant',
    ('garden-small-spaces', 3, 'RUNNER'): 'Long strawberry stem that can form a new plant',
    ('garden-friendly-flowers', 4, 'HEART'): 'Shape of many morning glory leaves',
    ('garden-welcoming-corners', 2, 'MARK'): 'Engraved line indicating an hour',
    ('garden-welcoming-corners', 4, 'STEP'): 'Put a foot onto the next stone',
    ('animals-on-the-farm', 3, 'KID'): 'Young goat',
    ('birds-to-recognize', 4, 'FAN'): 'Spread-out shape of a turkey tail',
    ('looking-at-the-shore', 0, 'CLAW'): "Crab's gripping pincer",
    ('looking-at-the-shore', 1, 'ARM'): 'One ray extending from a starfish center',
    ('looking-at-the-shore', 2, 'SEAL'): 'Flippered sea mammal resting on the rocks',
    ('trees-and-their-fruit', 0, 'WING'): 'Flat part that helps a maple seed spin',
    ('bible-familiar-people', 2, 'HARP'): 'String instrument played by David',
    ('memories-of-main-street', 0, 'PIANO'): 'Keyboard instrument used to accompany silent films',
    ('memories-of-home-entertainment', 3, 'AIR'): 'On the ___: being broadcast by radio',
    ('songs-with-everyday-words', 0, 'RANGE'): 'Open country where deer and antelope roam',
    ('songs-with-everyday-words', 1, 'ROOT'): 'Cheer for the home team',
    ('songs-with-everyday-words', 1, 'HOME'): '___ team: players at their own ballpark',
    ('songs-with-everyday-words', 1, 'OUT'): 'Result removing a batter or runner from play',
    ('songs-with-everyday-words', 1, 'CRACKER'): '___ Jack: popcorn-and-peanut treat named in the song',
    ('songs-with-everyday-words', 3, 'TWO'): 'Number of riders on the bicycle in Daisy Bell',
    ('classic-movie-settings', 3, 'SWEEP'): 'Chimney ___: soot-cleaning role in Mary Poppins',
    ('classic-movie-settings', 3, 'MARY'): '___ Poppins, the magical movie nanny',
    ('classic-movie-settings', 4, 'SAM'): 'Pianist asked to play As Time Goes By in Casablanca',
    ('home-storage-spaces', 2, 'CARD'): 'One playing piece from a deck',
    ('home-storage-spaces', 2, 'BOARD'): 'Flat playing surface inside a game box',
    ('everyday-timekeepers', 0, 'HAND'): 'Pointer showing hours or minutes on a clock',
    ('everyday-timekeepers', 1, 'HAND'): 'Moving pointer on a clock face',
    ('everyday-timekeepers', 2, 'HAND'): 'One moving pointer beneath a watch crystal',
    ('household-paperwork', 1, 'SIGN'): "Write one's name on a check",
    ('keeping-in-touch', 3, 'SIGN'): 'Add a handwritten name to a birthday greeting',
    ('at-the-writing-desk', 4, 'SIGN'): 'Add your name at the end of the message',
    ('through-the-front-door', 0, 'FIBER'): 'Single threadlike strand in a doormat',
    ('restful-household-routines', 4, 'SNACK'): 'Small amount of food packed for a break',
    ('small-town-outings', 4, 'TIMETABLE'): 'List of scheduled bus departure times',
    ('porch-and-patio', 1, 'SHADE'): 'Protection from direct sunlight under an awning',
    ('christmas-little-traditions', 2, 'CURL'): 'Wavy bend in a piece of ribbon candy',
    ('christmas-preparing-the-room', 0, 'RUNNER'): 'Long narrow decorative cloth down a table center',
    ('easter-spring-color', 0, 'DYE'): 'Coloring liquid used on eggshells',
    ('easter-at-home', 0, 'CROSS'): 'Two intersecting lines on a traditional Easter bun',
}

prose = {}
for line in (ROOT/'scripts/expansion-1000-descriptions.txt').read_text().splitlines():
    if line and not line.startswith('#'):
        key, *items = line.split('|')
        assert len(items) == 5, key
        prose[key] = items

new_configs = []
problems = []

def context_clue(series, index, theme, word, n):
    """Keep homonyms in the sense actually used by the authored scene."""
    special = {
        ('neighborhood-businesses', 3, 'FRAME'): 'Structure holding the two eyeglass lenses',
        ('neighborhood-businesses', 3, 'ARM'): 'Side support of eyeglasses resting over an ear',
        ('neighborhood-businesses', 3, 'HINGE'): 'Small joint that lets an eyeglass arm fold',
        ('christmas-little-traditions', 1, 'BRIDGE'): 'Structure carrying a toy railway over a gap',
        ('small-town-outings', 1, 'DECK'): 'Walking area around a swimming pool',
        ('garden-cutting-table', 0, 'NECK'): 'Narrow upper part of a flower vase',
        ('porch-and-patio', 4, 'RING'): 'Make a clear bell-like sound',
        ('remembering-simple-play', 0, 'ROLL'): 'Move by turning over and over on the ground',
        ('shopping-basket', 0, 'ROLL'): 'Move forward on wheels',
        ('pies-and-tarts', 0, 'ROLL'): 'Flatten pastry with a turning pin',
        ('garden-evening-chores', 4, 'BED'): 'Prepared area of soil where plants grow',
        ('garden-from-the-beginning', 3, 'BED'): 'Planted area containing the onion row',
        ('around-the-town-square', 2, 'BED'): 'Area of planted flowers outside the town hall',
        ('small-town-outings', 3, 'BED'): 'Prepared section of ground for growing plants',
        ('quiet-table-hobbies', 3, 'CLUB'): 'Black card suit with a three-leaf symbol',
        ('quiet-table-hobbies', 3, 'DIAMOND'): 'Red card suit with a four-pointed symbol',
        ('quiet-table-hobbies', 3, 'HEART'): 'Red card suit with a two-lobed symbol',
        ('quiet-table-hobbies', 3, 'KING'): 'Face card ranked above a queen',
        ('quiet-table-hobbies', 3, 'QUEEN'): 'Face card ranked between jack and king',
        ('restful-household-routines', 3, 'TONGUE'): 'Shoe flap beneath the laces',
        ('keeping-in-touch', 2, 'BUTTON'): 'Small on-screen control pressed during a call',
        ('outdoor-hobby-bags', 3, 'BUTTON'): 'Small control pressed to take a photograph',
        ('on-the-local-road', 0, 'BUTTON'): 'Control pressed to request a crossing signal',
        ('around-the-town-square', 3, 'PIN'): 'Small pointed fastener holding up a notice',
        ('memories-of-main-street', 2, 'BOOTH'): 'Small enclosed space containing a public telephone',
        ('fresh-laundry', 0, 'PEG'): 'Short name for a laundry clothespin',
        ('garden-harvest-baskets', 2, 'EAR'): 'Corn unit growing around a cob',
        ('animals-on-the-farm', 2, 'FLOCK'): 'Group of sheep grazing together',
        ('on-the-local-road', 2, 'CAP'): "Cover over a car's fuel-tank opening",
        ('summer-neighborhood-days', 1, 'BAND'): 'Group of musicians performing together',
        ('spring-first-outings', 2, 'BILL'): "Duck's broad mouthpart",
        ('bible-family-journeys', 1, 'DRAW'): 'Pull water up from a well',
        ('bible-by-the-lake', 2, 'DRAW'): 'Take liquid out of a filled jar',
        ('winter-in-the-neighborhood', 2, 'FLAG'): 'Small red marker on a roadside mailbox',
        ('winter-light-and-ice', 3, 'FLAKE'): 'One small falling piece of snow',
        ('useful-home-repairs', 3, 'DROP'): 'Tiny amount of oil from a bottle',
        ('on-the-local-road', 3, 'HORN'): 'Driver-operated device that honks',
        ('thanksgiving-small-moments', 2, 'HORN'): 'Curving shape of a harvest cornucopia',
        ('around-the-town-square', 0, 'STALL'): 'Small selling space at a market',
        ('garden-cutting-table', 1, 'HANG'): 'Suspend a lavender bundle to let it dry',
        ('garden-keeping-tools', 0, 'HANG'): 'Put a tool on a wall hook',
        ('garden-welcoming-corners', 4, 'FLAT'): 'Level rather than rounded underfoot',
        ('trees-and-their-fruit', 4, 'SPLIT'): 'Break open along a seam',
        ('beside-the-water', 1, 'SLIDE'): 'Move smoothly down a muddy bank',
        ('errands-on-main-street', 3, 'SIGN'): "Write one's name on a bank form",
        ('garden-friendly-flowers', 3, 'CUP'): 'Rounded shape of an open tulip bloom',
        ('small-town-outings', 2, 'TIP'): 'Extra money left for a waiter',
        ('summer-tastes-and-traditions', 2, 'WAVE'): 'Move back and forth in the breeze',
        ('keeping-in-touch', 2, 'WAVE'): 'Move a hand in greeting',
        ('yarn-for-useful-things', 4, 'WIND'): 'Wrap yarn around to form a ball',
        ('everyday-timekeepers', 0, 'WIND'): "Turn a key to tighten a clock's spring",
        ('remembering-simple-play', 4, 'TEA'): 'Brewed drink served at a make-believe picnic',
        ('remembering-simple-play', 3, 'TOP'): 'Toy that spins on a point',
        ('winter-in-the-neighborhood', 0, 'PRINT'): 'Mark left by a boot in the snow',
        ('winter-in-the-neighborhood', 0, 'TRACK'): 'Trail of marks left by footsteps',
        ('winter-in-the-neighborhood', 2, 'TRACK'): 'Mark left in snow by a foot or tire',
        ('birds-to-recognize', 0, 'TAP'): 'Strike a tree trunk with short light blows',
        ('birds-to-recognize', 1, 'CREST'): "Tuft raised on a jay's head",
        ('spring-first-outings', 2, 'PADDLE'): 'Move through water using webbed feet',
        ('on-the-local-road', 1, 'PARK'): 'Leave a car in a designated space',
        ('quiet-table-hobbies', 3, 'SPADE'): 'Black card suit with a pointed leaf symbol',
        ('the-family-car', 2, 'TRUNK'): "Car's compartment for luggage",
        ('at-the-writing-desk', 0, 'DEAR'): 'Word often placed before a name in a letter',
        ('outdoor-hobby-bags', 4, 'DIAMOND'): 'Four-sided outline of a familiar kite shape',
        ('quiet-table-hobbies', 1, 'WING'): 'Side surface that helps an airplane fly',
        ('memories-of-main-street', 1, 'DROP'): 'Small hard piece of candy',
        ('through-the-front-door', 4, 'LEG'): 'One support beneath the entry table',
        ('porch-and-patio', 3, 'STRAW'): 'Hollow tube for sipping a cold drink',
        ('drinks-to-serve', 2, 'STRAW'): 'Thin drinking tube in a milkshake',
        ('thanksgiving-small-moments', 3, 'WATCH'): 'View a football game on a screen',
        ('autumn-outings', 3, 'BLOCK'): 'One sewn unit within a quilt pattern',
        ('summer-away-from-home', 1, 'CABIN'): 'Small vacation house beside a lake',
        ('spring-first-outings', 4, 'POCKET'): 'Hollow catching area inside a baseball glove',
        ('outdoor-hobby-bags', 4, 'REEL'): "Spool holding a kite's string",
        ('needle-and-thread-projects', 1, 'HEM'): 'Turned-under edge at the bottom of a curtain',
        ('easy-woodwork-projects', 0, 'GRAIN'): 'Natural direction of wood fibers',
        ('flower-and-fabric-crafts', 1, 'VEIN'): 'Branching line visible across a leaf',
        ('memories-of-home-entertainment', 3, 'HOST'): 'Person presenting a radio program',
        ('spring-at-the-market', 4, 'PINT'): 'Small berry-container size; two cups',
        ('bible-by-the-lake', 1, 'NET'): 'Mesh used by the fishermen to catch their food',
    }
    if (series,index,word) in special:
        return special[series,index,word]
    if word == 'POT':
        plant = theme in ('Gardening','Flowers','Spring') or (series=='winter-indoor-afternoons' and index==2)
        return (["Container filled with soil for a plant", "Plant container with a drainage hole", "Round vessel holding a growing plant", "Container for a houseplant's roots", "Clay container for growing greenery"] if plant else ["Deep cooking vessel", "Lidded vessel used to make soup", "Deep pan for cooking on a stove", "Cooking vessel that can hold broth", "Deep kitchen container heated on a burner"])[n % 5]
    if word == 'RING' and series == 'everyday-timekeepers':
        return ['Sound an alarm bell','Give a clear bell sound'][n%2]
    if word == 'RING' and series in ('memories-of-schooldays','christmas-little-traditions','keeping-in-touch','memories-of-main-street'):
        return 'Give a clear bell-like sound'
    if word == 'SHEET':
        if theme == 'Baking':
            return ['Flat metal pan for baking cookies','Baking ___: flat pan for cookies','Flat baking pan with a broad surface','Cookie ___: pan put in an oven','Flat pan supporting a batch of cookies'][n%5]
        cloth = series in ('fresh-laundry','home-cleaning-corners','home-storage-spaces','halloween-porch-scenes','restful-household-routines')
        return (['Large piece of bedding cloth','Flat fabric covering used on a bed','Broad bed-linen piece','Cloth tucked around a mattress','Large flat bed covering'] if cloth else ['Single piece of paper','One flat piece of writing paper','Separate piece of paper for printing','Paper piece holding written words','One page-sized piece of paper'])[n%5]
    if word == 'PEPPER' and series in ('garden-small-spaces','supper-in-the-oven'):
        return 'Hollow vegetable that can be green, red, or yellow'
    if word == 'ROLL' and (series,index) in [('cookie-tins',2),('kitchen-preparation',1)]:
        return 'Flatten dough by moving a pin over it'
    if word == 'ROLL' and series == 'porch-and-patio':
        return 'Wind an awning around its support for storage'
    if word == 'TART' and not (series=='pies-and-tarts' and index==3):
        return ['Sharp and sour in taste','Sour rather than sugary'][n%2]
    if word == 'NEEDLE' and series == 'yarn-for-useful-things':
        return ['Pointed tool for forming knitted loops','Long tool used with yarn to make stitches','Knitting tool held in one hand','Tool used in a pair to knit','Long pointed knitting implement'][n%5]
    if word == 'NEEDLE' and series == 'christmas-preparing-the-room':
        return 'Slender leaf on an evergreen branch'
    if word == 'FLOCK' and theme == 'Bible':
        return ['Group of sheep','Shepherd\'s group of sheep'][n%2]
    if word == 'GRAIN' and series == 'easy-woodwork-projects':
        return 'Direction and pattern of fibers in wood'
    if word == 'LEG' and series in ('porch-and-patio','useful-home-repairs'):
        return ['Support under a chair','One of a chair\'s floor supports'][n%2]
    if word == 'LAMP' and theme == 'Bible':
        return ['Oil-burning light in a Bible teaching','Small oil light used while searching a house'][n%2]
    return None

for series_index, (series, rows) in enumerate(scenes.items()):
    assert len(rows) == 5
    used = collections.Counter()
    sources = []
    for index, fields in enumerate(rows):
        _, theme, title, required, pool, *reference = fields
        words = list(dict.fromkeys(pool.upper().split()))
        words = [w for w in words if len(w) >= 3]
        pairs = []
        for word in words:
            override = overrides.get((series, index, word))
            alternatives = definitions[word]
            n = used[word]
            override = override or context_clue(series, index, theme, word, n)
            if override:
                clue = override
            elif n < len(alternatives):
                clue = alternatives[n]
            else:
                problems.append(f'{series}/{index + 1} {word}: need {n + 1} definitions')
                clue = alternatives[0]
            used[word] += 1
            assert not re.search(r'\b' + word + r'\b', clue, re.I), (title, word, clue)
            pairs.append([word, clue])
        identifier = series + (f'-{index + 1}' if index else '')
        source_notes = {w: notes[w] for w in words if w in notes}
        if series == 'bible-christmas-and-childhood' and index in (1,4):
            source_notes['JOSEPH'] = "Joseph is Mary's husband in these Gospel scenes. He is a different person from Jacob's son in the Genesis stories."
        if series == 'classic-movie-settings' and index == 3:
            source_notes.pop('MARY', None)
        if series == 'neighborhood-businesses' and index == 3:
            source_notes['FRAME'] = 'An eyeglass frame supports both lenses. Its bridge rests over the nose, and its arms extend toward the ears.'
        if series == 'quiet-table-hobbies' and index == 3:
            source_notes['HEART'] = 'Hearts is one of the two red card suits. Its rounded symbol is different from the pointed diamond symbol in the other red suit.'
        if series == 'christmas-preparing-the-room' and index == 1:
            source_notes['NEEDLE'] = 'An evergreen needle is a slender leaf. It is a different meaning from the pointed tool used for sewing or knitting.'
        if series == 'songs-with-everyday-words' and index == 1:
            source_notes['ROOT'] = 'Root is a verb meaning cheer in this baseball song. It is different from the below-ground part of a plant.'
        if theme == 'Bible':
            for word in required.split(','):
                clue = dict(pairs)[word]
                source_notes[word] = f"{clue}. This scene follows {reference[0]}; the passage gives the story's context."
        if len(source_notes) < 4:
            problems.append(f'{identifier}: only {len(source_notes)} notes')
        description = prose[series][index]
        if reference:
            description += f' Optional Bible interest: {reference[0]}.'
        sources.append(dict(
            id=identifier, title=title, subtheme=title,
            description=description, cardDescription=description,
            focus=(f"Story setting: {reference[0]}. Read the names as part of this particular story, rather than a chapter-and-verse quiz." if reference else f"The setting is {title[0].lower()+title[1:]}. Match each clue to a thing, action, or description in that scene."),
            solvingTip='Begin with a short answer you recognize. Use its crossing letters to work toward the longer scene words.',
            words=pairs, requiredAnswers=required.split(','), answerNotes=source_notes,
            **({'storyReference': reference[0]} if reference else {})
        ))
    source_file = f'{series}-editorial.json'
    (ROOT / 'scripts' / source_file).write_text(json.dumps(sources, indent=2) + '\n')
    new_configs.append(dict(id=series, name=series.replace('-', ' ').title(), theme=rows[0][1],
                            source=source_file, seed=60310000+series_index*500000,
                            attempts=15000, gridSize=11, minEntries=10, revision=1))
assert not set(c['id'] for c in original) & set(scenes)
(ROOT / 'src/data/editorial-series.json').write_text(json.dumps(original + new_configs, indent=2) + '\n')
prerequisites = ROOT / 'docs/research/expansion-1000/authoring-prerequisites.txt'
if problems:
    prerequisites.write_text('\n'.join(problems) + '\n')
else:
    prerequisites.unlink(missing_ok=True)
print(f'Prepared {len(new_configs)} series, 500 source drafts; {len(problems)} authoring prerequisites remain.')
for problem in problems:
    print(problem)
