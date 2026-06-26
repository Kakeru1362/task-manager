import { useState } from 'react'
import { useApp } from '../state/AppContext'
import type { PersonalTask, TaskStatus } from '../types/models'
import { userById, goalById, projectById, categoryById, updatePersonalTask } from '../store/repositories'
import { PriorityBadge, StatusBadge, ReviewBadge } from './Badges'
import { ProgressBar } from './ProgressBar'
import { DiscussionFlag } from './DiscussionFlag'
import { TaskFeed } from './TaskFeed'
import { formatDate, dueLabel, isOverdue, isDueSoon } from '../lib/date'
import { googleCalendarUrl } from '../lib/calendar'

interface TaskDetailProps {
  task: PersonalTask
  onEdit: () => void
  onDelete: () => void
}

export function TaskDetail({ task, onEdit, onDelete }: TaskDetailProps) {
  const {
    data,
    currentUser,
    apply,
    notifyTask,
    acknowledge,
    scheduleTask,
    requestReview,
    setReviewStatus,
    toggleDiscussion,
  } = useApp()
  const owner = userById(data, task.ownerId)
  const goal = goalById(data, task.goalTaskId)
  const project = projectById(data, goal?.projectId)
  const category = categoryById(data, goal?.categoryId)
  const reviewer = userById(data, task.reviewerId)
  const [reviewerSel, setReviewerSel] = useState<string>(task.reviewerId ?? '')
  const [schedDate, setSchedDate] = useState(task.schedule?.date ?? '')
  const [schedStart, setSchedStart] = useState(task.schedule?.startTime ?? '')
  const [schedEnd, setSchedEnd] = useState(task.schedule?.endTime ?? '')

  const isReviewer = Boolean(currentUser && task.reviewerId === currentUser.id)
  const isOwner = Boolean(currentUser && task.ownerId === currentUser.id)
  const due = task.period.end
  const dueClass = isOverdue(due) ? 'overdue' : isDueSoon(due) ? 'soon' : ''

  const saveSchedule = () => {
    if (!schedDate) return
    scheduleTask(task.id, {
      date: schedDate,
      startTime: schedStart || undefined,
      endTime: schedEnd || undefined,
    })
  }
  const calUrl = schedDate
    ? googleCalendarUrl(task.title, task.description ?? '', {
        date: schedDate,
        startTime: schedStart || undefined,
        endTime: schedEnd || undefined,
      })
    : ''

  return (
    <div className="task-detail">
      <div className="detail-head">
        <span className="avatar sm" style={{ background: owner?.color }}>
          {owner?.name?.[0] ?? '?'}
        </span>
        <span className="task-owner">{owner?.name ?? '未割当'}</span>
        <PriorityBadge priority={task.priority} />
        <StatusBadge status={task.status} />
        <ReviewBadge status={task.reviewStatus} />
        {task.acknowledged && <span className="badge-pill">受領済み</span>}
      </div>

      {goal && (
        <div className="muted small">
          {project?.name} / {category?.name} / {goal.title}
        </div>
      )}

      {/* 詳細（内容）／詳細（納品形式） */}
      <div className="dd-two">
        <div className="dd-box">
          <span className="muted small">詳細（内容）</span>
          <div>{task.description || '—'}</div>
        </div>
        <div className="dd-box">
          <span className="muted small">詳細（納品形式）</span>
          <div>{task.deliverable || '—'}</div>
        </div>
      </div>

      {/* 期限・確認者・通知送信 */}
      <div className="dd-line">
        <div className="dd-pill">
          <span className="muted small">期限</span>
          <span>
            {formatDate(task.period.end)} {due && <span className={`due ${dueClass}`}>{dueLabel(due)}</span>}
          </span>
        </div>
        <div className="dd-pill">
          <span className="muted small">責任者／確認者</span>
          <span>{reviewer?.name ?? '未設定'}</span>
        </div>
        <button className="btn warn sm" onClick={() => notifyTask(task.id)}>
          通知送信
        </button>
      </div>

      {/* 取り組み時間・カレンダー登録 */}
      <div className="review-box">
        <div className="comments-title">取り組み時間</div>
        <div className="row gap wrap">
          <input type="date" aria-label="予定日" value={schedDate} onChange={(e) => setSchedDate(e.target.value)} />
          <input type="time" aria-label="開始" value={schedStart} onChange={(e) => setSchedStart(e.target.value)} />
          <span className="muted small">〜</span>
          <input type="time" aria-label="終了" value={schedEnd} onChange={(e) => setSchedEnd(e.target.value)} />
          <button className="btn sm" onClick={saveSchedule} disabled={!schedDate}>
            予定を保存
          </button>
          {calUrl && (
            <a className="btn warn sm" href={calUrl} target="_blank" rel="noreferrer">
              カレンダー登録
            </a>
          )}
        </div>
      </div>

      {/* 達成度・成果物・完了／再検討 */}
      <div className="detail-grid">
        <div className="detail-cell">
          <span className="muted small">達成度</span>
          <ProgressBar value={task.progress} />
        </div>
        <div className="detail-cell">
          <span className="muted small">成果物</span>
          <div>
            {task.outputLink ? (
              <a href={task.outputLink} target="_blank" rel="noreferrer">
                {task.outputLink}
              </a>
            ) : (
              '—'
            )}
          </div>
        </div>
      </div>

      <div className="detail-actions">
        <label className="inline-status">
          <span className="muted small">ステータス</span>
          <select
            value={task.status}
            onChange={(e) =>
              apply((d) => updatePersonalTask(d, task.id, { status: e.target.value as TaskStatus }))
            }
          >
            <option value="todo">未着手</option>
            <option value="in_progress">進行中</option>
            <option value="review">レビュー中</option>
            <option value="done">完了</option>
          </select>
        </label>
        <DiscussionFlag active={task.needsDiscussion} onToggle={() => toggleDiscussion(task.id)} />
        {isOwner && !task.acknowledged && (
          <button className="btn sm" onClick={() => acknowledge(task.id)}>
            受領する（着手します）
          </button>
        )}
      </div>

      {/* 確認（レビュー）：依頼／完了・再検討 */}
      <div className="review-box">
        <div className="comments-title">確認</div>
        {task.reviewStatus === 'requested' && isReviewer ? (
          <div className="row gap wrap">
            <span className="muted small">あなたに確認依頼が来ています</span>
            <button className="btn success sm" onClick={() => setReviewStatus(task.id, 'approved')}>
              完了
            </button>
            <button className="btn warn sm" onClick={() => setReviewStatus(task.id, 'changes')}>
              再検討
            </button>
          </div>
        ) : (
          <div className="row gap wrap">
            <select value={reviewerSel} onChange={(e) => setReviewerSel(e.target.value)}>
              <option value="">確認者を選択</option>
              {data.users
                .filter((u) => u.id !== task.ownerId)
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
            </select>
            <button
              className="btn primary sm"
              disabled={!reviewerSel}
              onClick={() => requestReview(task.id, reviewerSel)}
            >
              確認を依頼
            </button>
          </div>
        )}
      </div>

      <TaskFeed taskId={task.id} />

      <div className="row gap end detail-footer">
        <button className="btn ghost sm danger" onClick={onDelete}>
          削除
        </button>
        <button className="btn sm" onClick={onEdit}>
          編集
        </button>
      </div>
    </div>
  )
}
