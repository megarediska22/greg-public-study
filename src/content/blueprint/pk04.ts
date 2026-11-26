import { tasks, unit, type ContentPacket } from './author.ts';
import { pk04Extras } from './pk04Supplements.ts';

const service = tasks('bp-a2-01');
const reply = unit('bp-a2-01', 'A2', 'Просьба и ответ в сервисной переписке',
  'Уточните неизвестную деталь и подтвердите следующий шаг по ответу службы.',
  'В новом сообщении часть вопроса уже решена',
  'Прочитайте, что служба подтвердила, и найдите одно поле, которое ещё нужно узнать. Could you просит собеседника. Could I касается вашего действия. I’ll подтверждает ваш следующий шаг.',
  [
    ['Просьба к службе', 'Could you + действие?', 'Could you text me the new address?', 'Не могли бы вы прислать мне новый адрес?'],
    ['Разрешение для себя', 'Could I + действие?', 'Could I pick it up tomorrow?', 'Можно мне забрать это завтра?'],
    ['Подтверждение', 'I’ll + действие', 'I’ll bring my receipt.', 'Я принесу чек.'],
  ], 'Если в ответе уже есть дата, оставьте её. Спросите только о незакрытом поле. Promise to call — обещание позвонить, а не состоявшийся звонок.',
  [
    service.c('keys-actor', 'Кто должен принести ключ?', 'Desk: We can open the locker, but could you bring your old key?', ['A technician.', 'The customer.', 'The desk clerk.'], 1, 'Could you обращено к клиенту. Сотрудник откроет шкафчик.', ['Разделите we и you.', 'Ключ относится к просьбе, а не к обещанию службы.']),
    service.c('where-only', 'Что осталось узнать?', 'Gym: Your lesson is on Tuesday at three. We moved it, but I don’t have the new room number yet.', ['The day.', 'The start time.', 'The room.'], 2, 'Tuesday at three уже известно. Неизвестен кабинет.', ['Найдите уже подтверждённые поля.', 'Yet относится к номеру комнаты.']),
    service.c('not-paid', 'Какой факт подтверждён?', 'Office: We got your form today. We’ll send a payment link tomorrow.', ['They received the form.', 'They received the payment.', 'They already sent the link.'], 0, 'Форму получили сегодня. Ссылку только отправят завтра.', ['Сравните got и will send.', 'Отправка в будущем ещё не произошла.']),
    service.c('permission-intent', 'Вы хотите сами забрать пакет у другой стойки. Какая реплика подходит?', 'A: Your package is at the front desk. · You: want pickup at the side desk', ['Could you pick it up at the side desk?', 'Could I pick it up at the side desk?', 'I already picked it up at the side desk.'], 1, 'Could I означает, что пакет забирает автор запроса.', ['Кто будет забирать пакет?', 'Сохраняйте роль автора сообщения.']),
  ],
  [
    service.b('new-slot', 'Введите только действующий час в формате часы:минуты, без p.m.', 'Old time: 1:10. Update: Not 1:10 — your appointment is at 2:40. Room 6 stays the same.', '2:40', 'Час изменился на 2:40. Кабинет остался прежним.', ['Сверьте обновление с прежним временем.', 'Оставьте только действующий час.']),
    service.b('room-question', 'Добавьте вопросительное слово о месте.', '___ should I go to sign the form?', 'Where', 'Where спрашивает, куда идти.', ['Подпись требует места.', 'Вопрос не о часе.']),
    service.b('confirm-day', 'Введите день только одним словом.', 'Reply: We can take the return on Monday. Tuesday is for pickups only. → Return day: ___', 'Monday', 'Возврат можно сделать в понедельник. Вторник только для выдачи.', ['Return и pickup — разные действия.', 'Найдите день для return.']),
    service.b('could-you', 'Заполните одним местоимением. Попросите сотрудника прислать копию.', 'Could ___ send me a copy?', 'you', 'Could you просит сотрудника сделать действие.', ['Копию отправит сотрудник.', 'Сначала вспомните, как обращаемся к другому.']),
  ],
  [
    service.w('locker-where', 'Уточните конкретное место, затем подтвердите, что принесёте удостоверение. Начните первый вопрос с Could you tell me. Используйте where to pick up my pass или where I can pick up my pass. Вторую фразу начните с I’ll или I will.', 'PARK OFFICE · Reply: Your pass is ready for Friday at 9. The pickup desk moved. Bring your ID.', [
      'Could you tell me where to pick up my pass?', 'Could you tell me where I can pick up my pass?',
    ].flatMap(question => [question + " I'll bring my ID.", question + ' I will bring my ID.']), 'Пятница и час подтверждены. Осталось узнать, куда прийти, и сообщить, что вы принесёте удостоверение.', ['Здесь сменилось место, а не время.', 'Сначала спросите о выдаче, затем подтвердите своё действие.']),
    service.w('repair-when', 'В двух предложениях уточните час и подтвердите, что будете дома. Вопрос начните с What time; используйте the technician и arrive или come. Затем напишите I’ll be home или I will be home.', 'REPAIR DESK · Reply: We can send someone to your apartment on Saturday. We haven’t set an arrival time. Will you be home? · YOU: home all day Saturday', [
      'What time will the technician arrive?', 'What time will the technician come?', 'What time can the technician arrive?', 'What time can the technician come?',
    ].flatMap(question => [question + " I'll be home.", question + ' I will be home.']), 'Место и день уже понятны. Уточняется час визита, а автор подтверждает, что будет дома.', ['Не переспрашивайте про адрес или день.', 'В первом предложении действует мастер, во втором — вы.']),
    service.w('short-request', 'Попросите сотрудника позвонить вам после двух. Начните с Could you или Can you, используйте call me. Час пишите как 2 или two, без p.m.', 'CLINIC · receptionist offered to call · your availability starts after 2', ['Could you', 'Can you'].flatMap(start => ['2', 'two'].map(hour => start + ' call me after ' + hour + '?')), 'О звонке просим сотрудника, перед временем указываем after.', ['Кто звонит?', 'Не перепутайте at и after.'], 'request'),
    service.w('new-ability', 'Попросите разрешение прийти с сестрой, начните с Could I или Can I. Используйте bring my sister.', 'CLASS REGISTRATION · one place confirmed · guest policy: ?', ['Could I bring my sister?', 'Can I bring my sister?'], 'Разрешение касается вашего действия, поэтому I.', ['Своё место уже есть.', 'Попросите разрешение привести сестру.'], 'request'),
  ], 'Проверьте, что вопрос касается одной неизвестной детали. В подтверждении называйте только тот шаг, который сможете сделать.');

