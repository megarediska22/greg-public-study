# Greg Public Study — Final MVP Technical Specification

**Version:** 1.0  
**Status:** Approved for implementation planning  
**Product:** Greg Public Study  
**Type:** Free interactive English-learning website  
**Deployment target:** GitHub Pages  
**Initial audience:** Creator and approximately 10 other learners  
**Initial curriculum:** Three complete CEFR A1 lessons

---

## 1. Product vision

Develop Greg Public Study as a polished, responsive, publicly accessible English-learning platform.

The website should allow learners to study grammar through short written explanations, examples, structured exercises, immediate feedback, and visible progress.

The user experience should resemble the general learning flow shown in the supplied BAD School screenshots, while maintaining an original visual identity based on the Greg Public Study logo.

The application must be designed for gradual expansion to CEFR A2, B1, and B2 without substantial architectural changes.

The first release must be a functional educational product, not a decorative prototype.

### Main requirements

- Public access without registration.
- Russian-language user interface.
- English-learning content with Russian explanations.
- Sequential lesson progression.
- Reusable interactive exercise engine.
- Persistent progress in the local browser.
- Complete light and dark themes.
- Responsive layouts.
- Static hosting on GitHub Pages.
- No backend, paid APIs, or database.

---

## 2. Reference materials and brand assets

The following assets will be supplied in the working project:

- `assets/brand/greg-public-study-logo.png`
- `assets/references/01-lesson-introduction.png`
- `assets/references/02-theory.png`
- `assets/references/03-multiple-choice.png`
- `assets/references/04-form-selection.png`
- `assets/references/05-written-answers.png`
- `assets/references/06-navigation.png`

These names describe the expected local asset structure. Inspect actual files before referencing them; do not assume files exist merely because they are listed here.

### Reference usage

The screenshots demonstrate:

- Lesson title and progress bar.
- Left-hand step navigation.
- Central lesson content.
- Rounded exercise cards.
- Multiple-choice questions.
- Text-input questions.
- Answer checking and feedback.
- Completed-state indicators.
- Previous/Next navigation.
- Written grammar summaries.

Use these as interaction and layout references. Do not copy BAD School's branding, illustrations, proprietary content, or distinctive assets.

Reference website URLs, for optional context only:

- https://bad.school/#about
- https://bad.school/blog/

Do not depend on these sites being accessible. The uploaded screenshots are sufficient for the core UI requirements.

### Official branding

Use the supplied Greg Public Study logo without distortion or redesign.

The original logo includes orange and white lettering. Preserve its appearance and ensure that it is readable in both themes. A dark brand container is acceptable when needed for contrast.

---

## 3. Complete visual design system

Implement a token-based design system with two first-class themes.

### 3.1 Light theme

| Token | Value |
|---|---|
| Page background | `#F7F7F7` |
| Primary surface | `#FFFFFF` |
| Secondary surface | `#F5F5F5` |
| Primary text | `#171717` |
| Muted text | `#626262` |
| Border | `#E5E5E5` |
| Orange accent | `#F4511E` |
| Success | `#16803D` |
| Error | `#C62828` |

The light theme should feel spacious, clean, and comfortable for long reading sessions.

### 3.2 Dark theme

| Token | Value |
|---|---|
| Page background | `#121212` |
| Primary surface | `#1E1E1E` |
| Secondary surface | `#292929` |
| Primary text | `#F5F5F5` |
| Muted text | `#AAAAAA` |
| Border | `#383838` |
| Orange accent | `#FF693B` |
| Success | `#4ADE80` |
| Error | `#FF6B6B` |

The dark theme must use charcoal and graphite surfaces rather than a simple inversion of the light theme.

Use component-specific foreground colors where needed to maintain accessible contrast, particularly on orange, red, and green backgrounds.

### 3.3 Theme behavior

- Provide a visible light/dark theme toggle in the header.
- Default to light mode for first-time visitors.
- Persist the chosen theme in `localStorage`.
- Restore the selected theme before the main interface becomes visible.
- Avoid flashing the wrong theme during page load.
- Apply theme tokens to all pages, navigation, exercise cards, dialogs, buttons, progress indicators, and feedback messages.
- Support keyboard focus, hover, selected, disabled, success, and error states.
- Ensure all important text and controls meet WCAG AA contrast targets.

### 3.4 Typography and components

