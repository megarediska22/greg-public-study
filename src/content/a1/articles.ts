import type { Lesson } from '../../types/lesson.ts';

export const articlesLesson: Lesson = {
  "id": "articles",
  "level": "A1",
  "title": "A / An / The — артикли",
  "sample": false,
  "objectives": [
    "Выбирать a или an для одного предмета.",
    "Использовать the, когда понятно, о каком предмете речь.",
    "Различать первое упоминание и уже известный предмет."
  ],
  "steps": [
    {
      "id": "intro",
      "type": "intro",
      "completion": "acknowledge",
      "title": "Знакомство с уроком",
      "description": "Что будем изучать",
      "heading": "Маленькое слово перед предметом.",
      "text": "Слова a, an и the помогают понять: речь о каком-то предмете или о том самом? Разберём самые нужные случаи без длинных списков исключений.",
      "example": "I have a book. The book is here.",
      "translation": "У меня есть книга. Эта книга здесь."
    },
    {
      "id": "theory",
      "type": "theory",
      "completion": "acknowledge",
      "title": "Теория",
      "description": "Правило и примеры",
      "heading": "Какой-то предмет или тот самый?",
      "text": "A/an — один предмет, который называем впервые или выбираем любой. The — предмет, который уже известен или понятен собеседнику.",
      "tableCaption": "Артикль стоит перед названием предмета",
      "rows": [
        {
          "subject": "a book",
          "form": "a",
          "example": "I have a book.",
          "translation": "У меня есть книга. Называем её впервые."
        },
        {
          "subject": "an apple",
          "form": "an",
          "example": "Natasha has an apple.",
          "translation": "У Наташи есть яблоко. Называем его впервые."
        },
        {
          "subject": "the book",
          "form": "the",
          "example": "The book is here.",
          "translation": "Та самая книга здесь."
        }
      ],
      "blocks": [
        {
          "title": "A или an? Слушайте начало",
          "text": "A ставим перед согласным звуком, an — перед гласным. В наших примерах: a bag, a car, a cup; an apple, an egg, an orange, an umbrella.",
          "formula": "a + согласный звук · an + гласный звук"
        },
        {
          "title": "Уже знакомы? Тогда the",
          "text": "После первого упоминания можно сказать the. Например, сначала a bag, а затем the bag — уже понятно, какая сумка.",
          "example": "Gregory has a bag. The bag is red.",
          "translation": "У Грегори есть сумка. Эта сумка красная."
        },
        {
          "title": "Слова для практики",
          "text": "an egg — яйцо; an orange — апельсин; an umbrella — зонт; a cup — чашка; a key — ключ; red — красный. A/an подходят только для одного исчисляемого предмета. О кофе вообще говорим без артикля: I like coffee. — Я люблю кофе."
        }
      ],
      "noteTitle": "Не ищите артикль в русском",
      "note": "Перед одним предметом в таких фразах он нужен: I have a book, а не I have book. Выбирайте a/an по звуку, а не только по букве."
    },
    {
      "id": "choice",
      "type": "exercise",
      "completion": "all-correct",
      "title": "Выбор ответа",
      "description": "Упражнение 1",
      "questions": [
        {
          "id": "art-first-book",
          "type": "choice",
          "instruction": "Выберите артикль: одна любая книга, первое упоминание",
          "prompt": "I have ___ book.",
          "acceptedAnswers": [
            "a"
          ],
          "explanation": "Book начинается с согласного звука; одна новая книга — a book.",
          "options": [
            "a",
            "an",
            "the"
          ]
        },
        {
          "id": "art-first-apple",
          "type": "choice",
          "instruction": "Выберите артикль: одно яблоко, первое упоминание",
          "prompt": "She has ___ apple.",
          "acceptedAnswers": [
            "an"
          ],
          "explanation": "Apple начинается с гласного звука: an apple.",
          "options": [
            "the",
            "a",
            "an"
          ]
        },
        {
          "id": "art-first-egg",
          "type": "choice",
          "instruction": "Выберите артикль: одно яйцо, первое упоминание",
          "prompt": "He has ___ egg.",
          "acceptedAnswers": [
            "an"
          ],
          "explanation": "Перед гласным звуком в egg используйте an.",
          "options": [
            "a",
            "an",
            "the"
          ]
        },
        {
          "id": "art-known-bag",
          "type": "choice",
          "instruction": "Сумка уже упомянута. Выберите артикль во второй фразе",
          "prompt": "I have a bag. ___ bag is red.",
          "acceptedAnswers": [
            "The"
          ],
          "explanation": "Повторно говорим о той же сумке: The bag is red.",
          "options": [
            "A",
            "An",
            "The"
          ]
        },
        {
          "id": "art-known-teacher",
          "type": "choice",
          "instruction": "Оба собеседника знают, о каком учителе речь. Выберите артикль",
          "prompt": "___ teacher is here.",
          "acceptedAnswers": [
            "The"
          ],
          "explanation": "Если понятно, о каком учителе говорим, нужен the.",
          "options": [
            "The",
            "A",
            "An"
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
          "id": "art-car",
          "type": "blank",
          "instruction": "Вставьте a или an: одна машина, первое упоминание",
          "prompt": "We have ___ car.",
          "acceptedAnswers": [
            "a"
          ],
          "explanation": "Car начинается с согласного звука: a car.",
          "placeholder": "Введите пропущенные слова"
        },
        {
          "id": "art-umbrella",
          "type": "blank",
          "instruction": "Вставьте a или an: один зонт, первое упоминание",
          "prompt": "Natasha has ___ umbrella.",
          "acceptedAnswers": [
            "an"
          ],
          "explanation": "Umbrella начинается с гласного звука: an umbrella.",
          "placeholder": "Введите пропущенные слова"
        },
        {
          "id": "art-cup",
          "type": "blank",
          "instruction": "Вставьте a или an: одна чашка, первое упоминание",
          "prompt": "I have ___ cup.",
          "acceptedAnswers": [
            "a"
          ],
          "explanation": "Cup начинается с согласного звука: a cup.",
          "placeholder": "Введите пропущенные слова"
        },
        {
          "id": "art-known-key",
          "type": "blank",
          "instruction": "Ключ уже упомянут. Вставьте артикль во вторую фразу",
          "prompt": "Gregory has a key. ___ key is here.",
          "acceptedAnswers": [
            "The"
          ],
          "explanation": "Это тот же известный ключ: The key is here.",
          "placeholder": "Введите пропущенные слова"
        },
        {
          "id": "art-known-apple",
          "type": "blank",
          "instruction": "Яблоко уже упомянуто. Вставьте артикль во вторую фразу",
          "prompt": "I have an apple. ___ apple is red.",
          "acceptedAnswers": [
            "The"
          ],
          "explanation": "При повторном упоминании нужен the, даже перед гласным звуком.",
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
          "id": "art-add-book",
          "type": "written",
          "instruction": "Добавьте пропущенный артикль: одна книга, первое упоминание; сохраните остальные слова",
          "prompt": "I have book.",
          "acceptedAnswers": [
            "I have a book."
          ],
          "explanation": "Перед одним впервые названным предметом нужен a/an: I have a book.",
          "placeholder": "Напишите ответ на английском"
        },
        {
          "id": "art-fix-apple",
          "type": "written",
          "instruction": "Исправьте только артикль: яблоко упоминается впервые",
          "prompt": "She has a apple.",
          "acceptedAnswers": [
            "She has an apple."
          ],
          "explanation": "Перед гласным звуком в apple нужен an: She has an apple.",
          "placeholder": "Напишите ответ на английском"
        },
        {
          "id": "art-fix-car",
          "type": "written",
          "instruction": "Исправьте только артикль: машина упоминается впервые",
          "prompt": "We have an car.",
          "acceptedAnswers": [
            "We have a car."
          ],
          "explanation": "Перед согласным звуком в car нужен a: We have a car.",
          "placeholder": "Напишите ответ на английском"
        },
        {
          "id": "art-second-bag",
          "type": "written",
          "instruction": "Напишите только второе предложение целиком, вставив артикль; речь о той же сумке",
          "prompt": "I have a bag. ___ bag is red.",
          "acceptedAnswers": [
            "The bag is red."
          ],
          "explanation": "Во втором предложении сумка уже знакома: The bag is red.",
          "placeholder": "Напишите ответ на английском"
        },
        {
          "id": "art-known-orange",
          "type": "written",
          "instruction": "Апельсин уже известен собеседнику. Замените an на the; сохраните остальные слова",
          "prompt": "It is an orange.",
          "acceptedAnswers": [
            "It is the orange.",
            "It's the orange."
          ],
          "explanation": "Для уже известного предмета нужен the: It is the orange. Допустимо сокращение It’s.",
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
