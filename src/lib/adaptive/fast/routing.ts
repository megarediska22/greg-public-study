import { CLARIFY, CORE_SLOTS, FAST_LIMIT, FOUNDATION_SLOTS, UPPER_SLOTS, clarifierSlot, slotInfo, type FastForm, type FastGroup,
  type FastItem, type FastRole, type FastSlot, type Prerequisite } from './bank.ts';
import type { CourseRules } from '../model.ts';
import { ready } from '../routes.ts';
import { fastGroups, findPinned, freshItem, type FastSession, type FinishReason, type PinnedItem, type Route } from './session.ts';

type Sign = { group: FastGroup; role: FastRole; sign: '+' | '-'; clarifier: boolean };
export type GroupSummary = { group: FastGroup; status: 'insufficient' | 'limited' | 'strengthened' | 'disputed'; direction: '+' | '-' | null;
  positive: number; negative: number; supportedPositive: boolean };
export type Suggestion = { lessonId: string; reason: 'preparation' | 'targeted-be' | 'targeted-ask' | 'late-a1' | 'a2-entry' | 'later-a2' };

export function fastSigns(session: FastSession, form: FastForm | undefined, rules: CourseRules): Sign[] {
  if (session.reason === 'incompatible' || !form) return [];
  return session.observations.flatMap((event, index) => {
    const { group, role, slot } = session.presented[index];
    return event.sign && findPinned(form, session.presented[index], rules.withdrawnKeys ?? [])
      ? [{ group, role, sign: event.sign, clarifier: slotInfo(slot).phase === 'clarifier' }] : [];
  });
}

export function summarize(signs: readonly Sign[]): GroupSummary[] {
  return fastGroups.map(group => {
    const groupSigns = signs.filter(sign => sign.group === group);
    const positive = groupSigns.filter(sign => sign.sign === '+').length;
    const negative = groupSigns.length - positive;
    const last = groupSigns.at(-1);
    const restored = groupSigns.length === 3 && last?.clarifier && last.sign === groupSigns[1].sign;
    const direction = positive && negative && !restored ? null : last?.sign ?? null;
    return { group, direction, positive, negative, supportedPositive: groupSigns.some(sign => sign.role === 'S' && sign.sign === '+'),
      status: !groupSigns.length ? 'insufficient' : !direction ? 'disputed' : groupSigns.length === 1 ? 'limited' : 'strengthened' };
  });
}

function knowledge(signs: readonly Sign[]) {
  const states = new Map(summarize(signs).map(summary => [summary.group, summary]));
  return (group: FastGroup) => states.get(group)!;
}

function targetedGap(get: ReturnType<typeof knowledge>): Suggestion | null {
  if (get('LAT').direction !== '+') return null;
  const negative = (group: Prerequisite) => get(group).direction === '-' && get(group).negative >= 2;
  if (negative('BE')) return { lessonId: 'to-be', reason: 'targeted-be' };
  if (get('BE').direction === '+' && negative('ASK')) return { lessonId: 'do-does', reason: 'targeted-ask' };
  return null;
}

export function suggestion(signs: readonly Sign[], rules: CourseRules): Suggestion | null {
  const get = knowledge(signs);
  const plus = (...groups: Prerequisite[]) => groups.every(group => get(group).direction === '+');
  const gap = (group: Prerequisite) => get(group).direction === '-' && get(group).negative >= 2;
  const potential: Suggestion[] = [];
  if (gap('LAT')) potential.push({ lessonId: 'bp-pre-01', reason: 'preparation' });
  const targeted = targetedGap(get);
  if (targeted) potential.push(targeted);
  if (plus('LAT', 'BE', 'ASK', 'NUM', 'ORIENT', 'NOTE')) {
    if (plus('CONSTRAINT', 'WRITE') && get('CONSTRAINT').positive >= 2 && get('WRITE').supportedPositive)
      potential.push({ lessonId: 'unit-062', reason: 'later-a2' });
    potential.push({ lessonId: 'unit-042', reason: 'a2-entry' });
  }
  if (plus('LAT', 'BE', 'ASK')) potential.push({ lessonId: 'hours-and-signs', reason: 'late-a1' });
  return potential.find(item => ready(rules, item.lessonId)) ?? null;
}

