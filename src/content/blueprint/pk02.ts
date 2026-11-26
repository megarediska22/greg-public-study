import { tasks, unit, type ContentPacket } from './author.ts';
import { supplements } from './pk02Supplements.ts';

const routines = tasks('bp-a1-02');
const routineLesson = unit('bp-a1-02', 'A1', 'Распорядок и уточняющий вопрос',
  'По карточке расскажите о привычке и спросите о недостающем факте.',
  'Один факт есть, другого не хватает',
  'Сначала решите, о чём речь. Состояние или место человека описываем с am, is, are. Для привычного действия берём сам глагол. Если место действия уже записано, спросите о другой неизвестной детали.',
  [
    ['Состояние', 'I am / she is', 'I’m tired.', 'Я устал / устала.'],
    ['Привычка', 'I + глагол / he + глагол с -s', 'I walk to class. Ben walks to class.', 'Я хожу на занятия пешком. Бен ходит на занятия пешком.'],
    ['Вопрос о действии', 'Where / What + do / does + кто + глагол', 'Where does Ben eat lunch? What do you read?', 'Где Бен обедает? Что ты читаешь?'],
  ], 'После does уберите -s у основного глагола. Where спрашивает о месте, what — о предмете или действии.',
  [
    routines.c('desk-state', 'В анкете нужно описать состояние. Какой факт подходит?', 'MIA · at the desk · sleepy · starts at nine', ['Mia starts at nine.', 'Mia is sleepy.', 'Mia is at the desk.'], 1, 'Sleepy описывает, как Миа себя чувствует.', ['Сравните состояние, место и распорядок.', 'Ищите слово о самочувствии.']),
    routines.c('after-lunch', 'Что Кай делает после обеда?', 'KAI · reads before lunch · checks email after lunch', ['He eats after lunch.', 'He reads a book.', 'He checks email.'], 2, 'После обеда он проверяет почту. Чтение было до обеда.', ['Посмотрите на after.', 'After lunch относится к проверке почты.']),
    routines.c('work-detail', 'Карточка сообщает время. Выберите вопрос о недостающем факте.', 'JO · work: 6 p.m. · place: ? ', ['Where does Jo work?', 'What does Jo do at six?', 'Is Jo tired?'], 0, 'Where does Jo work? помогает узнать место работы.', ['Чего не хватает после place?', 'Нужен вопрос о месте действия work.']),
    routines.c('walk-habit', 'Что сообщает табличка о Лу?', 'LU · bike to school on Tuesdays · bus today', ['Lu takes the bus on Tuesdays.', 'Lu bikes to school on Tuesdays.', 'Lu walks to school on Tuesdays.'], 1, 'По вторникам Лу ездит в школу на велосипеде. Автобус относится к сегодняшнему дню.', ['Сравните on Tuesdays и today.', 'Выберите действие для вторников.']),
  ], [
    routines.b('her-work', 'Заполните одним словом. Речь о работе по пятницам.', 'Nina ___ at the library on Fridays. (work)', 'works', 'После Nina в утверждении к work добавляется -s.', ['Nina — she.', 'Это утверждение о привычке.']),
    routines.b('your-job', 'Вставьте одно вспомогательное слово.', 'Where ___ you study in the evening?', 'do', 'С you вопрос о действии строится с do.', ['Здесь уже есть действие study.', 'Подберите форму для you.']),
    routines.b('their-feeling', 'Вставьте одну форму be.', 'Natasha and Eli ___ tired after class.', 'are', 'Два человека — they, поэтому нужна are.', ['Сосчитайте людей.', 'Состояние требует формы be.']),
    routines.b('partner-action', 'Вставьте одно слово в вопрос.', 'What does Sam ___ before class? (read)', 'read', 'После does пишем начальную форму read.', ['Вспомогательное слово уже есть.', 'У основного глагола здесь нет -s.']),
  ], [
    routines.w('studio-intro', 'Вы — Тесс. В одном предложении с I сообщите, где учитесь по понедельникам. Начните с I study и закончите днём.', 'TESS · Mondays: study at the studio · lunch place: ?', 'I study at the studio on Mondays.', 'Вы говорите от лица Тесс и передаёте место и день из карточки.', ['Выберите строку про учёбу.', 'Укажите место перед днём.'], 'record'),
    routines.w('studio-lunch', 'Вы — Тесс. Спросите собеседника, где он обедает. Используйте eat lunch и you.', 'Introduce yourself → ask your partner about their lunch place', 'Where do you eat lunch?', 'Where узнаёт место, а после do you идёт eat lunch.', ['Нужно место действия, а не время.', 'С you начните с Where и добавьте do.'], 'ask'),
    routines.w('museum-start', 'Передайте привычку Реми. Начните с Remy и используйте start work. Время укажите цифрой или словом, без a.m.', 'REMY · museum · work starts at 8 · already at work: no', ['Remy starts work at 8.', 'Remy starts work at eight.', 'Remy starts work at 8:00.'], 'Из карточки берём обычное начало работы. У starts есть -s.', ['Уже ли Реми на работе — другой факт.', 'Сначала имя и действие, затем at и час.'], 'record'),
    routines.w('meal-object', 'Спросите, что Дэна готовит по воскресеньям. Начните с What и используйте cook.', 'DANA · cooks on Sundays · dish: ?', 'What does Dana cook on Sundays?', 'Неизвестно блюдо, поэтому подходит What. После does используем cook.', ['Известен день, а блюдо неизвестно.', 'Имя — после вспомогательного глагола.'], 'ask'),
  ], 'В новом профиле сначала подчеркните известный факт, потом сформулируйте вопрос только о том, чего не хватает.');

