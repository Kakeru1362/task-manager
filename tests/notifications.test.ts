import { describe, it, expect } from 'vitest'
import { generateDueSoonNotifications, unreadCount, markAllRead } from '../src/lib/notifications'
import { addDaysISO } from '../src/lib/date'
import * as repo from '../src/store/repositories'
import type { AppData } from '../src/types/models'

function dataWithDueSoonTask(): AppData {
  let d: AppData = {
    users: [],
    projects: [],
    categories: [],
    goalTasks: [],
    personalTasks: [],
    comments: [],
    notifications: [],
  }
  d = repo.addPersonalTask(d, {
    ownerId: 'owner-1',
    title: '締切間近タスク',
    period: { end: addDaysISO(1) },
    priority: 'high',
    progress: 0,
    status: 'in_progress',
  })
  return d
}

describe('notifications', () => {
  it('期限が近いタスクに対し due_soon 通知を生成し、重複は作らない', () => {
    const d = dataWithDueSoonTask()
    const d1 = generateDueSoonNotifications(d)
    expect(d1.notifications).toHaveLength(1)
    expect(d1.notifications[0].type).toBe('due_soon')
    expect(d1.notifications[0].userId).toBe('owner-1')

    // 2回目は重複生成しない
    const d2 = generateDueSoonNotifications(d1)
    expect(d2.notifications).toHaveLength(1)
  })

  it('unreadCount と markAllRead が機能する', () => {
    const d = generateDueSoonNotifications(dataWithDueSoonTask())
    expect(unreadCount(d, 'owner-1')).toBe(1)
    const read = markAllRead(d, 'owner-1')
    expect(unreadCount(read, 'owner-1')).toBe(0)
  })

  it('完了タスクには due_soon 通知を作らない', () => {
    let d = dataWithDueSoonTask()
    d = repo.updatePersonalTask(d, d.personalTasks[0].id, { status: 'done' })
    const d1 = generateDueSoonNotifications(d)
    expect(d1.notifications).toHaveLength(0)
  })
})
