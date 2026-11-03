import type { Lesson } from '../../types/lesson.ts';

export const haveHasLesson: Lesson = {
  "id": "have-has",
  "level": "A1",
  "title": "Have / Has — что у нас есть",
  "sample": false,
  "objectives": [
    "Говорить о том, что у вас есть, с have и has.",
    "Строить отрицания с don’t have и doesn’t have.",
    "Спрашивать о вещах с do/does и давать короткие ответы."
  ],
  "steps": [
    {
      "id": "intro",
      "type": "intro",
      "completion": "acknowledge",
      "title": "Знакомство с уроком",
      "description": "Что будем изучать",
      "heading": "Что у вас в сумке?",
      "text": "Книга, телефон, яблоко? С have легко рассказать, что у вас есть. Правила do и does уже знакомы — теперь они пригодятся для разговора о вещах.",
      "example": "Gregory has a book.",
      "translation": "У Грегори есть книга."
    },
    {
      "id": "theory",
      "type": "theory",
      "completion": "acknowledge",
      "title": "Теория",
      "description": "Правило и примеры",
      "heading": "Have — значит «у меня есть».",
      "text": "Для вещей, семьи и других связей используем have. С he, she, it форма меняется на has. Gregory = he, Natasha = she.",
      "tableCaption": "Кто чем располагает",
      "rows": [
        {
          "subject": "I / You / We / They",
          "form": "have",
          "example": "I have a bag.",
          "translation": "У меня есть сумка."
        },
        {
          "subject": "He / She / It",
          "form": "has",
          "example": "Natasha has a phone.",
          "translation": "У Наташи есть телефон."
        }
      ],
      "blocks": [
        {
          "title": "Скажите «нет»",
          "text": "Правила Present Simple остаются прежними. После doesn’t возвращаем have, а не has.",
          "formula": "Кто + don’t/doesn’t + have + вещь",
          "example": "She doesn't have a car.",
          "translation": "У неё нет машины."
        },
        {
          "title": "Спросите",
          "text": "С I/you/we/they нужен do, с he/she/it — does. В коротком ответе повторяем do/does.",
          "formula": "Do/Does + кто + have + вещь?",
          "example": "Does Gregory have a bike? — Yes, he does. / No, he doesn’t.",
          "translation": "У Грегори есть велосипед? — Да. / Нет."
        },
        {
          "title": "Слова для практики",
          "text": "a book — книга; a bag — сумка; a phone — телефон; a car — машина; a bike — велосипед; a sister — сестра; a brother — брат. Один предмет: a book; несколько: two books — две книги. К нескольким обычным предметам добавляем -s."
        }
      ],
      "noteTitle": "Has уходит, have возвращается",
      "note": "She has a phone → She doesn’t have a phone. Do not = don’t; does not = doesn’t. В этом уроке используем have без got — одну понятную схему за раз."
    },
    {
      "id": "choice",
      "type": "exercise",
      "completion": "all-correct",
      "title": "Выбор ответа",
      "description": "Упражнение 1",
      "questions": [
        {
          "id": "hh-i-have",
          "type": "choice",
          "instruction": "Выберите форму: «У меня есть книга»",
          "prompt": "I ___ a book.",
          "acceptedAnswers": [
            "have"
          ],
          "explanation": "С I нужна форма have: I have a book. — У меня есть книга.",
          "options": [
            "has",
            "have",
            "haves"
          ]
        },
        {
          "id": "hh-natasha-has",
          "type": "choice",
          "instruction": "Выберите форму: «У Наташи есть телефон»",
          "prompt": "Natasha ___ a phone.",
          "acceptedAnswers": [
            "has"
          ],
          "explanation": "Natasha заменяется на she. В утверждении с she используется has.",
          "options": [
            "have",
            "haves",
            "has"
          ]
        },
        {
          "id": "hh-we-have",
          "type": "choice",
          "instruction": "Выберите форму: «У нас есть две сумки»",
          "prompt": "We ___ two bags.",
          "acceptedAnswers": [
            "have"
          ],
          "explanation": "С we используйте have: We have two bags. — У нас есть две сумки.",
          "options": [
            "have",
            "has",
            "is"
          ]
        },
        {
          "id": "hh-negative-have",
          "type": "choice",
          "instruction": "Выберите форму после doesn’t: «У него нет машины»",
          "prompt": "He doesn't ___ a car.",
          "acceptedAnswers": [
            "have"
          ],
          "explanation": "После doesn’t ставим начальную форму have, а не has.",
          "options": [
            "has",
            "have",
            "haves"
          ]
        },
        {
          "id": "hh-question-have",
          "type": "choice",
          "instruction": "Выберите форму: «У неё есть велосипед?»",
          "prompt": "Does she ___ a bike?",
          "acceptedAnswers": [
            "have"
          ],
          "explanation": "Does уже показывает форму вопроса с she: Does she have a bike?",
          "options": [
            "has",
            "haves",
            "have"
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
          "id": "hh-gregory-has",
          "type": "blank",
          "instruction": "Вставьте have или has: «У Грегори есть брат»",
          "prompt": "Gregory ___ a brother.",
          "acceptedAnswers": [
            "has"
          ],
          "explanation": "Gregory = he, поэтому Gregory has a brother.",
          "placeholder": "Введите пропущенные слова"
        },
        {
          "id": "hh-they-have",
          "type": "blank",
          "instruction": "Вставьте have или has: «У них есть две книги»",
          "prompt": "They ___ two books.",
          "acceptedAnswers": [
            "have"
          ],
          "explanation": "С they нужна форма have: They have two books.",
          "placeholder": "Введите пропущенные слова"
        },
        {
          "id": "hh-i-negative",
          "type": "blank",
          "instruction": "Вставьте do not или don’t: «У меня нет велосипеда»",
          "prompt": "I ___ have a bike.",
          "acceptedAnswers": [
            "do not",
            "don't"
          ],
          "explanation": "С I используется do not / don’t: I don’t have a bike.",
          "placeholder": "Введите пропущенные слова"
        },
        {
          "id": "hh-she-negative",
          "type": "blank",
          "instruction": "Вставьте does not или doesn’t: «У неё нет сумки»",
          "prompt": "She ___ have a bag.",
          "acceptedAnswers": [
            "does not",
            "doesn't"
          ],
          "explanation": "С she используется does not / doesn’t, а затем have.",
          "placeholder": "Введите пропущенные слова"
        },
        {
          "id": "hh-do-question",
          "type": "blank",
          "instruction": "Вставьте Do или Does: «У тебя есть сестра?»",
          "prompt": "___ you have a sister?",
          "acceptedAnswers": [
            "Do"
          ],
          "explanation": "С you вопрос начинается с Do: Do you have a sister?",
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
          "id": "hh-car-negative",
          "type": "written",
          "instruction": "Сделайте предложение отрицательным; сохраните остальные слова",
          "prompt": "He has a car.",
          "acceptedAnswers": [
            "He does not have a car.",
            "He doesn't have a car."
          ],
          "explanation": "После does not / doesn’t нужен have: He doesn’t have a car. — У него нет машины.",
          "placeholder": "Напишите ответ на английском"
        },
        {
          "id": "hh-bag-question",
          "type": "written",
          "instruction": "Сделайте вопрос с do/does; сохраните местоимение you",
          "prompt": "You have a bag.",
          "acceptedAnswers": [
            "Do you have a bag?"
          ],
          "explanation": "Поставьте Do перед you: Do you have a bag? — У тебя есть сумка?",
          "placeholder": "Напишите ответ на английском"
        },
        {
          "id": "hh-natasha-question",
          "type": "written",
          "instruction": "Сделайте вопрос с do/does; сохраните имя Natasha",
          "prompt": "Natasha has a bike.",
          "acceptedAnswers": [
            "Does Natasha have a bike?"
          ],
          "explanation": "Имя Natasha требует does, после него has меняется на have.",
          "placeholder": "Напишите ответ на английском"
        },
        {
          "id": "hh-phone-negative",
          "type": "written",
          "instruction": "Сделайте предложение отрицательным; можно использовать сокращение",
          "prompt": "I have a phone.",
          "acceptedAnswers": [
            "I do not have a phone.",
            "I don't have a phone."
          ],
          "explanation": "С I нужен do not / don’t: I don’t have a phone. — У меня нет телефона.",
          "placeholder": "Напишите ответ на английском"
        },
        {
          "id": "hh-short-yes",
          "type": "written",
          "instruction": "Дайте короткий утвердительный ответ с Yes, she…",
          "prompt": "Does she have a sister?",
          "acceptedAnswers": [
            "Yes, she does.",
            "Yes she does."
          ],
          "explanation": "В коротком ответе повторяем does, без have: Yes, she does. — Да.",
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
