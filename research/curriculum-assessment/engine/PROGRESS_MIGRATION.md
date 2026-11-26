# Adaptive progress persistence and legacy compatibility

Stage 05 uses an additive browser-only sidecar. It does not migrate, rewrite or
infer knowledge from the existing course progress. `gps.progress.v1` remains the
authoritative source for earned lesson completion, attempts and ordinary access.
The existing progress provider and its backup/reset behavior remain unchanged.

## Storage contract

`src/lib/adaptive/storage.ts` exports:

- `ADAPTIVE_STORAGE_KEY = 'gps.adaptive.v1'`.
- `ADAPTIVE_RECOVERY_PREFIX = 'gps.adaptive.v1.recovery.'`.
- `openAdaptiveStorage<T>(storage, initial, isData)`.
- `legacyAccess(progress, course)`.

The adaptive envelope is `{ version: 1, data: T }`. The caller supplies a complete
domain validator; the storage layer validates both the input and its serialized
representation. Invalid initial configuration throws `TypeError` before reading
or writing storage. Circular input, invalid domain data, serialization errors
and validator exceptions cannot trigger a save.

An opened session provides detached `data`, current `status`, the latest verified
`recoveryKey` or `null`, and these operations:

| Operation | Behavior |
| --- | --- |
| `persist(next)` | Validate, compare current raw bytes, preserve prior bytes where present, write and verify. |
| `replaceProtectedWithRecovery(next)` | Explicit recovery operation for corrupt/unsupported data only; preserves exact protected bytes before replacement. The calling interface must obtain the user's confirmed recovery choice. |

Opening a session never writes. Merely mounting a screen, reloading, examining a
fallback, or persisting an unchanged empty default cannot initialize or replace
the stored snapshot.

| Read status | Meaning |
| --- | --- |
| `ready` | Supported envelope and validated data. |
| `empty` | No sidecar is saved; the supplied initial data is available in memory. |
| `unavailable` | Initial read failed, or a commit could not be verified because read-back failed. Reopen before writing. |
| `corrupt` | Invalid JSON, malformed envelope or invalid domain data; original bytes remain protected. |
| `unsupported` | An envelope declares a numeric version other than 1; original bytes remain protected. |

| Save result | Required caller behavior |
| --- | --- |
| `saved` | The exact serialized replacement was read back successfully; memory now reflects it. |
| `unchanged` | No write was necessary, and the current raw bytes still match the opened/saved baseline. |
| `conflict` | Stop using this stale session for mutations; reopen current storage and recompute the action. Do not silently retry the stale replacement. |
| `unavailable` | Keep the last validated in-memory snapshot and report that persistence was not confirmed. Reopen before recovery/retry when the commit may be uncertain. |
| `invalid` | Reject the proposed domain state; storage was not touched. |
| `protected` | Normal saving cannot replace corrupt/unsupported bytes, or explicit protected recovery was called on a normal session. |

## Replacement and recovery

Every changed save over an existing record first creates a separate recovery
copy of its exact bytes, including formatting, unknown fields and unsupported
versions. Normal writes reuse the single latest recovery slot. Explicit replacement of protected data creates a uniquely named recovery copy.
The copy is read back and checked before the original key can be replaced. A
quota error, denied operation, unavailable recovery slot or silent backup failure
blocks replacement. Explicit recovery records are retained. Routine saves keep one reusable copy. If storage pressure prevents the backup or the new snapshot, the current record stays protected.

After copying, the current main key is compared again, then the replacement is
written and read back. Only a verified replacement updates the session baseline.
There is no automatic rollback after a conflict: restoring old bytes could erase
another tab's newer state. The recovery copy remains available for inspection.
Only adaptive/recovery keys are written; course progress and theme are never read
or written by the sidecar storage session.

Raw comparison catches a stale tab, including when its requested save would
otherwise be a no-op. A second comparison catches an intervening write during
backup creation. Read-back detects a replacement during/after the write or a
silent failed write. A failed initial read remains write-blocked even if the port
later recovers. An uncertain read-back also blocks that session until reopening.

`localStorage` offers no atomic compare-and-swap transaction across tabs. A
different tab can still write between the final comparison and `setItem`, and
another tab can replace a snapshot after successful read-back. This module
provides optimistic conflict detection and recovery. The engine facade serializes same-origin writes via Web Locks when available, then performs the same stale-snapshot checks.
Consumers must not present a conflict as committed progress, and must refresh
before retrying actions. Logical submission/grant idempotence belongs to the
validated domain reducer; storage itself saves the whole envelope as one change.

## Legacy projection

`legacyAccess` consumes an already validated `Progress` and the real current
course. It returns only `{ completed, available, resume }`:

- `completed` retains completed IDs that are members of the supplied course,
  ordered by that course.
- `available` delegates each current member to existing `isLessonUnlocked`,
  including its historical grammar-access rule. Membership includes registered
  ready lazy-loaded lessons even when rich `.lesson` content is not loaded.
- `resume` retains an available last-visited lesson. With previous current-course
  history it otherwise selects the first available unfinished lesson, or the
  last available lesson for review. Fresh empty progress returns `null`, while
  still exposing its ordinary first lesson through `available`.

The projection does not mutate progress, create evidence, derive H0 from missing
historical hint data, grant a lesson, or admit IDs absent from the supplied
course. Adaptive catalogue readiness is an additional filter owned by the
domain engine; callers must pass the actual registered course, not planned IDs.
Resume here is a lesson ID; the existing learning route still resolves and
validates its step with the legacy course progress.

## Executed validation

`node --experimental-strip-types --test tests/adaptive-storage.test.mjs` covers
read-only initialization, byte preservation, saves/reload/idempotence, detached
data, corruption/unsupported protection, explicit recovery, invalid and circular
input, quota and backup failures, transient reads, stale sessions, backup-time
conflicts, read-back failures and legacy sequential/lazy membership compatibility.
No real learner storage is used; all persistence tests use disposable mock ports.
