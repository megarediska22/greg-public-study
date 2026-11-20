import { defineLesson, type LessonDefinition } from './defineLesson.ts';

// Pilot exit: exit-valid-visit (C), exit-open-day (B), exit-opening-reply (W), exit-ask-opening (W).
// Human first-attempt criterion: 3/4, with visit, day and opening hour mandatory.
const definition = {
  id: 'hours-and-signs',
  title: 'Часы работы и объявления',
  objectives: ['Выбрать подходящее время посещения по объявлению.', 'Сообщить день и время открытия или закрытия.', 'Спросить о времени работы с does и начальной формой глагола.'],
  intro: {
    title: 'Заглянем в магазин', description: 'Учимся планировать визит по короткой вывеске.',
    heading: 'Успеем зайти?',
    text: 'У магазина Maple Store висит объявление: Opening hours. Monday: 9 a.m.–5 p.m. Sunday: Closed. Анна предлагает зайти в понедельник в два. Вы проверите часы и ответите ей. Вспомним at из урока №20 и вопрос с does из №4.',
    example: 'Anna: Is the store open on Monday at 2 p.m.? Lee: Yes, it is.',
    translation: 'Анна: «Магазин открыт в понедельник в два дня?» Ли: «Да».',
  },
  theory: {
    title: 'День, часы и состояние', description: 'Разбираем обозначения времени и вопросы.',
    heading: 'Open — открыт, opens — открывается',
    text: 'Opening hours — часы работы. Day — день. Store — магазин. Open — открыт, closed — закрыт. Monday — понедельник, Tuesday — вторник, Saturday — суббота, Sunday — воскресенье. В США a.m. означает время до полудня, p.m. — после полудня. 9 a.m. — 09:00, 2 p.m. — 14:00, 5 p.m. — 17:00. Тире в 9 a.m.–5 p.m. показывает интервал работы.',
    subjectHeading: 'Что сообщаем', tableCaption: 'Короткие фразы о часах работы',
    rows: [
      { subject: 'Day', subjectTranslation: 'День', form: 'on + day', example: 'The store is closed on Sunday.', translation: 'Магазин закрыт в воскресенье.' },
      { subject: 'Time', subjectTranslation: 'Момент', form: 'at + time', example: 'The store opens at 9 a.m.', translation: 'Магазин открывается в девять утра.' },
      { subject: 'Time range', subjectTranslation: 'Интервал', form: 'from … to …', example: 'The store is open from 9 a.m. to 5 p.m.', translation: 'Магазин открыт с девяти утра до пяти вечера.' },
      { subject: 'Question', subjectTranslation: 'Вопрос', form: 'What time does the store open/close?', example: 'What time does the store close on Tuesday?', translation: 'Во сколько магазин закрывается во вторник?' },
    ],
    blocks: [
      { title: 'Состояние и событие', text: 'Is open описывает состояние. Opens и closes называют момент открытия и закрытия. Для ответа используйте The store opens/closes on + день + at + время. The store можно заменить на It: It opens at 9 a.m. — «Он открывается в девять утра». Короткий ответ о времени тоже естественен: At 9 a.m. — «В девять утра».', example: 'The store closes on Saturday at 4 p.m.', translation: 'Магазин закрывается в субботу в четыре дня.' },
      { title: 'Вспоминаем does', text: 'Вопрос о магазине строится с does. После него нужны open или close без -s. Для проверки состояния используем Is the store open …?, без does. Короткий отрицательный ответ: No, it is not. Можно сократить: No, it isn’t. / No, it’s not.', example: 'What time does the store open on Monday?', translation: 'Во сколько магазин открывается в понедельник?' },
      { title: 'Как записывать ответ', text: '9 a.m., 9 am и 9:00 AM означают одно время. В заданиях о часах можно использовать эти варианты. Если просят день и время, пишите, например, On Monday at 9 a.m. Название дня пишется с большой буквы.' },
    ],
    noteTitle: 'Проверьте две вещи', note: 'Сначала найдите нужный день, затем время. Closed означает, что визит в этот день не подходит. Не путайте 3 p.m. (15:00) и 3 a.m. (03:00).',
  },
  choice: {
    title: 'Прочитайте вывеску', description: 'Выберите ответ по данным прямо в задании.',
    questions: [
      { id: 'maple-visit', task: { action: 'choose' }, instruction: 'Выберите время, когда можно зайти.', prompt: 'Maple Store — Monday: 9 a.m.–5 p.m.; Sunday: Closed.', promptLanguage: 'en', optionsLanguage: 'en', options: ['Monday at 7 a.m.', 'Monday at 2 p.m.', 'Sunday at 2 p.m.'], acceptedAnswers: ['Monday at 2 p.m.'], explanation: 'В понедельник в 14:00 магазин работает: это между 09:00 и 17:00. В воскресенье он закрыт.' },
      { id: 'morning-marker', task: { action: 'choose' }, instruction: 'Какое время означает 10 a.m.?', prompt: 'Opening hours — Tuesday: 10 a.m.–6 p.m.', promptLanguage: 'en', optionsLanguage: 'ru', options: ['Десять утра', 'Десять вечера', 'Шесть вечера'], acceptedAnswers: ['Десять утра'], explanation: 'A.m. указывает на утро. Шесть вечера здесь — время закрытия, 6 p.m.' },
      { id: 'closed-day', task: { action: 'choose' }, instruction: 'В какой день магазин закрыт?', prompt: 'Monday: 8 a.m.–4 p.m. Saturday: Closed. Sunday: 10 a.m.–3 p.m.', promptLanguage: 'en', optionsLanguage: 'en', options: ['Monday', 'Sunday', 'Saturday'], acceptedAnswers: ['Saturday'], explanation: 'Только рядом с Saturday стоит Closed. Sunday — другой день, воскресенье.' },
      { id: 'opening-question', task: { action: 'choose' }, instruction: 'Выберите правильный вопрос о времени открытия.', prompt: 'Вы хотите узнать, во сколько открывается магазин во вторник.', promptLanguage: 'ru', optionsLanguage: 'en', options: ['What time does the store opens on Tuesday?', 'What time does the store open on Tuesday?', 'What time do the store open on Tuesday?'], acceptedAnswers: ['What time does the store open on Tuesday?'], explanation: 'Для момента открытия используем does … open. Do не согласуется с одним магазином: нужен does. После does глагол open без -s, поэтому opens здесь тоже неверно.' },
      { id: 'exit-valid-visit', task: { action: 'choose' }, instruction: 'Новая вывеска: выберите единственный подходящий визит.', prompt: 'Pine Store — Tuesday: 10 a.m.–6 p.m.; Saturday: 11 a.m.–3 p.m.; Sunday: Closed.', promptLanguage: 'en', optionsLanguage: 'en', options: ['Tuesday at 9 a.m.', 'Sunday at 1 p.m.', 'Saturday at 1 p.m.'], acceptedAnswers: ['Saturday at 1 p.m.'], explanation: 'В субботу в 13:00 магазин открыт с 11:00 до 15:00. Во вторник в 09:00 ещё рано, а воскресенье закрыто.' },
    ],
  },
  blank: {
    title: 'Восстановите короткие фразы', description: 'Пишите только пропущенную часть по-английски.',
    questions: [
      { id: 'day-preposition', task: { action: 'fill' }, instruction: 'Вставьте предлог перед днём.', prompt: 'Monday: Closed. The store is closed ___ Monday.', promptLanguage: 'en', acceptedAnswers: ['on'], explanation: 'Перед названием дня нужен on. At оставляем для конкретного времени.' },
      { id: 'time-preposition', task: { action: 'fill' }, instruction: 'Вспомните предлог из урока №20.', prompt: 'Tuesday: 8 a.m.–4 p.m. The store closes ___ 4 p.m.', promptLanguage: 'en', acceptedAnswers: ['at'], explanation: 'At ставим перед временем: at 4 p.m. Закрытие во вторник — в 16:00.' },
      { id: 'range-end', task: { action: 'fill' }, instruction: 'Вставьте слово, завершающее пару from … .', prompt: 'Saturday: 10 a.m.–4 p.m. The store is open from 10 a.m. ___ 4 p.m.', promptLanguage: 'en', acceptedAnswers: ['to'], explanation: 'From … to … передаёт «с … до …». Здесь интервал, а не отдельный момент.' },
      { id: 'base-after-does', task: { action: 'fill' }, instruction: 'Вставьте нужную форму open.', prompt: 'What time does the store ___ on Monday?', promptLanguage: 'en', acceptedAnswers: ['open'], explanation: 'Does уже несёт грамматическое окончание: после него open без -s. Это возвращение к вопросу из №4.' },
      { id: 'exit-open-day', task: { action: 'fill' }, instruction: 'Впишите только день, когда магазин работает с 11 утра до 3 дня.', prompt: 'Pine Store — Tuesday: 10 a.m.–6 p.m.; Saturday: 11 a.m.–3 p.m.; Sunday: Closed. Day: ___.', promptLanguage: 'en', acceptedAnswers: ['Saturday'], explanation: 'Интервал 11 a.m.–3 p.m. стоит в строке Saturday. Вторник тоже рабочий, но часы в нём другие.' },
    ],
  },
  written: {
    title: 'Ответьте человеку', description: 'Передайте нужный факт или составьте вопрос по-английски.',
    questions: [
      { id: 'ask-opening', task: { action: 'ask', form: 'question' }, sentenceType: 'question', instruction: 'Спросите о времени открытия в понедельник. Начните с What time; используйте the store и open.', prompt: 'Друг знает часы магазина, а вы хотите спланировать визит на понедельник.', promptLanguage: 'ru', acceptedAnswers: ['What time does the store open on Monday?'], explanation: 'What time + does + the store + open. On Monday уточняет день; форма opens после does не нужна.' },
      { id: 'state-open', task: { action: 'build', form: 'affirmative' }, sentenceType: 'affirmative', instruction: 'Сообщите: «Магазин открыт с девяти утра до пяти вечера». Начните с The store is; время запишите цифрами с a.m./p.m. или am/pm. Используйте from … to …, без дня недели. Для обеих границ выберите один стиль обозначений (с точками a.m./p.m. или без точек am/pm) и один формат минут (:00 в обоих временах или нигде).', prompt: 'Maple Store — Monday: 9 a.m.–5 p.m.', promptLanguage: 'en', acceptedAnswers: ['The store is open from 9 a.m. to 5 p.m.', 'The store is open from 9 am to 5 pm.', 'The store is open from 9:00 a.m. to 5:00 p.m.', 'The store is open from 9:00 am to 5:00 pm.'], explanation: 'Is open описывает состояние; from и to связывают начало и конец интервала. В этом задании используйте одинаковый стиль обозначений и минут на обеих границах.' },
      { id: 'closed-reply', task: { action: 'short', form: 'short-negative' }, sentenceType: 'short-negative', instruction: 'Ответьте на вопрос только коротким отрицательным ответом с it.', prompt: 'Maple Store — Sunday: Closed. Is the store open on Sunday?', promptLanguage: 'en', acceptedAnswers: ["No, it isn't.", "No, it's not.", 'No, it is not.', "No it isn't.", "No it's not.", 'No it is not.'], explanation: 'Closed требует отрицательного ответа. На вопрос с is отвечаем is not, isn’t или it’s not, без doesn’t. На письме обычно ставим запятую после No; здесь ответ без запятой тоже принимается.' },
      { id: 'exit-opening-reply', task: { action: 'build', form: 'affirmative' }, sentenceType: 'affirmative', instruction: 'Во сколько Pine Store открывается в субботу? Напишите полное предложение, начав с It opens at. Используйте цифры и a.m. или am; минуты :00 необязательны.', prompt: 'Pine Store — Saturday: 11 a.m.–3 p.m.; Sunday: Closed.', promptLanguage: 'en', acceptedAnswers: ['It opens at 11 a.m.', 'It opens at 11 am.', 'It opens at 11:00 a.m.', 'It opens at 11:00 am.'], explanation: 'В строке Saturday первое время — 11 утра, открытие. В этом поле передайте этот факт полным предложением It opens at 11 a.m.' },
      { id: 'exit-ask-opening', task: { action: 'ask', form: 'question' }, sentenceType: 'question', instruction: 'Спросите, во сколько магазин открывается в субботу. Начните с What time; используйте the store и open.', prompt: 'Pine Store: вам нужно уточнить время открытия в субботу перед визитом.', promptLanguage: 'ru', acceptedAnswers: ['What time does the store open on Saturday?'], explanation: 'Вспомните does из №4: после него open. День вводится с on, поэтому on Saturday.' },
    ],
  },
  review: { title: 'Проверьте день и время', description: 'В своих ответах найдите день, затем время и его a.m./p.m. В вопросах проверьте глагол после does.' },
  summary: { title: 'Визит можно планировать', description: 'Теперь вы умеете выбрать время по вывеске, передать день и часы и уточнить открытие или закрытие. Это понадобится в расписании автобусов №24 и объявлениях об изменении часов №28.' },
} satisfies LessonDefinition;

export const hoursAndSignsUnit = defineLesson(definition);
