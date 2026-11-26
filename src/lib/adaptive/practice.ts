import type { Progress, ProgressAction } from '../progress.ts';
import { appendEvidence, familyKey, identity, interpret, materialKey, type Outcome } from './evidence.ts';
import { isWithdrawn, type CourseRules, type PracticeItem } from './model.ts';
import type { AdaptiveState } from './state.ts';

export type PracticeCapture = {
  before: Progress;
  after: Progress;
  action: ProgressAction;
  assistance?: Readonly<Record<string, 1 | 2>>;
};
export type PracticePort = {
  hint(lessonId: string, stepId: string, questionId: string, level: 1 | 2): void | Promise<boolean>;
  capture(input: PracticeCapture): void;
};

export function trackHint(state: AdaptiveState, practice: readonly PracticeItem[], lessonId: string, stepId: string, id: string, level: 1 | 2): AdaptiveState {
  const item = practice.find(item => item.itemId === id && item.lessonId === lessonId && item.stepId === stepId);
  if (!item) return state;
  const key = identity(item);
  if (state.history.some(event => event.first && identity(event.item) === key) || (state.hints[key] ?? 0) >= level) return state;
  return { ...state, hints: { ...state.hints, [key]: level } };
}

export function logPractice(
  state: AdaptiveState, item: PracticeItem, rules: CourseRules,
  input: { source: string; channel: 'lesson' | 'checkpoint' | 'recheck'; outcome: Outcome; first: boolean; visible: boolean; hint?: 1 | 2; pinnedHelp?: 0 | 1 | 2 },
): AdaptiveState {
  const key = identity(item);
  const hint = input.pinnedHelp ?? Math.max(input.hint ?? 0, state.hints[key] ?? 0);
  const event = interpret({
    submission: JSON.stringify([input.source, key, input.first]),
    source: input.source, channel: input.channel, item,
    first: input.first, outcome: input.outcome, assistance: hint === 2 ? 'H2' : hint === 1 ? 'H1' : 'H0',
    priorExposure: input.visible || state.exposed.includes(familyKey(item)) || state.exposed.includes(materialKey(item)),
  }, isWithdrawn(item, rules.withdrawnKeys));
  const history = appendEvidence(state.history, event);
  if (history === state.history) return state;
  const hints = { ...state.hints };
  delete hints[key];
  return { ...state, history, hints };
}

/** Consume only attempts that the ordinary reducer actually accepted. */
export function capturePractice(state: AdaptiveState, rules: CourseRules, practice: readonly PracticeItem[], input: PracticeCapture): AdaptiveState {
  const { before, after, action } = input;
  if (!rules.enabled || before === after || action.type !== 'check-exercise' && action.type !== 'answer') return state;
  const previous = before.lessons[action.lessonId]?.answers ?? {};
  const current = after.lessons[action.lessonId]?.answers ?? {};
  for (const item of practice) {
    if (item.lessonId !== action.lessonId || item.stepId !== action.stepId) continue;
    const attempts = current[item.itemId]?.attempts;
    const prior = previous[item.itemId]?.attempts.length ?? 0;
    if (!attempts || attempts.length <= prior) continue;
    const checkpoint = item.checkpointId ? state.checkpoints[item.checkpointId] : undefined;
    state = logPractice(state, item, rules, {
      channel: checkpoint ? 'checkpoint' : 'lesson', source: checkpoint?.id ?? action.lessonId,
      outcome: attempts.at(-1)?.correct ? 'correct' : 'incorrect', first: prior === 0, visible: prior !== 0,
      hint: input.assistance?.[item.itemId],
    });
    if (checkpoint && item.checkpointId) state = markCheckpointItem(state, item.checkpointId, item.itemId);
  }
  return state;
}

export function markCheckpointItem(state: AdaptiveState, checkpoint: string, item: string): AdaptiveState {
  const attempt = state.checkpoints[checkpoint];
  if (!attempt || attempt.items.includes(item)) return state;
  return { ...state, checkpoints: { ...state.checkpoints, [checkpoint]: { ...attempt, items: [...attempt.items, item] } } };
}
