import { FAST_LIMIT, FAST_METHOD, groupIds, gradeFast, slotInfo, validateFastBank, validSelection, type FastBank, type FastItem,
  type FastResponse, type Selection } from './bank.ts';
import type { Question } from '../../../types/lesson.ts';
import { foldKnowledge } from '../evidence.ts';
import { isWithdrawn, pilotCriteria, type CourseRules, type PracticeItem } from '../model.ts';
import { canAccess, grantAccess, preA1, ready, safeStart, type LegacyAccess } from '../routes.ts';
import type { AdaptiveState } from '../state.ts';
import type { AdaptivePersistStatus, AdaptiveStorageStatus } from '../storage.ts';
import { cursorOf, emptyFastState, exposedMaterials, freshItem, isFastState, lastItem, pinnedItem, sameCursor, show,
  type Acceptance, type Cursor, type FastSession, type FastState, type FinishReason, type Observation } from './session.ts';
import { fastSigns, nextStep, suggestion, summarize } from './routing.ts';

type Options = {
  bank: FastBank;
  rules: CourseRules;
  legacy: () => LegacyAccess;
  practice: readonly PracticeItem[];
  question?: (item: PracticeItem) => Question | undefined;
  previouslyAttempted?: (item: PracticeItem) => boolean;
  read: () => AdaptiveState;
  storageStatus: () => AdaptiveStorageStatus;
  commit: (change: (state: AdaptiveState) => AdaptiveState) => Promise<AdaptivePersistStatus>;
};

