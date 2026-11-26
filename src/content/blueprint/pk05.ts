import { tasks, unit, type ContentPacket } from './author.ts';
import { pk05Supplements } from './pk05Supplements.ts';

const advice = tasks('bp-a2-04');
const recommendation = unit('bp-a2-04', 'A2', 'Рекомендация с причиной и условием',
  'Сравните варианты и предложите выполнимый план с причиной и следующим шагом.',
  'Проверьте ограничения до того, как советовать',
  'Сначала исключите варианты, которые не подходят по цене, времени или вместимости. Затем назовите одну подтверждённую причину. Завершите просьбой ответить или условием, от которого зависит план.',
  [
    ['Совет', 'We should / We could + действие', 'We should choose the morning tour.', 'Стоит выбрать утреннюю экскурсию.'],
    ['Причина', 'because + факт', 'It costs less and has enough seats.', 'Она дешевле, и мест хватает.'],
    ['Условие или шаг', 'if / please + действие', 'Please reply by noon.', 'Ответьте, пожалуйста, до полудня.'],
  ], 'Самый дешёвый вариант может не подойти. Сначала проверьте обязательное условие. В письменном ответе можно назвать один решающий факт, если его подтверждает источник.',
  [
    advice.c('rain-venue', 'Куда можно позвать группу?', 'Club of five needs a dry indoor space. Patio $15, seats 9, outside. Room Oak $18, seats 4, inside. Room Ash $20, seats 8, inside.', ['Room Oak.', 'Room Ash.', 'The patio.'], 1, 'Помещение Ash внутри здания, и в нём помещаются пять человек.', ['Проверьте помещение и число мест.', 'Четырёх мест не хватит.']),
    advice.c('less-isnt-fit', 'Какой совет соответствует условиям?', 'Four people need tickets under $40 total. Early train: $32 total, arrives after the show starts. Noon bus: $36 total, arrives before the show. Taxi: $44.', ['Take the early train because it’s cheaper.', 'Take a taxi.', 'Take the noon bus because it’s on time and within budget.'], 2, 'Автобус приезжает вовремя и стоит меньше $40.', ['Проверьте не только цену.', 'Отбросьте поздний и слишком дорогой вариант.']),
    advice.c('next-step', 'Какую просьбу можно добавить к совету?', 'The studio is available. The organizer needs a yes or no before booking at 3:00.', ['Please reply by 2:30.', 'Please arrive at three.', 'Please pay after the booking deadline.'], 0, 'Ответ до 2:30 позволяет организатору забронировать в три.', ['Нужен ответ до брони.', 'Не путайте ответ и прибытие.']),
    advice.c('show-budget', 'Почему не подходит второй показ?', 'Two guests can come before eight. Show A starts at 6:30. Show B starts at 8:30 and costs less.', ['Show B is full.', 'Show B starts too late.', 'Show B costs more.'], 1, 'Второй показ дешевле, но начинается после восьми.', ['Из текста ясно, что дешевле.', 'Проверьте ограничение по времени.']),
  ],
  [
    advice.b('seat-gap', 'Сколько мест не хватает? Введите только цифру.', 'Group of 7. Room North has 5 seats. → Extra seats needed: ___', '2', 'Семи людям не хватает двух мест.', ['Сравните число гостей и мест.', 'Из семи вычтите вместимость.']),
    advice.b('cheaper-shape', 'Допишите одну сравнительную форму от cheap.', 'The bus is ___ than the train.', 'cheaper', 'Cheaper сравнивает цены двух вариантов.', ['Than вводит второй вариант.', 'У короткого cheap добавляется -er.']),
    advice.b('reply-limit', 'Введите последнее допустимое время ответа цифрами с минутами, без p.m.', 'Booking starts at 3:00. The team needs your reply 15 minutes earlier.', '2:45', 'Четверть часа до 3:00 — это 2:45.', ['Ответ нужен раньше брони.', 'Вычтите 15 минут.']),
    advice.b('option-because', 'Впишите союз, который объясняет выбор причиной.', 'We should book the small room ___ the big one is closed.', 'because', 'Because вводит причину выбора.', ['Вторая часть отвечает на «почему?».', 'Нужен союз причины.']),
  ],
  [
    advice.w('team-recording', 'Напишите группе две фразы. В первой посоветуйте с We should или We could и use, назовите помещение и после because укажите его вместимость с it seats. Во второй попросите Please reply и передайте срок. Число мест пишите цифрой или словом.', 'RECORDING GROUP · 6 people · Oak seats 4, free now · Elm seats 8, free now · reply by noon', ['We should', 'We could'].flatMap(start => ['8', 'eight'].map(n => start + ' use Elm because it seats ' + n + '. Please reply by noon.')), 'Elm вмещает всю группу. Ответ до полудня нужен, чтобы подтвердить выбор.', ['Оба помещения свободны, но сравните места.', 'Дайте одну причину и срок ответа.']),
    advice.w('gallery-visit', 'Порекомендуйте группе вариант с We should или We could. Используйте visit, укажите открытую галерею и с because сообщите, во сколько она закрывается. Затем попросите Please confirm by и добавьте срок. Часы можно цифрами или словами, без p.m.', 'AFTER-SCHOOL VISIT · arrival 4:30 · West Gallery closes at 4 · River Gallery closes at 6 · confirm by 3', ['We should', 'We could'].flatMap(start => ['6', '6:00', 'six'].flatMap(end => ['3', '3:00', 'three'].map(deadline =>
      start + ' visit River Gallery because it closes at ' + end + '. Please confirm by ' + deadline + '.'))), 'К 4:30 первая галерея закрыта, а River Gallery работает до шести. Подтвердить нужно до трёх.', ['Сравните время прибытия и закрытия.', 'Во второй фразе не перепутайте срок подтверждения со временем закрытия.']),
    advice.w('no-cheap-ride', 'Объясните отказ от автобуса одной фразой с We can’t take the bus или We cannot take the bus и because. Используйте get there too late или arrive too late.', 'DINNER · bus arrival 7:30 · seats held until 7:15', ["We can't", 'We cannot'].flatMap(start => ['get there too late', 'arrive too late'].flatMap(action => ['we ' + action, action.startsWith('get') ? 'it gets there too late' : 'it arrives too late',
      ...['we will', "we'll", 'it will', "it'll"].map(subject => subject + ' ' + action)].map(reason =>
      start + ' take the bus because ' + reason + '.'))), 'Автобус привезёт вас после 7:15, когда бронь уже снимут.', ['Посмотрите, до какого часа держат места.', 'Вы объясняете, почему вариант не подходит.']),
    advice.w('conditional-send', 'Напишите действие на случай согласия. Начните с If everyone agrees, затем I’ll или I will и слова book the room. Другие условия не добавляйте.', 'CHAT · only book the room after everyone says yes', ["If everyone agrees, I'll book the room.", 'If everyone agrees, I will book the room.', "If everyone agrees I'll book the room.", 'If everyone agrees I will book the room.'], 'Комната бронируется после согласия всех участников.', ['Сначала условие.', 'Во второй части — ваше действие в будущем.']),
  ], 'Сверьте, выполним ли выбранный вариант. Затем проверьте, что причина и срок относятся именно к нему.');

