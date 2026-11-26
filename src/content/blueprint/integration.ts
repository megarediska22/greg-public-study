import { practice } from '../pk01/author.ts';
import type { CourseEntry, Lesson } from '../../types/lesson.ts';
import { pk03 } from './pk03.ts';
import { pk02 } from './pk02.ts';
import type { ContentPacket } from './author.ts';

export const packets: readonly ContentPacket[] = [pk02, pk03];

export function insertBlueprint(entries: readonly CourseEntry[]): readonly CourseEntry[] {
  const after = new Map(packets.flatMap(packet => packet.placements.map(([id, lesson]) => [id, {
    id: lesson.id, level: lesson.level, title: lesson.title, objective: lesson.objectives[0],
    subtitle: 'Перенос навыков', lesson, introducedIn: packet.version,
  }] as const)));
  return entries.flatMap(entry => {
    const previous = entry;
    const next = after.get(entry.id);
    return next ? [previous, next] : [previous];
  });
}

// Rich rendering and compact replay must use the same optional questions.
export function applyBlueprint(lesson: Lesson): Lesson {
  const packet = packets.find(entry => entry.supplements[lesson.id] || entry.reviewEdits?.[lesson.id]);
  if (!packet) return lesson;
  const addition = packet.supplements[lesson.id];
  const review = packet.reviewEdits?.[lesson.id];
  return {
    ...lesson,
    steps: lesson.steps.flatMap(step => {
      if (step.type === 'intro' && addition) return [{ ...step, text: `${step.text} ${addition.reminder}` }];
      if (step.type === 'review' && review) return [{ ...step, description: review }];
      if (step.type === 'summary' && addition?.questions.length) {
        return [practice(`pk0${packet.version - 2}-transfer`, 'Дополнительная практика', addition.questions, true), step];
      }
      return [step];
    }),
  };
}

export function blueprintCounts(entry: CourseEntry): CourseEntry {
  const addition = packets.find(packet => packet.supplements[entry.id])?.supplements[entry.id];
  return addition?.questions.length && entry.stepCount !== undefined && entry.questionCount !== undefined ?
    { ...entry, stepCount: entry.stepCount + 1, questionCount: entry.questionCount + addition.questions.length } : entry;
}
