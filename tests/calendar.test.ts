import { describe, it, expect } from 'vitest'
import { googleCalendarUrl } from '../src/lib/calendar'

describe('googleCalendarUrl（期間＝着手〜完了の終日予定）', () => {
  it('start〜end は end+1 までの終日', () => {
    const url = googleCalendarUrl('タスク', '詳細', '2026-07-01', '2026-07-03')
    expect(url).toContain('https://calendar.google.com/calendar/render')
    expect(url).toContain('dates=20260701%2F20260704')
  })

  it('片方のみは単日（翌日終了）', () => {
    expect(googleCalendarUrl('t', '', '2026-07-01')).toContain('dates=20260701%2F20260702')
    expect(googleCalendarUrl('t', '', undefined, '2026-07-05')).toContain('dates=20260705%2F20260706')
  })

  it('未指定は空文字', () => {
    expect(googleCalendarUrl('t', '')).toBe('')
  })
})