- Use readable sans-serif typography.
- Maintain a clear heading hierarchy.
- Use comfortable line spacing for theory sections.
- Use rounded content cards and restrained borders.
- Use subtle transitions and respect reduced-motion preferences.
- Avoid excessive shadows, gradients, animations, and visual clutter.
- Maintain consistent spacing across all screens.

---

## 4. Technical stack

Use:

- React.
- TypeScript in strict mode.
- Vite.
- CSS variables with plain CSS or CSS Modules.
- Structured JSON or typed content files.
- Browser `localStorage`.
- GitHub Actions for static deployment preparation.

Use minimal dependencies.

Do not implement a backend, database, authentication provider, CMS, analytics platform, or paid AI API.

The application must run as static files.

### Routing

Choose a routing strategy compatible with GitHub Pages repository subpaths.

A hash-based router is acceptable and may be preferred for reliable direct navigation without server-side rewrite rules.

Support a configurable Vite base path.

---

## 5. Site structure

### 5.1 Home page

Include:

- Greg Public Study logo and navigation.
- Clear product description.
- Level cards for A1, A2, B1, and B2.
- A1 marked as available.
- A2–B2 marked as upcoming.
- Start Learning button for new learners.
- Continue Learning button for returning learners.
- Theme switcher.
- Simple footer.

Do not imply that unavailable levels already contain lessons.

### 5.2 Course page — A1

Display three lessons in the following order:

1. **Verb to be — am / is / are**
2. **Present Simple — statements and negatives**
3. **Present Simple — questions with do / does**

Each lesson card must display:

- Number and title.
- Short learning objective.
- Status: locked, available, in progress, or completed.
- Progress indicator where appropriate.

Only Lesson 1 is available initially. Completing a lesson unlocks the next.

Completed lessons remain accessible.

### 5.3 Lesson page

Desktop layout:

- Header with brand and theme switcher.
- Back-to-course navigation.
- Lesson title and overall progress.
- Left sidebar showing ordered steps.
- Main content panel.
- Previous/Next navigation.
- Clearly distinguish locked, active, and completed steps.

Mobile layout:

- Single-column presentation.
- Compact step navigation or collapsible step list.
- Touch-friendly answer controls.
- Full-width readable content.
- No horizontal overflow.
- No hidden essential controls.

---

## 6. Sequential learning flow

Each lesson should contain:

1. **Introduction:** Learning goals and context.
2. **Theory:** Written explanations, examples, and reference tables.
3. **Exercise 1:** Multiple-choice questions.
4. **Exercise 2:** Fill-in-the-blank questions.
5. **Exercise 3:** Sentence transformation or construction.
6. **Mistake review:** Feedback and explanations.
7. **Final summary:** Scores, completion state, and next action.

No video step is required.

### Progression rules

- Complete the current step to unlock the next.
- Previously completed steps may be revisited.
- Clicking Next without completing required exercises must not falsely mark the step complete.
- Wrong answers should produce explanations and retry options.
- A learner must not become permanently blocked by an incorrect answer.
- The final summary becomes available after completing the required practice.
- Completing a lesson unlocks the next lesson.
- Revisiting a completed lesson must not erase previously earned completion status.

---

## 7. Lesson content requirements

Create three complete, original A1 lessons.

Each lesson must contain:

- Learning objectives.
- Russian-language theory.
- Natural American English examples.
- Russian translations.
- At least one grammar reference table.
- Common mistakes.
- Three exercise sections.
- At least five questions per exercise section.
- At least 15 questions per lesson.
- Correct answer keys.
- Accepted alternatives where relevant.
- Feedback and explanations.
- Final lesson summary.

Total MVP minimum: **45 interactive questions across three lessons**.

### 7.1 Lesson 1 — Verb to be

Teach:

- I am.
- You / We / They are.
- He / She / It is.
- Affirmative statements.
- Negative statements.
- Questions using inversion.
- Common contractions.
- Basic short answers.

Exercises:

- Choose am/is/are.
- Form negative sentences.
- Transform statements into questions.

### 7.2 Lesson 2 — Present Simple statements and negatives

Teach:

- Basic affirmative sentence structure.
- Third-person singular -s and -es.
- Common spelling rules.
- Don't and doesn't.
- Base verb after doesn't.
- Everyday habits and routines.

Exercises:

