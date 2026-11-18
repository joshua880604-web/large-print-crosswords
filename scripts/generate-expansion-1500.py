"""Compile the 1,500-game release without rebuilding any published board."""
import argparse
from collections import Counter, defaultdict
from concurrent.futures import ProcessPoolExecutor
import hashlib
import json
from pathlib import Path
import random
import re
import subprocess

from crossword_grid import generate

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "src/data"
SCRIPTS = ROOT / "scripts"
RESEARCH = ROOT / "docs/research/expansion-1500"
BASELINE = json.loads((RESEARCH / "preservation-baseline.json").read_text())
CATALOG = "src/data/puzzles.json"
MANIFEST = "src/data/editorial-series.json"


def published_file(relative):
    content = subprocess.check_output(["git", "show", f"{BASELINE['commit']}:{relative}"], cwd=ROOT)
    if hashlib.sha256(content).hexdigest() != BASELINE["sha256"][relative]:
        raise ValueError(f"Baseline checksum mismatch: {relative}")
    return content


def appended_json(baseline, additions):
    # Retain the tracked lines byte for byte up to the old array terminator.
    assert baseline.endswith(b"\n]\n")
    return baseline[:-3] + b",\n" + json.dumps(additions, indent=2).encode()[2:]


def read_groups(published):
    clues = defaultdict(Counter)
    for puzzle in published:
        for entry in puzzle["entries"]:
            clues[entry["answer"]][entry["clue"]] += 1
    for line in (SCRIPTS / "expansion-1500-clues.txt").read_text().splitlines():
        word, clue = line.split("|")
        clues[word][clue] += 10000
    overrides = {}
    overrides_path = SCRIPTS / "expansion-1500-context-clues.txt"
    if overrides_path.exists():
        for line in overrides_path.read_text().splitlines():
            title, word, clue = line.split("|")
            assert (title, word) not in overrides, (title, word)
            overrides[title, word] = clue

    groups = []
    titles = {puzzle["title"].casefold() for puzzle in published}
    for line in (SCRIPTS / "expansion-1500-scenes.txt").read_text().splitlines():
        if line.startswith("# "):
            slug, theme, name = line[2:].split("|")
            config = dict(id=slug, name=name, theme=theme,
                          source=f"expansion-1500/{slug}.json", revision=1)
            groups.append((config, []))
            continue
        title, description, pool = line.split("|")
        assert title.casefold() not in titles, f"Duplicate title: {title}"
        titles.add(title.casefold())
        config, scenes = groups[-1]
        words = pool.split()
        assert len(set(words)) == len(words), (title, words)
        assert all(re.fullmatch("[A-Z]{3,11}", word) for word in words), (title, words)
        options = {}
        for word in words:
            override = overrides.pop((title, word), None)
            choices = [override] if override else [c for c, _ in clues[word].most_common()]
            options[word] = [c for c in choices if len(c) <= 84 and
                             not re.search(rf"\b{word}\b", c, re.I)]
            assert options[word], f"Missing direct clue for {title}: {word}"
        number = len(scenes) + 1
        identifier = config["id"] + (f"-{number}" if number > 1 else "")
        scenes.append((identifier, title, description, options))
    assert not overrides, f"Unknown overrides: {overrides}"
    assert len(groups) == 60 and all(len(scenes) == 5 for _, scenes in groups)
    return groups


def board_score(entries, rows, cols):
    return (min(len(entries), 11), -max(rows, cols), -rows * cols)


def build_group(item):
    seed, config, scenes = item
    existing_pairs = set()
    source_scenes, puzzles = [], []
    for index, (identifier, title, description, options) in enumerate(scenes):
        required = list(options)[:3]
        bank = []
        for word, choices in options.items():
            clue = next((c for c in choices if (word, c) not in existing_pairs), None)
            if clue:
                bank.append((word, clue))
        if not set(required) <= {word for word, _ in bank}:
            raise ValueError(f"{title}: add a context clue for the repeated anchor")
        best = None
        for attempt in range(450):
            key = seed * 100000 + index * 1000 + attempt
            selected = random.Random(key).sample(bank, len(bank) - (attempt % 3 == 2))
            if not set(required) <= {word for word, _ in selected}:
                continue
            entries, rows, cols = generate(selected, key, size=11 if attempt % 3 else 13)
            if not (8 <= len(entries) <= 12 and rows <= 11 and cols <= 11):
                continue
            if not set(required) <= {e["answer"] for e in entries}:
                continue
            score = board_score(entries, rows, cols)
            if best is None or score > best[0]:
                best = score, entries, rows, cols
            if len(entries) >= 10 and attempt >= 32:
                break
        if best is None:
            raise ValueError(f"{title}: no compact board with the three scene words ({len(bank)} available)")
        _, entries, rows, cols = best
        existing_pairs.update((e["answer"], e["clue"]) for e in entries)
        by_answer = {e["answer"]: e["clue"] for e in entries}
        notes = [
            dict(answer=required[0], text=description),
            *[dict(answer=word, text=f'Here, “{by_answer[word].rstrip(".")}” describes this answer.')
              for word in required[1:]],
        ]
        solving_tip = f'Look for “{by_answer[required[0]].rstrip(".")}” and try {required[0][0]} as its first letter.'
        source = dict(id=identifier, title=title, description=description,
                      words=bank, requiredAnswers=required)
        source_scenes.append(source)
        puzzles.append(dict(id=identifier, title=title, theme=config["theme"],
                            subtheme=title, series=config["id"], description=description,
                            cardDescription=description, difficulty="Easy", revision=1,
                            rows=rows, cols=cols, entries=entries,
                            editorial=dict(focus=description, solvingTip=solving_tip, answerNotes=notes)))
    return config, source_scenes, puzzles


