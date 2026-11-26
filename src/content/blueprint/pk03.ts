import { tasks, unit, type ContentPacket } from './author.ts';
import { pk03Extras } from './pk03Supplements.ts';

const note = tasks('bp-a1-06');
const visitor = unit('bp-a1-06', 'A1', 'Целая записка посетителю',
  'По объявлению напишите посетителю, когда вернуться и куда идти.',
  'Записка помогает человеку сделать следующий шаг',
  'Имя показывает, кому оставили записку. Затем сообщите нужный час и место. Часы работы могут быть указаны рядом со временем возвращения.',
  [
    ['Возвращение', 'I’ll be back at + время', 'I’ll be back at 2:30.', 'Я вернусь в 2:30.'],
    ['Где ждать', 'Wait + место', 'Wait by the front door.', 'Подожди у главного входа.'],
    ['Кому и что делать', 'Имя + две короткие фразы', 'Hi, Natalie. I’ll be back at 1:00. Please wait in Room 3.', 'Привет, Натали. Я вернусь в час. Пожалуйста, подожди в кабинете 3.'],
  ], 'Перед часом поставьте at. Back at сообщает время возвращения. Open until показывает, до какого часа место открыто.',
  [
    note.c('venue-hours', 'Когда дежурный будет на месте?', 'DESK · Open until 5:00 p.m. · On a break. Back at 2:15 p.m.', ['5:00 p.m.', '2:15 p.m.', '2:50 p.m.'], 1, 'Дежурный вернётся в 2:15. Стойка работает до пяти.', ['Здесь два времени для двух разных событий.', 'Ищите строку Back at.']),
    note.c('east-door', 'Какой вход сегодня открыт для посетителей?', 'WEST DOOR · Closed today. Please use the east door.', ['The west door.', 'Both doors.', 'The east door.'], 2, 'Западный вход закрыт. Нужно пройти через восточный.', ['Не останавливайтесь на названии двери.', 'Посмотрите, куда просят пройти.']),
    note.c('short-action', 'Куда должен пойти Ли, если пришёл к 11:00?', 'Hi, Lee. I’ll be back at noon. Please wait in the lobby.', ['The lobby.', 'The back office.', 'Room 11.'], 0, 'До полудня нужно ждать в вестибюле.', ['Разделите время возвращения и место ожидания.', 'Место идёт после wait.']),
    note.c('same-place', 'Какое сведение осталось прежним?', 'Yesterday: Room 18 at ten. Update: Room 18 at eleven.', ['The hour.', 'The room.', 'Both.'], 1, 'Кабинет остался тот же, а встреча на час позже.', ['Сравните исходную и новую записи.', 'Цифра после Room одинакова.']),
  ],
  [
    note.b('asked-return', 'Впишите час возвращения как часы и минуты, без a.m.', 'OFFICE · Open 8:00 a.m. · Back from a break at 10:45 a.m. · Back at ___', '10:45', '10:45 — возвращение с перерыва, 8:00 — открытие.', ['Здесь нужны часы после Back.', 'Введите цифры с двоеточием.']),
    note.b('at-clock', 'Вставьте один предлог.', 'I’ll be back ___ four.', 'at', 'Перед точным временем ставится at.', ['Четыре — час.', 'Нужен короткий предлог времени.']),
    note.b('where-box', 'Введите только номер кабинета.', 'Old room: 16. It’s closed. Drop off your form in Room 61. → Room ___', '61', 'Форму просят оставить в кабинете 61. Кабинет 16 закрыт.', ['Сверьте инструкцию drop off с номером.', 'Нужен новый кабинет.']),
    note.b('morning-or-end', 'Впишите последний допустимый час цифрами с минутами и без p.m.', 'Come after 1:00 p.m. The last entry is at 4:30 p.m. The building closes at 5:00 p.m. → Last entry: ___', '4:30', 'Войти можно до 4:30. Пять — время закрытия здания.', ['Есть время входа и время закрытия.', 'Ищите ограничение last entry.']),
  ],
  [
    note.w('workshop-update', 'Напишите записку Ким. Начните с Hi, Kim или Kim, сообщите свой новый час возвращения с I’ll be back или I will be back и попросите подождать с Please wait. Час напишите как часы и минуты, без p.m. Кабинет пишите Room + цифра.', 'WORKSHOP · for KIM · old return 1:15 / Room 2 · updated return 1:45 / Room 6 · action: wait there', [
      "Hi, Kim. I'll be back at 1:45. Please wait in Room 6.", 'Hi, Kim. I will be back at 1:45. Please wait in Room 6.',
      "Kim, I'll be back at 1:45. Please wait in Room 6.", 'Kim, I will be back at 1:45. Please wait in Room 6.',
    ], 'В записке для Ким стоят новый час, новый кабинет и просьба подождать.', ['Сверьте обе детали с отметкой updated.', 'Сначала обратитесь к Ким, затем напишите о возвращении и ожидании.']),
    note.w('club-door', 'Оставьте записку Бо. Начните с Hi, Bo или Bo, укажите, где ждать (Wait by или Please wait by), затем сообщите, когда вы вернётесь (I’ll be back или I will be back). Час пишите цифрами с минутами, без p.m.', 'MUSIC CLUB · visitor: BO · new return 3:20 (old 3:00) · same meeting spot: side door', [
      "Hi, Bo. Wait by the side door. I'll be back at 3:20.", "Hi, Bo. Please wait by the side door. I'll be back at 3:20.",
      'Hi, Bo. Wait by the side door. I will be back at 3:20.', 'Hi, Bo. Please wait by the side door. I will be back at 3:20.',
      "Bo, wait by the side door. I'll be back at 3:20.", "Bo, please wait by the side door. I'll be back at 3:20.",
      'Bo, wait by the side door. I will be back at 3:20.', 'Bo, please wait by the side door. I will be back at 3:20.',
    ], 'Время изменилось, но Бо по-прежнему ждёт у боковой двери.', ['Какое поле помечено как same?', 'Сохраните место, обновите время и назовите адресата.']),
  ], 'Проверьте три вещи в записке: кому она адресована, когда ждать и где это делать. Для повтора возьмите другое уведомление.');

