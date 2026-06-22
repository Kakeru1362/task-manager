import { describe, it, expect } from 'vitest'
import { daysUntil, isDueSoon, isOverdue, dueLabel, formatDate, addDaysISO } from '../src/lib/date'

describe('date utils', () => {
  it('daysUntil は未来/過去の日数を返す', () => {
    expect(daysUntil(addDaysISO(3))).toBe(3)
    expect(daysUntil(addDaysISO(-2))).toBe(-2)
    expect(daysUntil(undefined)).toBeNull()
  })

  it('isDueSoon は3日以内かつ未来をtrue', () => {
    expect(isDueSoon(addDaysISO(2))).toBe(true)
    expect(isDueSoon(addDaysISO(0))).toBe(true)
    expect(isDueSoon(addDaysISO(5))).toBe(false)
    expect(isDueSoon(addDaysISO(-1))).toBe(false)
  })

  it('isOverdue は過去をtrue', () => {
    expect(isOverdue(addDaysISO(-1))).toBe(true)
    expect(isOverdue(addDaysISO(1))).toBe(false)
  })

  it('dueLabel は人間向け表記', () => {
    expect(dueLabel(addDaysISO(0))).toBe('今日まで')
    expect(dueLabel(addDaysISO(1))).toBe('明日まで')
    expect(dueLabel(addDaysISO(4))).toBe('あと4日')
    expect(dueLabel(addDaysISO(-3))).toBe('3日超過')
  })

  it('formatDate は M/D、未指定は —', () => {
    expect(formatDate('2026-06-23')).toBe('6/23')
    expect(formatDate(undefined)).toBe('—')
  })
})
