import { validRole } from './evidence.ts';
import { gradeAnswer, normalizeAnswer } from '../grading.ts';
import { adaptiveCatalog, criterionKey, pilotCriteria, pilotRules, type Bank, type CourseRules, type ItemMeta, type PracticeItem } from './model.ts';

const groupIds = new Set(adaptiveCatalog.groups.map(group => group.id));
const objectiveIds = new Set(adaptiveCatalog.objectives.map(objective => objective.id));
const sequenceIds = new Set(adaptiveCatalog.sequence.map(entry => entry.id));
const byBlock: Record<string, readonly string[]> = {
  D0: pilotRules.entry, D0R: ['K-P-LAT'], D1: pilotRules.core, 'D2-BASE': pilotRules.core, 'D2-UP': pilotRules.upper,
  D3: [...pilotRules.clarificationOrder, ...pilotRules.optional],
};

export function validateCatalogue() {
  const errors: string[] = [];
  function references(values: readonly string[], allowed: Set<string>, owner: string) {
    for (const value of values) if (!allowed.has(value)) errors.push(`${owner}: missing ${value}`);
  }
  function acyclic(graph: ReadonlyMap<string, readonly string[]>, label: string) {
    const visiting = new Set<string>();
    const checked = new Set<string>();
    function visit(id: string) {
      if (checked.has(id)) return;
      if (visiting.has(id)) { errors.push(`${label}: cycle at ${id}`); return; }
      visiting.add(id);
      for (const previous of graph.get(id) ?? []) visit(previous);
      visiting.delete(id);
      checked.add(id);
    }
    for (const id of graph.keys()) visit(id);
  }
  for (const group of adaptiveCatalog.groups) {
    references(group.required, groupIds, group.id);
    references(group.objectives, objectiveIds, group.id);
    references([...group.lessons, ...(group.review ? [group.review] : [])], sequenceIds, group.id);
  }
  for (const entry of adaptiveCatalog.sequence) references([...entry.objectives, ...entry.required, ...entry.recommended], objectiveIds, entry.id);
  for (const objective of adaptiveCatalog.objectives) references(objective.lessons, sequenceIds, objective.id);
  for (const row of adaptiveCatalog.checkpoints) {
    references([row.lesson, ...(row.next ? [row.next] : [])], sequenceIds, row.id);
    references([...row.groups, ...row.readiness], groupIds, row.id);
    references(row.objectives, objectiveIds, row.id);
  }
  const graph = new Map<string, string[]>();
  for (const edge of adaptiveCatalog.edges) {
    references([edge.lesson, ...(edge.prerequisiteLesson ? [edge.prerequisiteLesson] : [])], sequenceIds, edge.lesson);
    references([edge.objective, edge.prerequisite], objectiveIds, edge.lesson);
    if (edge.relation !== 'REQUIRED') continue;
    const target = JSON.stringify([edge.lesson, edge.objective]);
    const source = JSON.stringify([edge.prerequisiteLesson, edge.prerequisite]);
    graph.set(target, [...(graph.get(target) ?? []), source]);
  }
  acyclic(graph, 'required objectives');
  acyclic(new Map(adaptiveCatalog.groups.map(group => [group.id, group.required])), 'required groups');
  return errors;
}

