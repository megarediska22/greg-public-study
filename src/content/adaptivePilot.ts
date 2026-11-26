import { pk01Checkpoint, pk01Criteria, pk01Practice } from './pk01/adaptive.ts';
import { lessons } from './course.ts';
import type { AdaptiveContent } from '../lib/adaptiveHost.ts';

// Replace only with reviewed content and an explicit release decision.
export const adaptivePilot: AdaptiveContent = {
  rules: { enabled: true, version: 'pk01-unreleased', criteria: pk01Criteria, checkpoints: [pk01Checkpoint], readyLessons: lessons.map(entry => entry.id) },
  bank: { version: 'not-released', items: [], forms: [] },
  practice: pk01Practice,
};
