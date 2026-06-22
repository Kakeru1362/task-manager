import type { AppData, AppNotification, NotificationType, ID } from '../types/models'
import { newId } from './id'
import { isDueSoon, dueLabel } from './date'

export function makeNotification(
  userId: ID,
  type: NotificationType,
  taskId: ID,
  message: string,
): AppNotification {
  return {
    id: newId(),
    userId,
    type,
    taskId,
    message,
    read: false,
    createdAt: Date.now(),
  }
}

// アプリ起動時: 期限が近い個人タスクについて、担当者あての未生成の通知を追加する。
// taskId + type の組み合わせで重複生成を防ぐ。
export function generateDueSoonNotifications(data: AppData): AppData {
  const existing = new Set(
    data.notifications
      .filter((n) => n.type === 'due_soon')
      .map((n) => n.taskId),
  )

  const added: AppNotification[] = []
  for (const task of data.personalTasks) {
    if (task.status === 'done') continue
    if (!isDueSoon(task.period.end)) continue
    if (existing.has(task.id)) continue
    added.push(
      makeNotification(
        task.ownerId,
        'due_soon',
        task.id,
        `「${task.title}」の期限が近づいています（${dueLabel(task.period.end)}）`,
      ),
    )
  }

  if (added.length === 0) return data
  return { ...data, notifications: [...added, ...data.notifications] }
}

export function unreadCount(data: AppData, userId: ID): number {
  return data.notifications.filter((n) => n.userId === userId && !n.read).length
}

export function markAllRead(data: AppData, userId: ID): AppData {
  return {
    ...data,
    notifications: data.notifications.map((n) =>
      n.userId === userId && !n.read ? { ...n, read: true } : n,
    ),
  }
}
