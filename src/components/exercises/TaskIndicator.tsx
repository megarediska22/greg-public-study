import { questionTasks } from '../../content/questionTasks';
import { taskPresentation } from '../../lib/taskIndicators';

export function TaskIndicator({ questionId }: { questionId: string }) {
  const task = questionTasks[questionId];
  if (!task) throw Error(`Missing task indicator: ${questionId}`);
  const view = taskPresentation(task);
  return <div id={`${questionId}-task`} className="task-indicator" data-task-question={questionId} data-task-action={task.action} data-task-form={task.form}>
    <div className="task-title"><span aria-hidden="true" data-symbol={view.icon}>{task.form ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={task.form === 'question' ? 'M9 8a3 3 0 1 1 5 2c-2 1-2 2-2 3m0 4v.01' : task.form === 'negative' || task.form === 'short-negative' ? 'm6 6 12 12M6 18 18 6' : 'm5 12 4 4L19 6'} />
    </svg> : view.icon}</span><strong>{view.label}</strong></div>
    <p>{view.detail}</p>
  </div>;
}
