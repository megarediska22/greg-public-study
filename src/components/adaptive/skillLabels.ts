import { adaptiveCatalog, criterionKey, pilotCriteria, type Criterion } from '../../lib/adaptive/model.ts';

export function skillLabels(criteria: readonly Criterion[]) {
  const groupNames = new Map(adaptiveCatalog.groups.map(group => [group.id, group.name]));
  const objectiveNames = new Map(adaptiveCatalog.objectives.map(objective => [objective.id, objective.name]));
  const diagnostic = new Set(pilotCriteria.map(criterionKey));
  const names = criteria.map(criterion => groupNames.get(criterion.group) ?? 'Проверяемое умение');
  return new Map(criteria.map((criterion, index) => {
    const name = names[index];
    const repeated = names.some((other, at) => at !== index && other === name);
    const detail = criterion.objectives.map(id => objectiveNames.get(id)).filter(Boolean).join(' ');
    const source = diagnostic.has(criterionKey(criterion)) ? 'Диагностика' : 'Практика в уроках';
    return [criterionKey(criterion), repeated ? `${name} · ${source}. ${detail}` : name];
  }));
}
