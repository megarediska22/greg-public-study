import type { CheckpointAttempt } from './state.ts';
import { foldKnowledge, independentSigns, isIssue, type Evidence } from './evidence.ts';
import { adaptiveCatalog, criterionKey, pilotCriteria, pilotRules, type CourseRules, type CriterionRef } from './model.ts';

export type LegacyAccess = { completed: readonly string[]; available: readonly string[]; resume: string | null };
export type Start = { lessonId: string; reason: 'safe-start' | 'preparation' | 'profile' | 'gap' | 'resume' | 'insufficient'; group?: string };
export type Placement = { start: Start | null; earlier: Start | null; resume: string | null; preA1: string | null };
export type Grant = { lessonId: string; reason: 'start' | 'skip' | 'completion' | 'independent' | 'supported'; source: string; version: string; resume: string | null };
export const startProfiles = [
  { lessonId: 'hours-and-signs', groups: ['K-P-LAT', 'K-A1-BE', 'K-A1-ASK'] },
  { lessonId: 'unit-042', groups: ['K-P-LAT', 'K-A1-BE', 'K-A1-ASK', 'K-P-NUM', 'K-A1-ORIENT', 'K-A1-NOTE'] },
  { lessonId: 'unit-062', groups: ['K-P-LAT', 'K-A1-BE', 'K-A1-ASK', 'K-P-NUM', 'K-A1-ORIENT', 'K-A1-NOTE', 'K-A2-CONSTRAINT', 'K-A2-WRITE'] },
  { lessonId: 'bp-a2-07', groups: ['K-P-LAT', 'K-A1-BE', 'K-A1-ASK', 'K-P-NUM', 'K-A1-ORIENT', 'K-A1-NOTE', 'K-A2-CONSTRAINT', 'K-A2-WRITE', 'K-A2-GIST', 'K-A2-MEDIATE'] },
] as const;
export const pilotCriterion = (group: string) => pilotCriteria.find(criterion => criterion.group === group)!;
export const ready = (rules: CourseRules, id: string | null | undefined): id is string =>
  !!id && rules.readyLessons.includes(id) && adaptiveCatalog.sequence.some(entry => entry.id === id);
export const groupKnowledge = (events: readonly Evidence[], group: string, rules: CourseRules) =>
  foldKnowledge(events, pilotCriterion(group), rules.withdrawnKeys);
export const preA1 = (rules: CourseRules) => ready(rules, 'bp-pre-01') ? 'bp-pre-01' : null;
export const safeStart = (rules: CourseRules) => ready(rules, 'bp-a1-01') ? 'bp-a1-01' : ready(rules, 'to-be') ? 'to-be' : null;
export function canAccess(rules: CourseRules, legacy: LegacyAccess, grants: readonly Grant[], id: string) {
  return ready(rules, id) && (legacy.available.includes(id) || legacy.completed.includes(id) ||
    (rules.enabled && id === safeStart(rules)) || grants.some(grant => grant.lessonId === id));
}

