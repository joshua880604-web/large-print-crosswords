"""Validate the released-500 preservation contract and new-scene invariants."""
import collections
import hashlib
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
read=lambda p:json.loads((ROOT/p).read_text())
canonical_hash=lambda x:hashlib.sha256(json.dumps(x,sort_keys=True,separators=(',',':')).encode()).hexdigest()
baseline=read('docs/research/expansion-1000/preservation-baseline.json')
puzzles=read('src/data/puzzles.json')
manifest=read('src/data/editorial-series.json')
assert len(puzzles)==1000 and len(manifest)==200
for p in puzzles[:500]:
    assert canonical_hash(p)==baseline['puzzles'][p['id']],f'Published object changed: {p["id"]}'
assert {p['id'] for p in puzzles[:500]}==set(baseline['puzzles'])
assert canonical_hash(manifest[:100])==baseline['editorialSeries'],'Published series changed'
for name, expected in baseline['retainedFiles'].items():
    assert hashlib.sha256((ROOT/name).read_bytes()).hexdigest()==expected,f'Published source/archive changed: {name}'
sources={s['id']:s for c in manifest[100:] for s in read('scripts/'+c['source'])}
assert len(sources)==500
sets=[set(e['answer'] for e in p['entries']) for p in puzzles]
nearest=[]
for i,p in enumerate(puzzles[500:],500):
    source=sources[p['id']]
    assert p['revision']==1
    assert set(source['requiredAnswers'])<=sets[i]
    assert 10<=len(p['entries'])<=12 and p['rows']<=11 and p['cols']<=11
    clues=dict(source['words'])
    assert all(clues[e['answer']]==e['clue'] for e in p['entries']),p['id']
    assert all(source['answerNotes'][n['answer']]==n['text'] for n in p['editorial']['answerNotes'])
    matches=[]
    for j in range(i):
        shared=sets[i]&sets[j]
        score=len(shared)/len(sets[i]|sets[j])
        # Editorial signal with an explicit review bar, not a difficulty/SEO score.
        assert score<.60 and len(sets[i]-shared)>=3 and len(sets[j]-shared)>=3,(p['id'],puzzles[j]['id'])
        matches.append((score,j,len(shared)))
    score,j,shared=max(matches)
    nearest.append({'puzzle':p['id'],'nearest':puzzles[j]['id'],'answerJaccard':round(score,4),'shared':shared})
allocation=collections.Counter(p['theme'] for p in puzzles[500:])
expected={'Gardening':35,'Flowers':15,'Nature':40,'Food':65,'Baking':15,'Everyday Life':100,'Crafts':35,'Hobbies':15,'Nostalgia':20,'Music':5,'Movies':5,'Bible':50,'Spring':20,'Summer':15,'Autumn':15,'Winter':15,'Christmas':15,'Easter':10,'Thanksgiving':5,'Halloween':5}
assert dict(allocation)==expected
report={'originalObjectsPreserved':500,'originalSeriesPreserved':100,'retainedFileHashesChecked':len(baseline['retainedFiles']),'newFirstEditions':500,'allocation':dict(allocation),'nearestAnswerSets':nearest,'limit':'Model-assisted authoring and similarity checks do not establish target-reader difficulty, independent editing, or search performance.'}
(ROOT/'docs/research/expansion-1000/preservation-and-overlap.json').write_text(json.dumps(report,indent=2)+'\n')
print('PASS expansion: 500 published objects, 100 series and all archived/source file hashes preserved; 500 new first editions have matching clues, notes, core answers, and distinct answer sets.')
