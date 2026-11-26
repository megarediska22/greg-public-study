import { gradeAnswer } from '../grading.ts';
import { familyKey, interpret, materialKey, identity, type Evidence, type Outcome, validRole } from './evidence.ts';
import { isWithdrawn, methodVersion, pilotRules, sameCriterion, type Bank, type Block, type CourseRules, type DiagnosticItem, type Form } from './model.ts';
import { groupKnowledge, pilotCriterion, startProfiles } from './routes.ts';

export type FinishReason = 'complete' | 'early-gap' | 'early-uncertain' | 'insufficient-items' | 'budget' | 'declined-upper' | 'manual' | 'incompatible';
export type PinnedSlot = { itemId: string; revision: string; keyId: string; keyRevision: string; block: Block; group: string; role: 'R' | 'P' };
export type Session = {
  id: string; bank: string; method: string; catalogue: string; formId: string;
  queue: PinnedSlot[]; events: Evidence[]; d3: string[]; cursor: number; presented: number;
  exposed: string[]; status: 'active' | 'paused' | 'offer-upper' | 'finished'; upperAccepted: boolean;
  reason?: FinishReason;
};
export type Submission = { slot: number; itemId: string; key: string } & ({ type: 'answer'; answer: string } | { type: 'unknown' | 'skip' });
type Seen = ReadonlySet<string>;

const published = (session: Session) => session.queue[session.cursor];
const currentItem = (session: Session, bank: Bank) => {
  return pinnedItem(published(session), bank);
};
function pinnedItem(slot: PinnedSlot | undefined, bank: Bank) {
  return slot && bank.items.find(item => item.itemId === slot.itemId && item.itemRevision === slot.revision &&
    item.keyId === slot.keyId && item.keyRevision === slot.keyRevision &&
    item.role === slot.role && sameCriterion(item.criterion, pilotCriterion(slot.group)));
}
const freshKeys = (item: DiagnosticItem) => [familyKey(item), materialKey(item), identity(item)];
const seenKeys = (session: Session, history: readonly Evidence[], used: readonly string[]) =>
  new Set([...used, ...session.exposed, ...history.flatMap(event => [familyKey(event.item), materialKey(event.item), identity(event.item)])]);

function chooseBlock(bank: Bank, rules: CourseRules, form: Form, block: Block, groups: readonly string[], seen: Seen): PinnedSlot[] | null {
  const slots = form.slots.filter(slot => slot.block === block && groups.includes(slot.group));
  if (slots.length !== groups.length * 2 || groups.some(group => !['R', 'P'].every(role => slots.some(slot => slot.group === group && slot.role === role)))) return null;
  const occupied = new Set(seen);
  function assign(index: number): PinnedSlot[] | null {
    const slot = slots[index];
    if (!slot) return [];
    for (const id of slot.items) {
      const item = bank.items.find(candidate => candidate.itemId === id);
      if (!item || !slotUsable(item, slot.group, slot.role, rules)) continue;
      const keys = freshKeys(item);
      if (keys.some(key => occupied.has(key))) continue;
      for (const key of keys) occupied.add(key);
      const remainder = assign(index + 1);
      if (remainder) return [{
        itemId: item.itemId, revision: item.itemRevision, keyId: item.keyId, keyRevision: item.keyRevision,
        block, group: slot.group, role: slot.role,
      }, ...remainder];
      for (const key of keys) occupied.delete(key);
    }
    return null;
  }
  return assign(0);
}

function slotUsable(item: DiagnosticItem, group: string, role: 'R' | 'P', rules: CourseRules) {
  const criterion = pilotCriteriaFor(group);
  return !!criterion && sameCriterion(item.criterion, criterion) && item.role === role && validRole(item.role, item.question.type) &&
    item.designated && !item.keyVisible && !isWithdrawn(item, rules.withdrawnKeys);
}
function pilotCriteriaFor(group: string) {
  return [...pilotRules.entry, ...pilotRules.core, ...pilotRules.upper, ...pilotRules.optional].some(id => id === group) ? pilotCriterion(group) : undefined;
}

