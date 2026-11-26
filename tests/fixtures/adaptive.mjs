import { pilotRules } from '../../src/lib/adaptive/model.ts';
import { pilotCriterion } from '../../src/lib/adaptive/routes.ts';

export const makeQuestion = (id, role) => role === 'R'
  ? { id, type: 'choice', instruction: 'Выберите подпись.', prompt: 'Fixture card', options: ['west', 'east'], acceptedAnswers: ['west'], explanation: 'Fixture key' }
  : { id, type: 'blank', instruction: 'Введите код.', prompt: 'Fixture locker', placeholder: 'код', acceptedAnswers: ['quartz'], explanation: 'Fixture key' };

export function metadata(group, id, role) {
  return { itemId: id, itemRevision: '1', keyId: id + '-key', keyRevision: '1', criterion: pilotCriterion(group), family: id + '-family',
    stimulus: id + '-text', role, designated: true, keyVisible: false, wrongAttribution: 'direct' };
}

export function makeBank() {
  const items = [];
  const blocks = {
    D0: pilotRules.entry, D0R: ['K-P-LAT'], D1: pilotRules.core, 'D2-BASE': pilotRules.core, 'D2-UP': pilotRules.upper,
    D3: [...pilotRules.clarificationOrder, ...pilotRules.optional],
  };
  const forms = ['fixture-a', 'fixture-b'].map(id => ({
    id,
    slots: Object.entries(blocks).flatMap(([block, groups]) => groups.flatMap(group => ['R', 'P'].map(role => {
      const itemId = [id, block, group, role].join('-');
      items.push({ ...metadata(group, itemId, role), question: makeQuestion(itemId, role) });
      return { block, group, role, items: [itemId] };
    }))),
  }));
  return { version: 'fixture-1', forms, items };
}

export const rulesFor = ids => ({ enabled: true, version: 'fixture-catalog', readyLessons: ids, criteria: [] });
export const novice = { completed: [], available: ['bp-a1-01'], resume: null };
export const storage = () => {
  const values = new Map();
  return { values, getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
};
