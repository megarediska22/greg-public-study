import { identity, interpret, type Evidence } from './evidence.ts';
import type { PinnedSlot, Session } from './diagnostic.ts';
import { pilotRules, type ItemMeta } from './model.ts';
import type { Grant, Placement } from './routes.ts';

export type DiagnosticResult = {
  id: string; reason: NonNullable<Session['reason']>; applied: string[]; placement: Placement;
  choice?: { type: 'accepted'; lessonId: string } | { type: 'declined' };
};
export type CheckpointAttempt = { id: string; items: string[] };
export type AdaptiveState = {
  history: Evidence[];
  exposed: string[];
  session: Session | null;
  results: DiagnosticResult[];
  grants: Grant[];
  dismissals: Record<string, string>;
  hints: Record<string, 1 | 2>;
  checkpoints: Record<string, CheckpointAttempt>;
};
const limits = { evidence: 12000, exposures: 12000, results: 24, hints: 3000, grants: 140, dismissals: 1000, checkpoints: 13 };
export const emptyAdaptiveState = (): AdaptiveState => ({
  history: [], exposed: [], session: null, results: [], grants: [], dismissals: {}, hints: {}, checkpoints: {},
});

const object = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === 'string' && !!value.trim() && value.length <= 2048;
const integer = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const oneOf = (value: unknown, values: readonly unknown[]) => values.includes(value);
const list = (value: unknown, check: (item: unknown) => boolean, max: number): value is unknown[] =>
  Array.isArray(value) && value.length <= max && value.every(check);
const unique = (values: readonly unknown[]) => new Set(values).size === values.length;
const strings = (value: unknown, max: number): value is string[] => list(value, text, max) && unique(value);
const maybeText = (value: unknown) => value === null || text(value);
const blocks = ['D0', 'D0R', 'D1', 'D2-BASE', 'D2-UP', 'D3'];
const reasons = ['complete', 'early-gap', 'early-uncertain', 'insufficient-items', 'budget', 'declined-upper', 'manual', 'incompatible'];

function item(value: unknown): value is ItemMeta {
  return object(value) && [value.itemId, value.itemRevision, value.keyId, value.keyRevision, value.family, value.stimulus].every(text) &&
    object(value.criterion) && text(value.criterion.id) && text(value.criterion.version) &&
    oneOf(value.role, ['R', 'P']) && typeof value.designated === 'boolean' && typeof value.keyVisible === 'boolean' &&
    oneOf(value.wrongAttribution, ['direct', 'ambiguous']);
}
function evidence(value: unknown): value is Evidence {
  if (!object(value) || !item(value.item) || !text(value.submission) || !text(value.source) ||
      !oneOf(value.channel, ['diagnostic', 'lesson', 'checkpoint', 'recheck']) ||
      !oneOf(value.assistance, ['H0', 'H1', 'H2', 'UNKNOWN']) ||
      !oneOf(value.outcome, ['correct', 'incorrect', 'unknown', 'skipped']) ||
      typeof value.first !== 'boolean' || typeof value.priorExposure !== 'boolean') return false;
  const event = value as unknown as Evidence;
  const { sign, neutral, ...submission } = event;
  const expected = interpret(submission, neutral === 'invalid');
  return expected.sign === sign && expected.neutral === neutral;
}
function validSlot(value: unknown): value is PinnedSlot {
  return object(value) && [value.itemId, value.revision, value.keyId, value.keyRevision, value.group].every(text) &&
    oneOf(value.block, blocks) && oneOf(value.role, ['R', 'P']) && [
      ...pilotRules.entry, ...pilotRules.core, ...pilotRules.upper, ...pilotRules.optional,
    ].some(group => group === value.group);
}
function session(value: unknown): value is Session {
  if (!object(value) || ![value.id, value.formId, value.bank, value.method, value.catalogue].every(text) ||
      !oneOf(value.status, ['active', 'paused', 'offer-upper', 'finished']) ||
      typeof value.upperAccepted !== 'boolean' || !integer(value.cursor) || !integer(value.presented) ||
      !strings(value.d3, pilotRules.maxClarifyingPairs) || !strings(value.exposed, pilotRules.maxItems * 3) ||
      !list(value.queue, validSlot, pilotRules.maxItems) || !list(value.events, evidence, pilotRules.maxItems) ||
      value.queue.length < 4 || value.presented < value.cursor || value.presented > value.queue.length || value.presented > value.cursor + 1 || value.cursor > value.queue.length || value.events.length !== value.cursor ||
      value.status === 'active' && value.cursor === value.queue.length ||
      value.status === 'finished' && !oneOf(value.reason, reasons) || value.status !== 'finished' && value.reason !== undefined) return false;
  const queue = value.queue as PinnedSlot[];
  const events = value.events as Evidence[];
  return unique(queue.map(slot => slot.itemId)) && unique(events.map(event => event.submission)) &&
    events.every((event, index) => {
      const slot = queue[index];
      return event.source === value.id && event.channel === 'diagnostic' && event.item.itemId === slot.itemId &&
        event.item.itemRevision === slot.revision && event.item.keyId === slot.keyId && event.item.keyRevision === slot.keyRevision;
    });
}
function placement(value: unknown) {
  const start = (candidate: unknown) => candidate === null || object(candidate) && text(candidate.lessonId) &&
    oneOf(candidate.reason, ['safe-start', 'preparation', 'profile', 'gap', 'resume', 'insufficient']) &&
    (candidate.group === undefined || text(candidate.group));
  return object(value) && start(value.start) && start(value.earlier) && maybeText(value.resume) && maybeText(value.preA1);
}
function result(value: unknown) {
  return object(value) && text(value.id) && oneOf(value.reason, reasons) && strings(value.applied, pilotRules.maxItems) && placement(value.placement) &&
    (value.choice === undefined || object(value.choice) && (value.choice.type === 'declined' ||
      value.choice.type === 'accepted' && text(value.choice.lessonId)));
}
function grant(value: unknown) {
  return object(value) && [value.lessonId, value.source, value.version].every(text) && maybeText(value.resume) &&
    oneOf(value.reason, ['start', 'skip', 'completion', 'independent', 'supported']);
}
function dictionary(value: unknown, check: (item: unknown) => boolean, max: number) {
  return object(value) && Object.keys(value).length <= max && Object.entries(value).every(([key, item]) => text(key) && check(item));
}
export function isAdaptiveState(value: unknown): value is AdaptiveState {
  if (!object(value) || !list(value.history, evidence, limits.evidence) || !list(value.grants, grant, limits.grants) ||
      !list(value.results, result, limits.results) || !strings(value.exposed, limits.exposures) ||
      !(value.session === null || session(value.session)) ||
      !dictionary(value.dismissals, text, limits.dismissals) || !dictionary(value.hints, item => item === 1 || item === 2, limits.hints) ||
      !dictionary(value.checkpoints, item => object(item) && text(item.id) && strings(item.items, limits.hints), limits.checkpoints)) return false;
  const state = value as unknown as AdaptiveState;
  return unique(state.history.map(event => event.submission)) &&
    unique(state.history.map(event => JSON.stringify([identity(event.item), event.first]))) &&
    unique(state.grants.map(grant => grant.lessonId)) && unique(state.results.map(result => result.id));
}
export const latestResults = (results: DiagnosticResult[]) => results.slice(-limits.results);
