import type { Priority, TaskStatus, ReviewStatus, GoalStatus } from '../types/models'

export const priorityLabel: Record<Priority, string> = { high: '高', medium: '中', low: '低' }
export const statusLabel: Record<TaskStatus, string> = {
  todo: '未着手',
  in_progress: '進行中',
  review: 'レビュー中',
  done: '完了',
}
export const reviewLabel: Record<ReviewStatus, string> = {
  none: '—',
  requested: 'レビュー依頼中',
  approved: '承認済み',
  changes: '修正依頼',
}
export const goalStatusLabel: Record<GoalStatus, string> = {
  todo: '未着手',
  in_progress: '進行中',
  done: '完了',
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={`badge-pill prio-${priority}`}>優先度 {priorityLabel[priority]}</span>
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <span className={`badge-pill status-${status}`}>{statusLabel[status]}</span>
}

export function ReviewBadge({ status }: { status: ReviewStatus }) {
  if (status === 'none') return null
  return <span className={`badge-pill review-${status}`}>{reviewLabel[status]}</span>
}

export function GoalStatusBadge({ status }: { status: GoalStatus }) {
  return <span className={`badge-pill status-${status}`}>{goalStatusLabel[status]}</span>
}
