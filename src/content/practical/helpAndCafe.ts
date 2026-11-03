import { createPracticalLesson } from './createPracticalLesson.ts';

export const helpAndCafeLesson = createPracticalLesson({
  "id": "help-and-cafe",
  "title": "Просьбы, помощь и кафе",
  "goal": "Попросить о помощи, уточнить непонятное и заказать напиток.",
  "note": "Can you + глагол…? просит собеседника помочь; Can I have…? просит что-то для себя. Please смягчает просьбу. I’d like = I would like — здесь готовая вежливая формула «я бы хотел / хотела», не правило об условных предложениях. A coffee — одна порция кофе. Menu — меню, salt — соль. Интонация и отношения тоже важны: не всякое короткое высказывание является грубостью.",
  "dialogue": "Natasha: Excuse me. Can I have the menu, please? Gregory: No problem.",
  "dialogueTranslation": "Наташа: «Извините. Можно мне меню?» Григорий: «Без проблем».",
  "words": [
    {
      "id": "excuse-me",
      "term": "Excuse me.",
      "meaningRu": "Извините, можно обратиться?",
      "partOfSpeech": "разговорная формула",
      "example": "Natasha: Excuse me. Gregory: Yes?",
      "exampleTranslation": "Наташа: «Извините». Григорий: «Да?»",
      "recallClue": "Извините: чтобы вежливо привлечь внимание перед просьбой.",
      "contextClue": "Нужно обратиться к сотруднику кафе. Привлеките внимание фразой с Excuse.",
      "sentenceAnswers": [
        "Excuse me."
      ],
      "spellingTip": "Excuse me — чтобы обратиться или пройти; sorry чаще выражает извинение за случившееся.",
      "usage": "Excuse me — чтобы обратиться или пройти; sorry чаще выражает извинение за случившееся.",
      "contextTranslation": "Извините, можно обратиться?"
    },
    {
      "id": "help-please",
      "term": "Can you help me, please?",
      "meaningRu": "Помогите мне, пожалуйста.",
      "partOfSpeech": "разговорная формула",
      "example": "Natasha: Can you help me, please? Gregory: Yes.",
      "exampleTranslation": "Наташа: «Можешь мне помочь, пожалуйста?» Григорий: «Да».",
      "recallClue": "Можешь мне помочь, пожалуйста? Начните с Can you, please в конце.",
      "contextClue": "Нужна помощь одноклассника. Попросите помочь вам: Can you …, please?",
      "sentenceAnswers": [
        "Can you help me, please?",
        "Can you help me please?"
      ],
      "spellingTip": "После can нужна начальная форма help. Запятая перед please необязательна для проверки.",
      "usage": "После can нужна начальная форма help. Запятая перед please необязательна для проверки.",
      "contextTranslation": "Помогите мне, пожалуйста.",
      "recallAnswers": [
        "Can you help me, please?",
        "Can you help me please?"
      ]
    },
    {
      "id": "menu-please",
      "term": "Can I have the menu, please?",
      "meaningRu": "Можно мне меню, пожалуйста?",
      "partOfSpeech": "разговорная формула",
      "example": "Can I have the menu, please?",
      "exampleTranslation": "Можно мне меню, пожалуйста?",
      "recallClue": "Можно мне меню, пожалуйста? Начните с Can I have the.",
      "contextClue": "Попросите меню в кафе. Шаблон: Can I have the …, please?",
      "sentenceAnswers": [
        "Can I have the menu, please?",
        "Can I have the menu please?"
      ],
      "spellingTip": "Can I have…? — просьба что-то дать, а не вопрос об умении. Menu — меню.",
      "usage": "Can I have…? — просьба что-то дать, а не вопрос об умении. Menu — меню.",
      "contextTranslation": "Можно мне меню, пожалуйста?",
      "recallAnswers": [
        "Can I have the menu, please?",
        "Can I have the menu please?"
      ]
    },
    {
      "id": "coffee-please",
      "term": "I'd like a coffee, please.",
      "meaningRu": "Я бы хотел / хотела кофе.",
      "partOfSpeech": "разговорная формула",
      "example": "Natasha: I’d like a coffee, please. Gregory: A coffee? No problem.",
      "exampleTranslation": "Наташа: «Мне, пожалуйста, кофе». Григорий: «Кофе? Без проблем».",
      "recallClue": "Я бы хотел кофе, пожалуйста: вежливая формула с I would like; одна порция.",
      "contextClue": "Закажите одну порцию кофе. Начните с I would like или I’d like; please поставьте в конец.",
      "sentenceAnswers": [
        "I would like a coffee, please.",
        "I'd like a coffee, please.",
        "I would like a coffee please.",
        "I'd like a coffee please."
      ],
      "spellingTip": "A coffee — одна чашка или порция. I’d like не заменяет I like: первое — заказ, второе — предпочтение.",
      "usage": "A coffee — одна чашка или порция. I’d like не заменяет I like: первое — заказ, второе — предпочтение.",
      "contextTranslation": "Я бы хотел / хотела кофе.",
      "recallAnswers": [
        "I'd like a coffee, please.",
        "I would like a coffee, please.",
        "I'd like a coffee please.",
        "I would like a coffee please."
      ]
    },
    {
      "id": "salt-please",
      "term": "Can you pass me the salt, please?",
      "meaningRu": "Передай мне соль, пожалуйста.",
      "partOfSpeech": "разговорная формула",
      "example": "Can you pass me the salt, please?",
      "exampleTranslation": "Передай мне соль, пожалуйста.",
      "recallClue": "Передай мне соль, пожалуйста: просьба с Can you pass, please в конце.",
      "contextClue": "Соль на другом конце стола. Попросите её передать: Can you pass …, please?",
      "sentenceAnswers": [
        "Can you pass me the salt, please?",
        "Can you pass me the salt please?"
      ],
      "spellingTip": "Pass me the salt — передать мне соль. Здесь the salt — конкретная соль на столе.",
      "usage": "Pass me the salt — передать мне соль. Здесь the salt — конкретная соль на столе.",
      "contextTranslation": "Передай мне соль, пожалуйста.",
      "recallAnswers": [
        "Can you pass me the salt, please?",
        "Can you pass me the salt please?"
      ]
    },
    {
      "id": "say-again",
      "term": "Can you say that again, please?",
      "meaningRu": "Повтори, пожалуйста.",
      "partOfSpeech": "разговорная формула",
      "example": "Natasha: Can you say that again, please? Gregory: At three.",
      "exampleTranslation": "Наташа: «Повтори, пожалуйста». Григорий: «В три».",
      "recallClue": "Можешь повторить, пожалуйста? Используйте say that again с Can you.",
      "contextClue": "Вы не расслышали время. Попросите повторить: Can you …, please?",
      "sentenceAnswers": [
        "Can you say that again, please?",
        "Can you say that again please?"
      ],
      "spellingTip": "Again — ещё раз. That здесь относится к сказанному, а не к далёкому предмету.",
      "usage": "Again — ещё раз. That здесь относится к сказанному, а не к далёкому предмету.",
      "contextTranslation": "Повтори, пожалуйста.",
      "recallAnswers": [
        "Can you say that again, please?",
        "Can you say that again please?"
      ]
    },
    {
      "id": "dont-understand",
      "term": "I don't understand.",
      "meaningRu": "Я не понимаю.",
      "partOfSpeech": "разговорная формула",
      "example": "Gregory: I don't understand. Natasha: No problem.",
      "exampleTranslation": "Григорий: «Я не понимаю». Наташа: «Ничего страшного».",
      "recallClue": "Я не понимаю: отрицание с do not и understand.",
      "contextClue": "Вы не поняли объяснение. Скажите это прямо: I do not …; можно сокращение.",
      "sentenceAnswers": [
        "I do not understand.",
        "I don't understand."
      ],
      "spellingTip": "После don’t глагол understand без окончания. Это удобный первый шаг к уточнению.",
      "usage": "После don’t глагол understand без окончания. Это удобный первый шаг к уточнению.",
      "contextTranslation": "Я не понимаю.",
      "recallAnswers": [
        "I don't understand.",
        "I do not understand."
      ]
    },
    {
      "id": "what-mean",
      "term": "What do you mean?",
      "meaningRu": "Что ты имеешь в виду?",
      "partOfSpeech": "разговорная формула",
      "example": "Gregory: What do you mean? Natasha: I can help you.",
      "exampleTranslation": "Григорий: «Что ты имеешь в виду?» Наташа: «Я могу тебе помочь».",
      "recallClue": "Что ты имеешь в виду? Вопрос с What и mean.",
      "contextClue": "Слова вы услышали, но смысл непонятен. Уточните вопросом с What и mean.",
      "sentenceAnswers": [
        "What do you mean?"
      ],
      "spellingTip": "Спросите спокойным тоном: с резкой интонацией фраза может звучать как возражение.",
      "usage": "Спросите спокойным тоном: с резкой интонацией фраза может звучать как возражение.",
      "contextTranslation": "Что ты имеешь в виду?"
    },
    {
      "id": "no-problem",
      "term": "No problem.",
      "meaningRu": "Без проблем.",
      "partOfSpeech": "разговорная формула",
      "example": "Natasha: Can you help me? Gregory: No problem.",
      "exampleTranslation": "Наташа: «Можешь помочь?» Григорий: «Без проблем».",
      "recallClue": "Без проблем: короткий ответ на просьбу с No.",
      "contextClue": "Знакомый попросил помочь, и вы согласны. Ответьте двумя словами с No.",
      "sentenceAnswers": [
        "No problem."
      ],
      "spellingTip": "Дружеское согласие помочь; также бывает ответом на благодарность.",
      "usage": "Дружеское согласие помочь; также бывает ответом на благодарность.",
      "contextTranslation": "Без проблем."
    },
    {
      "id": "thanks-anyway",
      "term": "Thank you anyway.",
      "meaningRu": "Всё равно спасибо.",
      "partOfSpeech": "разговорная формула",
      "example": "Gregory: I can’t help today. Natasha: Thank you anyway.",
      "exampleTranslation": "Григорий: «Сегодня не могу помочь». Наташа: «Всё равно спасибо».",
      "recallClue": "Всё равно спасибо: поблагодарите за попытку, закончите anyway.",
      "contextClue": "Друг не смог помочь, но вы цените попытку. Поблагодарите фразой с anyway.",
      "sentenceAnswers": [
        "Thank you anyway.",
        "Thanks anyway."
      ],
      "spellingTip": "Благодарность за попытку, даже если результата нет. Без сарказма — спокойным тоном.",
      "usage": "Благодарность за попытку, даже если результата нет. Без сарказма — спокойным тоном.",
      "contextTranslation": "Всё равно спасибо.",
      "recallAnswers": [
        "Thank you anyway.",
        "Thanks anyway."
      ]
    }
  ]
});
