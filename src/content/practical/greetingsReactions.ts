import { createPracticalLesson } from './createPracticalLesson.ts';

export const greetingsReactionsLesson = createPracticalLesson({
  "id": "greetings-reactions",
  "title": "Приветствия и реакции",
  "goal": "Поздороваться с другом, отреагировать на новость и попрощаться.",
  "note": "Короткие фразы учим целиком. How’s = how is; what’s = what is; that’s = that is. What’s up? и No way! оставьте для неформального разговора. No way! здесь выражает удивление, но в другом контексте может быть отказом. Для незнакомого человека подойдёт Hello. Не нужно изображать восторг, если вы его не чувствуете.",
  "dialogue": "Gregory: Hi! Good to see you. Natasha: Hi! How’s it going?",
  "dialogueTranslation": "Григорий: «Привет! Рад тебя видеть». Наташа: «Привет! Как дела?»",
  "words": [
    {
      "id": "hi",
      "term": "Hi!",
      "meaningRu": "Привет!",
      "partOfSpeech": "разговорная формула",
      "example": "Gregory: Hi! Natasha: Hi!",
      "exampleTranslation": "Григорий: «Привет!» Наташа: «Привет!»",
      "recallClue": "Неформальное «привет»: короткое слово из двух букв.",
      "contextClue": "Вы встретили друга. Поздоровайтесь коротким словом из карточек.",
      "sentenceAnswers": [
        "Hi!"
      ],
      "spellingTip": "Неформальное приветствие. В более официальной ситуации можно сказать Hello.",
      "usage": "Неформальное приветствие. В более официальной ситуации можно сказать Hello.",
      "contextTranslation": "Привет!"
    },
    {
      "id": "how-going",
      "term": "How's it going?",
      "meaningRu": "Как дела?",
      "partOfSpeech": "разговорная формула",
      "example": "Natasha: How's it going? Gregory: Good, thanks.",
      "exampleTranslation": "Наташа: «Как дела?» Григорий: «Хорошо, спасибо».",
      "recallClue": "Как дела? Вспомните вопрос из карточек с going.",
      "contextClue": "Вы встретили знакомого. Спросите, как дела, фразой с going. Начните с How.",
      "sentenceAnswers": [
        "How is it going?",
        "How's it going?"
      ],
      "spellingTip": "Дружеский вопрос о делах. Good, thanks — короткий ответ «хорошо, спасибо».",
      "usage": "Дружеский вопрос о делах. Good, thanks — короткий ответ «хорошо, спасибо».",
      "contextTranslation": "Как дела?",
      "recallAnswers": [
        "How's it going?",
        "How is it going?"
      ]
    },
    {
      "id": "whats-up",
      "term": "What's up?",
      "meaningRu": "Что нового?",
      "partOfSpeech": "разговорная формула",
      "example": "Gregory: What's up? Natasha: Not much.",
      "exampleTranslation": "Григорий: «Что нового?» Наташа: «Да ничего особенного».",
      "recallClue": "Что нового? Неформальный вопрос с up.",
      "contextClue": "Встретили приятеля. Спросите «Что нового?» вопросом с up.",
      "sentenceAnswers": [
        "What is up?",
        "What's up?"
      ],
      "spellingTip": "Очень неформально; это не вопрос «что находится наверху». Not much — «ничего особенного».",
      "usage": "Очень неформально; это не вопрос «что находится наверху». Not much — «ничего особенного».",
      "contextTranslation": "Что нового?",
      "recallAnswers": [
        "What's up?",
        "What is up?"
      ]
    },
    {
      "id": "good-see",
      "term": "Good to see you.",
      "meaningRu": "Рад / рада тебя видеть.",
      "partOfSpeech": "разговорная формула",
      "example": "Natasha: Good to see you. Gregory: You too!",
      "exampleTranslation": "Наташа: «Рада тебя видеть». Григорий: «Я тебя тоже!»",
      "recallClue": "Рад тебя видеть: выражение, начинающееся с Good.",
      "contextClue": "Вы встретили знакомого у школы. Скажите, что рады его видеть. Используйте фразу с Good.",
      "sentenceAnswers": [
        "Good to see you.",
        "It's good to see you.",
        "It is good to see you."
      ],
      "spellingTip": "Так можно сказать при встрече с уже знакомым человеком. You too — «я тебя тоже».",
      "usage": "Так можно сказать при встрече с уже знакомым человеком. You too — «я тебя тоже».",
      "contextTranslation": "Рад / рада тебя видеть.",
      "recallAnswers": [
        "Good to see you.",
        "It's good to see you.",
        "It is good to see you."
      ]
    },
    {
      "id": "long-time",
      "term": "Long time no see.",
      "meaningRu": "Давно не виделись.",
      "partOfSpeech": "разговорная формула",
      "example": "Gregory: Long time no see! Natasha: Good to see you.",
      "exampleTranslation": "Григорий: «Давно не виделись!» Наташа: «Рада тебя видеть».",
      "recallClue": "Давно не виделись: устойчивое приветствие с Long time.",
      "contextClue": "Вы встретили друга после долгого перерыва. Начните реплику с Long time.",
      "sentenceAnswers": [
        "Long time no see."
      ],
      "spellingTip": "Готовое неформальное выражение. Запомните no see: это не схема для обычных отрицаний.",
      "usage": "Готовое неформальное выражение. Запомните no see: это не схема для обычных отрицаний.",
      "contextTranslation": "Давно не виделись."
    },
    {
      "id": "really",
      "term": "Really?",
      "meaningRu": "Правда?",
      "partOfSpeech": "разговорная формула",
      "example": "Natasha: I can play the guitar. Gregory: Really?",
      "exampleTranslation": "Наташа: «Я умею играть на гитаре». Григорий: «Правда?»",
      "recallClue": "Правда? Одно слово, начинается с R.",
      "contextClue": "Знакомая рассказала о своём умении. Переспросите с интересом одним словом на R.",
      "sentenceAnswers": [
        "Really?"
      ],
      "spellingTip": "Покажите интерес интонацией. В really две l.",
      "usage": "Покажите интерес интонацией. В really две l.",
      "contextTranslation": "Правда?"
    },
    {
      "id": "no-way",
      "term": "No way!",
      "meaningRu": "Не может быть!",
      "partOfSpeech": "разговорная формула",
      "example": "Gregory: I have ten cats. Natasha: No way!",
      "exampleTranslation": "Григорий: «У меня десять кошек». Наташа: «Не может быть!»",
      "recallClue": "Не может быть! Удивлённая реакция из двух слов с No.",
      "contextClue": "Друг сообщил неожиданную новость. Вы удивлены, а не отказываете. Используйте два слова с No.",
      "sentenceAnswers": [
        "No way!"
      ],
      "spellingTip": "Среди друзей выражает удивление. Не используйте как нейтральный ответ на просьбу.",
      "usage": "Среди друзей выражает удивление. Не используйте как нейтральный ответ на просьбу.",
      "contextTranslation": "Не может быть!"
    },
    {
      "id": "awesome",
      "term": "That's awesome!",
      "meaningRu": "Это здорово!",
      "partOfSpeech": "разговорная формула",
      "example": "Natasha: I can swim now. Gregory: That's awesome!",
      "exampleTranslation": "Наташа: «Теперь я умею плавать». Григорий: «Это здорово!»",
      "recallClue": "Это здорово! Радостная реакция со словом awesome.",
      "contextClue": "Знакомая научилась плавать. Порадуйтесь за неё, используя awesome. Начните с That.",
      "sentenceAnswers": [
        "That is awesome!",
        "That's awesome!"
      ],
      "spellingTip": "Awesome здесь означает «здорово», а не «страшно». That’s = that is.",
      "usage": "Awesome здесь означает «здорово», а не «страшно». That’s = that is.",
      "contextTranslation": "Это здорово!",
      "recallAnswers": [
        "That's awesome!",
        "That is awesome!"
      ]
    },
    {
      "id": "take-care",
      "term": "Take care.",
      "meaningRu": "Береги себя.",
      "partOfSpeech": "разговорная формула",
      "example": "Gregory: Take care. Natasha: You too.",
      "exampleTranslation": "Григорий: «Береги себя». Наташа: «И ты».",
      "recallClue": "Береги себя: прощание из двух слов, начинается с Take.",
      "contextClue": "Вы прощаетесь с другом. Пожелайте беречь себя, начав с Take.",
      "sentenceAnswers": [
        "Take care."
      ],
      "spellingTip": "Дружеское прощание. Это не просьба взять какой-то предмет.",
      "usage": "Дружеское прощание. Это не просьба взять какой-то предмет.",
      "contextTranslation": "Береги себя."
    },
    {
      "id": "good-one",
      "term": "Have a good one.",
      "meaningRu": "Хорошего дня!",
      "partOfSpeech": "разговорная формула",
      "example": "Natasha: Have a good one! Gregory: Thanks, you too.",
      "exampleTranslation": "Наташа: «Хорошего дня!» Григорий: «Спасибо, и тебе».",
      "recallClue": "Хорошего дня: неформальная фраза, заканчивается на one.",
      "contextClue": "Уходите после короткой дружеской беседы. Пожелайте хорошего дня фразой с one.",
      "sentenceAnswers": [
        "Have a good one."
      ],
      "spellingTip": "Неформальное пожелание хорошего дня или вечера: смысл зависит от ситуации.",
      "usage": "Неформальное пожелание хорошего дня или вечера: смысл зависит от ситуации.",
      "contextTranslation": "Хорошего дня!"
    }
  ]
});
