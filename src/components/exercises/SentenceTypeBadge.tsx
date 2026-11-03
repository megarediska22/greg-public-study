import type { SentenceType } from '../../types/lesson';

const labels: Record<SentenceType, { icon: string; text: string }> = {
  affirmative: { icon: '✓', text: 'Утверждение' },
  negative: { icon: '✕', text: 'Отрицание' },
  question: { icon: '?', text: 'Вопрос' },
  'short-affirmative': { icon: '✓', text: 'Короткий ответ: да' },
  'short-negative': { icon: '✕', text: 'Короткий ответ: нет' },
};

/** Describes the requested answer, never the correctness of an attempt. */
export function SentenceTypeBadge({ type }: { type: SentenceType }) {
  const label = labels[type];
  return <span className="sentence-type"><span aria-hidden="true">{label.icon}</span>{label.text}</span>;
}
