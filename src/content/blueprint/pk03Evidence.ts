import { ask, criterion, observation, tense } from './evidence.ts';
import type { CheckpointProfile } from '../../lib/adaptive/model.ts';

const orient = criterion('SCHEDULE', 'A1-ORIENT', 'A1-READ-SCHEDULE');
const note = criterion('VISITOR-NOTE', 'A1-NOTE', 'BP-A1-WR-SHORT-NOTE');
const combined = criterion('PRACTICAL-CHOICE', 'A1-PRACTICAL', 'A1-READ-INTEGRATE');
const state = criterion('PAST-STATE', 'A1-PAST', 'A1-FORM-STATE-ACTION');
const pastNegative = criterion('PAST-NEGATIVE', 'A1-PAST', 'A1-FORM-PAST-NEGATIVE');
const pastRead = criterion('PAST-LOG', 'A1-PAST-READ', 'A1-READ-PAST-LOG');
const pastWrite = criterion('PAST-REPORT', 'A1-PAST-WRITE', 'A1-WR-PAST-REPORT');
export const pk03Criteria = [orient, note, combined, state, pastNegative, pastRead, pastWrite];

const at = (
  skill: Parameters<typeof observation>[0], id: string, slug: string, family: string, role: 'R' | 'P', checkpoint: string,
) => observation(skill, id, slug, 'pk03-transfer', family, role, checkpoint);

const library = [
  at(combined, 'unit-031', 'reading-desk-plan', 'registration-with-payment', 'R', 'CP-031'),
  at(combined, 'unit-031', 'late-reading-room', 'changed-library-room-and-time', 'P', 'CP-031'),
];
const trip = [
  at(state, 'unit-041', 'night-lobby', 'dark-lobby-state', 'R', 'CP-041'),
  at(pastNegative, 'unit-041', 'camp-checklist', 'unlocked-camp-shed', 'P', 'CP-041'),
];
const bridge = [
  observation(orient, 'bp-a1-08', 'day-after', 'blank', 'front-desk-reopening', 'P', 'CP-A1'),
  observation(orient, 'bp-a1-08', 'visit-slot', 'choice', 'museum-last-entry', 'R', 'CP-A1'),
  observation(ask, 'bp-a1-08', 'question-missing', 'written', 'missing-lunch-place', 'P', 'CP-A1'),
  observation(tense, 'bp-a1-08', 'now-fix', 'written', 'replace-caption-with-snapshot', 'P', 'CP-A1'),
  observation(note, 'bp-a1-08', 'recipient-note', 'written', 'rehearsal-visitor-note', 'P', 'CP-A1'),
  observation(pastRead, 'bp-a1-08', 'club-log', 'choice', 'piano-log-and-plan', 'R', 'CP-A1'),
  observation(pastWrite, 'bp-a1-08', 'past-update', 'written', 'side-door-call-status', 'P', 'CP-A1'),
];

export const pk03Practice = [
  ...library, ...trip, ...bridge,
  observation(note, 'bp-a1-06', 'club-door', 'written', 'club-visitor-note-retained-door', 'P'),
  observation(orient, 'bus-schedules', 'exit-viable-ride', 'choice', 'park-route-deadline', 'R'),
];
export const pk03Checkpoints: readonly CheckpointProfile[] = [
  { id: 'CP-031', items: library.map(item => item.itemId), readiness: [] },
  { id: 'CP-041', items: trip.map(item => item.itemId), readiness: [] },
  { id: 'CP-A1', items: bridge.map(item => item.itemId), readiness: [ask, tense, orient, note].map(({ id, version }) => ({ id, version })) },
];