- Choose correct verb forms.
- Fill in negative sentences.
- Transform affirmative statements into negatives.

### 7.3 Lesson 3 — Present Simple questions

Teach:

- Do with I/you/we/they.
- Does with he/she/it.
- Base verb after does.
- Yes/no questions.
- Short answers.
- Basic question words.
- Difference between questions with to be and do/does.

Exercises:

- Select do or does.
- Transform statements into questions.
- Complete short answers or correct grammatical errors.

### Educational quality rules

- Use appropriate A1 vocabulary.
- Explain grammatical concepts before testing them.
- Avoid confusing or misleading examples.
- Avoid ambiguous questions.
- Validate answer keys against explanations.
- Accept reasonable contracted and uncontracted forms where configured.
- Do not mark a valid alternative as incorrect simply because of minor punctuation or capitalization differences.

---

## 8. Exercise engine

Build reusable exercise components driven by structured lesson data.

### 8.1 Single choice

- Present a question and several options.
- Exactly one intended correct answer.
- Clear selected state.
- Submit/check action.
- Feedback after submission.

### 8.2 Fill in the blank

- Provide text input.
- Ignore leading/trailing spaces.
- Normalize repeated whitespace.
- Ignore capitalization when appropriate.
- Support accepted answer variants.

### 8.3 Sentence transformation

- Let the learner enter a complete sentence.
- Normalize harmless punctuation differences.
- Support straight and curly apostrophes.
- Accept configured equivalent forms.
- Show a reference answer and explanation.

### Grading limitations

Use deterministic grading only.

Do not pretend to provide general AI-powered assessment of arbitrary English sentences.

Where an exercise permits many valid formulations, constrain the prompt sufficiently or use a reference-answer approach rather than falsely rejecting correct responses.

Keep grading logic separate from React components.

---

## 9. Feedback and error review

After checking an exercise:

- Clearly identify correct and incorrect answers.
- Show explanations for mistakes.
- Allow retrying.
- Preserve scores and attempt history where appropriate.
- Provide an exercise-level score.
- Provide a final lesson summary.

Do not communicate correctness using color alone. Include text or icons.

---

## 10. Progress persistence

Use a versioned local progress schema.

Store:

- Completed lessons.
- Completed lesson steps.
- Exercise scores and attempts.
- Last visited lesson and step.
- Selected theme.

Requirements:

- Progress survives refresh and browser restart.
- Handle missing or malformed stored data safely.
- Adding future lessons must not corrupt existing progress.
- Provide a Reset Progress option with confirmation.
- Explain that progress is stored locally and will not synchronize across devices.
- Never upload learner progress to a remote server.

---

## 11. Extensible content architecture

Separate lesson content from application logic.

Suggested structure:

```text
greg-public-study/
├── public/
│   └── assets/
│       └── logo.png
├── assets/
│   ├── brand/
│   └── references/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   ├── lessons/
│   │   └── exercises/
│   ├── pages/
│   ├── content/
│   │   └── a1/
│   │       ├── to-be.json
│   │       ├── present-simple.json
│   │       └── do-does.json
│   ├── types/
│   ├── lib/
│   │   ├── grading.ts
│   │   ├── progress.ts
│   │   └── validation.ts
│   ├── styles/
│   └── App.tsx
├── .github/
│   └── workflows/
├── SPEC.md
├── README.md
└── package.json
```

This is a suggested architecture, not a requirement to create unused folders.

Define a documented lesson schema containing:

- Lesson ID.
- CEFR level.
- Lesson title.
- Learning objectives.
- Ordered steps.
- Theory sections.
- Exercise type.
- Question ID.
- Prompt.
- Answer options, if applicable.
- Accepted answers.
- Explanations.
- Completion requirements.

Implement content validation with meaningful development-time errors.

Document how to add new lessons and levels.

---

## 12. Accessibility and responsive behavior

- Use semantic HTML.
- Label all form controls.
- Provide visible keyboard focus.
- Support keyboard-only navigation.
- Ensure adequate contrast in both themes.
- Use sufficiently large touch targets.
- Respect reduced-motion preferences.
- Support common mobile widths from approximately 360 CSS pixels.
- Avoid horizontal scrolling caused by content overflow.
- Test long text, multiple-choice options, and input fields on small screens.

---

## 13. GitHub Pages compatibility

