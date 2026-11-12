"""Apply the five distinct gardening editions without changing any other puzzle.

Run directly to update the committed JSON. The full collection generator imports
refine_collection too, so regeneration retains these edited subjects and notes.
Legacy layouts are separately retained in src/data/archives/gardening-originals.json.
"""
import json
from pathlib import Path
from crossword_grid import generate

ROOT=Path(__file__).resolve().parents[1]

def refined_puzzles():
    sources=json.loads((ROOT/'scripts/gardening-editorial.json').read_text())
    result={}
    for index,source in enumerate(sources):
        words=[tuple(pair) for pair in source['words']]
        # Sample deterministically, favoring useful clue counts over compactness.
        choices=[]
        import random
        for attempt in range(2000):
            seed=910000+index*10000+attempt
            chosen=random.Random(seed).sample(words,12)
            entries,rows,cols=generate(chosen,seed)
            notes=[dict(answer=e['answer'],text=source['answerNotes'][e['answer']]) for e in entries if e['answer'] in source['answerNotes']]
            if len(entries)>=11 and rows<=11 and cols<=11 and len(notes)>=3:
                choices.append((entries,rows,cols,notes))
            if len(choices)>=40:
                break
        if not choices:
            raise RuntimeError(f"Cannot build edited subject {source['id']}")
        entries,rows,cols,notes=max(choices,key=lambda choice:(len(choice[0]),-choice[1]*choice[2]))
        result[source['id']]={
            'id':source['id'],'title':source['title'],'theme':'Gardening',
            'subtheme':source['subtheme'],'series':'garden-days',
            'description':source['description'],'cardDescription':source['cardDescription'],
            'difficulty':'Easy','revision':2,'rows':rows,'cols':cols,'entries':entries,
            'editorial':{'focus':source['focus'],'solvingTip':source['solvingTip'],'answerNotes':notes[:3]}
        }
    return result

def refine_collection(puzzles):
    edited=refined_puzzles()
    missing=set(edited)-{p['id'] for p in puzzles}
    if missing:
        raise ValueError(f'Missing stable puzzle identifiers: {missing}')
    return [edited.get(p['id'],p) for p in puzzles]

if __name__=='__main__':
    path=ROOT/'src/data/puzzles.json'
    original=json.loads(path.read_text())
    revised=refine_collection(original)
    path.write_text(json.dumps(revised,indent=2)+'\n')
    for puzzle in revised:
        if puzzle.get('revision'):
            print(f"{puzzle['id']}: {puzzle['title']}, {len(puzzle['entries'])} clues, {puzzle['rows']} × {puzzle['cols']}")
