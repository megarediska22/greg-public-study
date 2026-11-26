import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
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

test('the other 94 authored items retain their exact source', () => {
  for (const file of ['author.ts', 'formA.ts']) {
    const old = execFileSync('git', ['show', '6469ba3:src/content/diagnostic/' + file], { encoding: 'utf8' });
    const current = execFileSync('git', ['diff', '6469ba3', '--', 'src/content/diagnostic/' + file], { encoding: 'utf8' });
    assert.ok(old.length > 0);
    assert.equal(current, '');
  }
});
