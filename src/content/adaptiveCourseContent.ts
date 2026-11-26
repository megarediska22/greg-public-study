import { pk01Checkpoint, pk01Criteria, pk01Practice } from './pk01/adaptive.ts';
import { pk05Checkpoints, pk05Criteria, pk05Practice } from './blueprint/pk05Evidence.ts';
import { pk04Checkpoints, pk04Criteria, pk04Practice } from './blueprint/pk04Evidence.ts';
import { pk03Checkpoints, pk03Criteria, pk03Practice } from './blueprint/pk03Evidence.ts';
import { pk02Criteria, pk02Practice } from './blueprint/evidence.ts';
import { lessons } from './course.ts';
import { pilotCriteria } from '../lib/adaptive/model.ts';
import type { AdaptiveContent } from '../lib/adaptiveHost.ts';

export const adaptiveCourseContent: { rules: Omit<AdaptiveContent['rules'], 'version'>; practice: AdaptiveContent['practice'] } = {
  rules: {
    enabled: true,
    criteria: [...pk01Criteria, ...pk02Criteria, ...pk03Criteria, ...pk04Criteria, ...pk05Criteria],
    checkpoints: [pk01Checkpoint, ...pk03Checkpoints, ...pk04Checkpoints, ...pk05Checkpoints],
    readyLessons: lessons.map(entry => entry.id),
    withdrawnKeys: ['diag-b-team-reply', 'diag-b-email-no-paper'].map(itemId => ({
      itemId, keyId: `${itemId}-key`, keyRevision: '1',
    })),
    skipProfiles: { 'bp-pre-01': pilotCriteria.filter(criterion => criterion.group === 'K-P-LAT') },
  },
  practice: [...pk01Practice, ...pk02Practice, ...pk03Practice, ...pk04Practice, ...pk05Practice],
};
