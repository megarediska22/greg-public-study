import type { Lesson } from '../../types/lesson.ts';

export const presentContinuousLesson: Lesson = {
  "id": "present-continuous",
  "level": "A1",
  "title": "Present Continuous — прямо сейчас",
  "sample": false,
  "objectives": [
    "Рассказывать о действиях, которые происходят сейчас.",
    "Соединять am/is/are с формой глагола на -ing.",
    "Строить отрицания и вопросы в Present Continuous."
  ],
  "steps": [
    {
      "id": "intro",
      "type": "intro",
      "completion": "acknowledge",
      "title": "Знакомство с уроком",
      "description": "Что будем изучать",
      "heading": "Стоп-кадр: что происходит сейчас?",
      "text": "Present Simple описывает привычки. Теперь посмотрим на действие в эту минуту: кто читает, кто готовит, а кто просто бежит.",
      "example": "Natasha is reading a book now.",
      "translation": "Наташа сейчас читает книгу."
    },
    {
      "id": "theory",
      "type": "theory",
      "completion": "acknowledge",
      "title": "Теория",
      "description": "Правило и примеры",
      "heading": "Сейчас = am/is/are + -ing.",
      "text": "Для действия в процессе используйте am/is/are и глагол с -ing. Now значит «сейчас». Глагол to be не пропускаем — он держит всю конструкцию.",
      "tableCaption": "Та же тройка форм, новое действие",
      "rows": [
        {
          "subject": "I",
          "form": "am + -ing",
          "example": "I am working now.",
          "translation": "Я сейчас работаю."
        },
        {
          "subject": "He / She / It",
          "form": "is + -ing",
          "example": "Gregory is cooking.",
          "translation": "Григорий готовит."
        },
        {
          "subject": "You / We / They",
          "form": "are + -ing",
          "example": "They are playing tennis.",
          "translation": "Они играют в теннис."
        }
      ],
      "blocks": [
        {
          "title": "Как получить -ing",
          "text": "Обычно просто добавьте -ing: read → reading, watch → watching, cook → cooking. Конечную немую e убираем: make → making, write → writing. В run и swim удваиваем последнюю согласную: running, swimming. В play и study букву y сохраняем.",
          "formula": "play → playing · study → studying"
        },
        {
          "title": "Отрицание и вопрос",
          "text": "Not ставим после am/is/are. В вопросе am/is/are выносим перед тем, о ком спрашиваем. Сокращения прежние: I’m not; he isn’t / he’s not; they aren’t / they’re not.",
          "formula": "Кто + am/is/are + not + глагол-ing",
          "example": "She is cooking. → Is she cooking?",
          "translation": "Она готовит. → Она готовит?"
        },
        {
          "title": "Привычка или эта минута?",
          "text": "Every day — каждый день: I work every day. — Я работаю каждый день. Now — сейчас: I’m working now. — Я сейчас работаю. Make tea — заваривать чай; write — писать; run — бегать."
        }
      ],
      "noteTitle": "Две части, не одна",
      "note": "I am working, а не I working и не I am work. В вопросе тоже сохраняем -ing: Are they playing? Отрицательные сокращения и полные формы равнозначны."
    },
    {
      "id": "choice",
      "type": "exercise",
      "completion": "all-correct",
      "title": "Выбор ответа",
      "description": "Упражнение 1",
      "questions": [
        {
          "id": "pc-i-am",
          "type": "choice",
          "instruction": "Выберите am/is/are: «Я сейчас пишу»",
          "prompt": "I ___ writing now.",
          "acceptedAnswers": [
            "am"
          ],
          "explanation": "С I нужна форма am, затем writing: I am writing now.",
          "options": [
            "is",
            "are",
            "am"
          ]
        },
        {
          "id": "pc-natasha-is",
          "type": "choice",
          "instruction": "Выберите am/is/are: «Наташа читает книгу»",
          "prompt": "Natasha ___ reading a book.",
          "acceptedAnswers": [
            "is"
          ],
          "explanation": "Для Natasha нужна форма is: Natasha is reading a book. — Наташа читает книгу.",
          "options": [
            "are",
            "is",
            "am"
          ]
        },
        {
          "id": "pc-they-are",
          "type": "choice",
          "instruction": "Выберите am/is/are: «Они сейчас играют в теннис»",
          "prompt": "They ___ playing tennis now.",
          "acceptedAnswers": [
            "are"
          ],
          "explanation": "С they нужна форма are: They are playing tennis now.",
          "options": [
            "are",
            "am",
            "is"
          ]
        },
        {
          "id": "pc-making",
          "type": "choice",
          "instruction": "Выберите форму make на -ing: «Она заваривает чай»",
          "prompt": "She is ___ tea.",
          "acceptedAnswers": [
            "making"
          ],
          "explanation": "В make конечная немая e исчезает перед -ing: making.",
          "options": [
            "makeing",
            "making",
            "makes"
          ]
        },
        {
          "id": "pc-running",
          "type": "choice",
          "instruction": "Выберите форму run на -ing: «Он сейчас бежит»",
          "prompt": "He is ___ now.",
          "acceptedAnswers": [
            "running"
          ],
          "explanation": "В run удваивается n: run → running.",
          "options": [
            "runing",
            "runs",
            "running"
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
          "id": "pc-cooking",
          "type": "blank",
          "instruction": "Поставьте cook в форму на -ing: «Я сейчас готовлю»",
          "prompt": "I am ___ now.",
          "acceptedAnswers": [
            "cooking"
          ],
          "explanation": "Добавьте -ing к cook: I am cooking now. — Я сейчас готовлю.",
          "placeholder": "Введите пропущенные слова"
        },
        {
          "id": "pc-watching",
          "type": "blank",
          "instruction": "Поставьте watch в форму на -ing: «Они смотрят телевизор»",
          "prompt": "They are ___ TV.",
          "acceptedAnswers": [
            "watching"
          ],
          "explanation": "Watch + ing = watching. Окончание -es здесь не нужно.",
          "placeholder": "Введите пропущенные слова"
        },
        {
          "id": "pc-writing",
          "type": "blank",
          "instruction": "Поставьте write в форму на -ing: «Она сейчас пишет»",
          "prompt": "She is ___ now.",
          "acceptedAnswers": [
            "writing"
          ],
          "explanation": "Уберите немую e: write → writing.",
          "placeholder": "Введите пропущенные слова"
        },
        {
          "id": "pc-swimming",
          "type": "blank",
          "instruction": "Поставьте swim в форму на -ing: «Мы сейчас плывём»",
          "prompt": "We are ___ now.",
          "acceptedAnswers": [
            "swimming"
          ],
          "explanation": "В swim последняя согласная удваивается: swimming.",
          "placeholder": "Введите пропущенные слова"
        },
        {
          "id": "pc-playing",
          "type": "blank",
          "instruction": "Поставьте play в форму на -ing: «Он играет в теннис»",
          "prompt": "He is ___ tennis.",
          "acceptedAnswers": [
            "playing"
          ],
          "explanation": "В play буква y сохраняется: play → playing.",
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
          "id": "pc-he-negative",
          "type": "written",
          "sentenceType": "negative",
          "instruction": "Сделайте предложение отрицательным; сохраните остальные слова",
          "prompt": "He is reading a book.",
          "acceptedAnswers": [
            "He is not reading a book.",
            "He isn't reading a book.",
            "He's not reading a book."
          ],
          "explanation": "Добавьте not после is. Допустимы He is not, He isn’t и He’s not; reading сохраняется.",
          "placeholder": "Напишите ответ на английском"
        },
        {
          "id": "pc-they-question",
          "type": "written",
          "sentenceType": "question",
          "instruction": "Сделайте вопрос, сохранив остальные слова",
          "prompt": "They are watching TV.",
          "acceptedAnswers": [
            "Are they watching TV?"
          ],
          "explanation": "Are ставится перед they, форма watching остаётся: Are they watching TV?",
          "placeholder": "Напишите ответ на английском"
        },
        {
          "id": "pc-i-negative",
          "type": "written",
          "sentenceType": "negative",
          "instruction": "Сделайте предложение отрицательным; можно использовать сокращение",
          "prompt": "I am working now.",
          "acceptedAnswers": [
            "I am not working now.",
            "I'm not working now."
          ],
          "explanation": "После am добавьте not: I am not working now. = I’m not working now.",
          "placeholder": "Напишите ответ на английском"
        },
        {
          "id": "pc-natasha-question",
          "type": "written",
          "sentenceType": "question",
          "instruction": "Сделайте вопрос, сохранив имя Natasha",
          "prompt": "Natasha is cooking.",
          "acceptedAnswers": [
            "Is Natasha cooking?"
          ],
          "explanation": "Is ставится перед именем: Is Natasha cooking? — Наташа готовит?",
          "placeholder": "Напишите ответ на английском"
        },
        {
          "id": "pc-run-now",
          "type": "written",
          "sentenceType": "affirmative",
          "instruction": "Скажите, что действие происходит сейчас: замените runs на is + форму run на -ing и добавьте now",
          "prompt": "He runs.",
          "acceptedAnswers": [
            "He is running now.",
            "He's running now."
          ],
          "explanation": "Действие сейчас: He is running now. = He’s running now. У running две буквы n.",
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
