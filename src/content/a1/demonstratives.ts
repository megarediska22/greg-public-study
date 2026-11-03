import type { Lesson } from '../../types/lesson.ts';

export const demonstrativesLesson: Lesson = {
  "id": "demonstratives",
  "level": "A1",
  "title": "This / That / These / Those",
  "sample": false,
  "objectives": [
    "Показывать на один или несколько предметов рядом и вдали.",
    "Выбирать is или are после указательного слова.",
    "Строить простые вопросы и отрицания с this, that, these, those."
  ],
  "steps": [
    {
      "id": "intro",
      "type": "intro",
      "completion": "acknowledge",
      "title": "Знакомство с уроком",
      "description": "Что будем изучать",
      "heading": "Покажите: вот это или вон то.",
      "text": "Когда название забыто, можно показать. Научимся говорить об одном предмете и о нескольких — рядом с нами или подальше.",
      "example": "Gregory: This is a book. Natasha: Those are cars.",
      "translation": "Григорий: «Это книга рядом». Наташа: «Вон те — машины вдали»."
    },
    {
      "id": "theory",
      "type": "theory",
      "completion": "acknowledge",
      "title": "Теория",
      "description": "Правило и примеры",
      "heading": "Рядом или далеко? Один или несколько?",
      "text": "This и that показывают на один предмет. These и those — на несколько. Выбор зависит от расстояния: рядом с говорящим или далеко от него.",
      "tableCaption": "Четыре слова, две подсказки",
      "rows": [
        {
          "subject": "This",
          "form": "is",
          "example": "This is a cup.",
          "translation": "Это чашка рядом."
        },
        {
          "subject": "That",
          "form": "is",
          "example": "That is a bag.",
          "translation": "То — сумка вдали."
        },
        {
          "subject": "These",
          "form": "are",
          "example": "These are books.",
          "translation": "Это книги рядом."
        },
        {
          "subject": "Those",
          "form": "are",
          "example": "Those are cars.",
          "translation": "То — машины вдали."
        }
      ],
      "blocks": [
        {
          "title": "Из одного — несколько",
          "text": "Обычно добавляем -s: book → books, chair → chairs. После -s, -sh, -ch, -x, -z обычно добавляем -es: box → boxes. В этом уроке все формы во множественном числе регулярные.",
          "formula": "This is a book → These are books",
          "example": "That is a chair. → Those are chairs.",
          "translation": "То — стул. → То — стулья. При переходе к нескольким предметам a/an убираем."
        },
        {
          "title": "Спросите или скажите «не»",
          "text": "В вопросе поставьте is/are перед this/that/these/those. В отрицании добавьте not после is/are. Is not = isn’t, are not = aren’t; that is = that’s.",
          "formula": "Is this…? / Are those…?",
          "example": "Is this a book? — No, it isn’t.",
          "translation": "Это книга? — Нет."
        },
        {
          "title": "Слова для практики",
          "text": "a chair — стул; a box — коробка; a cup — чашка."
        }
      ],
      "noteTitle": "These дружит с are",
      "note": "This is / that is — один предмет. These are / those are — несколько. Не говорите These is. Словам these и those нужна форма множественного числа: books, а не book."
    },
    {
      "id": "choice",
      "type": "exercise",
      "completion": "all-correct",
      "title": "Выбор ответа",
      "description": "Упражнение 1",
      "questions": [
        {
          "id": "dem-near-book",
          "type": "choice",
          "instruction": "Одна книга рядом с вами. Выберите this/that/these/those",
          "prompt": "___ is a book.",
          "acceptedAnswers": [
            "This"
          ],
          "explanation": "Один предмет рядом — this: This is a book.",
          "options": [
            "That",
            "These",
            "This",
            "Those"
          ]
        },
        {
          "id": "dem-far-bag",
          "type": "choice",
          "instruction": "Одна сумка далеко от вас. Выберите указательное слово",
          "prompt": "___ is a bag.",
          "acceptedAnswers": [
            "That"
          ],
          "explanation": "Один предмет вдали — that.",
          "options": [
            "This",
            "That",
            "Those",
            "These"
          ]
        },
        {
          "id": "dem-near-apples",
          "type": "choice",
          "instruction": "Несколько яблок рядом с вами. Выберите указательное слово",
          "prompt": "___ are apples.",
          "acceptedAnswers": [
            "These"
          ],
          "explanation": "Несколько предметов рядом — these.",
          "options": [
            "These",
            "This",
            "That",
            "Those"
          ]
        },
        {
          "id": "dem-far-cars",
          "type": "choice",
          "instruction": "Несколько машин далеко от вас. Выберите указательное слово",
          "prompt": "___ are cars.",
          "acceptedAnswers": [
            "Those"
          ],
          "explanation": "Несколько предметов вдали — those.",
          "options": [
            "That",
            "This",
            "Those",
            "These"
          ]
        },
        {
          "id": "dem-these-are",
          "type": "choice",
          "instruction": "Выберите is или are: «Это книги рядом»",
          "prompt": "These ___ books.",
          "acceptedAnswers": [
            "are"
          ],
          "explanation": "These относится к нескольким предметам, поэтому нужна форма are.",
          "options": [
            "is",
            "are"
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
          "id": "dem-near-cup",
          "type": "blank",
          "instruction": "Одна чашка рядом. Вставьте this, that, these или those",
          "prompt": "___ is a cup.",
          "acceptedAnswers": [
            "This"
          ],
          "explanation": "Для одного предмета рядом используем this.",
          "placeholder": "Введите пропущенные слова"
        },
        {
          "id": "dem-far-chair",
          "type": "blank",
          "instruction": "Один стул вдали. Вставьте this, that, these или those",
          "prompt": "___ is a chair.",
          "acceptedAnswers": [
            "That"
          ],
          "explanation": "Для одного предмета вдали используем that.",
          "placeholder": "Введите пропущенные слова"
        },
        {
          "id": "dem-this-is",
          "type": "blank",
          "instruction": "Вставьте is или are: «Это сумка»",
          "prompt": "This ___ a bag.",
          "acceptedAnswers": [
            "is"
          ],
          "explanation": "This показывает на один предмет: This is a bag.",
          "placeholder": "Введите пропущенные слова"
        },
        {
          "id": "dem-those-are",
          "type": "blank",
          "instruction": "Вставьте is или are: «Вон те — машины»",
          "prompt": "Those ___ cars.",
          "acceptedAnswers": [
            "are"
          ],
          "explanation": "Those показывает на несколько предметов: Those are cars.",
          "placeholder": "Введите пропущенные слова"
        },
        {
          "id": "dem-plural-books",
          "type": "blank",
          "instruction": "Поставьте book во множественное число",
          "prompt": "These are two ___.",
          "acceptedAnswers": [
            "books"
          ],
          "explanation": "Добавьте -s: book → books. После two нужна форма books.",
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
          "id": "dem-books-plural",
          "type": "written",
          "instruction": "Скажите о нескольких книгах рядом: замените this на these, измените is и book, уберите a",
          "prompt": "This is a book.",
          "acceptedAnswers": [
            "These are books."
          ],
          "explanation": "Несколько рядом: These are books. This → these, is → are, book → books, без a.",
          "placeholder": "Напишите ответ на английском"
        },
        {
          "id": "dem-chairs-plural",
          "type": "written",
          "instruction": "Скажите о нескольких стульях вдали: замените that на those, измените is и chair, уберите a",
          "prompt": "That is a chair.",
          "acceptedAnswers": [
            "Those are chairs."
          ],
          "explanation": "Несколько вдали: Those are chairs. That → those, is → are, chair → chairs.",
          "placeholder": "Напишите ответ на английском"
        },
        {
          "id": "dem-bag-question",
          "type": "written",
          "instruction": "Сделайте вопрос, сохранив остальные слова",
          "prompt": "This is a bag.",
          "acceptedAnswers": [
            "Is this a bag?"
          ],
          "explanation": "В вопросе is ставится перед this: Is this a bag? — Это сумка?",
          "placeholder": "Напишите ответ на английском"
        },
        {
          "id": "dem-apples-negative",
          "type": "written",
          "instruction": "Сделайте предложение отрицательным; сохраните остальные слова",
          "prompt": "These are apples.",
          "acceptedAnswers": [
            "These are not apples.",
            "These aren't apples."
          ],
          "explanation": "Добавьте not после are: These are not apples. = These aren’t apples. — Это не яблоки.",
          "placeholder": "Напишите ответ на английском"
        },
        {
          "id": "dem-car-negative",
          "type": "written",
          "instruction": "Сделайте предложение отрицательным; можно использовать сокращение",
          "prompt": "That is a car.",
          "acceptedAnswers": [
            "That is not a car.",
            "That isn't a car.",
            "That's not a car."
          ],
          "explanation": "That is not a car. = That isn’t a car. = That’s not a car. — То не машина.",
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
