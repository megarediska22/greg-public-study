# Stage 05 adaptive learning engine

`src/lib/adaptive/` implements the approved [assessment handoff](../assessment/ENGINE_HANDOFF.md). The current website retains its linear route. The pilot will require an explicit host integration, a ready catalogue and two complete reviewed diagnostic forms. The current source includes no live forms or pilot UI.

| Module | Responsibility |
| --- | --- |
| `model.ts`, `catalog.generated.json`, `content.ts` | Versioned pilot settings and content validation. The reproducible catalogue contains 38 knowledge groups, 159 objectives, 140 planned activities, 12 placement slices and 13 checkpoints. |
| `evidence.ts`, `practice.ts` | Classify first attempts and assistance, retain corrections for practice, deduplicate families and stimuli, fold criterion history, and recompute after key withdrawal. |
| `diagnostic.ts` | Pin the form and selected item/key revisions. Run D0, optional D0R, D1, D2-BASE or D2-UP, then D3. Persist a cursor, count shown slots once and stop at 28. Incomplete coverage produces a partial result. An explicit early exit discards staged signs from the knowledge fold. |
| `routes.ts`, `advice.ts` | Compare fresh and historical knowledge for placement, prioritise actionable early gaps, resolve ready targets, grant one lesson per eligible action and dismiss advice for the current episode. Checkpoint bridges separate independent readiness from supported progression. |
| `state.ts`, `storage.ts`, `engine.ts` | Validate and persist logical snapshots. Compose the domain rules behind an asynchronous interface. A diagnostic submission, cursor change and its automatic result use the same adaptive snapshot. |

Evidence uses ordered signed observations. Two consecutive independent signs in the same direction, including a P item, determine confirmation or a gap. A single error after confirmation preserves it. Corrections, hint-assisted answers and legacy attempts never supply signs. Withdrawal is keyed by item and key version and replays the fold. Only a newly confirmed episode clears its dismissal.

The runtime groups the blueprint dependency edges by objective. They inform review recommendations and do not block ordinary lessons. Only explicit profiles and bridges affect new grants. NOW and PAST stay available as knowledge results and can support topic-specific review without gating the A2 start. Missing planned lessons are filtered against the actual ready catalogue. Existing lesson, step and question IDs remain authoritative.

The ordinary exercise reducer remains the source of accepted attempts. `ProgressProvider` exposes an optional practice port, which accepts the highest hint level opened for an item. The exercise presentation work in the source QA checkout supplied those controls. It is a separate change and must be integrated before wiring hint events to the pilot. The current entry point supplies no practice port because approved criterion mappings are pending. The reducers and startup storage adapters accept an optional set of previously verified grants so an authorised lesson can be done and replayed using the existing grading rules once the pilot host is installed.

Stage 05 uses only the three existing question formats and one attributed observation per item. The content contract uses an explicit direct or ambiguous negative-attribution policy. Assessment remains limited to the checked text actions. Pilot thresholds have not been calibrated on learner data. [UI contract](UI_INTEGRATION_CONTRACT.md) · [Content contract](CONTENT_INTEGRATION_CONTRACT.md) · [QA](ENGINE_QA_REPORT.md)