const request = tasks('bp-a2-05');
const maintenance = unit('bp-a2-05', 'A2', 'Заявка и подтверждение после ответа',
  'Оформите заявку и по ответу службы подтвердите только то, что действительно сделано.',
  'Обещанный визит и готовый ремонт — разные статусы',
  'В заявке укажите проблему, комнату, время доступа и просьбу о визите. В ответе службы найдите слова fixed или still. We’ll come означает, что визит только запланирован.',
  [
    ['Неисправность', 'The … isn’t working / is leaking', 'The shower in Room 3 is leaking.', 'Душ в комнате 3 протекает.'],
    ['Доступ и просьба', 'I’m home from … to … / Could someone come?', 'I’m home from two to four. Could someone come by?', 'Я дома с двух до четырёх. Мог бы кто-нибудь зайти?'],
    ['После ответа', '… works now / … still needs repair', 'The heater works now, but the window still won’t close.', 'Обогреватель работает, но окно всё ещё не закрывается.'],
  ], 'Если поправили только одно, не закрывайте всю заявку. Проверьте, есть ли в сообщении факт ремонта или только обещание.',
  [
    request.c('one-open', 'Что нужно оставить открытым?', 'Service: We fixed the hall light this morning. We can look at the front lock tomorrow.', ['Only the hall light.', 'Only the front lock.', 'Both are already fixed.'], 1, 'Свет уже починили. Замок только планируют посмотреть.', ['Отметьте прошедшее fixed.', 'Can look tomorrow — будущий шаг.']),
    request.c('both-closed', 'Что теперь можно подтвердить?', 'Service log: We replaced the bathroom fan yesterday. The kitchen tap was fixed today. Both were tested.', ['Only the tap works.', 'The fan still needs a visit.', 'Both repairs are complete.'], 2, 'Оба ремонта завершены и проверены.', ['Ищите статус обоих предметов.', 'Both относится к двум ремонтам.']),
    request.c('arrival-not-repair', 'Каков статус обогревателя?', 'Office: A technician will get there at four. The heater is still off.', ['A visit is planned. The heater isn’t fixed.', 'The heater is fixed.', 'The technician finished at four.'], 0, 'Визит назначен, а обогреватель по-прежнему не работает.', ['Найдите планы с will.', 'Still описывает текущую проблему.']),
    request.c('complete-ticket', 'В какой заявке указано всё нужное?', 'Task check · fault, room, entry window, request for a visit', [
      'The bedroom light is out. Could someone come by?',
      'The bedroom light is out. I’m home from two to four. Could someone come by?',
      'I’m home from two to four. The light is out.',
    ], 1, 'Во второй заявке есть и место, и окно доступа, и просьба о визите.', ['Проверьте все четыре компонента.', 'Сравните, чего не хватает в других сообщениях.']),
  ],
  [
    request.b('visit-window', 'Введите допустимый час визита цифрами с минутами, без p.m.', 'You can let someone in from 1:00 to 3:30. Service offers 2:15 or 4:10.', '2:15', 'В два пятнадцать можно впустить мастера. В 4:10 окно уже закрыто.', ['Проверьте обе границы.', 'Из двух часов только один внутри окна.']),
    request.b('still-word', 'Впишите одно слово, чтобы показать, что проблема сохраняется.', 'The ceiling ___ leaks after the visit.', 'still', 'Still означает «всё ещё».', ['После визита ничего не изменилось.', 'Нужен маркер продолжающегося состояния.']),
    request.b('unexpected-room', 'Введите название помещения одним словом.', 'Original: check the bathroom fan. Update: bathroom is fine; the fan in the kitchen is broken.', 'kitchen', 'Заявка теперь про кухонный вентилятор.', ['Прочитайте последнее сообщение.', 'У старого помещения уже нет такой проблемы.']),
    request.b('time-end', 'Допишите предлог, который завершает интервал.', 'I’m home from four ___ six.', 'to', 'From … to … обозначает начало и конец интервала.', ['From уже показывает начало.', 'Второй предлог нужен перед концом.']),
  ],
  [
    request.w('laundry-ticket', 'Оформите заявку из трёх фраз. Начните The dryer и используйте isn’t working или is not working. Укажите место из журнала. Затем сообщите окно через I’ll be home или I will be home. Время цифрами с минутами. Закончите Could someone come by? или Could someone come to fix it?', 'TICKET · washer: fixed · dryer: out of order in the laundry room · access from 5:30 to 7:00', ["isn't working", 'is not working'].flatMap(status => ["I'll be home", 'I will be home'].flatMap(access =>
      ['Could someone come by?', 'Could someone come to fix it?'].map(end =>
        'The dryer ' + status + ' in the laundry room. ' + access + ' from 5:30 to 7:00. ' + end))),
      'Сушилка в прачечной ещё не работает. Мастера можно впустить с 5:30 до 7:00.', ['Сначала проверьте статус двух приборов.', 'После места укажите обе границы окна.']),
    request.w('kitchen-partial', 'Ответьте службе двумя фразами. Подтвердите, что духовка работает, с The oven works now или The oven is working now. Затем попросите вернуться к незакрытой проблеме с Could you fix или Can you fix. Назовите предмет.', 'SERVICE · We tested the oven; it works. The kitchen fan still makes a loud noise. We can come again if you ask.', ['The oven works now.', 'The oven is working now.'].flatMap(first => ['Could you', 'Can you'].map(start => first + ' ' + start + ' fix the kitchen fan?')),
      'Духовку можно закрыть как исправленную. Вентилятору нужен ещё один визит.', ['Первый факт подтверждён тестом.', 'Просьба относится только к второму прибору.']),
    request.w('window-both', 'Подтвердите оба завершённых действия. Одной фразой с The lock and the window или The window and the lock добавьте work now или are working now.', 'VISIT REPORT · New lock installed and tested. Window tested after repair; it closes normally.', ['The lock and the window', 'The window and the lock'].flatMap(subject => ['work now', 'are working now'].map(status => subject + ' ' + status + '.')),
      'Оба результата проверены, поэтому можно подтвердить и замок, и окно.', ['Прочитайте отметки tested.', 'Два предмета — множественное число.']),
    request.w('arrival-confirm', 'Подтвердите время доступа, сохранив статус открытым. Начните с I’ll be home или I will be home, укажите согласованный час цифрами с минутами и затем попросите Please check the heater.', 'OFFICE · We can arrive at 10:15. Heater repair: pending. YOU · home from 10:00 to 11:00', ["I'll be home at 10:15. Please check the heater.", 'I will be home at 10:15. Please check the heater.'],
      'В 10:15 вы дома, но обогреватель ещё не починен. Вы просите его проверить.', ['Не пишите, что ремонт выполнен.', 'Подтвердите время и назовите оставшийся шаг.']),
  ], 'После ответа службы разнесите ключевые детали на две строки: выполнено и осталось. Отвечайте только на то, что подтверждено.');

