import { defineLesson, type LessonDefinition } from './defineLesson.ts';

// Pilot exit: exit-price (B), exit-payment-method (C), exit-card-question (W).
// Human first-attempt criterion: all three required; unit price differs from receipt total.
const definition = {
  id: 'store-prices-and-payment', title: 'Цены и оплата в магазине',
  objectives: ['Прочитать цену в долларах и отличить её от суммы в чеке.', 'Определить разрешённый способ оплаты по правилу магазина.', 'Задать вопрос о цене или оплате с учётом ситуации.'],
  intro: {
    title: 'У полки и у кассы', description: 'Сравниваем ценник, правило оплаты и учебный чек.', heading: 'Одна ручка или вся покупка?',
    text: 'В Cedar Store ценник: Pen — $2.50 each. Правило: We accept cash and cards. Учебный чек: 2 pens; Total $5.00; Paid: cash. Одна ручка стоит $2.50, вся покупка — $5.00. То, что покупатель заплатил наличными, не отменяет приём карт. Вспомним this/these из №9 и вопрос Can I …? из №19.',
    example: 'Customer: Can I pay by card? Clerk: Yes. We accept cards.',
    translation: 'Покупатель: «Можно заплатить картой?» Продавец: «Да. Мы принимаем карты».',
  },
  theory: {
    title: 'Цена, сумма и способ оплаты', description: 'Читаем денежные обозначения и задаём короткие вопросы.', heading: '$2.50 — два доллара пятьдесят центов',
    text: 'Price — цена; dollar — доллар; cent — цент. $ ставится перед числом, точка отделяет доллары от центов: $2.50 = 2 dollars and 50 cents. $3.00 = 3 dollars; $0.50 = 50 cents. В $2.05 пять центов, а не пятьдесят. В этом уроке суммы окончательные: налоги и другие доплаты уже включены, ничего добавлять не нужно.',
    subjectHeading: 'Ситуация', tableCaption: 'Вопросы и ответы у кассы',
    rows: [
      { subject: 'One item', subjectTranslation: 'Один предмет', form: 'How much is this …?', example: 'How much is this pen?', translation: 'Сколько стоит эта ручка?' },
      { subject: 'Several items', subjectTranslation: 'Несколько предметов', form: 'How much are these …?', example: 'How much are these pens?', translation: 'Сколько стоят эти ручки?' },
      { subject: 'Unit price', subjectTranslation: 'Цена одного', form: "It is … . / It's … .", example: "It's $2.50.", translation: 'Она стоит 2 доллара 50 центов.' },
      { subject: 'Total price', subjectTranslation: 'Сумма за несколько', form: "They are … . / They're … .", example: "They're $5.00.", translation: 'Они стоят 5 долларов.' },
      { subject: 'Card payment', subjectTranslation: 'Оплата картой', form: 'Can I pay by card / with a card?', example: 'Can I pay with a card?', translation: 'Можно заплатить картой?' },
      { subject: 'Cash payment', subjectTranslation: 'Оплата наличными', form: 'Can I pay in cash / with cash?', example: 'Can I pay in cash?', translation: 'Можно заплатить наличными?' },
    ],
    blocks: [
      { title: 'Слова на ценнике и в чеке', text: 'Pen — ручка, pens — ручки; notebook — блокнот, notebooks — блокноты. Each — за штуку. Receipt — чек; total — общая сумма; paid — оплачено. Tag — ценник; policy — правило; payment — оплата; cash — наличные, card — карта. Cash only — только наличные. We accept cards — мы принимаем карты; We accept cash and cards — мы принимаем наличные и карты.', example: 'Tag: Pen $2.50 each. Receipt: 2 pens. Total $5.00.', translation: 'Ценник: ручка — 2 доллара 50 центов за штуку. Чек: 2 ручки. Итого 5 долларов.' },
      { title: 'Вспоминаем this и these', text: 'This + один предмет требует is. These + несколько предметов требует are. Без названия предмета тоже можно спросить How much is this? или How much are these? В заданиях с конкретным названием сохраните его. Для общей цены можно добавить together («вместе») или in total («всего»): How much are these pens in total?', example: 'How much are these notebooks?', translation: 'Сколько стоят эти блокноты?' },
      { title: 'Вспоминаем Can I', text: 'После Can I используем pay без to. Для карты естественны by card и with a card. Для наличных — in cash или with cash. В ограниченных заданиях используйте указанный предлог. Политика приёма оплаты важнее строки Paid в отдельном чеке.', example: 'Policy: Cash only. Can I pay in cash?', translation: 'Правило: только наличные. Можно заплатить наличными?' },
      { title: 'Как записывать сумму', text: 'В ответах о цене используйте знак $ и цифры с точкой: $5.00. Для целых долларов допустимо $5. Если просим доллары и центы отдельно, пишите только указанную часть цифрами. Так задача проверяет чтение цены, а не разные способы написания числительных.' },
    ],
    noteTitle: 'Чек и правило отвечают на разные вопросы', note: 'Paid: cash говорит, как оплатили эту покупку. Только Policy сообщает, какие способы магазин разрешает. Each показывает цену одной штуки; Total — сумму за всю покупку.',
  },
  choice: {
    title: 'Найдите нужную сумму и правило', description: 'Опирайтесь на подписи к данным, а не только на числа.',
    questions: [
      { id: 'unit-price', task: { action: 'choose' }, instruction: 'Сколько стоит одна ручка?', prompt: 'Cedar Store. Tag: Pen — $2.50 each. Receipt: 2 pens; Total $5.00; Paid: cash.', promptLanguage: 'en', optionsLanguage: 'en', options: ['$5.00', '$0.50', '$2.50'], acceptedAnswers: ['$2.50'], explanation: 'Each указывает цену одной ручки — $2.50. $5.00 в чеке относится к двум ручкам.' },
      { id: 'receipt-versus-policy', task: { action: 'choose' }, instruction: 'Можно ли по этому правилу заплатить картой?', prompt: 'Cedar Store. Policy: We accept cash and cards. Receipt: Total $5.00. Paid: cash.', promptLanguage: 'en', optionsLanguage: 'ru', options: ['Да, правило разрешает карту', 'Нет, в чеке написано cash', 'Да, потому что сумма равна пяти долларам'], acceptedAnswers: ['Да, правило разрешает карту'], explanation: 'We accept cash and cards явно разрешает карту. Paid: cash описывает только способ оплаты конкретного чека; сумма сама по себе ничего не разрешает.' },
      { id: 'decimal-reading', task: { action: 'choose' }, instruction: 'Как правильно прочитать цену?', prompt: 'Tag: Pen — $2.05 each.', promptLanguage: 'en', optionsLanguage: 'ru', options: ['Два доллара пятьдесят центов', 'Два доллара пять центов', 'Двадцать долларов пять центов'], acceptedAnswers: ['Два доллара пять центов'], explanation: 'После точки 05: это пять центов. Для пятидесяти центов нужна запись .50.' },
      { id: 'plural-price-question', task: { action: 'choose' }, instruction: 'Выберите вопрос о цене нескольких блокнотов.', prompt: 'Несколько блокнотов без ценника.', promptLanguage: 'ru', optionsLanguage: 'en', options: ['How much is these notebooks?', 'How much are this notebook?', 'How much are these notebooks?'], acceptedAnswers: ['How much are these notebooks?'], explanation: 'These notebooks — несколько предметов, поэтому are. This и is нужны для одного блокнота.' },
      { id: 'exit-payment-method', task: { action: 'choose' }, instruction: 'Новая покупка: какие способы разрешены по правилу магазина? Выберите полный набор.', prompt: 'Birch Store. Tag: Notebook — $3.00 each. Receipt: 2 notebooks; Total $6.00; Paid: cash. Policy: We accept cash and cards.', promptLanguage: 'en', optionsLanguage: 'en', options: ['Cash only', 'Cash and cards', 'Card only'], acceptedAnswers: ['Cash and cards'], explanation: 'В новом магазине правило We accept cash and cards разрешает оба способа. В чеке Paid: cash, но это только способ оплаты данной покупки.' },
    ],
  },
  blank: {
    title: 'Восстановите цену и слова', description: 'Пишите только нужную часть, без лишних слов.',
    questions: [
      { id: 'cents-part', task: { action: 'fill' }, instruction: 'Впишите количество центов цифрами.', prompt: '$2.50 = 2 dollars and ___ cents.', promptLanguage: 'en', acceptedAnswers: ['50'], explanation: 'Две цифры после точки задают центы. В $2.50 это 50, не 5 и не 250.' },
      { id: 'recall-receipt', task: { action: 'recall' }, instruction: 'Вспомните английское слово «чек»: одно слово.', prompt: 'Бумага с позициями покупки, Total и Paid.', promptLanguage: 'ru', acceptedAnswers: ['receipt'], explanation: 'Receipt — чек. Price — цена, а total — сумма; это не названия документа.' },
      { id: 'retrieve-is', task: { action: 'fill' }, instruction: 'Вспомните this из №9: вставьте is или are.', prompt: 'How much ___ this pen?', promptLanguage: 'en', acceptedAnswers: ['is'], explanation: 'This pen — одна ручка, поэтому is. These pens потребовало бы are.' },
      { id: 'recall-cash', task: { action: 'fill' }, instruction: 'Вставьте слово «наличные».', prompt: 'Can I pay in ___?', promptLanguage: 'en', acceptedAnswers: ['cash'], explanation: 'In cash означает «наличными». Для карты используем by card или with a card.' },
      { id: 'exit-price', task: { action: 'fill' }, instruction: 'Впишите цену одного блокнота с ценника со знаком $. Можно с .00 или без него.', prompt: 'Birch Store. Tag: Notebook — $3.00 each. Receipt: 2 notebooks; Total $6.00; Paid: cash. Policy: We accept cash and cards. One notebook: ___.', promptLanguage: 'en', acceptedAnswers: ['$3.00', '$3'], explanation: 'На ценнике $3.00 each: один блокнот стоит три доллара. Total $6.00 в чеке относится к двум блокнотам, а не к одному.' },
    ],
  },
  written: {
    title: 'Поговорите у кассы', description: 'Составьте вопрос или короткий ответ по новой ситуации.',
    questions: [
      { id: 'ask-one-price', task: { action: 'ask', form: 'question' }, sentenceType: 'question', instruction: 'Спросите цену одной ручки. Начните с How much; используйте this pen.', prompt: 'Вы держите одну ручку без ценника.', promptLanguage: 'ru', acceptedAnswers: ['How much is this pen?'], explanation: 'This pen — единственное число, поэтому How much is this pen? Не меняйте this на these.' },
      { id: 'retrieve-cash-request', task: { action: 'request', form: 'question' }, sentenceType: 'question', instruction: 'Спросите кассира, можно ли заплатить наличными. Обязательно начните с Can I pay; добавьте только in cash или with cash.', prompt: 'Elm Store. Policy: Cash only.', promptLanguage: 'en', acceptedAnswers: ['Can I pay in cash?', 'Can I pay with cash?'], explanation: 'Can I pay in cash? и Can I pay with cash? спрашивают об оплате наличными. После Can I нет to. В этой учебной ситуации правило Cash only.' },
      { id: 'answer-one-price', task: { action: 'short', form: 'affirmative' }, sentenceType: 'affirmative', instruction: 'Ответьте о цене одной ручки. Начните с It is или сокращения; сумму запишите как на ценнике.', prompt: 'Tag: Pen — $2.50 each. Customer: How much is this pen?', promptLanguage: 'en', acceptedAnswers: ['It is $2.50.', "It's $2.50."], explanation: 'Одна ручка стоит $2.50. Для одного предмета ответ It is или It’s, без They are.' },
      { id: 'notebook-price-question', task: { action: 'ask', form: 'question' }, sentenceType: 'question', instruction: 'Вы показываете на оба блокнота. Спросите их общую цену: начните с How much, используйте these notebooks. Можно добавить только together или in total в конце.', prompt: 'Birch Store. Receipt: 2 notebooks; Total $6.00.', promptLanguage: 'en', acceptedAnswers: ['How much are these notebooks?', 'How much are these notebooks together?', 'How much are these notebooks in total?'], explanation: 'Вы показываете на два блокнота, поэтому these notebooks и are. Together («вместе») и in total («всего») уточняют общую цену. В чеке подтверждается сумма $6.00 за оба.' },
      { id: 'exit-card-question', task: { action: 'request', form: 'question' }, sentenceType: 'question', instruction: 'Несмотря на cash в чеке, уточните возможность оплаты картой. Обязательно начните с Can I pay; добавьте только by card или with a card.', prompt: 'Birch Store. Receipt: Paid: cash. Policy: We accept cash and cards.', promptLanguage: 'en', acceptedAnswers: ['Can I pay by card?', 'Can I pay with a card?'], explanation: 'Правило разрешает карты, хотя данный чек оплачен наличными. Вопрос Can I pay by card? или Can I pay with a card? уточняет именно способ оплаты.' },
    ],
  },
  review: { title: 'Сверьте цену и разрешение', description: 'Если перепутали суммы, найдите each и total. Если ошиблись со способом оплаты, перечитайте Policy. Для вопросов проверьте this/is, these/are и глагол pay после Can I.' },
  summary: { title: 'Покупка понятна', description: 'Вы прочитали цену за штуку и сумму чека, определили разрешённую оплату и составили вопрос для кассира. Эти фразы вернутся в заданиях о покупках и счёте №42–№50.' },
} satisfies LessonDefinition;

export const storePricesAndPaymentUnit = defineLesson(definition);
