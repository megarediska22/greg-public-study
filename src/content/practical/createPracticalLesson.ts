import type { Lesson } from '../../types/lesson.ts';
import { createVocabularyLesson, type WordTask } from '../vocabulary/createVocabularyLesson.ts';

export type PracticalExpression = WordTask & {
  recallAnswers?: readonly string[];
  contextTranslation: string;
};
type PracticalUnit = {
  id: string; title: string; goal: string; note: string;
  dialogue: string; dialogueTranslation: string;
  words: readonly PracticalExpression[];
};

/** Content-only adaptation: existing cards, question types, batch UI and grader. */
export function createPracticalLesson(unit: PracticalUnit): Lesson {
  const base = createVocabularyLesson(unit);
  return { ...base, objectives: [unit.goal, 'Узнавать 10 выражений в контексте и вспоминать их без банка ответов.', 'Подбирать короткую реплику для знакомой ситуации и разбирать свои ошибки.'], steps: base.steps.map(step => {
    if (step.type === 'intro') return { ...step, text: `${unit.goal} Здесь тренируем небольшие реплики, которые можно использовать сразу. Григорий и Наташа — вымышленные герои диалогов.`, example: unit.dialogue, translation: unit.dialogueTranslation };
    if (step.type === 'vocabulary') return { ...step, heading: 'Десять выражений для живого разговора.', text: 'Прочитайте мини-диалог и подсказку к выражению. Откройте перевод, затем попробуйте произнести реплику сами. В практике пишите выражение из карточек; это задания с заданным ответом, а не свободный перевод.' };
    if (step.type !== 'exercise') return step;
    return { ...step, questions: step.questions.map((question, index) => {
      const word = unit.words[index];
      if (question.type === 'choice') return { ...question, instruction: `Что означает «${word.term}» в этом примере?`, prompt: word.example };
      if (question.type === 'blank') return { ...question, normalization: { ignoreTerminalPunctuation: true }, acceptedAnswers: word.recallAnswers ?? [word.term] };
      return { ...question, instruction: 'Ответьте в ситуации по-английски. Напишите реплику целиком, используя выражение из карточек и указанный шаблон.', explanation: `${word.sentenceAnswers[0]} — ${word.contextTranslation} ${word.usage}` };
    }) };
  }) };
}
