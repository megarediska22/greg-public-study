import { criterionKey, isWithdrawn, type Assistance, type Channel, type CriterionRef, type ItemMeta, type KeyRef, type Role } from './model.ts';

export type Outcome = 'correct' | 'incorrect' | 'unknown' | 'skipped';
export type Neutral = 'not-submitted' | 'assisted' | 'unknown-assistance' | 'exposed' | 'retry' | 'undesignated' | 'ambiguous' | 'invalid';
export type Evidence = {
  submission: string;
  source: string;
  channel: Channel;
  item: ItemMeta;
  first: boolean;
  assistance: Assistance;
  priorExposure: boolean;
  outcome: Outcome;
  sign?: '+' | '-';
  neutral?: Neutral;
};
export type KnowledgeState = 'UNKNOWN' | 'PRELIMINARY' | 'CONFIRMED' | 'MIXED' | 'GAP' | 'REVIEW';
export type Knowledge = { state: KnowledgeState; evidence: string[]; episode?: string; diagnosticPair: boolean };

export const familyKey = (item: ItemMeta) => JSON.stringify(['family', criterionKey(item.criterion), item.family]);
export const identity = (item: ItemMeta) => JSON.stringify([item.itemId, item.itemRevision, criterionKey(item.criterion)]);
export const materialKey = (item: ItemMeta) => JSON.stringify(['stimulus', criterionKey(item.criterion), item.stimulus]);

export function interpret(event: Omit<Evidence, 'sign' | 'neutral'>, invalid = false): Evidence {
  let neutral: Neutral | undefined;
  if (invalid) neutral = 'invalid';
  else if (event.outcome === 'unknown' || event.outcome === 'skipped') neutral = 'not-submitted';
  else if (!event.first) neutral = 'retry';
  else if (event.priorExposure || event.item.keyVisible) neutral = 'exposed';
  else if (event.assistance === 'UNKNOWN') neutral = 'unknown-assistance';
  else if (event.assistance !== 'H0') neutral = 'assisted';
  else if (!event.item.designated) neutral = 'undesignated';
  else if (event.outcome === 'incorrect' && event.item.wrongAttribution === 'ambiguous') neutral = 'ambiguous';
  return neutral ? { ...event, neutral } : { ...event, sign: event.outcome === 'correct' ? '+' : '-' };
}

export function independentSigns(events: readonly Evidence[], withdrawn: readonly KeyRef[] = []): Evidence[] {
  const families = new Set<string>();
  const stimuli = new Set<string>();
  const items = new Set<string>();
  const submissions = new Set<string>();
  return events.filter(event => {
    if (submissions.has(event.submission)) return false;
    submissions.add(event.submission);
    if (event.sign === undefined) return false;
    if (items.has(identity(event.item)) || families.has(familyKey(event.item)) || stimuli.has(materialKey(event.item))) return false;
    items.add(identity(event.item));
    families.add(familyKey(event.item));
    stimuli.add(materialKey(event.item));
    return !isWithdrawn(event.item, withdrawn);
  });
}

function isPair(previous: Evidence | undefined, current: Evidence, sign: '+' | '-') {
  return previous?.sign === sign && current.sign === sign && (previous.item.role === 'P' || current.item.role === 'P');
}

export function foldKnowledge(events: readonly Evidence[], criterion: CriterionRef, withdrawn: readonly KeyRef[] = []): Knowledge {
  const signs = independentSigns(events.filter(event => criterionKey(event.item.criterion) === criterionKey(criterion)), withdrawn);
  let state: KnowledgeState = 'UNKNOWN';
  let episode: string | undefined;
  let diagnosticPair = false;
  let previous: Evidence | undefined;
  const directions = new Set<string>();
  for (const current of signs) {
    directions.add(current.sign!);
    if (isPair(previous, current, '+')) {
      if (state !== 'CONFIRMED') diagnosticPair = false;
      diagnosticPair ||= previous?.channel === 'diagnostic' && current.channel === 'diagnostic';
      state = 'CONFIRMED';
      episode = undefined;
    } else if (state === 'CONFIRMED' || state === 'REVIEW') {
      if (state === 'CONFIRMED' && isPair(previous, current, '-')) {
        state = 'REVIEW';
        episode = current.submission;
        diagnosticPair = false;
      }
    } else if (isPair(previous, current, '-')) {
      state = 'GAP';
      episode ??= current.submission;
    } else if (!(state === 'GAP' && current.sign === '-')) {
      state = directions.size > 1 ? 'MIXED' : 'PRELIMINARY';
    }
    previous = current;
  }
  return { state, evidence: signs.map(event => event.submission), episode, diagnosticPair };
}

export function appendEvidence(events: Evidence[], event: Evidence): Evidence[] {
  if (events.some(old => old.submission === event.submission)) return events;
  // Keep the first encounter and one representative correction per item revision.
  if (events.some(old => identity(old.item) === identity(event.item) && old.first === event.first)) return events;
  return [...events, event];
}

export const isIssue = (state?: KnowledgeState) => state === 'GAP' || state === 'REVIEW';
export const validRole = (role: Role, type: string) => role === 'R' ? type === 'choice' : type === 'blank' || type === 'written';
