import { criterion, observation } from './evidence.ts';
import { correspondence, message, planFit } from './pk04Evidence.ts';
import type { CheckpointProfile } from '../../lib/adaptive/model.ts';

const travel = criterion('TRIP-FIT', 'A2-CONSTRAINT', 'A2-READ-TRIP-INTEGRATION');
const capacity = criterion('CAPACITY', 'A2-COMPARE', 'A2-READ-CAPACITY');
const resolution = criterion('SERVICE-OUTCOME', 'A2-RESOLVE', 'A2-READ-SUPPORT-RESOLUTION');
const eventFit = criterion('EVENT-FIT', 'A2-CONSTRAINT', 'A2-READ-EVENT-INTEGRATION');
const report = criterion('EVENT-REPORT', 'A2-MEDIATE', 'A2-WR-EVENT-REPORT');
const recommendation = criterion('RECOMMEND', 'A2-COMPARE', 'A2-WR-RECOMMENDATION-PARTS');
const maintenance = criterion('MAINTENANCE-MESSAGE', 'A2-WRITE', 'A2-WR-COMPLETE-MAINTENANCE');
const update = criterion('MEDIATE-UPDATE', 'A2-MEDIATE', 'A2-WR-UPDATE-MEDIATION');
export const pk05Criteria = [travel, capacity, resolution, eventFit, report, recommendation, maintenance, update];
const at = (
  checkpoint: string, id: string, skill: Parameters<typeof observation>[0], slug: string, family: string, role: 'R' | 'P',
) => observation(skill, id, slug, 'pk05-transfer', family, role, checkpoint);

const trip = [
  at('CP-101', 'unit-101', travel, 'boat-capacity', 'rental-cost-seats-launch', 'R'),
  at('CP-101', 'unit-101', capacity, 'studio-seats', 'studio-occupied-seat-recommendation', 'P'),
];
const delivery = [
  at('CP-111', 'unit-111', resolution, 'wrong-and-missing', 'confirmed-paper-pending-pens', 'R'),
  at('CP-111', 'unit-111', resolution, 'late-box', 'delivered-box-billing-unresolved', 'P'),
];
const event = [
  at('CP-121', 'unit-121', eventFit, 'setup-current', 'wet-courtyard-retained-leader', 'R'),
  at('CP-121', 'unit-121', report, 'late-event-task', 'actual-lunch-attendance-photos', 'P'),
];
const exit = [
  observation(planFit, 'bp-a2-07', 'rain-ferry', 'choice', 'canceled-park-ferry-rain', 'R', 'CP-A2'),
  observation(resolution, 'bp-a2-07', 'not-closed', 'choice', 'replacement-key-outer-vs-storage', 'R', 'CP-A2'),
  observation(correspondence, 'bp-a2-07', 'main-meeting', 'choice', 'projector-instead-of-print', 'R', 'CP-A2'),
  observation(message, 'bp-a2-07', 'borrow-by-deadline', 'written', 'equipment-request-for-rain', 'P', 'CP-A2'),
  observation(report, 'bp-a2-07', 'attendance-report', 'written', 'puzzle-event-feedback-and-follow-up', 'P', 'CP-A2'),
];

export const pk05Practice = [
  ...trip, ...delivery, ...event, ...exit,
  observation(recommendation, 'bp-a2-04', 'gallery-visit', 'written', 'gallery-close-before-visit', 'P'),
  observation(maintenance, 'bp-a2-05', 'laundry-ticket', 'written', 'dryer-visit-with-entry-window', 'P'),
  observation(update, 'bp-a2-06', 'pool-handoff', 'written', 'revised-return-deadline-for-key', 'P'),
];

export const pk05Checkpoints: readonly CheckpointProfile[] = [
  { id: 'CP-101', items: trip.map(item => item.itemId), readiness: [] },
  { id: 'CP-111', items: delivery.map(item => item.itemId), readiness: [] },
  { id: 'CP-121', items: event.map(item => item.itemId), readiness: [] },
  { id: 'CP-A2', items: exit.map(item => item.itemId), readiness: [] },
];

export const finalSkillLabels = {
  'C-BP-PLAN-FIT': 'Согласовать время, транспорт и погодный вариант',
  'C-BP-SERVICE-OUTCOME': 'Отличить выполненный ремонт от обещания',
  'C-BP-CORRESPONDENCE': 'Выделить главное изменение в переписке',
  'C-BP-COMPLETE-MESSAGE': 'Составить просьбу и указать срок',
  'C-BP-EVENT-REPORT': 'Передать число участников, отзыв и оставшееся действие',
} as const;
export const finalSkillTips = {
  'C-BP-PLAN-FIT': 'Сначала исключите отменённые варианты, затем сравните прибытие и начало.',
  'C-BP-SERVICE-OUTCOME': 'Разнесите действия по двум строкам: выполнено и обещано.',
  'C-BP-CORRESPONDENCE': 'Найдите строку, которая меняет следующее действие адресата.',
  'C-BP-COMPLETE-MESSAGE': 'Проверьте, указаны ли просьба и крайний срок ответа.',
  'C-BP-EVENT-REPORT': 'Проверьте фактическое число, отзыв и имя ответственного за следующий шаг.',
} as const;
