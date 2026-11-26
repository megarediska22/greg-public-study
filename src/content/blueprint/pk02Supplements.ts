import { tasks, type Addition } from './author.ts';

const people = tasks('people-feelings-pk02');
const present = tasks('present-simple-pk02');
const questions = tasks('do-does-pk02');
const routine = tasks('daily-routines-pk02');
const articles = tasks('articles-pk02');
const family = tasks('family-objects-pk02');
const there = tasks('there-is-are-pk02');
const home = tasks('home-places-pk02');
const hobbies = tasks('hobbies-abilities-pk02');
const continuous = tasks('present-continuous-pk02');
const actions = tasks('actions-time-pk02');
const combinations = tasks('everyday-combinations-pk02');
const arrangements = tasks('simple-arrangements-pk02');
const smallTalk = tasks('small-talk-basics-pk02');

export const supplements: Readonly<Record<string, Addition>> = {
  'people-feelings': {
    reminder: 'Смотрите, что случилось с человеком. «I need to sleep» говорит об усталости, а «This is great!» показывает радость. С именем одного человека используйте is.',
    questions: [
      people.c('lost-sleep', 'Как Сэм описывает своё состояние?', 'SAM · Сон: 3 часа. Сейчас хочет отдохнуть.', ['I’m happy.', 'I’m tired.', 'I’m early.'], 1, 'Сэм мало спал и хочет отдохнуть. Этому подходит tired.', ['Что нужно Сэму после короткого сна?', 'Подходит слово о самочувствии.']),
      people.w('good-news', 'Опишите состояние Джун по сообщению. Начните с June и выберите happy или tired.', 'JUNE · Сообщение: «У меня теперь есть работа! Это здорово!»', ['June is happy.', "June's happy."], 'Хорошая новость объясняет радость. С June возможны is и сокращение ’s.', ['Прочитайте обе фразы Джун.', 'Поставьте форму be после имени.']),
    ],
  },
  'present-simple': {
    reminder: 'В анкете плюс показывает действие, минус — его отсутствие. С именем человека в обычном утверждении часто добавляем -s. В отрицании форма doesn’t уже показывает he или she, поэтому сам глагол остаётся без -s.',
    questions: [
      present.w('mara-card', 'По карточке сообщите о привычке Мары. Начните с Mara и используйте walk to work. Закончите днём недели.', 'MARA · Tuesday: walks · Thursday: takes the bus', 'Mara walks to work on Tuesdays.', 'По вторникам Мара ходит пешком, а в другой день пользуется автобусом.', ['Выберите день для ходьбы.', 'После Mara добавьте -s к walk.']),
      present.w('anton-card', 'По карточке сообщите, чего Антон не делает утром. Начните с Anton и используйте drink coffee. Закончите словами in the morning.', 'ANTON · morning: tea ✓, coffee × · afternoon: coffee ✓', ["Anton doesn't drink coffee in the morning.", 'Anton does not drink coffee in the morning.'], 'Утром Антон не пьёт кофе. После doesn’t и does not остаётся drink.', ['Выберите утреннюю строку и знак минус.', 'Отрицание стоит перед начальной формой.']),
    ],
  },
  'do-does': {
    reminder: 'Where уточняет место, What — действие или предмет. Вопрос о состоянии можно начать с Is или Are. С вопросом о действии используйте do/does и начальную форму.',
    questions: [
      questions.c('unknown-activity', 'Какой вопрос узнаёт действие?', 'NATE · after class at the library · activity: ?', ['Where does Nate go after class?', 'Is Nate at the library?', 'What does Nate do after class?'], 2, 'Место известно. What does Nate do…? узнаёт само действие.', ['Что обозначает activity?', 'Where здесь повторно спрашивает о месте.']),
      questions.w('unknown-location', 'Спросите, где Ли покупает хлеб. Используйте buy bread и имя Lee.', 'LEE · buys bread on the way home · store: ?', 'Where does Lee buy bread?', 'Нужен вопрос о месте действия. После does пишется buy.', ['Про действие уже известно.', 'Поставьте does между вопросительным словом и именем.'], 'ask'),
      questions.w('status-not-habit', 'Спросите, готова ли Зоя. Используйте Zoe и ready.', 'ZOE · partner for the game · ready: ?', 'Is Zoe ready?', 'Ready — состояние. Is перемещается перед Zoe.', ['Это состояние, а не действие.', 'Начните с формы be для одного человека.'], 'ask'),
    ],
  },
  'daily-routines': {
    reminder: 'Из расписания берите вместе человека, действие и время. Перед часом поставьте at, перед днём — on. К привычному действию с he или she добавляем -s: help → helps.',
    questions: [
      routine.w('lee-earlier', 'Запишите одно предложение о том, что Ли делает первым. Начните с Lee и выберите действие из eat breakfast, take the bus и start class. Час напишите цифрами с двоеточием.', 'LEE · bus 7:45 · breakfast 7:15 · class 8:30', ['Lee has breakfast at 7:15.', 'Lee eats breakfast at 7:15.'], 'Самая ранняя запись — завтрак в 7:15. С Lee нужны has или eats.', ['Пункты стоят не по времени.', 'Выберите завтрак и добавьте час с at.']),
      routine.w('maya-after-work', 'Напишите, куда идёт Майя после работы. Начните с Maya и используйте get home или go home. Закончите словами after work.', 'MAYA · before work: coffee at home · after work: home, then dinner · ZOE · after work: gym', ['Maya gets home after work.', 'Maya goes home after work.'], 'После работы Майя приходит домой. У глагола для одного человека нужна форма gets или goes.', ['До работы дома она пьёт кофе.', 'Вам нужно действие после работы, без ужина.']),
    ],
  },
  articles: {
    reminder: 'A или an вводит один новый предмет. The помогает вернуться к конкретному предмету, о котором уже сказал собеседник. Здесь различие проверяется в письменном диалоге. Для первого упоминания выбираем по звуку: an apple начинается с гласного звука, a bag — с согласного.',
    questions: [
      articles.c('name-reference', 'О каком предмете спрашивает второй человек?', 'A: I found a glove by the stairs. B: Is the glove wet?', ['Другая перчатка.', 'Перчатка у лестницы.', 'Любая мокрая перчатка.'], 1, 'The glove отсылает к перчатке, которую нашли у лестницы.', ['В какой фразе впервые появляется вещь?', 'Подставьте место из первой реплики.'], true),
      articles.b('borrow-umbrella', 'Подставьте один артикль, для завершения диалога.', 'A: I lent Alex an umbrella. B: Is ___ umbrella blue?', 'the', 'Вторая реплика про тот же зонт. The не зависит от первого звука.', ['Зонт уже появился в разговоре.', 'Нужна ссылка именно на одолженный зонт.']),
    ],
  },
  'family-objects': {
    reminder: 'Форма с ’s показывает владельца: my sister’s book — книга моей сестры. Сначала проверьте владельца на бирке, потом предмет или место.',
    questions: [
      family.c('two-tags', 'Какую вещь нужно отдать брату?', 'Black bag · Mom; blue bag · Brother; blue hat · Dad', ['The blue hat.', 'The black bag.', 'The blue bag.'], 2, 'На синей сумке метка Brother. У синей шапки другой владелец.', ['Найдите метку Brother.', 'Две вещи синие. Уточните сам предмет.']),
      family.w('dads-phone', 'Укажите место папиного телефона. Начните с My dad’s phone и используйте on.', 'LOST TABLE · Dad / phone / desk · sister / phone / chair', ["My dad's phone is on the desk."], 'Папин телефон на столе. Телефон сестры лежит на стуле.', ['У обоих один тип предмета.', 'Сохраните владельца, потом назовите поверхность.']),
    ],
  },
  'there-is-are': {
    reminder: 'В вопросе поставьте is или are первым. В коротком ответе оставьте there и ту же форму be. Для отсутствия нескольких предметов подойдёт There are no… или There aren’t any…',
    questions: [
      there.w('ask-lamp', 'Спросите, есть ли одна лампа в гостиной. Используйте lamp и living room.', 'NEW APARTMENT · roommate message: need a lamp · living room inventory: ?', 'Is there a lamp in the living room?', 'Одна лампа требует Is there a lamp…?', ['Наличие неизвестно.', 'Вопрос начинается с формы для одного предмета.'], 'ask'),
      there.w('no-chairs', 'Ответьте двумя короткими фразами. Сначала No с there и are, затем сообщите число стульев в кухне с There и two chairs.', 'A: Are there any chairs in the garage? · Garage: chairs 0 · Kitchen: chairs 2', ["No, there aren't. There are two chairs in the kitchen.", 'No, there are not. There are two chairs in the kitchen.', "No there aren't. There are two chairs in the kitchen.", 'No there are not. There are two chairs in the kitchen.'], 'В гараже стульев нет, на кухне их два. В обеих фразах число множественное.', ['Проверьте сразу две строки.', 'В отрицании сохраните are, затем отдельно укажите место.']),
    ],
  },
  'home-places': {
    reminder: 'Читайте предмет и его место как пару. In — внутри, on — на поверхности. Near — поблизости, next to — прямо рядом. Если похожих предметов два, выберите нужный по назначению или цвету.',
    questions: [
      home.c('study-place', 'Где лежит тетрадь для урока?', 'Grocery notebook → kitchen, near the door · class notebook → bedroom, next to the lamp', ['Next to the lamp in the bedroom.', 'Near the kitchen door.', 'Near the bed.'], 0, 'Учебная тетрадь прямо рядом с лампой в спальне.', ['Какая тетрадь нужна для учёбы?', 'Выберите помещение и ориентир вместе.']),
      home.w('borrowed-book', 'Напишите, где книга, которую нужно вернуть. Начните с The book и выберите near или next to по записи close by.', 'RETURN LIST · book: close by the hall table, not right beside it · notebook: right beside the sink', 'The book is near the hall table.', 'Книга поблизости от стола, но не прямо рядом с ним.', ['Нужна книга, а не тетрадь.', 'Различите «поблизости» и «вплотную рядом».']),
    ],
  },
  'hobbies-abilities': {
    reminder: 'Can говорит об умении или возможности. Like говорит о том, что человеку нравится. После can и can’t ставим глагол без to.',
    questions: [
      hobbies.c('team-list', 'Кого можно позвать сыграть на гитаре сегодня?', 'LEO · guitar: yes, busy today · KIRA · guitar: yes, free today · JUNE · guitar: no, free today', ['Leo', 'June', 'Kira'], 2, 'Подходит Кира. Она умеет играть и сегодня свободна.', ['Проверьте и умение, и время.', 'Leo занят, а June не умеет играть.']),
      hobbies.w('sam-swims', 'Скажите, чего Сэм не умеет. Начните с Sam, используйте can’t или cannot и глагол из карточки.', 'SAM · likes pools · swim: no · dance: yes', ["Sam can't swim.", 'Sam cannot swim.'], 'Сэму нравятся бассейны, но он не умеет плавать.', ['Нравится и умеет — разные сведения.', 'После отрицания сразу идёт глагол.']),
    ],
  },
  'present-continuous': {
    reminder: 'Кадр или текущий чат показывает, чем человек занят в этот момент. Для утверждения поставьте be перед формой на -ing, для отрицания добавьте not, для вопроса вынесите be вперёд.',
    questions: [
      continuous.c('camera-or-job', 'Что верно сейчас на видеозвонке?', 'NIA · job: teaches art · video call: washes dishes', ['Nia is teaching art.', 'Nia washes dishes for work.', 'Nia is washing dishes.'], 2, 'Звонок показывает, что Ниа моет посуду. Преподавание — её работа.', ['Сравните job и video call.', 'Вам нужна строка текущего звонка.']),
      continuous.w('ash-delivery', 'Опишите действие на камере. Начните с Ash и используйте open the door.', 'AT THE DOOR · delivery arrives · camera: Ash at the door, hand on handle, door moving', ['Ash is opening the door.', "Ash's opening the door."], 'Дверь уже открывают. Это действие в процессе.', ['Камера показывает начало действия.', 'Используйте be и форму open на -ing.']),
      continuous.w('kim-dinner', 'Опровергните сообщение, что Ким готовит ужин. Начните с Kim и используйте cook dinner. Напишите одну фразу.', 'KIM · video: eats dinner with friends', ["Kim isn't cooking dinner.", 'Kim is not cooking dinner.', "Kim's not cooking dinner."], 'Ким уже ест, поэтому сейчас не готовит. Отрицание стоит после be.', ['Не пересказывайте кадр. Нужно опровергнуть готовку.', 'Сохраните форму на -ing.']),
      continuous.w('jo-feed', 'Спросите, кормит ли Джо собаку в этот момент. Используйте Jo и feed the dog.', 'LIVE CHAT · Jo’s camera is off · dog dinner planned · current action: ?', 'Is Jo feeding the dog?', 'Текущее действие неизвестно. Вопрос начинается с Is Jo.', ['Нужен вопрос о происходящем сейчас.', 'Поставьте be перед именем.'], 'ask'),
    ],
  },
  'actions-time': {
    reminder: 'События в расписании часто идут по порядку, но список может быть перемешан. Сверяйте цифры. After означает «после», before — «до». Расписание показывает привычку, а кадр прямого эфира — действие в этот момент.',
    questions: [
      actions.c('later-plan', 'Что можно делать после семи по этому плану?', 'Friday · watch a movie at 7:15 · write at 6:15 · dinner at 6:45', ['Write.', 'Eat dinner.', 'Watch a movie.'], 2, 'Фильм запланирован на 7:15, после семи.', ['Не берите первую или последнюю строку по порядку.', 'Сравните часы каждого пункта с семью.']),
      actions.w('avi-before', 'Запишите сообщение по кадру на момент 8:30. Начните с Avi и используйте wait for the bus или run. Час в ответе не нужен.', 'AVI · USUAL: runs at 8:30 · LIVE 8:30: AVI at bus stop, bus not here yet', ["Avi is waiting for the bus.", "Avi's waiting for the bus."], 'По обычному плану Ави бегает, а в кадре ждёт автобус.', ['Один и тот же час относится к двум источникам.', 'Смотрите на текущий кадр, а не на обычный план.']),
    ],
  },
  'everyday-combinations': {
    reminder: 'Сочетания помогают рассказать, что человек делает: Take a test — сдавать тест, pass a test — успешно его сдать. Сам факт сдачи ещё не говорит о результате. В сообщении о результате: passed a test — успешно сдал тест. Для плана можно поставить will перед начальной формой, в переписке часто пишут I’ll.',
    questions: [
      combinations.w('test-sitting', 'Сообщите с I, что делаете завтра. Выберите сочетание из урока, используйте will или сокращение и закончите словом tomorrow.', 'EXAM ROOM · English test tomorrow · result: unknown; score next week', ["I'll take a test tomorrow.", 'I will take a test tomorrow.', "I'll take the test tomorrow.", 'I will take the test tomorrow.'], 'Завтра вы пишете тест. Результат станет известен позже.', ['Сейчас известен день теста, но не балл.', 'Выберите сочетание для самого действия.']),
      combinations.w('test-result', 'Одной фразой с We сообщите, что команда успешно сдала тест. Возьмите сочетание из урока в прошедшей форме. Без баллов и даты.', 'SCHOOL TEAM · test: yesterday · score: 9/10 · 6/10 or higher = success', ['We passed the test.', 'We passed a test.'], 'Девять из десяти выше нужного минимума. Это результат, поэтому passed.', ['Сравните балл и минимум.', 'Нужен глагол об успешном результате.']),
    ],
  },
  'simple-arrangements': {
    reminder: 'После отказа можно предложить другой час. Если оба часа подходят, подтвердите выбранный. How about…? предлагает вариант, а That works. его подтверждает.',
    questions: [
      arrangements.c('two-texts', 'Что делать дальше?', 'A: Can we meet at four? B: I work until five.', ['Confirm four.', 'Offer a time after five.', 'End the chat without a plan.'], 1, 'В четыре собеседник ещё работает. Нужен вариант после пяти.', ['Первая реплика — предложение, вторая — ограничение.', 'Проверьте, когда работа уже закончится.']),
      arrangements.w('library-alt', 'Предложите общий час, используя How about или Can we meet at. Час напишите как 6:30, без p.m.', 'LIBRARY · friend: free after six · you: free 5:30 or 6:30', ['How about 6:30?', 'Can we meet at 6:30?'], 'В 6:30 свободны оба. В 5:30 друг ещё занят.', ['Пересеките два расписания.', 'Напишите вопрос, пока никто не подтвердил час.'], 'ask'),
    ],
  },
  'small-talk-basics': {
    reminder: 'Короткая реакция зависит от новости. Great! подходит к хорошей новости, I’m sorry to hear that. — к неприятной. Для перевода разговора на ответ собеседника можно спросить How about you?',
    questions: [
      smallTalk.c('bad-news', 'Как естественно отозваться на новость?', 'A: I lost my phone on the bus.', ['Congratulations!', 'See you later!', 'I’m sorry to hear that.'], 2, 'Потеря телефона — неприятная новость. Здесь уместно сочувствие.', ['Сначала определите, хорошая это новость или нет.', 'Прощание не отвечает на содержание.']),
      smallTalk.w('team-good-news', 'Поздравьте друга одним словом. Без вопроса и без имени.', 'FRIEND: I made the school team!', 'Congratulations!', 'Друг попал в команду. Короткое поздравление подходит к успеху.', ['Друг сообщает об успехе.', 'Нужна реакция-поздравление.'], 'react'),
    ],
  },
};
