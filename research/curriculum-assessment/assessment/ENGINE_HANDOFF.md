# Learning Engine · Functional handoff

Workstream 03 owns the browser-only placement flow, evidence tracking, checkpoint transitions and recommendations. Identical inputs must produce identical decisions. The existing learning route must remain usable. Workstream 03 selects the architecture and storage migration after inspecting the application under a separate implementation brief. [Interface handoff](UI_HANDOFF.md)

## Decision contracts

| Contract | Inputs | Output and invariants |
| --- | --- | --- |
| Session | Available forms, versions, exposed families, committed submissions, cursor and user action | Next slot, pause, user-ended session, or automatic full or partial result. Persist the selected form and order. An early manual finish does not apply staged evidence. [PL-01/02](PLACEMENT_SPEC.md) |
| Evidence | Item, criterion, family, R/P role, key revision, first submission, assistance and validity | One signed observation for the designated criterion or a documented neutral outcome. [EV-01/02](EVIDENCE_RULES.md) |
| Knowledge | Ordered valid signs from distinct families for one criterion version | EV-03 state and supporting references. Recompute after a key withdrawal. [EV-03/04](EVIDENCE_RULES.md) |
| Placement | Fresh evidence, merged history, catalogue, prerequisites and existing access | Recommended start and reason, an earlier alternative, unconfirmed slices and optional practice. A recommendation is issued before any new access grant. [PL-03](PLACEMENT_SPEC.md) |
| Progression | Completion, pre-existing access, selected lesson, approved profile, checkpoint criteria and action | Grant at most one lesson per action. Completion, evidence, recommendation and access remain distinct. [AD-01/02/03](ADAPTIVE_LEARNING_SPEC.md) |
| Recommendation | Criterion, current state, prerequisites, catalogue, issue episode and dismissal | One optional recommendation or none, with a reason and independent resume action. [AD-04](ADAPTIVE_LEARNING_SPEC.md) |

## Required logical records

Field names describe the data contract. Existing catalogue and specification IDs take precedence.

| Record | Minimum data |
| --- | --- |
| Course progress | Existing lesson and step IDs, completions, attempts, valid legacy access and the last usable resume point. |
| Item metadata | Item ID and revision, key ID and revision, criterion ID and version, knowledge group and Objective IDs, family and stimulus IDs, R/P role, accepted answers, block or checkpoint. The chosen form defines slot order and difficulty. |
| Evidence event | Stable submission key and recorded order, channel, session or lesson ID, item and key revisions, family, criterion version, first-attempt outcome, assistance before submission H0/H1/H2/UNKNOWN, prior key exposure, eligible sign or neutral reason and any withdrawal. Keep later corrections as practice events. Store a diagnostic answer only to the extent required to resume and interpret it. |
| Session and result | ID, status, pinned method, bank and catalogue versions, ordered families and slots, block and cursor, submitted outcomes, finish reason, applied event IDs, fresh criterion states, recommended lesson, reasons and user choice. Maintain a way to identify exposed or previously used families for a retake. |
| Access and recommendation | Grant ID and target lesson, reason and source, accepted choice, catalogue version and alternate resume point. For advice, record criterion, issue episode, state, target and dismissal. For checkpoint transitions record whether the user took the independent or supported path. |
| Versioned configuration | Storage, method and bank versions, criterion and key revisions, withdrawn keys, enabled start and skip profiles. Map each checkpoint readiness group to an explicit criterion ID and version agreed with Lessons & QA. |

Use the existing multiple-choice and short-entry exercise formats. Support “Не знаю”, skip and pause as session actions. Verify initial D0 availability before launch, then check fresh family coverage before each block or pair. Running out of families triggers the partial result in PL-02. A checkpoint counts independent evidence only for designated criteria. For the two readiness checkpoints require **CONFIRMED and a fresh positive sign from the current checkpoint** for each active criterion in the [checkpoint table](CHECKPOINT_SPEC.csv). Apply the supported continuation route in AD-03 when those conditions are missing.

## Pseudocode

