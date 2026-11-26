import fastBank from 'virtual:online-beta-fast-bank';
import { adaptiveCourseContent } from './adaptiveCourseContent.ts';
import type { AdaptiveContent } from '../lib/adaptiveHost.ts';

export const onlineBetaContent: AdaptiveContent = {
  ...adaptiveCourseContent,
  rules: { ...adaptiveCourseContent.rules, version: 'online-beta-v1' },
  fastBank,
};
