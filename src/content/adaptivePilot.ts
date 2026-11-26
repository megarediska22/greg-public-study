import { pk01Checkpoint, pk01Criteria, pk01Practice } from './pk01/adaptive.ts';
import { pk02Criteria, pk02Practice } from './blueprint/evidence.ts';
import { lessons } from './course.ts';
import type { AdaptiveContent } from '../lib/adaptiveHost.ts';

// Replace only with reviewed content and an explicit release decision.
export const adaptivePilot: AdaptiveContent = {
  rules: { enabled: true, version: 'pk02-unreleased', criteria: [...pk01Criteria, ...pk02Criteria], checkpoints: [pk01Checkpoint], readyLessons: lessons.map(entry => entry.id) },
  bank: { version: 'not-released', items: [], forms: [] },
  practice: [...pk01Practice, ...pk02Practice],
};