function show(session: Session, bank: Bank, rules: CourseRules): Session {
  const item = currentItem(session, bank);
  if (!item || isWithdrawn(item, rules.withdrawnKeys)) return finishDiagnostic(session, 'insufficient-items');
  return { ...session, status: 'active', presented: Math.max(session.presented, session.cursor + 1), exposed: [...new Set([...session.exposed, ...freshKeys(item)])] };
}
export const finishDiagnostic = (session: Session, reason: FinishReason): Session => ({ ...session, status: 'finished', reason });
function queueBlock(session: Session, bank: Bank, rules: CourseRules, form: Form, block: Block, groups: readonly string[], seen: Seen): Session {
  if (session.queue.length + groups.length * 2 > pilotRules.maxItems) return finishDiagnostic(session, 'budget');
  const slots = chooseBlock(bank, rules, form, block, groups, seen);
  if (!slots) return finishDiagnostic(session, 'insufficient-items');
  return show({ ...session, queue: [...session.queue, ...slots], d3: block === 'D3' ? [...session.d3, ...groups] : session.d3 }, bank, rules);
}

export function beginDiagnostic(id: string, bank: Bank, rules: CourseRules, history: readonly Evidence[], used: readonly string[]): Session | null {
  if (!rules.enabled || !id.trim()) return null;
  for (const form of bank.forms) {
    const session: Session = { id, bank: bank.version, method: methodVersion, catalogue: rules.version, formId: form.id, queue: [], events: [], d3: [], cursor: 0, presented: 0, exposed: [], status: 'active', upperAccepted: false };
    const result = queueBlock(session, bank, rules, form, 'D0', pilotRules.entry, seenKeys(session, history, used));
    if (result.status !== 'finished') return result;
  }
  return null;
}

function clarify(session: Session, bank: Bank, rules: CourseRules, form: Form, seen: Seen): Session {
  const state = (group: string) => groupKnowledge(session.events, group, rules).state;
  if (session.d3.length >= pilotRules.maxClarifyingPairs || session.queue.length >= pilotRules.maxItems) {
    return finishDiagnostic(session, 'budget');
  }
  if (pilotRules.gapOrder.some(group => state(group) === 'GAP')) return finishDiagnostic(session, 'complete');
  const upper = session.queue.some(slot => slot.block === 'D2-UP');
  const profiles = startProfiles.slice(0, upper ? 3 : 2);
  const next = profiles.find(profile => profile.groups.some(group => state(group) !== 'CONFIRMED'));
  if (next) {
    const group = pilotRules.clarificationOrder.find(group => next.groups.some(id => id === group) && state(group) !== 'CONFIRMED');
    if (!group || session.d3.includes(group)) return finishDiagnostic(session, 'complete');
    return queueBlock(session, bank, rules, form, 'D3', [group], seen);
  }
  if (!upper) return finishDiagnostic(session, 'complete');
  if (pilotRules.gapOrder.some(group => state(group) === 'REVIEW')) return finishDiagnostic(session, 'complete');
  const [gist, mediate] = pilotRules.optional;
  const group = state(gist) !== 'CONFIRMED' ? gist : mediate;
  if (state(group) === 'CONFIRMED' || session.d3.includes(group)) return finishDiagnostic(session, 'complete');
  if (!chooseBlock(bank, rules, form, 'D3', [group], seen)) return finishDiagnostic(session, 'insufficient-items');
  if (!session.upperAccepted) return { ...session, status: 'offer-upper' };
  return queueBlock(session, bank, rules, form, 'D3', [group], seen);
}

function advance(session: Session, bank: Bank, rules: CourseRules, history: readonly Evidence[], used: readonly string[]): Session {
  if (session.cursor < session.queue.length) return show(session, bank, rules);
  const last = session.queue.at(-1)?.block;
  const form = bank.forms.find(candidate => candidate.id === session.formId);
  if (!form) return finishDiagnostic(session, 'incompatible');
  const seen = seenKeys(session, history, used);
  const state = (group: string) => groupKnowledge(session.events, group, rules).state;
  if (last === 'D0' || last === 'D0R') {
    const lat = state('K-P-LAT');
    if (lat === 'CONFIRMED') return queueBlock(session, bank, rules, form, 'D1', pilotRules.core, seen);
    if (last === 'D0R') return finishDiagnostic(session, 'early-uncertain');
    if (lat === 'GAP') return finishDiagnostic(session, 'early-gap');
    return queueBlock(session, bank, rules, form, 'D0R', ['K-P-LAT'], seen);
  }
  if (last === 'D1') {
    const up = pilotRules.core.filter(group => state(group) === 'CONFIRMED').length >= pilotRules.minimumUpConfirmations;
    return queueBlock(session, bank, rules, form, up ? 'D2-UP' : 'D2-BASE', up ? pilotRules.upper : pilotRules.core, seen);
  }
  return clarify(session, bank, rules, form, seen);
}

