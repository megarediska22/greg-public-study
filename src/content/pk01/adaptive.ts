import { pilotCriteria, type Criterion, type PracticeItem, type Role } from '../../lib/adaptive/model.ts';

const latin = pilotCriteria.find(criterion => criterion.id === 'C-P-LAT-ENTRY')!;
const numbers = pilotCriteria.find(criterion => criterion.id === 'C-P-NUM-ENTRY')!;
const fields: Criterion = { id: 'C-PK01-FORM', version: '1', group: 'K-P-FORM', objectives: ['PRE-WR-PERSONAL'] };
const repair: Criterion = { id: 'C-PK01-REPAIR', version: '1', group: 'K-A1-SOCIAL', objectives: ['A1-FUNC-REPAIR'] };
export const pk01Criteria = [fields, repair];

function observation(criterion: Criterion, lessonId: string, stepId: string, itemId: string,
  family: string, role: Role = 'P', checkpointId?: 'CP-PRE'): PracticeItem {
  return {
    lessonId, stepId, itemId, itemRevision: '1', keyId: `${itemId}-key`, keyRevision: '1',
    criterion: { id: criterion.id, version: criterion.version },
    family, stimulus: itemId, role, designated: true, keyVisible: false,
    wrongAttribution: 'ambiguous',
    ...(checkpointId ? { checkpointId } : {}),
  };
}

// Only new, independently authored tasks. Practice keys and prior course
// history cannot satisfy diagnostic-only skip profiles.
export const pk01Practice: readonly PracticeItem[] = [
  observation(latin, 'bp-pre-01', 'written', 'bp-pre-01-club-badge', 'pk01-badge-uppercase'),
  observation(numbers, 'bp-pre-02', 'written', 'bp-pre-02-gym-locker', 'pk01-locker-number'),
  observation(fields, 'bp-pre-02', 'written', 'bp-pre-02-callback-number', 'pk01-delivery-phone'),
  observation(latin, 'bp-pre-04', 'choice', 'bp-pre-04-letter-pass', 'pk01-pass-letter-discrimination', 'R', 'CP-PRE'),
  observation(fields, 'bp-pre-04', 'written', 'bp-pre-04-maker-name', 'pk01-guest-name-field'),
  observation(numbers, 'bp-pre-04', 'written', 'bp-pre-04-class-number', 'pk01-bus-number', 'P', 'CP-PRE'),
  observation(repair, 'bp-a1-01', 'written', 'bp-a1-01-lost-surname', 'pk01-missing-surname'),
  observation(repair, 'bp-a1-01', 'written', 'bp-a1-01-unknown-word', 'pk01-badge-meaning'),
];

export const pk01Checkpoint = {
  id: 'CP-PRE',
  items: ['bp-pre-04-letter-pass', 'bp-pre-04-class-number'],
  readiness: [{ id: latin.id, version: latin.version }, { id: numbers.id, version: numbers.version }],
};