const update = tasks('bp-a2-06');
const mediation = unit('bp-a2-06', 'A2', 'Передать главное из двух обновлений',
  'Передайте отсутствующему адресату новый план и то, что сохранилось.',
  'Новое письмо меняет отдельные части плана',
  'Составьте две колонки для себя: что изменилось и что осталось. Затем решите, что нужно именно адресату. Если важная деталь не названа в обоих сообщениях, её можно уточнить.',
  [
    ['Новый факт', '… will + действие', 'Jae will pick up the keys.', 'Ключи заберёт Джей.'],
    ['Условие сохранилось', '… is still + прежнее поле', 'The deadline is still Monday.', 'Срок по-прежнему в понедельник.'],
    ['Неизвестное', 'Do you know + деталь?', 'Do you know the new contact number?', 'Ты знаешь новый контактный номер?'],
  ], 'Still не добавляет новую дату. By указывает крайний срок, а at — точный час встречи или начала.',
  [
    update.c('changed-shift', 'Что нужно передать помощникам?', 'A: Inez opens the hall at 9:00. B: Inez is out sick. Ari will open it instead. The hour is the same.', ['The hall won’t open.', 'Ari opens the hall at 9:00.', 'Inez opens it at a new time.'], 1, 'Открывает Ари, а девять часов не изменились.', ['Сравните, кто открывает.', 'The same относится ко времени.']),
    update.c('same-class-room', 'Какое сведение осталось прежним?', 'Note 1: Class at ten in Room 5. Note 2: Class moved to eleven. Your room is still Room 5.', ['The hour.', 'The teacher.', 'The room.'], 2, 'Время сдвинулось. Кабинет 5 сохранился.', ['Посмотрите, что стоит после still.', 'Про преподавателя не сказано.']),
    update.c('unknown-supplies', 'Что нужно уточнить перед покупкой?', 'A: Bring drinks to the fourth floor on Saturday. B: We moved to the third floor, same day. We have cups. I don’t know how many people are coming.', ['How many guests are coming?', 'Where is the meeting?', 'What day is the meeting?'], 0, 'День и этаж уже согласованы. Количество гостей пока неизвестно.', ['Нужна информация, которая меняет количество напитков.', 'Место и день уже названы.']),
    update.c('file-stays', 'Какое сообщение точнее передаёт изменение?', 'A: Send quiz.pdf by Thursday. B: Thursday is too soon; send it by Saturday. Keep the same file.', ['Make a new file for Thursday.', 'Send quiz.pdf by Saturday.', 'Send a new file by Saturday.'], 1, 'Файл остаётся quiz.pdf, а срок меняется на субботу.', ['Что изменилось после точки с запятой?', 'Keep the same сохраняет файл.']),
  ],
  [
    update.b('new-owner', 'Впишите только имя человека, который будет открывать дверь.', 'Kai has the key. Update: Kai gives the key to Noor. Noor will open the door. Lex brings the signs.', 'Noor', 'В новом сообщении дверь открывает Нур.', ['Смотрите действие open.', 'Наличие ключа в первой фразе уже не решает задачу.']),
    update.b('new-end', 'Впишите действующий крайний срок цифрами с минутами, без p.m.', 'Original: return by 4:00. Update: the front office closes early. Return by 3:30 instead.', '3:30', 'Из-за раннего закрытия срок теперь 3:30.', ['Ищите instead.', 'Введите новый срок, а не первый.']),
    update.b('same-contact', 'Введите только имя контакта.', 'Info: ask Lia about Room 7. Update: Room 9 now, same contact.', 'Lia', 'Поменялся кабинет, но контакт остался прежним.', ['Разделите кабинет и имя.', 'Same contact сохраняет имя из первой записи.']),
    update.b('by-not-at', 'Вставьте предлог, чтобы сообщить крайний срок, а не время встречи.', 'Please send the file ___ noon.', 'by', 'By noon означает «не позднее полудня».', ['Отправить можно раньше.', 'Слово относится к крайнему сроку.']),
  ],
  [
    update.w('speaker-handoff', 'Сообщите Бо, кто теперь принесёт колонки и какой срок остался. Начните с Bo,. Используйте will bring the speakers и The deadline is still. Час напишите как noon или 12:00.', 'COMMUNITY PLAY · Thu: Remy delivers speakers by noon · Fri update: Remy can’t drive. Ava will bring them. No change to delivery time.', ['Bo, Ava will bring the speakers. The deadline is still noon.', 'Bo, Ava will bring the speakers. The deadline is still 12:00.'],
      'Колонки теперь принесёт Ава. Срок остаётся в полдень.', ['Два обновления меняют только исполнителя.', 'Во второй фразе сохраните согласованный срок.']),
    update.w('pool-handoff', 'Сообщите Деву, где оставить ключ и когда теперь крайний срок. Начните с Dev, и используйте drop off the key. День не добавляйте. Час напишите как 5:30.', 'POOL SERVICE · First note: Drop off the key at the side desk by 6:00. Later: We close early; all keys are due by 5:30. Use the usual desk.', ['Dev, drop off the key at the side desk by 5:30.', 'Dev, please drop off the key at the side desk by 5:30.'],
      'Место — прежняя боковая стойка. Действующий срок теперь 5:30.', ['Usual desk отсылает к первой записи.', 'Не переносите старый срок.']),
    update.w('library-detail', 'Спросите, у какой двери теперь встретиться. Начните с Which door и используйте meet at. Другие детали не уточняйте.', 'LIBRARY WALK · Same day and time. The west entrance is closed. The note names no new entrance.', ['Which door should we meet at?', 'Which door can we meet at?', 'Which door are we meeting at?', 'Which door do we meet at?', 'Which door will we meet at?'],
      'День и час не изменились. Новая дверь не названа.', ['Уточняйте только новое место.', 'Meet at связывает встречу с дверью.'], 'ask'),
    update.w('event-summary', 'Передайте две части обновления с order и deliver. Первую фразу начните с Ben will или Ben’ll, вторую — с Jo will или Jo’ll. Назовите материал в обеих фразах или во второй фразе замените на it.', 'POSTERS · Ben orders paper as planned. Update: pickup person changed from Rae to Jo. Jo delivers the paper to the gym.', [
      'Ben will order the paper.', "Ben'll order the paper.",
    ].flatMap(first => ['Jo will', "Jo'll"].flatMap(who => ['it', 'the paper'].map(item => first + ' ' + who + ' deliver ' + item + ' to the gym.'))),
      'Заказ остался за Беном. Доставку бумаги в спортзал берёт на себя Джо.', ['Свяжите каждое действие с именем.', 'Изменился только ответственный за доставку.']),
  ], 'В новом обновлении проверьте своего адресата, действующий срок и исполнителя. Оставьте только факты, которые помогут действовать.');

