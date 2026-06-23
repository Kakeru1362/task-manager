import type {
  AppData,
  Project,
  Category,
  GoalTask,
  PersonalTask,
  Comment,
  User,
  ID,
  Priority,
  GoalStatus,
  TaskStatus,
  Period,
} from '../types/models'
import { newId } from '../lib/id'

// すべてイミュータブル: 新しい AppData を返す。

const PALETTE = ['#e07b39', '#c4453c', '#b07a44', '#d39a52', '#9c5b34', '#7d5a44']

export function pickColor(index: number): string {
  return PALETTE[index % PALETTE.length]
}

// ---- User ----
export function addUser(data: AppData, name: string): AppData {
  const user: User = {
    id: newId(),
    name,
    color: pickColor(data.users.length),
    createdAt: Date.now(),
  }
  return { ...data, users: [...data.users, user] }
}

// ---- Project ----
export function addProject(
  data: AppData,
  input: { id?: ID; name: string; description?: string },
): AppData {
  const project: Project = {
    id: input.id ?? newId(),
    name: input.name,
    description: input.description,
    color: pickColor(data.projects.length),
    archived: false,
    createdAt: Date.now(),
  }
  return { ...data, projects: [...data.projects, project] }
}

export function updateProject(data: AppData, id: ID, patch: Partial<Project>): AppData {
  return {
    ...data,
    projects: data.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
  }
}

export function deleteProject(data: AppData, id: ID): AppData {
  const goalIds = new Set(data.goalTasks.filter((g) => g.projectId === id).map((g) => g.id))
  return {
    ...data,
    projects: data.projects.filter((p) => p.id !== id),
    goalTasks: data.goalTasks.filter((g) => g.projectId !== id),
    personalTasks: data.personalTasks.map((t) =>
      t.goalTaskId && goalIds.has(t.goalTaskId) ? { ...t, goalTaskId: undefined } : t,
    ),
  }
}

// ---- Category ----
export function addCategory(data: AppData, input: { projectId: ID; name: string }): AppData {
  const category: Category = {
    id: newId(),
    projectId: input.projectId,
    name: input.name,
    color: pickColor(data.categories.length),
  }
  return { ...data, categories: [...data.categories, category] }
}

// ---- GoalTask ----
export function addGoalTask(
  data: AppData,
  input: { id?: ID; projectId: ID; categoryId: ID; title: string; description?: string; dueDate?: string },
): AppData {
  const order = data.goalTasks.filter(
    (g) => g.projectId === input.projectId && g.categoryId === input.categoryId,
  ).length
  const goal: GoalTask = {
    id: input.id ?? newId(),
    projectId: input.projectId,
    categoryId: input.categoryId,
    title: input.title,
    description: input.description,
    status: 'todo',
    dueDate: input.dueDate || undefined,
    order,
    createdAt: Date.now(),
  }
  return { ...data, goalTasks: [...data.goalTasks, goal] }
}

export function updateGoalTask(data: AppData, id: ID, patch: Partial<GoalTask>): AppData {
  return {
    ...data,
    goalTasks: data.goalTasks.map((g) => (g.id === id ? { ...g, ...patch } : g)),
  }
}

export function setGoalStatus(data: AppData, id: ID, status: GoalStatus): AppData {
  return updateGoalTask(data, id, { status })
}

export function deleteGoalTask(data: AppData, id: ID): AppData {
  return {
    ...data,
    goalTasks: data.goalTasks.filter((g) => g.id !== id),
    personalTasks: data.personalTasks.map((t) =>
      t.goalTaskId === id ? { ...t, goalTaskId: undefined } : t,
    ),
  }
}

// ---- PersonalTask ----
export interface PersonalTaskInput {
  ownerId: ID
  goalTaskId?: ID
  title: string
  description?: string
  period: Period
  priority: Priority
  progress: number
  status: TaskStatus
  reviewerId?: ID
}

export function addPersonalTask(data: AppData, input: PersonalTaskInput): AppData {
  const now = Date.now()
  // 自己レビューは無効化（依頼先＝担当者は不可）
  const reviewerId = input.reviewerId && input.reviewerId !== input.ownerId ? input.reviewerId : undefined
  const task: PersonalTask = {
    id: newId(),
    ownerId: input.ownerId,
    goalTaskId: input.goalTaskId,
    title: input.title,
    description: input.description,
    period: input.period,
    priority: input.priority,
    progress: input.progress,
    status: input.status,
    reviewerId,
    reviewStatus: 'none',
    needsDiscussion: false,
    createdAt: now,
    updatedAt: now,
  }
  return { ...data, personalTasks: [...data.personalTasks, task] }
}

export function updatePersonalTask(data: AppData, id: ID, patch: Partial<PersonalTask>): AppData {
  return {
    ...data,
    personalTasks: data.personalTasks.map((t) =>
      t.id === id ? { ...t, ...patch, updatedAt: Date.now() } : t,
    ),
  }
}

export function deletePersonalTask(data: AppData, id: ID): AppData {
  return {
    ...data,
    personalTasks: data.personalTasks.filter((t) => t.id !== id),
    comments: data.comments.filter((c) => !(c.taskType === 'personal' && c.taskId === id)),
  }
}

// ---- Comment ----
export function addComment(
  data: AppData,
  input: { taskId: ID; taskType: 'goal' | 'personal'; authorId: ID; body: string },
): AppData {
  const comment: Comment = {
    id: newId(),
    taskId: input.taskId,
    taskType: input.taskType,
    authorId: input.authorId,
    body: input.body,
    createdAt: Date.now(),
  }
  return { ...data, comments: [...data.comments, comment] }
}

// ---- selectors ----
export function commentsFor(data: AppData, taskId: ID): Comment[] {
  return data.comments
    .filter((c) => c.taskId === taskId)
    .sort((a, b) => a.createdAt - b.createdAt)
}

export function userById(data: AppData, id?: ID): User | undefined {
  if (!id) return undefined
  return data.users.find((u) => u.id === id)
}

export function goalById(data: AppData, id?: ID): GoalTask | undefined {
  if (!id) return undefined
  return data.goalTasks.find((g) => g.id === id)
}

export function projectById(data: AppData, id?: ID): Project | undefined {
  if (!id) return undefined
  return data.projects.find((p) => p.id === id)
}

export function categoryById(data: AppData, id?: ID): Category | undefined {
  if (!id) return undefined
  return data.categories.find((c) => c.id === id)
}

export function personalTasksForGoal(data: AppData, goalId: ID): PersonalTask[] {
  return data.personalTasks.filter((t) => t.goalTaskId === goalId)
}
