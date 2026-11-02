import type { CourseEntry } from '../types/lesson';
import { toBeLesson } from './a1/toBe.ts';
import { presentSimpleLesson } from './a1/presentSimple.ts';
import { doDoesLesson } from './a1/doDoes.ts';
import { validateCourse } from '../lib/validation.ts';

// Catalog order defines prerequisites. Missing content is never treated as complete.
export const lessons: readonly CourseEntry[] = [
  { id: 'to-be', title: 'Глагол to be', subtitle: 'am / is / are', objective: 'Расскажите, кто вы, где находитесь и как себя чувствуете.', lesson: toBeLesson },
  { id: 'present-simple', title: 'Present Simple', subtitle: 'Утверждения и отрицания', objective: 'Говорите о привычках и повседневных делах.', lesson: presentSimpleLesson },
  { id: 'do-does', title: 'Вопросы в Present Simple', subtitle: 'do / does', objective: 'Задавайте вопросы и отвечайте коротко.', lesson: doDoesLesson },
];

validateCourse(lessons);