const log = tasks('bp-a1-07');
const events = unit('bp-a1-07', 'A1', 'Что было сделано раньше',
  'Восстановите порядок событий и сообщите, что успели сделать.',
  'В журнале порядок задаёт время',
  'Строки могут стоять вразнобой. Выпишите время каждого события. Если действие отмечено как not yet, оно в этом отчёте ещё не сделано.',
  [
    ['Раньше, затем', 'First … Then …', 'First we packed the bags. Then we called a cab.', 'Сначала мы собрали сумки. Потом вызвали такси.'],
    ['Состояние', 'was / were + признак', 'The office was empty.', 'В офисе никого не было.'],
    ['Не сделали', 'didn’t + начальная форма', 'We didn’t close the window.', 'Мы не закрыли окно.'],
  ], 'Was описывает состояние. После didn’t назовите действие начальной формой, даже если речь о вчерашнем дне.',
  [
    log.c('pool-log', 'Что сделали первым?', 'POOL LOG · 10:20 called the manager · 9:40 opened the doors · 10:05 changed a sign', ['Called the manager.', 'Opened the doors.', 'Changed a sign.'], 1, '9:40 раньше 10:05 и 10:20, поэтому сначала открыли двери.', ['Не судите по порядку строк.', 'Сначала найдите самое раннее время.']),
    log.c('door-status', 'Какая строка сообщает о состоянии?', '12:30 Sam opened the door. 12:35 The hall was cold. 12:40 Sam closed the door.', ['Sam opened the door.', 'The hall was cold.', 'Sam closed the door.'], 1, 'Was cold описывает, каким был холл. Две другие строки называют действия.', ['У состояния нет действия вроде open.', 'Ищите was и слово-признак.']),
    log.c('clean-status', 'Что ещё предстоит сделать?', 'ROOM CHECK · move chairs: done · wash cups: not yet · close windows: done', ['Move the chairs.', 'Close the windows.', 'Wash the cups.'], 2, 'Чашки пока не вымыли. Два других дела завершены.', ['Сравните done и not yet.', 'Выберите незавершённую строку.']),
    log.c('same-actions', 'Когда закрыли стол справок?', 'DESK · Friday: closed at five. Saturday: closed at two. Sunday: closed all day.', ['At two on Saturday.', 'At two on Friday.', 'At five on Sunday.'], 0, 'В субботу закрыли в два часа. В пятницу — в пять.', ['Сравните три дня.', 'В воскресенье точного момента закрытия нет.']),
  ],
  [
    log.b('past-open', 'Впишите прошедшую форму от open.', 'The team ___ the gate at 8:15 yesterday.', 'opened', 'Opened сообщает о завершённом действии.', ['Действие уже произошло.', 'У правильного глагола здесь окончание -ed.']),
    log.b('past-room', 'Вставьте форму be для одного кабинета в прошлом.', 'The room ___ cold before lunch.', 'was', 'С the room в прошлом употребляется was.', ['Room в единственном числе.', 'Cold описывает состояние.']),
    log.b('past-fail', 'Впишите одно слово от finish.', 'We didn’t ___ the list last night.', 'finish', 'После didn’t глагол остаётся в начальной форме.', ['Прошлое уже показано в didn’t.', 'Не добавляйте -ed.']),
    log.b('later-time', 'Введите время первого выполненного дела цифрами, без a.m.', 'LOG · 9:50 started the test · 9:20 opened the box · 9:10 clean desk: not yet', '9:20', 'Запись в 9:10 не обозначает завершённое действие. Первое сделанное — в 9:20.', ['Учитывайте и время, и отметку статуса.', 'Отбросьте незавершённый пункт.']),
  ],
  [
    log.w('gym-desk', 'Напишите, что сделали сначала и затем. Используйте две фразы с First we и Then we. Возьмите глаголы из строк журнала, проговорите оба объекта. Часы не нужны.', 'GYM SHIFT · 8:25 check the balls (done) · 8:10 open the gym (done) · clean the mats (not yet)', ['First we opened the gym. Then we checked the balls.', 'First, we opened the gym. Then we checked the balls.', 'First we opened the gym. Then, we checked the balls.', 'First, we opened the gym. Then, we checked the balls.'], '8:10 — открыли зал, 8:25 — проверили мячи. Маты ещё не чистили.', ['Уберите пункт not yet.', 'Оставшиеся действия поставьте по времени.']),
    log.w('club-not-done', 'Напишите две фразы с We. Сначала сообщите, что команда сделала раньше из двух выполненных дел; затем что команда не сделала. Часы не нужны.', 'CLUB LOG · 6:20 start the meeting (done) · 6:05 change the room (done) · send a note (not yet)', ["We changed the room. We didn't send a note.", 'We changed the room. We did not send a note.', "We changed the room. We didn't send the note.", 'We changed the room. We did not send the note.'], 'В шесть пять сменили кабинет. Записку ещё не отправили.', ['Сначала сравните часы с done.', 'Оставьте send в начальной форме после отрицания.']),
    log.w('shop-cold', 'Одной фразой передайте состояние витрины. Начните с The window и используйте open, часы не нужны.', 'BAKERY · 7:00 WINDOW — open (status) · 7:05 ALEX — opened the door (action)', 'The window was open.', 'В 7:00 окно уже было открыто. Не приписываем окну действие.', ['Ищите строку с состоянием витрины.', 'Open после was — признак.']),
    log.w('hall-report', 'Запишите выполненное действие одним предложением с Kai и finish the signs. Порядок в отчёте не важен, час не указывайте.', 'HALL CLEANUP · pack the boxes: not yet · finish the signs: done (Kai)', 'Kai finished the signs.', 'Кай закончил таблички. Коробки ещё не собраны.', ['Нужна запись с done.', 'Глагол обозначает действие в прошлом.']),
  ], 'При повторении попробуйте объяснить один порядок и один статус. Если сначала смотрели подсказку, возьмите другой журнал и начните без неё.');

