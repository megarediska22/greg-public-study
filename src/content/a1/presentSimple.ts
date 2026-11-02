import type { Lesson } from '../../types/lesson.ts';

export const presentSimpleLesson: Lesson = {
  id: "present-simple", level: "A1", title: "Present Simple", sample: false,
  objectives: [
    "Рассказывать о регулярных действиях и привычках.",
    "Использовать начальную форму глагола с I, you, we и they.",
    "Добавлять -s, -es или -ies с he, she и it.",
    "Строить отрицания с don’t и doesn’t без лишнего -s.",
  ],
  steps: [
    { id: "intro", type: "intro", completion: "acknowledge", title: "Знакомство с уроком", description: "Что будем изучать",
      heading: "Что вы делаете каждый день?",
      text: "Для привычек и регулярных действий используем Present Simple. В этом уроке расскажем о работе, учёбе и отдыхе, а затем скажем, чего мы обычно не делаем. Вопросы с такими глаголами изучим в следующем уроке.",
      example: "I work at home. She works at home.", translation: "Я работаю дома. Она работает дома." },
    { id: "theory", type: "theory", completion: "acknowledge", title: "Теория", description: "Правило и примеры",
      heading: "Привычки и повседневные дела.",
      text: `Present Simple описывает обычные действия, привычки и предпочтения. Порядок слов: кто + действие + остальные слова. С I, you, we, they используйте начальную форму глагола: I work at home. — Я работаю дома. They play tennis. — Они играют в теннис. Часто добавляют every day — каждый день: We study English every day. — Мы учим английский каждый день.

С he, she, it в утверждениях к глаголу обычно добавляют -s: work → works, like → likes, play → plays. He likes coffee. — Он любит кофе. It works. — Это работает.

После -s, -sh, -ch, -x, -z обычно добавляют -es: watch → watches (смотреть), wash → washes (мыть). Запомните go → goes (ходить) и do → does (делать). Если перед конечной y стоит согласная, замените y на -ies: study → studies (учиться). После гласной y сохраняется, добавляется -s: play → plays (играть).

Отрицание с I, you, we, they: кто + do not + начальная форма глагола. I do not like coffee. = I don't like coffee. — Я не люблю кофе. They do not play tennis. = They don't play tennis. — Они не играют в теннис.

Отрицание с he, she, it: кто + does not + начальная форма глагола. She does not work at home. = She doesn't work at home. — Она не работает дома. He does not study English. = He doesn't study English. — Он не учит английский. Окончание -s/-es/-ies в отрицании исчезает: doesn't watch, doesn't go, doesn't study. Don't = do not; doesn't = does not.

Слова для практики: work — работать; study English — учить английский; watch TV — смотреть телевизор; play tennis — играть в теннис; like coffee — любить кофе; go to school — ходить в школу; at home — дома; every day — каждый день. She watches TV every day. — Она смотрит телевизор каждый день.

Глагол to be из первого урока подчиняется своему правилу: She isn't tired. — Она не устала. С обычным глаголом действия нужен don't или doesn't: She doesn't work. — Она не работает. Не добавляйте am/is/are к таким фразам.`,
      tableCaption: "Утверждения и отрицания в Present Simple", rows: [
        { subject: "I / You / We / They", form: "work", example: "We work at home.", translation: "Мы работаем дома." },
        { subject: "He / She / It", form: "works", example: "He works at home.", translation: "Он работает дома." },
        { subject: "She", form: "watches", example: "She watches TV.", translation: "Она смотрит телевизор." },
        { subject: "He", form: "studies", example: "He studies English.", translation: "Он учит английский." },
        { subject: "She", form: "plays", example: "She plays tennis.", translation: "Она играет в теннис." },
        { subject: "He", form: "goes", example: "He goes to school.", translation: "Он ходит в школу." },
        { subject: "I / You / We / They", form: "don't + work", example: "They don't work at home.", translation: "Они не работают дома." },
        { subject: "He / She / It", form: "doesn't + work", example: "She doesn't work at home.", translation: "Она не работает дома." },
      ], noteTitle: "Частые ошибки",
      note: "He works, а не He work. She watches, а не She watchs. He studies, а не He studys. В отрицании: She doesn't work, а не She doesn't works. С we используется don't, а не doesn't. Для «я работаю» говорите I work, а не I am work." },
    { id: "choice", type: "exercise", completion: "all-correct", title: "Выбор ответа", description: "Упражнение 1", questions: [
      { id: "ps-works", type: "choice", instruction: "Выберите форму: «Он работает дома»", prompt: "He ___ at home.", options: ["work", "works", "workes"], acceptedAnswers: ["works"], explanation: "С he в утверждении добавьте -s: He works at home. — Он работает дома." },
      { id: "ps-watches", type: "choice", instruction: "Выберите форму: «Она смотрит телевизор каждый день»", prompt: "She ___ TV every day.", options: ["watch", "watchs", "watches"], acceptedAnswers: ["watches"], explanation: "После -ch добавляется -es: watch → watches. She watches TV every day. — Она смотрит телевизор каждый день." },
      { id: "ps-studies", type: "choice", instruction: "Выберите форму: «Он учит английский»", prompt: "He ___ English.", options: ["studys", "studies", "study"], acceptedAnswers: ["studies"], explanation: "Перед y в study стоит согласная d. С he замените y на -ies: He studies English. — Он учит английский." },
      { id: "ps-plays", type: "choice", instruction: "Выберите форму: «Она играет в теннис»", prompt: "She ___ tennis.", options: ["plaies", "play", "plays"], acceptedAnswers: ["plays"], explanation: "В play перед y стоит гласная a, поэтому y сохраняется: play → plays. She plays tennis. — Она играет в теннис." },
      { id: "ps-goes", type: "choice", instruction: "Выберите форму: «Он ходит в школу»", prompt: "He ___ to school.", options: ["goes", "gos", "go"], acceptedAnswers: ["goes"], explanation: "Запомните go → goes с he, she, it: He goes to school. — Он ходит в школу." },
    ] },
    { id: "blank", type: "exercise", completion: "all-correct", title: "Пропуски", description: "Упражнение 2", questions: [
      { id: "ps-i-negative", type: "blank", instruction: "Вставьте do not или don't: «Я не люблю кофе»", prompt: "I ___ like coffee.", placeholder: "Введите отрицательную форму", acceptedAnswers: ["do not", "don't"], explanation: "С I используется do not или don't: I don't like coffee. — Я не люблю кофе. Like остаётся в начальной форме." },
      { id: "ps-she-negative", type: "blank", instruction: "Вставьте does not или doesn't: «Она не работает дома»", prompt: "She ___ work at home.", placeholder: "Введите отрицательную форму", acceptedAnswers: ["does not", "doesn't"], explanation: "С she нужна форма does not или doesn't. После неё work без -s: She doesn't work at home. — Она не работает дома." },
      { id: "ps-they-negative", type: "blank", instruction: "Вставьте do not или don't: «Они не играют в теннис»", prompt: "They ___ play tennis.", placeholder: "Введите отрицательную форму", acceptedAnswers: ["do not", "don't"], explanation: "С they используется don't: They don't play tennis. — Они не играют в теннис." },
      { id: "ps-study-base", type: "blank", instruction: "Вставьте правильную форму study: «Он не учит английский»", prompt: "He doesn't ___ English.", placeholder: "Введите форму глагола study", acceptedAnswers: ["study"], explanation: "После doesn't нужен study, а не studies: He doesn't study English. — Он не учит английский." },
      { id: "ps-we-base", type: "blank", instruction: "Вставьте правильную форму watch: «Мы смотрим телевизор»", prompt: "We ___ TV.", placeholder: "Введите форму глагола watch", acceptedAnswers: ["watch"], explanation: "С we в утверждении используется начальная форма: We watch TV. — Мы смотрим телевизор. Окончание -es здесь не нужно." },
    ] },
    { id: "sentence", type: "exercise", completion: "all-correct", title: "Составление фраз", description: "Упражнение 3", questions: [
      { id: "ps-work-sentence", type: "written", instruction: "Сделайте предложение отрицательным; сохраните остальные слова", prompt: "She works at home.", placeholder: "Напишите отрицательное предложение", acceptedAnswers: ["She does not work at home.", "She doesn't work at home."], explanation: "Добавьте does not или doesn't, уберите -s у works: She doesn't work at home. — Она не работает дома." },
      { id: "ps-play-sentence", type: "written", instruction: "Сделайте предложение отрицательным; можно использовать сокращение", prompt: "I play tennis.", placeholder: "Напишите отрицательное предложение", acceptedAnswers: ["I do not play tennis.", "I don't play tennis."], explanation: "С I используйте do not или don't: I don't play tennis. — Я не играю в теннис." },
      { id: "ps-study-sentence", type: "written", instruction: "Сделайте предложение отрицательным; сохраните остальные слова", prompt: "He studies English.", placeholder: "Напишите отрицательное предложение", acceptedAnswers: ["He does not study English.", "He doesn't study English."], explanation: "После doesn't возвращается начальная форма study: He doesn't study English. — Он не учит английский." },
      { id: "ps-watch-sentence", type: "written", instruction: "Сделайте предложение отрицательным; сохраните местоимение you", prompt: "You watch TV.", placeholder: "Напишите отрицательное предложение", acceptedAnswers: ["You do not watch TV.", "You don't watch TV."], explanation: "С you используется don't: You don't watch TV. — Ты не смотришь / вы не смотрите телевизор." },
      { id: "ps-go-sentence", type: "written", instruction: "Сделайте предложение отрицательным; сохраните остальные слова", prompt: "They go to school.", placeholder: "Напишите отрицательное предложение", acceptedAnswers: ["They do not go to school.", "They don't go to school."], explanation: "С they используйте do not или don't, затем go: They don't go to school. — Они не ходят в школу." },
    ] },
    { id: "review", type: "review", completion: "acknowledge", title: "Разбор ошибок", description: "Объяснения и повторение" },
    { id: "summary", type: "summary", completion: "acknowledge", title: "Итоги урока", description: "Ваш следующий шаг" },
  ],
};
