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

const puzzles = boards.map(board => {
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
});

assert.equal(pending.size, 0, `Unknown puzzle copy edits: ${[...pending.keys()].join(', ')}`);

export default puzzles;
