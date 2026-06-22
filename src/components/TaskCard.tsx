import type { PersonalTask } from '../types/models'
import { useApp } from '../state/AppContext'
import { userById, goalById, projectById } from '../store/repositories'
import { ProgressBar } from './ProgressBar'
import { PriorityBadge, StatusBadge, ReviewBadge } from './Badges'
import { dueLabel, isOverdue, isDueSoon } from '../lib/date'

export function TaskCard({ task, onClick }: { task: PersonalTask; onClick: () => void }) {
  const { data } = useApp()
  const owner = userById(data, task.ownerId)
  const goal = goalById(data, task.goalTaskId)
  const project = projectById(data, goal?.projectId)
  const due = task.period.end
  const dueClass = isOverdue(due) ? 'overdue' : isDueSoon(due) ? 'soon' : ''

  return (
    <button className={`task-card ${task.needsDiscussion ? 'flagged' : ''}`} onClick={onClick}>
      {task.needsDiscussion && <div className="flag-ribbon">🗣 要相談</div>}
      <div className="task-card-head">
        <span className="avatar sm" style={{ background: owner?.color }}>
          {owner?.name?.[0] ?? '?'}
        </span>
        <span className="task-owner">{owner?.name ?? '未割当'}</span>
        <PriorityBadge priority={task.priority} />
      </div>
      <div className="task-title">{task.title}</div>
      {goal && (
        <div className="task-goal muted small">
          🎯 {project?.name} / {goal.title}
        </div>
      )}
      <ProgressBar value={task.progress} />
      <div className="task-card-foot">
        <StatusBadge status={task.status} />
        <ReviewBadge status={task.reviewStatus} />
        {due && <span className={`due ${dueClass}`}>{dueLabel(due)}</span>}
      </div>
    </button>
  )
}
