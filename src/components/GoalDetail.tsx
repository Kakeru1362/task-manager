import { useApp } from '../state/AppContext'
import * as repo from '../store/repositories'
import type { ID, GoalStatus, PersonalTask } from '../types/models'
import { goalStatusLabel } from './Badges'
import { ProgressBar } from './ProgressBar'
import { dueLabel, isOverdue, formatDate } from '../lib/date'

interface GoalDetailProps {
  goalId: ID
  onAddTask: () => void
  onOpenTask: (taskId: ID) => void
  onDeleted: () => void
}

export function GoalDetail({ goalId, onAddTask, onOpenTask, onDeleted }: GoalDetailProps) {
  const { data, apply } = useApp()
  const goal = repo.goalById(data, goalId)
  if (!goal) return null

  const linked = repo.personalTasksForGoal(data, goalId)
  const setStatus = (s: GoalStatus) => apply((d) => repo.setGoalStatus(d, goalId, s))
  const del = () => {
    apply((d) => repo.deleteGoalTask(d, goalId))
    onDeleted()
  }

  return (
    <div className="goal-detail">
      <div className="goal-detail-head">
        <h2>🎯 {goal.title}</h2>
        <select value={goal.status} onChange={(e) => setStatus(e.target.value as GoalStatus)}>
          {(['todo', 'in_progress', 'done'] as GoalStatus[]).map((s) => (
            <option key={s} value={s}>
              {goalStatusLabel[s]}
            </option>
          ))}
        </select>
      </div>
      {goal.description && <p className="detail-desc">{goal.description}</p>}
      {goal.dueDate && (
        <div className="muted small">
          締切：{formatDate(goal.dueDate)}（
          <span className={isOverdue(goal.dueDate) ? 'overdue' : ''}>{dueLabel(goal.dueDate)}</span>）
        </div>
      )}

      <div className="linked-head">
        <h3>このゴールの個人タスク（{linked.length}）</h3>
        <button className="btn primary sm" onClick={onAddTask}>
          ＋ 個人タスクを追加
        </button>
      </div>
      {linked.length === 0 ? (
        <div className="muted small">まだ紐づく個人タスクはありません。</div>
      ) : (
        <div className="linked-list">
          {linked.map((t) => (
            <LinkedRow key={t.id} task={t} onClick={() => onOpenTask(t.id)} />
          ))}
        </div>
      )}

      <div className="row gap end">
        <button className="btn ghost sm danger" onClick={del}>
          このゴールを削除
        </button>
      </div>
    </div>
  )
}

function LinkedRow({ task, onClick }: { task: PersonalTask; onClick: () => void }) {
  const { data } = useApp()
  const owner = repo.userById(data, task.ownerId)
  return (
    <button className="linked-row" onClick={onClick}>
      <span className="avatar sm" style={{ background: owner?.color }}>
        {owner?.name?.[0] ?? '?'}
      </span>
      <span className="linked-title">
        {task.title}
        {task.needsDiscussion && ' 🗣'}
      </span>
      <span className="linked-progress">
        <ProgressBar value={task.progress} />
      </span>
    </button>
  )
}
