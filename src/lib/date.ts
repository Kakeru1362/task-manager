// 期限まわりの計算・表示ユーティリティ。
// 日付は YYYY-MM-DD をローカル(JST)0時として扱う（UTC基準だと深夜帯に1日ズレるため）。

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function toLocalISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// "YYYY-MM-DD" をローカル0時の ms に変換（不正なら NaN）
function parseLocal(dateISO: string): number {
  const parts = dateISO.split('-').map(Number)
  const [y, m, d] = parts
  if (!y || !m || !d) return NaN
  return new Date(y, m - 1, d).getTime()
}

export function todayISO(): string {
  return toLocalISO(new Date())
}

export function addDaysISO(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return toLocalISO(d)
}

export function daysUntil(dateISO?: string): number | null {
  if (!dateISO) return null
  const target = parseLocal(dateISO)
  if (Number.isNaN(target)) return null
  const today = parseLocal(todayISO())
  return Math.round((target - today) / 86_400_000)
}

export function isDueSoon(dateISO?: string, withinDays = 3): boolean {
  const d = daysUntil(dateISO)
  return d !== null && d >= 0 && d <= withinDays
}

export function isOverdue(dateISO?: string): boolean {
  const d = daysUntil(dateISO)
  return d !== null && d < 0
}

export function formatDate(dateISO?: string): string {
  if (!dateISO) return '—'
  const t = parseLocal(dateISO)
  if (Number.isNaN(t)) return '—'
  const d = new Date(t)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export function dueLabel(dateISO?: string): string {
  const d = daysUntil(dateISO)
  if (d === null) return ''
  if (d < 0) return `${-d}日超過`
  if (d === 0) return '今日まで'
  if (d === 1) return '明日まで'
  return `あと${d}日`
}

export function formatTimestamp(ms: number): string {
  const d = new Date(ms)
  return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
