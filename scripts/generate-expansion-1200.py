"""Append the new scenes only; retain all published objects and editions.

Four processes fit the five-CPU authoring environment. Content and geometry are
cached by complete source and generator digests. A failed scene writes no catalog.
"""
import concurrent.futures
import hashlib
import json
import os
import random
from pathlib import Path
from crossword_grid import generate

ROOT = Path(__file__).resolve().parents[1]
CACHE = Path('/workspace/artifacts/expansion-1200/generated')
BASELINE = json.loads((ROOT / 'docs/research/expansion-1200/preservation-baseline.json').read_text())


def build(config):
    source_path = ROOT / 'scripts' / config['source']
    digest = hashlib.sha256(source_path.read_bytes()+json.dumps(config,sort_keys=True).encode()+
                            Path(__file__).read_bytes()+(ROOT/'scripts/crossword_grid.py').read_bytes()).hexdigest()
    cache = CACHE / (config['id']+'-'+digest[:16]+'.json')
    if cache.exists():
        return json.loads(cache.read_text())
    published = json.loads((ROOT/'src/data/puzzles.json').read_text())[:1000]
    old_sets = [set(e['answer'] for e in p['entries']) for p in published]
    results = []
    for index, source in enumerate(json.loads(source_path.read_text())):
        required = set(source['requiredAnswers'])
        choices = []
        for attempt in range(config['attempts']):
            seed = config['seed']+index*10000+attempt
            selected = random.Random(seed).sample(source['words'],min(len(source['words']),12+attempt%3))
            if not required <= {a for a,c in selected}:
                continue
            entries,rows,cols = generate(selected,seed,size=11 if attempt%2 else 13)
            answers = {e['answer'] for e in entries}
            if not 10<=len(entries)<=12 or not required<=answers or rows>11 or cols>11:
                continue
            if any(len(answers&s)/len(answers|s)>.50 for s in old_sets):
                continue
            score = (len(entries),-rows*cols)
            choices.append((score,entries,rows,cols))
            if len(choices)>=12:
                break
        if not choices:
            raise RuntimeError('No valid distinct board: '+source['id'])
        _,entries,rows,cols = max(choices,key=lambda c:c[0])
        results.append(dict(id=source['id'],title=source['title'],theme=config['theme'],
                            subtheme=source['subtheme'],series=config['id'],description=source['description'],
                            cardDescription=source['cardDescription'],difficulty='Easy',revision=1,
                            rows=rows,cols=cols,entries=entries,
                            editorial=dict(focus=source['focus'],solvingTip=source['solvingTip'],
                                           answerNotes=[dict(answer=w,text=source['answerNotes'][w]) for w in source['requiredAnswers']])))
    cache.write_text(json.dumps(results,indent=2)+'\n')
    return results


if __name__ == '__main__':
    CACHE.mkdir(parents=True,exist_ok=True)
    puzzles_path = ROOT/'src/data/puzzles.json'
    old = json.loads(puzzles_path.read_text())[:1000]
    assert len(old)==1000
    for p in old:
        assert hashlib.sha256(json.dumps(p,sort_keys=True,separators=(',',':')).encode()).hexdigest()==BASELINE['puzzles'][p['id']]
    configs = json.loads((ROOT/'src/data/editorial-series.json').read_text())[200:]
    assert len(configs)==40
    results = {}
    failures = []
    with concurrent.futures.ProcessPoolExecutor(max_workers=min(4,os.cpu_count() or 1)) as executor:
        futures={executor.submit(build,c):c['id'] for c in configs}
        for future in concurrent.futures.as_completed(futures):
            try:
                results[futures[future]]=future.result()
                print(f'{len(results)}/40 {futures[future]}',flush=True)
            except Exception as error:
                failures.append(str(error))
                print('FAILED '+str(error),flush=True)
    if failures:
        raise SystemExit(f'{len(failures)} series failed; catalog unchanged: {failures}')
    new=[p for c in configs for p in results[c['id']]]
    assert len(new)==200
    puzzles_path.write_text(json.dumps(old+new,indent=2)+'\n')
    print('Appended exactly 200 new first editions; retained all 1000 published puzzle objects.')
