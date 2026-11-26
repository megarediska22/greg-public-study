import { pilotCriteria, type Block, type DiagnosticItem, type Form, type Role } from '../../lib/adaptive/model.ts';
import type { Normalization, Question } from '../../types/lesson.ts';

type ChoiceDraft = {
  slug: string;
  question: Omit<Extract<Question, { type: 'choice' }>, 'id'>;
  attribution: DiagnosticItem['wrongAttribution'];
};
type InputDraft = {
  slug: string;
  question: Omit<Extract<Question, { type: 'blank' | 'written' }>, 'id'>;
  attribution: DiagnosticItem['wrongAttribution'];
};
type Pair = readonly [block: Block, group: string, recognition: ChoiceDraft, production: InputDraft];

export function recognize(
  slug: string, instruction: string, prompt: string, options: readonly string[], correct: number, explanation: string,
): ChoiceDraft {
  return { slug, attribution: 'direct', question: { type: 'choice', instruction, prompt, options, acceptedAnswers: [options[correct]], explanation } };
}

export function produce(
  slug: string, instruction: string, prompt: string, answers: string | readonly string[], explanation: string,
  format: { type?: 'blank' | 'written'; normalization?: Normalization; ambiguous?: boolean } = {},
): InputDraft {
  return {
    slug,
    attribution: format.ambiguous ? 'ambiguous' : 'direct',
    question: {
      type: format.type ?? 'blank', instruction, prompt, explanation, placeholder: 'Введите ответ',
      acceptedAnswers: typeof answers === 'string' ? [answers] : answers,
      ...(format.normalization ? { normalization: format.normalization } : {}),
    },
  };
}

export const exactCase = { normalization: { caseSensitive: true } } as const;
export const written = { type: 'written', ambiguous: true } as const;
// These prompts fix the necessary words and isolate one form or word-order target.
export const grammarSentence = { type: 'written' } as const;

export function authorForm(id: 'a' | 'b', pairs: readonly Pair[]): { form: Form; items: DiagnosticItem[] } {
  const items: DiagnosticItem[] = [];
  const slots: Form['slots'] = pairs.flatMap(([block, group, recognition, production]) => {
    const criterion = pilotCriteria.find(ref => ref.group === group);
    if (!criterion) throw Error(`Diagnostic pair needs an approved criterion: ${block}/${group}`);
    const makeItem = (role: Role, draft: ChoiceDraft | InputDraft) => {
      const itemId = `diag-${id}-${draft.slug}`;
      items.push({
        itemId, itemRevision: '1', keyId: `${itemId}-key`, keyRevision: '1',
        criterion: { id: criterion.id, version: criterion.version },
        family: `family-${draft.slug}`, stimulus: `source-${draft.slug}`,
        designated: true, keyVisible: false, wrongAttribution: draft.attribution,
        role, question: { ...draft.question, id: itemId },
      });
      return { block, group, role, items: [itemId] };
    };
    return [makeItem('R', recognition), makeItem('P', production)];
  });
  return { form: { id: `pilot-form-${id}`, slots }, items };
}
