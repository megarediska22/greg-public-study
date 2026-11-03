# Integrated A1 vocabulary expansion review

Implementation and verification notes for the v1.1 vocabulary expansion, 2026-11-03. The existing QA and preview servers were reused and left running.

## Outcome and exact curriculum

The course now contains **16 lessons / 112 ordered steps / 330 questions**: ten unchanged grammar lessons (150 questions) and six new vocabulary lessons (180 questions). The vocabulary inventory has **60 distinct target words and expressions**, ten per unit. Some deliberately reinforce words already encountered in grammar; this is not a claim that all 60 were previously unknown to the learner.

Every new lesson has seven steps: introduction → word discovery → recognition (10 choices) → recall/spelling (10 text answers) → contextual use (10 complete sentences) → mistake review → explicit completion. There are **18 new required practice sections** and **180 new questions**. Optional review drills reuse these questions and are not counted again.

| Order | Stable ID | Kind | Topic | Questions |
| --- | --- | --- | --- | ---: |
| 01 | `to-be` | Grammar | am / is / are | 15 |
| 02 | `people-feelings` | Vocabulary | People & Feelings | 30 |
| 03 | `present-simple` | Grammar | Утверждения и отрицания | 15 |
| 04 | `do-does` | Grammar | do / does | 15 |
| 05 | `daily-routines` | Vocabulary | Daily Routines & Common Verbs | 30 |
| 06 | `have-has` | Grammar | have / has | 15 |
| 07 | `articles` | Grammar | a / an / the | 15 |
| 08 | `family-objects` | Vocabulary | Family & Everyday Objects | 30 |
| 09 | `demonstratives` | Grammar | this / that / these / those | 15 |
| 10 | `there-is-are` | Grammar | there is / there are | 15 |
| 11 | `home-places` | Vocabulary | Home & Places | 30 |
| 12 | `can-cant` | Grammar | can / can’t | 15 |
| 13 | `hobbies-abilities` | Vocabulary | Hobbies & Abilities | 30 |
| 14 | `present-continuous` | Grammar | Present Continuous | 15 |
| 15 | `actions-time` | Vocabulary | Actions & Time Expressions | 30 |
| 16 | `was-were` | Grammar | was / were | 15 |

The proposed order was retained exactly. Existing grammar lesson, step and question IDs, all content, answer keys, translations, normalization settings and sentence-intent metadata are unchanged. A task-start deep comparison of the ten complete catalog entries passed; SHA-256 checks of all ten grammar files, `AGENTS.md`, `SPEC.md`, `grading.ts` and the guarded `progressStorage.ts` found **no changes**. Pre-existing uncommitted work from Foundation/Design and Learning Engine was retained.

## Teaching decisions and complete vocabulary inventory

All material is original. The supplied research and handoff were read as local evidence; no new claims about BAD School are made. Recognition → independent recall/spelling → controlled contextual use follows the observed instructional progression. Cards use this project's existing typography, surfaces and themes. Ten words per unit follows the user's approved scope, rather than the earlier handoff proposal of 6–8.

Clues constrain one meaning and response format. Recall requests the complete taught word/expression, not missing letters. Contextual tasks request complete sentences and provide a subject/frame or time-word position. They use grammar already taught. Full forms and natural contractions are explicitly accepted; capitalization, whitespace, curly apostrophes and terminal written punctuation use the unchanged normalizer. These are controlled vocabulary tasks, not an open translation or paraphrase assessment.

### People & Feelings — `people-feelings`

**Difficulty:** A1 entry; prerequisite: to be.

**Objectives:** Identify people and express feelings. My friend is explained on its card; articles before professions follow the preceding to-be lesson.

**Questions:** 30 (10 recognition, 10 recall/spelling, 10 contextual writing). **Review:** every incorrect attempt remains in the main history; the optional retrieval drill deduplicates affected word IDs and asks for only those words again, without erasing earned scores.

| English target | Russian meaning | Example |
| --- | --- | --- |
| student | студент / студентка | I am a student. |
| teacher | учитель / учительница | Gregory is a teacher. |
| friend | друг / подруга | Natasha is my friend. |
| happy | счастливый / довольный | I am happy. |
| sad | грустный | She is sad. |
| tired | уставший | We are tired. |
| hungry | голодный | I am hungry. |
| thirsty | испытывающий жажду | He is thirsty. |
| busy | занятый | Natasha is busy. |
| ready | готовый | They are ready. |