type Step = { slot: FastSlot; item: FastItem; route: Route | null } | { reason: FinishReason };
type Candidate = { slot: FastSlot; item: FastItem };

function clarifications(signs: readonly Sign[], form: FastForm, presented: readonly PinnedItem[], used: ReadonlySet<string>, rules: CourseRules): Candidate[] {
  const get = knowledge(signs);
  return CLARIFY.flatMap(group => {
    const slot = clarifierSlot(group);
    const summary = get(group);
    if (presented.some(item => item.slot === slot) || summary.direction === '-' && summary.negative >= 2) return [];
    if (summary.direction === '+' && (group !== 'CONSTRAINT' || summary.positive >= 2)) return [];
    const item = freshItem(form, slot, used, rules.withdrawnKeys ?? []);
    return item ? [{ slot, item }] : [];
  });
}

function options(item: FastItem): Sign[] {
  const target = { group: item.group, role: item.role, clarifier: true };
  const correct: Sign = { ...target, sign: '+' };
  return item.wrongAttribution === 'direct' ? [correct, { ...target, sign: '-' }] : [correct];
}

function selectClarifier(signs: readonly Sign[], candidates: readonly Candidate[], remaining: number, rules: CourseRules) {
  const target = (values: readonly Sign[]) => suggestion(values, rules)?.lessonId ?? null;
  // Reserve a slot only when the candidate can change a ready target. A second
  // optional probe is considered so two missing prerequisites can be resolved.
  return candidates.find(({ item }) => options(item).some(observation => {
    if (target([...signs, observation]) !== target(signs)) return true;
    if (remaining < 2) return false;
    return candidates.some(other => other.item.group !== item.group && options(other.item).some(otherSign =>
      target([...signs, observation, otherSign]) !== target([...signs, otherSign])));
  }));
}

export function nextStep(session: FastSession, form: FastForm, used: ReadonlySet<string>, rules: CourseRules): Step {
  const { presented } = session;
  if (presented.length >= FAST_LIMIT) return { reason: 'limit' };
  const signs = fastSigns(session, form, rules);
  const get = knowledge(signs);
  const last = presented.at(-1)!.slot;
  const lat = get('LAT');
  const find = (slot: FastSlot, route = session.route): Step => {
    const item = freshItem(form, slot, used, rules.withdrawnKeys ?? []);
    return item ? { slot, item, route } : { reason: 'exhausted' };
  };
  if (last === 'core-lat' && lat.direction === '-') return find('lat-followup');
  if (last === 'lat-followup' && lat.direction === '-' && lat.negative >= 2) return { reason: 'early-preparation' };
  const nextCore = CORE_SLOTS.find(slot => !presented.some(item => item.slot === slot));
  if (nextCore) return find(nextCore);

  const route = session.route ?? (get('LAT').direction === '+' && get('BE').direction === '+' && get('ASK').direction === '+' &&
    (get('ORIENT').direction === '+' || get('NOTE').direction === '+') ? 'upper' : 'foundation');
  const recommendation = suggestion(signs, rules);
  if (route === 'foundation' && (last === 'foundation-be' || last === 'foundation-ask') && targetedGap(get)) return { reason: 'early-gap' };
  const block = route === 'upper' ? UPPER_SLOTS : FOUNDATION_SLOTS;
  const next = block.find(slot => !presented.some(item => item.slot === slot));
  if (next) return find(next, route);
  if (route === 'upper' && recommendation?.reason === 'later-a2') return { reason: 'complete' };

  const optional = presented.filter(item => slotInfo(item.slot).phase === 'clarifier').length;
  const remaining = Math.min(2 - optional, FAST_LIMIT - presented.length, route === 'foundation' ? 10 - presented.length : FAST_LIMIT);
  if (remaining <= 0) return { reason: 'complete' };
  const candidate = selectClarifier(signs, clarifications(signs, form, presented, used, rules), remaining, rules);
  return candidate ? { ...candidate, route } : { reason: 'complete' };
}
