import { foldKnowledge, isIssue, type Evidence } from './evidence.ts';
import { adaptiveCatalog, criterionKey, pilotCriteria, type CourseRules } from './model.ts';
import { ready } from './routes.ts';

export type Advice = { id: string; lessonId: string; criterion: string; episode: string; reason: 'prerequisite' | 'current' | 'check'; resume: string };
export function reviewAdvice(rules: CourseRules, history: readonly Evidence[], dismissals: Readonly<Record<string, string>>, currentLesson: string, includeDismissed = false): Advice | null {
  if (!rules.enabled || !ready(rules, currentLesson)) return null;
  const sequence = adaptiveCatalog.sequence;
  const lessonAt = sequence.findIndex(entry => entry.id === currentLesson);
  const objectives = sequence[lessonAt].objectives;
  const depths = new Map<string, Map<string, number>>();
  const queue = objectives.map(objective => ({ lesson: currentLesson, objective, depth: 0 }));
  for (const { lesson, objective, depth } of queue) {
    const prior = depths.get(objective) ?? new Map<string, number>();
    if (prior.has(lesson)) continue;
    prior.set(lesson, depth);
    depths.set(objective, prior);
    for (const edge of adaptiveCatalog.edges) {
      if (edge.lesson === lesson && edge.objective === objective && ['RECOMMENDED', 'REQUIRED', 'SPIRAL'].includes(edge.relation))
        queue.push({ lesson: edge.prerequisiteLesson, objective: edge.prerequisite, depth: depth + 1 });
    }
  }
  const candidates = [...new Map([...pilotCriteria, ...rules.criteria].map(criterion => [criterionKey(criterion), criterion])).values()].flatMap(criterion => {
    const key = criterionKey(criterion);
    const knowledge = foldKnowledge(history, criterion, rules.withdrawnKeys);
    const links = criterion.objectives.flatMap(objective => [...(depths.get(objective) ?? [])]);
    const group = adaptiveCatalog.groups.find(entry => entry.id === criterion.group);
    const targets = new Map(links.filter(([id, depth]) => ready(rules, id) &&
      (depth === 0 || sequence.findIndex(entry => entry.id === id) < lessonAt)));
    const prior = [...targets].filter(([, depth]) => depth > 0);
    if (prior.length && ready(rules, group?.review) && sequence.findIndex(entry => entry.id === group.review) < lessonAt)
      targets.set(group!.review!, Math.min(...prior.map(([, depth]) => depth)));
    const ambiguous = history.find(event => criterionKey(event.item.criterion) === key && event.neutral === 'ambiguous');
    const uncertain = ['MIXED', 'PRELIMINARY'].includes(knowledge.state) || knowledge.state === 'UNKNOWN' && !!ambiguous;
    const episode = knowledge.episode ?? knowledge.evidence[0] ?? ambiguous?.submission;
    if (!episode || !isIssue(knowledge.state) && !uncertain || !includeDismissed && dismissals[key] === episode) return [];
    return [...targets].map(([lessonId, depth]) => {
      const reason: Advice['reason'] = !isIssue(knowledge.state) ? 'check' : depth > 0 ? 'prerequisite' : 'current';
      const advice: Advice = { id: JSON.stringify([key, episode, lessonId]), lessonId, criterion: key, episode, reason, resume: currentLesson };
      return { advice, depth, rank: reason === 'prerequisite' ? 0 : reason === 'current' ? 1 : 2, position: sequence.findIndex(entry => entry.id === lessonId) };
    });
  });
  candidates.sort((a, b) => a.rank - b.rank || a.depth - b.depth || a.position - b.position || (a.advice.id < b.advice.id ? -1 : 1));
  return candidates[0]?.advice ?? null;
}
