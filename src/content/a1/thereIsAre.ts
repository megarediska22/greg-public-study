import type { Lesson } from '../../types/lesson.ts';

export const thereIsAreLesson: Lesson = {
  "id": "there-is-are",
  "level": "A1",
  "title": "There is / There are — что вокруг",
  "sample": false,
  "objectives": [
    "Описывать, что есть в комнате или другом месте.",
    "Выбирать there is для одного предмета и there are для нескольких.",
    "Строить отрицания, вопросы и короткие ответы с there."
  ],
  "steps": [
    {
      "id": "intro",
      "type": "intro",
      "completion": "acknowledge",
      "title": "Знакомство с уроком",
      "description": "Что будем изучать",
      "heading": "Заглянем в комнату.",
      "text": "Раньше мы называли предмет. Теперь расскажем, что есть в каком-то месте: стол, лампа или две книги. Для этого нужны there is и there are.",
      "example": "Natasha: There is a desk in the room.",
      "translation": "Наташа: «В комнате есть письменный стол»."
    },
    {
      "id": "theory",
      "type": "theory",
      "completion": "acknowledge",
      "title": "Теория",
      "description": "Правило и примеры",
      "heading": "Что есть в этом месте?",
      "text": "There is/are сообщает, что где-то что-то есть. Сначала называем предмет, затем место.",
      "tableCaption": "Один предмет или несколько",
      "rows": [
        {
          "subject": "a desk",
          "form": "There is",
          "example": "There is a desk in the room.",
          "translation": "В комнате есть письменный стол."
        },
        {
          "subject": "two books",
          "form": "There are",
          "example": "There are two books on the table.",
          "translation": "На столе две книги."
        }
      ],
      "blocks": [
        {
          "title": "Если чего-то нет",
          "text": "После is/are добавьте not. Is not = isn’t, are not = aren’t. There is можно сократить до there’s.",
          "formula": "There is/are + not + предмет + место",
          "example": "There isn’t a lamp in the room.",
          "translation": "В комнате нет лампы."
        },
        {
          "title": "Уточните вопросом",
          "text": "Переставьте is/are перед there. В коротком ответе оставьте there и ту же форму глагола.",
          "formula": "Is/Are + there + предмет + место?",
          "example": "Is there a desk? — Yes, there is. / No, there isn’t.",
          "translation": "Есть письменный стол? — Да. / Нет."
        },
        {
          "title": "Слова для практики",
          "text": "a room — комната; a desk — письменный стол; a table — стол; a lamp — лампа; a kitchen — кухня. In — в, on — на: in the room — в комнате, on the table — на столе."
        }
      ],
      "noteTitle": "There — не it",
      "note": "There is a book сообщает о наличии книги. It is a book называет предмет: «Это книга». Для нескольких предметов: Are there…? — Yes, there are. / No, there are not. = No, there aren’t. После Yes не сокращайте there is до there’s."
    },
    {
      "id": "choice",
      "type": "exercise",
      "completion": "all-correct",
      "title": "Выбор ответа",
      "description": "Упражнение 1",
      "questions": [
        {
          "id": "there-one-desk",
          "type": "choice",
          "instruction": "Выберите is или are: «В комнате есть письменный стол»",
          "prompt": "There ___ a desk in the room.",
          "acceptedAnswers": [
            "is"
          ],
          "explanation": "Один предмет a desk требует there is.",
          "options": [
            "are",
            "is"
          ]
        },
        {
          "id": "there-two-books",
          "type": "choice",
          "instruction": "Выберите is или are: «На столе две книги»",
          "prompt": "There ___ two books on the table.",
          "acceptedAnswers": [
            "are"
          ],
          "explanation": "Two books — несколько предметов, поэтому there are.",
          "options": [
            "is",
            "are"
          ]
        },
        {
          "id": "there-question-one",
          "type": "choice",
          "instruction": "Выберите начало вопроса об одной лампе",
          "prompt": "___ there a lamp in the room?",
          "acceptedAnswers": [
            "Is"
          ],
          "explanation": "Для одной лампы вопрос начинается с Is there…?",
          "options": [
            "Are",
            "Is"
          ]
        },
        {
          "id": "there-question-many",
          "type": "choice",
          "instruction": "Выберите начало вопроса о нескольких стульях",
          "prompt": "___ there chairs in the kitchen?",
          "acceptedAnswers": [
            "Are"
          ],
          "explanation": "Chairs — несколько стульев: Are there chairs in the kitchen?",
          "options": [
            "Is",
            "Are"
          ]
        },
        {
          "id": "there-not-lamp",
          "type": "choice",
          "instruction": "Выберите отрицание: «В комнате нет лампы»",
          "prompt": "There ___ a lamp in the room.",
          "acceptedAnswers": [
            "isn't"
          ],
          "explanation": "Один предмет: There isn’t a lamp in the room.",
          "options": [
            "aren’t",
            "isn't"
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
          "id": "there-a-chair",
          "type": "blank",
          "instruction": "Вставьте is или are: «На кухне есть стул»",
          "prompt": "There ___ a chair in the kitchen.",
          "acceptedAnswers": [
            "is"
          ],
          "explanation": "A chair — один стул, используем is.",
          "placeholder": "Введите пропущенные слова"
        },
        {
          "id": "there-apples",
          "type": "blank",
          "instruction": "Вставьте is или are: «На столе три яблока»",
          "prompt": "There ___ three apples on the table.",
          "acceptedAnswers": [
            "are"
          ],
          "explanation": "Three apples — три предмета, поэтому are.",
          "placeholder": "Введите пропущенные слова"
        },
        {
          "id": "there-no-desk",
          "type": "blank",
          "instruction": "Вставьте is not или isn’t: «В комнате нет письменного стола»",
          "prompt": "There ___ a desk in the room.",
          "acceptedAnswers": [
            "is not",
            "isn't"
          ],
          "explanation": "Отрицание для одного предмета: There is not / isn’t a desk.",
          "placeholder": "Введите пропущенные слова"
        },
        {
          "id": "there-are-question",
          "type": "blank",
          "instruction": "Вставьте Is или Are в вопрос о двух книгах",
          "prompt": "___ there two books on the table?",
          "acceptedAnswers": [
            "Are"
          ],
          "explanation": "Вопрос о нескольких предметах: Are there two books on the table?",
          "placeholder": "Введите пропущенные слова"
        },
        {
          "id": "there-short-is",
          "type": "blank",
          "instruction": "Дополните утвердительный короткий ответ одним словом",
          "prompt": "Is there a table? — Yes, there ___.",
          "acceptedAnswers": [
            "is"
          ],
          "explanation": "Короткий ответ сохраняет is: Yes, there is.",
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
          "id": "there-desk-negative",
          "type": "written",
          "sentenceType": "negative",
          "instruction": "Сделайте предложение отрицательным; сохраните остальные слова",
          "prompt": "There is a desk in the room.",
          "acceptedAnswers": [
            "There is not a desk in the room.",
            "There isn't a desk in the room.",
            "There's not a desk in the room."
          ],
          "explanation": "There is not a desk in the room. — В комнате нет письменного стола. Можно сократить is not или there is.",
          "placeholder": "Напишите ответ на английском"
        },
        {
          "id": "there-book-question",
          "type": "written",
          "sentenceType": "question",
          "instruction": "Сделайте вопрос, сохранив остальные слова",
          "prompt": "There is a book on the table.",
          "acceptedAnswers": [
            "Is there a book on the table?"
          ],
          "explanation": "Поставьте Is перед there: Is there a book on the table? — На столе есть книга?",
          "placeholder": "Напишите ответ на английском"
        },
        {
          "id": "there-chairs-question",
          "type": "written",
          "sentenceType": "question",
          "instruction": "Сделайте вопрос, сохранив остальные слова",
          "prompt": "There are two chairs in the kitchen.",
          "acceptedAnswers": [
            "Are there two chairs in the kitchen?"
          ],
          "explanation": "Для нескольких предметов Are выходит перед there.",
          "placeholder": "Напишите ответ на английском"
        },
        {
          "id": "there-short-no",
          "type": "written",
          "sentenceType": "short-negative",
          "instruction": "Дайте короткий отрицательный ответ с No, there…",
          "prompt": "Is there a lamp?",
          "acceptedAnswers": [
            "No, there is not.",
            "No, there isn't.",
            "No, there's not.",
            "No there is not.",
            "No there isn't.",
            "No there's not."
          ],
          "explanation": "Отрицательный ответ: No, there is not. Можно сократить is not до isn’t или there is до there’s.",
          "placeholder": "Напишите ответ на английском"
        },
        {
          "id": "there-short-yes-plural",
          "type": "written",
          "sentenceType": "short-affirmative",
          "instruction": "Дайте короткий утвердительный ответ с Yes, there…",
          "prompt": "Are there books on the table?",
          "acceptedAnswers": [
            "Yes, there are.",
            "Yes there are."
          ],
          "explanation": "Сохраните are: Yes, there are. — Да.",
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
