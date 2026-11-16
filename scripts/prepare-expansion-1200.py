"""Compile the reviewed 200-scene plan; never regenerate earlier source banks."""
import collections
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def prepare():
    manifest_path = ROOT / 'src/data/editorial-series.json'
    manifest = json.loads(manifest_path.read_text())
    baseline = json.loads((ROOT / 'docs/research/expansion-1200/preservation-baseline.json').read_text())
    assert manifest[:200] == baseline['manifest']
    definitions = collections.defaultdict(collections.Counter)
    for config in baseline['manifest']:
        for source in json.loads((ROOT / 'scripts' / config['source']).read_text()):
            for word, clue in source['words']:
                definitions[word][clue] += 1
    clues = {word: count.most_common(1)[0][0] for word, count in definitions.items()}
    for line in (ROOT / 'scripts/expansion-1200-clues.txt').read_text().splitlines():
        word, clue = line.split('|')
        clues[word] = clue
    overrides = collections.defaultdict(dict)
    for line in (ROOT / 'scripts/expansion-1200-context-clues.txt').read_text().splitlines():
        title, word, clue = line.split('|')
        assert word not in overrides[title], (title, word)
        overrides[title][word] = clue
    notes = {}
    for line in (ROOT / 'scripts/expansion-1200-notes.txt').read_text().splitlines():
        title, *items = line.split('|')
        assert title not in notes and len(items) == 3
        notes[title] = items
    configs, scenes, output = [], [], []

    def save_group():
        if not scenes:
            return
        assert len(scenes) == 5
        (ROOT / 'scripts' / configs[-1]['source']).write_text(json.dumps(scenes, indent=2) + '\n')
        output.extend(scenes)

    for line in (ROOT / 'scripts/expansion-1200-scenes.txt').read_text().splitlines():
        if line.startswith('# '):
            save_group()
            identifier, theme, name = line[2:].split('|')
            configs.append(dict(id=identifier, name=name, theme=theme, source=identifier+'-editorial.json',
                                seed=120000000+len(configs)*100000, attempts=10000, gridSize=11,
                                minEntries=10, revision=1))
            scenes = []
            continue
        title, description, words = line.split('|')
        words = words.split()
        assert len(words) == len(set(words)), title
        assert all(re.fullmatch('[A-Z]{3,11}', w) for w in words), (title, words)
        selected_clues = {w: overrides[title].get(w, clues.get(w)) for w in words}
        assert all(selected_clues.values()), (title, [w for w,c in selected_clues.items() if not c])
        anchors = words[:3]
        identifier = configs[-1]['id'] + (f'-{len(scenes)+1}' if scenes else '')
        scenes.append(dict(id=identifier, title=title, subtheme=title, description=description,
                           cardDescription=description, focus=description,
                           solvingTip=f'Start with this clue: “{selected_clues[anchors[0]]}.” Its answer begins with {anchors[0][0]}. Then use the crossing letters for the other scene words.',
                           words=[[w, selected_clues[w]] for w in words], requiredAnswers=anchors,
                           answerNotes=dict(zip(anchors, notes[title]))))
    save_group()
    assert len(configs) == 40 and len(output) == len(notes) == 200
    assert set(overrides)<=set(notes), 'Unknown scene in context clues'
    for source in output:
        assert set(overrides[source['title']]) <= {w for w,c in source['words']}, source['title']
    old_ids = {p['id'] for p in json.loads((ROOT / 'src/data/puzzles.json').read_text())[:1000]}
    assert len({s['id'] for s in output}) == 200 and not old_ids.intersection(s['id'] for s in output)
    manifest_path.write_text(json.dumps(baseline['manifest']+configs, indent=2)+'\n')
    print('Prepared 200 reviewed scenes in 40 first-edition series.')


if __name__ == '__main__':
    prepare()