### Daily Routines & Common Verbs — `daily-routines`

**Difficulty:** A1 entry; prerequisites: Present Simple statements/negatives/questions.

**Objectives:** Describe an ordinary day. Have breakfast is taught as a fixed expression before have/has grammar; no untaught third-person have form is tested. Wake up and get up are explicitly distinguished.

**Questions:** 30 (10 recognition, 10 recall/spelling, 10 contextual writing). **Review:** every incorrect attempt remains in the main history; the optional retrieval drill deduplicates affected word IDs and asks for only those words again, without erasing earned scores.

| English target | Russian meaning | Example |
| --- | --- | --- |
| wake up | просыпаться | I wake up. |
| get up | вставать с постели | We get up. |
| have breakfast | завтракать | I have breakfast. |
| go to school | ходить в школу | They go to school. |
| go to work | ходить на работу | I go to work. |
| study | учиться / изучать | Natasha studies English. |
| work | работать | Gregory works at home. |
| eat lunch | есть обед | We eat lunch. |
| come home | приходить домой | I come home. |
| go to bed | ложиться спать | They go to bed. |

### Family & Everyday Objects — `family-objects`

**Difficulty:** A1 entry; prerequisites: have/has and basic articles.

**Objectives:** Name relatives and everyday belongings. Neutral mother/father are distinguished from informal mom/dad; my versus a is explained. Family examples are fictional.

**Questions:** 30 (10 recognition, 10 recall/spelling, 10 contextual writing). **Review:** every incorrect attempt remains in the main history; the optional retrieval drill deduplicates affected word IDs and asks for only those words again, without erasing earned scores.

| English target | Russian meaning | Example |
| --- | --- | --- |
| mother | мать | She is my mother. |
| father | отец | He is my father. |
| sister | сестра | Natasha has a sister. |
| brother | брат | Gregory has a brother. |
| family | семья | I have a family. |
| book | книга | I have a book. |
| bag | сумка | She has a bag. |
| phone | телефон | I have a phone. |
| key | ключ | The key is here. |
| cup | чашка | The cup is red. |

### Home & Places — `home-places`

**Difficulty:** A1 entry; prerequisites: demonstratives and there is/are.

**Objectives:** Describe rooms, furniture and nearby places. In, here and near are explained. Table versus desk and American bathroom/store usage are clarified.

**Questions:** 30 (10 recognition, 10 recall/spelling, 10 contextual writing). **Review:** every incorrect attempt remains in the main history; the optional retrieval drill deduplicates affected word IDs and asks for only those words again, without erasing earned scores.

| English target | Russian meaning | Example |
| --- | --- | --- |
| kitchen | кухня | Natasha is in the kitchen. |
| bedroom | спальня | This is a bedroom. |
| bathroom | ванная комната | The bathroom is here. |
| living room | гостиная | We are in the living room. |
| table | стол | There is a table in the room. |
| chair | стул | There is a chair here. |
| bed | кровать | The bed is in the room. |
| door | дверь | This is a door. |
| park | парк | Gregory is in the park. |
| store | магазин | There is a store near the park. |

### Hobbies & Abilities — `hobbies-abilities`

**Difficulty:** A1 entry; prerequisite: can/can’t.

**Objectives:** Describe abilities with base verbs. Play tennis/soccer, play the guitar and ride a bike are explicitly taught as chunks; soccer means association football in American English.

**Questions:** 30 (10 recognition, 10 recall/spelling, 10 contextual writing). **Review:** every incorrect attempt remains in the main history; the optional retrieval drill deduplicates affected word IDs and asks for only those words again, without erasing earned scores.

| English target | Russian meaning | Example |
| --- | --- | --- |
| swim | плавать | I can swim. |
| cook | готовить еду | Natasha can cook. |
| sing | петь | He can sing. |
| dance | танцевать | We can dance. |
| draw | рисовать | Gregory can draw. |
| read | читать | I can read. |
| play tennis | играть в теннис | She can play tennis. |
| play soccer | играть в футбол | They can play soccer. |
| play the guitar | играть на гитаре | I can play the guitar. |
| ride a bike | ездить на велосипеде | We can ride a bike. |

### Actions & Time Expressions — `actions-time`

