import { choice, input, lesson } from './author.ts';

type Draft = readonly [id: string, instruction: string, prompt: string, answers: readonly string[], feedback: string, firstHint: string, secondHint: string];
export function questions(lessonId: string) {
  const item = ([id, instruction, prompt, answers, explanation, first, second]: Draft) =>
    ({ id: `${lessonId}-${id}`, instruction, prompt, answers, explanation, hints: [first, second] as const });
  return {
    choose: (draft: Draft, options: readonly string[], russianOptions = false, russian = false) =>
      choice({ ...item(draft), action: 'choose', russian }, options, russianOptions),
    blank: (draft: Draft, strict = false, russian = false) =>
      input('blank', { ...item(draft), action: 'fill', strict, russian }),
    write: (draft: Draft, action: 'record' | 'build' | 'respond' | 'request' | 'ask' | 'greet' | 'react' | 'farewell' | 'order' = 'build', strict = false, russian = false) =>
      input('written', { ...item(draft), action, strict, russian }),
  };
}

const latin = questions('bp-pre-01');
export const latinLesson = lesson({
  id: 'bp-pre-01', level: 'Pre-A1', title: 'Латиница на карточках и табличках',
  goals: ['Прочитать напечатанное имя и записать его латиницей с нужными заглавными и строчными буквами.'],
  example: ['First name: EVA → Eva', 'First name — имя. На карточке написано EVA, а в обычной записи — Eva.'],
  theory: {
    heading: 'Буквы меняют вид, порядок сохраняется', text: 'Имя после метки name или first name записываем латиницей. Начинаем с большой буквы, остальные пишем маленькими. В списке букв каждая пара показывает два вида одной буквы.',
    tableCaption: 'Латинские буквы по группам', subjectHeading: 'Группа',
    rows: [
      { subject: 'A–F', form: 'Aa Bb Cc Dd Ee Ff', example: 'C', translation: 'Большая C и маленькая c.' },
      { subject: 'G–L', form: 'Gg Hh Ii Jj Kk Ll', example: 'I / l', translation: 'Заглавная I и строчная l — разные буквы.' },
      { subject: 'M–R', form: 'Mm Nn Oo Pp Qq Rr', example: 'P', translation: 'Большая P и маленькая p.' },
      { subject: 'S–Z', form: 'Ss Tt Uu Vv Ww Xx Yy Zz', example: 'Z', translation: 'Большая Z и маленькая z.' },
    ],
    noteTitle: 'Похожие буквы с разных клавиатур',
    note: 'Латинские B, P, C выглядят как русские В, Р, С. При наборе переключитесь на английскую раскладку. У I и l вид зависит от шрифта, поэтому сверяйте с парой Ii или Ll.',
  },
  choices: [
    latin.choose(['big-d', 'Найдите маленькую букву к большой D.', 'D', ['d'], 'D и d — одна латинская буква.', 'Ищите пару в группе A–F.', 'У маленькой d круг слева от высокой черты.'], ['b', 'd', 'p']),
    latin.choose(['small-q', 'Найдите большую букву к маленькой q.', 'q', ['Q'], 'Большая форма q — Q.', 'Нужна заглавная из пары.', 'Она похожа на O с коротким хвостиком.'], ['O', 'G', 'Q']),
    latin.choose(['mark-name', 'На какой метке ищем имя человека?', 'Метки в анкете', ['First name'], 'First name означает «имя». Room — комната, phone — телефон.', 'Отделите имя от места и номера.', 'Ищите метку со словом name.'], ['First name', 'Room', 'Phone'], false, true),
    latin.choose(['case-i', 'Какая запись показывает большую и маленькую формы одной буквы?', 'Aa — образец пары', ['Ii'], 'I и i — одна буква. L и i — разные.', 'Сравните группы Ii и Ll.', 'Обращайте внимание на точку у маленькой i.'], ['Li', 'Il', 'Ii']),
  ],
  blanks: [
    latin.blank(['f-pair', 'Введите маленькую букву из пары F. Нужна латинская буква.', 'F → ___', ['f'], 'F → f.', 'Включите английскую раскладку.', 'Напишите только строчную форму.'], true),
    latin.blank(['w-pair', 'Введите большую букву из пары w.', 'w → ___', ['W'], 'w → W.', 'Нужна заглавная форма.', 'Используйте ту же букву при нажатой Shift.'], true),
    latin.blank(['c-pair', 'Введите маленькую букву из пары C. Переключитесь на английскую раскладку.', 'C → ___', ['c'], 'На английской раскладке получится латинская c.', 'Глиф похож на русскую букву, но код другой.', 'Оставьте раскладку английской и используйте строчную форму.'], true),
    latin.blank(['j-pair', 'Допишите последнюю строчную букву имени.', 'RAJ → Ra___', ['j'], 'Последняя буква J переходит в j.', 'Сохраните последнюю букву.', 'Введите её маленькой, без всего имени.'], true),
  ],
  transfer: [
    latin.write(['club-badge', 'На бейдже кружка имя напечатано большими буквами. Запишите имя целиком обычным регистром.', 'ART CLUB · First name: BLAIR', ['Blair'], 'Сохраняем все пять букв, только первая большая.', 'Выберите сведения после метки имени.', 'Проверьте английскую раскладку и оставьте заглавной первую букву.'], 'record', true),
    latin.write(['library-tag', 'На библиотечной закладке набрано имя маленькими буквами. Перепишите его обычным регистром.', 'LIBRARY · name: cleo', ['Cleo'], 'Имя начинается с большой латинской C; порядок букв не меняется.', 'Нужна только запись имени.', 'Измените регистр начальной буквы и проверьте раскладку.'], 'record', true),
  ],
  review: 'Если буквы совпали на вид, но ответ не принят, переключите клавиатуру на английскую. Если изменилась длина имени, сравните буквы с карточкой слева направо. При повторе возьмите своё вымышленное имя, которого не было в примере.',
});

