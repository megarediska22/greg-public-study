import type { CourseEntry, Lesson, LessonStep } from '../../types/lesson.ts';
import { pk01Lessons, questions } from './lessons.ts';
import { practice } from './author.ts';

const be = questions('pk01-be');
const greet = questions('pk01-greetings');
const cafe = questions('pk01-cafe');
const supplements = {
  'to-be': {
    reminder: 'В коротком знакомстве вы уже видели I’m + имя. Здесь разберём am, is и are. Если трудно читать латиницу или числа, в начале программы есть факультативная подготовка Pre-A1.',
    example: "Name: Nina · Role: teacher → I'm Nina. I'm a teacher.",
    translation: 'Имя — Нина, роль — учительница. «Я Нина. Я учительница».',
    tasks: [
      be.write(['camp-profile', 'Представьтесь одним предложением от лица участника. Назовите своё полное имя по карточке. Допустима короткая или полная форма.', 'CAMP · Your name: Jamie Brooks · Group: 2', ["I'm Jamie Brooks.", 'I am Jamie Brooks.'], 'Для представления нужна форма первого лица, а имя должно совпасть с карточкой.', 'Определите, кто говорит.', 'Поставьте имя после полной или сокращённой формы первого лица.']),
      be.write(['studio-profile', 'Представьтесь в новом чате студии одним предложением. Используйте своё имя из нужного поля.', 'STUDIO CHAT · Host: Perry Shah · Your name: Casey Lin', ["I'm Casey Lin.", 'I am Casey Lin.'], 'Вы пишете от лица Casey Lin, а Perry Shah ведёт занятие.', 'Имя ведущего и ваше имя находятся в разных полях.', 'Начните с формы первого лица и перенесите своё полное имя.']),
      be.choose(['status', 'В чате нужно спросить о готовности напарника. Выберите вопрос о состоянии, а не сообщение о себе или вопрос о месте.', 'PARTNER: Kelly · Check: ready?', ['Are you ready?'], 'Are you ready? — вопрос собеседнику о готовности.', 'Говорим с напарником напрямую.', 'В вопросе о состоянии форма be идёт перед you.'], ['Am I ready?', 'Are you here?', 'Are you ready?']),
      be.write(['trip-profile', 'Спросите напарника, устал ли он. Обратитесь на you, напишите только один вопрос.', 'TRIP · Partner: Micah · Check: tired?', ['Are you tired?'], 'Напарнику задаём вопрос с Are you и словом tired.', 'Спрашиваете другого человека о состоянии.', 'Поставьте форму be перед обращением ко второму лицу.'], 'ask'),
    ],
  },
  'greetings-reactions': {
    reminder: 'В Pre-A1 и коротком знакомстве вы учились начинать обмен. Теперь учитывайте, кому пишете, и различайте реакцию на новость и прощание.',
    tasks: [
      greet.write(['visitor', 'Вы впервые пишете сотруднику школы. Начните нейтральным приветствием из вводного занятия и назовите себя с I’m или I am. Не добавляйте просьбу.', 'SCHOOL OFFICE · Your name: Eden', ["Hello, I'm Eden.", 'Hello, I am Eden.', "Hello! I'm Eden.", 'Hello! I am Eden.', "Hello. I'm Eden.", 'Hello. I am Eden.'], 'Hello — нейтральное начало. Затем назовите имя Eden от первого лица.', 'Сотрудник ещё с вами не знаком.', 'Сначала нейтральное приветствие, затем имя вашей роли.'], 'greet'),
      greet.write(['neighbor', 'Ответьте знакомому соседу одной неформальной репликой из урока. Скажите «Это здорово!» с awesome. Разговор продолжается.', 'NEIGHBOR CHAT · I can ride a bike now!', ["That's awesome!", 'That is awesome!'], 'Радостная реакция «Это здорово!» подходит к успеху соседа.', 'Разговор не заканчивается.', 'Говорите о хорошей новости, а не о своём удивлении или уходе.'], 'react'),
    ],
  },
  'help-and-cafe': {
    reminder: 'На входе вы просили повторить пропущенное. В кафе решите, нужно ли повторить всю реплику, уточнить одну деталь или сделать заказ. Слово size означает «размер». Короткий вопрос с what подходит, если остальное уже понятно из разговора.',
    tasks: [
      cafe.write(['lost-options', 'Реплика о вариантах пропала целиком. Попросите повторить варианты. Используйте repeat и options. Можно добавить please в конце.', 'CASHIER: We have [message missing].', ['Can you repeat the options?', 'Could you repeat the options?', 'Can you repeat the options, please?', 'Could you repeat the options, please?', 'Can you repeat the options please?', 'Could you repeat the options please?'], 'Вы просите повторить список вариантов. Can и could здесь вводят вежливую просьбу.', 'Все варианты потерялись.', 'После просьбы повторить назовите варианты с определённым артиклем.'], 'request'),
      cafe.write(['cup-size', 'Вы видите, что речь о чашке. Уточните только размер двумя словами. Используйте size.', 'CASHIER: A coffee for here. Size: [missing].', ['What size?'], 'What size? уточняет размер, а не повторяет весь заказ.', 'Уже понятно, что заказан кофе.', 'Начните с вопросительного слова «какой».'], 'ask'),
      cafe.write(['tea-order', 'Вы уже определились. Закажите одну порцию словосочетанием a tea. Используйте вежливую формулу с like. Можно добавить please в конце.', 'MENU · Tea · Coffee · Water', ["I'd like a tea.", 'I would like a tea.', "I'd like a tea, please.", 'I would like a tea, please.', "I'd like a tea please.", 'I would like a tea please.'], 'A tea — одна порция чая. I’d like и I would like подходят для заказа.', 'Вы уже знаете, что хотите.', 'Выберите формулу заказа и укажите одну порцию.'], 'order'),
    ],
  },
};

export const pk01Entries: readonly CourseEntry[] = pk01Lessons.map(lesson => ({
  id: lesson.id, title: lesson.title, level: lesson.level,
  subtitle: lesson.level === 'Pre-A1' ? 'Необязательная подготовка' : 'Знакомство и контакты',
  objective: lesson.objectives[0], lesson,
}));

export function supplementEntry(entry: CourseEntry): CourseEntry {
  const addition = supplements[entry.id as keyof typeof supplements];
  if (!addition || !entry.lesson) return entry;
  const lesson: Lesson = { ...entry.lesson, steps: entry.lesson.steps.flatMap<LessonStep>(step => {
    if (step.type === 'intro') return [{ ...step, text: `${step.text} ${addition.reminder}` }];
    if (step.type === 'theory' && 'example' in addition) return [{ ...step, blocks: [...step.blocks ?? [], {
      title: 'Представьтесь по карточке', text: 'Возьмите нужное поле и скажите о себе с I am или I’m.',
      example: addition.example, translation: addition.translation,
    }] }];
    if (step.type === 'summary') return [practice('pk01-transfer', 'Дополнительная практика', addition.tasks, true), step];
    return [step];
  }) };
  return { ...entry, lesson };
}
