import { describe, it, expect } from 'vitest'
import { googleCalendarUrl } from '../src/lib/calendar'

describe('googleCalendarUrl', () => {
  it('時刻ありはタイムレンジ（local, 秒付き）', () => {
    const url = googleCalendarUrl('タスク', '詳細', {
      date: '2026-07-01',
      startTime: '09:00',
      endTime: '10:30',
    })
    expect(url).toContain('https://calendar.google.com/calendar/render')
    expect(url).toContain('dates=20260701T090000%2F20260701T103000')
  })

  it('時刻なしは終日（終了は翌日）', () => {
    const url = googleCalendarUrl('t', '', { date: '2026-07-01' })
    expect(url).toContain('dates=20260701%2F20260702')
  })
})