const number = questions('bp-pre-02');
export const numbersLesson = lesson({
  id: 'bp-pre-02', level: 'Pre-A1', title: 'Числа, возраст и телефон в тексте',
  goals: ['Сопоставить числа от 0 до 100 со словами. Найти на карточке возраст и телефон и записать их в нужном формате.'],
  example: ['Age: twenty-six · Phone: 202-555-0135', 'Возраст — 26. В поле телефона подряд вводим цифры 2025550135. Карточка вымышленная.'],
  theory: {
    heading: 'Возраст — количество, телефон — последовательность', text: 'Age — возраст, phone или phone number — телефон. Возраст читаем как целое число. В номере телефона важна каждая цифра, даже ноль. Для поля «только цифры» переносим их без пробелов и дефисов.',
    tableCaption: 'Числа маленькими группами', subjectHeading: 'Диапазон',
    rows: [
      { subject: '0–5', form: '0–5', example: '0 zero · 1 one · 2 two · 3 three · 4 four · 5 five', translation: 'От нуля до пяти по порядку.' },
      { subject: '6–10', form: '6–10', example: '6 six · 7 seven · 8 eight · 9 nine · 10 ten', translation: 'От шести до десяти.' },
      { subject: '11–15', form: '11–15', example: '11 eleven · 12 twelve · 13 thirteen · 14 fourteen · 15 fifteen', translation: 'От одиннадцати до пятнадцати.' },
      { subject: '16–20', form: '16–20', example: '16 sixteen · 17 seventeen · 18 eighteen · 19 nineteen · 20 twenty', translation: 'От шестнадцати до двадцати.' },
      { subject: '30–60', form: '30, 40, 50, 60', example: '30 thirty · 40 forty · 50 fifty · 60 sixty', translation: 'Тридцать, сорок, пятьдесят, шестьдесят.' },
      { subject: '70–100', form: '70, 80, 90, 100', example: '70 seventy · 80 eighty · 90 ninety · 100 one hundred', translation: 'Семьдесят, восемьдесят, девяносто, сто.' },
    ],
    noteTitle: 'Сначала десятки, затем единицы',
    note: 'Twenty-six = 20 + 6. Между словами нужен дефис. Сравните thirteen (13) и thirty (30), fourteen (14) и forty (40): -teen и -ty различаются. В forty нет u.',
  },
  choices: [
    number.choose(['teen', 'Укажите число цифрами.', 'thirteen', ['13'], 'Thirteen — 13, thirty — 30.', 'Смотрите на конец слова.', 'В этом слове -teen, а не -ty.'], ['30', '13', '33']),
    number.choose(['forty', 'Укажите число словом.', '40', ['forty'], 'Сорок пишется forty.', 'Нужны целые десятки.', 'В сорока нет u после o.'], ['fourteen', 'four', 'forty']),
    number.choose(['zero', 'Найдите запись нуля словом.', '0', ['zero'], 'Zero — ноль; one — один, ten — десять.', 'Это самое первое число в таблице.', 'Его название начинается с z.'], ['zero', 'one', 'ten']),
    number.choose(['age-field', 'Какое поле в анкете означает возраст?', 'Поля анкеты', ['Age'], 'Age — возраст, name — имя, phone — телефон.', 'Выбирайте по значению поля, не по длине слова.', 'Название возраста начинается на A.'], ['Name', 'Age', 'Phone'], false, true),
  ],
  blanks: [
    number.blank(['eighteen', 'Допишите последнюю цифру числа.', 'eighteen → 1___', ['8'], 'Eighteen — восемнадцать.', 'Цифра десятков уже введена.', 'Найдите единицы в слове перед -teen.'], true),
    number.blank(['sixty-two', 'Допишите цифру единиц.', 'sixty-two → 6___', ['2'], 'Sixty-two — 62: шесть десятков и две единицы.', 'Слева уже стоит цифра десятков.', 'Последнее слово обозначает единицы.'], true),
    number.blank(['phone-digit', 'Допишите цифру между 0 и 4, сохранив порядок номера.', 'Phone: 310-555-0174 → 31055501___4', ['7'], 'В конце номера 0174, пропущена 7.', 'Смотрите только на последние четыре цифры.', 'Сверьте предпоследнюю цифру.'], true),
    number.blank(['hundred-digit', 'Допишите последнюю цифру числа.', 'one hundred → 10___', ['0'], 'Сто записываем как 100.', 'Здесь целая сотня.', 'В конце сотни две одинаковые цифры.'], true),
  ],
  transfer: [
    number.write(['museum-age', 'В форме музея нужен возраст посетителя. Введите только цифры нужного поля.', 'MUSEUM PASS · Locker: 38 · Age: fifty-seven', ['57'], 'Возраст находится после Age. Fifty-seven — 50 + 7 = 57.', 'Не переносите номер шкафчика.', 'Сначала определите десятки, затем единицы после дефиса.'], 'record', true),
    number.write(['callback-number', 'Курьеру нужно перезвонить. Введите 10 цифр из нужного поля подряд, без пробелов и знаков.', 'DELIVERY · Order: 19 · Phone: 415-555-0182', ['4155550182'], 'Для звонка берём поле Phone. Все десять цифр остаются в исходном порядке.', 'Номер заказа не используется для звонка.', 'Сверьте начало, середину и конец телефона по трём группам.'], 'record', true),
    number.write(['gym-locker', 'Запишите номер шкафчика словами. Между десятками и единицами поставьте дефис.', 'GYM · Locker: 83', ['eighty-three'], '83 — eighty-three: сначала 80, потом 3.', 'Разложите номер на десятки и единицы.', 'Проверьте дефис между двумя словами.'], 'record'),
  ],
  review: 'Если перепутали 13 и 30, вернитесь к окончаниям -teen и -ty. Если поменяли местами цифры, разложите возраст на десятки и единицы. Для телефона сверяйте цифры по группам.',
});

