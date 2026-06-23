import type { AppData } from '../types/models'
import { seedData } from './seed'

// localStorage への永続化。読み込み失敗時はシードへフォールバック。
const DATA_KEY = 'task-manager:data:v2'
const USER_KEY = 'task-manager:currentUser:v1'
const SLACK_KEY = 'task-manager:slackWebhook:v1'

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : []
}

// 破損・欠損キーがあっても全画面クラッシュしないよう、各配列の存在を保証する。
function normalizeAppData(raw: unknown): AppData {
  const r = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  return {
    users: asArray(r.users),
    projects: asArray(r.projects),
    categories: asArray(r.categories),
    goalTasks: asArray(r.goalTasks),
    personalTasks: asArray(r.personalTasks),
    comments: asArray(r.comments),
    notifications: asArray(r.notifications),
    activities: asArray(r.activities),
  }
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(DATA_KEY)
    if (!raw) return seedData()
    return normalizeAppData(JSON.parse(raw))
  } catch (error) {
    console.error('データ読み込みに失敗しました。初期データを使用します:', error)
    return seedData()
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('データ保存に失敗しました:', error)
  }
}

export function loadCurrentUserId(): string | null {
  try {
    return localStorage.getItem(USER_KEY)
  } catch {
    return null
  }
}

export function saveCurrentUserId(id: string | null): void {
  try {
    if (id) localStorage.setItem(USER_KEY, id)
    else localStorage.removeItem(USER_KEY)
  } catch (error) {
    console.error('ユーザー保存に失敗しました:', error)
  }
}

export function loadSlackWebhook(): string {
  try {
    return localStorage.getItem(SLACK_KEY) ?? ''
  } catch {
    return ''
  }
}

export function saveSlackWebhook(url: string): void {
  try {
    localStorage.setItem(SLACK_KEY, url)
  } catch (error) {
    console.error('Slack設定の保存に失敗しました:', error)
  }
}
