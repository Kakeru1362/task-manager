import { describe, it, expect } from 'vitest'
import * as repo from '../src/store/repositories'
import type { AppData } from '../src/types/models'

function emptyData(): AppData {
  return {
    users: [],
    projects: [],
    categories: [],
    goalTasks: [],
    personalTasks: [],
    comments: [],
    notifications: [],
  }
}

describe('repositories', () => {
  it('addProject は新案件を追加し、元データを変更しない', () => {
    const d0 = emptyData()
    const d1 = repo.addProject(d0, { name: 'A社案件' })
    expect(d1.projects).toHaveLength(1)
    expect(d1.projects[0].name).toBe('A社案件')
    expect(d0.projects).toHaveLength(0) // イミュータブル
  })

  it('addGoalTask / addPersonalTask が紐付く', () => {
    let d = emptyData()
    d = repo.addProject(d, { name: 'P' })
    const projectId = d.projects[0].id
    d = repo.addCategory(d, { projectId, name: 'マーケ' })
    const categoryId = d.categories[0].id
    d = repo.addGoalTask(d, { projectId, categoryId, title: 'ゴール' })
    const goalId = d.goalTasks[0].id
    d = repo.addPersonalTask(d, {
      ownerId: 'u1',
      goalTaskId: goalId,
      title: 'やること',
      period: { end: '2026-07-01' },
      priority: 'high',
      progress: 0,
      status: 'todo',
    })
    expect(repo.personalTasksForGoal(d, goalId)).toHaveLength(1)
    expect(d.personalTasks[0].reviewStatus).toBe('none')
    expect(d.personalTasks[0].needsDiscussion).toBe(false)
  })

  it('updatePersonalTask は patch を適用し updatedAt を更新', () => {
    let d = emptyData()
    d = repo.addPersonalTask(d, {
      ownerId: 'u1',
      title: 't',
      period: {},
      priority: 'low',
      progress: 0,
      status: 'todo',
    })
    const id = d.personalTasks[0].id
    d = repo.updatePersonalTask(d, id, { progress: 50, needsDiscussion: true })
    expect(d.personalTasks[0].progress).toBe(50)
    expect(d.personalTasks[0].needsDiscussion).toBe(true)
  })

  it('deleteProject は配下ゴールを消し、個人タスクの紐付けを外す', () => {
    let d = emptyData()
    d = repo.addProject(d, { name: 'P' })
    const projectId = d.projects[0].id
    d = repo.addCategory(d, { projectId, name: 'C' })
    const categoryId = d.categories[0].id
    d = repo.addGoalTask(d, { projectId, categoryId, title: 'g' })
    const goalId = d.goalTasks[0].id
    d = repo.addPersonalTask(d, {
      ownerId: 'u',
      goalTaskId: goalId,
      title: 't',
      period: {},
      priority: 'low',
      progress: 0,
      status: 'todo',
    })
    d = repo.deleteProject(d, projectId)
    expect(d.projects).toHaveLength(0)
    expect(d.goalTasks).toHaveLength(0)
    expect(d.personalTasks[0].goalTaskId).toBeUndefined()
  })
})
