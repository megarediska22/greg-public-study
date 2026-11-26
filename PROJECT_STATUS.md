# Project status

Snapshot after integrating PK-01 into develop. The stable baseline is `645018f`. The published React/TypeScript/Vite application contains **121 lessons, 847 steps and 1,980 questions**. It has sequential lessons, written and selection exercises, responsive light/dark themes and browser-local progress. Progress does not sync across devices. The course has no account system, backend or audio assessment.

| Stage | Status | Owner |
| --- | --- | --- |
| 1. Education standards research | Complete | 05 |
| 2. Methodological audit | Complete | 05 |
| 3. Target curriculum | Complete as a plan | 05 |
| 4. Diagnostic and adaptive methodology | Complete as a specification | 05 |
| 5. Adaptive learning engine | Complete in develop | 03 |
| 6. Integrate adaptation into the existing UI | Complete in develop | 02 and 03 |
| 7. Author and extend lessons | PK-01 complete in develop. PK-02–PK-05 pending. | 04 with 05 |
| 8. Integrate, test and release | Pending | 04, 03 and 01 with owner approval |

The adaptive engine, its separate storage and optional practice/access interfaces are available for development. The public learner route remains linear. The [Stage 06 interface](docs/ADAPTIVE_UI.md) is available in develop for local review. PK-01 adds eight practice mappings and the optional CP-PRE check in the development pilot. Live diagnostic forms are pending. The integration uses the [engine implementation](research/curriculum-assessment/engine/ENGINE_IMPLEMENTATION.md), [progress contract](research/curriculum-assessment/engine/PROGRESS_MIGRATION.md), [UI contract](research/curriculum-assessment/engine/UI_INTEGRATION_CONTRACT.md) and [content contract](research/curriculum-assessment/engine/CONTENT_INTEGRATION_CONTRACT.md).

The development branch contains 126 lessons, 885 steps and 2,040 questions. See the [implementation and QA report](docs/PK_01_REVIEW.md).

The target program specifies **140 sessions**: 4 optional Pre-A1, 49 A1 and 87 A2. Those are planning counts, separate from the published catalog. Placement and adaptive recommendations will need verification against the specification and pilot validation before making claims about assessment accuracy.

Read the [roadmap](ROADMAP.md), [specification](SPEC.md), [curriculum and assessment research](research/curriculum-assessment/README.md), [current lesson schema](docs/LESSON_SCHEMA.md) and [changelog](CHANGELOG.md). For a new checkout, see [setup](SETUP.md) and the [Git workflow](GIT_WORKFLOW.md).