function compatible(session: Session, bank: Bank, rules: CourseRules) {
  return session.method === methodVersion && session.bank === bank.version && session.catalogue === rules.version && bank.forms.some(form => form.id === session.formId);
}

export function canResumeDiagnostic(session: Session, bank: Bank, rules: CourseRules) {
  return compatible(session, bank, rules) && session.queue.slice(session.cursor).every(slot => {
    const item = pinnedItem(slot, bank);
    return !!item && !isWithdrawn(item, rules.withdrawnKeys);
  });
}

export function submitDiagnostic(session: Session, submission: Submission, bank: Bank, rules: CourseRules, history: readonly Evidence[], used: readonly string[]): Session {
  if (!rules.enabled || session.status !== 'active') return session;
  if (!compatible(session, bank, rules)) return finishDiagnostic(session, 'incompatible');
  const item = currentItem(session, bank);
  if (!item || isWithdrawn(item, rules.withdrawnKeys)) return finishDiagnostic(session, 'insufficient-items');
  if (submission.slot !== session.cursor || item.itemId !== submission.itemId || !submission.key.trim() ||
      session.events.some(event => event.submission === submission.key) || history.some(event => event.submission === submission.key)) return session;
  let outcome: Outcome = submission.type === 'skip' ? 'skipped' : 'unknown';
  if (submission.type === 'answer') {
    const answer = submission.answer;
    if (!answer.trim() || answer.length > 2000 || item.question.type === 'choice' && !item.question.options.includes(answer)) return session;
    outcome = gradeAnswer(item.question, answer) ? 'correct' : 'incorrect';
  }
  const { question: _question, ...metadata } = item;
  const event = interpret({ source: session.id, submission: submission.key, item: metadata, channel: 'diagnostic', first: true, assistance: 'H0', priorExposure: false, outcome });
  return advance({ ...session, cursor: session.cursor + 1, events: [...session.events, event] }, bank, rules, history, used);
}

export function changeDiagnostic(session: Session, action: 'pause' | 'resume' | 'finish' | 'upper' | 'decline-upper', bank: Bank, rules: CourseRules, history: readonly Evidence[], used: readonly string[]): Session {
  if (session.status === 'finished') return session;
  if (!compatible(session, bank, rules)) return finishDiagnostic(session, 'incompatible');
  if (action === 'finish') return finishDiagnostic(session, 'manual');
  if (action === 'pause') return { ...session, status: 'paused' };
  if (action === 'resume' && session.status === 'paused') {
    if (!canResumeDiagnostic(session, bank, rules)) return finishDiagnostic(session, 'incompatible');
    return advance(session, bank, rules, history, used);
  }
  if (session.status === 'offer-upper') {
    if (action === 'decline-upper') return finishDiagnostic(session, 'declined-upper');
    if (action === 'upper') return advance({ ...session, upperAccepted: true }, bank, rules, history, used);
  }
  return session;
}

export function diagnosticPrompt(session: Session, bank: Bank, rules: CourseRules) {
  if (!compatible(session, bank, rules) || session.status !== 'active') return null;
  const item = currentItem(session, bank);
  if (!item || isWithdrawn(item, rules.withdrawnKeys)) return null;
  const { id, type, instruction, prompt } = item.question;
  return { id: item.itemId, questionId: id, type, instruction, prompt,
    options: item.question.type === 'choice' ? item.question.options : undefined,
    slot: session.cursor, block: published(session).block, maxItems: pilotRules.maxItems };
}
