import test from 'node:test';
import assert from 'node:assert/strict';
import { skillLabels } from '../src/components/adaptive/skillLabels.ts';
import { adaptivePilot } from '../src/content/adaptivePilot.ts';
import { pilotCriteria, criterionKey } from '../src/lib/adaptive/model.ts';

test('all independent result criteria retain distinct learner-readable labels', () => {
  const criteria = [...pilotCriteria, ...adaptivePilot.rules.criteria];
  const labels = skillLabels(criteria);
  assert.equal(labels.size, criteria.length);
  assert.equal(new Set(labels.values()).size, criteria.length);
  const ask = criteria.filter(item => item.group === 'K-A1-ASK');
  assert.equal(ask.length, 2);
  assert.match(labels.get(criterionKey(ask[0])), /Диагностика/);
  assert.match(labels.get(criterionKey(ask[1])), /Практика в уроках/);
  for (const [id, label] of labels) {
    assert.ok(label.trim());
    assert.ok(!label.includes(id));
  }
});