const project = tasks('bp-a2-02');
const correspondence = unit('bp-a2-02', 'A2', 'Главное в переписке об учебном проекте',
  'Выделите главное изменение и передайте адресату следующий шаг.',
  'Одно письмо может содержать решение и обычное замечание',
  'Сначала спросите, что изменилось для команды. Затем найдите причину и действие. Draft — черновик, final file — итоговый файл, attachment — вложение, deadline — крайний срок.',
  [
    ['Главное изменение', 'вопрос «что делать иначе?»', 'Use the final file. The old link is closed.', 'Используйте итоговый файл. Старая ссылка закрыта.'],
    ['Причина', 'because + причина', 'We’ll meet online because the room is locked.', 'Встретимся онлайн, потому что кабинет закрыт.'],
    ['Незакрытая просьба', 'Could we…? ещё не договорённость', 'Could we send the draft later? I’m waiting for a reply.', 'Можно отправить черновик позже? Я жду ответа.'],
  ], 'Thank you или личная деталь в конце письма редко меняют план. При пересказе выберите то, что влияет на следующее действие.',
  [
    project.c('poster-main', 'Что теперь нужно сделать команде?', 'A: I uploaded the poster, but the printer can’t open that file. B: I sent a PDF to the printer. Review only that version today. I like the new colors!', ['Change the colors first.', 'Review the PDF today.', 'Send the original file to the printer again.'], 1, 'PDF заменил файл, который принтер не открыл. Цвета — обычное замечание.', ['Найдите проблему с первой версией.', 'Последняя фраза не меняет действие.']),
    project.c('late-why', 'Почему встреча начинается позже?', 'A: We need the room at two. Can you move the meeting? B: Yes. Meet at three because another class is using the room until 2:45.', ['The team asked for a break.', 'The room is free all day.', 'Another class has the room first.'], 2, 'Другой урок занимает кабинет до 2:45, поэтому встречу передвинули.', ['Ищите, что мешает прийти в два.', 'Because объясняет причину.']),
    project.c('request-pending', 'Какой вывод следует из ответа?', 'A: Could we submit on Friday? B: I’ll ask our teacher tomorrow. Please keep working on the draft tonight.', ['Friday is not confirmed yet.', 'Friday is the new deadline.', 'The teacher got the final file.'], 0, 'Команда ещё только спросит преподавателя. Пятницу пока не подтвердили.', ['Просьба и согласие — разные вещи.', 'I’ll ask означает будущее действие.']),
    project.c('back-in-use', 'Какое изменение важно для команды?', 'A: The blue link didn’t work yesterday. B: It works again. Put the files there. The new chat photo looks nice, too.', ['The chat photo is the new file location.', 'The blue link is usable again.', 'The team should move everything to email.'], 1, 'Ссылка снова работает, поэтому файлы нужно положить туда.', ['Отделите действие от оценки фото.', 'Сверьте вчерашнее состояние ссылки с нынешним.']),
  ],
  [
    project.b('new-deadline', 'Введите день новой сдачи по-английски.', 'Draft due Wednesday. Update: Keep the draft date. The final version moves from Thursday to Friday. → Final: ___', 'Friday', 'Срок итоговой версии перенесли на пятницу, а среда относится к черновику.', ['Нужен final, не draft.', 'Найдите день после moves … to.']),
    project.b('person-next', 'Кто отправит ссылку? Введите одно имя.', 'Jo wrote the draft. Alex fixed the link. Mia will send it to the class. → Sender: ___', 'Mia', 'Миа отправит ссылку. Алекс её исправил, Джо написал черновик.', ['Отделите прошлые действия от будущего.', 'Следующий шаг стоит после will.']),
    project.b('attach-instead', 'Введите формат, который нужен сейчас, тремя буквами.', 'Do not use the JPG. It cuts off the title. Please attach the PNG. → Use the ___ file.', 'PNG', 'Нужно вложить PNG. У JPG обрезан заголовок.', ['Читайте отрицание в первой фразе.', 'Нужный файл стоит после attach.']),
    project.b('future-link', 'Допишите одно слово, чтобы обозначить противопоставление.', 'The draft is ready, ___ we still need the photos.', 'but', 'But разделяет готовую часть работы и то, чего пока не хватает.', ['Одна часть готова, вторая осталась.', 'Вставьте союз со значением «но».']),
  ],
  [
    project.w('audio-handoff', 'Напишите Джилл два коротких предложения: начните с Jill, назовите действующую версию с Use и передайте срок через Send it by. Не упоминайте чашки.', 'MEDIA CLUB · A: The long audio doesn’t fit. B: The short version works. Send that version by Thursday. I’ll bring cups to our meeting.', ['Jill, use the short version. Send it by Thursday.', 'Jill, use the short audio. Send it by Thursday.', 'Jill, use the short audio version. Send it by Thursday.'], 'Джилл нужна короткая версия и срок — четверг. Чашки не влияют на отправку.', ['Long audio не проходит по условию.', 'Передайте то, что поменяет работу Джилл.']),
    project.w('map-handoff', 'Напишите Лу. Начните с Lou, и скажите, чем пользоваться (use или check). Затем сообщите, какой день всё ещё является сроком сдачи карты, с The map is due. Других деталей не добавляйте.', 'MAP TEAM · A: Could we send the map on Friday? B: The deadline is still Tuesday. The old photo is too dark, so use the new drawing. Thanks for asking.', ['Lou, use the new drawing. The map is due Tuesday.', 'Lou, check the new drawing. The map is due Tuesday.', 'Lou, use the new drawing. The map is due on Tuesday.', 'Lou, check the new drawing. The map is due on Tuesday.'], 'Рисунок заменяет фото, но срок остаётся вторником. Пятница была только предложением.', ['Проверьте, изменился ли срок.', 'Назовите разрешённый материал и подтверждённый день.']),
    project.w('show-why', 'Одним предложением с The team и because объясните замену листа. Используйте changed the sheet или replaced the sheet и torn.', 'THREAD · A: The sheet is torn. B: Then the team needs a new one. Update: We put in a new one; it is yellow.', ['The team changed the sheet because it was torn.', 'The team replaced the sheet because it was torn.'], 'Лист заменили из-за разрыва, а новый цвет — случайная деталь.', ['Найдите причину до решения.', 'Не подставляйте цвет вместо причины.']),
    project.w('status-update', 'Сделайте Ли короткое обновление из двух фраз. Начните с Lee, и сообщите с is ready, что уже готово. Затем попросите Send или Please send и назовите недостающий материал.', 'SCIENCE TEAM · The poster is complete. The photo is missing. Lee has the photo; Dana has the poster.', ['Lee, the poster is ready. Send the photo.', 'Lee, the poster is ready. Please send the photo.'], 'Плакат готов. Ли может прислать недостающее фото.', ['Кто владеет недостающим материалом?', 'Подтвердите статус, затем задайте следующий шаг.']),
  ], 'Если выбрали последнюю яркую деталь, перечитайте текст с вопросом: что должен сделать адресат теперь?');

