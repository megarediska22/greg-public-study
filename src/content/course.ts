import type { CourseEntry } from '../types/lesson';
import { toBeLesson } from './a1/toBe.ts';
import { presentSimpleLesson } from './a1/presentSimple.ts';
import { doDoesLesson } from './a1/doDoes.ts';
import { haveHasLesson } from './a1/haveHas.ts';
import { articlesLesson } from './a1/articles.ts';
import { demonstrativesLesson } from './a1/demonstratives.ts';
import { thereIsAreLesson } from './a1/thereIsAre.ts';
import { canCantLesson } from './a1/canCant.ts';
import { presentContinuousLesson } from './a1/presentContinuous.ts';
import { wasWereLesson } from './a1/wasWere.ts';
import { validateCourse } from '../lib/validation.ts';

// Catalog order defines prerequisites. Missing content is never treated as complete.
export const lessons: readonly CourseEntry[] = [
  { id: 'to-be', title: 'Глагол to be', subtitle: 'am / is / are', objective: 'Расскажите, кто вы, где находитесь и как себя чувствуете.', lesson: toBeLesson },
  { id: 'present-simple', title: 'Present Simple', subtitle: 'Утверждения и отрицания', objective: 'Говорите о привычках и повседневных делах.', lesson: presentSimpleLesson },
  { id: 'do-does', title: 'Вопросы в Present Simple', subtitle: 'do / does', objective: 'Задавайте вопросы и отвечайте коротко.', lesson: doDoesLesson },
  { id: 'have-has', title: 'Что у нас есть', subtitle: 'have / has', objective: 'Расскажите о вещах и спросите, что есть у других.', lesson: haveHasLesson },
  { id: 'articles', title: 'Артикли', subtitle: 'a / an / the', objective: 'Различайте любой предмет и тот самый.', lesson: articlesLesson },
  { id: 'demonstratives', title: 'Это или то?', subtitle: 'this / that / these / those', objective: 'Показывайте на один или несколько предметов рядом и вдали.', lesson: demonstrativesLesson },
  { id: 'there-is-are', title: 'Что вокруг', subtitle: 'there is / there are', objective: 'Опишите комнату и узнайте, что в ней есть.', lesson: thereIsAreLesson },
  { id: 'can-cant', title: 'Что мы умеем', subtitle: 'can / can’t', objective: 'Говорите об умениях и возможностях.', lesson: canCantLesson },
  { id: 'present-continuous', title: 'Прямо сейчас', subtitle: 'Present Continuous', objective: 'Расскажите о действиях, которые происходят сейчас.', lesson: presentContinuousLesson },
  { id: 'was-were', title: 'Что было вчера', subtitle: 'was / were', objective: 'Расскажите, где вы были и как себя чувствовали в прошлом.', lesson: wasWereLesson },
];

validateCourse(lessons);

export const questionCount = lessons.reduce((total, entry) => total + (entry.lesson?.steps.reduce((count, step) => count + (step.type === 'exercise' ? step.questions.length : 0), 0) ?? 0), 0);