const rooms = tasks('bp-a1-03');
const roomLesson = unit('bp-a1-03', 'A1', 'Опишите комнату и найдите вещь',
  'Найдите предмет в текстовом описании и скажите, где его искать.',
  'Сначала назовите предмет, затем уточните место',
  'Для нового предмета используйте a или an. Если оба человека уже знают, о каком предмете речь, подходит the. There is говорит об одном предмете, there are — о нескольких.',
  [
    ['Есть предмет', 'There is + a/an + предмет', 'There’s a coat in the hall.', 'В прихожей есть пальто.'],
    ['Где он', 'The + предмет + is + место', 'The coat is next to the door.', 'Пальто рядом с дверью.'],
    ['Вопрос о нескольких', 'Are there any + предметы?', 'Are there any cups in the kitchen?', 'На кухне есть чашки?'],
  ], 'In — внутри, on — на поверхности, next to — рядом. На вопрос Are there…? можно коротко ответить Yes, there are или No, there aren’t.',
  [
    rooms.c('guest-key', 'Где лежит ключ гостя?', 'GUEST ROOM · books: shelf · guest key: in a cup · bag: chair', ['On the shelf.', 'In a cup.', 'On the chair.'], 1, 'Ищем строку guest key. Книги и сумка лежат в других местах.', ['Определите предмет, который ищет гость.', 'Смотрите только на строку с ключом.']),
    rooms.c('different-book', 'О какой книге говорит второй человек?', 'A: There’s a book on the desk. B: Is the book yours?', ['О любой книге в доме.', 'О другой книге.', 'О книге на столе.'], 2, 'The book отсылает к книге, которую только что назвали.', ['Что уже появилось в первой реплике?', 'Сравните a book и the book.'], true),
    rooms.c('number-of-coats', 'Какой вариант подходит для описания комнаты?', 'HALL · coat × 2 · bench × 1', ['There are two coats in the hall.', 'There is a coat in the hall.', 'There are no coats in the hall.'], 0, 'В прихожей два пальто, поэтому there are two coats.', ['Сосчитайте пальто.', 'Для нескольких предметов подходит there are.']),
    rooms.c('different-spot', 'Где лежит сумка, которую можно взять?', 'Two bags · black bag on the bed: leave it · blue bag by the door: take it', ['On the bed.', 'By the door.', 'On the desk.'], 1, 'Взять можно синюю сумку. Она у двери.', ['Сначала выясните, какую сумку взять.', 'Take it относится к синей сумке.']),
  ], [
    rooms.b('new-orange', 'Впишите артикль при первом упоминании.', 'I found ___ orange in my bag.', 'an', 'Orange начинается с гласного звука, поэтому an.', ['Апельсин упоминается впервые.', 'Послушайте первый звук слова.']),
    rooms.b('same-notebook', 'Вставьте артикль. Собеседники продолжают говорить об одной вещи.', 'A: I found a notebook. B: Is ___ notebook on your desk?', 'the', 'The указывает на тот блокнот, о котором уже сказали.', ['В новой реплике предмет известен.', 'Это та же вещь, о которой сказали раньше.']),
    rooms.b('single-cup', 'Заполните одним словом.', 'There ___ a cup on the table.', 'is', 'A cup — одна чашка, поэтому is.', ['Найдите предмет после пропуска.', 'Число единственное.']),
    rooms.b('in-drawer', 'Впишите предлог из in / on / next to. Ключ внутри ящика.', 'The key is ___ the drawer.', 'in', 'In указывает на место внутри ящика.', ['Это внутреннее пространство.', 'Здесь не поверхность.']),
  ], [
    rooms.w('laundry-card', 'Сообщите, где лежит полотенце для гостя. Начните с The guest towel. Используйте beside или next to.', 'LAUNDRY ROOM · guest towel → beside the sink · clean shirts → in the basket', ['The guest towel is beside the sink.', 'The guest towel is next to the sink.'], 'Полотенце рядом с раковиной, а в корзине лежат рубашки.', ['Найдите предмет для гостя.', 'От предмета перейдите к его положению относительно раковины.'], 'record'),
    rooms.w('reading-card', 'Укажите место очков. Начните с The glasses и назовите коробку из карточки.', 'READING ROOM · glasses → inside the red box · pen → on the table', ['The glasses are in the red box.', 'The glasses are inside the red box.'], 'Очки внутри красной коробки. С glasses употребляем are.', ['Glasses здесь означает «очки».', 'Покажите, что предмет находится внутри.'], 'record'),
    rooms.w('guest-request', 'Спросите, есть ли одеяло в спальне. Начните вопрос с Is there и используйте blanket.', 'GUEST · bedroom · need: one blanket · inventory unavailable', 'Is there a blanket in the bedroom?', 'Вопрос об одном одеяле начинается с Is there a blanket.', ['Не утверждайте, что предмет уже нашли.', 'Напишите вопрос об одном предмете и добавьте место.'], 'ask'),
    rooms.w('plate-reply', 'Коротко ответьте на вопрос. Используйте there и не повторяйте слово plates.', 'A: Are there any plates in the kitchen? · Kitchen inventory: forks × 4, cups × 2, plates × 0', ["No, there aren't.", 'No, there are not.', "No there aren't", 'No there are not'], 'Тарелок ноль. Короткий отрицательный ответ сохраняет there и are.', ['Проверьте строку plates.', 'В коротком ответе оставьте число из вопроса.']),
  ], 'В одной новой комнате спросите о наличии предмета. В другой комнате ответьте, где лежит уже упомянутый предмет.');

