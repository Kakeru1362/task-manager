import { useApp } from '../state/AppContext'
import * as repo from '../store/repositories'
import type { GoalTask, GoalStatus, PersonalTask, ID } from '../types/models'
import { goalStatusLabel } from './Badges'
import { ProgressBar } from './ProgressBar'
import { dueLabel, isOverdue } from '../lib/date'

interface GoalCardProps {
  goal: GoalTask
  onOpenTask: (taskId: ID) => void
  onAddTask: (goalId: ID) => void
}

export function GoalCard({ goal, onOpenTask, onAddTask }: GoalCardProps) {
  const { data, apply } = useApp()
  const tasks = repo.personalTasksForGoal(data, goal.id)

  const del = () => {
    if (!window.confirm(`ゴール「${goal.title}」を削除しますか？`)) return
    apply((d) => repo.deleteGoalTask(d, goal.id))
  }

  return (
    <div className="goal-card">
      <div className="goal-card-head">
        <div className="goal-card-title">{goal.title}</div>
        <select
          value={goal.status}
          onChange={(e) => apply((d) => repo.setGoalStatus(d, goal.id, e.target.value as GoalStatus))}
        >
          {(['todo', 'in_progress', 'done'] as GoalStatus[]).map((s) => (
            <option key={s} value={s}>
              {goalStatusLabel[s]}
            </option>
          ))}
        </select>
      </div>
      {goal.description && <div className="goal-card-desc">{goal.description}</div>}
      {goal.dueDate && (
        <div className="goal-card-meta">
          <span className={`due ${isOverdue(goal.dueDate) ? 'overdue' : ''}`} style={{ marginLeft: 0 }}>
            締切 {dueLabel(goal.dueDate)}
          </span>
        </div>
      )}

      <div className="gc-tasks">
        {tasks.length === 0 ? (
          <div className="gc-empty">個人タスクはまだありません</div>
        ) : (
          tasks.map((t) => <TaskRow key={t.id} task={t} onClick={() => onOpenTask(t.id)} />)
        )}
      </div>

      <div className="row gap" style={{ justifyContent: 'space-between' }}>
        <button className="btn ghost sm" onClick={() => onAddTask(goal.id)}>
          ＋ 個人タスク
        </button>
        <button className="btn ghost sm danger" onClick={del}>
          削除
        </button>
      </div>
    </div>
  )
}

function TaskRow({ task, onClick }: { task: PersonalTask; onClick: () => void }) {
  const { data } = useApp()
  const owner = repo.userById(data, task.ownerId)
  return (
    <button className={`gc-task ${task.needsDiscussion ? 'flagged' : ''}`} onClick={onClick}>
      <span className="avatar sm" style={{ background: owner?.color }}>
        {owner?.name?.[0] ?? '?'}
      </span>
      <span className="gc-task-title">{task.title}</span>
      <span className="gc-task-prog">
        <ProgressBar value={task.progress} />
      </span>
    </button>
  )
}
