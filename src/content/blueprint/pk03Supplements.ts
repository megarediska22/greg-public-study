import { tasks, type ContentPacket } from './author.ts';

const lobby = tasks('unit-031');
const log = tasks('unit-036');
const teacher = tasks('unit-039');
const trip = tasks('unit-041');

export const pk03Extras: Pick<ContentPacket, 'supplements' | 'reviewEdits'> = {
  supplements: {
    'unit-031': {
      reminder: 'В контрольной согласуйте время, дорогу и оплату. Быстрый маршрут ещё не гарантирует, что вы попадёте внутрь вовремя.',
      questions: [
        lobby.c('reading-desk-plan', 'Выберите выполнимый план для регистрации.', 'Pass costs $3, cash only. Register before noon. ALEX · $4 cash + card. Bus A arrives 11:50; Bus B arrives 12:10.', ['Take Bus B and pay cash.', 'Take Bus A and pay cash.', 'Take Bus A and pay by card.'], 1, 'Автобус A приезжает до полудня и наличных хватает. Картой оплатить нельзя.', ['Сначала сравните время прибытия.', 'Проверьте способ оплаты и цену.']),
        lobby.w('late-reading-room', 'Подтвердите, где встречаетесь и когда. Начните с See you, затем укажите место с in и час с at. Время запишите цифрами с минутами без p.m.', 'LIBRARY · Room 10 closed. Reading group moved to Room 12. Your bus arrives at 3:20. Room 12 opens at 3:30. Group starts at 3:45. Meet when the group starts.', 'See you in Room 12 at 3:45.', 'Новая встреча в кабинете 12 в 3:45. В 3:30 кабинет только открывается.', ['Нужно время занятия, не автобуса.', 'Возьмите действующий кабинет и время начала.']),
      ],
    },
    'unit-036': {
      reminder: 'Читайте отметки времени. Действия иногда стоят в привычном порядке, но в журнале важны факты, а не ожидаемая последовательность.',
      questions: [
        log.c('greenhouse-first', 'Что садовник сделал первым?', 'GREENHOUSE · 10:15 cleaned the bench · 9:35 tested the lights · 10:20 fixed the switch', ['Cleaned the bench.', 'Fixed the switch.', 'Tested the lights.'], 2, 'В 9:35 проверили свет, а чистка и ремонт произошли позже.', ['Строки смешаны.', 'Возьмите самое раннее время.']),
        log.w('bake-sequence', 'Запишите первое и второе действия. Начните фразы с First we и Then we. Часы не нужны.', 'BAKERY · 7:45 open the shop · 7:15 call the supplier · 7:30 count the trays', ['First we called the supplier. Then we counted the trays.', 'First, we called the supplier. Then we counted the trays.', 'First we called the supplier. Then, we counted the trays.', 'First, we called the supplier. Then, we counted the trays.'], 'Сначала позвонили поставщику, затем пересчитали противни. Магазин открыли последним.', ['Отсортируйте три метки времени.', 'Начните с двух более ранних действий.']),
      ],
    },
    'unit-039': {
      reminder: 'В коротком сообщении преподавателю поздоровайтесь, назовите пропуск и объясните причину, затем предложите следующий шаг. Например: Hi, Ms. Hall. I missed the quiz because I was sick. I’ll come in on Monday. Thanks! I’ll send и I will send — две формы обещания «я отправлю».',
      questions: [
        teacher.w('sam-class-note', 'Напишите преподавателю короткое сообщение. Начните с Hi, Mr. Vega. Сообщите с I missed и because причину пропуска. Пообещайте отправить работу в нужный день (I’ll send / I will send). Если хотите, закончите Thanks!', 'FOR MR. VEGA · you missed: art class · reason: bus was late · send: my work · Friday', [
          "Hi, Mr. Vega. I missed art class because my bus was late. I'll send my work on Friday.",
          'Hi, Mr. Vega. I missed art class because my bus was late. I will send my work on Friday.',
          "Hi, Mr. Vega. I missed art class because the bus was late. I'll send my work on Friday.",
          'Hi, Mr. Vega. I missed art class because the bus was late. I will send my work on Friday.',
        ].flatMap(message => [message, message + ' Thanks!']), 'Учитель понимает, какое занятие пропущено, почему и когда ждать работу.', ['Соедините пропуск и причину с because.', 'Затем отдельно назовите обещанное действие и день.']),
      ],
    },
    'unit-041': {
      reminder: 'Проверьте три действия: отличить состояние от события, поставить действия по времени и назвать невыполненное. Заметьте, что получилось до подсказки. Исправление помогает завершить урок, а новую самостоятельную пробу даёт самопроверка перед A2.',
      questions: [
        trip.c('night-lobby', 'Что описано как состояние, а не действие?', 'TRIP LOG · The lobby was dark at eight. Mina found a lamp at 8:10. We called the desk at 8:15.', ['Mina found a lamp.', 'We called the desk.', 'The lobby was dark.'], 2, 'Was dark описывает состояние холла. Нашли лампу и позвонили — действия.', ['Какое предложение описывает, каким было место?', 'Ищите was + признак.']),
        trip.w('camp-checklist', 'Скажите, чего команда не сделала. Начните с We и используйте одно действие из списка, без часов.', 'CAMP CHECK · bring water ✓ · open the gate ✓ · lock the shed ×', ["We didn't lock the shed.", 'We did not lock the shed.'], 'Сарай не заперли. После didn’t / did not используется lock.', ['Найдите строку со знаком ×.', 'Оставьте глагол в начальной форме.']),
      ],
    },
  },
  reviewEdits: {
    'unit-039': 'Короткий ответ преподавателю начинается с обращения. Назовите пропущенное занятие, причину и следующий шаг. Пример обращения и завершения есть в этом уроке. Урок «Имя и контакты» поможет сверить написание имени и контактные данные.',
    'unit-041': 'Отдельно проверьте, где вы узнали состояние, где восстановили порядок и где сообщили об отсутствующем действии. Сравните, что получилось без помощи, а что после исправления. Новый материал для пробы есть в занятии «Самопроверка перед переходом к A2».',
  },
};