export function currentPlacement(rules: CourseRules, legacy: LegacyAccess, grants: readonly Grant[], history: readonly Evidence[], fresh?: readonly Evidence[]): Placement {
  const resume = legacy.resume && canAccess(rules, legacy, grants, legacy.resume) ? legacy.resume : null;
  const safe = safeStart(rules);
  const pre = preA1(rules);
  const result: Placement = { start: null, earlier: safe ? { lessonId: safe, reason: 'safe-start' } : null, resume, preA1: pre };
  if (!fresh) return { ...result, start: resume ? { lessonId: resume, reason: 'resume' } : safe ? { lessonId: safe, reason: 'insufficient' } : null };
  const confirmed = (group: string) => groupKnowledge(history, group, rules).state === 'CONFIRMED';
  const both = (group: string) => confirmed(group) && groupKnowledge(fresh, group, rules).state === 'CONFIRMED';
  const gap = pilotRules.gapOrder.find(group => isIssue(groupKnowledge(history, group, rules).state) || isIssue(groupKnowledge(fresh, group, rules).state));
  if (gap) {
    const accessible = (id: string) => canAccess(rules, legacy, grants, id);
    const candidates: Record<string, (string | null)[]> = {
      'K-P-LAT': [pre],
      'K-P-NUM': [confirmed('K-P-LAT') || legacy.completed.includes('bp-pre-01') ? 'bp-pre-02' : null, pre],
      'K-A1-BE': [confirmed('K-P-LAT') || accessible('to-be') ? 'to-be' : pre],
      'K-A1-ASK': [confirmed('K-A1-BE') || legacy.completed.includes('to-be') ? 'do-does' : null,
        confirmed('K-P-LAT') || accessible('to-be') ? 'to-be' : pre],
      'K-A1-ORIENT': [both('K-P-LAT') && both('K-A1-BE') && both('K-A1-ASK') || accessible('hours-and-signs') ? 'hours-and-signs' : null],
      'K-A1-NOTE': [confirmed('K-A1-ORIENT') || legacy.completed.includes('hours-and-signs') ? 'unit-030' : null,
        both('K-P-LAT') && both('K-A1-BE') && both('K-A1-ASK') || accessible('hours-and-signs') ? 'hours-and-signs' : null],
    };
    const target = candidates[gap].find(id => ready(rules, id)) ?? resume ?? safe;
    return { ...result, start: target ? { lessonId: target, reason: 'gap', group: gap } : null };
  }
  if (groupKnowledge(fresh, 'K-P-LAT', rules).state !== 'CONFIRMED' && pre && !resume)
    return { ...result, start: { lessonId: pre, reason: 'preparation', group: 'K-P-LAT' } };
  const profiles = [...startProfiles].reverse().filter(profile => ready(rules, profile.lessonId) && profile.groups.every(both));
  if (profiles.length && (!resume || position(profiles[0].lessonId) > position(resume))) {
    return { ...result, start: { lessonId: profiles[0].lessonId, reason: 'profile' },
      earlier: profiles[1] ? { lessonId: profiles[1].lessonId, reason: 'profile' } : result.earlier };
  }
  return { ...result, start: resume ? { lessonId: resume, reason: 'resume' } : safe ? { lessonId: safe, reason: 'safe-start' } : null };
}

const position = (id: string) => adaptiveCatalog.sequence.findIndex(lesson => lesson.id === id);
function nextReady(rules: CourseRules, id: string) {
  const at = position(id);
  if (at < 0) return null;
  const route = adaptiveCatalog.sequence[at].route;
  return adaptiveCatalog.sequence.slice(at + 1).find(lesson => lesson.route === route && ready(rules, lesson.id))?.id ?? null;
}

export function checkpointState(rules: CourseRules, history: readonly Evidence[], id: string, attempt: string, marks?: readonly string[]) {
  const row = adaptiveCatalog.checkpoints.find(checkpoint => checkpoint.id === id);
  const config = rules.checkpoints?.find(checkpoint => checkpoint.id === id);
  if (!row || !rules.enabled || !config || !ready(rules, row.lesson)) return { status: 'unavailable' as const, next: null, completedAttempt: false, criteria: [], review: [] };
  const events = history.filter(event => event.source === attempt && event.channel === 'checkpoint' && config.items.includes(event.item.itemId));
  const signs = new Set(independentSigns(history, rules.withdrawnKeys).filter(event => events.includes(event)).filter(event => event.sign === '+').map(event => criterionKey(event.item.criterion)));
  const measured = new Map([...config.readiness, ...events.map(event => event.item.criterion)].map(criterion => [criterionKey(criterion), criterion]));
  const criteria = [...measured.values()].map(criterion => ({
    criterion, state: foldKnowledge(history, criterion, rules.withdrawnKeys).state, fresh: signs.has(criterionKey(criterion)),
  }));
  const readiness = criteria.filter(item => config.readiness.some(ref => criterionKey(ref) === criterionKey(item.criterion)));
  const completedAttempt = config.items.length > 0 && config.items.every(item => marks?.includes(item) ?? events.some(event => event.item.itemId === item));
  const independent = completedAttempt && readiness.length > 0 && readiness.every(item => item.state === 'CONFIRMED' && item.fresh);
  return {
    status: !completedAttempt ? 'incomplete' as const : independent ? 'independent' as const : config.readiness.length ? 'insufficient' as const : 'practice' as const,
    next: ready(rules, row.next) ? row.next : null,
    completedAttempt, criteria,
    review: criteria.filter(item => item.state !== 'CONFIRMED' || !item.fresh).map(item => item.criterion),
  };
}

