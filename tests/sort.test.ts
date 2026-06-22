import { describe, it, expect } from 'vitest'
import { sortPersonalTasks } from '../src/lib/sort'
import type { PersonalTask, Priority } from '../src/types/models'

function task(over: Partial<PersonalTask> & { id: string }): PersonalTask {
  return {
    ownerId: 'u',
    title: over.id,
    period: {},
    priority: 'medium',
    progress: 0,
    status: 'todo',
    reviewStatus: 'none',
    needsDiscussion: false,
    createdAt: 0,
    updatedAt: 0,
    ...over,
  }
}

describe('sortPersonalTasks', () => {
  it('要相談フラグが最上位に浮上する', () => {
    const list = [
      task({ id: 'a', priority: 'high' as Priority }),
      task({ id: 'b', needsDiscussion: true, priority: 'low' as Priority }),
    ]
    expect(sortPersonalTasks(list).map((t) => t.id)).toEqual(['b', 'a'])
  })

  it('要相談が同じなら優先度が高い順', () => {
    const list = [
      task({ id: 'low', priority: 'low' }),
      task({ id: 'high', priority: 'high' }),
      task({ id: 'mid', priority: 'medium' }),
    ]
    expect(sortPersonalTasks(list).map((t) => t.id)).toEqual(['high', 'mid', 'low'])
  })

  it('優先度が同じなら締切が近い順、締切なしは後ろ', () => {
    const list = [
      task({ id: 'none', period: {} }),
      task({ id: 'late', period: { end: '2026-12-31' } }),
      task({ id: 'soon', period: { end: '2026-01-01' } }),
    ]
    expect(sortPersonalTasks(list).map((t) => t.id)).toEqual(['soon', 'late', 'none'])
  })

  it('元配列を変更しない（イミュータブル）', () => {
    const list = [task({ id: 'a' }), task({ id: 'b', needsDiscussion: true })]
    const copy = [...list]
    sortPersonalTasks(list)
    expect(list).toEqual(copy)
  })
})
