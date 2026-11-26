import { makeBank } from './adaptive.mjs';
import { lessons } from '../../src/content/course.ts';

export const content = {
  rules: { enabled: true, version: 'fixture-ui', readyLessons: lessons.map(lesson => lesson.id), criteria: [] },
  bank: makeBank(), practice: [],
};
export const AdapterFixture = {
  content: new URLSearchParams(globalThis.location?.search).has('incompatible') ? {
    ...content, bank: { ...content.bank, version: 'fixture-bank-updated' },
  } : content,
};

export async function checkpointFixture() {
  const { loadLesson, getProgressCourse } = await import('../../src/content/extension/registry.ts');
  const { PROGRESS_KEY, emptyProgress } = await import('../../src/lib/progress.ts');
  const { applyStep } = await import('../../scripts/curriculum-pilot-fixtures.mjs');
  const { metadata } = await import('./adaptive.mjs');
  const { adaptiveCatalog } = await import('../../src/lib/adaptive/model.ts');
  const group = adaptiveCatalog.groups.find(group => group.id === 'K-A2-PLAN');
  const plan = { id: 'fixture-plan', version: '1', group: group.id, objectives: group.objectives };
  const index = lessons.findIndex(entry => entry.id === 'unit-061');
  const prefix = await Promise.all(lessons.slice(0, index + 1).map(entry => loadLesson(entry.id)));
  const bridge = prefix.at(-1);
  if (!localStorage.getItem(PROGRESS_KEY)) {
    let progress = emptyProgress();
    for (const lesson of prefix.slice(0, -1)) for (const step of lesson.steps)
      progress = applyStep(progress, getProgressCourse(), lesson, step);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  }
  const practice = ['K-A2-PLAN', 'K-A2-CONSTRAINT'].map((group, at) => ({
    ...metadata(group, bridge.steps[2].questions[at].id, 'R'),
    ...(at === 0 ? { criterion: plan } : {}), lessonId: bridge.id, stepId: 'choice', checkpointId: 'CP-061',
  }));
  return {
    content: {
      ...content, practice, rules: { ...content.rules, criteria: [plan], checkpoints: [{
        id: 'CP-061', items: practice.map(item => item.itemId), readiness: practice.map(item => item.criterion),
      }] },
    },
  };
}
