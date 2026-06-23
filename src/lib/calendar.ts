import type { Schedule } from '../types/models'

// OAuth 不要の「Googleカレンダーに予定を追加」リンクを生成する。
// 押すと事前入力された予定作成画面が開き、ユーザーが保存する（自動登録ではない）。

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function compactDate(dateISO: string): string {
  return dateISO.replace(/-/g, '')
}

function compactDateTime(dateISO: string, time: string): string {
  return `${compactDate(dateISO)}T${time.replace(':', '')}00`
}

function nextDay(dateISO: string): string {
  const [y, m, d] = dateISO.split('-').map(Number)
  const dt = new Date(y, m - 1, d + 1)
  return `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}`
}

export function googleCalendarUrl(title: string, details: string, schedule: Schedule): string {
  let dates: string
  if (schedule.startTime && schedule.endTime) {
    dates = `${compactDateTime(schedule.date, schedule.startTime)}/${compactDateTime(schedule.date, schedule.endTime)}`
  } else {
    // 時刻なしは終日（終了日は翌日＝Google仕様）
    dates = `${compactDate(schedule.date)}/${nextDay(schedule.date)}`
  }
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates,
    details,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
