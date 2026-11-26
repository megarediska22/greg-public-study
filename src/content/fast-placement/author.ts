import type { FastGroup, FastItem } from '../../lib/adaptive/fast/index.ts';
import { diagnosticBank } from '../diagnostic/bank.ts';

export function author(form: 'a' | 'b') {
  function metadata(slug: string, group: FastGroup, target: string, instruction: string, prompt: string) {
    const id = `fast-placement-${form}-${slug}`;
    return {
      id, itemRevision: '1', keyId: `${id}-key`, keyRevision: '1', variant: 'new',
      family: `fast-family-${slug}`, stimulus: `fast-source-${slug}`, group, target, instruction, prompt,
    };
  }

  return {
    tap(slug: string, group: FastGroup, target: string, instruction: string, prompt: string,
      labels: readonly string[], correct: number, format: 'choice' | 'tap-fill' = 'choice'): FastItem {
      const options = labels.map((label, index) => ({ id: `option-${index + 1}`, label }));
      return {
        ...metadata(slug, group, target, instruction, prompt), format, role: 'R', wrongAttribution: 'direct',
        options, acceptedOptionIds: [options[correct].id],
      };
    },
    cards(slug: string, group: 'ASK' | 'WRITE', target: string, instruction: string, prompt: string, display: string,
      keys: readonly string[]): FastItem {
      return {
        ...metadata(slug, group, target, instruction, prompt), format: 'cards', role: 'S',
        wrongAttribution: group === 'ASK' ? 'direct' : 'ambiguous',
        tokens: display.split(' | ').map((label, index) => ({ id: `card-${index + 1}`, label })),
        acceptedSequences: keys.map(key => key.split(' | ')),
      };
    },
    prior(itemId: string, group: 'CONSTRAINT' | 'GIST' | 'MEDIATE', target: string): FastItem {
      const item = diagnosticBank.items.find(item => item.itemId === itemId);
      if (!item || item.role !== 'R' || item.question.type !== 'choice') throw Error(`Missing legacy choice ${itemId}`);
      const options = item.question.options.map((label, index) => ({ id: `option-${index + 1}`, label }));
      return {
        id: item.itemId, itemRevision: item.itemRevision, keyId: item.keyId, keyRevision: item.keyRevision,
        family: item.family, stimulus: item.stimulus, variant: 'legacy-choice', group, target,
        instruction: item.question.instruction, prompt: item.question.prompt, wrongAttribution: item.wrongAttribution,
        role: 'R', format: 'choice', options,
        acceptedOptionIds: options.filter(option => item.question.acceptedAnswers.includes(option.label)).map(option => option.id),
      };
    },
  };
}

export const cardInstruction = 'Соберите ответ из карточек. Лишние карточки оставьте.';
