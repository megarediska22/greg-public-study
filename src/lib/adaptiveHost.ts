import { getProgressCourse } from '../content/extension/registry.ts';
import { openCourseSession } from './courseSession.ts';
import { openAdaptiveEngine, type EngineOptions } from './adaptive/engine.ts';
import { adaptiveCatalog } from './adaptive/model.ts';
import { legacyAccess } from './adaptive/storage.ts';
import { withStorageLock, type StorageKeys, type WriteLocks } from './betaStorage.ts';
import type { SaveStatus } from './progressStorage.ts';
import type { Progress } from './progress.ts';

type Content = Pick<EngineOptions, 'rules' | 'bank' | 'practice' | 'fastBank'>;
export type AdaptiveContent = Content;
export type AdaptiveHost = Awaited<ReturnType<typeof openAdaptiveHost>>;

/** Keep the former entitlement frontier separate from progress made on a pilot route. */
export async function openAdaptiveHost(storage: EngineOptions['storage'], content: Content, keys?: StorageKeys, locks?: WriteLocks) {
  const legacySession = await openCourseSession(storage, undefined, keys?.progress);
  const former = legacyAccess(legacySession.progress, getProgressCourse());
  let legacy = former;
  let currentProgress = legacySession.progress;
  const engine = openAdaptiveEngine({
    ...content, storage, storageKey: keys?.adaptive, locks, legacy: () => legacy,
    previouslyAttempted: item => Boolean(currentProgress.lessons[item.lessonId]?.answers[item.itemId]?.attempts.length),
    question: item => getProgressCourse().find(entry => entry.id === item.lessonId)?.lesson?.steps
      .flatMap(step => step.type === 'exercise' && step.id === item.stepId ? step.questions : [])
      .find(question => question.id === item.itemId),
  });
  const protectedData = ['corrupt', 'unsupported', 'unavailable'].includes(engine.storageStatus());
  const grants = () => engine.grantedLessons();
  const session = protectedData ? legacySession : await openCourseSession(storage, grants(), keys?.progress);
  // The first read can miss pilot-only content. Restore the validated resume from
  // the second read without promoting its grants into the former frontier.
  function sync(progress: Progress) {
    currentProgress = progress;
    legacy = {
      available: former.available,
      completed: progress.completedLessons,
      resume: progress.lastVisited?.lessonId ?? legacyAccess(progress, getProgressCourse()).resume,
    };
  }
  if (!protectedData) sync(session.progress);
  function checkpointFor(lessonId: string) {
    const row = adaptiveCatalog.checkpoints.find(checkpoint => checkpoint.lesson === lessonId);
    return row && engine.checkpoint(row.id).status !== 'unavailable' ? row : undefined;
  }
  const persistProgress = keys ? (progress: Progress, options?: { allowReset?: boolean }): Promise<SaveStatus> =>
    withStorageLock(keys.progress, () => session.persist(progress, options), locks).catch(() => 'unavailable' as const)
    : undefined;
  return { engine, grants, session, sync, content, protectedData, checkpointFor, persistProgress };
}
