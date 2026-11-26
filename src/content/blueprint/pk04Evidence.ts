import { criterion, observation } from './evidence.ts';
import type { CheckpointProfile } from '../../lib/adaptive/model.ts';

export const correspondence = criterion('CORRESPONDENCE', 'A2-GIST', 'BP-A2-READ-CORRESPONDENCE-MAIN');
export const message = criterion('COMPLETE-MESSAGE', 'A2-WRITE', 'BP-A2-WR-BOUNDED-MESSAGE');
const shopping = criterion('SHOPPING', 'A2-CONSTRAINT', 'A2-READ-SHOPPING-INTEGRATION');
const pickup = criterion('PICKUP', 'A2-SERVICE', 'A2-READ-PICKUP');
const reschedule = criterion('RESCHEDULE', 'A2-PLAN', 'A2-READ-RESCHEDULE');
export const planFit = criterion('PLAN-FIT', 'A2-CONSTRAINT', 'A2-READ-PLAN-INTEGRATION');
const service = criterion('SERVICE-ROLE', 'A2-SERVICE', 'A2-FORM-REQUEST-ACTOR');
const repairDetail = criterion('SERVICE-REPAIR', 'A2-SERVICE', 'A2-READ-REPAIR-DETAILS');
const file = criterion('PROJECT-FILE', 'A2-PROJECT', 'A2-READ-FILE-REMEDY');
const handoff = criterion('PROJECT-HANDOFF', 'A2-MEDIATE', 'A2-WR-DECISION-HANDOFF');
const status = criterion('EXPERIENCE-STATUS', 'A2-EXPERIENCE', 'A2-FORM-RESULT-STATUS');
const followup = criterion('PAST-FOLLOWUP', 'A2-EXPERIENCE', 'A2-FORM-EXPERIENCE-FOLLOWUP');
const story = criterion('NARRATIVE', 'A2-GIST', 'BP-A2-READ-NARRATIVE-MAIN');
export const pk04Criteria = [correspondence, message, shopping, pickup, reschedule, planFit, service, repairDetail, file, handoff, status, followup, story];

const at = (
  checkpoint: string, id: string, skill: Parameters<typeof observation>[0], slug: string, family: string, role: 'R' | 'P',
) => observation(skill, id, slug, 'pk04-transfer', family, role, checkpoint);

const purchase = [
  at('CP-051', 'unit-051', shopping, 'snack-fit', 'snack-ingredient-and-pickup', 'R'),
  at('CP-051', 'unit-051', pickup, 'actual-pickup', 'serving-count-before-leaving', 'P'),
];
const saturday = [
  at('CP-061', 'unit-061', reschedule, 'door-change', 'door-staff-hours', 'R'),
  at('CP-061', 'unit-061', reschedule, 'replacement-ride', 'delayed-bus-time-and-gate', 'P'),
  at('CP-061', 'unit-061', planFit, 'route-exception', 'route-duration-and-open-gate', 'R'),
  at('CP-061', 'unit-061', planFit, 'weather-start', 'rain-plan-time-window', 'P'),
];
const booking = [
  at('CP-071', 'unit-071', service, 'slot-owner', 'device-appointment-owner', 'R'),
  at('CP-071', 'unit-071', repairDetail, 'unknown-counter', 'pickup-counter-unknown', 'P'),
];
const files = [
  at('CP-081', 'unit-081', file, 'untouched-owner', 'owner-unchanged-file-replaced', 'R'),
  at('CP-081', 'unit-081', handoff, 'link-handoff', 'handoff-roles-drive-access', 'P'),
];
const experience = [
  at('CP-091', 'unit-091', status, 'already-photo', 'club-payment-photo-status', 'R'),
  at('CP-091', 'unit-091', followup, 'old-event-date', 'performance-date-followup', 'P'),
];

export const pk04Practice = [
  ...purchase, ...saturday, ...booking, ...files, ...experience,
  observation(message, 'bp-a2-01', 'locker-where', 'written', 'pickup-location-and-id', 'P'),
  observation(correspondence, 'bp-a2-02', 'poster-main', 'choice', 'printable-file-correspondence', 'R'),
  observation(story, 'bp-a2-03', 'bike-main', 'choice', 'delayed-bike-trip', 'R'),
];
export const pk04Checkpoints: readonly CheckpointProfile[] = [
  { id: 'CP-051', items: purchase.map(item => item.itemId), readiness: [] },
  { id: 'CP-061', items: saturday.map(item => item.itemId), readiness: [reschedule, planFit].map(({ id, version }) => ({ id, version })) },
  { id: 'CP-071', items: booking.map(item => item.itemId), readiness: [] },
  { id: 'CP-081', items: files.map(item => item.itemId), readiness: [] },
  { id: 'CP-091', items: experience.map(item => item.itemId), readiness: [] },
];
