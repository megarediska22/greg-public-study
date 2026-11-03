import type { Lesson } from '../../types/lesson.ts';

export const wasWereLesson: Lesson = {
  "id": "was-were",
  "level": "A1",
  "title": "Was / Were — знакомство с прошлым",
  "sample": false,
  "objectives": [
    "Говорить, где вы были и как себя чувствовали в прошлом.",
    "Выбирать was и were по местоимению.",
    "Строить отрицания, вопросы и короткие ответы с was/were."
  ],
  "steps": [
    {
      "id": "intro",
      "type": "intro",
      "completion": "acknowledge",
      "title": "Знакомство с уроком",
      "description": "Что будем изучать",
      "heading": "А что было вчера?",
      "text": "Сегодня вы дома, а вчера были в школе? У to be есть формы для прошлого: was и were. Начнём с мест и состояний — без новых глаголов действия.",
      "example": "Gregory was at school yesterday.",
      "translation": "Григорий вчера был в школе."
    },
    {
      "id": "theory",
      "type": "theory",
      "completion": "acknowledge",
      "title": "Теория",
      "description": "Правило и примеры",
      "heading": "Am/is → was. Are → were.",
      "text": "Was и were — прошедшие формы to be. Они говорят, кем человек был, где находился или как себя чувствовал. Yesterday — вчера; last night — вчера вечером или ночью.",
      "tableCaption": "Какую форму выбрать в прошлом",
      "rows": [
        {
          "subject": "I / He / She / It",
          "form": "was",
          "example": "Natasha was at home last night.",
          "translation": "Наташа вчера вечером была дома."
        },
        {
          "subject": "You / We / They",
          "form": "were",
          "example": "They were tired yesterday.",
          "translation": "Они вчера были уставшими."
        }
      ],
      "blocks": [
        {
          "title": "Отрицание",
          "text": "Добавьте not после was или were. Можно сократить: was not = wasn’t, were not = weren’t.",
          "formula": "Кто + was/were + not + остальное",
          "example": "I wasn’t at work yesterday.",
          "translation": "Я вчера не был / не была на работе."
        },
        {
          "title": "Вопрос",
          "text": "Переставьте was/were перед тем, о ком спрашиваете. Порядок знаком по am/is/are.",
          "formula": "Was/Were + кто + остальное?",
          "example": "You were ready. → Were you ready?",
          "translation": "Вы были готовы. → Вы были готовы?"
        },
        {
          "title": "Короткие ответы",
          "text": "Повторите местоимение и was/were; в отрицании добавьте not. На Were you…? о себе отвечайте с I.",
          "example": "Yes, I was. / No, I wasn’t.\nYes, they were. / No, they weren’t.",
          "translation": "Да. / Нет. Первая строка — о себе, вторая — о них."
        }
      ],
      "noteTitle": "Пока говорим только о to be",
      "note": "I was tired. — Я был / была уставшим / уставшей. Was не заменяет обычный глагол: для «я работал» не говорим I was work. Здесь тренируем только прошлые места, состояния и готовность."
    },
    {
      "id": "choice",
      "type": "exercise",
      "completion": "all-correct",
      "title": "Выбор ответа",
      "description": "Упражнение 1",
      "questions": [
        {
          "id": "past-i-was",
          "type": "choice",
          "instruction": "Выберите was или were: «Я вчера устал / устала»",
          "prompt": "I ___ tired yesterday.",
          "acceptedAnswers": [
            "was"
          ],
          "explanation": "С I в прошлом используется was: I was tired yesterday.",
          "options": [
            "were",
            "was"
          ]
        },
        {
          "id": "past-they-were",
          "type": "choice",
          "instruction": "Выберите was или were: «Они вчера были дома»",
          "prompt": "They ___ at home yesterday.",
          "acceptedAnswers": [
            "were"
          ],
          "explanation": "С they используйте were: They were at home yesterday.",
          "options": [
            "was",
            "were"
          ]
        },
        {
          "id": "past-she-was",
          "type": "choice",
          "instruction": "Выберите was или were: «Она вчера была в школе»",
          "prompt": "She ___ at school yesterday.",
          "acceptedAnswers": [
            "was"
          ],
          "explanation": "С she нужна форма was.",
          "options": [
            "was",
            "were"
          ]
        },
        {
          "id": "past-you-were",
          "type": "choice",
          "instruction": "Выберите was или were: «Вы были готовы вчера вечером»",
          "prompt": "You ___ ready last night.",
          "acceptedAnswers": [
            "were"
          ],
          "explanation": "С you используется were, и для «ты», и для «вы».",
          "options": [
            "was",
            "were"
          ]
        },
        {
          "id": "past-we-were",
          "type": "choice",
          "instruction": "Выберите was или were: «Мы вчера были счастливы»",
          "prompt": "We ___ happy yesterday.",
          "acceptedAnswers": [
            "were"
          ],
          "explanation": "С we нужна форма were: We were happy yesterday.",
          "options": [
            "were",
            "was"
          ]
        }
      ]
    },
    {
      "id": "blank",
      "type": "exercise",
      "completion": "all-correct",
      "title": "Пропуски",
      "description": "Упражнение 2",
      "questions": [
        {
          "id": "past-he-negative",
          "type": "blank",
          "instruction": "Вставьте was not или wasn’t: «Он вчера не был дома»",
          "prompt": "He ___ at home yesterday.",
          "acceptedAnswers": [
            "was not",
            "wasn't"
          ],
          "explanation": "С he отрицание was not = wasn’t.",
          "placeholder": "Введите пропущенные слова"
        },
        {
          "id": "past-we-negative",
          "type": "blank",
          "instruction": "Вставьте were not или weren’t: «Мы не были готовы вчера вечером»",
          "prompt": "We ___ ready last night.",
          "acceptedAnswers": [
            "were not",
            "weren't"
          ],
          "explanation": "С we отрицание were not = weren’t.",
          "placeholder": "Введите пропущенные слова"
        },
        {
          "id": "past-was-question",
          "type": "blank",
          "instruction": "Вставьте Was или Were: «Она вчера была на работе?»",
          "prompt": "___ she at work yesterday?",
          "acceptedAnswers": [
            "Was"
          ],
          "explanation": "С she вопрос начинается с Was.",
          "placeholder": "Введите пропущенные слова"
        },
        {
          "id": "past-were-question",
          "type": "blank",
          "instruction": "Вставьте Was или Were: «Они вчера были в школе?»",
          "prompt": "___ they at school yesterday?",
          "acceptedAnswers": [
            "Were"
          ],
          "explanation": "С they вопрос начинается с Were.",
          "placeholder": "Введите пропущенные слова"
        },
        {
          "id": "past-she-short",
          "type": "blank",
          "instruction": "Вставьте отрицательную форму was в короткий ответ",
          "prompt": "Was she happy yesterday? — No, she ___.",
          "acceptedAnswers": [
            "was not",
            "wasn't"
          ],
          "explanation": "Отрицательный короткий ответ: No, she was not. = No, she wasn’t.",
          "placeholder": "Введите пропущенные слова"
        }
      ]
    },
    {
      "id": "sentence",
      "type": "exercise",
      "completion": "all-correct",
      "title": "Составление фраз",
      "description": "Упражнение 3",
      "questions": [
        {
          "id": "past-home-negative",
          "type": "written",
          "instruction": "Сделайте предложение отрицательным; можно использовать сокращение",
          "prompt": "He was at home yesterday.",
          "acceptedAnswers": [
            "He was not at home yesterday.",
            "He wasn't at home yesterday."
          ],
          "explanation": "Добавьте not после was: He wasn’t at home yesterday. — Он вчера не был дома.",
          "placeholder": "Напишите ответ на английском"
        },
        {
          "id": "past-they-question",
          "type": "written",
          "instruction": "Сделайте вопрос, сохранив остальные слова",
          "prompt": "They were tired last night.",
          "acceptedAnswers": [
            "Were they tired last night?"
          ],
          "explanation": "Поставьте Were перед they: Were they tired last night? — Они вчера вечером устали?",
          "placeholder": "Напишите ответ на английском"
        },
        {
          "id": "past-you-question",
          "type": "written",
          "instruction": "Сделайте вопрос; сохраните местоимение you",
          "prompt": "You were at school yesterday.",
          "acceptedAnswers": [
            "Were you at school yesterday?"
          ],
          "explanation": "Поставьте Were перед you: Were you at school yesterday? — Ты вчера был / была в школе?",
          "placeholder": "Напишите ответ на английском"
        },
        {
          "id": "past-she-yes",
          "type": "written",
          "instruction": "Дайте короткий утвердительный ответ с Yes, she…",
          "prompt": "Was Natasha at work yesterday?",
          "acceptedAnswers": [
            "Yes, she was.",
            "Yes she was."
          ],
          "explanation": "Natasha заменяется на she; повторяем was: Yes, she was. — Да.",
          "placeholder": "Напишите ответ на английском"
        },
        {
          "id": "past-they-no",
          "type": "written",
          "instruction": "Дайте короткий отрицательный ответ с No, they…",
          "prompt": "Were they ready?",
          "acceptedAnswers": [
            "No, they were not.",
            "No, they weren't.",
            "No they were not.",
            "No they weren't."
          ],
          "explanation": "Ответ с they: No, they were not. = No, they weren’t. — Нет.",
          "placeholder": "Напишите ответ на английском"
        }
      ]
    },
    {
      "id": "review",
      "type": "review",
      "completion": "acknowledge",
      "title": "Разбор ошибок",
      "description": "Объяснения и повторение"
    },
    {
      "id": "summary",
      "type": "summary",
      "completion": "acknowledge",
      "title": "Итоги урока",
      "description": "Ваш следующий шаг"
    }
  ]
};
