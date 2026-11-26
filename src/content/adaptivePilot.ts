import { lessons } from './course.ts';
import type { AdaptiveContent } from '../lib/adaptiveHost.ts';

// Replace only with reviewed content and an explicit release decision.
export const adaptivePilot: AdaptiveContent = {
  rules: { enabled: true, version: 'stage06-unreleased', criteria: [], readyLessons: lessons.map(entry => entry.id) },
  bank: { version: 'not-released', items: [], forms: [] },
  practice: [],
};
