import type { PersonalTask, Priority } from '../types/models'

// 並び順: ①要相談フラグ → ②優先度(高→低) → ③期限が近い(なしは後ろ)
const priorityRank: Record<Priority, number> = { high: 0, medium: 1, low: 2 }

export function comparePersonalTasks(a: PersonalTask, b: PersonalTask): number {
  if (a.needsDiscussion !== b.needsDiscussion) {
    return a.needsDiscussion ? -1 : 1
  }
  if (priorityRank[a.priority] !== priorityRank[b.priority]) {
    return priorityRank[a.priority] - priorityRank[b.priority]
  }
  const ae = a.period.end
  const be = b.period.end
  if (ae && be) {
    if (ae < be) return -1
    if (ae > be) return 1
    return 0
  }
  if (ae) return -1
  if (be) return 1
  // 最終タイブレーク: 作成が古い順（決定的な並び）
  return a.createdAt - b.createdAt
}

export function sortPersonalTasks(tasks: PersonalTask[]): PersonalTask[] {
  return [...tasks].sort(comparePersonalTasks)
}

// 期限が近い順（未設定は後ろ、最後は作成順）
export function byDeadline(a: PersonalTask, b: PersonalTask): number {
  const ae = a.period.end
  const be = b.period.end
  if (ae && be) return ae < be ? -1 : ae > be ? 1 : 0
  if (ae) return -1
  if (be) return 1
  return a.createdAt - b.createdAt
}

export function sortByDeadline(tasks: PersonalTask[]): PersonalTask[] {
  return [...tasks].sort(byDeadline)
}
