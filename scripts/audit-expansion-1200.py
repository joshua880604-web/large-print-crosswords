"""Check exact preservation, authoring sources and all new answer-set neighbors."""
import collections
import hashlib
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
read=lambda path:json.loads((ROOT/path).read_text())
digest=lambda obj:hashlib.sha256(json.dumps(obj,sort_keys=True,separators=(',',':')).encode()).hexdigest()
baseline=read('docs/research/expansion-1200/preservation-baseline.json')
puzzles=read('src/data/puzzles.json')
manifest=read('src/data/editorial-series.json')
assert len(puzzles)==1200 and len(manifest)==240
assert len(baseline['puzzles'])==baseline['count']==1000
assert manifest[:200]==baseline['manifest']
assert {p['id'] for p in puzzles[:1000]}==set(baseline['puzzles'])
for p in puzzles[:1000]:
    assert digest(p)==baseline['puzzles'][p['id']],p['id']
metadata_changes=[]
for name,expected in baseline['retainedFiles'].items():
    actual=hashlib.sha256((ROOT/name).read_bytes()).hexdigest()
    if name=='src/data/topics.ts':
        # Only the displayed Bible total becomes data-driven; it is not a board,
        # source word bank, edition, archive, route, or browser-storage change.
        if actual!=expected:
            metadata_changes.append(name)
        continue
    assert actual==expected,'Retained file changed: '+name
sources={s['id']:s for c in manifest[200:] for s in read('scripts/'+c['source'])}
assert len(sources)==200
assert {p['id'] for p in puzzles[1000:]}==set(sources)
assert len({p['title'] for p in puzzles})==1200
assert len({p['description'] for p in puzzles})==1200
assert all(c['revision']==1 for c in manifest[200:])
sets=[set(e['answer'] for e in p['entries']) for p in puzzles]
nearest=[]
for i,p in enumerate(puzzles[1000:],1000):
    source=sources[p['id']]
    assert p['revision']==1 and len(p['entries']) in (10,11,12)
    assert p['rows']<=11 and p['cols']<=11
    assert len(source['requiredAnswers'])==3
    assert set(source['requiredAnswers'])<=sets[i]
    assert all(e['clue']==dict(source['words'])[e['answer']] for e in p['entries'])
    assert all(n['text']==source['answerNotes'][n['answer']] for n in p['editorial']['answerNotes'])
    assert len(set(source['answerNotes'].values()))==3
    assert len(p['editorial']['answerNotes'])==3
    if p['theme']=='Bible':
        assert p['title'].startswith('Bible Story:') and 'optional Bible scene' in p['description']
    matches=[]
    for j in range(i):
        shared=sets[i]&sets[j]
        score=len(shared)/len(sets[i]|sets[j])
        assert score<=.50 and len(sets[i]-shared)>=3 and len(sets[j]-shared)>=3,(p['id'],puzzles[j]['id'],score)
        matches.append((score,j))
    score,j=max(matches)
    nearest.append(dict(id=p['id'],title=p['title'],anchors=source['requiredAnswers'],
                        nearest=puzzles[j]['id'],nearestTitle=puzzles[j]['title'],
                        answerJaccard=round(score,4),shared=sorted(sets[i]&sets[j])))
allocation=collections.Counter(p['theme'] for p in puzzles[1000:])
expected={'Gardening':20,'Flowers':5,'Nature':15,'Food':30,'Everyday Life':40,'Crafts':10,
          'Hobbies':10,'Music':10,'Nostalgia':15,'Spring':5,'Summer':5,'Autumn':5,'Winter':5,
          'Thanksgiving':5,'Christmas':5,'Easter':5,'Bible':10}
assert dict(allocation)==expected,allocation
report=dict(baselineCommit=baseline['commit'],preservedCurrentObjects=1000,preservedSeries=200,
            retainedFilesChecked=len(baseline['retainedFiles'])-len(metadata_changes),metadataChanges=metadata_changes,
            newFirstEditions=200,newClues=sum(len(p['entries']) for p in puzzles[1000:]),
            allocation=dict(allocation),maxAnswerJaccard=max(n['answerJaccard'] for n in nearest),nearest=nearest,
            limits='Model-assisted scene and clue review; not independent editing or a target-reader study. Familiar words can recur; overlap is a review signal, not a difficulty or SEO score.')
(ROOT/'docs/research/expansion-1200/preservation-and-overlap.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k not in ('nearest','limits')},indent=2))
