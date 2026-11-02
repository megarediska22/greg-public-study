import type { Lesson } from '../../src/types/lesson.ts';

// Phase 2 engine fixture only: three questions, not the Phase 3 curriculum.
export const sampleLesson: Lesson = {
  id: 'to-be', level: 'A1', title: 'Глагол to be', sample: true,
  objectives: ['Выбрать форму am для I.', 'Заполнить пропуск в отрицании.', 'Составить вопрос с are.'],
  steps: [
    { id: 'intro', type: 'intro', completion: 'acknowledge', title: 'Знакомство с уроком', description: 'Что будем изучать', heading: 'Начнём с «я». И научимся говорить больше.', text: 'Это демонстрационный урок: короткое правило и три вопроса для знакомства с учебным движком. Полный курс появится на следующем этапе.', example: 'I am a student.', translation: 'Я студент / студентка.' },
    { id: 'theory', type: 'theory', completion: 'acknowledge', title: 'Теория', description: 'Правило и примеры', heading: 'Три формы. Одно правило.', text: 'Форма to be зависит от того, о ком идёт речь. Для отрицания добавьте not после глагола. Для вопроса перенесите глагол перед подлежащим.', tableCaption: 'Формы to be в настоящем времени', noteTitle: 'Отрицание и вопрос', rows: [
      { subject: 'I', form: 'am', example: 'I am ready.', translation: 'Я готов / готова.' },
      { subject: 'He / She / It', form: 'is', example: 'She is here.', translation: 'Она здесь.' },
      { subject: 'You / We / They', form: 'are', example: 'You are ready.', translation: 'Ты готов / готова.' },
    ], note: 'Отрицание: I am not ready. = I’m not ready. (Я не готов / не готова.) Вопрос: Are you ready? (Ты готов / готова?)' },
    { id: 'choice', type: 'exercise', completion: 'all-correct', title: 'Выбор ответа', description: 'Упражнение 1', questions: [
      { id: 'choose-am', type: 'choice', instruction: 'Выберите форму глагола', prompt: 'I ___ ready.', options: ['am', 'is', 'are'], acceptedAnswers: ['am'], explanation: 'С местоимением I используется am: I am ready.' },
    ] },
    { id: 'blank', type: 'exercise', completion: 'all-correct', title: 'Пропуски', description: 'Упражнение 2', questions: [
      { id: 'negative-blank', type: 'blank', instruction: 'Вставьте am not или сокращённую форму: «Я не готов / не готова»', prompt: 'I ___ ready.', placeholder: 'Введите пропущенные слова', acceptedAnswers: ['am not', "'m not"], explanation: 'После I ставим am not. Можно использовать сокращение I’m not ready.' },
    ] },
    { id: 'sentence', type: 'exercise', completion: 'all-correct', title: 'Составление фраз', description: 'Упражнение 3', questions: [
      { id: 'ready-question', type: 'written', instruction: 'Преобразуйте утверждение в вопрос, сохранив все слова', prompt: 'You are ready.', placeholder: 'Напишите вопрос на английском', acceptedAnswers: ['Are you ready?'], explanation: 'В вопросе are ставится перед you: Are you ready? Регистр и знак в конце не влияют на проверку.' },
    ] },
    { id: 'review', type: 'review', completion: 'acknowledge', title: 'Разбор ошибок', description: 'Объяснения и повторение' },
    { id: 'summary', type: 'summary', completion: 'acknowledge', title: 'Итоги урока', description: 'Ваш следующий шаг' },
  ],
};
