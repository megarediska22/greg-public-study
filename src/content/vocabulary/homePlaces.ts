import { createVocabularyLesson } from './createVocabularyLesson.ts';

export const homePlacesLesson = createVocabularyLesson({
  "id": "home-places",
  "title": "Дом и места вокруг",
  "goal": "Описывать комнаты, обстановку и знакомые места.",
  "note": "A room — комната; in — в; here — здесь; near — рядом, поблизости. В living room два слова. Письменный стол — desk, обычный стол — table. В заданиях используйте знакомые there is, this is и am/is/are.",
  "words": [
    {
      "id": "kitchen",
      "term": "kitchen",
      "meaningRu": "кухня",
      "partOfSpeech": "существительное",
      "example": "Natasha is in the kitchen.",
      "exampleTranslation": "Наташа на кухне.",
      "recallClue": "Кухня: комната, где готовят",
      "contextClue": "Наташа на кухне. Шаблон: Natasha … in the …",
      "sentenceAnswers": [
        "Natasha is in the kitchen.",
        "Natasha's in the kitchen."
      ],
      "spellingTip": "Kitchen: сочетание tch и окончание -en. По-английски in the kitchen, хотя по-русски «на кухне».",
      "usage": "Kitchen: сочетание tch и окончание -en. По-английски in the kitchen, хотя по-русски «на кухне»."
    },
    {
      "id": "bedroom",
      "term": "bedroom",
      "meaningRu": "спальня",
      "partOfSpeech": "существительное",
      "example": "This is a bedroom.",
      "exampleTranslation": "Это спальня.",
      "recallClue": "Спальня: комната для сна",
      "contextClue": "Это спальня. Шаблон: This …",
      "sentenceAnswers": [
        "This is a bedroom."
      ],
      "spellingTip": "Bedroom пишется слитно: bed + room.",
      "usage": "Bedroom пишется слитно: bed + room."
    },
    {
      "id": "bathroom",
      "term": "bathroom",
      "meaningRu": "ванная комната",
      "partOfSpeech": "существительное",
      "example": "The bathroom is here.",
      "exampleTranslation": "Ванная комната здесь.",
      "recallClue": "Ванная комната; одно слово",
      "contextClue": "Ванная комната здесь. Шаблон: The … is here.",
      "sentenceAnswers": [
        "The bathroom is here.",
        "The bathroom's here."
      ],
      "spellingTip": "Bathroom — одно слово с th. В американском английском также комната с туалетом.",
      "usage": "Bathroom — одно слово с th. В американском английском также комната с туалетом."
    },
    {
      "id": "living-room",
      "term": "living room",
      "meaningRu": "гостиная",
      "partOfSpeech": "существительное",
      "example": "We are in the living room.",
      "exampleTranslation": "Мы в гостиной.",
      "recallClue": "Гостиная: общая комната для отдыха",
      "contextClue": "Мы в гостиной. Шаблон: We … in the …",
      "sentenceAnswers": [
        "We are in the living room.",
        "We're in the living room."
      ],
      "spellingTip": "Living room — два слова. Перед названием этой комнаты: in the living room.",
      "usage": "Living room — два слова. Перед названием этой комнаты: in the living room."
    },
    {
      "id": "table",
      "term": "table",
      "meaningRu": "стол",
      "partOfSpeech": "существительное",
      "example": "There is a table in the room.",
      "exampleTranslation": "В комнате есть стол.",
      "recallClue": "Стол для еды или других дел, не письменный стол",
      "contextClue": "В комнате есть стол. Шаблон: There … in the room.",
      "sentenceAnswers": [
        "There is a table in the room.",
        "There's a table in the room."
      ],
      "spellingTip": "Table заканчивается на -le. Desk — письменный стол; здесь table.",
      "usage": "Table заканчивается на -le. Desk — письменный стол; здесь table."
    },
    {
      "id": "chair",
      "term": "chair",
      "meaningRu": "стул",
      "partOfSpeech": "существительное",
      "example": "There is a chair here.",
      "exampleTranslation": "Здесь есть стул.",
      "recallClue": "Стул, на котором сидят",
      "contextClue": "Здесь есть стул. Шаблон: There … here.",
      "sentenceAnswers": [
        "There is a chair here.",
        "There's a chair here."
      ],
      "spellingTip": "Chair начинается с ch. Один стул: a chair.",
      "usage": "Chair начинается с ch. Один стул: a chair."
    },
    {
      "id": "bed",
      "term": "bed",
      "meaningRu": "кровать",
      "partOfSpeech": "существительное",
      "example": "The bed is in the room.",
      "exampleTranslation": "Кровать в комнате.",
      "recallClue": "Кровать: предмет мебели для сна",
      "contextClue": "Кровать в комнате. Шаблон: The … is in the room.",
      "sentenceAnswers": [
        "The bed is in the room.",
        "The bed's in the room."
      ],
      "spellingTip": "Bed — кровать, bedroom — спальня. Это разные слова.",
      "usage": "Bed — кровать, bedroom — спальня. Это разные слова."
    },
    {
      "id": "door",
      "term": "door",
      "meaningRu": "дверь",
      "partOfSpeech": "существительное",
      "example": "This is a door.",
      "exampleTranslation": "Это дверь.",
      "recallClue": "Дверь: через неё входят в комнату",
      "contextClue": "Это дверь. Шаблон: This …",
      "sentenceAnswers": [
        "This is a door."
      ],
      "spellingTip": "В door две o; в конце r.",
      "usage": "В door две o; в конце r."
    },
    {
      "id": "park",
      "term": "park",
      "meaningRu": "парк",
      "partOfSpeech": "существительное",
      "example": "Gregory is in the park.",
      "exampleTranslation": "Григорий в парке.",
      "recallClue": "Парк: место для прогулок",
      "contextClue": "Григорий в парке. Шаблон: Gregory … in the …",
      "sentenceAnswers": [
        "Gregory is in the park.",
        "Gregory's in the park."
      ],
      "spellingTip": "In the park — в парке. Gregory is можно сократить до Gregory’s.",
      "usage": "In the park — в парке. Gregory is можно сократить до Gregory’s."
    },
    {
      "id": "store",
      "term": "store",
      "meaningRu": "магазин",
      "partOfSpeech": "существительное",
      "example": "There is a store near the park.",
      "exampleTranslation": "Рядом с парком есть магазин.",
      "recallClue": "Магазин: американское слово из карточек",
      "contextClue": "Рядом с парком есть магазин. Шаблон: There … near the park.",
      "sentenceAnswers": [
        "There is a store near the park.",
        "There's a store near the park."
      ],
      "spellingTip": "Store — обычное американское слово для магазина; near the park — рядом с парком.",
      "usage": "Store — обычное американское слово для магазина; near the park — рядом с парком."
    }
  ]
});
