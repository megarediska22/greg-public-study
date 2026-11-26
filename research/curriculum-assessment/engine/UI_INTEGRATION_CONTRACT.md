# Foundation & Design integration

`openAdaptiveEngine(options)` in `src/lib/adaptive/engine.ts` accepts a local storage port, versioned course rules, bank, authorised practice metadata, and a function returning validated legacy access. Supply a question resolver for practice and checkpoint entry. This lets the engine verify the live item ID and R/P format before collecting evidence. Use a single engine instance for the route and re-open on a storage conflict. The shipped site starts in linear mode with no connected pilot host.

| Call | UI use |
| --- | --- |
| `entry()` | Read A1, optional Pre-A1, prior resume, readiness, and valid or incompatible saved draft. Use a normal resume when one exists. |
| `begin(id)`, `diagnostic()` | Start by explicit choice with a new stable session ID. Render the returned card, ordinal, block, and offered upper check. The active view exposes no key or correctness. |
| `submit({ slot, itemId, key, type, answer? })` | Send `answer`, `unknown` or `skip`. Keep the same unique submission key on a duplicate request. Empty or invalid input leaves the slot unchanged. |
| `diagnosticAction(action)` | Use `pause`, `resume`, `finish`, `upper`, or `decline-upper`. The upper commands apply to the upper offer. Continue ordinary study without finishing a paused assessment. |
| `knowledge()` | Read the current persistent per-criterion states, including after ordinary practice and before any diagnostic. |
| `result()` | Get the latest closed result, fresh and historical criterion states, checked and unanswered counts, reason, recommended and earlier points, optional preparation and independent resume. |
| `choose(action)`, `declinePlacement()` | Explicit start (A1 or Pre-A1), accept a displayed target, complete a verified lesson, request a profiled skip, or choose a checkpoint transition. Decline records the choice without affecting access. |
| `access(lessonId)`, `grantedLessons()` | Render availability, actual completion, placement confirmation and recommendation independently. Use only verified grant IDs for lesson routes, reducer calls and replay. |
| `advice(lessonId, includeDismissed?)`, `dismissAdvice(lessonId, id)` | Read one optional recommendation with a reason and independent resume. Dismiss the active episode. Use the second argument for explicitly requested advice. |
| `beginCheckpoint(id, attempt)`, `checkpointAnswer(...)`, `checkpoint(id)` | Track a new attempt, submit designated answers or neutral responses, render readiness and the supported choice where applicable. A fresh attempt can count only fresh independent evidence. |

Example after a successful persisted start:

```ts
const card = engine.diagnostic()?.prompt;
if (card) {
  const status = await engine.submit({ slot: card.slot, itemId: card.id, key: crypto.randomUUID(), type: 'unknown' });
  if (status === 'saved' || status === 'unchanged') render(engine.diagnostic());
}
```

Mutations return storage statuses from [progress migration](PROGRESS_MIGRATION.md). Show an action as recorded only after a verified write and state change. Read status again after `unchanged`, which can mean duplicate or inapplicable input. For conflict, reopen and recompute from the current saved snapshot. Use `recoverAfterConfirmation()` only after the user explicitly chooses to replace protected data. The original bytes are copied to the reported recovery key first.

If an active pilot store is corrupt or unsupported, preserve both stores and offer recovery before opening a write-enabled course session. Otherwise, the host must use the same verified grants for availability, `updateProgress`, and `openCourseSession` on reload, and preserve the last usable resume point. In an enabled pilot, the legacy available set supplied to the engine represents the pre-pilot entitlement baseline. Update actual completions and resume independently, so completing an active bridge does not accidentally issue the next lesson through legacy sequential access. Connect the practice port only with authorised item metadata. Handle failed practice writes via the port, retain the ordinary continuation action and make uncertain persistence visible. Connect the existing confirmed reset to both stores if the pilot is active. The stage 05 integration leaves ordinary reset semantics intact.

Provide the Russian states, keyboard focus, readable result labels and mobile interactions from the [UI handoff](../assessment/UI_HANDOFF.md). Explain verified actions and uncertainty without a percentage or a level credential.
