import assert from 'node:assert/strict';
import boards from './puzzles.json' with {type:'json'};
import copyEdits from './puzzle-copy-edits.json' with {type:'json'};

const pending = new Map(Object.entries(copyEdits));

// Wording edits are applied equally to play and print. The generated boards
// and archived editions remain the source of the saved positions and answers.
/**
 * @template {{answer: string}} T
 * @param {T[]} items
 * @param {Record<string, string>} edits
 * @param {string} id
 * @param {'clue' | 'text'} field
 * @returns {T[]}
 */
function reviseText(items, edits, id, field) {
  for (const [answer, text] of Object.entries(edits)) {
    assert.equal(items.filter(item => item.answer === answer).length, 1, `${id}: unknown or ambiguous ${field} for ${answer}`);
    assert.ok(text.trim().length > 3, `${id}: missing ${field} for ${answer}`);
  }
  return items.map(item => Object.hasOwn(edits, item.answer) ? {...item, [field]: edits[item.answer]} : item);
}

/** @param {typeof boards[number]} board */
function applyCopyEdits(board) {
  const edit = pending.get(board.id);
  if (!edit) return board;

  assert.equal(board.revision, edit.revision, `${board.id}: review copy edits for the current edition`);
  assert.ok(edit.solvingTip.trim(), `${board.id}: missing solving tip`);
  pending.delete(board.id);
  return {
    ...board,
    entries: reviseText(board.entries, edit.clues ?? {}, board.id, 'clue'),
    editorial: {
      ...board.editorial,
      focus: edit.focus ?? board.editorial.focus,
      solvingTip: edit.solvingTip,
      answerNotes: reviseText(board.editorial.answerNotes, edit.notes ?? {}, board.id, 'text'),
    },
  };
}

const normalize = text => text.trim().toLowerCase().replace(/[.?!]+$/, '').replace(/\s+/g, ' ');

// Drop restatements of the same clue or introduction from the current edition.
// Keep the original notes in the source and preserved editions.
const puzzles = boards.map(applyCopyEdits).map(puzzle => {
  const {editorial} = puzzle;
  const introduction = normalize(puzzle.description);
  const focus = normalize(editorial.focus);
  const clues = new Map(puzzle.entries.map(entry => [entry.answer, normalize(entry.clue)]));
  const answerNotes = editorial.answerNotes.filter(({answer, text}) => {
    const quotedClue = text.match(/^Here, “(.+)” describes this answer\.$/)?.[1];
    const explanation = normalize(quotedClue ?? text);
    return explanation !== introduction && explanation !== focus && explanation !== clues.get(answer);
  });
  return answerNotes.length === editorial.answerNotes.length
    ? puzzle
    : {...puzzle, editorial: {...editorial, answerNotes}};
});

assert.equal(pending.size, 0, `Unknown puzzle copy edits: ${[...pending.keys()].join(', ')}`);

export default puzzles;
