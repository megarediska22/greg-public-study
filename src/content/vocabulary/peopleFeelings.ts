import { createVocabularyLesson } from './createVocabularyLesson.ts';

export const peopleFeelingsLesson = createVocabularyLesson({
  "id": "people-feelings",
  "title": "Люди и чувства",
  "goal": "Представляться и говорить, как вы себя чувствуете.",
  "note": "После am/is/are называем человека или состояние. С профессией здесь нужен a: a teacher. С чувством артикля нет: I am happy. Сначала смысл, потом идеальное написание — всё получится.",
  "words": [
    {
      "id": "student",
      "term": "student",
      "meaningRu": "студент / студентка",
      "partOfSpeech": "существительное",
      "example": "I am a student.",
      "exampleTranslation": "Я студент / студентка.",
      "recallClue": "Студент или студентка, не учитель",
      "contextClue": "Я студент / студентка. Шаблон: I …",
      "sentenceAnswers": [
        "I am a student.",
        "I'm a student."
      ],
      "spellingTip": "Student пишется с u после st. Перед одним человеком: a student.",
      "usage": "Student пишется с u после st. Перед одним человеком: a student."
    },
    {
      "id": "teacher",
      "term": "teacher",
      "meaningRu": "учитель / учительница",
      "partOfSpeech": "существительное",
      "example": "Gregory is a teacher.",
      "exampleTranslation": "Григорий — учитель.",
      "recallClue": "Учитель или учительница",
      "contextClue": "Григорий — учитель. Шаблон: Gregory …",
      "sentenceAnswers": [
        "Gregory is a teacher.",
        "Gregory's a teacher."
      ],
      "spellingTip": "В teacher сочетание ch; перед профессией здесь ставим a.",
      "usage": "В teacher сочетание ch; перед профессией здесь ставим a."
    },
    {
      "id": "friend",
      "term": "friend",
      "meaningRu": "друг / подруга",
      "partOfSpeech": "существительное",
      "example": "Natasha is my friend.",
      "exampleTranslation": "Наташа — моя подруга.",
      "recallClue": "Друг или подруга; my означает «мой / моя»",
      "contextClue": "Наташа — моя подруга. Шаблон: Natasha …",
      "sentenceAnswers": [
        "Natasha is my friend.",
        "Natasha's my friend."
      ],
      "spellingTip": "My friend — мой друг или моя подруга. В friend сначала i, затем e.",
      "usage": "My friend — мой друг или моя подруга. В friend сначала i, затем e."
    },
    {
      "id": "happy",
      "term": "happy",
      "meaningRu": "счастливый / довольный",
      "partOfSpeech": "прилагательное",
      "example": "I am happy.",
      "exampleTranslation": "Я счастлив / счастлива.",
      "recallClue": "Счастливый, довольный; чувство радости",
      "contextClue": "Я счастлив / счастлива. Шаблон: I …",
      "sentenceAnswers": [
        "I am happy.",
        "I'm happy."
      ],
      "spellingTip": "В happy две p. После am/is/are перед чувством a не нужен.",
      "usage": "В happy две p. После am/is/are перед чувством a не нужен."
    },
    {
      "id": "sad",
      "term": "sad",
      "meaningRu": "грустный",
      "partOfSpeech": "прилагательное",
      "example": "She is sad.",
      "exampleTranslation": "Ей грустно.",
      "recallClue": "Грустный, не счастливый",
      "contextClue": "Ей грустно. Шаблон: She …",
      "sentenceAnswers": [
        "She is sad.",
        "She's sad."
      ],
      "spellingTip": "Sad — три буквы; это состояние, не действие.",
      "usage": "Sad — три буквы; это состояние, не действие."
    },
    {
      "id": "tired",
      "term": "tired",
      "meaningRu": "уставший",
      "partOfSpeech": "прилагательное",
      "example": "We are tired.",
      "exampleTranslation": "Мы устали.",
      "recallClue": "Уставший, когда нужен отдых",
      "contextClue": "Мы устали. Шаблон: We …",
      "sentenceAnswers": [
        "We are tired.",
        "We're tired."
      ],
      "spellingTip": "Tired заканчивается на -ed, но здесь это состояние: are tired.",
      "usage": "Tired заканчивается на -ed, но здесь это состояние: are tired."
    },
    {
      "id": "hungry",
      "term": "hungry",
      "meaningRu": "голодный",
      "partOfSpeech": "прилагательное",
      "example": "I am hungry.",
      "exampleTranslation": "Я голоден / голодна.",
      "recallClue": "Голодный: хочется есть",
      "contextClue": "Я голоден / голодна. Шаблон: I …",
      "sentenceAnswers": [
        "I am hungry.",
        "I'm hungry."
      ],
      "spellingTip": "Hungry — хочется есть. Перед y стоит r.",
      "usage": "Hungry — хочется есть. Перед y стоит r."
    },
    {
      "id": "thirsty",
      "term": "thirsty",
      "meaningRu": "испытывающий жажду",
      "partOfSpeech": "прилагательное",
      "example": "He is thirsty.",
      "exampleTranslation": "Он хочет пить.",
      "recallClue": "Испытывающий жажду: хочется пить",
      "contextClue": "Он хочет пить. Шаблон: He …",
      "sentenceAnswers": [
        "He is thirsty.",
        "He's thirsty."
      ],
      "spellingTip": "Thirsty — хочется пить; не путайте с hungry. Начало th-, конец -sty.",
      "usage": "Thirsty — хочется пить; не путайте с hungry. Начало th-, конец -sty."
    },
    {
      "id": "busy",
      "term": "busy",
      "meaningRu": "занятый",
      "partOfSpeech": "прилагательное",
      "example": "Natasha is busy.",
      "exampleTranslation": "Наташа занята.",
      "recallClue": "Занятый делами, не свободный",
      "contextClue": "Наташа занята. Шаблон: Natasha …",
      "sentenceAnswers": [
        "Natasha is busy.",
        "Natasha's busy."
      ],
      "spellingTip": "Busy пишется с u и одной s.",
      "usage": "Busy пишется с u и одной s."
    },
    {
      "id": "ready",
      "term": "ready",
      "meaningRu": "готовый",
      "partOfSpeech": "прилагательное",
      "example": "They are ready.",
      "exampleTranslation": "Они готовы.",
      "recallClue": "Готовый: можно начинать",
      "contextClue": "Они готовы. Шаблон: They …",
      "sentenceAnswers": [
        "They are ready.",
        "They're ready."
      ],
      "spellingTip": "В ready сочетание ea; ready — готовый, а не уставший.",
      "usage": "В ready сочетание ea; ready — готовый, а не уставший."
    }
  ]
});
