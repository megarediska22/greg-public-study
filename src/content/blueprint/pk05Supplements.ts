import { tasks, type Addition } from './author.ts';

const trips = tasks('unit-101');
const orders = tasks('unit-111');
const event = tasks('unit-121');

export const pk05Supplements: Readonly<Record<string, Addition>> = {
  'unit-101': {
    reminder: 'Сначала проверьте время, общую цену и вместимость. В рекомендации назовите выполнимый вариант и факт, который объясняет выбор.',
    questions: [
      trips.c('boat-capacity', 'Какой прокат подойдёт группе?', 'Five people, budget $40, must launch before 10:00. Canoe A seats 4, $28, starts 9:30. Boat B seats 6, $38, starts 9:45. Boat C seats 6, $34, starts 10:10.', ['Canoe A.', 'Boat B.', 'Boat C.'], 1,
        'B вмещает пятерых, стоит меньше $40 и отправляется до десяти.', ['Проверьте вместимость и цену.', 'Оставшийся выбор проверьте по времени.']),
      trips.w('studio-seats', 'Дайте совет с We should use или We could use. Назовите помещение и после because объясните вместимость с it seats. Число пишите цифрой или словом.', 'PHOTO STUDIO · group of 7 · Studio Birch seats 10, free now · Studio Rose seats 6, free now',
        ['We should use', 'We could use'].flatMap(start => ['10', 'ten'].map(n => start + ' Studio Birch because it seats ' + n + '.')),
        'Studio Birch вмещает всех семерых. Во второй студии только шесть мест.', ['Проверьте число участников.', 'Причина должна опираться на реальное число мест.']),
    ],
  },
  'unit-111': {
    reminder: 'Сверяйте оба пункта заказа. Подтверждённая замена и обещание проверить недостачу требуют разных ответов.',
    questions: [
      orders.c('wrong-and-missing', 'Каков фактический статус заказа?', 'ORDER · missing pens and wrong paper. Service: The driver dropped off the right paper. We’ll check whether the pens are in stock tomorrow.', ['Both problems are fixed.', 'The pens arrived. The paper is still wrong.', 'The right paper arrived. The pens are still missing.'], 2,
        'Подходящую бумагу уже привезли. Наличие ручек только проверят.', ['Разберите два предмета отдельно.', 'Dropped off означает доставку, will check — обещание.']),
      orders.w('late-box', 'Подтвердите, что получили коробку, и спросите о счёте. Начните с I got the box или I received the box. Во второй фразе используйте Could you или Can you и check the invoice.', 'SUPPORT · Your replacement box arrived at noon. The amount on the invoice is still wrong.',
        ['I got the box.', 'I received the box.'].flatMap(start => ['Could you', 'Can you'].map(ask => start + ' ' + ask + ' check the invoice?')),
        'Доставку можно подтвердить, а неверный счёт всё ещё требует проверки.', ['Что действительно дошло?', 'Во второй фразе назовите открытый вопрос.']),
    ],
  },
  'unit-121': {
    reminder: 'Передавайте действующий план и оставшееся дело. Сверьте заявленное число участников с фактическим.',
    questions: [
      event.c('setup-current', 'Что нужно сообщить волонтёрам о подготовке?', 'OLD · Sala sets chairs outdoors at 8:00. UPDATE · courtyard too wet; setup moves indoors at 8:30. Sala is still in charge. Indoors has space for everyone.', ['Sala sets chairs indoors at 8:30.', 'Sala sets chairs outdoors at eight.', 'A new leader is needed at 8:30.'], 0,
        'Время и место изменились, а ответственная осталась прежней.', ['Прочитайте обновление о дожде.', 'Still показывает, что ответственная та же.']),
      event.w('late-event-task', 'Двумя фразами сообщите число пришедших и оставшееся действие. Начните с числа (цифрой или словом) и people came. Затем используйте still needs to, назовите имя и действие send the photos.', 'COMMUNITY LUNCH · 11 expected · sign-in: 9 guests · chairs put away ✓ · photos: Kim will send them, not sent yet',
        ['Nine people came. Kim still needs to send the photos.', '9 people came. Kim still needs to send the photos.'],
        'Пришли девять гостей. Ким ещё нужно отправить фото.', ['Для числа нужна фактическая запись.', 'Смотрите, кто ещё должен что-то сделать.']),
    ],
  },
};
