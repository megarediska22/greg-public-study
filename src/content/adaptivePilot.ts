import { adaptiveCourseContent } from './adaptiveCourseContent.ts';
import { fastPlacementBank } from './fast-placement/index.ts';
import { diagnosticBank } from './diagnostic/bank.ts';
import type { AdaptiveContent } from '../lib/adaptiveHost.ts';

// Full localhost pilot. Online Beta installs the fast bank separately.
export const adaptivePilot: AdaptiveContent = {
  ...adaptiveCourseContent,
  rules: { ...adaptiveCourseContent.rules, version: 'pk05-unreleased' },
  bank: diagnosticBank,
  fastBank: fastPlacementBank,
};
