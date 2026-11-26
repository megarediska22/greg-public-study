import type { PracticeReceipt, Progress, ProgressAction } from '../progress.ts';
import type { Question } from '../../types/lesson.ts';
import { gradeAnswer } from '../grading.ts';
import { reviewAdvice } from './advice.ts';
import { validateAdaptiveContent } from './content.ts';
import { beginDiagnostic, canResumeDiagnostic, changeDiagnostic, diagnosticPrompt, finishDiagnostic, submitDiagnostic, type Session, type Submission } from './diagnostic.ts';
import { appendEvidence, foldKnowledge, identity, validRole } from './evidence.ts';
import { adaptiveCatalog, criterionKey, pilotCriteria, type Bank, type CourseRules, type PracticeItem } from './model.ts';
import { capturePractice, logPractice, markCheckpointItem, trackHint, type PracticeCapture } from './practice.ts';
import { canAccess, checkpointState, currentPlacement, grantAccess, lessonAccess, preA1, ready, safeStart, type AccessAction, type LegacyAccess } from './routes.ts';
import { emptyAdaptiveState, isAdaptiveState, latestResults, type AdaptiveState, type DiagnosticResult } from './state.ts';
import { bindFastPlacement, type FastBank } from './fast/index.ts';
import { ADAPTIVE_STORAGE_KEY, openAdaptiveStorage, type AdaptivePersistStatus } from './storage.ts';

export type EngineOptions = {
  storage: Pick<Storage, 'getItem' | 'setItem'>;
  rules: CourseRules;
  bank?: Bank;
  storageKey?: string;
  fastBank?: FastBank;
  practice: readonly PracticeItem[];
  legacy: () => LegacyAccess;
  question?: (item: PracticeItem) => Question | undefined;
  previouslyAttempted?: (item: PracticeItem) => boolean;
  locks?: Pick<LockManager, 'request'>;
};

