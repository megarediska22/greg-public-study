import type { FastBank } from '../../lib/adaptive/fast/index.ts';
import { formA } from './formA.ts';
import { formB } from './formB.ts';

export const fastPlacementBank = {
  version: 'fast-placement-bank-v1',
  forms: [formA, formB],
} satisfies FastBank;
