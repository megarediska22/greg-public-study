import { tasks, type ContentPacket } from './author.ts';

const shopping = tasks('unit-051');
const plan = tasks('unit-061');
const booked = tasks('unit-071');
const teacher = tasks('unit-073');
const project = tasks('unit-081');
const club = tasks('unit-091');
const home = tasks('unit-103');

function extension(name: string, subject: string, reason: string, day: string) {
  return ['Could I submit it', 'Could I turn it in'].flatMap(request => [
    `Hi, ${name}. I need more time for ${subject} because ${reason}. ${request} on ${day}? Thanks!`,
    `Hi, ${name}. I need more time for ${subject} because ${reason}. ${request} on ${day}? Thank you.`,
  ]);
}

function visit(problem: string, room: string, availability: string) {
  return ['Could someone come by?', 'Could someone come to fix it?'].flatMap(request => [
    `The ${problem} in the ${room}. I'll be home ${availability}. ${request}`,
    `The ${problem} in the ${room}. I will be home ${availability}. ${request}`,
  ]);
}

export const pk04Extras: Pick<ContentPacket, 'supplements' | 'reviewEdits'> = {
  reviewEdits: {
    'unit-060': 'Общую формулу I’ll / I will + начальная форма повторите в уроке «Решение в ответ на сообщение» (unit-056). Фраза I’ll bring one guest показана в теории этого урока. Чтобы сверить сроки, вернитесь к уроку «Крайний срок и напоминание» (unit-058). Отделяйте дату встречи от срока ответа и считайте гостей без себя.',
    'unit-089': 'Общую форму have/has + причастие повторите в уроках «Бывали ли вы здесь?» (unit-082) и «Кто что пробовал» (unit-083). Конкретные формы done и sent есть в теории этого урока. Сравните готовый список и ещё не отправленное письмо. В разговорном американском английском в подобных вопросах также встречается Past Simple.',
  },
  supplements: {
    'unit-051': {
      reminder: 'Сверьте ограничения покупателя, состав и окно выдачи. Нужный состав сам по себе не гарантирует, что заказ можно забрать.',
      questions: [
        shopping.c('snack-fit', 'Что можно выбрать для встречи?', 'Guest needs a nut-free snack. Pickup must be before 4:00. Oat bites: no nuts, pickup 4:30. Fruit cups: no nuts, pickup 3:30. Trail mix: almonds, pickup 3:00.', ['Oat bites.', 'Fruit cups.', 'Trail mix.'], 1, 'Фруктовые стаканчики без орехов доступны к 3:30.', ['Проверьте отдельно состав и час.', 'Четыре — верхняя граница.']),
        shopping.b('actual-pickup', 'Введите подходящий час выдачи цифрами с минутами, без p.m.', 'Order: a box for four. Small box serves two, ready 2:40. Large box serves four, ready 3:20 or 4:30. You must leave at 4:00.', '3:20', 'На четверых нужен большой набор. 4:30 уже поздно.', ['Сначала выберите размер.', 'Из оставшихся часов возьмите тот, что до отъезда.']),
      ],
    },
    'unit-061': {
      reminder: 'Сопоставляйте изменения. Старый план может сохранить место или часть времени, но обновление может отменить отдельный шаг.',
      questions: [
        plan.c('door-change', 'Какое место теперь действует?', 'Saturday update: We still start at nine, but the south entrance has no staff that morning. Check in at the west door. The café stays at the south end.', ['The café.', 'The south entrance.', 'The west door.'], 2, 'Запись на вход перенесена к западной двери, час сохранился.', ['Различайте вход и кафе.', 'Действующее указание стоит после check in.']),
        plan.w('replacement-ride', 'Одной фразой согласуйте новый час и вход. Начните с See you at, напишите часы и минуты без p.m., затем используйте at для входа.', 'Old plan: 1:30, Gate 2. Bus delay: all passengers arrive at 1:45. Meet fifteen minutes after arrival. Gate 2 locked; entry only through Gate 4.', 'See you at 2:00 at Gate 4.', 'Встреча в два у ворот 4: автобус прибудет в 1:45, потом 15 минут ожидания.', ['Проверьте связь нового часа с прибытием.', 'Возьмите доступный вход из последней строки.']),
        plan.c('route-exception', 'Какой вариант соответствует всем данным?', 'Train gets in at 3:30. Workshop starts at 4:00. North gate opens at 4:15. East gate is open, a ten-minute walk from the station. The bus from the station reaches the east gate at 4:05.', ['Walk to the east gate.', 'Wait for the north gate.', 'Take the bus to the east gate.'], 0, 'После поезда пешком можно успеть к началу через открытые восточные ворота.', ['Нужно попасть к началу через открытый вход.', 'Сравните путь пешком и автобус после 3:30.']),
        plan.b('weather-start', 'Впишите допустимое время начала цифрами с минутами, без a.m.', 'If it rains: meet at the indoor entrance, 9:20 or 10:20. Indoor door opens at 10:00. If sunny: outside at 9:20. Forecast: rain. Leader leaves at 10:30.', '10:20', 'Из-за дождя встреча внутри. В 9:20 дверь ещё закрыта, в 10:20 работает и руководитель на месте.', ['Сначала выберите план по погоде.', 'Сопоставьте открытие и отъезд.']),
      ],
    },
    'unit-071': {
      reminder: 'Прочитайте исправление полностью. Сотрудник может изменить час и попросить вас подтвердить место.',
      questions: [
        booked.c('slot-owner', 'Кому нужно сделать следующий шаг?', 'Desk: I moved you to 10:30. Could you send the number of the model you own? The technician will check the room.', ['The customer.', 'The technician.', 'The desk clerk.'], 0, 'Номер присылает клиент. Мастер проверит кабинет, сотрудник уже изменил час.', ['Следующий вопрос начинается с Could you.', 'Кто владеет устройством?']),
        booked.w('unknown-counter', 'Попросите служащего уточнить номер стойки. Используйте Could you tell me и один из вариантов: the counter number или which counter to use.', 'PICKUP · email confirms Thursday at 1:20 · old pickup desk closed; new counter number missing', ['Could you tell me the counter number?', 'Could you tell me which counter to use?'], 'Четверг и час уже указаны. Нужен номер новой стойки.', ['Проверьте, чего нет в письме.', 'Спросите о стойке, а не о времени.'], 'request'),
      ],
    },
    'unit-073': {
      reminder: 'В полной просьбе преподавателю назовите задание, объясните причину, предложите новый срок и поблагодарите. Could I submit it on Monday? — «Можно сдать это в понедельник?»',
      questions: [
        teacher.w('outline-extension', 'Напишите Ms. Kim три фразы и благодарность. Начните Hi, Ms. Kim. Используйте I need more time for, because и Could I submit it / Could I turn it in. Предложите новый день, завершите Thanks или Thank you.', 'COURSE EMAIL · the outline · your laptop stopped working · original due date Tuesday · request Thursday',
          extension('Ms. Kim', 'the outline', 'my laptop stopped working', 'Thursday'),
          'В письме для Ms. Kim есть задание, причина, новый день и благодарность.', ['Прежний срок уже у преподавателя.', 'Предложите четверг отдельным вежливым вопросом.']),
        teacher.w('report-permission', 'Напишите Dr. Bell тот же тип письма в трёх коротких фразах. Начните Hi, Dr. Bell. Используйте I need more time for, because и Could I submit it / Could I turn it in. Завершите Thanks или Thank you.', 'LAB COURSE · the lab report · you were sick · requested date Monday · Saturday office closed',
          extension('Dr. Bell', 'the lab report', 'I was sick', 'Monday'),
          'Письмо касается лабораторного отчёта, болезни и понедельника. Часы офиса в эту просьбу не входят.', ['Укажите задание и причину.', 'Офис закрыт в субботу, но вы просите срок на понедельник.']),
      ],
    },
    'unit-081': {
      reminder: 'В проекте проверяйте действующий файл, исполнителя и срок. Исправленная ссылка может изменить файл, не меняя исполнителя.',
      questions: [
        project.c('untouched-owner', 'Кто и какой файл должен отправить?', '8:00 · Eli sends draft.pdf at noon. 9:15 · draft.pdf is locked. Replace it with ready.pdf. Keep the same sender and time.', ['The owner of ready.pdf at noon.', 'Eli sends ready.pdf at noon.', 'Eli sends draft.pdf at noon.'], 1, 'Файл поменяли, а отправитель по-прежнему Илай.', ['Изменилось одно поле.', 'Keep the same сохраняет отправителя и срок.']),
        project.w('link-handoff', 'Напишите Мари. Начните с Mari, попросите использовать правильное место с use и скажите, кто отправит файл. Используйте will send it.', 'CLASS FOLDER · shared drive is read-only today · use team folder · Sol sends the file; Ben only checks the text', [
          'Mari, use the team folder. Sol will send it.',
          'Mari, please use the team folder. Sol will send it.',
        ], 'Рабочее место — папка команды. Сол отправляет файл; Бен только перечитывает текст.', ['Выберите папку, где можно работать.', 'Отличите проверяющего от отправителя.']),
      ],
    },
    'unit-091': {
      reminder: 'Различайте опыт вообще, отдельное событие и уже полученный результат. Если собеседник просит сменить тему, выберите другое продолжение.',
      questions: [
        club.c('already-photo', 'Каково текущее положение?', 'Jay: I’ve tried the class before. I went again last Friday. I paid to join today, but I haven’t sent my photo yet.', ['Jay hasn’t tried the club.', 'Jay sent the photo last Friday.', 'Jay paid and still needs to send a photo.'], 2, 'Джей уже заплатил, но фото ещё не отправил.', ['Указаны и опыт, и текущий статус.', 'Смотрите, что стоит после but.']),
        club.w('old-event-date', 'Спросите, когда состоялось первое выступление. Начните с When did you и используйте first perform или perform for the first time.', 'CLUB CHAT · Kay: I’ve performed there before. My first show went well. · You: don’t know the date of that show', ['When did you first perform?', 'When did you perform for the first time?', 'When did you first perform there?', 'When did you perform there for the first time?'], 'Вопрос относится к одному событию в прошлом. После did остаётся perform.', ['Место и общий опыт уже названы.', 'Спросите о времени конкретного первого случая.'], 'ask'),
      ],
    },
    'unit-103': {
      reminder: 'В заявке на визит нужны неисправность, комната, окно доступа и просьба о визите. Сначала проверьте, открыта ли проблема. Could someone come by? — «Мог бы кто-нибудь зайти?»',
      questions: [
        home.w('bedroom-window', 'Оставьте заявку из трёх фраз. Назовите нерешённую проблему с The window won’t close или The window will not close, укажите комнату, подтвердите окно с I’ll be home / I will be home и попросите о визите (Could someone come by? / Could someone come to fix it?). Часы укажите цифрой или словом без p.m.', 'WORK ORDER · living room lamp: fixed · bedroom window: won’t close · home from 4 to 6', ['4 to 6', 'four to six'].flatMap(window => [
          ...visit("window won't close", 'bedroom', 'from ' + window),
          ...visit('window will not close', 'bedroom', 'from ' + window),
        ]), 'Заявка должна назвать окно в спальне, доступ с четырёх до шести и просьбу прийти.', ['Лампа уже исправлена.', 'После описания окна запишите время и просьбу.']),
        home.w('sink-after-class', 'Оставьте заявку из трёх фраз. Начните с The sink is leaking, назовите комнату, сообщите доступ с I’ll be home / I will be home и попросите о визите (Could someone come by? / Could someone come to fix it?). Время пишите цифрой или словом без p.m.', 'APARTMENT LOG · kitchen: light replaced, sink still leaking · at class until 5 · home after 5', ['5', 'five'].flatMap(time => visit('sink is leaking', 'kitchen', 'after ' + time)), 'Проблема осталась с раковиной на кухне. Визит возможен после пяти.', ['Свет уже починили.', 'After относится к началу доступности.']),
      ],
    },
  },
};
