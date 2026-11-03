/** Russian course-count label, including 21 / 22 / 25 lessons. */
export function formatLessonCount(count: number): string {
  const form = new Intl.PluralRules('ru').select(count);
  return `${count} ${form === 'one' ? 'урок' : form === 'few' ? 'урока' : 'уроков'}`;
}
