import { createVocabularyLesson } from './createVocabularyLesson.ts';

export const familyObjectsLesson = createVocabularyLesson({
  "id": "family-objects",
  "title": "Семья и вещи рядом",
  "goal": "Называть близких и простые вещи, которые есть под рукой.",
  "note": "Mother и father — нейтральные слова; mom и dad — разговорные «мама» и «папа». My — мой/моя. После my артикль не нужен: my mother. Для одного предмета без my используем a: a book. Семья в наших примерах вымышленная.",
  "words": [
    {
      "id": "mother",
      "term": "mother",
      "meaningRu": "мать",
      "partOfSpeech": "существительное",
      "example": "She is my mother.",
      "exampleTranslation": "Она моя мать.",
      "recallClue": "Мать: нейтральное слово, не разговорное «мама»",
      "contextClue": "Она моя мать. Шаблон: She … my …",
      "sentenceAnswers": [
        "She is my mother.",
        "She's my mother."
      ],
      "spellingTip": "Mother пишется с th. Разговорное mom здесь не требуется.",
      "usage": "Mother пишется с th. Разговорное mom здесь не требуется."
    },
    {
      "id": "father",
      "term": "father",
      "meaningRu": "отец",
      "partOfSpeech": "существительное",
      "example": "He is my father.",
      "exampleTranslation": "Он мой отец.",
      "recallClue": "Отец: нейтральное слово, не разговорное «папа»",
      "contextClue": "Он мой отец. Шаблон: He … my …",
      "sentenceAnswers": [
        "He is my father.",
        "He's my father."
      ],
      "spellingTip": "В father сочетание th. Разговорное dad здесь не требуется.",
      "usage": "В father сочетание th. Разговорное dad здесь не требуется."
    },
    {
      "id": "sister",
      "term": "sister",
      "meaningRu": "сестра",
      "partOfSpeech": "существительное",
      "example": "Natasha has a sister.",
      "exampleTranslation": "У Наташи есть сестра.",
      "recallClue": "Сестра",
      "contextClue": "У Наташи есть сестра. Шаблон: Natasha …",
      "sentenceAnswers": [
        "Natasha has a sister."
      ],
      "spellingTip": "С Natasha используем has; перед sister здесь нужен a.",
      "usage": "С Natasha используем has; перед sister здесь нужен a."
    },
    {
      "id": "brother",
      "term": "brother",
      "meaningRu": "брат",
      "partOfSpeech": "существительное",
      "example": "Gregory has a brother.",
      "exampleTranslation": "У Григория есть брат.",
      "recallClue": "Брат",
      "contextClue": "У Григория есть брат. Шаблон: Gregory …",
      "sentenceAnswers": [
        "Gregory has a brother."
      ],
      "spellingTip": "В brother сочетание th. Gregory has a brother — с has и a.",
      "usage": "В brother сочетание th. Gregory has a brother — с has и a."
    },
    {
      "id": "family",
      "term": "family",
      "meaningRu": "семья",
      "partOfSpeech": "существительное",
      "example": "I have a family.",
      "exampleTranslation": "У меня есть семья.",
      "recallClue": "Семья, не один родственник",
      "contextClue": "У меня есть семья. Шаблон: I …",
      "sentenceAnswers": [
        "I have a family."
      ],
      "spellingTip": "Family заканчивается на -ily. В I have a family есть a.",
      "usage": "Family заканчивается на -ily. В I have a family есть a."
    },
    {
      "id": "book",
      "term": "book",
      "meaningRu": "книга",
      "partOfSpeech": "существительное",
      "example": "I have a book.",
      "exampleTranslation": "У меня есть книга.",
      "recallClue": "Книга: предмет для чтения",
      "contextClue": "У меня есть книга. Шаблон: I …",
      "sentenceAnswers": [
        "I have a book."
      ],
      "spellingTip": "В book две o. Один предмет: a book.",
      "usage": "В book две o. Один предмет: a book."
    },
    {
      "id": "bag",
      "term": "bag",
      "meaningRu": "сумка",
      "partOfSpeech": "существительное",
      "example": "She has a bag.",
      "exampleTranslation": "У неё есть сумка.",
      "recallClue": "Сумка, в которой носят вещи",
      "contextClue": "У неё есть сумка. Шаблон: She …",
      "sentenceAnswers": [
        "She has a bag."
      ],
      "spellingTip": "Bag — три буквы. С she нужна форма has.",
      "usage": "Bag — три буквы. С she нужна форма has."
    },
    {
      "id": "phone",
      "term": "phone",
      "meaningRu": "телефон",
      "partOfSpeech": "существительное",
      "example": "I have a phone.",
      "exampleTranslation": "У меня есть телефон.",
      "recallClue": "Телефон: одно короткое слово из карточек",
      "contextClue": "У меня есть телефон. Шаблон: I …",
      "sentenceAnswers": [
        "I have a phone."
      ],
      "spellingTip": "Phone начинается с ph, заканчивается на e.",
      "usage": "Phone начинается с ph, заканчивается на e."
    },
    {
      "id": "key",
      "term": "key",
      "meaningRu": "ключ",
      "partOfSpeech": "существительное",
      "example": "The key is here.",
      "exampleTranslation": "Ключ здесь.",
      "recallClue": "Ключ от двери",
      "contextClue": "Ключ здесь. Шаблон: The … is here.",
      "sentenceAnswers": [
        "The key is here.",
        "The key's here."
      ],
      "spellingTip": "Key заканчивается на -ey. Here — здесь; the указывает на знакомый ключ.",
      "usage": "Key заканчивается на -ey. Here — здесь; the указывает на знакомый ключ."
    },
    {
      "id": "cup",
      "term": "cup",
      "meaningRu": "чашка",
      "partOfSpeech": "существительное",
      "example": "The cup is red.",
      "exampleTranslation": "Чашка красная.",
      "recallClue": "Чашка для чая, не стакан",
      "contextClue": "Чашка красная. Шаблон: The … is red.",
      "sentenceAnswers": [
        "The cup is red.",
        "The cup's red."
      ],
      "spellingTip": "Cup — чашка, glass — стакан. Red — красный; the — та самая чашка.",
      "usage": "Cup — чашка, glass — стакан. Red — красный; the — та самая чашка."
    }
  ]
});
