import type { Lesson } from '../../types/lesson.ts';

export const canCantLesson: Lesson = {
  "id": "can-cant",
  "level": "A1",
  "title": "Can / Can’t — что мы умеем",
  "sample": false,
  "objectives": [
    "Рассказывать об умениях и возможностях с can.",
    "Говорить о том, что не получается, с can’t или cannot.",
    "Задавать вопросы с can и отвечать коротко."
  ],
  "steps": [
    {
      "id": "intro",
      "type": "intro",
      "completion": "acknowledge",
      "title": "Знакомство с уроком",
      "description": "Что будем изучать",
      "heading": "Что вы умеете?",
      "text": "Плавать, готовить или помогать друзьям? Can расскажет об умении или возможности. Хорошая новость: для всех местоимений форма одна.",
      "example": "Gregory can cook. Natasha can swim.",
      "translation": "Григорий умеет готовить. Наташа умеет плавать."
    },
    {
      "id": "theory",
      "type": "theory",
      "completion": "acknowledge",
      "title": "Теория",
      "description": "Правило и примеры",
      "heading": "Can не меняется. Удобно!",
      "text": "Can значит «уметь» или «мочь». После can используем глагол без -s и без to, даже с he и she.",
      "tableCaption": "Умение и возможность",
      "rows": [
        {
          "subject": "I / You / He / She / It / We / They",
          "form": "can",
          "example": "She can swim.",
          "translation": "Она умеет плавать."
        },
        {
          "subject": "I / You / He / She / It / We / They",
          "form": "can’t",
          "example": "We can’t come today.",
          "translation": "Мы не можем прийти сегодня."
        }
      ],
      "blocks": [
        {
          "title": "Чтобы сказать «не могу»",
          "text": "Can not и cannot допустимы, но обычная полная запись — cannot слитно. В разговоре удобно can’t.",
          "formula": "Кто + cannot/can’t + глагол",
          "example": "Natasha cannot swim. = Natasha can’t swim.",
          "translation": "Наташа не умеет плавать."
        },
        {
          "title": "Задайте вопрос",
          "text": "Поставьте can перед тем, о ком спрашиваете. Do/does здесь не нужны. В коротком ответе оставьте can или can’t.",
          "formula": "Can + кто + глагол + остальное?",
          "example": "Can you cook? — Yes, I can. / No, I can’t.",
          "translation": "Ты умеешь готовить? — Да. / Нет."
        },
        {
          "title": "Слова для практики",
          "text": "swim — плавать; cook — готовить; read — читать; help — помогать; come — приходить; today — сегодня. Play tennis — играть в теннис; read English — читать по-английски."
        }
      ],
      "noteTitle": "Одно can — для всех",
      "note": "He can swim, а не He cans swim. She can cook, а не She can to cook. No, she cannot. = No, she can’t. Отрицание ставим прямо после can, без don’t/doesn’t."
    },
    {
      "id": "choice",
      "type": "exercise",
      "completion": "all-correct",
      "title": "Выбор ответа",
      "description": "Упражнение 1",
      "questions": [
        {
          "id": "can-swim-base",
          "type": "choice",
          "instruction": "Выберите форму глагола: «Он умеет плавать»",
          "prompt": "He can ___.",
          "acceptedAnswers": [
            "swim"
          ],
          "explanation": "После can нужен swim без -s и без to.",
          "options": [
            "swims",
            "to swim",
            "swim"
          ]
        },
        {
          "id": "can-she-can",
          "type": "choice",
          "instruction": "Выберите форму: «Она умеет готовить»",
          "prompt": "She ___ cook.",
          "acceptedAnswers": [
            "can"
          ],
          "explanation": "Can одинаково для всех: She can cook.",
          "options": [
            "cans",
            "can",
            "does can"
          ]
        },
        {
          "id": "can-question",
          "type": "choice",
          "instruction": "Выберите начало вопроса об умении готовить",
          "prompt": "___ you cook?",
          "acceptedAnswers": [
            "Can"
          ],
          "explanation": "Can ставится перед you: Can you cook?",
          "options": [
            "Do can",
            "Can",
            "Does can"
          ]
        },
        {
          "id": "can-negative",
          "type": "choice",
          "instruction": "Выберите сокращение cannot: «Мы не можем прийти сегодня»",
          "prompt": "We ___ come today.",
          "acceptedAnswers": [
            "can't"
          ],
          "explanation": "Cannot сокращается до can’t: We can’t come today.",
          "options": [
            "can",
            "can't",
            "cans"
          ]
        },
        {
          "id": "can-positive-short",
          "type": "choice",
          "instruction": "Дополните утвердительный короткий ответ",
          "prompt": "Can they swim? — Yes, they ___.",
          "acceptedAnswers": [
            "can"
          ],
          "explanation": "В коротком ответе повторяем can, без swim.",
          "options": [
            "do",
            "are",
            "can"
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
          "id": "can-read",
          "type": "blank",
          "instruction": "Выразите умение изученным словом: «Я умею читать по-английски»",
          "prompt": "I ___ read English.",
          "acceptedAnswers": [
            "can"
          ],
          "explanation": "Для умения используем can: I can read English.",
          "placeholder": "Введите пропущенные слова"
        },
        {
          "id": "can-no-cook",
          "type": "blank",
          "instruction": "Вставьте отрицательную форму can: «Она не умеет готовить»",
          "prompt": "She ___ cook.",
          "acceptedAnswers": [
            "cannot",
            "can't",
            "can not"
          ],
          "explanation": "Отрицание can — cannot, can’t; допустимо и can not.",
          "placeholder": "Введите пропущенные слова"
        },
        {
          "id": "can-play-base",
          "type": "blank",
          "instruction": "Вставьте правильную форму play: «Он умеет играть в теннис»",
          "prompt": "He can ___ tennis.",
          "acceptedAnswers": [
            "play"
          ],
          "explanation": "После can глагол не получает -s: He can play tennis.",
          "placeholder": "Введите пропущенные слова"
        },
        {
          "id": "can-help-question",
          "type": "blank",
          "instruction": "Дополните вопрос о возможности словом из этого урока: «Григорий может помочь?»",
          "prompt": "___ Gregory help?",
          "acceptedAnswers": [
            "Can"
          ],
          "explanation": "В вопросе can ставится перед именем: Can Gregory help?",
          "placeholder": "Введите пропущенные слова"
        },
        {
          "id": "can-no-short",
          "type": "blank",
          "instruction": "Вставьте отрицательную форму can в короткий ответ",
          "prompt": "Can they come today? — No, they ___.",
          "acceptedAnswers": [
            "cannot",
            "can't",
            "can not"
          ],
          "explanation": "Отрицательный короткий ответ: No, they cannot. = No, they can’t.",
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
          "id": "can-he-negative",
          "type": "written",
          "instruction": "Сделайте предложение отрицательным; можно использовать сокращение",
          "prompt": "He can swim.",
          "acceptedAnswers": [
            "He cannot swim.",
            "He can't swim.",
            "He can not swim."
          ],
          "explanation": "Замените can на cannot / can’t: He cannot swim. — Он не умеет плавать.",
          "placeholder": "Напишите ответ на английском"
        },
        {
          "id": "can-you-question",
          "type": "written",
          "instruction": "Сделайте вопрос, сохранив местоимение you",
          "prompt": "You can cook.",
          "acceptedAnswers": [
            "Can you cook?"
          ],
          "explanation": "Поставьте Can перед you: Can you cook? — Ты умеешь готовить?",
          "placeholder": "Напишите ответ на английском"
        },
        {
          "id": "can-natasha-question",
          "type": "written",
          "instruction": "Сделайте вопрос, сохранив имя Natasha",
          "prompt": "Natasha can read English.",
          "acceptedAnswers": [
            "Can Natasha read English?"
          ],
          "explanation": "Can ставится перед именем: Can Natasha read English? — Наташа умеет читать по-английски?",
          "placeholder": "Напишите ответ на английском"
        },
        {
          "id": "can-i-short-yes",
          "type": "written",
          "instruction": "Дайте короткий утвердительный ответ о себе с Yes, I…",
          "prompt": "Can you help?",
          "acceptedAnswers": [
            "Yes, I can.",
            "Yes I can."
          ],
          "explanation": "На вопрос о себе ответьте с I: Yes, I can. — Да, могу.",
          "placeholder": "Напишите ответ на английском"
        },
        {
          "id": "can-she-short-no",
          "type": "written",
          "instruction": "Дайте короткий отрицательный ответ с No, she…",
          "prompt": "Can she play tennis?",
          "acceptedAnswers": [
            "No, she cannot.",
            "No, she can't.",
            "No, she can not.",
            "No she cannot.",
            "No she can't.",
            "No she can not."
          ],
          "explanation": "Короткий отрицательный ответ: No, she cannot. = No, she can’t. Основной глагол не повторяем.",
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
