import type { Bank } from '../../lib/adaptive/model.ts';
import { formA } from './formA.ts';
import { formB } from './formB.ts';

// This module is reached solely through the localhost development adaptive host.
export const diagnosticBank: Bank = {
  version: 'diagnostic-bank-v1',
  items: [...formA.items, ...formB.items],
  forms: [formA.form, formB.form],
};
