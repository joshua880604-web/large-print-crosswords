"""Reverse only explicitly recorded wording edits for historical hash checks.

Baselines are immutable. Current clues must match the ledger, and all remaining
fields/bytes still have to match their original hashes in the calling audit.
"""
import copy
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
CORRECTIONS=json.loads((ROOT/'docs/research/current-clue-corrections-2026-11-16.json').read_text())
assert len({(c['puzzleId'],c['answer']) for c in CORRECTIONS})==len(CORRECTIONS)


def puzzle_before_corrections(puzzle):
    original=copy.deepcopy(puzzle)
    for correction in CORRECTIONS:
        if original['id']!=correction['puzzleId']:
            continue
        matches=[e for e in original['entries'] if e['answer']==correction['answer']]
        assert len(matches)==1 and matches[0]['clue']==correction['after'],correction
        matches[0]['clue']=correction['before']
    return original


def source_before_corrections(name):
    data=(ROOT/name).read_bytes()
    for correction in CORRECTIONS:
        if name!=correction['source']:
            continue
        sources=json.loads(data)
        source=next(s for s in sources if s['id']==correction['puzzleId'])
        assert dict(source['words'])[correction['answer']]==correction['after']
        current=json.dumps(correction['after']).encode()
        previous=json.dumps(correction['before']).encode()
        assert data.count(current)==1,(name,correction['answer'])
        data=data.replace(current,previous,1)
    return data