const final = tasks('bp-a2-07');
const exit = unit('bp-a2-07', 'A2', 'Финальная самопроверка A2 на новых ситуациях',
  'Проверьте, как вы читаете обновления, сопоставляете условия и пишете короткие сообщения.',
  'Проверьте каждое действие на своём источнике',
  'Ответьте без подсказки, если хотите оценить самостоятельность. После разбора повторите действие на другом тексте. Эта проверка касается чтения и коротких письменных ответов.',
  [
    ['План', 'Сравните время, доступ и условия поездки', 'Canceled = the old plan will not happen.', 'Canceled — прежний план отменён.'],
    ['Ответ службы', 'Разделите факт и обещание', 'Fixed / will be checked', 'Уже исправлено / только проверят.'],
    ['Отчёт', 'Выберите главный результат и оставшийся шаг', 'Feedback / next step', 'Отзыв / следующий шаг.'],
  ], 'Если один итог не получился, посмотрите, какое действие вызвало трудность. Здесь проверяются отдельные текстовые умения.',
  [
    final.c('rain-ferry', 'Какой план можно принять?', 'The 9:00 cleanup was canceled. New start: 2:00. In sun, meet in the field; in rain, meet in the covered hall. The forecast calls for rain through 3:00. The ferry reaches both sites at 1:30. The bus arrives at 2:15.', [
      'Take the bus to the covered cleanup.', 'Take the ferry to the covered cleanup.', 'Take the ferry to the field.',
    ], 1, 'Из-за дождя встреча в крытом зале. Паром приходит до двух, автобус опаздывает.', ['Сначала выберите место по прогнозу.', 'Сравните два времени прибытия с началом.']),
    final.c('not-closed', 'Что ещё надо сделать?', 'Service: The lock was replaced and tested. The new key card opens the outer door only. We’ll check the storage door tomorrow.', ['Replace the lock again.', 'Open the work order for the outer door.', 'Check the storage door.'], 2,
      'Замок заменён. Проверку двери кладовой ещё только обещают.', ['Разделите две двери.', 'Будущее обязательство ещё не выполнено.']),
    final.c('main-meeting', 'Что важно передать группе?', 'A: The photo club has booked a big room. B: Our usual printer will be closed. Bring digital copies for the screen. The café next door opens at seven.', [
      'Bring digital copies because the printer is closed.', 'The café opens at seven.', 'The club canceled the meeting.',
    ], 0, 'Группе нужно подготовить цифровые копии для экрана. Кафе не влияет на встречу.', ['Как сообщение меняет действия участников?', 'Последняя бытовая деталь здесь второстепенна.']),
    final.c('attended-people', 'Сколько людей действительно было на встрече?', 'RSVP: 9 people said yes. Sign-in: 7 came. Two other friends plan to come next time.', ['Nine.', 'Seven.', 'Eleven.'], 1, 'Пришли семь человек. Остальное — обещания и планы.', ['Отделите RSVP от списка пришедших.', 'Смотрите фактическую запись о встрече.']),
  ],
  [
    final.b('garage-deadline', 'Введите крайний срок передачи формы, цифрами с минутами, без p.m.', 'The office closes at 4:00. Forms must arrive 20 minutes before closing.', '3:40', 'Двадцать минут до закрытия в четыре — это 3:40.', ['Нужен срок передачи формы.', 'Вычтите 20 минут из часа закрытия.']),
    final.b('count-comes', 'Сколько человек пришло? Введите цифрами.', '10 signed up. The actual attendance was two fewer.', '8', 'Восемь человек пришло, на двоих меньше записи.', ['Слово actual означает фактический результат.', 'Вычтите двоих.']),
    final.b('who-holds', 'Введите только имя ответственного за ключ.', 'Nia checked the lights. Leo went home. Pat took the key and will return it Friday.', 'Pat', 'Пэт забрал ключ и должен его вернуть.', ['Проверьте ключ, а не свет.', 'Это человек, который должен что-то сделать дальше.']),
    final.b('new-weather-hour', 'Впишите действующее время начала цифрами с минутами, без p.m.', 'Sun plan: 1:00 in the park. Rain plan: 2:30 at the school. Forecast: rain all afternoon.', '2:30', 'Из-за прогноза действует второй план — школа в 2:30.', ['Сначала выберите условие.', 'Возьмите час из соответствующей строки.']),
  ],
  [
    final.w('borrow-by-deadline', 'Коротко попросите группу принести зонт и ответить до срока. Первую фразу начните с Could you bring или Can you bring, назовите an umbrella. Вторую начните Please reply by. Час напишите цифрами с минутами, без a.m.', 'PARK CLUB · Old pickup canceled. We walk to an indoor room at noon. Rain is expected on the way. Gear request: umbrella for walk. Confirm by 11:30.',
      ['Could you bring an umbrella? Please reply by 11:30.', 'Can you bring an umbrella? Please reply by 11:30.'],
      'Зонт нужен по пути из-за дождя. Ответ просят до 11:30, а идут в полдень.', ['Возьмите нужную вещь из запроса.', 'Отделите срок ответа от часа выхода.'], 'request'),
    final.w('attendance-report', 'Напишите короткий итог встречи. Сначала число пришедших с people came, затем передайте отзыв с They liked и последнюю задачу с still needs to. Используйте три короткие фразы. Число можно цифрами или словом.',
      'PUZZLE MEET · 10 planned, 6 arrived · feedback: liked the team games · follow-up: Mina to send the next date (not sent)',
      ['Six', '6'].flatMap(count => ['the next date', 'the date for the next meeting'].map(date =>
        count + ' people came. They liked the team games. Mina still needs to send ' + date + '.')),
      'В отчёте важны шесть участников, отзыв об играх и оставшаяся задача Мины.', ['Возьмите фактическое число.', 'Подтвердите отзыв и оставьте будущую задачу открытой.']),
    final.w('confirm-freeze', 'Сообщите службе, что уже работает, и спросите о том, что ещё предстоит. Используйте The app works now или The app is working now и When will you. Назовите действие restore my files или get my files back.',
      'TECH HELP · Your app is working again. Your files are still missing. We’ll work on them next.',
      ['The app works now.', 'The app is working now.'].flatMap(start => ['restore my files', 'get my files back'].map(end => start + ' When will you ' + end + '?')),
      'Приложение работает, но файлы ещё не восстановлены. Об этом и спрашиваем.', ['Факт относится к приложению.', 'Вопрос относится к незавершённому действию.'], 'ask'),
    final.w('parallel-update', 'Перешлите Рэй короткое сообщение с действующим часом и сохранённым входом. Начните с Ray, we meet или Ray, we’re meeting. Используйте at перед временем и by перед входом. Время напишите цифрами с минутами.',
      'NEIGHBORS · Old 5:00 beside the library side door. Update: the librarian finishes work at 5:10, so we start five minutes later. Same door.',
      ['Ray, we meet at 5:15 by the library side door.', "Ray, we're meeting at 5:15 by the library side door.", 'Ray, we are meeting at 5:15 by the library side door.'],
      'Срок привязан к окончанию работы плюс пять минут. Боковой вход остаётся прежним.', ['Новый час отсчитывается от 5:10.', 'Вход переносится из первой записи.']),
  ], 'Если пропустили ограничение, вернитесь к рекомендации с причиной. Если перепутали факт и обещание, повторите заявки и ответы службы. Чтобы ещё раз потренировать выбор главного, возьмите новое обновление из письменной практики.');

export const pk05: ContentPacket = {
  version: 7,
  placements: [['unit-101', recommendation], ['unit-111', maintenance], ['unit-120', mediation], ['unit-121', exit]],
  supplements: pk05Supplements,
};
