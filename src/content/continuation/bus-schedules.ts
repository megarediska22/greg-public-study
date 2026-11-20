import { defineLesson, type LessonDefinition } from './defineLesson.ts';

const libraryRoutes = 'Route 4\nDeparts: 8:10 a.m.\nArrives: 8:30 a.m.\n\nRoute 6\nDeparts: 8:20 a.m.\nArrives: 8:50 a.m.';
const parkRoutes = 'Route 12\nDeparts: 8:40 a.m.\nArrives: 9:30 a.m.\n\nRoute 14\nDeparts: 8:55 a.m.\nArrives: 9:10 a.m.';

// Pilot exit: exit-viable-ride (C), exit-route (B), exit-departure (B), exit-arrival (W).
// Human first-attempt criterion: all four required; exit timetable has two rows.
const definition = {
  id: 'bus-schedules', title: 'Расписание автобусов',
  objectives: ['Выбрать единственный автобус, прибывающий до указанного срока.', 'Различить маршрут, отправление и прибытие.', 'Спросить и сообщить время по расписанию.'],
  intro: {
    title: 'Успеть к библиотеке', description: 'Работаем с небольшим учебным расписанием.', heading: 'Важно время прибытия',
    text: `В понедельник вы едете от Oak Stop к Library.\n\n${libraryRoutes}\n\nНужно быть там до 8:40 a.m. Подходит маршрут 4. Здесь все автобусы идут в одну сторону. Вспомним a.m. из №22 и вопросы с does из №4.`,
    example: 'What time does Route 4 get to the library? It gets to the library at 8:30 a.m.',
    translation: 'Во сколько маршрут 4 прибывает к библиотеке? Он прибывает к библиотеке в 8:30 утра.',
  },
  theory: {
    title: 'Три поля расписания', description: 'Маршрут, отправление и прибытие — разные сведения.', heading: 'Смотрите на Arrives',
    text: 'Bus stop — остановка автобуса; route — маршрут; departure — отправление; arrival — прибытие. Метка Departs означает «отправляется», Arrives — «прибывает». Leave — отправляться, get to — добираться до, прибывать к. Library — библиотека, park — парк: знакомые места из №23. Before — до указанного времени; ровно в этот момент уже не before. Monday — понедельник, Tuesday — вторник.',
    subjectHeading: 'Нужная информация', tableCaption: 'Как прочитать и подтвердить время',
    rows: [
      { subject: 'Departure', subjectTranslation: 'Отправление', form: 'Route + number + leaves at …', example: 'Route 4 leaves at 8:10 a.m.', translation: 'Маршрут 4 отправляется в 8:10 утра.' },
      { subject: 'Arrival', subjectTranslation: 'Прибытие', form: 'Route + number + gets to the … at …', example: 'Route 4 gets to the library at 8:30 a.m.', translation: 'Маршрут 4 прибывает к библиотеке в 8:30 утра.' },
      { subject: 'Departure question', subjectTranslation: 'Вопрос об отправлении', form: 'What time does … leave?', example: 'What time does Route 4 leave?', translation: 'Во сколько отправляется маршрут 4?' },
      { subject: 'Arrival question', subjectTranslation: 'Вопрос о прибытии', form: 'What time does … get to …?', example: 'What time does Route 4 get to the library?', translation: 'Во сколько маршрут 4 прибывает к библиотеке?' },
    ],
    blocks: [
      { title: 'Сначала место и день', text: 'Start — начало пути, destination — пункт назначения. В каждой таблице проверяйте день, старт и destination. Затем сравните Arrives со сроком. Самое раннее отправление не гарантирует подходящего прибытия.', example: 'Destination: Library. Arrives: 8:30 a.m. Before 8:40 a.m.', translation: 'Пункт назначения: библиотека. Прибытие: 8:30 утра. До 8:40 утра.' },
      { title: 'Время и короткие ответы', text: '8:05 a.m. — 08:05, 2:20 p.m. — 14:20. Для ответа только о времени естественно At 8:05 a.m. Когда задание просит цифры, сохраните минуты и укажите a.m./p.m. или am/pm. После двоеточия всегда две цифры.' },
      { title: 'Возвращаем вопрос из №4', text: 'В расписании используем Present Simple: Route 4 leaves, но What time does Route 4 leave? После does у leave и get нет -s. В утверждении Route 4 gets to the library нужны gets и to. Можно заменить Route 4 на It («он», автобус): It gets to the library at 8:30 a.m.', example: 'What time does Route 6 leave?', translation: 'Во сколько отправляется маршрут 6?' },
    ],
    noteTitle: 'Не перепутайте столбцы', note: 'Departs относится к старту, Arrives — к пункту назначения. Для срока прибытия сравнивайте именно Arrives. В наших заданиях время в пути уже учтено; считать его не нужно.',
  },
  choice: {
    title: 'Выберите поездку', description: 'У каждого вопроса есть собственное расписание.',
    questions: [
      { id: 'on-time-library', task: { action: 'choose' }, instruction: 'Нужно прибыть до 8:40 a.m. Какой маршрут подходит?', prompt: `Monday.\nStart: Oak Stop.\nDestination: Library.\n\n${libraryRoutes}`, promptLanguage: 'en', optionsLanguage: 'ru', options: ['Маршрут 6', 'Маршрут 4', 'Оба маршрута'], acceptedAnswers: ['Маршрут 4'], explanation: 'Только маршрут 4 прибывает в 8:30, раньше 8:40. Маршрут 6 отправляется позже, но тоже не укладывается в срок.' },
      { id: 'arrival-label', task: { action: 'choose' }, instruction: 'Какая запись показывает прибытие к библиотеке?', prompt: 'Monday.\nOak Stop → Library.\n\nRoute 6.\nDeparts: 8:20 a.m.\nArrives: 8:50 a.m.', promptLanguage: 'en', optionsLanguage: 'en', options: ['8:20 a.m.', 'Route 6', '8:50 a.m.'], acceptedAnswers: ['8:50 a.m.'], explanation: 'Прибытие отмечено Arrives: 8:50 a.m. Число 6 — маршрут, а 8:20 — отправление.' },
      { id: 'departure-meaning', task: { action: 'choose-translation' }, instruction: 'Что сообщает строка?', prompt: 'Route 4 leaves at 8:10 a.m.', promptLanguage: 'en', optionsLanguage: 'ru', options: ['Маршрут 4 отправляется в 8:10 утра', 'Маршрут 4 прибывает в 8:10 утра', 'Маршрут 4 отправляется в 8:10 вечера'], acceptedAnswers: ['Маршрут 4 отправляется в 8:10 утра'], explanation: 'Leaves — отправляется, a.m. — утро. О прибытии говорят gets to или Arrives.' },
      { id: 'arrival-question', task: { action: 'choose' }, instruction: 'Выберите правильный вопрос о прибытии.', prompt: 'Нужно узнать время прибытия маршрута 6 к библиотеке.', promptLanguage: 'ru', optionsLanguage: 'en', options: ['What time does Route 6 gets to the library?', 'What time does Route 6 get to the library?', 'What time does Route 6 leave?'], acceptedAnswers: ['What time does Route 6 get to the library?'], explanation: 'Get to спрашивает о прибытии; после does нужна форма get. Leave спрашивает о другом поле.' },
      { id: 'exit-viable-ride', task: { action: 'choose' }, instruction: 'Новое расписание: нужно прибыть в парк до 9:20 a.m. Выберите единственную подходящую поездку.', prompt: `Tuesday.\nStart: Pine Stop.\nDestination: Park.\n\n${parkRoutes}`, promptLanguage: 'en', optionsLanguage: 'ru', options: ['Маршрут 12', 'Оба маршрута', 'Маршрут 14'], acceptedAnswers: ['Маршрут 14'], explanation: 'Маршрут 14 прибывает в 9:10, до срока 9:20. Маршрут 12 отправляется раньше, но прибывает в 9:30, позже срока.' },
    ],
  },
  blank: {
    title: 'Извлеките нужное поле', description: 'Пишите только пропущенную часть.',
    questions: [
      { id: 'retrieve-does', task: { action: 'fill' }, instruction: 'Вспомните №4: вставьте вспомогательный глагол.', prompt: 'What time ___ Route 4 leave?', promptLanguage: 'en', acceptedAnswers: ['does'], explanation: 'Route 4 — один маршрут, поэтому does. После него leave остаётся без -s.' },
      { id: 'exit-route', task: { action: 'fill' }, instruction: 'Выберите поездку с прибытием до 9:20 a.m. Впишите только номер маршрута цифрами.', prompt: `Tuesday.\nPine Stop → Park.\n\n${parkRoutes}\n\nRoute: ___.`, promptLanguage: 'en', acceptedAnswers: ['14'], explanation: 'Только маршрут 14 прибывает до 9:20: в 9:10. В этом поле нужен номер 14, не время отправления 8:55.' },
      { id: 'arrival-link', task: { action: 'fill' }, instruction: 'Дополните выражение «прибывает к».', prompt: 'Route 4 gets ___ the library at 8:30 a.m.', promptLanguage: 'en', acceptedAnswers: ['to'], explanation: 'Get to + место означает «добираться до». В утверждении gets to the library сохраняет to.' },
      { id: 'retrieve-pm', task: { action: 'fill' }, instruction: 'Вспомните №22: впишите только a.m. или p.m.; можно am/pm.', prompt: '14:20 = 2:20 ___.', promptLanguage: 'en', acceptedAnswers: ['p.m.', 'pm'], explanation: '14:20 — время после полудня, значит 2:20 p.m., а не a.m.' },
      { id: 'exit-departure', task: { action: 'fill' }, instruction: 'Нужно прибыть в парк до 9:20 a.m. Найдите подходящую поездку и впишите её отправление: цифры с минутами и a.m. или am.', prompt: `Tuesday.\nPine Stop → Park.\n\n${parkRoutes}\n\nDeparture: ___.`, promptLanguage: 'en', acceptedAnswers: ['8:55 a.m.', '8:55 am'], explanation: 'У маршрута 14 в столбце Departs стоит 8:55 a.m. 9:10 — его прибытие, не отправление.' },
    ],
  },
  written: {
    title: 'Уточните и подтвердите', description: 'Короткие вопросы и сообщения о поездке.',
    questions: [
      { id: 'ask-departure', task: { action: 'ask', form: 'question' }, sentenceType: 'question', instruction: 'Спросите, во сколько отправляется маршрут 6. Начните с What time; используйте Route 6 и leave.', prompt: 'Вы у остановки, но не знаете время отправления маршрута 6.', promptLanguage: 'ru', acceptedAnswers: ['What time does Route 6 leave?'], explanation: 'Вопрос восстанавливается как What time does Route 6 leave? После does форма leave.' },
      { id: 'ask-arrival', task: { action: 'ask', form: 'question' }, sentenceType: 'question', instruction: 'Спросите время прибытия маршрута 4 к библиотеке. Начните с What time; используйте Route 4, get to и the library.', prompt: 'Друг выбрал маршрут 4. Вам важно время прибытия, а не отправления.', promptLanguage: 'ru', acceptedAnswers: ['What time does Route 4 get to the library?'], explanation: 'Нужен get to the library, чтобы вопрос относился к прибытию в нужное место.' },
      { id: 'library-short-time', task: { action: 'build', form: 'affirmative' }, sentenceType: 'affirmative', instruction: 'Ответьте полным предложением, начав с It gets to; используйте the library и время цифрами с минутами и a.m. или am.', prompt: 'Monday.\nOak Stop → Library.\n\nRoute 4\nDeparts: 8:10 a.m.\nArrives: 8:30 a.m.\n\nWhat time does Route 4 get to the library?', promptLanguage: 'en', acceptedAnswers: ['It gets to the library at 8:30 a.m.', 'It gets to the library at 8:30 am.'], explanation: 'Вопрос о прибытии: берём 8:30 из Arrives. Полный ответ: It gets to the library at 8:30 a.m.; at вводит время.' },
      { id: 'confirm-departure', task: { action: 'build', form: 'affirmative' }, sentenceType: 'affirmative', instruction: 'Сообщите время отправления маршрута 12. Начните с Route 12 leaves; время запишите цифрами с минутами и a.m. или am.', prompt: `Tuesday.\nPine Stop → Park.\n\n${parkRoutes}`, promptLanguage: 'en', acceptedAnswers: ['Route 12 leaves at 8:40 a.m.', 'Route 12 leaves at 8:40 am.'], explanation: 'У маршрута 12 время отправления 8:40 утра. Leaves сообщает отправление, поэтому не берём 9:30 из Arrives.' },
      { id: 'exit-arrival', task: { action: 'build', form: 'affirmative' }, sentenceType: 'affirmative', instruction: 'Сообщите прибытие маршрута 14 к парку. Начните с It gets to; используйте the park и время цифрами с минутами и a.m. или am.', prompt: 'Tuesday.\nPine Stop → Park.\n\nRoute 14\nDeparts: 8:55 a.m.\nArrives: 9:10 a.m.', promptLanguage: 'en', acceptedAnswers: ['It gets to the park at 9:10 a.m.', 'It gets to the park at 9:10 am.'], explanation: 'Прибытие — 9:10 утра. Gets to задаёт пункт назначения, at вводит время; 8:55 было отправлением.' },
    ],
  },
  review: { title: 'Сверьте три поля', description: 'Проверьте номер маршрута, Departs и Arrives отдельно. Для поездки до срока обязателен верный выбор по прибытию. Если перепутали столбцы, перечитайте подписи перед повторной попыткой.' },
  summary: { title: 'Автобус выбран по прибытию', description: 'Вы выбрали подходящую поездку и передали маршрут, отправление и прибытие. Это контролируемая работа с коротким расписанием; она вернётся в общей задаче о встрече №31.' },
} satisfies LessonDefinition;

export const busSchedulesUnit = defineLesson(definition);
