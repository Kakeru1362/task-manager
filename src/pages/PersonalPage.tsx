import { useMemo, useState } from 'react'
import { useApp } from '../state/AppContext'
import * as repo from '../store/repositories'
import { sortPersonalTasks } from '../lib/sort'
import { TaskCard } from '../components/TaskCard'
import { Modal } from '../components/Modal'
import { TaskForm, type TaskFormValues } from '../components/TaskForm'
import { TaskDetail } from '../components/TaskDetail'
import { FilterBar, emptyFilters, type PersonalFilters } from '../components/FilterBar'
import type { ID } from '../types/models'

export function PersonalPage() {
  const { data, apply } = useApp()
  const [filters, setFilters] = useState<PersonalFilters>(emptyFilters)
  const [showAdd, setShowAdd] = useState(false)
  const [openTaskId, setOpenTaskId] = useState<ID | null>(null)
  const [editing, setEditing] = useState(false)

  const openTask = openTaskId ? (data.personalTasks.find((t) => t.id === openTaskId) ?? null) : null

  const visible = useMemo(() => {
    let list = data.personalTasks
    if (filters.ownerId) list = list.filter((t) => t.ownerId === filters.ownerId)
    if (filters.status) list = list.filter((t) => t.status === filters.status)
    if (filters.discussionOnly) list = list.filter((t) => t.needsDiscussion)
    if (filters.projectId) {
      list = list.filter((t) => repo.goalById(data, t.goalTaskId)?.projectId === filters.projectId)
    }
    return sortPersonalTasks(list)
  }, [data, filters])

  // 司会が読み上げる総数はフィルタに依存しない（全体件数）
  const totalDiscussion = data.personalTasks.filter((t) => t.needsDiscussion).length
  const visibleDiscussion = visible.filter((t) => t.needsDiscussion).length

  const addTask = (v: TaskFormValues) => {
    apply((d) => repo.addPersonalTask(d, { ...v }))
    setShowAdd(false)
  }
  const saveEdit = (v: TaskFormValues) => {
    if (!openTask) return
    apply((d) => repo.updatePersonalTask(d, openTask.id, { ...v }))
    setEditing(false)
  }
  const delTask = () => {
    if (!openTask) return
    apply((d) => repo.deletePersonalTask(d, openTask.id))
    setOpenTaskId(null)
  }

  return (
    <div className="page">
      <div className="page-toolbar">
        <FilterBar filters={filters} onChange={setFilters} />
        <button className="btn primary" onClick={() => setShowAdd(true)}>
          ＋ 個人タスク
        </button>
      </div>

      {totalDiscussion > 0 && (
        <div className="discussion-banner">
          🗣 要相談 {totalDiscussion}件 — 定例会で討論しましょう
          {visibleDiscussion !== totalDiscussion && <span className="small">（表示中 {visibleDiscussion}件）</span>}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="empty">条件に合うタスクがありません。</div>
      ) : (
        <div className="card-grid">
          {visible.map((t) => (
            <TaskCard key={t.id} task={t} onClick={() => setOpenTaskId(t.id)} />
          ))}
        </div>
      )}

      {showAdd && (
        <Modal title="個人タスクを追加" onClose={() => setShowAdd(false)} width={560}>
          <TaskForm onSubmit={addTask} onCancel={() => setShowAdd(false)} />
        </Modal>
      )}
      {openTask && (
        <Modal
          title={editing ? 'タスクを編集' : 'タスク詳細'}
          onClose={() => {
            setOpenTaskId(null)
            setEditing(false)
          }}
          width={560}
        >
          {editing ? (
            <TaskForm initial={openTask} onSubmit={saveEdit} onCancel={() => setEditing(false)} />
          ) : (
            <TaskDetail task={openTask} onEdit={() => setEditing(true)} onDelete={delTask} />
          )}
        </Modal>
      )}
    </div>
  )
}