```text
recordSubmission(session, slot, submission):
    reject duplicate submission key or mismatch with pinned slot
    assess with pinned key and capture assistance before submission
    classify by EV-01 and EV-02 as one R/P sign or a neutral event
    persist submission, staged event and next position as one logical change
    choose next action from fresh staged events and PL-02 budget

foldCriterion(events, criterionVersion):
    select valid signs for the criterion version in recorded order
    ignore revoked signs and duplicate family contributions
    fold signs from UNKNOWN using EV-03
    return state and evidence references

finishSession(session, reason):
    if user ended early:
        close without applying staged signs
        display safe start or existing resume point
    otherwise:
        fresh = fold eligible staged events per criterion
        merged = fold prior and staged events per criterion
        commit events and result once
        choose first applicable early GAP/REVIEW from PL-03
        otherwise choose latest enabled profile CONFIRMED in fresh and merged
        resolve against catalogue and prerequisites, keeping existing resume
        display result and wait for explicit choice

updateAccess(state, action, catalogue):
    preserve completed lessons, verified legacy access and issued grants
    revalidate target eligibility and current snapshot before writing
    for an explicit valid start or skip, accepted supported bridge,
      or an eligible ordinary completion:
        add only the corresponding ready lesson
    return separate completion, placement confirmation, recommendation and access

recommend(state, currentLesson):
    choose nearest attributable earlier GAP/REVIEW,
      then current GAP/REVIEW, then an uncertainty check
    apply stable tie-break and per-episode dismissal
    return optional advice alongside the independent resume action
```

Completion and access changes must have one logical effect after duplicate submissions, reload, or a concurrent write. The event stream retains key revisions and neutral reasons so derived knowledge can be recomputed without changing the original submission. Elapsed time and inactivity do not change a knowledge state.

## Compatibility and failures

The current **gps.progress.v1** snapshot stores attempted answers and correctness. **firstTry** is derived from the first recorded attempt. Hint use is absent from historical snapshots. Existing storage guards against replacing progress with an empty snapshot and has a recovery copy path. [Progress](../../../src/lib/progress.ts) · [Storage](../../../src/lib/progressStorage.ts) · [Progress context](../../../src/lib/ProgressContext.tsx)

- Read supported legacy snapshots with their completions, valid access and resume point. Unknown historical assistance supplies no independent proof. A future update must be idempotent and validate the new snapshot before replacing the old one. Keep a valid recovery copy until the new write is verified.
- Pin versions when pausing. Archive an incompatible draft with a reason. Keep the last valid snapshot after a storage error and report a temporary result accurately. On a conflict across tabs, reload the current saved state and prevent a silent overwrite. Unsupported or corrupted data must never trigger automatic replacement with an empty snapshot.
- Retakes and a new bank preserve prior progress. A new incompatible criterion version starts its own evidence history. Recompute after a key withdrawal without reversing completion or issued access. An explicit confirmed reset is a separate user operation. Progress is local to the current browser.
- Enable a start or checkpoint transition only when its catalogue entry and profile are ready. Keep the established linear route when the pilot is off. Planned IDs absent from this catalogue never enter saved progress.

## Delivery order and acceptance

1. **03 · Learning Engine** defines versioned decision and persistence contracts, verifies compatible reads, then validates the rules against test fixtures before integration.
2. **02 · Foundation & Design** works with 03 once the contracts are agreed. Implement screen states, Russian copy, keyboard and mobile focus, and recovery. [Interface handoff](UI_HANDOFF.md)
3. **04 · Lessons & QA** writes fresh diagnostic and checkpoint families, verifies keys, and approves criterion versions and skip profiles. Activate a branch only once its bank and target lessons are ready. Run the [pilot](PILOT_VALIDATION_PLAN.md) with reviewed material rather than demonstration items.

The future automated suite must cover EV-01–04, deterministic branch selection and budgets, catalogue references, legacy reads, storage errors and races, retakes, key withdrawal and granting one lesson per eligible action. Browser scenarios must cover entry without placement, pause and recovery, normal and supported transitions, optional advice dismissal, return to the existing route and mobile input. Verify [S01–S26](ACCEPTANCE_SCENARIOS.md) including continuation with the pilot disabled. The pilot retains its proposed thresholds until separately calibrated.