The project must support static deployment to GitHub Pages.

- Configure production asset paths correctly.
- Ensure navigation works under a repository subpath.
- Prepare a GitHub Actions workflow or clear deployment instructions.
- Do not embed secrets in frontend assets.
- Do not require a custom domain.
- Do not create or modify unrelated repositories.

**Do not push, publish, create a GitHub repository, or change GitHub Pages settings without explicit user approval.**

---

## 14. Testing requirements

Implement unit tests for:

- Answer normalization.
- Accepted answer variants.
- Exercise grading.
- Sequential step unlocking.
- Lesson unlocking.
- Progress persistence.
- Corrupted saved-data handling.

Verify manually or through available browser tests:

- Home page.
- A1 course page.
- All three lessons.
- Correct and incorrect answers.
- Retry behavior.
- Final summaries.
- Light and dark themes.
- Theme persistence.
- Mobile responsiveness.
- Logo visibility.
- Navigation after refresh.
- Production build.

Never report a test as passed unless it was actually executed.

---

## 15. Explicit exclusions

Do not implement:

- Registration or login.
- Backend.
- Database.
- Cross-device synchronization.
- AI tutor.
- Paid APIs.
- Video lessons.
- Chat or messaging.
- Leaderboards.
- Payments.
- Notifications.
- Full A2–B2 content.
- Complex gamification.
- Unnecessary tracking or analytics.

These may be considered in future versions.

---

## 16. Efficiency and agent-operation constraints

The implementation must minimize unnecessary agent actions without sacrificing correctness.

- Inspect the existing workspace before creating files.
- Confirm that the logo and references are accessible.
- Reuse installed tools when possible.
- Do not install extra agent skills unless essential.
- Do not change operating-system configuration.
- Do not initiate GitHub OAuth or CLI authentication without approval.
- Do not repeatedly retry a failed operation without diagnosing the cause.
- If the same operation fails twice for the same reason, stop and explain the blocker.
- Do not run unrelated web research.
- Avoid unnecessary dependencies.
- Do not introduce infrastructure outside the agreed MVP.
- Do not change unrelated repositories or files.
- Do not repeatedly run unchanged builds or tests without a reason.
- Report actual limitations and failures.

---

## 17. Implementation phases

### Phase 1 — Application foundation and visual system

Build:

- React/TypeScript/Vite project.
- Light and dark themes.
- Shared layout and navigation.
- Home page.
- A1 course page.
- Lesson page layout.
- Responsive step sidebar.
- Reusable cards and controls.
- GitHub Pages-compatible routing.
- Visual placeholders for future lesson data.

Run build and type checks.

**Stop after Phase 1 and wait for approval.**

### Phase 2 — Learning engine

Build:

- Lesson content schema.
- Sequential progression.
- Reusable exercise components.
- Deterministic grading.
- Feedback and retry system.
- Local progress persistence.
- Automated tests.

Run relevant checks and stop for review.

### Phase 3 — Content, quality assurance, and deployment readiness

Build:

- Three complete A1 lessons.
- At least 45 questions.
- Final summaries.
- Content validation.
- Accessibility improvements.
- Full learner-journey testing.
- Production build verification.
- Deployment documentation.

Do not publish without explicit approval.

---

## 18. Definition of done

The MVP is accepted when a learner can:

1. Open the public-ready application.
2. View the Greg Public Study branding.
3. Choose the A1 course.
4. Start the first unlocked lesson.
5. Read explanations.
6. Complete interactive exercises.
7. Receive useful feedback.
8. Review and retry mistakes.
9. Complete a lesson.
10. Unlock the next lesson.
11. Return later without losing progress.
12. Switch between light and dark themes.
13. Use the platform comfortably on desktop and mobile.
14. Complete all three lessons successfully.

The website must be ready for static deployment on GitHub Pages.

---

## 19. First execution instruction to Codex

**Execute Phase 1 only.**

Before editing, briefly report:

- Current project directory.
- Available reference files.
- Availability of the official logo.
- Chosen routing approach.
- Any blocking questions.

Then implement Phase 1.

Run the relevant build and type checks.

At the end, provide:

- Summary of implemented features.
- Files created or modified.
- Tests actually run.
- Remaining issues.
- Suggested next step.
- Confirmation that no deployment or remote push occurred.

Do not start Phase 2 or Phase 3 until the user approves.