export function bindFastPlacement({ bank, rules, legacy, practice, question, previouslyAttempted, read, storageStatus, commit }: Options) {
  const errors = validateFastBank(bank);
  const enabled = rules.enabled && !errors.length;
  const withdrawn = rules.withdrawnKeys ?? [];
  const criteria = [...pilotCriteria, ...rules.criteria];
  const storageProtected = () => ['corrupt', 'unsupported', 'unavailable'].includes(storageStatus());
  function ordinaryProduction(item: PracticeItem) {
    const task = question?.(item);
    return task?.id === item.itemId && (task.type === 'written' || task.type === 'blank');
  }
  const get = (state: AdaptiveState) => state.fastPlacement === undefined ? emptyFastState()
    : isFastState(state.fastPlacement) ? state.fastPlacement : null;
  const put = (state: AdaptiveState, fast: FastState): AdaptiveState => ({ ...state, fastPlacement: fast });
  const currentItem = (session: FastSession) => pinnedItem(session, bank, rules.version, withdrawn);
  const compatible = (session: FastSession) => session.method === FAST_METHOD && session.bank === bank.version &&
    session.catalogue === rules.version && bank.forms.some(form => form.id === session.form);
  const close = (session: FastSession, reason: FinishReason): FastSession =>
    ({ ...session, revision: session.revision + 1, status: 'finished', reason, selection: null });

  function entryItem(state: AdaptiveState, store: FastState) {
    const used = exposedMaterials(store, state);
    for (const form of bank.forms) {
      if (store.exposures.some(exposure => exposure.bank === bank.version && exposure.form === form.id)) continue;
      const first = freshItem(form, 'core-lat', used, withdrawn);
      if (first) return { form, first };
    }
    return null;
  }

  function write(change: (state: AdaptiveState, store: FastState) => AdaptiveState): Promise<AdaptivePersistStatus> {
    if (!enabled) return Promise.resolve('unchanged');
    // A malformed fast-only partition does not invalidate older grants or the R/P store.
    if (!get(read())) return Promise.resolve('protected');
    return commit(state => {
      const store = get(state);
      return store ? change(state, store) : state;
    });
  }
  function courseOptions(state: AdaptiveState) {
    const access = legacy();
    const resume = access.resume && canAccess(rules, access, state.grants, access.resume) ? access.resume : null;
    return { resume, a1: safeStart(rules), preA1: preA1(rules) };
  }
  function signs(session: FastSession) {
    return fastSigns(session, compatible(session) ? bank.forms.find(form => form.id === session.form) : undefined, rules);
  }
  function recommendation(session: FastSession) {
    return suggestion(signs(session), rules);
  }

  return {
    entry() {
      const state = read();
      const store = get(state);
      const current = store?.session;
      const draft = current && current.status !== 'finished' ? current : null;
      const item = draft && currentItem(draft);
      const protectedData = store === null || storageProtected();
      return {
        enabled, contentErrors: [...errors], protectedData,
        canStart: enabled && !protectedData && !!store && !item && !!entryItem(state, store),
        resumable: enabled && !protectedData && !!item,
        incompatibleDraft: !!draft && !item,
        legacyDraft: state.session && state.session.status !== 'finished' ? 'read-only' as const : null,
        ...courseOptions(state),
      };
    },
    view() {
      const session = get(read())?.session;
      if (!session) return null;
      const item = enabled && session.status === 'active' ? currentItem(session) : undefined;
      const pin = lastItem(session);
      const display = item && publicItem(item);
      return { sessionId: session.id, method: session.method, bank: session.bank, form: session.form, status: session.status,
        phase: slotInfo(pin.slot).phase, presented: session.presented.length, answered: session.observations.length,
        maxItems: FAST_LIMIT, targetRange: [10, 15] as const, activeMinutes: [3, 5] as const, reason: session.reason,
        cursor: item ? cursorOf(session) : null, prompt: display ?? null,
        selection: item && session.selection ? structuredClone(session.selection) : null };
    },
    begin(id: string) {
      return write((state, store) => {
        const old = store.session;
        if (!id.trim() || id.length > 128 || old?.id === id || store.past.some(session => session.id === id) ||
            old && old.status !== 'finished' && currentItem(old)) return state;
        const entry = entryItem(state, store);
        if (!entry) return state;
        const past = old ? [...store.past, old.status === 'finished' ? old : close(old, 'incompatible')].slice(-24) : store.past;
        const session: FastSession = {
          id, method: FAST_METHOD, bank: bank.version, catalogue: rules.version, form: entry.form.id, revision: 0,
          status: 'active', route: null, presented: [], observations: [], selection: null,
        };
        return put(state, show({ ...store, past }, session, 'core-lat', entry.first));
      });
    },
    select(cursor: Cursor, selection: Selection | null) {
      return write((state, store) => {
        const session = store.session;
        if (!session || session.status !== 'active' || !sameCursor(session, cursor)) return state;
        const item = currentItem(session);
        if (!item || selection && !validSelection(item, selection, true) ||
            JSON.stringify(selection) === JSON.stringify(session.selection)) return state;
        return put(state, { ...store, session: { ...session, revision: session.revision + 1, selection: structuredClone(selection) } });
      });
    },
    submit(cursor: Cursor, response: FastResponse) {
      return write((state, store) => {
        const session = store.session;
        if (!session || session.status !== 'active' || !sameCursor(session, cursor)) return state;
        const item = currentItem(session);
        if (!item || !response || typeof response !== 'object') return state;
        let observation: Observation;
        if (response.type === 'skip' || response.type === 'unknown') observation = { outcome: response.type };
        else {
          const correct = gradeFast(item, response);
          if (correct === null) return state;
          observation = correct ? { outcome: 'correct', sign: '+' } :
            item.wrongAttribution === 'direct' ? { outcome: 'incorrect', sign: '-' } : { outcome: 'ambiguous' };
        }
        const after: FastSession = { ...session, observations: [...session.observations, observation],
          revision: session.revision + 1, selection: null };
        const form = bank.forms.find(form => form.id === session.form)!;
        const next = nextStep(after, form, exposedMaterials(store, state), rules);
        return put(state, 'reason' in next ? { ...store, session: close(after, next.reason) }
          : show(store, { ...after, route: next.route }, next.slot, next.item));
      });
    },
    action(cursor: Cursor, action: 'pause' | 'resume' | 'finish') {
      return write((state, store) => {
        const session = store.session;
        if (!session || session.status === 'finished' || !sameCursor(session, cursor)) return state;
        const item = currentItem(session);
        if (!item) return put(state, { ...store, session: close(session, 'incompatible') });
        if (action === 'finish') return put(state, { ...store, session: close(session, 'manual') });
        const status = action === 'pause' ? 'paused' : 'active';
        if (status === session.status) return state;
        return put(state, { ...store, session: { ...session, status, revision: session.revision + 1 } });
      });
    },
    // Paused and incompatible drafts still need a checked action token.
    sessionCursor() {
      const session = get(read())?.session;
      return session && session.status !== 'finished' ? cursorOf(session) : null;
    },
    result() {
      const state = read();
      const store = get(state);
      const session = store?.session;
      if (!store || session?.status !== 'finished') return null;
      const suggested = recommendation(session);
      const options = courseOptions(state);
      return {
        sessionId: session.id, provisional: true as const, reason: session.reason,
        recommendation: suggested, ...options, resumePrimary: !!options.resume,
        canRetake: enabled && !storageProtected() && !!entryItem(state, store), presented: session.presented.length,
        answered: session.observations.length, skipped: session.observations.filter(item => item.outcome === 'skip').length,
        unknown: session.observations.filter(item => item.outcome === 'unknown').length,
        ambiguous: session.observations.filter(item => item.outcome === 'ambiguous').length,
        knowledge: summarize(signs(session)), accepted: session.accepted ? { ...session.accepted } : null,
      };
    },
    accept(sessionId: string, choice: Acceptance) {
      return write((state, store) => {
        const session = store.session;
        if (session?.status !== 'finished' || session.id !== sessionId || session.accepted || !compatible(session)) return state;
        const options = courseOptions(state);
        const offered = choice.kind === 'recommendation' ? recommendation(session)?.lessonId
          : choice.kind === 'a1' ? options.a1 : choice.kind === 'pre-a1' ? options.preA1 : null;
        if (offered !== choice.lessonId || !ready(rules, offered)) return state;
        // Use the same course gate and grant shape as legacy adaptive placement.
        const grants = choice.kind === 'recommendation'
          ? grantAccess(rules, legacy(), state.grants, state.history, { type: 'accept', lessonId: offered },
            { start: { lessonId: offered, reason: 'profile' }, earlier: null, resume: options.resume, preA1: options.preA1 })
          : grantAccess(rules, legacy(), state.grants, state.history, { type: 'start', route: choice.kind });
        if (!canAccess(rules, legacy(), grants, offered)) return state;
        const tagged = grants === state.grants ? grants : [
          ...state.grants, { ...grants.at(-1)!, source: `${FAST_METHOD}:${choice.kind}` },
        ];
        return put({ ...state, grants: tagged }, { ...store, session: { ...session, accepted: { ...choice } } });
      });
    },
    followup(lessonId: string) {
      const state = read();
      const session = get(state)?.session;
      if (!enabled || session?.status !== 'finished' || !compatible(session) ||
          !canAccess(rules, legacy(), state.grants, lessonId)) return null;
      const used = exposedMaterials(get(state)!, state);
      const summaries = summarize(signs(session));
      for (const summary of summaries) {
        if (summary.status === 'strengthened' && summary.direction === '+') continue;
        const group = groupIds[summary.group];
        const item = practice.find(item => item.lessonId === lessonId && item.role === 'P' && item.designated && !item.keyVisible &&
          !isWithdrawn(item, withdrawn) && !previouslyAttempted?.(item) &&
          ![`item:${item.itemId}`, `family:${item.family}`, `stimulus:${item.stimulus}`].some(key => used.has(key)) &&
          ordinaryProduction(item) && criteria.some(ref => ref.id === item.criterion.id && ref.version === item.criterion.version && ref.group === group) &&
          foldKnowledge(state.history, item.criterion, withdrawn).state !== 'CONFIRMED');
        if (item) return { lessonId, stepId: item.stepId, questionId: item.itemId, group: summary.group };
      }
      return null;
    },
  };
}

function publicItem(item: FastItem) {
  const base = { id: item.id, instruction: item.instruction, prompt: item.prompt, role: item.role, format: item.format };
  return item.format === 'cards' ? { ...base, format: item.format, tokens: item.tokens.map(({ id, label }) => ({ id, label })) }
    : { ...base, format: item.format, options: item.options.map(({ id, label }) => ({ id, label })) };
}

export type { FastBank, FastForm, FastItem, FastSlot, FastRole, FastGroup, FastResponse, Selection } from './bank.ts';
export { FAST_METHOD, validateFastBank } from './bank.ts';
export type { Cursor, Acceptance } from './session.ts';
