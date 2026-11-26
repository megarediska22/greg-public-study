import { CLARIFY, CORE_SLOTS, FOUNDATION_SLOTS, UPPER_SLOTS, clarifierSlot, slotInfo } from '../../src/lib/adaptive/fast/bank.ts';

export function fixtureItem(slot, suffix, overrides = {}) {
  const group = slotInfo(slot).groups[0];
  const role = ['ASK', 'WRITE'].includes(group) || slot === 'foundation-be' ? 'S' : 'R';
  const id = `fast-fixture-${suffix}-${slot}`;
  return {
    id, itemRevision: '1', keyId: `${id}-key`, keyRevision: '1', variant: 'fixture', family: `${id}-family`,
    stimulus: `${id}-source`, group, role, instruction: 'Synthetic instruction', prompt: `Synthetic prompt ${id}`,
    target: 'Synthetic criterion', wrongAttribution: 'direct',
    ...(role === 'R' ? {
      format: slot.includes('num') ? 'tap-fill' : 'choice',
      options: [{ id: 'green', label: 'Gamma' }, { id: 'blue', label: 'Delta' }],
      acceptedOptionIds: ['green'],
    } : {
      format: 'cards',
      tokens: [
        { id: 'second-1', label: 'Y' }, { id: 'second-2', label: 'Y' },
        { id: 'first-1', label: 'Xi', equivalent: 'X' }, { id: 'first-2', label: 'X', equivalent: 'X' },
        { id: 'third', label: 'Z' },
      ],
      acceptedSequences: [['X', 'Y', 'Y', 'Z'], ['X', 'Z', 'Y', 'Y']],
    }),
    ...overrides,
  };
}

export function fastFixtureBank() {
  const slots = [...CORE_SLOTS, 'lat-followup', ...FOUNDATION_SLOTS, ...UPPER_SLOTS, ...CLARIFY.map(clarifierSlot)];
  return {
    version: 'fast-fixture-bank-v1',
    forms: ['fixture-a', 'fixture-b'].map(id => ({
      id,
      slots: Object.fromEntries(slots.map(slot => [slot, [fixtureItem(slot, id)]])),
    })),
  };
}

export const right = item => item.format === 'cards'
  ? { type: 'cards', tokenIds: ['first-2', 'second-2', 'second-1', 'third'] }
  : { type: 'option', optionId: 'green' };
export const wrong = item => item.format === 'cards'
  ? { type: 'cards', tokenIds: ['second-1', 'first-1'] }
  : { type: 'option', optionId: 'blue' };