const now = tasks('bp-a1-04');
const nowLesson = unit('bp-a1-04', 'A1', 'Обычно или прямо сейчас',
  'Сравните расписание с сообщением и запишите, что происходит.',
  'План на неделю и взгляд в окно дают разные ответы',
  'Расписание или привычку описываем в Present Simple. Событие, которое видим в кадре или в текущем сообщении, описываем с am, is или are и глаголом на -ing. Can отдельно показывает возможность.',
  [
    ['То, что происходит повторно', 'действие / действие с -s', 'Jules draws after lunch.', 'Джулс рисует после обеда.'],
    ['Кадр в этот момент', 'am/is/are + -ing', 'Jules is washing a cup.', 'Джулс сейчас моет чашку.'],
    ['Что человек может', 'can + обычная форма', 'Jules can help at four.', 'Джулс может помочь в четыре.'],
  ], 'Проверьте источник. Надпись «расписание» и подпись под прямой трансляцией описывают разные вещи даже без слова now.',
  [
    now.c('club-picture', 'Что можно сказать по кадру трансляции?', 'Club schedule: yoga on Fridays · Live camera: Kim reads a note', ['Kim does yoga.', 'Kim is reading a note.', 'Kim reads notes on Fridays.'], 1, 'Кадр показывает, что Ким читает записку в этот момент.', ['Смотрите на live camera.', 'Из кадра не следует привычка.']),
    now.c('regular-work', 'Ближайшая смена отменена. О чём всё ещё говорит расписание?', 'Regular schedule: Mondays at the gym · Message: no shift this Monday', ['The worker works at the gym on Mondays.', 'The worker is working at the gym this Monday.', 'The worker never works at the gym.'], 0, 'У человека есть обычная смена по понедельникам, хотя одна отменена.', ['Различите обычный график и исключение.', 'Отмена одной смены не отменяет привычку.']),
    now.c('practice-help', 'Какой ответ сообщает о возможности помочь?', 'NATASHA · can help after practice · practice in progress', ['Natasha helps at every practice.', 'Natasha is helping at practice.', 'Natasha can help after practice.'], 2, 'Возможность помочь появится после тренировки.', ['Когда возможна помощь?', 'Не превращайте возможность в действие.']),
    now.c('call-sound', 'Что происходит при звонке?', 'A: Can you talk? B: No, the teacher is talking.', ['Учитель обычно проводит уроки.', 'Учитель говорит в этот момент.', 'Учитель сейчас заканчивает говорить.'], 1, 'Is talking означает действие в данный момент. Окончание не названо.', ['Почему человек не может говорить?', 'Действие уже идёт.'], true),
  ], [
    now.b('schedule-class', 'Впишите одно слово от teach по расписанию.', 'ROSA · regular classes: Tuesdays → Rosa ___ on Tuesdays.', 'teaches', 'Обычное расписание с Rosa требует teaches.', ['Это регулярные занятия.', 'После teach в этой форме добавляется -es.']),
    now.b('photo-be', 'Впишите одну форму be по кадру.', 'LIVE: two kids at the piano → They ___ playing.', 'are', 'При they нужна are, потом playing.', ['Героев двое.', 'В кадре показано само действие.']),
    now.b('availability', 'Впишите одно слово от help.', 'Max can ___ after dinner.', 'help', 'После can нужна начальная форма help.', ['Can уже показывает возможность.', 'У глагола нет -s или -ing.']),
    now.b('call-verb', 'Впишите форму play одним словом по прямому эфиру.', 'LIVE STREAM · one person at the piano → Ada is ___ the piano.', 'playing', 'Is и playing вместе описывают действие в кадре.', ['Форма be уже стоит.', 'Измените только play.']),
  ], [
    now.w('radio-live', 'Исправьте ошибку. Запишите верный факт для подписи к эфиру. Начните с Ren или Ren’s; используйте talk и to a guest. Другие сведения не нужны.', 'STATION · regular: picks music · on air: interview with guest · wrong: “Ren is picking music.”', ['Ren is talking to a guest.', "Ren's talking to a guest."], 'В эфире идёт беседа, а выбор музыки — обычная работа.', ['Требуется факт из эфира.', 'Начните с имени, затем покажите действие в процессе.']),
    now.w('market-habit', 'Исправьте подпись к недельному графику. Начните с Sky и используйте sell fruit. Закончите местом, день не нужен.', 'SKY · weekly stall: the market, fruit · video: Sky is at home · wrong: “Sky sells fruit at home.”', 'Sky sells fruit at the market.', 'Рынок указан для обычной торговли. Дом виден только в видео.', ['Отделите обычное место работы от кадра.', 'В утверждении Sky требует глагола с -s.']),
    now.w('bakery-negation', 'Подруга спрашивает, готовит ли Джо ужин. Напишите отрицание одним предложением с Jo и cook dinner. Не добавляйте, что Джо делает вместо этого.', 'LIVE CALL · Jo is carrying boxes at the bakery', ["Jo isn't cooking dinner.", 'Jo is not cooking dinner.', "Jo's not cooking dinner."], 'Звонок застаёт Джо за другим делом, поэтому отрицаем текущее действие готовки.', ['Проверьте, что происходит во время звонка.', 'У отрицания есть форма be и глагол на -ing.']),
    now.w('practice-question', 'Спросите у друга, занимается ли он в этот момент. Используйте you и study. Не добавляйте время.', 'CHAT · your partner has a study book open · current activity: ?', 'Are you studying?', 'Про текущий эпизод спрашиваем Are you studying?', ['Не спрашивайте о привычке вообще.', 'Начните с формы be для you.'], 'ask'),
  ], 'Если перепутали время, снова проверьте источник. Сначала опишите обычный график, затем отдельный момент по другой записи.');