const greet = questions('bp-pre-03');
export const greetingLesson = lesson({
  id: 'bp-pre-03', level: 'Pre-A1', title: 'Первое приветствие и имя',
  goals: ['Выбрать реплику для встречи или прощания. Представиться по вымышленной карточке.'],
  example: ["Sam: Hello! I'm Sam. Lee: Hi! I'm Lee.", 'Сэм: «Здравствуйте! Я Сэм». Ли: «Привет! Я Ли».'],
  theory: {
    heading: 'Три короткие реплики', text: 'Пока запоминаем фразы целиком. Hi — дружеское «привет», Hello подходит и для нейтрального приветствия. Bye — «пока». Name на табличке означает «имя».',
    tableCaption: 'Встреча, имя и прощание', subjectHeading: 'Когда',
    rows: [
      { subject: 'Встреча', form: 'Hi / Hello', example: 'Hi!', translation: 'Привет!' },
      { subject: 'Имя', form: 'I’m + имя', example: 'I’m Alex.', translation: 'Я Алекс.' },
      { subject: 'Прощание', form: 'Bye', example: 'Bye!', translation: 'Пока!' },
    ],
    noteTitle: 'Скажите имя от своего лица', note: 'I’m — короткая форма I am. В учебном чате используйте имя из поля Your name, а не имя собеседника. Please означает «пожалуйста». Здесь правило am/is/are ещё не нужно.',
  },
  choices: [
    greet.choose(['opening', 'Вы впервые видите человека. Выберите нейтральное приветствие.', 'Первая встреча у стойки', ['Hello!'], 'Hello подходит при первой встрече.', 'Подумайте, начинается ли разговор.', 'Уместна нейтральная реплика встречи.'], ['Bye!', 'Hello!', 'Please.'], false, true),
    greet.choose(['leaving', 'Чат заканчивается. Выберите прощание.', 'Собеседник уходит', ['Bye!'], 'Bye подходит, когда разговор заканчивается.', 'На этот раз беседа уже состоялась.', 'Ищите фразу на прощание.'], ['Hi!', 'Please.', 'Bye!'], false, true),
    greet.choose(['please', 'Что означает слово на вежливой табличке?', 'Please', ['Пожалуйста'], 'Please означает «пожалуйста».', 'Это слово вежливой просьбы.', 'Оно не обозначает ни встречу, ни уход.'], ['Пожалуйста', 'Пока', 'Имя'], true),
  ],
  blanks: [
    greet.blank(['badge', 'Введите только имя с карточки участника.', 'Name: June → I’m ___', ['June'], 'После I’m ставим имя из поля Name.', 'Нужна часть после метки Name.', 'Перенесите имя и сохраните первую заглавную.'], true),
    greet.blank(['your-row', 'Представьтесь от своего лица. Введите только своё имя по карточке.', 'Your name: Lane · Other name: Sam · I’m ___', ['Lane'], 'Your name — имя вашей роли; Other name — имя другого человека.', 'Вы выбираете имя своей роли.', 'Смотрите на метку Your name.'], true),
    greet.blank(['hi-two', 'Допишите последнюю букву короткого дружеского приветствия.', 'H___!', ['i'], 'Hi — «привет».', 'Слово состоит из двух букв.', 'Нужна строчная буква с точкой.'], true),
  ],
  transfer: [
    greet.write(['first-club-chat', 'Вы впервые встречаетесь в чате кружка. Представьтесь одной фразой со своим именем. Приветствие можно добавить перед ней.', 'CHAT · Your name: Rowan · Other name: Sam', ["I'm Rowan.", 'I am Rowan.', "Hi! I'm Rowan.", 'Hi! I am Rowan.', "Hello! I'm Rowan.", 'Hello! I am Rowan.', "Hi, I'm Rowan.", 'Hi, I am Rowan.', "Hello, I'm Rowan.", 'Hello, I am Rowan.'], 'Используйте Rowan из поля Your name и форму первого лица.', 'Сначала найдите своё имя.', 'Начать представление можно с полной или сокращённой формы от первого лица.'], 'respond'),
    greet.write(['bye-after-class', 'Занятие закончилось. Напишите только английское прощание из урока.', 'Вы уходите из чата занятия.', ['Bye!', 'Goodbye!'], 'Bye и Goodbye подходят, когда вы уходите.', 'Обмен уже закончился.', 'У прощания из урока три буквы.'], 'farewell', false, true),
  ],
  review: 'Если выбрали реплику не вовремя, сравните встречу и прощание. Если взяли чужое имя, найдите Your name и попробуйте представиться по другой карточке.',
});

