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
    {
      "id": "theory",
      "type": "theory",
      "completion": "acknowledge",
      "title": "Теория",
      "description": "Правило и примеры",
      "heading": "О том, что бывает обычно.",
      "text": "Работа, привычки, любимый кофе — это Present Simple. Сначала говорим кто, затем — что делает.",
      "tableCaption": "В утверждении окончание зависит от того, кто действует",
      "rows": [
        {
          "subject": "I / You / We / They",
          "form": "work",
          "example": "I work at home.",
          "translation": "Я работаю дома."
        },
        {
          "subject": "He / She / It",
          "form": "works",
          "example": "Gregory works every day.",
          "translation": "Григорий работает каждый день."
        }
      ],
      "blocks": [
        {
          "title": "С he, she, it добавьте окончание",
          "text": "Обычно добавляем -s. Имя одного человека работает так же: Gregory = he, Natasha = she.",
          "formula": "work → works · like → likes"
        },
        {
          "title": "Три подсказки для написания",
          "text": "После -s, -sh, -ch, -x, -z добавляем -es. Согласная + y: меняем y на -ies. Гласная + y: сохраняем y и добавляем -s. Запомните go → goes; do → does.",
          "formula": "watch → watches · study → studies · play → plays"
        },
        {
          "title": "Чтобы сказать «не»",
          "text": "С I, you, we, they используйте do not = don’t. С he, she, it — does not = doesn’t.",
          "formula": "Кто + don’t/doesn’t + глагол без окончания",
          "example": "Natasha doesn't like coffee.",
          "translation": "Наташа не любит кофе."
        },
        {
          "title": "Слова для практики",
          "text": "work — работать; like — любить; watch TV — смотреть телевизор; study English — учить английский; play tennis — играть в теннис; go to school — ходить в школу; every day — каждый день."
        }
      ],
      "noteTitle": "Doesn’t забирает окончание себе",
      "note": "She works → She doesn’t work. He studies → He doesn’t study. После doesn’t нужен глагол без -s/-es/-ies. Не добавляйте am/is/are: I work, а не I am work."
    },
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
      { id: "ps-work-sentence", type: "written", sentenceType: "negative", instruction: "Сделайте предложение отрицательным; сохраните остальные слова", prompt: "She works at home.", placeholder: "Напишите отрицательное предложение", acceptedAnswers: ["She does not work at home.", "She doesn't work at home."], explanation: "Добавьте does not или doesn't, уберите -s у works: She doesn't work at home. — Она не работает дома." },
      { id: "ps-play-sentence", type: "written", sentenceType: "negative", instruction: "Сделайте предложение отрицательным; можно использовать сокращение", prompt: "I play tennis.", placeholder: "Напишите отрицательное предложение", acceptedAnswers: ["I do not play tennis.", "I don't play tennis."], explanation: "С I используйте do not или don't: I don't play tennis. — Я не играю в теннис." },
      { id: "ps-study-sentence", type: "written", sentenceType: "negative", instruction: "Сделайте предложение отрицательным; сохраните остальные слова", prompt: "He studies English.", placeholder: "Напишите отрицательное предложение", acceptedAnswers: ["He does not study English.", "He doesn't study English."], explanation: "После doesn't возвращается начальная форма study: He doesn't study English. — Он не учит английский." },
      { id: "ps-watch-sentence", type: "written", sentenceType: "negative", instruction: "Сделайте предложение отрицательным; сохраните местоимение you", prompt: "You watch TV.", placeholder: "Напишите отрицательное предложение", acceptedAnswers: ["You do not watch TV.", "You don't watch TV."], explanation: "С you используется don't: You don't watch TV. — Ты не смотришь / вы не смотрите телевизор." },
      { id: "ps-go-sentence", type: "written", sentenceType: "negative", instruction: "Сделайте предложение отрицательным; сохраните остальные слова", prompt: "They go to school.", placeholder: "Напишите отрицательное предложение", acceptedAnswers: ["They do not go to school.", "They don't go to school."], explanation: "С they используйте do not или don't, затем go: They don't go to school. — Они не ходят в школу." },
    ] },
    { id: "review", type: "review", completion: "acknowledge", title: "Разбор ошибок", description: "Объяснения и повторение" },
    { id: "summary", type: "summary", completion: "acknowledge", title: "Итоги урока", description: "Ваш следующий шаг" },
  ],
};
