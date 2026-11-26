export const FAST_METHOD = 'fast-placement-v1';
export const FAST_LIMIT = 15;

export const CORE_SLOTS = ['core-lat', 'core-be', 'core-ask', 'core-orient', 'core-note'] as const;
export const FOUNDATION_SLOTS = ['foundation-num', 'foundation-be', 'foundation-ask'] as const;
export const UPPER_SLOTS = ['upper-num', 'upper-constraint', 'upper-write', 'upper-constraint-2', 'upper-transfer'] as const;
export const CLARIFY = ['LAT', 'BE', 'ASK', 'ORIENT', 'NOTE', 'NUM', 'CONSTRAINT', 'WRITE'] as const;
export type Prerequisite = typeof CLARIFY[number];
export type FastGroup = Prerequisite | 'GIST' | 'MEDIATE';
export type FastRole = 'R' | 'S';
export type FastPhase = 'core' | 'entry-followup' | 'foundation' | 'upper' | 'clarifier';
export type RequiredSlot = typeof CORE_SLOTS[number] | typeof FOUNDATION_SLOTS[number] | typeof UPPER_SLOTS[number] | 'lat-followup';
export type FastSlot = RequiredSlot | `clarify-${Lowercase<Prerequisite>}`;
export const clarifierSlot = (group: Prerequisite): FastSlot => `clarify-${group.toLowerCase() as Lowercase<Prerequisite>}`;
const required = [...CORE_SLOTS, 'lat-followup', ...FOUNDATION_SLOTS, ...UPPER_SLOTS] as const;
const entries = [...required, ...CLARIFY.map(clarifierSlot)];
export const groupIds: Record<FastGroup, string> = {
  LAT: 'K-P-LAT', BE: 'K-A1-BE', ASK: 'K-A1-ASK', ORIENT: 'K-A1-ORIENT', NOTE: 'K-A1-NOTE', NUM: 'K-P-NUM',
  CONSTRAINT: 'K-A2-CONSTRAINT', WRITE: 'K-A2-WRITE', GIST: 'K-A2-GIST', MEDIATE: 'K-A2-MEDIATE',
};
export function allowedRoles(slot: FastSlot, group: FastGroup): readonly FastRole[] {
  if (group === 'ASK' || group === 'WRITE') return ['S'];
  if (slot === 'foundation-be' || slot === 'lat-followup' || slot.startsWith('clarify-')) return ['R', 'S'];
  return ['R'];
}

export type FastOption = { id: string; label: string };
export type FastToken = FastOption & { equivalent?: string };
type Metadata = {
  id: string;
  itemRevision: string;
  keyId: string;
  keyRevision: string;
  variant: string;
  family: string;
  stimulus: string;
  group: FastGroup;
  role: FastRole;
  instruction: string;
  prompt: string;
  target: string;
  wrongAttribution: 'direct' | 'ambiguous';
};
export type FastItem = Metadata & (
  | { format: 'choice' | 'tap-fill'; options: readonly FastOption[]; acceptedOptionIds: readonly string[] }
  | { format: 'cards'; tokens: readonly FastToken[]; acceptedSequences: readonly (readonly string[])[] }
);
export type FastForm = { id: string; slots: Readonly<Record<RequiredSlot, readonly FastItem[]> & Partial<Record<FastSlot, readonly FastItem[]>>> };
export type FastBank = { version: string; forms: readonly FastForm[] };
export type Selection = { type: 'option'; optionId: string } | { type: 'cards'; tokenIds: readonly string[] };
export type FastResponse = Selection | { type: 'skip' } | { type: 'unknown' };
export const tokenWord = (token: FastToken) => token.equivalent ?? token.label;

export function slotInfo(slot: FastSlot) {
  const phase: FastPhase = slot === 'lat-followup' ? 'entry-followup' : slot.startsWith('clarify-') ? 'clarifier'
    : slot.startsWith('core-') ? 'core' : slot.startsWith('foundation-') ? 'foundation' : 'upper';
  const groups: readonly FastGroup[] = slot === 'upper-transfer' ? ['GIST', 'MEDIATE']
    : slot === 'lat-followup' ? ['LAT'] : [slot.split('-')[1].toUpperCase() as FastGroup];
  return { phase, groups };
}

const id = (value: unknown): value is string => typeof value === 'string' && /^[\w.-]{1,128}$/u.test(value);
const words = (value: unknown) => typeof value === 'string' && !!value.trim() && value.length <= 2048;
const unique = (values: readonly string[]) => new Set(values).size === values.length;

function isSubsequence(key: readonly string[], display: readonly string[]) {
  let found = 0;
  for (const word of display) if (word === key[found]) found++;
  return found === key.length;
}

