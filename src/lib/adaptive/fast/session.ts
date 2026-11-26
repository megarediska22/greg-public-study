import { CLARIFY, FAST_LIMIT, FAST_METHOD, allowedRoles, slotInfo, validSelection, type FastBank, type FastForm, type FastGroup,
  type FastItem, type FastRole, type FastSlot, type Selection } from './bank.ts';
import { isWithdrawn, type KeyRef } from '../model.ts';
import type { AdaptiveState } from '../state.ts';

export type FinishReason = 'early-preparation' | 'early-gap' | 'complete' | 'exhausted' | 'manual' | 'limit' | 'incompatible';
export type Route = 'foundation' | 'upper';
export type PinnedItem = KeyRef & {
  itemRevision: string; variant: string; family: string; stimulus: string; slot: FastSlot;
  group: FastGroup; role: FastRole; order: string[];
};
export type Observation = { outcome: 'correct' | 'incorrect' | 'ambiguous' | 'skip' | 'unknown'; sign?: '+' | '-' };
export type Acceptance = { kind: 'recommendation' | 'a1' | 'pre-a1'; lessonId: string };
export type FastSession = {
  id: string; method: string; bank: string; catalogue: string; form: string; revision: number;
  status: 'active' | 'paused' | 'finished'; route: Route | null;
  presented: PinnedItem[]; observations: Observation[]; selection: Selection | null;
  reason?: FinishReason; accepted?: Acceptance;
};
type Exposure = Pick<PinnedItem, 'itemId' | 'family' | 'stimulus'> & { bank: string; form: string };
export type FastState = { version: 1; session: FastSession | null; past: FastSession[]; exposures: Exposure[] };
export type Cursor = { sessionId: string; itemId: string; presented: number; revision: number };
export const emptyFastState = (): FastState => ({ version: 1, session: null, past: [], exposures: [] });
export const lastItem = (session: FastSession) => session.presented.at(-1)!;
export const cursorOf = (session: FastSession): Cursor => ({
  sessionId: session.id, itemId: lastItem(session).itemId, presented: session.presented.length, revision: session.revision,
});
export function sameCursor(session: FastSession, cursor: Cursor) {
  const live = cursorOf(session);
  return cursor.sessionId === live.sessionId && cursor.itemId === live.itemId &&
    cursor.presented === live.presented && cursor.revision === live.revision;
}

const displayOrder = (item: FastItem) => (item.format === 'cards' ? item.tokens : item.options).map(entry => entry.id);
export function pinItem(slot: FastSlot, item: FastItem): PinnedItem {
  const { id, itemRevision, keyId, keyRevision, variant, family, stimulus, group, role } = item;
  return { itemId: id, itemRevision, keyId, keyRevision, variant, family, stimulus, slot, group, role, order: displayOrder(item) };
}
export function pinnedItem(session: FastSession, bank: FastBank, catalogue: string, withdrawn: readonly KeyRef[]) {
  if (session.method !== FAST_METHOD || session.bank !== bank.version || session.catalogue !== catalogue) return undefined;
  const pin = lastItem(session);
  const form = bank.forms.find(form => form.id === session.form);
  const item = form && findPinned(form, pin, withdrawn);
  return item && (!session.selection || validSelection(item, session.selection, true)) ? item : undefined;
}
export function findPinned(form: FastForm, pin: PinnedItem, withdrawn: readonly KeyRef[]) {
  return form.slots[pin.slot]?.find(item => {
    const candidate = pinItem(pin.slot, item);
    return !isWithdrawn(itemWithId(item), withdrawn) && candidate.order.length === pin.order.length &&
      candidate.order.every((id, index) => id === pin.order[index]) &&
      candidate.itemId === pin.itemId && candidate.itemRevision === pin.itemRevision &&
      candidate.keyId === pin.keyId && candidate.keyRevision === pin.keyRevision &&
      candidate.variant === pin.variant && candidate.family === pin.family && candidate.stimulus === pin.stimulus &&
      candidate.group === pin.group && candidate.role === pin.role;
  });
}
export const itemWithId = (item: FastItem) => ({ itemId: item.id, keyId: item.keyId, keyRevision: item.keyRevision });

export function show(store: FastState, session: FastSession, slot: FastSlot, item: FastItem): FastState {
  const pin = pinItem(slot, item);
  const { itemId, family, stimulus } = pin;
  return { ...store, session: { ...session, presented: [...session.presented, pin], selection: null },
    exposures: [...store.exposures, { itemId, family, stimulus, bank: session.bank, form: session.form }] };
}

