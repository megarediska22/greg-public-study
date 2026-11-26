# Project status

Snapshot after integrating Stage 07 into develop. The stable baseline is `645018f`. The published React/TypeScript/Vite application contains **121 lessons, 847 steps and 1,980 questions**. It has sequential lessons, written and selection exercises, responsive light/dark themes and browser-local progress. Progress does not sync across devices. The course has no account system, backend or audio assessment.

| Stage | Status | Owner |
| --- | --- | --- |
| 1. Education standards research | Complete | 05 |
| 2. Methodological audit | Complete | 05 |
| 3. Target curriculum | Complete as a plan | 05 |
| 4. Diagnostic and adaptive methodology | Complete as a specification | 05 |
| 5. Adaptive learning engine | Complete in develop | 03 |
| 6. Integrate adaptation into the existing UI | Complete in develop | 02 and 03 |
| 7. Author and extend lessons | Complete in develop (PK-01–PK-05). | 04 with 05 |
| 8. Integrate, test and release | Pending | 04, 03 and 01 with owner approval |

The adaptive engine, its separate storage and optional practice/access interfaces are available for development. The public learner route remains linear. The [Stage 06 interface](docs/ADAPTIVE_UI.md) is available in develop for local review. The development branch contains all 13 course checkpoints and 54 live practice mappings in the local pilot. Diagnostic forms are a separate pending task. The integration uses the [engine implementation](research/curriculum-assessment/engine/ENGINE_IMPLEMENTATION.md), [progress contract](research/curriculum-assessment/engine/PROGRESS_MIGRATION.md), [UI contract](research/curriculum-assessment/engine/UI_INTEGRATION_CONTRACT.md) and [content contract](research/curriculum-assessment/engine/CONTENT_INTEGRATION_CONTRACT.md).

The development branch contains 140 lessons, 1,011 steps and 2,267 questions. See the [PK-01 report](docs/PK_01_REVIEW.md) and the [PK-02–PK-05 report](docs/PK_02_05_REVIEW.md).

The completed course contains **4 elective Pre-A1, 49 A1 and 87 A2 lessons**. The public catalogue remains at the stable baseline. Placement validation and a separate release decision are required before offering public diagnosis or interpreting the pilot as an assessment.

Read the [roadmap](ROADMAP.md), [specification](SPEC.md), [curriculum and assessment research](research/curriculum-assessment/README.md), [current lesson schema](docs/LESSON_SCHEMA.md) and [changelog](CHANGELOG.md). For a new checkout, see [setup](SETUP.md) and the [Git workflow](GIT_WORKFLOW.md).
