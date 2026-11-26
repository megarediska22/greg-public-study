import { getProgressCourse, prepareProgressCourse } from '../content/extension/registry.ts';
import { PROGRESS_KEY } from './progress.ts';
import { openProgressSession } from './progressStorage.ts';

type StoragePort = Pick<Storage, 'getItem' | 'setItem'>;
/** Read and prepare one exact snapshot. Never write or decode unavailable keys. */
export async function openCourseSession(storage: StoragePort, granted?: ReadonlySet<string>, progressKey = PROGRESS_KEY) {
  let raw: string | null;
  try { raw = storage.getItem(progressKey); }
  catch {
    return openProgressSession({ ...storage, getItem: () => { throw Error('Storage unavailable'); } }, getProgressCourse(), granted, progressKey);
  }
  const course = await prepareProgressCourse(raw);
  // Decode the snapshot whose compact keys were loaded. Persistence reads live
  // storage to detect any other tab writing during asynchronous preparation.
  let firstRead = true;
  return openProgressSession({ getItem: key => {
    if (firstRead && key === progressKey) { firstRead = false; return raw; }
    return storage.getItem(key);
  }, setItem: (key, value) => storage.setItem(key, value) }, course, granted, progressKey);
}
