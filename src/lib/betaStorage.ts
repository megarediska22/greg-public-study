export const BETA_STORAGE_KEYS = {
  progress: 'gps.beta.progress.v1',
  adaptive: 'gps.beta.adaptive.v1',
  theme: 'gps.beta.theme.v1',
} as const;

export type StorageKeys = { progress: string; adaptive: string; theme: string };
export type WriteLocks = Pick<LockManager, 'request'>;

/** The physical storage key doubles as the version-scoped Web Lock name. */
export async function withStorageLock<T>(key: string, operation: () => T, locks?: WriteLocks): Promise<T> {
  const coordinator = locks ?? globalThis.navigator?.locks;
  return coordinator ? coordinator.request(key, operation) : operation();
}
