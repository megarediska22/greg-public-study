import type { Criterion, PracticeItem, Role } from '../../lib/adaptive/model.ts';

export function criterion(id: string, group: string, objective: string): Criterion {
  return { id: `C-BP-${id}`, version: '1', group: `K-${group}`, objectives: [objective] };
}

export function observation(
  skill: Criterion, lessonId: string, slug: string, stepId: string, family: string,
  role: Role, checkpointId?: string,
): PracticeItem {
  const itemId = `${lessonId}-${slug}`;
  return {
    lessonId, stepId, itemId, itemRevision: '1', keyId: `${itemId}-key`, keyRevision: '1',
    criterion: { id: skill.id, version: skill.version }, family, stimulus: itemId,
    role, designated: true, keyVisible: false, wrongAttribution: 'ambiguous',
    ...(checkpointId ? { checkpointId } : {}),
  };
}

export const ask = criterion('QUESTION', 'A1-ASK', 'A1-FORM-QUESTIONS');
export const tense = criterion('PRESENT-CONTRAST', 'A1-NOW', 'A1-FORM-TENSE-CONTRAST');
export const arrange = criterion('ARRANGE', 'A1-SOCIAL', 'A1-FUNC-ARRANGE');

export const pk02Criteria = [ask, tense, arrange];
export const pk02Practice = [
  observation(ask, 'bp-a1-02', 'meal-object', 'written', 'unknown-meal-on-weekly-profile', 'P'),
  observation(tense, 'bp-a1-04', 'radio-live', 'written', 'correct-a-broadcast-caption', 'P'),
  observation(arrange, 'bp-a1-05', 'band-busy', 'written', 'decline-and-offer-after-work', 'P'),
];
