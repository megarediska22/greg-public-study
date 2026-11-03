import type { Lesson } from '../../types/lesson.ts';

export const toBeLesson: Lesson = {
  id: "to-be", level: "A1", title: "Глагол to be", sample: false,
  objectives: [
    "Выбирать am, is или are по местоимению.",
    "Говорить, кто вы, где находитесь, сколько вам лет и как себя чувствуете.",
    "Строить отрицания и использовать сокращения.",
    "Задавать вопросы с to be и давать короткие ответы.",
  ],
  steps: [
    { id: "intro", type: "intro", completion: "acknowledge", title: "Знакомство с уроком", description: "Что будем изучать",
      heading: "Первая фраза о себе.",
      text: "В русском мы говорим «Я студент» или «Она дома» без глагола. В английском в таких фразах нужен to be. Начнём с трёх его форм: am, is и are. Затем научимся отрицать, спрашивать и отвечать.",
      example: "I am a student. I am at home.", translation: "Я студент / студентка. Я дома." },
    {
      "id": "theory",
      "type": "theory",
      "completion": "acknowledge",
      "title": "Теория",
      "description": "Правило и примеры",
      "heading": "Кто вы, где вы и как дела?",
      "text": "В русском можно сказать «Я дома». В английском нужен to be — маленький глагол с тремя формами: am, is, are.",
      "tableCaption": "Выберите форму по тому, о ком говорите",
      "rows": [
        {
          "subject": "I",
          "subjectTranslation": "я",
          "form": "am",
          "example": "I am Gregory.",
          "translation": "Я Григорий."
        },
        {
          "subject": "You / We / They",
          "subjectTranslation": "ты, вы / мы / они",
          "form": "are",
          "example": "We are at home.",
          "translation": "Мы дома."
        },
        {
          "subject": "He / She / It",
          "subjectTranslation": "он / она / оно, это",
          "form": "is",
          "example": "Natasha is happy.",
          "translation": "Наташа счастлива."
        }
      ],
      "blocks": [
        {
          "title": "В разговоре — короче",
          "text": "I всегда пишется с большой буквы. Апостроф заменяет пропущенные буквы: I am → I’m.",
          "formula": "I'm · you're · we're · they're · he's · she's · it's",
          "example": "I'm Gregory.",
          "translation": "Я Григорий."
        },
        {
          "title": "Чтобы сказать «не»",
          "text": "Добавьте not после am, is или are. Сокращения: I am not → I’m not; is not → isn’t; are not → aren’t.",
          "formula": "Кто + am/is/are + not + остальное",
          "example": "She is not at home. = She isn't at home. = She's not at home.",
          "translation": "Она не дома. Все три формы верны."
        },
        {
          "title": "Чтобы спросить",
          "text": "Переставьте am, is или are перед тем, о ком спрашиваете.",
          "formula": "Am/Is/Are + кто + остальное?",
          "example": "You are ready. → Are you ready?",
          "translation": "Вы готовы. → Вы готовы?"
        },
        {
          "title": "Коротко ответить",
          "text": "В коротком ответе повторите местоимение и am/is/are; для «нет» добавьте not. На Are you…? о себе отвечайте с I. После Yes глагол не сокращаем.",
          "example": "Yes, I am. / No, I am not. = No, I'm not.",
          "translation": "Да. / Нет."
        }
      ],
      "noteTitle": "Два полезных штриха",
      "note": "Возраст тоже с to be: You are 20. — Тебе 20 лет. Перед профессией или student нужен a: a teacher — учитель, a student — студент. Глагол не теряем: I am happy, а не I happy."
    },
    { id: "choice", type: "exercise", completion: "all-correct", title: "Выбор ответа", description: "Упражнение 1", questions: [
      { id: "choose-am", type: "choice", instruction: "Выберите форму глагола", prompt: "I ___ ready.", options: ["am", "is", "are"], acceptedAnswers: ["am"], explanation: "С I используется am: I am ready. — Я готов / готова." },
      { id: "to-be-teacher", type: "choice", instruction: "Выберите форму глагола: «Он учитель»", prompt: "He ___ a teacher.", options: ["are", "is", "am"], acceptedAnswers: ["is"], explanation: "С he нужна форма is: He is a teacher. — Он учитель." },
      { id: "to-be-location", type: "choice", instruction: "Выберите форму глагола: «Они дома»", prompt: "They ___ at home.", options: ["is", "am", "are"], acceptedAnswers: ["are"], explanation: "С they используется are: They are at home. — Они дома." },
      { id: "to-be-age", type: "choice", instruction: "Выберите форму глагола: «Тебе 20 лет»", prompt: "You ___ 20.", options: ["am", "are", "is"], acceptedAnswers: ["are"], explanation: "С you нужна форма are. Для возраста используем to be: You are 20. — Тебе 20 лет." },
      { id: "to-be-weather", type: "choice", instruction: "Выберите форму глагола: «Холодно»", prompt: "It ___ cold.", options: ["is", "are", "am"], acceptedAnswers: ["is"], explanation: "С it используется is: It is cold. — Холодно (о погоде)." },
    ] },
    { id: "blank", type: "exercise", completion: "all-correct", title: "Пропуски", description: "Упражнение 2", questions: [
      { id: "negative-blank", type: "blank", instruction: "Вставьте am not или сокращённую форму: «Я не готов / не готова»", prompt: "I ___ ready.", placeholder: "Введите пропущенные слова", acceptedAnswers: ["am not", "'m not"], explanation: "После I ставим am not. Можно сократить I am до I’m: I’m not ready. — Я не готов / не готова." },
      { id: "to-be-she-negative", type: "blank", instruction: "Вставьте is not или isn't: «Она не устала»", prompt: "She ___ tired.", placeholder: "Введите отрицательную форму", acceptedAnswers: ["is not", "isn't"], explanation: "She is not tired. = She isn't tired. — Она не устала. В этом задании используйте is not или isn't." },
      { id: "to-be-we-negative", type: "blank", instruction: "Вставьте are not или aren't: «Мы не дома»", prompt: "We ___ at home.", placeholder: "Введите отрицательную форму", acceptedAnswers: ["are not", "aren't"], explanation: "С we используется are: We are not at home. = We aren't at home. — Мы не дома." },
      { id: "to-be-he-negative", type: "blank", instruction: "Вставьте is not или isn't: «Он не учитель»", prompt: "He ___ a teacher.", placeholder: "Введите отрицательную форму", acceptedAnswers: ["is not", "isn't"], explanation: "С he используется is. Добавьте not: He is not a teacher. = He isn't a teacher. — Он не учитель." },
      { id: "to-be-they-negative", type: "blank", instruction: "Вставьте are not или aren't: «Они не здесь»", prompt: "They ___ here.", placeholder: "Введите отрицательную форму", acceptedAnswers: ["are not", "aren't"], explanation: "С they используется are: They are not here. = They aren't here. — Они не здесь." },
    ] },
    { id: "sentence", type: "exercise", completion: "all-correct", title: "Составление фраз", description: "Упражнение 3", questions: [
      { id: "ready-question", type: "written", sentenceType: "question", instruction: "Преобразуйте утверждение в вопрос, сохранив все слова", prompt: "You are ready.", placeholder: "Напишите вопрос на английском", acceptedAnswers: ["Are you ready?"], explanation: "В вопросе are ставится перед you: Are you ready? — Ты готов / готова? Регистр и знак в конце не влияют на проверку." },
      { id: "to-be-student-negative", type: "written", sentenceType: "negative", instruction: "Сделайте предложение отрицательным; сохраните остальные слова", prompt: "I am a student.", placeholder: "Напишите отрицательное предложение", acceptedAnswers: ["I am not a student.", "I'm not a student."], explanation: "Поставьте not после am: I am not a student. = I'm not a student. — Я не студент / не студентка." },
      { id: "to-be-home-negative", type: "written", sentenceType: "negative", instruction: "Сделайте предложение отрицательным; можно использовать сокращение", prompt: "She is at home.", placeholder: "Напишите отрицательное предложение", acceptedAnswers: ["She is not at home.", "She isn't at home.", "She's not at home."], explanation: "She is not at home. = She isn't at home. = She's not at home. — Она не дома. Все три формы допустимы." },
      { id: "to-be-tired-question", type: "written", sentenceType: "question", instruction: "Преобразуйте утверждение в вопрос, сохранив все слова", prompt: "They are tired.", placeholder: "Напишите вопрос на английском", acceptedAnswers: ["Are they tired?"], explanation: "Перенесите are перед they: Are they tired? — Они устали?" },
      { id: "to-be-short-answer", type: "written", sentenceType: "short-affirmative", instruction: "Дайте короткий утвердительный ответ о себе: Yes, I…", prompt: "Are you happy?", placeholder: "Напишите короткий ответ", acceptedAnswers: ["Yes, I am.", "Yes I am."], explanation: "Отвечая о себе, используйте I: Yes, I am. — Да. В конце утвердительного короткого ответа am не сокращается. Запятая здесь необязательна для проверки." },
    ] },
    { id: "review", type: "review", completion: "acknowledge", title: "Разбор ошибок", description: "Объяснения и повторение" },
    { id: "summary", type: "summary", completion: "acknowledge", title: "Итоги урока", description: "Ваш следующий шаг" },
  ],
};
