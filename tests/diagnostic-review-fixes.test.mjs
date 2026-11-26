import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import snapshot from './fixtures/diagnostic-unmodified-hashes.json' with { type: 'json' };
import { adaptivePilot } from '../src/content/adaptivePilot.ts';
import { gradeAnswer } from '../src/lib/grading.ts';
import { beginDiagnostic, canResumeDiagnostic } from '../src/lib/adaptive/diagnostic.ts';
import { interpret, foldKnowledge } from '../src/lib/adaptive/evidence.ts';

const { bank, rules } = adaptivePilot;
const team = bank.items.find(item => item.itemId === 'diag-b-team-reply');
const email = bank.items.find(item => item.itemId === 'diag-b-email-no-paper');

test('team reply requires independent be production and preserves valid full and contracted answers', () => {
  assert.doesNotMatch(team.question.instruction, /we[’']re|we are/iu);
  assert.equal(team.itemRevision, '2');
  assert.equal(team.keyRevision, '2');
  for (const answer of ["We're on Team Red.", 'We are on Team Red.']) assert.ok(gradeAnswer(team.question, answer));
  assert.ok(!gradeAnswer(team.question, 'We on Team Red.'));
});

test('printer stopped working is accepted with existing written normalization and all form variants', () => {
  for (const form of ['the online form', 'the website form', 'the form on the website', 'the form online']) {
    assert.ok(gradeAnswer(email.question, `  Use ${form} because the printer stopped working!  `));
  }
  assert.ok(!gradeAnswer(email.question, 'Use the online form because the printer started working.'));
  assert.equal(email.keyRevision, '2');
});

test('withdrawn revision-one evidence is excluded and old bank sessions cannot resume', () => {
  for (const item of [team, email]) {
    const old = { ...item, itemRevision: '1', keyRevision: '1' };
    const event = interpret({ submission: old.itemId, source: 'old', channel: 'diagnostic',
      item: old, first: true, assistance: 'H0', priorExposure: false, outcome: 'correct' });
    assert.equal(foldKnowledge([event], item.criterion, rules.withdrawnKeys).state, 'UNKNOWN');
    const fresh = interpret({ ...event, item, submission: 'new-' + item.itemId });
    assert.equal(foldKnowledge([fresh], item.criterion, rules.withdrawnKeys).state, 'PRELIMINARY');
  }
  const previousBank = { ...bank, version: 'diagnostic-bank-v1' };
  const session = beginDiagnostic('old-draft', previousBank, rules, [], []);
  assert.ok(session);
  assert.equal(canResumeDiagnostic(session, bank, rules), false);
});

// Object keys are sorted recursively; array order and every item field remain significant.
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  }
  return value;
}

function unchangedHashes(items) {
  return Object.fromEntries(items.filter(item => !snapshot.excluded.includes(item.itemId))
    .map(item => [item.itemId, createHash('sha256').update(JSON.stringify(canonical(item))).digest('hex')]));
}

test('the other 94 authored items retain their exact source', () => {
  assert.deepEqual([...snapshot.excluded].sort(), ['diag-b-email-no-paper', 'diag-b-team-reply']);
  assert.equal(Object.keys(snapshot.hashes).length, 94);
  assert.deepEqual(unchangedHashes(bank.items), snapshot.hashes);
});

test('the baseline comparison detects a changed instruction in an otherwise unchanged item', () => {
  const mutated = structuredClone(bank.items);
  const target = mutated.find(item => !snapshot.excluded.includes(item.itemId));
  target.question.instruction += ' Changed instruction.';
  assert.throws(() => assert.deepEqual(unchangedHashes(mutated), snapshot.hashes), {
    code: 'ERR_ASSERTION',
  });
});
