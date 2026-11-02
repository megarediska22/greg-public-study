import type { Lesson } from '../../types/lesson.ts';

export const doDoesLesson: Lesson = {
  id: "do-does", level: "A1", title: "Вопросы в Present Simple", sample: false,
  objectives: [
    "Выбирать do или does для вопроса.",
    "Соблюдать порядок слов и использовать начальную форму после does.",
    "Спрашивать о привычках, работе и предпочтениях.",
    "Давать короткие ответы и отличать вопросы с to be от вопросов с do/does.",
  ],
  steps: [
    { id: "intro", type: "intro", completion: "acknowledge", title: "Знакомство с уроком", description: "Что будем изучать",
      heading: "Теперь спросим собеседника.",
      text: "Вы уже умеете говорить о привычках и строить отрицания. Добавим вопросы: где человек работает, любит ли он кофе и играет ли в теннис. На вопросы «да или нет» научимся отвечать коротко.",
      example: "Do you like coffee? — Yes, I do.", translation: "Ты любишь кофе? — Да." },
    {
      "id": "theory",
      "type": "theory",
      "completion": "acknowledge",
      "title": "Теория",
      "description": "Правило и примеры",
      "heading": "Хотите спросить? Начните с do или does.",
      "text": "В вопросах о привычках и предпочтениях do или does выходит вперёд. Основной глагол остаётся без окончания.",
      "tableCaption": "Do или does? Посмотрите, о ком вопрос",
      "rows": [
        {
          "subject": "I / You / We / They",
          "form": "Do",
          "example": "Do you work at home?",
          "translation": "Ты работаешь дома?"
        },
        {
          "subject": "He / She / It",
          "form": "Does",
          "example": "Does Natasha like coffee?",
          "translation": "Наташа любит кофе?"
        }
      ],
      "blocks": [
        {
          "title": "Соберите вопрос по порядку",
          "text": "После does уберите -s/-es/-ies: watches → watch, studies → study. Имя заменяется местоимением: Natasha = she.",
          "formula": "Do/Does + кто + глагол без окончания + остальное?"
        },
        {
          "title": "Ответьте «да» или «нет»",
          "text": "В коротком ответе повторите местоимение и do/does, без основного глагола. На вопрос с you о себе отвечайте с I.",
          "example": "Yes, I do. / No, I do not. = No, I don't.\nYes, she does. / No, she does not. = No, she doesn't.",
          "translation": "Да. / Нет. Первая строка — о себе, вторая — о ней."
        },
        {
          "title": "А если нужно узнать больше?",
          "text": "Where — где или куда; What — что. Поставьте это слово перед do/does.",
          "formula": "Where/What + do/does + кто + глагол + остальное?",
          "example": "Where does Gregory work?",
          "translation": "Где работает Грегори?"
        }
      ],
      "noteTitle": "Не путайте с to be",
      "note": "С am/is/are вопрос строится без do/does: Are you tired? — Ты устал / устала? С обычным глаголом: Do you work? — Ты работаешь? Правильно Does she like…?, а не Does she likes…?"
    },
    { id: "choice", type: "exercise", completion: "all-correct", title: "Выбор ответа", description: "Упражнение 1", questions: [
      { id: "dd-you", type: "choice", instruction: "Выберите do или does: «Ты любишь кофе?»", prompt: "___ you like coffee?", options: ["Do", "Does"], acceptedAnswers: ["Do"], explanation: "С you используется do: Do you like coffee? — Ты любишь кофе?" },
      { id: "dd-she", type: "choice", instruction: "Выберите do или does: «Она работает дома?»", prompt: "___ she work at home?", options: ["Do", "Does"], acceptedAnswers: ["Does"], explanation: "С she используется does: Does she work at home? — Она работает дома? Work остаётся без -s." },
      { id: "dd-they", type: "choice", instruction: "Выберите do или does: «Они играют в теннис?»", prompt: "___ they play tennis?", options: ["Do", "Does"], acceptedAnswers: ["Do"], explanation: "С they используется do: Do they play tennis? — Они играют в теннис?" },
      { id: "dd-he", type: "choice", instruction: "Выберите do или does: «Он учит английский?»", prompt: "___ he study English?", options: ["Do", "Does"], acceptedAnswers: ["Does"], explanation: "С he используется does: Does he study English? — Он учит английский? После does нужен study, а не studies." },
      { id: "dd-we", type: "choice", instruction: "Выберите do или does: «Мы ходим в школу?»", prompt: "___ we go to school?", options: ["Do", "Does"], acceptedAnswers: ["Do"], explanation: "С we используется do: Do we go to school? — Мы ходим в школу?" },
    ] },
    { id: "blank", type: "exercise", completion: "all-correct", title: "Пропуски", description: "Упражнение 2", questions: [
      { id: "dd-like-base", type: "blank", instruction: "Вставьте правильную форму like: «Она любит кофе?»", prompt: "Does she ___ coffee?", placeholder: "Введите форму глагола like", acceptedAnswers: ["like"], explanation: "После does нужна начальная форма like: Does she like coffee? — Она любит кофе? Окончание -s не добавляется." },
      { id: "dd-i-short", type: "blank", instruction: "Дополните короткий ответ о себе словом do или does", prompt: "Do you work at home? — Yes, I ___.", placeholder: "Введите одно слово", acceptedAnswers: ["do"], explanation: "На вопрос Do you…? о себе отвечаем Yes, I do. — Да. Местоимение you меняется на I." },
      { id: "dd-she-short", type: "blank", instruction: "Вставьте does not или doesn't в отрицательный короткий ответ", prompt: "Does she play tennis? — No, she ___.", placeholder: "Введите отрицательную форму", acceptedAnswers: ["does not", "doesn't"], explanation: "С she используйте does not или doesn't: No, she doesn't. — Нет. Основной глагол play в коротком ответе не повторяется." },
      { id: "dd-where", type: "blank", instruction: "Вставьте do или does: «Где он работает?»", prompt: "Where ___ he work?", placeholder: "Введите одно слово", acceptedAnswers: ["does"], explanation: "Where стоит первым, затем does для he: Where does he work? — Где он работает?" },
      { id: "dd-be-difference", type: "blank", instruction: "Вставьте Am, Is или Are: «Ты устал / устала?»", prompt: "___ you tired?", placeholder: "Введите форму to be", acceptedAnswers: ["Are"], explanation: "Tired описывает состояние, поэтому нужен to be: Are you tired? — Ты устал / устала? Do/does здесь не используется." },
    ] },
    { id: "sentence", type: "exercise", completion: "all-correct", title: "Составление фраз", description: "Упражнение 3", questions: [
      { id: "dd-work-question", type: "written", instruction: "Сделайте общий вопрос с do/does; сохраните местоимение you", prompt: "You work at home.", placeholder: "Напишите вопрос на английском", acceptedAnswers: ["Do you work at home?"], explanation: "Поставьте Do перед you: Do you work at home? — Ты работаешь дома? Порядок: Do + you + work + at home." },
      { id: "dd-watch-question", type: "written", instruction: "Сделайте общий вопрос с do/does; сохраните остальные слова", prompt: "She watches TV.", placeholder: "Напишите вопрос на английском", acceptedAnswers: ["Does she watch TV?"], explanation: "С she нужен Does; watches замените на watch: Does she watch TV? — Она смотрит телевизор?" },
      { id: "dd-study-question", type: "written", instruction: "Сделайте общий вопрос с do/does; сохраните остальные слова", prompt: "He studies English.", placeholder: "Напишите вопрос на английском", acceptedAnswers: ["Does he study English?"], explanation: "Поставьте Does перед he, используйте study: Does he study English? — Он учит английский?" },
      { id: "dd-he-negative-answer", type: "written", instruction: "Дайте короткий отрицательный ответ с No, he…", prompt: "Does he like coffee?", placeholder: "Напишите короткий ответ", acceptedAnswers: ["No, he does not.", "No, he doesn't.", "No he does not.", "No he doesn't."], explanation: "На Does he…? отрицательный короткий ответ: No, he does not. = No, he doesn't. — Нет. Like повторять не нужно; запятая необязательна для проверки." },
      { id: "dd-they-positive-answer", type: "written", instruction: "Дайте короткий утвердительный ответ с Yes, they…", prompt: "Do they go to school?", placeholder: "Напишите короткий ответ", acceptedAnswers: ["Yes, they do.", "Yes they do."], explanation: "На Do they…? утвердительный короткий ответ: Yes, they do. — Да. Go в коротком ответе не повторяется; запятая необязательна для проверки." },
    ] },
    { id: "review", type: "review", completion: "acknowledge", title: "Разбор ошибок", description: "Объяснения и повторение" },
    { id: "summary", type: "summary", completion: "acknowledge", title: "Итоги урока", description: "Ваш следующий шаг" },
  ],
};
