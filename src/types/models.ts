// ドメインモデル定義。すべてイミュータブルに扱う（更新時は新オブジェクトを返す）。

export type ID = string

export interface User {
  id: ID
  name: string
  color: string
  createdAt: number
}

export interface Project {
  id: ID
  name: string
  description?: string
  color: string
  archived: boolean
  createdAt: number
}

export interface Category {
  id: ID
  projectId: ID
  name: string
  color: string
}

export type GoalStatus = 'todo' | 'in_progress' | 'done'

// ページ①：案件 > カテゴリ > 大きなゴール
export interface GoalTask {
  id: ID
  projectId: ID
  categoryId: ID
  title: string
  description?: string
  status: GoalStatus
  dueDate?: string // YYYY-MM-DD
  order: number
  createdAt: number
}

export type Priority = 'low' | 'medium' | 'high'
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done'
export type ReviewStatus = 'none' | 'requested' | 'approved' | 'changes'

export interface Period {
  start?: string
  end?: string
}

export interface Schedule {
  date: string
  startTime?: string
  endTime?: string
}

// ページ②：全員ぶんの個人タスク
export interface PersonalTask {
  id: ID
  ownerId: ID
  goalTaskId?: ID
  title: string
  description?: string
  deliverable?: string // 納品形式（何をもって完了か）
  outputLink?: string // 成果物リンク（作業中/完成物のURL）
  period: Period
  priority: Priority
  progress: number // 0-100 達成度
  status: TaskStatus
  reviewerId?: ID
  reviewStatus: ReviewStatus
  needsDiscussion: boolean // 要相談フラグ（上位浮上）
  acknowledged?: boolean // 受領（着手合意）したか
  schedule?: Schedule // 取り組み予定
  createdAt: number
  updatedAt: number
}

export type TaskRefType = 'goal' | 'personal'

export interface Comment {
  id: ID
  taskId: ID
  taskType: TaskRefType
  authorId: ID
  body: string
  createdAt: number
}

export type NotificationType =
  | 'due_soon'
  | 'assigned'
  | 'acknowledged'
  | 'scheduled'
  | 'review_requested'
  | 'review_result'
  | 'comment'
  | 'discussion'

export interface AppNotification {
  id: ID
  userId: ID
  type: NotificationType
  taskId: ID
  message: string
  read: boolean
  createdAt: number
}

export type ActivityType =
  | 'created'
  | 'acknowledged'
  | 'scheduled'
  | 'progress'
  | 'review_requested'
  | 'approved'
  | 'changes'
  | 'completed'
  | 'comment'

// タスクの行動履歴（誰が・いつ・何をしたか）
export interface Activity {
  id: ID
  taskId: ID
  actorId: ID
  type: ActivityType
  detail?: string
  createdAt: number
}

export interface AppData {
  users: User[]
  projects: Project[]
  categories: Category[]
  goalTasks: GoalTask[]
  personalTasks: PersonalTask[]
  comments: Comment[]
  notifications: AppNotification[]
  activities: Activity[]
}
