import { useState } from 'react'
import { useApp } from '../state/AppContext'
import * as repo from '../store/repositories'
import { goalTaskSchema } from '../lib/validation'
import { newId } from '../lib/id'
import { GoalStatusBadge } from './Badges'
import { dueLabel, isOverdue } from '../lib/date'
import type { ID } from '../types/models'

export function GoalList({
  projectId,
  categoryId,
  onOpen,
}: {
  projectId: ID
  categoryId: ID
  onOpen: (goalId: ID) => void
}) {
  const { data, apply } = useApp()
  const goals = data.goalTasks
    .filter((g) => g.projectId === projectId && g.categoryId === categoryId)
    .sort((a, b) => a.order - b.order)
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [due, setDue] = useState('')
  const [error, setError] = useState('')

  const add = () => {
    const parsed = goalTaskSchema.safeParse({ title, dueDate: due || undefined })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'ゴールを入力してください')
      return
    }
    const id = newId()
    apply((d) =>
      repo.addGoalTask(d, { id, projectId, categoryId, title: title.trim(), dueDate: due || undefined }),
    )
    setTitle('')
    setDue('')
    setAdding(false)
    setError('')
    onOpen(id) // 作成したゴールへ自動遷移
  }

  return (
    <div className="goal-list">
      {goals.length === 0 && !adding && <div className="muted small empty-hint">まだゴールがありません。</div>}
      {goals.map((g) => {
        const linked = repo.personalTasksForGoal(data, g.id).length
        return (
          <button key={g.id} className="goal-row" onClick={() => onOpen(g.id)}>
            <GoalStatusBadge status={g.status} />
            <span className="goal-row-title">🎯 {g.title}</span>
            <span className="muted small">個人タスク {linked}件</span>
            {g.dueDate && <span className={`due ${isOverdue(g.dueDate) ? 'overdue' : ''}`}>{dueLabel(g.dueDate)}</span>}
          </button>
        )
      })}
      {adding ? (
        <div className="goal-add">
          <input
            value={title}
            placeholder="大きなゴール（例：Q3で新規50件）"
            aria-label="大きなゴール"
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') add()
              if (e.key === 'Escape') {
                setAdding(false)
                setError('')
              }
            }}
            autoFocus
          />
          <input type="date" value={due} aria-label="締切日" onChange={(e) => setDue(e.target.value)} />
          {error && <div className="error-text">{error}</div>}
          <div className="row gap">
            <button
              className="btn ghost sm"
              onClick={() => {
                setAdding(false)
                setError('')
              }}
            >
              取消
            </button>
            <button className="btn primary sm" onClick={add}>
              追加
            </button>
          </div>
        </div>
      ) : (
        <button className="btn dashed" onClick={() => setAdding(true)}>
          ＋ ゴールを追加
        </button>
      )}
    </div>
  )
}