**Difficulty:** A1 entry; prerequisite: Present Continuous.

**Objectives:** Describe current actions and contrast habits. Write → writing, run → running and listen to music are taught on cards. Every day / at night use familiar Present Simple; now/right now use the taught continuous pattern. No past-tense verbs are tested before was/were.

**Questions:** 30 (10 recognition, 10 recall/spelling, 10 contextual writing). **Review:** every incorrect attempt remains in the main history; the optional retrieval drill deduplicates affected word IDs and asks for only those words again, without erasing earned scores.

| English target | Russian meaning | Example |
| --- | --- | --- |
| write | писать | Natasha is writing now. |
| run | бегать | Gregory is running now. |
| listen | слушать | I am listening to music. |
| watch | смотреть | We are watching TV. |
| wait | ждать | She is waiting here. |
| now | сейчас | I am reading now. |
| right now | прямо сейчас | They are cooking right now. |
| today | сегодня | I am working at home today. |
| every day | каждый день | We work every day. |
| at night | ночью | I read at night. |

## Content validation

Reviewed all 60 terms, meanings, parts of speech, contextual examples, Russian translations, spelling/usage notes, 180 prompts, distractors, accepted forms and explanations. The new independent oracle supplies each term, Russian meaning and canonical complete sentence; 60 audit tests each check all three associated questions, wrong alternatives, empty answers and normalization/variants. Existing independent grammar audits retain all 150 original keys and specific grammar errors. No original exercise objective or answer was rewritten.

No new exercise type was introduced. Card references are required and validated for vocabulary practice. Production validation still enforces seven ordered steps, at least five questions per exercise, correct choice/blank/written section types, unique question IDs and complete text. Vocabulary discovery requires 6–12 complete cards with unique IDs/terms; current units each have exactly ten. Invalid references, card translations, duplicate cards, languages and step/kind mismatches are rejected by tests.

Pronunciation was considered using the handoff's actual recommendation: checked, legally usable local audio only. There are no local audio recordings in the project. **Audio is not implemented**, and no audio buttons or availability claims are shown. No paid API, network TTS, automatic translation, new dependency or backend was introduced.

## UI and additive schema changes

- Optional `Lesson.kind` distinguishes Russian “Грамматика” / “Словарь”; absent kind retains grammar behavior.
- New acknowledged `vocabulary` discovery step and `VocabularyItem` record replace theory only in vocabulary lessons. Existing theory data is untouched.
- Optional question `vocabularyId`, `promptLanguage` and choice-only `optionsLanguage` support references and correct Russian/English language markup. The three question types and answer normalization are unchanged.
- `VocabularyDiscovery` provides ten readable cards, individual translation reveals (`aria-expanded` / `aria-controls`), show/hide all and compact usage notes. It uses one column at 360px and two on desktop.
- `VocabularyReview` and pure `createVocabularyReview` reuse existing recall questions and the batch component in a disposable nested context. Only actual missed words appear; answers and reference examples are hidden until the additional batch is checked. The parent history remains intact. The drill is optional and does not create new course questions, earned completion or a word-mastery score.
- `ExerciseStep` gains an optional `reviewOnly` presentation flag so an extra drill does not falsely promise to unlock a next step. Its normal batch behavior is unchanged.
- Vocabulary summaries list target words and separate recognition, recall and context scores. The final grammar summary no longer incorrectly claims the whole course is complete for returning learners who still have vocabulary outstanding.
- Catalog/lesson labels and QA totals derive from the integrated registry. Summary navigation returns to the course if the next entry remains locked, rather than linking a returning learner to an inaccessible lesson.
- No overall redesign, navigation replacement, logo, branding or reference-asset change. Both existing theme token sets remain authoritative.

## Batch validation compatibility

All required practice and the optional retrieval drill use the existing `ExerciseStep`, deterministic grader and `check-exercise` reducer action. All questions display before checking, with one “Проверить ответы” button at the bottom. Missing fields withhold the entire batch without attempts. Correct answers lock; incorrect answers keep their text and remain editable. Rechecking touches only unresolved answers. Continue unlocks only at a fully correct required section and never auto-navigates. Original per-question actions remain solely for stored-history replay/compatibility; no individual check buttons were added.

## Exact progress migration and retained access

