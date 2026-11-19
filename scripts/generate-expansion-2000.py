"""Append the reviewed new scenes while preserving previously published data."""
import argparse
from collections import Counter, defaultdict
from concurrent.futures import ProcessPoolExecutor
import hashlib
import json
from pathlib import Path
import re
import runpy
import subprocess

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / "scripts"
RESEARCH = ROOT / "docs/research/expansion-2000"
BASELINE = json.loads((RESEARCH / "preservation-baseline.json").read_text())
CATALOG = "src/data/puzzles.json"
MANIFEST = "src/data/editorial-series.json"
NUMBERED_EDITIONS = "src/data/previous-editions.json"


def verified_baseline():
    archived = []
    newer_archives = []
    for name, digest in BASELINE["sha256"].items():
        content = subprocess.check_output(
            ["git", "show", f"{BASELINE['commit']}:{name}"], cwd=ROOT
        )
        assert hashlib.sha256(content).hexdigest() == digest, name
        if name == CATALOG:
            catalog = content
        elif name == MANIFEST:
            manifest = content
        elif name == NUMBERED_EDITIONS:
            current = (ROOT / name).read_bytes()
            assert current.startswith(content[:-3] + b",\n"), name
            editions = json.loads(content)
            archived.extend(editions)
            newer_archives = json.loads(current)[len(editions):]
        else:
            assert (ROOT / name).read_bytes() == content, name
            if name != "src/data/archive-clue-clarifications.json":
                archived.extend(json.loads(content))
    return catalog, manifest, archived, newer_archives


def scene_groups(old_puzzles, old_series):
    titles = {board["title"].casefold() for board in old_puzzles}
    slugs = {series["id"] for series in old_series}
    groups = []
    answer_notes = {}
    definitions = defaultdict(Counter)
    for board in old_puzzles:
        for entry in board["entries"]:
            definitions[entry["answer"]][entry["clue"]] += 1
    for line in (SCRIPTS / "expansion-1500-clues.txt").read_text().splitlines():
        word, clue = line.split("|")
        definitions[word][clue] += 10000
    reviewed = defaultdict(list)
    for line in (SCRIPTS / "expansion-2000-clues.txt").read_text().splitlines():
        word, clue = line.split("|")
        reviewed[word].append(clue)
    for line in (SCRIPTS / "expansion-2000-scenes.txt").read_text().splitlines():
        if line.startswith("# "):
            slug, theme, name = line[2:].split("|")
            assert slug not in slugs and re.fullmatch(r"[a-z0-9-]+", slug), slug
            slugs.add(slug)
            config = dict(id=slug, theme=theme, name=name,
                          source=f"expansion-2000/{slug}.json", revision=1)
            groups.append((config, []))
            continue
        title, description, bank, *notes = line.split("|")
        assert title.casefold() not in titles, title
        titles.add(title.casefold())
        config, scenes = groups[-1]
        options = {}
        for item in bank.split(";"):
            if "=" not in item:
                for word in item.split():
                    assert word not in options and re.fullmatch(r"[A-Z]{3,11}", word), (title, word)
                    common = (clue for clue, _ in definitions[word].most_common())
                    options[word] = [
                        clue for clue in reviewed.get(word, common)
                        if 4 <= len(clue) <= 84 and not re.search(rf"\b{word}\b", clue, re.I)
                    ]
                    assert options[word], (title, word)
                continue
            word, clue = item.split("=", 1)
            assert re.fullmatch(r"[A-Z]{3,11}", word), (title, word)
            assert 4 <= len(clue) <= 84 and not re.search(rf"\b{word}\b", clue, re.I), (title, word, clue)
            assert word not in options, (title, word)
            options[word] = [clue]
        number = len(scenes) + 1
        slug = config["id"] + (f"-{number}" if number > 1 else "")
        scenes.append((slug, title, description, options))
        if notes:
            explanations = notes[0].split(";")
            assert len(notes) == 1 and len(explanations) == 3 and all(explanations), title
            answer_notes[slug] = explanations
        elif "=" not in bank.split(";")[-1]:
            # The reviewed opening clues give useful definitions after a solve.
            anchors = list(options)[:3]
            answer_notes[slug] = [description, *[
                options[word][0].rstrip(".") + "." for word in anchors[1:]
            ]]
    assert groups and all(len(scenes) == 5 for _, scenes in groups)
    return groups, answer_notes


