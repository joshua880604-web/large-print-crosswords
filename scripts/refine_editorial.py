"""Reapply edited series from the manifest while preserving all stable IDs.

Only the generated current collection is written. Legacy archives are never
modified. Each series keeps its own fixed seed so adding a series cannot change
previously published editions.
"""
import json
import random
from pathlib import Path
from crossword_grid import generate

ROOT=Path(__file__).resolve().parents[1]

def refined_puzzles(only_series=None):
    configs=json.loads((ROOT/'src/data/editorial-series.json').read_text())
    result={}
    for config in configs:
        if only_series is not None and config['id'] not in only_series:
            continue
        sources=json.loads((ROOT/'scripts'/config['source']).read_text())
        for index,source in enumerate(sources):
            words=[tuple(pair) for pair in source['words']]
            required=set(source.get('requiredAnswers',[]))
            if not required.issubset({word[0] for word in words}):
                raise ValueError(f"Required answer missing from source {source['id']}")
            choices=[]
            for attempt in range(config.get('attempts',2000)):
                seed=config['seed']+index*10000+attempt
                selected=random.Random(seed).sample(words,12)
                if not required.issubset({word[0] for word in selected}):
                    continue
                entries,rows,cols=generate(selected,seed,size=config.get('gridSize',13))
                notes=[dict(answer=e['answer'],text=source['answerNotes'][e['answer']]) for e in entries if e['answer'] in source['answerNotes']]
                if len(entries)>=config.get('minEntries',11) and rows<=11 and cols<=11 and len(notes)>=3 and required.issubset({entry['answer'] for entry in entries}):
                    choices.append((entries,rows,cols,notes))
                if len(choices)>=40:
                    break
            if not choices:
                raise RuntimeError(f"Cannot build edited subject {source['id']}")
            entries,rows,cols,notes=max(choices,key=lambda choice:(len(choice[0]),-choice[1]*choice[2]))
            result[source['id']]={
                'id':source['id'],'title':source['title'],'theme':config['theme'],
                'subtheme':source['subtheme'],'series':config['id'],
                'description':source['description'],'cardDescription':source['cardDescription'],
                'difficulty':'Easy','revision':config.get('revision',2),'rows':rows,'cols':cols,'entries':entries,
                'editorial':{'focus':source['focus'],'solvingTip':source['solvingTip'],'answerNotes':notes[:3]}
            }
    return result

def refine_collection(puzzles,only_series=None):
    edited=refined_puzzles(only_series)
    existing={p['id'] for p in puzzles}
    configs=json.loads((ROOT/'src/data/editorial-series.json').read_text())
    archived_ids={p['id'] for c in configs if c.get('archive') for p in json.loads((ROOT/'src/data/archives'/c['archive']).read_text())}
    missing=(set(edited)-existing)&archived_ids
    if missing:
        raise ValueError(f'Missing stable puzzle identifiers: {missing}')
    return [edited.get(p['id'],p) for p in puzzles]+[p for identifier,p in edited.items() if identifier not in existing]

if __name__=='__main__':
    path=ROOT/'src/data/puzzles.json'
    revised=refine_collection(json.loads(path.read_text()))
    path.write_text(json.dumps(revised,indent=2)+'\n')
    for p in revised:
        if p.get('revision'):
            print(f"{p['id']}: {p['title']}, {len(p['entries'])} clues, {p['rows']} × {p['cols']}")
