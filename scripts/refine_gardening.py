"""Compatibility entry point for refining only the five gardening subjects."""
import json
from pathlib import Path
from refine_editorial import refined_puzzles as _refined,refine_collection as _collection

def refined_puzzles():
    return _refined({'garden-days'})

def refine_collection(puzzles):
    return _collection(puzzles,{'garden-days'})

if __name__=='__main__':
    path=Path(__file__).resolve().parents[1]/'src/data/puzzles.json'
    path.write_text(json.dumps(refine_collection(json.loads(path.read_text())),indent=2)+'\n')
