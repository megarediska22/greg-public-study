// Test-only answer oracle and isolated setup snapshots for the real browser entry.
import { adaptivePilot } from '../src/content/adaptivePilot.ts';
import { lessons, historicalLessons, questionCount } from '../src/content/course.ts';
import { loadLesson } from '../src/content/extension/registry.ts';
import { legacyFixtures } from './curriculum-pilot-fixtures.mjs';
import { beginDiagnostic } from '../src/lib/adaptive/diagnostic.ts';
import { interpret } from '../src/lib/adaptive/evidence.ts';
import { emptyAdaptiveState } from '../src/lib/adaptive/state.ts';

const { rules, bank, practice } = adaptivePilot;
const slots = Object.fromEntries(bank.forms.flatMap(form => form.slots.flatMap(slot => slot.items.map(id => [id, slot]))));
const checkpoints = Object.fromEntries(rules.checkpoints.map(profile => [profile.id, profile.items]));
const ids = ['bp-a1-01', 'bp-pre-02', 'bp-a1-08', 'unit-061', 'unit-062', 'bp-a2-07'];
const course = Object.fromEntries(await Promise.all(ids.map(async id => [id, await loadLesson(id)])));
const questions = Object.fromEntries(Object.values(course).flatMap(lesson => lesson.steps.flatMap(
  step => step.type === 'exercise' ? step.questions.map(question => [question.id, question]) : [],
)));
const grant = lessonId => ({ lessonId, reason: 'start', source: 'profile', version: rules.version, resume: null });
const oldSession = beginDiagnostic('saved-v1-draft', { ...bank, version: 'diagnostic-bank-v1' }, rules, [], []);
const wrongKeys = rules.withdrawnKeys;
const retired = wrongKeys.flatMap(({ itemId }) => {
  const item = bank.items.find(item => item.itemId === itemId);
  const retained = bank.items.find(candidate => candidate.criterion.id === item.criterion.id && candidate.role === 'R' &&
    candidate.itemId.startsWith('diag-b-'));
  return [retained, { ...item, itemRevision: '1', keyRevision: '1' }];
});
const history = retired.map(({ question: _, ...item }, index) =>
  interpret({ source: 'completed-v1', submission: `historical-v1-${index}`, item, channel: 'diagnostic', first: true, assistance: 'H0', priorExposure: false, outcome: 'correct' }));

console.log(JSON.stringify({
  items: Object.fromEntries(bank.items.map(item => [item.itemId, { ...slots[item.itemId], ...item.question, attribution: item.wrongAttribution }])),
  lessons: Object.fromEntries(lessons.map(entry => [entry.id, entry.title])),
  questionCount, checkpoints, questions, course, practice,
  legacy: legacyFixtures(historicalLessons),
  bridgeA1: { ...emptyAdaptiveState(), grants: [grant('bp-a1-08')] },
  bridge061: { ...emptyAdaptiveState(), grants: [grant('unit-061')] },
  prep: { ...emptyAdaptiveState(), grants: [grant('bp-pre-02')] },
  oldDraft: { ...emptyAdaptiveState(), session: { ...oldSession, status: 'paused' } },
  directA2: { ...emptyAdaptiveState(), grants: [grant('unit-062')] },
  retiredKeys: { ...emptyAdaptiveState(), history, grants: [grant('unit-062')] },
  wrongKeys,
}));