export function exposedMaterials(store: FastState, legacy: Pick<AdaptiveState, 'session' | 'history' | 'exposed'>) {
  const keys = new Set<string>();
  for (const item of [...store.exposures, ...legacy.history.map(event => event.item)]) {
    keys.add(`item:${item.itemId}`);
    keys.add(`family:${item.family}`);
    keys.add(`stimulus:${item.stimulus}`);
  }
  for (const raw of [...legacy.exposed, ...(legacy.session?.exposed ?? [])]) {
    try {
      const key: unknown = JSON.parse(raw);
      if (!Array.isArray(key) || key.length !== 3 || typeof key[0] !== 'string' || typeof key[2] !== 'string') continue;
      if (key[0] === 'family' || key[0] === 'stimulus') keys.add(`${key[0]}:${key[2]}`);
      else keys.add(`item:${key[0]}`);
    } catch { /* Ignore an unrecognised historical marker. */ }
  }
  return keys;
}
export function freshItem(form: FastForm, slot: FastSlot, exposed: ReadonlySet<string>, withdrawn: readonly KeyRef[]) {
  return form.slots[slot]?.find(item => !isWithdrawn(itemWithId(item), withdrawn) &&
    ![`item:${item.id}`, `family:${item.family}`, `stimulus:${item.stimulus}`].some(key => exposed.has(key)));
}

const object = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const id = (value: unknown): value is string => typeof value === 'string' && !!value.trim() && value.length <= 128;
const integer = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const oneOf = (value: unknown, values: readonly unknown[]) => values.includes(value);
const distinct = (list: readonly string[]) => new Set(list).size === list.length;
const allSlots = /^(core-(lat|be|ask|orient|note)|lat-followup|foundation-(num|be|ask)|upper-(num|constraint(-2)?|write|transfer)|clarify-(lat|be|ask|orient|note|num|constraint|write))$/u;
const reasons: readonly FinishReason[] = ['early-preparation', 'early-gap', 'complete', 'exhausted', 'manual', 'limit', 'incompatible'];

function exposure(value: unknown): value is Exposure {
  return object(value) && [value.itemId, value.family, value.stimulus, value.bank, value.form].every(id);
}
function pin(value: unknown): value is PinnedItem {
  return object(value) && [value.itemId, value.keyId, value.keyRevision, value.itemRevision, value.variant, value.family, value.stimulus].every(id) &&
    typeof value.slot === 'string' && allSlots.test(value.slot) && oneOf(value.group, slotInfo(value.slot as FastSlot).groups) &&
    oneOf(value.role, allowedRoles(value.slot as FastSlot, value.group as FastGroup)) && Array.isArray(value.order) && value.order.length > 0 && value.order.length <= 20 &&
    value.order.every(id) && distinct(value.order);
}
function observation(value: unknown): value is Observation {
  return object(value) && (value.outcome === 'correct' && value.sign === '+' ||
    value.outcome === 'incorrect' && value.sign === '-' || oneOf(value.outcome, ['ambiguous', 'skip', 'unknown']) && value.sign === undefined);
}
function savedSelection(value: unknown, item: PinnedItem): boolean {
  return value === null || object(value) && (value.type === 'option' && item.role === 'R' && typeof value.optionId === 'string' && item.order.includes(value.optionId) ||
    value.type === 'cards' && item.role === 'S' && Array.isArray(value.tokenIds) && value.tokenIds.every(id) &&
    distinct(value.tokenIds) && value.tokenIds.every(token => item.order.includes(token)));
}
function session(value: unknown): value is FastSession {
  if (!object(value) || ![value.id, value.method, value.bank, value.catalogue, value.form].every(id) ||
      !integer(value.revision) || !oneOf(value.route, [null, 'foundation', 'upper']) ||
      !oneOf(value.status, ['active', 'paused', 'finished']) || !Array.isArray(value.presented) ||
      value.presented.length === 0 || value.presented.length > FAST_LIMIT || !value.presented.every(pin) ||
      !Array.isArray(value.observations) || !value.observations.every(observation)) return false;
  const slots: PinnedItem[] = value.presented;
  if (!distinct(slots.map(slot => slot.slot)) || !distinct(slots.map(slot => slot.itemId)) ||
      !distinct(slots.map(slot => slot.family)) || !distinct(slots.map(slot => slot.stimulus)) || slots[0].slot !== 'core-lat' ||
      !savedSelection(value.selection, slots.at(-1)!)) return false;
  const outstanding = slots.length - value.observations.length;
  if (value.status !== 'finished') return outstanding === 1 && value.accepted === undefined && value.reason === undefined;
  return oneOf(value.reason, reasons) && (outstanding === 0 || outstanding === 1 && ['manual', 'incompatible'].includes(String(value.reason))) &&
    value.selection === null && (value.accepted === undefined || object(value.accepted) &&
      id(value.accepted.lessonId) && oneOf(value.accepted.kind, ['recommendation', 'a1', 'pre-a1']));
}
export function isFastState(value: unknown): value is FastState {
  return object(value) && value.version === 1 && (value.session === null || session(value.session)) &&
    Array.isArray(value.past) && value.past.length <= 24 && value.past.every(entry => session(entry) && entry.status === 'finished') &&
    distinct([...value.past.map(entry => entry.id), ...(value.session ? [value.session.id] : [])]) &&
    Array.isArray(value.exposures) && value.exposures.length <= 4800 && value.exposures.every(exposure);
}

export const fastGroups = [...CLARIFY, 'GIST', 'MEDIATE'] as const;