const check = questions('bp-pre-04');
export const readinessLesson = lesson({
  id: 'bp-pre-04', level: 'Pre-A1', title: 'Попросить повторить и проверить готовность',
  goals: ['Попросить повторить, если потерялась реплика. Самостоятельно прочитать имя и число на новых материалах.'],
  example: ["A: Your phone number? B: I don't understand. Can you say that again?", 'А: «Ваш номер телефона?» Б: «Я не понимаю. Можете повторить?»'],
  theory: {
    heading: 'Сначала поймите, чего не хватает', text: 'Если вы не поняли сообщение, можно так и сказать. Если сообщение потерялось, попросите его повторить. Когда на карточке поле пропущено, не выдумывайте значение.',
    tableCaption: 'Выберите действие', subjectHeading: 'Ситуация',
    rows: [
      { subject: 'Не поняли', form: 'Готовая реплика', example: "I don't understand.", translation: 'Я не понимаю.' },
      { subject: 'Нужно повторить', form: 'Готовая просьба', example: 'Can you say that again?', translation: 'Можете повторить?' },
      { subject: 'Заполнено поле', form: 'Точно перенесите', example: 'Name: OLGA · Age: nineteen', translation: 'Olga, возраст 19. Again — ещё раз, please — пожалуйста.' },
    ],
    noteTitle: 'Сначала самостоятельно', note: 'Попробуйте записать нужный факт до открытия подсказки. Эти реплики учим целиком. Знать правила can и do пока не требуется.',
  },
  choices: [
    check.choose(['need-repeat', 'Сообщение отобразилось не целиком. Какая реплика попросит повторить?', 'Сообщение обрезано', ['Can you say that again?'], 'Эта просьба означает «Можете повторить?».', 'Вам нужна просьба о повторе.', 'Ищите слово со значением «ещё раз».'], ["I don't understand.", 'Can you say that again?', 'Hello!'], false, true),
    check.choose(['understand', 'Вы хотите сначала прямо сказать, что не поняли. Какую фразу выбрать?', 'Незнакомая надпись', ["I don't understand."], 'I don’t understand сообщает о непонимании.', 'Нужно сообщение, а не вопрос.', 'Ищите слово со значением «понимать».'], ['Can you say that again?', 'Bye!', "I don't understand."], false, true),
    check.choose(['letter-pass', 'Выберите пропуск гостя, в имени которого первая буква — заглавная I из пары Ii.', 'PASS DESK · Guest labels', ['Inez'], 'В Inez первая буква I, в lnez — маленькая l, в Lnez — большая L.', 'Сверяйте только первую букву.', 'Сравните прописную I с двумя формами буквы L.'], ['Lnez', 'Inez', 'lnez']),
    check.choose(['which-field', 'Какого сведения не хватает на карточке?', 'Name: Drew · Phone: ___', ['Телефона'], 'Пустым осталось поле Phone.', 'Посмотрите, после какой метки пропуск.', 'Пустая строка относится к связи с человеком.'], ['Телефона', 'Имени', 'Возраста'], true),
  ],
  blanks: [
    check.blank(['field-name', 'Введите только имя для карточки выдачи. Сохраните написание.', 'Pickup · Name: Blake → Name: ___', ['Blake'], 'В поле Name стоит Blake.', 'Найдите поле имени.', 'Сравните буквы и регистр с исходной записью.'], true),
    check.blank(['field-number', 'Допишите последнюю цифру номера строки.', 'Row: 24 → 2___', ['4'], 'Последняя цифра 24 — 4.', 'Посмотрите на число слева.', 'Не вводите всю строку, только последнюю цифру.'], true),
    check.blank(['again', 'Допишите только пропущенное слово со значением «ещё раз».', 'Can you say that ___?', ['again'], 'Again — «ещё раз».', 'Речь о повторном действии.', 'Выберите из урока слово, которое здесь стоит после that.']),
  ],
  transfer: [
    check.write(['maker-name', 'Запишите имя гостя обычным регистром. На табличке есть ещё имя сотрудника, оно не нужно.', 'MAKER SPACE · Staff: Maya · Guest name: JULES', ['Jules'], 'Гость — Jules, сотрудник — Maya. Только первая буква имени заглавная.', 'Сравните Guest name и Staff.', 'Запишите первое имя гостя с большой буквы, прочие — маленькие.'], 'record', true),
    check.write(['class-number', 'Пока повторяют пропущенную реплику, внесите только напечатанный номер автобуса цифрами.', 'BUS: ninety-four · Chat: [message missing] · Gate: 12', ['94'], 'Нужен номер после BUS. Ninety-four — 90 + 4.', 'Пропущено сообщение, но нужный номер уже напечатан.', 'Переведите десятки и единицы в две цифры.'], 'record', true),
    check.write(['ask-repeat', 'Попросите повторить сообщение целой фразой из урока. Можно добавить please в конце.', 'A: [message missing] · B: …', ['Can you say that again?', 'Can you say that again, please?', 'Can you say that again please?'], 'Can you say that again? — просьба повторить. Please смягчает её.', 'Сообщение не пришло целиком.', 'Возьмите вежливую просьбу о повторе из урока.'], 'request'),
  ],
  review: 'Не совпало имя — повторите латиницу и регистр в первом занятии. Не совпал номер — разберите десятки в занятии о числах. Справились без подсказок — можно перейти к короткому знакомству A1. Этот выбор доступен при любом результате.',
});

