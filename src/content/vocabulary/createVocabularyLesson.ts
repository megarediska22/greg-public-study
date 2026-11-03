import type { Lesson, VocabularyItem, Question } from '../../types/lesson.ts';

export type WordTask = VocabularyItem & {
  recallClue: string;
  contextClue: string;
  sentenceAnswers: readonly string[];
  spellingTip: string;
};
type VocabularyUnit = {
  id: string; title: string; goal: string; note: string; words: readonly WordTask[];
};

/** Authored words and constrained answers; presentation and grading stay generic. */
export function createVocabularyLesson(unit: VocabularyUnit): Lesson {
  const questions = (phase: 'recognize' | 'recall' | 'use'): Question[] => unit.words.map((word, index) => {
    const base = { id: `${unit.id}-${phase}-${word.id}`, vocabularyId: word.id };
    if (phase === 'recognize') {
      const distractors = [unit.words[(index + 3) % unit.words.length].meaningRu, unit.words[(index + 6) % unit.words.length].meaningRu];
      const options = [...distractors];
      const answerPositions = [1, 0, 2, 0, 2, 1, 2, 1, 0, 1];
      options.splice(answerPositions[index % answerPositions.length], 0, word.meaningRu);
      return { ...base, type: 'choice', instruction: 'Выберите значение слова из этого урока.', prompt: word.term, optionsLanguage: 'ru', options, acceptedAnswers: [word.meaningRu], explanation: `${word.term} — ${word.meaningRu}. ${word.example} — ${word.exampleTranslation}` };
    }
    if (phase === 'recall') return { ...base, type: 'blank', promptLanguage: 'ru', instruction: 'Вспомните слово или выражение из карточек. Напишите его целиком по-английски.', prompt: word.recallClue, placeholder: 'Слово или выражение на английском', acceptedAnswers: [word.term], explanation: `${word.term} — ${word.meaningRu}. ${word.spellingTip}` };
    return { ...base, type: 'written', promptLanguage: 'ru', instruction: 'Переведите фразу целиком. Используйте слово из карточек и указанный порядок слов; полные и сокращённые формы допустимы.', prompt: word.contextClue, placeholder: 'Предложение на английском', acceptedAnswers: word.sentenceAnswers, explanation: `${word.sentenceAnswers[0]} — ${word.exampleTranslation} ${word.usage ?? word.spellingTip}` };
  });
  return {
    id: unit.id, kind: 'vocabulary', level: 'A1', title: unit.title, sample: false,
    objectives: [unit.goal, 'Узнавать 10 слов и выражений, вспоминать их без подсказки и писать без ошибок.', 'Использовать новые слова в коротких фразах со знакомой грамматикой.'],
    steps: [
      { id: 'intro', type: 'intro', completion: 'acknowledge', title: 'Знакомство', description: 'Зачем нужны эти слова', heading: unit.title, text: `${unit.goal} Сначала познакомимся с десятью словами, затем узнаем их, вспомним написание и соберём фразы. Григорий и Наташа здесь — вымышленные герои примеров.`, example: unit.words[0].example, translation: unit.words[0].exampleTranslation },
      { id: 'words', type: 'vocabulary', completion: 'acknowledge', title: 'Знакомство со словами', description: '10 карточек с примерами', heading: 'Десять слов — маленький шаг вперёд.', text: 'Прочитайте слово и пример. Откройте перевод, затем попробуйте вспомнить его самостоятельно. Все значения можно показать сразу.', items: unit.words.map(({ id, term, partOfSpeech, meaningRu, example, exampleTranslation, usage }) => ({ id, term, partOfSpeech, meaningRu, example, exampleTranslation, ...(usage ? { usage } : {}) })), note: unit.note },
      { id: 'choice', type: 'exercise', completion: 'all-correct', title: 'Узнайте значение', description: '10 вопросов на узнавание', questions: questions('recognize') },
      { id: 'blank', type: 'exercise', completion: 'all-correct', title: 'Вспомните и напишите', description: '10 слов без банка ответов', questions: questions('recall') },
      { id: 'sentence', type: 'exercise', completion: 'all-correct', title: 'Слова в действии', description: '10 коротких фраз', questions: questions('use') },
      { id: 'review', type: 'review', completion: 'acknowledge', title: 'Разбор ошибок', description: 'Что стоит повторить' },
      { id: 'summary', type: 'summary', completion: 'acknowledge', title: 'Итоги', description: 'Слова и результаты' },
    ],
  };
}
