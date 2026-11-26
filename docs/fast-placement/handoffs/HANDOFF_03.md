# Stage 03 handoff · Fast Placement Engine

Implementation branch `feature/fast-placement-engine` starts at verified develop `e80f87bec6a7b6b2165f945a8778405588096746`. Use the integrated develop revision reported by 01 for stage 04. [Method](../METHODOLOGY.md) · [Status](../PIPELINE_STATUS.md)

## Contract for stage 04

Import `FastBank`, `FastItem` and `validateFastBank` from [the engine entry](../../../src/lib/adaptive/fast/index.ts). Author `{ version, forms: [{ id, slots }, { id, slots }] }`. Each slot maps to an ordered pool of variants. A pool of one is sufficient when the stimulus is independent. The engine selects the first eligible version in declared order.

| Phase | Required slot keys in routing order | Accepted authored roles |
| --- | --- | --- |
| Core | `core-lat`, `core-be`, `core-ask`, `core-orient`, `core-note` | ASK is S. Others are R. |
| Print follow-up | `lat-followup` | LAT is R or S. |
| Foundation | `foundation-num`, `foundation-be`, `foundation-ask` | NUM is R, BE is R or S, ASK is S. |
| Upper | `upper-num`, `upper-constraint`, `upper-write`, `upper-constraint-2`, `upper-transfer` | WRITE is S. Others are R. TRANSFER uses GIST or MEDIATE and never changes access. |
| Optional clarifiers | `clarify-lat`, `clarify-be`, `clarify-ask`, `clarify-orient`, `clarify-note`, `clarify-num`, `clarify-constraint`, `clarify-write` | ASK and WRITE use S. Others may use R or S. |

Each item has `id`, `itemRevision`, `keyId`, `keyRevision`, `variant`, `family`, `stimulus`, `group`, `role`, `instruction`, `prompt`, `target` and `wrongAttribution`. The short group IDs are listed in [bank.ts](../../../src/lib/adaptive/fast/bank.ts). Corresponding slots use the same R/S role in both forms. Mark `wrongAttribution: 'direct'` only when a wrong response isolates the target. Use `'ambiguous'` when it does not. Reuse existing stable IDs and lineage for revisions of comparable old material. The engine excludes previously exposed item IDs, families and stimuli from either placement method. Use a different family and context for each used slot and form. Variants within the same slot may share a lineage. Revise bank and item/key versions when their content changes.

- `format: 'choice' | 'tap-fill'` uses `options: [{ id, label }]` and `acceptedOptionIds: [id]` with at least one distractor. Submit the ID from the selected option.
- `format: 'cards'` uses `tokens: [{ id, label, equivalent? }]` and `acceptedSequences: [[wordOrClass, ...], ...]`. Cards have unique instance IDs, even when their labels are identical. An omitted `equivalent` makes the exact label the class. Use explicit equivalence classes for harmless punctuation or case differences. Include approved alternate word orders. Keep all instances of an indistinguishable label in the same class. Provide the cards in an order that does not already spell an accepted sequence, even after removing distractors.
- `validateFastBank` reports incompatible roles, invalid or leaked card keys, ID and family collisions, exact repeated prompts and missing slots. It cannot validate whether different wordings expose the same answer or whether an error really isolates the target. Editorial review still owns those checks. [Synthetic fixture](../../../tests/fixtures/fast-placement.mjs) · [Engine acceptance tests](../../../tests/fast-placement.test.mjs)

## Contract for stage 02

The existing localhost adaptive host accepts an optional `fastBank` in `AdaptiveContent`. Once 04 supplies it, use `host.engine.fast` for the new entry and retain the previous R/P draft as read-only. Use the existing adaptive write wrapper and startup recovery messages. Calls below return the normal storage acknowledgement for writes. Treat `unchanged` as a no-op and check the returned view before navigation. On `conflict`, reread the current snapshot before another action. The production entry remains the ordinary site.

| Call | Use |
| --- | --- |
| `entry()` | `canStart`, `resumable`, `incompatibleDraft`, `legacyDraft`, `protectedData`, `a1`, `preA1`, `resume` and authoring errors. |
| `begin(id)` | Start or retake with a fresh stable session ID. A run consumes its form when the first item is shown. |
| `view()` | Current prompt, phase, presented count, target range and current selection. The prompt has only instruction, display text, role, format and option/card IDs and labels. It exposes no key, correctness or explanation. |
| `select(cursor, selectionOrNull)` | Persist the current tap or ordered token IDs after edits. Null clears the draft. An empty array is a valid card draft. Read the updated cursor after every saved edit. |
| `submit(cursor, response)` | Explicitly submit `{ type: 'option', optionId }`, `{ type: 'cards', tokenIds }`, `{ type: 'skip' }` or `{ type: 'unknown' }`. A response needs no prior `select` call. An empty, repeated-instance or unknown-ID card response is rejected without moving forward. |
| `sessionCursor()`, `action(cursor, action)` | Use the current token even while paused. Actions are `pause`, `resume` and `finish`. Manual finish evaluates committed observations. A draft selection supplies no evidence. |
| `result()` | Provisional recommendation with reason, per-group direction/strength, neutral counts, prior resume, ready elective routes and availability of a retake. A null recommendation means insufficient usable evidence or no supported ready target. |
| `accept(sessionId, { kind, lessonId })` | For a compatible finished result, choose one offered `recommendation`, `a1` or `pre-a1`. Read back `result().accepted`. Resume uses the existing accessible route directly. Outside a compatible result use the existing `engine.choose({ type: 'start', route })` for elective entry. |
| `followup(lessonId)` | Optional location of a mapped, eligible written or blank practice item in the loaded accessible lesson. Returns null when no appropriate ordinary P is available. Existing practice records any new observation under its own criterion. |

Show one question and a presented count or stage. Preserve the exact resume cursor and recognize a form that cannot resume. Use only provisional wording. The engine keeps the previous resume primary when it exists, including when the new suggestion points earlier. When forms are exhausted, keep ordinary entry available.

## Compatibility and verification

The optional `fastPlacement` partition has its own schema version and lives inside the existing `gps.adaptive.v1` envelope. A fast session pins method, bank, catalogue, form, presented sequence, item/key versions, display order and draft. Older adaptive records are valid as-is. Unsupported fast-only data stays protected without invalidating earlier grants. Fast observations live in the fast partition. They do not become independent practice evidence, confirmation, lesson completion, skip eligibility or checkpoint readiness. A verified explicit choice and its new grant commit in the same snapshot under the existing storage lock and conflict check.

The synthetic tests measure early stops at 2, 7 and 8 items, upper outcomes at 10–12, a hard cap of 15, neutral skips, contradiction, saved card order, two independent forms, safe key withdrawal, stale selections and ordinary P follow-up. Timing and recommendation quality for real learners remain pilot questions. No browser claim is made for the fast route at this stage. The current UI and bank remain in place pending 04 and 02.