const surnameRequests = ['Can', 'Could'].flatMap(modal =>
  ['repeat your last name', 'say your last name again', 'tell me your last name again'].flatMap(request =>
    ['', 'Sorry, '].flatMap(opening => ['', ', please', ' please'].map(ending =>
      `${opening}${modal} you ${request}${ending}?`))));
const meet = questions('bp-a1-01');
export const meetingLesson = lesson({
  id: 'bp-a1-01', level: 'A1', title: 'Короткое знакомство и уточнение',
  goals: ['Начать короткий текстовый разговор, представиться и уточнить нужную деталь. Различить просьбу повторить сообщение и вопрос о значении слова.'],
  example: ["A: Hello! I'm Nora. What's your name? B: I'm Remy. Nice to meet you.",
    'А: «Здравствуйте! Я Нора. Как вас зовут?» Б: «Я Реми. Приятно познакомиться».'],
  theory: {
    heading: 'Встреча, имя, уточнение', text: 'Hello — нейтральное начало, Hi — менее формальное. First name — имя, last name — фамилия. Sorry — «извините». I’m + имя и What’s your name? запоминаем целиком. Формы be, do и can разберём дальше.',
    tableCaption: 'Какая реплика нужна', subjectHeading: 'Задача',
    rows: [
      { subject: 'Представиться', form: 'I’m + имя', example: "I'm Zoya.", translation: 'Я Зоя.' },
      { subject: 'Спросить имя', form: 'Готовый вопрос', example: "What's your name?", translation: 'Как вас зовут?' },
      { subject: 'Попросить повторить', form: 'Готовая просьба', example: 'Can you say that again?', translation: 'Можете повторить?' },
      { subject: 'Узнать значение', form: 'What does «слово» mean?', example: 'What does “guest” mean?', translation: 'Что значит «guest»?' },
    ],
    blocks: [
      { title: 'Назовите деталь, если она известна', text: 'Если ясно, какая часть пропала, можно попросить повторить только её. Repeat значит «повторить». Could you repeat…? — ещё одна вежливая формула с тем же действием.', example: 'Can you repeat the room number?', translation: 'Можете повторить номер комнаты?' },
      { title: 'Спокойно завершите обмен', text: 'Nice to meet you уместно при первом знакомстве. Bye — короткое прощание при уходе.', example: 'Nice to meet you. Bye!', translation: 'Приятно познакомиться. Пока!' },
    ],
    noteTitle: 'Сбой или незнакомое слово?', note: 'Если часть сообщения потерялась, просим повторить. Если слово видно целиком, но смысл неизвестен, спрашиваем о значении. Сначала попробуйте ответить сами.',
  },
  choices: [
    meet.choose(['chat-open', 'Вы впервые пишете сотруднику стойки. Выберите нейтральное приветствие.', 'Начало первого сообщения', ['Hello!'], 'Hello подходит для нейтрального начала.', 'Это первый контакт.', 'Ищите приветствие, а не прощание.'], ['Bye!', 'Hello!', 'Thank you.'], false, true),
    meet.choose(['name-question', 'Как узнать, как зовут собеседника?', 'Вы уже представились', ["What's your name?"], 'What’s your name? — «Как вас зовут?».', 'Здесь нужен вопрос о человеке.', 'В вопросе есть слово name.'], ["I'm Zoya.", "What's your name?", 'Nice to meet you.'], false, true),
    meet.choose(['meet-reaction', 'Вы только что узнали имя собеседника. Выберите дружелюбное завершение знакомства.', 'A: Hi, I’m Ellis. · B: …', ['Nice to meet you.'], 'Так реагируют на первое знакомство.', 'Имя уже известно.', 'Ищите «приятно познакомиться».'], ['Bye!', 'Good night.', 'Nice to meet you.']),
    meet.choose(['surname-label', 'Какое поле карточки обозначает фамилию?', 'First name: Devon · Last name: Nguyen', ['Last name'], 'Last name — фамилия.', 'Из двух меток нужна фамилия.', 'Для фамилии используется «последнее имя».'], ['First name', 'Last name']),
    meet.choose(['end-chat', 'Вы закончили обмен и уходите. Выберите короткое прощание.', 'Конец переписки в клубе', ['Bye!'], 'Bye подходит при уходе.', 'Обмен уже закончился.', 'Нужен эквивалент «пока».'], ['Hi!', 'Bye!', "I'm Devon."], false, true),
  ],
  blanks: [
    meet.blank(['first-name', 'Введите только своё имя из первой строки карточки.', 'First name: Wren · Last name: Bell · I’m ___', ['Wren'], 'First name — Wren, Bell — фамилия.', 'Различите имя и фамилию.', 'Скопируйте значение после First name с нужным регистром.'], true),
    meet.blank(['nice', 'Допишите пропущенное слово во фразе знакомства.', 'Nice to ___ you.', ['meet'], 'Nice to meet you — «Приятно познакомиться».', 'Здесь нужен глагол «встретить, познакомиться».', 'В глаголе четыре буквы, две гласные подряд.']),
    meet.blank(['your', 'Подставьте «ваше / твоё» в вопросе об имени.', 'What’s ___ name?', ['your'], 'Your name — «ваше имя».', 'Спрашиваем собеседника о нём.', 'Возьмите слово для «ваш», а не для «мой».']),
    meet.blank(['name-given', 'Напишите только имя участника, которому принадлежит строка Your name.', 'Your name: Tate · Partner name: Iris', ['Tate'], 'Your name — имя вашей роли. Partner name — имя собеседника.', 'Определите свою роль.', 'Вам нужна первая строка, с заглавной буквы.'], true),
  ],
  transfer: [
    meet.write(['welcome-reply', 'Поздоровайтесь словами Hi или Hello и представьтесь одной репликой. Используйте своё имя.', 'CLUB CHAT · Your first name: Quinn · Member: Iris', ["Hi, I'm Quinn.", "Hello, I'm Quinn.", 'Hi, I am Quinn.', 'Hello, I am Quinn.', "Hi! I'm Quinn.", "Hello! I'm Quinn.", 'Hi! I am Quinn.', 'Hello! I am Quinn.', "Hi. I'm Quinn.", "Hello. I'm Quinn.", 'Hi. I am Quinn.', 'Hello. I am Quinn.'], 'В начале приветствие, затем имя Quinn из вашей карточки.', 'Сначала найдите своё имя.', 'Поставьте приветствие перед формулой представления.'], 'greet'),
    meet.write(['lost-surname', 'При знакомстве пропала фамилия собеседника. Выберите подходящую формулу уточнения и напишите целый вопрос. Назовите недостающую деталь словами с карточки. Начните просьбу с Can you или Could you. Можно добавить Sorry в начале и please в конце.', 'NEW MESSAGE · I’m Morgan. My last name is [missing].', surnameRequests, 'Фамилия не видна. Repeat просит повторить её; your last name — ваша фамилия. Could you — ещё один вежливый вариант.', 'Имя видно, фамилия потерялась.', 'Назовите недостающую деталь в просьбе повторить.'], 'request'),
    meet.write(['unknown-word', 'В переписке видны все слова, но одно вам незнакомо. Выберите подходящую формулу уточнения и задайте вопрос про badge.', 'AT THE FRONT DESK · Your badge is here.', ['What does badge mean?', 'What does “badge” mean?', 'What does "badge" mean?', "What does 'badge' mean?"], 'What does … mean? уточняет значение. Badge здесь — бейдж, карточка участника.', 'Сообщение видно целиком.', 'Подставьте незнакомое слово в вопрос о значении.'], 'ask'),
  ],
  review: 'Если потерялась часть, попросите повторить её. Если слово написано целиком, спросите, что оно значит. Для повтора придумайте другое сообщение с пропавшей деталью и другой видимой незнакомой меткой.',
});

export const pk01Lessons = [latinLesson, numbersLesson, greetingLesson, readinessLesson, meetingLesson];
