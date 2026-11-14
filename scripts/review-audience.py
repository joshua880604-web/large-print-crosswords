"""Record audience-review prompts without editing puzzles or certifying ease.

Run: python3 scripts/review-audience.py --date 2026-11-14
Vocabulary lists are curated editorial prompts, not frequency or age statistics.
"""
import argparse
import csv
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--date', required=True, help='Review date, YYYY-MM-DD')
args = parser.parse_args()
if not re.fullmatch(r'\d{4}-\d{2}-\d{2}', args.date):
    parser.error('Use YYYY-MM-DD')

puzzles = json.loads((ROOT / 'src/data/puzzles.json').read_text())
criteria = json.loads((ROOT / 'docs/research/audience-review-criteria.json').read_text())
specialist = set(criteria['specialistAnswers'])
context = set(criteria['contextAnswers'])
trend = set(criteria['exampleTrendTerms'])
name_recall = re.compile(r'\b(first name|surname|nickname|nicknamed|born|founder|founded|title|recording)\b', re.I)
rows = []
for puzzle in puzzles:
    entries = puzzle['entries']
    hard = sorted({e['answer'] for e in entries if e['answer'] in specialist})
    contextual = sorted({e['answer'] for e in entries if e['answer'] in context})
    names = [e['answer'] for e in entries if name_recall.search(e['clue'])]
    long_clues = [e['answer'] for e in entries if len(e['clue'].split()) >= criteria['clueLengthReviewWords']]
    tokens = set(re.findall(r'\b[A-Z]+\b', ' '.join(e['answer'] + ' ' + e['clue'] for e in entries).upper()))
    trends = sorted(tokens & trend)
    recall_flag = len(names) >= criteria['nameRecallMinimumClues'] and len(names) / len(entries) >= criteria['nameRecallMinimumShare']
    disposition = 'replace-vocabulary' if hard or trends else 'review-context' if contextual or recall_flag or long_clues else 'candidate-retain'
    reasons = []
    if hard: reasons.append('Specialist selected answers need replacement/review for the general easy collection')
    if contextual: reasons.append('Topic-specific vocabulary needs familiarity review')
    if recall_flag: reasons.append('Substantial name/title recall; nostalgia alone does not establish ease')
    if long_clues: reasons.append('Longer clues need a direct-language check, preserving accuracy')
    if trends: reasons.append('A listed trend reference needs removal or review')
    if not reasons: reasons.append('No listed risk detected; reader difficulty remains untested')
    rows.append(dict(id=puzzle['id'], title=puzzle['title'], theme=puzzle['theme'], series=puzzle['series'], disposition=disposition,
                     specialistAnswers=', '.join(hard), contextAnswers=', '.join(contextual), nameRecallClues=len(names),
                     totalClues=len(entries), longerClueAnswers=', '.join(long_clues), exampleTrendMatches=', '.join(trends),
                     reason='; '.join(reasons), url=f"https://largeprintcrosswords.com/crosswords/{puzzle['id']}/"))

out = ROOT / 'docs/research'
with (out / f'audience-review-{args.date}.csv').open('w', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=list(rows[0]))
    writer.writeheader()
    writer.writerows(rows)
summary = dict(date=args.date, scope=criteria['method'], puzzles=len(rows), clues=sum(row['totalClues'] for row in rows),
               dispositions=dict(Counter(row['disposition'] for row in rows)),
               selectedSpecialistAnswers=sum(len(row['specialistAnswers'].split(', ')) for row in rows if row['specialistAnswers']),
               gamesWithExampleTrendMatches=sum(bool(row['exampleTrendMatches']) for row in rows),
               note='No flag is not an ease certification. No content, board, indexing directive, or progress key was changed by this review script.')
(out / f'audience-review-{args.date}-summary.json').write_text(json.dumps(summary, indent=2) + '\n')
print(json.dumps(summary, indent=2))
