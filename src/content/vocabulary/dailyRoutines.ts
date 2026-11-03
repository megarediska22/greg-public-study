import { createVocabularyLesson } from './createVocabularyLesson.ts';

export const dailyRoutinesLesson = createVocabularyLesson({
  "id": "daily-routines",
  "title": "Каждый день: дела и привычки",
  "goal": "Рассказывать о привычном дне — от подъёма до сна.",
  "note": "Здесь выражения учим целиком: go to work, но come home без to. Have breakfast — завтракать; артикль не нужен. Используйте знакомый Present Simple. Все фразы в заданиях описывают привычки, а не эту минуту.",
  "words": [
    {
      "id": "wake-up",
      "term": "wake up",
      "meaningRu": "просыпаться",
      "partOfSpeech": "глагольное выражение",
      "example": "I wake up.",
      "exampleTranslation": "Я просыпаюсь.",
      "recallClue": "Просыпаться: переставать спать",
      "contextClue": "Я просыпаюсь. Шаблон: I …",
      "sentenceAnswers": [
        "I wake up."
      ],
      "spellingTip": "Wake up — два слова. Это проснуться; get up — встать с постели.",
      "usage": "Wake up — два слова. Это проснуться; get up — встать с постели."
    },
    {
      "id": "get-up",
      "term": "get up",
      "meaningRu": "вставать с постели",
      "partOfSpeech": "глагольное выражение",
      "example": "We get up.",
      "exampleTranslation": "Мы встаём с постели.",
      "recallClue": "Вставать с постели после пробуждения",
      "contextClue": "Мы встаём с постели. Шаблон: We …",
      "sentenceAnswers": [
        "We get up."
      ],
      "spellingTip": "Get up — два слова. Можно wake up и ещё немного полежать.",
      "usage": "Get up — два слова. Можно wake up и ещё немного полежать."
    },
    {
      "id": "have-breakfast",
      "term": "have breakfast",
      "meaningRu": "завтракать",
      "partOfSpeech": "глагольное выражение",
      "example": "I have breakfast.",
      "exampleTranslation": "Я завтракаю.",
      "recallClue": "Завтракать: выражение с have",
      "contextClue": "Я завтракаю. Шаблон: I …",
      "sentenceAnswers": [
        "I have breakfast."
      ],
      "spellingTip": "Have breakfast — без a. В breakfast после break идёт fast.",
      "usage": "Have breakfast — без a. В breakfast после break идёт fast."
    },
    {
      "id": "go-to-school",
      "term": "go to school",
      "meaningRu": "ходить в школу",
      "partOfSpeech": "глагольное выражение",
      "example": "They go to school.",
      "exampleTranslation": "Они ходят в школу.",
      "recallClue": "Ходить в школу как ученик: выражение с go",
      "contextClue": "Они ходят в школу. Шаблон: They …",
      "sentenceAnswers": [
        "They go to school."
      ],
      "spellingTip": "Go to school — три слова, без the, когда речь об учёбе.",
      "usage": "Go to school — три слова, без the, когда речь об учёбе."
    },
    {
      "id": "go-to-work",
      "term": "go to work",
      "meaningRu": "ходить на работу",
      "partOfSpeech": "глагольное выражение",
      "example": "I go to work.",
      "exampleTranslation": "Я хожу на работу.",
      "recallClue": "Ходить на работу: выражение с go",
      "contextClue": "Я хожу на работу. Шаблон: I …",
      "sentenceAnswers": [
        "I go to work."
      ],
      "spellingTip": "Go to work — без артикля перед work.",
      "usage": "Go to work — без артикля перед work."
    },
    {
      "id": "study",
      "term": "study",
      "meaningRu": "учиться / изучать",
      "partOfSpeech": "глагол",
      "example": "Natasha studies English.",
      "exampleTranslation": "Наташа изучает английский.",
      "recallClue": "Учиться или изучать предмет, например английский; начальная форма",
      "contextClue": "Наташа изучает английский. Шаблон: Natasha … English.",
      "sentenceAnswers": [
        "Natasha studies English."
      ],
      "spellingTip": "Study → studies с she или Natasha: y меняется на -ies. English — английский язык.",
      "usage": "Study → studies с she или Natasha: y меняется на -ies. English — английский язык."
    },
    {
      "id": "work",
      "term": "work",
      "meaningRu": "работать",
      "partOfSpeech": "глагол",
      "example": "Gregory works at home.",
      "exampleTranslation": "Григорий работает дома.",
      "recallClue": "Работать; начальная форма",
      "contextClue": "Григорий работает дома. Шаблон: Gregory … at home.",
      "sentenceAnswers": [
        "Gregory works at home."
      ],
      "spellingTip": "Gregory = he: work → works. At home — дома.",
      "usage": "Gregory = he: work → works. At home — дома."
    },
    {
      "id": "eat-lunch",
      "term": "eat lunch",
      "meaningRu": "есть обед",
      "partOfSpeech": "глагольное выражение",
      "example": "We eat lunch.",
      "exampleTranslation": "Мы едим обед.",
      "recallClue": "Есть обед: выражение с eat",
      "contextClue": "Мы едим обед. Шаблон: We …",
      "sentenceAnswers": [
        "We eat lunch."
      ],
      "spellingTip": "Eat lunch — без a перед lunch. Lunch — обед, не завтрак.",
      "usage": "Eat lunch — без a перед lunch. Lunch — обед, не завтрак."
    },
    {
      "id": "come-home",
      "term": "come home",
      "meaningRu": "приходить домой",
      "partOfSpeech": "глагольное выражение",
      "example": "I come home.",
      "exampleTranslation": "Я прихожу домой.",
      "recallClue": "Приходить домой: выражение с come",
      "contextClue": "Я прихожу домой. Шаблон: I …",
      "sentenceAnswers": [
        "I come home."
      ],
      "spellingTip": "Come home — без to. Два слова, а не come to home.",
      "usage": "Come home — без to. Два слова, а не come to home."
    },
    {
      "id": "go-to-bed",
      "term": "go to bed",
      "meaningRu": "ложиться спать",
      "partOfSpeech": "глагольное выражение",
      "example": "They go to bed.",
      "exampleTranslation": "Они ложатся спать.",
      "recallClue": "Ложиться спать: выражение с go",
      "contextClue": "Они ложатся спать. Шаблон: They …",
      "sentenceAnswers": [
        "They go to bed."
      ],
      "spellingTip": "Go to bed — без артикля: ложиться спать, а не просто идти к кровати.",
      "usage": "Go to bed — без артикля: ложиться спать, а не просто идти к кровати."
    }
  ]
});