const bridge = tasks('bp-a1-08');
const check = unit('bp-a1-08', 'A1', 'Самопроверка перед переходом к A2',
  'На новых коротких текстах проверьте вопрос о привычке, расписание, записку и события.',
  'Сначала прочитайте, затем решите, какое действие нужно',
  'Попробуйте каждую ситуацию без подсказки. При разборе проверьте, где вы нашли сведения и что изменилось после помощи. Исходные фразы и темы отличаются от примеров ниже.',
  [
    ['Профиль', 'Прочитайте вопрос и поле, которого не хватает', 'schedule = regular plan', 'schedule — обычный график или план.'],
    ['Объявление', 'Свяжите нужное время и действие', 'last entry = latest time to go in', 'last entry — последнее время входа.'],
    ['Журнал', 'Сверьте время и статус', 'done / not done', 'сделано / не сделано.'],
  ], 'Первая самостоятельная попытка и учебное завершение после разбора отвечают на разные вопросы. После ошибки попробуйте похожую задачу с другими фактами.',
  [
    bridge.c('visit-slot', 'Когда Нел может прийти?', 'MUSEUM · Monday closes at 5:00. Tuesday closes at 7:00. Last entry 30 minutes before closing. NELL · free Monday at 4:45 or Tuesday at 6:15.', ['Monday at 4:45.', 'Tuesday at 6:15.', 'Tuesday at 6:45.'], 1, 'В понедельник в 4:45 вход уже закрыт. Во вторник в 6:15 вход ещё открыт, и Нел свободна.', ['Вход закрывается раньше музея.', 'Вычтите 30 минут и проверьте время Нел.']),
    bridge.c('workplace-be', 'Какой вопрос выяснит рабочее место?', 'DEV · starts at five · work: where?', ['What does Dev do at five?', 'Where does Dev work?', 'Is Dev at home?'], 1, 'Нужен вопрос о месте действия, поэтому Where does Dev work?', ['Уже указан час.', 'Уточните place действия work.']),
    bridge.c('club-log', 'Что записано как сделанное, а не как запланированное?', 'MUSIC ROOM · Yesterday, the door was open. We moved the piano at 4:15. Check the lights tomorrow.', ['They checked the lights.', 'They moved the piano.', 'They opened the door at 4:15.'], 1, 'Они передвинули пианино. Дверь была открыта, а свет только собираются проверить.', ['Смотрите глаголы и время.', 'Ищите действие, которое прямо названо в прошедшем.']),
    bridge.c('onsite', 'Какой факт можно сообщить о текущем эфире?', 'KELLY · regular: washes cars at the shop · live video: carries two bags into the shop', ['Kelly washes cars at the shop.', 'Kelly is carrying two bags.', 'Kelly is washing two cars.'], 1, 'Видео показывает сумки. Мойка машин — привычная работа.', ['В материале два источника.', 'Вопрос про то, что видно в эфире.']),
  ],
  [
    bridge.b('day-after', 'Введите час цифрами с двоеточием. Передайте время, которое подойдёт.', 'On Friday the front desk opens again at 3:00 p.m. Taylor can come at 2:45 or 3:15 → Taylor can come at ___.', '3:15', 'В 3:15 стойка уже открыта. 2:45 приходится на перерыв.', ['Проверьте два варианта по времени открытия.', 'Впишите только часы и минуты.']),
    bridge.b('they-ask', 'Заполните пропуск одним словом.', 'What ___ Riley and Jay eat before class?', 'do', 'Два человека — they. Вопрос о действии строится с do.', ['Здесь два человека.', 'Вопрос о действии, а не о состоянии.']),
    bridge.b('state-then', 'Допишите одно слово, описывающее состояние двери днём.', 'At noon the door was open. Drew shut it at two. → At noon it was ___.', 'open', 'Днём дверь была открыта. Её закрыли позже.', ['Сопоставьте две отметки времени.', 'Перенесите признак двери в нужный час.']),
    bridge.b('plays-later', 'Вставьте одну форму от play.', 'MS. JAY · Saturday routine: tennis · current: on the phone → Ms. Jay ___ tennis on Saturdays.', 'plays', 'Предложение о привычке с одним человеком требует plays.', ['Смотрите строку routine.', 'У формы для she есть окончание -s.']),
  ],
  [
    bridge.w('question-missing', 'Уточните у Ники недостающий факт. Используйте you, одно слово из Where / What и слова buy lunch. Время не добавляйте.', 'NIKI · buys lunch after class · place: ?', 'Where do you buy lunch?', 'Место неизвестно. В вопросе собеседнику нужен порядок Where do you buy lunch?', ['Сначала выберите вопросительное слово по неизвестному полю.', 'После you оставьте начальную форму.'], 'ask'),
    bridge.w('now-fix', 'Исправьте подпись к фото. Начните с Dana и используйте pack the boxes. Место не добавляйте.', 'DANA · checked phone before photo; photo: boxes half full, Dana putting books inside · caption: Dana checks her phone.', ['Dana is packing the boxes.', "Dana's packing the boxes."], 'Кадр показывает упаковку коробок, а не проверку телефона.', ['Исправьте действие по кадру.', 'Подпись описывает один эпизод в процессе.']),
    bridge.w('recipient-note', 'Оставьте записку для Дрю. Начните с Drew, или Hi, Drew. Скажите I’ll be back или I will be back и час цифрами с минутами. Затем попросите Please wait или Wait. Укажите кабинет как Room + цифры.', 'OFFICE · visitor DREW has a pass only for Room 4. Room 9 is open to staff only. You’ll be back when the break ends at 2:40. The next lesson starts at 3:00.', [
      "Drew, I'll be back at 2:40. Please wait in Room 4.", "Drew, I'll be back at 2:40. Wait in Room 4.",
      'Drew, I will be back at 2:40. Please wait in Room 4.', 'Drew, I will be back at 2:40. Wait in Room 4.',
      "Hi, Drew. I'll be back at 2:40. Please wait in Room 4.", "Hi, Drew. I'll be back at 2:40. Wait in Room 4.",
      'Hi, Drew. I will be back at 2:40. Please wait in Room 4.', 'Hi, Drew. I will be back at 2:40. Wait in Room 4.',
    ], 'Дрю нужно идти в кабинет 4 и ждать возвращения в 2:40.', ['Куда Дрю может войти по своему пропуску?', 'Различите конец перерыва и начало занятия.']),
    bridge.w('past-update', 'Напишите две фразы с We о том, что сделали и чего не сделали. Используйте данные из журнала, часы не нужны.', 'DESK LOG · 3:00 open the side door ✓ · call Sam ×', ["We opened the side door. We didn't call Sam.", 'We opened the side door. We did not call Sam.'], 'Боковую дверь открыли, Сэму не позвонили. После didn’t — call.', ['Начните с выполненного пункта.', 'Оставьте второе действие отрицательным.']),
    bridge.w('parallel-visitor', 'Для повторения напишите записку Крису. Начните с Hi, Chris. Скажите, когда ждать вас (I’ll be back или I will be back), и попросите оставить анкету. Для второй части используйте Please leave your form. Час напишите цифрами с минутами.', 'CLUB · Chris has a form for Maya · Maya returns 11:35 · drop-off location: on table by the door', [
      "Hi, Chris. I'll be back at 11:35. Please leave your form on the table by the door.",
      'Hi, Chris. I will be back at 11:35. Please leave your form on the table by the door.',
    ], 'Крис узнает час возвращения Майи и место, где оставить анкету.', ['Сохраните имя посетителя и час Майи.', 'В конце назовите действие и место для анкеты.']),
  ], 'Если неясно, что спросить, вернитесь к профилям в уроке про распорядок. Если перепутали часы, сравните часы работы и последний вход. Для записки сверяйте адресата, место и действие.');

export const pk03: ContentPacket = {
  version: 5,
  placements: [['unit-031', visitor], ['unit-039', events], ['unit-041', check]],
  ...pk03Extras,
};