export function openAdaptiveEngine(options: EngineOptions) {
  const { rules, practice, legacy, storageKey = ADAPTIVE_STORAGE_KEY } = options;
  const bank = options.bank ?? { version: 'disabled', items: [], forms: [] };
  const legacyDiagnostic = !!options.bank;
  const contentErrors = validateAdaptiveContent(rules, bank, practice);
  const enabled = rules.enabled && contentErrors.length === 0;
  const readiness = enabled && legacyDiagnostic ? validateAdaptiveContent(rules, bank, practice, true) : [];
  const config = { ...rules, enabled };
  const storage = openAdaptiveStorage(options.storage, emptyAdaptiveState(), isAdaptiveState, storageKey);
  let state = storage.data;
  let pending = Promise.resolve();
  // Preserve the highest confirmed hint level while the current tab is open.
  const localHints = new Map<string, 1 | 2>();
  const criteria = new Map([...pilotCriteria, ...rules.criteria].map(criterion => [criterionKey(criterion), criterion]));
  const active = () => legacyDiagnostic && state.session && state.session.status !== 'finished' ? state.session : null;

  function commit(change: (current: AdaptiveState) => AdaptiveState, replaceProtected = false): Promise<AdaptivePersistStatus> {
    async function work(): Promise<AdaptivePersistStatus> {
      const write = () => {
        const next = change(state);
        const result = replaceProtected ? storage.replaceProtectedWithRecovery(next) : storage.persist(next);
        if (result === 'saved' || result === 'unchanged') state = next;
        return result;
      };
      const locks = options.locks ?? globalThis.navigator?.locks;
      try { return locks ? await locks.request(storageKey, write) : write(); }
      catch { return 'unavailable'; }
    }
    const operation = pending.then(work);
    pending = operation.then(() => {});
    return operation;
  }

  function advance(current: AdaptiveState, session: Session | null): AdaptiveState {
    if (!session || session === current.session) return current;
    if (session.status !== 'finished' || !session.reason) return { ...current, session };
    const automatic = session.reason !== 'manual' && session.reason !== 'incompatible';
    const history = automatic ? session.events.reduce(appendEvidence, current.history) : current.history;
    const placement = currentPlacement(config, legacy(), current.grants, history, automatic ? session.events : undefined);
    return {
      ...current, session, history, exposed: [...new Set([...current.exposed, ...session.exposed])],
      results: latestResults([...current.results, {
        id: session.id, reason: session.reason, applied: automatic
          ? history.filter(event => event.source === session.id && event.channel === 'diagnostic').map(event => event.submission) : [],
        placement,
      }]),
    };
  }

  function chooseResult(current: AdaptiveState, choice: NonNullable<DiagnosticResult['choice']>) {
    const result = current.results.at(-1);
    if (!result || JSON.stringify(result.choice) === JSON.stringify(choice)) return current;
    return { ...current, results: [...current.results.slice(0, -1), { ...result, choice }] };
  }
  function placement() {
    const session = state.session;
    if (!legacyDiagnostic || !session || session.status !== 'finished') return null;
    const fresh = session.reason === 'manual' || session.reason === 'incompatible' ? undefined : session.events;
    return currentPlacement(config, legacy(), state.grants, state.history, fresh);
  }

  const revision = (item: PracticeItem) => JSON.stringify([identity(item), item.keyId, item.keyRevision]);
  function mappedQuestion(item: PracticeItem) {
    const question = options.question?.(item);
    return question?.id === item.itemId && validRole(item.role, question.type);
  }

  return {
    fast: options.fastBank ? bindFastPlacement({
      bank: options.fastBank, rules: config, legacy, practice, previouslyAttempted: options.previouslyAttempted,
      question: options.question, read: () => state, storageStatus: () => storage.status, commit,
    }) : undefined,
    receiptPractice(before: Progress, after: Progress, action: ProgressAction) {
      if (!enabled || before === after || action.type !== 'check-exercise') return;
      const mapped = practice.filter(item => item.lessonId === action.lessonId && item.stepId === action.stepId && mappedQuestion(item));
      if (!mapped.length) return;
      let order = 0;
      for (const item of practice) {
        const attempts = before.lessons[item.lessonId]?.answers[item.itemId]?.attempts ?? [];
        for (const attempt of attempts.slice(0, 2)) order = Math.max(order, attempt.adaptiveReceipt?.order ?? 0);
      }
      for (const item of mapped) {
        const attempts = after.lessons[item.lessonId]?.answers[item.itemId]?.attempts;
        const previous = before.lessons[item.lessonId]?.answers[item.itemId]?.attempts.length ?? 0;
        if (!attempts || attempts.length <= previous || attempts.length > 2) continue;
        const maximumHelp = Math.max(localHints.get(identity(item)) ?? 0, state.hints[identity(item)] ?? 0);
        const help = maximumHelp === 2 ? 2 : maximumHelp === 1 ? 1 : 0;
        const checkpoint = item.checkpointId && state.checkpoints[item.checkpointId]?.id;
        // The reducer has allocated this attempt. Its receipt is saved atomically
        // with the graded answer and can be replayed if the sidecar write is interrupted.
        attempts.at(-1)!.adaptiveReceipt = { revision: revision(item), order: ++order, help, ...(checkpoint ? { checkpoint } : {}) };
      }
    },
    restoreStudy(progress: Progress, newCompletions: readonly string[] = []) {
      if (!enabled) return Promise.resolve('unchanged' as const);
      return commit(current => {
        let next = current;
        const pending: { item: PracticeItem; receipt: PracticeReceipt; first: boolean; correct: boolean }[] = [];
        for (const item of practice) {
          // The ordinary decoder has already validated answers, including for
          // lessons represented by compact replay data at startup.
          const attempts = progress.lessons[item.lessonId]?.answers[item.itemId]?.attempts ?? [];
          for (const [index, attempt] of attempts.slice(0, 2).entries()) {
            const receipt = attempt.adaptiveReceipt;
            if (receipt?.revision === revision(item)) pending.push({ item, receipt, first: index === 0, correct: attempt.correct });
          }
        }
        pending.sort((a, b) => a.receipt.order - b.receipt.order);
        for (const { item, receipt, first, correct } of pending) {
          next = logPractice(next, item, config, {
            source: receipt.checkpoint ?? item.lessonId, channel: receipt.checkpoint ? 'checkpoint' : 'lesson',
            outcome: correct ? 'correct' : 'incorrect', first, visible: !first, pinnedHelp: receipt.help,
          });
          if (item.checkpointId && receipt.checkpoint && next.checkpoints[item.checkpointId]?.id === receipt.checkpoint)
            next = markCheckpointItem(next, item.checkpointId, item.itemId);
        }
        const completions = new Set([...newCompletions, ...current.grants.map(grant => grant.lessonId)]);
        let grants = next.grants;
        for (const lessonId of completions) {
          if (!progress.completedLessons.includes(lessonId)) continue;
          grants = grantAccess(config, legacy(), grants, next.history, { type: 'complete', lessonId });
        }
        return grants === next.grants ? next : { ...next, grants };
      });
    },
    entry() {
      const current = legacy();
      return { showChoice: enabled && !current.resume && !state.grants.length,
        preA1: enabled ? preA1(config) : null, a1: safeStart(config), resume: current.resume,
        diagnosticAvailable: enabled && legacyDiagnostic && !readiness.length &&
          !!beginDiagnostic('availability', bank, config, state.history, [...state.exposed, ...(active()?.exposed ?? [])]),
        resumable: active() ? canResumeDiagnostic(active()!, bank, config) : false,
        incompatibleDraft: active() ? !canResumeDiagnostic(active()!, bank, config) : false,
        contentErrors: [...contentErrors, ...readiness], storage: storage.status };
    },
    diagnostic() {
      const session = state.session;
      if (!legacyDiagnostic || !session) return null;
      // Drafts and active sessions expose neither submitted correctness nor keys.
      return { id: session.id, formId: session.formId, status: session.status,
        answered: session.cursor, presented: session.presented,
        reason: session.reason, prompt: diagnosticPrompt(session, bank, config) };
    },
    begin(id: string) {
      return commit(current => {
        if (!enabled || !legacyDiagnostic || current.results.some(result => result.id === id) || current.session?.id === id || readiness.length) return current;
        const draft = active();
        if (draft) {
          if (canResumeDiagnostic(draft, bank, config)) return current;
          current = advance(current, finishDiagnostic(draft, 'incompatible'));
        }
        return advance(current, beginDiagnostic(id, bank, config, current.history, current.exposed));
      });
    },
    submit(submission: Submission) {
      return commit(current => enabled && legacyDiagnostic && current.session ? advance(current, submitDiagnostic(current.session, submission, bank, config, current.history, current.exposed)) : current);
    },
    diagnosticAction(action: 'pause' | 'resume' | 'finish' | 'upper' | 'decline-upper') {
      return commit(current => enabled && legacyDiagnostic && current.session ? advance(current, changeDiagnostic(current.session, action, bank, config, current.history, current.exposed)) : current);
    },
    knowledge() {
      return [...criteria.values()].map(criterion => ({ criterion, ...foldKnowledge(state.history, criterion, config.withdrawnKeys) }));
    },
    result() {
      if (!legacyDiagnostic || state.session?.status !== 'finished') return null;
      const session = state.session;
      const record = state.results.at(-1);
      const automatic = session.reason !== 'manual' && session.reason !== 'incompatible';
      return { record, placement: placement(), knowledge: [...criteria.values()].map(criterion => {
        const observations = automatic ? session.events.filter(event => criterionKey(event.item.criterion) === criterionKey(criterion)) : [];
        return { criterion, fresh: foldKnowledge(observations, criterion, config.withdrawnKeys),
          historical: foldKnowledge(state.history, criterion, config.withdrawnKeys),
          checked: observations.length, unanswered: observations.filter(event => event.outcome === 'unknown' || event.outcome === 'skipped').length };
      }) };
    },
    grantedLessons() { return new Set(state.grants.map(grant => grant.lessonId).filter(id => ready(config, id))); },
    access(lesson: string) { return lessonAccess(config, legacy(), state.grants, state.history, lesson, placement() ?? undefined); },
    choose(action: AccessAction) {
      return commit(current => {
        const recommendation = placement() ?? undefined;
        const grants = grantAccess(config, legacy(), current.grants, current.history, action, recommendation, current.checkpoints);
        const next = grants === current.grants ? current : { ...current, grants };
        if (enabled && action.type === 'accept' && [recommendation?.start?.lessonId, recommendation?.earlier?.lessonId].includes(action.lessonId) &&
            canAccess(config, legacy(), grants, action.lessonId)) return chooseResult(next, { type: 'accepted', lessonId: action.lessonId });
        return next;
      });
    },
    declinePlacement() {
      return commit(current => legacyDiagnostic && current.session?.status === 'finished' ? chooseResult(current, { type: 'declined' }) : current);
    },
    advice(lesson: string, includeDismissed = false) {
      return reviewAdvice(config, state.history, state.dismissals, lesson, includeDismissed);
    },
    dismissAdvice(lesson: string, id: string) {
      return commit(current => {
        const advice = reviewAdvice(config, current.history, current.dismissals, lesson);
        if (!advice || advice.id !== id) return current;
        return { ...current, dismissals: { ...current.dismissals, [advice.criterion]: advice.episode } };
      });
    },
    checkpoint(id: string) {
      const attempt = state.checkpoints[id];
      return checkpointState(config, state.history, id, attempt?.id ?? '', attempt?.items ?? []);
    },
    checkpointAttempt(id: string) {
      const attempt = state.checkpoints[id];
      return attempt ? { id: attempt.id, items: [...attempt.items] } : undefined;
    },
    beginCheckpoint(id: string, attempt: string) {
      return commit(current => {
        const lesson = adaptiveCatalog.checkpoints.find(row => row.id === id)?.lesson;
        if (!enabled || !attempt.trim() || !config.checkpoints?.some(row => row.id === id) || !lesson ||
            !canAccess(config, legacy(), current.grants, lesson) || current.checkpoints[id]?.id === attempt ||
            current.history.some(event => event.source === attempt)) return current;
        return { ...current, checkpoints: { ...current.checkpoints, [id]: { id: attempt, items: [] } } };
      });
    },
    checkpointAnswer(id: string, attempt: string, itemId: string, response: { type: 'answer'; answer: string } | { type: 'unknown' | 'skip' }) {
      return commit(current => {
        const item = practice.find(item => item.checkpointId === id && item.itemId === itemId);
        const profile = config.checkpoints?.find(profile => profile.id === id);
        const mark = current.checkpoints[id];
        if (!enabled || !item || !profile?.items.includes(itemId) || mark?.id !== attempt || mark.items.includes(itemId) ||
            !canAccess(config, legacy(), current.grants, item.lessonId)) return current;
        const q = options.question?.(item);
        if (!q || q.id !== itemId || !validRole(item.role, q.type)) return current;
        if (response.type === 'answer' && (!response.answer.trim() || response.answer.length > 2000 ||
            q.type === 'choice' && !q.options.includes(response.answer))) return current;
        const exposed = Boolean(options.previouslyAttempted?.(item)) || current.history.some(event => identity(event.item) === identity(item));
        const next = logPractice(current, item, config, {
          source: attempt, channel: 'checkpoint', first: !exposed, visible: exposed, hint: localHints.get(identity(item)),
          outcome: response.type === 'skip' ? 'skipped' : response.type === 'unknown' ? 'unknown'
            : 'answer' in response && gradeAnswer(q, response.answer) ? 'correct' : 'incorrect',
        });
        return markCheckpointItem(next, id, itemId);
      });
    },
    hint(lessonId: string, stepId: string, id: string, level: 1 | 2) {
      if (!enabled) return Promise.resolve('unchanged' as const);
      const item = practice.find(item => item.lessonId === lessonId && item.stepId === stepId && item.itemId === id);
      if (!item) return Promise.resolve('unchanged' as const);
      const key = identity(item);
      return commit(current => trackHint(current, practice, lessonId, stepId, id, level)).then(status => {
        if ((status === 'saved' || status === 'unchanged') && (localHints.get(key) ?? 0) < level)
          localHints.set(key, level);
        return status;
      });
    },
    capture(input: PracticeCapture) {
      if (!enabled) return Promise.resolve('unchanged' as const);
      const mapped = practice.filter(item => {
        if (item.lessonId !== input.action.lessonId || item.stepId !== input.action.stepId) return false;
        return mappedQuestion(item);
      });
      if (!mapped.length) return Promise.resolve('unchanged' as const);
      const assistance = Object.fromEntries(mapped.flatMap<[string, 1 | 2]>(item => {
        const fromAction = input.assistance?.[item.itemId];
        const remembered = localHints.get(identity(item));
        const hint = fromAction === 2 || remembered === 2 ? 2 : fromAction ?? remembered;
        return hint ? [[item.itemId, hint]] : [];
      }));
      return commit(current => capturePractice(current, config, mapped, { ...input, assistance }));
    },
    async resetAfterConfirmation() {
      const status = await commit(() => emptyAdaptiveState());
      if (status === 'saved' || status === 'unchanged') localHints.clear();
      return status;
    },
    async recoverAfterConfirmation() {
      const status = await commit(() => emptyAdaptiveState(), true);
      if (status === 'saved') localHints.clear();
      return status;
    },
    verifyStorage() { return commit(current => current); },
    storageStatus: () => storage.status,
    recoveryKey: () => storage.recoveryKey,
  };
}