export function validateAdaptiveContent(rules: CourseRules, bank: Bank, practice: readonly PracticeItem[], release = false) {
  const errors: string[] = [];
  const criteria = new Map([...pilotCriteria, ...rules.criteria].map(criterion => [criterionKey(criterion), criterion]));
  function validateMeta(item: ItemMeta) {
    if (![item.itemId, item.itemRevision, item.keyId, item.keyRevision, item.family, item.stimulus].every(value => typeof value === 'string' && value.trim()) ||
        !criteria.has(criterionKey(item.criterion)) || !['R', 'P'].includes(item.role) ||
        typeof item.designated !== 'boolean' || typeof item.keyVisible !== 'boolean' ||
        !['direct', 'ambiguous'].includes(item.wrongAttribution)) errors.push(`Invalid metadata: ${item.itemId}`);
  }
  const ids = new Set<string>();
  for (const criterion of rules.criteria) {
    const group = adaptiveCatalog.groups.find(group => group.id === criterion.group);
    if (!criterion.id.trim() || !criterion.version.trim() || !group || !criterion.objectives.length ||
        criterion.objectives.some(id => !group.objectives.includes(id)) ||
        pilotCriteria.some(pilot => criterionKey(pilot) === criterionKey(criterion) && pilot.group !== criterion.group))
      errors.push(`Invalid criterion: ${criterion.id}`);
    if (ids.has(criterionKey(criterion))) errors.push(`Duplicate criterion: ${criterion.id}`);
    ids.add(criterionKey(criterion));
  }
  ids.clear();
  for (const item of bank.items) {
    validateMeta(item);
    const q = item.question;
    const normal = (answer: string) => normalizeAnswer(answer, { ignoreTerminalPunctuation: q.type === 'written', ...q.normalization });
    if (!validRole(item.role, q.type) || item.keyVisible || !item.designated || q.id !== item.itemId ||
        !q.instruction.trim() || !q.prompt.trim() || !q.explanation.trim() ||
        !q.acceptedAnswers.length || q.acceptedAnswers.some(answer => !normal(answer) || !gradeAnswer(q, answer)) ||
        new Set(q.acceptedAnswers.map(normal)).size !== q.acceptedAnswers.length ||
        q.type === 'choice' && (q.acceptedAnswers.length !== 1 || q.options.length < 2 ||
          q.options.some(option => !normal(option)) || new Set(q.options.map(normal)).size !== q.options.length)) errors.push(`Invalid diagnostic task: ${item.itemId}`);
    if (ids.has(item.itemId)) errors.push(`Duplicate item: ${item.itemId}`);
    ids.add(item.itemId);
  }
  const formIds = new Set<string>();
  const template = Object.entries(byBlock).flatMap(([block, groups]) => groups.flatMap(group => ['R', 'P'].map(role => `${block}:${group}:${role}`)));
  const materials = new Map<string, string>();
  for (const form of bank.forms) {
    if (!form.id.trim() || formIds.has(form.id)) errors.push(`Invalid form ID: ${form.id}`);
    formIds.add(form.id);
    const slots = new Set<string>();
    for (const slot of form.slots) {
      const key = `${slot.block}:${slot.group}:${slot.role}`;
      if (!template.includes(key) || slots.has(key) || !slot.items.length || new Set(slot.items).size !== slot.items.length) errors.push(`Invalid slot: ${form.id}/${key}`);
      slots.add(key);
      const pool = slot.items.map(id => bank.items.find(item => item.itemId === id));
      for (const item of pool) {
        const criterion = item && criteria.get(criterionKey(item.criterion));
        if (!item || item.role !== slot.role || criterion?.group !== slot.group ||
            !pilotCriteria.some(pilot => criterionKey(pilot) === criterionKey(item.criterion))) { errors.push(`Mismatched slot: ${form.id}/${key}`); continue; }
        if (!release) continue;
        for (const material of [`family:${item.family}`, `stimulus:${item.stimulus}`]) {
          const scope = JSON.stringify([criterionKey(item.criterion), material]);
          const owner = `${form.id}/${key}`;
          if (materials.has(scope) && materials.get(scope) !== owner) errors.push(`Non-independent material: ${owner}/${material}`);
          materials.set(scope, owner);
        }
      }
    }
    if (release && template.some(slot => !slots.has(slot))) errors.push(`Incomplete form: ${form.id}`);
  }
  if (!bank.version.trim() || !rules.version.trim()) errors.push('Missing bank or catalogue version');
  if (release && (!rules.enabled || formIds.size < 2 || !['to-be', 'bp-a1-01'].some(id => rules.readyLessons.includes(id)))) errors.push('Pilot requires enabled rules, two independent complete forms and a ready A1 entry');
  for (const id of rules.readyLessons) if (!sequenceIds.has(id)) errors.push(`Unknown lesson: ${id}`);
  for (const item of practice) {
    validateMeta(item);
    if (!sequenceIds.has(item.lessonId) || !item.stepId.trim() || item.checkpointId &&
        !adaptiveCatalog.checkpoints.some(row => row.id === item.checkpointId && row.lesson === item.lessonId &&
          row.groups.includes(criteria.get(criterionKey(item.criterion))?.group ?? ''))) errors.push(`Invalid practice location: ${item.itemId}`);
    if (ids.has(item.itemId)) errors.push(`Duplicate item: ${item.itemId}`);
    ids.add(item.itemId);
  }
  for (const [id, profile] of Object.entries(rules.skipProfiles ?? {})) {
    if (!sequenceIds.has(id) || !profile.length || profile.some(criterion => !criteria.has(criterionKey(criterion)))) errors.push(`Invalid skip profile: ${id}`);
  }
  const checkpointIds = new Set<string>();
  for (const profile of rules.checkpoints ?? []) {
    const row = adaptiveCatalog.checkpoints.find(checkpoint => checkpoint.id === profile.id);
    const groups = profile.readiness.map(criterion => criteria.get(criterionKey(criterion))?.group);
    if (!row || checkpointIds.has(profile.id) || !profile.items.length || new Set(profile.items).size !== profile.items.length ||
        profile.items.some(id => !practice.some(item => item.itemId === id && item.checkpointId === profile.id)) ||
        row.readiness.length !== groups.length || row.readiness.some(group => !groups.includes(group)) ||
        profile.readiness.some(ref => !practice.some(item => profile.items.includes(item.itemId) && criterionKey(item.criterion) === criterionKey(ref))))
      errors.push(`Invalid checkpoint profile: ${profile.id}`);
    checkpointIds.add(profile.id);
  }
  return errors;
}