The storage key remains `gps.progress.v1`, with `version: 1`. Newly initialized normal sessions add `curriculumVersion: 2`; returning sessions also store a stable `legacyUnlockedLessons` list.

For an unmarked old record, first replay and regrade its saved attempts against the unchanged ten-grammar view. Valid completion defines the old grammar frontier: completed grammar plus the next previously unlocked grammar lesson. Stored completed flags alone do not suffice. Then replay the full integrated course, retaining access to those grammar IDs while waiving only inserted vocabulary prerequisites for those IDs. Prior grammar completion and step guards still apply. All valid completed lessons, answers, wrong attempts, pending retries and accessible last location survive. New vocabulary earns no completion automatically.

Examples:

- New learner: to be → People & Feelings → Present Simple, and onward in all sixteen steps of the curriculum.
- Three grammar lessons completed: keep all three completions and access to have/has. Before going beyond that retained frontier to articles, finish People & Feelings and Daily Routines. Those vocabulary lessons can be backfilled without altering existing grammar scores.
- Ten grammar lessons completed: retain all ten and access to all their steps; show 10/16 complete. Complete six vocabulary lessons separately, in their applicable sequence, to reach 16/16.

The retained frontier does not expand automatically on later loads. Version-2 sessions do not gain legacy rights merely by completing more work. Reset creates a fresh integrated learner, through the existing explicit confirmation. New completions use catalog order; comparison ignores irrelevant object-key order so backfilling does not create a false recovery notice.

Migration is read-only on opening. The guarded storage session is unchanged: no mount-time rewrite, exact raw backup before the first migrated write, backup failure blocks replacement, stale tabs cannot overwrite newer data, denied initial reads remain memory-only and explicit resets retain backups. Theme keys are unchanged. Migration tests used Node mock storage; the user's actual Chrome storage was not read, reset or migrated. The browser full-course journey used a separate in-app browser origin at localhost, not the user's Chrome profile.

## Automated verification

| Executed check | Result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm test` | **304 passed, 0 failed, 0 skipped** (224 existing regression tests + 80 new tests) |
| `VITE_BASE_PATH=/greg-public-study/ npm run build` | Passed, including strict TypeScript and static QA exclusion verification |
| Production QA exclusion | All built HTML/JS/CSS contain no QA-only module, controls or storage keys; browser `?qa=1` cannot unlock lesson 16 |
| `git diff --check` | Passed |
| Grammar/protected-source baseline | Ten complete grammar entries deep-equal; ten grammar files, AGENTS, SPEC, grading and guarded storage hashes unchanged |

The existing exact 150-question grammar tests now use the named unchanged `grammarLessons` view; their answer oracles and assertions were retained, not relaxed. New integrated tests validate the actual 16-entry production registry, all 330 IDs, all six units, 112 steps, 48 batches, strict new-user unlocking, full completion/refresh, eleven legacy frontiers (0–10 grammar lessons complete) with partial mixed attempts and pending retry, retained access, backfill, raw backup behavior, QA isolation and disposable missed-word retrieval.

A new backfill round-trip assertion exposed a false `recovered` flag caused by map insertion order. Completion ordering and structural comparison were corrected; the final suite passes. Initial browser assertions after reload needed an explicit visible-element wait; saved results themselves were intact. These were resolved during implementation, not left as known failures.

## Executed browser verification

Supported CUA browser controls in the isolated in-app browser, using the existing servers. Evidence: `docs/qa/vocabulary-expansion/browser-results.json` and screenshots in the same directory.

- **280 rendering/layout checks:** 64 discovery/theory/exercise routes × widths 360/1280 × light/dark = 256; plus all six vocabulary discovery screens with every translation expanded × both widths/themes = 24. Exact viewport/theme and document width were checked. All 330 questions render in each matrix; exercises have one batch button, no initial feedback and no locked unanswered fields. All expanded translations match the authored inventory. No horizontal overflow found.
- **12 complete correction cycles:** three exercise types × two widths × two themes. Tested missing fields without attempts, no correctness before checking, 8 correct/2 incorrect, first-error focus, eight locked answers, retained editable errors, reload, unresolved-only correction, 10/10 completion, explicit Continue and keyboard Enter on written batches.
- Keyboard Enter opens a card translation; show all/hide all works. Four captured card layouts were visually inspected at 360/1280 in light/dark.
- Extra missed-word drill: two words, one wrong then corrected, correct lock, Enter submission, return to original mistake history and reload with original mistakes preserved.
- **Full normal production journey:** all 16 lessons and 330 questions completed through UI controls, without QA unlocking, at the separate `http://localhost:5173/greg-public-study/` in-app origin. Reloaded after every completed summary. First eight lessons used 360px/light; remaining eight used 1280px/dark. Final course shows **16/16 complete**, surviving another reload. This is a real sequential-flow check in disposable test storage, not the artificial QA completion scaffold.
- Production `?qa=1` showed no QA toolbar and kept lesson 16 locked before the normal journey.
- No warning/error console entries in the tested QA, visual and production tabs.