export type AccessAction =
  | { type: 'start'; route: 'pre-a1' | 'a1' }
  | { type: 'accept'; lessonId: string }
  | { type: 'complete' | 'skip'; lessonId: string }
  | { type: 'checkpoint'; checkpointId: string; attempt: string; path: 'independent' | 'supported' };
export function grantAccess(rules: CourseRules, legacy: LegacyAccess, grants: Grant[], history: readonly Evidence[], action: AccessAction, placement?: Placement, attempts?: Readonly<Record<string, CheckpointAttempt>>): Grant[] {
  if (!rules.enabled) return grants;
  let target: string | null = null;
  let source: string;
  let reason: Grant['reason'];
  if (action.type === 'start') {
    target = action.route === 'pre-a1' ? preA1(rules) : safeStart(rules);
    reason = 'start'; source = action.route;
  } else if (action.type === 'accept') {
    if (![placement?.start?.lessonId, placement?.earlier?.lessonId].includes(action.lessonId)) return grants;
    target = action.lessonId;
    reason = 'start'; source = placement?.start?.reason ?? 'earlier';
  } else if (action.type === 'checkpoint') {
    const row = adaptiveCatalog.checkpoints.find(checkpoint => checkpoint.id === action.checkpointId);
    if (!row || row.mode !== 'BRIDGE' || !canAccess(rules, legacy, grants, row.lesson)) return grants;
    const attempt = attempts?.[row.id];
    if (attempts && attempt?.id !== action.attempt) return grants;
    const state = checkpointState(rules, history, row.id, action.attempt, attempt?.items);
    if (!state.completedAttempt || action.path === 'independent' && state.status !== 'independent') return grants;
    target = state.next; reason = action.path; source = row.id;
  } else {
    const { lessonId } = action;
    if (!canAccess(rules, legacy, grants, lessonId)) return grants;
    const checkpoint = adaptiveCatalog.checkpoints.find(row => row.lesson === lessonId);
    if (action.type === 'complete') {
      if (!legacy.completed.includes(lessonId) || checkpoint?.mode === 'BRIDGE' && rules.checkpoints?.some(profile => profile.id === checkpoint.id)) return grants;
    } else {
      const profile = rules.skipProfiles?.[lessonId];
      if (!profile?.length || !profile.every(criterion => foldKnowledge(history, criterion, rules.withdrawnKeys).state === 'CONFIRMED')) return grants;
    }
    target = nextReady(rules, lessonId);
    reason = action.type === 'complete' ? 'completion' : 'skip'; source = lessonId;
  }
  if (!ready(rules, target) || grants.some(grant => grant.lessonId === target)) return grants;
  // Record explicit grants even when the ordinary route currently provides the same access.
  return [...grants, { lessonId: target, reason, source, version: rules.version, resume: legacy.resume }];
}

export function lessonAccess(rules: CourseRules, legacy: LegacyAccess, grants: Grant[], history: readonly Evidence[], lessonId: string, placement?: Placement) {
  const profile: readonly CriterionRef[] = rules.skipProfiles?.[lessonId] ?? [];
  const confirmed = profile.map(criterion => foldKnowledge(history, criterion, rules.withdrawnKeys));
  return {
    completed: legacy.completed.includes(lessonId),
    available: canAccess(rules, legacy, grants, lessonId),
    placementConfirmed: rules.enabled && profile.length > 0 && confirmed.every(state => state.state === 'CONFIRMED' && state.diagnosticPair),
    recommended: placement?.start?.lessonId === lessonId,
  };
}