const plans = tasks('bp-a1-05');
const plansLesson = unit('bp-a1-05', 'A1', 'Договориться в короткой переписке',
  'Поддержите короткую переписку и предложите время, которое подходит обоим.',
  'Следующая реплика решает то, что ещё открыто',
  'Если человек занят, предложите другое время. Если неясен час, уточните его. Подтвердите встречу только когда оба согласны. После подтверждения можно коротко попрощаться.',
  [
    ['Предложить', 'How about + время? / Can we meet at + час?', 'How about on Tuesday?', 'Как насчёт вторника?'],
    ['Уточнить', 'What time works for you?', 'What time works for you?', 'Какое время тебе подходит?'],
    ['Согласиться и закончить', 'That works. See you then!', 'That works. See you then!', 'Подходит. Тогда увидимся!'],
  ], 'At ставим перед часом, on — перед днём. Для пары коротких реплик здесь достаточно двух предложений.',
  [
    plans.c('time-missing', 'Что спросить, если день уже есть, а час ещё неизвестен?', 'A: Friday works for me. B: ?', ['See you at five!', 'What time works for you?', 'Can we meet on Saturday instead?'], 1, 'Нужно выяснить время в пятницу, а день менять не требуется.', ['Что уже согласовано?', 'Вопрос должен касаться часа.']),
    plans.c('after-class', 'Какой ответ подходит обоим?', 'A: I’m in class until four. B: I’m free at 3:30 and 4:30.', ['Can we meet at 3:30?', 'See you in class!', 'Can we meet at 4:30?'], 2, 'В 4:30 первый собеседник уже свободен, второму это время тоже подходит.', ['Ищите время после окончания занятия.', 'Проверьте оба расписания.']),
    plans.c('accept-good-news', 'Ответьте на радостную новость и согласитесь на предложенное время.', 'A: I finished the poster! Can we hang it at noon? · You: free at noon', ['Great! Noon works for me.', 'Sorry, I’m busy at noon.', 'How about next week?'], 0, 'Great реагирует на новость, а Noon works for me подтверждает время.', ['В сообщении есть новость и вопрос.', 'Проверьте, свободны ли вы в полдень.']),
    plans.c('pending-close', 'О чём говорит вторая реплика?', 'A: Can we meet at seven? B: I can’t, but I’m free later.', ['Человек согласен встретиться в семь.', 'Человек предлагает выбрать другое время.', 'Человек уже назначил точный час.'], 1, 'Later оставляет точное время открытым, а семь не подходит.', ['Прочитайте обе части ответа.', 'Later не называет точного часа.'], true),
  ], [
    plans.b('shared-window', 'Подставьте время цифрами, без a.m. или p.m. Выберите общий вариант.', 'A: free 10:30 or 11:30. B: busy until 11:00. → How about ___?', '11:30', 'В 10:30 второй человек занят. Подходит 11:30.', ['Посмотрите, когда заканчивается занятость.', 'Проверьте варианты первого человека.']),
    plans.b('hour-prep', 'Допишите один предлог перед часом.', 'Can we meet ___ nine?', 'at', 'Перед точным часом употребляем at.', ['Это час, а не день.', 'Нужен короткий предлог времени.']),
    plans.b('shared-day', 'Впишите только день по-английски.', 'A: free Tuesday or Thursday. B: free Thursday or Friday. → How about ___?', 'Thursday', 'Оба свободны в четверг.', ['Сравните два списка.', 'Нужен только общий день.']),
    plans.b('open-hour', 'Впишите вопросительное слово.', 'We both said Sunday. ___ time works for you?', 'What', 'What time узнаёт точный час в уже выбранный день.', ['День уже известен.', 'Нужна конструкция со словом time.']),
  ], [
    plans.w('band-busy', 'В двух предложениях скажите, что в шесть вы не можете (I can’t или I can’t meet at six), и предложите ваш свободный час. Используйте How about или Can we meet at. Напишите час цифрой или словом, без p.m.', 'BAND CHAT · A: Can we meet at six? · YOU: work until 6:30, free at 7', [
      "I can't. How about seven?", "I can't meet at six. How about seven?", "I can't. How about 7?", "I can't meet at six. How about 7?",
      "I can't. Can we meet at seven?", "I can't meet at six. Can we meet at seven?", "I can't. Can we meet at 7?", "I can't meet at six. Can we meet at 7?",
      'I cannot. How about seven?', 'I cannot meet at six. How about seven?', 'I cannot. How about 7?', 'I cannot meet at six. How about 7?',
      'I cannot. Can we meet at seven?', 'I cannot meet at six. Can we meet at seven?', 'I cannot. Can we meet at 7?', 'I cannot meet at six. Can we meet at 7?',
    ], 'Откажитесь от шести и предложите семь, когда вы свободны.', ['Сравните время просьбы и свой график.', 'После отказа напишите вопрос с другим часом.'], 'respond'),
    plans.w('walk-unknown', 'Сначала согласитесь с днём фразой Monday works for me или Monday works, затем спросите о часе с What time. Закончите вопрос works for you или can we meet.', 'WALK CHAT · A: Want to go for a walk Monday? · YOU: Monday is fine; no hour set', ['Monday works for me. What time works for you?', 'Monday works. What time works for you?', 'Monday works for me. What time can we meet?', 'Monday works. What time can we meet?'], 'День подходит, а час ещё предстоит выбрать. Вторая реплика должна быть вопросом.',['Не придумывайте час.', 'Первая фраза подтверждает день, вторая выясняет время.']),
    plans.w('lunch-close', 'Подтвердите время с works for me и попрощайтесь фразой See you then. Время напишите как 12:30.', 'LUNCH · A: So, 12:30 on Wednesday? · YOU: yes', ['12:30 works for me. See you then!', '12:30 works for me! See you then!'], 'Оба согласны, поэтому после подтверждения можно закончить разговор.', ['Здесь уже есть и день, и час.', 'Сначала повторите час, потом коротко попрощайтесь.'], 'farewell'),
    plans.w('art-club', 'Переспросите о дне, не подтверждая встречу. Используйте What day и meet.', 'ART CLUB · A: Let’s meet at five. · Day: ?', ['What day can we meet?', 'What day should we meet?', 'What day do we meet?', 'What day are we meeting?', 'What day will we meet?'], 'Пять — это час, но ответа о дне нет. Вопрос с What day уточняет день.', ['Не спрашивайте ещё раз о пяти.', 'После What day задайте короткий вопрос о встрече.'], 'ask'),
  ], 'При повторении поменяйте причину сбоя. Если известен час, а не день, уточняйте день. Если время не подходит, предложите реальную альтернативу.');

export const pk02: ContentPacket = {
  version: 4,
  placements: [['daily-routines', routineLesson], ['home-places', roomLesson], ['actions-time', nowLesson], ['small-talk-basics', plansLesson]],
  supplements,
};
