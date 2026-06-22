import { useState } from 'react'
import { useApp } from '../state/AppContext'
import type { PersonalTask, TaskStatus } from '../types/models'
import { userById, goalById, projectById, categoryById, updatePersonalTask } from '../store/repositories'
import { PriorityBadge, StatusBadge, ReviewBadge } from './Badges'
import { ProgressBar } from './ProgressBar'
import { DiscussionFlag } from './DiscussionFlag'
import { CommentThread } from './CommentThread'
import { formatDate, dueLabel, isOverdue, isDueSoon } from '../lib/date'

interface TaskDetailProps {
  task: PersonalTask
  onEdit: () => void
  onDelete: () => void
}

export function TaskDetail({ task, onEdit, onDelete }: TaskDetailProps) {
  const { data, currentUser, apply, requestReview, setReviewStatus, toggleDiscussion } = useApp()
  const owner = userById(data, task.ownerId)
  const goal = goalById(data, task.goalTaskId)
  const project = projectById(data, goal?.projectId)
  const category = categoryById(data, goal?.categoryId)
  const reviewer = userById(data, task.reviewerId)
  const [reviewerSel, setReviewerSel] = useState<string>(task.reviewerId ?? '')

  const isReviewer = Boolean(currentUser && task.reviewerId === currentUser.id)
  const due = task.period.end
  const dueClass = isOverdue(due) ? 'overdue' : isDueSoon(due) ? 'soon' : ''

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
      </div>

      {goal && (
        <div className="muted small">
          🎯 {project?.name} / {category?.name} / {goal.title}
        </div>
      )}
      {task.description && <p className="detail-desc">{task.description}</p>}

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
      </div>

      <div className="review-box">
        <div className="comments-title">レビュー</div>
        {task.reviewStatus === 'requested' && isReviewer ? (
          <div className="row gap wrap">
            <span className="muted small">あなたにレビュー依頼が来ています</span>
            <button className="btn success sm" onClick={() => setReviewStatus(task.id, 'approved')}>
              承認
            </button>
            <button className="btn warn sm" onClick={() => setReviewStatus(task.id, 'changes')}>
              修正依頼
            </button>
          </div>
        ) : (
          <div className="row gap wrap">
            <select value={reviewerSel} onChange={(e) => setReviewerSel(e.target.value)}>
              <option value="">レビュー依頼先を選択</option>
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
              レビュー依頼
            </button>
            {reviewer && <span className="muted small">現在の依頼先：{reviewer.name}</span>}
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
