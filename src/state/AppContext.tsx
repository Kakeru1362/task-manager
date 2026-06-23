import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AppData, User, ID, ReviewStatus, TaskRefType } from '../types/models'
import {
  loadData,
  saveData,
  loadCurrentUserId,
  saveCurrentUserId,
  loadSlackWebhook,
  saveSlackWebhook,
} from '../store/storage'
import * as repo from '../store/repositories'
import { newId } from '../lib/id'
import { generateDueSoonNotifications, makeNotification, markAllRead } from '../lib/notifications'
import { sendSlackMessage } from '../lib/slack'

interface AppContextValue {
  data: AppData
  currentUser: User | null
  slackWebhook: string
  apply: (fn: (data: AppData) => AppData) => void
  selectUser: (id: ID | null) => void
  createUser: (name: string) => void
  updateSlackWebhook: (url: string) => void
  requestReview: (taskId: ID, reviewerId: ID) => void
  setReviewStatus: (taskId: ID, status: ReviewStatus) => void
  toggleDiscussion: (taskId: ID) => void
  comment: (taskId: ID, taskType: TaskRefType, body: string) => void
  markNotificationsRead: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => generateDueSoonNotifications(loadData()))
  const [currentUserId, setCurrentUserId] = useState<ID | null>(() => loadCurrentUserId())
  const [slackWebhook, setSlackWebhook] = useState<string>(() => loadSlackWebhook())

  useEffect(() => {
    saveData(data)
  }, [data])

  const currentUser = useMemo(
    () => data.users.find((u) => u.id === currentUserId) ?? null,
    [data.users, currentUserId],
  )

  // Slack 送信は副作用なので updater の外で実行（StrictMode の二重実行による二重送信を避ける）
  const notify = (text: string) => {
    void sendSlackMessage(slackWebhook, text)
  }

  const apply = (fn: (d: AppData) => AppData) => setData((prev) => fn(prev))

  const selectUser = (id: ID | null) => {
    setCurrentUserId(id)
    saveCurrentUserId(id)
  }

  const createUser = (name: string) => {
    const user = {
      id: newId(),
      name,
      color: repo.pickColor(data.users.length),
      createdAt: Date.now(),
    }
    setData((prev) => ({ ...prev, users: [...prev.users, user] }))
    setCurrentUserId(user.id)
    saveCurrentUserId(user.id)
  }

  const updateSlackWebhook = (url: string) => {
    setSlackWebhook(url)
    saveSlackWebhook(url)
  }

  const operatorId = currentUser?.id

  const requestReview = (taskId: ID, reviewerId: ID) => {
    const task = data.personalTasks.find((t) => t.id === taskId)
    if (!task) return
    if (task.status === 'done') return // 完了済みは差し戻さない
    if (reviewerId === task.ownerId) return // 自己レビュー禁止
    if (!data.users.some((u) => u.id === reviewerId)) return // 実在チェック
    if (task.reviewerId === reviewerId && task.reviewStatus === 'requested') return // 連打を冪等化
    const owner = data.users.find((u) => u.id === task.ownerId)
    const reviewer = data.users.find((u) => u.id === reviewerId)
    setData((prev) => {
      let next = repo.updatePersonalTask(prev, taskId, {
        reviewerId,
        reviewStatus: 'requested',
        status: 'review',
      })
      if (reviewerId !== operatorId) {
        const note = makeNotification(
          reviewerId,
          'review_requested',
          taskId,
          `${owner?.name ?? '誰か'}さんから「${task.title}」のレビュー依頼が届きました`,
        )
        next = { ...next, notifications: [note, ...next.notifications] }
      }
      return next
    })
    notify(`レビュー依頼：「${task.title}」→ ${reviewer?.name ?? ''}さん`)
  }

  const setReviewStatus = (taskId: ID, status: ReviewStatus) => {
    const task = data.personalTasks.find((t) => t.id === taskId)
    if (!task) return
    setData((prev) => {
      const patch: Partial<typeof task> = { reviewStatus: status }
      if (status === 'approved') patch.status = 'done'
      else if (status === 'changes') patch.status = 'in_progress'
      let next = repo.updatePersonalTask(prev, taskId, patch)
      const msg =
        status === 'approved' ? 'レビューが承認されました' : status === 'changes' ? '修正依頼が来ました' : ''
      if (msg && task.ownerId !== operatorId) {
        const note = makeNotification(task.ownerId, 'review_result', taskId, `「${task.title}」：${msg}`)
        next = { ...next, notifications: [note, ...next.notifications] }
      }
      return next
    })
  }

  const toggleDiscussion = (taskId: ID) => {
    const task = data.personalTasks.find((t) => t.id === taskId)
    if (!task) return
    const turningOn = !task.needsDiscussion
    const notifyOwner = turningOn && task.ownerId !== operatorId
    setData((prev) => {
      let next = repo.updatePersonalTask(prev, taskId, { needsDiscussion: turningOn })
      if (notifyOwner) {
        const note = makeNotification(
          task.ownerId,
          'discussion',
          taskId,
          `「${task.title}」が要相談に設定されました（定例会で討論）`,
        )
        next = { ...next, notifications: [note, ...next.notifications] }
      }
      return next
    })
    if (turningOn) notify(`要相談：「${task.title}」を定例会で討論しましょう`)
  }

  const comment = (taskId: ID, taskType: TaskRefType, body: string) => {
    if (!currentUser) return
    const task = taskType === 'personal' ? data.personalTasks.find((t) => t.id === taskId) : undefined
    const notifyOwner = Boolean(task && task.ownerId !== currentUser.id)
    setData((prev) => {
      let next = repo.addComment(prev, { taskId, taskType, authorId: currentUser.id, body })
      if (task && notifyOwner) {
        const note = makeNotification(
          task.ownerId,
          'comment',
          taskId,
          `${currentUser.name}さんが「${task.title}」にコメントしました`,
        )
        next = { ...next, notifications: [note, ...next.notifications] }
      }
      return next
    })
    if (task && notifyOwner) notify(`コメント（${currentUser.name}）「${task.title}」：${body}`)
  }

  const markNotificationsRead = () => {
    if (!currentUser) return
    const uid = currentUser.id
    setData((prev) => markAllRead(prev, uid))
  }

  const value: AppContextValue = {
    data,
    currentUser,
    slackWebhook,
    apply,
    selectUser,
    createUser,
    updateSlackWebhook,
    requestReview,
    setReviewStatus,
    toggleDiscussion,
    comment,
    markNotificationsRead,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp は AppProvider の内側で使用してください')
  return ctx
}
