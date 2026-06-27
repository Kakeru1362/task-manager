// OAuth 不要の「Googleカレンダーに予定を追加」リンクを生成する。
// 押すと事前入力された予定作成画面が開き、ユーザーが保存する（自動登録ではない）。
// 着手日〜完了予定日の終日予定として作成する。

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function compactDate(dateISO: string): string {
  return dateISO.replace(/-/g, '')
}

function nextDay(dateISO: string): string {
  const [y, m, d] = dateISO.split('-').map(Number)
  const dt = new Date(y, m - 1, d + 1)
  return `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}`
}

// start〜end の終日予定（Googleは終了日を翌日=exclusive で指定）
export function googleCalendarUrl(
  title: string,
  details: string,
  startISO?: string,
  endISO?: string,
): string {
  const start = startISO || endISO
  const end = endISO || startISO
  if (!start || !end) return ''
  const dates = `${compactDate(start)}/${nextDay(end)}`
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates,
    details,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
