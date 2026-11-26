import type { Question } from '../../types/lesson.ts';
import catalog from './catalog.generated.json' with { type: 'json' };

export const adaptiveCatalog = catalog;
export const pilotRules = {
  version: 'pilot-v1', maxItems: 28, maxClarifyingPairs: 3, minimumUpConfirmations: 3,
  entry: ['K-P-LAT', 'K-P-NUM'],
  core: ['K-A1-BE', 'K-A1-ASK', 'K-A1-ORIENT', 'K-A1-NOTE'],
  upper: ['K-A1-NOW', 'K-A1-PAST', 'K-A2-CONSTRAINT', 'K-A2-WRITE'],
  optional: ['K-A2-GIST', 'K-A2-MEDIATE'],
  gapOrder: ['K-P-LAT', 'K-P-NUM', 'K-A1-BE', 'K-A1-ASK', 'K-A1-ORIENT', 'K-A1-NOTE'],
  clarificationOrder: ['K-P-NUM', 'K-A1-BE', 'K-A1-ASK', 'K-A1-ORIENT', 'K-A1-NOTE', 'K-A2-CONSTRAINT', 'K-A2-WRITE'],
  activeMinutes: [8, 12],
} as const;

export const methodVersion = pilotRules.version;
export const criterionKey = ({ id, version }: CriterionRef) => JSON.stringify([id, version]);
export type CriterionRef = { id: string; version: string };
export type Criterion = CriterionRef & { group: string; objectives: readonly string[] };
export const pilotCriteria: Criterion[] = catalog.groups.flatMap(group => group.placementCriterion
  ? [{ id: group.placementCriterion, version: methodVersion, group: group.id, objectives: group.objectives }]
  : []);
export type Role = 'R' | 'P';
export type Assistance = 'H0' | 'H1' | 'H2' | 'UNKNOWN';
export type Channel = 'diagnostic' | 'lesson' | 'checkpoint' | 'recheck';
export type Block = 'D0' | 'D0R' | 'D1' | 'D2-BASE' | 'D2-UP' | 'D3';
export type KeyRef = { itemId: string; keyId: string; keyRevision: string };
export type ItemMeta = KeyRef & {
  itemRevision: string;
  criterion: CriterionRef;
  family: string;
  stimulus: string;
  role: Role;
  designated: boolean;
  keyVisible: boolean;
  wrongAttribution: 'direct' | 'ambiguous';
};
export type DiagnosticItem = ItemMeta & { question: Question };
export type Slot = { block: Block; group: string; role: Role; items: readonly string[] };
export type Form = { id: string; slots: readonly Slot[] };
export type Bank = { version: string; items: readonly DiagnosticItem[]; forms: readonly Form[] };
export type PracticeItem = ItemMeta & { lessonId: string; stepId: string; checkpointId?: string };
export type CheckpointProfile = { id: string; items: readonly string[]; readiness: readonly CriterionRef[] };
export type CourseRules = {
  enabled: boolean;
  version: string;
  readyLessons: readonly string[];
  criteria: readonly Criterion[];
  skipProfiles?: Readonly<Record<string, readonly CriterionRef[]>>;
  checkpoints?: readonly CheckpointProfile[];
  withdrawnKeys?: readonly KeyRef[];
};
export const sameCriterion = (left: CriterionRef, right: CriterionRef) => criterionKey(left) === criterionKey(right);
export function isWithdrawn(item: KeyRef, withdrawn: readonly KeyRef[] = []) {
  return withdrawn.some(key => key.itemId === item.itemId && key.keyId === item.keyId && key.keyRevision === item.keyRevision);
}