def generate_group(item):
    # Use the same grid selection criteria and schema as the preceding release.
    return runpy.run_path(str(SCRIPTS / "generate-expansion-1500.py"))["build_group"](item)


def apply_revisions(boards, series, sources, archives, earlier, helpers):
    plans = json.loads((SCRIPTS / "expansion-2000-revisions.json").read_text())
    snapshots = {(board["id"], board["revision"]): board for board in archives}
    assert len(archives) == len(snapshots)
    config_by_id = {config["id"]: (seed, config) for seed, config in enumerate(series, 2000)}
    indexes = {board["id"]: index for index, board in enumerate(boards)}
    replacements = []
    for slug, plan in plans.items():
        index = indexes[slug]
        old = boards[index]
        snapshot = snapshots[slug, old["revision"]]
        board_fields = ("id", "revision", "title", "description", "rows", "cols")
        assert all(snapshot[field] == old[field] for field in board_fields), slug
        for archived_clue, original_clue in zip(snapshot["entries"], old["entries"], strict=True):
            assert archived_clue | {"clue": original_clue["clue"]} == original_clue, slug
        assert plan["revision"] == snapshot["revision"] + 1, slug
        seed, config = config_by_id[old["series"]]
        options = {word: [clue] for word, clue in plan["words"].items()}
        scene = (slug, plan["title"], plan["description"], options)
        _, [source], [board] = helpers["build_group"]((seed, config, [scene]))
        source["revision"] = board["revision"] = plan["revision"]
        board["editorial"]["solvingTip"] = plan["solvingTip"]
        assert list(plan["notes"]) == source["requiredAnswers"], slug
        board["editorial"]["answerNotes"] = [dict(answer=answer, text=text) for answer, text in plan["notes"].items()]
        family = sources[SCRIPTS / config["source"]]
        source_index = next(i for i, item in enumerate(family) if item["id"] == slug)
        family[source_index] = source
        boards[index] = board
        replacements.append(board)

    unchanged = [board for board in boards if board["id"] not in plans]
    retained = [{**board, "id": f"{board['id']}/editions/{board['revision']}"} for board in archives]
    for match in helpers["audit"](earlier + unchanged + retained, replacements):
        print(f"{match['id']} edition comparison: {match['jaccard']:.3f} vs {match['neighbor']}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="check the existing generated outputs")
    args = parser.parse_args()
    previous_catalog, previous_manifest, archives, newer_archives = verified_baseline()
    previous = json.loads(previous_catalog)
    series = json.loads(previous_manifest)
    assert len(previous) == BASELINE["puzzles"] and len(series) == BASELINE["series"]
    groups, answer_notes = scene_groups(previous, series)
    work = [(i, config, scenes) for i, (config, scenes) in enumerate(groups, 2000)]
    configs, boards, series_sources = [], [], {}
    with ProcessPoolExecutor(max_workers=4) as executor:
        for config, sources, additions in executor.map(generate_group, work):
            configs.append(config)
            boards.extend(additions)
            series_sources[SCRIPTS / config["source"]] = sources
    for board in boards:
        if board["id"] in answer_notes:
            notes = board["editorial"]["answerNotes"]
            for note, explanation in zip(notes, answer_notes[board["id"]], strict=True):
                note["text"] = explanation
    helpers = runpy.run_path(str(SCRIPTS / "generate-expansion-1500.py"))
    # Keep the original first-edition comparison reproducible for the release record.
    neighbors = helpers["audit"](previous + archives, boards)
    apply_revisions(boards, configs, series_sources, newer_archives, previous + archives, helpers)
    outputs = {path: json_bytes(sources) for path, sources in series_sources.items()}
    for name, prefix, additions in ((CATALOG, previous_catalog, boards),
                                    (MANIFEST, previous_manifest, configs)):
        path = ROOT / name
        prefix = prefix.rstrip(b"\n")
        assert prefix.endswith(b"\n]"), name
        prefix = prefix[:-2]
        assert path.read_bytes().startswith(prefix), f"Published prefix changed: {name}"
        outputs[path] = prefix + b",\n" + json_bytes(additions)[2:]
    outputs[RESEARCH / "nearest-answer-sets.json"] = json_bytes(neighbors)
    for path, result in outputs.items():
        if args.check:
            assert path.read_bytes() == result, str(path)
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(result)
    print(f"{len(boards)} new boards checked against {len(previous)} current and "
          f"{len(archives)} historical boards.")


def json_bytes(entries):
    return (json.dumps(entries, indent=2) + "\n").encode()


if __name__ == "__main__":
    main()
