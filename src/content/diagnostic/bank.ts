import type { Bank } from '../../lib/adaptive/model.ts';
import { formA } from './formA.ts';
import { formB } from './formB.ts';

// This module is reached solely through the localhost development adaptive host.
export const diagnosticBank: Bank = {
  version: 'diagnostic-bank-v2',
  items: [...formA.items, ...formB.items].map(item => {
    if (item.itemId === 'diag-b-team-reply') return { ...item, itemRevision: '2', keyRevision: '2' };
    if (item.itemId === 'diag-b-email-no-paper') return { ...item, keyRevision: '2' };
    return item;
  }),
  forms: [formA.form, formB.form],
};
