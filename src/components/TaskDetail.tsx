import { useState } from 'react'
import { useApp } from '../state/AppContext'
import type { PersonalTask, TaskStatus, ActivityType } from '../types/models'
import {
  userById,
  goalById,
  projectById,
  categoryById,
  updatePersonalTask,
  activitiesFor,
} from '../store/repositories'
import { PriorityBadge, StatusBadge, ReviewBadge } from './Badges'
import { ProgressBar } from './ProgressBar'
import { DiscussionFlag } from './DiscussionFlag'
import { CommentThread } from './CommentThread'
import { formatDate, dueLabel, isOverdue, isDueSoon, formatTimestamp } from '../lib/date'
import { googleCalendarUrl } from '../lib/calendar'

interface TaskDetailProps {
  task: PersonalTask
  onEdit: () => void
  onDelete: () => void
}

const activityLabel: Record<ActivityType, string> = {
  created: '作成',
  acknowledged: '受領',
  scheduled: '予定登録',
  progress: '進捗更新',
  review_requested: 'レビュー依頼',
  approved: '承認',
  changes: '差し戻し',
  completed: '完了',
  comment: 'コメント',
}

export function TaskDetail({ task, onEdit, onDelete }: TaskDetailProps) {
  const { data, currentUser, apply, acknowledge, scheduleTask, requestReview, setReviewStatus, toggleDiscussion } =
    useApp()
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
  const activities = activitiesFor(data, task.id)

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
      {task.description && <p className="detail-desc">{task.description}</p>}

      {task.deliverable && (
        <div className="detail-cell">
          <span className="muted small">納品形式（完了の基準）</span>
          <div>{task.deliverable}</div>
        </div>
      )}
      {task.outputLink && (
        <div className="detail-cell">
          <span className="muted small">成果物</span>
          <div>
            <a href={task.outputLink} target="_blank" rel="noreferrer">
              {task.outputLink}
            </a>
          </div>
        </div>
      )}

      <div className="detail-grid">
        <div className="detail-cell">
          <span className="muted small">期間</span>
          <div>
            {formatDate(task.period.start)} 〜 {formatDate(task.period.end)}{' '}
            {due && <span className={`due ${dueClass}`}>{dueLabel(due)}</span>}
          </div>
        </div>
        <div className="detail-cell">
          <span className="muted small">達成度</span>
          <ProgressBar value={task.progress} />
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

      <div className="review-box">
        <div className="comments-title">取り組み予定</div>
        <div className="row gap wrap">
          <input type="date" aria-label="予定日" value={schedDate} onChange={(e) => setSchedDate(e.target.value)} />
          <input type="time" aria-label="開始" value={schedStart} onChange={(e) => setSchedStart(e.target.value)} />
          <span className="muted small">〜</span>
          <input type="time" aria-label="終了" value={schedEnd} onChange={(e) => setSchedEnd(e.target.value)} />
          <button className="btn primary sm" onClick={saveSchedule} disabled={!schedDate}>
            予定を保存
          </button>
          {calUrl && (
            <a className="btn sm" href={calUrl} target="_blank" rel="noreferrer">
              Googleカレンダーに追加
            </a>
          )}
        </div>
      </div>

      <div className="review-box">
        <div className="comments-title">レビュー</div>
        {task.reviewStatus === 'requested' && isReviewer ? (
          <div className="row gap wrap">
            <span className="muted small">あなたにレビュー依頼が来ています</span>
            <button className="btn success sm" onClick={() => setReviewStatus(task.id, 'approved')}>
              承認（完了）
            </button>
            <button className="btn warn sm" onClick={() => setReviewStatus(task.id, 'changes')}>
              差し戻し
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
            {reviewer && <span className="muted small">現在の確認者：{reviewer.name}</span>}
          </div>
        )}
      </div>

      <div className="activity">
        <div className="comments-title">履歴</div>
        {activities.length === 0 ? (
          <div className="muted small">履歴はまだありません</div>
        ) : (
          <div className="activity-list">
            {activities.map((a) => {
              const actor = userById(data, a.actorId)
              return (
                <div key={a.id} className="activity-row">
                  <span className="muted small">{formatTimestamp(a.createdAt)}</span>
                  <b>{actor?.name ?? '不明'}</b>
                  <span>{activityLabel[a.type]}</span>
                  {a.detail && a.type !== 'comment' && <span className="muted small">（{a.detail}）</span>}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <CommentThread taskId={task.id} taskType="personal" />

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