const story = tasks('bp-a2-03');
const narrative = unit('bp-a2-03', 'A2', 'Короткий рассказ: что произошло и почему',
  'Восстановите главную проблему и причину из короткого рассказа.',
  'В рассказе есть событие, причина и результат',
  'Составьте цепочку из коротких частей. Then показывает, что произошло дальше. Because даёт причину. But указывает на смену ожидания. О конкретном случае в прошлом можно спросить Did + кто + действие. Если спрашиваем, кто сам сделал действие, Who заменяет имя, а глагол остаётся в прошедшем: Who helped you? — «Кто вам помог?»',
  [
    ['Главное', 'Что помешало герою?', 'Eli missed the bus. He walked to class.', 'Илай опоздал на автобус, поэтому пошёл на занятия пешком.'],
    ['Причина', 'because + причина', 'They stopped because a light was broken.', 'Они остановились, потому что фонарь сломался.'],
    ['Вопрос о случае', 'When/Where + did + кто + действие?', 'Where did you eat after the show?', 'Где вы поели после спектакля?'],
  ], 'Если человек уже назвал место или день, спросите о другой детали. Последнее событие само по себе не объясняет, почему началась проблема.',
  [
    story.c('bread-cause', 'Почему по дороге домой пришлось заходить в другой магазин?', 'Ada went to buy bread after class. The first store was open, but it had no bread left. She found bread at a small market and got home before six.', ['The first store was closed.', 'The first store was out of bread.', 'She got home too late.'], 1, 'Первый магазин был открыт, но хлеб закончился.', ['Что было не так в первом магазине?', 'Открытый магазин всё равно мог не иметь нужного товара.']),
    story.c('bike-main', 'Какова основная мысль рассказа?', 'We planned to ride to Lake Park. A tire was flat before we left. Bea fixed it, so we rode there after lunch. We saw ducks by the water.', ['They changed lunch to watch ducks.', 'They never went to the park.', 'They rode later because the bike needed repair.'], 2, 'Проблема с колесом задержала поездку. После ремонта они всё-таки поехали.', ['Свяжите проблему до выезда с поездкой после обеда.', 'Утки не меняли план.']),
    story.c('first-sign', 'Что произошло перед возвращением участников?', 'The class moved upstairs after we found water on the floor. We put up a sign. When the group came back from lunch, they followed it to the new room.', ['A sign went up.', 'The group went to the old room.', 'The floor was washed.'], 0, 'Указатель поставили до возвращения. По нему участники нашли новый кабинет.', ['Прочитайте события между переводом и обедом.', 'Слово it относится к указателю.']),
    story.c('relevant-followup', 'Какой вопрос выяснит отсутствующую деталь?', 'Sam: I tried skiing last winter in Utah. It was my first lesson.', ['Did you try skiing?', 'Who did you go with?', 'Did you go in summer?'], 1, 'Сэм назвал место и сезон. Кто был с ним, пока неизвестно.', ['В рассказе уже есть ответы о виде спорта и сезоне.', 'Остаётся вопрос о спутнике.']),
  ],
  [
    story.b('last-time', 'Введите только час начала новой встречи, цифрами с минутами.', 'Our show at 6:00 was canceled. We met for pizza at 6:40, then got home at 8:00. → Meeting: ___', '6:40', 'Встреча за пиццей началась в 6:40. Шесть — время отменённого шоу.', ['Ищите фактическую встречу.', 'Не берите время отменённого события.']),
    story.b('rain-reason', 'Допишите один союз причины.', 'We stayed inside ___ the rain got heavier.', 'because', 'Because связывает решение остаться внутри с усилившимся дождём.', ['Во второй части причина.', 'Нужен союз со значением «потому что».']),
    story.b('date-where', 'Введите только день по-английски.', 'We meant to try the class on Tuesday. The hall was closed, so our first class was on Thursday.', 'Thursday', 'Занятие состоялось в четверг. Вторник был планом.', ['Различите намерение и факт.', 'Нужно первое фактическое занятие.']),
    story.b('question-auxiliary', 'Вставьте одно вспомогательное слово.', 'Where ___ they go after the match yesterday?', 'did', 'Вопрос о вчерашнем действии строится с did и начальной формой go.', ['Yesterday указывает на прошлое.', 'Форму go менять не нужно.']),
  ],
  [
    story.w('climbing-followup', 'Задайте вопрос Крису только о человеке, который показал узел. Начните с Who и используйте showed you. Назовите the knot или how to tie the knot.', 'Chris: I tried climbing at the gym on Sunday. I couldn’t tie the rope. Someone showed me the knot, and then I was able to climb.', ['Who showed you the knot?', 'Who showed you how to tie the knot?'], 'Имя помощника не названо. Глагол showed относится к тому, о ком вы спрашиваете.', ['Хронология уже ясна, неизвестен помощник.', 'Who здесь само обозначает исполнителя, поэтому did не требуется.'], 'ask'),
    story.w('festival-followup', 'Спросите только точное место, где друзья встретились после изменения плана. Начните с Where и обращайтесь к собеседнику на you; используйте meet.', 'Bex: We went to the fall festival Saturday. The front gate was closed, so my friends and I met somewhere else before the show.', ['Where did you meet?', 'Where did you meet your friends?'], 'Рассказ уже называет событие, день и причину. Точное место встречи осталось неизвестным.', ['Не переспрашивайте название фестиваля.', 'После did you поставьте meet.'], 'ask'),
    story.w('trip-cause', 'Одним предложением с because объясните, почему группа поехала на автобусе. Начните с They took the bus и возьмите причину из текста.', 'We planned to take the train. A tree fell on the tracks, so trains stopped. There was still a bus, and we took it.', ['They took the bus because a tree fell on the tracks.', 'They took the bus because the trains stopped.', 'They took the bus because trains stopped.', 'They took the bus because a tree had fallen on the tracks.'], 'Дерево упало на пути и остановило поезда. Обе причины объясняют выбор автобуса.', ['Причина появилась до поездки на автобусе.', 'После because подойдёт событие или его прямое следствие.']),
    story.w('two-events', 'Двумя предложениями с First, we и Then, we передайте события на кухне. Возьмите действия из рассказа, часы не нужны.', 'The oven stopped at nine. We made sandwiches while it was off at 9:10. Later Rosa fixed it, and we baked the bread.', ['First, we made sandwiches. Then, we baked the bread.', 'First we made sandwiches. Then we baked the bread.', 'First, we made sandwiches. Then we baked the bread.', 'First we made sandwiches. Then, we baked the bread.'], 'Сначала сделали бутерброды, затем испекли хлеб. Починка относится к Розе.', ['Найдите два действия с we.', 'Бутерброды приготовили до починки.']),
  ], 'Перескажите историю одной фразой о проблеме и причине. Затем задайте вопрос о детали, которой в источнике ещё нет.');

export const pk04: ContentPacket = {
  version: 6,
  placements: [['unit-071', reply], ['unit-081', correspondence], ['unit-091', narrative]],
  ...pk04Extras,
};