All 16 QA lessons remain open from an unanswered state; the only vocabulary lesson used for correction tests was cleared with its QA-only toolbar control after verification. Its normal learning data was not reset.

## Local QA handoff

**http://127.0.0.1:5175/?qa=1#/course/a1**

`npm run qa` reused the existing development server. Port 5173's existing preview server was left running too. No existing server was terminated or restarted. All sixteen lessons/112 steps are immediately accessible in development; the completion banner explicitly labels artificial access. Select a vocabulary lesson through “Открыть урок”, then use its step navigation. “Очистить ответы этого урока” clears only its QA answers and mistakes. Real progress/theme remain in separate keys from `gps.qa.progress.v1` / `gps.qa.theme.v1`.

The existing detached launcher remains available through `npm run qa` or `Start Local QA.command` if an external logout/restart/process cleanup stops the server. No OS startup service was installed.

## Files changed in this task

Created:

- `src/content/vocabulary/createVocabularyLesson.ts`
- `src/content/vocabulary/peopleFeelings.ts`
- `src/content/vocabulary/dailyRoutines.ts`
- `src/content/vocabulary/familyObjects.ts`
- `src/content/vocabulary/homePlaces.ts`
- `src/content/vocabulary/hobbiesAbilities.ts`
- `src/content/vocabulary/actionsTime.ts`
- `src/components/lessons/VocabularyDiscovery.tsx`
- `src/components/lessons/VocabularyReview.tsx`
- `src/lib/vocabularyReview.ts`
- `tests/vocabulary-expansion.test.mjs`
- This report and `docs/qa/vocabulary-expansion/` evidence.

Modified:

- `src/content/course.ts`, `src/types/lesson.ts`, `src/lib/validation.ts`, `src/lib/progress.ts`
- `src/components/lessons/LessonContent.tsx`
- `src/components/exercises/ExerciseQuestion.tsx`, `src/components/exercises/ExerciseStep.tsx`
- `src/pages/CoursePage.tsx`, `src/pages/LessonPage.tsx`, `src/styles/global.css`
- `src/dev/qa.tsx`, `src/dev/qaState.ts`
- Existing grammar regression test imports in `content`, `expansion`, `local-qa`, `progress-storage`, `batch-validation`, `exercise-ux` tests.
- `README.md`, `docs/LESSON_SCHEMA.md`.

The grammar lesson files were already modified at task start by earlier UX work and were not edited here. Other pre-existing untracked research, batch components, browser scripts and evidence were preserved. No package/lockfile, logo, assets, AGENTS or SPEC change; no new dependency installed. Ignored `dist/` was rebuilt; task baselines/logs remain in ignored `.tmp/vocabulary/`.

## Remaining limitations

- Audio pronunciation is absent, as described above. No unavailable audio is advertised.
- Optional extra review results and unsubmitted drafts are intentionally temporary; required checked attempts and earned progress persist. There is no spaced-repetition schedule or long-term mastery claim.
- Valid English synonyms/paraphrases outside the explicitly constrained taught-word/frame tasks are not general-purpose evaluated translations.
- Physical iOS/Android keyboards, Safari/Firefox, and a full screen-reader/conformance audit were not tested. Browser checks use CSS viewports and keyboard controls in the in-app browser.
- Actual user Chrome progress was not inspected or modified. Legacy preservation was verified with validated fixtures/mock storage, not destructive tests in a real profile.
- An older release does not understand retained-access metadata. Keep the raw migration backup for deliberate rollback; avoid writing the same origin from an older build after adopting this expansion. Existing simultaneous-tab writes are guarded but not automatically merged.

No implementation blocker remains. See the live release at https://megarediska22.github.io/greg-public-study/.