def grid_key(puzzle):
    return tuple(sorted(
        (entry["row"] + (i if entry["direction"] == "down" else 0),
         entry["col"] + (i if entry["direction"] == "across" else 0), letter)
        for entry in puzzle["entries"] for i, letter in enumerate(entry["answer"])
    ))


def audit(published, additions):
    seen_ids = {puzzle["id"] for puzzle in published}
    seen_grids = {grid_key(puzzle) for puzzle in published}
    seen = [(puzzle["id"], {e["answer"] for e in puzzle["entries"]}) for puzzle in published]
    neighbors = []
    for puzzle in additions:
        identifier = puzzle["id"]
        grid = grid_key(puzzle)
        assert identifier not in seen_ids and grid not in seen_grids, identifier
        answers = {e["answer"] for e in puzzle["entries"]}
        score, neighbor, common = max(
            (len(answers & earlier) / len(answers | earlier), previous, sorted(answers & earlier))
            for previous, earlier in seen
        )
        if score > .50:
            raise ValueError(f"{identifier} overlaps {neighbor}: {score:.3f} ({', '.join(common)})")
        neighbors.append(dict(id=identifier, neighbor=neighbor, jaccard=round(score, 3),
                              sharedAnswers=common))
        seen_ids.add(identifier)
        seen_grids.add(grid)
        seen.append((identifier, answers))
    return neighbors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="verify that checked-in outputs reproduce")
    args = parser.parse_args()
    old_catalog, old_manifest = map(published_file, (CATALOG, MANIFEST))
    published = json.loads(old_catalog)
    assert len(published) == BASELINE["puzzles"] and len(json.loads(old_manifest)) == BASELINE["series"]
    for relative, expected in BASELINE["sha256"].items():
        if relative not in {CATALOG, MANIFEST}:
            assert hashlib.sha256((ROOT / relative).read_bytes()).hexdigest() == expected, relative
    groups = read_groups(published)
    additions, configs, outputs, failures = [], [], {}, []
    with ProcessPoolExecutor(max_workers=4) as executor:
        futures = [(config["id"], executor.submit(build_group, (i, config, scenes)))
                   for i, (config, scenes) in enumerate(groups, 1500)]
        for slug, future in futures:
            try:
                config, sources, puzzles = future.result()
            except ValueError as error:
                failures.append(f"{slug}: {error}")
                continue
            configs.append(config)
            additions.extend(puzzles)
            outputs[SCRIPTS / config["source"]] = (json.dumps(sources, indent=2) + "\n").encode()
    if failures:
        raise SystemExit("\n".join(failures))
    originals = [puzzle for path in sorted((DATA / "archives").glob("*.json"))
                 for puzzle in json.loads(path.read_text())]
    previous_editions = json.loads((DATA / "previous-editions.json").read_text())
    neighbors = audit(published + originals + previous_editions, additions)
    outputs[ROOT / MANIFEST] = appended_json(old_manifest, configs)
    outputs[ROOT / CATALOG] = appended_json(old_catalog, additions)
    outputs[RESEARCH / "nearest-answer-sets.json"] = (json.dumps(neighbors, indent=2) + "\n").encode()
    for path, content in outputs.items():
        if args.check:
            assert path.read_bytes() == content, f"Output mismatch: {path.relative_to(ROOT)}"
        else:
            if path in {ROOT / CATALOG, ROOT / MANIFEST}:
                baseline = old_catalog if path == ROOT / CATALOG else old_manifest
                current = path.read_bytes()
                assert current.startswith(baseline[:-3]), f"Published prefix changed: {path}"
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(content)
    print(f"Verified {len(additions)} new puzzles against {len(published)} current puzzles and "
          f"{len(originals) + len(previous_editions)} historical boards.")


if __name__ == "__main__":
    main()