export function validateFastBank(bank: FastBank): string[] {
  const errors: string[] = [];
  if (!id(bank.version) || bank.forms.length !== 2 || !unique(bank.forms.map(form => form.id)))
    errors.push('Expected a version and two uniquely identified forms');
  const items = new Set<string>();
  const materials = new Map<string, string>();
  const slotRoles = new Map<string, FastRole>();
  const prompts = new Map<string, string>();
  for (const form of bank.forms) {
    if (!id(form.id)) errors.push(`Invalid form: ${form.id}`);
    for (const slot of required) if (!form.slots[slot]?.length) errors.push(`${form.id}: missing ${slot}`);
    for (const [slot, pool] of Object.entries(form.slots)) {
      if (!entries.some(allowed => allowed === slot) || !Array.isArray(pool) || pool.length === 0) {
        errors.push(`${form.id}: invalid slot ${slot}`);
        continue;
      }
      const here = `${form.id}/${slot}`;
      const { groups } = slotInfo(slot as FastSlot);
      const variants = new Set<string>();
      for (const item of pool as readonly FastItem[]) {
        if (![item.id, item.itemRevision, item.keyId, item.keyRevision, item.family, item.stimulus, item.variant].every(id) ||
            ![item.prompt, item.target, item.instruction].every(words) || !groups.includes(item.group) ||
            !allowedRoles(slot as FastSlot, item.group).includes(item.role) || !['direct', 'ambiguous'].includes(item.wrongAttribution))
          errors.push(`${here}: invalid metadata for ${item.id}`);
        if (items.has(item.id) || variants.has(item.variant)) errors.push(`${here}: duplicate item or variant ${item.id}`);
        items.add(item.id);
        variants.add(item.variant);
        if (words(item.prompt)) {
          const normalized = item.prompt.normalize('NFC').trim().replace(/\s+/gu, ' ').toLowerCase();
          const previous = prompts.get(normalized);
          if (previous && previous !== here) errors.push(`${here}: stimulus text repeats ${previous}`);
          prompts.set(normalized, here);
        }
        const priorRole = slotRoles.get(slot);
        if (priorRole && priorRole !== item.role) errors.push(`${here}: inconsistent R/S role`);
        slotRoles.set(slot, item.role);
        for (const material of [`family:${item.family}`, `stimulus:${item.stimulus}`]) {
          const owner = materials.get(material);
          if (owner && owner !== here) errors.push(`${here}: material shared with ${owner}`);
          materials.set(material, here);
        }
        if (item.format === 'cards') {
          const display = item.tokens.map(tokenWord);
          const indistinguishable = new Map(item.tokens.map(token => [token.label, tokenWord(token)]));
          const validKey = (sequence: readonly string[]) => {
            const available = [...display];
            return sequence.length >= 2 && sequence.every(word => {
              const index = available.indexOf(word);
              if (index < 0) return false;
              available.splice(index, 1);
              return true;
            }) && !isSubsequence(sequence, display);
          };
          if (item.role !== 'S' || item.tokens.length > 20 || !item.tokens.every(token => id(token.id) && words(token.label) &&
              (token.equivalent === undefined || id(token.equivalent)) && indistinguishable.get(token.label) === tokenWord(token)) ||
              !unique(item.tokens.map(token => token.id)) ||
              !item.acceptedSequences.length || !item.acceptedSequences.every(validKey))
            errors.push(`${here}: invalid or displayed card key for ${item.id}`);
        } else if (!['choice', 'tap-fill'].includes(item.format) || item.role !== 'R' || item.options.length < 2 || item.options.length > 20 ||
            !item.options.every(option => id(option.id) && words(option.label)) || !unique(item.options.map(option => option.id)) ||
            !unique(item.options.map(option => option.label.trim())) || !item.acceptedOptionIds.length ||
            item.acceptedOptionIds.length >= item.options.length || !unique(item.acceptedOptionIds) ||
            !item.acceptedOptionIds.every(key => item.options.some(option => option.id === key))) {
          errors.push(`${here}: invalid option key for ${item.id}`);
        }
      }
    }
  }
  return errors;
}

export function validSelection(item: FastItem, selection: Selection, draft = false) {
  if (!selection || typeof selection !== 'object') return false;
  if (item.format !== 'cards') return selection.type === 'option' && item.options.some(option => option.id === selection.optionId);
  return selection.type === 'cards' && Array.isArray(selection.tokenIds) && (draft || selection.tokenIds.length > 0) &&
    selection.tokenIds.length <= item.tokens.length && unique(selection.tokenIds) &&
    selection.tokenIds.every(id => item.tokens.some(token => token.id === id));
}

export function gradeFast(item: FastItem, selection: Selection): boolean | null {
  if (!validSelection(item, selection)) return null;
  if (item.format !== 'cards' && selection.type === 'option') return item.acceptedOptionIds.includes(selection.optionId);
  if (item.format !== 'cards' || selection.type !== 'cards') return null;
  const words = selection.tokenIds.map(id => tokenWord(item.tokens.find(token => token.id === id)!));
  return item.acceptedSequences.some(key => key.length === words.length && key.every((word, index) => word === words[index]));
}
