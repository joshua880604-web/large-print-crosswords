"""Generate only the 100 new series, retaining every published puzzle object.

Caches are keyed by source, config, and generator code. No partial collection is
written if any series fails. Four workers leave a CPU for the development server.
"""
import concurrent.futures
import hashlib
import json
import os
from pathlib import Path
from refine_editorial import refined_puzzles

ROOT = Path(__file__).resolve().parents[1]
CACHE = Path('/workspace/artifacts/expansion-1000/generated')

def build(config):
    digest = hashlib.sha256()
    digest.update(json.dumps(config, sort_keys=True).encode())
    for path in [ROOT/'scripts'/config['source'], ROOT/'scripts/refine_editorial.py', ROOT/'scripts/crossword_grid.py']:
        digest.update(path.read_bytes())
    cache = CACHE / (config['id'] + '-' + digest.hexdigest()[:16] + '.json')
    if cache.exists():
        return config['id'], json.loads(cache.read_text()), True
    result = refined_puzzles({config['id']})
    cache.write_text(json.dumps(result, indent=2) + '\n')
    return config['id'], result, False

if __name__ == '__main__':
    CACHE.mkdir(parents=True, exist_ok=True)
    configs = json.loads((ROOT/'src/data/editorial-series.json').read_text())[100:]
    puzzles = json.loads((ROOT/'src/data/puzzles.json').read_text())
    assert len(configs) == 100 and len(puzzles) in (500, 1000)
    original = puzzles[:500]
    result = {}
    failed = []
    with concurrent.futures.ProcessPoolExecutor(max_workers=min(4, os.cpu_count() or 1)) as executor:
        futures = {executor.submit(build, c): c['id'] for c in configs}
        for future in concurrent.futures.as_completed(futures):
            try:
                name, generated, cached = future.result()
                result.update(generated)
                print(f'{len(result)}/500 {name}' + (' (cache)' if cached else ''), flush=True)
            except Exception as error:
                failed.append({'series': futures[future], 'error': str(error)})
                print(f'FAILED {futures[future]}: {error}', flush=True)
    report = CACHE.parent / 'generation-failures.json'
    report.write_text(json.dumps(failed, indent=2)+'\n')
    if failed:
        raise SystemExit(f'{len(failed)} series failed; current puzzles.json was not changed')
    ordered = [result[s['id']] for c in configs for s in json.loads((ROOT/'scripts'/c['source']).read_text())]
    assert len(ordered) == 500
    (ROOT/'src/data/puzzles.json').write_text(json.dumps(original+ordered, indent=2)+'\n')
    print('Generated 500 new first editions; retained all 500 published objects.', flush=True)
