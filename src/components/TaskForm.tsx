import { useState, type FormEvent } from 'react'
import { useApp } from '../state/AppContext'
import type { PersonalTask, ID, Priority, TaskStatus, Period } from '../types/models'
import { personalTaskSchema } from '../lib/validation'
import { projectById, goalById, categoryById } from '../store/repositories'

export interface TaskFormValues {
  ownerId: ID
  goalTaskId?: ID
  title: string
  description?: string
  deliverable?: string
  outputLink?: string
  period: Period
  priority: Priority
  progress: number
  status: TaskStatus
  reviewerId?: ID
}

interface TaskFormProps {
  initial?: PersonalTask
  defaultGoalId?: ID
  onSubmit: (values: TaskFormValues) => void
  onCancel: () => void
}

export function TaskForm({ initial, defaultGoalId, onSubmit, onCancel }: TaskFormProps) {
  const { data, currentUser } = useApp()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [deliverable, setDeliverable] = useState(initial?.deliverable ?? '')
  const [outputLink, setOutputLink] = useState(initial?.outputLink ?? '')
  const [ownerId, setOwnerId] = useState<ID>(initial?.ownerId ?? currentUser?.id ?? data.users[0]?.id ?? '')
  const [goalTaskId, setGoalTaskId] = useState<string>(initial?.goalTaskId ?? defaultGoalId ?? '')
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'medium')
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? 'todo')
  const [progress, setProgress] = useState<number>(initial?.progress ?? 0)
  const [start, setStart] = useState(initial?.period.start ?? '')
  const [end, setEnd] = useState(initial?.period.end ?? '')
  const [reviewerId, setReviewerId] = useState<string>(initial?.reviewerId ?? '')
  const [error, setError] = useState('')

  const goalLabel = (g: { projectId: ID; categoryId: ID; title: string }) => {
    const p = projectById(data, g.projectId)
    const c = categoryById(data, g.categoryId)
    return `${p?.name ?? ''} / ${c?.name ?? ''} / ${g.title}`
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const parsed = personalTaskSchema.safeParse({
      title,
      description: description || undefined,
      priority,
      progress,
      start: start || undefined,
      end: end || undefined,
    })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? '入力を確認してください')
      return
    }
    if (!ownerId) {
      setError('担当者を選択してください')
      return
    }
    onSubmit({
      ownerId,
      goalTaskId: goalTaskId || undefined,
      title: title.trim(),
      description: description.trim() || undefined,
      deliverable: deliverable.trim() || undefined,
      outputLink: outputLink.trim() || undefined,
      period: { start: start || undefined, end: end || undefined },
      priority,
      progress,
      status,
      reviewerId: reviewerId || undefined,
    })
  }

  return (
    <form className="task-form" onSubmit={submit}>
      <label className="field">
        <span>タスク名</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
      </label>

      <label className="field">
        <span>説明</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
      </label>

      <label className="field">
        <span>納品形式（何をもって完了か）</span>
        <input
          value={deliverable}
          placeholder="例：ドキュメントにまとめてLINEで共有"
          onChange={(e) => setDeliverable(e.target.value)}
        />
      </label>

      <label className="field">
        <span>成果物リンク（任意）</span>
        <input
          type="url"
          value={outputLink}
          placeholder="https://（ドキュメント／スプシ等のURL）"
          onChange={(e) => setOutputLink(e.target.value)}
        />
      </label>

      <div className="field-row">
        <label className="field">
          <span>担当者</span>
          <select
            value={ownerId}
            onChange={(e) => {
              const next = e.target.value
              setOwnerId(next)
              if (reviewerId === next) setReviewerId('') // 自己レビューを防ぐ
            }}
          >
            {data.users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>紐づくゴール</span>
          <select value={goalTaskId} onChange={(e) => setGoalTaskId(e.target.value)}>
            <option value="">（なし）</option>
            {data.goalTasks.map((g) => (
              <option key={g.id} value={g.id}>
                {goalLabel(g)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="field-row">
        <label className="field">
          <span>優先度</span>
          <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </label>
        <label className="field">
          <span>ステータス</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
            <option value="todo">未着手</option>
            <option value="in_progress">進行中</option>
            <option value="review">レビュー中</option>
            <option value="done">完了</option>
          </select>
        </label>
      </div>

      <div className="field-row">
        <label className="field">
          <span>開始日</span>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label className="field">
          <span>締切日</span>
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </label>
      </div>

      <label className="field">
        <span>達成度：{progress}%</span>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
        />
      </label>

      <label className="field">
        <span>レビュー依頼先（任意）</span>
        <select value={reviewerId} onChange={(e) => setReviewerId(e.target.value)}>
          <option value="">（なし）</option>
          {data.users
            .filter((u) => u.id !== ownerId)
            .map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
        </select>
      </label>

      {error && <div className="error-text">{error}</div>}

      <div className="row gap end">
        <button type="button" className="btn ghost" onClick={onCancel}>
          キャンセル
        </button>
        <button type="submit" className="btn primary">
          {initial ? '更新' : '作成'}
        </button>
      </div>
    </form>
  )
}
