import { createVocabularyLesson } from './createVocabularyLesson.ts';

export const actionsTimeLesson = createVocabularyLesson({
  "id": "actions-time",
  "title": "Действия и слова времени",
  "goal": "Различать действия сейчас и привычки, добавлять простые указания времени.",
  "note": "Now и right now указывают на эту минуту: am/is/are + -ing. Every day — привычка: Present Simple. Today может относиться к действию сейчас. At night — ночью; в нашей фразе это привычка. Положение слов времени указано в шаблоне задания.",
  "words": [
    {
      "id": "write",
      "term": "write",
      "meaningRu": "писать",
      "partOfSpeech": "глагол",
      "example": "Natasha is writing now.",
      "exampleTranslation": "Наташа сейчас пишет.",
      "recallClue": "Писать; начальная форма, не форма на -ing",
      "contextClue": "Наташа сейчас пишет. Шаблон: Natasha … now.",
      "sentenceAnswers": [
        "Natasha is writing now.",
        "Natasha's writing now."
      ],
      "spellingTip": "Write → writing: уберите немую e перед -ing. В начале write есть w.",
      "usage": "Write → writing: уберите немую e перед -ing. В начале write есть w."
    },
    {
      "id": "run",
      "term": "run",
      "meaningRu": "бегать",
      "partOfSpeech": "глагол",
      "example": "Gregory is running now.",
      "exampleTranslation": "Григорий сейчас бежит.",
      "recallClue": "Бегать; начальная форма",
      "contextClue": "Григорий сейчас бежит. Шаблон: Gregory … now.",
      "sentenceAnswers": [
        "Gregory is running now.",
        "Gregory's running now."
      ],
      "spellingTip": "Run → running: перед -ing удваиваем n.",
      "usage": "Run → running: перед -ing удваиваем n."
    },
    {
      "id": "listen",
      "term": "listen",
      "meaningRu": "слушать",
      "partOfSpeech": "глагол",
      "example": "I am listening to music.",
      "exampleTranslation": "Я слушаю музыку.",
      "recallClue": "Слушать; начальная форма без предлога",
      "contextClue": "Я слушаю музыку. Шаблон: I … to music.",
      "sentenceAnswers": [
        "I am listening to music.",
        "I'm listening to music."
      ],
      "spellingTip": "Listen to music — слушать музыку. Перед объектом нужен to; в listen есть t.",
      "usage": "Listen to music — слушать музыку. Перед объектом нужен to; в listen есть t."
    },
    {
      "id": "watch",
      "term": "watch",
      "meaningRu": "смотреть",
      "partOfSpeech": "глагол",
      "example": "We are watching TV.",
      "exampleTranslation": "Мы смотрим телевизор.",
      "recallClue": "Смотреть телевизор; начальная форма",
      "contextClue": "Мы смотрим телевизор. Шаблон: We … TV.",
      "sentenceAnswers": [
        "We are watching TV.",
        "We're watching TV."
      ],
      "spellingTip": "Watch TV — смотреть телевизор, без артикля; watch → watching.",
      "usage": "Watch TV — смотреть телевизор, без артикля; watch → watching."
    },
    {
      "id": "wait",
      "term": "wait",
      "meaningRu": "ждать",
      "partOfSpeech": "глагол",
      "example": "She is waiting here.",
      "exampleTranslation": "Она ждёт здесь.",
      "recallClue": "Ждать; начальная форма",
      "contextClue": "Она ждёт здесь. Шаблон: She … here.",
      "sentenceAnswers": [
        "She is waiting here.",
        "She's waiting here."
      ],
      "spellingTip": "Wait → waiting, без удвоения t. Here — здесь.",
      "usage": "Wait → waiting, без удвоения t. Here — здесь."
    },
    {
      "id": "now",
      "term": "now",
      "meaningRu": "сейчас",
      "partOfSpeech": "наречие",
      "example": "I am reading now.",
      "exampleTranslation": "Я сейчас читаю.",
      "recallClue": "Сейчас: одно короткое слово",
      "contextClue": "Я сейчас читаю. Шаблон: I …; слово времени в конце.",
      "sentenceAnswers": [
        "I am reading now.",
        "I'm reading now."
      ],
      "spellingTip": "Now — одно слово, три буквы. Reading — знакомая форма read + -ing.",
      "usage": "Now — одно слово, три буквы. Reading — знакомая форма read + -ing."
    },
    {
      "id": "right-now",
      "term": "right now",
      "meaningRu": "прямо сейчас",
      "partOfSpeech": "выражение времени",
      "example": "They are cooking right now.",
      "exampleTranslation": "Они готовят прямо сейчас.",
      "recallClue": "Прямо сейчас: выражение из двух слов",
      "contextClue": "Они готовят прямо сейчас. Шаблон: They …; выражение времени в конце.",
      "sentenceAnswers": [
        "They are cooking right now.",
        "They're cooking right now."
      ],
      "spellingTip": "Right now усиливает now. В right есть gh; два слова.",
      "usage": "Right now усиливает now. В right есть gh; два слова."
    },
    {
      "id": "today",
      "term": "today",
      "meaningRu": "сегодня",
      "partOfSpeech": "наречие",
      "example": "I am working at home today.",
      "exampleTranslation": "Я сегодня работаю дома.",
      "recallClue": "Сегодня, в этот день",
      "contextClue": "Я сегодня работаю дома. Шаблон: I … at home; слово времени в конце.",
      "sentenceAnswers": [
        "I am working at home today.",
        "I'm working at home today."
      ],
      "spellingTip": "Today пишется слитно. At home — дома; today поставьте в конец по условию.",
      "usage": "Today пишется слитно. At home — дома; today поставьте в конец по условию."
    },
    {
      "id": "every-day",
      "term": "every day",
      "meaningRu": "каждый день",
      "partOfSpeech": "выражение времени",
      "example": "We work every day.",
      "exampleTranslation": "Мы работаем каждый день.",
      "recallClue": "Каждый день: выражение из двух слов",
      "contextClue": "Мы работаем каждый день. Шаблон: We …; выражение времени в конце.",
      "sentenceAnswers": [
        "We work every day."
      ],
      "spellingTip": "Every day — два слова. Для привычки здесь work, не are working.",
      "usage": "Every day — два слова. Для привычки здесь work, не are working."
    },
    {
      "id": "at-night",
      "term": "at night",
      "meaningRu": "ночью",
      "partOfSpeech": "выражение времени",
      "example": "I read at night.",
      "exampleTranslation": "Я читаю ночью.",
      "recallClue": "Ночью: выражение с предлогом at",
      "contextClue": "Я читаю ночью. Шаблон: I …; выражение времени в конце.",
      "sentenceAnswers": [
        "I read at night."
      ],
      "spellingTip": "At night — два слова, без the. Здесь привычка, поэтому read, не am reading.",
      "usage": "At night — два слова, без the. Здесь привычка, поэтому read, не am reading."
    }
  ]
});
